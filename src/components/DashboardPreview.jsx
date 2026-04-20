import { useState, useMemo } from 'react';
import { T_NS as T } from '../lib/tokens';
import { fmtManEok } from '../lib/constants';

// ═══════════════════════════════════════════════════════════════════════
// DashboardPreview · rebuilt v10d · single-slider-driven
//
// Lives on /goldpath §III "The Product" (moved from /start).
// Palette: Neo-Seoul (hot pink + electric blue) via T_NS.
//
// TRUE MESSAGE: "Here's what your dashboard looks like. Drag the slider —
//   watch gold accumulate month by month. Grams, KRW value, tier, and the
//   30-day trajectory ALL derive from the same accumulation model."
//
// Every visible value comes from one input: monthsElapsed. Toggle between
// two plan sizes (₩500K/mo vs ₩2M/mo) to preview both common commitments.
// ═══════════════════════════════════════════════════════════════════════

// ─── Canonical market inputs (aligned with constants.js) ────────────
const SPOT_USD_OZ   = 4842.10;
const KRW_USD       = 1440.20;
const OZ_G          = 31.1035;
const AURUM_MARGIN  = 1.08;
const KRW_PER_G     = (SPOT_USD_OZ * KRW_USD / OZ_G) * AURUM_MARGIN;   // ₩242K/g
const ASSUMED_CAGR  = 0.10;                                              // 10% · canonical mid assumption

// ─── Gates per source model ─────────────────────────────────────────
const TIERS = [
  { n: 'I',   nameKR: '브론즈',   nameEN: 'Bronze',    gmv: 7_200_000,   disc: 1.0 },
  { n: 'II',  nameKR: '실버',     nameEN: 'Silver',    gmv: 21_600_000,  disc: 1.5 },
  { n: 'III', nameKR: '골드',     nameEN: 'Gold',      gmv: 50_400_000,  disc: 2.0, apex: true },
  { n: 'IV',  nameKR: '플래티넘', nameEN: 'Platinum',  gmv: 93_600_000,  disc: 2.5 },
  { n: 'V',   nameKR: '소브린',   nameEN: 'Sovereign', gmv: 144_000_000, disc: 3.0 },
];

const fmt = {
  krwMan: (n) => fmtManEok(n),
};

// ─── Build trajectory · one row per month up to `months` ───────────
// Each row: { m: monthsElapsed, grams, krwValue, gmv }
// Spot price assumed to drift at ASSUMED_CAGR compounded monthly.
function buildTrajectory(monthly, months) {
  const monthlyRate = Math.pow(1 + ASSUMED_CAGR, 1/12) - 1;
  const rows = [];
  let cumulativeGrams = 0;
  let cumulativeGmv   = 0;

  for (let m = 1; m <= months; m++) {
    // price at month m — spot drifts at CAGR from month 0
    const priceAtM = KRW_PER_G * Math.pow(1 + monthlyRate, m);
    // grams bought this month = monthly KRW / that month's price
    const gramsBoughtThisMonth = monthly / priceAtM;
    cumulativeGrams += gramsBoughtThisMonth;
    cumulativeGmv   += monthly;
    // KRW value today of all grams held at the month-m price
    const krwValue = cumulativeGrams * priceAtM;
    rows.push({ m, grams: cumulativeGrams, krwValue, gmv: cumulativeGmv });
  }
  return rows;
}

// Given cumulativeGmv, return current tier + progress toward next
function tierFromGmv(gmv) {
  let currentIdx = -1;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (gmv >= TIERS[i].gmv) { currentIdx = i; break; }
  }
  const current = currentIdx >= 0 ? TIERS[currentIdx] : null;
  const nextIdx = currentIdx + 1;
  const next    = nextIdx < TIERS.length ? TIERS[nextIdx] : null;

  let progress = 0, toNext = 0;
  if (!current) {
    // Pre-Bronze → progress toward Gate I
    progress = Math.min(1, gmv / TIERS[0].gmv);
    toNext = TIERS[0].gmv - gmv;
  } else if (next) {
    progress = (gmv - current.gmv) / (next.gmv - current.gmv);
    progress = Math.max(0, Math.min(1, progress));
    toNext = next.gmv - gmv;
  } else {
    progress = 1; toNext = 0;
  }

  return { current, next, progress, toNext };
}

export default function DashboardPreview() {
  // Monthly contribution slider · 200K → 5M · step 100K
  const [monthly, setMonthly] = useState(200_000);
  // Months elapsed slider · 1 → 36
  const [months, setMonths] = useState(14);

  // Trajectory to 36mo · always computed so sparkline has full context
  const trajectory = useMemo(() => buildTrajectory(monthly, 36), [monthly]);
  const active = trajectory[Math.max(0, months - 1)] || { m: 0, grams: 0, krwValue: 0, gmv: 0 };
  const tierInfo = useMemo(() => tierFromGmv(active.gmv), [active.gmv]);

  // Sparkline · only the trajectory UP TO the slider position
  const sparkPath = trajectory.slice(0, Math.max(1, months));

  // Year-label ("Y1 · M2")
  const yrLbl = months === 0 ? 'day 1' :
                months < 12 ? `M${months}` :
                `Y${Math.floor((months - 1) / 12) + 1} · M${((months - 1) % 12) + 1}`;

  // CORRECT delta: current KRW value vs nominal money contributed (GMV)
  // This is the real "gain" — appreciation net of deposits
  const delta = active.gmv > 0
    ? ((active.krwValue / active.gmv) - 1) * 100
    : 0;

  return (
    <div style={{
      background: T.deep,
      border: `1px solid ${T.goldBorder}`,
      padding: 22,
      position: 'relative',
      overflow: 'hidden',
      maxWidth: 560,
      width: '100%',
    }}>
      {/* Top hairline · hot pink chroma */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, ${T.blue}, ${T.gold}, transparent)` }} />

      {/* Header · LIVE + plan toggle */}
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
      </div>

      {/* 4-tile KPI grid · all derive from the slider */}
      <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {/* Grams */}
        <div style={{ padding: '14px 14px', background: T.bg1, border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>보유 금 · Grams</div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.text, fontWeight: 700, lineHeight: 1 }}>
            {active.grams.toFixed(2)}
            <span style={{ fontSize: 12, color: T.goldD, marginLeft: 4 }}>g</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
            {(active.grams / OZ_G).toFixed(3)} oz · SG vault
          </div>
        </div>

        {/* KRW value */}
        <div style={{ padding: '14px 14px', background: T.bg1, border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>원화 가치 · KRW</div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.goldB, fontWeight: 700, lineHeight: 1 }}>
            {fmt.krwMan(active.krwValue)}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.green, marginTop: 4 }}>
            ● live · LBMA ref
          </div>
        </div>

        {/* Tier progress · full width · calibrated to real gates */}
        <div style={{ padding: '14px 14px', background: T.bg1, border: `1px solid ${T.border}`, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              티어 진행 · Tier progress
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD }}>
              {tierInfo.current ? `Gate ${tierInfo.current.n}${tierInfo.next ? ` → ${tierInfo.next.n}` : ' · APEX'}` : `→ Gate ${TIERS[0].n}`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, fontWeight: 600 }}>
              {tierInfo.current ? tierInfo.current.nameKR : '시작 전'}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD }}>
              {tierInfo.current?.apex && '· APEX '}
              · {fmt.krwMan(active.gmv)} GMV
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', position: 'relative', marginBottom: 6 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${(tierInfo.progress * 100).toFixed(1)}%`,
              background: `linear-gradient(90deg, ${T.gold}, ${T.blue})`,
              transition: 'width 0.4s cubic-bezier(0.2,0.8,0.2,1)',
              boxShadow: `0 0 8px ${T.goldBorder}`,
            }} />
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, display: 'flex', justifyContent: 'space-between' }}>
            <span>{(tierInfo.progress * 100).toFixed(0)}% {tierInfo.next ? `to ${tierInfo.next.nameEN}` : 'complete'}</span>
            <span>{tierInfo.toNext > 0 ? `${fmt.krwMan(tierInfo.toNext)} 남음` : '—'}</span>
          </div>
        </div>

        {/* Trajectory sparkline · the path walked so far · full width */}
        <div style={{ padding: '14px 14px', background: T.bg1, border: `1px solid ${T.border}`, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              적립 경로 · Accumulation path · {yrLbl}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: delta >= 0 ? T.green : T.red }}>
              {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
            </span>
          </div>
          <svg viewBox="0 0 300 60" width="100%" height="60" preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="dash-spark-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={T.gold} stopOpacity="0.32" />
                <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="dash-spark-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={T.gold} />
                <stop offset="100%" stopColor={T.blue} />
              </linearGradient>
            </defs>
            {(() => {
              if (sparkPath.length < 2) {
                return (
                  <circle cx="2" cy="58" r="3" fill={T.gold} />
                );
              }
              const values = sparkPath.map(r => r.krwValue);
              const max = Math.max(...values);
              const min = Math.min(...values);
              const range = max - min || 1;
              // Scale X to 0-300 based on CURRENT slider position · not 36
              const lastM = sparkPath[sparkPath.length - 1].m;
              const pts = sparkPath.map(r => {
                const x = ((r.m - 1) / Math.max(1, lastM - 1)) * 300;
                const y = 55 - ((r.krwValue - min) / range) * 50;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
              }).join(' ');
              const fillPts = `0,60 ${pts} 300,60`;
              const lastY = 55 - ((values[values.length - 1] - min) / range) * 50;
              return (
                <>
                  <polygon points={fillPts} fill="url(#dash-spark-fill)" />
                  <polyline points={pts} fill="none" stroke="url(#dash-spark-line)" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="300" cy={lastY} r="3.5" fill={T.goldB} />
                  <circle cx="300" cy={lastY} r="7" fill={T.gold} opacity="0.25" />
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Monthly contribution slider · 20만원 - 500만원 · step 10만원 */}
      <div style={{ padding: '12px 14px', background: T.bg1, border: `1px solid ${T.border}`, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 8, textTransform: 'uppercase' }}>
          <span>월 적립액 · monthly contribution</span>
          <span style={{ color: T.gold }}>{fmtManEok(monthly)}</span>
        </div>
        <input
          type="range" min="200000" max="5000000" step="100000" value={monthly}
          onChange={e => setMonthly(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            '--pct': `${((monthly - 200_000) / (5_000_000 - 200_000)) * 100}%`,
            '--thumb': T.gold,
            '--thumb-glow': 'rgba(255,61,138,0.5)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 4, letterSpacing: '0.1em' }}>
          <span>20만원</span><span>100만원</span><span>300만원</span><span>500만원</span>
        </div>
      </div>

      {/* Months elapsed slider */}
      <div style={{ padding: '12px 14px', background: T.bg1, border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 8, textTransform: 'uppercase' }}>
          <span>적립 개월 수 · slide to advance time</span>
          <span style={{ color: T.gold }}>{months}mo · {yrLbl}</span>
        </div>
        <input
          type="range" min="1" max="36" step="1" value={months}
          onChange={e => setMonths(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            '--pct': `${((months - 1) / 35) * 100}%`,
            '--thumb': T.gold,
            '--thumb-glow': 'rgba(255,61,138,0.5)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 4, letterSpacing: '0.1em' }}>
          <span>1mo</span><span>1yr</span><span>2yr</span><span>3yr</span>
        </div>
      </div>

      {/* Footer caption · honest framing */}
      <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.16em', textAlign: 'center' }}>
        실제 대시보드 미리보기 · 10% CAGR 가정 · actual preview after signup
      </div>

      <style>{`
        @media (max-width: 420px) {
          .dash-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
