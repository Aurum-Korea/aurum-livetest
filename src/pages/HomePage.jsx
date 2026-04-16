import { useState } from 'react';
import { T, useIsMobile, fUSD, fKRW, KR_GOLD_PREMIUM, KR_SILVER_PREMIUM, AURUM_GOLD_PREMIUM, AURUM_SILVER_PREMIUM } from '../lib/index.jsx';
import { Badge, StatBar, Accordion, SectionHead } from '../components/UI.jsx';

// ─── Campaign panels — integrated into hero right column ──────────────────────
function CampaignPanels({ navigate }) {
  const isMobile = useIsMobile();

  const panels = [
    {
      route: 'campaign-agp-launch',
      badge: 'AGP 론치 이벤트 · LAUNCH EVENT',
      headline: '시작하는 날',
      sub: '금을 더 드립니다.',
      desc: '브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시',
      cta: '사전예약 →',
      gold: false,
    },
    {
      route: 'campaign-founders',
      badge: 'Founders Club · 파운더스 클럽',
      headline: '더 많이 구매할수록',
      sub: '더 싸게 — 영원히.',
      desc: 'GMV 5개 게이트 통과 시 Aurum Listed Price 자동 차감 · 최대 −3.0% · 평생',
      cta: '클럽 가입하기 →',
      gold: true,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
      {panels.map((p, i) => (
        <div key={i} onClick={() => navigate(p.route)} style={{
          background: p.gold ? 'rgba(197,165,114,0.06)' : T.bg3,
          borderBottom: i === 0 ? `1px solid ${T.goldBorder}` : 'none',
          padding: '20px 22px', cursor: 'pointer', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.10)'}
          onMouseLeave={e => e.currentTarget.style.background = p.gold ? 'rgba(197,165,114,0.06)' : T.bg3}>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 7 }}>{p.badge}</div>
          <div style={{ fontFamily: T.serifKr, fontSize: 19, color: T.text, lineHeight: 1.2, marginBottom: 5, fontWeight: 500 }}>
            {p.headline} <span style={{ color: T.gold, fontFamily: T.serif, fontStyle: 'italic' }}>{p.sub}</span>
          </div>
          <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textSub, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
          <button style={{
            background: p.gold ? T.gold : 'transparent',
            border: p.gold ? 'none' : `1px solid ${T.goldBorder}`,
            color: p.gold ? '#0a0a0a' : T.gold,
            padding: '9px 18px', fontFamily: T.sans, fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
          }}>{p.cta}</button>
        </div>
      ))}

      {/* Trust icons strip */}
      <div style={{ background: T.bg, padding: '11px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {['🇸🇬 SG FTZ', "🛡️ Lloyd's", '✅ LBMA', '🔒 PSPM'].map((t, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 9, color: '#555', letterSpacing: '0.08em' }}>{t}</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-dot" />
          <span style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: '0.14em' }}>OPEN</span>
        </div>
      </div>
    </div>
  );
}

// ─── Side-by-side savings comparison ─────────────────────────────────────────
function SavingsComparison({ prices, krwRate, currency }) {
  const isMobile = useIsMobile();
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);

  const goldSpot = prices.gold;
  const silvSpot = prices.silver || 32.90;
  const KG = 1000 / 31.1035; // oz per kg

  // Gold per oz
  const goldKR = goldSpot * krwRate * (1 + KR_GOLD_PREMIUM);
  const goldAU = goldSpot * (1 + AURUM_GOLD_PREMIUM);
  const goldSaveKRW = goldKR - goldAU * krwRate;
  const goldSavePct = (goldSaveKRW / goldKR * 100).toFixed(1);

  // Silver per kg
  const silvKR = silvSpot * KG * krwRate * (1 + KR_SILVER_PREMIUM);
  const silvAU = silvSpot * KG * (1 + AURUM_SILVER_PREMIUM);
  const silvSaveKRW = silvKR - silvAU * krwRate;
  const silvSavePct = (silvSaveKRW / silvKR * 100).toFixed(1);

  const Card = ({ icon, label, unit, koreanPrice, aurumPriceUSD, saveKRW, savePct }) => (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, padding: '24px 24px', flex: 1 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 18 }}>
        {icon} {label} · {unit}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${T.border}` }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>한국금거래소 (KRX+VAT)</span>
        <span style={{ fontFamily: T.mono, fontSize: 17, color: T.red, fontWeight: 600 }}>{fKRW(koreanPrice)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${T.border}` }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>Aurum 실물가</span>
        <span style={{ fontFamily: T.mono, fontSize: 17, color: T.green, fontWeight: 600 }}>{fP(aurumPriceUSD)}</span>
      </div>

      <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', padding: '14px 16px', marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 600 }}>절약 금액</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.green, fontWeight: 700 }}>{fKRW(saveKRW)}</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{savePct}% 절약</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
      <Card
        icon="🥇" label="금 Gold" unit="1 oz"
        koreanPrice={goldKR}
        aurumPriceUSD={goldAU}
        saveKRW={goldSaveKRW}
        savePct={goldSavePct}
      />
      <Card
        icon="🥈" label="은 Silver" unit="1 kg"
        koreanPrice={silvKR}
        aurumPriceUSD={silvAU}
        saveKRW={silvSaveKRW}
        savePct={silvSavePct}
      />
    </div>
  );
}

// ─── Shop CTA card ────────────────────────────────────────────────────────────
function ShopCard({ icon, badge, title, desc, bullets, cta, onClick, featured }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: featured ? T.goldGlow : T.bg,
        border: `1px solid ${featured || hov ? T.goldBorderStrong : T.border}`,
        padding: '32px 28px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
        position: 'relative', transform: hov ? 'translateY(-3px)' : 'none', transition: 'all 0.3s',
      }}>
      {featured && <div style={{ position: 'absolute', top: 18, right: 18 }}><Badge>추천</Badge></div>}
      <div style={{ width: 56, height: 56, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontSize: 16, color: T.gold, marginBottom: 20 }}>{icon}</div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>{badge}</div>
      <h3 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, fontWeight: 500, margin: '0 0 12px', lineHeight: 1.25 }}>{title}</h3>
      <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 20, flex: 1 }}>{desc}</p>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < bullets.length - 1 ? `1px dashed ${T.border}` : 'none' }}>
          <span style={{ color: T.gold, fontFamily: T.mono, fontSize: 11, flexShrink: 0, marginTop: 1 }}>—</span>
          <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{b}</span>
        </div>
      ))}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.goldBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.12em', color: T.gold, textTransform: 'uppercase' }}>{cta}</span>
        <span style={{ color: T.gold, transform: hov ? 'translateX(5px)' : 'none', transition: 'transform 0.2s' }}>→</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage({ navigate, prices, krwRate, currency, setCurrency, lang }) {
  const isMobile = useIsMobile();
  const pad = isMobile ? '44px 20px' : '80px 80px';

  const whyAccordion = [
    { icon: '⚖️', title: '완전 배분 보관 — 귀하의 금속, 귀하의 이름', content: '귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다. Aurum의 대차대조표와는 완전히 분리됩니다.' },
    { icon: '📊', title: '국제 현물가 — 한국 프리미엄을 피하세요', content: '한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 15~20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 2.0% 투명 프리미엄으로 거래합니다.' },
    { icon: '🛡️', title: "Lloyd's of London 완전 보험", content: "모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트가 공개됩니다." },
    { icon: '✅', title: 'LBMA 승인 바 & 실물 인출 옵션', content: '모든 금속은 LBMA 승인 제련소(PAMP, Heraeus, Valcambi, RCM) 제품입니다. 100g 이상 보유 시 실물 바로 무료 전환 또는 KRW 정산 가능합니다.' },
    { icon: '🔍', title: '매일 공개 감사 — 100% 백킹 증명', content: '모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 귀하의 일련번호를 직접 조회할 수 있습니다.' },
  ];

  return (
    <div>

      {/* ① HERO — left: text, right: campaign panels */}
      <div style={{
        background: `linear-gradient(145deg, ${T.bg} 0%, #141008 60%, ${T.bg} 100%)`,
        padding: isMobile ? '60px 20px' : '0 80px',
        position: 'relative', overflow: 'hidden',
        minHeight: isMobile ? 'auto' : 560,
        display: 'flex', alignItems: 'center',
      }}>
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'repeating-linear-gradient(0deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px)', pointerEvents: 'none' }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at 80% 50%,rgba(197,165,114,0.07),transparent 60%)', pointerEvents: 'none' }} />
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontSize: isMobile ? 100 : 260, fontWeight: 600, color: 'rgba(197,165,114,0.018)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', letterSpacing: '0.06em' }}>AURUM</div>

        <div style={{ maxWidth: 1340, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: isMobile ? 40 : 60, alignItems: 'center', position: 'relative', zIndex: 1, padding: isMobile ? 0 : '80px 0' }}>

          {/* Left — hero text */}
          <div>
            <div className="eyebrow">배분 보관 · 국제 현물가 · 한국 투자자 전용</div>
            <h1 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 42 : 64, fontWeight: 500, color: T.text, lineHeight: 1.1, margin: '0 0 22px', letterSpacing: '-0.01em' }}>
              <span style={{ color: T.gold }}>진짜 금. 진짜 은.</span><br />진짜 소유.
            </h1>
            <p style={{ fontFamily: T.sansKr, fontSize: isMobile ? 15 : 17, color: T.textSub, lineHeight: 1.85, maxWidth: 500, margin: '0 0 32px' }}>
              은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', maxWidth: 520 }}>
              <button onClick={() => navigate('shop')} className="btn-primary" style={{ flex: 1, padding: '16px 20px', fontSize: 15 }}>내 자산 배분 시작 →</button>
              <button onClick={() => navigate('agp-intro')} className="btn-outline" style={{ flex: 1, padding: '16px 20px', fontSize: 15 }}>AGP — 월 20만원 시작</button>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {["Lloyd's 보험", 'LBMA 승인', '100% 배분 보관', '매일 공개 감사'].map((t, i) => (
                <span key={i} style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.1em' }}>✓ {t}</span>
              ))}
            </div>
          </div>

          {/* Right — campaign panels (dead space utilised) */}
          <CampaignPanels navigate={navigate} />
        </div>
      </div>

      {/* ② Trust stats bar */}
      <StatBar stats={[
        { value: '100%',    label: '배분 보관 비율' },
        { value: '+2.0%',   label: 'Aurum 프리미엄 (공개)' },
        { value: "Lloyd's", label: '보험사 (전액 보장)' },
        { value: 'LBMA',    label: '승인 제련소' },
      ]} />

      {/* ③ Savings — side-by-side 1×1 */}
      <div style={{ padding: pad, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <SectionHead badge="가격 비교" title="얼마나 절약하나요?" sub="Aurum 현물가 vs 한국금거래소 (KRX) 실시간 비교" align="left" style={{ marginBottom: 0 }} />
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '6px 14px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, flexShrink: 0 }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          <SavingsComparison prices={prices} krwRate={krwRate} currency={currency} />
          <p style={{ marginTop: 10, fontSize: 11, color: T.textMuted, fontFamily: T.sans, lineHeight: 1.6 }}>
            * 실시간 국제 현물가 기준. 한국금거래소 부가세(10%) + 도매 마진 포함. Aurum 프리미엄 +2%(금) / +6%(은).
          </p>
        </div>
      </div>

      {/* ④ Paper vs Physical */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead badge="근본적인 차이" title={<>금을 소유하는 두 가지 방법.<br /><span style={{ color: T.gold }}>진짜는 하나입니다.</span></>} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {/* Paper */}
            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, padding: '26px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red }} />
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.red, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>페이퍼 금·은</span>
              </div>
              <p style={{ fontFamily: T.serif, fontSize: 17, color: T.text, marginBottom: 16, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하는 금에 대한 청구권을 보유합니다"</p>
              {['은행 금통장, KRX 계좌, 펀드', '상대방 리스크 (은행 부도 시 손실)', '법적 소유권 없음. 일련번호 없음.', '인출 불가 또는 높은 수수료'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px dashed ${T.border}` : 'none' }}>
                  <span style={{ color: T.red, fontFamily: T.mono, fontSize: 11, marginTop: 1, flexShrink: 0 }}>×</span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            {/* Physical */}
            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '26px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green }} />
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>실물 배분 금속 (Aurum)</span>
              </div>
              <p style={{ fontFamily: T.serif, fontSize: 17, color: T.text, marginBottom: 16, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하가 금 <em style={{ color: T.gold }}>자체</em>를 소유합니다"</p>
              {['귀하의 이름 · 귀하의 일련번호', '완전 분리 보관 — 어떤 은행과도 무관', '법적 소유권은 첫날부터 귀하의 것', 'LBMA 바로 무료 실물 인출'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px dashed rgba(197,165,114,0.15)` : 'none' }}>
                  <span style={{ color: T.green, fontFamily: T.mono, fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑤ Why Aurum */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionHead badge="핵심 차별점" title="왜 Aurum인가?" sub="5가지 이유를 클릭해서 확인하세요." align="left" />
          <Accordion items={whyAccordion} />
        </div>
      </div>

      {/* ⑥ Shop CTAs */}
      <div style={{ padding: pad, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHead badge="시작 방법" title="어떻게 시작하시겠습니까?" />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <ShopCard
              badge="일회 구매" icon="AU/AG" title="실물 금·은 매매"
              desc="LBMA 승인 골드·실버 바를 국제 현물가 + 2% 프리미엄으로 즉시 구매. 귀하 명의 금고에 즉시 배분."
              bullets={['1 oz ~ 1 kg 바 · 1/2 oz 코인', '유선·카드·암호화폐 지원', '100g 이상 실물 인출 무료']}
              cta="제품 둘러보기" onClick={() => navigate('shop')}
            />
            <ShopCard
              badge="AGP 저축 플랜 · 추천" icon="AGP" title="Aurum 골드 플랜"
              desc="월 20만원부터 그램 단위 자동 적립. 토스뱅크 자동이체 · 신용카드 · 암호화폐 지원."
              bullets={['월 200,000원부터 시작', '100g 도달 시 실물 바 무료 전환', '매일 백킹 리포트 공개']}
              cta="AGP 시작하기" onClick={() => navigate('agp-intro')} featured
            />
          </div>
        </div>
      </div>

      {/* ⑦ Trust strip */}
      <div style={{ padding: isMobile ? '28px 20px' : '36px 80px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: isMobile ? 22 : 44, flexWrap: 'wrap' }}>
          {[['🇸🇬', 'Singapore FTZ', 'Malca-Amit 보관'], ["🛡️", "Lloyd's of London", '전액 보험'], ['✅', 'LBMA 승인', '귀금속 바'], ['🔒', 'AML/KYC 준수', '싱가포르 등록'], ['📊', '매일 감사', '백킹 리포트']].map(([icon, title, sub], i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>{title}</div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
