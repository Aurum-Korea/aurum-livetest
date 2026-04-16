import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, MOCK_REFERRAL_DATA, fUSD, fKRW } from '../lib/index.jsx';

// ─── Data ─────────────────────────────────────────────────────────────────────
const GATES = [
  { num: 'I',   label: '시작의 문',   en: 'Gate I — The First Opening',    gmv: 5000,   gmvKR: '₩7.2M',  discount: 1.0, mark: 'Stainless',   markKR: '스테인리스 마크', cardStyle: 'mc-stainless', apex: false },
  { num: 'II',  label: '셋의 표식',   en: 'Gate II — The Mark of Three',   gmv: 15000,  gmvKR: '₩21.6M', discount: 1.5, mark: 'Serial #001–500', markKR: '시리얼 넘버', cardStyle: 'mc-stainless', apex: false },
  { num: 'III', label: '정점',        en: 'Gate III — The Apex',           gmv: 35000,  gmvKR: '₩50.4M', discount: 2.0, mark: '10K Gold Mark', markKR: '10K 솔리드 골드 마크', cardStyle: 'mc-gold', apex: true },
  { num: 'IV',  label: '볼트 순례',   en: 'Gate IV — The Vault Pilgrimage',gmv: 65000,  gmvKR: '₩93.6M', discount: 2.5, mark: 'Vault Weekend SG', markKR: '싱가포르 볼트 방문', cardStyle: 'mc-bronze', apex: false },
  { num: 'V',   label: '평생의 표식', en: 'Gate V — In Perpetuity',        gmv: 100000, gmvKR: '₩144M',  discount: 3.0, mark: 'Lifetime Seal',  markKR: '평생 표식', cardStyle: 'mc-gold', apex: false },
];

const LEADERBOARD = [
  { rank: 1, name: 'YOUNG-HO K.', tier: 'PATRON', gate: 5, gmv: 127400 },
  { rank: 2, name: 'HA-EUN R.',   tier: 'PATRON', gate: 4, gmv: 89200  },
  { rank: 3, name: 'SEUNG-WOO L.',tier: 'PATRON', gate: 4, gmv: 74800  },
  { rank: 4, name: 'JI-AH M.',    tier: 'FOUNDING', gate: 3, gmv: 42100 },
  { rank: 5, name: 'DOO-HYUN J.', tier: 'FOUNDING', gate: 3, gmv: 38900 },
];

const USER_DEMO = { name: 'WOOSUNG K.', rank: 247, gate: 2, gmv: 18000, referralCode: 'woosung-k-7g4q9p' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGateForGMV(gmv) {
  for (let i = GATES.length - 1; i >= 0; i--) {
    if (gmv >= GATES[i].gmv) return i;
  }
  return -1;
}

function WaxSeal({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,220,150,0.4), transparent 50%), linear-gradient(135deg, #6a5a3a 0%, #C5A572 45%, #8a6f3a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 6px rgba(0,0,0,0.4), 0 4px 14px rgba(0,0,0,0.5)', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: size * 0.06, border: '1px solid rgba(20,14,8,0.4)', borderRadius: '50%' }} />
      <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 600, fontSize: size * 0.28, color: 'rgba(20,14,8,0.78)', textShadow: '0 1px 0 rgba(255,220,150,0.3)', zIndex: 1, position: 'relative' }}>AU</span>
    </div>
  );
}

function SealDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '44px 32px', gap: 28 }}>
      <div style={{ flex: 1, maxWidth: 360, height: 1, background: `linear-gradient(to right, transparent, ${T.goldBorderStrong}, transparent)` }} />
      <WaxSeal />
      <div style={{ flex: 1, maxWidth: 360, height: 1, background: `linear-gradient(to right, transparent, ${T.goldBorderStrong}, transparent)` }} />
    </div>
  );
}

// ─── GMV Calculator ───────────────────────────────────────────────────────────
function GMVCalculator() {
  const isMobile = useIsMobile();
  const [ownMonthly, setOwnMonthly] = useState(500000);
  const [referralMonthly, setReferralMonthly] = useState(200000);
  const KRW = 1368;
  const SPOT = 3342.80;

  const ownUSD = (ownMonthly * 12) / KRW;
  const refUSD = (referralMonthly * 12) / KRW;
  const totalGMV = ownUSD + refUSD;

  const gateIdx = getGateForGMV(totalGMV);
  const currentGate = GATES[gateIdx];
  const nextGate = GATES[gateIdx + 1];
  const progress = nextGate
    ? Math.min(((totalGMV - (currentGate?.gmv || 0)) / (nextGate.gmv - (currentGate?.gmv || 0))) * 100, 100)
    : 100;

  const annualSavings = totalGMV * ((currentGate?.discount || 0) / 100);
  const fmt = n => Math.round(n).toLocaleString('ko-KR');

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: isMobile ? '24px 20px' : '40px 48px', maxWidth: 860, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 32 }}>GMV 시뮬레이터 · FOUNDERS SAVINGS CALCULATOR</div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28, marginBottom: 36 }}>
        {[
          { label: '내 월 매수 (KRW)', value: ownMonthly, set: setOwnMonthly, min: 200000, max: 5000000, step: 100000, hint: '내 직접 구매액 (AGP + 실물)' },
          { label: '추천인 월 매수 (KRW)', value: referralMonthly, set: setReferralMonthly, min: 0, max: 5000000, step: 100000, hint: '내가 초대한 친구들의 합산 월 구매액' },
        ].map((item, i) => (
          <div key={i}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 14 }}>{item.label}</div>
            <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 16 }}>₩{fmt(item.value)}</div>
            <input type="range" min={item.min} max={item.max} step={item.step} value={item.value}
              style={{ '--pct': `${((item.value - item.min) / (item.max - item.min) * 100).toFixed(1)}%` }}
              onChange={e => item.set(+e.target.value)} />
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 8 }}>{item.hint}</div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div style={{ background: T.bg2, border: `1px solid ${T.goldBorder}`, padding: '22px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '연간 총 GMV', value: fUSD(totalGMV), sub: `₩${fmt(totalGMV * KRW)}` },
            { label: '현재 게이트', value: currentGate ? `Gate ${currentGate.num}` : '미달', sub: currentGate ? currentGate.label : '₩7.2M 부터' },
            { label: 'Founder Savings', value: currentGate ? `−${currentGate.discount}%` : '−', sub: 'on Listed Price', highlight: true },
            { label: '연간 절약액 (추정)', value: currentGate ? fUSD(annualSavings) : '−', sub: '표시가 기준' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: T.mono, fontSize: i === 2 ? 22 : 18, color: s.highlight ? T.goldBright : T.gold, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.value}</div>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, marginTop: 4, letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: '#555', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress to next gate */}
        {nextGate && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>다음 게이트까지: Gate {nextGate.num} · {nextGate.label} (Savings {nextGate.discount}%)</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.gold }}>{fUSD(nextGate.gmv - totalGMV)} 남음</span>
            </div>
            <div style={{ height: 4, background: T.border, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress.toFixed(1)}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldBright})`, boxShadow: `0 0 10px ${T.gold}`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}
        {!nextGate && totalGMV >= 100000 && (
          <div style={{ textAlign: 'center', padding: '10px 0', fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.goldBright }}>✓ 최고 게이트 달성 — Lifetime Savings −3.0% unlocked</div>
        )}
      </div>
    </div>
  );
}

// ─── Gate Card ─────────────────────────────────────────────────────────────────
function GateCard({ gate, idx, userGate }) {
  const [hov, setHov] = useState(false);
  const done    = userGate >= idx;
  const current = userGate === idx - 1;
  const isMobile = useIsMobile();

  const cardBg = {
    'mc-gold':      'linear-gradient(135deg, #6a5a3a, #E3C187 50%, #6a5a3a)',
    'mc-stainless': 'linear-gradient(135deg, #4a4a4a, #b8b8b8 50%, #4a4a4a)',
    'mc-bronze':    'linear-gradient(135deg, #4a3520, #b8804a 50%, #4a3520)',
  };

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: gate.apex ? `linear-gradient(180deg, ${T.goldGlow}, ${T.bg})` : T.bg,
      border: `1px solid ${done || gate.apex ? T.goldBorderStrong : hov ? T.goldBorder : T.border}`,
      padding: isMobile ? '24px 18px' : '32px 22px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      transform: hov ? 'translateY(-4px)' : 'none',
      transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
      cursor: 'default',
    }}>
      {gate.apex && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />}
      {done && <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: T.mono, fontSize: 8, color: T.bg, background: T.green, padding: '3px 8px', letterSpacing: '0.15em' }}>UNLOCKED</div>}
      {current && !done && <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: T.mono, fontSize: 8, color: T.gold, border: `1px solid ${T.goldBorder}`, padding: '3px 8px', letterSpacing: '0.15em', animation: 'pulse 2s infinite' }}>NEXT</div>}

      {/* Gate number circle */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%', margin: '0 auto 18px',
        background: done ? T.gold : T.bg2,
        border: `2px solid ${done ? T.gold : current ? T.gold : T.goldDim}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, fontWeight: 500,
        color: done ? T.bg : current ? T.gold : T.goldDim,
        boxShadow: done ? `0 0 18px rgba(197,165,114,0.5)` : current ? `0 0 0 4px rgba(197,165,114,0.12), 0 0 20px rgba(197,165,114,0.5)` : 'none',
        animation: current && !done ? 'pulseRing 2s ease-in-out infinite' : 'none',
      }}>{gate.num}</div>

      <div style={{ fontFamily: T.mono, fontSize: 9, color: gate.apex ? T.gold : T.goldDim, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
        {gate.apex ? '— APEX —' : `— GATE ${gate.num} —`}
      </div>

      {/* GMV threshold */}
      <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: done ? T.goldBright : T.gold, marginBottom: 4 }}>
        ${gate.gmv.toLocaleString()}
      </div>
      <div style={{ fontFamily: T.sansKr, fontSize: 10, color: T.textMuted, marginBottom: 18 }}>≈ {gate.gmvKR} GMV</div>

      {/* Mini card visual */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0 14px' }}>
        <div style={{ width: 96, height: 60, borderRadius: 6, background: cardBg[gate.cardStyle] || T.bg3, border: gate.cardStyle === 'mc-final' ? `1px solid ${T.gold}` : 'none', boxShadow: gate.cardStyle === 'mc-gold' ? '0 6px 20px rgba(197,165,114,0.3)' : '0 6px 14px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)', borderRadius: 6 }} />
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, letterSpacing: '0.06em', color: gate.cardStyle === 'mc-stainless' ? 'rgba(20,20,20,0.85)' : gate.cardStyle === 'mc-gold' ? 'rgba(20,20,20,0.85)' : gate.cardStyle === 'mc-bronze' ? 'rgba(20,20,20,0.85)' : T.gold, zIndex: 1, position: 'relative' }}>{idx === 4 ? '∞' : 'AU'}</div>
          <div style={{ fontSize: 7, letterSpacing: '0.28em', color: gate.cardStyle === 'mc-stainless' ? 'rgba(20,20,20,0.7)' : gate.cardStyle === 'mc-gold' ? 'rgba(20,20,20,0.7)' : gate.cardStyle === 'mc-bronze' ? 'rgba(20,20,20,0.7)' : T.goldDim, zIndex: 1, position: 'relative' }}>{gate.markKR.slice(0, 8).toUpperCase()}</div>
        </div>
      </div>

      <div style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{gate.label}</div>
      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldDim, marginBottom: 18 }}>{gate.markKR}</div>

      {/* Savings rate */}
      <div style={{ paddingTop: 14, borderTop: `1px solid ${T.goldBorder}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Founder Savings</div>
        <div style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 600, color: done ? T.goldBright : T.gold }}>−{gate.discount}%</div>
        <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, marginTop: 2 }}>on Listed Price · lifetime</div>
      </div>
    </div>
  );
}

// ─── Dual Savings Explainer ────────────────────────────────────────────────────
function DualSavingsPanel() {
  const isMobile = useIsMobile();
  const [activeGate, setActiveGate] = useState(2); // default apex

  const gate = GATES[activeGate];
  const SPOT_USD = 3342.80;
  const KRW = 1368;
  const spotKRW = SPOT_USD * KRW;
  const spotPerG = spotKRW / 31.1035;
  const aurumBase = SPOT_USD * 1.08; // 8% premium
  const withSavings = aurumBase * (1 - gate.discount / 100);
  const koreanRetail = SPOT_USD * 1.20;
  const savedVsKorea = koreanRetail - withSavings;
  const savedVsAurum = aurumBase - withSavings;

  const agpMonthly = 1000000;
  const gramsMonthly = agpMonthly / (spotPerG * 1.08);
  const gramsWithSavings = agpMonthly / (spotPerG * 1.08 * (1 - gate.discount / 100));
  const bonusGrams = gramsWithSavings - gramsMonthly;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Gate selector */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: `1px solid ${T.border}` }}>
        {GATES.map((g, i) => (
          <button key={i} onClick={() => setActiveGate(i)} style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
            fontFamily: T.mono, fontSize: isMobile ? 9 : 11, color: activeGate === i ? T.gold : T.textMuted,
            borderBottom: activeGate === i ? `2px solid ${T.gold}` : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{g.num} · {g.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Physical gold savings */}
        <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '24px 28px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🥇</span> 실물 매수 · Physical
          </div>
          {[
            { label: '한국금거래소 (KRX+VAT)', value: `$${koreanRetail.toFixed(0)}`, color: '#888', sub: '/oz' },
            { label: 'Aurum 기본가 (프리미엄 +8%)', value: `$${aurumBase.toFixed(0)}`, color: T.textSub, sub: '/oz' },
            { label: `Gate ${gate.num} 적용가 (−${gate.discount}%)`, value: `$${withSavings.toFixed(0)}`, color: T.goldBright, sub: '/oz', highlight: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: i < 2 ? `1px dashed ${T.border}` : 'none' }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>{row.label}</span>
              <span style={{ fontFamily: T.mono, fontSize: row.highlight ? 20 : 14, color: row.color, fontWeight: row.highlight ? 700 : 500 }}>{row.value}<span style={{ fontSize: 10, marginLeft: 3, color: T.textMuted }}>{row.sub}</span></span>
            </div>
          ))}
          <div style={{ marginTop: 16, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>한국 대비 절약</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.mono, fontSize: 18, color: T.green, fontWeight: 700 }}>${savedVsKorea.toFixed(0)}/oz</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted }}>{((savedVsKorea / koreanRetail) * 100).toFixed(1)}% 절약</div>
            </div>
          </div>
        </div>

        {/* AGP savings */}
        <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '24px 28px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📈</span> AGP 월적립 · Savings Plan
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginBottom: 16 }}>기준: 월 ₩1,000,000 AGP 적립 시</div>
          {[
            { label: '할인 없이 받는 그램', value: `${gramsMonthly.toFixed(3)}g`, color: T.textSub },
            { label: `Gate ${gate.num} 적용 그램 (−${gate.discount}%)`, value: `${gramsWithSavings.toFixed(3)}g`, color: T.goldBright, highlight: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 1 ? `1px dashed ${T.border}` : 'none' }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>{row.label}</span>
              <span style={{ fontFamily: T.mono, fontSize: row.highlight ? 20 : 14, color: row.color, fontWeight: row.highlight ? 700 : 500 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>월 추가 적립 그램</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.mono, fontSize: 18, color: T.green, fontWeight: 700 }}>+{bonusGrams.toFixed(4)}g</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted }}>/ 매월 · 평생</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: T.goldGlow, fontFamily: T.sans, fontSize: 11, color: T.textSub, lineHeight: 1.6 }}>
            이 할인율은 모든 미래 AGP 적립 <strong style={{ color: T.text }}>평생</strong> 적용됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GMV Explainer (What counts) ──────────────────────────────────────────────
function GMVExplainer() {
  const isMobile = useIsMobile();
  const sources = [
    { icon: '🥇', label: '내 실물 매수',    en: 'Physical purchases',    desc: '금·은 바, 코인 직접 구매액',       pct: 40 },
    { icon: '📈', label: '내 AGP 적립액',   en: 'Your AGP contributions', desc: '월간 자동이체 누적 총액',           pct: 35 },
    { icon: '👥', label: '추천 실물 GMV',   en: 'Referred physical',     desc: '초대한 친구의 실물 매수액',        pct: 15 },
    { icon: '📊', label: '추천 AGP GMV',    en: 'Referred AGP',          desc: '초대한 친구의 AGP 월 약정 합산',  pct: 10 },
  ];
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px, 3vw, 36px)', color: T.text, fontWeight: 500, marginBottom: 12, lineHeight: 1.2 }}>
          GMV란 무엇인가? <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>— 네 가지 원천</span>
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
          GMV(총 거래액)는 회원님이 Aurum 생태계에서 만들어낸 모든 거래의 합산입니다. 본인 구매 + 추천 구매 — 두 가지 모두 카운트됩니다.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldDim, marginBottom: 10 }}>{s.en}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.6, marginBottom: 14 }}>{s.desc}</div>
            {/* Mini bar */}
            <div style={{ height: 3, background: T.border, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.pct}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldBright})` }} />
            </div>
          </div>
        ))}
      </div>
      {/* Formula */}
      <div style={{ marginTop: 20, background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '20px 28px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', textAlign: 'center' }}>
        {['내 실물', '+', '내 AGP', '+', '추천 실물', '+', '추천 AGP', '=', 'Total GMV'].map((item, i) => (
          <span key={i} style={{ fontFamily: ['=', '+'].includes(item) ? T.serif : T.mono, fontStyle: item === '=' ? 'italic' : 'normal', fontSize: item === '=' ? 24 : item === 'Total GMV' ? 14 : 12, color: item === '+' || item === '=' ? T.goldDim : item === 'Total GMV' ? T.goldBright : T.text, fontWeight: item === 'Total GMV' ? 700 : 400, letterSpacing: item === 'Total GMV' ? '0.1em' : '0.05em', textTransform: 'uppercase' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardPanel() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('weekly');

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: T.serifKr, fontSize: 24, color: T.text, fontWeight: 500 }}>GMV Kings <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontSize: 18 }}>— This Week</span></div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 4 }}>상위 GMV 보유자는 특별 혜택과 조기 Gate 승급을 받습니다.</div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {['weekly', 'monthly', 'all-time'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? T.goldGlow : 'none', border: `1px solid ${T.goldBorder}`, borderRight: t !== 'all-time' ? 'none' : `1px solid ${T.goldBorder}`, color: tab === t ? T.gold : T.textMuted, padding: '6px 14px', cursor: 'pointer', fontFamily: T.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.2s' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
        <div style={{ background: T.bg2, padding: '10px 20px', display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto', gap: 12, alignItems: 'center' }}>
          {['RANK', 'MEMBER', 'GATE', 'GMV', 'SAVINGS'].map((h, i) => (
            <div key={i} style={{ fontFamily: T.mono, fontSize: 8, color: T.textMuted, letterSpacing: '0.2em', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        {[...LEADERBOARD].map((row, i) => (
          <div key={i} style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto', gap: 12, alignItems: 'center', borderTop: `1px solid rgba(197,165,114,0.06)`, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.bg2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: row.rank <= 3 ? T.gold : T.goldDim }}>{['I','II','III','IV','V'][row.rank - 1]}</div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, letterSpacing: '0.05em' }}>{row.name}</div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: row.tier === 'PATRON' ? T.gold : T.goldDim, border: `1px solid ${row.tier === 'PATRON' ? T.goldBorder : T.border}`, padding: '2px 6px', display: 'inline-block', marginTop: 3, letterSpacing: '0.15em' }}>{row.tier}</div>
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.gold, textAlign: 'right' }}>{['I','II','III','IV','V'][row.gate - 1]}</div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text, textAlign: 'right', fontWeight: 600 }}>${(row.gmv / 1000).toFixed(0)}K</div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: T.green, textAlign: 'right', fontWeight: 700 }}>−{GATES[row.gate - 1].discount}%</div>
          </div>
        ))}

        {/* You row */}
        <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto', gap: 12, alignItems: 'center', borderTop: `1px solid ${T.goldBorder}`, background: `linear-gradient(90deg, rgba(197,165,114,0.08), transparent)`, borderLeft: `3px solid ${T.gold}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 16, color: T.gold }}>#{USER_DEMO.rank}</div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.gold }}>YOU · {USER_DEMO.name}</div>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, marginTop: 2 }}>가입 후 순위가 표시됩니다</div>
          </div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.goldDim, textAlign: 'right' }}>{['I','II','III','IV','V'][USER_DEMO.gate - 1]}</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.gold, textAlign: 'right' }}>${(USER_DEMO.gmv / 1000).toFixed(0)}K</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textMuted, textAlign: 'right' }}>−1.5%</div>
        </div>
      </div>

      <p style={{ marginTop: 12, fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.6, textAlign: 'center' }}>
        순위는 누적 GMV 기준. 공동 순위 시 가입일이 빠른 회원이 우선. 기본 표시는 이니셜 + ID — 실명 표시는 본인이 옵트인 시 가능.
      </p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FoundersClubPage({ lang, navigate, user, setShowLogin }) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const userGate = USER_DEMO.gate - 1;

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2400); };
  const copyLink = () => {
    navigator.clipboard?.writeText(`https://aurum.sg/founders?s=${USER_DEMO.referralCode}`).catch(() => {});
    setCopied(true); showToast('초대 링크가 복사되었습니다');
    setTimeout(() => setCopied(false), 2200);
  };

  const pad = isMobile ? '60px 20px' : '100px 80px';

  return (
    <div style={{ background: T.bg }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? '80px 20px 70px' : '120px 80px 110px',
        background: `radial-gradient(ellipse at 80% 20%, rgba(197,165,114,0.10), transparent 55%), linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)`,
        borderBottom: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 100 : 320, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(197,165,114,0.015)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 0 }}>FOUNDERS</div>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', background: 'radial-gradient(ellipse at 80% 50%, rgba(197,165,114,0.08), transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: isMobile ? 60 : 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 38, height: 1, background: T.gold }} />
              <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: T.gold }}>Founders Club · 파운더스 클럽</span>
            </div>

            <h1 style={{ fontFamily: T.serifKr, fontWeight: 500, fontSize: isMobile ? 38 : 58, lineHeight: 1.12, color: T.text, margin: '0 0 24px', letterSpacing: '-0.005em' }}>
              더 많이 구매할수록,<br />더 싸게 <span style={{ color: T.gold, fontFamily: T.serif, fontStyle: 'italic' }}>영원히</span>.
            </h1>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: T.goldDim, marginBottom: 28, letterSpacing: '0.005em' }}>
              The more your GMV grows, the deeper your Founder Savings — permanently.
            </div>
            <p style={{ fontFamily: T.sansKr, fontSize: 15, color: T.textSub, lineHeight: 1.85, maxWidth: 520, marginBottom: 36 }}>
              나의 구매 + 친구들의 구매 = GMV. GMV가 다섯 개의 문을 통과할 때마다 <strong style={{ color: T.text }}>표시가(Listed Price)에서 자동 차감되는 Founder Savings</strong>가 깊어집니다. 실물 금 매수와 AGP 적립 모두에 평생 적용.
            </p>

            {/* Key stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
              {[
                { val: '−3.0%', label: '최고 Founder Savings', sub: 'Gate V 달성 시' },
                { val: '$5K', label: '첫 게이트 문턱', sub: '시작의 문' },
                { val: '평생', label: '할인 적용 기간', sub: '게이트 해제 후 영구' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: T.mono, fontSize: 22, color: T.gold, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.val}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.text, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => navigate('agp-enroll')} style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '16px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans, flex: 1 }}>
                파운더스 클럽 가입하기 →
              </button>
              <button onClick={() => navigate('shop')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: '16px 24px', fontSize: 14, cursor: 'pointer', fontFamily: T.sans, flex: 1 }}>
                실물 금 매수로 GMV 쌓기
              </button>
            </div>
          </div>

          {/* Right side: Gate progress visual */}
          {!isMobile && (
            <div style={{ padding: '32px 28px', background: T.bgCard, border: `1px solid ${T.goldBorder}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>GMV 진행 현황 (DEMO)</div>
              {GATES.map((gate, i) => {
                const active = userGate >= i;
                const current = userGate === i - 1;
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: i < 4 ? 16 : 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: active ? T.gold : T.bg2, border: `2px solid ${active ? T.gold : current ? T.gold : T.goldDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: active ? T.bg : current ? T.gold : T.goldDim, flexShrink: 0, boxShadow: active ? '0 0 12px rgba(197,165,114,0.4)' : 'none', transition: 'all 0.4s' }}>{gate.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: active ? T.text : T.textMuted }}>{gate.label}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: active ? T.goldBright : T.goldDim, fontWeight: active ? 700 : 400 }}>−{gate.discount}%</span>
                      </div>
                      <div style={{ height: 2, background: T.border, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: active ? '100%' : '0%', background: `linear-gradient(90deg, ${T.gold}, ${T.goldBright})`, transition: 'width 0.8s ease', boxShadow: active ? `0 0 8px ${T.gold}` : 'none' }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, flexShrink: 0 }}>${gate.gmv.toLocaleString()}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted }}>현재 GMV</span>
                <span style={{ fontFamily: T.mono, fontSize: 14, color: T.gold, fontWeight: 700 }}>${USER_DEMO.gmv.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════════ */}
      <div style={{ background: T.bg3, borderBottom: `1px solid ${T.goldBorder}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 0 }}>
          {[
            { val: '−1.0%',  label: 'Gate I · $5K GMV' },
            { val: '−1.5%',  label: 'Gate II · $15K GMV' },
            { val: '−2.0%',  label: 'Gate III · $35K APEX' },
            { val: '−2.5%',  label: 'Gate IV · $65K GMV' },
            { val: '−3.0%',  label: 'Gate V · $100K · Lifetime' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: isMobile ? '16px 8px' : '20px 16px', borderRight: !isMobile && i < 4 ? `1px solid ${T.goldBorder}` : 'none', borderBottom: isMobile && i < 3 ? `1px solid ${T.goldBorder}` : 'none' }}>
              <div style={{ fontFamily: T.mono, fontSize: isMobile ? 16 : 22, color: T.gold, fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, marginTop: 6, letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ WHAT IS GMV ════════════════════════════════════════════════════════ */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <GMVExplainer />
      </div>

      <SealDivider />

      {/* ══ FIVE GATES ════════════════════════════════════════════════════════ */}
      <div style={{ padding: pad, background: T.bg2, borderTop: `1px solid ${T.goldBorder}`, borderBottom: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 80 : 200, letterSpacing: '0.14em', fontWeight: 500, color: 'rgba(197,165,114,0.018)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 0 }}>QVINQVE PORTAE</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>The Five Gates · 다섯 개의 문</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 500, color: T.text, marginBottom: 14, lineHeight: 1.2 }}>
              문을 통과할수록 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>가격이 낮아집니다</span>
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              게이트는 한 번 열리면 닫히지 않습니다. 실물 매수·AGP 적립·추천 GMV 모든 거래에 평생 자동 적용.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14 }}>
            {GATES.map((gate, i) => <GateCard key={i} gate={gate} idx={i} userGate={userGate} />)}
          </div>
        </div>
      </div>

      {/* ══ DUAL SAVINGS (Physical + AGP) ═══════════════════════════════════ */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>Dual Benefit · 이중 혜택</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 500, color: T.text, marginBottom: 14, lineHeight: 1.2 }}>
            실물과 AGP, <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>모두 더 싸집니다</span>
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>게이트별 절약액을 직접 확인하세요.</p>
        </div>
        <DualSavingsPanel />
      </div>

      {/* ══ GMV CALCULATOR ═══════════════════════════════════════════════════ */}
      <div style={{ padding: pad, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>GMV Simulator · 시뮬레이터</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 500, color: T.text, marginBottom: 14, lineHeight: 1.2 }}>
            내 GMV, 직접 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>계산해 보세요</span>
          </h2>
        </div>
        <GMVCalculator />
      </div>

      <SealDivider />

      {/* ══ LEADERBOARD ══════════════════════════════════════════════════════ */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <LeaderboardPanel />
      </div>

      {/* ══ SHARE PANEL ══════════════════════════════════════════════════════ */}
      <div style={{ padding: isMobile ? '48px 20px' : '72px 80px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>Your Sigil · 초대 링크</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 500, color: T.text, marginBottom: 10, lineHeight: 1.2 }}>
              친구를 초대할수록 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>더 빨리 문이 열립니다</span>
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
              친구의 첫 결제가 정산되면 그 금액이 내 GMV에 합산됩니다.
            </p>
          </div>

          <div style={{ background: T.bg2, border: `1px solid ${T.goldBorder}`, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ flex: 1, fontFamily: T.mono, fontSize: 13, color: T.gold, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              aurum.sg/founders?s={USER_DEMO.referralCode}
            </div>
            <button onClick={copyLink} style={{ background: copied ? T.gold : 'transparent', border: `1px solid ${T.goldBorderStrong}`, color: copied ? T.bg : T.gold, padding: '10px 20px', fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
              {copied ? '복사됨 ✓' : '복사 · COPY'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[{ icon: 'K', label: 'KakaoTalk' }, { icon: '@', label: 'Instagram' }, { icon: 'N', label: 'Naver' }, { icon: '↓', label: 'Card' }].map((btn, i) => (
              <button key={i} onClick={() => showToast(`${btn.label} 공유 — 데모`)} style={{ background: T.bg2, border: `1px solid ${T.goldBorder}`, padding: '18px 10px', fontFamily: T.sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', color: T.textSub, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.textSub; e.currentTarget.style.transform = 'none'; }}>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, fontWeight: 600, color: T.gold }}>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RULES ════════════════════════════════════════════════════════════ */}
      <div style={{ padding: isMobile ? '48px 20px' : '64px 80px', background: T.bg3, borderTop: `1px solid ${T.goldBorder}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px,2.5vw,34px)', fontWeight: 500, color: T.text }}>네 가지 원칙 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>— 간단하고 공정합니다</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: 'I',   t: '실제 GMV만 카운트',  d: '친구가 KYC를 통과하고 첫 결제가 정산되어야 GMV에 반영됩니다. 가짜 가입은 자동 차단.' },
              { n: 'II',  t: '한 번 열리면, 평생', d: '통과한 게이트의 Founder Savings는 회수되지 않습니다. 모든 미래 구매에 영구 적용.' },
              { n: 'III', t: '정점은 −3.0%',       d: 'Gate V를 넘는 추가 할인은 없습니다. 그러나 친구 초대는 언제나 환영합니다.' },
              { n: 'IV',  t: '익명 기본 보호',     d: '리더보드는 이니셜 + ID 기본 표시. 본인 동의 시 실명 공개 가능. 통계는 비공개.' },
            ].map((r, i) => (
              <div key={i} style={{ paddingTop: 20, borderTop: `1px solid ${T.goldBorderStrong}` }}>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 30, color: T.gold, marginBottom: 12 }}>{r.n}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 8 }}>{r.t}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.textSub, lineHeight: 1.7 }}>{r.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? '80px 20px' : '120px 80px',
        background: `radial-gradient(ellipse at 50% 100%, rgba(197,165,114,0.15), transparent 60%), ${T.bg}`,
        textAlign: 'center', borderTop: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 60 : 140, color: 'rgba(197,165,114,0.022)', whiteSpace: 'nowrap', userSelect: 'none', letterSpacing: '0.12em' }}>FOUNDERS</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.gold, letterSpacing: '0.32em', marginBottom: 24, textTransform: 'uppercase' }}>— Exclusive · First-Come, First-Served —</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 30 : 48, fontWeight: 500, color: T.text, marginBottom: 18, lineHeight: 1.15 }}>
            지금 가입하면<br /><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>첫날부터 게이트가 시작됩니다</span>
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 40px' }}>
            Founders Club 멤버십은 한정 모집입니다. 조기 마감 시 재오픈 일정은 미정.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('agp-enroll')} style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '18px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>
              파운더스 클럽 가입 →
            </button>
            <button onClick={() => navigate('shop')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: '18px 32px', fontSize: 15, cursor: 'pointer', fontFamily: T.sans }}>
              실물 구매로 시작
            </button>
          </div>
        </div>
      </div>

      {/* T&C */}
      <div style={{ background: T.bg2, padding: '36px 80px', borderTop: `1px solid ${T.goldBorder}` }}>
        <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textMuted, lineHeight: 1.85, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          ※ Founders Club는 Aurum Pte. Ltd.의 사전예약 단계에서 운영되는 GMV 기반 멤버십 프로그램입니다. Founder Savings는 Aurum Listed Price 기준으로 적용되며 실제 조건은 출시 시점의 공식 약관을 따릅니다. GMV 산정은 정산 완료된 거래만을 대상으로 합니다. 모든 투자에는 원금 손실 가능성이 있습니다.
        </p>
      </div>

      {toast && (
        <div className="toast-container"><div className="toast-item">{toast}</div></div>
      )}
    </div>
  );
}
