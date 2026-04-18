// api/prices.js — Vercel serverless
// Primary: metals.live (free, no auth, returns {gold, silver, platinum})
// Fallback: Yahoo Finance v8/chart
// KRW rate: open.er-api.com

const FALLBACK = { gold: 3342.80, silver: 32.90, platinum: 980.00 };
const FALLBACK_KRW = 1368.00;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  const prices = { ...FALLBACK };
  const changes = {};
  let krwRate = FALLBACK_KRW;
  let source = 'fallback';

  // ── Fetch metals prices (metals.live primary, Yahoo fallback) ──────────────
  try {
    const mlRes = await fetch('https://metals.live/v1/spot', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (mlRes.ok) {
      const ml = await mlRes.json();
      if (ml.gold > 0) { prices.gold = ml.gold; source = 'metals.live'; }
      if (ml.silver > 0) prices.silver = ml.silver;
      if (ml.platinum > 0) prices.platinum = ml.platinum;
    }
  } catch (_) {
    // metals.live failed — try Yahoo Finance
    try {
      for (const [sym, metal] of [['GC=F','gold'],['SI=F','silver']]) {
        for (const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com']) {
          try {
            const url = `https://${host}/v8/finance/chart/${encodeURIComponent(sym)}?interval=1m&range=1d`;
            const r = await fetch(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json', 'Referer': 'https://finance.yahoo.com/' },
              signal: AbortSignal.timeout(5000),
            });
            if (!r.ok) continue;
            const data = await r.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta?.regularMarketPrice > 0) {
              prices[metal] = Math.round(meta.regularMarketPrice * 100) / 100;
              const prev = meta.chartPreviousClose || meta.previousClose;
              if (prev > 0 && prev !== prices[metal]) {
                changes[metal] = ((prices[metal] - prev) / prev * 100).toFixed(2);
              }
              source = `yahoo-${host.split('.')[0]}`;
              break;
            }
          } catch (_) { continue; }
        }
      }
    } catch (_) { /* both failed, use fallback */ }
  }

  // ── KRW exchange rate ──────────────────────────────────────────────────────
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    if (fxRes.ok) {
      const fx = await fxRes.json();
      if (fx?.rates?.KRW > 0) krwRate = Math.round(fx.rates.KRW * 100) / 100;
    }
  } catch (_) { /* use fallback KRW */ }

  res.status(200).json({
    prices,
    changes,
    krwRate,
    ts: Date.now(),
    fallback: source === 'fallback',
    source,
  });
}
