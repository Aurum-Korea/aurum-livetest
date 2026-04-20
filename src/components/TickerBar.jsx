import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · TickerBar
// Shared across all pages · always at the very top of the stack
// `palette` prop: 'gold' (default) · 'neo' (hot pink + cyan for /goldpath, /referral)
// ═══════════════════════════════════════════════════════════════════════

const PALETTES = {
  gold: {
    bg:     '#050505',           // T.deepBlack
    border: 'rgba(197,165,114,0.22)',
    sym:    '#8a7d6b',
  },
  neo: {
    bg:     '#050510',           // T_NS.deepBlack · plum black
    border: 'rgba(255,61,138,0.25)',
    sym:    '#9aa5c4',
  },
};

export default function TickerBar({ sticky = true, palette = 'gold' }) {
  const P = PALETTES[palette] || PALETTES.gold;
  const ticks = [
    { sym: 'XAUUSD',  val: '4,842.10',  d: '+0.78%',  up: true },
    { sym: 'XAUKRW',  val: '6,974,080', d: '+1.22%',  up: true },
    { sym: 'USDKRW',  val: '1,440.20',  d: '+0.31%',  up: true },
    { sym: 'KR-PREM', val: '20.1%',     d: '+0.4bp',  up: true },
    { sym: 'CB-Q3',   val: '220t',      d: '+28%',    up: true },
    { sym: 'KOSPI',   val: '2,604',     d: '−0.6%',   up: false },
    { sym: 'BTC',     val: '98,240',    d: '−1.1%',   up: false },
    { sym: 'SPX',     val: '5,912',     d: '+0.2%',   up: true },
  ];

  return (
    <div style={{
      background: P.bg,
      borderBottom: `1px solid ${P.border}`,
      height: 30, overflow: 'hidden',
      position: sticky ? 'sticky' : 'relative',
      top: sticky ? 0 : 'auto',
      zIndex: sticky ? 50 : 'auto',
    }}>
      <div style={{
        display: 'flex',
        animation: 'ticker-scroll 60s linear infinite',
        whiteSpace: 'nowrap', height: 30, alignItems: 'center',
      }}>
        {[...ticks, ...ticks, ...ticks].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 18px', height: 30,
            borderRight: '1px solid rgba(255,255,255,0.04)',
            fontFamily: T.mono, fontSize: 10.5,
          }}>
            <span style={{ color: P.sym, letterSpacing: '0.1em' }}>{t.sym}</span>
            <span style={{ color: T.text }}>{t.val}</span>
            <span style={{ color: t.up ? T.green : T.red, fontSize: 10 }}>{t.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
