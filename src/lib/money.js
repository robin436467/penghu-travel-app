// 分攤計算：依團員權重（大人 1、小孩 0.5）平分每筆花費

export function formatNT(n) {
  const rounded = Math.round(n)
  return 'NT$' + rounded.toLocaleString('en-US')
}

// 一筆參與紀錄的權重：大人 1、小孩 0.5
export function partWeight(p) {
  if (!p) return 0
  return (p.adults || 0) + (p.kids || 0) * 0.5
}

// 取得某筆花費的「成員→權重」對照（相容舊的 participantIds 格式）
function entriesOf(expense, members, byMember) {
  if (expense.participants) {
    return Object.entries(expense.participants)
      .filter(([id]) => byMember[id])
      .map(([id, p]) => [id, partWeight(p)])
      .filter(([, w]) => w > 0)
  }
  // 舊格式：participantIds + 固定家庭權重
  const weightOf = Object.fromEntries(members.map((m) => [m.id, m.weight]))
  return (expense.participantIds || [])
    .filter((id) => byMember[id])
    .map((id) => [id, weightOf[id] || 1])
}

// 計算每位團員的「已付」「應分攤」「淨額」
// expenses: [{ amount, payerId, participants: { memberId: {adults, kids} } }]
export function computeBalances(expenses, members) {
  const byMember = {}
  members.forEach((m) => {
    byMember[m.id] = { paid: 0, share: 0, net: 0 }
  })

  expenses.forEach((e) => {
    const entries = entriesOf(e, members, byMember)
    const totalWeight = entries.reduce((s, [, w]) => s + w, 0)
    if (!totalWeight || !e.amount) return
    entries.forEach(([id, w]) => {
      byMember[id].share += (e.amount * w) / totalWeight
    })
    if (byMember[e.payerId]) byMember[e.payerId].paid += e.amount
  })

  members.forEach((m) => {
    const b = byMember[m.id]
    b.net = b.paid - b.share // 正：別人欠他；負：他要付
  })

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  return { byMember, total }
}

// 一筆花費的總參與人數（大人＋小孩）
export function expenseHeadcount(e) {
  if (e.participants) {
    return Object.values(e.participants).reduce((s, p) => s + (p.adults || 0) + (p.kids || 0), 0)
  }
  return e.participantIds?.length || 0
}

// 由淨額算出最少筆數的還款方案 [{ from, to, amount }]
export function computeSettlements(byMember) {
  const debtors = [] // 要付錢的人（net < 0）
  const creditors = [] // 要收錢的人（net > 0）
  Object.entries(byMember).forEach(([id, b]) => {
    const net = Math.round(b.net)
    if (net < 0) debtors.push({ id, amount: -net })
    else if (net > 0) creditors.push({ id, amount: net })
  })

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transfers = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    if (pay > 0) {
      transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: pay })
    }
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount === 0) i++
    if (creditors[j].amount === 0) j++
  }
  return transfers
}
