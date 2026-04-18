// HomePage.jsx — 4-pane layout: Hero | AGP Launch | Savings | Founders Club
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fUSD, fKRW } from '../lib/index.jsx';
import { StatBar, Accordion, SectionHead } from '../components/UI.jsx';
import { initMagneticCards } from '../lib/magnetic.js';

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
  return (
    <canvas ref={canvasRef} width={500} height={380}
      style={{ display:'block', width:'100%', maxWidth:500, opacity:0.92 }} />
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
              {ko ? 'AGP 론치 이벤트 · Launch Event' : 'AGP Launch Event'}
            </span>
          </div>
          <h2 style={{ fontFamily:ko?T.serifKrDisplay:SERIF, fontSize:isMobile?30:44, fontWeight:400, color:'#f5f0e8', lineHeight:1.15, margin:'0 0 14px' }}>
            {ko ? <>시작하는 날,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>금을 더 드립니다.</span></> : <>On your first day,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>we give you gold.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? '첫 결제 즉시 실물 금 크레딧. 월 납입액에 따라 5단계 티어 자동 배정.' : 'Physical gold credited on your first payment. 5-tier assignment based on monthly contribution.'}
          </p>
          <div style={{ marginBottom:32 }}>
            {tiers.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', marginBottom:4, background:t.featured?'rgba(197,165,114,0.08)':'rgba(255,255,255,0.018)', border:`1px solid ${t.featured?'rgba(197,165,114,0.35)':'rgba(197,165,114,0.07)'}`, position:'relative', overflow:'hidden' }}>
                {t.featured && <div style={GOLD_LINE} />}
                <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:13, color:t.featured?'#E3C187':'#c5a572', minWidth:64 }}>{ko?t.name:t.nameEn}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#555', flex:1 }}>{t.min}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:'#8a7d6b' }}>{ko?'기프트':'Gift'}&nbsp;</span>
                <span style={{ fontFamily:MONO, fontSize:t.featured?15:13, color:t.featured?'#4ade80':'#c5a572', fontWeight:t.featured?700:600 }}>{t.gift}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('campaign-agp-launch')}
            style={{ background:'#c5a572', border:'none', color:'#0a0a0a', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.02em', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#E3C187'}
            onMouseLeave={e => e.currentTarget.style.background='#c5a572'}>
            {ko ? '지금 신청하기 →' : 'Apply Now →'}
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
            {ko ? <>더 많이 구매할수록,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>더 싸게 — 영원히.</span></> : <>The more you buy,<br /><span style={{ color:'#c5a572', fontStyle:'italic' }}>the cheaper — forever.</span></>}
          </h2>
          <p style={{ fontFamily:SANS, fontSize:15, color:'#a09080', lineHeight:1.9, marginBottom:28 }}>
            {ko ? 'GMV 누적으로 5개 게이트를 통과할 때마다 할인이 평생 자동 적용됩니다.' : 'Pass 5 GMV gates and your discount is automatically applied for life on every purchase.'}
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
          <button onClick={() => navigate('campaign-founders')}
            style={{ background:'transparent', border:'1px solid rgba(197,165,114,0.5)', color:'#c5a572', padding:'15px 32px', fontFamily:SANS, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(197,165,114,0.1)'; e.currentTarget.style.borderColor='#c5a572'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(197,165,114,0.5)'; }}>
            {ko ? 'Founders Club 자세히 보기 →' : 'Explore Founders Club →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
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
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="17.5" x2="12" y2="19"/></svg></IconBox>, title: lang==='ko'?'완전 배분 보관 — 귀하의 금속, 귀하의 이름':'Fully Allocated Storage — Your Metal, Your Name', content: lang==='ko'?'귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다.':'Your metal is never commingled with other clients. Registered in your name with a unique serial number at the Malca-Amit Singapore FTZ vault.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/><line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2"/></svg></IconBox>, title: lang==='ko'?'국제 현물가 직거래 — 김치 프리미엄 없음':'International Spot Price — No Kimchi Premium', content: lang==='ko'?'한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 8%(금)/15%(은) 투명 프리미엄.':'Korean retail (KRX, bank gold accounts) carries ~20% above international spot. Aurum: LBMA spot + 8% (gold) / 15% (silver) transparent premium.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></IconBox>, title:"Lloyd's of London — "+(lang==='ko'?'기관급 전액 보험':'Full Institutional Insurance'), content: lang==='ko'?"모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트 공개.":"All held metals are fully insured by Lloyd's of London institutional coverage. Covers natural disaster, theft, and loss. Daily audit reports published." },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg></IconBox>, title: lang==='ko'?'LBMA 승인 바 & 언제든 실물 인출':'LBMA-Approved Bars & Physical Withdrawal Anytime', content: lang==='ko'?'모든 금속은 LBMA 승인 제련소(PAMP, Heraeus, Valcambi, RCM) 제품입니다. 100g 이상 보유 시 실물 바로 무료 전환 또는 KRW 즉시 정산.':'All metals are from LBMA-approved refiners (PAMP, Heraeus, Valcambi, RCM). Free physical bar conversion at 100g+ or instant KRW settlement.' },
    { icon:<IconBox><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="11" y2="17"/><polyline points="11 13 12.5 15 16 11"/></svg></IconBox>, title: lang==='ko'?'매일 공개 감사 · 100% 실물 백킹':'Daily Public Audit · 100% Physical Backing', content: lang==='ko'?'모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 숨겨진 레버리지 없음.':'100% physical backing for every AGP gram and allocated metal is published daily in the audit report. No hidden leverage.' },
  ];

  return (
    <div>
      {/* ① HERO — caption left + animated visual right */}
      <div style={{ position:'relative', minHeight:isMobile?'auto':560, background:'linear-gradient(135deg,#0a0a0a,#141414 40%,#0a0a0a)', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 40px)', pointerEvents:'none' }} />
        {!isMobile && <div style={{ position:'absolute', top:'50%', right:'6%', transform:'translateY(-50%)', width:520, height:520, background:'radial-gradient(ellipse, rgba(197,165,114,0.09) 0%, transparent 65%)', pointerEvents:'none' }} />}
        {!isMobile && <div style={{ position:'absolute', bottom:'10%', right:'12%', width:280, height:280, background:'radial-gradient(ellipse, rgba(197,165,114,0.04) 0%, transparent 65%)', pointerEvents:'none' }} />}
        <div className="aurum-container" style={{ position:'relative', zIndex:1, display:isMobile?'block':'flex', alignItems:'center', gap:48, paddingTop:isMobile?28:80, paddingBottom:isMobile?32:80, width:'100%' }}>
          {/* Left: caption */}
          <div style={{ flex:1, maxWidth:isMobile?'100%':520 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'nowrap', overflow:'hidden' }}>
              <div style={{ width:28, height:1, background:'#c5a572', flexShrink:0 }} />
              <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:isMobile?12:14, color:'#c5a572', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                {lang==='ko'?'실물 귀금속 플랫폼':'Physical Precious Metals'}
              </span>
              <span style={{ color:'#8a7d6b' }}>·</span>
              <span style={{ fontFamily:MONO, fontSize:isMobile?10:11, color:'#c5a572', letterSpacing:'0.16em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                {lang==='ko'?'한국 투자자 전용':'For Korean Investors'}
              </span>
              {!isMobile && <div style={{ width:28, height:1, background:'#c5a572', flexShrink:0 }} />}
            </div>
            <h1 style={{ fontFamily:lang==='ko'?T.serifKrDisplay:SERIF, fontSize:isMobile?32:54, fontWeight:300, color:'#f5f0e8', lineHeight:1.1, margin:'0 0 20px' }}>
              {lang==='ko'?(<><span style={{ color:'#c5a572', fontWeight:600 }}>진짜 금. 진짜 은.</span><br />진짜 소유.</>):(<><span style={{ color:'#c5a572', fontWeight:600 }}>Real Gold. Real Silver.</span><br />Real Ownership.</>)}
            </h1>
            <p style={{ fontFamily:SANS, fontSize:isMobile?14:16, color:'#a09080', lineHeight:1.95, margin:'0 0 28px' }}>
              {lang==='ko'?'은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.':'Not a bank account. Not a KRX fund. Physical metal registered in your name at the Malca-Amit Singapore FTZ vault — priced at international spot.'}
            </p>
            <div style={{ display:'flex', gap:12, flexDirection:isMobile?'column':'row' }}>
              <button onClick={() => navigate('shop-physical')} style={{ flex:1, background:'linear-gradient(135deg,#c5a572,#8a6914)', color:'#fff', border:'none', padding:'14px 20px', fontSize:15, fontFamily:SANS, fontWeight:700, borderRadius:0, cursor:'pointer' }}>
                {lang==='ko'?'지금 구매 시작 →':'Start Buying →'}
              </button>
              <button onClick={() => navigate('agp-intro')} style={{ flex:1, background:'transparent', color:'#a09080', border:'1px solid #282828', padding:'14px 20px', fontSize:15, fontFamily:SANS, fontWeight:600, borderRadius:0, cursor:'pointer' }}>
                {lang==='ko'?'AGP · 월 20만원부터':'AGP Savings · from ₩200K/mo'}
              </button>
            </div>
            <div style={{ marginTop:16, display:'flex', gap:12, flexWrap:'wrap', justifyContent:isMobile?'center':'flex-start' }}>
              {(lang==='ko'?["Lloyd's 보험",'LBMA 승인','완전 배분 보관','매일 공개 감사']:["Lloyd's Insured",'LBMA Approved','Fully Allocated','Daily Audit']).map((t,i)=>(
                <span key={i} style={{ fontFamily:MONO, fontSize:11, color:'#8a7d6b', letterSpacing:'0.06em' }}>✓ {t}</span>
              ))}
            </div>
          </div>
          {/* Right: animated canvas visual */}
          {!isMobile && (
            <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
              <HeroAnimatedVisual prices={prices} />
            </div>
          )}
        </div>
      </div>

      {/* ② AGP Launch Event — full-width pane */}
      <AGPLaunchPane lang={lang} navigate={navigate} />

      <SealDivider />

      {/* ③ Stats bar — animated CountUp on scroll */}
      {(() => {
        const stats = [
          { num: 100, suffix: '%', label: lang === 'ko' ? '완전 배분 보관' : 'Fully Allocated', prefix: '' },
          { num: 8,   suffix: '%', label: lang === 'ko' ? 'Aurum 금 투명 프리미엄' : 'Aurum Gold Premium', prefix: '+' },
          { num: null, text: "Lloyd's", label: lang === 'ko' ? '기관급 전액 보험' : 'Full Insurance' },
          { num: null, text: 'LBMA',    label: lang === 'ko' ? '승인 제련소' : 'Approved Bars' },
        ];
        function StatCell({ s, i, isMobile }) {
          const [ref, vis] = useScrollReveal(0.3);
          const count = useCountUp(s.num || 0, 1400, vis && !!s.num);
          const display = s.num ? `${s.prefix}${count}${s.suffix}` : s.text;
          return (
            <div ref={ref} key={i} style={{
              padding: isMobile ? '16px 10px' : '22px 24px', textAlign: 'center',
              borderRight: isMobile ? (i%2===0?'1px solid #1e1e1e':'none') : (i<3?'1px solid #1e1e1e':'none'),
              borderBottom: isMobile && i<2 ? '1px solid #1e1e1e' : 'none',
              opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.6s ease ${i*0.1}s, transform 0.6s ease ${i*0.1}s`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: isMobile ? 18 : 26, color: '#c5a572', fontWeight: 700, letterSpacing: '-0.02em' }}>{display}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: '#8a7d6b', marginTop: 4 }}>{s.label}</div>
            </div>
          );
        }
        return (
          <div style={{ background: '#141414', borderBottom: '1px solid rgba(197,165,114,0.08)' }}>
            <div className="aurum-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)' }}>
              {stats.map((s, i) => <StatCell key={i} s={s} i={i} isMobile={isMobile} />)}
            </div>
          </div>
        );
      })()}

      {/* ④ Savings comparison — with visual premium bars */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.1);
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(20px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 40 : 72, paddingBottom: isMobile ? 32 : 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={eyebrowStyle}>{lang === 'ko' ? '가격 비교' : 'Price Comparison'}</span>
              <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '얼마나 절약하나요?' : 'How Much Do You Save?'}</h2>
              <p style={{ fontFamily: SANS, fontSize: 13, color: '#8a7d6b', margin: '6px 0 0' }}>{lang === 'ko' ? 'Aurum 매입가 vs 한국실금가 (국내 프리미엄+VAT)' : 'Aurum Price vs Korean Retail (domestic premium + VAT)'}</p>
            </div>
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: 'rgba(197,165,114,0.08)', border: '1px solid rgba(197,165,114,0.4)', color: '#c5a572', padding: '5px 14px', cursor: 'pointer', fontFamily: MONO, fontSize: 11, borderRadius: 4, alignSelf: 'flex-start' }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
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
                  { l: lang === 'ko' ? '한국실금가 (국내 프리미엄+VAT)' : 'Korea Retail (premium+VAT)', v: fP(c.kr / krwRate), col: '#f87171' },
                  { l: lang === 'ko' ? 'Aurum 매입가' : 'Aurum Price', v: fP(c.au / krwRate), col: '#c5a572' },
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
                  <span style={{ fontFamily: SANS, fontSize: 12, color: '#f5f0e8', fontWeight: 600 }}>{lang === 'ko' ? '절감 금액' : 'Your Savings'}</span>
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
      <FoundersClubPane lang={lang} navigate={navigate} />

      <SealDivider />

      {/* ⑤ Paper vs Physical — split-grid visual table */}
      {(() => {
        const [ref, vis] = useScrollReveal(0.08);
        const pvpRows = [
          { label: lang==='ko'?'구매 시 부가세':'Purchase VAT',       bad: lang==='ko'?'10% 즉시 발생':'10% immediately',         good: 'GST 0%' },
          { label: lang==='ko'?'실물 보유':'Physical Ownership',       bad: lang==='ko'?'✗ 청구권 (미실물)':'✗ Claim, not metal',     good: lang==='ko'?'✓ LBMA 실물 바':'✓ LBMA Physical Bar' },
          { label: lang==='ko'?'배분 보관':'Allocated Storage',         bad: lang==='ko'?'✗ 풀링/재담보':'✗ Pooled / rehypothecated', good: lang==='ko'?'✓ 완전 배분':'✓ Fully Segregated' },
          { label: lang==='ko'?'파산 보호':'Insolvency Protection',     bad: lang==='ko'?'✗ 불확실':'✗ Uncertain',                   good: lang==='ko'?'✓ 법적 분리':'✓ Legally Separated' },
          { label: lang==='ko'?'일련번호':'Serial Number',              bad: lang==='ko'?'✗ 없음':'✗ None',                           good: lang==='ko'?'✓ 고유 식별':'✓ Unique ID' },
          { label: lang==='ko'?'실물 인출':'Physical Withdrawal',       bad: lang==='ko'?'제한적·수수료':'Restricted, fees',           good: lang==='ko'?'✓ 언제든 가능':'✓ Anytime' },
          { label: lang==='ko'?'관할권 분산':'Jurisdiction',            bad: lang==='ko'?'국내 only':'Korea only',                    good: lang==='ko'?'싱가포르 AAA':'Singapore AAA' },
        ];
        return (
        <div ref={ref} style={{ borderBottom: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 72, paddingBottom: isMobile ? 32 : 64 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
            <span style={{ ...eyebrowStyle, display: 'block', textAlign: 'center' }}>{lang === 'ko' ? '근본적인 차이' : 'The Fundamental Difference'}</span>
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
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{lang === 'ko' ? '페이퍼 금·은' : 'Paper Gold / Silver'}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: 'rgba(248,113,113,0.6)' }}>{lang === 'ko' ? '"청구권을 보유합니다"' : '"You hold a claim"'}</div>
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
                <span style={eyebrowStyle}>{lang === 'ko' ? '핵심 차별점' : 'Why Choose Aurum'}</span>
                <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : 38, color: '#f5f0e8', fontWeight: isMobile ? 300 : 400, margin: 0 }}>{lang === 'ko' ? '왜 Aurum이어야 하는가' : 'The Aurum Difference'}</h2>
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
            abbr: 'SG', name: 'Malca-Amit FTZ', sub: lang==='ko'?'싱가포르 자유무역지대 전용 금고':'Singapore FTZ Dedicated Vault',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="6" width="18" height="15" rx="1"/><path d="M3 10h18"/><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><circle cx="12" cy="15" r="2"/><line x1="12" y1="17" x2="12" y2="19"/></svg>
          },
          {
            abbr: "LL", name: "Lloyd's of London", sub: lang==='ko'?'기관급 전액 귀금속 보험':'Full Precious Metals Insurance',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          },
          {
            abbr: 'LB', name: 'LBMA', sub: lang==='ko'?'런던 귀금속 시장 협회 승인':'London Bullion Market Association',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 9h14l-1 9H6L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          },
          {
            abbr: 'AK', name: 'AML / KYC', sub: lang==='ko'?'싱가포르 MAS 규정 준수':'Singapore MAS Compliant',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 17.5 13 21 10"/></svg>
          },
          {
            abbr: 'AU', name: lang==='ko'?'매일 감사':'Daily Audit', sub: lang==='ko'?'100% 실물 백킹 리포트':'100% Physical Backing Report',
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><polyline points="10 17 9 17 8 17"/><polyline points="10 13 11.5 15 15 11"/></svg>
          },
        ];
        return (
        <div ref={ref} style={{ background: '#0a0a0a', borderTop: '1px solid rgba(197,165,114,0.08)', opacity: vis?1:0, transition: 'opacity 0.8s ease' }}>
          {/* Top label */}
          <div style={{ borderBottom: '1px solid rgba(197,165,114,0.06)', paddingTop: isMobile?20:28, paddingBottom: isMobile?16:20, textAlign: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              {lang==='ko' ? '세계 최고 파트너사와 함께' : 'Powered by World-Class Partners'}
            </span>
          </div>
          <div className="aurum-container">
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
