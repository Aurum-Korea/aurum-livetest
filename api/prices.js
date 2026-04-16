// api/prices.js — Vercel serverless
// Gold/Silver from Yahoo Finance v8/chart (per-symbol, correct parsing)
// KRW from open.er-api.com
// No API keys required.

const FALLBACK = { gold: 3342.80, silver: 32.90 };
const FALLBACK_KRW = 1368.00;

// Try both Yahoo Finance subdomains with browser-like headers
const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

async function fetchYahoo(symbol) {
  // Try both query hosts — Yahoo sometimes throttles one
  for (const host of ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=false&corsDomain=finance.yahoo.com`;
      const res = await fetch(url, {
        headers: YF_HEADERS,
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      // v8/finance/chart returns chart.result[0].meta (NOT quoteResponse)
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) continue;
      const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
      const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
      if (price > 0) {
        return {
          price: Math.round(price * 100) / 100,
          prevClose: Math.round(prevClose * 100) / 100,
        };
      }
    } catch (_) {
      // Try next host
    }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  const [goldResult, silverResult, fxResult] = await Promise.allSettled([
    fetchYahoo('GC=F'),   // Gold futures (USD/oz)
    fetchYahoo('SI=F'),   // Silver futures (USD/oz)
    fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    }).then(r => r.ok ? r.json() : null),
  ]);

  const prices = { ...FALLBACK };
  const changes = {};

  if (goldResult.status === 'fulfilled' && goldResult.value) {
    const { price, prevClose } = goldResult.value;
    prices.gold = price;
    if (prevClose > 0 && prevClose !== price) {
      changes.gold = ((price - prevClose) / prevClose * 100).toFixed(2);
    }
  }

  if (silverResult.status === 'fulfilled' && silverResult.value) {
    const { price, prevClose } = silverResult.value;
    prices.silver = price;
    if (prevClose > 0 && prevClose !== price) {
      changes.silver = ((price - prevClose) / prevClose * 100).toFixed(2);
    }
  }

  let krwRate = FALLBACK_KRW;
  if (fxResult.status === 'fulfilled' && fxResult.value?.rates?.KRW > 0) {
    krwRate = Math.round(fxResult.value.rates.KRW * 100) / 100;
  }

  const usingFallback = goldResult.status !== 'fulfilled' || !goldResult.value;

  res.status(200).json({
    prices,
    changes,
    krwRate,
    ts: Date.now(),
    fallback: usingFallback,
    // Debug fields so you can check /api/prices directly
    _debug: {
      goldStatus: goldResult.status,
      silverStatus: silverResult.status,
      fxStatus: fxResult.status,
      goldError: goldResult.reason?.message || goldResult.value === null ? 'null result' : undefined,
    },
  });
}
