import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { stopMeta } from '../ui/meta'

const TYPES = ['spot', 'food', 'transport', 'activity', 'hotel']

// 自訂新增 / 編輯行程點。時間為必填。
export default function StopForm({ open, onClose, onSave, initial, isEdit }) {
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('spot')
  const [note, setNote] = useState('')
  const [place, setPlace] = useState('')
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(initial?.name || '')
    setTime(initial?.time || '')
    setType(initial?.type || 'spot')
    setNote(initial?.note || '')
    setPlace(initial?.place || '')
    setTried(false)
  }, [open, initial])

  const hasName = name.trim().length > 0
  const hasTime = /^\d{1,2}:\d{2}$/.test(time)
  const canSave = hasName && hasTime

  const save = () => {
    if (!canSave) {
      setTried(true)
      return
    }
    onSave({
      name: name.trim(),
      time,
      type,
      note: note.trim(),
      place: place.trim(),
    })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? '編輯行程點' : '新增行程點'}>
      <div>
        <p className="mb-1.5 text-sm font-bold text-ink">名稱</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：奎壁山摩西分海"
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-brand"
        />
        {!place && (
          <p className="mt-1 text-[12px] text-ink-faint">自訂行程不會有導航，也不會列入「整段路線」。要導航請從「探索」加入景點。</p>
        )}
      </div>

      <div className="mt-3">
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
        {tried && !hasTime && <p className="mt-1 text-[12px] text-coral">請填寫時間</p>}
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-sm font-bold text-ink">類型</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TYPES.map((t) => {
            const m = stopMeta[t]
            const Icon = m.Icon
            const active = t === type
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                style={active ? { background: m.tint, color: '#fff' } : { background: '#f0f2f5', color: '#5b6675' }}
              >
                <Icon size={15} color={active ? '#fff' : m.tint} />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-sm font-bold text-ink">備註（可不填）</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="例如：退潮時段、需預訂…"
          className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-brand"
        />
      </div>

      <button
        type="button"
        onClick={save}
        className="mt-5 w-full rounded-xl py-3.5 font-bold text-white"
        style={{ background: canSave ? '#1098f0' : '#9cc7e8' }}
      >
        {isEdit ? '儲存變更' : '加入行程'}
      </button>
    </Sheet>
  )
}
