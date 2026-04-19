import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, useInView, fUSD, fKRW, WHY_GOLD_REASONS, WHY_GOLD_STATS, WHY_SILVER_STATS, WHY_SILVER_REASONS, EDUCATION_ARTICLES, EDUCATION_CATEGORIES, MARKET_FACTS, useNewsData } from '../lib/index.jsx';
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

  // USD/Gold since 1971 — annual data points [year, goldIndexed, usdPowerIndexed]
  // Gold indexed to 100 at 1971 (= $35/oz). USD purchasing power indexed to 100 at 1971.
  const GOLD_HIST = [
    [1971,100,100],[1973,286,86],[1975,460,79],[1977,514,71],[1979,1143,63],
    [1980,1686,57],[1982,1009,52],[1985,906,43],[1987,1097,39],[1990,1094,34],
    [1993,991,31],[1995,1097,28],[1997,977,26],[2000,777,25],[2002,897,23],
    [2005,1466,21],[2007,1943,19],[2008,2486,18],[2010,3500,17],[2011,5063,16],
    [2013,3446,15],[2015,3029,15],[2017,3757,14],[2019,3977,14],[2020,5054,14],
    [2022,5143,12],[2023,5543,11],[2024,6571,10],[2025,9429,10],
  ];

  // USD/Gold chart canvas component inline
  const USD_GOLD_REF = useRef(null);
  const [usdGoldVis, setUsdGoldVis] = useState(false);
  const usdGoldContainerRef = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setUsdGoldVis(true); }, { threshold: 0.05 });
    if (usdGoldContainerRef.current) obs.observe(usdGoldContainerRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!usdGoldVis || !USD_GOLD_REF.current) return;
    const canvas = USD_GOLD_REF.current;
    const W = canvas.offsetWidth || 640; const H = canvas.height;
    canvas.width = W;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const PAD = { top:20, right:16, bottom:32, left:56 };
    const CW = W - PAD.left - PAD.right; const CH = H - PAD.top - PAD.bottom;
    const allG = GOLD_HIST.map(d => d[1]);
    const allU = GOLD_HIST.map(d => d[2]);
    const maxV = Math.max(...allG) * 1.04;
    const minV = 0;
    const toX = i => PAD.left + (i / (GOLD_HIST.length - 1)) * CW;
    const toY = v => PAD.top + CH - ((v - minV) / (maxV - minV)) * CH;
    // Grid
    [100, 1000, 3000, 6000, 9000].forEach(v => {
      if (v > maxV) return;
      const y = toY(v);
      ctx.strokeStyle = v === 100 ? 'rgba(197,165,114,0.18)' : 'rgba(197,165,114,0.06)';
      ctx.lineWidth = v === 100 ? 1 : 0.5; ctx.setLineDash(v===100?[]:[3,3]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W-PAD.right, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(197,165,114,0.4)'; ctx.font = "9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'right'; ctx.fillText(v===100?'Base':v>999?(v/1000)+'K':v, PAD.left-4, y+3);
    });
    // Decade markers
    GOLD_HIST.forEach((d, i) => {
      if (d[0] % 10 === 0 || d[0] === 1971 || d[0] === 2025) {
        ctx.fillStyle = d[0] >= 2022 ? 'rgba(197,165,114,0.7)' : 'rgba(138,125,107,0.4)';
        ctx.font = `${isMobile?8:9}px 'JetBrains Mono',monospace`; ctx.textAlign = 'center';
        ctx.fillText(d[0], toX(i), H-6);
        ctx.strokeStyle = 'rgba(197,165,114,0.04)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(toX(i), PAD.top); ctx.lineTo(toX(i), PAD.top+CH); ctx.stroke();
      }
    });
    // USD power line (fill + line) — red
    const usdPts = allU.map((v, i) => ({ x: toX(i), y: toY(v * maxV / 100) }));
    const usdGrad = ctx.createLinearGradient(0, 0, 0, H);
    usdGrad.addColorStop(0, 'rgba(248,113,113,0.15)'); usdGrad.addColorStop(1, 'rgba(248,113,113,0)');
    ctx.beginPath(); ctx.moveTo(usdPts[0].x, PAD.top+CH);
    usdPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(usdPts[usdPts.length-1].x, PAD.top+CH);
    ctx.closePath(); ctx.fillStyle = usdGrad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = 'rgba(248,113,113,0.6)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    usdPts.forEach((p, i) => i===0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke();
    // Gold line (fill + line) — gold
    const goldPts = allG.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const goldGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top+CH);
    goldGrad.addColorStop(0, 'rgba(197,165,114,0.22)'); goldGrad.addColorStop(1, 'rgba(197,165,114,0)');
    ctx.beginPath(); ctx.moveTo(goldPts[0].x, PAD.top+CH);
    goldPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(goldPts[goldPts.length-1].x, PAD.top+CH);
    ctx.closePath(); ctx.fillStyle = goldGrad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#C5A572'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    goldPts.forEach((p, i) => i===0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke();
    // End dots
    const lg = goldPts[goldPts.length-1];
    ctx.beginPath(); ctx.arc(lg.x, lg.y, 4, 0, Math.PI*2); ctx.fillStyle = '#E3C187'; ctx.fill();
    const lu = usdPts[usdPts.length-1];
    ctx.beginPath(); ctx.arc(lu.x, lu.y, 3, 0, Math.PI*2); ctx.fillStyle = '#f87171'; ctx.fill();
    // 1971 baseline label
    ctx.fillStyle = 'rgba(197,165,114,0.5)'; ctx.font = "9px 'JetBrains Mono',monospace"; ctx.textAlign = 'left';
    ctx.fillText('1971 = 100', PAD.left+4, toY(100)-5);
  }, [usdGoldVis, lang, isMobile]);

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

      {/* ── HERO — 금 전략: thesis-first ── */}
      <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg, #0a0a0a 0%, #111008 50%, #0a0a0a 100%)', borderBottom:`1px solid ${T.goldBorder}` }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'linear-gradient(rgba(197,165,114,1) 1px,transparent 1px),linear-gradient(90deg,rgba(197,165,114,1) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', right:'15%', width:500, height:500, background:'radial-gradient(ellipse, rgba(197,165,114,0.12) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 100, paddingBottom: isMobile ? 48 : 100, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:32, height:1, background:T.gold }} />
            <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.gold, letterSpacing:'0.04em' }}>금 전략 · Gold Strategy</span>
            <span style={{ color:T.goldDim }}>·</span>
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase' }}>2026</span>
          </div>
          <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: isMobile ? 38 : 'clamp(42px,6vw,68px)', fontWeight:300, color:T.text, margin:'0 0 24px', lineHeight:1.05 }}>
            {ko ? <>중앙은행이 금을 사고 있습니다.<br /><span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic', fontWeight:300 }}>당신의 전략은 무엇입니까?</span></> : <>Central banks are buying gold.<br /><span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic', fontWeight:300 }}>What is your strategy?</span></>}
          </h1>
          <p style={{ fontFamily:T.sans, fontSize: isMobile ? 15 : 17, color:T.textSub, lineHeight:1.85, maxWidth:560, marginBottom:36 }}>
            {ko ? '1971년 브레튼우즈 이후 달러 기반 통화 시스템이 서서히 금으로 재편되고 있습니다. 이 전환을 가장 먼저 인식한 기관들은 중앙은행입니다 — 그들이 행동하고 있습니다.' : 'Since Bretton Woods ended in 1971, the dollar-based monetary system has been slowly rearchitecting toward gold. The institutions that recognized this first are central banks — and they are acting on it.'}
          </p>
          {/* CB signal strip + key stats */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:1, background:T.goldBorder }}>
            {[
              { val:'1,045t',  lbl: ko?'2024 중앙은행 순매입':'2024 CB net purchase',  color:'#4ade80' },
              { val:'94×',     lbl: ko?'금: 1971년 이후 상승':'Gold since 1971',       color:T.gold    },
              { val:'-86%',    lbl: ko?'USD 구매력 1971 이후':'USD power since 1971',  color:'#f87171' },
              { val:'+394%',   lbl: ko?'10년 KRW 기준 수익률':'10yr KRW return',       color:T.gold    },
            ].map((s,i) => (
              <div key={i} style={{ background:'#0d0b08', padding: isMobile?'14px 12px':'18px 20px', textAlign:'center' }}>
                <div style={{ fontFamily:T.mono, fontSize: isMobile?18:24, color:s.color, fontWeight:700, marginBottom:4 }}>{s.val}</div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, letterSpacing:'0.12em', textTransform:'uppercase' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── USD vs GOLD SINCE 1971 — the monetary argument ── */}
      <div ref={usdGoldContainerRef} style={{ borderBottom:`1px solid ${T.border}`, background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:72, paddingBottom: isMobile?32:64 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
            <div>
              <div style={{ fontFamily:T.mono, fontSize:9, color:'rgba(197,165,114,0.5)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:10 }}>
                {ko ? '달러 vs 금 · 1971년 = 100 인덱스' : 'Dollar vs Gold · 1971 = 100 Index'}
              </div>
              <h2 style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?24:36, color:T.text, fontWeight:300, margin:0 }}>
                {ko ? <>달러는 금을 이길 수 없습니다.<br /><span style={{ color:'#f87171' }}>1971년 이후 단 한 번도.</span></> : <>The dollar cannot beat gold.<br /><span style={{ color:'#f87171' }}>Not once since 1971.</span></>}
              </h2>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3,1fr)', gap:10, marginBottom:24 }}>
            {[
              { label:ko?'금 (1971→2025)':'Gold (1971→2025)', val:'9,429', sub:ko?'100에서 시작, 94배':'From 100 to 9,429', color:'#C5A572' },
              { label:ko?'달러 구매력 손실':'Dollar Power Lost', val:'-86%', sub:ko?'같은 기간 소비재 기준':'Same period, goods basket', color:'#f87171' },
              { label:ko?'브레튼우즈 종료':'Bretton Woods End', val:'1971', sub:ko?'금-달러 고정 해제':'Gold-dollar peg ended', color:'rgba(197,165,114,0.5)' },
            ].map((s, i) => (
              <div key={i} style={{ background:'rgba(197,165,114,0.03)', border:`1px solid ${i===0?'rgba(197,165,114,0.2)':i===1?'rgba(248,113,113,0.15)':'rgba(197,165,114,0.08)'}`, padding:'16px 18px' }}>
                <div style={{ fontFamily:T.sans, fontSize:11, color:T.textMuted, marginBottom:6 }}>{s.label}</div>
                <div style={{ fontFamily:T.mono, fontSize:isMobile?22:26, color:s.color, fontWeight:700 }}>{s.val}</div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:'#444', marginTop:4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#080806', border:'1px solid rgba(197,165,114,0.08)', padding:'16px 8px 8px' }}>
            <canvas ref={USD_GOLD_REF} height={isMobile?180:240} style={{ display:'block', width:'100%' }} />
          </div>
          <div style={{ display:'flex', gap:20, marginTop:10, flexWrap:'wrap' }}>
            <span style={{ fontFamily:T.mono, fontSize:9, color:'rgba(197,165,114,0.65)' }}>— {ko?'금 (USD 기준, 인덱스)':'Gold (USD, indexed)'}</span>
            <span style={{ fontFamily:T.mono, fontSize:9, color:'rgba(248,113,113,0.55)' }}>— {ko?'달러 구매력 (인덱스)':'USD purchasing power (indexed)'}</span>
            <span style={{ fontFamily:T.mono, fontSize:9, color:'#444' }}>* {ko?'LBMA 연간 종가 · US CPI 기준':'LBMA annual close · US CPI basis'}</span>
          </div>
          <p style={{ fontFamily:T.sans, fontSize:13, color:'#555', lineHeight:1.75, marginTop:12, maxWidth:680 }}>
            {ko ? '달러는 시스템 내에서 상대적으로 강할 수 있습니다. 그러나 금은 시스템 밖에 있습니다. 브레튼우즈 이후 54년, 금은 달러 대비 94배 상승했습니다. 이것은 단순한 자산 가격 상승이 아닙니다 — 기축통화의 구매력 손실이 금 가격에 반영된 것입니다.' : 'The dollar can be relatively strong within the system. But gold is outside the system. Since Bretton Woods ended 54 years ago, gold has risen 94x against the dollar. This is not merely asset price appreciation — it is the loss of reserve currency purchasing power manifested in gold\'s price.'}
          </p>
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
            {ko ? '전략을 실행하십시오' : 'Execute the Strategy'}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginBottom: 28, lineHeight: 1.9 }}>
            {ko ? "중앙은행의 전략을 — 귀하의 원화로. 국제 현물가, 완전 배분 보관, 싱가포르 금고." : "The central bank strategy — in your KRW. International spot, fully allocated, Singapore vault."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <button onClick={() => navigate('agp')} className="btn-primary" style={{ minWidth: 200, flex: 1, padding: '16px 36px', fontSize: 15 }}>
              {ko ? <><span style={{ fontFamily: T.serif, fontStyle: 'italic' }}>GoldPath</span> 시작하기 →</> : <>Start <span style={{ fontFamily: T.serif, fontStyle: 'italic' }}>GoldPath</span> →</>}
            </button>
            <button onClick={() => navigate('shop-physical')} className="btn-outline" style={{ minWidth: 180, flex: 1, padding: '16px 36px', fontSize: 15 }}>{ko ? '실물 금·은 구매' : 'Buy Physical Gold & Silver'}</button>
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

/* ── AGP Launch Estimator sub-component (extracted to fix React hook violation) ── */
function AGPLaunchEstimator({ ko, isMobile, navigate }) {
  const SPOT_KRW_G = 452000;
  const AURUM_UP   = 0.02;
  const KR_MULT    = 1.20;
  const TIERS = [
    { name:'브론즈', nameEn:'Bronze', min:200000,  gift:'₩50K',  giftVal:50000   },
    { name:'실버',   nameEn:'Silver', min:500000,  gift:'₩150K', giftVal:150000  },
    { name:'골드',   nameEn:'Gold',   min:1000000, gift:'₩400K', giftVal:400000, featured:true },
    { name:'플래티넘',nameEn:'Plat.', min:2000000, gift:'₩1M',   giftVal:1000000 },
    { name:'소브린', nameEn:'Sov.',   min:5000000, gift:'₩5M',   giftVal:5000000 },
  ];
  const [monthly, setMonthly] = useState(1000000);
  const aurumUnit = SPOT_KRW_G * (1 + AURUM_UP);
  const grams     = monthly / aurumUnit;
  const krCost    = grams * SPOT_KRW_G * KR_MULT;
  const tier      = TIERS.slice().reverse().find(t => monthly >= t.min) || TIERS[0];
  const fmt       = n => Math.round(n).toLocaleString('ko-KR');
  return (
    <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:16 }}>
      {/* Estimator */}
      <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding: isMobile?'20px 16px':'28px' }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>AGP LAUNCH ESTIMATOR</div>
        <div style={{ fontFamily:T.mono, fontSize: isMobile?24:28, fontWeight:700, color:T.text, marginBottom:4 }}>₩{fmt(monthly)}<span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.textSub, marginLeft:6 }}>{ko?'월 적립':'/ month'}</span></div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
          <span style={{ fontFamily:T.mono, fontSize:11, color:T.goldDim, background:T.goldGlow, border:`1px solid ${T.goldBorder}`, padding:'2px 8px' }}>{tier.name} {ko?'티어':'Tier'}</span>
        </div>
        <input type="range" min="200000" max="5000000" step="100000" value={monthly} onChange={e=>setMonthly(+e.target.value)} style={{ width:'100%', accentColor:T.gold, cursor:'pointer', marginBottom:8 }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:T.mono, fontSize:10, color:T.textMuted, marginBottom:20 }}>
          <span>₩200K</span><span>₩1M</span><span>₩2M</span><span>₩3M</span><span>₩5M</span>
        </div>
        {[
          { label:ko?'받게 되실 금':'Metal received', value:`${grams.toFixed(3)}g · ${(grams/31.1).toFixed(4)}oz` },
          { label:ko?'한국 소매 환산':'Korea retail equiv.', value:`₩${fmt(krCost)}` },
        ].map((r,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid rgba(197,165,114,0.08)` }}>
            <span style={{ fontFamily:T.sans, fontSize:12, color:T.textSub }}>{r.label}</span>
            <span style={{ fontFamily:T.mono, fontSize:13, color:T.text }}>{r.value}</span>
          </div>
        ))}
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid rgba(197,165,114,0.3)`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.gold }}>+ {tier.name} Launch Gift</div>
            <div style={{ fontFamily:T.sans, fontSize:11, color:T.textMuted, marginTop:2 }}>{ko?'첫 결제 즉시 실물 금으로 적립':'Credited in physical gold on first payment'}</div>
          </div>
          <div style={{ fontFamily:T.mono, fontSize:22, color:'#E3C187', fontWeight:700 }}>{tier.gift}</div>
        </div>
      </div>
      {/* GMV Growth track */}
      <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding: isMobile?'20px 16px':'28px' }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>GMV GROWTH REWARDS</div>
        <p style={{ fontFamily:T.sansKr, fontSize:13, color:T.textSub, lineHeight:1.9, marginBottom:20 }}>
          {ko?'론치 기프트에 더해, 총 구매액이 성장할수록 추가 금 크레딧이 지급됩니다.':'Beyond the launch gift, bonus gold credits are issued as your cumulative volume grows.'}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:0, position:'relative' }}>
          <div style={{ position:'absolute', left:16, top:10, bottom:10, width:1, background:`linear-gradient(180deg,#c5a572,rgba(197,165,114,0.3))` }} />
          {[
            { gate:'I',  gmvKR:'₩7.2M',  bonus:'+₩50K',    apex:false },
            { gate:'II', gmvKR:'₩21.6M', bonus:'+₩150K',   apex:false },
            { gate:'III',gmvKR:'₩50.4M', bonus:'+₩400K',   apex:true  },
            { gate:'IV', gmvKR:'₩93.6M', bonus:'+₩1,000K', apex:false },
            { gate:'V',  gmvKR:'₩144M',  bonus:'+₩2,500K', apex:false },
          ].map((row,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', alignItems:'center', gap:10, padding:'11px 0', borderBottom:i<4?`1px solid rgba(197,165,114,0.06)`:'none', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ width:10, height:10, background:row.apex?'#c5a572':'#0d0b08', border:`1px solid #c5a572`, transform:'rotate(45deg)', boxShadow:row.apex?`0 0 10px #c5a572`:'none' }} />
              </div>
              <div>
                <span style={{ fontFamily:T.mono, fontSize:11, color:'#c5a572', border:`1px solid rgba(197,165,114,0.3)`, padding:'1px 6px', marginRight:8 }}>GATE {row.gate}</span>
                <span style={{ fontFamily:T.mono, fontSize:12, color:'#f5f0e8' }}>{row.gmvKR}</span>
              </div>
              <div style={{ fontFamily:T.mono, fontSize:14, color:'#4ade80', fontWeight:700 }}>{row.bonus}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <button onClick={() => navigate('agp-intro')} style={{ width:'100%', background:'rgba(197,165,114,0.06)', border:`1px solid rgba(197,165,114,0.3)`, color:'#c5a572', padding:'11px', cursor:'pointer', fontFamily:T.sans, fontSize:13 }}>
            {ko?'AGP 적금 시작하기 →':'Start AGP Plan →'}
          </button>
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
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 13 : 16, color: '#E3C187', letterSpacing: '0.03em', lineHeight:1 }}>GoldPath</span>
                <span style={{ fontFamily: T.mono, fontSize: 8, color: '#7a6d58', letterSpacing: '0.22em', lineHeight:1 }}>금환</span>
              </div>
              <span style={{ color: T.goldDim }}>·</span>
              <span style={{ fontFamily: T.mono, fontSize: isMobile ? 10 : 11, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{ko ? '원화 실물금 전환 플랜' : 'KRW to Physical Gold'}</span>
              {!isMobile && <div style={{ width: 28, height: 1, background: T.gold, flexShrink: 0 }} />}
            </div>
            <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500, color: T.text, margin: '0 0 20px', lineHeight: 1.1 }}>
              {ko ? <>원화를<br /><span style={{ color: T.gold }}>금으로 전환합니다.</span></> : <>Converting KRW<br /><span style={{ color: T.gold }}>into gold.</span></>}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: isMobile ? 14 : 16, color: T.textSub, lineHeight: 1.85, maxWidth: 520, marginBottom: 20 }}>
              {ko ? '중앙은행이 1,045톤을 매입한 자산을 — 매달 원화로, 자동으로 적립하십시오. 100g 도달 시 LBMA 승인 실물 바로 무료 전환. 국제 현물가 + 2% 투명 프리미엄. 언제든 해지 가능.' : 'The asset central banks bought 1,045 tonnes of last year — accumulate it in KRW, automatically. Free conversion to LBMA bar at 100g. International spot + 2% transparent premium. Exit anytime.'}
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
        { value: '+2.0%',       label: ko ? '투명 프리미엄' : 'Transparent premium' },
        { value: ko ? '0원' : '$0', label: ko ? '해지 수수료' : 'Exit fee' },
      ]} cols={isMobile ? 2 : 4} />

      {/* ── LAUNCH ESTIMATOR + GMV GROWTH — near top for immediate hook ── */}
      <div style={{ borderBottom:`1px solid ${T.goldBorder}`, background:`linear-gradient(180deg,${T.goldGlow},${T.bg})` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?28:64, paddingBottom: isMobile?28:64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?20:32 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:10 }}>Launch Estimator + GMV Growth</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?22:34, fontWeight:400, color:T.text }}>
              첫 달, 정확히 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>얼마나 받나요?</span>
            </h2>
          </div>
          {/* Inline estimator widget */}
          <AGPLaunchEstimator ko={ko} isMobile={isMobile} navigate={navigate} />
        </div>
      </div>

      {/* ── HOW IT WORKS — 3 steps, moved here from homepage ── */}
      <div style={{ borderBottom:`1px solid ${T.border}`, background: T.bg }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:64, paddingBottom: isMobile?32:64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?24:40 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
              {ko ? '3단계로 끝납니다' : 'Three steps'}
            </div>
            <h2 style={{ fontFamily: ko?T.serifKrDisplay:T.serif, fontSize:isMobile?26:36, fontWeight:300, color:T.text, margin:0 }}>
              {ko ? <>가입부터 금고까지, <span style={{ color:T.gold, fontStyle:'italic' }}>5분.</span></> : <>Account to vault in <span style={{ color:T.gold, fontStyle:'italic' }}>5 minutes.</span></>}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:12 }}>
            {[
              { n:'STEP 01', t:ko?'신원 확인':'Verify Identity', d:ko?'NICE·KCB 본인인증, 1분 이내 완료. 주민등록증 또는 여권 준비 후 시작하세요. 완료 즉시 구매 가능합니다.':'NICE/KCB identity verification in under 1 minute. Have your Korean ID or passport ready. Purchase enabled immediately.' },
              { n:'STEP 02', t:ko?'구매 또는 적립':'Purchase or Accumulate', d:ko?'토스뱅크 자동이체, 카드, 국제 송금. 원화로 결제, LBMA 국제 현물가로 환산.':'Toss auto-debit, card, or wire. Pay KRW at live LBMA spot.' },
              { n:'STEP 03', t:ko?'싱가포르 금보관 배분':'Singapore Vault Allocation', d:ko?'결제 즉시 Malca-Amit FTZ 금고에 귀하의 명의로 배분. 앱에서 실시간 확인 가능.':'Allocated to your name at Malca-Amit Singapore FTZ vault immediately. Track in the app in real time.' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', borderTop:`2px solid ${T.gold}`, padding:'18px 18px' }}>
                <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.2em', marginBottom:8 }}>{s.n}</div>
                <div style={{ fontFamily:ko?T.serifKr:T.serif, fontSize:17, color:T.text, marginBottom:8 }}>{s.t}</div>
                <div style={{ fontFamily:T.sans, fontSize:13, color:T.goldDim, lineHeight:1.7 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${T.border}` }}>
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
            <button onClick={() => navigate('campaign-agp-launch')} style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '12px 28px', fontFamily: T.sans, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer' }}>
              {ko ? 'AGP 론치 이벤트 보기 →' : 'View AGP Launch Event →'}
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


// ── GoldTodayPage — SEO landing page: 금시세 오늘 · 김치프리미엄 · 해외금 ──────────
export function GoldTodayPage({ lang, navigate, prices, krwRate = 1440 }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const T_loc = T;
  const MONO = "'JetBrains Mono',monospace";
  const SERIF = "'Cormorant Garamond',serif";
  const SANS = "'Pretendard','Outfit',sans-serif";
  const KR_PREM = 0.20;
  const AU_PREM = 0.08;
  const goldUSD = prices?.gold || 3342;
  const goldKR = goldUSD * krwRate * (1 + KR_PREM);
  const goldAU = goldUSD * (1 + AU_PREM) * krwRate;
  const premPct = ((goldKR - goldAU) / goldKR * 100).toFixed(1);
  const fKRW = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  const eyebrow = { fontFamily:MONO, fontSize:10, color:'rgba(197,165,114,0.6)', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:10 };

  return (
    <div style={{ background:T_loc.bg, minHeight:'100vh' }}>
      {/* §1 Live price comparison */}
      <div style={{ background:'linear-gradient(135deg,#0a0a0a,#141414)', borderBottom:'1px solid rgba(197,165,114,0.1)', padding:isMobile?'40px 20px':'72px 0' }}>
        <div className="aurum-container">
          <span style={eyebrow}>{ko?'금시세 오늘 · 실시간 업데이트':'Gold Price Today · Live'}</span>
          <h1 style={{ fontFamily:ko?T_loc.serifKrDisplay:SERIF, fontSize:isMobile?32:52, fontWeight:300, color:'#f5f0e8', margin:'0 0 8px', lineHeight:1.1 }}>
            {ko?<>금시세 오늘 — <span style={{ color:'#c5a572', fontStyle:'italic' }}>김치프리미엄이란?</span></>:'Today\'s Gold Price & the Kimchi Premium'}
          </h1>
          <p style={{ fontFamily:SANS, fontSize:isMobile?14:16, color:'#8a7d6b', lineHeight:1.9, maxWidth:600, margin:'0 0 32px' }}>
            {ko?'국내 금 구매 시 왜 더 비쌀까요? 싱가포르에서 LBMA 현물가로 구매하면 얼마나 절감되는지 실시간으로 확인하세요.':'Why is gold more expensive in Korea? See live how much you save by buying at LBMA spot in Singapore.'}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:12, maxWidth:720 }}>
            {[
              { label:ko?'국제 현물가 (XAU/USD)':'LBMA Spot (XAU/USD)', val:`$${goldUSD.toFixed(2)}`, color:'#c5a572' },
              { label:ko?'국내 소매가 (VAT 포함)':'Korea Retail (incl. VAT)', val:fKRW(goldKR)+'/oz', color:'#f87171' },
              { label:ko?'Aurum 구매가':'Aurum Price', val:fKRW(goldAU)+'/oz', color:'#4ade80' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.12)', padding:'16px 18px' }}>
                <div style={{ fontFamily:MONO, fontSize:10, color:'#555', letterSpacing:'0.1em', marginBottom:6 }}>{s.label}</div>
                <div style={{ fontFamily:MONO, fontSize:isMobile?18:22, color:s.color, fontWeight:700 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', padding:'12px 18px', maxWidth:480, display:'inline-flex', alignItems:'center', gap:10 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#f87171', flexShrink:0 }} />
            <span style={{ fontFamily:MONO, fontSize:13, color:'#f87171', fontWeight:600 }}>
              {ko?`김치프리미엄 현재: +${premPct}%`:`Kimchi Premium Now: +${premPct}%`}
            </span>
          </div>
        </div>
      </div>

      {/* §2 Why is Korean gold expensive? */}
      <div style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', padding:isMobile?'40px 20px':'72px 0' }}>
        <div className="aurum-container" style={{ maxWidth:760 }}>
          <span style={eyebrow}>{ko?'금시장 · 한국 금':'금시장 · 한국 금'}</span>
          <h2 style={{ fontFamily:ko?T_loc.serifKr:SERIF, fontSize:isMobile?26:38, fontWeight:300, color:'#f5f0e8', margin:'0 0 20px' }}>
            {ko?<>왜 국내 금이 <span style={{ color:'#c5a572' }}>비쌀까요?</span></>:'Why Is Korean Gold So Expensive?'}
          </h2>
          {[
            { title:ko?'부가세 10% 영구 부과':'10% VAT — permanent', body:ko?'국내에서 실물 금을 구매하면 구매 즉시 10% 부가세가 부과됩니다. 금을 팔 때 이 세금은 돌아오지 않습니다. 싱가포르는 귀금속에 GST 0%를 적용합니다.':'Every domestic gold purchase triggers 10% VAT immediately. You never recover it on sale. Singapore applies 0% GST on precious metals.' },
            { title:ko?'국내 딜러 프리미엄':'Domestic dealer margin', body:ko?'국내 귀금속 딜러는 국제 현물가에 추가 마진을 얹습니다. 이 마진은 공개되지 않으며 딜러마다 다릅니다. 국제 현물가 대비 총 프리미엄은 상당히 높아질 수 있습니다.':'Korean precious metals dealers add a margin on top of international spot. This margin is not disclosed and varies by dealer. The total premium vs international spot can be significant.' },
            { title:ko?'금통장은 실물이 아닙니다':'Bank gold accounts are not physical gold', body:ko?'시중 은행 금통장은 은행 장부상 청구권입니다. 귀하가 소유하는 것은 금이 아니라 은행에 대한 채권입니다. 은행 도산 시 예금자보호 적용이 불확실합니다.':'Bank gold savings accounts are ledger entries — you own a claim against the bank, not physical gold. Deposit protection applicability is uncertain in insolvency.' },
          ].map((item,i) => (
            <div key={i} style={{ borderBottom:i<2?'1px solid rgba(197,165,114,0.08)':'none', paddingBottom:20, marginBottom:20 }}>
              <div style={{ fontFamily:ko?T_loc.serifKr:SERIF, fontSize:16, color:'#f5f0e8', marginBottom:8 }}>{item.title}</div>
              <p style={{ fontFamily:SANS, fontSize:14, color:'#8a7d6b', lineHeight:1.8, margin:0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* §3 해외금 vs 국내 금 */}
      <div style={{ background:'#0d0b08', borderBottom:'1px solid rgba(197,165,114,0.08)', padding:isMobile?'40px 20px':'72px 0' }}>
        <div className="aurum-container" style={{ maxWidth:760 }}>
          <span style={eyebrow}>{ko?'해외금 투자 · 외국 금':'해외금 · 외국 금 투자'}</span>
          <h2 style={{ fontFamily:ko?T_loc.serifKr:SERIF, fontSize:isMobile?26:38, fontWeight:300, color:'#f5f0e8', margin:'0 0 20px' }}>
            {ko?<>해외금 vs 국내 금 — <span style={{ color:'#c5a572' }}>무엇이 다른가?</span></>:'해외금 vs 국내 금 — What Is the Difference?'}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:12, marginBottom:24 }}>
            {[
              { side:ko?'국내 금 구매':'Domestic Purchase', items:ko?['10% 부가세 영구 부과','국내 딜러 마진 불투명','원화 가격만 기준','실물 인출 시 추가 부가세']:['10% VAT permanent','Opaque dealer margin','KRW price only','VAT again on physical withdrawal'], bad:true },
              { side:ko?'해외금 (Aurum)':'Offshore Gold (Aurum)', items:ko?['싱가포르 GST 0%','투명한 LBMA 현물가 기준','완전 배분 실물 보관','법적으로 귀하의 소유']:['0% Singapore GST','Transparent LBMA spot','Fully allocated physical','Legally your property'], bad:false },
            ].map((col,i) => (
              <div key={i} style={{ background:col.bad?'rgba(248,113,113,0.04)':'rgba(74,222,128,0.04)', border:`1px solid ${col.bad?'rgba(248,113,113,0.2)':'rgba(74,222,128,0.2)'}`, padding:'18px 20px' }}>
                <div style={{ fontFamily:MONO, fontSize:11, color:col.bad?'#f87171':'#4ade80', marginBottom:12, fontWeight:700 }}>{col.side}</div>
                {col.items.map((it,j) => (
                  <div key={j} style={{ fontFamily:SANS, fontSize:13, color:'#8a7d6b', padding:'5px 0', borderBottom:j<col.items.length-1?'1px solid rgba(197,165,114,0.06)':'none' }}>
                    <span style={{ color:col.bad?'#f87171':'#4ade80', marginRight:8 }}>{col.bad?'✗':'✓'}</span>{it}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* §4 재산 금 투자 + 금보관 방법 */}
      <div style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', padding:isMobile?'40px 20px':'72px 0' }}>
        <div className="aurum-container" style={{ maxWidth:760 }}>
          <span style={eyebrow}>{ko?'재산 금 투자 · 금보관 방법':'재산 금 · 금보관 방법'}</span>
          <h2 style={{ fontFamily:ko?T_loc.serifKr:SERIF, fontSize:isMobile?26:38, fontWeight:300, color:'#f5f0e8', margin:'0 0 20px' }}>
            {ko?<>금으로 재산을 지키는 법 — <span style={{ color:'#c5a572' }}>금보관 방법</span></>:'Protecting Wealth with Gold'}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:isMobile?14:15, color:'#8a7d6b', lineHeight:1.9, marginBottom:24 }}>
            {ko?'싱가포르 자유무역지대(FTZ)는 세계에서 가장 안전한 금보관 방법 중 하나입니다. Aurum은 Malca-Amit FTZ 해외 금보관 금고를 통해 귀하의 금을 완전 배분 방식으로 보관합니다. 재산 금 투자의 핵심은 실물 소유권과 법적 분리 보장에 있습니다.':"The Singapore Free Trade Zone (FTZ) is one of the world's most secure methods for offshore gold storage. Through Malca-Amit FTZ vault, Aurum holds your metal in fully allocated custody. The key to wealth protection in gold is physical ownership and legal segregation."}
          </p>
          <div style={{ background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.15)', padding:'20px 24px', marginBottom:24 }}>
            <div style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', marginBottom:12, letterSpacing:'0.1em' }}>MALCA-AMIT · 싱가포르 FTZ 해외 금보관</div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:8 }}>
              {(ko?['40년+ 운영',"Lloyd's 보험",'자유무역지대','금보관 전문']:['40+ years',"Lloyd's insured",'Free trade zone','Vault specialist']).map((b,i)=>(
                <div key={i} style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', border:'1px solid rgba(197,165,114,0.12)', padding:'6px 10px', textAlign:'center' }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* §5 CTA */}
      <div style={{ background:'#0d0b08', padding:isMobile?'48px 20px':'80px 0', textAlign:'center' }}>
        <div className="aurum-container" style={{ maxWidth:560 }}>
          <div style={{ fontFamily:ko?T_loc.serifKr:SERIF, fontStyle:'italic', fontSize:isMobile?22:32, color:'#f5f0e8', marginBottom:12, lineHeight:1.2 }}>
            {ko?<>AGP로 이 격차를 <span style={{ color:'#c5a572' }}>피하는 방법 →</span></>:'Avoid this gap with AGP →'}
          </div>
          <p style={{ fontFamily:SANS, fontSize:14, color:'#8a7d6b', lineHeight:1.8, marginBottom:28 }}>
            {ko?'매달 원화 자동이체 한 번으로, LBMA 국제 현물가에 실물 금을 쌓습니다. 싱가포르 해외 금보관 금고에, 귀하의 이름으로.':'One monthly KRW auto-transfer. Physical gold at LBMA spot. Singapore offshore vault, in your name.'}
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('agp-intro')} style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'14px 32px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
              {ko?'AGP 시작하기 →':'Start AGP →'}
            </button>
            <button onClick={() => navigate('shop-physical')} style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.4)', color:'#c5a572', padding:'14px 32px', fontSize:14, cursor:'pointer', fontFamily:SANS }}>
              {ko?'실물 구매 →':'Buy Physical →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
