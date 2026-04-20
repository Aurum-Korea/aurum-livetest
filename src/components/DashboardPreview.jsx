import { useState, useEffect, useMemo } from 'react';
import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// DashboardPreview · interactive customer dashboard mock
//
// Lives on /start §III "The Product" — replaces the prior brand-logo visual.
// 4-tile KPI grid + a sparkline, with a slider that simulates tier progress
// and a toggle to switch between "Starter" and "Power User" views.
//
// This is the PRODUCT preview. When a visitor sees this, they should feel:
// "ah — this is what I get when I sign up: my holdings, my tier, my sparkline."
// ═══════════════════════════════════════════════════════════════════════

const SPOT_USD_OZ = 4842.10;
const KRW_USD     = 1440.20;
const OZ_G        = 31.1035;
const AURUM_MARGIN = 1.08;
const KRW_PER_G   = (SPOT_USD_OZ * KRW_USD / OZ_G) * AURUM_MARGIN;

const TIERS = [
  { n: 'I',   nameKR: '브론즈',   nameEN: 'Bronze',    gmv: 7_200_000 },
  { n: 'II',  nameKR: '실버',     nameEN: 'Silver',    gmv: 21_600_000 },
  { n: 'III', nameKR: '골드',     nameEN: 'Gold',      gmv: 50_400_000, apex: true },
  { n: 'IV',  nameKR: '플래티넘', nameEN: 'Platinum',  gmv: 93_600_000 },
  { n: 'V',   nameKR: '소브린',   nameEN: 'Sovereign', gmv: 144_000_000 },
];

const fmt = {
  krw: (n) => '₩' + Math.round(n).toLocaleString('ko-KR'),
  krwMan: (n) => {
    if (Math.abs(n) >= 100_000_000) {
      const eok = Math.floor(n / 100_000_000);
      const man = Math.round((n % 100_000_000) / 10_000);
      return '₩' + eok + '억 ' + man.toLocaleString() + '만';
    }
    return '₩' + Math.round(n / 10_000).toLocaleString() + '만';
  },
};

// Pre-seeded sparkline (30-day simulated accumulation curve)
function seedSparkline(currentValue, days = 30) {
  const out = [];
  let v = currentValue * 0.72;
  for (let i = 0; i < days; i++) {
    const drift = (Math.random() - 0.3) * currentValue * 0.014;
    v = Math.min(currentValue, v + drift);
    out.push(v);
  }
  out[out.length - 1] = currentValue;
  return out;
}

export default function DashboardPreview() {
  // User-controlled inputs
  const [view, setView] = useState('starter');       // starter | power
  const [gmvPct, setGmvPct] = useState(0.34);        // 0–1 progress within current tier band

  // Parameters per view
  const params = view === 'starter'
    ? { monthly: 500_000, months: 14, baseGmv: 7_000_000 }
    : { monthly: 2_500_000, months: 26, baseGmv: 70_000_000 };

  // Derive KPIs
  const kpis = useMemo(() => {
    // Grams accumulated ≈ cumulative monthly / price per gram, +tier gift bump
    const grams = (params.monthly * params.months) / KRW_PER_G + (view === 'power' ? 32 : 4);
    const krwValue = grams * KRW_PER_G;

    // Current tier based on simulated GMV
    const simulatedGmv = params.baseGmv + (gmvPct * (view === 'starter' ? 18_000_000 : 80_000_000));
    let currentIdx = 0;
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (simulatedGmv >= TIERS[i].gmv) { currentIdx = i; break; }
    }
    const nextIdx = Math.min(currentIdx + 1, TIERS.length - 1);
    const current = TIERS[currentIdx];
    const next = TIERS[nextIdx];
    const progressInBand = Math.min(1, Math.max(0,
      (simulatedGmv - current.gmv) / (next.gmv - current.gmv)
    ));
    const toNext = Math.max(0, next.gmv - simulatedGmv);

    return { grams, krwValue, simulatedGmv, current, next, progressInBand, toNext };
  }, [params, gmvPct, view]);

  const sparkline = useMemo(() => seedSparkline(kpis.krwValue), [view, kpis.krwValue]);

  return (
    <div style={{
      background: T.deepBlack || '#0a0806',
      border: `1px solid ${T.goldBorder}`,
      padding: 22,
      position: 'relative',
      overflow: 'hidden',
      maxWidth: 560,
      width: '100%',
    }}>
      {/* Top gold hairline */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />

      {/* Header with LIVE + view toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: T.gold,
            boxShadow: `0 0 10px ${T.gold}`, animation: 'pulse 1.8s ease-in-out infinite'
          }} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.24em', fontWeight: 700 }}>
            MY DASHBOARD · PREVIEW
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { k: 'starter', lbl: 'Starter' },
            { k: 'power', lbl: 'Power' },
          ].map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{
              padding: '5px 12px',
              border: `1px solid ${view === v.k ? T.gold : T.border}`,
              background: view === v.k ? T.goldGlow : 'transparent',
              color: view === v.k ? T.gold : T.sub,
              fontFamily: T.mono, fontSize: 10, letterSpacing: '0.16em',
              cursor: 'pointer', fontWeight: 600,
            }}>
              {v.lbl}
            </button>
          ))}
        </div>
      </div>

      {/* 4-tile KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {/* Tile 1 · Grams */}
        <div style={{ padding: '14px 14px', background: T.bg1 || '#0d0b08', border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>
            보유 금 · Grams
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.text, fontWeight: 700, lineHeight: 1 }}>
            {kpis.grams.toFixed(2)}
            <span style={{ fontSize: 12, color: T.goldD, marginLeft: 4 }}>g</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
            {(kpis.grams / OZ_G).toFixed(3)} oz · SG vault
          </div>
        </div>

        {/* Tile 2 · KRW value */}
        <div style={{ padding: '14px 14px', background: T.bg1 || '#0d0b08', border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>
            원화 가치 · KRW
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.goldB || T.gold, fontWeight: 700, lineHeight: 1 }}>
            {fmt.krwMan(kpis.krwValue)}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.green || '#4ade80', marginTop: 4 }}>
            ● live · LBMA ref
          </div>
        </div>

        {/* Tile 3 · Tier progress — full width */}
        <div style={{ padding: '14px 14px', background: T.bg1 || '#0d0b08', border: `1px solid ${T.border}`, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              티어 진행 · Tier progress
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD }}>
              Gate {kpis.current.n} → {kpis.next.n}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, fontWeight: 600 }}>
              {kpis.current.nameKR}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD }}>
              {kpis.current.apex && '· APEX '}
              · {fmt.krwMan(kpis.simulatedGmv)} GMV
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', position: 'relative', marginBottom: 6 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${(kpis.progressInBand * 100).toFixed(1)}%`,
              background: `linear-gradient(90deg, ${T.gold}, ${T.goldB || T.gold})`,
              transition: 'width 0.5s cubic-bezier(0.2,0.8,0.2,1)',
            }} />
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, display: 'flex', justifyContent: 'space-between' }}>
            <span>{(kpis.progressInBand * 100).toFixed(0)}% to {kpis.next.nameEN}</span>
            <span>{fmt.krwMan(kpis.toNext)} 남음</span>
          </div>
        </div>

        {/* Tile 4 · Sparkline — full width */}
        <div style={{ padding: '14px 14px', background: T.bg1 || '#0d0b08', border: `1px solid ${T.border}`, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              30일 적립 · 30-day accumulation
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.green || '#4ade80' }}>
              +{(((kpis.krwValue - sparkline[0]) / sparkline[0]) * 100).toFixed(1)}%
            </span>
          </div>
          <svg viewBox="0 0 300 60" width="100%" height="60" preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="dash-spark-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={T.gold} stopOpacity="0.3" />
                <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const max = Math.max(...sparkline);
              const min = Math.min(...sparkline);
              const range = max - min || 1;
              const pts = sparkline.map((v, i) => {
                const x = (i / (sparkline.length - 1)) * 300;
                const y = 55 - ((v - min) / range) * 50;
                return `${x},${y}`;
              }).join(' ');
              const fillPts = `0,60 ${pts} 300,60`;
              return (
                <>
                  <polygon points={fillPts} fill="url(#dash-spark-fill)" />
                  <polyline points={pts} fill="none" stroke={T.gold} strokeWidth="1.5" />
                  <circle
                    cx="300"
                    cy={55 - ((sparkline[sparkline.length - 1] - min) / range) * 50}
                    r="3"
                    fill={T.gold}
                  />
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Interactive slider */}
      <div style={{ padding: '12px 14px', background: T.bg1 || '#0d0b08', border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 8, textTransform: 'uppercase' }}>
          <span>게이트 진행 시뮬 · slide to preview tier</span>
          <span style={{ color: T.gold }}>interactive</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01" value={gmvPct}
          onChange={e => setGmvPct(parseFloat(e.target.value))}
          style={{ width: '100%', '--pct': `${gmvPct * 100}%` }}
        />
      </div>

      {/* Footer caption */}
      <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em', textAlign: 'center' }}>
        실제 대시보드 미리보기 · Actual Terminal preview after signup
      </div>
    </div>
  );
}
