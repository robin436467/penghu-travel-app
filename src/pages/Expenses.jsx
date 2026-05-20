import { useMemo, useState } from 'react'
import { Plus, Trash2, ArrowRight, Receipt, PartyPopper } from 'lucide-react'
import { useStore } from '../store'
import {
  members,
  memberById,
  budgetCategories,
  budgetNotes,
  memberBudgetTotal,
} from '../data/trip'
import { computeBalances, computeSettlements, formatNT, expenseHeadcount } from '../lib/money'
import { getExpenseMeta } from '../ui/meta'
import Avatar from '../components/Avatar'
import AddExpense from '../components/AddExpense'
import Sheet from '../components/Sheet'

const TABS = ['花費明細', '結算', '預算估算']

export default function Expenses() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState('花費明細')
  const [adding, setAdding] = useState(false)
  const [actExp, setActExp] = useState(null)

  const { byMember, total } = useMemo(
    () => computeBalances(state.expenses, members),
    [state.expenses],
  )
  const settlements = useMemo(() => computeSettlements(byMember), [byMember])

  return (
    <div>
      {/* 標題 + 成員 */}
      <div className="bg-white px-5 pb-3 pt-[calc(env(safe-area-inset-top)+18px)]">
        <h1 className="text-2xl font-black text-ink">共同記帳</h1>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.map((m) => (
              <Avatar key={m.id} member={m} size={32} ring />
            ))}
          </div>
          <span className="ml-1 text-sm text-ink-soft">{members.length} 位記帳成員</span>
        </div>
      </div>

      {/* 分頁 */}
      <div className="flex gap-2 border-b border-line bg-white px-4 py-2.5">
        {TABS.map((t) => {
          const active = t === tab
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-full px-4 py-1.5 text-sm font-bold"
              style={active ? { background: '#1098f0', color: '#fff' } : { background: '#f0f2f5', color: '#5b6675' }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {tab === '花費明細' && (
        <ExpenseList
          expenses={state.expenses}
          total={total}
          onTap={setActExp}
        />
      )}
      {tab === '結算' && (
        <Settlement byMember={byMember} total={total} settlements={settlements} hasExpense={state.expenses.length > 0} />
      )}
      {tab === '預算估算' && <BudgetView />}

      {/* 新增花費 FAB（三個分頁都顯示） */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="pointer-events-auto absolute bottom-[calc(84px+env(safe-area-inset-bottom))] right-5 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-float active:scale-95"
          style={{ background: '#1098f0', transition: 'transform .12s' }}
          aria-label="新增花費"
        >
          <Plus size={28} />
        </button>
      </div>

      <AddExpense
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(expense) => dispatch({ type: 'ADD_EXPENSE', expense })}
      />

      {/* 花費動作 */}
      <Sheet open={!!actExp} onClose={() => setActExp(null)} title={actExp?.title || ''}>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'DELETE_EXPENSE', id: actExp.id })
            setActExp(null)
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left active:bg-canvas"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-soft">
            <Trash2 size={18} color="#ff4d57" />
          </span>
          <span className="font-semibold text-coral">刪除這筆花費</span>
        </button>
      </Sheet>
    </div>
  )
}

function ExpenseList({ expenses, total, onTap }) {
  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center px-8 pt-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
          <Receipt size={38} color="#1098f0" />
        </span>
        <p className="mt-4 font-bold text-ink">還沒有任何花費</p>
        <p className="mt-1 text-sm text-ink-soft">點右下角「＋」建立第一筆行程花費吧</p>
      </div>
    )
  }
  return (
    <div className="px-4 pb-28 pt-3">
      <div className="mb-3 rounded-2xl bg-white p-4 text-center shadow-card">
        <p className="text-sm text-ink-soft">目前總花費</p>
        <p className="text-2xl font-black text-ink">{formatNT(total)}</p>
      </div>
      <div className="space-y-2">
        {expenses.map((e) => {
          const meta = getExpenseMeta(e.category)
          const Icon = meta.Icon
          const payer = memberById[e.payerId]
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onTap(e)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-card active:scale-[0.99]"
              style={{ transition: 'transform .12s' }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: meta.tint + '1a' }}>
                <Icon size={20} color={meta.tint} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{e.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-soft">
                  {payer && <Avatar member={payer} size={16} />}
                  {payer?.name} 付・{expenseHeadcount(e)} 人分攤
                </p>
              </div>
              <span className="font-black text-ink">{formatNT(e.amount)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Settlement({ byMember, total, settlements, hasExpense }) {
  if (!hasExpense) {
    return (
      <div className="flex flex-col items-center px-8 pt-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
          <Receipt size={38} color="#1098f0" />
        </span>
        <p className="mt-4 font-bold text-ink">尚無資料可結算</p>
        <p className="mt-1 text-sm text-ink-soft">先到「花費明細」新增幾筆花費</p>
      </div>
    )
  }
  return (
    <div className="px-4 pb-28 pt-3">
      {/* 每人收支 */}
      <p className="mb-2 px-1 text-sm font-bold text-ink">每人收支</p>
      <div className="space-y-2">
        {members.map((m) => {
          const b = byMember[m.id]
          const net = Math.round(b.net)
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <Avatar member={m} size={38} />
              <div className="flex-1">
                <p className="font-bold text-ink">{m.name}</p>
                <p className="text-xs text-ink-soft">
                  已付 {formatNT(b.paid)}・分攤 {formatNT(b.share)}
                </p>
              </div>
              <div className="text-right">
                {net === 0 ? (
                  <span className="text-sm font-medium text-ink-faint">已結清</span>
                ) : net > 0 ? (
                  <>
                    <p className="text-xs text-ink-soft">應收回</p>
                    <p className="font-black text-[#22a06b]">{formatNT(net)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-ink-soft">應付出</p>
                    <p className="font-black text-coral">{formatNT(-net)}</p>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 建議付款 */}
      <p className="mb-2 mt-5 px-1 text-sm font-bold text-ink">建議這樣還款（最少筆數）</p>
      {settlements.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-card">
          <PartyPopper size={28} color="#22a06b" />
          <p className="mt-2 font-bold text-ink">大家都結清了！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {settlements.map((t, i) => {
            const from = memberById[t.from]
            const to = memberById[t.to]
            return (
              <div key={i} className="flex items-center gap-2 rounded-2xl bg-white p-3.5 shadow-card">
                <Avatar member={from} size={34} />
                <span className="text-sm font-medium text-ink">{from.name}</span>
                <ArrowRight size={18} className="mx-1 text-ink-faint" />
                <Avatar member={to} size={34} />
                <span className="text-sm font-medium text-ink">{to.name}</span>
                <span className="ml-auto font-black text-brand">{formatNT(t.amount)}</span>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-ink-faint">本頁依「花費明細」即時計算・總額 {formatNT(total)}</p>
    </div>
  )
}

function BudgetView() {
  return (
    <div className="px-4 pb-28 pt-3">
      <p className="mb-2 px-1 text-xs text-ink-faint">以下為行程規劃時的預算估算（取自 Excel），實際花費請看「花費明細」。</p>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Avatar member={m} size={38} />
              <div className="flex-1">
                <p className="font-bold text-ink">{m.name}</p>
                <p className="text-xs text-ink-soft">{m.sub}・{m.days} 天</p>
              </div>
              <p className="text-lg font-black text-ink">{formatNT(memberBudgetTotal(m.id))}</p>
            </div>
            <div className="mt-3 space-y-1 border-t border-line pt-3">
              {budgetCategories.map((c) => {
                const v = c.amounts[m.id]
                return (
                  <div key={c.key} className="flex justify-between text-[13px]">
                    <span className="text-ink-soft">{c.label}</span>
                    <span className={v ? 'font-medium text-ink' : 'text-ink-faint'}>
                      {v ? formatNT(v) : '未參加'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="mb-1.5 text-sm font-bold text-ink">計算說明</p>
        {budgetNotes.map((n, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-ink-soft">・{n}</p>
        ))}
      </div>
    </div>
  )
}
