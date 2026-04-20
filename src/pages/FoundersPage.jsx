import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import PromoBar from '../components/PromoBar';
import QuietFooter from '../components/QuietFooter';
import AUSquare from '../components/AUSquare';
import AurumWordmark from '../components/AurumWordmark';
import CagrToggle, { DEFAULT_CAGR } from '../components/CagrToggle';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { AGP_CREDITS, TOTAL_CREDITS, fUSD, OZ_G, KR_RETAIL_MARKUP, SAVINGS_APY, fmtManEok } from '../lib/constants';


/* ═══════════════════════════════════════════════════════════════════════════
   AURUM · /founders page mockup
   The only page where Hybrid (V3) register flows into V4 register
   on a single vertical scroll. Top half sells, bottom half welcomes.
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// GATE DATA — the spine of the whole page
// ═══════════════════════════════════════════════════════════════════════════
const GATES = [
  { n: 'I',   ko: '시작의 문',     en: 'The Opening',       d: 1.0, gmv: 7_200_000,    joined: 253, mark: '스테인리스 마크',       markEn: 'Stainless mark',      desc: '가입과 함께 열립니다. 첫 번째 할인, 평생 유지.', descEn: 'Opens on enrollment. First discount, held for life.' },
  { n: 'II',  ko: '셋의 표식',     en: 'The Three',          d: 1.5, gmv: 21_600_000,   joined: 104, mark: '시리얼 번호',           markEn: 'Numbered serial',     desc: '누적 ₩21.6M — 세 번의 공식 행사 초대, 시리얼 번호 부여.', descEn: '₩21.6M cumulative — three formal invitations, serial number issued.' },
  { n: 'III', ko: '정점',          en: 'The Apex',           d: 2.0, gmv: 50_400_000,   joined: 47,  mark: '10K 솔리드 골드 마크',  markEn: 'Solid 10K gold mark', desc: '10K 솔리드 골드 각인 마크. 연 2회 CEO 만찬.', descEn: 'Solid 10K gold engraved mark. Two annual CEO dinners.', apex: true },
  { n: 'IV',  ko: '볼트 순례',     en: 'Vault Pilgrimage',   d: 2.5, gmv: 93_600_000,   joined: 11,  mark: '싱가포르 볼트 방문',    markEn: 'Singapore vault visit', desc: 'Malca-Amit FTZ 현장 방문, 저녁 연회. 연 1회.', descEn: 'Malca-Amit FTZ on-site visit, private dinner. Once annually.' },
  { n: 'V',   ko: '평생의 표식',   en: 'Lifetime Mark',      d: 3.0, gmv: 144_000_000,  joined: 3,   mark: '평생 각인 · 이니셜',    markEn: 'Lifetime engraved · initials', desc: '이름 각인 금 마크. 보험 증서에 영구 기재.', descEn: 'Engraved gold mark with initials. Permanent on insurance certificate.' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SHARED — Ticker + optional Drop bar + Nav (matches homepage)
// ═══════════════════════════════════════════════════════════════════════════
function HybridNav() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 50%, ${T.goldDeep})`, borderRadius: 3, boxShadow: `0 0 14px ${T.goldGlow}` }} />
          <span style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '0.02em' }}>AURUM</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginLeft: 4 }}>001</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginLeft: 10, padding: '3px 8px', border: `1px solid ${T.goldBorder}` }}>FOUNDERS</span>
        </div>
        <div style={{ display: 'none', gap: 22 }} className="desktop-links">
          {['Home', 'GoldPath', 'Why', 'Vault'].map((s, i) => (
            <span key={i} style={{ fontFamily: T.sans, fontSize: 13, color: T.sub, cursor: 'pointer', fontWeight: 500 }}>{s}</span>
          ))}
        </div>
        <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '9px 18px', fontSize: 12, fontWeight: 700, fontFamily: T.sans, letterSpacing: '0.04em', borderRadius: 2 }}>
          파운더스 멤버십 예약 · Reserve Founders Membership →
        </button>
      </div>
      <style>{`@media (min-width: 720px) { .desktop-links { display: flex !important; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 03 — HERO · bilingual + live progress ring
// ═══════════════════════════════════════════════════════════════════════════
function FoundersHero() {
  const navigate = useNavigate();
  const totalJoined = GATES.reduce((s, g) => s + g.joined, 0);
  const CAP = 500;
  const pct = totalJoined / CAP;
  // SVG ring math: r=135 → C = 2πr ≈ 848
  const C = 2 * Math.PI * 135;
  const dashOffset = C * (1 - pct);

  return (
    <section style={{ padding: '60px 20px 80px', position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${T.border}` }}>
      {/* Atmospheric grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(197,165,114,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,114,0.035) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)' }} />
      {[0,1,2,3].map(i => (
        <div key={i} style={{ position: 'absolute', top: `${[20, 72, 30, 82][i]}%`, left: `${[6, 92, 94, 4][i]}%`, width: 3, height: 3, borderRadius: '50%', background: T.gold, boxShadow: `0 0 8px ${T.gold}`, animation: `drift ${6 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`, opacity: 0.5 }} />
      ))}

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center' }} className="hero-grid">
        {/* LEFT */}
        <div style={{ animation: 'fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>FOUNDERS PROGRAM</span>
            <span style={{ color: T.border }}>|</span>
            <span>MAX 500 PATRONS · EVER</span>
          </div>
          <h1 style={{ fontFamily: T.serifKr, fontWeight: 400, fontSize: 'clamp(40px, 7vw, 76px)', lineHeight: 1.03, letterSpacing: '-0.02em', margin: '0 0 14px', color: T.text }}>
            다섯 개의 문.
          </h1>
          <h2 style={{ fontFamily: T.serifKr, fontWeight: 400, fontSize: 'clamp(40px, 7vw, 76px)', lineHeight: 1.03, letterSpacing: '-0.02em', margin: '0 0 22px', color: T.text }}>
            <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>한 번 열리면 닫히지 않는다.</em>
          </h2>
          <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: T.goldD, lineHeight: 1.5, margin: '0 0 32px', fontWeight: 300 }}>
            Five gates. Once open, they never close.
          </p>
          <p style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.85, margin: '0 0 32px', maxWidth: 560, fontWeight: 300 }}>
            파운더스 프로그램은 Aurum의 첫 500명의 후원자에게만 열립니다. 각 게이트는 평생 유지되는 할인, 실물 마크, 그리고 관계입니다. 마감 후 다음 프로그램은 Gate 2 — 2028년에만 열립니다.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} className="reserve-btn" style={{ background: T.gold, border: 'none', color: T.bg, padding: '13px 24px', fontFamily: T.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span className="reserve-ko">파운더스 멤버십 예약</span><span className="reserve-en"> · Reserve Founders Membership</span> →
            </button>
            <button onClick={() => {
              const el = document.getElementById('gate-simulator');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '13px 24px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, cursor: 'pointer' }}>
              Calculate my gate ↓
            </button>
          </div>
        </div>

        {/* RIGHT — progress ring */}
        <div style={{ animation: 'fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both', animationDelay: '0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 320, height: 320, maxWidth: '100%' }}>
            <svg viewBox="0 0 320 320" width="100%" height="100%" style={{ animation: 'slow-pulse 4s ease-in-out infinite' }}>
              <defs>
                <linearGradient id="ringG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={T.goldB} />
                  <stop offset="50%" stopColor={T.gold} />
                  <stop offset="100%" stopColor={T.goldDeep} />
                </linearGradient>
                <filter id="ringGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {/* Outer hairline */}
              <circle cx="160" cy="160" r="150" fill="none" stroke={T.border} strokeWidth="0.5" />
              {/* Track */}
              <circle cx="160" cy="160" r="135" fill="none" stroke={T.border} strokeWidth="1" />
              {/* Progress arc */}
              <circle cx="160" cy="160" r="135" fill="none" stroke="url(#ringG)" strokeWidth="2.5"
                strokeDasharray={C} strokeDashoffset={dashOffset}
                transform="rotate(-90 160 160)" strokeLinecap="round" filter="url(#ringGlow)" />
              {/* Gate notches */}
              {GATES.map((g, i) => {
                const angle = (i / GATES.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const x1 = 160 + Math.cos(rad) * 128;
                const y1 = 160 + Math.sin(rad) * 128;
                const x2 = 160 + Math.cos(rad) * 142;
                const y2 = 160 + Math.sin(rad) * 142;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.gold} strokeWidth="0.8" opacity="0.6" />;
              })}
              {/* Center */}
              <text x="160" y="130" textAnchor="middle" fontFamily={T.mono} fontSize="10" fill={T.goldD} letterSpacing="6">PATRONS</text>
              <text x="160" y="180" textAnchor="middle" fontFamily={T.serif} fontStyle="italic" fontSize="72" fill={T.goldB} fontWeight="500">{totalJoined}</text>
              <text x="160" y="202" textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.muted} letterSpacing="4">OF {CAP}</text>
              <text x="160" y="230" textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.gold} letterSpacing="4">{(pct * 100).toFixed(1)}% FULL</text>
            </svg>
            <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', whiteSpace: 'nowrap' }}>
              · LIVE · UPDATED CONTINUOUSLY
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .hero-grid { grid-template-columns: 1.2fr 1fr !important; gap: 60px !important; }
        }
        @media (max-width: 480px) {
          .reserve-btn .reserve-en { display: none; }
          .reserve-btn { font-size: 12px !important; padding: 13px 18px !important; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 04 — THE FIVE GATES · interactive ladder
// ═══════════════════════════════════════════════════════════════════════════
function GateLadder() {
  const [activeIdx, setActiveIdx] = useState(2); // Apex default

  return (
    <section style={{ background: T.bg1, padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12, textTransform: 'uppercase' }}>II · 다섯 개의 문 · The Ladder</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: T.text, lineHeight: 1.1, margin: 0, letterSpacing: '-0.015em' }}>
            탭하여 게이트를 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>읽으세요.</em>
          </h2>
        </div>

        {/* Ladder rail */}
        <div style={{ position: 'relative', padding: '20px 0 30px' }}>
          {/* Horizontal connecting line */}
          <div style={{ position: 'absolute', top: '50%', left: '8%', right: '8%', height: 1, background: `linear-gradient(90deg, ${T.goldBorder}, ${T.gold}, ${T.goldBorder})`, transform: 'translateY(-50%)' }} />

          <div className="gate-ladder-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -24px', padding: '0 24px' }}>
          <div className="gate-ladder" style={{ display: 'grid', gridTemplateColumns: `repeat(${GATES.length}, minmax(88px, 1fr))`, gap: 8, position: 'relative' }}>
            {GATES.map((g, i) => {
              const active = activeIdx === i;
              // Only the ACTIVE circle gets a filled background — selection must be unambiguous.
              // Apex (Gate III) signals its prestige through a brighter permanent border + halo,
              // not through a permanent fill that competes with the active-state indicator.
              const bg = active
                ? (g.apex ? T.goldB : T.gold)
                : T.bg;
              const borderColor = active
                ? '#fff'
                : (g.apex ? T.goldB : T.goldBorder);
              const textColor = active
                ? T.bg
                : (g.apex ? T.goldB : T.gold);
              return (
                <button key={i} onClick={() => setActiveIdx(i)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: '20px 6px',
                  textAlign: 'center', position: 'relative', transition: 'all 0.3s',
                }}>
                  <div style={{
                    width: active ? 60 : 44, height: active ? 60 : 44, borderRadius: '50%',
                    margin: '0 auto 14px',
                    background: bg,
                    border: `${active ? 2 : 1.5}px solid ${borderColor}`,
                    boxShadow: active
                      ? '0 0 32px rgba(232,200,133,0.7)'
                      : (g.apex ? '0 0 14px rgba(232,200,133,0.25)' : 'none'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.serif, fontStyle: 'italic',
                    fontSize: active ? 24 : 18,
                    color: textColor,
                    fontWeight: 400, transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
                    position: 'relative', zIndex: 1,
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                  }}>{g.n}</div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 13, color: active ? T.text : T.sub, fontWeight: active ? 600 : 500, lineHeight: 1.3 }}>{g.ko}</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 10, color: active ? T.gold : T.goldD, marginTop: 2 }}>{g.en}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: '0.16em', marginTop: 8 }}>{g.joined} · PATRONS</div>
                </button>
              );
            })}
          </div>
          </div>
          <style>{`
            .gate-ladder-scroll::-webkit-scrollbar { height: 4px; }
            .gate-ladder-scroll::-webkit-scrollbar-track { background: transparent; }
            .gate-ladder-scroll::-webkit-scrollbar-thumb { background: rgba(197,165,114,0.3); }
          `}</style>
        </div>

        {/* Active gate detail card */}
        <div key={activeIdx} style={{
          background: T.card, border: `1px solid ${GATES[activeIdx].apex ? T.goldBorderS : T.goldBorder}`,
          padding: '32px 28px', position: 'relative',
          animation: 'fade-up 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${GATES[activeIdx].apex ? T.goldB : T.gold}, transparent)` }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }} className="gate-detail-grid">
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
                GATE {GATES[activeIdx].n} {GATES[activeIdx].apex && '· APEX'}
              </div>
              <div style={{ fontFamily: T.serifKr, fontSize: 28, color: T.text, fontWeight: 500, lineHeight: 1.1 }}>{GATES[activeIdx].ko}</div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.goldD, marginTop: 4 }}>{GATES[activeIdx].en}</div>
            </div>
            <div>
              <p style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.75, margin: '0 0 20px', fontWeight: 300 }}>
                {GATES[activeIdx].desc}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, paddingTop: 18, borderTop: `1px dashed ${T.border}` }}>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 4 }}>THRESHOLD</div>
                  <div style={{ fontFamily: T.mono, fontSize: 15, color: T.text, fontWeight: 500 }}>{fmtManEok(GATES[activeIdx].gmv)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 4 }}>DISCOUNT · FOREVER</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, color: GATES[activeIdx].apex ? T.goldB : T.gold, fontWeight: 500, lineHeight: 1 }}>
                    −{GATES[activeIdx].d}%
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 4 }}>MARK</div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 13, color: T.text, fontWeight: 500 }}>{GATES[activeIdx].mark}</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 2 }}>{GATES[activeIdx].markEn}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 4 }}>PATRONS</div>
                  <div style={{ fontFamily: T.mono, fontSize: 15, color: T.gold }}>{GATES[activeIdx].joined}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>of ~{Math.round(500 * (activeIdx === 0 ? 0.6 : activeIdx === 1 ? 0.25 : activeIdx === 2 ? 0.1 : activeIdx === 3 ? 0.04 : 0.01))} expected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media (min-width: 768px) { .gate-detail-grid { grid-template-columns: 220px 1fr !important; gap: 40px !important; } }`}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 05 — SIMULATOR · the conversion crown jewel
// ═══════════════════════════════════════════════════════════════════════════
function GateSimulator() {
  const navigate = useNavigate();
  const [monthly, setMonthly] = useState(500_000);
  const [horizon, setHorizon] = useState(60);
  const [cagr, setCagr] = useState(DEFAULT_CAGR);

  const sim = useMemo(() => {
    const totalGMV = monthly * horizon;
    let gatesHit = [];
    let monthsToGate = [];
    for (const g of GATES) {
      if (totalGMV >= g.gmv) {
        gatesHit.push(g);
        monthsToGate.push({ ...g, month: Math.ceil(g.gmv / monthly) });
      }
    }
    const currentGate = gatesHit.length > 0 ? gatesHit[gatesHit.length - 1] : null;
    const nextGate = GATES[gatesHit.length];
    const monthsToNext = nextGate ? Math.ceil(nextGate.gmv / monthly) : null;

    // Projected end value using CAGR — monthly compounding on accumulated grams
    // Simplified model: each monthly contribution grows at (1+cagr)^(remainingYears)
    const years = horizon / 12;
    const monthlyRate = Math.pow(1 + cagr, 1/12) - 1;
    let projectedValue = 0;
    for (let m = 0; m < horizon; m++) {
      const remainingMonths = horizon - m;
      projectedValue += monthly * Math.pow(1 + monthlyRate, remainingMonths);
    }

    return { totalGMV, gatesHit, monthsToGate, currentGate, nextGate, monthsToNext, projectedValue };
  }, [monthly, horizon, cagr]);

  const pctMonthly = (monthly - 200_000) / (5_000_000 - 200_000) * 100;
  const pctHorizon = (horizon - 12) / (120 - 12) * 100;

  return (
    <section id="gate-simulator" style={{ padding: '80px 20px', borderBottom: `1px solid ${T.border}`, scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12 }}>III · 시뮬레이터 · Simulator</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: T.text, lineHeight: 1.1, margin: '0 0 12px', letterSpacing: '-0.015em' }}>
            당신의 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>경로를 그려보세요.</em>
          </h2>
          <p style={{ fontFamily: T.serifKr, fontSize: 15, color: T.sub, lineHeight: 1.75, margin: 0, maxWidth: 620, fontWeight: 300 }}>
            월 적립액과 기간을 조정하면 어떤 게이트를 지나는지, 언제 도달하는지를 보여줍니다. 결과는 보여드리는 것이지 약속이 아닙니다.
          </p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }} className="sim-grid">
            {/* LEFT — inputs */}
            <div style={{ padding: 30, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.22em', marginBottom: 24 }}>INPUTS</div>

              {/* Monthly */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.2em' }}>월 적립액 · MONTHLY</span>
                  <span style={{ fontFamily: T.mono, fontSize: 16, color: T.goldB, fontWeight: 600 }}>{fmtManEok(monthly)}</span>
                </div>
                <input type="range" min={200000} max={5000000} step={100000} value={monthly}
                  onChange={e => setMonthly(+e.target.value)}
                  style={{ '--pct': `${pctMonthly}%` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
                  <span>₩200K</span><span>₩5M</span>
                </div>
              </div>

              {/* Horizon */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.2em' }}>기간 · HORIZON</span>
                  <span style={{ fontFamily: T.mono, fontSize: 16, color: T.goldB, fontWeight: 600 }}>{horizon}개월 · {Math.round(horizon / 12 * 10) / 10}년</span>
                </div>
                <input type="range" min={12} max={120} step={6} value={horizon}
                  onChange={e => setHorizon(+e.target.value)}
                  style={{ '--pct': `${pctHorizon}%` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
                  <span>1yr</span><span>10yr</span>
                </div>
              </div>

              {/* CAGR toggle · 5/10/15/20/25 */}
              <div style={{ marginBottom: 24 }}>
                <CagrToggle value={cagr} onChange={setCagr} compact />
              </div>

              <div style={{ background: T.deepBlack, border: `1px dashed ${T.border}`, padding: 16, fontFamily: T.mono, fontSize: 11 }}>
                {/* HERO · twin large values above the line */}
                <div style={{ paddingBottom: 14, borderBottom: `1px dashed ${T.goldBorder}`, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ color: T.gold, letterSpacing: '0.24em', fontSize: 10, fontWeight: 600 }}>CUMULATIVE GMV</span>
                    <span style={{ color: T.text, fontFamily: T.serif, fontStyle: 'italic', fontSize: 26, fontWeight: 500 }}>{fmtManEok(sim.totalGMV)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: (T.green || '#4ade80'), letterSpacing: '0.24em', fontSize: 10, fontWeight: 600 }}>PROJECTED @ {(cagr * 100).toFixed(0)}% · {horizon / 12}yr</span>
                    <span style={{ color: (T.green || '#4ade80'), fontFamily: T.serif, fontStyle: 'italic', fontSize: 26, fontWeight: 500 }}>{fmtManEok(sim.projectedValue)}</span>
                  </div>
                </div>

                {/* Small rows below */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: T.muted, letterSpacing: '0.2em', fontSize: 9 }}>GAIN · vs input</span>
                  <span style={{ color: (sim.projectedValue >= sim.totalGMV) ? (T.green || '#4ade80') : T.red, fontWeight: 600 }}>
                    +{sim.totalGMV > 0 ? (((sim.projectedValue / sim.totalGMV) - 1) * 100).toFixed(1) : '0'}%
                    <span style={{ color: T.muted, fontSize: 9, marginLeft: 6 }}>
                      · {fmtManEok(Math.max(0, sim.projectedValue - sim.totalGMV))}
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: T.muted, letterSpacing: '0.2em', fontSize: 9 }}>DISCOUNT · FOREVER</span>
                  <span style={{ color: T.goldB, fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 500 }}>
                    −{sim.currentGate ? sim.currentGate.d : 0}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px dashed ${T.goldBorder}` }}>
                  <span style={{ color: T.muted, letterSpacing: '0.2em', fontSize: 9 }}>FOUNDERS SAVINGS · lifetime</span>
                  <span style={{ color: (T.green || '#4ade80'), fontWeight: 600 }}>
                    {fmtManEok(sim.currentGate ? sim.totalGMV * sim.currentGate.d / 100 : 0)}
                    <span style={{ color: T.muted, fontSize: 9, marginLeft: 6 }}>
                      · {sim.currentGate ? sim.currentGate.d : 0}% × GMV
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — outputs */}
            <div style={{ padding: 30, background: 'linear-gradient(180deg, #0a0906, #060504)' }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.22em', marginBottom: 20 }}>YOUR JOURNEY</div>

              {/* Gate timeline */}
              <div style={{ marginBottom: 24 }}>
                {GATES.map((g, i) => {
                  const hit = sim.gatesHit.find(h => h.n === g.n);
                  const monthsToThis = Math.ceil(g.gmv / monthly);
                  const reachable = monthsToThis <= horizon;
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 90px', gap: 14,
                      padding: '12px 0', borderBottom: i < GATES.length - 1 ? `1px dashed ${T.border}` : 'none',
                      alignItems: 'center',
                      opacity: reachable ? 1 : 0.35, transition: 'opacity 0.3s',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: hit ? (g.apex ? T.gold : T.goldGlow) : T.bg,
                        border: `1px solid ${hit ? (g.apex ? T.goldB : T.goldBorderS) : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: T.serif, fontStyle: 'italic', fontSize: 14,
                        color: hit ? (g.apex ? T.bg : T.goldB) : T.muted, fontWeight: 500,
                      }}>{g.n}</div>
                      <div>
                        <div style={{ fontFamily: T.serifKr, fontSize: 14, color: hit ? T.text : T.muted, fontWeight: 500, lineHeight: 1.2 }}>{g.ko}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.12em', marginTop: 2 }}>
                          {reachable ? `MONTH ${monthsToThis} · ${Math.round(monthsToThis / 12 * 10) / 10}Y` : 'BEYOND HORIZON'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: hit ? (g.apex ? T.goldB : T.gold) : T.muted, fontWeight: 500, lineHeight: 1 }}>
                          −{g.d}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verdict */}
              <div style={{ padding: '16px 18px', background: T.bg3, border: `1px solid ${T.goldBorder}` }}>
                {sim.currentGate ? (
                  <>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.2em', marginBottom: 6 }}>OUTCOME</div>
                    <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, lineHeight: 1.5, fontWeight: 400 }}>
                      <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.goldB }}>{sim.currentGate.ko}</em>까지 도달.
                      {sim.nextGate && ` 다음 게이트까지 ${sim.monthsToNext - horizon}개월 더.`}
                    </div>
                  </>
                ) : (
                  <div style={{ fontFamily: T.serifKr, fontSize: 14, color: T.sub, lineHeight: 1.6 }}>
                    아직 첫 번째 게이트에 도달하지 않았습니다. 기간을 늘리거나 월 적립액을 ₩600K+ 로 조정해보세요.
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/signup')} style={{ width: '100%', marginTop: 18, background: T.gold, color: T.bg, padding: 14, fontFamily: T.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', cursor: 'pointer' }}>
                {sim.currentGate ? `${sim.currentGate.n}등급으로 신청 →` : 'Reserve Founders Membership →'}
              </button>
            </div>
          </div>

          <style>{`
            @media (min-width: 820px) {
              .sim-grid { grid-template-columns: 1fr 1fr !important; }
              .sim-grid > div:first-child { border-bottom: none !important; border-right: 1px solid ${T.border} !important; }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 06 — LAUNCH GIFT DROP GRID
// ═══════════════════════════════════════════════════════════════════════════
function LaunchGiftGrid() {
  const tiers = [
    { n: 'I',   ko: '브론즈',   min: '₩200K', gift: '₩50K',  joined: 142 },
    { n: 'II',  ko: '실버',     min: '₩500K', gift: '₩150K', joined: 68 },
    { n: 'III', ko: '골드',     min: '₩1M',   gift: '₩400K', joined: 29, feat: true },
    { n: 'IV',  ko: '플래티넘', min: '₩2M',   gift: '₩1.5M', joined: 10 },
    { n: 'V',   ko: '소브린',   min: '₩5M',   gift: '₩5M',   joined: 4 },
  ];
  return (
    <section style={{ background: T.bg1, padding: '80px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12 }}>IV · LAUNCH GIFT · 론치</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: T.text, lineHeight: 1.05, margin: 0, letterSpacing: '-0.02em' }}>
              가입 즉시, <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>금으로.</em>
            </h2>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.goldD, letterSpacing: '0.2em' }}>253 / 500</div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: '50.6%', height: '100%', background: `linear-gradient(90deg, ${T.goldB}, ${T.gold})`, boxShadow: `0 0 12px ${T.goldGlow}` }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
            {tiers.map((t, i) => (
              <div key={i} style={{
                padding: '32px 18px 24px', textAlign: 'center',
                borderRight: i < tiers.length - 1 ? `1px solid ${T.border}` : 'none',
                borderTop: `1px solid ${T.border}`,
                background: t.feat ? T.goldGlow : 'transparent', position: 'relative',
              }}>
                {t.feat && (
                  <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: T.mono, fontSize: 8, color: T.goldB, letterSpacing: '0.22em', background: T.deepBlack, padding: '3px 8px', border: `1px solid ${T.goldBorder}` }}>
                    MOST PICKED
                  </div>
                )}
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 44, color: t.feat ? T.goldB : T.gold, fontWeight: 500, lineHeight: 1, marginTop: t.feat ? 12 : 0 }}>{t.n}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.text, fontWeight: 600, marginTop: 10 }}>{t.ko}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 18, letterSpacing: '0.16em' }}>MONTHLY</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.sub, marginTop: 3 }}>{t.min}+</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, marginTop: 14, letterSpacing: '0.16em' }}>LAUNCH GIFT</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, color: t.feat ? T.goldB : T.gold, fontWeight: 600, marginTop: 3 }}>{t.gift}</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 16, letterSpacing: '0.16em', borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
                  {t.joined} joined
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══ THE TRANSITION STRIPE · most important UX moment on the page ═══
// ═══════════════════════════════════════════════════════════════════════════
function TransitionStripe() {
  return (
    <section style={{
      padding: '100px 20px 90px',
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 50%, ${T.bg1} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        {/* Seal ornament · centered above text, no overlap */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: `1px solid ${T.goldBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: T.bg, margin: '0 auto 28px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 25%, ${T.goldB}, ${T.gold} 50%, ${T.goldDeep})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.serif, fontStyle: 'italic', color: T.bg, fontSize: 13, fontWeight: 600,
            letterSpacing: '-0.02em',
          }}>Au</div>
        </div>
        {/* Three-dot spacer */}
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 22, textTransform: 'uppercase' }}>
          · · ·
        </div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(22px, 3.5vw, 32px)', color: T.gold, lineHeight: 1.5, fontWeight: 300 }}>
          Beyond the drop,<br/>
          <span style={{ color: T.goldB }}>the program.</span>
        </div>
        <div style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.85, marginTop: 18, maxWidth: 540, margin: '18px auto 0', fontWeight: 300 }}>
          지금까지는 숫자였습니다. 이제부터는 관계입니다.
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 07 — PATRON ARC (V4 register begins)
// ═══════════════════════════════════════════════════════════════════════════
function PatronArc() {
  const patrons = [
    {
      by: 'K.H. · Seoul · Family Office · Gate III',
      arc: 'Bronze를 여름에 열고 Silver까지 5개월. 그해 겨울 Apex로 들어갔다. 왜 그렇게 빠르게 움직였냐고 물으면, 답은 간단하다. 문이 아직 열려 있는 동안이었다.',
      en: 'Opened Bronze in summer, reached Silver in five months, entered Apex that winter. Why move so fast? Simple. The door was still open.'
    },
    {
      by: 'J.S. · Singapore · Financial Services · Gate IV',
      arc: '금융업에서 20년을 보냈다. 상품은 많다. 그러나 이것은 상품이 아니라 하나의 약속이었다. 같은 조건으로 평생. 나는 볼트 순례까지 갔고, 그곳에서 내 이름을 새긴 바를 만졌다.',
      en: 'Twenty years in finance. Many products. This was not a product — it was a promise. The same terms, for life. I went to the Vault Pilgrimage and touched the bar with my name on it.'
    },
    {
      by: 'M.C. · Busan · Industrialist · Gate V',
      arc: '아버지는 1985년에 골드바 하나를 샀다. 37년 후, 나는 Aurum의 평생의 표식에 가입했다. 이유는 같다. 세대를 넘어 남는 것.',
      en: 'My father bought one gold bar in 1985. Thirty-seven years later I joined Aurum\'s Lifetime Mark. Same reason. What remains across generations.'
    },
  ];
  return (
    <section style={{ padding: '80px 20px 100px', background: T.bg }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 40, textAlign: 'center', textTransform: 'uppercase' }}>
          · Patron Arcs ·
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 56 }}>
          {patrons.map((p, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.sub, lineHeight: 1.85, marginBottom: 14, fontWeight: 300 }}>
                {p.arc}
              </div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD, lineHeight: 1.7, marginBottom: 20 }}>
                {p.en}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', textTransform: 'uppercase', borderTop: `1px solid ${T.goldBorder}`, paddingTop: 12 }}>
                {p.by}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 08 — VAULT PILGRIMAGE · photographic spread
// ═══════════════════════════════════════════════════════════════════════════
function VaultPilgrimage() {
  const Photo = ({ children, tag, cap, style = {} }) => (
    <div style={{
      ...style, position: 'relative', overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 30% 40%, rgba(197,165,114,0.08) 0%, transparent 55%),
        repeating-linear-gradient(38deg, #1a1712, #1a1712 2px, #0d0b08 2px, #0d0b08 7px)
      `,
      border: `1px solid ${T.goldBorder}`,
    }}>
      {children}
      <div style={{ position: 'absolute', top: 14, left: 16, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em' }}>
        {tag}
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD }}>
        {cap}
      </div>
    </div>
  );

  return (
    <section style={{ padding: '80px 20px', background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12 }}>V · VAULT PILGRIMAGE · 볼트 순례</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 500, color: T.text, lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-0.015em' }}>
            게이트 IV 후원자는 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>싱가포르로 갑니다.</em>
          </h2>
          <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldD, lineHeight: 1.5, margin: 0, maxWidth: 620 }}>
            Malca-Amit FTZ · dinner at a private Changi address · ceremonial presentation of the solid gold mark.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} className="pilgrim-grid">
          <Photo tag="FIG. I — VAULT ENTRY" cap="Security interlock, 보안 인터락" style={{ height: 380, gridColumn: 'span 2' }}>
            <svg viewBox="0 0 600 380" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="doorG" x1="0%" x2="100%"><stop offset="0%" stopColor="#0a0806"/><stop offset="50%" stopColor="#2a2418"/><stop offset="100%" stopColor="#0a0806"/></linearGradient>
              </defs>
              <rect x="200" y="60" width="200" height="280" fill="url(#doorG)" stroke={T.gold} strokeWidth="0.5" opacity="0.7" />
              <circle cx="300" cy="200" r="30" fill="none" stroke={T.gold} strokeWidth="1" opacity="0.6" />
              <circle cx="300" cy="200" r="40" fill="none" stroke={T.gold} strokeWidth="0.5" opacity="0.3" />
              <rect x="298" y="170" width="4" height="60" fill={T.gold} opacity="0.7" />
              <rect x="270" y="198" width="60" height="4" fill={T.gold} opacity="0.7" />
            </svg>
          </Photo>
          <Photo tag="FIG. II — BARS" cap="Allocated storage, 분배 보관" style={{ height: 220 }}>
            <svg viewBox="0 0 300 220" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              {[0,1,2].map(i => (
                <rect key={i} x={50 + i * 20} y={80 - i * 15} width="200" height="50"
                  fill={`url(#barG${i})`} stroke={T.goldB} strokeWidth="0.3" opacity={0.85 - i * 0.15} />
              ))}
              <defs>
                {[0,1,2].map(i => (
                  <linearGradient key={i} id={`barG${i}`} x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#2a2418"/><stop offset="40%" stopColor="#C5A572"/><stop offset="60%" stopColor="#E3C187"/><stop offset="100%" stopColor="#6a5a3a"/>
                  </linearGradient>
                ))}
              </defs>
            </svg>
          </Photo>
          <Photo tag="FIG. III — DINNER" cap="Private Changi address" style={{ height: 220 }}>
            <svg viewBox="0 0 300 220" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="150" cy="110" r="70" fill="none" stroke={T.goldBorder} strokeWidth="0.5" />
              <circle cx="150" cy="110" r="58" fill="none" stroke={T.goldBorder} strokeWidth="0.5" />
              <line x1="90" y1="110" x2="210" y2="110" stroke={T.goldBorder} strokeWidth="0.5" />
              <line x1="150" y1="60" x2="150" y2="160" stroke={T.goldBorder} strokeWidth="0.5" />
              {[0,1,2,3].map(i => {
                const angle = (i * 90 + 45) * Math.PI / 180;
                const x = 150 + Math.cos(angle) * 65;
                const y = 110 + Math.sin(angle) * 65;
                return <circle key={i} cx={x} cy={y} r="6" fill={T.gold} opacity="0.6" />;
              })}
            </svg>
          </Photo>
        </div>

        <style>{`@media (min-width: 820px) { .pilgrim-grid { grid-template-columns: 2fr 1fr 1fr !important; } .pilgrim-grid > div:first-child { grid-column: span 1 !important; grid-row: span 2 !important; } }`}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 09 — THE MARK · physical object reverence
// ═══════════════════════════════════════════════════════════════════════════
function TheMark() {
  const [markIdx, setMarkIdx] = useState(2); // default Gold · apex
  const marks = [
    {
      gate: 'GATE I',
      name: '스테인리스 마크',
      nameEn: 'Stainless Mark',
      spec: 'SS316L · 8g · 시리얼 각인',
      purity: 'SS',
      desc: '산화하지 않는 철강. 손바닥 절반 크기. 각 마크에 고유 시리얼이 음각으로 들어갑니다. 첫 게이트의 증표.',
      tone: 'steel',
    },
    {
      gate: 'GATE II',
      name: '실버 마크',
      nameEn: 'Silver Mark',
      spec: '999.9 Silver · 10g · 이니셜 각인',
      purity: '999.9',
      desc: '순은. Founding 500 시리얼. 이니셜 각인 선택. 실버 게이트 달성의 표식.',
      tone: 'silver',
    },
    {
      gate: 'GATE III',
      name: '10K 솔리드 골드 마크',
      nameEn: 'Solid 10K Gold Mark',
      spec: '10K Gold · 12g · 이니셜 각인',
      purity: '10K',
      desc: '10K 솔리드 골드. 손바닥 크기. 고유 시리얼. 도장 인식 번호는 Aurum의 영구 기록부에 남습니다. APEX 게이트의 증표.',
      tone: 'gold',
      apex: true,
    },
    {
      gate: 'GATE IV',
      name: '플래티넘 마크',
      nameEn: 'Platinum Mark',
      spec: 'Pt 950 · 15g · 서명 각인',
      purity: 'Pt',
      desc: '플래티넘. 후원 일자 및 손글씨 서명 각인. 볼트 순례 시 CEO가 직접 전달합니다.',
      tone: 'platinum',
    },
    {
      gate: 'GATE V',
      name: '24K 소브린 마크',
      nameEn: 'Sovereign 24K Mark',
      spec: '24K Gold · 50g · 평생 각인',
      purity: '24K',
      desc: '24K 순금. 개인 이니셜과 후원 일자 각인. 보험 증서에 영구 기재. 5인 한정. 상속 설계 문서와 함께 전달.',
      tone: 'gold',
      sovereign: true,
    },
  ];
  const m = marks[markIdx];

  // Visual tone per mark
  const toneStyle = {
    steel:    { g1: '#d8dadd', g2: '#a8adb4', g3: '#6a6e75', g4: '#2a2d32' },
    silver:   { g1: '#f0f2f5', g2: '#d0d4db', g3: '#8a8f98', g4: '#3a3f48' },
    gold:     { g1: T.goldB,   g2: T.gold,    g3: T.goldDeep, g4: '#3a2f1c' },
    platinum: { g1: '#e8ebf0', g2: '#b8c0cc', g3: '#7a8290', g4: '#2a2f38' },
  };
  const tone = toneStyle[m.tone];

  return (
    <section style={{ padding: '100px 20px', background: T.bg }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 14, textTransform: 'uppercase' }}>VI · The Mark</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 500, color: T.text, lineHeight: 1.1, margin: 0, letterSpacing: '-0.015em' }}>
            손에 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>쥘 수 있는 것.</em>
          </h2>
        </div>

        {/* 5-gate Mark selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 48, flexWrap: 'wrap' }}>
          {marks.map((mk, i) => {
            const active = i === markIdx;
            return (
              <button key={i} onClick={() => setMarkIdx(i)} style={{
                background: active ? (mk.apex ? T.gold : T.goldGlow) : 'transparent',
                border: `1px solid ${active ? (mk.apex ? T.goldB : T.goldBorderS) : T.border}`,
                color: active ? (mk.apex ? T.bg : T.gold) : T.sub,
                padding: '8px 16px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer',
                transition: 'all 0.25s',
                fontWeight: active ? 700 : 500,
              }}>
                {mk.gate}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center' }} className="mark-grid">
          {/* Mark visual — tone-aware */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <div key={markIdx} style={{
              width: 260, height: 260, borderRadius: '50%',
              background: `radial-gradient(circle at 32% 28%, ${tone.g1}, ${tone.g2} 40%, ${tone.g3} 78%, ${tone.g4})`,
              boxShadow: `0 25px 60px ${m.apex || m.sovereign ? T.goldGlow : 'rgba(0,0,0,0.4)'}, inset 0 -20px 40px rgba(0,0,0,0.4), inset 0 15px 30px rgba(255,255,255,0.2)`,
              position: 'relative',
              animation: 'slow-pulse 6s ease-in-out infinite, fade-up 0.4s cubic-bezier(0.2,0.8,0.2,1)',
            }}>
              <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: `1px solid rgba(0,0,0,0.25)` }} />
              <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', border: `1px solid rgba(0,0,0,0.15)` }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: tone.g4 }}>
                <div style={{
                  width: 90, height: 90,
                  border: `2.2px solid ${tone.g4}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.serif, fontStyle: 'italic', fontSize: 56, fontWeight: 500,
                  letterSpacing: '-0.03em', lineHeight: 1,
                  marginBottom: 12,
                }}>Au</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '0.42em', fontWeight: 700 }}>{m.purity}</div>
                <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '0.3em', marginTop: 10, opacity: 0.6 }}>
                  FNDR·{m.gate.split(' ')[1]} · #{String(29 + markIdx * 17).padStart(3, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Mark spec */}
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.24em', marginBottom: 10 }}>
              {m.gate} {m.apex && '· APEX'} {m.sovereign && '· SOVEREIGN · 5인 한정'}
            </div>
            <h3 style={{ fontFamily: T.serifKr, fontSize: 32, color: T.text, fontWeight: 500, lineHeight: 1.1, margin: '0 0 6px', letterSpacing: '-0.015em' }}>
              {m.name}
            </h3>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.goldD, marginBottom: 22 }}>{m.nameEn}</div>
            <p style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.85, margin: '0 0 28px', fontWeight: 300 }}>
              {m.desc}
            </p>
            <div style={{ borderTop: `1px solid ${T.goldBorder}`, paddingTop: 18 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 6 }}>SPECIFICATION</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em' }}>{m.spec}</div>
            </div>
          </div>
        </div>

        <style>{`@media (min-width: 820px) { .mark-grid { grid-template-columns: 1fr 1fr !important; gap: 80px !important; } }`}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 10 — SPEAKING WITH THE FOUNDERS · final CTA
// ═══════════════════════════════════════════════════════════════════════════
function SpeakingWithFounders() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: '100px 20px 120px', background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.34em', marginBottom: 24, textTransform: 'uppercase' }}>VII · Speaking</div>
        <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(34px, 5.5vw, 52px)', fontWeight: 400, color: T.text, lineHeight: 1.15, margin: '0 0 26px', letterSpacing: '-0.015em' }}>
          신청이 아닙니다.<br/>
          <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>대화입니다.</em>
        </h2>
        <p style={{ fontFamily: T.serifKr, fontSize: 17, color: T.sub, lineHeight: 1.85, margin: '0 0 44px', fontWeight: 300 }}>
          파운더스 프로그램에 들어오는 방식은 폼을 제출하는 것이 아닙니다. 45분의 통화입니다. 당신이 누구인지, 왜 지금인지, 어떤 게이트가 맞는지. 그리고 만약 맞지 않는다면, 솔직하게 말씀드립니다.
        </p>
        <button onClick={() => navigate('/signup')} className="reserve-btn" style={{
          background: T.gold, border: 'none',
          color: T.bg, padding: '16px 32px',
          fontFamily: T.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
          cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.target.style.background = T.goldB; }}
        onMouseLeave={e => { e.target.style.background = T.gold; }}>
          <span className="reserve-ko">파운더스 멤버십 예약</span><span className="reserve-en"> · Reserve Founders Membership</span> →
        </button>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 22, letterSpacing: '0.2em' }}>
          · 45 MIN · KOREAN OR ENGLISH · NO PREPARATION REQUIRED ·
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Footer · colophon register
// ═══════════════════════════════════════════════════════════════════════════
function FoundersFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${T.goldBorder}`, padding: '60px 24px 56px', background: T.deepBlack, textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <AUSquare size={36} />
        <AurumWordmark size={18} serial="MMXXVI" />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.32em' }}>
        QUIETLY · FOREVER
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEV CHROME — toggle top bars only
// ═══════════════════════════════════════════════════════════════════════════
function DevChrome({ drop, setDrop }) {
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(14,12,8,0.96)', backdropFilter: 'blur(14px)',
      border: `1px solid ${T.goldBorder}`, padding: 10, zIndex: 999,
      display: 'flex', gap: 8, fontFamily: T.mono, fontSize: 10,
      maxWidth: 'calc(100vw - 32px)', flexWrap: 'wrap', justifyContent: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    }}>
      <span style={{ color: T.goldD, letterSpacing: '0.18em', padding: '5px 8px' }}>/FOUNDERS MOCKUP</span>
      <span style={{ color: T.border, padding: '0 2px', alignSelf: 'center' }}>│</span>
      <span style={{ color: T.goldD, letterSpacing: '0.18em', padding: '5px 2px', alignSelf: 'center' }}>DROP</span>
      <button onClick={() => setDrop(!drop)} style={{
        padding: '5px 12px', background: drop ? T.goldGlow : 'transparent',
        border: `1px solid ${drop ? T.goldBorderS : T.border}`,
        color: drop ? T.gold : T.sub, fontFamily: T.mono, fontSize: 10,
        letterSpacing: '0.14em', cursor: 'pointer',
      }}>{drop ? 'LIVE' : 'OFF'}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// NEW · SCREENSHOT 1 · SilentHouse · 침묵으로 운영되는 한 집
// Sits ABOVE FoundersHero. Sets the tone before the Roman-numeral gate ladder.
// ═══════════════════════════════════════════════════════════════════════════
function SilentHouse() {
  return (
    <section style={{ padding: '96px 24px 80px', background: T.bg, borderBottom: `1px solid ${T.border}`, position: 'relative' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.32em', marginBottom: 28, textTransform: 'uppercase' }}>
          ESTD MMXXIV · SINGAPORE · <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.goldD }}>비공개</em>
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(44px, 7vw, 96px)', fontWeight: 400, color: T.text, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0, marginBottom: 72 }}>
          침묵으로 운영되는<br/>
          <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500, marginLeft: '0.15em' }}>한 집.</em>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'start' }} className="silent-grid">
          <p style={{ fontFamily: T.serifKr, fontSize: 15, fontWeight: 300, color: T.sub, lineHeight: 1.85, margin: 0, maxWidth: 460 }}>
            금은 속삭이지 않아도 들립니다. 세대를 건너갈 자산은 광고하지 않습니다. Aurum은 오백 가구를 넘지 않습니다. 설계자와 일대일로, 한 번에 한 집씩.
          </p>

          <div style={{ borderLeft: `1px solid ${T.goldBorder}`, paddingLeft: 28 }}>
            <blockquote style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: T.gold, lineHeight: 1.4, margin: 0, marginBottom: 14 }}>
              "조용한 자산만이 오래 살아남는다."
            </blockquote>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              — CEO, <em style={{ fontFamily: T.serif, fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.02em' }}>설립자 서한</em>
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 820px) { .silent-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW · SCREENSHOT 2 · FiveDuties · §III 다섯 가지 의무 · 한 집에 대한 약속
// 5-column grid with Roman numerals I-V, each a sovereign promise.
// ═══════════════════════════════════════════════════════════════════════════
function FiveDuties() {
  const duties = [
    { n: 'I',   title: '전담 설계자', desc: '한 집에 한 설계자. 취향과 상속 시점을 기억합니다. 분기 대면.' },
    { n: 'II',  title: '볼트 순례',   desc: '싱가포르 Malca-Amit FTZ 연 1회 방문. Fullerton 스위트, Brink\'s 동반.' },
    { n: 'III', title: '솔리드 골드 마크', desc: '10K 회원 한정. Hallmarked 24K 각인. 평생 유효.' },
    { n: 'IV',  title: '상속 설계', desc: '세대 간 이전 설계. 법률·세무·의료 보호와 통합. 서울 변호사와 공동 작업.' },
    { n: 'V',   title: '조용한 유동성', desc: '72시간 이내 원화. 혹은 바 실물 — 프라이빗 채널. 시장 노출 0.' },
  ];
  return (
    <section style={{ padding: '90px 24px 90px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.gold, marginBottom: 16, letterSpacing: '0.02em' }}>
            § III · 다섯 가지 의무
          </div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, color: T.text, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
            한 집에 대한 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>약속.</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: `1px solid ${T.goldBorder}`, borderBottom: `1px solid ${T.goldBorder}` }} className="duties-grid">
          {duties.map((d, i) => (
            <div key={i} style={{ padding: '36px 28px 36px 28px', borderRight: i < duties.length - 1 ? `1px solid ${T.border}` : 'none', position: 'relative' }}>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 38, color: T.gold, lineHeight: 1, marginBottom: 34, fontWeight: 500 }}>
                {d.n}
              </div>
              <div style={{ fontFamily: T.serifKr, fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 14, lineHeight: 1.3 }}>
                {d.title}
              </div>
              <p style={{ fontFamily: T.serifKr, fontSize: 12.5, fontWeight: 300, color: T.sub, lineHeight: 1.65, margin: 0 }}>
                {d.desc}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 960px) {
            .duties-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .duties-grid > div { border-right: 1px solid ${T.border} !important; border-bottom: 1px solid ${T.border} !important; }
          }
          @media (max-width: 540px) {
            .duties-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW · SCREENSHOT 3 · PilgrimageTimeline · §IV 순례 · 당신의 금을 만나는 주말
// 6-point horizontal timeline · weekend ritual
// ═══════════════════════════════════════════════════════════════════════════
function PilgrimageTimeline() {
  const stops = [
    { t: '금 · 18:30', title: '인천 · Business', sub: '전용 라운지 픽업' },
    { t: '토 · 01:20', title: '창이 도착',       sub: 'Rolls 동반 Fullerton' },
    { t: '토 · 아침',  title: '마리나 조식',     sub: '설계자와 대면 1h' },
    { t: '일 · 오전',  title: '볼트 접근',       sub: 'Malca-Amit · Brink\'s' },
    { t: '일 · 저녁',  title: '프라이빗 디너',   sub: 'ODETTE 개인 룸' },
    { t: '월 · 10:00', title: '창이 출국',       sub: '서류 · 감사 보고서 인수' },
  ];
  return (
    <section style={{ padding: '90px 24px 90px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, marginBottom: 56, alignItems: 'start' }} className="pilg-head">
          <div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.gold, marginBottom: 16, letterSpacing: '0.02em' }}>
              § IV · 순례
            </div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, color: T.text, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
              당신의 금을<br/>
              <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>만나는 주말.</em>
            </h2>
          </div>
          <p style={{ fontFamily: T.serifKr, fontSize: 14, fontWeight: 300, color: T.sub, lineHeight: 1.85, margin: 0, maxWidth: 460, paddingTop: 8 }}>
            연 1회. 일등석 인천-창이. Fullerton Bay 스위트 2박. 일요일 오전, 금고 실내 접근 — Malca-Amit 보관 담당자와 동행. 보관 중인 바 실물 확인, 각인, 교체. 일요일 저녁, 프라이빗 디너. 월요일 귀국.
          </p>
        </div>

        <div style={{ border: `1px solid ${T.goldBorder}`, padding: '36px 32px 28px', background: T.bg1 || '#0d0b08', position: 'relative' }}>
          {/* Horizontal connector line */}
          <div style={{ position: 'absolute', top: 51, left: 48, right: 48, height: 1, background: `linear-gradient(90deg, transparent, ${T.goldBorder} 10%, ${T.goldBorder} 90%, transparent)` }} />

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stops.length}, 1fr)`, gap: 0, position: 'relative' }} className="pilg-timeline">
            {stops.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', padding: '0 8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.gold, margin: '0 auto 22px', boxShadow: `0 0 12px ${T.gold}`, position: 'relative', zIndex: 1 }} />
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {s.t}
                </div>
                <div style={{ fontFamily: T.serifKr, fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 6, lineHeight: 1.3 }}>
                  {s.title}
                </div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, lineHeight: 1.4 }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 820px) {
            .pilg-head { grid-template-columns: 1fr !important; gap: 28px !important; }
            .pilg-timeline { grid-template-columns: 1fr 1fr !important; gap: 28px 12px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW · SCREENSHOT 4 · HeirMark · §VI 상속 · Æ 10K SOLID 999.9
// Left: Æ plaque card · Right: inheritance framework + legal partners
// ═══════════════════════════════════════════════════════════════════════════
function HeirMark() {
  return (
    <section style={{ padding: '90px 24px 100px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 56, alignItems: 'center' }} className="heir-grid">

          {/* Left · Æ plaque */}
          <div style={{
            aspectRatio: '3 / 4',
            position: 'relative',
            background: `
              radial-gradient(ellipse at 50% 40%, #3a3020 0%, #1c1610 55%, #0a0806 100%)
            `,
            border: `1px solid ${T.goldBorder}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '40px 28px', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
            <div style={{
              fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(140px, 18vw, 240px)', lineHeight: 1,
              color: T.goldD, opacity: 0.75, marginBottom: 40, letterSpacing: '-0.02em',
            }}>
              Æ
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.gold, letterSpacing: '0.34em', textTransform: 'uppercase', marginBottom: 10 }}>
              10K · SOLID · 999.9
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD }}>
              — Reserved for your house —
            </div>
          </div>

          {/* Right · inheritance */}
          <div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.gold, marginBottom: 16, letterSpacing: '0.02em' }}>
              § VI · 상속
            </div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px, 4.6vw, 56px)', fontWeight: 400, color: T.text, lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0, marginBottom: 26 }}>
              이름이 아니라<br/>
              <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>무게로 남깁니다.</em>
            </h2>
            <p style={{ fontFamily: T.serifKr, fontSize: 15, fontWeight: 300, color: T.sub, lineHeight: 1.85, margin: 0, marginBottom: 40, maxWidth: 580 }}>
              서울 법무와 공동 작업합니다. 상속인 지정, 세무 최적화, 증여 시점. Aurum 볼트의 계정은 법적 지시서와 함께 세대를 건너갑니다. 자녀에게 돈을 주지 않습니다 — <strong style={{ color: T.text, fontWeight: 500 }}>구조를 줍니다</strong>.
            </p>

            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 24, borderTop: `1px solid ${T.goldBorder}` }}>
              {[
                { k: '법무', v: 'Kim & Chang' },
                { k: '세무', v: 'Samil PwC' },
                { k: '의료', v: 'Samsung MC' },
              ].map((p, i) => (
                <div key={i}>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, marginBottom: 4, letterSpacing: '0.02em' }}>
                    {p.k} ·
                  </div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.gold, fontWeight: 500 }}>
                    {p.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .heir-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP · DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function FoundersPage() {
  const [drop, setDrop] = useState(true);

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      <TickerBar sticky={false} />
      <QuietNav page="founders" sticky={false} />
      {drop && <PromoBar label="FOUNDERS · GATE I · LIVE" shortLabel="● LIVE" joined={253} cap={500} />}

      {/* ═══ NEW · screenshot 1 · tone-setter above hero ═══ */}
      <SilentHouse />

      <FoundersHero />
      <GateLadder />
      <GateSimulator />
      <LaunchGiftGrid />

      {/* ═══ NEW · screenshot 2 · five duties (mid-page, after tier ladder) ═══ */}
      <FiveDuties />

      <TransitionStripe />

      <PatronArc />
      <VaultPilgrimage />

      {/* ═══ NEW · screenshot 3 · pilgrimage timeline · complements VaultPilgrimage ═══ */}
      <PilgrimageTimeline />

      <TheMark />

      {/* ═══ NEW · screenshot 4 · heir mark + inheritance framework ═══ */}
      <HeirMark />

      <SpeakingWithFounders />
      <FoundersFooter />

      {import.meta.env.DEV && <DevChrome drop={drop} setDrop={setDrop} />}
    </div>
  );
}
