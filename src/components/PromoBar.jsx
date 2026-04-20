import { useState, useEffect } from 'react';
import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · PromoBar (shared)
// 
// Third row of universal top-bar stack (after Ticker, QuietNav).
// Drop countdown + live scarcity counter.
// Compact mobile: hides "ENDS IN", hides seconds, abbreviates label.
// 
// Props:
//   label         — e.g. "FOUNDERS DROP", "GOLDPATH 금환 · AGP FOUNDING"
//   shortLabel    — e.g. "LIVE" (displayed at <720px instead of full)
//   joined        — current joined count (e.g. 2848)
//   cap           — cohort cap (e.g. 5000)
//   days/hours/minutes/seconds — initial countdown values
// ═══════════════════════════════════════════════════════════════════════

export default function PromoBar({
  label = 'FOUNDERS DROP · LIVE',
  shortLabel = '● LIVE',
  joined = 2848,
  cap = 5000,
  days = 3, hours = 14, minutes = 22, seconds = 41,
  palette = 'gold',
}) {
  const [t, setT] = useState({ d: days, h: hours, m: minutes, s: seconds });

  useEffect(() => {
    const id = setInterval(() => setT(x => {
      let { d, h, m, s } = x;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d--; }
      if (d < 0) { d = 0; h = 0; m = 0; s = 0; }
      return { d, h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n) => String(n).padStart(2, '0');

  // Palette accents · 'neo' for GoldPath + Referral
  const A = palette === 'neo' ? {
    accent:   '#ff3d8a',
    accentB:  '#ff6aa8',
    accentD:  '#9aa5c4',
    gradient: 'linear-gradient(90deg, #0b0b14, #131320 50%, #0b0b14)',
  } : {
    accent:   T.gold,
    accentB:  T.goldB,
    accentD:  T.goldD,
    gradient: 'linear-gradient(90deg, #0a0806, #0d0a06 50%, #0a0806)',
  };

  return (
    <div style={{
      background: A.gradient,
      borderBottom: `1px solid ${A.accent}`,
      padding: '8px 16px',
      fontFamily: T.mono, fontSize: 11,
    }}>
      <div className="aurum-promo-inner" style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, flexWrap: 'nowrap',
      }}>
        {/* Left · label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: A.accent, boxShadow: `0 0 10px ${A.accent}`,
            animation: 'pulse 1.8s ease-in-out infinite', flexShrink: 0,
          }} />
          <span className="aurum-promo-label-full" style={{
            color: A.accent, letterSpacing: '0.24em', fontWeight: 700, fontSize: 10,
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
          <span className="aurum-promo-label-short" style={{
            color: A.accent, letterSpacing: '0.18em', fontWeight: 700, fontSize: 10,
            whiteSpace: 'nowrap', display: 'none',
          }}>
            {shortLabel}
          </span>
        </div>

        {/* Middle · countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.text }}>
          <span className="aurum-promo-desktop-only" style={{
            color: A.accentD, letterSpacing: '0.22em', fontSize: 9, whiteSpace: 'nowrap',
          }}>
            ENDS IN
          </span>
          {[[t.d, 'D'], [t.h, 'H'], [t.m, 'M'], [t.s, 'S']].map(([v, l], i) => (
            <span key={i}
              className={i === 3 ? 'aurum-promo-sec' : ''}
              style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}
            >
              <span style={{
                fontSize: 13, fontWeight: 700, color: A.accentB,
                minWidth: 20, textAlign: 'center',
              }}>
                {fmt(v)}
              </span>
              <span style={{ fontSize: 8, color: A.accentD }}>{l}</span>
            </span>
          ))}
        </div>

        {/* Right · joined/cap */}
        <div style={{
          color: T.muted, letterSpacing: '0.16em', fontSize: 10,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {joined.toLocaleString()} / {cap.toLocaleString()}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aurum-promo-label-full { display: none !important; }
          .aurum-promo-label-short { display: inline !important; }
          .aurum-promo-desktop-only { display: none !important; }
          .aurum-promo-sec { display: none !important; }
          .aurum-promo-inner { gap: 10px !important; }
        }
        @media (max-width: 380px) {
          .aurum-promo-inner { font-size: 9px !important; }
        }
      `}</style>
    </div>
  );
}
