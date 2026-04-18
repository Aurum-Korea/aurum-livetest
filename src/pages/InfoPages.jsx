import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, useInView, fUSD, fKRW, WHY_GOLD_REASONS, WHY_GOLD_STATS, WHY_SILVER_STATS, WHY_SILVER_REASONS, EDUCATION_ARTICLES, EDUCATION_CATEGORIES, MARKET_FACTS, useNewsData, MONTHLY_DATA_2000, FC_GATES, KR_GOLD_PREMIUM, AURUM_GOLD_PREMIUM, KR_SILVER_PREMIUM, AURUM_SILVER_PREMIUM, OZ_IN_GRAMS } from '../lib/index.jsx';
import { Badge, StatBar, SectionHead, Tabs, Accordion, FlagSG } from '../components/UI.jsx';
import { WhyGoldHeroVisual, StorageHeroVisual, AGPHeroVisual } from '../components/HeroVisuals.jsx';
import MarketRatios from '../components/MarketRatios.jsx';
import { initMagneticCards } from '../lib/magnetic.js';

const GOLD_LINE = { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c5a572, transparent)', pointerEvents: 'none', zIndex: 1 };

/* ═══════════════════════════════════════════════════════════════════════
   WHY GOLD PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function WhyGoldPage({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [openArticle, setOpenArticle] = useState(null);
  const { articles } = useNewsData();

  const IB = ({ children }) => (
    <div style={{ width:44, height:44, background:T.bgCard, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:T.gold }}>
      {children}
    </div>
  );

  const WHY_ICON = {
    shield:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
    globe:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    split:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/></svg>,
    bank:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    diamond:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 9 18 21 6 21 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="2" x2="6" y2="21"/><line x1="12" y1="2" x2="18" y2="21"/></svg>,
    exchange:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
    circuit:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="4" height="8" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="18" y="10" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/></svg>,
    chartdown: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/><line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2"/></svg>,
    flag:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  };

  return (
    <div style={{ background: T.bg }}>

      {/* ── HERO — dramatic dark gradient ── */}
      <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg, #0a0a0a 0%, #111008 50%, #0a0a0a 100%)', borderBottom:`1px solid ${T.goldBorder}` }}>
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'linear-gradient(rgba(197,165,114,1) 1px,transparent 1px),linear-gradient(90deg,rgba(197,165,114,1) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />
        {/* Radial glow */}
        <div style={{ position:'absolute', top:'30%', right:'15%', width:500, height:500, background:'radial-gradient(ellipse, rgba(197,165,114,0.12) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 100, paddingBottom: isMobile ? 48 : 100, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:32, height:1, background:T.gold }} />
            <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.gold, letterSpacing:'0.04em' }}>The Case for Precious Metals</span>
            <span style={{ color:T.goldDim }}>·</span>
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase' }}>투자 근거 2026</span>
          </div>
          <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: isMobile ? 40 : 'clamp(44px,6vw,72px)', fontWeight:300, color:T.text, margin:'0 0 24px', lineHeight:1.05 }}>
            {ko ? <>왜 지금<br /><span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic', fontWeight:300 }}>금·은인가?</span></> : <>Why Gold &<br /><span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic', fontWeight:300 }}>Silver, now?</span></>}
          </h1>
          <p style={{ fontFamily:T.sans, fontSize: isMobile ? 15 : 17, color:T.textSub, lineHeight:1.85, maxWidth:540, marginBottom:36 }}>
            {ko ? '중앙은행이 역대 최대로 사들이고 있습니다. 달러 패권이 흔들립니다. 김치 프리미엄은 20%입니다. 지금 갖지 않으면, 더 비싸게 가져야 합니다.' : 'Central banks are buying at record pace. Dollar dominance is cracking. The Korea premium is 20%. Not owning is itself a position.'}
          </p>
          {/* Live macro stats strip */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:1, background:T.goldBorder }}>
            {[
              { val:'$4,800+',   lbl: ko?'금 현재가 (ATH)':'Gold (near ATH)',     color:T.gold   },
              { val:'+394%',     lbl: ko?'10년 KRW 수익률':'10yr KRW return',     color:T.gold   },
              { val:'220t',      lbl: ko?'중앙은행 Q3\'25 매입':'CB Q3\'25 buy',  color:'#4ade80'},
              { val:'20%',       lbl: ko?'한국 현재 프리미엄':'Korea premium now', color:'#f87171'},
            ].map((s,i) => (
              <div key={i} style={{ background:'#0d0b08', padding: isMobile?'14px 12px':'18px 20px', textAlign:'center' }}>
                <div style={{ fontFamily:T.mono, fontSize: isMobile?18:24, color:s.color, fontWeight:700, marginBottom:4 }}>{s.val}</div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, letterSpacing:'0.12em', textTransform:'uppercase' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY GOLD — visual cards (not accordion) ── */}
      <div style={{ borderBottom:`1px solid ${T.border}`, background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:72, paddingBottom: isMobile?32:72 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?28:48 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>{ko?'금의 6가지 핵심 근거':'6 Reasons for Gold'}</div>
            <h2 style={{ fontFamily:T.serif, fontStyle:'italic', fontSize: isMobile?28:42, color:T.text, fontWeight:300 }}>
              {ko?<>수천 년, <span style={{ color:T.gold }}>변하지 않은 가치</span></>:<>Millennia of <span style={{ color:T.gold }}>unchanged value</span></>}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:2, background:T.border }}>
            {WHY_GOLD_REASONS.map((r,i) => (
              <div key={i} style={{ background:'#0d0b08', padding: isMobile?'24px 20px':'32px 28px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:2, background:`linear-gradient(90deg,${T.gold},transparent)`, opacity: i===0?1:0.4 }} />
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ width:40, height:40, background:'rgba(197,165,114,0.1)', border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', color:T.gold, flexShrink:0 }}>
                    {WHY_ICON[r.icon]}
                  </div>
                  <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize: isMobile?14:16, color:T.gold }}>{r.titleEn}</div>
                </div>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.8, marginBottom:16 }}>{r.body}</p>
                <div style={{ background:'rgba(197,165,114,0.06)', border:`1px solid ${T.goldBorder}`, padding:'10px 14px', display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ fontFamily:T.mono, fontSize:20, color:T.gold, fontWeight:700 }}>{r.stat}</div>
                  <div style={{ fontFamily:T.sans, fontSize:11, color:T.textSub }}>{r.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY SILVER — teal/slate palette ── */}
      <div style={{ borderBottom:`1px solid ${T.border}`, background:'#080b0d' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:72, paddingBottom: isMobile?32:72 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?28:48 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:'rgba(148,210,220,0.6)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>{ko?'은의 3가지 핵심 근거':'3 Reasons for Silver'}</div>
            <h2 style={{ fontFamily:T.serif, fontStyle:'italic', fontSize: isMobile?28:42, color:T.text, fontWeight:300 }}>
              {ko?<>산업과 귀금속의 <span style={{ color:'#7dd3dc' }}>교차점</span></>:<>Industry meets <span style={{ color:'#7dd3dc' }}>precious metal</span></>}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:2, background:'rgba(125,211,220,0.1)' }}>
            {WHY_SILVER_REASONS.map((r,i) => (
              <div key={i} style={{ background:'#080b0d', padding: isMobile?'24px 20px':'32px 28px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:2, background:`linear-gradient(90deg,#7dd3dc,transparent)`, opacity:0.6 }} />
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ width:40, height:40, background:'rgba(125,211,220,0.08)', border:`1px solid rgba(125,211,220,0.25)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#7dd3dc', flexShrink:0 }}>
                    {WHY_ICON[r.icon]}
                  </div>
                  <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize: isMobile?14:16, color:'#7dd3dc' }}>{r.titleEn}</div>
                </div>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.8, marginBottom:16 }}>{r.body}</p>
                <div style={{ background:'rgba(125,211,220,0.05)', border:`1px solid rgba(125,211,220,0.2)`, padding:'10px 14px', display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ fontFamily:T.mono, fontSize:20, color:'#7dd3dc', fontWeight:700 }}>{r.stat}</div>
                  <div style={{ fontFamily:T.sans, fontSize:11, color:T.textSub }}>{r.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MARKET RATIOS TOOLS ── */}
      <div style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:72, paddingBottom: isMobile?32:72 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?24:40 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>{ko?'시장 분석 도구':'Market Analytics'}</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?24:36, fontWeight:300, color:T.text }}>
              {ko?<>숫자가 말합니다 — <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>지금 사야 하는 이유</span></> : <>The data speaks — <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>the case to buy now</span></>}
            </h2>
          </div>
          <MarketRatios lang={lang} prices={null} krwRate={1440} />
          <div style={{ marginTop:24, textAlign:'center' }}>
            <button onClick={() => navigate('register')} style={{ background:T.gold, border:'none', color:'#0d0b08', padding:'14px 36px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
              {ko?'지금 가입하고 실물 금 시작하기 →':'Start investing in physical gold →'}
            </button>
          </div>
        </div>
      </div>

      {/* Competition table */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 72, paddingBottom: isMobile ? 28 : 64 }}>
          <div className="reveal">
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldDim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>비교 분석</div>
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
                      <th key={i} style={{ padding: isMobile ? '10px 10px' : '14px 18px', textAlign: h.align, fontFamily: T.mono, fontSize: isMobile ? 11 : 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: h.gold ? T.gold : T.textSub, borderBottom: h.gold ? `2px solid ${T.gold}` : `1px solid ${T.border}`, background: h.gold ? T.goldGlow : 'transparent' }}>
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
                <button onClick={() => navigate('shop-physical')} style={{ flex: 1, background: `linear-gradient(135deg,${T.gold},#8a6914)`, color: '#0a0a0a', border: 'none', padding: '14px 28px', fontSize: 15, fontFamily: T.sans, fontWeight: 700, borderRadius: 0, cursor: 'pointer' }}>지금 구매하기 →</button>
                <button onClick={() => navigate('learn')} style={{ flex: 1, background: 'transparent', color: T.gold, border: `1px solid rgba(197,165,114,0.4)`, padding: '14px 28px', fontSize: 15, fontFamily: T.sans, fontWeight: 600, borderRadius: 0, cursor: 'pointer' }}>투자 교육 보기</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 300, color: T.text, marginBottom: 12 }}>
            {ko ? '지금 실물 금·은을 보유하세요' : 'Own Physical Gold & Silver Today'}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginBottom: 28, lineHeight: 1.9 }}>
            {ko ? "국제 현물가 기준, 싱가포르 완전 배분 보관, Lloyd's of London 보험." : "International spot pricing, fully allocated Singapore vault, Lloyd's of London insurance."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <button onClick={() => navigate('shop-physical')} className="btn-primary" style={{ minWidth: 180, flex: 1, padding: '16px 36px', fontSize: 15 }}>{ko ? '실물 금·은 구매' : 'Buy Physical Gold & Silver'}</button>
            <button onClick={() => navigate('agp-intro')} className="btn-outline" style={{ minWidth: 180, flex: 1, padding: '16px 36px', fontSize: 15 }}>{ko ? 'AGP 월적립 시작' : 'Start AGP Monthly Plan'}</button>
          </div>
        </div>
      </div>

      {articles.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.gold, letterSpacing: '0.16em', textTransform: 'uppercase', border: `1px solid ${T.goldBorder}`, padding: '4px 10px' }}>{ko ? '시장 뉴스' : 'Market News'}</span>
              <span style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.goldBorder}, transparent)` }} />
            </div>
            <h3 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 500, color: T.text, marginBottom: 32, lineHeight: 1.2 }}>{ko ? '최신 귀금속 동향' : 'Latest Precious Metals News'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {articles.slice(0, 3).map((a, i) => (
                <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '20px 20px', display: 'block', textDecoration: 'none', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorderStrong}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.goldBorder}>
                  <div style={GOLD_LINE} />
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: a.category === 'gold' ? T.gold : T.textMuted, letterSpacing: '0.2em', marginBottom: 10, textTransform: 'uppercase' }}>{a.source} · {a.category}</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.text, lineHeight: 1.9, marginBottom: 10, fontWeight: 500 }}>{a.title}</div>
                  {a.snippet && <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub, lineHeight: 1.95 }}>{a.snippet.slice(0, 120)}...</p>}
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
  useEffect(() => { const c = initMagneticCards(); return c; }, []);

  const IB = ({ children }) => (
    <div style={{ width:44, height:44, background:T.bgCard, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:T.gold }}>
      {children}
    </div>
  );

  const features = [
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><circle cx="15.5" cy="12" r="2.5"/><line x1="17.5" y1="14" x2="20" y2="16.5"/></svg></IB>, title: ko ? 'Malca-Amit FTZ' : 'Malca-Amit FTZ', desc: ko ? '싱가포르 자유무역지대 내 귀금속 전용 금고. 세계 최고 수준의 보안.' : 'Dedicated precious metals vault within Singapore Free Trade Zone. World-class security.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></IB>, title: ko ? "Lloyd's of London 보험" : "Lloyd's of London Insurance", desc: ko ? "보유 금속 전액에 대해 Lloyd's of London 기관 보험이 적용됩니다. 자연재해·절도·분실 포함." : "All holdings insured by Lloyd's of London. Covers natural disaster, theft, and loss." },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><line x1="9" y1="17" x2="15" y2="17" strokeDasharray="2 1"/></svg></IB>, title: ko ? '완전 분리 보관' : 'Fully Segregated', desc: ko ? '귀하의 금속은 다른 고객 자산과 혼합되지 않습니다. 독립 금고에 별도 보관.' : "Your metals are never commingled with other customers' assets. Independently stored." },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><polyline points="10 17 9 17 8 17"/><polyline points="10 13 11.5 15 15 11"/></svg></IB>, title: ko ? '매일 감사 리포트' : 'Daily Audit Reports', desc: ko ? '100% 백킹을 매일 증명하는 감사 리포트를 공개합니다. 귀하의 일련번호를 직접 조회 가능.' : 'Daily audit reports proving 100% backing published. Search your serial number directly.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg></IB>, title: ko ? '실물 인출 가능' : 'Physical Delivery', desc: ko ? '100g 이상 보유 시 LBMA 실물 바로 무료 전환. 또는 DHL 특급 배송으로 직접 수령.' : 'Free conversion to LBMA bar at 100g+. Or arrange direct DHL Express delivery.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg></IB>, title: ko ? '법적 소유권' : 'Legal Title', desc: ko ? "첫 날부터 귀하의 이름. Aurum의 재무 상태와 완전히 분리됩니다." : "Your name from day one. Completely separated from Aurum's balance sheet." },
  ];

  const faqItems = [
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/></svg></IB>, title: ko ? '보관료는 얼마인가요?' : 'What is the storage fee?', content: ko ? '스타터 0.75% / 프라이빗 0.50% / 패밀리 오피스 0.30% (연간, 보유액 기준). 월간 자동 정산. 최소 보관 기간 없음. 100g 전환은 무료.' : 'Starter 0.75% / Private 0.50% / Family Office 0.30% (annual, on holdings). Auto-debited monthly. No minimum term. 100g conversion is free.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/></svg></IB>, title: ko ? 'Malca-Amit은 어떤 회사인가요?' : 'What is Malca-Amit?', content: ko ? 'Malca-Amit은 다이아몬드·귀금속 보관 및 운송 분야 세계 최고 수준의 전문 업체입니다. 싱가포르 MAS 규제 환경에서 운영되며, ISO 9001:2015 인증을 보유합니다.' : 'Malca-Amit is a world-leading specialist in diamond and precious metals storage and transport. Operates under Singapore MAS regulatory environment with ISO 9001:2015 certification.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg></IB>, title: ko ? '내 금속의 일련번호를 어떻게 확인하나요?' : 'How do I verify my serial number?', content: ko ? '로그인 후 대시보드 > 보유자산 탭에서 귀하의 모든 금속의 일련번호, 보관 위치, 배분 날짜를 확인할 수 있습니다. 감사 요청 시 실물 사진도 요청 가능합니다.' : 'After login, check Dashboard > Holdings. You can see serial numbers, vault location, and allocation date. Physical photos available on audit request.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><path d="M12 14v3"/><line x1="10" y1="16" x2="14" y2="16"/></svg></IB>, title: ko ? '한국으로 실물을 받을 수 있나요?' : 'Can I receive the physical metal in Korea?', content: ko ? '네. 하지만 한국 반입 시 관세(3%) + 부가세(10%) = 약 13%가 부과됩니다. 많은 고객분들이 싱가포르 보관을 유지하면서 매도 시 KRW로 정산하시는 방법을 선호합니다.' : 'Yes, but ~13% duties apply on import to Korea (3% customs + 10% VAT). Many customers prefer to keep metal in Singapore and settle in KRW upon sale.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg></IB>, title: ko ? 'Aurum Korea가 파산하면 제 금은 어떻게 되나요?' : 'What happens to my gold if Aurum Korea becomes insolvent?', content: ko ? '배분 보관 구조에서 귀하의 금은 Aurum Korea의 자산이 아닙니다. 법적으로 귀하 소유입니다. 회사 도산 시에도 금은 고객 자산으로 보호되며 Malca-Amit을 통해 직접 실물을 회수할 수 있습니다.' : 'In the allocated storage structure, your metal is not an asset of Aurum Korea — it is legally yours. Even in insolvency, your metal is protected as client property and can be recovered directly through Malca-Amit.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg></IB>, title: ko ? '싱가포르에 금을 보관하면 한국에서 세금 신고를 해야 하나요?' : 'Do I need to declare Singapore gold holdings to Korean tax authorities?', content: ko ? '해외 금융계좌 신고 의무는 금액·국가에 따라 다릅니다. 일반적으로 해외 금융계좌 연중 최고 잔액이 5만 달러 초과 시 신고 의무가 발생할 수 있습니다. 개인 상황에 따라 다르므로 세무사 확인을 권장합니다.' : 'Overseas financial account reporting obligations vary by amount and jurisdiction. Generally, accounts exceeding USD 50,000 may trigger reporting requirements. Consult a tax advisor for your specific situation.' },
  ];

  return (
    <div style={{ background: T.bg }}>
      <div style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg, ${T.bg}, ${T.bg2})` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 80, paddingBottom: isMobile ? 32 : 72, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ maxWidth: 660, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>Singapore Vault</span>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>싱가포르 · Malca-Amit FTZ</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: 'clamp(32px,5vw,54px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.12 }}>
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
        { value: 'from 0.30%', label: '연간 보관료 (투명 공개)' },
        { value: "Lloyd's", label: '보험사 (전액 보장)' },
        { value: '매일', label: '감사 리포트 공개 주기' },
      ]} cols={isMobile ? 2 : 4} />

      {/* ── Korea vs Singapore Comparison Table ── */}
      {(() => {
        const rows = [
          { label: ko?'구매 시 부가세':'Purchase VAT',         korea: ko?'10% 즉시 발생':'10% immediately',        aurum: ko?'GST 0%':'GST 0%',                         aurumGood: true },
          { label: ko?'최소 단위':'Minimum Unit',              korea: ko?'KRX: 최소 1kg (~₩140M)':'KRX: min 1kg (~₩140M)', aurum: ko?'1온스 (~₩4.5M)':'1 oz (~₩4.5M)',          aurumGood: true },
          { label: ko?'연간 보관료':'Annual Storage',           korea: ko?'0.5–1.0% (비공개)':'0.5–1.0% (opaque)',    aurum: ko?'0.75% / 0.50% / 0.30%':'0.75% / 0.50% / 0.30%', aurumGood: true },
          { label: ko?'1oz 실효 요율':'1oz Effective Rate',    korea: ko?'은행 고정비 6%+':'Bank fixed cost 6%+',   aurum: ko?'0.75% (최소)':'0.75% (min)',               aurumGood: true },
          { label: ko?'배분 보관':'Allocated Storage',          korea: ko?'✗ 청구권 (미지정)':'✗ Claim (unallocated)', aurum: ko?'✓ 완전 배분':'✓ Fully Allocated',          aurumGood: true },
          { label: ko?'실물 인출':'Physical Withdrawal',        korea: ko?'제한적·수수료':'Restricted, fees',         aurum: ko?'✓ 언제든 가능*':'✓ Anytime*',              aurumGood: true },
          { label: ko?'FATCA/CRS 보고':'FATCA/CRS Reporting', korea: ko?'해당 가능':'May apply',                    aurum: ko?'✓ 비적용':'✓ Non-applicable',               aurumGood: true },
          { label: ko?'보험':'Insurance',                       korea: ko?'미신고 시 미보험':'Uninsured if undeclared', aurum: ko?'✓ Lloyd\'s 전액':'✓ Lloyd\'s Full',        aurumGood: true },
          { label: ko?'국가 신용등급':'Sovereign Rating',       korea: ko?'AA (한국)':'AA (Korea)',                  aurum: ko?'AAA (싱가포르)':'AAA (Singapore)',          aurumGood: true },
        ];
        return (
          <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
            <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 56 }}>
              <SectionHead badge={ko ? '비교 분석' : 'Comparison'} title={ko ? '한국 보관 vs 싱가포르 배분 보관' : 'Korea vs Singapore Allocated Storage'} />
              <div style={{ overflowX: 'auto', marginTop: 28 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.textMuted, borderBottom: `1px solid ${T.border}` }}>{ko ? '항목' : 'Item'}</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.textMuted, borderBottom: `1px solid ${T.border}` }}>{ko ? '국내 보관' : 'Korea Domestic'}</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.gold, borderBottom: `2px solid ${T.gold}`, background: T.goldGlow }}>{ko ? 'Aurum Korea (싱가포르)' : 'Aurum Korea (Singapore)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ opacity: 0, animation: `fadeUp 0.4s ease ${i * 60}ms forwards` }}>
                        <td style={{ padding: '11px 14px', fontFamily: T.sans, fontSize: isMobile ? 12 : 13, color: T.text, borderBottom: `1px solid ${T.border}` }}>{r.label}</td>
                        <td style={{ padding: '11px 14px', textAlign: 'center', fontFamily: T.mono, fontSize: isMobile ? 11 : 12, color: T.red, borderBottom: `1px solid ${T.border}` }}>{r.korea}</td>
                        <td style={{ padding: '11px 14px', textAlign: 'center', fontFamily: T.mono, fontSize: isMobile ? 11 : 12, color: T.green, borderBottom: `1px solid ${T.border}`, background: T.goldGlow }}>{r.aurum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 10, lineHeight: 1.9 }}>* {ko ? '실물 금고 외반출 시 별도 수수료 발생' : 'Separate fee applies when physical metal leaves the vault'}</p>
            </div>
          </div>
        );
      })()}

      {/* ── 3-Tier Pricing Block ── */}
      {(() => {
        const tiers = [
          {
            name: ko ? '스타터' : 'Starter', sub: ko ? '소액 투자자' : 'Entry Investor',
            rate: '0.75%', type: ko ? '풀링 배분' : 'Pooled Allocated',
            features: ko
              ? ['1온스 금·은 보관', '풀링 배분 보관', '전액 Lloyd\'s 보험', '연 1회 감사 리포트', '앱 한국어 대시보드']
              : ['1 oz gold & silver', 'Pooled allocated storage', "Full Lloyd's insurance", 'Annual audit report', 'Korean app dashboard'],
          },
          {
            name: ko ? '프라이빗' : 'Private', sub: ko ? '핵심 투자자' : 'Core Investor',
            rate: '0.50%', type: ko ? '완전 배분' : 'Fully Segregated',
            featured: true,
            features: ko
              ? ['금·은 전 종목', '완전 배분 (Segregated)', 'Lloyd\'s + 바코드 추적', '분기별 감사 리포트', '한국어 전담 어드바이저', '실물 인출 무제한']
              : ['All gold & silver products', 'Fully segregated storage', "Lloyd's + barcode tracking", 'Quarterly audit report', 'Dedicated Korean advisor', 'Unlimited physical withdrawal'],
          },
          {
            name: ko ? '패밀리 오피스' : 'Family Office', sub: ko ? '고액 자산가' : 'HNW / Family',
            rate: '0.30%', type: ko ? '맞춤 운영' : 'Bespoke',
            features: ko
              ? ['금·은·플래티넘·팔라듐', '전용 금고 구역 지정', '국제 이송 서비스', '전담 현지 팀', '월별 감사 + 방문 감사', '₩500M+ 협의 요율']
              : ['Gold, Silver, Platinum, Palladium', 'Dedicated vault zone', 'International transport', 'Dedicated local team', 'Monthly + onsite audit', '₩500M+ negotiated rate'],
          },
        ];
        return (
          <div style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 56 }}>
              <SectionHead badge={ko ? '투명한 요금제' : 'Transparent Pricing'} title={ko ? '보관 요금제' : 'Storage Plans'} />
              {/* Callout box */}
              <div style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: isMobile ? '14px 16px' : '16px 24px', marginTop: 24, marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: T.gold, fontSize: 16, flexShrink: 0 }}>ℹ</span>
                <p style={{ fontFamily: T.sans, fontSize: isMobile ? 12 : 13, color: T.textSub, lineHeight: 1.9, margin: 0 }}>
                  {ko ? '1온스 보관 시 실효 요율은 약 0.75%입니다 — 국내 은행 고정비 대비 훨씬 낮습니다. 100g 이상 실물 전환은 무료입니다.' : '1 oz effective rate is approximately 0.75% — far lower than Korean bank fixed costs. Physical conversion at 100g+ is always free.'}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 10 : 16 }}>
                {tiers.map((tier, i) => (
                  <div key={i} className="magnetic-card" style={{
                    background: tier.featured ? `linear-gradient(180deg,${T.goldGlow},${T.bg})` : T.bgCard,
                    border: `1px solid ${tier.featured ? T.goldBorderStrong : T.goldBorder}`,
                    padding: isMobile ? '24px 20px' : '32px 28px',
                    position: 'relative', overflow: 'hidden',
                    opacity: 0, animation: `fadeUp 0.5s ease ${i * 80}ms forwards`,
                  }}>
                    {tier.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
                    {tier.featured && (
                      <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: T.mono, fontSize: 9, color: T.bg, background: T.gold, padding: '3px 9px', letterSpacing: '0.16em' }}>{ko ? '추천' : 'BEST'}</div>
                    )}
                    <div style={{ fontFamily: T.serif, fontSize: isMobile ? 20 : 24, color: T.text, fontWeight: 400, marginBottom: 2 }}>{tier.name}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.14em', marginBottom: 16, textTransform: 'uppercase' }}>{tier.sub} · {tier.type}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontFamily: T.mono, fontSize: isMobile ? 28 : 36, color: T.gold, fontWeight: 600, letterSpacing: '-0.02em' }}>{tier.rate}</span>
                      <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>{ko ? '연간' : 'p.a.'}</span>
                    </div>
                    {tier.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: fi < tier.features.length - 1 ? `1px dashed ${T.border}` : 'none' }}>
                        <span style={{ color: T.gold, fontFamily: T.mono, fontSize: 11, flexShrink: 0 }}>—</span>
                        <span style={{ fontFamily: T.sans, fontSize: isMobile ? 12 : 13, color: T.textSub, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 12, lineHeight: 1.9, textAlign: 'center' }}>
                * {ko ? '실물 금고 외반출 시 별도 수수료 발생. 100g 미만 AGP 전환은 무료.' : 'Fee applies when physical metal leaves the vault. AGP conversion at 100g+ is free.'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Singapore Map SVG Card ── */}
      {!isMobile && (
        <div style={{ borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
          <div className="aurum-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 48, maxWidth: 860, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
              {/* Location coordinate card */}
              <div style={{ flexShrink: 0, width: 260, height: 160, position: 'relative' }}>
                <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Dot grid — Asia-Pacific backdrop */}
                  {Array.from({ length: 10 }, (_, row) =>
                    Array.from({ length: 14 }, (_, col) => (
                      <circle key={`${row}-${col}`} cx={col * 20 + 10} cy={row * 16 + 8} r="1" fill="rgba(197,165,114,0.12)" />
                    ))
                  )}
                  {/* Arc lines to regional cities */}
                  <path d="M130 100 Q100 60 60 40" stroke="rgba(197,165,114,0.15)" strokeWidth="1" strokeDasharray="4 3" fill="none"/>
                  <path d="M130 100 Q155 55 195 35" stroke="rgba(197,165,114,0.15)" strokeWidth="1" strokeDasharray="4 3" fill="none"/>
                  <path d="M130 100 Q160 80 215 70" stroke="rgba(197,165,114,0.12)" strokeWidth="1" strokeDasharray="4 3" fill="none"/>
                  {/* City labels */}
                  <text x="42" y="36" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill="rgba(197,165,114,0.35)" letterSpacing="1">SEOUL</text>
                  <text x="195" y="30" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill="rgba(197,165,114,0.35)" letterSpacing="1">TOKYO</text>
                  <text x="218" y="66" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill="rgba(197,165,114,0.35)" letterSpacing="1">HK</text>
                  {/* Singapore pulse rings */}
                  <circle cx="130" cy="100" r="22" stroke="rgba(197,165,114,0.08)" strokeWidth="1" fill="none">
                    <animate attributeName="r" values="14;28;14" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="130" cy="100" r="12" stroke="rgba(197,165,114,0.2)" strokeWidth="1" fill="none">
                    <animate attributeName="r" values="8;18;8" dur="3s" begin="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" begin="0.8s" repeatCount="indefinite" />
                  </circle>
                  {/* Singapore marker */}
                  <circle cx="130" cy="100" r="6" fill="rgba(197,165,114,0.15)" stroke="#C5A572" strokeWidth="1.5" />
                  <circle cx="130" cy="100" r="2.5" fill="#C5A572" />
                  {/* Coordinate label */}
                  <line x1="130" y1="94" x2="130" y2="72" stroke="rgba(197,165,114,0.4)" strokeWidth="0.8" strokeDasharray="3 2"/>
                  <rect x="88" y="56" width="84" height="16" rx="1" fill="#0d0b08" stroke="rgba(197,165,114,0.25)" strokeWidth="0.8"/>
                  <text x="130" y="67" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#C5A572" letterSpacing="0.5">1°21′N · 103°49′E</text>
                  {/* SINGAPORE label below dot */}
                  <text x="130" y="122" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="rgba(197,165,114,0.6)" letterSpacing="2">SINGAPORE</text>
                  <text x="130" y="136" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill="rgba(197,165,114,0.3)" letterSpacing="1.5">MALCA-AMIT FTZ</text>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Malca-Amit FTZ · Singapore</div>
                <div style={{ fontFamily: ko ? T.serifKrDisplay : T.serif, fontSize: 22, color: T.text, marginBottom: 10 }}>{ko ? '싱가포르 자유무역지대' : 'Singapore Free Trade Zone'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(ko
                    ? ['창이공항 인접 · 최고 보안 등급', 'AAA 국가 신용등급 · GST 0%', '생체인식 접근 · 24시간 무장 경비', "Lloyd's of London 전액 보험 적용"]
                    : ['Adjacent to Changi Airport · Class 3 security', 'AAA sovereign rating · GST 0%', 'Biometric access · 24hr armed guard', "Lloyd's of London full insurance coverage"]
                  ).map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: T.gold, fontFamily: T.mono, fontSize: 10, flexShrink: 0 }}>—</span>
                      <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 56 }}>
          <SectionHead badge="보관 시스템" title={ko ? '6가지 보안 레이어' : '6 Layers of Security'} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="magnetic-card" style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: isMobile ? 20 : 28, position: 'relative', overflow: 'hidden' }}>
                <div style={GOLD_LINE} />
                <div style={{ fontSize: isMobile ? 20 : 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: T.sansKr, fontSize: isMobile ? 13 : 15, color: T.text, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontFamily: T.sans, fontSize: isMobile ? 12 : 13, color: T.textSub, lineHeight: 1.9 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <SectionHead badge="자주 묻는 질문" title={ko ? '보관 FAQ' : 'Storage FAQ'} align="left" />
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      {/* FIX 49: CTA buttons — equal width + height */}
      <div style={{ textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('shop-physical')} className="btn-primary" style={{ minWidth: 180, padding: '16px 36px', flex: 1, fontSize: 15 }}>{ko ? '지금 구매 시작' : 'Start Buying'}</button>
            <button onClick={() => navigate('why')} className="btn-outline" style={{ minWidth: 180, padding: '16px 36px', flex: 1, fontSize: 15 }}>{ko ? '왜 금인가?' : 'Why Gold?'}</button>
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
  const IB = ({ children }) => (
    <div style={{ width:44, height:44, background:T.bgCard, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:T.gold }}>{children}</div>
  );
  // Currency-aware formatter — respects the currency toggle regardless of language
  const fAGP = (krwAmt) => (currency === 'USD')
    ? fUSD(krwAmt / krwRate)
    : `₩${Math.round(krwAmt).toLocaleString('ko-KR')}`;

  const faqItems = [
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></IB>, title: ko ? '최소 가입 금액은 얼마인가요?' : 'What is the minimum?', content: ko ? '월 200,000원(약 $145)부터 시작할 수 있습니다. 일회 또는 자동이체 방식 모두 지원합니다.' : 'From KRW 200,000/month (~$145). One-time or auto-debit both supported.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/></svg></IB>, title: ko ? '어떤 결제 수단을 지원하나요?' : 'What payment methods?', content: ko ? '토스뱅크 자동이체, 한국 주요 은행 이체, 신용카드(Visa/Mastercard), USDT/USDC 암호화폐를 지원합니다.' : 'Toss Bank auto-debit, Korean major banks, credit card (Visa/Mastercard), USDT/USDC crypto.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg></IB>, title: ko ? '100g가 되면 어떻게 되나요?' : 'What happens at 100g?', content: ko ? '100g 도달 시 LBMA 승인 실물 바로 무료 전환됩니다. 싱가포르 금고에 배분 보관되며, 실물 인출 또는 추가 적립 중 선택 가능합니다.' : 'Free conversion to LBMA-approved physical bar. Allocated to vault, or continue accumulating.' },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></IB>, title: ko ? '내 그램은 안전한가요?' : 'Is my gold safe?', content: ko ? "모든 AGP 그램은 실제 금속으로 100% 백킹됩니다. 매일 감사 리포트가 공개되며 Lloyd's of London 보험이 전액 적용됩니다." : "All AGP grams are 100% backed by real metal. Daily audit reports published. Full Lloyd's of London insurance." },
    { icon: <IB><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/><circle cx="12" cy="12" r="9"/></svg></IB>, title: ko ? '언제든 해지할 수 있나요?' : 'Can I exit anytime?', content: ko ? '네. 언제든 국제 현물가로 매도 후 KRW를 한국 은행 계좌로 수령할 수 있습니다. 위약금이나 해지 수수료는 없습니다.' : 'Yes. Sell at international spot price anytime. No exit fees or penalties.' },
  ];

  return (
    <div style={{ background: T.bg }}>
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 80, paddingBottom: isMobile ? 32 : 72, display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ maxWidth: 680, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>AGP 적금 Plan</span>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>AGP 적금 Plan</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.1 }}>
              {ko ? <>매달<br /><span style={{ color: T.gold }}>금이 쌓입니다.</span></> : <>Gold accumulates<br /><span style={{ color: T.gold }}>every month.</span></>}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: isMobile ? 14 : 16, color: T.textSub, lineHeight: 1.85, maxWidth: 520, marginBottom: 20 }}>
              {ko ? '그램 단위 자동 적립 — 100g 도달 시 LBMA 승인 실물 바로 무료 전환. 국제 현물가 + 2% 투명 프리미엄. 언제든 해지 가능.' : 'Automated gram accumulation. Free conversion to LBMA bar at 100g. International spot + 2% transparent premium. Exit anytime.'}
            </p>
            {/* Kimchi premium savings callout */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', padding: '8px 16px', marginBottom: 28 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: '#4ade80', letterSpacing: '0.08em' }}>
                {ko ? '한국 은행 대비 ~18% 절감 · 수수료 없음 · 언제든 해지' : '~18% below Korean banks · No fees · Exit anytime'}
              </span>
            </div>
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
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 72, paddingBottom: isMobile ? 28 : 64 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionHead badge="작동 방식" title="AGP는 이렇게 작동합니다" />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: isMobile ? 16 : 0, position: 'relative' }}>
              {[
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, kr: '가입',    en: 'Sign Up',   desc: ko ? '10분 내 온라인 KYC 완료.' : 'Online KYC in 10 minutes.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, kr: '입금',    en: 'Deposit',   desc: ko ? '토스뱅크 · 카드 · 암호화폐.' : 'Toss Bank · Card · Crypto.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, kr: '그램 적립', en: 'Accumulate', desc: ko ? '현물가 + 2%로 그램 전환.' : 'Converted at spot + 2%.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, kr: '관리',    en: 'Track',     desc: ko ? '대시보드에서 실시간 확인.' : 'Monitor live on dashboard.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>, kr: '전환',    en: 'Convert',   desc: ko ? '100g → 실물 바 무료 전환.' : '100g → free physical bar.' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '28px 12px', borderRight: !isMobile && i < 4 ? `1px dashed ${T.border}` : 'none', borderBottom: isMobile && i < 4 ? `1px dashed ${T.border}` : 'none' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  {/* FIX 45: fontSize:10 → 14 */}
                  <div style={{ fontFamily: T.mono, fontSize: 14, color: T.gold, marginBottom: 8, letterSpacing: '0.12em' }}>0{i + 1}</div>
                  {/* FIX 46: fontSize:14 → 16 */}
                  <div style={{ fontFamily: T.sans, fontSize: 16, color: T.text, fontWeight: 600, marginBottom: 8 }}>{ko ? s.kr : s.en}</div>
                  {/* FIX 47: fontSize:12 → 13 */}
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, lineHeight: 1.95 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Launch Gift Tiers — brought from AGP Launch promo ── */}
      <div style={{ borderBottom: `1px solid ${T.goldBorder}`, background: `linear-gradient(180deg, ${T.goldGlow}, ${T.bg})` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <SectionHead badge={ko ? '창립 혜택' : 'Launch Gift'} title={ko ? '시작하는 날, 금을 더 드립니다' : 'On your first day, we give you gold.'} />
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, maxWidth: 560, marginBottom: 32, marginTop: -8 }}>
            {ko ? '첫 결제 즉시, 선택한 월 적금액에 따라 실물 금이 자동 적립됩니다. Founders Club 파트너로 자동 등록.' : 'On your first payment, physical gold is credited based on your chosen monthly amount. Automatically enrolled as a Founders Club partner.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: 10 }}>
            {[
              { name: ko?'브론즈':'Bronze', nameEn:'Bronze', min:'₩200K', gift:'₩50K', color: T.goldDim,    featured: false },
              { name: ko?'실버':'Silver',   nameEn:'Silver',  min:'₩500K', gift:'₩150K', color: '#aaa',     featured: false },
              { name: ko?'골드':'Gold',     nameEn:'Gold',    min:'₩1M',   gift:'₩400K', color: T.gold,     featured: true  },
              { name: ko?'플래티넘':'Plat.', nameEn:'Plat.',  min:'₩2M',   gift:'₩1M',   color: '#60a5fa',  featured: false },
              { name: ko?'소브린':'Sovereign',nameEn:'Sovereign',min:'₩5M',gift:'₩5M',  color: T.goldBright,featured: false },
            ].map((t, i) => (
              <div key={i} style={{ background: t.featured ? `linear-gradient(180deg,${T.goldGlow},${T.bg})` : T.bg, border: `1px solid ${t.featured ? T.gold : T.goldBorder}`, padding: isMobile ? '16px 10px' : '24px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {t.featured && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
                {t.featured && <div style={{ position:'absolute', top:8, right:8, fontFamily:T.mono, fontSize:8, color:'#0d0b08', background:T.gold, padding:'2px 6px', letterSpacing:'0.1em' }}>추천</div>}
                <div style={{ fontFamily: T.serifKr, fontSize: isMobile ? 13 : 15, fontWeight: 600, color: t.color, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.textMuted, marginBottom: 8 }}>{t.min}+/mo</div>
                <div style={{ fontFamily: T.mono, fontSize: isMobile ? 16 : 20, color: t.featured ? T.goldBright : T.gold, fontWeight: 700 }}>{t.gift}</div>
                <div style={{ fontFamily: T.sans, fontSize: 9, color: T.textMuted, marginTop: 3 }}>{ko?'실물 금 기프트':'gold gift'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button onClick={() => navigate('campaign-agp-launch')} style={{ background:'none', border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'8px 20px', fontFamily:T.mono, fontSize:11, letterSpacing:'0.12em', cursor:'pointer' }}>
              {ko?'론치 이벤트 상세 →':'Launch event details →'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <SectionHead badge="자주 묻는 질문" title="AGP FAQ" align="left" />
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 64, paddingBottom: isMobile ? 28 : 64 }}>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3vw,40px)', fontWeight: 300, color: T.text, marginBottom: 12 }}>
            {ko ? '지금 시작할 준비가 되셨나요?' : 'Ready to start?'}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginBottom: 28, lineHeight: 1.9 }}>
            {ko ? '가입까지 10분. 수수료 없음. 언제든 해지 가능.' : '10 min signup. No hidden fees. Exit anytime.'}
          </p>
          <button onClick={() => navigate('register')} className="btn-primary" style={{ padding: '14px 36px', fontSize: 14 }}>{ko ? 'Founder 가입' : 'Founder Enrollment'}</button>
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
      <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 60, paddingBottom: isMobile ? 28 : 72 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldDim, letterSpacing: '0.16em', marginBottom: 10, textTransform: 'uppercase' }}>AGP · 일일 백킹 리포트</div>
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
            <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.95, margin: 0 }}>
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

  const learnIcons = {
    '기초':    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    '가격':    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    '구매':    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    '보관':    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>,
    '세금법률': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    '세금·법률': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    '한국 시장': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    '법률·안전': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>,
    '용어집':  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  };
  // Industry interview videos — real Kitco News public interviews
  const VIDEOS = [
    { id:'FaDxW9GjInc', title: ko?'파트 화폐 시스템의 종말':'Fiat System in the ICU',      guest:'Dr. Mark Thornton', source:'Kitco News', tag: ko?'중앙은행':'Central Banks' },
    { id:'1HVUWs-Jmtc', title: ko?'금 4월 급등과 미국 버블':'Gold April Surge & US Bubble', guest:'Peter Schiff',      source:'Kitco News', tag: ko?'금 가격':'Gold Price'   },
    { id:'8oc1UoQIB7A', title: ko?'2025년 최대 금 움직임 예측':'The Move That Predicted 2025', guest:'Market Analyst',    source:'Kitco News', tag: ko?'전망':'Outlook'       },
    { id:'g7smAzCYd1E', title: ko?'스테이블코인과 금의 재정립':'Stablecoins & Gold Reckoning',  guest:'Lynette Zang',     source:'Kitco News', tag: ko?'달러':'Dollar'        },
  ];

  const [activeVideo, setActiveVideo] = useState(0);
  const filtered = activeCategory === '전체' ? EDUCATION_ARTICLES : EDUCATION_ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div style={{ background: T.bg, minHeight: '85vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 60, paddingBottom: isMobile ? 28 : 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'nowrap', overflow: 'hidden' }}>
          <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 11 : 13, color: T.gold, letterSpacing: '0.04em' }}>Education Center</span>
          <span style={{ color: T.goldDim }}>·</span>
          <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>교육 센터</span>
          {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 500, color: T.text, margin: '0 0 12px' }}>{ko ? '귀금속 투자 가이드' : 'Precious Metals Investment Guide'}</h1>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, lineHeight: 1.9, marginBottom: 36 }}>{ko ? '실물 금·은 투자의 기초부터 세금·법률까지. 올바른 판단을 위한 지식.' : 'From fundamentals to tax and legal. Knowledge for informed decisions.'}</p>

        {/* ── INDUSTRY VIDEO INTERVIEWS ── */}
        <div style={{ marginBottom: 48, background: T.bgCard, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
          <div style={{ padding: isMobile?'16px 16px 12px':'20px 24px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase' }}>▶ {ko?'업계 전문가 인터뷰':'Industry Expert Interviews'}</span>
            <span style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, marginLeft:'auto' }}>Kitco News · Public</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:0 }}>
            {/* Main video player */}
            <div style={{ position:'relative', paddingBottom:'56.25%', background:'#000', borderRight: !isMobile?`1px solid ${T.border}`:'none' }}>
              <iframe
                key={VIDEOS[activeVideo].id}
                src={`https://www.youtube.com/embed/${VIDEOS[activeVideo].id}?rel=0&modestbranding=1&color=white`}
                title={VIDEOS[activeVideo].title}
                style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Video list */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              {VIDEOS.map((v,i) => (
                <div key={i} onClick={() => setActiveVideo(i)} style={{ display:'flex', gap:12, padding: isMobile?'12px 14px':'14px 20px', cursor:'pointer', background: activeVideo===i?'rgba(197,165,114,0.06)':'transparent', borderBottom: i<VIDEOS.length-1?`1px solid ${T.border}`:'none', transition:'background 0.2s', alignItems:'flex-start' }}>
                  {/* Thumbnail play button */}
                  <div style={{ width:42, height:30, background:'rgba(255,255,255,0.05)', border:`1px solid ${activeVideo===i?T.gold:T.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <div style={{ width:0, height:0, borderStyle:'solid', borderWidth:'5px 0 5px 8px', borderColor:`transparent transparent transparent ${activeVideo===i?T.gold:'#666'}` }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.sans, fontSize: isMobile?11:12, color: activeVideo===i?T.text:T.textSub, fontWeight: activeVideo===i?600:400, lineHeight:1.4, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:T.mono, fontSize:9, color: activeVideo===i?T.gold:T.textMuted }}>{v.guest}</span>
                      <span style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, background:T.bg1, padding:'1px 6px', border:`1px solid ${T.border}` }}>{v.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {(() => {
            const categoryMap = { '전체':'All', '기초':'Basics', '가격':'Pricing', '구매':'Buying', '보관':'Storage', '세금·법률':'Tax & Legal', '한국 시장':'Korea Market', '법률·안전':'Legal & Safety', '용어집':'Glossary' };
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
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: `1px solid ${T.goldBorder}`, background: T.goldGlow }}>
                    {learnIcons[article.category] || learnIcons['기초']}
                  </span>
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
                              <li key={bi} style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.95 }}>{b}</li>
                            ))}
                          </ul>
                        )}
                        {sec.highlight && (
                          <div style={{ marginTop: 12, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '10px 16px', fontFamily: T.sans, fontSize: 13, color: T.gold, lineHeight: 1.9 }}>
                            {sec.highlight}
                          </div>
                        )}
                        {/* 외국환거래법 threshold table */}
                        {sec.table && (
                          <div style={{ marginTop: 14, overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 11 }}>
                              <thead>
                                <tr>
                                  {sec.table.headers.map((h, hi) => (
                                    <th key={hi} style={{ padding: '8px 12px', background: 'rgba(197,165,114,0.08)', border: `1px solid ${T.goldBorder}`, color: T.gold, letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sec.table.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => (
                                      <td key={ci} style={{ padding: '8px 12px', border: `1px solid rgba(197,165,114,0.08)`, color: T.textSub, lineHeight: 1.6 }}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {/* Custody chain diagram */}
                        {sec.custodyChain && (
                          <div style={{ marginTop: 16, padding: '16px', background: 'rgba(197,165,114,0.03)', border: '1px solid rgba(197,165,114,0.1)' }}>
                            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                              {lang === 'ko' ? '보관 체인 구조' : 'Custody Chain'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
                              {[
                                { l: lang === 'ko' ? 'Aurum\n(딜러)' : 'Aurum\n(dealer)', c: T.gold },
                                { l: '→', c: T.goldDim, arrow: true },
                                { l: lang === 'ko' ? 'LBMA\n승인 바 구매' : 'LBMA bar\npurchase', c: T.textSub },
                                { l: '→', c: T.goldDim, arrow: true },
                                { l: lang === 'ko' ? 'Malca-Amit\nSG FTZ 금고' : 'Malca-Amit\nSG FTZ vault', c: T.gold },
                                { l: '→', c: T.goldDim, arrow: true },
                                { l: lang === 'ko' ? '귀하의 명의\n일련번호 발급' : 'Your name\nserial # issued', c: '#4ade80' },
                              ].map((s, i) => s.arrow
                                ? <span key={i} style={{ color: T.goldDim, fontSize: 18, padding: '0 6px' }}>→</span>
                                : <div key={i} style={{ background: 'rgba(197,165,114,0.06)', border: `1px solid ${s.c}44`, padding: '8px 12px', textAlign: 'center', minWidth: 80 }}>
                                    {s.l.split('\n').map((line, li) => (
                                      <div key={li} style={{ fontFamily: T.mono, fontSize: li === 0 ? 11 : 9, color: li === 0 ? s.c : T.textMuted, lineHeight: 1.4 }}>{line}</div>
                                    ))}
                                  </div>
                              )}
                            </div>
                            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {[
                                { label: lang === 'ko' ? '시중 금통장' : 'Bank gold acct', bad: true, items: lang === 'ko' ? ['은행 장부상 숫자', '예금자보호 미적용', '은행 파산 시 위험'] : ['Bank ledger entry', 'No deposit protection', 'Bank insolvency risk'] },
                                { label: lang === 'ko' ? 'Aurum 배분 보관' : 'Aurum allocated', bad: false, items: lang === 'ko' ? ['법적 귀하의 소유', '배분 보관 구조', '회사 도산과 분리'] : ['Legally yours', 'Fully allocated', 'Separate from company'] },
                              ].map((col, ci) => (
                                <div key={ci} style={{ background: col.bad ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${col.bad ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`, padding: '10px 12px' }}>
                                  <div style={{ fontFamily: T.mono, fontSize: 10, color: col.bad ? '#f87171' : '#4ade80', marginBottom: 8, fontWeight: 700 }}>{col.label}</div>
                                  {col.items.map((item, ii) => (
                                    <div key={ii} style={{ fontFamily: T.sans, fontSize: 11, color: col.bad ? '#f87171' : '#4ade80', marginBottom: 4 }}>
                                      {col.bad ? '✗ ' : '✓ '}{item}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* 금통장 vs Aurum comparison table */}
                        {sec.comparisonTable && (
                          <div style={{ marginTop: 16, overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 11 }}>
                              <thead>
                                <tr>
                                  <th style={{ padding: '8px 12px', background: 'rgba(197,165,114,0.06)', border: `1px solid ${T.goldBorder}`, color: T.goldDim, textAlign: 'left' }}>{lang === 'ko' ? '항목' : 'Item'}</th>
                                  <th style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.06)', border: `1px solid rgba(248,113,113,0.2)`, color: '#f87171', textAlign: 'center' }}>{lang === 'ko' ? '시중 금통장' : 'Bank Gold Acct'}</th>
                                  <th style={{ padding: '8px 12px', background: 'rgba(197,165,114,0.08)', border: `1px solid ${T.goldBorder}`, color: T.gold, textAlign: 'center' }}>Aurum</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { item: lang === 'ko' ? '법적 성격' : 'Legal nature', bad: lang === 'ko' ? '은행의 부채' : "Bank's liability", good: lang === 'ko' ? '귀하의 재산' : 'Your property' },
                                  { item: lang === 'ko' ? '도산 시' : 'Insolvency', bad: lang === 'ko' ? '예금자보호 미적용' : 'Not protected', good: lang === 'ko' ? '법적 분리 보장' : 'Legally separated' },
                                  { item: lang === 'ko' ? '소유권' : 'Ownership', bad: lang === 'ko' ? '청구권(숫자)' : 'Claim (numbers)', good: lang === 'ko' ? '실물 금속' : 'Physical metal' },
                                  { item: lang === 'ko' ? '보험 적용' : 'Insurance', bad: lang === 'ko' ? '예금자보호법(5천만 한도)' : 'Deposit protection (limit)', good: "Lloyd's of London 전액" },
                                  { item: lang === 'ko' ? '부가세' : 'VAT', bad: lang === 'ko' ? '실물 인출 시 10%' : '10% on physical delivery', good: lang === 'ko' ? '싱가포르 GST 0%' : 'Singapore GST 0%' },
                                ].map((row, ri) => (
                                  <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                    <td style={{ padding: '8px 12px', border: `1px solid rgba(197,165,114,0.06)`, color: T.textSub }}>{row.item}</td>
                                    <td style={{ padding: '8px 12px', border: `1px solid rgba(248,113,113,0.1)`, color: '#f87171', textAlign: 'center' }}>✗ {row.bad}</td>
                                    <td style={{ padding: '8px 12px', border: `1px solid rgba(197,165,114,0.1)`, color: '#4ade80', textAlign: 'center' }}>✓ {row.good}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* GC disclaimer for legal hub articles */}
                    {article.legalHub && (
                      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(200,72,72,0.04)', border: '1px solid rgba(200,72,72,0.15)', fontFamily: T.mono, fontSize: 9, color: '#666', letterSpacing: '0.08em', lineHeight: 1.7 }}>
                        {lang === 'ko'
                          ? '※ 법적 고지: 본 내용은 일반 정보 제공 목적이며 법적·세무적 조언이 아닙니다. 외국환거래법 및 해외금융계좌 신고 의무는 개인 상황에 따라 다를 수 있으므로 전문 세무사 또는 변호사 상담을 권장합니다.'
                          : '※ Legal notice: This information is for general informational purposes only and does not constitute legal or tax advice. Foreign exchange regulations and overseas account reporting requirements vary by individual circumstances. Consult a qualified professional.'}
                      </div>
                    )}
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
// ══════════════════════════════════════════════════════════════════════════════
// GoldTodayPage — Complete new page
// APPEND TO BOTTOM of: src/pages/InfoPages.jsx
//
// Required additional import at top of InfoPages.jsx:
//   import { ..., MONTHLY_DATA_2000, FC_GATES, KR_GOLD_PREMIUM, AURUM_GOLD_PREMIUM,
//            KR_SILVER_PREMIUM, AURUM_SILVER_PREMIUM, OZ_IN_GRAMS } from '../lib/index.jsx';
//
// Route: 'gold-today'  (add to App.jsx: case 'gold-today': return <GoldTodayPage {...shared} />)
// Nav:   '오늘의 금값' → page:'gold-today'
// ══════════════════════════════════════════════════════════════════════════════

// ─── Local constants for InfoPages context ─────────────────────────────────────
const MONO_GT = "'JetBrains Mono',monospace";
const SANS_GT = "'Outfit',sans-serif";
const SERIF_GT = "'Cormorant Garamond',serif";

// ─── GoldPriceChart — multi-timeframe interactive canvas chart ────────────────
function GoldPriceChart({ lang, isMobile, krwRate }) {
  const canvasRef = useRef(null);
  // GoldTodayPage is always visible — no scroll reveal needed here
  const [tf, setTf] = useState('5Y');
  const [unit, setUnit] = useState('oz'); // oz | gram | 100g | kg
  const ko = lang === 'ko';
  const tfMap = { '1Y':12, '3Y':36, '5Y':60, 'ALL':MONTHLY_DATA_2000.length };
  const data = MONTHLY_DATA_2000.slice(-tfMap[tf]);
  const unitMultiplier = { oz:1, gram:1/OZ_IN_GRAMS, '100g':100/OZ_IN_GRAMS, kg:1000/OZ_IN_GRAMS };
  const unitLabel = { oz:ko?'1 온스 (oz)':'1 oz', gram:ko?'1 그램':'1 gram', '100g':ko?'100 그램':'100g', kg:ko?'1 킬로':'1 kg' };
  useEffect(()=>{
    if(!canvasRef.current) return;
    const canvas=canvasRef.current; const dpr=window.devicePixelRatio||1;
    const W=canvas.offsetWidth, H=isMobile?200:280;
    canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const m = unitMultiplier[unit];
    const pts = data.map(d=>({ usd: d[2]*m, krw: d[2]*d[3]*m }));
    const allKRW = pts.map(p=>p.krw);
    const minV=Math.min(...allKRW)*0.97, maxV=Math.max(...allKRW)*1.02;
    const PAD_L=56, PAD_R=14, PAD_T=18, PAD_B=24;
    const toX=i=>PAD_L+(i/(pts.length-1))*(W-PAD_L-PAD_R);
    const toY=v=>PAD_T+(H-PAD_T-PAD_B)-((v-minV)/(maxV-minV))*(H-PAD_T-PAD_B);
    ctx.clearRect(0,0,W,H);
    // Grid
    const gridCount=5;
    for(let g=0;g<=gridCount;g++){
      const v=minV+(maxV-minV)*(g/gridCount); const y=toY(v);
      ctx.strokeStyle='rgba(197,165,114,0.06)';ctx.lineWidth=1;ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(PAD_L,y);ctx.lineTo(W-PAD_R,y);ctx.stroke();
      const label = v>=1000000 ? `₩${(v/1000000).toFixed(1)}M` : `₩${Math.round(v/10000)}만`;
      ctx.fillStyle='rgba(138,125,107,0.45)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.textAlign='right';
      ctx.fillText(label,PAD_L-4,y+3);
    }
    ctx.textAlign='left';
    // Year marks
    let lastYear=null;
    data.forEach((d,i)=>{
      if(d[1]===1&&d[0]!==lastYear){
        lastYear=d[0];const x=toX(i);
        ctx.strokeStyle='rgba(197,165,114,0.05)';ctx.lineWidth=1;ctx.setLineDash([2,3]);
        ctx.beginPath();ctx.moveTo(x,PAD_T);ctx.lineTo(x,H-PAD_B);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(138,125,107,0.3)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.fillText(d[0],x-12,H-6);
      }
    });
    // Fill under line
    const grad=ctx.createLinearGradient(0,toY(maxV),0,H-PAD_B);
    grad.addColorStop(0,'rgba(197,165,114,0.18)');grad.addColorStop(1,'rgba(197,165,114,0)');
    ctx.beginPath();ctx.moveTo(toX(0),H-PAD_B);
    pts.forEach((p,i)=>ctx.lineTo(toX(i),toY(p.krw)));
    ctx.lineTo(toX(pts.length-1),H-PAD_B);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    // Line
    ctx.beginPath();ctx.strokeStyle='#C5A572';ctx.lineWidth=2;ctx.lineJoin='round';ctx.setLineDash([]);
    pts.forEach((p,i)=>i===0?ctx.moveTo(toX(i),toY(p.krw)):ctx.lineTo(toX(i),toY(p.krw)));
    ctx.stroke();
    // Latest point dot
    const last=pts[pts.length-1];const lx=toX(pts.length-1);const ly=toY(last.krw);
    ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fillStyle='#E3C187';ctx.fill();
  },[tf,unit,krwRate,isMobile]);

  // OHLC for current month (last data point vs previous)
  const latest = MONTHLY_DATA_2000[MONTHLY_DATA_2000.length-1];
  const prev   = MONTHLY_DATA_2000[MONTHLY_DATA_2000.length-2];
  const m = unitMultiplier[unit];
  const latestKRW = latest[2]*latest[3]*m;
  const prevKRW   = prev[2]*prev[3]*m;
  const chg = latestKRW - prevKRW;
  const chgPct = (chg/prevKRW*100).toFixed(2);
  const fKRWn = v => v>=1000000 ? `₩${(v/1000000).toFixed(2)}M` : `₩${Math.round(v).toLocaleString('ko-KR')}`;

  return (
    <div>
      {/* Controls row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:12 }}>
        {/* Timeframe */}
        <div style={{ display:'flex', gap:3 }}>
          {['1Y','3Y','5Y','ALL'].map(t => (
            <button key={t} onClick={()=>setTf(t)} style={{ background:tf===t?'rgba(197,165,114,0.15)':'transparent', border:`1px solid ${tf===t?'#c5a572':'#333'}`, color:tf===t?'#c5a572':'#555', padding:'4px 10px', fontFamily:MONO_GT, fontSize:10, cursor:'pointer', transition:'all 0.15s' }}>{t}</button>
          ))}
        </div>
        {/* Unit */}
        <div style={{ display:'flex', gap:3 }}>
          {['oz','gram','100g','kg'].map(u => (
            <button key={u} onClick={()=>setUnit(u)} style={{ background:unit===u?'rgba(197,165,114,0.15)':'transparent', border:`1px solid ${unit===u?'#c5a572':'#333'}`, color:unit===u?'#c5a572':'#555', padding:'4px 9px', fontFamily:MONO_GT, fontSize:9, cursor:'pointer', transition:'all 0.15s' }}>{unitLabel[u]}</button>
          ))}
        </div>
      </div>
      {/* OHLC bar */}
      <div style={{ display:'flex', gap:isMobile?8:20, flexWrap:'wrap', marginBottom:10, padding:'8px 12px', background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.1)' }}>
        {[
          { l:ko?'기준월 종가':'Month-end', v:fKRWn(latestKRW), c:'#f5f0e8', big:true },
          { l:`$${(latest[2]*m).toFixed(unit==='oz'?2:4)}`, v:ko?'USD 기준':'USD ref', c:'#8a7d6b' },
          { l:ko?'전월 대비':'vs prev mo', v:`${chg>=0?'+':''}${fKRWn(chg)}`, c:chg>=0?'#4ade80':'#f87171' },
          { l:ko?'변동률':'Change', v:`${chgPct>=0?'+':''}${chgPct}%`, c:chg>=0?'#4ade80':'#f87171' },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:'center', minWidth:70 }}>
            <div style={{ fontFamily:MONO_GT, fontSize:s.big?18:13, color:s.c, fontWeight:s.big?700:500 }}>{s.v}</div>
            <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#555', marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%' }}/>
      <div style={{ fontFamily:MONO_GT, fontSize:8, color:'rgba(197,165,114,0.2)', marginTop:5 }}>
        {ko?'* LBMA 월평균 현물가 기준 · 원/달러 월평균 적용':'* LBMA monthly avg spot · Bank of Korea KRW/USD monthly avg'}
      </div>
    </div>
  );
}

// ─── PersonalConverter — "I have ₩X, how much gold is that?" ─────────────────
function PersonalConverter({ prices, krwRate, lang, isMobile }) {
  const [input, setInput] = useState(5000000);
  const ko = lang === 'ko';
  const ppg   = prices.gold * krwRate / OZ_IN_GRAMS;
  const aurumG = input / (ppg * (1+AURUM_GOLD_PREMIUM));
  const spotG  = input / ppg;
  const kreatG = input / (ppg * (1+KR_GOLD_PREMIUM));
  const fG = v => `${v.toFixed(3)}g (${(v/OZ_IN_GRAMS).toFixed(4)} oz)`;
  return (
    <div style={{ background:'#0d0b07', border:'1px solid rgba(197,165,114,0.12)', padding:isMobile?'16px':'22px', marginTop:24 }}>
      <div style={{ fontFamily:MONO_GT, fontSize:10, color:'#8a7d6b', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:14 }}>
        {ko?'내 금액으로 금 계산기':'Personal gold calculator'}
      </div>
      <div style={{ fontFamily:MONO_GT, fontSize:isMobile?20:26, color:'#f5f0e8', fontWeight:700, marginBottom:8 }}>
        ₩{Math.round(input/10000).toLocaleString('ko-KR')}만원
      </div>
      <input type="range" min="1000000" max="100000000" step="500000" value={input}
        style={{ width:'100%', marginBottom:16, minHeight:44 }} onChange={e=>setInput(+e.target.value)}/>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:8 }}>
        {[
          { l:ko?'Aurum으로 구매 시':'Via Aurum',         g:aurumG, c:'#c5a572', highlight:true },
          { l:ko?'LBMA 현물가 기준':'At LBMA spot',       g:spotG,  c:'#8a7d6b' },
          { l:ko?'국내 소매 추정치':'Korea retail est.', g:kreatG, c:'#f87171' },
        ].map((item,i) => (
          <div key={i} style={{ background:item.highlight?'rgba(197,165,114,0.08)':'#111', border:`1px solid ${item.highlight?'rgba(197,165,114,0.25)':'#222'}`, padding:'12px 14px' }}>
            <div style={{ fontFamily:SANS_GT, fontSize:11, color:item.c, marginBottom:6 }}>{item.l}</div>
            <div style={{ fontFamily:MONO_GT, fontSize:isMobile?13:15, color:item.c, fontWeight:item.highlight?700:500 }}>{fG(item.g)}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#3a3028', marginTop:8 }}>
        {ko?'* 국내 소매가는 모델 추정치입니다 (VAT 포함)':'* Korea retail is a model estimate (incl. VAT)'}
      </div>
    </div>
  );
}

// ─── GoldSilverRatio — adapted from FoundersPromoPage RatioWidget ─────────────
function GoldSilverRatio({ prices, lang, isMobile }) {
  const ko = lang === 'ko';
  const gold   = prices?.gold   || 3342;
  const silver = prices?.silver || 32.9;
  const ratio  = (gold/silver).toFixed(1);
  const histData = [68,72,76,85,80,88,92,85,80,78,Number(ratio)];
  const maxH = Math.max(...histData);
  const undervalued = Number(ratio) > 80;
  return (
    <div style={{ background:T.bgCard||'#161309', border:'1px solid rgba(197,165,114,0.2)' }}>
      <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(197,165,114,0.08)' }}>
        <span style={{ fontFamily:MONO_GT, fontSize:9, color:'#8a7d6b', letterSpacing:'0.2em', textTransform:'uppercase' }}>📊 {ko?'금/은 비율':'Gold/Silver Ratio'}</span>
      </div>
      <div style={{ padding:isMobile?'14px':'20px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:10 }}>
          <span style={{ fontFamily:SERIF_GT, fontStyle:'italic', fontSize:48, color:'#C5A572', lineHeight:1 }}>{ratio}</span>
          <div>
            <div style={{ fontFamily:MONO_GT, fontSize:10, color:'#555' }}>oz gold / oz silver</div>
            <div style={{ fontFamily:SANS_GT, fontSize:12, color:undervalued?'#4ade80':'#8a7d6b' }}>
              {undervalued?(ko?'은 역사적 저평가':'Silver undervalued'):(ko?'정상 범위':'Normal range')}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:40, marginBottom:10 }}>
          {histData.map((v,i) => {
            const h=((v-60)/(maxH-60))*100;
            return <div key={i} style={{ flex:1, background:i===histData.length-1?'#C5A572':'rgba(197,165,114,0.25)', height:`${Math.max(h,8)}%`, transition:'height 0.3s' }}/>;
          })}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
          {[{l:ko?'20년 평균':'20yr avg',v:'68x'},{l:ko?'지금':'Now',v:`${ratio}x`,g:true},{l:ko?'역대 최고':'ATH',v:'126x'}].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.g?'rgba(197,165,114,0.3)':'#222'}`, padding:'8px', textAlign:'center' }}>
              <div style={{ fontFamily:MONO_GT, fontSize:8, color:'#555', marginBottom:2 }}>{s.l}</div>
              <div style={{ fontFamily:MONO_GT, fontSize:14, color:s.g?'#C5A572':'#888', fontWeight:600 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:SANS_GT, fontSize:11, color:'#666', lineHeight:1.7, marginTop:12 }}>
          {ko?`금/은 비율이 ${ratio}이면 금 1온스를 은 ${ratio}온스로 교환할 수 있다는 의미입니다. 역사적 평균(68x)보다 높을수록 은이 상대적으로 저평가되어 있다고 볼 수 있습니다.`
            :`A ratio of ${ratio} means 1 oz gold buys ${ratio} oz silver. Above the 20-year average (68x), silver is historically undervalued relative to gold.`}
        </div>
      </div>
    </div>
  );
}

// ─── RealEstateWidget — Seoul apt vs gold (D6: lives on GoldTodayPage) ────────
// Adapted from FoundersPromoPage
function RealEstateVsGold({ prices, krwRate, lang, isMobile }) {
  const ko = lang === 'ko';
  const goldKRW  = prices.gold * krwRate;
  const seoulApt = 1200000000; // ₩1.2B avg
  const ozForApt = (seoulApt/goldKRW).toFixed(1);
  const kgForApt = ((seoulApt/goldKRW)*OZ_IN_GRAMS/1000).toFixed(2);
  const returns = [
    { label:ko?'금 (KRW 환산)':'Gold (KRW)',  val:'+394%', color:'#C5A572' },
    { label:ko?'서울 아파트':'Seoul Apt',     val:'+180%', color:'#f87171'  },
    { label:ko?'코스피':'KOSPI',              val:'+45%',  color:'#60a5fa'  },
    { label:ko?'은행 예금':'Bank deposit',    val:'+25%',  color:'#555'     },
  ];
  return (
    <div style={{ background:'#0d0b07', border:'1px solid rgba(197,165,114,0.15)', padding:isMobile?'16px':'22px' }}>
      <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#8a7d6b', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>
        🏘 {ko?'서울 아파트 vs 금 · 2014→2024':'Seoul Apt vs Gold · 2014→2024'}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'14px', textAlign:'center' }}>
          <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#f87171', letterSpacing:'0.1em', marginBottom:6 }}>{ko?'서울 평균 아파트':'Seoul Avg Apt'}</div>
          <div style={{ fontFamily:MONO_GT, fontSize:22, color:'#f87171', fontWeight:700 }}>₩1.2B</div>
          <div style={{ fontFamily:SANS_GT, fontSize:10, color:'#555', marginTop:4 }}>{ko?'취득세 포함':'incl. acquisition tax'}</div>
        </div>
        <div style={{ background:'rgba(197,165,114,0.06)', border:'1px solid rgba(197,165,114,0.22)', padding:'14px', textAlign:'center' }}>
          <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#c5a572', letterSpacing:'0.1em', marginBottom:6 }}>{ko?'동일 가치 금':'Same in Gold'}</div>
          <div style={{ fontFamily:MONO_GT, fontSize:22, color:'#c5a572', fontWeight:700 }}>{ozForApt}oz</div>
          <div style={{ fontFamily:SANS_GT, fontSize:10, color:'#888', marginTop:4 }}>{kgForApt} kg · SG vault</div>
        </div>
      </div>
      <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#555', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>{ko?'10년 수익률 비교 (2014→2024)':'10-year return comparison'}</div>
      {returns.map((r,i)=>(
        <div key={i} style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontFamily:SANS_GT, fontSize:12, color:'#888' }}>{r.label}</span>
            <span style={{ fontFamily:MONO_GT, fontSize:12, color:r.color, fontWeight:600 }}>{r.val}</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,0.04)' }}>
            <div style={{ height:'100%', width:`${parseInt(r.val)/4}%`, background:r.color, opacity:0.7, transition:'width 0.6s ease' }}/>
          </div>
        </div>
      ))}
      <div style={{ fontFamily:MONO_GT, fontSize:8, color:'#3a3028', marginTop:8 }}>
        {ko?'* 수익률은 USD/KRW 기준 개략 추정치. 실제 결과와 다를 수 있습니다.':'* Returns are approximate estimates. Actual results may differ.'}
      </div>
    </div>
  );
}

// ─── SilverSection — compact silver block ────────────────────────────────────
function SilverSection({ prices, krwRate, lang, isMobile }) {
  const ko = lang === 'ko';
  const silver = prices?.silver || 32.9;
  const silverKRW = silver * krwRate;
  const silverPerG = silverKRW / OZ_IN_GRAMS;
  const silverPerKg = silverPerG * 1000;
  const aurumSilverPerG = silver * (1+AURUM_SILVER_PREMIUM) * krwRate / OZ_IN_GRAMS;
  return (
    <div style={{ borderTop:'1px solid rgba(125,211,220,0.1)', paddingTop:40, marginTop:40 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ width:3, height:24, background:'rgba(125,211,220,0.6)' }}/>
        <span style={{ fontFamily:MONO_GT, fontSize:10, color:'rgba(125,211,220,0.7)', letterSpacing:'0.18em', textTransform:'uppercase' }}>XAG · {ko?'은시세 오늘':'SILVER PRICE TODAY'}</span>
      </div>
      {/* Price strip */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:8, marginBottom:24 }}>
        {[
          { l:ko?'은 현물가 (USD/oz)':'Silver spot (USD/oz)',  v:`$${silver.toFixed(2)}`,                  c:'#7dd3dc' },
          { l:ko?'원화 환산 (1 oz)':'KRW (1 oz)',              v:`₩${Math.round(silverKRW).toLocaleString('ko-KR')}`, c:'#7dd3dc' },
          { l:ko?'1 그램':'Per gram',                          v:`₩${Math.round(silverPerG).toLocaleString('ko-KR')}`, c:'rgba(125,211,220,0.7)' },
          { l:ko?'1 킬로그램':'Per kilogram',                   v:`₩${Math.round(silverPerKg).toLocaleString('ko-KR')}`, c:'rgba(125,211,220,0.7)' },
        ].map((s,i)=>(
          <div key={i} style={{ background:'rgba(125,211,220,0.04)', border:'1px solid rgba(125,211,220,0.12)', padding:'12px 14px' }}>
            <div style={{ fontFamily:SANS_GT, fontSize:10, color:'rgba(125,211,220,0.5)', marginBottom:5 }}>{s.l}</div>
            <div style={{ fontFamily:MONO_GT, fontSize:15, color:s.c, fontWeight:600 }}>{s.v}</div>
          </div>
        ))}
      </div>
      {/* Silver context */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16 }}>
        <div>
          <div style={{ fontFamily:SANS_GT, fontSize:13, color:'rgba(125,211,220,0.6)', fontWeight:600, marginBottom:8 }}>{ko?'왜 지금 은인가?':'Why silver now?'}</div>
          <div style={{ fontFamily:SANS_GT, fontSize:13, color:'#888', lineHeight:1.8, marginBottom:12 }}>
            {ko?'Silver Institute 데이터에 따르면 글로벌 은 시장은 2021년부터 4년 연속 구조적 공급 부족 상태입니다. 태양광 패널, 전기차 배터리, 반도체 등 산업 수요는 증가하는 반면 공급은 제한적입니다. 금/은 비율이 역사적 평균(68x) 대비 높을수록 은의 상대적 저평가 가능성이 있습니다.'
              :'According to the Silver Institute, global silver has been in structural deficit for 4 consecutive years since 2021. Industrial demand from solar panels, EVs, and semiconductors continues to grow while supply remains constrained.'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { l:ko?'4년 연속 공급 부족':'4yr supply deficit', v:ko?'Silver Institute':'Silver Institute', c:'rgba(125,211,220,0.7)' },
              { l:ko?'Aurum 가격 (1g)':'Aurum (1g)',          v:`₩${Math.round(aurumSilverPerG).toLocaleString('ko-KR')}`, c:'rgba(125,211,220,0.7)' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'rgba(125,211,220,0.04)', border:'1px solid rgba(125,211,220,0.1)', padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:SANS_GT, fontSize:9, color:'rgba(125,211,220,0.4)', marginBottom:4 }}>{s.l}</div>
                <div style={{ fontFamily:MONO_GT, fontSize:12, color:s.c, fontWeight:600 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Silver mini bar chart — deficit visualization */}
        <div style={{ background:'rgba(125,211,220,0.03)', border:'1px solid rgba(125,211,220,0.08)', padding:'16px' }}>
          <div style={{ fontFamily:MONO_GT, fontSize:9, color:'rgba(125,211,220,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>{ko?'글로벌 은 수급 (백만 oz)':'Global silver supply/demand (Moz)'}</div>
          {[
            { year:2021, supply:829, demand:896, deficit:-67 },
            { year:2022, supply:843, demand:1220, deficit:-237 },
            { year:2023, supply:853, demand:1167, deficit:-176 },
            { year:2024, supply:858, demand:1219, deficit:-215 },
          ].map((row,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontFamily:MONO_GT, fontSize:9, color:'#555', width:32, flexShrink:0 }}>{row.year}</span>
              <div style={{ flex:1, height:16, background:'rgba(255,255,255,0.04)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${(row.supply/1300)*100}%`, background:'rgba(125,211,220,0.3)' }}/>
                <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${(row.demand/1300)*100}%`, background:'transparent', borderRight:'2px solid rgba(248,113,113,0.6)' }}/>
              </div>
              <span style={{ fontFamily:MONO_GT, fontSize:9, color:'#f87171', width:44, textAlign:'right', flexShrink:0 }}>{row.deficit}M</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:12, marginTop:8, fontFamily:MONO_GT, fontSize:8, color:'#444' }}>
            <span style={{ color:'rgba(125,211,220,0.5)' }}>━ {ko?'공급':'supply'}</span>
            <span style={{ color:'rgba(248,113,113,0.5)' }}>| {ko?'수요':'demand'}</span>
            <span style={{ color:'#f87171' }}>△ {ko?'부족분':'deficit'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GoldTodayPage — main export ─────────────────────────────────────────────
export function GoldTodayPage({ lang, navigate, prices = { gold:3342.80, silver:32.90 }, krwRate = 1368 }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const goldKRW     = prices.gold * krwRate;
  const goldAurumG  = prices.gold * (1+AURUM_GOLD_PREMIUM) * krwRate / OZ_IN_GRAMS;
  const goldKRG     = prices.gold * (1+KR_GOLD_PREMIUM) * krwRate / OZ_IN_GRAMS;
  const kimchiPrem  = (KR_GOLD_PREMIUM - AURUM_GOLD_PREMIUM) / (1+KR_GOLD_PREMIUM) * 100; // structural model
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:T.bg||'#0d0b08', minHeight:'100vh' }}>

      {/* ── Hero strip: 4 live metrics ── */}
      <div style={{ background:'#111', borderBottom:'1px solid rgba(197,165,114,0.1)', padding:`${isMobile?14:18}px 0` }}>
        <div className="aurum-container">
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:0 }}>
            {[
              { l:'XAU/USD', v:`$${prices.gold.toFixed(2)}`, c:'#C5A572', big:true },
              { l:ko?'금 1온스 (원화)':'1 oz gold (KRW)',   v:fKRW2(goldKRW), c:'#f5f0e8' },
              { l:ko?'Aurum 매입가 (1g)':'Aurum price (1g)', v:fKRW2(goldAurumG), c:'#c5a572' },
              { l:ko?'국내 소매 프리미엄 추정':'Est. domestic premium', v:`~${kimchiPrem.toFixed(1)}%`, c:'#f87171', tip:true },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center', padding:isMobile?'10px 8px':'14px 16px', borderRight:!isMobile&&i<3?'1px solid rgba(197,165,114,0.06)':'none', borderBottom:isMobile&&i<2?'1px solid rgba(197,165,114,0.06)':'none' }}>
                <div style={{ fontFamily:MONO_GT, fontSize:isMobile?18:22, color:s.c, fontWeight:700 }}>{s.v}</div>
                <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#555', marginTop:3, letterSpacing:'0.1em' }}>{s.l}</div>
                {s.tip && <div style={{ fontFamily:MONO_GT, fontSize:8, color:'#3a3028', marginTop:2 }}>{ko?'모델 추정':'model est.'}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="aurum-container" style={{ paddingTop:isMobile?28:56, paddingBottom:isMobile?28:80 }}>

        {/* ── Page heading ── */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#8a7d6b', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:24, height:1, background:'#c5a572' }}/>
            {ko?'금시세 오늘 · GOLD TODAY':'Gold Today · 금시세'}
            <div style={{ width:24, height:1, background:'#c5a572' }}/>
          </div>
          <h1 style={{ fontFamily:ko?T.serifKrDisplay:T.serif, fontSize:isMobile?28:42, fontWeight:300, color:'#f5f0e8', margin:'0 0 8px', lineHeight:1.15 }}>
            {ko?<>금시세 오늘 — <span style={{ color:'#C5A572', fontStyle:'italic' }}>실시간 확인</span></> : <>Gold price today — <span style={{ color:'#C5A572', fontStyle:'italic' }}>live</span></>}
          </h1>
          <p style={{ fontFamily:ko?T.sansKr:T.sans, fontSize:14, color:'#888', lineHeight:1.8, maxWidth:600 }}>
            {ko?'LBMA 국제 현물가 기반 월평균 데이터. 원화 환산 포함. 김치프리미엄 — 국내 소매가와 국제 현물가의 구조적 격차.'
              :'LBMA international spot price — monthly averages with KRW conversion. Includes kimchi premium — the structural gap between Korean domestic retail and international spot.'}
          </p>
        </div>

        {/* ── Main price chart ── */}
        <div style={{ background:'#0d0b07', border:'1px solid rgba(197,165,114,0.12)', padding:isMobile?'16px':'24px', marginBottom:32, position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#c5a572,transparent)', pointerEvents:'none' }}/>
          <div style={{ fontFamily:MONO_GT, fontSize:10, color:'#8a7d6b', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>
            {ko?'금 가격 (원화 기준) · KRW 차트':'Gold price in KRW · chart'}
          </div>
          <GoldPriceChart lang={lang} isMobile={isMobile} krwRate={krwRate}/>
        </div>

        {/* ── Personal converter ── */}
        <PersonalConverter prices={prices} krwRate={krwRate} lang={lang} isMobile={isMobile}/>

        {/* ── Gold/Silver ratio + Real estate ── */}
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16, marginTop:32 }}>
          <GoldSilverRatio prices={prices} lang={lang} isMobile={isMobile}/>
          <RealEstateVsGold prices={prices} krwRate={krwRate} lang={lang} isMobile={isMobile}/>
        </div>

        {/* ── Why gold now — 3 stats ── */}
        <div style={{ marginTop:32, padding:isMobile?'18px':'24px', background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.1)' }}>
          <div style={{ fontFamily:MONO_GT, fontSize:9, color:'#8a7d6b', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:16 }}>{ko?'왜 지금 금인가':'Why gold, why now'}</div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12 }}>
            {[
              { n:ko?'중앙은행 매입':'CB buying',   v:ko?'13년 최고':'13yr high',    c:'#C5A572', d:ko?'전 세계 중앙은행 2023-24 기록적 매입':'Record central bank buying 2023-24' },
              { n:ko?'공급 부족':'Supply deficit',   v:ko?'4년 연속':'4 years',      c:'#7dd3dc', d:ko?'글로벌 은 공급 부족 4년 연속','Silver deficit 4 consecutive years' },
              { n:ko?'KRW 약세':'KRW weakness',      v:'+31%',                        c:'#f87171', d:ko?'2020년 대비 원화 약세','KRW weakened vs 2020' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', padding:'14px' }}>
                <div style={{ fontFamily:MONO_GT, fontSize:24, color:s.c, fontWeight:700, marginBottom:4 }}>{s.v}</div>
                <div style={{ fontFamily:MONO_GT, fontSize:10, color:s.c, marginBottom:6, letterSpacing:'0.1em' }}>{s.n}</div>
                <div style={{ fontFamily:ko?T.sansKr:T.sans, fontSize:11, color:'#666', lineHeight:1.65 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AGP CTA ── */}
        <div style={{ marginTop:32, padding:'20px', background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.18)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div>
            <div style={{ fontFamily:ko?T.serifKr:T.serif, fontStyle:'italic', fontSize:16, color:'#f5f0e8', marginBottom:4 }}>
              {ko?'이 격차를 피하는 방법이 있습니다.':'There is a way to avoid this premium.'}
            </div>
            <div style={{ fontFamily:ko?T.sansKr:T.sans, fontSize:13, color:'#888' }}>
              {ko?'AGP — 매달 원화로, LBMA 현물가로. 자동으로.':'AGP — monthly KRW, LBMA spot price. Automatically.'}
            </div>
          </div>
          <button onClick={()=>navigate('agp-intro')} style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'12px 24px', fontFamily:T.sans, fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
            {ko?'AGP 시작하기 →':'Start AGP →'}
          </button>
        </div>

        {/* ── Silver section (D3=A: compact) ── */}
        <SilverSection prices={prices} krwRate={krwRate} lang={lang} isMobile={isMobile}/>

      </div>
    </div>
  );
}
