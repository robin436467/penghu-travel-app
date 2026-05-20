import { Navigation, Map } from 'lucide-react'
import { getStopMeta } from '../ui/meta'
import { openNavigate, openRoute } from '../lib/maps'

// 路線流程圖：編號 1-2-3、虛線串接，點節點可導航；上方按鈕可把整段丟進 Google 地圖
export default function RouteMap({ stops }) {
  const withPlace = stops.filter((s) => s.place && !s.skipped)

  return (
    <div className="px-4 pb-28 pt-2">
      {/* 整段路線開 Google 地圖 */}
      <button
        type="button"
        disabled={withPlace.length < 1}
        onClick={() => openRoute(withPlace.map((s) => s.place))}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-bold text-white active:bg-brand-dark disabled:opacity-40"
      >
        <Map size={16} /> 在 Google 地圖看整段路線
      </button>

      {/* 流程圖 */}
      <div
        className="relative overflow-hidden rounded-2xl p-4"
        style={{ background: 'linear-gradient(180deg,#e9f5ff 0%,#f3f8fb 100%)' }}
      >
        {/* 背景波浪裝飾 */}
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-40" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M0 12 Q 25 4 50 12 T 100 12 V20 H0 Z" fill="#cfeaff" />
          <path d="M0 15 Q 25 8 50 15 T 100 15 V20 H0 Z" fill="#bfe2ff" />
        </svg>

        {stops.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-faint">這天還沒有行程點</p>
        ) : (
          <div className="relative">
            {/* 中央虛線 */}
            <div className="absolute bottom-4 left-1/2 top-4 -translate-x-1/2 border-l-2 border-dashed border-brand/35" />

            <div className="relative space-y-3">
              {stops.map((s, i) => {
                const meta = getStopMeta(s.type)
                const Icon = meta.Icon
                const left = i % 2 === 0
                return (
                  <div key={s.id} className="relative flex min-h-[52px] items-center">
                    {/* 資訊卡（左右交錯） */}
                    <button
                      type="button"
                      onClick={() => s.place && openNavigate(s.place)}
                      className={`w-[42%] rounded-xl border border-line bg-white p-2.5 text-left shadow-card active:scale-[0.98] ${
                        left ? 'mr-auto' : 'ml-auto'
                      } ${s.skipped ? 'opacity-50' : ''}`}
                      style={{ transition: 'transform .12s' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon size={13} color={meta.tint} />
                        {s.time && <span className="text-[11px] font-bold text-brand">{s.time}</span>}
                      </div>
                      <p className={`text-[13px] font-bold leading-tight text-ink ${s.skipped ? 'line-through' : ''}`}>
                        {s.name}
                      </p>
                      {s.place && (
                        <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-brand">
                          <Navigation size={9} /> 導航
                        </span>
                      )}
                    </button>

                    {/* 中央編號節點 */}
                    <span
                      className="absolute left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full text-sm font-black text-white"
                      style={{ background: meta.tint, boxShadow: '0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,.18)' }}
                    >
                      {i + 1}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
