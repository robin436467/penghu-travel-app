import { useState } from 'react'
import {
  ChevronLeft,
  Navigation,
  CalendarPlus,
  Star,
  Clock,
  MapPin,
  Phone,
  Check,
} from 'lucide-react'
import { useStore } from '../store'
import { spotById } from '../data/spots'
import { getCategoryMeta } from '../ui/meta'
import { openNavigate } from '../lib/maps'
import { spotPhoto } from '../lib/gphoto'
import Sheet from './Sheet'

const fmtDate = (s) => {
  const [, m, d] = s.split('-')
  return `${m}/${d}`
}

export default function SpotDetail({ spotId, onClose }) {
  const spot = spotById[spotId]
  const { state, dispatch } = useStore()
  const [picking, setPicking] = useState(false)
  const [added, setAdded] = useState(false)
  const [time, setTime] = useState('')
  const [tried, setTried] = useState(false)

  if (!spot) return null
  const meta = getCategoryMeta(spot.category)
  const Icon = meta.Icon
  const photo = spotPhoto(spot, 1000)
  const hasTime = /^\d{1,2}:\d{2}$/.test(time)

  const openPicking = () => {
    setTime('')
    setTried(false)
    setPicking(true)
  }

  const addToDay = (day) => {
    if (!hasTime) {
      setTried(true)
      return
    }
    dispatch({
      type: 'ADD_STOP',
      day,
      stop: {
        time,
        type: ['美食', '早餐', '咖啡廳'].includes(spot.category) ? 'food' : 'spot',
        name: spot.name,
        place: spot.mapQuery,
        note: spot.intro || '',
      },
    })
    setPicking(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="fixed inset-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2">
      {/* 背景變暗 */}
      <div className="absolute inset-0 animate-fade bg-black/45" onClick={onClose} />
      {/* 浮動詳情卡片 */}
      <div className="absolute inset-x-0 bottom-0 top-10 animate-sheet overflow-y-auto rounded-t-3xl bg-canvas shadow-float">
      {/* 主視覺 */}
      <div
        className="relative flex h-56 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg,${meta.g1},${meta.g2})` }}
      >
        {photo ? (
          <>
            <img src={photo.url} alt={spot.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
          </>
        ) : (
          <Icon size={72} color="#ffffff" strokeWidth={1.5} opacity={0.92} />
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-card"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="absolute bottom-4 left-5 rounded-full bg-black/35 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {spot.region}・{spot.category}
        </span>
      </div>

      {/* 內容 */}
      <div className="px-5 pb-10 pt-5">
        <h1 className="text-2xl font-black text-ink">{spot.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {spot.rating && (
            <span className="flex items-center gap-1 font-bold text-amber-dark">
              <Star size={15} fill="#ffb400" color="#ffb400" /> {spot.rating}
              <span className="font-normal text-ink-faint">Google 評分</span>
            </span>
          )}
        </div>

        {/* 動作 */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => openNavigate(spot.mapQuery)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-3 font-bold text-white active:bg-brand-dark"
          >
            <Navigation size={18} fill="#fff" /> 導航前往
          </button>
          <button
            type="button"
            onClick={openPicking}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand bg-white py-3 font-bold text-brand active:bg-brand-soft"
          >
            <CalendarPlus size={18} /> 加入行程
          </button>
        </div>

        {/* 資訊 */}
        <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          {spot.intro && (
            <div>
              <p className="mb-1 text-sm font-bold text-ink">景點介紹</p>
              <p className="text-[15px] leading-relaxed text-ink-soft">{spot.intro}</p>
            </div>
          )}
          {spot.hours && (
            <InfoRow Icon={Clock} text={`營業時間 ${spot.hours}`} />
          )}
          {spot.address && <InfoRow Icon={MapPin} text={spot.address} />}
          {spot.phone && <InfoRow Icon={Phone} text={spot.phone} />}
          {!spot.intro && !spot.hours && !spot.address && !spot.phone && (
            <p className="text-sm text-ink-faint">點「導航前往」可在 Google 地圖查看更多資訊。</p>
          )}
        </div>

        {photo && (
          <p className="mt-3 text-center text-[11px] text-ink-faint">
            {photo.source === 'google' ? (
              <>照片來源：Google 地圖{photo.attr?.text ? `／${photo.attr.text}` : ''}</>
            ) : (
              <>照片來源：維基百科（公開授權）</>
            )}
          </p>
        )}
      </div>
      </div>

      {/* 選擇加入哪一天 */}
      <Sheet open={picking} onClose={() => setPicking(false)} title="加入到行程">
        {/* 時間必填 */}
        <p className="mb-1.5 text-sm font-bold text-ink">
          時間 <span className="text-coral">*必填</span>
        </p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand"
          style={{ borderColor: tried && !hasTime ? '#ff4d57' : '#e8eaef' }}
        />
        {tried && !hasTime && <p className="mt-1 text-[12px] text-coral">請先填寫時間再選擇日期</p>}

        <p className="mb-2 mt-4 text-sm font-bold text-ink">加入到哪一天？</p>
        <div className="space-y-2">
          {state.days.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => addToDay(d.day)}
              className={`flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left active:bg-canvas ${
                hasTime ? '' : 'opacity-60'
              }`}
            >
              <span className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-brand-soft">
                <span className="text-[10px] font-medium leading-none text-brand">第{d.day}天</span>
                <span className="mt-0.5 text-xs font-black leading-none text-brand">{fmtDate(d.date)}</span>
              </span>
              <div>
                <p className="font-bold text-ink">{d.title}</p>
                <p className="text-xs text-ink-soft">目前 {d.stops.length} 個行程點</p>
              </div>
            </button>
          ))}
        </div>
      </Sheet>

      {/* 加入成功提示 */}
      {added && (
        <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-sm font-medium text-white animate-fade">
          <Check size={16} color="#4ade80" /> 已加入行程
        </div>
      )}
    </div>
  )
}

function InfoRow({ Icon, text }) {
  return (
    <div className="flex items-start gap-2.5 text-[15px] text-ink-soft">
      <Icon size={17} className="mt-0.5 shrink-0 text-ink-faint" />
      <span>{text}</span>
    </div>
  )
}
