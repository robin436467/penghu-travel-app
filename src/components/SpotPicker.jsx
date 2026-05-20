import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import Sheet from './Sheet'
import { spots, spotCategories, spotRegions } from '../data/spots'
import { getCategoryMeta } from '../ui/meta'

// 從景點清單挑一個（換景點 / 加入行程共用）
export default function SpotPicker({ open, onClose, onPick, title = '選擇景點' }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('全部')
  const [region, setRegion] = useState('全部')

  const list = useMemo(() => {
    const kw = q.trim()
    return spots.filter(
      (s) =>
        (cat === '全部' || s.category === cat) &&
        (region === '全部' || s.region === region) &&
        (!kw || s.name.includes(kw) || s.region.includes(kw)),
    )
  }, [q, cat, region])

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="sticky top-0 -mx-5 -mt-2 bg-white px-5 pb-2 pt-1">
        <div className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5">
          <Search size={18} className="text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋景點、美食或地區"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {['全部', ...spotCategories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium"
              style={
                cat === c
                  ? { background: '#1098f0', color: '#fff' }
                  : { background: '#f0f2f5', color: '#5b6675' }
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {spotRegions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className="shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium"
              style={
                region === r
                  ? { borderColor: '#1098f0', color: '#1098f0', background: '#e7f4fd' }
                  : { borderColor: '#e8eaef', color: '#5b6675', background: '#fff' }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {list.map((s) => {
          const meta = getCategoryMeta(s.category)
          const Icon = meta.Icon
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s)}
              className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left active:bg-canvas"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: meta.tint + '1a' }}
              >
                <Icon size={18} color={meta.tint} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{s.name}</p>
                <p className="text-xs text-ink-soft">
                  {s.region}・{s.category}
                  {s.rating ? `・★ ${s.rating}` : ''}
                </p>
              </div>
            </button>
          )
        })}
        {!list.length && (
          <p className="py-10 text-center text-sm text-ink-faint">找不到符合的景點</p>
        )}
      </div>
    </Sheet>
  )
}
