// Cloudflare Worker：全團共用的行程/花費同步 API（資料存在 KV）
// 路由 /api/state 由本 Worker 處理（wrangler 設 run_worker_first），其餘走靜態網站。

function json(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,PUT,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  })
}

const cleanCode = (c) => (c || 'penghu').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'penghu'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/state') {
      if (request.method === 'OPTIONS') return json({ ok: true })

      const key = 'state:' + cleanCode(url.searchParams.get('code'))

      // KV 未綁定時，回報停用，前端會退回單機模式
      if (!env.TRIP) return json({ error: 'kv-unbound' }, 503)

      if (request.method === 'GET') {
        const raw = await env.TRIP.get(key)
        return json(raw || JSON.stringify({ data: null, rev: 0 }))
      }

      if (request.method === 'PUT') {
        const incoming = await request.json().catch(() => null)
        if (!incoming || typeof incoming.rev !== 'number') return json({ error: 'bad-body' }, 400)
        const raw = await env.TRIP.get(key)
        const cur = raw ? JSON.parse(raw) : { data: null, rev: 0 }
        if (incoming.rev !== cur.rev) {
          // 版本不符 → 衝突，回傳最新讓前端合併重試
          return json({ ok: false, rev: cur.rev, data: cur.data }, 409)
        }
        const next = { data: incoming.data, rev: cur.rev + 1, updatedAt: Date.now() }
        await env.TRIP.put(key, JSON.stringify(next))
        return json({ ok: true, rev: next.rev })
      }

      return json({ error: 'method' }, 405)
    }

    // 非 API：交給靜態資產
    return env.ASSETS.fetch(request)
  },
}
