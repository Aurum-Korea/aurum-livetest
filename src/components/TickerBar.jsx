import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · TickerBar
// Shared across all pages · always at the very top of the stack
// ═══════════════════════════════════════════════════════════════════════

export default function TickerBar() {
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
      background: T.deepBlack || T.bg,
      borderBottom: `1px solid ${T.goldBorder}`,
      height: 30, overflow: 'hidden',
      position: 'relative',
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
            <span style={{ color: T.goldD, letterSpacing: '0.1em' }}>{t.sym}</span>
            <span style={{ color: T.text }}>{t.val}</span>
            <span style={{ color: t.up ? T.green : T.red, fontSize: 10 }}>{t.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
