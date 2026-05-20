import { useEffect, useState } from 'react'

// 18 張影格依序播放（去背 webp）
const FRAMES = Array.from({ length: 18 }, (_, i) => `/mascot-anim/${i + 1}.webp`)

const FRAME_MS = 135 // 每張影格毫秒，約 7fps
const ENTER_MS = 600 // 從右側滑入
const EXIT_MS = 850 // 滑回右側（慢一點）
const GAP_MS = 450 // 滑出後在畫面外停留

// 循環：從右側滑入 → 播完 1~18 → 滑回去 → 再滑入 → 重複
export default function MascotAnim({ className = '' }) {
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timers = []
    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms))
      })

    async function loop() {
      while (!cancelled) {
        setI(0)
        setShown(true) // 滑入
        await wait(ENTER_MS)
        if (cancelled) return
        for (let f = 0; f < FRAMES.length; f++) {
          setI(f) // 播放影格
          await wait(FRAME_MS)
          if (cancelled) return
        }
        setShown(false) // 滑回去
        await wait(EXIT_MS + GAP_MS)
      }
    }
    loop()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className={className}
      style={{
        transform: shown ? 'translateX(0)' : 'translateX(125%)',
        opacity: shown ? 1 : 0,
        transition: `transform ${shown ? ENTER_MS : EXIT_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${
          shown ? ENTER_MS : EXIT_MS
        }ms ease`,
      }}
    >
      {FRAMES.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
