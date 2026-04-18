// HomePage.jsx — 4-pane layout: Hero | AGP Launch | Savings | Founders Club
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fUSD, fKRW } from '../lib/index.jsx';
import { StatBar, Accordion, SectionHead } from '../components/UI.jsx';
import { initMagneticCards } from '../lib/magnetic.js';
import MarketRatios from '../components/MarketRatios.jsx';

// ─── Wax seal divider (reused from campaign pages) ────────────────────────────
function SealDivider() {
  return (
    <div className="seal-divider">
      <div className="seal-line" style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,rgba(197,165,114,0.35),transparent)' }} />
      <div className="wax-seal" />
      <div className="seal-line" style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,rgba(197,165,114,0.35),transparent)' }} />
    </div>
  );
}

const KR_GOLD_PREMIUM     = 0.20;
const KR_SILVER_PREMIUM   = 0.30;
const AURUM_GOLD_PREMIUM  = 0.08;
const AURUM_SILVER_PREMIUM = 0.15;
const OZ_IN_GRAMS  = 31.1035;
const DON_IN_GRAMS = 3.75;

const MONO     = "'JetBrains Mono',monospace";
const SERIF    = "'Cormorant Garamond',serif";
const SANS     = "'Outfit',sans-serif";
const SERIF_KR = "'Noto Serif KR','Cormorant Garamond',serif";
const GOLD_LINE = { position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#c5a572,transparent)',pointerEvents:'none',zIndex:1 };
const eyebrowStyle = { fontFamily:MONO,fontSize:11,color:'#8a7d6b',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10,display:'block' };

// ─── Scroll reveal hook — triggers once when element enters viewport ──────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Count-up hook — animates number from 0 to target ────────────────────────
function useCountUp(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target]);
  return val;
}

// ─── Animated hero visual (canvas) ───────────────────────────────────────────
function HeroAnimatedVisual({ prices }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cur = prices?.gold || 3342;
    // Simulate price history trending up to current price
    const pts = [];
    let p = cur * 0.955;
    for (let i = 0; i < 52; i++) {
      p += (Math.random() - 0.38) * (cur * 0.0028);
      pts.push(Math.max(p, cur * 0.93));
    }
    pts.push(cur);
    let frame = 0;
    let animId;
    const DRAW_FRAMES = 80;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Grid lines
      ctx.strokeStyle = 'rgba(197,165,114,0.055)';
      ctx.lineWidth = 1;
      for (let yi = 1; yi <= 4; yi++) {
        const y = H * 0.12 + (H * 0.72) * (yi / 4.2);
        ctx.beginPath(); ctx.moveTo(44, y); ctx.lineTo(W - 16, y); ctx.stroke();
      }
      // Chart
      const prog = Math.min(frame / DRAW_FRAMES, 1);
      const visN = Math.max(2, Math.floor(prog * pts.length));
      const minP = Math.min(...pts) * 0.9985;
      const maxP = Math.max(...pts) * 1.0015;
      const toX = i => 48 + (i / (pts.length - 1)) * (W - 68);
      const toY = v => H * 0.84 - ((v - minP) / (maxP - minP)) * (H * 0.62);
      if (visN >= 2) {
        // Fill
        const grad = ctx.createLinearGradient(0, toY(maxP), 0, H * 0.84);
        grad.addColorStop(0, 'rgba(197,165,114,0.18)');
        grad.addColorStop(1, 'rgba(197,165,114,0)');
        ctx.beginPath();
        ctx.moveTo(toX(0), H * 0.84);
        for (let i = 0; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.lineTo(toX(visN - 1), H * 0.84);
        ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        // Line
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(pts[0]));
        for (let i = 1; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.strokeStyle = '#C5A572'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
        // Pulsing dot
        const ex = toX(visN - 1), ey = toY(pts[visN - 1]);
        const pulse = (Math.sin(frame * 0.11) + 1) * 0.5;
        ctx.beginPath(); ctx.arc(ex, ey, 9 + pulse * 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197,165,114,${0.07 + pulse * 0.09})`; ctx.fill();
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#C5A572'; ctx.fill();
        // Price label
        if (prog > 0.82) {
          const a = Math.min((prog - 0.82) / 0.18, 1);
          const lx = Math.min(ex + 10, W - 88);
          ctx.fillStyle = `rgba(14,12,8,${a * 0.92})`;
          ctx.fillRect(lx - 3, ey - 21, 88, 22);
          ctx.strokeStyle = `rgba(197,165,114,${a * 0.45})`; ctx.lineWidth = 1;
          ctx.strokeRect(lx - 3, ey - 21, 88, 22);
          ctx.fillStyle = `rgba(197,165,114,${a})`;
          ctx.font = `600 12px 'JetBrains Mono',monospace`;
          ctx.fillText(`$${pts[visN-1].toFixed(2)}`, lx + 2, ey - 5);
        }
      }
      // Y-axis labels
      ctx.fillStyle = 'rgba(138,125,107,0.45)';
      ctx.font = `10px 'JetBrains Mono',monospace`;
      const minV = Math.min(...pts), maxV = Math.max(...pts);
      for (let yi = 0; yi <= 3; yi++) {
        const v = minV + (maxV - minV) * (yi / 3);
        ctx.fillText(`$${Math.round(v / 100) * 100}`, 2, toY(v) + 4);
      }
      // LIVE badge
      if (frame > 18) {
        const a = Math.min((frame - 18) / 18, 1);
        const gp = (Math.sin(frame * 0.09) + 1) * 0.5;
        ctx.beginPath(); ctx.arc(W - 38, 22, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,222,128,${a * (0.55 + gp * 0.45)})`; ctx.fill();
        ctx.fillStyle = `rgba(197,165,114,${a})`;
        ctx.font = `500 11px 'JetBrains Mono',monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('XAU/USD', W - 48, 26);
        ctx.textAlign = 'left';
        // "LIVE" text
        ctx.fillStyle = `rgba(74,222,128,${a * 0.8})`;
        ctx.font = `600 10px 'JetBrains Mono',monospace`;
        ctx.fillText('LIVE', W - 32, 26);
        ctx.textAlign = 'left';
      }
      // Particles handled globally by App.jsx canvas (S-01)
      frame++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [prices?.gold]);

  // Silver chart — full quality matching gold, equal height
  const silverRef = useRef(null);
  useEffect(() => {
    const canvas = silverRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cur = prices?.silver || 32.9;
    const pts = [];
    let p = cur * 0.955;
    for (let i = 0; i < 52; i++) {
      p += (Math.random() - 0.38) * (cur * 0.003);
      pts.push(Math.max(p, cur * 0.92));
    }
    pts.push(cur);
    let frame = 0; let animId;
    const DRAW_FRAMES = 80;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Grid lines
      ctx.strokeStyle = 'rgba(125,211,220,0.06)';
      ctx.lineWidth = 1;
      for (let yi = 1; yi <= 4; yi++) {
        const y = H * 0.12 + (H * 0.72) * (yi / 4.2);
        ctx.beginPath(); ctx.moveTo(44, y); ctx.lineTo(W - 16, y); ctx.stroke();
      }
      const prog = Math.min(frame / DRAW_FRAMES, 1);
      const visN = Math.max(2, Math.floor(prog * pts.length));
      const minP = Math.min(...pts) * 0.9985;
      const maxP = Math.max(...pts) * 1.0015;
      const toX = i => 48 + (i / (pts.length - 1)) * (W - 68);
      const toY = v => H * 0.84 - ((v - minP) / (maxP - minP)) * (H * 0.62);
      if (visN >= 2) {
        const grad = ctx.createLinearGradient(0, toY(maxP), 0, H * 0.84);
        grad.addColorStop(0, 'rgba(125,211,220,0.18)');
        grad.addColorStop(1, 'rgba(125,211,220,0)');
        ctx.beginPath();
        ctx.moveTo(toX(0), H * 0.84);
        for (let i = 0; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.lineTo(toX(visN - 1), H * 0.84);
        ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(pts[0]));
        for (let i = 1; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.strokeStyle = '#7dd3dc'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
        // Live dot
        const ex = toX(visN - 1), ey = toY(pts[visN - 1]);
        const pulse = (Math.sin(frame * 0.11) + 1) * 0.5;
        ctx.beginPath(); ctx.arc(ex, ey, 9 + pulse * 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125,211,220,${0.07 + pulse * 0.09})`; ctx.fill();
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#7dd3dc'; ctx.fill();
        // Price label
        if (prog > 0.82) {
          const a = Math.min((prog - 0.82) / 0.18, 1);
          const lx = Math.min(ex + 10, W - 80);
          ctx.fillStyle = `rgba(14,12,8,${a * 0.92})`;
          ctx.fillRect(lx - 3, ey - 21, 78, 22);
          ctx.strokeStyle = `rgba(125,211,220,${a * 0.5})`; ctx.lineWidth = 1;
          ctx.strokeRect(lx - 3, ey - 21, 78, 22);
          ctx.fillStyle = `rgba(125,211,220,${a})`;
          ctx.font = `600 12px 'JetBrains Mono',monospace`;
          ctx.fillText(`$${pts[visN-1].toFixed(2)}`, lx + 2, ey - 5);
        }
      }
      // Y-axis labels
      ctx.fillStyle = 'rgba(125,211,220,0.4)';
      ctx.font = `10px 'JetBrains Mono',monospace`;
      const minV = Math.min(...pts), maxV = Math.max(...pts);
      for (let yi = 0; yi <= 3; yi++) {
        const v = minV + (maxV - minV) * (yi / 3);
        ctx.fillText(`$${v.toFixed(1)}`, 2, toY(v) + 4);
      }
      frame++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [prices?.silver]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, width:'100%', maxWidth:500 }}>
      {/* Gold chart — 50% */}
      <div style={{ background:'rgba(197,165,114,0.03)', borderBottom:'1px solid rgba(197,165,114,0.12)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px 2px' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(197,165,114,0.7)', letterSpacing:'0.14em' }}>XAU/USD</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', boxShadow:'0 0 4px #4ade80' }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#C5A572', fontWeight:600 }}>${(prices?.gold||3342).toFixed(2)}</span>
          </div>
        </div>
        <canvas ref={canvasRef} width={500} height={200}
          style={{ display:'block', width:'100%', opacity:0.92 }} />
      </div>
      {/* Silver chart — 50% */}
      <div style={{ background:'rgba(125,211,220,0.03)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px 2px' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(125,211,220,0.7)', letterSpacing:'0.14em' }}>XAG/USD</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#7dd3dc', display:'inline-block', boxShadow:'0 0 4px #7dd3dc' }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#7dd3dc', fontWeight:600 }}>${(prices?.silver||32.9).toFixed(2)}</span>
          </div>
        </div>
        <canvas ref={silverRef} width={500} height={200}
          style={{ display:'block', width:'100%' }} />
      </div>
    </div>
  );
}

// ─── AGP Launch visual — animated ingot + tier cards ──────────────────────────
function AGPLaunchVisual({ tiers }) {
  return (
    <div style={{ position:'relative', width:300, height:420 }}>
      <style>{`
        @keyframes tier-in { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ingot-float { 0%,100%{transform:translateY(0) perspective(600px) rotateX(8deg) rotateY(-4deg)} 50%{transform:translateY(-10px) perspective(600px) rotateX(6deg) rotateY(-2deg)} }
        @keyframes gift-pulse { 0%,100%{box-shadow:0 0 8px rgba(74,222,128,0.15)} 50%{box-shadow:0 0 20px rgba(74,222,128,0.35)} }
      `}</style>
      {/* Ingot */}
      <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', width:176, height:112, background:'linear-gradient(135deg,#2a2418 0%,#4a3e26 35%,#C5A572 50%,#E3C187 55%,#C5A572 62%,#6a5a3a 80%,#2a2418 100%)', boxShadow:'0 24px 50px rgba(197,165,114,0.22), 0 0 0 1px rgba(197,165,114,0.4), inset 0 1px 0 rgba(255,255,255,0.12)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', animation:'ingot-float 4s ease-in-out infinite' }}>
        <div style={{ fontFamily:SERIF, fontSize:8, fontWeight:600, letterSpacing:'0.42em', color:'rgba(26,24,20,0.88)', marginBottom:5 }}>A U R U M</div>
        <div style={{ fontFamily:MONO, fontSize:20, fontWeight:700, color:'rgba(26,24,20,0.92)' }}>AGP</div>
        <div style={{ fontFamily:MONO, fontSize:7, color:'rgba(26,24,20,0.58)', letterSpacing:'0.2em', marginTop:5 }}>999.9 FINE GOLD</div>
      </div>
      {/* Tier cards */}
      {tiers.map((t, i) => (
        <div key={i} style={{ position:'absolute', left: i % 2 === 0 ? 8 : 152, top: 152 + i * 52, width:140, background: t.featured ? 'rgba(197,165,114,0.1)' : 'rgba(14,12,8,0.92)', border:`1px solid ${t.featured ? 'rgba(197,165,114,0.45)' : 'rgba(197,165,114,0.12)'}`, padding:'8px 11px', display:'flex', justifyContent:'space-between', alignItems:'center', opacity:0, animation:`tier-in 0.4s ease-out ${0.3 + i * 0.14}s forwards${t.featured ? `, gift-pulse 2.5s ease-in-out ${1 + i * 0.14}s infinite` : ''}` }}>
          {t.featured && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#c5a572,transparent)' }} />}
          <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:12, color: t.featured ? '#E3C187' : '#c5a572' }}>{t.nameEn}</span>
          <span style={{ fontFamily:MONO, fontSize:11, color: t.featured ? '#4ade80' : '#a09080', fontWeight: t.featured ? 700 : 400 }}>{t.gift}</span>
        </div>
      ))}
    </div>
  );
}

// ─── AGP Launch Pane ─────────────────────────────────────────────────────────
function AGPLaunchPane({ lang, navigate, prices, krwRate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const tiers = [
    { nameEn:'Bronze',   name:'브론즈',   min:'₩200,000+',   gift:'₩50,000'    },
    { nameEn:'Silver',   name:'실버',     min:'₩500,000+',   gift:'₩200,000'   },
    { nameEn:'Gold',     name:'골드',     min:'₩1,000,000+', gift:'₩500,000',  featured:true },
    { nameEn:'Platinum', name:'플래티넘', min:'₩2,000,000+', gift:'₩1,500,000' },
    { nameEn:'Sovereign',name:'소브린',   min:'₩5,000,000+', gift:'₩5,000,000' },
  ];
  return (
    <div style={{ background:'linear-gradient(150deg,#0d0b07,#161208)', borderTop:'1px solid rgba(197,165,114,0.12)', borderBottom:'1px solid rgba(197,165,114,0.12)', position:'relative', overflow:'hidden', minHeight:isMobile?'auto':480 }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 60px)', opacity:0.018, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(197,165,114,0.7),transparent)' }} />
      <div className="aurum-container" style={{ position:'relative', zIndex:1, paddingTop:isMobile?32:80, paddingBottom:isMobile?32:80, display:isMobile?'block':'flex', gap:60, alignItems:'center' }}>
        {/* Left — text + tiers */}
        <div style={{ flex:'0 0 auto', maxWidth:isMobile?'100%':500, marginBottom:isMobile?40:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#c5a572', boxShadow:'0 0 8px #c5a572', animation:'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', letterSpacing:'0.22em', textTransform:'uppercase' }}>
              {ko ? 'AGP 자동 적금 · 지금 가입 시 특별 혜택' : 'AGP Auto Savings · Special Launch Benefits'}
            </span>
          </div>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?30:44, fontWeight:400, color:'#f5f0e8', lineHeight:1.15, margin:'0 0 14px' }}>
            {ko ? <>매달 원화로,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>국제 현물가 그대로.</span></> : <>Every month in KRW,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>at international spot.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? '국내 금통장 이자 0%, 국내 소매 채널에서 구매 시 국제 현물가 대비 상당한 추가 비용이 발생합니다. AGP는 다릅니다 — 매달 자동이체 한 번으로, 실물 금을 국제 현물가에 그램 단위로 쌓습니다. 싱가포르 금고에, 귀하의 이름으로. 가입 첫 달, 등급에 따라 최대 ₩5,000,000 상당의 금이 즉시 적립됩니다. 언제든 중단 가능.' : 'Korean bank gold accounts yield 0%, and domestic retail channels carry a structural premium over international spot. AGP is different — one monthly auto-transfer accumulates real gold at international spot price, gram by gram. In a Singapore vault, in your name. Enroll this month and receive up to ₩5,000,000 in gold credited immediately. Cancel anytime.'}
          </p>
          <div style={{ marginBottom:32 }}>
            {tiers.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', marginBottom:4, background:t.featured?'rgba(197,165,114,0.08)':'rgba(255,255,255,0.018)', border:`1px solid ${t.featured?'rgba(197,165,114,0.35)':'rgba(197,165,114,0.07)'}`, position:'relative', overflow:'hidden' }}>
                {t.featured && <div style={GOLD_LINE} />}
                <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:13, color:t.featured?'#E3C187':'#c5a572', minWidth:64 }}>{ko?t.name:t.nameEn}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#555', flex:1 }}>{t.min}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#8a7d6b' }}>{ko?'첫달 즉시 적립':'Day-1 Gold Credit'}&nbsp;</span>
                <span style={{ fontFamily:MONO, fontSize:t.featured?15:13, color:t.featured?'#4ade80':'#c5a572', fontWeight:t.featured?700:600 }}>{t.gift}</span>
              </div>
            ))}
          </div>
          <AGPAccumulatorCalc prices={prices} krwRate={krwRate} lang={lang} tiers={tiers} />
          <button onClick={() => navigate('agp-intro')}
            style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.02em', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#E3C187'}
            onMouseLeave={e => e.currentTarget.style.background='#c5a572'}>
            {ko ? 'AGP 시작하기 →' : 'Start AGP →'}
          </button>
        </div>
        {/* Right — visual */}
        {!isMobile && (
          <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
            <AGPLaunchVisual tiers={tiers} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Founders Club gate visual (SVG animated) ─────────────────────────────────
function FoundersGateVisual({ gates }) {
  return (
    <div style={{ position:'relative', width:220, height:380 }}>
      <style>{`
        @keyframes gate-pop { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes vline-draw { from{stroke-dashoffset:320} to{stroke-dashoffset:0} }
      `}</style>
      <svg width="220" height="380" viewBox="0 0 220 380" overflow="visible">
        <defs>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        {/* Connector line */}
        <line x1="110" y1="28" x2="110" y2="352" stroke="rgba(197,165,114,0.15)" strokeWidth="1" strokeDasharray="5 4"/>
        <line x1="110" y1="28" x2="110" y2="352" stroke="rgba(197,165,114,0.5)" strokeWidth="1.5" strokeDasharray="320" strokeDashoffset="320" style={{ animation:'vline-draw 1.4s ease-out 0.2s forwards' }}/>
        {gates.map((g, i) => {
          const y = 28 + i * 68;
          const r = g.apex ? 24 : 18;
          return (
            <g key={i} style={{ opacity:0, animation:`gate-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${0.35 + i*0.14}s forwards` }}>
              {g.apex && <circle cx="110" cy={y} r="32" fill="none" stroke="rgba(197,165,114,0.14)" strokeWidth="1"/>}
              <circle cx="110" cy={y} r={r} fill={g.apex?'rgba(197,165,114,0.14)':'rgba(14,12,8,0.95)'} stroke={g.apex?'#C5A572':'rgba(197,165,114,0.38)'} strokeWidth={g.apex?1.5:1} filter={g.apex?'url(#gold-glow)':'none'}/>
              <text x="110" y={y+5} textAnchor="middle" fill={g.apex?'#E3C187':'#c5a572'} fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize={g.apex?15:12}>{g.num}</text>
              {/* Discount — right */}
              <text x="142" y={y+5} textAnchor="start" fill={g.apex?'#4ade80':'rgba(197,165,114,0.75)'} fontFamily="'JetBrains Mono',monospace" fontSize={g.apex?13:11} fontWeight={g.apex?'700':'400'}>{g.disc}</text>
              {/* Label — left */}
              <text x="78" y={y+5} textAnchor="end" fill="rgba(197,165,114,0.42)" fontFamily="'Outfit',sans-serif" fontSize="10">{g.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Founders Club Pane ───────────────────────────────────────────────────────
function FoundersClubPane({ lang, navigate, krwRate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const gates = [
    { num:'I',   label: ko?'시작의 문'   :'The Opening',      gmv:'₩7.2M',  disc:'−1.0%' },
    { num:'II',  label: ko?'셋의 표식'   :'The Three',        gmv:'₩21.6M', disc:'−1.5%' },
    { num:'III', label: ko?'정점'         :'The Apex',         gmv:'₩50.4M', disc:'−2.0%', apex:true },
    { num:'IV',  label: ko?'볼트 순례'   :'Vault Pilgrimage', gmv:'₩93.6M', disc:'−2.5%' },
    { num:'V',   label: ko?'평생의 표식 — Aurum 최저가, 영원히' :'Lifetime Mark — Aurum lowest price, forever',    gmv:'₩144M',  disc:'−3.0%' },
  ];
  return (
    <div style={{ background:'linear-gradient(150deg,#08070a,#0d0c12)', borderBottom:'1px solid rgba(197,165,114,0.12)', position:'relative', overflow:'hidden', minHeight:isMobile?'auto':480 }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 18% 50%, rgba(197,165,114,0.06), transparent 55%)', pointerEvents:'none' }} />
      <div className="aurum-container" style={{ position:'relative', zIndex:1, paddingTop:isMobile?32:80, paddingBottom:isMobile?32:80, display:isMobile?'block':'flex', gap:56, alignItems:'center' }}>
        {/* Left — gate visual */}
        {!isMobile && (
          <div style={{ flex:'0 0 240px', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <FoundersGateVisual gates={gates} />
          </div>
        )}
        {/* Right — text */}
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#c5a572', boxShadow:'0 0 8px #c5a572', animation:'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', letterSpacing:'0.22em', textTransform:'uppercase' }}>
              {ko ? 'Founders Club · 파운더스 클럽' : 'Founders Club'}
            </span>
          </div>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?30:44, fontWeight:400, color:'#f5f0e8', lineHeight:1.15, margin:'0 0 14px' }}>
            {ko ? <>살수록 낮아지는 가격 —<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>영원히 귀하의 것입니다.</span></> : <>Prices fall as you accumulate —<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>locked in forever.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? '한번 얻은 할인은 절대 사라지지 않습니다. Founders Club의 다섯 문을 통과할 때마다, 누적 구매 기준 할인율이 영구적으로 높아집니다. 귀하의 금 구매가 곧 귀하의 가격입니다.' : 'A discount earned is never lost. Every gate your cumulative purchases pass raises your discount permanently. Your buying history is your price.'}
          </p>
          <div style={{ marginBottom:32 }}>
            {gates.map((g, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 72px 52px', gap:12, alignItems:'center', padding:'10px 14px', marginBottom:4, background:g.apex?'rgba(197,165,114,0.06)':'rgba(255,255,255,0.015)', border:`1px solid ${g.apex?'rgba(197,165,114,0.3)':'rgba(197,165,114,0.07)'}`, position:'relative', overflow:'hidden' }}>
                {g.apex && <div style={GOLD_LINE} />}
                <div style={{ width:24, height:24, borderRadius:'50%', border:`1.5px solid ${g.apex?'#c5a572':'rgba(197,165,114,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontStyle:'italic', fontSize:11, color:g.apex?'#c5a572':'#8a7d6b' }}>{g.num}</div>
                <span style={{ fontFamily:SANS, fontSize:13, color:g.apex?'#f5f0e8':'#a09080' }}>{g.label}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#555' }}>{g.gmv}</span>
                <span style={{ fontFamily:MONO, fontSize:13, color:g.apex?'#4ade80':'#c5a572', fontWeight:700, textAlign:'right' }}>{g.disc}</span>
              </div>
            ))}
          </div>
          <FoundersMiniCalc krwRate={krwRate} lang={lang} navigate={navigate} />
          <button onClick={() => navigate('founders')}
            style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.5)', color:'#c5a572', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(197,165,114,0.1)'; e.currentTarget.style.borderColor='#c5a572'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(197,165,114,0.5)'; }}>
            {ko ? '내 절감액 계산하기 →' : 'Calculate my savings →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  [2020,1,1580,1165],[2020,2,1586,1188],[2020,3,1591,1227],
  [2020,4,1686,1219],[2020,5,1715,1230],[2020,6,1728,1204],
  [2020,7,1972,1192],[2020,8,1969,1184],[2020,9,1886,1168],
  [2020,10,1879,1133],[2020,11,1873,1108],[2020,12,1887,1085],
  [2021,1,1855,1101],[2021,2,1794,1122],[2021,3,1736,1134],
  [2021,4,1778,1118],[2021,5,1869,1124],[2021,6,1824,1131],
  [2021,7,1815,1152],[2021,8,1807,1166],[2021,9,1756,1179],
  [2021,10,1782,1184],[2021,11,1791,1190],[2021,12,1806,1192],
  [2022,1,1819,1198],[2022,2,1875,1204],[2022,3,1940,1214],
  [2022,4,1924,1235],[2022,5,1845,1278],[2022,6,1830,1304],
  [2022,7,1728,1315],[2022,8,1754,1332],[2022,9,1658,1406],
  [2022,10,1632,1428],[2022,11,1734,1350],[2022,12,1788,1281],
  [2023,1,1929,1245],[2023,2,1836,1262],[2023,3,1966,1304],
  [2023,4,1999,1335],[2023,5,1963,1330],[2023,6,1921,1316],
  [2023,7,1958,1284],[2023,8,1938,1326],[2023,9,1920,1354],
  [2023,10,1983,1357],[2023,11,2041,1298],[2023,12,2063,1296],
  [2024,1,2040,1332],[2024,2,2052,1338],[2024,3,2230,1335],
  [2024,4,2335,1378],[2024,5,2346,1370],[2024,6,2327,1382],
  [2024,7,2426,1381],[2024,8,2503,1341],[2024,9,2659,1326],
  [2024,10,2736,1382],[2024,11,2673,1403],[2024,12,2625,1445],
];

const FC_GATES = [
  { num:'I',   label:'시작의 문',   labelEn:'The Opening',      gmv:5000,   discount:1.0 },
  { num:'II',  label:'셋의 표식',   labelEn:'The Three',        gmv:15000,  discount:1.5 },
  { num:'III', label:'정점',        labelEn:'The Apex',         gmv:35000,  discount:2.0 },
  { num:'IV',  label:'볼트 순례',   labelEn:'Vault Pilgrimage', gmv:65000,  discount:2.5 },
  { num:'V',   label:'평생의 표식', labelEn:'Lifetime Mark',    gmv:100000, discount:3.0 },
];

// ─── C·01 HeroSplitWidget ─────────────────────────────────────────────────────
function HeroSplitWidget({ prices, krwRate, lang, goldKR, goldAU }) {
  const [ref, vis] = useScrollReveal(0);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const gap = goldKR - goldAU;
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  const barMax = goldKR * 1.02;
  const bars = [
    { label: ko ? '국내 소매 채널' : 'Korea Retail', val: goldKR, pct: goldKR/barMax*100, color: '#f87171' },
    { label: ko ? 'Aurum · LBMA 현물가 기준' : 'Aurum', val: goldAU, pct: goldAU/barMax*100, color: '#c5a572' },
  ];
  return (
    <div ref={ref} style={{ width:'100%', maxWidth:500, opacity:vis?1:0, transition:'opacity 0.7s ease' }}>
      <div style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:14 }}>
        {ko ? 'GOLD · 1 oz · KRW 실시간' : 'GOLD · 1 oz · LIVE KRW'}
      </div>
      {bars.map((bar, i) => (
        <div key={i} style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
            <span style={{ fontFamily:SANS, fontSize:11, color:'#a09080' }}>{bar.label}</span>
            <span style={{ fontFamily:MONO, fontSize:16, color:bar.color, fontWeight:700 }}>{fKRW2(bar.val)}</span>
          </div>
          <div style={{ height:6, background:'#1e1e1e', overflow:'hidden' }}>
            <div style={{
              height:'100%',
              background:`linear-gradient(90deg,${bar.color},${bar.color}88)`,
              width: vis ? `${bar.pct.toFixed(1)}%` : '0%',
              transition:`width 1.4s cubic-bezier(0.25,1,0.5,1) ${i*0.25}s`,
            }} />
          </div>
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 14px', marginTop:4 }}>
        <span style={{ fontFamily:SANS, fontSize:12, color:'#f5f0e8' }}>{ko ? 'Aurum으로 절감' : 'Savings with Aurum'}</span>
        <span style={{ fontFamily:MONO, fontSize:20, color:'#4ade80', fontWeight:700, marginLeft:'auto' }}>{fKRW2(gap)}</span>
      </div>
    </div>
  );
}

// ─── C·02 KimchiPremiumMeter ──────────────────────────────────────────────────
function KimchiPremiumMeter({ prices, krwRate, lang, goldKR, goldAU }) {
  const [ref, vis] = useScrollReveal(0.1);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const prem = (goldKR - goldAU) / goldKR * 100;
  const norm = Math.min(Math.max(prem / 25, 0), 1);
  const deg = -140 + norm * 280;
  const rad = (deg - 90) * Math.PI / 180;
  const nx = (100 + 62 * Math.cos(rad)).toFixed(1);
  const ny = (100 + 62 * Math.sin(rad)).toFixed(1);
  const zc = prem < 8 ? '#4ade80' : prem < 15 ? '#fbbf24' : '#f87171';
  const zl = ko ? (prem < 8 ? '낮음' : prem < 15 ? '보통' : '높음') : (prem < 8 ? 'Low' : prem < 15 ? 'Moderate' : 'Elevated');
  return (
    <div ref={ref} style={{ background:'#141414', borderBottom:'1px solid rgba(197,165,114,0.08)', padding:`${isMobile?20:24}px 0` }}>
      <div className="aurum-container" style={{ display:'flex', flexDirection:isMobile?'column':'row', alignItems:'center', justifyContent:'center', gap:40 }}>
        <div style={{ position:'relative', width:200, height:130, flexShrink:0 }}>
          <svg width="200" height="130" viewBox="0 0 200 130" style={{ overflow:'visible' }}>
            <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="#2a2520" strokeWidth="14" strokeLinecap="round"/>
            <path d="M 20 105 A 80 80 0 0 1 80 30" fill="none" stroke="rgba(74,222,128,0.2)" strokeWidth="14" strokeLinecap="round"/>
            <path d="M 80 30 A 80 80 0 0 1 145 30" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="14" strokeLinecap="round"/>
            <path d="M 145 30 A 80 80 0 0 1 180 105" fill="none" stroke="rgba(248,113,113,0.2)" strokeWidth="14" strokeLinecap="round"/>
            {vis && <line x1="100" y1="105" x2={nx} y2={ny} stroke={zc} strokeWidth="2.5" strokeLinecap="round"/>}
            <circle cx="100" cy="105" r="5" fill={zc}/>
          </svg>
          <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ fontFamily:MONO, fontSize:22, fontWeight:700, color:zc }}>{vis ? prem.toFixed(1)+'%' : '—'}</div>
            <div style={{ fontFamily:SANS, fontSize:10, color:zc, marginTop:2 }}>{zl}</div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>
            {ko ? '국내 소매 프리미엄 · LBMA 현물가 대비' : 'Domestic Retail Premium vs LBMA Spot'}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { v:prem.toFixed(1)+'%', l:ko?'오늘':'Today', c:zc },
              { v:ko?'전액 커버':"Lloyd's insured", l:"Lloyd's of London", c:'#c5a572' },
              { v:ko?'등록 딜러':'Registered', l:'PSPM 2019 · MAS', c:'#c5a572' },
            ].map((s,i) => (
              <div key={i} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', padding:'8px 14px', textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:MONO, fontSize:16, color:s.c, fontWeight:700 }}>{s.v}</div>
                <div style={{ fontFamily:SANS, fontSize:10, color:'#555', marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── C·03 KumtongConverter ────────────────────────────────────────────────────
function KumtongConverter({ prices, krwRate, lang }) {
  const [amt, setAmt] = useState(10000000);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const pricePerGram = prices.gold * krwRate / OZ_IN_GRAMS;
  const kumtongGrams = amt / (pricePerGram * 1.10);
  const aurumGrams = amt / (pricePerGram * (1 + AURUM_GOLD_PREMIUM));
  const extraGrams = aurumGrams - kumtongGrams;
  const fmt3 = v => (Math.round(v * 1000) / 1000).toFixed(3);
  return (
    <div style={{ background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.18)', padding:isMobile?'20px 16px':'24px 28px', marginTop:20, position:'relative' }}>
      <div style={GOLD_LINE} />
      <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:16 }}>
        {ko ? '시중 금통장 vs Aurum — 실질 금 보유량 비교' : 'Bank Gold Account vs Aurum — Actual Gold Owned'}
      </div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:SANS, fontSize:13, color:'#a09080', marginBottom:8 }}>
          {ko ? '비교할 금액' : 'Amount'}: <strong style={{ fontFamily:MONO, color:'#f5f0e8' }}>₩{Math.round(amt/10000).toLocaleString('ko-KR')}만원</strong>
        </div>
        <input type="range" min="1000000" max="100000000" step="1000000" value={amt}
          style={{ width:'100%' }} onChange={e => setAmt(+e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
        {[
          { label:ko?'시중 금통장 실질 보유량':'Bank gold account', grams:kumtongGrams, color:'#f87171' },
          { label:ko?'Aurum 구매 시 보유량':'Aurum purchase', grams:aurumGrams, color:'#c5a572' },
        ].map((item, i) => (
          <div key={i} style={{ background:'#141414', border:`1px solid ${item.color}44`, padding:'16px' }}>
            <div style={{ fontFamily:SANS, fontSize:11, color:'#8a7d6b', marginBottom:6 }}>{item.label}</div>
            <div style={{ fontFamily:MONO, fontSize:28, color:item.color, fontWeight:700 }}>
              {fmt3(item.grams)}<span style={{ fontSize:14, marginLeft:4 }}>g</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'12px 16px', marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:SANS, fontSize:12, color:'#f5f0e8' }}>{ko ? 'Aurum으로 추가 보유 가능한 금' : 'Extra gold with Aurum'}</span>
        <span style={{ fontFamily:MONO, fontSize:22, color:'#4ade80', fontWeight:700 }}>+{fmt3(extraGrams)}g</span>
      </div>
    </div>
  );
}

// ─── C·04 PersonalOverpayCalc ─────────────────────────────────────────────────
function PersonalOverpayCalc({ goldKR, goldAU, lang, isMobile }) {
  const [amt, setAmt] = useState(10000000);
  const ko = lang === 'ko';
  const korCost = Math.round(amt * (goldKR / goldAU));
  const savings = korCost - amt;
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:'#111', border:'1px solid rgba(197,165,114,0.2)', padding:isMobile?'20px 16px':'28px 32px', marginBottom:20, position:'relative' }}>
      <div style={GOLD_LINE} />
      <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:16 }}>
        {ko ? '내 투자 금액으로 계산하기' : 'Calculate for your amount'}
      </div>
      <div style={{ fontFamily:MONO, fontSize:isMobile?22:28, color:'#f5f0e8', fontWeight:700, marginBottom:8 }}>
        ₩{Math.round(amt/10000).toLocaleString('ko-KR')}만원
      </div>
      <input type="range" min="1000000" max="100000000" step="1000000" value={amt}
        style={{ width:'100%', marginBottom:18 }} onChange={e => setAmt(+e.target.value)} />
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'1fr 1fr 1fr', gap:10 }}>
        {[
          { label:ko?'국내 소매 구매 시':'Korea retail cost', val:fKRW2(korCost), color:'#f87171' },
          { label:'Aurum', val:fKRW2(amt), color:'#c5a572' },
          { label:ko?'절감액':'Savings', val:fKRW2(savings), color:'#4ade80', col:'1 / -1' },
        ].map((s,i) => (
          <div key={i} style={{ background:`rgba(${s.color==='#f87171'?'248,113,113':s.color==='#c5a572'?'197,165,114':'74,222,128'},0.05)`, border:`1px solid ${s.color}44`, padding:'14px 16px', gridColumn:s.col||'auto' }}>
            <div style={{ fontFamily:SANS, fontSize:11, color:s.color, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:MONO, fontSize:16, color:s.color, fontWeight:700 }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── C·05 AGPAccumulatorCalc ──────────────────────────────────────────────────
function AGPAccumulatorCalc({ prices, krwRate, lang, tiers }) {
  const [monthly, setMonthly] = useState(1000000);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const pricePerG = prices.gold * krwRate / OZ_IN_GRAMS * (1 + AURUM_GOLD_PREMIUM);
  const gramsPerMo = monthly / pricePerG;
  const totalGrams = gramsPerMo * 12;
  const korEquiv = totalGrams * prices.gold * krwRate / OZ_IN_GRAMS * (1 + KR_GOLD_PREMIUM);
  const savings = korEquiv - monthly * 12;
  const tier = tiers.slice().reverse().find(t => monthly >= t.min) || tiers[0];
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:'rgba(14,12,8,0.8)', border:'1px solid rgba(197,165,114,0.15)', padding:isMobile?'18px 14px':'24px 24px', marginTop:20, position:'relative', overflow:'hidden' }}>
      <div style={GOLD_LINE} />
      <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:14 }}>
        {ko ? '12개월 적립 시뮬레이터' : '12-month accumulator'}
      </div>
      {/* Active tier badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontFamily:MONO, fontSize:20, color:'#f5f0e8', fontWeight:700 }}>
          ₩{Math.round(monthly/10000).toLocaleString()}{ko ? '만원/월' : '/mo'}
        </div>
        <div style={{ fontFamily:MONO, fontSize:11, color:tier?.color||'#c5a572', background:'rgba(197,165,114,0.08)', border:`1px solid ${tier?.color||'rgba(197,165,114,0.4)'}`, padding:'3px 10px' }}>
          {ko ? (tier?.name||'브론즈') : (tier?.nameEn||'Bronze')}
        </div>
      </div>
      <input type="range" min="200000" max="5000000" step="100000" value={monthly}
        style={{ width:'100%', marginBottom:16, accentColor:'#c5a572' }} onChange={e => setMonthly(+e.target.value)} />
      {/* Tier progress bars — dynamic highlight */}
      <div style={{ display:'flex', flexDirection:'column', gap:3, marginBottom:14 }}>
        {tiers.map((t, i) => {
          const isActive = tier?.name === t.name;
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10, padding:'7px 10px',
              background: isActive ? 'rgba(197,165,114,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? (t.color||'rgba(197,165,114,0.5)') : 'rgba(197,165,114,0.06)'}`,
              transition:'all 0.25s',
            }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: isActive ? (t.color||'#c5a572') : '#333', flexShrink:0, transition:'background 0.25s' }} />
              <span style={{ fontFamily:SANS, fontSize:11, color: isActive ? '#f5f0e8' : '#555', flex:1, transition:'color 0.25s' }}>{ko ? t.name : t.nameEn}</span>
              <span style={{ fontFamily:MONO, fontSize:10, color:'#555' }}>{t.min}</span>
              <span style={{ fontFamily:MONO, fontSize:11, color: isActive ? '#4ade80' : '#555', fontWeight: isActive ? 700 : 400 }}>{t.gift}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
        {[
          { l:ko?'12개월 적립':'12-mo grams', v:totalGrams.toFixed(3)+'g', c:'#c5a572' },
          { l:ko?'국내 소매 환산':'Korea equiv.', v:fKRW2(korEquiv), c:'#f87171' },
          { l:ko?'Aurum 총비용':'Aurum total', v:fKRW2(monthly*12), c:T.goldDim },
          { l:ko?'절감액':'Savings', v:fKRW2(savings), c:'#4ade80' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#111', padding:'10px 12px', border:'1px solid #1a1a1a' }}>
            <div style={{ fontFamily:SANS, fontSize:10, color:'#555', marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:MONO, fontSize:14, color:s.c, fontWeight:600 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── C·06 FoundersMiniCalc ────────────────────────────────────────────────────
function FoundersMiniCalc({ krwRate, lang, navigate }) {
  const [monthly, setMonthly] = useState(500000);
  const ko = lang === 'ko';
  const annualUSD = monthly * 12 / krwRate;
  const gate = FC_GATES.slice().reverse().find(g => annualUSD >= g.gmv) || null;
  const nextGate = gate ? FC_GATES[FC_GATES.indexOf(gate) + 1] : FC_GATES[0];
  const savings = gate ? annualUSD * (gate.discount / 100) * krwRate : 0;
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.15)', padding:'20px 20px', marginTop:20, position:'relative', overflow:'hidden' }}>
      <div style={GOLD_LINE} />
      <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:14 }}>
        {ko ? '12개월 절감액 계산기' : 'Founders savings estimator'}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontFamily:MONO, fontSize:18, color:'#f5f0e8' }}>
          ₩{Math.round(monthly/10000).toLocaleString()}{ko ? '만원/월' : '/mo'}
        </div>
        {gate && (
          <div style={{ fontFamily:MONO, fontSize:11, color:'#4ade80', background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.3)', padding:'3px 10px' }}>
            Gate {gate.num} · -{gate.discount}%
          </div>
        )}
      </div>
      <input type="range" min="200000" max="5000000" step="100000" value={monthly}
        style={{ width:'100%', marginBottom:14, accentColor:'#c5a572' }} onChange={e => setMonthly(+e.target.value)} />
      {/* Gate rows — dynamic highlight on active gate */}
      <div style={{ display:'flex', flexDirection:'column', gap:3, marginBottom:12 }}>
        {FC_GATES.map((g, i) => {
          const isActive = gate?.num === g.num;
          return (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'24px 1fr 60px 52px', gap:8, alignItems:'center',
              padding:'7px 10px',
              background: isActive ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.015)',
              border: `1px solid ${isActive ? 'rgba(74,222,128,0.35)' : 'rgba(197,165,114,0.06)'}`,
              transition:'all 0.25s',
            }}>
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:11, color: isActive ? '#4ade80' : '#8a7d6b', textAlign:'center', transition:'color 0.25s' }}>{g.num}</div>
              <span style={{ fontFamily:SANS, fontSize:11, color: isActive ? '#f5f0e8' : '#666', transition:'color 0.25s' }}>{ko ? g.label : g.labelEn}</span>
              <span style={{ fontFamily:MONO, fontSize:10, color:'#555' }}>${g.gmv.toLocaleString()}K</span>
              <span style={{ fontFamily:MONO, fontSize:12, color: isActive ? '#4ade80' : '#555', fontWeight: isActive ? 700 : 400, textAlign:'right', transition:'all 0.25s' }}>-{g.discount}%</span>
            </div>
          );
        })}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        {[
          { l:ko?'게이트':'Gate', v:gate?(ko?gate.label:gate.labelEn):(ko?'미달':'Below I'), c:'#c5a572' },
          { l:ko?'할인율':'Discount', v:gate?`-${gate.discount}%`:'-', c:'#4ade80' },
          { l:ko?'연간 절감':'Ann. savings', v:gate?fKRW2(savings):'-', c:'#4ade80' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#111', padding:'10px 12px', textAlign:'center', border:'1px solid #1a1a1a' }}>
            <div style={{ fontFamily:SANS, fontSize:10, color:'#555', marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:MONO, fontSize:13, color:s.c, fontWeight:600 }}>{s.v}</div>
          </div>
        ))}
      </div>
      {nextGate && (
        <div style={{ fontFamily:SANS, fontSize:11, color:T.goldDim, marginBottom:12 }}>
          {ko
            ? `다음 게이트 ${nextGate.num}: 월 ₩${Math.round(nextGate.gmv*krwRate/12/10000).toLocaleString()}만원 필요`
            : `Next gate ${nextGate.num}: ~₩${Math.round(nextGate.gmv*krwRate/12/10000).toLocaleString()}만원/mo needed`}
        </div>
      )}
      <button onClick={() => navigate('founders')}
        style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.4)', color:'#c5a572', padding:'11px 20px', fontFamily:SANS, fontSize:13, cursor:'pointer', width:'100%' }}>
        {ko ? '전체 시뮬레이터 보기 →' : 'Full simulator →'}
      </button>
    </div>
  );
}

// ─── C·07 HowItWorks ─────────────────────────────────────────────────────────
function HowItWorks({ lang, isMobile }) {
  const [ref, vis] = useScrollReveal(0.08);
  const ko = lang === 'ko';
  const steps = [
    { n:'STEP 01', t:ko?'신원 확인':'Verify Identity',
      d:ko?'NICE·KCB 본인인증으로 신원을 확인합니다 (1분 소요). 국제 AML 기준에 따른 KYC 절차이며, 한국 여권 또는 주민등록증이 필요합니다. 완료 후 즉시 구매 가능합니다.':'NICE/KCB identity verification (1 min). International AML KYC process. Korean passport or ID required. Purchase enabled immediately after completion.' },
    { n:'STEP 02', t:ko?'구매 또는 적립':'Purchase or Accumulate',
      d:ko?'토스뱅크 자동이체, 카드, 국제 송금. 원화로 결제, LBMA 국제 현물가로 환산.':'Toss auto-debit, card, or wire. Pay KRW at live LBMA spot.' },
    { n:'STEP 03', t:ko?'싱가포르 금보관 배분':'Singapore Vault Allocation',
      d:ko?'결제 즉시 Malca-Amit FTZ 금고에 귀하의 명의로 배분.':'Allocated to your name at Malca-Amit Singapore FTZ vault immediately.' },
  ];
  return (
    <div ref={ref} style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}>
      <div className="aurum-container" style={{ paddingTop:isMobile?32:64, paddingBottom:isMobile?32:64 }}>
        <div style={{ textAlign:'center', marginBottom:isMobile?24:40 }}>
          <span style={{ ...eyebrowStyle, display:'block', textAlign:'center' }}>{ko ? '3단계로 끝납니다' : 'Three steps'}</span>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?26:36, fontWeight:300, color:'#f5f0e8', margin:0 }}>
            {ko ? '가입부터 금고까지, ' : 'Account to vault in '}
            <span style={{ color:'#c5a572', fontStyle:'italic' }}>{ko ? '5분.' : '5 minutes.'}</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:12 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', borderTop:'2px solid #c5a572', padding:'18px 18px', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(12px)', transition:`opacity 0.6s ease ${i*0.15}s, transform 0.6s ease ${i*0.15}s` }}>
              <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.2em', marginBottom:8 }}>{s.n}</div>
              <div style={{ fontFamily:ko?T.serifKr:SERIF, fontSize:17, color:'#f5f0e8', marginBottom:8 }}>{s.t}</div>
              <div style={{ fontFamily:SANS, fontSize:13, color:T.goldDim, lineHeight:1.7 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── C·08 LegalSafetyFAQ (GC_REVIEW_REQUIRED) ────────────────────────────────
function LegalSafetyFAQ({ lang, navigate }) {
  const [open, setOpen] = useState(null);
  const [ref, vis] = useScrollReveal(0.06);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const faqs = [
    {
      v: ko?'✓ 합법 확인':'✓ Confirmed Legal',
      q: ko?'해외에서 금을 구매하는 게 합법인가요?':'Is it legal to buy gold abroad?',
      a: ko?'네. 외국환거래법상 연간 $50,000 이하는 사전 신고 없이 가능합니다. Aurum은 싱가포르 PSPM Act 2019 등록 딜러입니다.'
        :'Yes. Korean foreign exchange law allows overseas investments up to $50,000/year without prior notification. Aurum is a registered PSPM Act 2019 dealer.',
    },
    {
      v: ko?'✓ 물리적으로 존재':'✓ Physically Exists',
      q: ko?'금이 실제로 금고에 있나요?':'Is the gold physically in a vault?',
      a: ko?'귀하의 금은 싱가포르 FTZ Malca-Amit 금고에 완전 배분(fully allocated) 방식으로 보관됩니다.'
        :'Your metal is stored at Malca-Amit Singapore FTZ vault under fully allocated custody.',
    },
    {
      v: ko?'✓ 법적 분리 보장':'✓ Legally Separated',
      q: ko?'Aurum이 폐업하면 내 금은?':'What if Aurum closes?',
      a: ko?'배분 보관 구조상 귀하의 금은 Aurum 자산이 아닙니다. 귀하 명의로 금고에 존재하며 귀하의 소유입니다.'
        :'Under allocated storage your metal is legally not an Aurum asset. It remains in your name at the vault.',
    },
  ];
  return (
    <div ref={ref} style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', opacity:vis?1:0, transition:'opacity 0.8s ease' }}>
      <div className="aurum-container" style={{ paddingTop:isMobile?32:64, paddingBottom:isMobile?32:64 }}>
        <span style={{ ...eyebrowStyle }}>{ko ? '자주 묻는 질문' : 'Common questions'}</span>
        <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?26:36, fontWeight:300, color:'#f5f0e8', margin:'0 0 28px', lineHeight:1.2 }}>
          {ko ? '합법입니까? ' : 'Is this legal? '}
          <span style={{ color:'#c5a572', fontStyle:'italic' }}>{ko ? '네, 그리고 안전합니다.' : 'Yes, and safe.'}</span>
        </h2>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom:i<2?'1px solid rgba(197,165,114,0.08)':'none', paddingBottom:20, marginBottom:20 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:'#4ade80', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>{faq.v}</div>
            <button onClick={() => setOpen(open===i ? null : i)}
              style={{ background:'none', border:'none', textAlign:'left', cursor:'pointer', padding:0, width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <span style={{ fontFamily:ko?T.serifKr:SERIF, fontStyle:'italic', fontSize:15, color:'#f5f0e8' }}>{faq.q}</span>
              <span style={{ fontFamily:MONO, fontSize:14, color:'#c5a572', flexShrink:0 }}>{open===i ? '−' : '+'}</span>
            </button>
            {open===i && <div style={{ fontFamily:SANS, fontSize:14, color:T.goldDim, lineHeight:1.8, marginTop:10 }}>{faq.a}</div>}
          </div>
        ))}
        <button onClick={() => navigate('storage')}
          style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.3)', color:'#c5a572', padding:'11px 20px', fontFamily:SANS, fontSize:13, cursor:'pointer' }}>
          {ko ? '보관 및 법적 구조 전체 안내 →' : 'Full custody & legal guide →'}
        </button>
      </div>
    </div>
  );
}
// ─── C·09+10 PriceChartsSection — replaces GoldKRWIndexedChart + SavingsComparisonChart ──
// Two side-by-side charts: Gold KRW price + Silver KRW price
// Time toggles: 3개월 (3pts) / 1년 (12pts) / 3년 (36pts) / 전체 (all)

// Approximate monthly XAG/USD prices Jan2020–Dec2024
const SILVER_DATA = [
  18,16,14,15,15,17,24,27,23,24,22,26,
  27,27,25,26,28,26,26,23,23,24,23,23,
  23,24,25,24,22,21,18,19,19,19,21,23,
  24,22,23,25,24,23,24,23,23,23,24,24,
  23,23,25,27,31,29,29,27,31,34,31,30,
];

function PriceChartsSection({ prices, krwRate, lang, isMobile }) {
  const RANGES = [
    { label: '3개월', en: '3M', n: 3 },
    { label: '1년',   en: '1Y', n: 12 },
    { label: '3년',   en: '3Y', n: 36 },
    { label: '전체',  en: 'ALL', n: 60 },
  ];
  const [rangeIdx, setRangeIdx] = useState(2);
  const goldRef  = useRef(null);
  const silverRef = useRef(null);
  const [ref, vis] = useScrollReveal(0.05);
  const ko = lang === 'ko';

  const drawChart = (canvas, dataPts, color, fillColor) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || canvas.width;
    const H = canvas.height;
    canvas.width = W;
    ctx.clearRect(0, 0, W, H);
    const PAD = { top: 12, right: 8, bottom: 28, left: 52 };
    const CW = W - PAD.left - PAD.right;
    const CH = H - PAD.top - PAD.bottom;
    if (!dataPts.length) return;
    const minV = Math.min(...dataPts) * 0.97;
    const maxV = Math.max(...dataPts) * 1.02;
    const toX = i => PAD.left + (i / (dataPts.length - 1)) * CW;
    const toY = v => PAD.top + CH - ((v - minV) / (maxV - minV)) * CH;

    // Grid lines
    ctx.strokeStyle = 'rgba(197,165,114,0.08)';
    ctx.lineWidth = 0.5;
    for (let g = 0; g <= 4; g++) {
      const y = PAD.top + (g / 4) * CH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      const val = maxV - (g / 4) * (maxV - minV);
      ctx.fillStyle = 'rgba(197,165,114,0.45)';
      ctx.font = "9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'right';
      const label = val >= 10000
        ? '₩' + Math.round(val / 10000).toLocaleString('ko-KR') + '만'
        : '$' + val.toFixed(0);
      ctx.fillText(label, PAD.left - 4, y + 3);
    }

    // Fill gradient under line
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + CH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(toX(0), PAD.top + CH);
    dataPts.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(dataPts.length - 1), PAD.top + CH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    dataPts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.stroke();

    // End dot
    const last = dataPts[dataPts.length - 1];
    ctx.beginPath();
    ctx.arc(toX(dataPts.length - 1), toY(last), 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // X-axis labels (first and last)
    const n = RANGES[rangeIdx].n;
    const startIdx = MONTHLY_DATA.length - n;
    const startD = MONTHLY_DATA[startIdx];
    const endD = MONTHLY_DATA[MONTHLY_DATA.length - 1];
    ctx.fillStyle = 'rgba(138,125,107,0.6)';
    ctx.font = "9px 'JetBrains Mono',monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`${startD[0]}.${String(startD[1]).padStart(2,'0')}`, PAD.left, H - 6);
    ctx.textAlign = 'right';
    ctx.fillText(`${endD[0]}.${String(endD[1]).padStart(2,'0')}`, W - PAD.right, H - 6);
  };

  useEffect(() => {
    if (!vis) return;
    const n = RANGES[rangeIdx].n;
    const slice = MONTHLY_DATA.slice(MONTHLY_DATA.length - n);
    const goldPts = slice.map(d => d[2] * d[3]);  // XAU/USD × KRW rate = KRW/oz
    const silvPts = SILVER_DATA.slice(SILVER_DATA.length - n).map((s, i) => s * slice[i][3]);
    drawChart(goldRef.current, goldPts, '#C5A572', 'rgba(197,165,114,0.18)');
    drawChart(silverRef.current, silvPts, '#7dd3dc', 'rgba(125,211,220,0.12)');
  }, [vis, rangeIdx, lang]);

  const currentGoldKRW = Math.round((prices.gold || 3400) * (krwRate || 1440));
  const currentSilvKRW = Math.round((prices.silver || 32) * (krwRate || 1440));

  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease', marginBottom: 28 }}>
      {/* Header row with toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
            {ko ? '실시간 귀금속 가격 (KRW)' : 'Live Precious Metals (KRW)'}
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: '#C5A572', fontWeight: 700 }}>
              XAU ₩{currentGoldKRW.toLocaleString('ko-KR')}/oz
            </span>
            <span style={{ fontFamily: MONO, fontSize: 13, color: '#7dd3dc', fontWeight: 700 }}>
              XAG ₩{currentSilvKRW.toLocaleString('ko-KR')}/oz
            </span>
          </div>
        </div>
        {/* Time range toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {RANGES.map((r, i) => (
            <button key={i} onClick={() => setRangeIdx(i)} style={{
              background: rangeIdx === i ? 'rgba(197,165,114,0.15)' : 'transparent',
              border: `1px solid ${rangeIdx === i ? 'rgba(197,165,114,0.6)' : 'rgba(197,165,114,0.15)'}`,
              color: rangeIdx === i ? '#C5A572' : '#666',
              padding: '4px 10px', cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em',
              transition: 'all 0.2s',
            }}>
              {ko ? r.label : r.en}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-side charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        {/* Gold chart */}
        <div style={{ background: '#0e0c09', border: '1px solid rgba(197,165,114,0.12)', padding: '12px 12px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.6)', letterSpacing: '0.16em' }}>XAU · {ko ? '금' : 'GOLD'} · KRW/oz</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#C5A572', fontWeight: 700 }}>₩{currentGoldKRW.toLocaleString('ko-KR')}</span>
          </div>
          <canvas ref={goldRef} height={160} style={{ display: 'block', width: '100%' }} />
        </div>
        {/* Silver chart */}
        <div style={{ background: '#080c0e', border: '1px solid rgba(125,211,220,0.1)', padding: '12px 12px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(125,211,220,0.5)', letterSpacing: '0.16em' }}>XAG · {ko ? '은' : 'SILVER'} · KRW/oz</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#7dd3dc', fontWeight: 700 }}>₩{currentSilvKRW.toLocaleString('ko-KR')}</span>
          </div>
          <canvas ref={silverRef} height={160} style={{ display: 'block', width: '100%' }} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.5)' }}>— {ko ? '금 (KRW/oz)' : 'Gold KRW/oz'}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(125,211,220,0.4)' }}>— {ko ? '은 (KRW/oz)' : 'Silver KRW/oz'}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(138,125,107,0.35)' }}>{ko ? '* LBMA 월간 데이터 2020–2024' : '* LBMA monthly data 2020–2024'}</span>
      </div>
    </div>
  );
}


// ─── C·11 VaultLocationDot ───────────────────────────────────────────────────
function VaultLocationDot({ lang }) {
  const ko = lang === 'ko';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24, padding:'14px 0', borderBottom:'1px solid rgba(197,165,114,0.06)', flexWrap:'wrap' }}>
      <svg width="160" height="70" viewBox="0 0 180 80">
        <path d="M10 20 Q30 15 60 25 Q80 30 100 20 Q120 12 140 18 Q155 22 165 35 Q170 50 160 60 Q140 70 120 65 Q100 58 80 62 Q60 68 40 60 Q20 52 15 40 Z"
          fill="none" stroke="rgba(197,165,114,0.1)" strokeWidth="1"/>
        <circle cx="116" cy="54" r="4" fill="#C5A572" opacity="0.9"/>
        <circle cx="116" cy="54" r="2" fill="#E3C187"/>
      </svg>
      <div>
        <div style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', fontWeight:700, letterSpacing:'0.1em', marginBottom:5 }}>
          {ko ? 'MALCA-AMIT · 싱가포르 FTZ 해외 금보관' : 'MALCA-AMIT · SINGAPORE FTZ VAULT'}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[ko?'40년+ 운영':'40+ years', ko?"Lloyd's 보험":"Lloyd's insured", ko?'자유무역지대':'Free Trade Zone', ko?'금보관 전문':'Vault specialist'].map((b,i) => (
            <span key={i} style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, border:'1px solid rgba(197,165,114,0.15)', padding:'2px 8px' }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}



// ─── KRW Debasement Section — §03 ────────────────────────────────────────────
// Shows purchasing power of KRW in gold terms over time
// All data from MONTHLY_DATA — no hardcoded values
function KRWDebasementSection({ lang, isMobile }) {
  const YEARS = [2020, 2021, 2022, 2023, 2024];
  const [startYear, setStartYear] = useState(2020);
  const [ref, vis] = useScrollReveal(0.05);
  const chartRef = useRef(null);
  const ko = lang === 'ko';

  // Find base index for selected start year (January of that year)
  const baseIdx = MONTHLY_DATA.findIndex(d => d[0] === startYear && d[1] === 1);
  const baseData = MONTHLY_DATA[baseIdx] || MONTHLY_DATA[0];
  const baseGoldKRW = baseData[2] * baseData[3]; // XAU/USD × KRW/USD

  // Slice from start year to end
  const slice = MONTHLY_DATA.slice(baseIdx);
  const latestData = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const latestGoldKRW = latestData[2] * latestData[3];

  // Debasement = how much MORE KRW needed to buy same gold since start year
  const debasementPct = ((latestGoldKRW / baseGoldKRW) - 1) * 100;
  // Purchasing power loss = inverse — KRW buys X% LESS gold
  const purchasePowerLoss = (1 - baseGoldKRW / latestGoldKRW) * 100;
  // KRW/USD change
  const krwChange = ((latestData[3] / baseData[3]) - 1) * 100;

  // Grams ₩100만원 could buy then vs now
  const OZ_G = 31.1035;
  const gramsBase = (1000000 / baseGoldKRW) * OZ_G;
  const gramsNow  = (1000000 / latestGoldKRW) * OZ_G;

  useEffect(() => {
    if (!vis || !chartRef.current) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 600;
    const H = canvas.height;
    canvas.width = W;
    ctx.clearRect(0, 0, W, H);
    const PAD = { top: 16, right: 12, bottom: 32, left: 56 };
    const CW = W - PAD.left - PAD.right;
    const CH = H - PAD.top - PAD.bottom;

    // Two series, both indexed to 100 at start year
    const goldKRWIdx = slice.map(d => (d[2] * d[3]) / baseGoldKRW * 100);
    // KRW purchasing power = inverse — starts at 100, falls as gold price rises in KRW
    const krwPowerIdx = slice.map(d => baseGoldKRW / (d[2] * d[3]) * 100);

    const allVals = [...goldKRWIdx, ...krwPowerIdx];
    const minV = Math.min(...allVals) * 0.95;
    const maxV = Math.max(...allVals) * 1.03;
    const toX = i => PAD.left + (i / (slice.length - 1)) * CW;
    const toY = v => PAD.top + CH - ((v - minV) / (maxV - minV)) * CH;

    // Grid lines + labels
    [25, 50, 75, 100, 125, 150, 175, 200].forEach(val => {
      if (val < minV || val > maxV) return;
      const y = toY(val);
      ctx.strokeStyle = val === 100 ? 'rgba(197,165,114,0.2)' : 'rgba(197,165,114,0.06)';
      ctx.lineWidth = val === 100 ? 1 : 0.5;
      ctx.setLineDash(val === 100 ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(197,165,114,0.4)';
      ctx.font = "9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), PAD.left - 4, y + 3);
    });

    // Gold price in KRW (rising) — gold color
    const drawLine = (pts, color, fillColor) => {
      if (fillColor) {
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + CH);
        grad.addColorStop(0, fillColor); grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.moveTo(toX(0), PAD.top + CH);
        pts.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
        ctx.lineTo(toX(pts.length - 1), PAD.top + CH);
        ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
      }
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.lineJoin = 'round'; ctx.setLineDash([]);
      pts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
      ctx.stroke();
      // End dot
      const last = pts[pts.length - 1];
      ctx.beginPath(); ctx.arc(toX(pts.length - 1), toY(last), 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    };

    drawLine(krwPowerIdx, '#f87171', 'rgba(248,113,113,0.08)');  // KRW power — falling red
    drawLine(goldKRWIdx, '#C5A572', 'rgba(197,165,114,0.12)');   // Gold in KRW — rising gold

    // X-axis year labels
    ctx.fillStyle = 'rgba(138,125,107,0.5)';
    ctx.font = "9px 'JetBrains Mono',monospace";
    ctx.textAlign = 'center';
    slice.forEach((d, i) => {
      if (d[1] === 1) { // January of each year
        ctx.fillText(d[0].toString(), toX(i), H - 6);
        ctx.strokeStyle = 'rgba(197,165,114,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(toX(i), PAD.top); ctx.lineTo(toX(i), PAD.top + CH); ctx.stroke();
      }
    });

    // Baseline label
    ctx.fillStyle = 'rgba(197,165,114,0.5)';
    ctx.font = "9px 'JetBrains Mono',monospace";
    ctx.textAlign = 'left';
    ctx.fillText(ko ? `${startYear}년 1월 = 100` : `Jan ${startYear} = 100`, PAD.left + 4, toY(100) - 5);

  }, [vis, startYear, lang]);

  const fmt = n => Math.round(n).toLocaleString('ko-KR');

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transition: 'opacity 0.8s ease',
      borderBottom: '1px solid rgba(197,165,114,0.08)', background: '#0a0a0a'
    }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 72 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 24 : 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>
              {ko ? '원화 구매력 vs 금 — 실제 데이터' : 'KRW Purchasing Power vs Gold — Live Data'}
            </div>
            <h2 style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 24 : 34, color: '#f5f0e8', fontWeight: 300, margin: 0 }}>
              {ko ? <>원화는 약해지고, <span style={{ color: '#c5a572' }}>금은 강해집니다.</span></> : <>KRW weakens. <span style={{ color: '#c5a572' }}>Gold strengthens.</span></>}
            </h2>
          </div>
          {/* Year toggle */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {YEARS.map(yr => (
              <button key={yr} onClick={() => setStartYear(yr)} style={{
                background: startYear === yr ? 'rgba(197,165,114,0.15)' : 'transparent',
                border: `1px solid ${startYear === yr ? 'rgba(197,165,114,0.6)' : 'rgba(197,165,114,0.15)'}`,
                color: startYear === yr ? '#C5A572' : '#555',
                padding: '5px 12px', cursor: 'pointer',
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em',
                transition: 'all 0.2s',
              }}>{yr}</button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            {
              label: ko ? `${startYear}년 ₩100만원 구매력` : `₩1M gold buying power in ${startYear}`,
              val: `${gramsBase.toFixed(2)}g`,
              sub: ko ? '당시 구매 가능한 금' : 'gold purchasable then',
              color: '#c5a572',
            },
            {
              label: ko ? `오늘 ₩100만원 구매력` : `₩1M gold buying power today`,
              val: `${gramsNow.toFixed(2)}g`,
              sub: ko ? `${purchasePowerLoss.toFixed(1)}% 감소` : `${purchasePowerLoss.toFixed(1)}% less gold`,
              color: '#f87171',
            },
            {
              label: ko ? '원화 구매력 손실 (금 기준)' : 'KRW purchasing power lost (vs gold)',
              val: `-${purchasePowerLoss.toFixed(1)}%`,
              sub: ko ? `${startYear}년 이후` : `since ${startYear}`,
              color: '#f87171',
            },
            {
              label: ko ? '같은 금 매입에 필요한 추가 원화' : 'More KRW needed to buy same gold',
              val: `+${debasementPct.toFixed(1)}%`,
              sub: ko ? `${startYear}년 이후 원화 기준 금값 상승` : `gold price rise in KRW since ${startYear}`,
              color: '#4ade80',
            },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(197,165,114,0.1)', padding: '14px 16px' }}>
              <div style={{ fontFamily: SANS, fontSize: 10, color: '#555', marginBottom: 6, lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontFamily: MONO, fontSize: isMobile ? 18 : 22, color: s.color, fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#444', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: '#0d0b08', border: '1px solid rgba(197,165,114,0.1)', padding: '16px 12px 8px', marginBottom: 12 }}>
          <canvas ref={chartRef} height={200} style={{ display: 'block', width: '100%' }} />
        </div>

        {/* Legend + disclaimer */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.6)' }}>— {ko ? '원화 기준 금값 (상승)' : 'Gold price in KRW (rising)'}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(248,113,113,0.5)' }}>— {ko ? '₩100만원의 금 구매력 (하락)' : 'KRW purchasing power in gold (falling)'}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: '#333' }}>
          {ko ? `* LBMA 실제 월별 종가 · 한국은행 환율 기준 · ${startYear}년 1월 = 100 인덱스` : `* LBMA actual monthly closing prices · Bank of Korea exchange rates · Jan ${startYear} = 100 index`}
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ navigate, prices, krwRate, currency, setCurrency, lang }) {
  const isMobile = useIsMobile();
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const pad = isMobile ? '32px 0' : '72px 0';

  useEffect(() => { const c = initMagneticCards(); return c; }, []);

  const goldKR  = prices.gold * krwRate * (1 + KR_GOLD_PREMIUM);
  const goldAU  = prices.gold * (1 + AURUM_GOLD_PREMIUM) * krwRate;
  const goldSave = goldKR - goldAU;
  const goldSavePct = (goldSave / goldKR * 100).toFixed(1);
  const KG = 1000 / OZ_IN_GRAMS;
  const silvKR  = (prices.silver||32.15) * KG * krwRate * (1 + KR_SILVER_PREMIUM);
  const silvAU  = (prices.silver||32.15) * KG * (1 + AURUM_SILVER_PREMIUM) * krwRate;
  const silvSave = silvKR - silvAU;
  const silvSavePct = (silvSave / silvKR * 100).toFixed(1);

  const IconBox = ({ children }) => (
    <div style={{ width:44,height:44,background:'#141414',border:'1px solid rgba(197,165,114,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#c5a572' }}>
      {children}
    </div>
  );

  const whyItems = [
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="17.5" x2="12" y2="19"/></svg></IconBox>, title: lang==='ko'?'완전 배분 보관 — 귀하의 금속, 귀하의 이름':'Fully Allocated Storage — Your Metal, Your Name', content: lang==='ko'?'귀하의 금속은 다른 어떤 고객의 자산과도 절대 혼합되지 않습니다. 싱가포르 Malca-Amit 자유무역지대 금고에 고유 일련번호와 함께 귀하의 명의로 영구 등록됩니다. 시중은행 금통장과 달리, 귀하의 금은 은행의 자산이 아닙니다 — 법적으로 귀하의 소유입니다.':'Your metal is never commingled with other clients. Registered in your name with a unique serial number at the Malca-Amit Singapore FTZ vault.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/><line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2"/></svg></IconBox>, title: lang==='ko'?'국제 현물가 직거래 — 김치 프리미엄 없음':'International Spot Price — No Kimchi Premium', content: lang==='ko'?'국내 소매 채널에서의 금 구매에는 국제 현물가 대비 구조적 프리미엄이 포함됩니다 — 10% 부가세가 영구적으로 적용되기 때문입니다. Aurum은 LBMA 국제 현물가 기준의 단일 투명 수수료만 적용합니다. 숨겨진 비용 없음. 위 계산기에서 오늘 절감액을 직접 확인하십시오.':'Domestic gold retail channels carry a structural premium over international spot — due to permanent 10% VAT. Aurum applies a single transparent fee at LBMA international spot. No hidden costs. Verify your savings today with the calculator above.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></IconBox>, title:"Lloyd's of London — "+(lang==='ko'?'기관급 전액 보험':'Full Institutional Insurance'), content: lang==='ko'?"귀하의 모든 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 물리적 손실 모두 포함됩니다. 보험 증명서는 요청 시 즉시 제공되며, 독립 감사 기관이 매일 보유 현황을 검증하고 그 결과를 공개합니다.":"All held metals are fully covered by Lloyd's of London institutional insurance. Covers natural disaster, theft, and physical loss. Insurance certificates available on request. An independent auditor verifies and publishes holdings daily." },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg></IconBox>, title: lang==='ko'?'LBMA 승인 바 & 언제든 실물 인출':'LBMA-Approved Bars & Physical Withdrawal Anytime', content: lang==='ko'?'모든 금속은 LBMA 승인 제련소 — PAMP Suisse, Argor-Heraeus, Valcambi, RCM — 의 정품 바입니다. 100g 이상 보유 시 실물 바로 무료 전환하거나, 언제든 원화로 즉시 정산하실 수 있습니다. 추가 수수료 없음.':'All metals are from LBMA-approved refiners — PAMP Suisse, Argor-Heraeus, Valcambi, RCM. Free conversion to a physical bar at 100g+, or instant KRW settlement anytime. No additional fees.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="11" y2="17"/><polyline points="11 13 12.5 15 16 11"/></svg></IconBox>, title: lang==='ko'?'매일 공개 감사 · 100% 실물 백킹':'Daily Public Audit · 100% Physical Backing', content: lang==='ko'?'모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 레버리지, 재담보, 파생상품 노출 일체 없습니다. 귀하의 금은 귀하의 금입니다.':'100% physical backing for every AGP gram and allocated metal is published daily in the audit report. No leverage, no rehypothecation, no derivatives exposure. Your gold is your gold.' },
  ];

  return (
    <div>
      {/* ① HERO — caption left + animated visual right */}
      <div style={{ position:'relative', minHeight:isMobile?'auto':560, background:'linear-gradient(135deg,#0a0a0a,#141414 40%,#0a0a0a)', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 40px)', pointerEvents:'none' }} />
        {!isMobile && <div style={{ position:'absolute', top:'50%', right:'6%', transform:'translateY(-50%)', width:520, height:520, background:'radial-gradient(ellipse, rgba(197,165,114,0.09) 0%, transparent 65%)', pointerEvents:'none' }} />}
        {!isMobile && <div style={{ position:'absolute', bottom:'10%', right:'12%', width:280, height:280, background:'radial-gradient(ellipse, rgba(197,165,114,0.04) 0%, transparent 65%)', pointerEvents:'none' }} />}
        <div className="aurum-container" style={{ position:'relative', zIndex:1, display:isMobile?'block':'flex', alignItems:'center', gap:isMobile?0:80, paddingTop:isMobile?32:96, paddingBottom:isMobile?40:96, width:'100%' }}>
          {/* Left: caption */}
          <div style={{ flex:1, maxWidth:isMobile?'100%':520 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'nowrap', overflow:'hidden' }}>
              <div style={{ width:28, height:1, background:'#c5a572', flexShrink:0 }} />
              <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:isMobile?12:14, color:'#c5a572', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                {lang==='ko'?'싱가포르 PSPM법 2019 등록 딜러':'Singapore PSPM Act 2019 Registered Dealer'}
              </span>
              <span style={{ color:'#8a7d6b' }}>·</span>
              <span style={{ fontFamily:MONO, fontSize:isMobile?10:11, color:'#c5a572', letterSpacing:'0.16em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                {lang==='ko'?'한국 투자자 전용':'For Korean Investors'}
              </span>
              {!isMobile && <div style={{ width:28, height:1, background:'#c5a572', flexShrink:0 }} />}
            </div>
            <h1 style={{ fontFamily:lang==='ko'?T.serifKrDisplay:SERIF, fontSize:isMobile?32:54, fontWeight:300, color:'#f5f0e8', lineHeight:1.1, margin:'0 0 20px' }}>
              {lang==='ko'
                ?(<><span style={{ color:'#c5a572', fontWeight:400, fontStyle:'italic', fontFamily:T.serif }}>오늘도 내고 계십니까?</span><br />국제 현물가로 바꾸십시오.</>)
                :(<><span style={{ color:'#c5a572', fontWeight:300, fontStyle:'italic', fontFamily:SERIF }}>Gold on your terms.</span></>)}
            </h1>
            <p style={{ fontFamily:SANS, fontSize:isMobile?14:16, color:'#a09080', lineHeight:1.95, margin:'0 0 10px' }}>
              {lang==='ko'
                ?'시중 은행 금통장, 국내 귀금속 딜러 — 모두 국제 현물가 대비 구조적 프리미엄이 포함됩니다. 10% 부가세가 영구적으로 적용되기 때문입니다. Aurum은 싱가포르에서, LBMA 국제 현물가로 직접 거래합니다.'
                :'Korean bank accounts and domestic dealers all carry a structural premium over international spot — due to 10% permanent VAT. Aurum trades directly at LBMA international spot price, in Singapore.'}
            </p>
            {/* Live Kimchi Premium strip */}
            {prices?.gold && krwRate ? (() => {
              const gap = Math.round((prices.gold * krwRate * 0.20));
              return (
                <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.35)', padding:'9px 16px', marginBottom:20, width:'fit-content' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#f87171', flexShrink:0, animation:'pulse 1s ease-in-out infinite' }} />
                  <span style={{ fontFamily:MONO, fontSize:isMobile?12:13, color:'#f87171', letterSpacing:'0.08em', fontWeight:600, animation:'kimchiBlink 2s ease-in-out infinite' }}>
                    {lang==='ko' ? `김치 프리미엄 지금: +20% · ₩${gap.toLocaleString('ko-KR')}/oz` : `Kimchi Premium now: +20% · ₩${gap.toLocaleString('ko-KR')}/oz`}
                  </span>
                </div>
              );
            })() : null}
            <div style={{ display:'flex', gap:12, flexDirection:isMobile?'column':'row' }}>
              <button onClick={() => navigate('shop-physical')} style={{ flex:1, background:'linear-gradient(135deg,#c5a572,#8a6914)', color:'#fff', border:'none', padding:'14px 20px', fontSize:15, fontFamily:SANS, fontWeight:700, borderRadius:0, cursor:'pointer' }}>
                {lang==='ko'?'국제 현물가로 시작하기 →':'Start at International Spot →'}
              </button>
              <button onClick={() => navigate('agp')} style={{ flex:1, background:'transparent', color:'#a09080', border:'1px solid #282828', padding:'14px 20px', fontSize:15, fontFamily:SANS, fontWeight:600, borderRadius:0, cursor:'pointer' }}>
                {lang==='ko'?'다음 달부터 자동으로 · ₩200K/월부터':'Auto-accumulate · from ₩200K/mo'}
              </button>
            </div>
            <div style={{ marginTop:14, display:'flex', gap:isMobile?10:16, flexWrap:'nowrap', overflow:'hidden', justifyContent:isMobile?'flex-start':'flex-start' }}>
              {(lang==='ko'
                ?["Lloyd's 보험",'LBMA 승인','배분 보관','매일 감사','🇸🇬 MAS']
                :["Lloyd's Insured",'LBMA Approved','Allocated','Daily Audit','🇸🇬 MAS']
              ).map((t,i)=>(
                <span key={i} style={{ fontFamily:MONO, fontSize:isMobile?10:11, color:'#8a7d6b', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>✓ {t}</span>
              ))}
            </div>
          </div>
          {/* Right: animated canvas visual */}
          {!isMobile && (
            <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
              <HeroSplitWidget prices={prices} krwRate={krwRate} lang={lang} goldKR={goldKR} goldAU={goldAU} />
            </div>
          )}
        </div>
      </div>

      {/* ── MARKET ANALYTICS — right after hero, most powerful conversion section ── */}
      {(() => {
        return (
        <div style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 64, paddingBottom: isMobile ? 32 : 64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?20:36 }}>
            <span style={{ fontFamily:MONO, fontSize:10, color:'rgba(197,165,114,0.5)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              {lang==='ko'?'실시간 시장 분석 도구 · LBMA 월간 데이터 2020–2024':'Live Market Analytics · LBMA Monthly Data 2020–2024'}
            </span>
            <h2 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?22:32, color:'#f5f0e8', fontWeight:300, margin:'8px 0 0' }}>
              {lang==='ko'?<>시장이 보여주는 것 — <span style={{ color:'#c5a572' }}>직접 확인하십시오</span></> : <>What the market shows — <span style={{ color:'#c5a572' }}>see for yourself</span></>}
            </h2>
          </div>
          <PriceChartsSection prices={prices} krwRate={krwRate} lang={lang} isMobile={isMobile} />
          <MarketRatios lang={lang} prices={prices} krwRate={krwRate} />
          {/* §11 — Savings chart with copy */}
          <div style={{ marginTop:32, marginBottom:8 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:'rgba(197,165,114,0.5)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
              {lang==='ko'?'은행 예금 vs 금 적립: 5년 성과':'Bank Savings vs Gold AGP: 5-Year Performance'}
            </div>
            <h3 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:isMobile?20:26, color:'#f5f0e8', fontWeight:300, margin:'0 0 8px' }}>
              {lang==='ko'?<>₩10만원씩 5년, <span style={{color:'#c5a572'}}>지금 얼마입니까?</span></> : <>₩100K/month for 5 years — <span style={{color:'#c5a572'}}>what is it worth today?</span></>}
            </h3>
            <p style={{ fontFamily:SANS, fontSize:13, color:'#8a7d6b', lineHeight:1.8, maxWidth:680, marginBottom:16 }}>
              {lang==='ko'?'2020년 1월부터 매달 ₩100,000씩 (a) 은행 정기예금에 납입했다면, (b) Aurum AGP 방식으로 금을 적립했다면 — 오늘 각각의 가치는 얼마일까요? 실제 금 가격 데이터와 한국은행 기준금리 기반으로 계산한 숫자입니다.':'Starting January 2020, investing ₩100,000/month into (a) a bank time deposit, or (b) gold accumulation via Aurum AGP — what is each worth today? Calculated using actual gold price data and Bank of Korea benchmark rates.'}
            </p>
          </div>
          <div style={{ marginTop:20, textAlign:'center' }}>
            <button onClick={() => navigate('register')} style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'14px 36px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
              {lang==='ko'?'가입하고 직접 확인하기 →':'Join and verify yourself →'}
            </button>
          </div>
        </div>
        </div>
        );
      })()}

      {/* ⑤ Paper vs Physical — split-grid visual table */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.08);
        const pvpRows = [
          { label: lang==='ko'?'구매 시 부가세':'Purchase VAT',       bad: lang==='ko'?'10% 즉시 발생':'10% immediately',         good: 'GST 0%' },
          { label: lang==='ko'?'실물 보유':'Physical Ownership',       bad: lang==='ko'?'✗ 은행 장부상 숫자':'✗ Bank ledger entry, not metal',     good: lang==='ko'?'✓ LBMA 실물 바':'✓ LBMA Physical Bar' },
          { label: lang==='ko'?'배분 보관':'Allocated Storage',         bad: lang==='ko'?'✗ 혼합 보관 · 재담보 위험':'✗ Pooled / rehypothecation risk', good: lang==='ko'?'✓ 완전 배분':'✓ Fully Segregated' },
          { label: lang==='ko'?'파산 보호':'Insolvency Protection',     bad: lang==='ko'?'✗ 예금자보호 적용 불가':'✗ Not covered by deposit insurance',                   good: lang==='ko'?'✓ 법적 분리':'✓ Legally Separated' },
          { label: lang==='ko'?'일련번호':'Serial Number',              bad: lang==='ko'?'✗ 없음':'✗ None',                           good: lang==='ko'?'✓ 고유 식별':'✓ Unique ID' },
          { label: lang==='ko'?'실물 인출':'Physical Withdrawal',       bad: lang==='ko'?'제한적 · 추가 부가세 부과':'Restricted · additional VAT applies',           good: lang==='ko'?'✓ 언제든 가능':'✓ Anytime' },
          { label: lang==='ko'?'관할권 분산':'Jurisdiction',            bad: lang==='ko'?'국내 규제만 적용 · FX 노출':'Korea regulation only · FX exposure',                    good: lang==='ko'?'싱가포르 + 한국 이중':'Singapore + Korea Dual' },
        ];
        return (
        <div ref={ref} style={{ borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 72, paddingBottom: isMobile ? 32 : 64 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '금통장을 가지고 계십니까?' : 'Do You Hold a Bank Gold Account?'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 26 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>
              {lang === 'ko' ? <>금을 소유하는 두 가지 방법.<br /><span style={{ color: '#c5a572' }}>진짜는 하나입니다.</span></> : <>Two ways to own gold.<br /><span style={{ color: '#c5a572' }}>Only one is real.</span></>}
            </h2>
          </div>
          {/* Two-card split */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            {/* Paper card */}
            <div style={{ background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,rgba(248,113,113,0.8),rgba(248,113,113,0.2))' }} />
              <div style={{ padding: isMobile ? '20px 18px' : '28px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{lang === 'ko' ? '금통장 · ETF · 선물' : 'Bank Gold / ETF / Futures'}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: 'rgba(248,113,113,0.6)' }}>{lang === 'ko' ? '"숫자를 보유합니다 — 금이 아닙니다"' : '"You hold a number — not metal"'}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'rgba(248,113,113,0.15)', margin: '16px 0' }} />
                {pvpRows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < pvpRows.length - 1 ? '1px dashed rgba(248,113,113,0.1)' : 'none' }}>
                    <div style={{ width: 22, height: 22, border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: '#f87171', fontWeight: 700 }}>✗</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: SANS, fontSize: 11, color: '#666' }}>{r.label} — </span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: '#f87171' }}>{r.bad.replace('✗ ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Aurum card */}
            <div style={{ background: 'rgba(197,165,114,0.04)', border: '1px solid rgba(197,165,114,0.35)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 3, background: `linear-gradient(90deg,${T.gold},rgba(197,165,114,0.2))` }} />
              <div style={{ padding: isMobile ? '20px 18px' : '28px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, border: `1px solid rgba(197,165,114,0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(197,165,114,0.08)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: T.gold, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{lang === 'ko' ? '실물 배분 금속 — Aurum' : 'Allocated Physical — Aurum'}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: 'rgba(197,165,114,0.6)' }}>{lang === 'ko' ? <>금 <em style={{ color: T.gold }}>자체</em>를 소유합니다</> : <>You own the gold <em style={{ color: T.gold }}>itself</em></>}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'rgba(197,165,114,0.15)', margin: '16px 0' }} />
                {pvpRows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < pvpRows.length - 1 ? '1px dashed rgba(197,165,114,0.1)' : 'none' }}>
                    <div style={{ width: 22, height: 22, border: `1px solid rgba(197,165,114,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(197,165,114,0.06)' }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: '#4ade80', fontWeight: 700 }}>✓</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: SANS, fontSize: 11, color: '#a09080' }}>{r.label} — </span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: '#4ade80' }}>{r.good.replace('✓ ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <KumtongConverter prices={prices} krwRate={krwRate} lang={lang} />
        </div>
        </div>
        );
      })()}

      {/* ② AGP Launch Event — full-width pane */}
      <AGPLaunchPane lang={lang} navigate={navigate} prices={prices} krwRate={krwRate} />

      <HowItWorks lang={lang} isMobile={isMobile} />

      <SealDivider />

      <KimchiPremiumMeter prices={prices} krwRate={krwRate} lang={lang} goldKR={goldKR} goldAU={goldAU} />

      {/* ④ Savings comparison — with visual premium bars */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.1);
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(20px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 32 : 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={eyebrowStyle}>{lang === 'ko' ? '오늘 국내에서 금을 사신다면' : 'If You Buy Gold Domestically Today'}</span>
              <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? `₩1,000만원 투자 시, 약 ₩${Math.round((goldKR-goldAU)/goldAU*10000000/10000).toLocaleString('ko-KR')}만원을 더 내게 됩니다.` : `At ₩10M invested, you overpay approx ₩${Math.round((goldKR-goldAU)/goldAU*10000000/10000).toLocaleString('ko-KR')}.`}</h2>
              <p style={{ fontFamily: SANS, fontSize: 13, color: '#8a7d6b', margin: '6px 0 0' }}>{lang === 'ko' ? 'Aurum 매입가 vs 국내 소매가 기준 (부가세 포함)' : 'Aurum Price vs Domestic Retail (VAT included)'}</p>
            </div>
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: 'rgba(197,165,114,0.08)', border: '1px solid rgba(197,165,114,0.4)', color: '#c5a572', padding: '5px 14px', cursor: 'pointer', fontFamily: MONO, fontSize: 11, borderRadius: 4, alignSelf: 'flex-start' }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          <PersonalOverpayCalc goldKR={goldKR} goldAU={goldAU} lang={lang} isMobile={isMobile} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { label: lang === 'ko' ? '금 Gold' : 'Gold', unit: '1 oz', kr: goldKR, au: goldAU, save: goldSave, pct: goldSavePct, krPrem: 20, auPrem: 8 },
              { label: lang === 'ko' ? '은 Silver' : 'Silver', unit: '1 kg', kr: silvKR, au: silvAU, save: silvSave, pct: silvSavePct, krPrem: 30, auPrem: 15 },
            ].map((c, i) => (
              <div key={i} className="magnetic-card" style={{ background: '#141414', border: '1px solid rgba(197,165,114,0.20)', padding: '22px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={GOLD_LINE} />
                {/* Eyebrow: serif italic metal label + mono product line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 20, height: 1, background: '#c5a572', flexShrink: 0 }} />
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? 16 : 20, color: T.gold, fontWeight: 400 }}>{c.label.split(' ')[0]}</span>
                  <span style={{ color: T.goldDim, fontSize: 10 }}>·</span>
                  <span style={{ fontFamily: MONO, fontSize: isMobile ? 10 : 11, color: T.goldDim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{c.label.split(' ').slice(1).join(' ')} · {c.unit}</span>
                </div>
                {[
                  { l: lang === 'ko' ? '국내 소매가 (VAT 포함)' : 'Domestic Retail (VAT incl.)', v: fP(c.kr / krwRate), col: '#f87171' },
                  { l: lang === 'ko' ? 'Aurum 매입가 (LBMA 현물 기준)' : 'Aurum Price (LBMA spot)', v: fP(c.au / krwRate), col: '#c5a572' },
                ].map((r, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #1e1e1e' }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#a09080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{r.l}</span>
                    <span style={{ fontFamily: MONO, fontSize: 16, color: r.col, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                {/* ── Visual premium bars ── */}
                <div style={{ margin: '16px 0 12px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                      {lang === 'ko' ? '프리미엄 시각화' : 'Premium Visualized'}
                    </div>
                    {[
                      { label: lang === 'ko' ? '한국 시장' : 'Korea Retail', pct: c.krPrem, color: '#f87171', full: true },
                      { label: 'Aurum', pct: c.auPrem, color: '#c5a572', full: false },
                    ].map((bar, bi) => (
                      <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: '#666', width: 72, flexShrink: 0 }}>{bar.label}</span>
                        <div style={{ flex: 1, height: isMobile ? 4 : 5, background: '#1e1e1e', position: 'relative', overflow: 'hidden' }}>
                          <div style={{
                            position: 'absolute', left: 0, top: 0, height: '100%',
                            background: `linear-gradient(90deg, ${bar.color}, ${bar.color}88)`,
                            width: vis ? `${bar.full ? 100 : (bar.pct / c.krPrem) * 100}%` : '0%',
                            transition: `width 1.2s cubic-bezier(0.25,1,0.5,1) ${0.3 + bi * 0.25}s`,
                            boxShadow: `0 0 8px ${bar.color}44`,
                          }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: bar.color, width: 34, flexShrink: 0, textAlign: 'right' }}>+{bar.pct}%</span>
                      </div>
                    ))}
                  </div>
                <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', padding: '12px 14px', marginTop: isMobile ? 12 : 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>{lang === 'ko' ? '오늘 귀하의 절감액' : 'Your savings today'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: MONO, fontSize: isMobile ? 18 : 22, color: '#4ade80', fontWeight: 700 }}>{fP(c.save / krwRate)}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555' }}>{c.pct}% {lang === 'ko' ? '절약' : 'saved'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        );
      })()}


      {/* ④.5 Founders Club — full-width pane */}
      <FoundersClubPane lang={lang} navigate={navigate} krwRate={krwRate} />

      <KRWDebasementSection lang={lang} isMobile={isMobile} />

      {/* GC_REVIEW_REQUIRED */}
      <LegalSafetyFAQ lang={lang} navigate={navigate} />

      <SealDivider />

      {/* ⑥ Why Aurum — 2-col desktop: accordion left + account visual right */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.06);
        return (
        <div ref={ref} style={{ borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 40 : 64 }}>
          <div style={{ display: isMobile ? 'block' : 'flex', gap: 64, alignItems: 'center' }}>
            {/* Left: accordion */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <div style={{ marginBottom: 28 }}>
                <span style={eyebrowStyle}>{lang === 'ko' ? 'Aurum이 다른 이유' : 'Why Aurum Is Different'}</span>
                <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '5가지 확실한 근거' : 'Five Concrete Reasons'}</h2>
              </div>
              <Accordion items={whyItems} />
            </div>
            {/* Right: animated account card (desktop only) */}
            {!isMobile && (
              <div style={{ flex: '0 0 320px', position: 'sticky', top: 100 }}>
                <style>{`
                  @keyframes card-scan { 0%{top:-100%} 100%{top:200%} }
                  @keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
                `}</style>
                <div style={{ background: 'rgba(197,165,114,0.04)', border: '1px solid rgba(197,165,114,0.25)', padding: 28, position: 'relative', overflow: 'hidden' }}>
                  <div style={GOLD_LINE} />
                  {/* Scan line effect */}
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(197,165,114,0.3),transparent)', animation: 'card-scan 3s linear infinite', pointerEvents: 'none' }} />
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: '#8a7d6b', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>Aurum Allocated Account</div>
                      <div style={{ fontFamily: MONO, fontSize: 13, color: '#c5a572' }}>AU-0001234</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#4ade80' }}>ACTIVE</span>
                    </div>
                  </div>
                  {/* Metal detail */}
                  <div style={{ background: 'rgba(197,165,114,0.06)', border: '1px solid rgba(197,165,114,0.15)', padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#8a7d6b', letterSpacing: '0.14em', marginBottom: 8, textTransform: 'uppercase' }}>Allocated Metal</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: SERIF, fontSize: 22, color: '#E3C187', fontWeight: 500 }}>1 oz Gold Bar</div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: '#8a7d6b', marginTop: 3 }}>PAMP Suisse · 999.9 Fine</div>
                      </div>
                      <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                        <rect x="1" y="1" width="38" height="26" rx="2" fill="url(#ingot-g)" stroke="rgba(197,165,114,0.5)" strokeWidth="1"/>
                        <defs>
                          <linearGradient id="ingot-g" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2a2418"/>
                            <stop offset="45%" stopColor="#C5A572"/>
                            <stop offset="55%" stopColor="#E3C187"/>
                            <stop offset="100%" stopColor="#4a3e26"/>
                          </linearGradient>
                        </defs>
                        <text x="20" y="17" textAnchor="middle" fontFamily="serif" fontSize="8" fill="rgba(20,18,14,0.8)" fontWeight="600">Au</text>
                      </svg>
                    </div>
                  </div>
                  {/* Serial number */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>Serial Number</div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: '#c5a572', letterSpacing: '0.06em' }}>
                      PAMP-2024-008-4219<span style={{ animation: 'blink-cursor 1s step-end infinite' }}>_</span>
                    </div>
                  </div>
                  {/* Storage */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>Storage Location</div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: '#a09080' }}>Malca-Amit FTZ · Singapore</div>
                  </div>
                  {/* Status row */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['FULLY ALLOCATED', "LLOYD'S INSURED", 'LBMA APPROVED'].map((tag, i) => (
                      <div key={i} style={{ fontFamily: MONO, fontSize: 10, color: '#8a7d6b', border: '1px solid rgba(197,165,114,0.15)', padding: '3px 6px', letterSpacing: '0.08em' }}>{tag}</div>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 12, color: '#555', marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
                  {lang === 'ko' ? '* 귀하의 실제 계정 화면 예시' : '* Example of your actual account view'}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
        );
      })()}


      {/* §13 — Final CTA section */}
      {(() => {
        const [refCTA, visCTA] = useScrollReveal(0.08);
        const gapVal = goldKR - goldAU;
        const gapPct = ((gapVal / goldAU) * 100).toFixed(1);
        return (
          <div ref={refCTA} style={{
            background: 'linear-gradient(180deg,#0d0b08,#111008)',
            borderTop: '1px solid rgba(197,165,114,0.1)',
            borderBottom: '1px solid rgba(197,165,114,0.1)',
            opacity: visCTA ? 1 : 0, transform: visCTA ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 96, paddingBottom: isMobile ? 48 : 96, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(197,165,114,0.5)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 16 }}>
                {lang === 'ko' ? '지금 시작하십시오' : 'Start Now'}
              </div>
              <h2 style={{ fontFamily: lang === 'ko' ? T.serifKrDisplay : SERIF, fontStyle: lang === 'ko' ? 'normal' : 'italic', fontSize: 'clamp(28px,4vw,52px)', fontWeight: lang === 'ko' ? 400 : 300, color: '#f5f0e8', margin: '0 0 16px', lineHeight: 1.1 }}>
                {lang === 'ko' ? '지금 시작하십시오.' : 'Start now.'}
              </h2>
              {/* Live kimchi premium callout */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)', padding: '10px 20px', marginBottom: 24 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: isMobile ? 11 : 13, color: '#f87171', fontWeight: 600 }}>
                  {lang === 'ko'
                    ? `국내 소매 채널에서의 금 구매 시 오늘 약 ${gapPct}% 추가 비용이 발생합니다`
                    : `Buying gold through domestic retail today costs approx ${gapPct}% more than international spot`}
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: isMobile ? 14 : 16, color: '#8a7d6b', lineHeight: 1.9, maxWidth: 560, margin: '0 auto 36px' }}>
                {lang === 'ko'
                  ? '국내 소매 채널의 구조적 프리미엄은 내일도 그럴 것입니다. 10% 부가세는 없어지지 않습니다. 오늘 원화를 국제 현물가 기준 실물 금으로 전환하십시오.'
                  : 'The structural premium in domestic retail will be there tomorrow too. 10% VAT does not go away. Convert your KRW to physical gold at international spot today.'}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                <button onClick={() => navigate('agp')} style={{ background: '#c5a572', border: 'none', color: '#0a0a0a', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, minWidth: 220 }}>
                  {lang === 'ko' ? 'AGP 자동 적금 시작하기 →' : 'Start AGP Auto-Savings →'}
                </button>
                <button onClick={() => navigate('shop-physical')} style={{ background: 'transparent', border: '1px solid rgba(197,165,114,0.4)', color: '#c5a572', padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: SANS, minWidth: 220 }}>
                  {lang === 'ko' ? '실물 금 구매하기 →' : 'Buy Physical Gold →'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ⑦ Shop cards — with scroll reveal */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.08);
        return (
        <div ref={ref} style={{ padding: pad, background: '#141414', borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {/* D-4: standardized eyebrow */}
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '시작 방법' : 'How to Start'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '어떻게 시작하시겠습니까?' : 'How Would You Like to Begin?'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { iconLines: ['AU', 'AG'], badge: lang === 'ko' ? '일회성 실물 구매' : 'One-time Physical Purchase', title: lang === 'ko' ? '실물 금·은 매매' : 'Physical Gold & Silver', desc: lang === 'ko' ? 'LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분.' : 'Buy LBMA-approved gold and silver bars outright. International spot + transparent premium, allocated to your account instantly.', bullets: lang === 'ko' ? ['1 oz ~ 1 kg 바·1/2 oz 코인', '한 번의 결제·싱가포르 영구 보관', '유선·카드·암호화폐 결제 지원'] : ['1 oz – 1 kg bars · ½ oz coins', 'One payment · Singapore permanent vault', 'Wire · Card · Crypto accepted'], cta: lang === 'ko' ? '제품 둘러보기' : 'Browse Products', route: 'shop-physical', featured: false },
              { iconLines: ['AGP'],      badge: lang === 'ko' ? '자동 적금 저축 플랜' : 'Auto Savings Plan', title: lang === 'ko' ? 'AGP 적금 Plan' : 'AGP 적금 Plan', desc: lang === 'ko' ? '월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환.' : 'Auto-accumulate gold by the gram from ₩200K/month. Pay by Toss auto-transfer, card, or crypto — convert to a physical bar when you hit 100g.', bullets: lang === 'ko' ? ['월 200,000원부터 시작', '매일·매주·매월 자동 적립', '100g 도달 시 실물 바 무료 전환'] : ['From ₩200,000/month', 'Daily · weekly · monthly auto-accumulation', 'Free physical bar conversion at 100g'], cta: lang === 'ko' ? 'AGP 시작하기' : 'Start AGP', route: 'agp-intro', featured: true },
            ].map((c, i) => (
                <div key={i} className="magnetic-card" onClick={() => navigate(c.route)}
                  style={{ background: c.featured ? 'rgba(197,165,114,0.04)' : '#0a0a0a', border: `1px solid ${c.featured ? 'rgba(197,165,114,0.35)' : '#1e1e1e'}`, padding: isMobile ? '24px 20px' : '32px 28px', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                  {c.featured && <div style={GOLD_LINE} />}
                  {c.featured && <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: MONO, fontSize: 10, color: '#0a0a0a', background: '#c5a572', padding: '3px 9px', letterSpacing: '0.18em' }}>추천</div>}
                  <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, border: '1px solid rgba(197,165,114,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: '#141414' }}>
                    {c.iconLines.map((line, li) => <span key={li} style={{ fontFamily: SERIF, fontSize: 14, color: '#c5a572', letterSpacing: '0.06em', lineHeight: 1.2 }}>{line}</span>)}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#8a7d6b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>{c.badge}</div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 24, color: '#f5f0e8', fontWeight: 500, margin: '0 0 12px' }}>{c.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: '#a09080', lineHeight: 1.9, marginBottom: 20, flex: 1 }}>{c.desc}</p>
                  <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 16 }}>
                    {c.bullets.map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: bi < c.bullets.length - 1 ? '1px dashed #1e1e1e' : 'none' }}>
                        <span style={{ color: '#c5a572', fontFamily: SANS, fontSize: 12, flexShrink: 0 }}>—</span>
                        <span style={{ fontFamily: SANS, fontSize: 13, color: '#f5f0e8', lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(197,165,114,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#c5a572', fontWeight: 500 }}>{c.cta}</span>
                    <span style={{ color: '#c5a572', fontSize: 16 }}>→</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        </div>
        );
      })()}

      {/* ⑧ Trust section — expanded premium partner section */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.1);
        const partners = [
          {
            abbr: 'SG', name: 'Malca-Amit FTZ', sub: lang==='ko'?'40년 귀금속 물류 선두. 싱가포르 FTZ 전용 배분 보관.':'40-year precious metals logistics leader. Singapore FTZ allocated storage.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="6" width="18" height="15" rx="1"/><path d="M3 10h18"/><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><circle cx="12" cy="15" r="2"/><line x1="12" y1="17" x2="12" y2="19"/></svg>
          },
          {
            abbr: "LL", name: "Lloyd's of London", sub: lang==='ko'?'전 세계 귀금속 보관 기관의 보험 기준. Aurum 보유 금속 전액 커버.':'Global standard for precious metals storage insurance. Full coverage of all Aurum holdings.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          },
          {
            abbr: 'LB', name: 'LBMA', sub: lang==='ko'?'국제 귀금속 거래의 글로벌 기준. Aurum은 LBMA 승인 바만 취급합니다.':'The global standard for precious metals trading. Aurum handles only LBMA-approved bars.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          },
          {
            abbr: 'AK', name: 'PSPM 2019 · MAS', sub: lang==='ko'?'싱가포르 PSPM법 2019 등록 딜러. MAS 규정 AML/KYC 완전 준수.':'Singapore PSPM Act 2019 registered dealer. Full MAS AML/KYC compliance.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 17.5 13 21 10"/></svg>
          },
          {
            abbr: 'AU', name: lang==='ko'?'매일 감사':'Daily Audit', sub: lang==='ko'?'독립 감사 기관 일일 검증. 레버리지·재담보 없음.':'Independent daily audit verification. No leverage or rehypothecation.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><polyline points="10 17 9 17 8 17"/><polyline points="10 13 11.5 15 15 11"/></svg>
          },
        ];
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderTop: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transition: 'opacity 0.8s ease' }}>
          {/* Top label */}
          <div style={{ borderBottom: '1px solid rgba(197,165,114,0.06)', paddingTop: isMobile?20:28, paddingBottom: isMobile?16:20, textAlign: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              {lang==='ko' ? '왜 Aurum을 믿을 수 있는가' : 'Why You Can Trust Aurum'}
            </span>
          </div>
          <div className="aurum-container">
            <VaultLocationDot lang={lang} />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: 0 }}>
              {partners.map((p, i) => (
                <div key={i} style={{
                  padding: isMobile ? '18px 8px' : '28px 16px', textAlign: 'center',
                  borderRight: isMobile ? (i%2===0 ? '1px solid rgba(197,165,114,0.06)' : 'none') : (i<4 ? '1px solid rgba(197,165,114,0.06)' : 'none'),
                  borderBottom: isMobile && i<4 ? '1px solid rgba(197,165,114,0.06)' : 'none',
                  gridColumn: isMobile && i===4 ? '1 / -1' : 'auto',
                  opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.6s ease ${i*0.08}s, transform 0.6s ease ${i*0.08}s`,
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile?8:10, color: '#c5a572', opacity: 0.7 }}>{p.icon}</div>
                  <div style={{ fontFamily: MONO, fontSize: isMobile?10:12, color: '#f5f0e8', fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: isMobile?10:11, color: '#666', lineHeight: 1.4 }}>{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(197,165,114,0.12),transparent)', margin: '0 0 0' }} />
        </div>
        );
      })()}
    </div>
  );
}
