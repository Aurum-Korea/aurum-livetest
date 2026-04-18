// Ticker.jsx — CSS marquee on desktop, horizontal scroll on mobile
// M-04: price-flash-up/down classes on tick change
// M-05: skeleton shimmer while !loaded
import { useEffect, useState, useRef } from 'react';
import { useIsMobile } from '../lib/index.jsx';

const KR_GOLD_PREMIUM    = 0.20;
const OZ_IN_GRAMS  = 31.1035;
const DON_IN_GRAMS = 3.75;

export default function Ticker({ lang, prices, krwRate, dailyChanges, loaded }) {
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const prevPricesRef = useRef({});
  const [flashClass, setFlashClass] = useState({});

  useEffect(() => {
    const ch = key => {
      const v = parseFloat(dailyChanges?.[key] || 0);
      return dailyChanges?.[key] ? `${v >= 0 ? '+' : ''}${dailyChanges[key]}%` : '—';
    };
    const up = key => parseFloat(dailyChanges?.[key] || 0) >= 0;

    // M-04: detect price changes for flash
    const newFlash = {};
    ['gold','silver'].forEach(key => {
      const prev = prevPricesRef.current[key];
      const curr = prices[key];
      if (prev !== undefined && curr !== prev) {
        newFlash[key] = curr > prev ? 'price-up' : 'price-down';
      }
    });
    if (Object.keys(newFlash).length) {
      setFlashClass(newFlash);
      setTimeout(() => setFlashClass({}), 850);
    }
    prevPricesRef.current = { ...prices };

    const donPrice = Math.round(
      (prices.gold || 3342) * krwRate * (1 + KR_GOLD_PREMIUM) / OZ_IN_GRAMS * DON_IN_GRAMS
    );

    setItems([
      { label: lang === 'ko' ? '금'  : 'XAU/USD', price: `$${(prices.gold || 3342).toFixed(2)}`,    change: ch('gold'),   up: up('gold'),   flashKey: 'gold'   },
      { label: lang === 'ko' ? '은'  : 'XAG/USD', price: `$${(prices.silver || 32.15).toFixed(2)}`, change: ch('silver'), up: up('silver'), flashKey: 'silver' },
      { label: 'USD/KRW', price: `₩${(krwRate).toFixed(1)}`, change: '—', up: true, noChange: true },
      {
        label: lang === 'ko' ? '한국실금가 1돈' : 'KR Gold 1-don',
        price: `₩${donPrice.toLocaleString('ko-KR')}`,
        change: '—', up: true, noChange: true,
      },
      {
        label: lang === 'ko' ? 'KRX 금 (원/g)' : 'KRX Gold/g',
        price: `₩${Math.round((prices.gold || 3342) * krwRate / OZ_IN_GRAMS).toLocaleString('ko-KR')}/g`,
        change: '—', up: true, noChange: true,
      },
    ]);
  }, [lang, prices, krwRate, dailyChanges]);

  const TickerItem = ({ item, isMob }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isMob ? 4 : 8,
      padding: isMob ? '0 14px' : '0 36px',
      borderRight: '1px solid rgba(197,165,114,0.10)',
      whiteSpace: 'nowrap', flexShrink: 0,
      height: isMob ? 'auto' : 36,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#8a7d6b', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{item.label}</span>
      {/* M-05: skeleton while not loaded */}
      {!loaded
        ? <span className="price-skeleton" />
        : <span className={flashClass[item.flashKey] || ''} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#f5f0e8', fontWeight: 600 }}>{item.price}</span>
      }
      {loaded && !item.noChange && item.change !== '—' && (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: item.up ? '#4ade80' : '#f87171' }}>{item.change}</span>
      )}
    </div>
  );

  // Live pill dot — green per T-05
  const LivePill = () => (
    <div style={{
      width: 52, height: 36, flexShrink: 0,
      background: '#0d0b08',
      borderRight: '1px solid rgba(197,165,114,0.20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 5, zIndex: 2,
    }}>
      <span className="live-dot" />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#c5a572', letterSpacing: '0.12em' }}>LIVE</span>
    </div>
  );

  if (isMobile) return (
    <div style={{ background: '#0d0b08', borderBottom: '1px solid #1e1e1e', padding: '7px 0', overflow: 'hidden' }}>
      <style>{`.aurum-tmob::-webkit-scrollbar{display:none}`}</style>
      <div className="aurum-tmob" style={{ display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', gap: 0 }}>
        {items.map((item, i) => <TickerItem key={i} item={item} isMob />)}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0d0b08', borderBottom: '1px solid #1e1e1e', height: 36 }}>
      <div className="aurum-container" style={{ height: 36, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <LivePill />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div className="ticker-track">
            {items.map((item, i) => <TickerItem key={`a-${i}`} item={item} />)}
            {items.map((item, i) => <TickerItem key={`b-${i}`} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
