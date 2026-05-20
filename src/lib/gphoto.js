import { gphotos } from '../data/gphotos'
import { localPhotos } from '../data/localphotos'
import { photoFor } from '../data/photos'

// 取得該地點照片：一律使用已下載到本地的檔案（執行時不呼叫 Google、不計費）。
// 沒有本地檔時退回維基公開授權圖，再退回漸層卡。
export function spotPhoto(spot) {
  const local = localPhotos[spot.id]
  if (local) return { url: local, attr: gphotos[spot.id]?.attr, source: 'google' }
  const w = photoFor(spot.id)
  if (w) return { url: w, attr: null, source: 'wiki' }
  return null
}
