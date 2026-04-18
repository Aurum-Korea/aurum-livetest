// HomePage.jsx — 4-pane layout: Hero | AGP Launch | Savings | Founders Club
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fUSD, fKRW, MONTHLY_DATA_2000, FC_GATES } from '../lib/index.jsx';
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

  // Silver mini-chart
  const silverRef = useRef(null);
  useEffect(() => {
    const canvas = silverRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cur = prices?.silver || 32.9;
    const pts = [];
    let p = cur * 0.96;
    for (let i = 0; i < 40; i++) {
      p += (Math.random() - 0.4) * (cur * 0.004);
      pts.push(Math.max(p, cur * 0.9));
    }
    pts.push(cur);
    let frame = 0; let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const prog = Math.min(frame / 60, 1);
      const visN = Math.max(2, Math.floor(prog * pts.length));
      const minP = Math.min(...pts) * 0.998, maxP = Math.max(...pts) * 1.002;
      const toX = i => 4 + (i / (pts.length - 1)) * (W - 8);
      const toY = v => H * 0.85 - ((v - minP) / (maxP - minP)) * (H * 0.65);
      if (visN >= 2) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, 'rgba(125,211,220,0.2)');
        grad.addColorStop(1, 'rgba(125,211,220,0)');
        ctx.beginPath();
        ctx.moveTo(toX(0), H * 0.85);
        for (let i = 0; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.lineTo(toX(visN - 1), H * 0.85);
        ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(pts[0]));
        for (let i = 1; i < visN; i++) ctx.lineTo(toX(i), toY(pts[i]));
        ctx.strokeStyle = '#7dd3dc'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
        if (prog > 0.75) {
          const ex = toX(visN - 1), ey = toY(pts[visN - 1]);
          ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#7dd3dc'; ctx.fill();
        }
      }
      frame++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [prices?.silver]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', maxWidth:500 }}>
      <canvas ref={canvasRef} width={500} height={330}
        style={{ display:'block', width:'100%', opacity:0.92 }} />
      {/* Silver mini chart */}
      <div style={{ background:'rgba(125,211,220,0.04)', border:'1px solid rgba(125,211,220,0.15)', padding:'8px 10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(125,211,220,0.7)', letterSpacing:'0.14em' }}>XAG/USD</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#7dd3dc', fontWeight:600 }}>${(prices?.silver||32.9).toFixed(2)}</span>
        </div>
        <canvas ref={silverRef} width={480} height={40}
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
function AGPLaunchPane({ lang, navigate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const tiers = [
    { nameEn:'Bronze',   name:'브론즈',   minVal:200000,  min:'₩200,000+',   gift:'₩50,000',   giftVal:50000    },
    { nameEn:'Silver',   name:'실버',     minVal:500000,  min:'₩500,000+',   gift:'₩200,000',  giftVal:200000   },
    { nameEn:'Gold',     name:'골드',     minVal:1000000, min:'₩1,000,000+', gift:'₩500,000',  giftVal:500000,  featured:true },
    { nameEn:'Platinum', name:'플래티넘', minVal:2000000, min:'₩2,000,000+', gift:'₩1,500,000',giftVal:1500000  },
    { nameEn:'Sovereign',name:'소브린',   minVal:5000000, min:'₩5,000,000+', gift:'₩5,000,000',giftVal:5000000  },
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
              {ko ? 'AGP 자동 적금 · 지금 가입 시 특별 혜택' : 'AGP Auto-Savings · Special offer'}
            </span>
          </div>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?30:44, fontWeight:400, color:'#f5f0e8', lineHeight:1.15, margin:'0 0 14px' }}>
            {ko ? <>매달 원화로,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>국제 현물가 그대로.</span></> : <>Monthly in KRW,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>at international spot.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? '시중 금통장 이자 0%, 국내 귀금속 딜러는 국제 현물가 대비 상당한 추가 비용. AGP는 다릅니다 — 매달 자동이체 한 번으로, 실물 금을 국제 현물가에 그램 단위로 쌓습니다. 가입 첫 달, 등급에 따라 최대 ₩5,000,000 상당의 금이 즉시 적립됩니다. 언제든 중단 가능.' : 'Bank gold accounts pay 0% interest; domestic dealers carry a significant premium over spot. AGP is different — one auto-debit a month, gold accumulates by the gram at international spot. Launch bonus up to ₩5M credited day one. Cancel anytime.'}
          </p>
          <div style={{ marginBottom:32 }}>
            {tiers.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', marginBottom:4, background:t.featured?'rgba(197,165,114,0.08)':'rgba(255,255,255,0.018)', border:`1px solid ${t.featured?'rgba(197,165,114,0.35)':'rgba(197,165,114,0.07)'}`, position:'relative', overflow:'hidden' }}>
                {t.featured && <div style={GOLD_LINE} />}
                <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:13, color:t.featured?'#E3C187':'#c5a572', minWidth:64 }}>{ko?t.name:t.nameEn}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#555', flex:1 }}>{t.min}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#8a7d6b' }}>{ko?'첫달 즉시 적립':'Day-1 Credit'}&nbsp;</span>
                <span style={{ fontFamily:MONO, fontSize:t.featured?15:13, color:t.featured?'#4ade80':'#c5a572', fontWeight:t.featured?700:600 }}>{t.gift}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('campaign-agp-launch')}
            style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.02em', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#E3C187'}
            onMouseLeave={e => e.currentTarget.style.background='#c5a572'}>
            {ko ? 'AGP 시작하기 →' : 'Start AGP →'}
          </button>
          <AGPAccumulatorCalc prices={prices} krwRate={krwRate} lang={lang} tiers={tiers} />
          <DualSavingsPanel prices={prices} krwRate={krwRate} lang={lang} />
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
function FoundersClubPane({ lang, navigate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const gates = [
    { num:'I',   label: ko?'시작의 문'   :'The Opening',      gmv:'₩7.2M',  disc:'−1.0%' },
    { num:'II',  label: ko?'셋의 표식'   :'The Three',        gmv:'₩21.6M', disc:'−1.5%' },
    { num:'III', label: ko?'정점'         :'The Apex',         gmv:'₩50.4M', disc:'−2.0%', apex:true },
    { num:'IV',  label: ko?'볼트 순례'   :'Vault Pilgrimage', gmv:'₩93.6M', disc:'−2.5%' },
    { num:'V',   label: ko?'평생의 표식' :'Lifetime Mark',    gmv:'₩144M',  disc:'−3.0%' },
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
            {ko ? <>살수록 낮아지는 가격 —<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>영원히 귀하의 것입니다.</span></> : <>The more you buy,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>the cheaper — forever yours.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? '한번 얻은 할인은 절대 사라지지 않습니다. Founders Club의 다섯 문을 통과할 때마다, 누적 구매 기준 할인율이 영구적으로 높아집니다. 귀하의 금 구매가 곧 귀하의 가격입니다.' : 'A discount earned is never lost. Each of the five gates permanently raises your rate — based on cumulative purchase volume. Your buying history is your price.'}
          </p>
          <div style={{ marginBottom:32 }}>
            {gates.map((g, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 72px 52px', gap:12, alignItems:'center', padding:'10px 14px', marginBottom:4, background:g.apex?'rgba(197,165,114,0.06)':'rgba(255,255,255,0.015)', border:`1px solid ${g.apex?'rgba(197,165,114,0.3)':'rgba(197,165,114,0.07)'}`, position:'relative', overflow:'hidden' }}>
                {g.apex && <div style={GOLD_LINE} />}
                <div style={{ width:24, height:24, borderRadius:'50%', border:`1.5px solid ${g.apex?'#c5a572':'rgba(197,165,114,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontStyle:'italic', fontSize:11, color:g.apex?'#c5a572':'#8a7d6b' }}>{g.num}</div>
                <span style={{ fontFamily:SANS, fontSize:13, color:g.apex?'#f5f0e8':'#a09080' }}>{g.label}{g.num==='V' ? (ko?' — Aurum 최저가, 영원히':' — Aurum lowest price, forever') : ''}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#555' }}>{g.gmv}</span>
                <span style={{ fontFamily:MONO, fontSize:13, color:g.apex?'#4ade80':'#c5a572', fontWeight:700, textAlign:'right' }}>{g.disc}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('founders')}
            style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.5)', color:'#c5a572', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(197,165,114,0.1)'; e.currentTarget.style.borderColor='#c5a572'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(197,165,114,0.5)'; }}>
            {ko ? '내 절감액 계산하기 →' : 'Calculate my savings →'}
          </button>
          <FoundersMiniCalc krwRate={krwRate} lang={lang} navigate={navigate} />
          <FoundersLeaderboard krwRate={krwRate} lang={lang} />
          <FoundersGateSimulator krwRate={krwRate} lang={lang} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// ALL NEW HOMEPAGE COMPONENTS
// DROP THIS ENTIRE BLOCK ABOVE: export default function HomePage(...)
// in src/pages/HomePage.jsx
//
// Required imports to add to top of HomePage.jsx:
//   import { T, useIsMobile, fUSD, fKRW, MONTHLY_DATA_2000, FC_GATES, OZ_IN_GRAMS,
//            KR_GOLD_PREMIUM, AURUM_GOLD_PREMIUM, KR_SILVER_PREMIUM, AURUM_SILVER_PREMIUM
//          } from '../lib/index.jsx';
// (Most already imported — add MONTHLY_DATA_2000, FC_GATES)
// ══════════════════════════════════════════════════════════════════════════════

// ─── useScrollReveal (already in file, keep existing) ─────────────────────────

// ─── C·01  HeroSplitWidget ────────────────────────────────────────────────────
function HeroSplitWidget({ prices, krwRate, lang, goldKR, goldAU }) {
  const animatedOnce = useRef(false);
  const [ref, vis] = useScrollReveal(0);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const gap = goldKR - goldAU;
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  const barMax = goldKR * 1.02;
  const bars = [
    { label: ko ? '국내 소매 채널' : 'Korea Retail',   val: goldKR, pct: goldKR/barMax*100, color: '#f87171' },
    { label: ko ? 'Aurum · LBMA 현물가' : 'Aurum',     val: goldAU, pct: goldAU/barMax*100, color: '#c5a572' },
  ];
  if (vis) animatedOnce.current = true;
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
            <div style={{ height:'100%',
              background:`linear-gradient(90deg,${bar.color},${bar.color}88)`,
              width: vis ? `${bar.pct.toFixed(1)}%` : '0%',
              boxShadow:`0 0 8px ${bar.color}44`,
              transition: animatedOnce.current ? 'none' : `width 1.4s cubic-bezier(0.25,1,0.5,1) ${i*0.25}s`,
            }} />
          </div>
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 14px', marginTop:4 }}>
        <span style={{ fontFamily:SANS, fontSize:12, color:'#f5f0e8' }}>{ko ? 'Aurum으로 절감' : 'Savings with Aurum'}</span>
        <span style={{ fontFamily:MONO, fontSize:20, color:'#4ade80', fontWeight:700, marginLeft:'auto' }}>{fKRW2(gap)}</span>
      </div>
      {prices?.silver && (
        <div style={{ background:'rgba(125,211,220,0.04)', border:'1px solid rgba(125,211,220,0.12)', padding:'7px 12px', marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:MONO, fontSize:10, color:'rgba(125,211,220,0.6)', letterSpacing:'0.14em' }}>XAG/USD · SILVER</span>
          <span style={{ fontFamily:MONO, fontSize:12, color:'#7dd3dc', fontWeight:600 }}>${prices.silver.toFixed(2)}</span>
        </div>
      )}
      <div style={{ fontFamily:MONO, fontSize:9, color:'#3a3028', marginTop:6 }}>
        {ko ? '* 국내 소매가 기준 모델 추정치 · LBMA 현물가 기준' : '* Model estimate vs domestic retail · LBMA spot basis'}
      </div>
    </div>
  );
}

// ─── C·02  KimchiPremiumMeter ─────────────────────────────────────────────────
// BUG FIX D1: prem is always ~10% (hardcoded constants). Relabeled as model estimate, tooltip added.
function KimchiPremiumMeter({ prices, krwRate, lang, goldKR, goldAU }) {
  const [showTip, setShowTip] = useState(false);
  const [ref, vis] = useScrollReveal(0.1);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const prem = (goldKR - goldAU) / goldKR * 100;
  const norm = Math.min(Math.max(prem / 25, 0), 1);
  const deg  = -140 + norm * 280;
  const rad  = (deg - 90) * Math.PI / 180;
  const nx   = (100 + 60 * Math.cos(rad)).toFixed(1);
  const ny   = (105 + 60 * Math.sin(rad)).toFixed(1);
  const zc   = prem < 8 ? '#4ade80' : prem < 15 ? '#fbbf24' : '#f87171';
  const zl   = ko ? (prem < 8 ? '낮음' : prem < 15 ? '보통' : '높음') : (prem < 8 ? 'Low' : prem < 15 ? 'Moderate' : 'Elevated');
  return (
    <div ref={ref} style={{ background:'#141414', borderBottom:'1px solid rgba(197,165,114,0.08)', padding:`${isMobile?20:24}px 0` }}>
      <div className="aurum-container" style={{ display:'flex', flexDirection:isMobile?'column':'row', alignItems:'center', justifyContent:'center', gap:40 }}>
        <div style={{ position:'relative', width:isMobile?180:220, height:isMobile?120:136, flexShrink:0 }}>
          <svg width="200" height="130" viewBox="0 0 200 130" style={{ width:'100%', height:'100%' }}>
            <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="#2a2520" strokeWidth="14" strokeLinecap="round"/>
            <path d="M 20 105 A 80 80 0 0 1 80 30"   fill="none" stroke="rgba(74,222,128,0.18)"   strokeWidth="14" strokeLinecap="round"/>
            <path d="M 80 30 A 80 80 0 0 1 145 30"   fill="none" stroke="rgba(251,191,36,0.18)"   strokeWidth="14" strokeLinecap="round"/>
            <path d="M 145 30 A 80 80 0 0 1 180 105" fill="none" stroke="rgba(248,113,113,0.18)"  strokeWidth="14" strokeLinecap="round"/>
            {vis && <line x1="100" y1="105" x2={nx} y2={ny} stroke={zc} strokeWidth="2.5" strokeLinecap="round"/>}
            <circle cx="100" cy="105" r="5" fill={zc}/>
          </svg>
          <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', textAlign:'center', minWidth:80 }}>
            <div style={{ fontFamily:MONO, fontSize:22, fontWeight:700, color:zc, lineHeight:1 }}>{vis ? prem.toFixed(1)+'%' : '—'}</div>
            <div style={{ fontFamily:SANS, fontSize:10, color:zc, marginTop:2 }}>{zl}</div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
            {ko ? '국내 소매 프리미엄 · LBMA 현물가 대비' : 'Domestic Retail Premium vs LBMA'}
            {/* D1 tooltip */}
            <span onClick={() => setShowTip(!showTip)} style={{ cursor:'pointer', fontFamily:MONO, fontSize:9, color:'#555', border:'1px solid #333', padding:'1px 6px', userSelect:'none' }}>?</span>
          </div>
          {showTip && (
            <div style={{ background:'#1a1a1a', border:'1px solid rgba(197,165,114,0.2)', padding:'8px 12px', fontFamily:SANS, fontSize:11, color:'#888', lineHeight:1.6, marginBottom:8, maxWidth:280 }}>
              {ko ? '국내 소매가 기준 모델 추정치입니다. KR_GOLD_PREMIUM(20%)과 Aurum 수수료(8%)의 구조적 차이를 반영합니다. 실시간 국내 시세 피드와는 다를 수 있습니다.' : 'Model estimate based on domestic retail premium (20% KR_GOLD_PREMIUM vs 8% Aurum fee). May differ from live domestic quotes.'}
            </div>
          )}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { l:ko?'오늘 추정치':'Estimate',  v:prem.toFixed(1)+'%', c:zc },
              { l:"Lloyd's of London",          v:ko?'전액 커버':'Full Cover', c:'#c5a572' },
              { l:'PSPM 2019 · MAS',            v:ko?'등록 딜러':'Registered', c:'#c5a572' },
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

// ─── C·03  KumtongConverter ───────────────────────────────────────────────────
// BUG FIX #11: label changed from "시중 금통장" to "국내 실물 금바 구매" (VAT applies to physical, not account)
function KumtongConverter({ prices, krwRate, lang }) {
  const [amt, setAmt] = useState(10000000);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const ppg = prices.gold * krwRate / OZ_IN_GRAMS;
  const localGrams = amt / (ppg * 1.10);  // 10% VAT on physical bar purchase
  const aurumGrams = amt / (ppg * (1 + AURUM_GOLD_PREMIUM));
  const extra = aurumGrams - localGrams;
  const fmt = v => (Math.round(v*1000)/1000).toFixed(3);
  return (
    <div style={{ background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.18)', padding:isMobile?'18px 14px':'22px 26px', marginTop:20, position:'relative' }}>
      <div style={GOLD_LINE}/>
      <span style={{...eyebrowStyle}}>{ko?'국내 실물 금바 vs Aurum — 실질 금 보유량':'Physical bar (domestic) vs Aurum — actual grams owned'}</span>
      <div style={{ fontFamily:SANS, fontSize:13, color:'#a09080', marginBottom:8 }}>
        {ko?'비교 금액:':'Amount:'} <strong style={{ fontFamily:MONO, color:'#f5f0e8' }}>₩{Math.round(amt/10000).toLocaleString('ko-KR')}만원</strong>
      </div>
      <input type="range" min="1000000" max="100000000" step="1000000" value={amt}
        style={{ width:'100%', marginBottom:16, minHeight:44 }} onChange={e=>setAmt(+e.target.value)}/>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
        {[
          { label:ko?'국내 실물 금바 구매 (VAT 포함)':'Korea physical bar (VAT)', g:localGrams, color:'#f87171', note:ko?'* 10% 부가세 포함':'* incl. 10% VAT' },
          { label:ko?'Aurum 구매 시 보유량':'Aurum purchase',                   g:aurumGrams, color:'#c5a572', note:ko?'* Aurum 수수료 적용 후':'* After Aurum fee' },
        ].map((item,i) => (
          <div key={i} style={{ background:'#141414', border:`1px solid ${item.color}44`, padding:'14px' }}>
            <div style={{ fontFamily:SANS, fontSize:11, color:'#8a7d6b', marginBottom:5 }}>{item.label}</div>
            <div style={{ fontFamily:MONO, fontSize:26, color:item.color, fontWeight:700, lineHeight:1 }}>{fmt(item.g)}<span style={{ fontSize:13, marginLeft:3 }}>g</span></div>
            <div style={{ fontFamily:SANS, fontSize:10, color:'#444', marginTop:5, fontStyle:'italic' }}>{item.note}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 14px', marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:SANS, fontSize:12, color:'#f5f0e8' }}>{ko?'Aurum으로 추가 보유 가능한 금':'Extra gold with Aurum'}</span>
        <span style={{ fontFamily:MONO, fontSize:22, color:'#4ade80', fontWeight:700 }}>+{fmt(extra)}g</span>
      </div>
    </div>
  );
}

// ─── C·04  PersonalOverpayCalc ────────────────────────────────────────────────
// BUG FIX D1: adds tooltip explaining model-based calculation
function PersonalOverpayCalc({ goldKR, goldAU, lang, isMobile }) {
  const [amt, setAmt] = useState(10000000);
  const [annual, setAnnual] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const ko = lang === 'ko';
  const mult   = annual ? 12 : 1;
  const korCost = Math.round(amt * (goldKR / goldAU));
  const savings  = korCost - amt;
  const fKRW2 = v => `₩${Math.round(v*mult).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:'#111', border:'1px solid rgba(197,165,114,0.2)', padding:isMobile?'18px 14px':'26px 30px', marginBottom:20, position:'relative' }}>
      <div style={GOLD_LINE}/>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <span style={{...eyebrowStyle, marginBottom:0 }}>{ko?'내 투자 금액으로 계산하기':'Calculate for your amount'}</span>
        <span onClick={()=>setShowTip(!showTip)} style={{ cursor:'pointer', fontFamily:MONO, fontSize:9, color:'#555', border:'1px solid #333', padding:'1px 6px', userSelect:'none', flexShrink:0 }}>?</span>
      </div>
      {showTip && (
        <div style={{ background:'#1a1a1a', border:'1px solid rgba(197,165,114,0.2)', padding:'8px 12px', fontFamily:SANS, fontSize:11, color:'#888', lineHeight:1.6, marginBottom:10 }}>
          {ko?'국내 소매가 기준 모델 추정치입니다. 실제 절감액은 구매 시점의 국내 시세에 따라 다를 수 있습니다.':'Model estimate vs domestic retail baseline. Actual savings may vary with live domestic quotes.'}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
        <span style={{ fontFamily:MONO, fontSize:isMobile?22:28, color:'#f5f0e8', fontWeight:700 }}>
          ₩{Math.round(amt/10000).toLocaleString('ko-KR')}만원
        </span>
        <label style={{ fontFamily:SANS, fontSize:11, color:'#8a7d6b', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
          <input type="checkbox" checked={annual} onChange={e=>setAnnual(e.target.checked)}/>
          {ko?'연간 환산 (×12)':'Annual (×12)'}
        </label>
      </div>
      <input type="range" min="1000000" max="100000000" step="1000000" value={amt}
        style={{ width:'100%', marginBottom:18, minHeight:44 }} onChange={e=>setAmt(+e.target.value)}/>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'1fr 1fr 1fr', gap:10 }}>
        {[
          { l:ko?'국내 소매 구매 시':'Korea retail', v:fKRW2(korCost), c:'#f87171', bg:'rgba(248,113,113,0.06)', bd:'rgba(248,113,113,0.2)' },
          { l:'Aurum',                               v:fKRW2(amt),    c:'#c5a572', bg:'rgba(197,165,114,0.05)', bd:'rgba(197,165,114,0.2)' },
          { l:ko?'절감 추정액':'Est. savings',        v:fKRW2(savings),c:'#4ade80', bg:'rgba(74,222,128,0.06)',  bd:'rgba(74,222,128,0.22)', span:isMobile },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, border:`1px solid ${s.bd}`, padding:'14px 16px', gridColumn:s.span?'1 / -1':'auto' }}>
            <div style={{ fontFamily:SANS, fontSize:11, color:s.c, marginBottom:4 }}>{s.l}</div>
            <div style={{ fontFamily:MONO, fontSize:isMobile?15:(i===2?20:15), color:s.c, fontWeight:700 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── C·05  AGPAccumulatorCalc ─────────────────────────────────────────────────
// BUG FIX #10: uses tier.nameKR / tier.nameEN not tier.name / tier.nameEn
function AGPAccumulatorCalc({ prices, krwRate, lang, tiers }) {
  const [monthly, setMonthly] = useState(1000000);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const ppg       = prices.gold * krwRate / OZ_IN_GRAMS * (1 + AURUM_GOLD_PREMIUM);
  const gramsPerMo = monthly / ppg;
  const totalG    = gramsPerMo * 12;
  const korEquiv  = totalG * prices.gold * krwRate / OZ_IN_GRAMS * (1 + KR_GOLD_PREMIUM);
  const savings   = korEquiv - monthly * 12;
  const tier      = tiers.slice().reverse().find(t => monthly >= (t.minVal ?? t.min)) || tiers[0];
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  return (
    <div style={{ background:'rgba(14,12,8,0.8)', border:'1px solid rgba(197,165,114,0.15)', padding:isMobile?'16px':'22px', marginTop:20 }}>
      <span style={{...eyebrowStyle}}>{ko?'12개월 적립 시뮬레이터':'12-month accumulator'}</span>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
        <span style={{ fontFamily:MONO, fontSize:18, color:'#f5f0e8', fontWeight:700 }}>
          ₩{Math.round(monthly/10000).toLocaleString()}{ko?'만원/월':'/mo'}
        </span>
        <span style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', background:'rgba(197,165,114,0.1)', padding:'3px 10px' }}>
          {ko ? (tier.nameKR || tier.name || '') : (tier.nameEN || tier.nameEn || '')} {ko?'티어':'tier'}
        </span>
      </div>
      <input type="range" min="200000" max="5000000" step="100000" value={monthly}
        style={{ width:'100%', marginBottom:16, minHeight:44 }} onChange={e=>setMonthly(+e.target.value)}/>
      <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:70, marginBottom:6 }}>
        {Array.from({length:12},(_,i) => (
          <div key={i} style={{ flex:1, height:`${Math.round(((i+1)/12)*60)}px`,
            background:i===11?'#c5a572':'rgba(197,165,114,0.22)', transition:'height 0.35s ease', position:'relative' }}>
            {i===11 && <div style={{ position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)', fontFamily:MONO, fontSize:9, color:'#c5a572', whiteSpace:'nowrap', marginBottom:2 }}>{totalG.toFixed(2)}g</div>}
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
        {[
          {l:ko?'12개월 적립':'12-mo grams', v:totalG.toFixed(3)+'g',  c:'#c5a572'},
          {l:ko?'국내 소매 환산':'Korea equiv.',v:fKRW2(korEquiv),       c:'#f87171'},
          {l:ko?'Aurum 총비용':'Aurum total', v:fKRW2(monthly*12),      c:'#8a7d6b'},
          {l:ko?'절감 추정액':'Est. savings', v:fKRW2(savings),         c:'#4ade80'},
        ].map((s,i) => (
          <div key={i} style={{ background:'#1a1a1a', padding:'9px 12px' }}>
            <div style={{ fontFamily:SANS, fontSize:10, color:'#555', marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:MONO, fontSize:13, color:s.c, fontWeight:600 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:13, color:'#c5a572' }}>
          + {ko ? (tier.nameKR || tier.name) : (tier.nameEN || tier.nameEn)} {ko?'첫달 즉시 적립':'Day-1 credit'}
        </span>
        <span style={{ fontFamily:MONO, fontSize:17, color:'#4ade80', fontWeight:700 }}>{tier.gift}</span>
      </div>
    </div>
  );
}

// ─── C·06  HowItWorks ────────────────────────────────────────────────────────
function HowItWorks({ lang, isMobile }) {
  const [ref, vis] = useScrollReveal(0.08);
  const ko = lang === 'ko';
  const steps = [
    { n:'STEP 01', t:ko?'신원 확인':'Verify Identity',
      d:ko?'NICE·KCB 본인인증으로 신원을 확인합니다 (1분 소요). 국제 AML 기준에 따른 KYC 절차이며, 한국 여권 또는 주민등록증이 필요합니다. 완료 후 즉시 구매 가능합니다.'
        :'NICE/KCB identity check (~1 min). International AML KYC. Korean passport or national ID required.' },
    { n:'STEP 02', t:ko?'구매 또는 적립':'Purchase or Accumulate',
      d:ko?'토스뱅크 자동이체, 신용·체크카드, 또는 국제 송금으로 결제합니다. 원화로 결제하시면 LBMA 국제 현물가 기준으로 실시간 환산됩니다. 숨겨진 수수료 없음.'
        :'Toss auto-debit, card, or wire. Pay KRW — converted at live LBMA spot. No hidden fees.' },
    { n:'STEP 03', t:ko?'싱가포르 금보관 배분':'Vault Allocation',
      d:ko?'결제 즉시 싱가포르 Malca-Amit 자유무역지대 금고에 귀하의 명의로 배분됩니다. 고유 일련번호가 발급되며, 계정 대시보드에서 실시간으로 확인하실 수 있습니다.'
        :'Immediately allocated to your name at Malca-Amit Singapore FTZ vault. Serial number issued instantly.' },
  ];
  return (
    <div ref={ref} style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(16px)', transition:'opacity 0.7s, transform 0.7s' }}>
      <div className="aurum-container" style={{ paddingTop:isMobile?32:64, paddingBottom:isMobile?32:64 }}>
        <div style={{ textAlign:'center', marginBottom:isMobile?22:38 }}>
          <span style={{...eyebrowStyle, display:'block', textAlign:'center' }}>{ko?'3단계로 끝납니다':'Three steps'}</span>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?26:36, fontWeight:300, color:'#f5f0e8', margin:0 }}>
            {ko?<>가입부터 금고까지, <span style={{ color:'#c5a572', fontStyle:'italic' }}>5분.</span></> : <>Account to vault in <span style={{ color:'#c5a572', fontStyle:'italic' }}>5 minutes.</span></>}
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:12 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', borderTop:'2px solid #c5a572', padding:'16px',
              opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(10px)', transition:`opacity 0.6s ${i*0.15}s, transform 0.6s ${i*0.15}s` }}>
              <span style={{...eyebrowStyle, marginBottom:7 }}>{s.n}</span>
              <div style={{ fontFamily:ko?T.serifKr:SERIF, fontSize:16, color:'#f5f0e8', marginBottom:7 }}>{s.t}</div>
              <div style={{ fontFamily:SANS, fontSize:13, color:'#8a7d6b', lineHeight:1.65 }}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, padding:'9px 14px', background:'rgba(74,222,128,0.07)', border:'1px solid rgba(74,222,128,0.2)', fontFamily:MONO, fontSize:11, color:'#4ade80', textAlign:'center', letterSpacing:'0.04em' }}>
          ✓ {ko?'100g 실물 바 무료 전환':'Free bar at 100g'} &nbsp;·&nbsp; ✓ {ko?'원화 즉시 정산':'Instant KRW settlement'} &nbsp;·&nbsp; ✓ {ko?'언제든 중단 가능':'Cancel anytime'}
        </div>
      </div>
    </div>
  );
}

// ─── C·07  FoundersMiniCalc ───────────────────────────────────────────────────
// BUG FIX #5: slider max raised to ₩15,000,000 so all 5 gates are reachable
function FoundersMiniCalc({ krwRate, lang, navigate }) {
  const [monthly, setMonthly] = useState(500000);
  const ko = lang === 'ko';
  const annualUSD = monthly * 12 / krwRate;
  const gate      = FC_GATES.slice().reverse().find(g => annualUSD >= g.gmv) || null;
  const nextGate  = gate ? FC_GATES[FC_GATES.indexOf(gate)+1] : FC_GATES[0];
  const savings   = gate ? annualUSD * (gate.discount/100) * krwRate : 0;
  const fKRW2 = v => `₩${Math.round(v).toLocaleString('ko-KR')}`;
  // Progress toward next gate
  const prevGmv = gate ? FC_GATES[FC_GATES.indexOf(gate)-1]?.gmv || 0 : 0;
  const nextGmv = nextGate?.gmv || gate?.gmv || 1;
  const pct     = gate ? Math.min(((annualUSD - (gate.gmv || 0)) / ((nextGate?.gmv || gate.gmv*1.1) - (gate.gmv || 0))) * 100, 99) : Math.min((annualUSD / FC_GATES[0].gmv)*100, 99);
  return (
    <div style={{ background:'rgba(197,165,114,0.04)', border:'1px solid rgba(197,165,114,0.15)', padding:'18px', marginTop:18, position:'relative' }}>
      <div style={GOLD_LINE}/>
      <span style={{...eyebrowStyle}}>{ko?'12개월 절감액 계산기':'Founders savings estimator'}</span>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
        <span style={{ fontFamily:MONO, fontSize:17, color:'#f5f0e8' }}>₩{Math.round(monthly/10000).toLocaleString()}{ko?'만원/월':'/mo'}</span>
        {gate && <span style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', background:'rgba(197,165,114,0.1)', padding:'3px 10px' }}>Gate {gate.num}</span>}
      </div>
      <input type="range" min="200000" max="15000000" step="100000" value={monthly}
        style={{ width:'100%', marginBottom:6, minHeight:44 }} onChange={e=>setMonthly(+e.target.value)}/>
      {/* Gate tick marks */}
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:MONO, fontSize:8, color:'#444', marginBottom:12 }}>
        {FC_GATES.map(g => <span key={g.num} style={{ color: annualUSD >= g.gmv ? '#c5a572' : '#444' }}>Gate {g.num}</span>)}
      </div>
      {/* Progress bar toward next gate */}
      {nextGate && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:SANS, fontSize:10, color:'#666', marginBottom:4 }}>
            <span>{gate ? `Gate ${gate.num} → Gate ${nextGate.num}` : `0 → Gate ${nextGate.num}`}</span>
            <span style={{ color:'#c5a572' }}>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ height:3, background:'#1e1e1e' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#c5a572,#e3c187)', transition:'width 0.4s ease' }}/>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
        {[
          {l:ko?'게이트':'Gate',         v:gate?(ko?gate.label:gate.labelEn):(ko?'미달':'Below I'), c:'#c5a572'},
          {l:ko?'할인율':'Discount',      v:gate?`−${gate.discount}%`:'−',     c:'#4ade80'},
          {l:ko?'연간 절감':'Ann. savings',v:gate?fKRW2(savings):'−',           c:'#4ade80'},
        ].map((s,i) => (
          <div key={i} style={{ background:'#1a1a1a', padding:'9px 11px', textAlign:'center' }}>
            <div style={{ fontFamily:SANS, fontSize:10, color:'#555', marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:MONO, fontSize:13, color:s.c, fontWeight:600 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>navigate('founders')} style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.4)', color:'#c5a572', padding:'10px 18px', fontFamily:SANS, fontSize:13, cursor:'pointer', width:'100%', minHeight:44 }}>
        {ko?'전체 시뮬레이터 보기 →':'Full simulator →'}
      </button>
    </div>
  );
}

// ─── C·08  LegalSafetyFAQ (GC_REVIEW_REQUIRED — D4: deploy with disclaimer) ─
function LegalSafetyFAQ({ lang, navigate }) {
  const [open, setOpen] = useState(null);
  const [ref, vis] = useScrollReveal(0.06);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const faqs = [
    { v:ko?'✓ 합법 확인':'✓ Confirmed Legal',
      q:ko?'한국인이 해외에서 금을 구매하는 게 합법인가요?':'Is it legal to buy gold abroad?',
      a:ko?'네. 외국환거래법상 연간 $50,000 이하의 해외 투자는 사전 신고 없이 가능합니다. Aurum은 싱가포르 PSPM법 2019 등록 딜러입니다. 해외 금융계좌 잔고가 $10,000 이상이면 매년 6월 국세청에 신고하셔야 합니다. Aurum은 신고에 필요한 계좌 정보를 자동으로 제공합니다.'
        :'Yes. Under Korean foreign exchange law, overseas investments up to $50,000/year need no prior notification. Aurum is registered under Singapore PSPM Act 2019. Annual reporting to Korean tax authorities applies for overseas balances over $10,000 — Aurum provides required account information automatically.' },
    { v:ko?'✓ 물리적으로 존재':'✓ Physically Exists',
      q:ko?'금이 실제로 금고에 있나요? 숫자만 있는 건 아닌가요?':'Is the gold physically in a vault?',
      a:ko?'귀하의 금은 싱가포르 FTZ Malca-Amit 해외 금보관 금고에 물리적으로 보관됩니다. 완전 배분(fully allocated) — 다른 고객 자산과 절대 혼합되지 않습니다. 구매 즉시 고유 일련번호가 발급됩니다.'
        :'Your metal is physically held at the Malca-Amit Singapore FTZ vault under fully allocated custody — never commingled with other clients. A unique serial number is issued immediately.' },
    { v:ko?'✓ 법적 분리 보장':'✓ Legally Separated',
      q:ko?'Aurum이 폐업하면 내 금은 어떻게 되나요?':'What if Aurum closes?',
      a:ko?'배분 보관 구조상 귀하의 금은 법적으로 Aurum의 자산이 아닙니다. Aurum이 폐업하더라도 귀하의 금속은 귀하 명의로 Malca-Amit 금고에 존재합니다. 시중 은행 금통장과 달리, 귀하의 금속은 귀하의 재산입니다.'
        :'Under allocated storage, your metal is legally not an asset of Aurum. Even if Aurum closes, your metal remains in your name at Malca-Amit.' },
  ];
  return (
    <div ref={ref} style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', opacity:vis?1:0, transition:'opacity 0.8s' }}>
      <div className="aurum-container" style={{ paddingTop:isMobile?32:64, paddingBottom:isMobile?32:64 }}>
        <span style={{...eyebrowStyle}}>{ko?'많이 물어보시는 질문입니다':'Common questions'}</span>
        <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?26:36, fontWeight:300, color:'#f5f0e8', margin:'0 0 24px', lineHeight:1.2 }}>
          {ko?<>합법입니까? <span style={{ color:'#c5a572', fontStyle:'italic' }}>네, 그리고 안전합니다.</span></> : <>Is this legal? <span style={{ color:'#c5a572', fontStyle:'italic' }}>Yes, and safe.</span></>}
        </h2>
        {faqs.map((faq,i) => (
          <div key={i} style={{ borderBottom:i<2?'1px solid rgba(197,165,114,0.08)':'none', paddingBottom:18, marginBottom:18 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:'#4ade80', letterSpacing:'0.13em', textTransform:'uppercase', marginBottom:5 }}>{faq.v}</div>
            <button onClick={()=>setOpen(open===i?null:i)} style={{ background:'none', border:'none', textAlign:'left', cursor:'pointer', padding:0, width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, minHeight:44 }}>
              <span style={{ fontFamily:ko?T.serifKr:SERIF, fontStyle:'italic', fontSize:15, color:'#f5f0e8' }}>{faq.q}</span>
              <span style={{ fontFamily:MONO, fontSize:14, color:'#c5a572', flexShrink:0 }}>{open===i?'−':'+'}</span>
            </button>
            {open===i && <div style={{ fontFamily:SANS, fontSize:14, color:'#8a7d6b', lineHeight:1.8, marginTop:10 }}>{faq.a}</div>}
          </div>
        ))}
        {/* D4: legal disclaimer */}
        <div style={{ marginTop:14, padding:'8px 12px', background:'rgba(200,72,72,0.04)', border:'1px solid rgba(200,72,72,0.15)', fontFamily:MONO, fontSize:9, color:'#555', letterSpacing:'0.08em' }}>
          {ko?'※ 법적 고지: 본 내용은 일반 정보 제공 목적이며 법적·세무적 조언이 아닙니다. 개인 상황에 따라 차이가 있을 수 있으므로 전문가 상담을 권장합니다.'
            :'※ Legal notice: This information is for general purposes only and does not constitute legal or tax advice. Consult a qualified professional for your specific situation.'}
        </div>
        <button onClick={()=>navigate('storage')} style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.35)', color:'#c5a572', padding:'10px 18px', fontFamily:SANS, fontSize:13, cursor:'pointer', minHeight:44, marginTop:12 }}>
          {ko?'보관 및 법적 구조 전체 안내 →':'Full custody & legal guide →'}
        </button>
      </div>
    </div>
  );
}

// ─── C·09  GoldKRWIndexedChart ────────────────────────────────────────────────
// Uses MONTHLY_DATA_2000 — timeframe toggles 1Y / 3Y / 5Y / ALL (since 2000)
function GoldKRWIndexedChart({ lang, isMobile }) {
  const canvasRef = useRef(null);
  const [ref, vis] = useScrollReveal(0.05);
  const [tf, setTf] = useState('5Y');
  const ko = lang === 'ko';
  const tfMap = { '1Y':12, '3Y':36, '5Y':60, 'ALL':MONTHLY_DATA_2000.length };
  const data = MONTHLY_DATA_2000.slice(-tfMap[tf]);
  useEffect(() => {
    if (!vis || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = isMobile?180:240;
    canvas.width=W*dpr; canvas.height=H*dpr; canvas.style.width=W+'px'; canvas.style.height=H+'px';
    const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const base = data[0];
    const pts = data.map((d,i) => ({
      gold: (d[2]*d[3])/(base[2]*base[3])*100,
      krw:  (base[3]/d[3])*100,
      bank: Math.pow(1+0.035/12,i)*100,
    }));
    const all = pts.flatMap(p=>[p.gold,p.krw,p.bank]);
    const minV=Math.min(...all)*0.96, maxV=Math.max(...all)*1.03;
    const PAD_L=42, PAD_R=14, PAD_T=14, PAD_B=22;
    const toX=i=>PAD_L+(i/(pts.length-1))*(W-PAD_L-PAD_R);
    const toY=v=>PAD_T+(H-PAD_T-PAD_B)-((v-minV)/(maxV-minV))*(H-PAD_T-PAD_B);
    ctx.clearRect(0,0,W,H);
    [100,150,200,300,400,600].forEach(v=>{
      if(v<minV-5||v>maxV+5) return;
      const y=toY(v);
      ctx.strokeStyle=v===100?'rgba(197,165,114,0.1)':'rgba(197,165,114,0.04)';ctx.lineWidth=v===100?1.5:1;ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(PAD_L,y);ctx.lineTo(W-PAD_R,y);ctx.stroke();
      ctx.fillStyle='rgba(138,125,107,0.4)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.fillText(v,2,y+3);
    });
    // Year marks
    let lastYear = null;
    data.forEach((d,i) => {
      if(d[1]===1 && d[0]!==lastYear) {
        lastYear=d[0]; const x=toX(i);
        ctx.strokeStyle='rgba(197,165,114,0.06)';ctx.lineWidth=1;ctx.setLineDash([2,3]);
        ctx.beginPath();ctx.moveTo(x,PAD_T);ctx.lineTo(x,H-PAD_B);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(138,125,107,0.35)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.fillText(d[0],x-10,H-5);
      }
    });
    [[{key:'gold',color:'#4ade80',dashed:false},{key:'krw',color:'#f87171',dashed:false},{key:'bank',color:'rgba(138,125,107,0.5)',dashed:true}]].flat().forEach(s=>{
      if(s.dashed)ctx.setLineDash([4,3]);else ctx.setLineDash([]);
      ctx.beginPath();ctx.strokeStyle=s.color;ctx.lineWidth=s.dashed?1.5:2;ctx.lineJoin='round';
      pts.forEach((p,i)=>i===0?ctx.moveTo(toX(i),toY(p[s.key])):ctx.lineTo(toX(i),toY(p[s.key])));
      ctx.stroke();
    });
    ctx.setLineDash([]);
    // Legend
    [[ko?'금 (KRW 환산)':'Gold (KRW)','#4ade80'],[ko?'KRW 구매력':'KRW Power','#f87171'],[ko?'은행 예금 3.5%':'Bank 3.5%','rgba(138,125,107,0.6)']].forEach(([l,c],i)=>{
      ctx.strokeStyle=c;ctx.lineWidth=i===2?1.5:2;if(i===2)ctx.setLineDash([4,3]);else ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(W-118,14+i*16);ctx.lineTo(W-98,14+i*16);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(138,125,107,0.6)';ctx.font=`9px 'JetBrains Mono',monospace`;ctx.fillText(l,W-92,17+i*16);
    });
    ctx.fillStyle='rgba(197,165,114,0.25)';ctx.font=`8px 'JetBrains Mono',monospace`;
    ctx.fillText(`${data[0][0]}.${String(data[0][1]).padStart(2,'0')} = 100`,PAD_L+2,H-5);
  },[vis,tf,lang,isMobile]);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transition:'opacity 0.8s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{...eyebrowStyle, marginBottom:0 }}>{ko?'인덱스 차트':'Indexed Chart'}</span>
        <div style={{ display:'flex', gap:4 }}>
          {['1Y','3Y','5Y','ALL'].map(t => (
            <button key={t} onClick={()=>setTf(t)} style={{ background:tf===t?'rgba(197,165,114,0.15)':'transparent', border:`1px solid ${tf===t?'#c5a572':'#333'}`, color:tf===t?'#c5a572':'#555', padding:'3px 9px', fontFamily:MONO, fontSize:10, cursor:'pointer', transition:'all 0.15s' }}>{t}</button>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%' }}/>
    </div>
  );
}

// ─── C·10  SavingsComparisonChart ────────────────────────────────────────────
// BUG FIX #8: applies AURUM_GOLD_PREMIUM to gold accumulation (not raw spot)
function SavingsComparisonChart({ prices, krwRate, lang, isMobile }) {
  const [monthly, setMonthly] = useState(100000);
  const canvasRef = useRef(null);
  const [ref, vis] = useScrollReveal(0.05);
  const ko = lang === 'ko';
  const curPPG = prices.gold * krwRate / OZ_IN_GRAMS;
  const CHART_DATA = MONTHLY_DATA_2000.slice(-60); // last 5 years for comparison
  useEffect(() => {
    if(!vis||!canvasRef.current) return;
    const canvas=canvasRef.current; const dpr=window.devicePixelRatio||1;
    const W=canvas.offsetWidth, H=isMobile?180:200;
    canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    let bankTotal=0, grams=0;
    const bankPts=[], goldPts=[];
    CHART_DATA.forEach((d,i)=>{
      bankTotal+=monthly*Math.pow(1+0.035/12,CHART_DATA.length-1-i);
      // BUG FIX: accumulate at Aurum price (spot × 1.08), not raw spot
      grams+=monthly/(d[2]*d[3]/OZ_IN_GRAMS*(1+AURUM_GOLD_PREMIUM));
      bankPts.push(bankTotal); goldPts.push(grams*curPPG);
    });
    const allV=[...bankPts,...goldPts],minV=Math.min(...allV)*0.95,maxV=Math.max(...allV)*1.02;
    const toX=i=>8+(i/(CHART_DATA.length-1))*(W-16);
    const toY=v=>H*0.9-((v-minV)/(maxV-minV))*(H*0.78);
    ctx.clearRect(0,0,W,H);
    [[bankPts,'rgba(138,125,107,0.5)',false],[goldPts,'#C5A572',true]].forEach(([pts,col,fill])=>{
      if(fill){const g=ctx.createLinearGradient(0,toY(Math.max(...pts)),0,H*0.9);g.addColorStop(0,'rgba(197,165,114,0.15)');g.addColorStop(1,'rgba(197,165,114,0)');ctx.beginPath();ctx.moveTo(toX(0),H*0.9);pts.forEach((v,i)=>ctx.lineTo(toX(i),toY(v)));ctx.lineTo(toX(pts.length-1),H*0.9);ctx.closePath();ctx.fillStyle=g;ctx.fill();}
      ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=fill?2:1.5;ctx.lineJoin='round';
      pts.forEach((v,i)=>i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v)));ctx.stroke();
    });
    const diff=goldPts[goldPts.length-1]-bankPts[bankPts.length-1];
    ctx.fillStyle='rgba(74,222,128,0.1)';ctx.fillRect(W-88,8,80,30);
    ctx.fillStyle='#4ade80';ctx.font=`bold 10px 'JetBrains Mono',monospace`;ctx.fillText(ko?'금 수익':'Gold gain',W-82,21);
    ctx.font=`9px 'JetBrains Mono',monospace`;ctx.fillText(`+₩${Math.round(diff/10000).toLocaleString()}만`,W-82,33);
  },[vis,monthly,prices.gold,krwRate,lang,isMobile]);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transition:'opacity 0.8s' }}>
      <div style={{...eyebrowStyle, display:'flex', justifyContent:'space-between', marginBottom:7 }}>
        <span>{ko?'은행 예금 vs 금 적립 (5Y)':'Bank vs Gold AGP (5Y)'}</span>
        <span style={{ color:'#f5f0e8' }}>₩{Math.round(monthly/10000).toLocaleString()}{ko?'만원/월':'/mo'}</span>
      </div>
      <input type="range" min="50000" max="1000000" step="50000" value={monthly}
        style={{ width:'100%', marginBottom:7, minHeight:44 }} onChange={e=>setMonthly(+e.target.value)}/>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%' }}/>
      <div style={{ fontFamily:SANS, fontSize:10, color:'#3a3028', marginTop:4, fontStyle:'italic' }}>
        * {ko?'Aurum 수수료 적용 · 과거 성과가 미래 수익을 보장하지 않습니다':'Aurum fee applied · Past performance is not indicative of future results'}
      </div>
    </div>
  );
}

// ─── C·11  VaultLocationDot ───────────────────────────────────────────────────
function VaultLocationDot({ lang }) {
  const ko = lang === 'ko';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:22, padding:'14px 0', borderBottom:'1px solid rgba(197,165,114,0.06)', flexWrap:'wrap' }}>
      <svg width="180" height="80" viewBox="0 0 180 80" style={{ flexShrink:0 }}>
        <style>{`@keyframes sgp{0%,100%{r:8;opacity:.14}50%{r:14;opacity:.05}}.sgr{animation:sgp 2.5s ease-in-out infinite}`}</style>
        <path d="M10 20 Q30 15 60 25 Q80 30 100 20 Q120 12 140 18 Q155 22 165 35 Q170 50 160 60 Q140 70 120 65 Q100 58 80 62 Q60 68 40 60 Q20 52 15 40 Z" fill="none" stroke="rgba(197,165,114,0.1)" strokeWidth="1"/>
        <circle cx="116" cy="54" className="sgr" fill="none" stroke="rgba(197,165,114,0.28)" strokeWidth="1" r="8"/>
        <circle cx="116" cy="54" r="4" fill="#C5A572" opacity="0.9"/>
        <circle cx="116" cy="54" r="2" fill="#E3C187"/>
      </svg>
      <div>
        <div style={{ fontFamily:MONO, fontSize:11, color:'#c5a572', fontWeight:700, letterSpacing:'0.1em', marginBottom:5 }}>
          {ko?'MALCA-AMIT · 싱가포르 FTZ 해외 금보관':'MALCA-AMIT · SINGAPORE FTZ VAULT'}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[ko?'40년+ 운영':'40+ years', ko?"Lloyd's 보험":"Lloyd's insured", ko?'자유무역지대':'Free Trade Zone', ko?'금보관 전문':'PM specialist'].map((b,i)=>(
            <span key={i} style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', border:'1px solid rgba(197,165,114,0.15)', padding:'2px 8px' }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── C·12  KRWDebasementSection + CurrencyDebasementChart ────────────────────
// Decision D7=A: build out with full copy + interactive toggle chart
// Decision D6=오늘의 금값: RealEstateWidget goes in GoldTodayPage, not here
function CurrencyDebasementChart({ lang, isMobile }) {
  const canvasRef = useRef(null);
  const [ref, vis] = useScrollReveal(0.05);
  const ko = lang === 'ko';
  const [active, setActive] = useState({ gold_krw:true, gold_usd:true, krw_power:true, bank:true });
  const series = [
    { key:'gold_krw', label:ko?'금 (KRW 환산)':'Gold (KRW)', sub:ko?'복합 효과':'Compound', color:'#4ade80', getVal:(d,b)=>(d[2]*d[3])/(b[2]*b[3])*100 },
    { key:'gold_usd', label:ko?'금 (USD)':'Gold (USD)',        sub:'LBMA spot',               color:'#C5A572', getVal:(d,b)=>d[2]/b[2]*100 },
    { key:'krw_power',label:ko?'KRW 구매력':'KRW Power',       sub:ko?'vs USD':'vs USD',       color:'#f87171', getVal:(d,b)=>b[3]/d[3]*100 },
    { key:'bank',     label:ko?'은행 예금':'Bank 3.5%',        sub:ko?'연복리':'Annual',       color:'rgba(138,125,107,0.55)', getVal:(_,__,i)=>Math.pow(1+0.035/12,i)*100, dashed:true },
  ];
  useEffect(()=>{
    if(!vis||!canvasRef.current) return;
    const canvas=canvasRef.current; const dpr=window.devicePixelRatio||1;
    const W=canvas.offsetWidth, H=isMobile?180:240;
    canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const base=MONTHLY_DATA_2000[0];
    const pts=MONTHLY_DATA_2000.map((d,i)=>{const r={};series.forEach(s=>{r[s.key]=s.getVal(d,base,i)});return r;});
    const aVals=pts.flatMap(p=>series.filter(s=>active[s.key]).map(s=>p[s.key]));
    if(!aVals.length){ctx.clearRect(0,0,W,H);return;}
    const minV=Math.min(...aVals)*0.96,maxV=Math.max(...aVals)*1.03;
    const PAD_L=40,PAD_R=14,PAD_T=14,PAD_B=22;
    const toX=i=>PAD_L+(i/(pts.length-1))*(W-PAD_L-PAD_R);
    const toY=v=>PAD_T+(H-PAD_T-PAD_B)-((v-minV)/(maxV-minV))*(H-PAD_T-PAD_B);
    ctx.clearRect(0,0,W,H);
    [100,150,200,300,400,600].forEach(v=>{if(v<minV-5||v>maxV+5)return;const y=toY(v);ctx.strokeStyle=v===100?'rgba(197,165,114,0.1)':'rgba(197,165,114,0.04)';ctx.lineWidth=v===100?1.5:1;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(PAD_L,y);ctx.lineTo(W-PAD_R,y);ctx.stroke();ctx.fillStyle='rgba(138,125,107,0.4)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.fillText(v,2,y+3);});
    let lastYear=null;MONTHLY_DATA_2000.forEach((d,i)=>{if(d[1]===1&&d[0]!==lastYear){lastYear=d[0];const x=toX(i);ctx.strokeStyle='rgba(197,165,114,0.05)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x,PAD_T);ctx.lineTo(x,H-PAD_B);ctx.stroke();ctx.setLineDash([]);if(d[0]%5===0){ctx.fillStyle='rgba(138,125,107,0.3)';ctx.font=`8px 'JetBrains Mono',monospace`;ctx.fillText(d[0],x-10,H-5);}}});
    series.forEach(s=>{if(!active[s.key])return;if(s.dashed)ctx.setLineDash([4,3]);else ctx.setLineDash([]);ctx.beginPath();ctx.strokeStyle=s.color;ctx.lineWidth=s.dashed?1.5:2.2;ctx.lineJoin='round';pts.forEach((p,i)=>i===0?ctx.moveTo(toX(i),toY(p[s.key])):ctx.lineTo(toX(i),toY(p[s.key])));ctx.stroke();const last=pts[pts.length-1];ctx.fillStyle=s.color;ctx.setLineDash([]);ctx.font=`bold 9px 'JetBrains Mono',monospace`;ctx.fillText(last[s.key].toFixed(0),toX(pts.length-1)-26,toY(last[s.key])-4);});ctx.setLineDash([]);
  },[vis,active,isMobile,lang]);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transition:'opacity 0.8s' }}>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
        {series.map(s=>(
          <button key={s.key} onClick={()=>setActive(p=>({...p,[s.key]:!p[s.key]}))} style={{ background:active[s.key]?`${s.color}18`:'rgba(0,0,0,0.3)', border:`1px solid ${active[s.key]?s.color:'rgba(255,255,255,0.06)'}`, color:active[s.key]?s.color:'#444', padding:'5px 11px', fontFamily:MONO, fontSize:9, letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.18s', minHeight:34, display:'flex', flexDirection:'column', alignItems:'flex-start', lineHeight:1.3 }}>
            <span style={{ fontWeight:700 }}>{s.label}</span>
            <span style={{ fontSize:8, opacity:0.7 }}>{s.sub}</span>
          </button>
        ))}
      </div>
      <div style={{ fontFamily:MONO, fontSize:8, color:'rgba(197,165,114,0.25)', marginBottom:5, letterSpacing:'0.1em' }}>Jan 2000 = 100</div>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%' }}/>
    </div>
  );
}

function KRWDebasementSection({ lang, isMobile }) {
  const [ref, vis] = useScrollReveal(0.06);
  const ko = lang === 'ko';
  const stats = [
    { val:'+31%', label:ko?'KRW 약세':'KRW weakness', sub:ko?'2020→2024':'vs 2020', color:'#f87171', bg:'rgba(248,113,113,0.06)', bd:'rgba(248,113,113,0.2)' },
    { val:'+86%', label:ko?'금값 상승 (USD)':'Gold (USD)',  sub:ko?'같은 기간':'same period', color:'#C5A572', bg:'rgba(197,165,114,0.06)', bd:'rgba(197,165,114,0.22)' },
    { val:'+152%',label:ko?'금 (KRW 환산)':'Gold (KRW)',   sub:ko?'복합 효과':'compound', color:'#4ade80', bg:'rgba(74,222,128,0.06)', bd:'rgba(74,222,128,0.2)' },
  ];
  return (
    <div ref={ref} style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'opacity 0.7s, transform 0.7s' }}>
      <div className="aurum-container" style={{ paddingTop:isMobile?32:72, paddingBottom:isMobile?32:72 }}>
        <span style={{...eyebrowStyle}}>{ko?'원화로 저축하는 것의 비용':'The cost of saving in KRW'}</span>
        <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?26:38, fontWeight:300, color:'#f5f0e8', lineHeight:1.15, margin:'0 0 20px' }}>
          {ko?<>원화는 약해지고, <span style={{ color:'#C5A572', fontStyle:'italic' }}>금은 강해집니다.</span></> : <>KRW weakens. <span style={{ color:'#C5A572', fontStyle:'italic' }}>Gold strengthens.</span></>}
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:isMobile?24:48, marginBottom:28, alignItems:'start' }}>
          <div>
            <p style={{ fontFamily:ko?T.sansKr:SANS, fontSize:14, color:'#a09880', lineHeight:1.85, marginBottom:18 }}>
              {ko?'2020년 이후 KRW/USD 환율은 ₩1,100에서 ₩1,450 수준으로 하락했습니다 (+31% 원화 약세). 같은 기간 금값은 온스당 $1,770에서 $3,300 이상으로 상승했습니다 (+86%). 원화 예금 금리가 이 격차를 메울 수 없다는 것은 숫자가 증명합니다.'
                :'Since 2020, KRW/USD fell from ₩1,100 to ₩1,450 (+31% KRW weakness). Over the same period gold rose from $1,770 to over $3,300/oz (+86%). Bank savings rates cannot close this gap.'}
            </p>
            <p style={{ fontFamily:ko?T.sansKr:SANS, fontSize:14, color:'#a09880', lineHeight:1.85 }}>
              {ko?'원화를 예금에 보관하는 것은 선택이 아닌 관성입니다. Aurum AGP는 매달 원화를 국제 현물가 기준 실물 금으로 전환합니다 — 원화 약세에 구조적으로 노출되지 않는 방식으로.'
                :'Saving in KRW is habit, not strategy. Aurum AGP converts monthly KRW into allocated physical gold at international spot — structurally insulated from KRW debasement.'}
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {stats.map((s,i)=>(
              <div key={i} style={{ background:s.bg, border:`1px solid ${s.bd}`, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center',
                opacity:vis?1:0, transform:vis?'translateX(0)':'translateX(16px)', transition:`opacity 0.6s ${i*0.12}s, transform 0.6s ${i*0.12}s` }}>
                <div>
                  <div style={{ fontFamily:SANS, fontSize:11, color:s.color, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontFamily:MONO, fontSize:9, color:'#555', letterSpacing:'0.1em' }}>{s.sub}</div>
                </div>
                <div style={{ fontFamily:MONO, fontSize:isMobile?24:28, color:s.color, fontWeight:700 }}>{s.val}</div>
              </div>
            ))}
            <div style={{ fontFamily:MONO, fontSize:8, color:'#3a3028', marginTop:4, lineHeight:1.6 }}>
              {ko?'* 한국은행 KRW/USD 평균 + LBMA 월평균 (2020.01–2024.12)':'* Bank of Korea KRW/USD avg + LBMA monthly avg (Jan 2020–Dec 2024)'}
            </div>
          </div>
        </div>
        <div style={{ background:'#0d0b07', border:'1px solid rgba(197,165,114,0.1)', padding:isMobile?'14px 12px':'18px 20px', position:'relative' }}>
          <div style={GOLD_LINE}/>
          <div style={{ fontFamily:MONO, fontSize:9, color:'#8a7d6b', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:12 }}>
            {ko?'각 지표를 클릭해 켜고 끄세요 · Jan 2000 = 100 인덱스':'Toggle each series · indexed Jan 2000 = 100'}
          </div>
          <CurrencyDebasementChart lang={lang} isMobile={isMobile}/>
        </div>
      </div>
    </div>
  );
}

// ─── C·13  DualSavingsPanel (pulled from FoundersClubPage + slider added) ────
// Decision D7=A: add to homepage Founders pane with monthly slider
// BUG FIX #7: monthly is no longer hardcoded — slider added
function DualSavingsPanel({ prices, krwRate, lang }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [ag, setAg] = useState(2);    // active gate index
  const [monthly, setMonthly] = useState(1000000);
  const gate = FC_GATES[ag];
  const SPOT = prices.gold;
  const gPerG = SPOT * krwRate / OZ_IN_GRAMS;
  const koreaPrice   = SPOT * (1 + KR_GOLD_PREMIUM);
  const aurumBase    = SPOT * (1 + AURUM_GOLD_PREMIUM);
  const withSavings  = aurumBase * (1 - gate.discount / 100);
  const savedVsKorea = koreaPrice - withSavings;
  const gramsBase    = monthly / (gPerG * (1 + AURUM_GOLD_PREMIUM));
  const gramsWithS   = monthly / (gPerG * (1 + AURUM_GOLD_PREMIUM) * (1 - gate.discount / 100));
  const bonusG       = gramsWithS - gramsBase;
  return (
    <div style={{ marginTop:20 }}>
      {/* Gate tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:18, borderBottom:`1px solid rgba(197,165,114,0.1)` }}>
        {FC_GATES.map((g,i) => (
          <button key={i} onClick={()=>setAg(i)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'8px 4px', fontFamily:MONO, fontSize:isMobile?10:12, color:ag===i?'#c5a572':'#555', borderBottom:ag===i?'2px solid #c5a572':'2px solid transparent', transition:'all 0.15s', whiteSpace:'nowrap' }}>
            {g.num} {!isMobile && `(−${g.discount}%)`}
          </button>
        ))}
      </div>
      {/* Monthly slider */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>{ko?'월 구매액':'Monthly'}</div>
        <div style={{ fontFamily:MONO, fontSize:20, fontWeight:700, color:'#f5f0e8', marginBottom:10 }}>₩{Math.round(monthly/10000).toLocaleString()}만원</div>
        <input type="range" min="200000" max="5000000" step="100000" value={monthly}
          style={{ width:'100%', minHeight:44 }} onChange={e=>setMonthly(+e.target.value)}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:12 }}>
        {/* Physical side */}
        <div style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', padding:'16px' }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:'#c5a572', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>{ko?'실물 매수':'Physical'}</div>
          {[
            { label:ko?'국내 소매가 (VAT 포함)':'Korean retail (VAT)',    value:`₩${Math.round(koreaPrice*krwRate/OZ_IN_GRAMS).toLocaleString('ko-KR')}`, color:'#888' },
            { label:ko?`Aurum Gate ${gate.num} 적용가`:`Gate ${gate.num} price`, value:`₩${Math.round(withSavings*krwRate/OZ_IN_GRAMS).toLocaleString('ko-KR')}`, color:'#e3c187', hl:true },
          ].map((row,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'8px 0', borderBottom:i<1?`1px dashed rgba(197,165,114,0.1)`:'none' }}>
              <span style={{ fontFamily:SANS, fontSize:11, color:'#8a7d6b' }}>{row.label}</span>
              <span style={{ fontFamily:MONO, fontSize:row.hl?16:12, color:row.color, fontWeight:row.hl?700:500 }}>{row.value}<span style={{ fontSize:9, color:'#555', marginLeft:2 }}>/g</span></span>
            </div>
          ))}
          <div style={{ marginTop:10, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:SANS, fontSize:11, color:'#f5f0e8' }}>{ko?'한국 대비 절약':'vs Korea'}</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:MONO, fontSize:14, color:'#4ade80', fontWeight:700 }}>₩{Math.round(savedVsKorea*krwRate/OZ_IN_GRAMS).toLocaleString('ko-KR')}/g</div>
              <div style={{ fontFamily:MONO, fontSize:9, color:'#555' }}>{((savedVsKorea/koreaPrice)*100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
        {/* AGP side */}
        <div style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', padding:'16px' }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:'#c5a572', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>{ko?'AGP 월적립':'AGP Monthly'}</div>
          {[
            { label:ko?'할인 없이 받는 그램':'Without discount', value:`${gramsBase.toFixed(3)}g`, color:'#8a7d6b' },
            { label:ko?`Gate ${gate.num} 적용`:`Gate ${gate.num}`, value:`${gramsWithS.toFixed(3)}g`, color:'#e3c187', hl:true },
          ].map((row,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<1?`1px dashed rgba(197,165,114,0.1)`:'none' }}>
              <span style={{ fontFamily:SANS, fontSize:11, color:'#8a7d6b' }}>{row.label}</span>
              <span style={{ fontFamily:MONO, fontSize:row.hl?16:12, color:row.color, fontWeight:row.hl?700:500 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop:10, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:SANS, fontSize:11, color:'#f5f0e8' }}>{ko?'월 추가 적립':'Monthly bonus'}</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:MONO, fontSize:14, color:'#4ade80', fontWeight:700 }}>+{bonusG.toFixed(4)}g</div>
              <div style={{ fontFamily:MONO, fontSize:9, color:'#555' }}>/ {ko?'매월':'monthly'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── C·14  FoundersLeaderboard — D5=A: Leaderboard on homepage Founders section ─
const LB_DATA = [
  { rank:1, nameKo:'김영호', nameEn:'YOUNG-HO K.', gate:5, gmv:127400 },
  { rank:2, nameKo:'류하은', nameEn:'HA-EUN R.',   gate:4, gmv:89200  },
  { rank:3, nameKo:'이승우', nameEn:'SEUNG-WOO L.',gate:4, gmv:74800  },
  { rank:4, nameKo:'민지아', nameEn:'JI-AH M.',    gate:3, gmv:42100  },
  { rank:5, nameKo:'정두현', nameEn:'DOO-HYUN J.', gate:3, gmv:38900  },
];
const LB_USER = { rank:247, nameKo:'귀하', nameEn:'YOU', gate:2, gmv:18000 };
function FoundersLeaderboard({ krwRate, lang }) {
  const ko = lang === 'ko';
  const fmt = n => `₩${Math.round(n * krwRate / 1000000).toFixed(1)}M`;
  return (
    <div style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.12)', padding:'18px', marginTop:18, position:'relative' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#c5a572,transparent)', pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', letterSpacing:'0.18em', textTransform:'uppercase' }}>
          {ko ? '파운더스 랭킹' : 'Founders Ranking'}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', boxShadow:'0 0 6px #4ade80' }}/>
          <span style={{ fontFamily:MONO, fontSize:9, color:'#4ade80', letterSpacing:'0.1em' }}>LIVE</span>
        </span>
      </div>
      {LB_DATA.map((row, i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 64px 44px', gap:8, alignItems:'center', padding:'6px 0', borderBottom:i < LB_DATA.length-1 ? '1px solid rgba(197,165,114,0.05)' : 'none' }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:row.rank<=3?'#c5a572':'#141414', border:`1.5px solid ${row.rank<=3?'#c5a572':'#3a3028'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontStyle:'italic', fontSize:10, color:row.rank<=3?'#0a0a0a':'#8a7d6b' }}>
            {row.rank}
          </div>
          <div>
            <div style={{ fontFamily:MONO, fontSize:10, color:'#f5f0e8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ko ? row.nameKo : row.nameEn}</div>
            <div style={{ fontFamily:MONO, fontSize:9, color:FC_GATES[row.gate-1]?.color||'#8a7d6b', border:`1px solid rgba(197,165,114,0.15)`, padding:'0 4px', display:'inline-block', marginTop:1 }}>Gate {row.gate}</div>
          </div>
          <div style={{ fontFamily:MONO, fontSize:10, color:'#c5a572', fontWeight:600, textAlign:'right' }}>{fmt(row.gmv)}</div>
          <div style={{ fontFamily:MONO, fontSize:10, color:'#4ade80', fontWeight:700, textAlign:'right' }}>−{FC_GATES[row.gate-1]?.discount}%</div>
        </div>
      ))}
      <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 64px 44px', gap:8, alignItems:'center', padding:'6px 8px', marginTop:4, background:'linear-gradient(90deg,rgba(197,165,114,0.07),transparent)', borderLeft:'2px solid #c5a572', marginLeft:-18, paddingLeft:18 }}>
        <div style={{ fontFamily:MONO, fontSize:9, color:'#c5a572', textAlign:'center' }}>#{LB_USER.rank}</div>
        <div style={{ fontFamily:MONO, fontSize:10, color:'#c5a572', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ko ? LB_USER.nameKo : LB_USER.nameEn}</div>
        <div style={{ fontFamily:MONO, fontSize:10, color:'#c5a572', fontWeight:600, textAlign:'right' }}>{fmt(LB_USER.gmv)}</div>
        <div style={{ fontFamily:MONO, fontSize:10, color:'#8a7d6b', textAlign:'right' }}>−{FC_GATES[LB_USER.gate-1]?.discount}%</div>
      </div>
    </div>
  );
}

// ─── C·15  FoundersGateSimulator — how long to reach each gate ───────────────
function FoundersGateSimulator({ krwRate, lang }) {
  const [monthly, setMonthly] = useState(1000000);
  const ko = lang === 'ko';
  const monthlyUSD = monthly / krwRate;
  const timeline = FC_GATES.map(g => ({
    ...g,
    months: Math.ceil(g.gmv / monthlyUSD),
    years: (g.gmv / monthlyUSD / 12).toFixed(1),
  }));
  return (
    <div style={{ background:'rgba(197,165,114,0.03)', border:'1px solid rgba(197,165,114,0.1)', padding:'16px', marginTop:16, position:'relative' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#c5a572,transparent)', pointerEvents:'none' }} />
      <div style={{ fontFamily:MONO, fontSize:9, color:'#8a7d6b', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>
        ⏱ {ko ? '게이트 도달 시뮬레이터' : 'Gate Timeline Simulator'}
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
          <span style={{ fontFamily:MONO, fontSize:18, color:'#c5a572', fontWeight:700 }}>₩{Math.round(monthly/10000).toLocaleString()}만/월</span>
          <span style={{ fontFamily:MONO, fontSize:11, color:'#555' }}>≈ ${Math.round(monthlyUSD).toLocaleString()}/mo</span>
        </div>
        <input type="range" min={200000} max={10000000} step={100000} value={monthly}
          style={{ width:'100%', accentColor:'#c5a572', minHeight:44 }} onChange={e=>setMonthly(+e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4 }}>
        {timeline.map((g, i) => (
          <div key={i} style={{ background:g.apex?'rgba(197,165,114,0.07)':'rgba(255,255,255,0.02)', border:`1px solid ${g.apex?'#c5a572':'#1e1e1e'}`, padding:'9px 6px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            {g.apex && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#c5a572,transparent)' }}/>}
            <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:11, color:g.color, marginBottom:2 }}>{g.num}</div>
            <div style={{ fontFamily:MONO, fontSize:9, color:'#555', marginBottom:2 }}>${g.gmv.toLocaleString()}</div>
            <div style={{ fontFamily:MONO, fontSize:11, color:'#8a7d6b', marginBottom:4 }}>{g.years}yr</div>
            <div style={{ fontFamily:MONO, fontSize:13, color:g.color, fontWeight:700 }}>−{g.discount}%</div>
          </div>
        ))}
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
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="17.5" x2="12" y2="19"/></svg></IconBox>, title: lang==='ko'?'완전 배분 보관 — 귀하의 금속, 귀하의 이름':'Fully Allocated Storage — Your Metal, Your Name', content: lang==='ko'?'귀하의 금속은 다른 어떤 고객의 자산과도 절대 혼합되지 않습니다. 싱가포르 Malca-Amit 자유무역지대 금고에 고유 일련번호와 함께 귀하의 명의로 영구 등록됩니다. 시중은행 금통장과 달리, 귀하의 금은 은행의 자산이 아닙니다 — 법적으로 귀하의 소유입니다.':'Your metal is never commingled with any other client\'s assets. Permanently registered in your name with a unique serial number at the Malca-Amit Singapore FTZ vault. Unlike a bank gold account, your metal is not the bank\'s asset — it is legally yours.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/><line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2"/></svg></IconBox>, title: lang==='ko'?'국제 현물가 직거래 — 김치 프리미엄 없음':'International Spot Price — No Kimchi Premium', content: lang==='ko'?'시중 은행 금통장, 국내 귀금속 딜러 — 모두 국제 현물가 대비 유의미한 프리미엄이 구조적으로 포함되어 있습니다. Aurum은 LBMA 국제 현물가 기준의 투명한 수수료만 적용합니다. 숨겨진 비용 없음. 위 계산기에서 오늘의 절감액을 직접 확인하십시오.':'All domestic Korean gold channels carry a meaningful structural premium above international spot. Aurum applies only a transparent fee above LBMA spot. No hidden costs. Verify your exact savings in the calculator above.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></IconBox>, title:"Lloyd's of London — "+(lang==='ko'?'기관급 전액 보험':'Full Institutional Insurance'), content: lang==='ko'?"귀하의 모든 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 물리적 손실 모두 포함됩니다. 보험 증명서는 요청 시 즉시 제공되며, 독립 감사 기관이 매일 보유 현황을 검증하고 그 결과를 공개합니다.":"All your metals are fully insured by Lloyd's of London institutional coverage. Natural disaster, theft, and physical loss are all covered. Insurance certificates provided on request. An independent auditor verifies holdings daily and publishes the results." },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg></IconBox>, title: lang==='ko'?'LBMA 승인 바 & 언제든 실물 인출':'LBMA-Approved Bars & Physical Withdrawal Anytime', content: lang==='ko'?'모든 금속은 LBMA 승인 제련소 — PAMP Suisse, Argor-Heraeus, Valcambi, RCM — 의 정품 바입니다. 100g 이상 보유 시 실물 바로 무료 전환하거나, 언제든 원화로 즉시 정산하실 수 있습니다. 추가 수수료 없음.':'All metals are authentic bars from LBMA-approved refiners — PAMP Suisse, Argor-Heraeus, Valcambi, RCM. At 100g+ you may convert to a physical bar free of charge, or settle in KRW at any time. No additional fees.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="11" y2="17"/><polyline points="11 13 12.5 15 16 11"/></svg></IconBox>, title: lang==='ko'?'매일 공개 감사 · 100% 실물 백킹':'Daily Public Audit · 100% Physical Backing', content: lang==='ko'?'Aurum에 등록된 모든 금속의 100% 실물 백킹을 매일 독립 감사 리포트로 공개합니다. 레버리지, 재담보, 파생상품 노출 일체 없습니다. 귀하의 금은 귀하의 금입니다.':'100% physical backing for every metal registered with Aurum is published in a daily independent audit report. No leverage, rehypothecation, or derivative exposure. Your gold is your gold.' },
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
                {lang==='ko'?'싱가포르 PSPM법 2019 등록 딜러':'PSPM Act 2019 Registered Dealer'}
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
                :(<><span style={{ color:'#c5a572', fontWeight:300, fontStyle:'italic', fontFamily:SERIF }}>Still overpaying?</span><br />Switch to international spot.</>)}
            </h1>
            <p style={{ fontFamily:SANS, fontSize:isMobile?14:16, color:'#a09080', lineHeight:1.95, margin:'0 0 10px' }}>
              {lang==='ko'
                ?'시중 은행 금통장, 국내 귀금속 딜러, 모든 국내 금 구매 채널에는 국제 현물가 대비 구조적 프리미엄이 포함되어 있습니다. 10% 부가세가 영구적으로 적용되기 때문입니다. Aurum은 싱가포르에서, LBMA 국제 현물가로 직접 거래합니다.'
                :'All domestic Korean gold channels carry a structural premium above international spot — due to 10% permanent VAT. Aurum trades directly from Singapore at LBMA international spot.'}
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
                {lang==='ko'?'다음 달부터 자동으로 · ₩200K/월부터':'Auto from next month · from ₩200K/mo'}
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

      {/* ② AGP Launch Pane — moved after savings */}
      <KimchiPremiumMeter prices={prices} krwRate={krwRate} lang={lang} goldKR={goldKR} goldAU={goldAU} />

      {/* ④ Savings comparison — with visual premium bars */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.1);
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(20px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 32 : 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={eyebrowStyle}>{lang === 'ko' ? '오늘 국내에서 금을 사신다면' : "If You Buy Gold Domestically Today"}</span>
              <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>
                {lang === 'ko'
                  ? `₩1,000만원 투자 시, ₩${Math.round((goldKR - goldAU) / goldAU * 10000000 / 10000).toLocaleString('ko-KR')}만원을 더 내게 됩니다.`
                  : 'Every ₩10M spent costs you more than it should.'}
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 13, color: '#8a7d6b', margin: '6px 0 0' }}>{lang === 'ko' ? 'Aurum 매입가 vs 국내 소매가 기준 (부가세 포함)' : 'Aurum Price vs Korea Retail Baseline (incl. VAT)'}</p>
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
                  { l: lang === 'ko' ? '국내 소매가 (VAT 포함)' : 'Korea Retail (VAT incl.)', v: fP(c.kr / krwRate), col: '#f87171' },
                  { l: lang === 'ko' ? 'Aurum 매입가 (LBMA 현물 기준)' : 'Aurum (LBMA spot basis)', v: fP(c.au / krwRate), col: '#c5a572' },
                ].map((r, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #1e1e1e' }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#a09080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{r.l}</span>
                    <span style={{ fontFamily: MONO, fontSize: 16, color: r.col, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                {/* ── Visual premium bars ── */}
                <div style={{ margin: '16px 0 12px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#555', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                      {lang === 'ko' ? '프리미엄 비교 (국제 현물가 대비)' : 'Premium vs International Spot'}
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
                  <span style={{ fontFamily: SANS, fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>{lang === 'ko' ? '오늘 귀하의 절감액' : 'Your Savings Today'}</span>
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


      {/* ⑥ AGP Launch Pane — after savings, before Founders */}
      <AGPLaunchPane lang={lang} navigate={navigate} />
      <HowItWorks lang={lang} isMobile={isMobile} />

      {/* ④.5 Founders Club — full-width pane */}
      <FoundersClubPane lang={lang} navigate={navigate} />
      <KRWDebasementSection lang={lang} isMobile={isMobile} />
      {/* GC_REVIEW_REQUIRED — D4=A deploy with disclaimer */}
      <LegalSafetyFAQ lang={lang} navigate={navigate} />

      {/* ⑤ Paper vs Physical — split-grid visual table */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.08);
        const pvpRows = [
          { label: lang==='ko'?'구매 시 부가세':'Purchase VAT',       bad: lang==='ko'?'10% 즉시 발생':'10% immediately',         good: 'GST 0%' },
          { label: lang==='ko'?'실물 보유':'Physical Ownership',       bad: lang==='ko'?'✗ 은행 장부상 숫자':'✗ Bank ledger entry',     good: lang==='ko'?'✓ LBMA 실물 바':'✓ LBMA Physical Bar' },
          { label: lang==='ko'?'배분 보관':'Allocated Storage',         bad: lang==='ko'?'✗ 혼합 보관 · 재담보 위험':'✗ Pooled · rehypothecation risk', good: lang==='ko'?'✓ 완전 배분':'✓ Fully Segregated' },
          { label: lang==='ko'?'파산 보호':'Insolvency Protection',     bad: lang==='ko'?'✗ 예금자보호 적용 불가':'✗ No depositor protection',                   good: lang==='ko'?'✓ 법적 분리':'✓ Legally Separated' },
          { label: lang==='ko'?'일련번호':'Serial Number',              bad: lang==='ko'?'✗ 없음':'✗ None',                           good: lang==='ko'?'✓ 고유 식별':'✓ Unique ID' },
          { label: lang==='ko'?'실물 인출':'Physical Withdrawal',       bad: lang==='ko'?'제한적 · 추가 부가세 부과':'Restricted · extra VAT applies',           good: lang==='ko'?'✓ 언제든 가능':'✓ Anytime' },
          { label: lang==='ko'?'관할권 분산':'Jurisdiction',            bad: lang==='ko'?'국내 규제만 적용 · FX 노출':'Korea jurisdiction only · FX exposure',                    good: lang==='ko'?'싱가포르 + 한국 이중':'Singapore + Korea Dual' },
        ];
        return (
        <div ref={ref} style={{ borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 72, paddingBottom: isMobile ? 32 : 64 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '금통장을 가지고 계십니까?' : 'Do you hold a bank gold account?'}</span>
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
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{lang === 'ko' ? '금통장 · ETF · 선물' : 'Bank Account · ETF · Futures'}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: 'rgba(248,113,113,0.6)' }}>{lang === 'ko' ? '"숫자를 보유합니다 — 금이 아닙니다" : "\"You hold numbers — not metal\""'}</div>
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
        </div>
        </div>
        );
      })()}
      {/* KumtongConverter — inline after PvP */}
      <div className="aurum-container" style={{ paddingBottom: isMobile ? 28 : 48 }}>
        <KumtongConverter prices={prices} krwRate={krwRate} lang={lang} />
        <button onClick={() => navigate('storage')} style={{ marginTop:10, background:'transparent', border:'1px solid rgba(197,165,114,0.3)', color:'#c5a572', padding:'9px 18px', fontFamily:SANS, fontSize:13, cursor:'pointer' }}>
          {lang==='ko'?'싱가포르 보관 자세히 알아보기 →':'Full Storage Comparison →'}
        </button>
      </div>

      {/* ── MARKET ANALYTICS — conversion tool ── */}
      {(() => {
        return (
        <div style={{ borderBottom:'1px solid rgba(197,165,114,0.08)', background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 64, paddingBottom: isMobile ? 32 : 64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?20:36 }}>
            <span style={{ fontFamily:MONO, fontSize:10, color:'rgba(197,165,114,0.5)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              {lang==='ko'?'실시간 시장 분석 도구':'Live Market Analytics'}
            </span>
            <h2 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?22:32, color:'#f5f0e8', fontWeight:300, margin:'8px 0 0' }}>
              {lang==='ko'?<>시장이 보여주는 것 — <span style={{ color:'#c5a572' }}>직접 확인하십시오</span></> : <>What the market shows — <span style={{ color:'#c5a572' }}>see for yourself</span></>}
            </h2>
          </div>
          <GoldKRWIndexedChart lang={lang} isMobile={isMobile} />
          <MarketRatios lang={lang} prices={prices} krwRate={krwRate} />
          <SavingsComparisonChart prices={prices} krwRate={krwRate} lang={lang} isMobile={isMobile} />
          <div style={{ marginTop:20, textAlign:'center' }}>
            <button onClick={() => navigate('register')} style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'14px 36px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
              {lang==='ko'?'가입하고 직접 확인하기 →':'Sign up and see for yourself →'}
            </button>
          </div>
        </div>
        </div>
        );
      })()}

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
                <span style={eyebrowStyle}>{lang === 'ko' ? 'Aurum이 다른 이유' : 'Why Aurum is Different'}</span>
                <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '5가지 확실한 근거' : '5 Clear Reasons'}</h2>
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

      {/* ⑦ Shop cards — with scroll reveal */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.08);
        return (
        <div ref={ref} style={{ padding: pad, background: '#141414', borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {/* D-4: standardized eyebrow */}
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '세 가지 방법' : 'Three Ways'}</span>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '지금, 세 가지 방법으로.' : 'Three ways to start, right now.'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14 }}>
            {[
              { iconLines: ['AU', 'AG'], badge: lang === 'ko' ? '일회성 실물 구매' : 'One-time Physical Purchase', title: lang === 'ko' ? '실물 금·은 매매' : 'Physical Gold & Silver', desc: lang === 'ko' ? 'LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분.' : 'Buy LBMA-approved gold and silver bars outright. International spot + transparent premium, allocated to your account instantly.', bullets: lang === 'ko' ? ['1 oz ~ 1 kg 바·1/2 oz 코인', '한 번의 결제·싱가포르 영구 보관', '유선·카드·암호화폐 결제 지원'] : ['1 oz – 1 kg bars · ½ oz coins', 'One payment · Singapore permanent vault', 'Wire · Card · Crypto accepted'], cta: lang === 'ko' ? '제품 둘러보기' : 'Browse Products', route: 'shop-physical', featured: false },
              { iconLines: ['AGP'],      badge: lang === 'ko' ? '자동 적금 저축 플랜' : 'Auto Savings Plan', title: lang === 'ko' ? 'AGP 적금 Plan' : 'AGP 적금 Plan', desc: lang === 'ko' ? '월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환.' : 'Auto-accumulate gold by the gram from ₩200K/month. Pay by Toss auto-transfer, card, or crypto — convert to a physical bar when you hit 100g.', bullets: lang === 'ko' ? ['월 200,000원부터 시작', '매일·매주·매월 자동 적립', '100g 도달 시 실물 바 무료 전환'] : ['From ₩200,000/month', 'Daily · weekly · monthly auto-accumulation', 'Free physical bar conversion at 100g'], cta: lang === 'ko' ? 'AGP 시작하기' : 'Start AGP', route: 'agp-intro', featured: true },
              { iconLines: ['FC'],       badge: lang === 'ko' ? '누적 할인 멤버십' : 'Cumulative Discount', title: 'Founders Club', desc: lang === 'ko' ? '구매 누적에 따라 할인율이 영구적으로 높아집니다. 한번 얻은 할인은 사라지지 않습니다. 5단계 게이트를 통과할수록 더 낮은 가격이 귀하의 것이 됩니다.' : 'Your discount grows with cumulative purchases — permanently. Five gates, each unlocking a lower price that stays yours forever.', bullets: lang === 'ko' ? ['5개 게이트 · 누적 GMV 기준', '한번 얻은 할인 영구 유지', 'HNW 고액 투자자 전용'] : ['5 gates · cumulative GMV basis', 'Discounts are permanent', 'For HNW purchasers'], cta: lang === 'ko' ? 'Founders Club 알아보기' : 'Explore Founders Club', route: 'founders', featured: false },
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

      {/* ⑧ Trust section */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.1);
        const partners = [
          {
            abbr: 'SG', name: 'Malca-Amit FTZ', sub: lang==='ko'?'40년 귀금속 물류 선두. 싱가포르 FTZ 전용 배분 보관.':'40yr precious metals leader. Singapore FTZ allocated custody.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="6" width="18" height="15" rx="1"/><path d="M3 10h18"/><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><circle cx="12" cy="15" r="2"/><line x1="12" y1="17" x2="12" y2="19"/></svg>
          },
          {
            abbr: "LL", name: "Lloyd's of London", sub: lang==='ko'?'전 세계 귀금속 보관 기관의 보험 기준. Aurum 보유 금속 전액 커버.':'Global vault insurance standard. Covers all Aurum-held metals in full.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          },
          {
            abbr: 'LB', name: 'LBMA', sub: lang==='ko'?'국제 귀금속 거래의 글로벌 기준. Aurum은 LBMA 승인 바만 취급합니다.':'Global standard for international precious metals trading. LBMA-approved bars only.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          },
          {
            abbr: 'AK', name: 'PSPM 2019 · MAS', sub: lang==='ko'?'싱가포르 PSPM법 2019 등록 딜러. MAS 규정 AML/KYC 완전 준수.':'Registered under Singapore PSPM Act 2019. Full MAS AML/KYC compliance.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 17.5 13 21 10"/></svg>
          },
          {
            abbr: 'AU', name: lang==='ko'?'매일 감사':'Daily Audit', sub: lang==='ko'?'독립 감사 기관 일일 검증. 레버리지·재담보 없음.':'Independent daily verification. No leverage or rehypothecation.',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><polyline points="10 17 9 17 8 17"/><polyline points="10 13 11.5 15 15 11"/></svg>
          },
        ];
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderTop: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transition: 'opacity 0.8s ease' }}>
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
