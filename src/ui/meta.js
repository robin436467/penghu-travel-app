// 行程類型與景點分類 → Lucide 圖示與配色
import {
  Car,
  UtensilsCrossed,
  Camera,
  Waves,
  BedDouble,
  Coffee,
  Sandwich,
  Umbrella,
  Gift,
  Ticket,
  ShoppingBag,
  Receipt,
} from 'lucide-react'

// 行程時間軸的類型
export const stopMeta = {
  transport: { Icon: Car, label: '交通', tint: '#1098f0', soft: '#e7f4fd' },
  food: { Icon: UtensilsCrossed, label: '餐飲', tint: '#ff7a2f', soft: '#fff0e6' },
  spot: { Icon: Camera, label: '景點', tint: '#22a06b', soft: '#e6f6ee' },
  activity: { Icon: Waves, label: '活動', tint: '#0db4c8', soft: '#e3f7fa' },
  hotel: { Icon: BedDouble, label: '住宿', tint: '#a06bff', soft: '#f1ebff' },
}

export function getStopMeta(type) {
  return stopMeta[type] || stopMeta.spot
}

// 探索頁的景點分類
export const categoryMeta = {
  景點: { Icon: Camera, tint: '#22a06b', g1: '#3ec98c', g2: '#1c8f5f' },
  美食: { Icon: UtensilsCrossed, tint: '#ff7a2f', g1: '#ff9a5a', g2: '#e8631d' },
  早餐: { Icon: Sandwich, tint: '#e8a200', g1: '#ffc94d', g2: '#e09a00' },
  咖啡廳: { Icon: Coffee, tint: '#8a5a3c', g1: '#b07d57', g2: '#714326' },
  雨天備案: { Icon: Umbrella, tint: '#1098f0', g1: '#56b6f5', g2: '#0a78c4' },
  名產: { Icon: Gift, tint: '#e0567a', g1: '#f57aa0', g2: '#c93d63' },
}

export function getCategoryMeta(cat) {
  return categoryMeta[cat] || categoryMeta['景點']
}

// 記帳分類
export const expenseCategories = [
  { key: '餐飲', Icon: UtensilsCrossed, tint: '#ff7a2f' },
  { key: '交通', Icon: Car, tint: '#1098f0' },
  { key: '住宿', Icon: BedDouble, tint: '#a06bff' },
  { key: '票券', Icon: Ticket, tint: '#22a06b' },
  { key: '採買', Icon: ShoppingBag, tint: '#e0567a' },
  { key: '其他', Icon: Receipt, tint: '#5b6675' },
]

export function getExpenseMeta(key) {
  return expenseCategories.find((c) => c.key === key) || expenseCategories[5]
}
