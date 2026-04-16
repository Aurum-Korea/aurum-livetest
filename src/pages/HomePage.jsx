import { useState } from 'react';
import { T, useIsMobile, fUSD, fKRW,
         KR_GOLD_PREMIUM, KR_SILVER_PREMIUM,
         AURUM_GOLD_PREMIUM, AURUM_SILVER_PREMIUM } from '../lib/index.jsx';

const OZ_IN_GRAMS = 31.1035;
const DON_IN_GRAMS = 3.75;
import { StatBar, Accordion, SectionHead } from '../components/UI.jsx';

// ─── Campaign panels — hero right column ─────────────────────────────────────
function CampaignPanels({ navigate }) {
  const isMobile = useIsMobile();
  const panels = [
    {
      route: 'campaign-agp-launch',
      badge: 'AGP 론치 이벤트 · LAUNCH EVENT',
      headline: '시작하는 날,',
      sub: '금을 더 드립니다.',
      desc: '브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시',
      cta: '지금 신청하기 →',
      gold: false,
    },
    {
      route: 'campaign-founders',
      badge: 'Founders Club · 파운더스 클럽',
      headline: '더 많이 구매할수록,',
      sub: '더 싸게 — 영원히.',
      desc: 'GMV 5개 게이트 통과 시 표시가 자동 차감 · 최대 −3.0% · 평생',
      cta: 'Founders Club 가입하기 →',
      gold: true,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
      {panels.map((p, i) => (
        <div key={i} onClick={() => navigate(p.route)} style={{
          background: p.gold ? 'rgba(197,165,114,0.06)' : T.bg3,
          borderBottom: i === 0 ? `1px solid ${T.goldBorder}` : 'none',
          padding: '22px 24px', cursor: 'pointer', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.11)'}
          onMouseLeave={e => e.currentTarget.style.background = p.gold ? 'rgba(197,165,114,0.06)' : T.bg3}>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 8 }}>{p.badge}</div>
          <div style={{ fontFamily: T.serifKr, fontSize: isMobile ? 17 : 20, color: T.text, lineHeight: 1.25, marginBottom: 6, fontWeight: 500 }}>
            {p.headline} <span style={{ color: T.gold, fontFamily: T.serif, fontStyle: 'italic' }}>{p.sub}</span>
          </div>
          <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textSub, lineHeight: 1.65, marginBottom: 16 }}>{p.desc}</div>
          <button style={{
            background: p.gold ? T.gold : 'transparent',
            border: p.gold ? 'none' : `1px solid ${T.goldBorder}`,
            color: p.gold ? '#0a0a0a' : T.gold,
            padding: '9px 18px', fontFamily: T.sans, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
          }} onClick={e => { e.stopPropagation(); navigate(p.route); }}>{p.cta}</button>
        </div>
      ))}
      {/* Credibility strip */}
      <div style={{ background: T.bg, padding: '10px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {['🇸🇬 SG FTZ', "🛡️ Lloyd's", '✅ LBMA', '🔒 PSPM 2019'].map((t, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 8, color: '#555', letterSpacing: '0.08em' }}>{t}</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-dot" />
          <span style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: '0.14em' }}>OPEN</span>
        </div>
      </div>
    </div>
  );
}

// ─── Side-by-side savings cards ───────────────────────────────────────────────
function SavingsCards({ prices, krwRate, currency }) {
  const isMobile = useIsMobile();
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const goldSpot   = prices.gold   || 3342.80;
  const silverSpot = prices.silver || 32.90;
  const kgFactor   = 1000 / OZ_IN_GRAMS;

  // Gold per oz
  const goldKimchi = goldSpot * (1 + KR_GOLD_PREMIUM);
  const goldAurum  = goldSpot * (1 + AURUM_GOLD_PREMIUM);
  const goldSave   = goldKimchi - goldAurum;
  const goldSavePct= (goldSave / goldKimchi * 100).toFixed(1);

  // Silver per kg
  const silvKimchi = silverSpot * kgFactor * (1 + KR_SILVER_PREMIUM);
  const silvAurum  = silverSpot * kgFactor * (1 + AURUM_SILVER_PREMIUM);
  const silvSave   = silvKimchi - silvAurum;
  const silvSavePct= (silvSave / silvKimchi * 100).toFixed(1);

  const Card = ({ icon, label, unit, kimchi, aurum, save, savePct }) => (
    <div style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, padding: '24px 22px' }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
        {icon} {label} · {unit}
      </div>
      {[
        { label: '한국실금가 (국내 프리미엄+VAT)', value: fP(kimchi), color: '#a05050' },
        { label: 'Aurum 매입가',                   value: fP(aurum),  color: T.green },
      ].map((row, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px dashed ${T.border}` }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>{row.label}</span>
          <span style={{ fontFamily: T.mono, fontSize: 17, color: row.color, fontWeight: 600 }}>{row.value}</span>
        </div>
      ))}
      <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', padding: '14px 16px', marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.text, fontWeight: 600 }}>절감 금액</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.green, fontWeight: 700 }}>{fP(save)}</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{savePct}% 절약</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
      <Card icon="🥇" label="금 Gold" unit="1 oz"    kimchi={goldKimchi} aurum={goldAurum} save={goldSave} savePct={goldSavePct} />
      <Card icon="🥈" label="은 Silver" unit="1 kg"  kimchi={silvKimchi} aurum={silvAurum} save={silvSave} savePct={silvSavePct} />
    </div>
  );
}

// ─── Shop cards (matching image 3 design) ────────────────────────────────────
function ShopCard({ iconLines, badge, title, desc, bullets, ctaLabel, onClick, featured }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="magnetic-card"
      style={{
        background: featured ? T.goldGlow : T.bg,
        border: `1px solid ${featured || hov ? T.goldBorderStrong : T.border}`,
        padding: '36px 32px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
      }}>
      {featured && (
        <div style={{ position: 'absolute', top: 18, right: 18, fontFamily: T.mono, fontSize: 9, color: T.bg, background: T.gold, padding: '3px 10px', letterSpacing: '0.18em' }}>추천</div>
      )}

      {/* Icon box — matching image 3 style */}
      <div style={{
        width: 60, height: 60,
        border: `1px solid ${T.goldBorder}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, flexShrink: 0,
        background: T.bg2,
      }}>
        {iconLines.map((line, i) => (
          <span key={i} style={{ fontFamily: T.serif, fontSize: 15, color: T.gold, letterSpacing: '0.06em', lineHeight: 1.25, fontWeight: 500 }}>{line}</span>
        ))}
      </div>

      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>{badge}</div>
      <h3 style={{ fontFamily: T.serifKr, fontSize: 26, color: T.text, fontWeight: 500, margin: '0 0 14px', lineHeight: 1.25 }}>{title}</h3>
      <p style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, lineHeight: 1.8, marginBottom: 24, flex: 1 }}>{desc}</p>

      {/* Bullets */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < bullets.length - 1 ? `1px dashed ${T.border}` : 'none' }}>
            <span style={{ color: T.gold, fontFamily: T.mono, fontSize: 12, flexShrink: 0, marginTop: 1 }}>—</span>
            <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>

      {/* CTA row */}
      <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${T.goldBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, letterSpacing: '0.06em', color: T.gold, fontWeight: 500 }}>{ctaLabel}</span>
        <span style={{ color: T.gold, fontSize: 18, transform: hov ? 'translateX(5px)' : 'none', transition: 'transform 0.2s' }}>→</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage({ navigate, prices, krwRate, currency, setCurrency, lang }) {
  const isMobile = useIsMobile();
  const pad = isMobile ? '44px 20px' : '80px 80px';

  const whyAccordion = [
    { icon: '⚖️', title: '완전 배분 보관 — 귀하의 금속, 귀하의 이름', content: '귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다. Aurum의 대차대조표와 완전히 분리됩니다.' },
    { icon: '📊', title: '국제 현물가 직거래 — 김치 프리미엄 없음', content: '한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 8%(금)/15%(은) 투명 프리미엄으로 거래합니다. 금 1 oz 기준 수십만원 이상 절약 가능합니다.' },
    { icon: '🛡️', title: "Lloyd's of London 기관급 전액 보험", content: "모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트가 공개됩니다." },
    { icon: '✅', title: 'LBMA 승인 바 & 언제든 실물 인출', content: '모든 금속은 LBMA 승인 제련소(PAMP, Heraeus, Valcambi, RCM) 제품입니다. 100g 이상 보유 시 실물 바로 무료 전환 또는 KRW 즉시 정산 가능합니다.' },
    { icon: '🔍', title: '매일 공개 감사 · 100% 실물 백킹', content: '모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 귀하의 일련번호를 직접 조회할 수 있습니다. 숨겨진 레버리지 없음.' },
  ];

  return (
    <div>

      {/* ① HERO — left: text+CTA, right: campaign panels */}
      <div style={{
        background: `linear-gradient(145deg, ${T.bg} 0%, #141008 60%, ${T.bg} 100%)`,
        padding: isMobile ? '56px 20px 48px' : '0 80px',
        position: 'relative', overflow: 'hidden',
        minHeight: isMobile ? 'auto' : 560,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'repeating-linear-gradient(0deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at 80% 50%,rgba(197,165,114,0.07),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontSize: isMobile ? 90 : 250, fontWeight: 600, color: 'rgba(197,165,114,0.018)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', letterSpacing: '0.06em' }}>AURUM</div>

        <div style={{ maxWidth: 1340, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: isMobile ? 36 : 60, alignItems: 'center', position: 'relative', zIndex: 1, padding: isMobile ? 0 : '80px 0' }}>
          <div>
            <div className="eyebrow">배분 보관 · 국제 현물가 · 한국 투자자 전용</div>
            <h1 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 40 : 62, fontWeight: 500, color: T.text, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              <span style={{ color: T.gold }}>진짜 금. 진짜 은.</span><br />진짜 소유.
            </h1>
            <p style={{ fontFamily: T.sansKr, fontSize: isMobile ? 15 : 17, color: T.textSub, lineHeight: 1.85, maxWidth: 500, margin: '0 0 30px' }}>
              은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', maxWidth: 520 }}>
              {/* "지금 구매 시작" → directly to products page */}
              <button onClick={() => navigate('shop-physical')} className="btn-primary" style={{ flex: 1, padding: '16px 20px', fontSize: 15 }}>지금 구매 시작 →</button>
              <button onClick={() => navigate('agp-intro')} className="btn-outline" style={{ flex: 1, padding: '16px 20px', fontSize: 15 }}>AGP · 월 20만원부터</button>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {["Lloyd's 보험", 'LBMA 승인', '완전 배분 보관', '매일 공개 감사'].map((t, i) => (
                <span key={i} style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.1em' }}>✓ {t}</span>
              ))}
            </div>
          </div>
          <CampaignPanels navigate={navigate} />
        </div>
      </div>

      {/* ② Trust stats bar */}
      <StatBar stats={[
        { value: '100%',      label: '완전 배분 보관' },
        { value: '+8 / 15%', label: 'Aurum 투명 프리미엄 (금/은)' },
        { value: "Lloyd's",   label: '기관급 전액 보험' },
        { value: 'LBMA',      label: '승인 제련소' },
      ]} />

      {/* ③ Savings — side-by-side gold | silver */}
      <div style={{ padding: pad, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <SectionHead badge="가격 비교" title="얼마나 절약하나요?" sub="Aurum 매입가 vs 한국실금가 (국내 프리미엄+VAT) 실시간 비교" align="left" style={{ marginBottom: 0 }} />
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '6px 14px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, flexShrink: 0 }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          <SavingsCards prices={prices} krwRate={krwRate} currency={currency} />
          <p style={{ marginTop: 10, fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
            * 국제 현물가 실시간 기준. 한국실금가 = 국제 현물가 + 20%(금) / +30%(은) 국내 프리미엄. Aurum = 국제 현물가 + 8%(금) / +15%(은).
          </p>
        </div>
      </div>

      {/* ④ Paper vs Physical */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead badge="근본적인 차이" title={<>금을 소유하는 두 가지 방법.<br /><span style={{ color: T.gold }}>진짜는 하나입니다.</span></>} />
          <div style={{ display: 'grid', gridTemplateColumns: useIsMobile() ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red }} />
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.red, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>페이퍼 금·은</span>
              </div>
              <p style={{ fontFamily: T.serif, fontSize: 17, color: T.text, marginBottom: 16, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하는 금에 대한 청구권을 보유합니다"</p>
              {['은행 금통장, KRX 계좌, 펀드', '상대방 리스크 — 은행 부도 시 손실 가능', '법적 소유권 없음. 일련번호 없음.', '인출 불가 또는 과도한 수수료'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px dashed ${T.border}` : 'none' }}>
                  <span style={{ color: T.red, fontFamily: T.mono, fontSize: 11, marginTop: 1, flexShrink: 0 }}>×</span>
                  <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green }} />
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>실물 배분 금속 (Aurum)</span>
              </div>
              <p style={{ fontFamily: T.serif, fontSize: 17, color: T.text, marginBottom: 16, fontStyle: 'italic', lineHeight: 1.4 }}>"귀하가 금 <em style={{ color: T.gold }}>자체</em>를 소유합니다"</p>
              {['귀하의 이름 · 귀하의 일련번호', '완전 분리 보관 — 어떤 은행과도 무관', '첫날부터 귀하의 법적 소유권', 'LBMA 바로 무료 실물 인출'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px dashed rgba(197,165,114,0.15)` : 'none' }}>
                  <span style={{ color: T.green, fontFamily: T.mono, fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑤ Why Aurum */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionHead badge="핵심 차별점" title="왜 Aurum이어야 하는가" sub="5가지 이유를 클릭해서 확인하세요." align="left" />
          <Accordion items={whyAccordion} />
        </div>
      </div>

      {/* ⑥ Shop CTAs — image 3 card design */}
      <div style={{ padding: pad, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHead badge="시작 방법" title="어떻게 시작하시겠습니까?" />
          <div style={{ display: 'grid', gridTemplateColumns: useIsMobile() ? '1fr' : '1fr 1fr', gap: 14 }}>
            <ShopCard
              iconLines={['AU', 'AG']}
              badge="일회성 실물 구매"
              title="실물 금·은 매매"
              desc="LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분."
              bullets={[
                '1 oz ~ 1 kg 바·1/2 oz 코인',
                '한 번의 결제·싱가포르 영구 보관',
                '유선·카드·암호화폐 결제 지원',
              ]}
              ctaLabel="제품 둘러보기"
              onClick={() => navigate('shop-physical')}
            />
            <ShopCard
              iconLines={['AGP']}
              badge="자동 적립 저축 플랜 · 추천"
              title="Aurum 골드 플랜"
              desc="월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환."
              bullets={[
                '월 200,000원부터 시작',
                '매일·매주·매월 자동 적립',
                '100g 도달 시 실물 바 무료 전환',
              ]}
              ctaLabel="AGP 시작하기"
              onClick={() => navigate('agp-intro')}
              featured
            />
          </div>
        </div>
      </div>

      {/* ⑦ Trust strip */}
      <div style={{ padding: useIsMobile() ? '28px 20px' : '36px 80px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: useIsMobile() ? 22 : 44, flexWrap: 'wrap' }}>
          {[['🇸🇬', 'Singapore FTZ', 'Malca-Amit 보관'], ["🛡️", "Lloyd's of London", '기관 전액 보험'], ['✅', 'LBMA 승인', '귀금속 바'], ['🔒', 'AML/KYC', '싱가포르 등록'], ['📊', '매일 감사', '백킹 리포트']].map(([icon, title, sub], i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 500 }}>{title}</div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
