import { X } from 'lucide-react'

// 從底部滑出的彈窗。open 為 false 時不渲染。
export default function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-center">
      <div className="absolute inset-0 mx-auto max-w-[480px] animate-fade bg-black/35" onClick={onClose} />
      <div className="absolute bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 animate-sheet rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-float">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-ink-soft"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[78svh] overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  )
}
