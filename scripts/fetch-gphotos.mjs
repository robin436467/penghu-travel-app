// 解析每個景點/店家在 Google 地圖的 place_id 與第一張照片的 photo_reference，
// 寫進 src/data/gphotos.js。照片本身「不」下載——執行時才用 Place Photo 端點即時載入，
// 符合 Google 使用條款（place_id 可保存、照片即時取用並標註來源）。
//
// 執行： node scripts/fetch-gphotos.mjs

import { spots } from '../src/data/spots.js'
import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

async function getKey() {
  if (process.argv[2]) return process.argv[2]
  if (process.env.VITE_GMAPS_KEY) return process.env.VITE_GMAPS_KEY
  try {
    const env = await readFile(join(root, '.env.local'), 'utf8')
    const m = env.match(/VITE_GMAPS_KEY=(.+)/)
    if (m) return m[1].trim()
  } catch {}
  throw new Error('找不到金鑰：請放在 .env.local 的 VITE_GMAPS_KEY，或以參數傳入')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function findPlace(key, query) {
  const u =
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json' +
    `?input=${encodeURIComponent(query)}&inputtype=textquery` +
    '&fields=place_id,name,photos&language=zh-TW&key=' + key
  const res = await fetch(u)
  const d = await res.json()
  if (d.status === 'OVER_QUERY_LIMIT') {
    await sleep(2000)
    return findPlace(key, query)
  }
  return d.candidates?.[0] || null
}

// 去掉 attribution HTML 標籤，留下「作者名」與連結
function parseAttr(html) {
  if (!html) return null
  const href = html.match(/href="([^"]+)"/)?.[1] || null
  const text = html.replace(/<[^>]+>/g, '').trim()
  return { text, href }
}

async function main() {
  const key = await getKey()
  console.log(`解析 ${spots.length} 個地點的 Google 照片參照…\n`)

  const out = {}
  let ok = 0
  for (const s of spots) {
    const region = s.region === '其他' ? '澎湖' : `${s.region} 澎湖`
    let c = await findPlace(key, `${s.name} ${region}`)
    if (!c?.photos) c = await findPlace(key, `${s.name} 澎湖`)
    const photo = c?.photos?.[0]
    if (c?.place_id && photo?.photo_reference) {
      out[s.id] = {
        ref: photo.photo_reference,
        placeId: c.place_id,
        attr: parseAttr(photo.html_attributions?.[0]),
      }
      ok++
      console.log(`✓ ${s.name}  ←  ${c.name}`)
    } else {
      console.log(`✗ ${s.name}${c ? '（無照片）' : '（找不到）'}`)
    }
    await sleep(180)
  }

  const body =
    `// 自動產生：各地點的 Google 地圖照片參照（來源：Google Places）\n` +
    `// 照片於執行時即時載入，未下載保存。重新產生： node scripts/fetch-gphotos.mjs\n` +
    `export const gphotos = ${JSON.stringify(out, null, 2)}\n`
  await writeFile(join(root, 'src', 'data', 'gphotos.js'), body)

  console.log(`\n完成：${ok}/${spots.length} 個地點有 Google 照片，已寫入 src/data/gphotos.js`)
}

main()
