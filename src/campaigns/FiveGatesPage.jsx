import { useState, useEffect } from 'react';
import { T, useIsMobile, MOCK_REFERRAL_DATA } from '../lib/index.jsx';

const GATES = [
  { num: 'I',   gmv: '$5,000',  gmvKR: '≈ ₩7.2M GMV',   nameKR: '시작의 문', nameEN: 'the first opening', savings: '−1.0%', threshold: 5000  },
  { num: 'II',  gmv: '$15,000', gmvKR: '≈ ₩21.6M GMV',  nameKR: '셋의 표식', nameEN: 'stainless mark',     savings: '−1.5%', threshold: 15000 },
  { num: 'III', gmv: '$35,000', gmvKR: '≈ ₩50.4M GMV',  nameKR: '정점',      nameEN: 'solid gold mark',   savings: '−2.0%', threshold: 35000, apex: true },
  { num: 'IV',  gmv: '$65,000', gmvKR: '≈ ₩93.6M GMV',  nameKR: '볼트 순례', nameEN: 'Singapore vault',   savings: '−2.5%', threshold: 65000 },
  { num: 'V',   gmv: '$100,000',gmvKR: '≈ ₩144M GMV',   nameKR: '평생의 표식',nameEN: 'in perpetuity',    savings: '−3.0%', threshold: 100000 },
];

const MINI_CARD_STYLES = [
  { bg: T.bg3,          border: `1px solid ${T.goldDim}`,   color: T.gold,       label: 'FOUNDERS'  },
  { bg: 'linear-gradient(135deg,#4a4a4a,#b8b8b8 50%,#4a4a4a)', color:'rgba(20,20,20,0.85)', label: 'FOUNDING YR' },
  { bg: 'linear-gradient(135deg,#6a5a3a,#E3C187 50%,#6a5a3a)', color:'rgba(20,20,20,0.85)', label: 'PATRON', glow: true },
  { bg: 'linear-gradient(135deg,#4a3520,#b8804a 50%,#4a3520)', color:'rgba(20,20,20,0.85)', label: 'VAULT WK' },
  { bg: T.bg,           border: `1px solid ${T.gold}`,      color: T.gold,       label: 'LIFETIME', symbol: '∞' },
];

function WaxSealDivider() {
  return (
    <div className="seal-divider">
      <div className="seal-divider-line" />
      <div className="wax-seal" />
      <div className="seal-divider-line" />
    </div>
  );
}

/* ─── Gold card visual ─────────────────────────────────────────────────── */
function GoldCard({ data }) {
  const [hov, setHov] = useState(false);
  const remaining = data.nextGate.gmvRequired - data.totalGMV;
  return (
    <div style={{ position: 'relative', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        position: 'relative', width: 320, height: 200,
        background: 'linear-gradient(135deg, #6a5a3a 0%, #C5A572 25%, #E3C187 45%, #f0d49a 50%, #E3C187 55%, #C5A572 75%, #6a5a3a 100%)',
        borderRadius: 12,
        boxShadow: '0 40px 100px rgba(197,165,114,0.32), 0 0 0 1px rgba(255,220,150,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
        transform: hov ? 'rotateX(4deg) rotateY(-6deg) rotateZ(-1deg) translateY(-6px)' : 'rotateX(8deg) rotateY(-12deg) rotateZ(-2deg)',
        transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
        padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: '#2a2418',
      }}>
        {/* Shine */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)', borderRadius: 12, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, border: '1px solid rgba(42,36,24,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontSize: 11, fontWeight: 600, color: 'rgba(42,36,24,0.9)', letterSpacing: '0.04em' }}>AU</div>
            <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, letterSpacing: '0.3em', color: 'rgba(42,36,24,0.9)' }}>AURUM</div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 600, letterSpacing: '0.25em', color: 'rgba(42,36,24,0.7)', border: '1px solid rgba(42,36,24,0.4)', padding: '3px 8px' }}>PATRON</div>
        </div>

        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, fontWeight: 500, color: 'rgba(42,36,24,0.85)', letterSpacing: '0.02em' }}>
          {data.name}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(42,36,24,0.65)' }}>10K · 31g</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.1em', color: 'rgba(42,36,24,0.55)' }}>SG · MMXXVI</div>
        </div>
      </div>

      {/* Seal stamp */}
      <div style={{
        position: 'absolute', top: -4, right: -4, width: 110, height: 110, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, rgba(255,220,150,0.35), transparent 50%), linear-gradient(135deg, #6a5a3a 0%, #C5A572 45%, #8a6f3a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(20,14,8,0.85)', fontFamily: T.mono, textTransform: 'uppercase',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 6px rgba(0,0,0,0.4), 0 14px 32px rgba(0,0,0,0.6)',
        transform: 'rotate(-12deg)', padding: 14, textAlign: 'center', position: 'absolute',
      }}>
        <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(20,14,8,0.4)', borderRadius: '50%' }} />
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 24, letterSpacing: '-0.02em', textShadow: '0 1px 0 rgba(255,220,150,0.3)', zIndex: 1, position: 'relative', lineHeight: 1 }}>
          ${Math.round(remaining / 1000)}K
        </div>
        <div style={{ fontSize: 7, letterSpacing: '0.2em', marginTop: 5, textAlign: 'center', lineHeight: 1.4, zIndex: 1, position: 'relative', color: 'rgba(20,14,8,0.75)' }}>
          TO APEX<br />GATE III
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Ladder ──────────────────────────────────────────────────── */
function ProgressLadder({ data }) {
  const progress = Math.min(data.totalGMV / 100000, 1);
  const isMobile = useIsMobile();
  return (
    <div style={{ position: 'relative', padding: '50px 0 30px' }}>
      {/* Track */}
      {!isMobile && (
        <>
          <div style={{ position: 'absolute', top: 70, left: 32, right: 32, height: 2, background: T.bg2, zIndex: 1 }} />
          <div style={{ position: 'absolute', top: 70, left: 32, height: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldBright})`, zIndex: 2, boxShadow: '0 0 12px rgba(197,165,114,0.4)', width: `calc(${progress} * (100% - 64px))`, transition: 'width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5,1fr)', position: 'relative', zIndex: 3, gap: isMobile ? 16 : 0 }}>
        {GATES.map((gate, i) => {
          const done    = data.totalGMV >= gate.threshold;
          const current = !done && (i === 0 || data.totalGMV >= GATES[i - 1].threshold);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', textAlign: isMobile ? 'left' : 'center', gap: isMobile ? 16 : 0 }}>
              <div style={{
                width: 44, height: 44, background: done ? T.gold : T.bg2,
                border: `2px solid ${done ? T.gold : current ? T.gold : T.goldDim}`,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 500,
                color: done ? T.bg : current ? T.gold : T.goldDim,
                transition: 'all 0.4s', marginBottom: isMobile ? 0 : 16, flexShrink: 0,
                boxShadow: done ? '0 0 16px rgba(197,165,114,0.5)' : current ? '0 0 0 4px rgba(197,165,114,0.15), 0 0 22px rgba(197,165,114,0.6)' : 'none',
                animation: current ? 'pulseRing 2s ease-in-out infinite' : 'none',
              }}>{gate.num}</div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.1em', color: done || current ? T.gold : T.textMuted, marginBottom: 4, fontWeight: 500 }}>{gate.gmv}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 12, fontWeight: 500, color: done || current ? T.text : T.textSub, lineHeight: 1.4, marginBottom: 4 }}>{gate.nameKR}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: done || current ? T.gold : T.goldDim }}>{gate.savings}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIVE GATES PAGE — main export
   ═══════════════════════════════════════════════════════════════════════ */
export default function FiveGatesPage({ lang, navigate, user }) {
  const isMobile = useIsMobile();
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const data = MOCK_REFERRAL_DATA;
  const remaining = data.nextGate.gmvRequired - data.totalGMV;
  const pad = isMobile ? '60px 20px' : '110px 80px';

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText('https://' + data.referralLink).catch(() => {});
    setCopied(true);
    showToast('초대 링크가 복사되었습니다');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ background: T.bg }}>

      {/* ── Hero ── */}
      <div style={{
        padding: isMobile ? '60px 20px' : '90px 80px 80px',
        background: `radial-gradient(ellipse at 80% 20%, rgba(197,165,114,0.10), transparent 55%), linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)`,
        borderBottom: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 120 : 380, letterSpacing: '0.12em', fontWeight: 500, color: 'rgba(197,165,114,0.022)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0, userSelect: 'none' }}>PORTA</div>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: isMobile ? 60 : 72, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="eyebrow">The Five Gates · 다섯 개의 문</div>
            <h1 style={{ fontFamily: T.serifKr, fontWeight: 500, fontSize: isMobile ? 36 : 56, lineHeight: 1.18, color: T.text, margin: '0 0 22px', letterSpacing: '-0.005em' }}>
              가까운 사람이 합류할 때마다,<br /><span style={{ color: T.gold, fontFamily: T.serif, fontStyle: 'italic' }}>Founder Savings</span>가<br />한 단계씩 깊어집니다.
            </h1>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 20, color: T.goldDim, marginBottom: 34, letterSpacing: '0.005em' }}>Each gate, a deeper Founder Savings rate. Applied to Aurum Listed Price. Lifetime, once unlocked.</div>
            <p style={{ fontFamily: T.sansKr, fontSize: 15, color: T.textSub, lineHeight: 1.85, maxWidth: 540 }}>
              친구가 가입하고 첫 결제를 마치면, 그 결제 금액이 회원님의 누적 GMV에 기록됩니다. 다섯 개의 문이 있고, 마지막 문은 — $100,000. 누구든 이를 통과하면, <strong style={{ color: T.goldBright }}>Founder Savings −3.0% on Listed Price</strong>가 평생 적용됩니다. Aurum이 표시한 가격에서 자동 차감.
            </p>
          </div>
          {!isMobile && <GoldCard data={data} />}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ background: T.bg3, borderBottom: `1px solid ${T.goldBorder}`, padding: '36px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 0 }}>
            {[
              { num: data.gatesPassed, label: 'GATES PASSED', kr: '통과한 문', serif: true },
              { num: data.currentSavings + '%', label: 'FOUNDER SAVINGS · ON LISTED PRICE', kr: '표시가 기준 적립 할인율', mono: true },
              { num: `$${(data.totalGMV / 1000).toFixed(0)}K`, label: 'GMV REFERRED', kr: '누적 추천 GMV', mono: true },
              { num: `$${(remaining / 1000).toFixed(0)}K`, label: 'UNTIL APEX', kr: '정점까지', mono: true },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: isMobile ? '16px' : '0 28px', borderRight: !isMobile && i < 3 ? `1px solid ${T.goldBorder}` : 'none', borderBottom: isMobile && i < 2 ? `1px solid ${T.goldBorder}` : 'none' }}>
                <div style={{ fontFamily: s.serif ? T.serif : T.mono, fontStyle: s.serif ? 'italic' : 'normal', fontSize: s.serif ? 42 : 32, fontWeight: s.serif ? 500 : 700, color: T.gold, lineHeight: 1, marginBottom: 10, letterSpacing: '-0.01em' }}>{s.num}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.textMuted }}>
                  {s.label}
                  <span style={{ display: 'block', fontFamily: T.sansKr, fontSize: 11, letterSpacing: '0.05em', textTransform: 'none', color: T.textSub, marginTop: 6 }}>{s.kr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main dashboard ── */}
      <div style={{ padding: isMobile ? '40px 20px 80px' : '50px 80px 100px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 32 }}>

          {/* Left: Progress + Share */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Progress panel */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">진행 <span className="en">— Path Through the Gates</span></div>
                <div className="panel-meta">${data.totalGMV.toLocaleString()} / $100,000</div>
              </div>
              <ProgressLadder data={data} />

              {/* Next up callout */}
              <div style={{ marginTop: 48, padding: '28px 32px', background: 'linear-gradient(135deg, rgba(197,165,114,0.08) 0%, transparent 100%)', borderLeft: `3px solid ${T.gold}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 28, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.28em', color: T.gold, textTransform: 'uppercase', marginBottom: 10 }}>NEXT GATE · 다음 문</div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 20, fontWeight: 500, color: T.text, marginBottom: 6 }}>Gate {data.nextGate.number} · {data.nextGate.name} — Founder Savings {data.nextGate.savings}%</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldDim }}>on Listed Price · 10K solid gold mark · Patron status · Concierge line opens</div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 700, color: T.gold, lineHeight: 1, letterSpacing: '-0.02em' }}>${(remaining / 1000).toFixed(0)}K</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', color: T.goldDim, textTransform: 'uppercase', marginTop: 8 }}>REMAIN</div>
                </div>
              </div>
            </div>

            {/* Share panel */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">초대 <span className="en">— Your Sigil</span></div>
                <div className="panel-meta">UNIQUE TO YOU</div>
              </div>
              <div style={{ background: T.bg2, border: `1px solid ${T.goldBorder}`, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ flex: 1, fontFamily: T.mono, fontSize: 13, color: T.gold, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.referralLink}</div>
                <button onClick={copyLink} style={{ background: copied ? T.gold : 'transparent', border: `1px solid ${T.goldBorderStrong}`, color: copied ? T.bg : T.gold, padding: '10px 18px', fontFamily: T.sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                  {copied ? '복사됨 · COPIED' : '복사 · COPY'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[
                  { icon: 'K', label: 'KakaoTalk' },
                  { icon: '@', label: 'Instagram' },
                  { icon: 'N', label: 'Naver' },
                  { icon: '↓', label: 'Card' },
                ].map((btn, i) => (
                  <button key={i} onClick={() => showToast(`${btn.label} 공유 — 데모`)} style={{ background: T.bg2, border: `1px solid ${T.goldBorder}`, padding: '16px 10px', fontFamily: T.sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', color: T.textSub, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.textSub; e.currentTarget.style.transform = 'none'; }}>
                    <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: T.gold }}>{btn.icon}</span>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Activity + Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Activity */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">최근 합류 <span className="en">— Recent</span></div>
                <div className="panel-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="live-dot" />LIVE</div>
              </div>
              {data.recentReferrals.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < data.recentReferrals.length - 1 ? `1px solid rgba(197,165,114,0.08)` : 'none' }}>
                  <div style={{ width: 40, height: 40, background: T.bg2, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, fontWeight: 600, color: T.gold, borderRadius: '50%', flexShrink: 0 }}>{item.initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, marginBottom: 2, letterSpacing: '0.05em' }}>{item.name}</div>
                    <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textMuted }}>{item.note}</div>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: item.status === 'PASSED' ? T.gold : T.goldDim, textTransform: 'uppercase', border: `1px solid ${item.status === 'PASSED' ? T.goldBorder : T.border}`, padding: '4px 8px', flexShrink: 0 }}>{item.status}</div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">코호트 <span className="en">— This Week</span></div>
                <div className="panel-meta">TOP {data.leaderboard.length}</div>
              </div>
              {[...data.leaderboard, { rank: data.userRank, name: `YOU · ${data.name}`, tier: 'FOUNDING YR', gates: data.gatesPassed, isYou: true }].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto auto', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: i < data.leaderboard.length ? `1px solid rgba(197,165,114,0.08)` : 'none', background: row.isYou ? 'linear-gradient(90deg, rgba(197,165,114,0.06), transparent)' : 'transparent', margin: row.isYou ? '0 -16px' : 0, padding: row.isYou ? '13px 16px' : '13px 0', borderLeft: row.isYou ? `2px solid ${T.gold}` : '2px solid transparent' }}>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, fontWeight: 500, color: row.rank <= 3 ? T.gold : T.goldDim, textAlign: 'center' }}>{typeof row.rank === 'number' ? (row.rank <= 3 ? ['I','II','III'][row.rank-1] : row.rank) : row.rank}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: row.isYou ? T.gold : T.textSub, letterSpacing: '0.05em' }}>{row.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '2px 7px', border: `1px solid ${row.tier === 'PATRON' ? T.gold : T.goldBorder}`, color: row.tier === 'PATRON' ? T.gold : T.goldDim, background: row.tier === 'PATRON' ? T.goldGlow : 'transparent' }}>{row.tier}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: T.text, textAlign: 'right', minWidth: 36 }}>{typeof row.gates === 'number' ? ['I','II','III','IV','V'][row.gates-1] : row.gates}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Wax seal divider ── */}
      <WaxSealDivider />

      {/* ── Tier gallery (5 gates) ── */}
      <div style={{ background: T.bg2, borderTop: `1px solid ${T.goldBorder}`, borderBottom: `1px solid ${T.goldBorder}`, padding: pad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 80 : 200, letterSpacing: '0.14em', fontWeight: 500, color: 'rgba(197,165,114,0.018)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0, userSelect: 'none' }}>QVINQVE PORTAE</div>
        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 16, letterSpacing: '-0.005em', lineHeight: 1.2 }}>다섯 개의 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>문 · The Five Gates</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>Each gate, attributed to cumulative referred GMV. Founder Savings, lifetime once unlocked.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: 16 }}>
            {GATES.map((gate, i) => {
              const mc = MINI_CARD_STYLES[i];
              return (
                <div key={i} className="lift-card" style={{ background: gate.apex ? `linear-gradient(180deg, ${T.goldGlow} 0%, ${T.bg} 100%)` : T.bg, border: `1px solid ${gate.apex ? T.gold : T.goldBorder}`, padding: '32px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  {gate.apex && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />}
                  <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.28em', color: gate.apex ? T.gold : T.goldDim, textTransform: 'uppercase', marginBottom: 10 }}>— GATE {gate.num}{gate.apex ? ' · APEX' : ''} —</div>
                  <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.gold, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.01em' }}>{gate.gmv}</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 10, color: T.textMuted, marginBottom: 20 }}>{gate.gmvKR}</div>

                  {/* Mini card */}
                  <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
                    <div style={{ width: 110, height: 68, borderRadius: 4, background: mc.bg, border: mc.border, boxShadow: mc.glow ? '0 8px 24px rgba(197,165,114,0.35)' : '0 8px 18px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)', borderRadius: 4 }} />
                      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4, color: mc.color, zIndex: 1 }}>{mc.symbol || 'AU'}</div>
                      <div style={{ fontSize: 7, letterSpacing: '0.32em', color: mc.color, zIndex: 1 }}>{mc.label}</div>
                    </div>
                  </div>

                  <div style={{ fontFamily: T.serifKr, fontSize: 17, fontWeight: 600, color: T.text, marginTop: 12, marginBottom: 4, lineHeight: 1.3 }}>{gate.nameKR}</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldDim, marginBottom: 16 }}>— {gate.nameEN}</div>
                  <div style={{ paddingTop: 14, borderTop: `1px solid ${T.goldBorder}` }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', color: T.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>FOUNDER SAVINGS</div>
                    <div style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 600, color: T.gold, letterSpacing: '-0.01em' }}>
                      {gate.savings}
                      {gate.num === 'V' && <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 10, color: T.goldDim, display: 'block', marginTop: 2, letterSpacing: '0.05em' }}>— lifetime, capped</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Share templates ── */}
      <div style={{ padding: pad }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 16, lineHeight: 1.2 }}>공유 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>표식</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>Auto-generated. Brand-safe. Yours to send.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 32, maxWidth: 880, margin: '0 auto' }}>
            {[
              {
                corner1: 'FOUNDING SEASON', corner2: `#${data.memberId}`,
                headline: <><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>두 개</span>의 문을<br />이미 지났습니다.</>,
                stat: '$17K', statLabel: 'REMAINING TO APEX · GATE III',
                body: `정점에서 — 10K 솔리드 골드 마크, Patron 자격, Founder Savings −2.0% on Listed Price 평생.`,
                foot: 'JOIN VIA MY LINK',
              },
              {
                corner1: 'GENERATIONAL', corner2: 'XX YEAR HORIZON',
                headline: <><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>집은 못 사도</span><br />금은 살 수 있다.</>,
                body: <>오늘 시작한 ₩200K — 20년 뒤에도 <strong style={{ color: T.gold }}>금은 여전히 금</strong>이다.<br /><br /><span style={{ fontSize: 13, color: T.textSub }}>매월 자동, 싱가포르 보관. Founding Season 사전예약 한정.</span></>,
                foot: 'AURUM AGP',
              },
            ].map((tpl, i) => (
              <div key={i} className="lift-card" style={{ aspectRatio: '1 / 1.25', background: `linear-gradient(180deg, ${T.bg3} 0%, ${T.bg} 100%)`, border: `1px solid ${T.goldBorder}`, padding: '36px 32px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 0%, rgba(197,165,114,0.1), transparent 60%), radial-gradient(circle at 0% 100%, rgba(197,165,114,0.06), transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.24em', color: T.gold, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  <span>{tpl.corner1}</span><span>{tpl.corner2}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontFamily: T.serifKr, fontSize: 26, fontWeight: 600, color: T.text, lineHeight: 1.25, marginBottom: 20 }}>{tpl.headline}</div>
                  {tpl.stat && <>
                    <div style={{ fontFamily: T.mono, fontSize: 46, fontWeight: 700, color: T.gold, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.02em' }}>
                      <span style={{ fontSize: 24, color: T.goldDim, marginRight: 4 }}>$</span>{tpl.stat.replace('$','')}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.24em', color: T.textSub, textTransform: 'uppercase', marginBottom: 16 }}>{tpl.statLabel}</div>
                  </>}
                  <div style={{ height: 1, background: T.goldBorder, margin: '16px 0' }} />
                  <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>{tpl.body}</div>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: T.textMuted, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                  <span>{tpl.foot}</span>
                  <span style={{ fontFamily: T.serif, fontSize: 13, letterSpacing: '0.32em', color: T.gold, fontWeight: 500 }}>A U</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Wax seal divider ── */}
      <WaxSealDivider />

      {/* ── Rules ── */}
      <div style={{ background: T.bg3, borderTop: `1px solid ${T.goldBorder}`, padding: pad }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 16, lineHeight: 1.2 }}>네 가지 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>원칙</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>Four rules. No tricks.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 28, maxWidth: 1100, margin: '0 auto' }}>
            {[
              { num: 'I',   title: '실제 GMV만 카운트', desc: '친구가 본인확인을 통과하고 첫 결제가 정산되어야 GMV가 누적됩니다. 가짜 가입은 자동으로 걸러집니다.' },
              { num: 'II',  title: '한 번 열리면, 평생', desc: '한 번 통과한 문의 Founder Savings는 회원님의 모든 매수에 Aurum Listed Price (표시가) 기준으로 영구 적용됩니다. 회수되지 않습니다.' },
              { num: 'III', title: '정점은 −3.0%', desc: '최대 Founder Savings는 −3.0% on Listed Price 평생. Gate V를 넘는 추가 적립은 없습니다. 친구 합류는 계속 환영합니다.' },
              { num: 'IV',  title: '정중한 코호트', desc: '기본은 익명 (이니셜 + 코호트 ID). 본인이 옵트인하시면 실명 표시 가능. 본인 통계는 비공개로 유지됩니다.' },
            ].map((r, i) => (
              <div key={i} style={{ paddingTop: 20, borderTop: `1px solid ${T.goldBorderStrong}` }}>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 32, color: T.gold, marginBottom: 14 }}>{r.num}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 17, fontWeight: 500, color: T.text, marginBottom: 10 }}>{r.title}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, lineHeight: 1.7 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── T&C ── */}
      <div style={{ background: T.bg2, padding: '44px 80px', borderTop: `1px solid ${T.goldBorder}` }}>
        <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textMuted, lineHeight: 1.85, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          ※ The Five Gates는 Aurum Pte. Ltd. (싱가포르)의 한국 시장 사전예약 단계에서 운영되는 추천 프로그램입니다. 누적 추천 GMV는 회원님이 추천한 신규 회원의 첫 결제 후 누적된 매수 금액 (USD 환산) 기준으로 계산됩니다. Founder Savings는 Aurum의 매수 가격에 적용되는 회원 우대 할인이며, 실제 적용 조건은 출시 시점의 공식 약관을 따릅니다. 추천된 친구는 만 19세 이상 한국 거주자, 본인 명의 KYC를 완료해야 합니다.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast-item">{toast}</div>
        </div>
      )}
    </div>
  );
}
