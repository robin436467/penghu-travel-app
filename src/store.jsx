import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { itinerary as seedItinerary } from './data/itinerary'
import { toMin } from './lib/time'

const STORAGE_KEY = 'penghu-app-v1'
const CODE =
  (typeof location !== 'undefined' && new URLSearchParams(location.search).get('code')) || 'penghu'
const POLL_MS = 7000

const clone = (v) =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v))

function freshState() {
  return { days: clone(seedItinerary), expenses: [] }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw)
    return {
      days: parsed.days?.length ? parsed.days : clone(seedItinerary),
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    }
  } catch {
    return freshState()
  }
}

const uid = () => Math.random().toString(36).slice(2, 9)

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return action.state
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [{ id: uid(), createdAt: Date.now(), ...action.expense }, ...state.expenses],
      }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }

    case 'TOGGLE_STOP_SKIP':
      return {
        ...state,
        days: state.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) => (s.id === action.stopId ? { ...s, skipped: !s.skipped } : s)),
        })),
      }
    case 'REPLACE_STOP':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? { ...d, stops: d.stops.map((s) => (s.id === action.stopId ? { ...s, ...action.patch } : s)) }
            : d,
        ),
      }
    case 'ADD_STOP': {
      const newStop = { id: uid(), ...action.stop }
      const t = toMin(newStop.time)
      return {
        ...state,
        days: state.days.map((d) => {
          if (d.day !== action.day) return d
          const stops = [...d.stops]
          // 依時間插到正確位置：放在第一個「時間比它晚」的行程之前；都沒有就放最後
          let idx = stops.length
          if (t != null) {
            const i = stops.findIndex((s) => {
              const st = toMin(s.time)
              return st != null && st > t
            })
            if (i >= 0) idx = i
          }
          stops.splice(idx, 0, newStop)
          return { ...d, stops }
        }),
      }
    }
    case 'REMOVE_STOP':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day ? { ...d, stops: d.stops.filter((s) => s.id !== action.stopId) } : d,
        ),
      }
    case 'REORDER_STOPS':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? { ...d, stops: action.ids.map((id) => d.stops.find((s) => s.id === id)).filter(Boolean) }
            : d,
        ),
      }
    case 'SORT_BY_TIME': {
      const key = (t) => (t && /^\d{1,2}:\d{2}$/.test(t) ? t.padStart(5, '0') : '99:99')
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? { ...d, stops: [...d.stops].sort((a, b) => key(a.time).localeCompare(key(b.time))) }
            : d,
        ),
      }
    }
    case 'RESET':
      return freshState()
    default:
      return state
  }
}

// ───── 雲端同步 API（/api/state，由 Cloudflare Worker + KV 提供）─────
async function apiGet() {
  const r = await fetch(`/api/state?code=${encodeURIComponent(CODE)}`, { cache: 'no-store' })
  if (!r.ok) throw new Error('get')
  return r.json() // { data, rev }
}
async function apiPut(data, rev) {
  const r = await fetch(`/api/state?code=${encodeURIComponent(CODE)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data, rev }),
  })
  if (r.status === 409) {
    const j = await r.json()
    return { ok: false, ...j }
  }
  if (!r.ok) throw new Error('put')
  return r.json() // { ok:true, rev }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, baseDispatch] = useReducer(reducer, undefined, loadState)

  const stateRef = useRef(state)
  const revRef = useRef(0)
  const syncRef = useRef(false) // 是否已連上雲端
  const queueRef = useRef(Promise.resolve())

  useEffect(() => {
    stateRef.current = state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* 容量已滿時忽略 */
    }
  }, [state])

  // 初始化：嘗試連雲端；連不上(本機/離線)就維持單機 localStorage
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const cur = await apiGet()
        if (!alive) return
        if (cur.data) {
          revRef.current = cur.rev
          baseDispatch({ type: 'SET', state: cur.data })
        } else {
          // 空房間 → 把目前本機資料當初版上傳
          const res = await apiPut(stateRef.current, 0)
          if (res.ok) revRef.current = res.rev
        }
        syncRef.current = true
      } catch {
        syncRef.current = false // 單機模式
      }
    })()

    // 輪詢拉取別人的變更（只在分頁可見時）
    const tick = async () => {
      if (!syncRef.current || document.hidden) return
      try {
        const cur = await apiGet()
        if (cur.data && cur.rev > revRef.current) {
          revRef.current = cur.rev
          baseDispatch({ type: 'SET', state: cur.data })
        }
      } catch {
        /* 暫時失敗就下次再試 */
      }
    }
    const timer = setInterval(tick, POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  // 把某個動作套用到「雲端最新狀態」上再寫回（避免覆蓋別人的變更）
  const pushAction = async (action) => {
    for (let i = 0; i < 4; i++) {
      try {
        const cur = await apiGet()
        const base = cur.data || freshState()
        const next = reducer(base, action)
        const res = await apiPut(next, cur.rev)
        if (res.ok) {
          revRef.current = res.rev
          baseDispatch({ type: 'SET', state: next }) // 以雲端結果為準，校正本機
          return
        }
        // 衝突 → 迴圈重新取最新再套用
      } catch {
        return // 失敗就保留本機樂觀更新
      }
    }
  }

  // 對外的 dispatch：先樂觀更新本機（UI 即時），再同步到雲端
  const dispatch = (action) => {
    baseDispatch(action)
    if (syncRef.current && action.type !== 'SET') {
      queueRef.current = queueRef.current.then(() => pushAction(action)).catch(() => {})
    }
  }

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore 必須在 StoreProvider 內使用')
  return ctx
}
