import { useState } from 'react'

// 團員頭像：優先顯示照片，沒有/載入失敗則用名稱首字＋代表色。整體放大 20%。
export default function Avatar({ member, size = 36, ring = false }) {
  const s = Math.round(size * 1.2)
  const [failed, setFailed] = useState(false)
  const ringStyle = ring ? '0 0 0 2px #fff' : 'none'
  const title = `${member.name}（${member.sub}）`

  if (member.photo && !failed) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        title={title}
        draggable="false"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full bg-canvas object-cover"
        style={{ width: s, height: s, boxShadow: ringStyle }}
      />
    )
  }

  const ch = member.name.slice(0, member.name.length === 2 ? 2 : 1)
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: s,
        height: s,
        background: member.color,
        fontSize: s * 0.4,
        boxShadow: ringStyle,
      }}
      title={title}
    >
      {ch}
    </div>
  )
}
