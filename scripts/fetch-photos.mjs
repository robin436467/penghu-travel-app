// 從中文維基百科抓「知名景點」的公開授權縮圖，存到 public/photos/，
// 並產生 src/data/photos.js 對照表。餐廳小吃多半沒有頁面，會自動略過。
//
// 執行： node scripts/fetch-photos.mjs

import { spots } from '../src/data/spots.js'
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const photoDir = join(root, 'public', 'photos')
const API = 'https://zh.wikipedia.org/w/api.php'
const UA = { 'User-Agent': 'PenghuTripApp/1.0 (personal trip planner; contact: trip@example.com)' }

// 只抓這些分類（維基有頁面、有實景照片的「知名景點」）
const TARGET_CATS = new Set(['景點', '雨天備案'])

// 地點類型的通用字（用來抽出「專名核心」做比對）
const GENERIC = [
  '沙灘', '海堤', '海邊', '公園', '古榕', '老街', '秘境', '天堂路', '燈塔', '水族館',
  '博物館', '生活館', '聚落', '教堂', '鞦韆', '探索館', '地質館', '休息區', '遊客中心',
  '派出所', '郵便局', '觀光工廠', '海洋牧場', '皇宮', '玄武岩', '岩瀑',
]

const variant = (s) => s.replace(/樑/g, '梁') // 通樑/通梁 等異體字
const norm = (s) =>
  variant(s)
    .replace(/（[^）]*）|\([^)]*\)/g, '')
    .replace(/澎湖縣?|台灣|臺灣|馬公市?|縣|鄉|鎮|區|\s/g, '')
    .trim()

function core(name) {
  let c = norm(name)
  for (const g of GENERIC) c = c.replace(g, '')
  return c.length >= 2 ? c : norm(name)
}

// 標題若出現名稱沒有的「宮廟殿寺」等字，多半是同地名的不同地點（如保安宮、三聖殿）
const BUILDING_WORDS = ['宮', '殿', '廟', '寺', '堂', '保安', '聖', '宅', '車站']

// 標題是否與景點名相關
function relevant(name, title) {
  const t = norm(title)
  const c = core(name)
  const n = norm(name)
  if (!t || !n) return false
  if (n === t) return true
  for (const w of BUILDING_WORDS) {
    if (t.includes(w) && !n.includes(w)) return false
  }
  if (t.includes(n) || n.includes(t)) return true
  return c.length >= 2 && t.includes(c)
}

// 相關度評分：完全相等 > 互相包含 > 只含核心（數字越小越好）
function score(name, title) {
  const n = norm(name)
  const t = norm(title)
  if (n === t) return 0
  if (t.includes(n) || n.includes(t)) return 1
  return 2
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 帶重試的 JSON 取得（遇到限流就退避）
async function fetchJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA })
      const text = await res.text()
      if (!res.ok || text.startsWith('You are making too many')) {
        await sleep(1200 * (i + 1))
        continue
      }
      return JSON.parse(text)
    } catch {
      await sleep(1200 * (i + 1))
    }
  }
  return null
}

async function findTitles(query) {
  const u = `${API}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&origin=*`
  const d = await fetchJSON(u)
  return (d?.query?.search || []).map((r) => r.title)
}

async function thumbByTitle(title) {
  const u =
    `${API}?action=query&format=json&prop=pageimages&piprop=thumbnail|original` +
    `&pithumbsize=900&titles=${encodeURIComponent(title)}&origin=*`
  const d = await fetchJSON(u)
  const p = Object.values(d?.query?.pages || {})[0]
  return p?.thumbnail?.source || p?.original?.source || null
}

async function searchPhoto(name) {
  const titles = await findTitles(name + ' 澎湖')
  const ordered = [...new Set([name, ...titles])]
    .filter((t) => relevant(name, t))
    .sort((a, b) => score(name, a) - score(name, b))
  // 只嘗試前 2 個最相關候選，減少請求數
  for (const title of ordered.slice(0, 2)) {
    const url = await thumbByTitle(title)
    if (url) return { url, title }
    await sleep(250)
  }
  return null
}

// upload.wikimedia.org 會擋非瀏覽器的 UA，需用瀏覽器式標頭
const IMG_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
  Referer: 'https://zh.wikipedia.org/',
}

async function download(url, dest, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: IMG_HEADERS })
    if (res.status === 429) {
      await sleep(1500 * (i + 1))
      continue
    }
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(dest, buf)
    return buf.length
  }
  throw new Error('429（限流重試用盡）')
}

async function main() {
  await mkdir(photoDir, { recursive: true })
  const targets = spots.filter((s) => TARGET_CATS.has(s.category))
  console.log(`目標景點 ${targets.length} 個（${[...TARGET_CATS].join('/')}）\n`)

  const manifest = {}
  let ok = 0
  for (const s of targets) {
    const hit = await searchPhoto(s.name)
    if (!hit) {
      console.log(`✗ ${s.name}`)
      await sleep(700)
      continue
    }
    const ext = hit.url.split('?')[0].toLowerCase().endsWith('.png') ? 'png' : 'jpg'
    const file = `${s.id}.${ext}`
    try {
      const bytes = await download(hit.url, join(photoDir, file))
      manifest[s.id] = `/photos/${file}`
      ok++
      console.log(`✓ ${s.name}  ←  ${hit.title}  (${Math.round(bytes / 1024)}KB)`)
    } catch (e) {
      console.log(`✗ ${s.name}  下載失敗 ${e.message}`)
    }
    await sleep(700)
  }

  const out =
    `// 自動產生：景點實景照片對照表（來源：中文維基百科，公開授權）\n` +
    `// 重新產生： node scripts/fetch-photos.mjs\n` +
    `export const photos = ${JSON.stringify(manifest, null, 2)}\n\n` +
    `export const photoFor = (id) => photos[id] || null\n`
  await writeFile(join(root, 'src', 'data', 'photos.js'), out)

  console.log(`\n完成：${ok}/${targets.length} 個景點有照片，對照表已寫入 src/data/photos.js`)
}

main()
