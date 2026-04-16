// Ticker.jsx — self-contained, no new lib constants imported
// Logic matches BaseUI.jsx from aurum-test exactly
import { useEffect, useState } from 'react';
import { useIsMobile, fUSD } from '../lib/index.jsx';

// Constants inline — single source of truth (mirrors BaseUI.jsx)
const KR_GOLD_PREMIUM   = 0.20;   // 20% Korean retail (kimchi + VAT)
const AURUM_GOLD_PREMIUM = 0.08;  // 8% Aurum gold premium
const OZ_IN_GRAMS  = 31.1035;
const DON_IN_GRAMS = 3.75;

export default function Ticker({ lang, prices, krwRate, dailyChanges }) {
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ch = (key, suffix = '') => {
      const v = parseFloat(dailyChanges?.[key] || 0);
      return dailyChanges?.[key]
        ? `${v >= 0 ? '+' : ''}${dailyChanges[key]}%`
        : '—';
    };
    const up = key => parseFloat(dailyChanges?.[key] || 0) >= 0;

    // Korean retail gold per 돈 (1돈 = 3.75g) — matches BaseUI.jsx formula
    const donPrice = Math.round(
      prices.gold * krwRate * (1 + KR_GOLD_PREMIUM) / OZ_IN_GRAMS * DON_IN_GRAMS
    );

    setItems([
      { label: lang === 'ko' ? '금' : 'XAU/USD',    price: `$${prices.gold.toFixed(2)}`,    change: ch('gold'),    up: up('gold') },
      { label: lang === 'ko' ? '은' : 'XAG/USD',    price: `$${(prices.silver||32.15).toFixed(2)}`, change: ch('silver'), up: up('silver') },
      { label: lang === 'ko' ? '백금' : 'XPT/USD',  price: `$${(prices.platinum||980).toFixed(2)}`, change: ch('platinum'), up: up('platinum') },
      { label: 'USD/KRW',                             price: `₩${krwRate.toFixed(1)}`,        change: '—', up: true, noChange: true },
      { label: lang === 'ko' ? '한국금거래소 1돈 매도가' : 'KR Gold/돈',
        price: `₩${donPrice.toLocaleString('ko-KR')}`, change: '—', up: true, noChange: true },
    ]);
  }, [lang, prices, krwRate, dailyChanges]);

  // Mobile layout
  if (isMobile) return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', padding: '7px 12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: '#a09080', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#f5f0e8', fontWeight: 600 }}>{item.price}</span>
            {!item.noChange && item.change !== '—' && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: item.up ? '#4ade80' : '#f87171' }}>{item.change}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop layout — matches BaseUI.jsx TickerItem exactly
  return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', height: 36, overflowX: 'auto' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 32px', borderRight: '1px solid rgba(197,165,114,0.12)', whiteSpace: 'nowrap', height: 36 }}>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#a09080', letterSpacing: 2, textTransform: 'uppercase' }}>{item.label}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>{item.price}</span>
          {!item.noChange && item.change !== '—' && (
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: item.up ? '#4ade80' : '#f87171' }}>{item.change}</span>
          )}
        </div>
      ))}
      {/* LIVE indicator */}
      <div style={{ marginLeft: 'auto', paddingRight: 24, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#4ade80', letterSpacing: 1 }}>LIVE</span>
      </div>
    </div>
  );
}
