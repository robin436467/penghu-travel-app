import { Home, CalendarDays, Compass, Wallet } from 'lucide-react'

const tabs = [
  { key: 'overview', label: '總覽', Icon: Home },
  { key: 'itinerary', label: '行程', Icon: CalendarDays },
  { key: 'explore', label: '探索', Icon: Compass },
  { key: 'expenses', label: '記帳', Icon: Wallet },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex h-[68px] items-stretch">
        {tabs.map(({ key, label, Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <Icon
                size={23}
                strokeWidth={active ? 2.4 : 1.9}
                color={active ? '#1098f0' : '#97a1ad'}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: active ? '#1098f0' : '#97a1ad' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
