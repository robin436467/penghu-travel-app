import { createContext, useContext, useEffect, useReducer } from 'react'
import { itinerary as seedItinerary } from './data/itinerary'

const STORAGE_KEY = 'penghu-app-v1'

const clone = (v) =>
  typeof structuredClone === 'function'
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v))

function freshState() {
  return {
    days: clone(seedItinerary),
    expenses: [],
  }
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
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [{ id: uid(), createdAt: Date.now(), ...action.expense }, ...state.expenses],
      }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e,
        ),
      }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }

    case 'TOGGLE_STOP_SKIP':
      return {
        ...state,
        days: state.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) =>
            s.id === action.stopId ? { ...s, skipped: !s.skipped } : s,
          ),
        })),
      }
    case 'REPLACE_STOP':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? {
                ...d,
                stops: d.stops.map((s) =>
                  s.id === action.stopId ? { ...s, ...action.patch } : s,
                ),
              }
            : d,
        ),
      }
    case 'ADD_STOP':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? { ...d, stops: [...d.stops, { id: uid(), ...action.stop }] }
            : d,
        ),
      }
    case 'REMOVE_STOP':
      return {
        ...state,
        days: state.days.map((d) =>
          d.day === action.day
            ? { ...d, stops: d.stops.filter((s) => s.id !== action.stopId) }
            : d,
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

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* 容量已滿時忽略 */
    }
  }, [state])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore 必須在 StoreProvider 內使用')
  return ctx
}
