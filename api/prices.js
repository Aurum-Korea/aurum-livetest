// api/prices.js — Vercel serverless
// Fetches gold/silver spot prices per-symbol from Yahoo Finance + KRW/USD from er-api
// No API keys required.

const FALLBACK = { gold: 3342.80, silver: 32.90 };
const FALLBACK_KRW = 1368.00;

async function fetchYahooSymbol(symbol) {
  // Yahoo Finance v8 chart endpoint — one symbol at a time
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=false&corsDomain=finance.yahoo.com`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://finance.yahoo.com',
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result?.meta) throw new Error(`Yahoo ${symbol}: missing chart.result[0].meta`);
  const meta = result.meta;
  // regularMarketPrice is the live price; chartPreviousClose is prev day's close
  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose;
  if (!price || price <= 0) throw new Error(`Yahoo ${symbol}: invalid price ${price}`);
  return { price, prevClose };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    // Fetch all three in parallel — each with its own URL
    const [goldRes, silverRes, fxRes] = await Promise.allSettled([
      fetchYahooSymbol('GC=F'),   // Gold futures (oz, USD)
      fetchYahooSymbol('SI=F'),   // Silver futures (oz, USD)
      fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(5000),
      }).then(r => r.ok ? r.json() : null),
    ]);

    const prices = { ...FALLBACK };
    const changes = {};

    if (goldRes.status === 'fulfilled') {
      const { price, prevClose } = goldRes.value;
      prices.gold = Math.round(price * 100) / 100;
      if (prevClose && prevClose > 0) {
        changes.gold = ((price - prevClose) / prevClose * 100).toFixed(2);
      }
    }

    if (silverRes.status === 'fulfilled') {
      const { price, prevClose } = silverRes.value;
      prices.silver = Math.round(price * 100) / 100;
      if (prevClose && prevClose > 0) {
        changes.silver = ((price - prevClose) / prevClose * 100).toFixed(2);
      }
    }

    let krwRate = FALLBACK_KRW;
    if (fxRes.status === 'fulfilled' && fxRes.value?.rates?.KRW > 0) {
      krwRate = Math.round(fxRes.value.rates.KRW * 100) / 100;
    }

    const fallback = goldRes.status === 'rejected' && silverRes.status === 'rejected';

    res.status(200).json({
      prices,
      changes,
      krwRate,
      ts: Date.now(),
      fallback,
      debug: {
        goldStatus: goldRes.status,
        silverStatus: silverRes.status,
        fxStatus: fxRes.status,
        goldError: goldRes.reason?.message,
        silverError: silverRes.reason?.message,
      },
    });
  } catch (err) {
    res.status(200).json({
      prices: FALLBACK,
      changes: {},
      krwRate: FALLBACK_KRW,
      ts: Date.now(),
      fallback: true,
      error: err.message,
    });
  }
}
