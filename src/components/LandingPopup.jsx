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

  /* ── SLIDE 1: AGP LAUNCH ─────────────────────────────────────────────────── */
  const AGPSlide = () => (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      background:`radial-gradient(ellipse at 30% 20%, rgba(197,165,114,0.12), transparent 55%), linear-gradient(180deg,#0d0b08,#111008)`,
      padding: isMobile ? '32px 20px 24px' : '48px 56px 40px',
      position:'relative', overflow:'hidden',
    }}>
      {/* Watermark */}
      <div style={{ position:'absolute', bottom:-20, right:-10, fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?70:160, color:'rgba(197,165,114,0.03)', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>AGP</div>

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:MONO, fontSize:9, color:T.goldDim, letterSpacing:'0.26em', textTransform:'uppercase', marginBottom:14 }}>
          {ko?'AGP 론치 이벤트 · 창립 한정':'AGP Launch Event · Founding Limited'}
        </div>
        <h2 style={{ fontFamily: ko?T.serifKr:SERIF, fontStyle: ko?'normal':'italic', fontSize: isMobile?28:42, fontWeight:300, color:T.text, lineHeight:1.1, marginBottom:14 }}>
          {ko?<>시작하는 날,<br /><span style={{ color:T.gold, fontFamily:SERIF, fontStyle:'italic' }}>금을 더 드립니다.</span></> : <>On your first day,<br /><span style={{ color:T.gold }}>we give you gold.</span></>}
        </h2>
        <p style={{ fontFamily:SANS, fontSize: isMobile?13:15, color:T.textSub, lineHeight:1.8, marginBottom:24, maxWidth:460 }}>
          {ko?'첫 결제 즉시, 선택한 월 적금액에 따라 실물 금이 자동 적립됩니다. Founders Club 파트너로 자동 등록.':'Physical gold is credited the moment your first payment settles. Auto-enrolled as a Founders Club partner.'}
        </p>

        {/* Tier cards — horizontal */}
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${isMobile?3:5},1fr)`, gap:8, marginBottom:24 }}>
          {(isMobile ? TIERS.filter((_,i)=>[0,2,4].includes(i)) : TIERS).map((t,i) => (
            <div key={i} style={{ background: t.num==='III'?`linear-gradient(180deg,rgba(197,165,114,0.12),rgba(197,165,114,0.04))`:'rgba(255,255,255,0.03)', border:`1px solid ${t.num==='III'?T.gold:T.goldBorder}`, padding: isMobile?'10px 6px':'14px 10px', textAlign:'center', position:'relative' }}>
              {t.num==='III' && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:10, color:t.color, marginBottom:3 }}>{ko?t.name:t.nameEn}</div>
              <div style={{ fontFamily:MONO, fontSize: isMobile?9:10, color:T.textMuted, marginBottom:5 }}>{t.min}+</div>
              <div style={{ fontFamily:MONO, fontSize: isMobile?13:17, color:t.color, fontWeight:700 }}>{t.gift.replace('₩','').replace(',000,000','M').replace(',000','K')}
                <span style={{ fontSize:9, marginLeft:1 }}>₩</span>
              </div>
              <div style={{ fontFamily:SANS, fontSize:8, color:T.textMuted, marginTop:2 }}>{ko?'실물 금':'gold gift'}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto', display:'flex', gap:10, flexDirection: isMobile?'column':'row' }}>
          <button onClick={() => { navigate('campaign-agp-launch'); dismiss(); }}
            style={{ flex:2, background:T.gold, border:'none', color:'#0a0a0a', padding:'14px 20px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
            {ko?'AGP 론치 이벤트 참여 →':'Join AGP Launch Event →'}
          </button>
          <button onClick={() => setSlide(1)}
            style={{ flex:1, background:'rgba(197,165,114,0.08)', border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'14px 16px', fontSize:13, cursor:'pointer', fontFamily:SANS }}>
            {ko?'Founders 혜택 보기 →':'Founders Benefits →'}
          </button>
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

        <div style={{ marginTop:'auto', display:'flex', gap:10, flexDirection: isMobile?'column':'row' }}>
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
