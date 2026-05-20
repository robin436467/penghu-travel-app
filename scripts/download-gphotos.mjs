// 一次性把每個地點的 Google 照片下載到 public/photos/（檔名 g_<id>.jpg）。
// 讀取 src/data/gphotos.js 既有的 photo_reference，下載後產生 src/data/localphotos.js。
// 之後 App 只讀本地檔，執行時不再呼叫 Google（不再計費）。
//
// 執行： node scripts/download-gphotos.mjs

import { gphotos } from '../src/data/gphotos.js'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const photoDir = join(root, 'public', 'photos')

async function getKey() {
  if (process.argv[2]) return process.argv[2]
  if (process.env.VITE_GMAPS_KEY) return process.env.VITE_GMAPS_KEY
  const env = await readFile(join(root, '.env.local'), 'utf8')
  return env.match(/VITE_GMAPS_KEY=(.+)/)[1].trim()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function download(key, ref, dest, tries = 3) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${key}`
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { redirect: 'follow' })
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * (i + 1))
      continue
    }
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(dest, buf)
    return buf.length
  }
  throw new Error('重試用盡')
}

async function main() {
  const key = await getKey()
  await mkdir(photoDir, { recursive: true })
  const ids = Object.keys(gphotos)
  console.log(`下載 ${ids.length} 張 Google 照片到 public/photos/ …\n`)

  const manifest = {}
  let ok = 0
  let bytes = 0
  for (const id of ids) {
    const ref = gphotos[id]?.ref
    if (!ref) continue
    const file = `g_${id}.jpg`
    try {
      const n = await download(key, ref, join(photoDir, file))
      manifest[id] = `/photos/${file}`
      bytes += n
      ok++
      process.stdout.write(`✓ ${id} (${Math.round(n / 1024)}KB)  `)
    } catch (e) {
      console.log(`\n✗ ${id} ${e.message}`)
    }
    await sleep(120)
  }

  const body =
    `// 自動產生：已下載到本地的 Google 照片路徑（一次性下載，執行時不再呼叫 Google）\n` +
    `// 重新產生： node scripts/download-gphotos.mjs\n` +
    `export const localPhotos = ${JSON.stringify(manifest, null, 2)}\n`
  await writeFile(join(root, 'src', 'data', 'localphotos.js'), body)

  console.log(`\n\n完成：${ok}/${ids.length} 張，共 ${Math.round(bytes / 1024 / 1024)}MB，已寫入 src/data/localphotos.js`)
}

main()
