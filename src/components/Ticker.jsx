import { T, fUSD, fKRW, KR_GOLD_PREMIUM, AURUM_GOLD_PREMIUM } from '../lib/index.jsx';

export default function Ticker({ prices, krwRate, dailyChanges, lang }) {
  const ko = lang === 'ko';
  const goldKRW = prices.gold * krwRate;
  const goldPerG = goldKRW / 31.1035;
  const krxPrice = goldKRW * (1 + KR_GOLD_PREMIUM);
  const aurumPrice = prices.gold * (1 + AURUM_GOLD_PREMIUM) * krwRate;

  const items = [
    { label:'GOLD',    value: fUSD(prices.gold),   change: dailyChanges.gold,     up: parseFloat(dailyChanges.gold||0) >= 0 },
    { label:'SILVER',  value: fUSD(prices.silver),  change: dailyChanges.silver,   up: parseFloat(dailyChanges.silver||0) >= 0 },
    { label:'USD/KRW', value: `₩${krwRate.toFixed(0)}`, change: dailyChanges.krw, up: parseFloat(dailyChanges.krw||0) >= 0 },
    { label:'금 (KRW/g)', value: `₩${Math.round(goldPerG).toLocaleString()}`, change:null, up:true },
    { label:'KRX 프리미엄', value:'+' + ((KR_GOLD_PREMIUM)*100).toFixed(1)+'%', change:null, up:false },
    { label:'AURUM 프리미엄', value:'+' + (AURUM_GOLD_PREMIUM*100).toFixed(1)+'%', change:null, up:true },
  ];

  return (
    <div style={{
      background:T.bg2, borderBottom:`1px solid ${T.border}`,
      padding:'8px 48px', display:'flex', gap:40, overflowX:'auto',
      scrollbarWidth:'none', msOverflowStyle:'none', flexShrink:0,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
          <span style={{ fontFamily:T.mono, fontSize:10, letterSpacing:'0.12em', color:T.textMuted, textTransform:'uppercase' }}>{item.label}</span>
          <span style={{ fontFamily:T.mono, fontSize:12, color:T.text, fontWeight:600 }}>{item.value}</span>
          {item.change && (
            <span style={{ fontFamily:T.mono, fontSize:11, color: item.up ? T.green : T.red }}>
              {parseFloat(item.change) >= 0 ? '+' : ''}{item.change}%
            </span>
          )}
          {!item.change && item.up !== null && (
            <span style={{ fontFamily:T.mono, fontSize:10, color: item.up ? T.green : T.red }}>●</span>
          )}
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginLeft:'auto' }}>
        <span className="live-dot" />
        <span style={{ fontFamily:T.mono, fontSize:9, letterSpacing:'0.2em', color:T.textMuted }}>LIVE</span>
      </div>
    </div>
  );
}
