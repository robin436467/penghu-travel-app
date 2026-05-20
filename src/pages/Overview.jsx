import { CalendarDays, Compass, Wallet, PiggyBank, ChevronRight } from 'lucide-react'
import MascotAnim from '../components/MascotAnim'
import { useNav } from '../App'
import { useStore } from '../store'
import { trip, members, budgetGrandTotal } from '../data/trip'
import { itinerary } from '../data/itinerary'
import { formatNT } from '../lib/money'
import Avatar from '../components/Avatar'

const fmtDate = (s) => {
  const [, m, d] = s.split('-')
  return `${m}/${d}`
}

function Shortcut({ Icon, label, tint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-white py-4 shadow-card active:scale-95"
      style={{ transition: 'transform .12s' }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: tint + '1a' }}
      >
        <Icon size={22} color={tint} strokeWidth={2.1} />
      </span>
      <span className="text-[13px] font-medium text-ink">{label}</span>
    </button>
  )
}

export default function Overview() {
  const nav = useNav()
  const { state } = useStore()

  return (
    <div>
      {/* 主視覺 */}
      <div
        className="relative overflow-hidden pb-12 pl-5 pr-28 pt-[calc(env(safe-area-inset-top)+28px)] text-white"
        style={{ background: 'linear-gradient(135deg,#1aa0f5 0%,#0bb6c9 100%)' }}
      >
        {/* 吉祥物動畫：滑入→播放→滑出→再滑入，循環 */}
        <MascotAnim className="pointer-events-none absolute bottom-0 right-0 w-[250px] aspect-[293/226]" />
        <p className="text-sm font-medium opacity-90">團體旅遊計畫</p>
        <h1 className="mt-1 text-[26px] font-black leading-tight">{trip.title}</h1>
        <p className="mt-1 text-sm opacity-95">{trip.subtitle}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
            {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 font-medium">共 {trip.days} 天</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.map((m) => (
              <Avatar key={m.id} member={m} size={34} ring />
            ))}
          </div>
          <span className="ml-1 text-sm opacity-95">{members.length} 位團員同行</span>
        </div>
      </div>

      {/* 捷徑 */}
      <div className="relative z-10 -mt-5 flex items-stretch gap-3 px-4">
        <Shortcut Icon={CalendarDays} label="看行程" tint="#1098f0" onClick={() => nav.goItinerary(1)} />
        <Shortcut Icon={Compass} label="探索景點" tint="#22a06b" onClick={() => nav.goTab('explore')} />
        <Shortcut Icon={Wallet} label="共同記帳" tint="#ff7a2f" onClick={() => nav.goTab('expenses')} />
      </div>

      {/* 預算總覽 */}
      <div className="px-4 pt-5">
        <button
          type="button"
          onClick={() => nav.goTab('expenses')}
          className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card active:scale-[0.99]"
          style={{ transition: 'transform .12s' }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-soft">
            <PiggyBank size={24} color="#ff4d57" />
          </span>
          <div className="flex-1">
            <p className="text-sm text-ink-soft">預算估算總額</p>
            <p className="text-xl font-black text-ink">{formatNT(budgetGrandTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink-soft">已記花費</p>
            <p className="text-base font-bold text-ink">{state.expenses.length} 筆</p>
          </div>
          <ChevronRight size={18} className="text-ink-faint" />
        </button>
      </div>

      {/* 行程亮點 */}
      <div className="px-4 pb-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">每日亮點</h2>
          <button
            type="button"
            onClick={() => nav.goItinerary(1)}
            className="flex items-center text-sm font-medium text-brand"
          >
            看完整行程 <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-2.5">
          {itinerary.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => nav.goItinerary(d.day)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-card active:scale-[0.99]"
              style={{ transition: 'transform .12s' }}
            >
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-soft">
                <span className="text-[10px] font-medium leading-none text-brand">第{d.day}天</span>
                <span className="mt-0.5 text-sm font-black leading-none text-brand">{fmtDate(d.date)}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{d.title}</p>
                <p className="truncate text-[13px] text-ink-soft">
                  星期{d.weekday}・{d.stops.length} 個行程點
                </p>
              </div>
              <ChevronRight size={18} className="text-ink-faint" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
