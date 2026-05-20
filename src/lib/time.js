// 時間工具：HH:MM 與分鐘互轉、依前後站建議時間

export function toMin(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(min) {
  const v = Math.max(0, Math.min(1439, Math.round(min)))
  const h = Math.floor(v / 60)
  const m = v % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// 依新順序中該位置的前後站時間，建議一個落在中間的時間
export function suggestTime(orderIds, index, byId, fallback = '') {
  const prev = toMin(byId[orderIds[index - 1]]?.time)
  const next = toMin(byId[orderIds[index + 1]]?.time)
  if (prev != null && next != null) {
    return toHHMM(next > prev ? (prev + next) / 2 : prev + 30)
  }
  if (prev != null) return toHHMM(prev + 60)
  if (next != null) return toHHMM(next - 60)
  return fallback
}
