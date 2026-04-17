import { useState, useRef } from 'react';
import { T, useIsMobile, useInView, fUSD, fKRW, WHY_GOLD_REASONS, WHY_GOLD_STATS, WHY_SILVER_STATS, WHY_SILVER_REASONS, EDUCATION_ARTICLES, EDUCATION_CATEGORIES, MARKET_FACTS, useNewsData } from '../lib/index.jsx';
import { Badge, StatBar, SectionHead, Tabs, Accordion, FlagSG } from '../components/UI.jsx';
import { WhyGoldHeroVisual, StorageHeroVisual, AGPHeroVisual } from '../components/HeroVisuals.jsx';

const GOLD_LINE = { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c5a572, transparent)', pointerEvents: 'none', zIndex: 1 };

/* ═══════════════════════════════════════════════════════════════════════
   WHY GOLD PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function WhyGoldPage({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [openArticle, setOpenArticle] = useState(null);
  const { articles } = useNewsData();

  const reasonAccordion = WHY_GOLD_REASONS.map(r => ({
    icon: r.icon,
    title: `${r.titleKo} — ${r.titleEn}`,
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>{r.body}</p>
        <div style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.gold, fontWeight: 700 }}>{r.stat}</div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>{r.statLabel}</div>
        </div>
      </div>
    ),
  }));

  const silverAccordion = WHY_SILVER_REASONS.map(r => ({
    icon: r.icon,
    title: `${r.titleKo} — ${r.titleEn}`,
    content: <p>{r.body}</p>,
  }));

  return (
    <div style={{ background: T.bg }}>
      <div style={{ borderBottom: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at 80% 50%, rgba(197,165,114,0.06), transparent 60%)', pointerEvents: 'none' }} />
        <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 80, paddingBottom: isMobile ? 40 : 72, position: 'relative', display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ maxWidth: 680, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>The Case for Gold</span>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>투자 근거</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.12 }}>
              {ko ? '왜 금·은인가?' : 'Why Gold & Silver?'}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: isMobile ? 14 : 16, color: T.textSub, lineHeight: 1.85, maxWidth: 520 }}>
              {ko ? '수천 년의 역사, 중앙은행의 선택, 인플레이션 헤지. 실물 금속이 현대 포트폴리오에서 갖는 의미를 알아보세요.' : 'Millennia of history. Central bank preference. Inflation hedge. Understand what physical metals mean for the modern portfolio.'}
            </p>
          </div>
          {!isMobile && <WhyGoldHeroVisual />}
        </div>
      </div>

      <StatBar stats={WHY_GOLD_STATS} cols={isMobile ? 2 : 4} />

      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Tabs tabs={[ko ? '금 (Gold)' : 'Gold', ko ? '은 (Silver)' : 'Silver']}>
              {[
                <div key="gold">
                  <SectionHead badge="금의 가치" title="왜 금인가?" sub="6가지 핵심 근거를 클릭해서 알아보세요." align="left" />
                  <Accordion items={reasonAccordion} />
                  <div style={{ marginTop: 40, background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                    <div style={GOLD_LINE} />
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 16 }}>MARKET FACTS · {MARKET_FACTS.lastVerified}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
                      {[
                        [`$${MARKET_FACTS.goldATH.toLocaleString()}`, MARKET_FACTS.goldATHLabel],
                        [`${MARKET_FACTS.totalMinedTonnes.toLocaleString()}t`, '역대 총 채광량 (WGC 추정)'],
                        [MARKET_FACTS.cbBuying2023, '2023 중앙은행 순매입'],
                      ].map(([v, l], i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px 0' }}>
                          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.gold, fontWeight: 700 }}>{v}</div>
                          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 4 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,
                /* FIX 48: Silver tab — StatBar moved BELOW Accordion to match Gold tab structure */
                <div key="silver">
                  <SectionHead badge="은의 이중성" title="왜 은인가?" sub="산업 수요 + 귀금속 가치. 독특한 투자 자산." align="left" />
                  <Accordion items={silverAccordion} />
                  <div style={{ marginTop: 40, background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c5a572, transparent)', pointerEvents: 'none' }} />
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 16 }}>SILVER STATS · {MARKET_FACTS.lastVerified}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${WHY_SILVER_STATS.length}, 1fr)`, gap: 16 }}>
                      {WHY_SILVER_STATS.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px 0' }}>
                          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.gold, fontWeight: 700 }}>{s.value}</div>
                          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,
              ]}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Competition table */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div className="reveal">
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 10 }}>비교 분석</div>
            <h3 style={{ fontFamily: T.serif, fontSize: isMobile ? 26 : 38, color: T.text, fontWeight: 300, margin: '0 0 28px' }}>
              Aurum Korea vs 한국 금 투자 대안
            </h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 520 }}>
                <thead>
                  <tr style={{ background: '#141414' }}>
                    {[
                      { label: '기능',          align: 'left',   gold: false },
                      { label: 'AURUM KOREA',   align: 'center', gold: true  },
                      { label: '한국 금거래소',  align: 'center', gold: false },
                      { label: 'KRX 금 ETF',    align: 'center', gold: false },
                      { label: '일반 은행 예금', align: 'center', gold: false },
                    ].map((h, i) => (
                      <th key={i} style={{ padding: isMobile ? '10px 10px' : '14px 18px', textAlign: h.align, fontFamily: T.mono, fontSize: isMobile ? 9 : 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: h.gold ? T.gold : T.textSub, borderBottom: h.gold ? `2px solid ${T.gold}` : `1px solid ${T.border}`, background: h.gold ? T.goldGlow : 'transparent' }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['실물 소유',              true,  true,  false, false],
                    ['국제 현물가',            true,  false, false, false],
                    ['배분 보관 (혼장 없음)',   true,  false, false, false],
                    ['월 적립 (₩20만~)',       true,  false, false, true ],
                    ['부가세 없음',            true,  false, false, true ],
                    ['해외 FTZ 보관',          true,  false, false, false],
                    ['실물 배송 가능',          true,  true,  false, false],
                    ['금속 가격 연동',          true,  true,  true,  false],
                  ].map((row, ri) => {
                    const label = row[0]; const vals = row.slice(1);
                    return (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? T.bg : T.bg2 }}
                        onMouseEnter={e => e.currentTarget.style.background = T.goldGlow}
                        onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? T.bg : T.bg2}>
                        <td style={{ padding: isMobile ? '10px 10px' : '13px 18px', fontFamily: T.sans, fontSize: isMobile ? 12 : 14, color: T.text, borderBottom: `1px solid ${T.border}` }}>{label}</td>
                        {vals.map((val, ci) => (
                          <td key={ci} style={{ padding: isMobile ? '10px 10px' : '13px 18px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, background: ci === 0 ? T.goldGlow : 'transparent' }}>
                            {val ? (
                              <span style={{ display: 'inline-block', width: 8, height: 14, borderRight: `2px solid ${T.green}`, borderBottom: `2px solid ${T.green}`, transform: 'rotate(45deg)', marginTop: -4 }} />
                            ) : (
                              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: 'rgba(100,100,100,0.3)', verticalAlign: 'middle' }} />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T.goldDim, marginBottom: 20 }}>지금 바로 국제 현물가 기준으로 실물 금을 구매하세요</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', maxWidth: 440, margin: '0 auto' }}>
                <button onClick={() => navigate('shop-physical')} style={{ flex: 1, background: `linear-gradient(135deg,${T.gold},#8a6914)`, color: '#0a0a0a', border: 'none', padding: '14px 28px', fontSize: 15, fontFamily: T.sans, fontWeight: 700, borderRadius: 4, cursor: 'pointer' }}>지금 구매하기 →</button>
                <button onClick={() => navigate('learn')} style={{ flex: 1, background: 'transparent', color: T.gold, border: `1px solid rgba(197,165,114,0.4)`, padding: '14px 28px', fontSize: 15, fontFamily: T.sans, fontWeight: 600, borderRadius: 4, cursor: 'pointer' }}>투자 교육 보기</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 300, color: T.text, marginBottom: 12 }}>
            {ko ? '지금 실물 금·은을 보유하세요' : 'Own Physical Gold & Silver Today'}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginBottom: 28, lineHeight: 1.7 }}>
            {ko ? "국제 현물가 기준, 싱가포르 완전 배분 보관, Lloyd's of London 보험." : "International spot pricing, fully allocated Singapore vault, Lloyd's of London insurance."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <button onClick={() => navigate('shop-physical')} className="btn-primary" style={{ minWidth: 180 }}>{ko ? '실물 금·은 구매' : 'Buy Physical Gold & Silver'}</button>
            <button onClick={() => navigate('agp-intro')} className="btn-outline" style={{ minWidth: 180 }}>{ko ? 'AGP 월적립 시작' : 'Start AGP Monthly Plan'}</button>
          </div>
        </div>
      </div>

      {articles.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.28em', textTransform: 'uppercase', border: `1px solid ${T.goldBorder}`, padding: '4px 10px' }}>{ko ? '시장 뉴스' : 'Market News'}</span>
              <span style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.goldBorder}, transparent)` }} />
            </div>
            <h3 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 500, color: T.text, marginBottom: 32, lineHeight: 1.2 }}>{ko ? '최신 귀금속 동향' : 'Latest Precious Metals News'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {articles.slice(0, 3).map((a, i) => (
                <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '20px 20px', display: 'block', textDecoration: 'none', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorderStrong}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.goldBorder}>
                  <div style={GOLD_LINE} />
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: a.category === 'gold' ? T.gold : T.textMuted, letterSpacing: '0.2em', marginBottom: 10, textTransform: 'uppercase' }}>{a.source} · {a.category}</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.text, lineHeight: 1.6, marginBottom: 10, fontWeight: 500 }}>{a.title}</div>
                  {a.snippet && <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub, lineHeight: 1.65 }}>{a.snippet.slice(0, 120)}...</p>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STORAGE PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function StoragePage({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();

  const features = [
    { icon: '🏛️', title: ko ? 'Malca-Amit FTZ' : 'Malca-Amit FTZ', desc: ko ? '싱가포르 자유무역지대 내 귀금속 전용 금고. 세계 최고 수준의 보안.' : 'Dedicated precious metals vault within Singapore Free Trade Zone. World-class security.' },
    { icon: '🛡️', title: ko ? "Lloyd's of London 보험" : "Lloyd's of London Insurance", desc: ko ? "보유 금속 전액에 대해 Lloyd's of London 기관 보험이 적용됩니다. 자연재해·절도·분실 포함." : "All holdings insured by Lloyd's of London. Covers natural disaster, theft, and loss." },
    { icon: '🔒', title: ko ? '완전 분리 보관' : 'Fully Segregated', desc: ko ? '귀하의 금속은 다른 고객 자산과 혼합되지 않습니다. 독립 금고에 별도 보관.' : "Your metals are never commingled with other customers' assets. Independently stored." },
    { icon: '📊', title: ko ? '매일 감사 리포트' : 'Daily Audit Reports', desc: ko ? '100% 백킹을 매일 증명하는 감사 리포트를 공개합니다. 귀하의 일련번호를 직접 조회 가능.' : 'Daily audit reports proving 100% backing published. Search your serial number directly.' },
    { icon: '✈️', title: ko ? '실물 인출 가능' : 'Physical Delivery', desc: ko ? '100g 이상 보유 시 LBMA 실물 바로 무료 전환. 또는 DHL 특급 배송으로 직접 수령.' : 'Free conversion to LBMA bar at 100g+. Or arrange direct DHL Express delivery.' },
    { icon: '⚖️', title: ko ? '법적 소유권' : 'Legal Title', desc: ko ? "첫 날부터 귀하의 이름. Aurum의 재무 상태와 완전히 분리됩니다." : "Your name from day one. Completely separated from Aurum's balance sheet." },
  ];

  const faqItems = [
    { icon: '❓', title: ko ? '보관료는 얼마인가요?' : 'What is the storage fee?', content: ko ? '연 0.15% (금 기준). 월간 자동 정산됩니다. 최소 보관 기간은 없습니다.' : 'Annual 0.15% (gold basis). Debited monthly. No minimum storage period.' },
    { icon: '🏦', title: ko ? 'Malca-Amit은 어떤 회사인가요?' : 'What is Malca-Amit?', content: ko ? 'Malca-Amit은 다이아몬드·귀금속 보관 및 운송 분야 세계 최고 수준의 전문 업체입니다. 싱가포르 MAS 규제 환경에서 운영되며, ISO 9001:2015 인증을 보유합니다.' : 'Malca-Amit is a world-leading specialist in diamond and precious metals storage and transport. Operates under Singapore MAS regulatory environment with ISO 9001:2015 certification.' },
    { icon: '🔍', title: ko ? '내 금속의 일련번호를 어떻게 확인하나요?' : 'How do I verify my serial number?', content: ko ? '로그인 후 대시보드 > 보유자산 탭에서 귀하의 모든 금속의 일련번호, 보관 위치, 배분 날짜를 확인할 수 있습니다. 감사 요청 시 실물 사진도 요청 가능합니다.' : 'After login, check Dashboard > Holdings. You can see serial numbers, vault location, and allocation date. Physical photos available on audit request.' },
    { icon: '📦', title: ko ? '한국으로 실물을 받을 수 있나요?' : 'Can I receive the physical metal in Korea?', content: ko ? '네. 하지만 한국 반입 시 관세(3%) + 부가세(10%) = 약 13%가 부과됩니다. 많은 고객분들이 싱가포르 보관을 유지하면서 매도 시 KRW로 정산하시는 방법을 선호합니다.' : 'Yes, but ~13% duties apply on import to Korea (3% customs + 10% VAT). Many customers prefer to keep metal in Singapore and settle in KRW upon sale.' },
  ];

  return (
    <div style={{ background: T.bg }}>
      <div style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg, ${T.bg}, ${T.bg2})` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 80, paddingBottom: isMobile ? 40 : 72, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ maxWidth: 660, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>Singapore Vault</span>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>싱가포르 · Malca-Amit FTZ</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px,5vw,54px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.12 }}>
              {ko ? '귀하의 금속은\n안전하게 보관됩니다.' : 'Your metal.\nSafely stored.'}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: isMobile ? 14 : 16, color: T.textSub, lineHeight: 1.85, maxWidth: 520, marginBottom: 32 }}>
              {ko ? "싱가포르 Malca-Amit FTZ 금고에 귀하의 이름으로 완전 분리 보관. Lloyd's of London 전액 보험. 매일 공개 감사." : "Fully segregated storage at Malca-Amit Singapore FTZ in your name. Lloyd's of London insurance. Daily public audit."}
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.15em' }}>
                <FlagSG /> SINGAPORE FTZ
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.15em' }}>ISO 9001:2015</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.15em' }}>MAS REGULATED</div>
            </div>
          </div>
          {!isMobile && <StorageHeroVisual />}
        </div>
      </div>

      <StatBar stats={[
        { value: '100%', label: '배분 보관 (풀링 없음)' },
        { value: '0.15%', label: '연간 보관료 (투명 공개)' },
        { value: "Lloyd's", label: '보험사 (전액 보장)' },
        { value: '매일', label: '감사 리포트 공개 주기' },
      ]} cols={isMobile ? 2 : 4} />

      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <SectionHead badge="보관 시스템" title={ko ? '6가지 보안 레이어' : '6 Layers of Security'} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="lift-card" style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={GOLD_LINE} />
                <div style={{ fontSize: isMobile ? 20 : 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: T.sansKr, fontSize: isMobile ? 13 : 15, color: T.text, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontFamily: T.sans, fontSize: isMobile ? 12 : 13, color: T.textSub, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <SectionHead badge="자주 묻는 질문" title={ko ? '보관 FAQ' : 'Storage FAQ'} align="left" />
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      {/* FIX 49: CTA buttons — equal width + height */}
      <div style={{ textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('shop-physical')} className="btn-primary" style={{ minWidth: 180, padding: '16px 36px' }}>{ko ? '지금 구매 시작' : 'Start Buying'}</button>
            <button onClick={() => navigate('why')} className="btn-outline" style={{ minWidth: 180, padding: '16px 36px' }}>{ko ? '왜 금인가?' : 'Why Gold?'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AGP INFO PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function AGPPage({ lang, navigate, currency = 'KRW', krwRate = 1368 }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  // B2-13: currency-aware formatter — KRW in Korean/KRW mode, USD in English mode
  const fAGP = (krwAmt) => (!ko || currency === 'USD')
    ? fUSD(krwAmt / krwRate)
    : `₩${Math.round(krwAmt).toLocaleString('ko-KR')}`;

  const faqItems = [
    { icon: '❓', title: ko ? '최소 가입 금액은 얼마인가요?' : 'What is the minimum?', content: ko ? '월 200,000원(약 $145)부터 시작할 수 있습니다. 일회 또는 자동이체 방식 모두 지원합니다.' : 'From KRW 200,000/month (~$145). One-time or auto-debit both supported.' },
    { icon: '💳', title: ko ? '어떤 결제 수단을 지원하나요?' : 'What payment methods?', content: ko ? '토스뱅크 자동이체, 한국 주요 은행 이체, 신용카드(Visa/Mastercard), USDT/USDC 암호화폐를 지원합니다.' : 'Toss Bank auto-debit, Korean major banks, credit card (Visa/Mastercard), USDT/USDC crypto.' },
    { icon: '📦', title: ko ? '100g가 되면 어떻게 되나요?' : 'What happens at 100g?', content: ko ? '100g 도달 시 LBMA 승인 실물 바로 무료 전환됩니다. 싱가포르 금고에 배분 보관되며, 실물 인출 또는 추가 적립 중 선택 가능합니다.' : 'Free conversion to LBMA-approved physical bar. Allocated to vault, or continue accumulating.' },
    { icon: '🔒', title: ko ? '내 그램은 안전한가요?' : 'Is my gold safe?', content: ko ? "모든 AGP 그램은 실제 금속으로 100% 백킹됩니다. 매일 감사 리포트가 공개되며 Lloyd's of London 보험이 전액 적용됩니다." : "All AGP grams are 100% backed by real metal. Daily audit reports published. Full Lloyd's of London insurance." },
    { icon: '🚪', title: ko ? '언제든 해지할 수 있나요?' : 'Can I exit anytime?', content: ko ? '네. 언제든 국제 현물가로 매도 후 KRW를 한국 은행 계좌로 수령할 수 있습니다. 위약금이나 해지 수수료는 없습니다.' : 'Yes. Sell at international spot price anytime. No exit fees or penalties.' },
  ];

  return (
    <div style={{ background: T.bg }}>
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 80, paddingBottom: isMobile ? 40 : 72, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ maxWidth: 680, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>Aurum Gold Plan</span>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>AGP 골드 플랜</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.1 }}>
              {ko ? <>{fAGP(200000)}으로<br /><span style={{ color: T.gold }}>진짜 금</span>을 모으세요.</> : <>Start from <span style={{ color: T.gold }}>{fAGP(200000)}/mo</span><br />Own real gold.</>}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: isMobile ? 14 : 16, color: T.textSub, lineHeight: 1.85, maxWidth: 520, marginBottom: 36 }}>
              {ko ? '그램 단위 자동 적립 — 100g 도달 시 LBMA 승인 실물 바로 무료 전환. 국제 현물가 + 2% 투명 프리미엄. 언제든 해지 가능.' : 'Automated gram accumulation. Free conversion to LBMA bar at 100g. International spot + 2% transparent premium. Exit anytime.'}
            </p>
            {/* FIX 43: equal buttons — flex:1, minWidth:180, alignItems:stretch */}
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', alignItems: 'stretch' }}>
              <button onClick={() => navigate('agp-intro')} className="btn-primary" style={{ flex: 1, minWidth: 180 }}>{ko ? 'AGP 가입하기' : 'Start AGP'}</button>
              <button onClick={() => navigate('agp-report')} className="btn-outline" style={{ flex: 1, minWidth: 180 }}>{ko ? '오늘의 백킹 리포트' : "Today's Backing Report"}</button>
            </div>
          </div>
          {!isMobile && <AGPHeroVisual />}
        </div>
      </div>

      <StatBar stats={[
        { value: fAGP(200000),  label: ko ? '최소 월 적립' : 'Min. monthly' },
        { value: '100g',        label: ko ? '실물 전환 기준' : 'Physical bar threshold' },
        { value: '+2.0%',       label: ko ? 'Aurum 프리미엄 (투명 공개)' : 'Aurum transparent premium' },
        { value: ko ? '0원' : '$0', label: ko ? '해지 수수료' : 'Exit fee' },
      ]} cols={isMobile ? 2 : 4} />

      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionHead badge="작동 방식" title="AGP는 이렇게 작동합니다" />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: 0, position: 'relative' }}>
              {[
                { icon: '✍️', kr: '가입',    en: 'Sign Up',   desc: ko ? '10분 내 온라인 KYC 완료.' : 'Online KYC in 10 minutes.' },
                { icon: '💰', kr: '입금',    en: 'Deposit',   desc: ko ? '토스뱅크 · 카드 · 암호화폐.' : 'Toss Bank · Card · Crypto.' },
                { icon: '⚖️', kr: '그램 적립', en: 'Accumulate', desc: ko ? '현물가 + 2%로 그램 전환.' : 'Converted at spot + 2%.' },
                { icon: '📊', kr: '관리',    en: 'Track',     desc: ko ? '대시보드에서 실시간 확인.' : 'Monitor live on dashboard.' },
                { icon: '🥇', kr: '전환',    en: 'Convert',   desc: ko ? '100g → 실물 바 무료 전환.' : '100g → free physical bar.' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '28px 12px', borderRight: !isMobile && i < 4 ? `1px dashed ${T.border}` : 'none', borderBottom: isMobile && i < 4 ? `1px dashed ${T.border}` : 'none' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  {/* FIX 45: fontSize:10 → 14 */}
                  <div style={{ fontFamily: T.mono, fontSize: 14, color: T.gold, marginBottom: 8, letterSpacing: '0.12em' }}>0{i + 1}</div>
                  {/* FIX 46: fontSize:14 → 16 */}
                  <div style={{ fontFamily: T.sans, fontSize: 16, color: T.text, fontWeight: 600, marginBottom: 8 }}>{ko ? s.kr : s.en}</div>
                  {/* FIX 47: fontSize:12 → 13 */}
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <SectionHead badge="자주 묻는 질문" title="AGP FAQ" align="left" />
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: isMobile ? 40 : 64 }}>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3vw,40px)', fontWeight: 300, color: T.text, marginBottom: 12 }}>
            {ko ? '지금 시작할 준비가 되셨나요?' : 'Ready to start?'}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginBottom: 28, lineHeight: 1.7 }}>
            {ko ? '가입까지 10분. 수수료 없음. 언제든 해지 가능.' : '10 min signup. No hidden fees. Exit anytime.'}
          </p>
          <button onClick={() => navigate('agp-intro')} className="btn-primary">{ko ? 'AGP 가입하기' : 'Start AGP Enrollment'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AGP BACKING REPORT
   ═══════════════════════════════════════════════════════════════════════ */
export function AGPBackingReport({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ background: T.bg, minHeight: '80vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 60, paddingBottom: isMobile ? 40 : 72 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.26em', marginBottom: 10, textTransform: 'uppercase' }}>AGP · 일일 백킹 리포트</div>
          <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 500, color: T.text, margin: '0 0 8px' }}>Daily Backing Report</h1>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted, marginBottom: 36 }}>{today} · MMXXVI</div>

          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
            <span className="live-dot" />
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 15, color: T.green, fontWeight: 600 }}>✓ FULLY BACKED — 100.00%</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>모든 AGP 그램은 실물 금속으로 100% 뒷받침됩니다.</div>
            </div>
          </div>

          {[
            { label: ko ? '총 AGP 그램 발행량' : 'Total AGP Grams Issued', value: '4,218.76 g', sub: '135.63 oz' },
            { label: ko ? '실물 금속 보유량' : 'Physical Metal Held', value: '4,218.76 g', sub: 'Malca-Amit SG FTZ' },
            { label: ko ? '백킹 비율' : 'Backing Ratio', value: '100.00%', sub: '0% 레버리지' },
            { label: ko ? '감사 기관' : 'Auditor', value: 'Internal Daily', sub: '외부 감사 분기별' },
            { label: ko ? '보관 위치' : 'Storage', value: 'Singapore FTZ', sub: 'Malca-Amit · Zone A & B' },
            { label: ko ? '보험' : 'Insurance', value: "Lloyd's of London", sub: '전액 커버리지' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text }}>{row.label}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{row.sub}</div>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 16, color: T.gold, fontWeight: 600, textAlign: 'right' }}>{row.value}</div>
            </div>
          ))}

          <div style={{ marginTop: 32, padding: '16px 20px', background: T.bg1, border: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.75, margin: 0 }}>
              ※ 본 리포트는 매일 자동으로 생성됩니다. 실물 금속 보유량은 Malca-Amit Singapore FTZ의 자산 기록을 기반으로 합니다. 외부 감사는 분기별로 실시됩니다. Aurum은 레버리지 또는 부분 준비금을 일절 사용하지 않습니다.
            </p>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('agp')} className="btn-primary">{ko ? 'AGP 가입하기' : 'Join AGP'}</button>
            <button onClick={() => navigate('home')} className="btn-outline">{ko ? '홈으로' : 'Home'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LEARN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function LearnPage({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = activeCategory === '전체' ? EDUCATION_ARTICLES : EDUCATION_ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div style={{ background: T.bg, minHeight: '85vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 60, paddingBottom: isMobile ? 40 : 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
          <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>Education Center</span>
          <span style={{ color: T.goldDim }}>·</span>
          <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>교육 센터</span>
          {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 500, color: T.text, margin: '0 0 12px' }}>{ko ? '귀금속 투자 가이드' : 'Precious Metals Investment Guide'}</h1>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, lineHeight: 1.7, marginBottom: 36 }}>{ko ? '실물 금·은 투자의 기초부터 세금·법률까지. 올바른 판단을 위한 지식.' : 'From fundamentals to tax and legal. Knowledge for informed decisions.'}</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {(() => {
            const categoryMap = { '전체':'All', '기초':'Basics', '가격':'Pricing', '구매':'Buying', '보관':'Storage', '세금법률':'Tax & Legal', '용어집':'Glossary' };
            return EDUCATION_CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} style={{
                background: activeCategory === c ? T.gold : 'transparent', color: activeCategory === c ? '#0a0a0a' : T.textMuted,
                border: `1px solid ${activeCategory === c ? T.gold : T.border}`, padding: '6px 16px', borderRadius: 20,
                cursor: 'pointer', fontSize: 12, fontFamily: T.sans, fontWeight: activeCategory === c ? 600 : 400,
              }}>{ko ? c : (categoryMap[c] || c)}</button>
            ));
          })()}
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
            {filtered.map(article => (
              <div key={article.id} style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, overflow: 'hidden', transition: 'border-color 0.2s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorderStrong}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.goldBorder}>
                <button onClick={() => setOpenArticle(openArticle === article.id ? null : article.id)} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{article.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <Badge>{article.category}</Badge>
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, display: 'flex', alignItems: 'center' }}>{article.readTime}</span>
                    </div>
                    <div style={{ fontFamily: T.sansKr, fontSize: 15, color: T.text, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{article.title}</div>
                    <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldDim }}>{article.subtitle}</div>
                  </div>
                  <span style={{ color: T.gold, fontSize: 18, transform: openArticle === article.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0, marginTop: 4 }}>▾</span>
                </button>

                {openArticle === article.id && (
                  <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                    {article.sections.map((sec, si) => (
                      <div key={si} style={{ marginBottom: 20 }}>
                        <h3 style={{ fontFamily: T.sansKr, fontSize: 15, color: T.text, fontWeight: 600, marginBottom: 10 }}>{sec.heading}</h3>
                        {sec.body && <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.8, marginBottom: sec.bullets ? 12 : 0 }}>{sec.body}</p>}
                        {sec.bullets && (
                          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sec.bullets.map((b, bi) => (
                              <li key={bi} style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.65 }}>{b}</li>
                            ))}
                          </ul>
                        )}
                        {sec.highlight && (
                          <div style={{ marginTop: 12, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '10px 16px', fontFamily: T.sans, fontSize: 13, color: T.gold, lineHeight: 1.6 }}>
                            {sec.highlight}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
