// Deal + Advisor storage — Upstash Redis via REST API (same pattern as storage.js).
// No SDK dependency — uses raw fetch so package.json stays lean.
//
// Env vars (same as storage.js, shared Redis instance):
//   KV_REST_API_URL   (or UPSTASH_REDIS_REST_URL)
//   KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)

const URL_  = () => process.env.KV_REST_API_URL  || process.env.UPSTASH_REDIS_REST_URL  || '';
const TOK_  = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

let _mem = null;
function memStore() { if (_mem) return _mem; _mem = { kv: new Map() }; return _mem; }
let _warnedNoKv = false;

async function call(cmd) {
  const url = URL_(); const tok = TOK_();
  if (!url || !tok) {
    if (!_warnedNoKv) { console.warn('[aurum/deal-storage] KV not configured — in-memory only'); _warnedNoKv = true; }
    return memCall(cmd);
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); throw new Error(`Upstash error ${r.status}: ${t}`); }
  return (await r.json()).result;
}

function memCall(cmd) {
  const s = memStore(); const [op, ...a] = cmd;
  switch (op.toUpperCase()) {
    case 'SET': s.kv.set(a[0], a[1]); return 'OK';
    case 'GET': return s.kv.get(a[0]) ?? null;
    case 'DEL': { const had = s.kv.delete(a[0]); return had ? 1 : 0; }
    default: throw new Error('mem store: unsupported ' + op);
  }
}

function parse(v) {
  if (!v) return null;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
  return v;
}

async function kget(key) { return parse(await call(['GET', key])); }
async function kset(key, val) { return call(['SET', key, JSON.stringify(val)]); }

// ── Deals ──────────────────────────────────────────────────────────────────
export async function getDeal(id) { return kget('deal:' + id); }
export async function saveDeal(deal) {
  await kset('deal:' + deal.id, deal);
  const ids = (await kget('deals:all')) || [];
  if (!ids.includes(deal.id)) { ids.unshift(deal.id); await kset('deals:all', ids); }
}
export async function listDeals() {
  const ids = (await kget('deals:all')) || [];
  const deals = await Promise.all(ids.map(id => getDeal(id)));
  return deals.filter(Boolean).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}
export async function nextDealId() {
  const d = new Date();
  const prefix = 'DL-' + String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') + '-';
  const ids = (await kget('deals:all')) || [];
  const seq = String(ids.filter(i => i.startsWith(prefix)).length + 1).padStart(4, '0');
  return prefix + seq;
}

// ── Advisors ──────────────────────────────────────────────────────────────
export async function getAdvisor(id) { return kget('advisor:' + id); }
export async function getAdvisorByEmail(email) {
  const id = await kget('advisor_email:' + String(email || '').trim().toLowerCase());
  return id ? getAdvisor(id) : null;
}
export async function saveAdvisor(advisor) {
  await kset('advisor:' + advisor.id, advisor);
  await call(['SET', 'advisor_email:' + String(advisor.email || '').trim().toLowerCase(), advisor.id]);
  const ids = (await kget('advisors:all')) || [];
  if (!ids.includes(advisor.id)) { ids.push(advisor.id); await kset('advisors:all', ids); }
}
export async function listAdvisors() {
  const ids = (await kget('advisors:all')) || [];
  const advisors = await Promise.all(ids.map(id => getAdvisor(id)));
  return advisors.filter(Boolean);
}
