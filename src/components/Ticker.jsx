// LiveMarketPulse.jsx — replaces scrolling Ticker
// S00 decision B: static 5-column strip, always visible, pinned top of every page
// 5 metrics: XAU/USD · XAG/USD · KRW/USD · 김치 프리미엄 (model) · 금/KOSPI 비율
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../lib/index.jsx';

const KR_PREMIUM   = 0.20;
const AU_PREMIUM   = 0.08;
const OZ_IN_GRAMS  = 31.1035;
const KOSPI_REF    = 2620; // static reference — label as 참고

function flash(el) {
  if (!el) return;
  el.style.transition = 'none';
  el.style.color = '#e3c187';
  setTimeout(() => { el.style.transition = 'color 0.6s ease'; el.style.color = ''; }, 80);
}

export default function Ticker({ lang, prices, krwRate, loaded }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [showTip, setShowTip] = useState(false);
  const prevRef = useRef({});
  const valRefs = useRef({});

  const goldSpot = prices?.gold  || 0;
  const silvSpot = prices?.silver || 0;
  const rate     = krwRate || 0;
  const kimchi   = goldSpot && rate
    ? ((KR_PREMIUM - AU_PREMIUM) / (1 + KR_PREMIUM) * 100).toFixed(1)
    : null;
  const goldKospi = goldSpot ? (goldSpot / KOSPI_REF).toFixed(2) : null;

  // Flash value cells on price change
  useEffect(() => {
    const prev = prevRef.current;
    const keys = { gold: goldSpot, silver: silvSpot, krw: rate };
    Object.entries(keys).forEach(([k, v]) => {
      if (prev[k] && prev[k] !== v) flash(valRefs.current[k]);
    });
    prevRef.current = { ...keys };
  }, [goldSpot, silvSpot, rate]);

  const METRICS = [
    {
      key: 'gold',
      label: ko ? '금 현물가 (XAU/USD)' : 'Gold Spot (XAU/USD)',
      value: goldSpot ? `$${goldSpot.toFixed(2)}` : '—',
      color: '#C5A572',
    },
    {
      key: 'silver',
      label: ko ? '은 현물가 (XAG/USD)' : 'Silver Spot (XAG/USD)',
      value: silvSpot ? `$${silvSpot.toFixed(2)}` : '—',
      color: '#7dd3dc',
    },
    {
      key: 'krw',
      label: ko ? '원/달러 환율' : 'KRW/USD Rate',
      value: rate ? `₩${Math.round(rate).toLocaleString('ko-KR')}` : '—',
      color: '#f5f0e8',
    },
    {
      key: 'kimchi',
      label: ko ? '김치 프리미엄' : 'Kimchi Premium',
      value: kimchi ? `~${kimchi}%` : '—',
      color: kimchi && parseFloat(kimchi) >= 15 ? '#f87171' : kimchi && parseFloat(kimchi) >= 10 ? '#C5A572' : '#4ade80',
      tip: true,
    },
    {
      key: 'kospi',
      label: ko ? '금/KOSPI 비율' : 'Gold/KOSPI Ratio',
      value: goldKospi ? `${goldKospi}x` : '—',
      color: '#8a7d6b',
      note: ko ? 'KOSPI 참고' : 'KOSPI ref.',
    },
  ];

  const COLS = isMobile ? 3 : 5; // show 3 on mobile: gold, krw, kimchi
  const shown = isMobile ? [METRICS[0], METRICS[2], METRICS[3]] : METRICS;

  return (
    <div style={{
      background: '#0d0b07',
      borderBottom: '1px solid rgba(197,165,114,0.1)',
      position: 'relative',
      zIndex: 50,
      height: 56,
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Tooltip */}
      {showTip && (
        <div style={{
          position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', border: '1px solid rgba(197,165,114,0.25)',
          padding: '8px 14px', zIndex: 100, whiteSpace: 'nowrap',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#8a7d6b',
          lineHeight: 1.6,
        }}>
          {ko
            ? '국내 소매가 기준 모델 추정치. LBMA 현물가 대비 구조적 프리미엄.'
            : 'Model estimate vs LBMA spot. Based on domestic retail structural premium.'}
        </div>
      )}

      <div className="aurum-container" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        height: '100%',
      }}>
        {shown.map((m, i) => (
          <div key={m.key} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%',
            borderRight: i < shown.length - 1 ? '1px solid rgba(197,165,114,0.06)' : 'none',
            padding: '0 8px',
            cursor: m.tip ? 'pointer' : 'default',
          }}
            onClick={m.tip ? () => setShowTip(s => !s) : undefined}
          >
            <div
              ref={el => valRefs.current[m.key] = el}
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: isMobile ? 13 : 15,
                fontWeight: 700,
                color: loaded ? m.color : '#333',
                lineHeight: 1,
                marginBottom: 3,
                transition: 'color 0.6s ease',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {loaded ? m.value : <span style={{ background: '#222', borderRadius: 2, width: 60, height: 12, display: 'inline-block', animation: 'shimmer 1.5s ease-in-out infinite' }} />}
              {m.tip && <span style={{ fontSize: 9, color: '#555', border: '1px solid #333', padding: '0 4px', marginLeft: 2 }}>?</span>}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 9,
              color: '#555',
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}>
              {m.note || m.label}
            </div>
          </div>
        ))}
      </div>

      {/* LIVE indicator */}
      <div style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 5,
        pointerEvents: 'none',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: loaded ? '#4ade80' : '#333',
          display: 'inline-block',
          boxShadow: loaded ? '0 0 6px #4ade80' : 'none',
          animation: loaded ? 'pulse 2s ease-in-out infinite' : 'none',
        }}/>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: loaded ? '#4ade80' : '#333', letterSpacing: '0.1em' }}>
          LIVE
        </span>
      </div>
    </div>
  );
}
