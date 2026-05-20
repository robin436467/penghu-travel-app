// Google 地圖連結工具：在手機上會直接喚起地圖 App

// 開啟路線導航（到某地點）
export function navigateUrl(query) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

// 在地圖上查看地點
export function viewUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// 開啟地圖連結。
// 已「加到主畫面」的 PWA：用同一視窗開（交給地圖 App，回來不會有「完成」工具列）。
// 一般瀏覽器：開新分頁。
function go(url) {
  if (!url) return
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  if (standalone) window.location.href = url
  else window.open(url, '_blank', 'noopener')
}

export function openNavigate(query) {
  go(navigateUrl(query))
}

export function openView(query) {
  go(viewUrl(query))
}

// 把整段行程（依序的多個地點）丟進 Google 地圖路線規劃
export function routeUrl(places) {
  const list = places.filter(Boolean)
  if (!list.length) return null
  const origin = encodeURIComponent(list[0])
  const destination = encodeURIComponent(list[list.length - 1])
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
  const mid = list.slice(1, -1)
  if (mid.length) url += `&waypoints=${mid.map(encodeURIComponent).join('|')}`
  return url
}

export function openRoute(places) {
  go(routeUrl(places))
}
