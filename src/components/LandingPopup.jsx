// LandingPopup.jsx — Full-screen 2-slide welcome popup
// Slide 1: AGP Launch free gold credits (full screen)
// Slide 2: Founders Club lifetime benefits (full screen)
// No tabs — both slides shown full screen one at a time with navigation
import { useState, useEffect } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';

const TIERS = [
  { name:'브론즈', nameEn:'Bronze', min:'₩200K', gift:'₩50,000',  color:'#a0906e', num:'I'   },
  { name:'실버',   nameEn:'Silver', min:'₩500K', gift:'₩150,000', color:'#b0b8c8', num:'II'  },
  { name:'골드',   nameEn:'Gold',   min:'₩1M',   gift:'₩400,000', color:'#C5A572', num:'III' },
  { name:'플래티넘',nameEn:'Plat.', min:'₩2M',   gift:'₩1,000,000',color:'#93c5fd',num:'IV'  },
  { name:'소브린', nameEn:'Sov.',   min:'₩5M',   gift:'₩5,000,000',color:'#E3C187', num:'V'  },
];
const GATES = [
  { num:'I',  label:'시작의 문', threshold:'$5K',   discount:'−1.0%', storage:'0.75%', color:'#8a7d6b' },
  { num:'II', label:'성장의 표식',threshold:'$15K',  discount:'−1.5%', storage:'0.50%', color:'#a09070' },
  { num:'III',label:'정점 ✦',    threshold:'$35K',  discount:'−2.0%', storage:'0.50%', color:'#C5A572', apex:true },
  { num:'IV', label:'금고의 문', threshold:'$65K',  discount:'−2.5%', storage:'0.30%', color:'#d4b880' },
  { num:'V',  label:'평생의 표식',threshold:'$100K', discount:'−3.0%', storage:'0.30%', color:'#E3C187' },
];

// ── GoldPath inline mark ─────────────────────────────────────────────────────
function GoldPathMark({ scale = 0.5 }) {
  return (
    <svg viewBox="0 0 240 70" width={Math.round(240*scale)} height={Math.round(70*scale)} style={{ display:'block' }}>
      <defs><style>{`@keyframes gp-lp{0%,100%{opacity:1}50%{opacity:0}}.gp-lp{animation:gp-lp 1.2s step-end infinite}`}</style></defs>
      <text x="8" y="22" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="16" fill="#f5f0e8">₩</text>
      <rect x="28" y="16" width="7" height="6" fill="#1e1408"/>
      <rect x="37" y="13" width="7" height="9" fill="#5a3c18"/>
      <rect x="46" y="9"  width="7" height="13" fill="#C5A572"/>
      <rect x="55" y="5"  width="7" height="17" fill="#E3C187"/>
      <polyline points="31.5,16 40.5,13 49.5,9 58.5,5" fill="none" stroke="rgba(197,165,114,.22)" strokeWidth=".7"/>
      <line x1="62" y1="12" x2="80" y2="12" stroke="#C5A572" strokeWidth="1.2"/>
      <path d="M75 8 L82 12 L75 16" fill="none" stroke="#C5A572" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
      <text x="87" y="22">
        <tspan fontFamily="'Cormorant Garamond','Georgia',serif" fontStyle="italic" fontSize="14" fill="#E3C187">Au</tspan>
        <tspan fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="10" fill="#7a6d58" dx="3">(금)</tspan>
      </text>
      <line x1="8" y1="28" x2="232" y2="28" stroke="#1e1c10" strokeWidth=".4"/>
      <text x="8"  y="46" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="19" fill="#C5A572">›</text>
      <text x="22" y="46" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="19" fill="#f0ece4">GoldPath</text>
      <rect x="118" y="30" width="2" height="16" fill="#C5A572" className="gp-lp"/>
      <text x="8" y="62" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="14" fill="#7a6d58" letterSpacing=".2em">금환</text>
    </svg>
  );
}

export default function LandingPopup({ lang, navigate }) {
  const [slide, setSlide]     = useState(0); // 0=AGP, 1=Founders
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';

  useEffect(() => {
    const dismissed = sessionStorage.getItem('aurum_popup_v3');
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      sessionStorage.setItem('aurum_popup_v3', '1');
      setVisible(false);
      setExiting(false);
    }, 280);
  };

  if (!visible) return null;

  const SERIF = T.serif; const SANS = T.sans; const MONO = T.mono;

  /* ── SLIDE 1: GOLDPATH LAUNCH ─────────────────────────────────────────────── */
  const AGPSlide = () => (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      background:`radial-gradient(ellipse at 30% 20%, rgba(197,165,114,0.12), transparent 55%), linear-gradient(180deg,#0d0b08,#111008)`,
      padding: isMobile ? '32px 20px 24px' : '48px 56px 40px',
      position:'relative', overflow:'hidden',
    }}>
      {/* Watermark */}
      <div style={{ position:'absolute', bottom:-20, right:-10, fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?70:160, color:'rgba(197,165,114,0.03)', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>금</div>

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column' }}>
        {/* GoldPath product mark */}
        <div style={{ marginBottom: 14 }}>
          <GoldPathMark scale={isMobile ? 0.38 : 0.46} />
        </div>
        {/* Signal strip */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80', flexShrink:0, animation:'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontFamily:MONO, fontSize:9, color:'#4ade80', letterSpacing:'0.22em', textTransform:'uppercase' }}>
            {ko?'중앙은행 신호 · 2024년 순매입 1,045톤':'CB Signal · 1,045t Net Purchase 2024'}
          </span>
        </div>

        <h2 style={{ fontFamily: ko?T.serifKr:SERIF, fontStyle: ko?'normal':'italic', fontSize: isMobile?26:40, fontWeight:300, color:T.text, lineHeight:1.1, marginBottom:12 }}>
          {ko?<>중앙은행이 금을 사고 있습니다.<br /><span style={{ color:T.gold, fontFamily:SERIF, fontStyle:'italic' }}>당신의 원화는 그것에 비해 약해집니다.</span></> : <>Central banks are buying gold.<br /><span style={{ color:T.gold }}>Your won is weakening against it.</span></>}
        </h2>

        <p style={{ fontFamily:SANS, fontSize: isMobile?12:14, color:T.textSub, lineHeight:1.8, marginBottom:20, maxWidth:460 }}>
          {ko?'2020년 이후 ₩100만원의 금 구매력은 74% 하락했습니다. GoldPath는 매달 원화를 실물 금으로 자동 전환합니다 — 국제 현물가로, 귀하의 이름으로, 싱가포르 금고에.':'Since 2020, ₩1M buys 74% less gold. GoldPath automatically converts KRW to physical gold every month — at international spot, in your name, in a Singapore vault.'}
        </p>

        {/* Launch tier incentive row */}
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${isMobile?3:5},1fr)`, gap:6, marginBottom:20 }}>
          {(isMobile ? TIERS.filter((_,i)=>[0,2,4].includes(i)) : TIERS).map((t,i) => (
            <div key={i} style={{ background: t.num==='III'?`linear-gradient(180deg,rgba(197,165,114,0.12),rgba(197,165,114,0.04))`:'rgba(255,255,255,0.03)', border:`1px solid ${t.num==='III'?T.gold:T.goldBorder}`, padding: isMobile?'8px 4px':'12px 8px', textAlign:'center', position:'relative' }}>
              {t.num==='III' && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:9, color:t.color, marginBottom:2 }}>{ko?t.name:t.nameEn}</div>
              <div style={{ fontFamily:MONO, fontSize:isMobile?8:9, color:T.textMuted, marginBottom:4 }}>{t.min}+</div>
              <div style={{ fontFamily:MONO, fontSize: isMobile?12:15, color:t.color, fontWeight:700 }}>{t.gift.replace('₩','').replace(',000,000','M').replace(',000','K')}<span style={{ fontSize:8, marginLeft:1 }}>₩</span></div>
              <div style={{ fontFamily:SANS, fontSize:7, color:T.textMuted, marginTop:2 }}>{ko?'즉시 적립':'day-1 gold'}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto', display:'flex', gap:10, flexDirection: isMobile?'column':'row' }}>
          <button onClick={() => { navigate('agp'); dismiss(); }}
            style={{ flex:2, background: 'linear-gradient(135deg,#c5a572,#9a7840)', border:'none', color:'#0a0a0a', padding:'14px 20px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
            {ko
              ? <><span style={{ fontFamily:SERIF, fontStyle:'italic', marginRight:6 }}>금환</span>시작하기 →</>
              : <><span style={{ fontFamily:SERIF, fontStyle:'italic', marginRight:6 }}>GoldPath</span>Start →</>
            }
          </button>
          <button onClick={() => setSlide(1)}
            style={{ flex:1, background:'rgba(197,165,114,0.08)', border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'14px 12px', fontSize:12, cursor:'pointer', fontFamily:SANS }}>
            {ko?'Founders →':'Founders →'}
          </button>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: '#555', textAlign: 'center', marginTop: 8 }}>
          {ko ? '언제든 중단 가능 · 최소 약정 없음' : 'Cancel anytime · no minimum commitment'}
        </div>
      </div>
    </div>
  );

  /* ── SLIDE 2: FOUNDERS CLUB ──────────────────────────────────────────────── */
  const FoundersSlide = () => (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      background:`radial-gradient(ellipse at 70% 20%, rgba(74,222,128,0.08), transparent 55%), linear-gradient(180deg,#080d0a,#0a0d0b)`,
      padding: isMobile ? '32px 20px 24px' : '48px 56px 40px',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', bottom:-20, right:-10, fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?60:140, color:'rgba(74,222,128,0.025)', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>FOUNDERS</div>

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:MONO, fontSize:9, color:'rgba(74,222,128,0.6)', letterSpacing:'0.26em', textTransform:'uppercase', marginBottom:14 }}>
          {ko?'Founders Club · 한정 멤버십 · 247자리':'Founders Club · Limited Membership · 247 Spots'}
        </div>
        <h2 style={{ fontFamily: ko?T.serifKr:SERIF, fontStyle: ko?'normal':'italic', fontSize: isMobile?28:42, fontWeight:300, color:T.text, lineHeight:1.1, marginBottom:14 }}>
          {ko?<>한국보다 최대<br /><span style={{ color:'#4ade80', fontFamily:SERIF, fontStyle:'italic' }}>−3% 평생 할인.</span></> : <>Up to −3% below<br /><span style={{ color:'#4ade80' }}>Korea — for life.</span></>}
        </h2>
        <p style={{ fontFamily:SANS, fontSize: isMobile?13:15, color:T.textSub, lineHeight:1.8, marginBottom:24, maxWidth:460 }}>
          {ko?'총 구매금액이 5개 단계를 통과할 때마다, 그 할인은 평생 유지됩니다. 한 번 열린 게이트는 절대 닫히지 않습니다.':'Each time your cumulative purchases pass a gate, that discount is locked in for life. Gates never close.'}
        </p>

        {/* Gate progression */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
          {GATES.map((g,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 72px 64px', gap:10, alignItems:'center', padding:'9px 12px', background: g.apex?'rgba(74,222,128,0.05)':'rgba(255,255,255,0.02)', border:`1px solid ${g.apex?'rgba(74,222,128,0.3)':T.border}` }}>
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:12, color:g.color, textAlign:'center' }}>{g.num}</div>
              <div style={{ fontFamily:SANS, fontSize: isMobile?11:12, color:g.apex?T.text:T.textSub }}>{ko?g.label:g.label}</div>
              <div style={{ fontFamily:MONO, fontSize:10, color:T.textMuted }}>{g.threshold}</div>
              <div style={{ fontFamily:MONO, fontSize: isMobile?13:14, color:g.color, fontWeight:700, textAlign:'right' }}>{g.discount}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
            <div style={{ fontFamily:MONO, fontSize:11, color:'#4ade80' }}>Gate I &nbsp;→&nbsp; ₩50,000 즉시 적립</div>
            <div style={{ fontFamily:MONO, fontSize:11, color:'#4ade80' }}>Gate III →&nbsp; ₩400,000 즉시 적립</div>
          </div>
          <div style={{ display:'flex', gap:10, flexDirection: isMobile?'column':'row' }}>
          <button onClick={() => { navigate('register'); dismiss(); }}
            style={{ flex:2, background:'#4ade80', border:'none', color:'#052e16', padding:'14px 20px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
            {ko?'파운더스 클럽 가입 →':'Join Founders Club →'}
          </button>
          <button onClick={() => { navigate('founders-promo'); dismiss(); }}
            style={{ flex:1, background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', padding:'14px 16px', fontSize:13, cursor:'pointer', fontFamily:SANS }}>
            {ko?'자세히 보기':'Learn More'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:10000,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding: isMobile ? 12 : 24,
      opacity: exiting ? 0 : 1,
      transition:'opacity 0.28s ease',
    }} onClick={dismiss}>
      <div style={{
        width:'100%', maxWidth: isMobile ? '100%' : 900,
        maxHeight: isMobile ? 'calc(100svh - 24px)' : '88vh',
        display:'flex', flexDirection:'column',
        background:'#0a0a0a',
        border:`1px solid ${slide===0 ? T.goldBorder : 'rgba(74,222,128,0.3)'}`,
        boxShadow:`0 40px 100px rgba(0,0,0,0.9)`,
        overflow:'hidden',
        transition:'border-color 0.4s',
      }} onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          {/* Slide indicators */}
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {[0,1].map(i => (
              <button key={i} onClick={() => setSlide(i)} style={{
                width: slide===i ? 24 : 8, height:4,
                background: slide===i ? (i===0?T.gold:'#4ade80') : T.border,
                border:'none', cursor:'pointer', transition:'all 0.3s', padding:0,
              }} />
            ))}
            <span style={{ fontFamily:MONO, fontSize:9, color:T.textMuted, marginLeft:6, letterSpacing:'0.1em' }}>
              {slide===0 ? (ko?'1/2 · AGP 론치':'1/2 · AGP Launch') : (ko?'2/2 · Founders Club':'2/2 · Founders')}
            </span>
          </div>
          <button onClick={dismiss} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
        </div>

        {/* Full-screen slide content */}
        <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
          {slide === 0 ? <AGPSlide /> : <FoundersSlide />}
        </div>

        {/* Bottom nav arrows */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <button onClick={() => setSlide(s => Math.max(0, s-1))} style={{ background:'none', border:`1px solid ${T.border}`, color: slide===0?T.border:T.textMuted, padding:'7px 16px', cursor: slide===0?'default':'pointer', fontFamily:MONO, fontSize:10, letterSpacing:'0.1em' }} disabled={slide===0}>
            ← {ko?'이전':'Prev'}
          </button>
          <button onClick={dismiss} style={{ background:'none', border:'none', color:T.textMuted, fontFamily:SANS, fontSize:12, cursor:'pointer' }}>
            {ko?'나중에 보기':'Skip for now'}
          </button>
          <button onClick={() => slide===1 ? dismiss() : setSlide(1)} style={{ background:'none', border:`1px solid ${T.border}`, color:T.textSub, padding:'7px 16px', cursor:'pointer', fontFamily:MONO, fontSize:10, letterSpacing:'0.1em' }}>
            {slide===1 ? (ko?'닫기':'Close') : (ko?'다음 →':'Next →')}
          </button>
        </div>
      </div>
    </div>
  );
}
