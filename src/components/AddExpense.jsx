import { useMemo, useState } from 'react'
import { Minus, Plus, Check } from 'lucide-react'
import Sheet from './Sheet'
import Avatar from './Avatar'
import { members } from '../data/trip'
import { expenseCategories } from '../ui/meta'
import { formatNT, partWeight } from '../lib/money'

const fullParts = () =>
  Object.fromEntries(members.map((m) => [m.id, { adults: m.adults, kids: m.kids }]))

function Stepper({ label, value, max, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-ink-soft">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-canvas text-ink-soft active:bg-line"
      >
        <Minus size={13} />
      </button>
      <span className="w-4 text-center text-sm font-bold text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-canvas text-ink-soft active:bg-line"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

export default function AddExpense({ open, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('餐飲')
  const [payerId, setPayerId] = useState(members[0].id)
  const [parts, setParts] = useState(fullParts)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const amt = Number(amount) || 0

  const totalWeight = useMemo(
    () => members.reduce((s, m) => s + partWeight(parts[m.id]), 0),
    [parts],
  )

  const setPart = (id, patch) => setParts((p) => ({ ...p, [id]: { ...p[id], ...patch } }))
  const isFamily = (m) => m.adults + m.kids > 1

  const reset = () => {
    setTitle('')
    setAmount('')
    setCat('餐飲')
    setPayerId(members[0].id)
    setParts(fullParts())
  }

  const save = () => {
    if (!title.trim()) return showToast('請先輸入項目名稱')
    if (!(amt > 0)) return showToast('請先輸入金額')
    if (!(totalWeight > 0)) return showToast('請至少選一位分攤的人')
    const participants = {}
    members.forEach((m) => {
      const p = parts[m.id]
      if (p.adults + p.kids > 0) participants[m.id] = { adults: p.adults, kids: p.kids }
    })
    onSave({ title: title.trim(), amount: amt, category: cat, payerId, participants })
    reset()
    onClose()
  }

  return (
    <>
    <Sheet open={open} onClose={onClose} title="新增花費">
      {/* 金額 */}
      <div className="rounded-2xl bg-canvas px-4 py-3">
        <p className="text-xs text-ink-soft">金額</p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-ink-soft">NT$</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-3xl font-black text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* 項目 */}
      <div className="mt-3">
        <p className="mb-1.5 text-sm font-bold text-ink">項目名稱</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：吉貝別野午餐、加油"
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-brand"
        />
      </div>

      {/* 分類 */}
      <div className="mt-3">
        <p className="mb-1.5 text-sm font-bold text-ink">分類</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {expenseCategories.map((c) => {
            const active = c.key === cat
            const Icon = c.Icon
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCat(c.key)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                style={active ? { background: c.tint, color: '#fff' } : { background: '#f0f2f5', color: '#5b6675' }}
              >
                <Icon size={15} color={active ? '#fff' : c.tint} />
                {c.key}
              </button>
            )
          })}
        </div>
      </div>

      {/* 誰付的 */}
      <div className="mt-4">
        <p className="mb-1.5 text-sm font-bold text-ink">誰付的</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = m.id === payerId
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayerId(m.id)}
                className="flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3"
                style={active ? { borderColor: m.color, background: m.color + '14' } : { borderColor: '#e8eaef' }}
              >
                <Avatar member={m} size={26} />
                <span className="text-sm font-medium text-ink">{m.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 這筆有誰參與（點一下選/不選） */}
      <div className="mt-4">
        <p className="mb-1 text-sm font-bold text-ink">這筆有誰參與</p>
        <p className="mb-2 text-[12px] text-ink-faint">點一下選擇要分攤的人；家庭可再微調大人／小孩人數（大人 1、小孩 0.5）。</p>
        <div className="space-y-1.5">
          {members.map((m) => {
            const p = parts[m.id]
            const w = partWeight(p)
            const joined = p.adults + p.kids > 0
            const share = joined && totalWeight ? (amt * w) / totalWeight : 0
            const toggle = () =>
              setParts((prev) => ({
                ...prev,
                [m.id]: joined ? { adults: 0, kids: 0 } : { adults: m.adults, kids: m.kids },
              }))
            return (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl border"
                style={joined ? { borderColor: m.color, background: m.color + '0d' } : { borderColor: '#e8eaef', background: '#fff' }}
              >
                <button type="button" onClick={toggle} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <span style={{ opacity: joined ? 1 : 0.4 }}>
                    <Avatar member={m} size={32} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{m.name}</p>
                    <p className="text-[11px] text-ink-faint">
                      {m.sub}
                      {joined && isFamily(m) ? `・大人 ${p.adults}、小孩 ${p.kids}` : ''}
                    </p>
                  </div>
                  {joined && <span className="text-sm font-bold text-ink">{formatNT(share)}</span>}
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                    style={joined ? { background: m.color, borderColor: m.color } : { borderColor: '#cbd2da' }}
                  >
                    {joined && <Check size={15} color="#fff" strokeWidth={3} />}
                  </span>
                </button>

                {joined && isFamily(m) && (
                  <div className="flex items-center gap-5 border-t px-3 py-2 pl-[54px]" style={{ borderColor: m.color + '33' }}>
                    <Stepper label="大人" value={p.adults} max={m.adults} onChange={(v) => setPart(m.id, { adults: v })} />
                    {m.kids > 0 && <Stepper label="小孩" value={p.kids} max={m.kids} onChange={(v) => setPart(m.id, { kids: v })} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 儲存 */}
      <button
        type="button"
        onClick={save}
        className="mt-5 w-full rounded-xl py-3.5 font-bold text-white active:opacity-90"
        style={{ background: '#1098f0' }}
      >
        儲存花費
      </button>
    </Sheet>

    {toast && (
      <div className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 animate-fade rounded-full bg-ink/90 px-4 py-2.5 text-sm font-medium text-white shadow-float">
        {toast}
      </div>
    )}
    </>
  )
}
