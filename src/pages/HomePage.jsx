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
    <div style={{ width: 300, flexShrink: 0, background: 'rgba(197,165,114,0.04)', border: '1px solid rgba(197,165,114,0.18)', borderRadius: 12, padding: 24, position: 'relative' }}>
      {/* LIVE dot */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#4ade80', letterSpacing: 1 }}>LIVE</span>
      </div>
      {/* Header */}
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: '#c5a572', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 18 }}>
        {lang === 'ko' ? '금 1온스 기준 가격 비교' : 'Gold 1oz Price Comparison'}
      </div>
      {/* Bar rows */}
      {[
        { label: lang === 'ko' ? '한국 시중가' : 'Korean Retail', price: goldKR,  barW: '100%',                                     barColor: 'rgba(248,113,113,0.25)', border: '#f87171', textColor: '#f87171' },
        { label: lang === 'ko' ? 'Aurum 가격'  : 'Aurum Price',   price: goldAU,  barW: `${(goldAU/goldKR*100).toFixed(0)}%`,       barColor: 'rgba(197,165,114,0.2)',   border: '#c5a572', textColor: '#c5a572' },
      ].map((row, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#a09080' }}>{row.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: row.textColor, fontWeight: 600 }}>{fKRW(row.price)}</span>
          </div>
          <div style={{ height: 5, borderRadius: 2, background: '#1e1e1e', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: row.barW, background: row.barColor, border: `1px solid ${row.border}`, borderRadius: 2, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
      {/* Savings badge */}
      <div style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, padding: '10px 14px', marginTop: 6 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#4ade80', marginBottom: 3 }}>
          {lang === 'ko' ? '절약 금액' : 'You Save'}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: '#4ade80', fontWeight: 700 }}>
          {fKRW(savings)} <span style={{ fontSize: 11 }}>({savePct}%)</span>
        </div>
      </div>
      {/* Spot ref */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(197,165,114,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#555', letterSpacing: 1 }}>XAU/USD</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: flash ? '#c5a572' : '#a09080', fontWeight: 600, transition: 'color 0.3s' }}>${displayPrice.toFixed(2)}</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(197,165,114,0.2)', overflow: 'hidden', borderRadius: 8 }}>
      {panels.map((p, i) => (
        <div key={i} onClick={() => navigate(p.route)} style={{ background: p.gold ? 'rgba(197,165,114,0.06)' : '#16140f', borderBottom: i === 0 ? '1px solid rgba(197,165,114,0.2)' : 'none', padding: '20px 22px', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.11)'}
          onMouseLeave={e => e.currentTarget.style.background = p.gold ? 'rgba(197,165,114,0.06)' : '#16140f'}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8, color: '#c5a572', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 7 }}>{p.badge}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 17 : 19, color: '#f5f0e8', lineHeight: 1.25, marginBottom: 5, fontWeight: 500 }}>
            {p.headline} <span style={{ color: '#c5a572', fontStyle: 'italic' }}>{p.sub}</span>
          </div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#a09080', lineHeight: 1.65, marginBottom: 14 }}>{p.desc}</div>
          <button style={{ background: p.gold ? '#c5a572' : 'transparent', border: p.gold ? 'none' : '1px solid rgba(197,165,114,0.3)', color: p.gold ? '#0a0a0a' : '#c5a572', padding: '8px 16px', fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }} onClick={e => { e.stopPropagation(); navigate(p.route); }}>
            {p.cta}
          </button>
        </div>
      ))}
      <div style={{ background: '#0a0a0a', padding: '10px 14px', borderTop: '1px solid #1e1e1e', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {['🇸🇬 SG FTZ', "🛡️ Lloyd's", '✅ LBMA', '🔒 PSPM 2019'].map((t, i) => (
          <span key={i} style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8, color: '#555', letterSpacing: '0.08em' }}>{t}</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c5a572', animation: 'pulse 1.6s ease-in-out infinite' }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#c5a572', letterSpacing: '0.14em' }}>OPEN</span>
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
    { icon: '⚖️', title: '완전 배분 보관 — 귀하의 금속, 귀하의 이름', content: '귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다.' },
    { icon: '📊', title: '국제 현물가 직거래 — 김치 프리미엄 없음', content: '한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 8%(금)/15%(은) 투명 프리미엄.' },
    { icon: '🛡️', title: "Lloyd's of London 기관급 전액 보험", content: "모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트 공개." },
    { icon: '✅', title: 'LBMA 승인 바 & 언제든 실물 인출', content: '모든 금속은 LBMA 승인 제련소(PAMP, Heraeus, Valcambi, RCM) 제품입니다. 100g 이상 보유 시 실물 바로 무료 전환 또는 KRW 즉시 정산.' },
    { icon: '🔍', title: '매일 공개 감사 · 100% 실물 백킹', content: '모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 숨겨진 레버리지 없음.' },
  ];

  return (
    <div>
      {/* ① HERO — left text + right = price card (desktop) or campaign panels */}
      <div style={{ position: 'relative', minHeight: isMobile ? 'auto' : 540, background: 'linear-gradient(135deg,#0a0a0a,#1a1510 40%,#0d0b08)', display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 40px)', pointerEvents: 'none' }} />
        <div className="aurum-container" style={{ position: 'relative', zIndex: 1, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48, paddingTop: isMobile ? 40 : 80, paddingBottom: isMobile ? 40 : 80 }}>
          {/* Left: hero copy */}
          <div style={{ flex: 1, maxWidth: isMobile ? '100%' : 580 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: isMobile ? 10 : 11, color: '#c5a572', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>
              배분 보관 · 국제 현물가 · 한국 투자자 전용
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 34 : 54, fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: '0 0 20px' }}>
              <span style={{ color: '#c5a572', fontWeight: 600 }}>진짜 금. 진짜 은.</span><br />진짜 소유.
            </h1>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: isMobile ? 14 : 16, color: '#a09080', lineHeight: 1.75, margin: '0 0 28px' }}>
              은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => navigate('shop-physical')} style={{ flex: 1, background: 'linear-gradient(135deg,#c5a572,#8a6914)', color: '#fff', border: 'none', padding: '14px 20px', fontSize: 15, fontFamily: "'Outfit',sans-serif", fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}>
                지금 구매 시작 →
              </button>
              <button onClick={() => navigate('agp-intro')} style={{ flex: 1, background: 'transparent', color: '#a09080', border: '1px solid #282828', padding: '14px 20px', fontSize: 15, fontFamily: "'Outfit',sans-serif", fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>
                AGP · 월 20만원부터
              </button>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {["Lloyd's 보험", 'LBMA 승인', '완전 배분 보관', '매일 공개 감사'].map((t, i) => (
                <span key={i} style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#8a7d6b', letterSpacing: '0.1em' }}>✓ {t}</span>
              ))}
            </div>
          </div>

          {/* Right desktop: price comparison card (image 1 style) */}
          {!isMobile && <PriceComparisonCard lang={lang} prices={prices} krwRate={krwRate} />}
          {/* Mobile: campaign panels below CTA */}
        </div>
        {isMobile && (
          <div style={{ marginTop: 32 }}>
            <CampaignPanels navigate={navigate} lang={lang} />
          </div>
        )}
      </div>

      {/* ② Campaign panels — desktop only, below hero */}
      {!isMobile && (
        <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1510' }}>
          <div className="aurum-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 32, paddingTop: 20 }}>
            {[
              { route: 'campaign-agp-launch', badge: 'AGP 론치 이벤트 · LAUNCH EVENT',  headline: '시작하는 날,', sub: '금을 더 드립니다.',        desc: '브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시', cta: '지금 신청하기 →' },
              { route: 'campaign-founders',   badge: 'Founders Club · 파운더스 클럽',   headline: '더 많이 구매할수록,', sub: '더 싸게 — 영원히.', desc: 'GMV 5개 게이트 통과 시 표시가 자동 차감 · 최대 −3.0% · 평생',               cta: 'Founders Club 가입하기 →' },
            ].map((p, i) => (
              <div key={i} onClick={() => navigate(p.route)} style={{ background: '#111008', border: '1px solid #1a1510', borderRadius: 8, padding: '18px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1510'}>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8, color: '#c5a572', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 5 }}>{p.badge}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: '#f5f0e8', lineHeight: 1.3, marginBottom: 4 }}>
                    {p.headline} <span style={{ color: '#c5a572', fontStyle: 'italic' }}>{p.sub}</span>
                  </div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#a09080' }}>{p.desc}</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid rgba(197,165,114,0.3)', color: '#c5a572', padding: '8px 16px', fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4, flexShrink: 0 }} onClick={e => { e.stopPropagation(); navigate(p.route); }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ③ Stats bar */}
      <div style={{ background: '#111008', borderBottom: '1px solid #1a1510' }}>
        <div className="aurum-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)' }}>
          {[['100%', '완전 배분 보관'], ['+8%', 'Aurum 금 투명 프리미엄'], ["Lloyd's", '기관급 전액 보험'], ['LBMA', '승인 제련소']].map(([v, l], i) => (
            <div key={i} style={{ padding: isMobile ? '14px 12px' : '18px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid #1a1510' : 'none' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 16 : 20, color: '#c5a572', fontWeight: 700 }}>{v}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#8a7d6b', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ④ Savings comparison — side by side */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1510' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?40:72, paddingBottom: isMobile?32:60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#c5a572', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>가격 비교</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>얼마나 절약하나요?</h2>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: '#8a7d6b', margin: '6px 0 0' }}>Aurum 매입가 vs 한국실금가 (국내 프리미엄+VAT)</p>
            </div>
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: 'rgba(197,165,114,0.08)', border: '1px solid rgba(197,165,114,0.4)', color: '#c5a572', padding: '5px 14px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, borderRadius: 4 }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { icon: '🥇', label: '금 Gold', unit: '1 oz', kr: goldKR, au: goldAU, save: goldSave, pct: goldSavePct },
              { icon: '🥈', label: '은 Silver', unit: '1 kg', kr: silvKR, au: silvAU, save: silvSave, pct: silvSavePct },
            ].map((c, i) => (
              <div key={i} style={{ background: '#111008', border: '1px solid #1a1510', borderRadius: 8, padding: '22px 22px' }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#8a7d6b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>{c.icon} {c.label} · {c.unit}</div>
                {[
                  { l: '한국실금가 (국내 프리미엄+VAT)', v: fP(c.kr / krwRate), col: '#f87171' },
                  { l: 'Aurum 매입가',                   v: fP(c.au / krwRate), col: '#c5a572' },
                ].map((r, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #1a1510' }}>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#a09080' }}>{r.l}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: r.col, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 6, padding: '12px 14px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>절감 금액</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: '#4ade80', fontWeight: 700 }}>{fKRW(c.save)}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#555' }}>{c.pct}% 절약</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 10, fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#555', lineHeight: 1.6 }}>
            * 국제 현물가 실시간 기준. 한국실금가 = 국제 현물가 + 20%(금)/+30%(은) 국내 프리미엄. Aurum = 국제 현물가 + 8%(금)/+15%(은).
          </p>
        </div>
      </div>

      {/* ⑤ Paper vs Physical */}
      <div style={{ borderBottom: '1px solid #1a1510' }}>
        <div className="aurum-container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#c5a572', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>근본적인 차이</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>
              금을 소유하는 두 가지 방법.<br /><span style={{ color: '#c5a572' }}>진짜는 하나입니다.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#111008', border: '1px solid #1a1510', borderRadius: 8, padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#f87171', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>페이퍼 금·은</span>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: '#f5f0e8', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하는 금에 대한 청구권을 보유합니다"</p>
              {['은행 금통장, KRX 계좌, 펀드', '상대방 리스크 — 은행 부도 시 손실', '법적 소유권 없음. 일련번호 없음.', '인출 불가 또는 높은 수수료'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px dashed #1a1510' : 'none' }}>
                  <span style={{ color: '#f87171', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, flexShrink: 0, marginTop: 1 }}>×</span>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: '#a09080', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#111008', border: '1px solid rgba(197,165,114,0.25)', borderRadius: 8, padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>실물 배분 금속 (Aurum)</span>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: '#f5f0e8', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하가 금 <em style={{ color: '#c5a572' }}>자체</em>를 소유합니다"</p>
              {['귀하의 이름 · 귀하의 일련번호', '완전 분리 보관 — 어떤 은행과도 무관', '첫날부터 귀하의 법적 소유권', 'LBMA 바로 무료 실물 인출'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px dashed rgba(197,165,114,0.1)' : 'none' }}>
                  <span style={{ color: '#4ade80', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: '#f5f0e8', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ Why Aurum accordion */}
      <div style={{ borderBottom: '1px solid #1a1510' }}>
        <div className="aurum-container">
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#c5a572', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>핵심 차별점</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>왜 Aurum이어야 하는가</h2>
          </div>
          <Accordion items={whyItems} />
        </div>
      </div>

      {/* ⑦ Shop cards */}
      <div style={{ padding: pad, background: '#111008', borderBottom: '1px solid #1a1510' }}>
        <div className="aurum-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#c5a572', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>시작 방법</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>어떻게 시작하시겠습니까?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { iconLines: ['AU', 'AG'], badge: '일회성 실물 구매', title: '실물 금·은 매매', desc: 'LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분.', bullets: ['1 oz ~ 1 kg 바·1/2 oz 코인', '한 번의 결제·싱가포르 영구 보관', '유선·카드·암호화폐 결제 지원'], cta: '제품 둘러보기', route: 'shop-physical', featured: false },
              { iconLines: ['AGP'],      badge: '자동 적립 저축 플랜', title: 'Aurum 골드 플랜', desc: '월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환.', bullets: ['월 200,000원부터 시작', '매일·매주·매월 자동 적립', '100g 도달 시 실물 바 무료 전환'], cta: 'AGP 시작하기', route: 'agp-intro', featured: true },
            ].map((c, i) => {
              const [hov, setHov] = useState(false);
              return (
                <div key={i} onClick={() => navigate(c.route)}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ background: c.featured ? 'rgba(197,165,114,0.04)' : '#0a0a0a', border: `1px solid ${hov || c.featured ? 'rgba(197,165,114,0.5)' : '#1a1510'}`, borderRadius: 10, padding: '32px 28px', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', transform: hov ? 'translateY(-3px)' : 'none', transition: 'all 0.3s' }}>
                  {c.featured && <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Outfit',sans-serif", fontSize: 9, color: '#0a0a0a', background: '#c5a572', padding: '3px 9px', borderRadius: 3, letterSpacing: '0.18em' }}>추천</div>}
                  <div style={{ width: 56, height: 56, border: '1px solid rgba(197,165,114,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: '#111008' }}>
                    {c.iconLines.map((line, li) => <span key={li} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: '#c5a572', letterSpacing: '0.06em', lineHeight: 1.2 }}>{line}</span>)}
                  </div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: '#8a7d6b', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 7 }}>{c.badge}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: '#f5f0e8', fontWeight: 500, margin: '0 0 12px' }}>{c.title}</h3>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: '#a09080', lineHeight: 1.75, marginBottom: 20, flex: 1 }}>{c.desc}</p>
                  <div style={{ borderTop: '1px solid #1a1510', paddingTop: 16 }}>
                    {c.bullets.map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: bi < c.bullets.length - 1 ? '1px dashed #1a1510' : 'none' }}>
                        <span style={{ color: '#c5a572', fontFamily: "'Outfit',sans-serif", fontSize: 12, flexShrink: 0 }}>—</span>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#f5f0e8', lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(197,165,114,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#c5a572', fontWeight: 500 }}>{c.cta}</span>
                    <span style={{ color: '#c5a572', transform: hov ? 'translateX(5px)' : 'none', transition: 'transform 0.2s', fontSize: 16 }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⑧ Trust strip */}
      <div style={{ padding: isMobile ? '28px 16px' : '36px 60px' }}>
        <div className="aurum-container" style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 20 : 44, flexWrap: 'wrap', paddingTop: isMobile?28:36, paddingBottom: isMobile?28:36 }}>
          {[['🇸🇬', 'Singapore FTZ', 'Malca-Amit 보관'], ["🛡️", "Lloyd's of London", '기관 전액 보험'], ['✅', 'LBMA 승인', '귀금속 바'], ['🔒', 'AML/KYC', '싱가포르 등록'], ['📊', '매일 감사', '백킹 리포트']].map(([icon, title, sub], i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#f5f0e8', fontWeight: 500 }}>{title}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: '#8a7d6b', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
