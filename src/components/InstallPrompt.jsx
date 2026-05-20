import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISS_KEY = 'install-dismissed-v1'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

// 安裝到主畫面提示：Android/桌機用原生安裝鈕；iOS 顯示手動指引
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {}

    const onBIP = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    if (isIOS()) {
      setIosHint(true)
      setShow(true)
    }
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  if (!show) return null

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }
  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice.catch(() => {})
    setDeferred(null)
    setShow(false)
  }

  return (
    <div className="fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 animate-fade rounded-2xl border border-line bg-white p-3 shadow-float">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
          <Download size={20} color="#1098f0" />
        </span>
        <div className="min-w-0 flex-1">
          {iosHint ? (
            <p className="text-[13px] leading-snug text-ink">
              安裝到主畫面：點下方<Share size={13} className="mx-0.5 inline align-text-bottom" color="#1098f0" />
              分享，再選「<span className="font-bold">加入主畫面</span>」
            </p>
          ) : (
            <p className="text-[13px] font-medium leading-snug text-ink">把「澎湖五日團」加到主畫面，像 App 一樣用</p>
          )}
        </div>
        {!iosHint && (
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white active:bg-brand-dark"
          >
            安裝
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint active:bg-canvas"
          aria-label="關閉"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
