import { useMemo, useState } from 'react'
import { Search, Star, ChevronRight } from 'lucide-react'
import { useNav } from '../App'
import { spots, spotCategories, spotRegions } from '../data/spots'
import { getCategoryMeta } from '../ui/meta'
import { spotPhoto } from '../lib/gphoto'

function SpotThumb({ spot }) {
  const meta = getCategoryMeta(spot.category)
  const Icon = meta.Icon
  const photo = spotPhoto(spot, 320)
  const [failed, setFailed] = useState(false)

  if (photo && !failed) {
    return (
      <img
        src={photo.url}
        alt={spot.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-14 w-14 shrink-0 rounded-xl bg-canvas object-cover"
      />
    )
  }
  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
      style={{ background: `linear-gradient(135deg,${meta.g1},${meta.g2})` }}
    >
      <Icon size={24} color="#fff" />
    </span>
  )
}

function SpotRow({ spot, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(spot.id)}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card active:scale-[0.99]"
      style={{ transition: 'transform .12s' }}
    >
      <SpotThumb spot={spot} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-ink">{spot.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="rounded bg-canvas px-1.5 py-0.5">{spot.region}</span>
          {spot.rating && (
            <span className="flex items-center gap-0.5 text-amber-dark">
              <Star size={12} fill="#ffb400" color="#ffb400" /> {spot.rating}
            </span>
          )}
          {spot.hours && <span>{spot.hours}</span>}
        </p>
        {spot.intro && <p className="mt-0.5 truncate text-[13px] text-ink-soft">{spot.intro}</p>}
      </div>
      <ChevronRight size={18} className="shrink-0 text-ink-faint" />
    </button>
  )
}

export default function Explore() {
  const nav = useNav()
  const [cat, setCat] = useState('景點')
  const [region, setRegion] = useState('全部')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const kw = q.trim()
    return spots.filter(
      (s) =>
        s.category === cat &&
        (region === '全部' || s.region === region) &&
        (!kw || s.name.includes(kw) || (s.intro && s.intro.includes(kw))),
    )
  }, [cat, region, q])

  // 只顯示該分類實際出現的地區
  const regionsForCat = useMemo(() => {
    const set = new Set(spots.filter((s) => s.category === cat).map((s) => s.region))
    return spotRegions.filter((r) => r === '全部' || set.has(r))
  }, [cat])

  return (
    <div>
      {/* 標題 + 搜尋 */}
      <div className="bg-white px-5 pb-3 pt-[calc(env(safe-area-inset-top)+18px)]">
        <h1 className="text-2xl font-black text-ink">探索澎湖</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5">
          <Search size={18} className="text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋景點、美食、伴手禮"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* 分類分頁 */}
      <div className="no-scrollbar sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5">
        {spotCategories.map((c) => {
          const active = c === cat
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCat(c)
                setRegion('全部')
              }}
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-bold"
              style={active ? { background: '#1098f0', color: '#fff' } : { background: '#f0f2f5', color: '#5b6675' }}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* 地區篩選 */}
      {regionsForCat.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-3">
          {regionsForCat.map((r) => {
            const active = r === region
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className="shrink-0 rounded-full border px-3 py-1 text-[13px] font-medium"
                style={
                  active
                    ? { borderColor: '#1098f0', color: '#1098f0', background: '#e7f4fd' }
                    : { borderColor: '#e8eaef', color: '#5b6675', background: '#fff' }
                }
              >
                {r}
              </button>
            )
          })}
        </div>
      )}

      {/* 清單 */}
      <div className="space-y-2.5 px-4 pb-4 pt-3">
        <p className="px-1 text-xs text-ink-faint">共 {list.length} 個</p>
        {list.map((s) => (
          <SpotRow key={s.id} spot={s} onOpen={nav.openSpot} />
        ))}
        {!list.length && <p className="py-12 text-center text-sm text-ink-faint">這個分類目前沒有資料</p>}
      </div>
    </div>
  )
}
