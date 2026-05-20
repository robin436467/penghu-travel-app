// 自動產生：景點實景照片對照表（來源：中文維基百科，公開授權）
// 重新產生： node scripts/fetch-photos.mjs
export const photos = {
  "s3": "/photos/s3.jpg",
  "s8": "/photos/s8.jpg",
  "s13": "/photos/s13.jpg",
  "s14": "/photos/s14.jpg",
  "s15": "/photos/s15.jpg",
  "s16": "/photos/s16.jpg",
  "s18": "/photos/s18.jpg",
  "s28": "/photos/s28.jpg",
  "s102": "/photos/s102.jpg",
  "s103": "/photos/s103.jpg",
  "s104": "/photos/s104.jpg",
  "s105": "/photos/s105.jpg",
  "s111": "/photos/s111.jpg",
  "s112": "/photos/s112.jpg"
}

export const photoFor = (id) => photos[id] || null
