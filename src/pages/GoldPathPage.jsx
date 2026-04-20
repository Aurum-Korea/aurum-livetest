import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import PromoBar from '../components/PromoBar';
import QuietFooter from '../components/QuietFooter';
import AUSquare from '../components/AUSquare';
import DashboardPreview from '../components/DashboardPreview';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T_NS as T } from '../lib/tokens';
import { AGP_CREDITS, TOTAL_CREDITS, fUSD, OZ_G, KR_RETAIL_MARKUP, SAVINGS_APY } from '../lib/constants';
import { TIERS, GMV_BONUSES, HeroCalc, TierCards, CalcAndRewards, Timeline, Reserve, FinalCTA, Disclosure } from './_goldpath_merged';


/* ═══════════════════════════════════════════════════════════════════════════
   AURUM · /start page · MZ acquisition surface
   Pure V3 drop-energy. 5,000-cap AGP founding-cohort drop.
   All locked visual decisions ship here: coin motif mark, gradient chip,
   Bloomberg ticker, drop countdown, minimal+CTA nav, drop grid tiers,
   initials-only leaderboard w/ streaks, IG 1:1 share card, drop finale.
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE · COIN-MOTIF GOLDPATH MARK (§02 Variant B, promoted to production)
// ═══════════════════════════════════════════════════════════════════════════
function GoldPathCoinMark({ size = 220 }) {
  const h = Math.round((size / 220) * 64);
  return (
    <svg viewBox="0 0 220 64" width={size} height={h} style={{ display: 'inline-block' }}>
      <defs>
        <radialGradient id={`gpcoin-face-${size}`} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#F2D4A0" />
          <stop offset="28%" stopColor="#E3C187" />
          <stop offset="62%" stopColor="#C5A572" />
          <stop offset="88%" stopColor="#8a7448" />
          <stop offset="100%" stopColor="#4a3a20" />
        </radialGradient>
        <radialGradient id={`gpcoin-rim-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="transparent" />
          <stop offset="92%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
        <linearGradient id={`gpcoin-text-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E3C187" />
          <stop offset="55%" stopColor="#C5A572" />
          <stop offset="100%" stopColor="#9a7a48" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="34" rx="15" ry="3" fill="#000" opacity="0.3" />
      <circle cx="18" cy="22" r="15" fill={`url(#gpcoin-face-${size})`} />
      <circle cx="18" cy="22" r="15" fill={`url(#gpcoin-rim-${size})`} />
      <circle cx="18" cy="22" r="11" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />
      <circle cx="18" cy="22" r="12.3" fill="none" stroke="rgba(255,228,180,0.22)" strokeWidth="0.3" />
      <text x="18" y="25" textAnchor="middle" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="10" fill="rgba(40,26,12,0.82)" letterSpacing="-0.02em">Au</text>
      <text x="18" y="32" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="2.2" letterSpacing="0.2em" fill="rgba(40,26,12,0.5)" fontWeight="700">999.9</text>
      <text x="42" y="26" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic" fontWeight="400" fontSize="22" letterSpacing="0.01em" fill={`url(#gpcoin-text-${size})`}>GoldPath</text>
      <text x="44" y="44" fontFamily="'JetBrains Mono',monospace" fontSize="8" letterSpacing="0.24em" fill="#7a6d58" opacity="0.9" fontWeight="500">금환 · 1g / MONTH</text>
      <line x1="44" y1="30" x2="190" y2="30" stroke="rgba(255,61,138,0.2)" strokeWidth="0.5" />
      <text x="196" y="14" fontFamily="'JetBrains Mono',monospace" fontSize="5" letterSpacing="0.2em" fill="#8a7d6b" opacity="0.7">SGP</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DROP COUNTDOWN · /start wears this always (drop is the page's reason)
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// NAV — V3 minimal + CTA (locked choice §04)
// ═══════════════════════════════════════════════════════════════════════════
function StartNav() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 50%, ${T.goldDeep})`, borderRadius: 3, boxShadow: `0 0 14px ${T.goldGlow}` }} />
          <span style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '0.02em' }}>AURUM</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginLeft: 4 }}>001</span>
        </div>
        <div style={{ display: 'none', gap: 22 }} className="desktop-links">
          {['왜 지금', '금환', 'FAQ'].map((s, i) => (
            <span key={i} style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, cursor: 'pointer', fontWeight: 500 }}>{s}</span>
          ))}
        </div>
        <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '10px 20px', fontSize: 12, fontWeight: 700, fontFamily: T.sansKr, letterSpacing: '0.04em', borderRadius: 2 }}>
          ₩200K로 시작 →
        </button>
      </div>
      <style>{`@media (min-width: 720px) { .desktop-links { display: flex !important; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 01 — HERO · giant coin + drop energy
// ═══════════════════════════════════════════════════════════════════════════
function DropHero() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: '56px 20px 80px', position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${T.border}` }}>
      {/* Giant faded AURUM background word */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: T.sans, fontSize: 'clamp(240px, 38vw, 560px)', fontWeight: 900,
        color: 'rgba(255,61,138,0.022)', letterSpacing: '-0.05em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>AURUM</div>

      {/* Drift specks */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          position: 'absolute',
          top: `${[12, 68, 28, 78, 52, 88][i]}%`,
          left: `${[8, 92, 88, 6, 94, 48][i]}%`,
          width: 4, height: 4, borderRadius: '50%',
          background: T.gold, boxShadow: `0 0 10px ${T.gold}`,
          animation: `drift ${5 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
          opacity: 0.55,
        }} />
      ))}

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center' }} className="hero-grid">
        {/* LEFT */}
        <div style={{ animation: 'fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 16px', border: `1px solid ${T.gold}`, borderRadius: 100, marginBottom: 22, background: T.goldGlow }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, boxShadow: `0 0 10px ${T.gold}`, animation: 'pulse 1.8s ease-in-out infinite' }} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.22em', fontWeight: 600 }}>DROP 001 · AGP FOUNDING · 2,848 / 5,000</span>
          </div>

          <h1 style={{ fontFamily: T.serifKr, fontWeight: 700, fontSize: 'clamp(52px, 9vw, 120px)', lineHeight: 0.92, letterSpacing: '-0.04em', margin: '0 0 16px', color: T.text }}>
            매달<br/>
            <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>한 그램.</em>
          </h1>

          <p style={{ fontFamily: T.sansKr, fontSize: 18, color: T.sub, lineHeight: 1.65, maxWidth: 560, margin: '0 0 20px' }}>
            <strong style={{ color: T.text }}>적금 2.8%.</strong> <strong style={{ color: T.text }}>KOSPI 5년 +14%.</strong> <strong style={{ color: T.goldB }}>금 2000년 이후 23×.</strong>
          </p>
          <p style={{ fontFamily: T.sansKr, fontSize: 15, color: T.muted, lineHeight: 1.6, maxWidth: 520, margin: '0 0 32px' }}>
            매달 자동으로 한 그램의 실물 금이 싱가포르 금고에 당신 이름으로 쌓입니다.
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '16px 28px', fontSize: 14, fontWeight: 700, fontFamily: T.sansKr, letterSpacing: '0.04em', borderRadius: 2 }}>
              ₩200K로 시작 →
            </button>
            <button onClick={() => {
              const el = document.getElementById('why-now');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '16px 24px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, borderRadius: 2, cursor: 'pointer' }}>
              Why this works ↓
            </button>
          </div>

          <div style={{ display: 'flex', gap: 22, fontFamily: T.sansKr, fontSize: 12, color: T.muted, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ color: T.green }}>✓</span> 약정 없음</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ color: T.green }}>✓</span> 5분 가입</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ color: T.green }}>✓</span> Malca-Amit 배분 보관</span>
          </div>
        </div>

        {/* RIGHT — giant coin + product mark label */}
        <div style={{ animation: 'fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both', animationDelay: '0.2s', position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 'min(340px, 88vw)', height: 'min(340px, 88vw)', maxWidth: '90vw', maxHeight: '90vw' }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: `radial-gradient(circle at 30% 25%, ${T.goldB}, ${T.gold} 42%, ${T.goldDeep} 78%, #2a1f10)`,
              boxShadow: `0 30px 80px ${T.goldGlow}, inset 0 -30px 60px rgba(0,0,0,0.4), inset 0 20px 40px rgba(255,255,255,0.22)`,
              animation: 'coin-float 6s ease-in-out infinite',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.22)' }} />
              <div style={{ position: 'absolute', inset: 26, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2a1f10' }}>
                <div style={{
                  width: 110, height: 110,
                  border: '2.5px solid #2a1f10',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.serif, fontStyle: 'italic', fontSize: 72, fontWeight: 500,
                  letterSpacing: '-0.03em', lineHeight: 1,
                  marginBottom: 14,
                }}>Au</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.4em', fontWeight: 700 }}>999.9 · 1g</div>
                <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '0.34em', marginTop: 20, opacity: 0.65 }}>#{'2848'} · MMXXVI · SGP</div>
              </div>
            </div>
            {/* Orbiting label */}
            <div style={{ position: 'absolute', top: -8, right: 0, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', background: T.bg, padding: '4px 10px', border: `1px solid ${T.goldBorder}` }}>
              LBMA 999.9
            </div>
            <div style={{ position: 'absolute', bottom: -8, left: -10, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', background: T.bg, padding: '4px 10px', border: `1px solid ${T.goldBorder}` }}>
              ALLOCATED · SGP
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .hero-grid { grid-template-columns: 1.25fr 1fr !important; gap: 50px !important; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 02 — SOCIAL PROOF STRIP · 4 big numbers
// ═══════════════════════════════════════════════════════════════════════════
function ProofStrip() {
  const stats = [
    { v: '2,848', l: '파운더스 합류', sub: 'AGP FOUNDERS' },
    { v: '23×', l: '금 · 2000년 이후', sub: 'GOLD SINCE 2000' },
    { v: '20%', l: '한국 프리미엄 절감', sub: 'VS KOREA RETAIL' },
    { v: '< 5분', l: '평균 가입 시간', sub: 'AVG SIGNUP' },
  ];
  return (
    <section style={{ background: T.deepBlack, padding: '44px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 30 }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(40px, 5.5vw, 56px)', color: T.gold, fontWeight: 600, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, marginTop: 8 }}>{s.l}</div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 03 — WHY NOW · three-up data cards, MZ concrete-numbers style
// ═══════════════════════════════════════════════════════════════════════════
function WhyNow() {
  return (
    <section id="why-now" style={{ padding: '80px 20px', borderBottom: `1px solid ${T.border}`, scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 14 }}>II · 왜 지금 · WHY NOW</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(40px, 6.5vw, 76px)', fontWeight: 700, color: T.text, lineHeight: 0.98, letterSpacing: '-0.03em', margin: 0 }}>
            세 개가 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>같은 방향</em>을 가리킴.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <KimchiPremiumCard />
          <CBTrackerCard />
          <WonDebasementCard />
        </div>
      </div>
    </section>
  );
}

function KimchiPremiumCard() {
  const history = [14.2, 14.8, 15.1, 15.9, 16.4, 17.1, 17.8, 18.3, 19.2, 19.6, 20.1, 20.3];
  const max = Math.max(...history);
  return (
    <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase' }}>§ I · KIMCHI 프리미엄</div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 3 }}>The structural price gap</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}`, animation: 'pulse 1.8s ease-in-out infinite' }} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.green, letterSpacing: '0.14em' }}>LIVE</span>
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 44, color: T.red, fontWeight: 700, lineHeight: 1 }}>+20.1%</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em' }}>vs spot</span>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: '0.16em', marginBottom: 6 }}>12-MONTH TRAJECTORY · WIDENING</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50, marginBottom: 14 }}>
          {history.map((v, i) => {
            const h = ((v - 12) / (max - 12)) * 100;
            const last = i === history.length - 1;
            return <div key={i} style={{ flex: 1, background: last ? T.red : 'rgba(248,113,113,0.3)', height: `${Math.max(h, 10)}%`, transition: 'height 0.4s' }} />;
          })}
        </div>
        <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.65, borderLeft: `2px solid ${T.gold}`, paddingLeft: 10 }}>
          한국 소매 구매자는 매 온스 <strong style={{ color: T.red }}>$968 더</strong> 지불합니다. 10% VAT는 영구.
        </div>
      </div>
    </div>
  );
}

function CBTrackerCard() {
  const data = [
    { q: "Q1'24", t: 162 }, { q: "Q2'24", t: 186 }, { q: "Q3'24", t: 175 }, { q: "Q4'24", t: 198 },
    { q: "Q1'25", t: 155 }, { q: "Q2'25", t: 172 }, { q: "Q3'25", t: 220, hi: true },
  ];
  const max = Math.max(...data.map(d => d.t));
  return (
    <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase' }}>§ II · 중앙은행 매입</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 3 }}>Nations move first</div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 44, color: T.goldB, fontWeight: 700, lineHeight: 1 }}>220t</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.green, letterSpacing: '0.12em' }}>+28% QoQ</span>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: '0.16em', marginBottom: 6 }}>QUARTERLY · HIGHEST SINCE 2008</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50, marginBottom: 14 }}>
          {data.map((d, i) => {
            const h = (d.t / max) * 100;
            return <div key={i} style={{ flex: 1, background: d.hi ? T.gold : 'rgba(255,61,138,0.3)', height: `${h}%` }} />;
          })}
        </div>
        <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.65, borderLeft: `2px solid ${T.gold}`, paddingLeft: 10 }}>
          중국 · 인도 · 폴란드 · 터키가 달러를 팔고 <strong style={{ color: T.gold }}>금을 사고 있습니다.</strong>
        </div>
      </div>
    </div>
  );
}

function WonDebasementCard() {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase' }}>§ III · 원화 구매력</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 3 }}>What 10만원 does today</div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 44, color: T.red, fontWeight: 700, lineHeight: 1 }}>−53%</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em' }}>since 2000</span>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: '0.16em', marginBottom: 12 }}>COMPARED · 2000 KRW TO 2026 KRW</div>
        {/* Two-bar visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em', marginBottom: 3 }}>2000 · 10만원</div>
            <div style={{ height: 8, background: `linear-gradient(90deg, ${T.goldD}, ${T.gold})`, width: '100%' }} />
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em', marginBottom: 3 }}>2026 · 4만6천원 (equivalent)</div>
            <div style={{ height: 8, background: `linear-gradient(90deg, ${T.red}, rgba(248,113,113,0.4))`, width: '47%' }} />
          </div>
        </div>
        <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.65, borderLeft: `2px solid ${T.gold}`, paddingLeft: 10 }}>
          같은 기간 금은 <strong style={{ color: T.goldB }}>23배</strong> 올랐습니다.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 04 — THE PRODUCT · coin-motif mark + how it works (3 steps)
// ═══════════════════════════════════════════════════════════════════════════
function ProductHow() {
  const steps = [
    { n: '01', ko: '가입', desc: '5분. 신분증, 계좌 연결. 끝.', en: 'Sign up · 5 min' },
    { n: '02', ko: '자동이체', desc: '매달 ₩200K~ 원하는 날. 국제 시세 + 2.0% 프리미엄으로 전환.', en: 'Monthly debit · your date' },
    { n: '03', ko: '그램 적립', desc: 'Malca-Amit 싱가포르 볼트에 당신 이름으로 배분 보관. 언제든 인출.', en: 'Gram accrues · allocated · SGP' },
  ];
  return (
    <section style={{ background: T.bg1, padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 14 }}>III · THE PRODUCT</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 3.8vw, 44px)', fontWeight: 500, color: T.text, margin: '0 0 12px', lineHeight: 1.15 }}>
            당신의 대시보드. <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>숫자는 항상 보입니다.</span>
          </h2>
          <p style={{ fontFamily: T.serifKr, fontSize: 14, color: T.sub, lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
            가입 즉시 이런 화면을 보게 됩니다. 보유 금, 원화 가치, 게이트 진행, 30일 적립 차트 — 모두 실시간.
          </p>
        </div>

        {/* Interactive dashboard preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <DashboardPreview />
        </div>

        {/* Three steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${T.goldBorder}`,
              padding: '28px 24px', position: 'relative',
              animation: `fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.gold, letterSpacing: '0.24em', marginBottom: 14 }}>STEP {s.n}</div>
              <div style={{ fontFamily: T.serifKr, fontSize: 24, color: T.text, fontWeight: 500, marginBottom: 6 }}>{s.ko}</div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, marginBottom: 14 }}>{s.en}</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 05 — DROP GRID · 5-tier AGP founding cohort
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// § 06 — COMMUNITY · initials leaderboard + streak + IG share
// ═══════════════════════════════════════════════════════════════════════════
function Community() {
  const leaders = [
    { r: '01', id: 'K.J.H',  t: 'III', streak: 42 },
    { r: '02', id: 'CHO.S',  t: 'III', streak: 38 },
    { r: '03', id: 'YUN.K',  t: 'II',  streak: 35 },
    { r: '04', id: 'PARK.H', t: 'II',  streak: 29 },
    { r: '05', id: 'KAY.W',  t: 'II',  streak: 24 },
    { r: '06', id: '당신 →',  t: 'I',   streak: 7, me: true },
  ];
  return (
    <section style={{ background: T.bg1, padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 12 }}>V · 커뮤니티 · COMMUNITY</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: T.text, lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>
            혼자가 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>아닙니다.</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Initials leaderboard */}
          <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.24em' }}>LEADERBOARD · 이번 주</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>ANON · 이니셜</span>
            </div>
            {leaders.map((l, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 44px 58px', gap: 8,
                padding: '11px 0', borderTop: i ? `1px solid ${T.border}` : 'none', alignItems: 'center',
                fontFamily: T.mono, fontSize: 12,
                background: l.me ? 'rgba(255,61,138,0.06)' : 'transparent',
                marginLeft: l.me ? -20 : 0, marginRight: l.me ? -20 : 0,
                paddingLeft: l.me ? 20 : 0, paddingRight: l.me ? 20 : 0,
              }}>
                <span style={{ color: i < 3 ? T.gold : T.muted }}>{l.r}</span>
                <span style={{ color: l.me ? T.goldB : T.text, fontWeight: l.me ? 700 : 500 }}>{l.id}</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.gold, fontWeight: 500 }}>{l.t}</span>
                <span style={{ color: T.gold, textAlign: 'right' }}>🔥 {l.streak}d</span>
              </div>
            ))}
            <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, marginTop: 14, textAlign: 'center' }}>
              이니셜 기본 · 실명 비공개
            </div>
          </div>

          {/* Streak card */}
          <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.24em', marginBottom: 14 }}>MY STREAK</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 84, color: T.goldB, fontWeight: 600, lineHeight: 1 }}>7</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, color: T.gold, letterSpacing: '0.1em' }}>달 연속</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, marginBottom: 16 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ aspectRatio: 1, background: i < 7 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})` : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
              ))}
            </div>
            <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.6, borderLeft: `2px solid ${T.gold}`, paddingLeft: 12, marginBottom: 10 }}>
              12개월 연속 <strong style={{ color: T.gold }}>100g 기념 바</strong>. 24개월 연속 이니셜 각인.
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.14em' }}>
              GATE I 멤버의 74%가 스트릭 진행 중
            </div>
          </div>

          {/* IG share */}
          <div style={{
            background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 60%, ${T.goldDeep})`,
            padding: 22, color: '#1a1610', position: 'relative', overflow: 'hidden',
            aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', fontWeight: 700 }}>SHARE · IG 1:1</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: T.serifKr, fontSize: 28, fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
                이번 달도<br/>한 그램.<br/>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 500 }}>7달째 쌓는 중.</span>
              </div>
              <div style={{
                width: 64, height: 64,
                border: '2px solid #1a1610',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.serif, fontStyle: 'italic', fontSize: 40, fontWeight: 500,
                letterSpacing: '-0.03em', lineHeight: 1,
              }}>Au</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', marginTop: 8 }}>999.9 · #2848 · MMXXVI</div>
            </div>
            <button onClick={() => {
              const shareData = {
                title: 'Aurum · GoldPath 금환',
                text: '매달 한 그램. 평생 쌓인다. AURUM Founding Cohort #2848/5000',
                url: 'https://aurumkorea.com/start',
              };
              if (navigator.share) {
                navigator.share(shareData).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(`${shareData.text} · ${shareData.url}`);
                alert('링크 복사됨 · Copied to clipboard');
              }
            }} style={{ background: '#1a1610', color: T.gold, padding: '10px 16px', fontSize: 11, fontWeight: 700, fontFamily: T.sans, letterSpacing: '0.1em', alignSelf: 'flex-start', border: 'none', cursor: 'pointer' }}>
              SHARE ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 07 — FAQ · direct, MZ-register
// ═══════════════════════════════════════════════════════════════════════════
function FAQ() {
  const [open, setOpen] = useState(1);
  const faqs = [
    { q: '금, 진짜로 있어요?', a: '네. 싱가포르 Malca-Amit FTZ에 회원님 이름으로 배분 보관됩니다. 은행의 종이가 아님. 분기별 Brink\'s 감사 보고서는 대시보드에서 공개됩니다.' },
    { q: '근데 사기 아니에요?', a: 'Aurum Pte. Ltd.는 싱가포르 MAS(금융당국) 등록 금속 취급 사업자입니다. Lloyd\'s of London 100% 보험. Brink\'s 분기 감사. 회사가 사라져도 금은 그대로, 회원 지분대로 반환됩니다.' },
    { q: '언제든 돈으로 바꿀 수 있어요?', a: '네. 72시간 이내 원화 환매 또는 실물 인출(1g / 10g / 100g 바). 약정 없음.' },
    { q: '최저가 대비 왜 더 싸요?', a: '한국 소매는 10% VAT + 수입 프리미엄 = 약 20% 차이. 우리는 싱가포르 FTZ라서 VAT 없음. 국제 현물가 + 2.0% 프리미엄이 전부입니다.' },
    { q: '5,000명 왜 이렇게 적어요?', a: 'GoldPath 금환의 첫 Founding Cohort이기 때문입니다. 론치 기프트는 이 5,000명에게만 적용. 마감 후 일반 가입은 가능하지만 기프트는 없습니다.' },
  ];
  return (
    <section style={{ background: T.deepBlack, padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 14 }}>VI · FAQ</div>
        <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: T.text, lineHeight: 1.05, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
          질문은<br/>
          <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>솔직하게.</em>
        </h2>

        <div>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setOpen(open === i ? -1 : i)} style={{ borderTop: `1px solid ${T.border}`, padding: '22px 0', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <span style={{ fontFamily: T.serifKr, fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 500, color: T.text }}>{f.q}</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 32, color: T.gold, transition: 'transform 0.3s', transform: open === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
              </div>
              {open === i && (
                <div style={{ fontFamily: T.sansKr, fontSize: 15, color: T.sub, lineHeight: 1.8, marginTop: 16, maxWidth: 720, animation: 'fade-up 0.4s ease-out' }}>{f.a}</div>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}` }} />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 08 — DROP FINALE · big repeat CTA
// ═══════════════════════════════════════════════════════════════════════════
function DropFinale() {
  const navigate = useNavigate();
  return (
    <>
      <section style={{ background: T.bg, padding: '100px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(52px, 9vw, 108px)', fontWeight: 700, color: T.text, lineHeight: 0.94, letterSpacing: '-0.03em', margin: '0 0 32px' }}>
            한 그램.<br/>
            <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>지금.</em>
          </h2>
          <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '20px 52px', fontFamily: T.sansKr, fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 2 }}>
            ₩200K로 시작 →
          </button>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 20, letterSpacing: '0.2em' }}>
            2,848 / 5,000 · 마감까지 3D 14H
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.goldBorder}`, padding: '36px 20px 24px', background: T.deepBlack }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.18em' }}>
          <span>© MMXXVI AURUM</span>
          <div style={{ display: 'flex', gap: 18 }}>
            <span>IG @aurum.gold</span>
            <span>KAKAO</span>
            <span>TW @aurum_sg</span>
          </div>
          <span>서울 · 싱가포르</span>
        </div>
      </footer>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEV CHROME
// ═══════════════════════════════════════════════════════════════════════════
function DevChrome() {
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(14,12,8,0.96)', backdropFilter: 'blur(14px)',
      border: `1px solid ${T.goldBorder}`, padding: 10, zIndex: 999,
      display: 'flex', gap: 10, fontFamily: T.mono, fontSize: 10,
      maxWidth: 'calc(100vw - 32px)', flexWrap: 'wrap', justifyContent: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    }}>
      <span style={{ color: T.goldD, letterSpacing: '0.18em', padding: '5px 8px' }}>/START · AGP FOUNDING COHORT</span>
      <span style={{ color: T.border, padding: '0 2px', alignSelf: 'center' }}>│</span>
      <span style={{ color: T.gold, letterSpacing: '0.18em', padding: '5px 2px', alignSelf: 'center' }}>5,000 CAP · DROP LIVE</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function GoldPathPage() {
  const [activeTier, setActiveTier] = useState(2);
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      <TickerBar palette="neo" />
      <QuietNav palette="neo" />
      <PromoBar palette="neo" label="GOLDPATH 금환 · AGP FOUNDING · LIVE" shortLabel="● LIVE" joined={2848} cap={5000} />

      {/* — FROM OLD /start · drop-style energy hero — */}
      <DropHero />
      <ProofStrip />
      <WhyNow />

      {/* — MERGED FROM OLD /goldpath · tier-driven calculator foundation — */}
      <section id="goldpath-calculator" style={{ padding: '80px 24px', background: T.bg1 || '#0d0b08', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, scrollMarginTop: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 10, textTransform: 'uppercase' }}>§ CALCULATOR · 시작 계산기</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 500, color: T.text, margin: 0, lineHeight: 1.2 }}>
              매달 얼마. <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>몇 년 뒤 얼마.</span>
            </h2>
          </div>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <HeroCalc />
          </div>
        </div>
      </section>
      <TierCards activeTier={activeTier} setActiveTier={setActiveTier} />
      <CalcAndRewards activeTier={activeTier} setActiveTier={setActiveTier} />

      {/* — FROM OLD /start · product + community — */}
      <ProductHow />
      <Community />

      {/* — MERGED FROM OLD /goldpath · service ritual + close — */}
      <Timeline />
      <Reserve />
      <FAQ />
      <FinalCTA />
      <DropFinale />
      <Disclosure />

      <QuietFooter />
      {import.meta.env.DEV && <DevChrome />}
    </div>
  );
}
