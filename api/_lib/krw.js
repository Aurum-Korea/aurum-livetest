// KRW/kg gold spot fetcher.
//
// Source: Yahoo Finance unauth endpoint for XAUKRW=X (KRW per troy ounce).
// Converts oz→kg by ×32.1507. Cached in-process for 5 minutes to avoid
// hammering Yahoo on every request to /ioi.
//
// If Yahoo is unreachable, returns the last cached value (even if stale)
// or, on cold start, a configured fallback from KRW_PER_KG_FALLBACK env.
//
// All callers receive: { krw_per_kg, fetched_at_ms, source }.
//   source ∈ 'yahoo' | 'cache-stale' | 'fallback'

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/XAUKRW=X?interval=1d&range=1d';
const OZ_PER_KG = 32.1507466;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_KRW_PER_KG = 471_000_000; // ~₩471M/kg, used only if cold-start + yahoo down

let _cache = null; // { krw_per_kg, fetched_at_ms, source }

export async function getKrwPerKg() {
  const now = Date.now();
  if (_cache && now - _cache.fetched_at_ms < CACHE_TTL_MS) return _cache;

  try {
    const r = await fetch(YAHOO_URL, {
      // small timeout — Yahoo is fast or fails fast
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Aurum) AppleWebKit/537.36' },
    });
    if (!r.ok) throw new Error(`yahoo ${r.status}`);
    const j = await r.json();
    const result = j?.chart?.result?.[0];
    const meta = result?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose;
    if (!price || typeof price !== 'number') throw new Error('no price in response');
    const krw_per_kg = Math.round(price * OZ_PER_KG);
    _cache = { krw_per_kg, fetched_at_ms: now, source: 'yahoo' };
    return _cache;
  } catch (e) {
    console.warn('[krw] yahoo fetch failed:', e.message || e);
    if (_cache) {
      // return last cached even if stale
      return { ..._cache, source: 'cache-stale' };
    }
    const fallback = parseInt(process.env.KRW_PER_KG_FALLBACK, 10) || FALLBACK_KRW_PER_KG;
    return { krw_per_kg: fallback, fetched_at_ms: now, source: 'fallback' };
  }
}
