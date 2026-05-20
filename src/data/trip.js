// 行程基本資料與團員 / 預算（取自澎湖行程.xlsx）

export const trip = {
  title: '澎湖五日團',
  subtitle: '五天四夜・西嶼 × 吉貝 × 花火節',
  startDate: '2026-05-22',
  endDate: '2026-05-26',
  days: 5,
  cover: 'penghu', // 用漸層底色，不放圖片
}

// 團員（帳戶）。weight = 大人 1 + 小孩 0.5，用於均分。
export const members = [
  { id: 'lee', name: '李家', sub: '2大2小', adults: 2, kids: 2, days: 5, weight: 3, color: '#ff7a59', photo: '/members/lee.webp' },
  { id: 'ding', name: '丁', sub: '1人', adults: 1, kids: 0, days: 5, weight: 1, color: '#1098f0', photo: '/members/ding.webp?v=2' },
  { id: 'fish', name: '魚', sub: '1人', adults: 1, kids: 0, days: 5, weight: 1, color: '#22c08b', photo: '/members/fish.webp?v=2' },
  { id: 'jan', name: '詹家', sub: '2大2小', adults: 2, kids: 2, days: 4, weight: 3, color: '#a06bff', photo: '/members/jan.webp?v=2' },
  { id: 'ga', name: '嘎', sub: '1人', adults: 1, kids: 0, days: 4, weight: 1, color: '#ffb400', photo: '/members/ga.webp' },
]

export const memberById = Object.fromEntries(members.map((m) => [m.id, m]))

// 預算估算表（每位團員各分類金額，0 代表未參加）
export const budgetCategories = [
  { key: 'flight', label: '來回機票', note: '各自購買', amounts: { lee: 15872, ding: 4289, fish: 4289, jan: 15872, ga: 4289 } },
  { key: 'stay', label: '仁居住宿（3晚）', note: '依單房訂價打折', amounts: { lee: 8550, ding: 6450, fish: 3225, jan: 8550, ga: 3225 } },
  { key: 'car', label: '租車', note: '依人數均分', amounts: { lee: 4244, ding: 1416, fish: 1416, jan: 3468, ga: 1156 } },
  { key: 'jibei', label: '吉貝島（第3天）', note: '船票＋水上設施', amounts: { lee: 4750, ding: 1550, fish: 1550, jan: 6200, ga: 1550 } },
  { key: 'sandcastle', label: '沙堡（1晚）', note: '部分團員', amounts: { lee: 3700, ding: 1350, fish: 1350, jan: 0, ga: 0 } },
  { key: 'boat', label: '安船長海釣（第1天）', note: '部分團員', amounts: { lee: 7500, ding: 2500, fish: 2500, jan: 0, ga: 0 } },
  { key: 'aquarium', label: '水族館（第5天）', note: '', amounts: { lee: 500, ding: 250, fish: 250, jan: 920, ga: 250 } },
]

export const budgetNotes = [
  '烤肉、桌菜、租車等費用皆依人數均分，小孩算 0.5 人。',
  '住宿依「單房訂價」打折計算，有 4000 / 3000 兩種房型，約打 7 折 × 3 天。',
]

// 計算每位團員的預算總額
export function memberBudgetTotal(memberId) {
  return budgetCategories.reduce((sum, c) => sum + (c.amounts[memberId] || 0), 0)
}

export const budgetGrandTotal = members.reduce(
  (sum, m) => sum + memberBudgetTotal(m.id),
  0,
)
