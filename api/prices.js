// api/prices.js — Vercel serverless function
// Fetches gold/silver/platinum spot prices from Yahoo Finance + KRW rate from Exchange Rate API
// No API keys required. Deploy to Vercel as-is.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30');

  const FALLBACK = { gold: 3342.80, silver: 32.90, platinum: 980.00 };
  const FALLBACK_KRW = 1368.00;

  try {
    const [priceRes, fxRes] = await Promise.allSettled([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF,SI%3DF,PL%3DF?interval=1d&range=2d', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ]);

    let prices = { ...FALLBACK };
    let changes = {};
    let krwRate = FALLBACK_KRW;

    // Parse Yahoo Finance
    if (priceRes.status === 'fulfilled' && priceRes.value.ok) {
      const data = await priceRes.value.json();
      const results = data?.quoteResponse?.result || [];
      const symbolMap = { 'GC=F': 'gold', 'SI=F': 'silver', 'PL=F': 'platinum' };
      for (const item of results) {
        const metal = symbolMap[item.symbol];
        if (!metal) continue;
        const meta = item.meta || {};
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        if (currentPrice) {
          prices[metal] = currentPrice;
          if (prevClose && prevClose > 0) {
            changes[metal] = ((currentPrice - prevClose) / prevClose * 100).toFixed(2);
          }
        }
      }
    }

    // Parse FX
    if (fxRes.status === 'fulfilled' && fxRes.value.ok) {
      const fxData = await fxRes.value.json();
      const rate = fxData?.rates?.KRW;
      if (rate && rate > 0) krwRate = rate;
    }

    res.status(200).json({ prices, changes, krwRate, ts: Date.now(), sources: ['yahoo', 'er-api'] });
  } catch (err) {
    res.status(200).json({ prices: FALLBACK, changes: {}, krwRate: FALLBACK_KRW, ts: Date.now(), fallback: true });
  }
}
