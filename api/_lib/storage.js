// Storage — Upstash Redis via REST API. Zero deps.
// Configure via env vars (Vercel auto-provisions these when you connect Upstash):
//   KV_REST_API_URL              (or UPSTASH_REDIS_REST_URL)
//   KV_REST_API_TOKEN            (or UPSTASH_REDIS_REST_TOKEN)
//
// Falls back to an in-memory store if env vars are missing — in serverless this
// means data lives only for the lifetime of the Lambda instance, so connect
// Upstash before relying on persistence. A warning is logged once per process.

const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOK_ = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

let _mem = null;
function memStore() {
  if (_mem) return _mem;
  _mem = { kv: new Map(), zsets: new Map() };
  return _mem;
}

let _warnedNoKv = false;
function warnNoKv() {
  if (_warnedNoKv) return;
  _warnedNoKv = true;
  console.warn(
    '[aurum] KV_REST_API_URL / KV_REST_API_TOKEN not set — using in-memory store. ' +
    'Data will NOT persist across cold starts. Connect Upstash via Vercel Storage.'
  );
}

async function call(cmd) {
  const url = URL_();
  const tok = TOK_();
  if (!url || !tok) {
    warnNoKv();
    return memCall(cmd);
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Upstash error ${r.status}: ${t}`);
  }
  const j = await r.json();
  return j.result;
}

function memCall(cmd) {
  const s = memStore();
  const [op, ...a] = cmd;
  switch (op.toUpperCase()) {
    case 'SET': s.kv.set(a[0], a[1]); return 'OK';
    case 'GET': return s.kv.get(a[0]) ?? null;
    case 'DEL': { const had = s.kv.delete(a[0]); return had ? 1 : 0; }
    case 'EXISTS': return s.kv.has(a[0]) ? 1 : 0;
    case 'INCR': { const v = (parseInt(s.kv.get(a[0]) || '0', 10) || 0) + 1; s.kv.set(a[0], String(v)); return v; }
    case 'EXPIRE': return 1; // best effort no-op in mem
    case 'ZADD': {
      const k = a[0]; const score = Number(a[1]); const member = a[2];
      const z = s.zsets.get(k) || new Map();
      z.set(member, score);
      s.zsets.set(k, z);
      return 1;
    }
    case 'ZRANGE':
    case 'ZREVRANGE': {
      const k = a[0]; const start = parseInt(a[1], 10); const stop = parseInt(a[2], 10);
      const z = s.zsets.get(k) || new Map();
      const arr = [...z.entries()].sort((x, y) => op.toUpperCase() === 'ZREVRANGE' ? y[1] - x[1] : x[1] - y[1]);
      const sliced = arr.slice(start, stop === -1 ? undefined : stop + 1);
      return sliced.map(([m]) => m);
    }
    case 'ZREM': {
      const z = s.zsets.get(a[0]) || new Map();
      z.delete(a[1]);
      return 1;
    }
    case 'ZCARD': {
      const z = s.zsets.get(a[0]) || new Map();
      return z.size;
    }
    case 'KEYS': {
      const pat = a[0];
      const re = new RegExp('^' + pat.replace(/\*/g, '.*') + '$');
      return [...s.kv.keys()].filter((k) => re.test(k));
    }
    default: throw new Error(`mem store: unsupported ${op}`);
  }
}

// ── High-level helpers ────────────────────────────────────────────────────

export async function setJSON(key, obj) {
  return call(['SET', key, JSON.stringify(obj)]);
}
export async function getJSON(key) {
  const v = await call(['GET', key]);
  if (v == null) return null;
  if (typeof v === 'object') return v; // some adapters parse for us
  try { return JSON.parse(v); } catch { return null; }
}
export async function del(key) { return call(['DEL', key]); }
export async function exists(key) { return (await call(['EXISTS', key])) === 1; }
export async function incr(key) { return call(['INCR', key]); }
export async function expire(key, seconds) { return call(['EXPIRE', key, String(seconds)]); }

export async function zAdd(key, score, member) { return call(['ZADD', key, String(score), member]); }
export async function zRevRange(key, start = 0, stop = -1) { return call(['ZREVRANGE', key, String(start), String(stop)]); }
export async function zRem(key, member) { return call(['ZREM', key, member]); }
export async function zCard(key) { return call(['ZCARD', key]); }

// Lead helpers ─────────────────────────────────────────────────────────────
const LEAD_KEY = (id) => `lead:${id}`;
const LEADS_INDEX = 'leads:index'; // sorted set, score = submitted_at unix ms
const CODE_KEY = (code) => `code:${code}`; // → leadId

export async function saveLead(lead) {
  await setJSON(LEAD_KEY(lead.id), lead);
  await zAdd(LEADS_INDEX, lead.submitted_at_ms || Date.now(), lead.id);
}
export async function getLead(id) { return getJSON(LEAD_KEY(id)); }
export async function listLeadIds(limit = 500) { return zRevRange(LEADS_INDEX, 0, limit - 1); }
export async function listLeads(limit = 500) {
  const ids = await listLeadIds(limit);
  if (!ids?.length) return [];
  const out = [];
  for (const id of ids) {
    const l = await getLead(id);
    if (l) out.push(l);
  }
  return out;
}
export async function leadsCount() { return zCard(LEADS_INDEX); }

export async function bindCode(code, leadId) { return call(['SET', CODE_KEY(code), leadId]); }
export async function leadIdForCode(code) { const v = await call(['GET', CODE_KEY(code)]); return v || null; }
export async function unbindCode(code) { return call(['DEL', CODE_KEY(code)]); }
