import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Navigation,
  MoreVertical,
  Repeat,
  EyeOff,
  Eye,
  Trash2,
  Plus,
  Pencil,
  MapPinned,
  List,
  Map,
  GripVertical,
} from 'lucide-react'
import { useNav } from '../App'
import { useStore } from '../store'
import { getStopMeta } from '../ui/meta'
import { openNavigate } from '../lib/maps'
import { toMin, suggestTime } from '../lib/time'
import Sheet from '../components/Sheet'
import SpotPicker from '../components/SpotPicker'
import StopForm from '../components/StopForm'
import RouteMap from '../components/RouteMap'

const fmtDate = (s) => {
  const [, m, d] = s.split('-')
  return `${m}/${d}`
}

// 某站在 ordered 陣列中的時間，是否與前/後站衝突（相同或順序顛倒）
function hasConflict(ordered, index) {
  const t = toMin(ordered[index]?.time)
  if (t == null) return false
  const prev = index > 0 ? toMin(ordered[index - 1].time) : null
  const next = index < ordered.length - 1 ? toMin(ordered[index + 1].time) : null
  if (prev != null && t <= prev) return true
  if (next != null && t >= next) return true
  return false
}

function SortableStop({ stop, index, onAction, showConnector, animated }) {
  const meta = getStopMeta(stop.type)
  const Icon = meta.Icon
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 20 : undefined,
  }
  const dotColor = animated ? '#1098f0' : '#cfd8e3'

  return (
    <div ref={setNodeRef} style={style} className="relative pl-12">
      {/* 連到下一站的點點點虛線（current 時段會流動） */}
      {showConnector && (
        <span
          className="pointer-events-none absolute left-[15px] top-[22px] -bottom-7 w-0.5"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, ${dotColor} 0 3px, transparent 3px 12px)`,
            animation: animated ? 'flow-dots 1.6s linear infinite' : 'none',
          }}
        />
      )}
      <span
        className="absolute left-0 top-1 z-[1] flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
        style={{ background: '#ff4d57' }}
      >
        {index + 1}
      </span>

      <div className={`mb-3 rounded-2xl bg-white p-3.5 shadow-card ${stop.skipped ? 'opacity-55' : ''}`}>
        <div className="flex items-start gap-2.5">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: meta.soft }}
          >
            <Icon size={18} color={meta.tint} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {stop.time && <span className="text-sm font-bold text-brand">{stop.time}</span>}
              {stop.skipped && (
                <span className="rounded bg-canvas px-1.5 py-0.5 text-[11px] text-ink-soft">不參加</span>
              )}
            </div>
            <p className={`font-bold text-ink ${stop.skipped ? 'line-through' : ''}`}>{stop.name}</p>
            {stop.note && <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{stop.note}</p>}
          </div>

          {/* 拖曳把手 */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            style={{ touchAction: 'none' }}
            className="flex h-8 w-7 shrink-0 cursor-grab items-center justify-center text-ink-faint active:cursor-grabbing"
            aria-label="拖曳排序"
          >
            <GripVertical size={18} />
          </button>

          <button
            type="button"
            onClick={() => onAction(stop)}
            className="flex h-8 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint active:bg-canvas"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {stop.place && (
          <button
            type="button"
            onClick={() => openNavigate(stop.place)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-bold text-white active:bg-brand-dark"
          >
            <Navigation size={16} fill="#fff" />
            導航前往
          </button>
        )}
      </div>
    </div>
  )
}

export default function Itinerary() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const [day, setDay] = useState(nav.itinDay || 1)
  const [view, setView] = useState('list') // 'list' | 'route'
  const [actionStop, setActionStop] = useState(null)
  const [picker, setPicker] = useState(null) // { mode: 'replace'|'add', stop? }
  const [form, setForm] = useState(null) // { isEdit, stop?, initial? }
  const [addChoice, setAddChoice] = useState(false)
  const [timeEdit, setTimeEdit] = useState(null) // 時間衝突時 { stopId, name, time }

  const current = state.days.find((d) => d.day === day) || state.days[0]
  const stops = current.stops // 手動順序（不自動排序）

  // 偵測「現在時段」：若今天正是這一天，且現在落在某兩站之間，只讓那一段流動；否則全部流動
  const now = new Date()
  const [yy, mm, dd] = current.date.split('-').map(Number)
  const isToday = now.getFullYear() === yy && now.getMonth() + 1 === mm && now.getDate() === dd
  let currentSeg = -1
  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes()
    for (let i = 0; i < stops.length - 1; i++) {
      const a = toMin(stops[i].time)
      const b = toMin(stops[i + 1].time)
      if (a != null && b != null && nowMin >= a && nowMin < b) {
        currentSeg = i
        break
      }
    }
  }
  const animateAll = currentSeg === -1

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const ids = stops.map((s) => s.id)
    const oldI = ids.indexOf(active.id)
    const newI = ids.indexOf(over.id)
    const newIds = arrayMove(ids, oldI, newI)
    dispatch({ type: 'REORDER_STOPS', day, ids: newIds })

    // 拖到新位置後，若時間與前後衝突才跳出調整提示（記住原順序以便還原）
    const byId = Object.fromEntries(stops.map((s) => [s.id, s]))
    const ordered = newIds.map((id) => byId[id])
    const idx = newIds.indexOf(active.id)
    if (hasConflict(ordered, idx)) {
      const moved = byId[active.id]
      setTimeEdit({
        stopId: active.id,
        name: moved.name,
        time: suggestTime(newIds, idx, byId, moved.time),
        prevIds: ids,
      })
    }
  }

  const confirmTime = () => {
    if (/^\d{1,2}:\d{2}$/.test(timeEdit.time)) {
      dispatch({ type: 'REPLACE_STOP', day, stopId: timeEdit.stopId, patch: { time: timeEdit.time } })
    }
    setTimeEdit(null)
  }

  const revertMove = () => {
    if (timeEdit?.prevIds) dispatch({ type: 'REORDER_STOPS', day, ids: timeEdit.prevIds })
    setTimeEdit(null)
  }

  const handlePick = (spot) => {
    const isFood = ['美食', '早餐', '咖啡廳'].includes(spot.category)
    if (picker.mode === 'replace') {
      dispatch({
        type: 'REPLACE_STOP',
        day,
        stopId: picker.stop.id,
        patch: { name: spot.name, place: spot.mapQuery, note: spot.intro || picker.stop.note },
      })
      setPicker(null)
    } else {
      setPicker(null)
      setForm({
        isEdit: false,
        initial: { name: spot.name, place: spot.mapQuery, type: isFood ? 'food' : 'spot', note: spot.intro || '' },
      })
    }
  }

  const handleFormSave = (data) => {
    if (form.isEdit) {
      dispatch({ type: 'REPLACE_STOP', day, stopId: form.stop.id, patch: data })
    } else {
      dispatch({ type: 'ADD_STOP', day, stop: data })
    }
    setForm(null)
  }

  return (
    <div>
      {/* 標題 */}
      <div className="bg-white px-5 pb-3 pt-[calc(env(safe-area-inset-top)+18px)]">
        <h1 className="text-2xl font-black text-ink">行程</h1>
      </div>

      {/* 天數分頁 */}
      <div className="no-scrollbar sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5">
        {state.days.map((d) => {
          const active = d.day === day
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setDay(d.day)}
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-bold"
              style={active ? { background: '#1098f0', color: '#fff' } : { background: '#f0f2f5', color: '#5b6675' }}
            >
              第{d.day}天
            </button>
          )
        })}
      </div>

      {/* 當天標題 + 列表/地圖切換 */}
      <div className="flex items-end justify-between px-5 pb-1 pt-4">
        <div>
          <p className="text-sm font-medium text-ink-soft">
            {fmtDate(current.date)}・星期{current.weekday}
          </p>
          <h2 className="text-xl font-black text-ink">{current.title}</h2>
        </div>
        <div className="flex rounded-full bg-canvas p-0.5">
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold"
            style={view === 'list' ? { background: '#1098f0', color: '#fff' } : { color: '#5b6675' }}
          >
            <List size={14} /> 列表
          </button>
          <button
            type="button"
            onClick={() => setView('route')}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold"
            style={view === 'route' ? { background: '#1098f0', color: '#fff' } : { color: '#5b6675' }}
          >
            <Map size={14} /> 地圖
          </button>
        </div>
      </div>

      {view === 'route' ? (
        <RouteMap stops={stops} />
      ) : (
        <div className="px-4 pt-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {stops.map((s, i) => (
                <SortableStop
                  key={s.id}
                  stop={s}
                  index={i}
                  onAction={setActionStop}
                  showConnector={i < stops.length - 1}
                  animated={animateAll || i === currentSeg}
                />
              ))}
            </SortableContext>
          </DndContext>

          {!stops.length && (
            <p className="py-10 text-center text-sm text-ink-faint">這天還沒有行程點，點下方新增。</p>
          )}

          <button
            type="button"
            onClick={() => setAddChoice(true)}
            className="mb-2 ml-12 flex w-[calc(100%-3rem)] items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line py-3 text-sm font-bold text-ink-soft active:bg-white"
          >
            <Plus size={18} /> 新增行程點
          </button>
          <p className="ml-12 pb-2 text-center text-[12px] text-ink-faint">拖曳右側把手可調整順序</p>
        </div>
      )}

      {/* 行程點動作選單 */}
      <Sheet open={!!actionStop} onClose={() => setActionStop(null)} title={actionStop?.name || ''}>
        <div className="space-y-1.5">
          {actionStop?.place && (
            <ActionRow
              Icon={Navigation}
              tint="#1098f0"
              label="開啟導航"
              onClick={() => {
                openNavigate(actionStop.place)
                setActionStop(null)
              }}
            />
          )}
          <ActionRow
            Icon={Pencil}
            tint="#5b6675"
            label="編輯內容（名稱／時間／備註）"
            onClick={() => {
              setForm({ isEdit: true, stop: actionStop, initial: actionStop })
              setActionStop(null)
            }}
          />
          <ActionRow
            Icon={Repeat}
            tint="#22a06b"
            label="更換景點"
            onClick={() => {
              setPicker({ mode: 'replace', stop: actionStop })
              setActionStop(null)
            }}
          />
          <ActionRow
            Icon={actionStop?.skipped ? Eye : EyeOff}
            tint="#ff7a2f"
            label={actionStop?.skipped ? '取消「不參加」' : '標記為不參加'}
            onClick={() => {
              dispatch({ type: 'TOGGLE_STOP_SKIP', stopId: actionStop.id })
              setActionStop(null)
            }}
          />
          <ActionRow
            Icon={Trash2}
            tint="#ff4d57"
            label="刪除此行程點"
            onClick={() => {
              dispatch({ type: 'REMOVE_STOP', day, stopId: actionStop.id })
              setActionStop(null)
            }}
          />
        </div>
      </Sheet>

      {/* 新增方式選擇 */}
      <Sheet open={addChoice} onClose={() => setAddChoice(false)} title="新增行程點">
        <div className="space-y-1.5">
          <ActionRow
            Icon={MapPinned}
            tint="#22a06b"
            label="從景點清單挑選"
            onClick={() => {
              setAddChoice(false)
              setPicker({ mode: 'add' })
            }}
          />
          <ActionRow
            Icon={Pencil}
            tint="#1098f0"
            label="自訂新增（自己輸入）"
            onClick={() => {
              setAddChoice(false)
              setForm({ isEdit: false, initial: null })
            }}
          />
        </div>
      </Sheet>

      {/* 換景點 / 加入景點 */}
      <SpotPicker
        open={!!picker}
        onClose={() => setPicker(null)}
        onPick={handlePick}
        title={picker?.mode === 'replace' ? '更換為其他景點' : '加入行程點'}
      />

      {/* 自訂新增 / 編輯 */}
      <StopForm
        open={!!form}
        onClose={() => setForm(null)}
        onSave={handleFormSave}
        initial={form?.initial}
        isEdit={form?.isEdit}
      />

      {/* 拖曳後時間衝突 → 調整提示 */}
      <Sheet open={!!timeEdit} onClose={() => setTimeEdit(null)} title="時間衝突，請調整">
        {timeEdit && (
          <>
            <p className="text-sm leading-relaxed text-ink-soft">
              「<span className="font-bold text-ink">{timeEdit.name}</span>」移到這個位置後，時間和前後行程
              <span className="font-bold text-coral">重疊或順序顛倒</span>。要用下面的建議時間留在新位置，還是放回原位？
            </p>
            <input
              type="time"
              value={timeEdit.time}
              onChange={(e) => setTimeEdit({ ...timeEdit, time: e.target.value })}
              className="mt-3 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={revertMove}
                className="flex-1 rounded-xl border border-line py-3 font-bold text-ink-soft"
              >
                放回原位
              </button>
              <button
                type="button"
                onClick={confirmTime}
                className="flex-1 rounded-xl py-3 font-bold text-white"
                style={{ background: '#1098f0' }}
              >
                用建議時間
              </button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}

function ActionRow({ Icon, tint, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left active:bg-canvas"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: tint + '1a' }}>
        <Icon size={18} color={tint} />
      </span>
      <span className="font-semibold text-ink">{label}</span>
    </button>
  )
}
