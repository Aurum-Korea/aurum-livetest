import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// CagrToggle · canonical 5-button growth rate selector
//
// Ported from /mnt/user-data/outputs/AurumProjectionMath.jsx (v1.2 spec).
// Appears on EVERY calculator site-wide:
//   - /founders GateSimulator
//   - /goldpath hero calculator
//   - /analytics §VII Accumulator
//
// Preset structure:
//   5%  conservative
//   10% default ★
//   15% bullish
//   20% recent
//   25% very bull
//
// Props:
//   value    (number 0–1)   current CAGR, e.g. 0.10
//   onChange (fn)           called with new preset value
//   compact  (bool)         hide tag label, smaller height — for tight spaces
// ═══════════════════════════════════════════════════════════════════════

export const CAGR_PRESETS = [
  { v: 0.05, lbl: '5%',  tag: 'conservative' },
  { v: 0.10, lbl: '10%', tag: 'default', star: true },
  { v: 0.15, lbl: '15%', tag: 'bullish' },
  { v: 0.20, lbl: '20%', tag: 'recent' },
  { v: 0.25, lbl: '25%', tag: 'very bull' },
];

export const DEFAULT_CAGR = 0.10;

export default function CagrToggle({ value, onChange, compact = false }) {
  return (
    <div className="cagr-root">
      <div style={{
        fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em',
        marginBottom: 10, display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', flexWrap: 'wrap', gap: 4,
      }}>
        <span>연간 금값 성장률 · ANNUAL GOLD CAGR</span>
        <span style={{ color: T.gold, fontSize: 10 }}>· {(value * 100).toFixed(0)}% 선택됨</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${CAGR_PRESETS.length}, 1fr)`,
        gap: 4,
      }}>
        {CAGR_PRESETS.map(p => {
          const active = value === p.v;
          return (
            <button
              key={p.v}
              onClick={() => onChange(p.v)}
              type="button"
              style={{
                height: compact ? 36 : 52,
                padding: 0,
                border: `1px solid ${active ? (T.goldBorderS || T.gold) : T.border}`,
                background: active ? (T.goldGlow || 'rgba(197,165,114,0.08)') : 'transparent',
                color: active ? T.gold : T.sub,
                fontFamily: T.mono,
                fontSize: compact ? 12 : 13,
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                lineHeight: 1,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {p.lbl}
                {p.star && active && (
                  <span style={{ fontSize: 9, color: T.goldB || T.gold, marginLeft: 1 }}>★</span>
                )}
              </span>
              {!compact && (
                <span className="cagr-tag" style={{
                  fontSize: 8,
                  color: active ? 'inherit' : T.muted,
                  opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {p.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 560px) {
          .cagr-root .cagr-tag { display: none !important; }
          .cagr-root button { height: 40px !important; }
        }
      `}</style>
    </div>
  );
}
