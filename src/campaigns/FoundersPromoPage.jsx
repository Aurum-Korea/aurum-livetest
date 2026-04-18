// FoundersPromoPage.jsx — standalone marketing/campaign page
// For ads, KakaoTalk links, external campaigns
// Rich visual design: hero + live counter + comparison + gates + social proof + CTA
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fKRW } from '../lib/index.jsx';

const FOUNDERS_CAP    = 500;
const SPOTS_REMAINING = 247;
const FILLED_PCT      = Math.round((FOUNDERS_CAP - SPOTS_REMAINING) / FOUNDERS_CAP * 100);

const GATES = [
  { num: 'I',   label: '시작의 문',   labelEn: 'The Opening',      discount: 1.0, storage: '0.75%', gmv: '$5K',   color: '#8a7d6b' },
  { num: 'II',  label: '셋의 표식',   labelEn: 'The Three',        discount: 1.5, storage: '0.50%', gmv: '$15K',  color: '#8a7d6b' },
  { num: 'III', label: '정점 ✦',      labelEn: 'The Apex ✦',       discount: 2.0, storage: '0.50%', gmv: '$35K',  color: '#4ade80', apex: true },
  { num: 'IV',  label: '볼트 순례',   labelEn: 'Vault Pilgrimage', discount: 2.5, storage: '0.30%', gmv: '$65K',  color: '#C5A572' },
  { num: 'V',   label: '평생의 표식', labelEn: 'Lifetime Mark',    discount: 3.0, storage: '0.30%', gmv: '$100K', color: '#E3C187' },
];

const TESTIMONIALS = [
  { initials: 'K.Y', name: 'KIM Y.', gate: 'Gate III', quote: '한국 은행 대비 온스당 40만원 절약. 계산하기도 부끄러울 정도입니다.', quoteEn: 'Saving ₩400K per oz vs Korean banks. Almost embarrassing.' },
  { initials: 'P.J', name: 'PARK J.', gate: 'Gate II', quote: 'AGP로 매달 자동 적립하면서 게이트 II까지 올라왔습니다. 할인이 진짜입니다.', quoteEn: 'Auto-accumulating with AGP, reached Gate II. The discounts are real.' },
  { initials: 'L.S', name: 'LEE S.', gate: 'Gate I', quote: '처음엔 반신반의했는데, 투명한 백킹 리포트와 Lloyd\'s 보험이 마음을 바꿨습니다.', quoteEn: 'Skeptical at first, but the transparent audit and Lloyd\'s cover convinced me.' },
];

const STATS = [
  { value: '−20%',     label: '한국 대비 평균 절감',     labelEn: 'vs Korea retail avg' },
  { value: '₩0',       label: '숨은 수수료',              labelEn: 'hidden fees' },
  { value: "Lloyd's",  label: '런던 보험 적용',           labelEn: 'London insurance' },
  { value: '99.99%',   label: 'LBMA 순도 보장',          labelEn: 'LBMA purity' },
];

function useCountDown(target) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

export default function FoundersPromoPage({ lang, navigate, prices, krwRate = 1440 }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [email, setEmail] = useState('');
  const [notifyDone, setNotifyDone] = useState(false);
  const [activeGate, setActiveGate] = useState(2);
  const spotsCount = useCountDown(SPOTS_REMAINING);
  const heroRef = useRef(null);
  const [heroVis, setHeroVis] = useState(false);

  const goldSpot = prices?.gold || 3342;
  const koreaPrice = Math.round(goldSpot * krwRate * 1.20);
  const aurumPrice = Math.round(goldSpot * krwRate * 1.08);
  const savingsPerOz = koreaPrice - aurumPrice;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeroVis(true); }, { threshold: 0.1 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const MONO = T.mono;
  const SERIF = T.serif;
  const SANS = T.sans;
  const SERIF_KR = T.serifKr;

  return (
    <div style={{ background: T.bg, color: T.text, overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: isMobile ? '100svh' : '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '80px 20px 60px' : '100px 80px 80px', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(197,165,114,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: -20, right: isMobile ? -20 : 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 80 : 180, color: 'rgba(197,165,114,0.025)', userSelect: 'none', lineHeight: 1, pointerEvents: 'none' }}>FOUNDERS</div>

        <div style={{ position: 'relative', maxWidth: 820 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: heroVis ? 1 : 0, transition: 'opacity 0.6s 0.1s' }}>
            <span className="live-dot-gold" />
            <span style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
              {ko ? 'Founders Club · 한정 모집' : 'Founders Club · Limited Enrollment'}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 'clamp(40px,10vw,52px)' : 'clamp(52px,6vw,80px)', fontWeight: 400, lineHeight: 1.05, marginBottom: 20, opacity: heroVis ? 1 : 0, transition: 'opacity 0.7s 0.2s, transform 0.7s 0.2s', transform: heroVis ? 'translateY(0)' : 'translateY(20px)' }}>
            {ko ? <>한국보다 최대<br /><span style={{ color: T.gold }}>−3% 저렴하게.</span><br />지금 가입하면<br /><span style={{ color: T.gold }}>첫날부터.</span></> : <>Up to −3% below<br /><span style={{ color: T.gold }}>Korea retail.</span><br />Your gates start<br /><span style={{ color: T.gold }}>day one.</span></>}
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 18, color: T.textSub, lineHeight: 1.75, maxWidth: 540, marginBottom: 36, opacity: heroVis ? 1 : 0, transition: 'opacity 0.7s 0.35s' }}>
            {ko ? 'Founders Club 멤버는 누적 거래액(GMV)에 따라 자동으로 가격 할인이 적용됩니다. 한 번 열린 게이트는 영원히 열려있습니다.' : 'Founders Club members get automatic lifetime discounts based on cumulative volume. Gates never close once opened.'}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', opacity: heroVis ? 1 : 0, transition: 'opacity 0.7s 0.45s' }}>
            <button onClick={() => navigate('register')} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: isMobile ? '16px 28px' : '18px 40px', fontSize: isMobile ? 14 : 16, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, letterSpacing: '0.02em' }}>
              {ko ? '지금 가입하기 →' : 'Join Now →'}
            </button>
            <button onClick={() => navigate('founders')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: isMobile ? '16px 24px' : '18px 32px', fontSize: isMobile ? 14 : 15, cursor: 'pointer', fontFamily: SANS }}>
              {ko ? 'Founders Club 자세히' : 'Learn More'}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${T.gold})` }} />
          <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: T.goldDim }}>SCROLL</span>
        </div>
      </div>

      {/* ── LIVE SAVINGS TICKER ── */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.goldBorder}`, borderBottom: `1px solid ${T.goldBorder}`, padding: isMobile ? '28px 20px' : '32px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 20 : 0 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: isMobile ? 0 : '0 24px', borderRight: !isMobile && i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: isMobile ? 22 : 28, color: T.gold, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{ko ? s.label : s.labelEn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MEMBER CAP COUNTER ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 80px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 20 }}>
          {ko ? '남은 멤버십 자리' : 'Spots Remaining'}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 72 : 120, color: T.gold, lineHeight: 1, marginBottom: 8 }}>
          {spotsCount}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: T.textMuted, letterSpacing: '0.1em', marginBottom: 24 }}>
          / {FOUNDERS_CAP} {ko ? '총 자리' : 'total spots'}
        </div>
        {/* Progress bar */}
        <div style={{ maxWidth: 560, margin: '0 auto 10px', height: 4, background: 'rgba(197,165,114,0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${FILLED_PCT}%`, background: `linear-gradient(90deg, ${T.goldDeep}, ${T.gold}, ${T.goldBright})`, transition: 'width 1.5s cubic-bezier(0.25,1,0.5,1)' }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.14em' }}>{FILLED_PCT}% FILLED</div>
      </div>

      {/* ── PRICE COMPARISON ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 80px', background: T.bg2, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
              {ko ? '실시간 가격 비교 · 금 1oz 기준' : 'Live Price Comparison · Per 1oz Gold'}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 28 : 38, color: T.text }}>
              {ko ? <>한국에서 사면<br /><span style={{ color: '#f87171' }}>얼마나 더 비싼가?</span></> : <>How much more does<br /><span style={{ color: '#f87171' }}>Korea retail cost?</span></>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: ko ? '한국 은행 / KRX' : 'Korean Banks / KRX', price: koreaPrice, color: '#f87171', sub: ko ? '20% 프리미엄 포함' : '~20% Korean premium', width: 100 },
              { label: ko ? 'Aurum Korea' : 'Aurum Korea', price: aurumPrice, color: T.gold, sub: ko ? '8% 투명 프리미엄' : '8% transparent premium', width: 40 },
            ].map((item, i) => (
              <div key={i} style={{ background: T.bgCard, border: `1px solid ${i === 1 ? T.goldBorder : T.border}`, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                {i === 1 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />}
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{item.label}</div>
                <div style={{ fontFamily: SANS, fontSize: isMobile ? 26 : 32, color: item.color, fontWeight: 700, marginBottom: 6 }}>
                  ₩{item.price.toLocaleString('ko-KR')}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.textMuted, marginBottom: 16 }}>{item.sub}</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${item.width}%`, background: item.color, opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 14, color: T.text, fontWeight: 600 }}>{ko ? '1oz당 절감액' : 'Savings per oz'}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: SANS, fontSize: isMobile ? 24 : 30, color: '#4ade80', fontWeight: 700 }}>+₩{savingsPerOz.toLocaleString('ko-KR')}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(74,222,128,0.6)' }}>{ko ? '한국 대비 절감 (1oz)' : 'saved vs Korea per oz'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FIVE GATES — interactive ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 80px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>The Five Gates</div>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 28 : 42, color: T.text }}>
              {ko ? <>문을 통과할수록<br /><span style={{ color: T.gold }}>가격이 낮아집니다</span></> : <>Each gate you pass,<br /><span style={{ color: T.gold }}>your price drops</span></>}
            </div>
          </div>

          {/* Gate selector pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {GATES.map((g, i) => (
              <button key={i} onClick={() => setActiveGate(i)} style={{
                background: activeGate === i ? (g.apex ? 'rgba(74,222,128,0.12)' : 'rgba(197,165,114,0.12)') : 'transparent',
                border: `1px solid ${activeGate === i ? g.color : T.border}`,
                color: activeGate === i ? g.color : T.textMuted,
                padding: '6px 16px', fontFamily: MONO, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
                letterSpacing: '0.08em',
              }}>Gate {g.num}</button>
            ))}
          </div>

          {/* Active gate detail */}
          {GATES.map((g, i) => i === activeGate && (
            <div key={i} style={{ background: g.apex ? 'rgba(74,222,128,0.04)' : T.bgCard, border: `1px solid ${g.apex ? 'rgba(74,222,128,0.35)' : T.goldBorder}`, padding: isMobile ? '28px 24px' : '40px 48px', position: 'relative', overflow: 'hidden' }}>
              {g.apex && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: isMobile ? 20 : 0 }}>
                {[
                  { label: ko ? '게이트' : 'Gate', val: `Gate ${g.num}`, sub: ko ? g.label : g.labelEn, color: g.color },
                  { label: ko ? 'GMV 기준' : 'GMV Threshold', val: g.gmv, sub: ko ? '누적 거래액' : 'Cumulative volume', color: T.text },
                  { label: ko ? '가격 할인' : 'Price Discount', val: `−${g.discount}%`, sub: ko ? '평생 자동 적용' : 'Lifetime auto-applied', color: g.color },
                  { label: ko ? '보관료' : 'Storage Rate', val: `${g.storage} p.a.`, sub: ko ? '연간 보관 수수료' : 'Annual storage fee', color: T.blue },
                ].map((item, ii) => (
                  <div key={ii} style={{ textAlign: 'center', padding: isMobile ? 0 : '0 20px', borderRight: !isMobile && ii < 3 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: T.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
                    <div style={{ fontFamily: MONO, fontSize: isMobile ? 24 : 30, color: item.color, fontWeight: 700, marginBottom: 4 }}>{item.val}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Gate progress bar */}
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {GATES.map((g, i) => (
              <div key={i} onClick={() => setActiveGate(i)} style={{ height: 3, background: i <= activeGate ? g.color : T.border, cursor: 'pointer', transition: 'background 0.3s', opacity: i <= activeGate ? 1 : 0.4 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── EXPERT CONTEXT ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 80px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
              {ko ? '2026년 지금, 왜 금인가' : 'Why Gold, Why Now — 2026'}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 24 : 32, color: T.text }}>
              {ko ? '중앙은행이 역대 최대로 사들이는 이유가 있습니다' : 'Central banks are buying at record pace — for good reason'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            {[
              { stat: '220t',   label: ko?'Q3 2025 중앙은행 순매입':'CB Net Buying Q3\'25',   sub: ko?'전분기 대비 +28%':'+28% QoQ',      color: T.gold   },
              { stat: '$4,800+', label: ko?'금 현재가 (역대 최고 근접)':'Gold near all-time high', sub: ko?'2026년 4월':'April 2026',       color: T.gold   },
              { stat: '6년',    label: ko?'연속 은 공급 부족':'Consecutive silver deficit',   sub: ko?'2026년 6,700만 oz 부족':'67Moz short 2026', color:'#7dd3dc' },
              { stat: '20%',    label: ko?'한국 현재 프리미엄':'Korea current premium',       sub: ko?'vs 국제 현물가':'vs international spot', color:'#f87171' },
            ].map((s, i) => (
              <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: isMobile ? 32 : 40, color: s.color, fontWeight: 700, flexShrink: 0 }}>{s.stat}</div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: T.textMuted }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 80px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
              {ko ? 'Founders 멤버 후기' : 'Founders Member Reviews'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: 'rgba(197,165,114,0.15)', lineHeight: 1 }}>"</div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: T.textSub, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>
                  "{ko ? t.quote : t.quoteEn}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(197,165,114,0.1)', border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, color: T.gold, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: T.text, letterSpacing: '0.1em' }}>{t.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: T.goldDim, letterSpacing: '0.08em' }}>{t.gate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div style={{ padding: isMobile ? '32px 20px' : '32px 80px', background: T.bg2, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: isMobile ? 16 : 40, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { icon: '🏦', label: 'Malca-Amit SG FTZ' },
            { icon: '🛡️', label: "Lloyd's of London" },
            { icon: '✅', label: 'LBMA Approved' },
            { icon: '🔒', label: 'AML/KYC Compliant' },
            { icon: '📊', label: ko ? '매일 감사' : 'Daily Audit' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.65 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.textSub, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '110px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse at 50% 100%, rgba(197,165,114,0.12), transparent 60%)` }}>
        <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 70 : 160, color: 'rgba(197,165,114,0.02)', whiteSpace: 'nowrap', userSelect: 'none', letterSpacing: '0.1em' }}>FOUNDERS</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>— Exclusive · First-Come, First-Served —</div>
          <h2 style={{ fontFamily: SERIF_KR, fontSize: isMobile ? 28 : 48, fontWeight: 400, color: T.text, marginBottom: 12, lineHeight: 1.1 }}>
            {ko ? <>지금 가입하면<br /><em style={{ fontFamily: SERIF, fontStyle: 'italic', color: T.gold, fontWeight: 300 }}>첫날부터 게이트가 시작됩니다</em></> : <>Join today and<br /><em style={{ fontFamily: SERIF, fontStyle: 'italic', color: T.gold, fontWeight: 300 }}>your gates start from day one</em></>}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: T.textSub, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 36px' }}>
            {ko ? `Founders Club 멤버십은 ${FOUNDERS_CAP}명으로 제한됩니다. 현재 ${spotsCount}자리 남았습니다.` : `Founders Club is capped at ${FOUNDERS_CAP} members. ${spotsCount} spots remaining now.`}
          </p>

          {SPOTS_REMAINING <= 0 ? (
            <div style={{ maxWidth: 400, margin: '0 auto' }}>
              {notifyDone ? (
                <p style={{ fontFamily: SANS, fontSize: 14, color: '#4ade80' }}>{ko ? '재오픈 시 알림을 보내드립니다.' : 'We\'ll notify you when spots reopen.'}</p>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={ko ? '이메일 주소' : 'Your email'} style={{ flex: 1, background: T.bg1, border: `1px solid ${T.goldBorder}`, color: T.text, padding: '14px 16px', fontSize: 14, fontFamily: SANS, outline: 'none' }} />
                  <button onClick={() => setNotifyDone(true)} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: '14px 20px', fontFamily: SANS, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {ko ? '알림 받기' : 'Notify Me'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('register')} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: isMobile ? '16px 32px' : '18px 48px', fontSize: isMobile ? 14 : 16, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, letterSpacing: '0.02em' }}>
                {ko ? '파운더스 클럽 가입 →' : 'Join Founders Club →'}
              </button>
              <button onClick={() => navigate('founders')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: isMobile ? '16px 24px' : '18px 36px', fontSize: isMobile ? 14 : 15, cursor: 'pointer', fontFamily: SANS }}>
                {ko ? '멤버십 상세 보기' : 'View Full Details'}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
