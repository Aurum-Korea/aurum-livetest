// Ticker.jsx — CSS marquee on desktop, horizontal scroll on mobile
import { useEffect, useState } from 'react';
import { useIsMobile } from '../lib/index.jsx';

const KR_GOLD_PREMIUM    = 0.20;
const AURUM_GOLD_PREMIUM = 0.08;
const OZ_IN_GRAMS  = 31.1035;
const DON_IN_GRAMS = 3.75;

export default function Ticker({ lang, prices, krwRate, dailyChanges }) {
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ch = key => {
      const v = parseFloat(dailyChanges?.[key] || 0);
      return dailyChanges?.[key] ? `${v >= 0 ? '+' : ''}${dailyChanges[key]}%` : '—';
    };
    const up = key => parseFloat(dailyChanges?.[key] || 0) >= 0;

    const donPrice = Math.round(
      (prices.gold || 3342) * krwRate * (1 + KR_GOLD_PREMIUM) / OZ_IN_GRAMS * DON_IN_GRAMS
    );

    setItems([
      { label: lang === 'ko' ? '금'  : 'XAU/USD', price: `$${(prices.gold || 3342).toFixed(2)}`,    change: ch('gold'),   up: up('gold')   },
      { label: lang === 'ko' ? '은'  : 'XAG/USD', price: `$${(prices.silver || 32.15).toFixed(2)}`, change: ch('silver'), up: up('silver') },
      // FIX: platinum removed
      { label: 'USD/KRW', price: `₩${(krwRate).toFixed(1)}`, change: '—', up: true, noChange: true },
      {
        // FIX: label changed to 한국실금가 1돈 / KR Gold 1-don (no VAT mention)
        label: lang === 'ko' ? '한국실금가 1돈' : 'KR Gold 1-don',
        price: `₩${donPrice.toLocaleString('ko-KR')}`,
        change: '—', up: true, noChange: true,
      },
    ]);
  }, [lang, prices, krwRate, dailyChanges]);

  const TickerItem = ({ item, isMob }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isMob ? 4 : 8,
      padding: isMob ? '0 12px' : '0 28px',
      borderRight: '1px solid rgba(197,165,114,0.10)',
      whiteSpace: 'nowrap', flexShrink: 0,
      height: isMob ? 'auto' : 36,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: isMob ? 9 : 10, color: '#a09080', letterSpacing: isMob ? 1 : 2, textTransform: 'uppercase' }}>{item.label}</span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMob ? 10 : 12, color: '#f5f0e8', fontWeight: 600 }}>{item.price}</span>
      {!item.noChange && item.change !== '—' && (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMob ? 8 : 10, color: item.up ? '#4ade80' : '#f87171' }}>{item.change}</span>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', padding: '7px 0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: 0 }}>
        {items.map((item, i) => <TickerItem key={i} item={item} isMob />)}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', height: 36, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 2, height: '100%', background: 'linear-gradient(180deg,#c5a572,#8a6914)', zIndex: 2, flexShrink: 0 }} />
      <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 5, background: '#0d0d0d', paddingLeft: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#4ade80', letterSpacing: 1 }}>LIVE</span>
      </div>
      <div className="ticker-track">
        {items.map((item, i) => <TickerItem key={`a-${i}`} item={item} />)}
        {items.map((item, i) => <TickerItem key={`b-${i}`} item={item} />)}
      </div>
    </div>
  );
}
