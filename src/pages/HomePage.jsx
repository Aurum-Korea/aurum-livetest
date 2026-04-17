// HomePage.jsx — self-contained, no new lib constant imports
// Price card (image 1) matches ShopPages.jsx Home hero card exactly
import { useState, useEffect } from 'react';
import { useIsMobile, fUSD, fKRW } from '../lib/index.jsx';
import { StatBar, Accordion, SectionHead } from '../components/UI.jsx';

// All pricing constants inline — no lib import needed
const KR_GOLD_PREMIUM    = 0.20;
const KR_SILVER_PREMIUM  = 0.30;
const AURUM_GOLD_PREMIUM = 0.08;
const AURUM_SILVER_PREMIUM = 0.15;
const OZ_IN_GRAMS  = 31.1035;
const DON_IN_GRAMS = 3.75;

// ─── Shared style tokens (mirrors T.* from lib) ───────────────────────────────
const MONO   = "'JetBrains Mono',monospace";
const SERIF  = "'Cormorant Garamond',serif";
const SANS   = "'Outfit',sans-serif";
const SERIF_KR = "'Noto Serif KR','Cormorant Garamond',serif";
const GOLD_LINE = { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c5a572, transparent)', pointerEvents: 'none', zIndex: 1 };
// Eyebrow label — AGP Launch standard: mono 9px goldDim 0.26em (D-4 fix)
const eyebrowStyle = { fontFamily: MONO, fontSize: 9, color: '#8a7d6b', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 10, display: 'block' };
// Hero eyebrow uses gold color for visibility on dark gradient background
const heroEyebrowStyle = { fontFamily: MONO, fontSize: 9, color: '#c5a572', letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: 18, display: 'block' };

// ─── Price Comparison Card — matches aurum-test ShopPages.jsx hero card ───────
function PriceComparisonCard({ lang, prices, krwRate }) {
  const [displayPrice, setDisplayPrice] = useState(prices.gold);
  const [flash, setFlash] = useState(false);

  useEffect(() => { setDisplayPrice(prices.gold); }, [prices.gold]);
  useEffect(() => {
    const t = setInterval(() => {
      setDisplayPrice(p => p + (Math.random() - 0.48) * 0.35);
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const goldKR  = prices.gold * krwRate * (1 + KR_GOLD_PREMIUM);
  const goldAU  = prices.gold * (1 + AURUM_GOLD_PREMIUM) * krwRate;
  const savings = goldKR - goldAU;
  const savePct = (savings / goldKR * 100).toFixed(1);

  return (
    // D-5: added position relative + overflow hidden + gold top-line accent
    <div style={{ width: 300, flexShrink: 0, background: 'rgba(197,165,114,0.04)', border: '1px solid rgba(197,165,114,0.18)', borderRadius: 0, padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* D-5: gold top-line accent */}
      <div style={GOLD_LINE} />
      {/* LIVE dot */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#4ade80', letterSpacing: 1 }}>LIVE</span>
      </div>
      {/* Header — D-4: standardized eyebrow */}
      <div style={{ ...eyebrowStyle, color: '#c5a572', marginBottom: 18 }}>
        {lang === 'ko' ? '금 1온스 기준 가격 비교' : 'Gold 1oz Price Comparison'}
      </div>
      {/* Bar rows */}
      {[
        { label: lang === 'ko' ? '한국 시중가' : 'Korean Retail', price: goldKR,  barW: '100%',                               barColor: 'rgba(248,113,113,0.25)', border: '#f87171', textColor: '#f87171' },
        { label: lang === 'ko' ? 'Aurum 가격'  : 'Aurum Price',   price: goldAU,  barW: `${(goldAU/goldKR*100).toFixed(0)}%`, barColor: 'rgba(197,165,114,0.2)',   border: '#c5a572', textColor: '#c5a572' },
      ].map((row, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: '#a09080' }}>{row.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 13, color: row.textColor, fontWeight: 600 }}>{fKRW(row.price)}</span>
          </div>
          <div style={{ height: 5, borderRadius: 2, background: '#1e1e1e', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: row.barW, background: row.barColor, border: `1px solid ${row.border}`, borderRadius: 2, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
      {/* Savings badge */}
      <div style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 0, padding: '10px 14px', marginTop: 6 }}>
        <div style={{ fontFamily: SANS, fontSize: 10, color: '#4ade80', marginBottom: 3 }}>
          {lang === 'ko' ? '절약 금액' : 'You Save'}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 16, color: '#4ade80', fontWeight: 700 }}>
          {fKRW(savings)} <span style={{ fontSize: 11 }}>({savePct}%)</span>
        </div>
      </div>
      {/* Spot ref */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(197,165,114,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#555', letterSpacing: 1 }}>XAU/USD</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: flash ? '#c5a572' : '#a09080', fontWeight: 600, transition: 'color 0.3s' }}>${displayPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Campaign panels — hero right column ─────────────────────────────────────
function CampaignPanels({ navigate, lang }) {
  const isMobile = useIsMobile();
  const panels = [
    { route: 'campaign-agp-launch', badge: 'AGP 론치 이벤트 · LAUNCH EVENT', headline: '시작하는 날,', sub: '금을 더 드립니다.', desc: '브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시', cta: '지금 신청하기 →', gold: false },
    { route: 'campaign-founders',   badge: 'Founders Club · 파운더스 클럽',   headline: '더 많이 구매할수록,', sub: '더 싸게 — 영원히.', desc: 'GMV 5개 게이트 통과 시 표시가 자동 차감 · 최대 −3.0% · 평생', cta: 'Founders Club 가입하기 →', gold: true },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(197,165,114,0.2)', overflow: 'hidden', borderRadius: 0 }}>
      {panels.map((p, i) => (
        <div key={i} onClick={() => navigate(p.route)} style={{ background: p.gold ? 'rgba(197,165,114,0.06)' : '#16140f', borderBottom: i === 0 ? '1px solid rgba(197,165,114,0.2)' : 'none', padding: '20px 22px', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.11)'}
          onMouseLeave={e => e.currentTarget.style.background = p.gold ? 'rgba(197,165,114,0.06)' : '#16140f'}>
          {/* D-4: standardized eyebrow */}
          <div style={{ fontFamily: MONO, fontSize: 8, color: '#c5a572', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 7 }}>{p.badge}</div>
          <div style={{ fontFamily: SERIF, fontSize: isMobile ? 17 : 19, color: '#f5f0e8', lineHeight: 1.25, marginBottom: 5, fontWeight: 500 }}>
            {p.headline} <span style={{ color: '#c5a572', fontStyle: 'italic' }}>{p.sub}</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: '#a09080', lineHeight: 1.65, marginBottom: 14 }}>{p.desc}</div>
          <button style={{ background: p.gold ? '#c5a572' : 'transparent', border: p.gold ? 'none' : '1px solid rgba(197,165,114,0.3)', color: p.gold ? '#0a0a0a' : '#c5a572', padding: '8px 16px', fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }} onClick={e => { e.stopPropagation(); navigate(p.route); }}>
            {p.cta}
          </button>
        </div>
      ))}
      <div style={{ background: '#0a0a0a', padding: '10px 14px', borderTop: '1px solid #1e1e1e', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {['SG FTZ', "Lloyd's", 'LBMA', 'PSPM 2019'].map((t, i) => (
          <span key={i} style={{ fontFamily: MONO, fontSize: 8, color: '#555', letterSpacing: '0.08em' }}>{t}</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c5a572', animation: 'pulse 1.6s ease-in-out infinite' }} />
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#c5a572', letterSpacing: '0.14em' }}>OPEN</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage({ navigate, prices, krwRate, currency, setCurrency, lang }) {
  const isMobile = useIsMobile();
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const pad = isMobile ? '40px 0' : '72px 0'; // horizontal handled by aurum-container

  // Pricing
  const goldKR  = prices.gold * krwRate * (1 + KR_GOLD_PREMIUM);
  const goldAU  = prices.gold * (1 + AURUM_GOLD_PREMIUM) * krwRate;
  const goldSave = goldKR - goldAU;
  const goldSavePct = (goldSave / goldKR * 100).toFixed(1);

  const KG = 1000 / OZ_IN_GRAMS;
  const silvKR  = (prices.silver||32.15) * KG * krwRate * (1 + KR_SILVER_PREMIUM);
  const silvAU  = (prices.silver||32.15) * KG * (1 + AURUM_SILVER_PREMIUM) * krwRate;
  const silvSave = silvKR - silvAU;
  const silvSavePct = (silvSave / silvKR * 100).toFixed(1);

  const whyItems = [
    {
      icon: '⚖️',
      title: lang === 'ko' ? '완전 배분 보관 — 귀하의 금속, 귀하의 이름' : 'Fully Allocated Storage — Your Metal, Your Name',
      content: lang === 'ko'
        ? '귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다.'
        : 'Your metal is never commingled with other clients. Registered in your name with a unique serial number at the Malca-Amit Singapore FTZ vault.',
    },
    {
      icon: '📊',
      title: lang === 'ko' ? '국제 현물가 직거래 — 김치 프리미엄 없음' : 'International Spot Price — No Kimchi Premium',
      content: lang === 'ko'
        ? '한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 8%(금)/15%(은) 투명 프리미엄.'
        : 'Korean retail (KRX, bank gold accounts) carries ~20% above international spot. Aurum: LBMA spot + 8% (gold) / 15% (silver) transparent premium.',
    },
    {
      icon: '🛡️',
      title: "Lloyd's of London — " + (lang === 'ko' ? '기관급 전액 보험' : 'Full Institutional Insurance'),
      content: lang === 'ko'
        ? "모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트 공개."
        : "All held metals are fully insured by Lloyd's of London institutional coverage. Covers natural disaster, theft, and loss. Daily audit reports published.",
    },
    {
      icon: '✅',
      title: lang === 'ko' ? 'LBMA 승인 바 & 언제든 실물 인출' : 'LBMA-Approved Bars & Physical Withdrawal Anytime',
      content: lang === 'ko'
        ? '모든 금속은 LBMA 승인 제련소(PAMP, Heraeus, Valcambi, RCM) 제품입니다. 100g 이상 보유 시 실물 바로 무료 전환 또는 KRW 즉시 정산.'
        : 'All metals are from LBMA-approved refiners (PAMP, Heraeus, Valcambi, RCM). Free physical bar conversion at 100g+ or instant KRW settlement.',
    },
    {
      icon: '🔍',
      title: lang === 'ko' ? '매일 공개 감사 · 100% 실물 백킹' : 'Daily Public Audit · 100% Physical Backing',
      content: lang === 'ko'
        ? '모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 숨겨진 레버리지 없음.'
        : '100% physical backing for every AGP gram and allocated metal is published daily in the audit report. No hidden leverage.',
    },
  ];

  return (
    <div>
      {/* ① HERO — left text + right = price card (desktop) or campaign panels */}
      <div style={{ position: 'relative', minHeight: isMobile ? 'auto' : 540, background: 'linear-gradient(135deg,#0a0a0a,#1e1e1e 40%,#0d0d0d)', display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 40px)', pointerEvents: 'none' }} />
        <div className="aurum-container" style={{ position: 'relative', zIndex: 1, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48, paddingTop: isMobile ? 40 : 80, paddingBottom: isMobile ? 32 : 80 }}>
          {/* Left: hero copy */}
          <div style={{ flex: 1, maxWidth: isMobile ? '100%' : 580 }}>
            {/* M-3: standardized hero eyebrow — mono 9px gold 0.32em letterSpacing */}
            <span style={heroEyebrowStyle}>
              {lang === 'ko' ? '배분 보관 · 국제 현물가 · 한국 투자자 전용' : 'Allocated Storage · International Spot Price · For Korean Investors'}
            </span>
            {/* M-2: h1 mobile from 28→32, matches other page heroes at clamp(32px,5vw,54px) */}
            <h1 style={{ fontFamily: SERIF, fontSize: isMobile ? 32 : 54, fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: '0 0 20px' }}>
              {lang === 'ko' ? (<><span style={{ color: '#c5a572', fontWeight: 600 }}>진짜 금. 진짜 은.</span><br />진짜 소유.</>) : (<><span style={{ color: '#c5a572', fontWeight: 600 }}>Real Gold. Real Silver.</span><br />Real Ownership.</>)}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: isMobile ? 14 : 16, color: '#a09080', lineHeight: 1.75, margin: '0 0 28px' }}>
              {lang === 'ko' ? '은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.' : 'Not a bank account. Not a KRX fund. Physical metal registered in your name at the Malca-Amit Singapore FTZ vault — priced at international spot.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => navigate('shop-physical')} style={{ flex: 1, background: 'linear-gradient(135deg,#c5a572,#8a6914)', color: '#fff', border: 'none', padding: '14px 20px', fontSize: 15, fontFamily: SANS, fontWeight: 700, borderRadius: 4, cursor: 'pointer' }}>
                {lang === 'ko' ? '지금 구매 시작 →' : 'Start Buying →'}
              </button>
              <button onClick={() => navigate('agp-intro')} style={{ flex: 1, background: 'transparent', color: '#a09080', border: '1px solid #282828', padding: '14px 20px', fontSize: 15, fontFamily: SANS, fontWeight: 600, borderRadius: 4, cursor: 'pointer' }}>
                {lang === 'ko' ? 'AGP · 월 20만원부터' : 'AGP Savings · from ₩200K/mo'}
              </button>
            </div>
            {/* M-4: trust badges — added justifyContent center, gap 12 */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {(lang === 'ko' ? ["Lloyd's 보험", 'LBMA 승인', '완전 배분 보관', '매일 공개 감사'] : ["Lloyd's Insured", 'LBMA Approved', 'Fully Allocated', 'Daily Audit']).map((t, i) => (
                <span key={i} style={{ fontFamily: MONO, fontSize: 10, color: '#8a7d6b', letterSpacing: '0.1em' }}>✓ {t}</span>
              ))}
            </div>
          </div>

          {/* Right desktop: price comparison card */}
          {!isMobile && <PriceComparisonCard lang={lang} prices={prices} krwRate={krwRate} />}
        </div>
        {/* M-1: CampaignPanels mobile — wrapped in aurum-container for proper 16px horizontal padding */}
        {isMobile && (
          <div className="aurum-container" style={{ paddingBottom: 32 }}>
            <CampaignPanels navigate={navigate} lang={lang} />
          </div>
        )}
      </div>

      {/* ② Campaign panels — desktop only, below hero */}
      {!isMobile && (
        <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
          <div className="aurum-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 32, paddingTop: 20 }}>
            {[
              { route: 'campaign-agp-launch', badge: 'AGP 론치 이벤트 · LAUNCH EVENT', headline: lang === 'ko' ? '시작하는 날,' : 'Start date,', sub: lang === 'ko' ? '금을 더 드립니다.' : 'We give you gold.',       desc: lang === 'ko' ? '브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시' : 'Bronze ₩50K → Sovereign ₩5M · 5-tier physical gold gift · credited on first payment', cta: lang === 'ko' ? '지금 신청하기 →' : 'Apply Now →' },
              { route: 'campaign-founders',   badge: 'Founders Club · 파운더스 클럽',  headline: lang === 'ko' ? '더 많이 구매할수록,' : 'The more you buy,', sub: lang === 'ko' ? '더 싸게 — 영원히.' : 'the cheaper — forever.', desc: lang === 'ko' ? 'GMV 5개 게이트 통과 시 표시가 자동 차감 · 최대 −3.0% · 평생' : 'Auto-deducted from listed price across 5 GMV gates · up to −3.0% · lifetime', cta: 'Founders Club →' },
            ].map((p, i) => (
              <div key={i} onClick={() => navigate(p.route)} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 0, padding: '18px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
                <div>
                  {/* D-4: standardized eyebrow */}
                  <div style={{ fontFamily: MONO, fontSize: 8, color: '#c5a572', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 5 }}>{p.badge}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 17, color: '#f5f0e8', lineHeight: 1.3, marginBottom: 4 }}>
                    {p.headline} <span style={{ color: '#c5a572', fontStyle: 'italic' }}>{p.sub}</span>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: '#a09080' }}>{p.desc}</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid rgba(197,165,114,0.3)', color: '#c5a572', padding: '8px 16px', fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4, flexShrink: 0 }} onClick={e => { e.stopPropagation(); navigate(p.route); }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ③ Stats bar — M-5: fixed border logic for 2-column mobile grid */}
      <div style={{ background: '#141414', borderBottom: '1px solid #1e1e1e' }}>
        <div className="aurum-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)' }}>
          {[['100%', lang === 'ko' ? '완전 배분 보관' : 'Fully Allocated'], ['+8%', lang === 'ko' ? 'Aurum 금 투명 프리미엄' : 'Aurum Gold Premium'], ["Lloyd's", lang === 'ko' ? '기관급 전액 보험' : 'Full Insurance'], ['LBMA', lang === 'ko' ? '승인 제련소' : 'Approved Bars']].map(([v, l], i) => (
            <div key={i} style={{
              padding: isMobile ? '14px 12px' : '18px 24px',
              textAlign: 'center',
              // M-5: correct border logic for 2-col mobile grid
              borderRight: isMobile
                ? (i % 2 === 0 ? '1px solid #1e1e1e' : 'none')
                : (i < 3 ? '1px solid #1e1e1e' : 'none'),
              // M-5: add row separator for mobile 2×2 grid
              borderBottom: isMobile && i < 2 ? '1px solid #1e1e1e' : 'none',
            }}>
              <div style={{ fontFamily: MONO, fontSize: isMobile ? 16 : 20, color: '#c5a572', fontWeight: 700 }}>{v}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: '#8a7d6b', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ④ Savings comparison — side by side */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 32 : 60 }}>
          {/* M-6: currency toggle — moved inside header block, alignSelf fix */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              {/* D-4: standardized eyebrow */}
              <span style={eyebrowStyle}>{lang === 'ko' ? '가격 비교' : 'Price Comparison'}</span>
              <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>{lang === 'ko' ? '얼마나 절약하나요?' : 'How Much Do You Save?'}</h2>
              <p style={{ fontFamily: SANS, fontSize: 13, color: '#8a7d6b', margin: '6px 0 0' }}>{lang === 'ko' ? 'Aurum 매입가 vs 한국실금가 (국내 프리미엄+VAT)' : 'Aurum Price vs Korean Retail (domestic premium + VAT)'}</p>
            </div>
            {/* M-6: alignSelf so it doesn't orphan left on mobile */}
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: 'rgba(197,165,114,0.08)', border: '1px solid rgba(197,165,114,0.4)', color: '#c5a572', padding: '5px 14px', cursor: 'pointer', fontFamily: MONO, fontSize: 11, borderRadius: 4, alignSelf: 'flex-start' }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { label: lang === 'ko' ? '금 Gold' : 'Gold', unit: '1 oz', kr: goldKR, au: goldAU, save: goldSave, pct: goldSavePct },
              { label: lang === 'ko' ? '은 Silver' : 'Silver', unit: '1 kg', kr: silvKR, au: silvAU, save: silvSave, pct: silvSavePct },
            ].map((c, i) => (
              // D-5: gold top-line accent on savings cards
              <div key={i} style={{ background: '#141414', border: '1px solid rgba(197,165,114,0.20)', borderRadius: 0, padding: '22px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={GOLD_LINE} />
                {/* D-4: eyebrow */}
                <div style={{ fontFamily: MONO, fontSize: 9, color: '#8a7d6b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>{c.label} · {c.unit}</div>
                {[
                  { l: lang === 'ko' ? '한국실금가 (국내 프리미엄+VAT)' : 'Korea Retail (premium+VAT)', v: fP(c.kr / krwRate), col: '#f87171' },
                  { l: lang === 'ko' ? 'Aurum 매입가' : 'Aurum Price', v: fP(c.au / krwRate), col: '#c5a572' },
                ].map((r, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #1e1e1e' }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#a09080' }}>{r.l}</span>
                    <span style={{ fontFamily: MONO, fontSize: 16, color: r.col, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 0, padding: '12px 14px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>{lang === 'ko' ? '절감 금액' : 'Your Savings'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: '#4ade80', fontWeight: 700 }}>{fKRW(c.save)}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555' }}>{c.pct}% 절약</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 10, fontFamily: SANS, fontSize: 11, color: '#555', lineHeight: 1.6 }}>
{lang === 'ko' ? '* 국제 현물가 실시간 기준. 한국실금가 = 국제 현물가 + 20%(금)/+30%(은) 국내 프리미엄. Aurum = 국제 현물가 + 8%(금)/+15%(은).' : '* Based on live international spot price. Korean Retail = spot + 20% (gold) / +30% (silver) domestic premium. Aurum = spot + 8% (gold) / +15% (silver).'}
          </p>
        </div>
      </div>

      {/* ⑤ Paper vs Physical */}
      <div style={{ borderBottom: '1px solid #1e1e1e' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* D-4: standardized eyebrow */}
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '근본적인 차이' : 'The Fundamental Difference'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>
              {lang === 'ko' ? <>금을 소유하는 두 가지 방법.<br /><span style={{ color: '#c5a572' }}>진짜는 하나입니다.</span></> : <>Two ways to own gold.<br /><span style={{ color: '#c5a572' }}>Only one is real.</span></>}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {/* Paper gold card */}
            <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 0, padding: '26px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lang === 'ko' ? '페이퍼 금·은' : 'Paper Gold/Silver'}</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: '#f5f0e8', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.4 }}>{lang === 'ko' ? '"귀하는 금에 대한 청구권을 보유합니다"' : '"You hold a claim on gold"'}</p>
              {(lang === 'ko' ? ['은행 금통장, KRX 계좌, 펀드', '상대방 리스크 — 은행 부도 시 손실', '법적 소유권 없음. 일련번호 없음.', '인출 불가 또는 높은 수수료'] : ['Bank gold accounts, KRX fund, ETF', 'Counterparty risk — loss if bank fails', 'No legal ownership. No serial number.', 'No physical withdrawal or high fees']).map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px dashed #1e1e1e' : 'none' }}>
                  <span style={{ color: '#f87171', fontFamily: MONO, fontSize: 11, flexShrink: 0, marginTop: 1 }}>×</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: '#a09080', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            {/* Aurum allocated card — D-5: gold top-line */}
            <div style={{ background: '#141414', border: '1px solid rgba(197,165,114,0.25)', borderRadius: 0, padding: '26px', position: 'relative', overflow: 'hidden' }}>
              <div style={GOLD_LINE} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#4ade80', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lang === 'ko' ? '실물 배분 금속 (Aurum)' : 'Allocated Physical Metal (Aurum)'}</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: '#f5f0e8', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.4 }}>{lang === 'ko' ? <>\"귀하가 금 <em style={{ color: '#c5a572' }}>자체</em>를 소유합니다\"</> : <>\"You own the gold <em style={{ color: '#c5a572' }}>itself</em>\"</>}</p>
              {(lang === 'ko' ? ['귀하의 이름 · 귀하의 일련번호', '완전 분리 보관 — 어떤 은행과도 무관', '첫날부터 귀하의 법적 소유권', 'LBMA 바로 무료 실물 인출'] : ['Your name · your serial number', 'Fully segregated — no bank involvement', 'Legal ownership from day one', 'Free physical bar withdrawal at any time']).map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px dashed rgba(197,165,114,0.1)' : 'none' }}>
                  <span style={{ color: '#4ade80', fontFamily: MONO, fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: '#f5f0e8', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ Why Aurum accordion */}
      <div style={{ borderBottom: '1px solid #1e1e1e' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ marginBottom: 28 }}>
            {/* D-4: standardized eyebrow */}
            <span style={eyebrowStyle}>{lang === 'ko' ? '핵심 차별점' : 'Why Choose Aurum'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>{lang === 'ko' ? '왜 Aurum이어야 하는가' : 'The Aurum Difference'}</h2>
          </div>
          <Accordion items={whyItems} />
        </div>
      </div>

      {/* ⑦ Shop cards */}
      <div style={{ padding: pad, background: '#141414', borderBottom: '1px solid #1e1e1e' }}>
        <div className="aurum-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {/* D-4: standardized eyebrow */}
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '시작 방법' : 'How to Start'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>{lang === 'ko' ? '어떻게 시작하시겠습니까?' : 'How Would You Like to Begin?'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { iconLines: ['AU', 'AG'], badge: lang === 'ko' ? '일회성 실물 구매' : 'One-time Physical Purchase', title: lang === 'ko' ? '실물 금·은 매매' : 'Physical Gold & Silver', desc: lang === 'ko' ? 'LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분.' : 'Buy LBMA-approved gold and silver bars outright. International spot + transparent premium, allocated to your account instantly.', bullets: lang === 'ko' ? ['1 oz ~ 1 kg 바·1/2 oz 코인', '한 번의 결제·싱가포르 영구 보관', '유선·카드·암호화폐 결제 지원'] : ['1 oz – 1 kg bars · ½ oz coins', 'One payment · Singapore permanent vault', 'Wire · Card · Crypto accepted'], cta: lang === 'ko' ? '제품 둘러보기' : 'Browse Products', route: 'shop-physical', featured: false },
              { iconLines: ['AGP'],      badge: lang === 'ko' ? '자동 적립 저축 플랜' : 'Auto Savings Plan', title: lang === 'ko' ? 'Aurum 골드 플랜' : 'Aurum Gold Plan', desc: lang === 'ko' ? '월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환.' : 'Auto-accumulate gold by the gram from ₩200K/month. Pay by Toss auto-transfer, card, or crypto — convert to a physical bar when you hit 100g.', bullets: lang === 'ko' ? ['월 200,000원부터 시작', '매일·매주·매월 자동 적립', '100g 도달 시 실물 바 무료 전환'] : ['From ₩200,000/month', 'Daily · weekly · monthly auto-accumulation', 'Free physical bar conversion at 100g'], cta: lang === 'ko' ? 'AGP 시작하기' : 'Start AGP', route: 'agp-intro', featured: true },
            ].map((c, i) => {
              const [hov, setHov] = useState(false);
              return (
                // D-5: gold top-line accent on shop cards + aurum card treatment
                <div key={i} onClick={() => navigate(c.route)}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ background: c.featured ? 'rgba(197,165,114,0.04)' : '#0a0a0a', border: `1px solid ${hov || c.featured ? 'rgba(197,165,114,0.5)' : '#1e1e1e'}`, borderRadius: 0, padding: '32px 28px', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transform: hov ? 'translateY(-3px)' : 'none', transition: 'all 0.3s' }}>
                  {/* D-5: gold top-line on featured card */}
                  {c.featured && <div style={GOLD_LINE} />}
                  {c.featured && <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: MONO, fontSize: 9, color: '#0a0a0a', background: '#c5a572', padding: '3px 9px', borderRadius: 0, letterSpacing: '0.18em' }}>추천</div>}
                  {/* M-9: icon box fixed at 56px on mobile (was 72px equivalent) */}
                  <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, border: '1px solid rgba(197,165,114,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: '#141414' }}>
                    {c.iconLines.map((line, li) => <span key={li} style={{ fontFamily: SERIF, fontSize: 14, color: '#c5a572', letterSpacing: '0.06em', lineHeight: 1.2 }}>{line}</span>)}
                  </div>
                  {/* D-4: eyebrow */}
                  <div style={{ fontFamily: MONO, fontSize: 9, color: '#8a7d6b', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 7 }}>{c.badge}</div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 24, color: '#f5f0e8', fontWeight: 500, margin: '0 0 12px' }}>{c.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: '#a09080', lineHeight: 1.75, marginBottom: 20, flex: 1 }}>{c.desc}</p>
                  <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 16 }}>
                    {c.bullets.map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: bi < c.bullets.length - 1 ? '1px dashed #1e1e1e' : 'none' }}>
                        <span style={{ color: '#c5a572', fontFamily: SANS, fontSize: 12, flexShrink: 0 }}>—</span>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: '#f5f0e8', lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(197,165,114,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#c5a572', fontWeight: 500 }}>{c.cta}</span>
                    <span style={{ color: '#c5a572', transform: hov ? 'translateX(5px)' : 'none', transition: 'transform 0.2s', fontSize: 16 }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⑧ Trust strip */}
      <div>
        <div className="aurum-container" style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 20 : 44, flexWrap: 'wrap', paddingTop: isMobile ? 28 : 36, paddingBottom: isMobile ? 28 : 36 }}>
          {[['SG', 'Singapore FTZ', lang === 'ko' ? 'Malca-Amit 보관' : 'Malca-Amit Vault'], ['LL', "Lloyd's of London", lang === 'ko' ? '기관 전액 보험' : 'Full Institutional Cover'], ['LB', 'LBMA', lang === 'ko' ? '승인 제련소' : 'Approved Refiners'], ['AK', 'AML/KYC', lang === 'ko' ? '싱가포르 등록' : 'Singapore Registered'], ['AU', lang === 'ko' ? '매일 감사' : 'Daily Audit', lang === 'ko' ? '백킹 리포트' : 'Backing Report']].map(([, title, sub], i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: '#f5f0e8', fontWeight: 500 }}>{title}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#8a7d6b', marginTop: 2, letterSpacing: '0.1em' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
