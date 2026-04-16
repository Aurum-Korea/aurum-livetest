import { T, fUSD, fKRW, KR_GOLD_PREMIUM, AURUM_GOLD_PREMIUM, DON_IN_GRAMS, OZ_IN_GRAMS } from '../lib/index.jsx';

export default function Ticker({ prices, krwRate, dailyChanges, lang }) {
  const goldSpot   = prices.gold   || 3342.80;
  const silverSpot = prices.silver || 32.90;

  // Kimchi price (Korean retail = spot × 1.20) in KRW/oz
  const kimchiKRW  = Math.round(goldSpot * (1 + KR_GOLD_PREMIUM) * krwRate);
  // Aurum gold per 돈 (3.75g) in KRW — key Korean unit
  const donAurumKRW = Math.round(goldSpot * (1 + AURUM_GOLD_PREMIUM) * krwRate / OZ_IN_GRAMS * DON_IN_GRAMS);
  // Gold per gram at Aurum pricing
  const goldGramAurumKRW = Math.round(goldSpot * (1 + AURUM_GOLD_PREMIUM) * krwRate / OZ_IN_GRAMS);

  const goldChange   = parseFloat(dailyChanges.gold   || 0);
  const silverChange = parseFloat(dailyChanges.silver || 0);

  const items = [
    { label:'금 현물가',      value: fUSD(goldSpot),          change: dailyChanges.gold,   up: goldChange >= 0 },
    { label:'은 현물가',      value: fUSD(silverSpot),        change: dailyChanges.silver, up: silverChange >= 0 },
    { label:'USD/KRW',       value: `₩${Math.round(krwRate).toLocaleString()}`,  change: null },
    { label:'한국실금가',    value: `₩${kimchiKRW.toLocaleString()}/oz`,       change: dailyChanges.gold, up: goldChange >= 0 },
    { label:'금 1돈 (Aurum)', value: `₩${donAurumKRW.toLocaleString()}`,        change: null },
  ];

  return (
    <div style={{
      background: T.bg2, borderBottom: `1px solid ${T.border}`,
      padding: '7px 40px', display: 'flex', gap: 36, overflowX: 'auto',
      scrollbarWidth: 'none', msOverflowStyle: 'none', flexShrink: 0,
      alignItems: 'center',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: T.textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {item.value}
          </span>
          {item.change != null && (
            <span style={{ fontFamily: T.mono, fontSize: 10, color: item.up ? T.green : T.red, whiteSpace: 'nowrap' }}>
              {parseFloat(item.change) >= 0 ? '+' : ''}{item.change}%
            </span>
          )}
          {i < items.length - 1 && (
            <span style={{ color: T.border, marginLeft: 4, fontSize: 10 }}>|</span>
          )}
        </div>
      ))}

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
        <span className="live-dot" />
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: T.goldDim, textTransform: 'uppercase' }}>LIVE</span>
      </div>
    </div>
  );
}
