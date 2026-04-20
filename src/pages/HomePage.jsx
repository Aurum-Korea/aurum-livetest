import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PromoBar from '../components/PromoBar';
import FloatingMenu from '../components/FloatingMenu';
import QuietFooter from '../components/QuietFooter';
import AUSquare from '../components/AUSquare';
import AurumWordmark from '../components/AurumWordmark';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { AGP_CREDITS, TOTAL_CREDITS, fUSD, OZ_G, KR_RETAIL_MARKUP, SAVINGS_APY } from '../lib/constants';


/* ═══════════════════════════════════════════════════════════════════════════
   AURUM · Full Homepage Mockup
   V4 Quiet Door at /  ·  Hybrid at /start etc.
   All 12 visual picks composed into one scrollable React artifact.
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// VIEWPORT TOGGLE (Claude-only dev chrome)
// ═══════════════════════════════════════════════════════════════════════════
function ViewportToggle({ door, setDoor, drop, setDrop, social, setSocial, devOnly }) {
  if (devOnly && !import.meta.env.DEV) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(14,12,8,0.96)', backdropFilter: 'blur(14px)',
      border: `1px solid ${T.goldBorder}`, padding: 10, zIndex: 999,
      display: 'flex', gap: 8, fontFamily: T.mono, fontSize: 10,
      maxWidth: 'calc(100vw - 32px)', flexWrap: 'wrap', justifyContent: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    }}>
      <div style={{ display:'flex', gap:4, alignItems:'center' }}>
        <span style={{ color: T.goldD, letterSpacing: '0.18em', marginRight: 6 }}>DOOR</span>
        <button onClick={()=>setDoor('quiet')} style={toggleBtn(door==='quiet')}>V4 / QUIET</button>
        <button onClick={()=>setDoor('hybrid')} style={toggleBtn(door==='hybrid')}>HYBRID</button>
      </div>
      {door==='hybrid' && (<>
        <span style={{ color: T.border, padding: '0 2px' }}>│</span>
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          <span style={{ color: T.goldD, letterSpacing: '0.18em', marginRight: 6 }}>DROP</span>
          <button onClick={()=>setDrop(!drop)} style={toggleBtn(drop)}>{drop?'LIVE':'OFF'}</button>
        </div>
        <span style={{ color: T.border, padding: '0 2px' }}>│</span>
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          <span style={{ color: T.goldD, letterSpacing: '0.18em', marginRight: 6 }}>SOCIAL</span>
          <button onClick={()=>setSocial('handles')} style={toggleBtn(social==='handles')}>@HANDLES</button>
          <button onClick={()=>setSocial('initials')} style={toggleBtn(social==='initials')}>INITIALS</button>
          <button onClick={()=>setSocial('side-by-side')} style={toggleBtn(social==='side-by-side')}>SIDE-BY-SIDE</button>
        </div>
      </>)}
    </div>
  );
}
const toggleBtn = (on) => ({
  padding: '5px 10px', background: on ? T.goldGlow : 'transparent',
  border: `1px solid ${on ? T.goldBorderS : T.border}`,
  color: on ? T.gold : T.sub, fontFamily: T.mono, fontSize: 10,
  letterSpacing: '0.14em', cursor: 'pointer', transition: 'all 0.2s',
});

// ═══════════════════════════════════════════════════════════════════════════
// DROP COUNTDOWN BAR (V3 · below ticker during drop)
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// NAV — V3 minimal + CTA
// ═══════════════════════════════════════════════════════════════════════════
function HybridNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'Founders', to: '/founders' },
    { label: 'GoldPath', to: '/start' },
    { label: 'Why', to: '/why' },
    { label: 'Vault', to: '/vault' },
  ];
  return (
    <div style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.border}`, padding: '14px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 50%, ${T.goldDeep})`, borderRadius: 3, boxShadow: `0 0 14px ${T.goldGlow}` }} />
          <span style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '0.02em' }}>AURUM</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginLeft: 4 }}>001</span>
        </div>
        <div style={{ display: 'none', gap: 22 }} className="desktop-only">
          {items.map((s, i) => (
            <Link key={i} to={s.to} style={{ fontFamily: T.sans, fontSize: 13, color: T.sub, cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>{s.label}</Link>
          ))}
        </div>
        <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '9px 18px', fontSize: 12, fontWeight: 700, fontFamily: T.sans, letterSpacing: '0.04em', borderRadius: 2, border: 'none', cursor: 'pointer' }}>
          지금 시작 →
        </button>
      </div>
      <style>{`@media (min-width: 720px) { .desktop-only { display: flex !important; } }`}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// V4 QUIET DOOR — everything the hybrid is not
// ═══════════════════════════════════════════════════════════════════════════
function QuietDoor() {
  const navigate = useNavigate();
  return (
    <>
      {/* HERO · full viewport pane · Patek-grade landing */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 40px',
        position: 'relative',
        textAlign: 'center',
      }}>
        {/* Nameplate · top · left-anchored so it never collides with top-right nav */}
        <div style={{
          position: 'absolute', top: 28, left: 24,
          fontFamily: T.mono, fontSize: 10, letterSpacing: '0.34em',
          color: T.goldD, textTransform: 'uppercase',
        }}>
          Est. MMXXIV · Singapore
        </div>

        {/* Phrase · center */}
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{
            fontFamily: T.serifKr,
            fontSize: 'clamp(40px, 7.5vw, 88px)',
            fontWeight: 400,
            color: T.text,
            lineHeight: 1.18,
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}>
            조용하게 쌓인다.
          </div>
          <div style={{
            fontFamily: T.serifKr,
            fontSize: 'clamp(40px, 7.5vw, 88px)',
            fontWeight: 400,
            color: T.text,
            lineHeight: 1.18,
            marginBottom: 44,
            letterSpacing: '-0.01em',
          }}>
            영원히 남는다.
          </div>
          <div style={{
            fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.4vw, 32px)',
            color: T.goldD, fontWeight: 300, lineHeight: 1.5,
          }}>
            Quietly compounds. Permanently stays.
          </div>
        </div>

        {/* Scroll cue · bottom */}
        <div style={{
          position: 'absolute', bottom: 36, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, color: T.goldD,
            letterSpacing: '0.32em', textTransform: 'uppercase',
          }}>
            Scroll
          </div>
          <div style={{
            width: 1, height: 36, background: `linear-gradient(to bottom, ${T.goldD}, transparent)`,
            animation: 'scrollCue 2.4s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes scrollCue {
            0%, 100% { opacity: 0.3; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(6px); }
          }
        `}</style>
      </section>

      {/* III · The Mark · rotating AU-in-square */}
      <div style={{ maxWidth: 1180, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{
          height: '55vh', minHeight: 400, position: 'relative', overflow: 'hidden',
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(197,165,114,0.10) 0%, transparent 65%),
            linear-gradient(135deg, #161310 0%, #0d0b08 50%, #06050a 100%)
          `,
          border: `1px solid ${T.goldBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Ambient gold dust particles */}
          <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
            <defs>
              <radialGradient id="dustG" cx="50%" cy="50%"><stop offset="0%" stopColor="#E3C187" stopOpacity="0.5"/><stop offset="100%" stopColor="#C5A572" stopOpacity="0"/></radialGradient>
            </defs>
            {[...Array(18)].map((_, i) => {
              const cx = (i * 67 + 80) % 1200;
              const cy = (i * 131 + 40) % 600;
              const r = 1.5 + (i % 4);
              return <circle key={i} cx={cx} cy={cy} r={r} fill="url(#dustG)" />;
            })}
          </svg>

          {/* The rotating mark · 3D flip */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <AUSquare size={220} rotating />
          </div>

          {/* Corner labels */}
          <div style={{ position: 'absolute', bottom: 18, left: 22, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em' }}>
            FIG. I — THE MARK · 999.9 AU
          </div>
          <div style={{ position: 'absolute', bottom: 18, right: 22, fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD }}>
            Aurum · corporate seal
          </div>
          <div style={{ position: 'absolute', top: 22, left: 22, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', opacity: 0.6 }}>
            SGP · MALCA-AMIT FTZ · MAS PSPM 2019
          </div>
        </div>
      </div>

      {/* IV · Patron Letters */}
      <div style={{ maxWidth: 1060, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 40, textAlign: 'center', textTransform: 'uppercase' }}>
          · Patron Letters ·
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 56 }}>
          {[
            { by: 'K.H., Seoul — Family Office', text: '몇 대에 걸쳐 쌓은 재산을 어떻게 지킬 것인가 질문했을 때, 답은 복잡하지 않았습니다. 국경 너머, 통화 너머, 세대 너머 남는 것. 그것이 금이었습니다.' },
            { by: 'J.S., Singapore — Financial Services', text: 'I joined because Aurum refused to sell me anything. They explained the mechanism once. Then they waited. I have been waiting for a financial product to do that.' },
            { by: 'M.C., Busan — Industrialist', text: '제 아버지는 1985년에 골드바를 샀습니다. 저는 2026년에 Aurum에 가입했습니다. 같은 이유입니다.' },
          ].map((p, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
                {p.text}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.18em', textTransform: 'uppercase', borderTop: `1px solid ${T.goldBorder}`, paddingTop: 12 }}>
                {p.by}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* V · The Mechanism */}
      <div style={{ maxWidth: 720, margin: '0 auto 120px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.sub, lineHeight: 2, fontWeight: 300 }}>
          파운더스 프로그램은 매년 제한된 수의 후원자를 받습니다. 가입한 후원자는 싱가포르 Malca-Amit FTZ 볼트에 배분된 실물 금을 보유합니다. Lloyd's of London 전액 보험. 분기별 Brink's 감사. 한 번 가입한 게이트는 평생 유지됩니다.
        </div>
      </div>

      {/* VI · The Door */}
      <div style={{ padding: '60px 24px 100px', textAlign: 'center' }}>
        <button onClick={() => navigate('/start')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '18px 36px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.target.style.borderColor = T.goldBorderS; e.target.style.background = T.goldGlow; }}
          onMouseLeave={e => { e.target.style.borderColor = T.goldBorder; e.target.style.background = 'transparent'; }}>
          시작하기 · Start →
        </button>
      </div>

      {/* VII · Footer — two-line Roman numeral finish */}
      <div style={{ borderTop: `1px solid ${T.goldBorder}`, padding: '60px 24px 56px', background: T.deep, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <AUSquare size={36} />
          <AurumWordmark size={18} serial="MMXXVI" />
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.32em' }}>
          QUIETLY · FOREVER
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HYBRID HERO — Quiet bilingual hero BESIDE live sparkline
// ═══════════════════════════════════════════════════════════════════════════
function HybridHero() {
  const navigate = useNavigate();
  const [flashIdx, setFlashIdx] = useState(-1);
  const priceRefs = [{ lbl: 'KOREA RETAIL', val: '18만 6,800원', note: '+VAT 10%', color: T.red, tone: 'dn' },
                     { lbl: 'AURUM', val: '15만 5,670원', note: '−16.7%', color: T.goldB, tone: 'hold' },
                     { lbl: 'FOUNDERS III', val: '15만 2,560원', note: '−18.4%', color: T.green, tone: 'up' }];
  useEffect(() => {
    const id = setInterval(() => setFlashIdx(Math.floor(Math.random() * 3)), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ padding: '60px 20px 80px', position: 'relative', borderBottom: `1px solid ${T.border}`, overflow: 'hidden' }}>
      {/* Atmospheric grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(197,165,114,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,114,0.035) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)' }} />
      {/* Drift specks */}
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ position: 'absolute',
          top: `${[18, 72, 28, 78, 50][i]}%`, left: `${[8, 88, 92, 6, 94][i]}%`,
          width: 3, height: 3, borderRadius: '50%', background: T.gold,
          boxShadow: `0 0 8px ${T.gold}`, animation: `drift ${6 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`, opacity: 0.5 }} />
      ))}

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: 36, alignItems: 'start' }} className="hero-grid">
        {/* LEFT — bilingual quiet hero */}
        <div className="reveal">
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 28, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>EST. MMXXIV</span>
            <span style={{ color: T.border }}>|</span>
            <span>{`SGP · AUM TBD`}</span>
            <span style={{ color: T.border }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}`, animation: 'pulse 1.8s ease-in-out infinite', display: 'inline-block' }} />
              VAULT LIVE
            </span>
          </div>
          <h1 style={{ fontFamily: T.serifKr, fontWeight: 400, fontSize: 'clamp(40px, 7vw, 78px)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 14px', color: T.text }}>
            조용하게 쌓인다.
          </h1>
          <h2 style={{ fontFamily: T.serifKr, fontWeight: 400, fontSize: 'clamp(40px, 7vw, 78px)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 22px', color: T.text }}>
            <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>영원히 남는다.</em>
          </h2>
          <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: T.goldD, lineHeight: 1.5, margin: '0 0 36px', fontWeight: 300 }}>
            Quietly compounds. Permanently stays.
          </p>

          {/* Proof-point bar — MZ concrete numbers integrated quietly */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 32, fontFamily: T.mono, fontSize: 11, letterSpacing: '0.08em' }}>
            <div>
              <div style={{ color: T.muted, marginBottom: 3, fontSize: 9, letterSpacing: '0.18em' }}>SAVINGS ACCT</div>
              <div style={{ color: T.text, fontSize: 15 }}>2.8<span style={{ fontSize: 11, color: T.muted }}>%</span></div>
            </div>
            <div style={{ width: 1, background: T.border, height: 38 }} />
            <div>
              <div style={{ color: T.muted, marginBottom: 3, fontSize: 9, letterSpacing: '0.18em' }}>KOSPI · 5Y</div>
              <div style={{ color: T.text, fontSize: 15 }}>+14<span style={{ fontSize: 11, color: T.muted }}>%</span></div>
            </div>
            <div style={{ width: 1, background: T.border, height: 38 }} />
            <div>
              <div style={{ color: T.muted, marginBottom: 3, fontSize: 9, letterSpacing: '0.18em' }}>GOLD · SINCE 2000</div>
              <div style={{ color: T.goldB, fontSize: 18, fontWeight: 700 }}>23<span style={{ fontSize: 12 }}>×</span></div>
            </div>
          </div>

          {/* CTA — V1 editorial bold */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{ background: T.gold, border: 'none', color: T.bg, padding: '13px 24px', fontFamily: T.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer' }}>
              GoldPath 시작하기 →
            </button>
            <button onClick={() => navigate('/founders')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '13px 24px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, cursor: 'pointer' }}>
              Founders · Request
            </button>
          </div>
        </div>

        {/* RIGHT — sparkline panel with live Korean vs Aurum price lines */}
        <div className="reveal" style={{ animationDelay: '0.2s' }}>
          <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 20 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.24em' }}>§ 01 · XAUUSD · 90D</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}`, animation: 'pulse 1.8s ease-in-out infinite' }} />
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.green, letterSpacing: '0.14em' }}>LIVE</span>
              </div>
            </div>
            <svg viewBox="0 0 360 120" width="100%" height="120" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="sparkG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={T.gold} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sparkLine" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={T.goldDeep} />
                  <stop offset="100%" stopColor={T.goldB} />
                </linearGradient>
              </defs>
              {/* Grid */}
              {[30, 60, 90].map(y => <line key={y} x1="0" y1={y} x2="360" y2={y} stroke={T.border} strokeWidth="0.5" />)}
              {(() => {
                const raw = [40, 45, 42, 51, 48, 55, 53, 60, 58, 64, 62, 68, 66, 72, 70, 74, 71, 76, 78, 82, 80, 85];
                const pts = raw.map((v, i, a) => `${(i / (a.length - 1)) * 360},${120 - (v / 100) * 110 + 6}`).join(' ');
                return (<>
                  <polygon points={`0,120 ${pts} 360,120`} fill="url(#sparkG)" />
                  <polyline points={pts} fill="none" stroke="url(#sparkLine)" strokeWidth="1.8" style={{ animation: 'spark-glow 3s ease-in-out infinite' }} />
                  <circle cx="360" cy={120 - (85 / 100) * 110 + 6} r="3.5" fill={T.goldB} />
                  <circle cx="360" cy={120 - (85 / 100) * 110 + 6} r="7" fill="none" stroke={T.gold} strokeWidth="0.8" opacity="0.5" />
                </>);
              })()}
            </svg>
            {/* OHLC */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              {[{ l: 'O', v: '4,820' }, { l: 'H', v: '4,855' }, { l: 'L', v: '4,812' }, { l: 'C', v: '4,842' }].map((x, i) => (
                <div key={i}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>{x.l}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text }}>{x.v}</div>
                </div>
              ))}
            </div>
            {/* Korean arb strip — the signature data tell */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 10 }}>
                1g · KRW RETAIL VS AURUM
              </div>
              {priceRefs.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '8px 6px', borderTop: i ? `1px dashed ${T.border}` : 'none',
                  animation: flashIdx === i ? 'price-flash-up 1.2s ease-out' : 'none', marginLeft: -6, marginRight: -6,
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.16em' }}>{p.lbl}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 14, color: p.color, fontWeight: 600 }}>{p.val}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: p.color, opacity: 0.7 }}>{p.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid { grid-template-columns: 1.35fr 1fr !important; gap: 56px !important; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOUR NUMBERS — V1 magazine card grid w/ numeric markers
// ═══════════════════════════════════════════════════════════════════════════
function FourNumbers() {
  const cards = [
    { n: 'I',   topic: '프리미엄',  author: 'CFO Desk',   title: '김치 프리미엄, 해부',        stat: '+20.1%', statLbl: 'vs 국제 현물', tone: T.red },
    { n: 'II',  topic: '중앙은행',  author: 'IMF · WGC',  title: '국가들이 움직이는 속도',    stat: '220t',   statLbl: 'Q3 2025 매입',  tone: T.gold },
    { n: 'III', topic: '통화',      author: 'BOK Data',   title: '원화가 증발하는 방식',      stat: '−53%',   statLbl: '2000년 대비 구매력', tone: T.red },
    { n: 'IV',  topic: '복리',      author: 'Aurum',      title: 'GoldPath 적립의 산수',       stat: '23×',    statLbl: '금 · 2000년 이후',  tone: T.green },
  ];
  return (
    <section style={{ background: T.bg1, padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 44, alignItems: 'baseline' }} className="head-grid">
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12, textTransform: 'uppercase' }}>II · 왜 지금 · Why now</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(30px, 4.4vw, 48px)', fontWeight: 500, color: T.text, lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em' }}>
              네 개의 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>수치.</em><br/>
              같은 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>방향.</em>
            </h2>
          </div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.sub, lineHeight: 1.7, maxWidth: 440 }}>
            가격 차이, 국가 행동, 통화 가치, 복리의 수학. 각 수치는 하나의 지렛대입니다. 네 개가 같은 방향을 가리킬 때, 그것은 방향입니다.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {cards.map((c, i) => (
            <article key={i} style={{
              background: T.bg, border: `1px solid ${T.goldBorder}`,
              padding: '24px 20px 22px', position: 'relative', transition: 'all 0.3s',
              animation: `fade-up 0.8s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 0.08}s`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldBorderS; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {/* Top gold hairline */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 36, color: T.gold, fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>{c.n}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
                {c.topic} · {c.author}
              </div>
              <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, fontWeight: 500, lineHeight: 1.3, marginBottom: 20, minHeight: 46 }}>
                {c.title}
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 28, color: c.tone, fontWeight: 700, lineHeight: 1 }}>{c.stat}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.16em', marginTop: 6, textTransform: 'uppercase' }}>{c.statLbl}</div>
              </div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.gold, marginTop: 18, borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>계속 →</div>
            </article>
          ))}
        </div>
      </div>
      <style>{`@media (min-width: 900px) { .head-grid { grid-template-columns: 1fr 1.3fr !important; gap: 60px !important; } }`}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER GRID — V3 drop grid with join counts (for Founders)
// ═══════════════════════════════════════════════════════════════════════════
function TierDrop({ dropLive }) {
  const tiers = [
    { n: 'I',   ko: '브론즈',   en: 'Bronze',    min: '₩200K', gift: '₩50K',  tok: '2,112 joined' },
    { n: 'II',  ko: '실버',     en: 'Silver',    min: '₩500K', gift: '₩150K', tok: '486 joined' },
    { n: 'III', ko: '골드',     en: 'Gold',      min: '₩1M',   gift: '₩400K', tok: '184 joined', feat: true },
    { n: 'IV',  ko: '플래티넘', en: 'Platinum',  min: '₩2M',   gift: '₩1.5M', tok: '54 joined' },
    { n: 'V',   ko: '소브린',   en: 'Sovereign', min: '₩5M',   gift: '₩5M',   tok: '12 / 50' },
  ];
  return (
    <section style={{ padding: '80px 20px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12, textTransform: 'uppercase' }}>III · DROP · 파운더스</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(30px, 4.4vw, 48px)', fontWeight: 500, color: T.text, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
              5,000명. <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>그다음은 없다.</em>
            </h2>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.goldD, letterSpacing: '0.2em' }}>
            {dropLive ? '2,848 / 5,000' : '론치 대기'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: dropLive ? '57%' : '2%', height: '100%', background: `linear-gradient(90deg, ${T.goldB}, ${T.gold})`, boxShadow: `0 0 12px ${T.goldGlow}`, transition: 'width 1s ease-out' }} />
          </div>

          {/* Tier grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
            {tiers.map((t, i) => (
              <div key={i} style={{
                padding: '32px 18px 24px', textAlign: 'center',
                borderRight: i < tiers.length - 1 ? `1px solid ${T.border}` : 'none',
                borderTop: `1px solid ${T.border}`,
                background: t.feat ? T.goldGlow : 'transparent',
                position: 'relative', transition: 'all 0.3s',
              }}>
                {t.feat && (
                  <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: T.mono, fontSize: 8, color: T.goldB, letterSpacing: '0.22em', background: T.deepBlack, padding: '3px 8px', border: `1px solid ${T.goldBorder}` }}>
                    MOST PICKED
                  </div>
                )}
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 44, color: t.feat ? T.goldB : T.gold, fontWeight: 500, lineHeight: 1, marginTop: t.feat ? 12 : 0 }}>{t.n}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.text, fontWeight: 600, marginTop: 10 }}>{t.ko}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 2 }}>{t.en}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 18, letterSpacing: '0.16em' }}>MONTHLY</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.sub, marginTop: 3 }}>{t.min}+</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, marginTop: 14, letterSpacing: '0.16em' }}>LAUNCH GIFT</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, color: t.feat ? T.goldB : T.gold, fontWeight: 600, marginTop: 3 }}>{t.gift}</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 16, letterSpacing: '0.16em', borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
                  {dropLive ? t.tok : '— pending —'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: T.sansKr, fontSize: 12, color: T.muted }}>
          ※ 드롭 마감 후 영구 클로즈. 한 번의 기회.
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY BLOCK — resolves @handles ↔ quiet hero tension
// ═══════════════════════════════════════════════════════════════════════════
function CommunityBlock({ mode = 'handles' }) {
  const handles = [
    { r: '01', id: '@goldmode_',  t: 'III', streak: 42 },
    { r: '02', id: '@sooyeon.j',  t: 'III', streak: 38 },
    { r: '03', id: '@minho_01',   t: 'II',  streak: 35 },
    { r: '04', id: '@h_seo',      t: 'II',  streak: 29 },
    { r: '05', id: '@kay.won',    t: 'II',  streak: 24 },
    { r: '06', id: '당신 →',       t: 'I',   streak: 7, me: true },
  ];
  const initials = [
    { r: '01', id: 'K.J.H',  t: 'III', streak: 42 },
    { r: '02', id: 'CHO.S',  t: 'III', streak: 38 },
    { r: '03', id: 'YUN.K',  t: 'II',  streak: 35 },
    { r: '04', id: 'PARK.H', t: 'II',  streak: 29 },
    { r: '05', id: 'KAY.W',  t: 'II',  streak: 24 },
    { r: '06', id: '당신 →',  t: 'I',   streak: 7, me: true },
  ];

  const renderBoard = (rows, title) => (
    <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.24em' }}>{title}</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>THIS WEEK</span>
      </div>
      {rows.map((l, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 44px 54px', gap: 8,
          padding: '11px 0', borderTop: i ? `1px solid ${T.border}` : 'none', alignItems: 'center',
          fontFamily: T.mono, fontSize: 12,
          background: l.me ? 'rgba(197,165,114,0.06)' : 'transparent',
          marginLeft: l.me ? -20 : 0, marginRight: l.me ? -20 : 0,
          paddingLeft: l.me ? 20 : 0, paddingRight: l.me ? 20 : 0,
        }}>
          <span style={{ color: i < 3 ? T.gold : T.muted }}>{l.r}</span>
          <span style={{ color: l.me ? T.goldB : T.text, fontWeight: l.me ? 700 : 400 }}>{l.id}</span>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.gold, fontWeight: 500 }}>{l.t}</span>
          <span style={{ color: T.gold, textAlign: 'right' }}>🔥 {l.streak}d</span>
        </div>
      ))}
      <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, marginTop: 14, textAlign: 'center' }}>
        {mode === 'initials' ? '이니셜 기본 · 실명 선택' : '핸들 · 프로필 공개'}
      </div>
    </div>
  );

  return (
    <section style={{ padding: '80px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em', marginBottom: 12 }}>IV · 커뮤니티 · Community</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: T.text, lineHeight: 1.05, margin: 0, letterSpacing: '-0.02em' }}>
            혼자가 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>아닙니다.</em>
          </h2>
          {mode === 'side-by-side' && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: T.goldGlow, border: `1px solid ${T.goldBorder}`, fontFamily: T.mono, fontSize: 11, color: T.goldD, letterSpacing: '0.12em' }}>
              ↓ COMPARISON · @handles LEFT · initials RIGHT · pick which register fits the brand
            </div>
          )}
        </div>

        {mode === 'side-by-side' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            {renderBoard(handles, 'V3 · @HANDLES · MZ REGISTER')}
            {renderBoard(initials, 'V2 · INITIALS · INSTITUTIONAL')}
            {/* Share card — only works with @handles mode in spirit */}
            <div style={{ background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 60%, ${T.goldDeep})`, padding: 22, color: '#1a1610', position: 'relative', overflow: 'hidden', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', fontWeight: 700 }}>SHARE · IG 1:1</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 18 }}>
                  이번 달도<br/>한 그램.<br/><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 500 }}>7달째 쌓는 중.</span>
                </div>
                <div style={{
                  width: 64, height: 64,
                  border: '2px solid #1a1610',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.serif, fontStyle: 'italic', fontSize: 40, fontWeight: 500,
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>Au</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', marginTop: 4 }}>999.9 · #2848</div>
              </div>
              <button style={{ background: '#1a1610', color: T.gold, padding: '10px 16px', fontSize: 11, fontWeight: 700, fontFamily: T.sans, letterSpacing: '0.1em', alignSelf: 'flex-start', cursor: 'pointer' }}>SHARE ↗</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {renderBoard(mode === 'handles' ? handles : initials, mode === 'handles' ? '리더보드 · 이번 주' : 'LEADERBOARD · ANON')}
            {/* Streak card */}
            <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 20 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.24em', marginBottom: 14 }}>MY STREAK</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 78, color: T.goldB, fontWeight: 600, lineHeight: 1 }}>7</span>
                <span style={{ fontFamily: T.mono, fontSize: 13, color: T.gold, letterSpacing: '0.1em' }}>달 연속</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, marginBottom: 16 }}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ aspectRatio: 1, background: i < 7 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})` : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
                ))}
              </div>
              <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.6, borderLeft: `2px solid ${T.gold}`, paddingLeft: 12 }}>
                12개월 연속 <strong style={{ color: T.gold }}>100g 기념 바</strong>. 24개월 연속 이니셜 각인.
              </div>
            </div>
            {/* Share */}
            <div style={{ background: `linear-gradient(135deg, ${T.goldB}, ${T.gold} 60%, ${T.goldDeep})`, padding: 22, color: '#1a1610', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', fontWeight: 700 }}>SHARE · IG 1:1</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
                  이번 달도<br/>한 그램.<br/><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 500 }}>7달째.</span>
                </div>
                <div style={{
                  width: 58, height: 58,
                  border: '2px solid #1a1610',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.serif, fontStyle: 'italic', fontSize: 36, fontWeight: 500,
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>Au</div>
              </div>
              <button style={{ background: '#1a1610', color: T.gold, padding: '8px 14px', fontSize: 10, fontWeight: 700, fontFamily: T.sans, letterSpacing: '0.1em', alignSelf: 'flex-start', cursor: 'pointer' }}>SHARE ↗</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DROP FINALE FOOTER — V3
// ═══════════════════════════════════════════════════════════════════════════
function DropFinale({ dropLive }) {
  const navigate = useNavigate();
  return (
    <>
      <section style={{ background: T.bg, padding: '80px 20px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 18 }}>· 입구 ·</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 500, color: T.text, lineHeight: 0.96, margin: '0 0 32px', letterSpacing: '-0.02em' }}>
            한 그램.<br/><em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>지금.</em>
          </h2>
          <button onClick={() => navigate('/signup')} style={{ background: T.gold, color: T.bg, padding: '18px 44px', fontFamily: T.sans, fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', cursor: 'pointer' }}>
            GoldPath 시작하기 →
          </button>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 18, letterSpacing: '0.22em' }}>
            {dropLive ? '2,848 / 5,000 · ENDS IN 3D 14H' : 'WAITLIST · NOTIFY AT DROP'}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.goldBorder}`, padding: '60px 24px 56px', background: T.deepBlack, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <AUSquare size={36} />
          <AurumWordmark size={18} serial="MMXXVI" />
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.32em' }}>
          QUIETLY · FOREVER
        </div>
      </footer>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HYBRID DOOR
// ═══════════════════════════════════════════════════════════════════════════
function HybridDoor({ dropLive, socialMode }) {
  return (
    <>
      <HybridHero />
      <FourNumbers />
      <TierDrop dropLive={dropLive} />
      <CommunityBlock mode={socialMode} />
      <DropFinale dropLive={dropLive} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const [door, setDoor] = useState('quiet');
  const [dropLive, setDropLive] = useState(true);
  const [socialMode, setSocialMode] = useState('side-by-side');

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      {/* Universal top-bar stack: Ticker → Menu → Promo */}
      <FloatingMenu />
      {dropLive && door !== 'quiet' && <PromoBar label="FOUNDERS DROP · LIVE" shortLabel="● LIVE" joined={2848} cap={5000} />}

      {door === 'quiet' ? <QuietDoor /> : <HybridDoor dropLive={dropLive} socialMode={socialMode} />}

      <ViewportToggle door={door} setDoor={setDoor} drop={dropLive} setDrop={setDropLive} social={socialMode} setSocial={setSocialMode} devOnly />
    </div>
  );
}
