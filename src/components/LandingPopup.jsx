// LandingPopup.jsx — 2-panel welcome popup on first visit
// Panel 1: AGP Launch free credits | Panel 2: Founders promo life benefits
import { useState, useEffect } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';

export default function LandingPopup({ lang, navigate, onClose }) {
  const [panel, setPanel] = useState(0); // 0 = AGP, 1 = Founders
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();
  const ko = lang === 'ko';

  useEffect(() => {
    // Show after 1.5s, respect session-dismiss
    const dismissed = sessionStorage.getItem('aurum_popup_dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('aurum_popup_dismissed', '1');
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const SERIF = T.serif;
  const SANS = T.sans;
  const MONO = T.mono;

  const panels = [
    {
      badge:   ko ? 'AGP 론치 이벤트 · 창립 한정' : 'AGP Launch Event · Founding Limited',
      title:   ko ? <>시작하는 날,<br /><span style={{ color: T.gold, fontStyle:'italic', fontFamily:SERIF }}>금을 더 드립니다.</span></> : <>On your first day,<br /><span style={{ color: T.gold, fontStyle:'italic', fontFamily:SERIF }}>we give you gold.</span></>,
      body:    ko ? '첫 결제 즉시 실물 금 크레딧. 월 적금액에 따라 ₩50K ~ ₩5M 실물 금이 자동 적립됩니다.' : 'Physical gold credited on first payment. ₩50K – ₩5M gold gift based on monthly savings amount.',
      cta:     ko ? 'AGP 론치 이벤트 보기 →' : 'View AGP Launch Event →',
      route:   'campaign-agp-launch',
      accent:  T.gold,
      glow:    'rgba(197,165,114,0.12)',
      items: [
        { tier: ko?'브론즈':'Bronze', min:'₩200K', gift:'₩50K',    color:T.goldDim   },
        { tier: ko?'골드':'Gold',     min:'₩1M',   gift:'₩400K',   color:T.gold      },
        { tier: ko?'소브린':'Sovereign',min:'₩5M', gift:'₩5,000K', color:T.goldBright },
      ],
    },
    {
      badge:   ko ? 'Founders Club · 한정 멤버십' : 'Founders Club · Limited Membership',
      title:   ko ? <>한국보다 최대<br /><span style={{ color:'#4ade80', fontStyle:'italic', fontFamily:SERIF }}>−3% 평생 할인.</span></> : <>Up to −3% below<br /><span style={{ color:'#4ade80', fontStyle:'italic', fontFamily:SERIF }}>Korean retail — for life.</span></>,
      body:    ko ? '총 구매금액이 5개 단계를 통과할 때마다 그 할인은 평생 유지됩니다. 247자리 남았습니다.' : 'Each gate you pass locks in a lifetime discount. 247 spots remaining.',
      cta:     ko ? 'Founders 멤버십 보기 →' : 'View Founders Membership →',
      route:   'founders-promo',
      accent:  '#4ade80',
      glow:    'rgba(74,222,128,0.08)',
      items: [
        { tier: 'Gate I',   threshold:'$5K',   discount:'−1%',  color:T.goldDim   },
        { tier: 'Gate III ✦', threshold:'$35K', discount:'−2%',  color:'#4ade80'   },
        { tier: 'Gate V',   threshold:'$100K', discount:'−3%',  color:T.goldBright },
      ],
    },
  ];

  const p = panels[panel];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', padding: isMobile ? 16 : 20 }}
      onClick={dismiss}>
      <div style={{ background:T.bg, border:`1px solid ${p.accent}44`, maxWidth:540, width:'100%', position:'relative', overflow:'hidden', boxShadow:`0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px ${p.accent}22` }}
        onClick={e => e.stopPropagation()}>

        {/* Top accent line */}
        <div style={{ height:2, background:`linear-gradient(90deg, transparent, ${p.accent}, transparent)` }} />

        {/* Panel toggle tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${T.border}` }}>
          {panels.map((tab, i) => (
            <button key={i} onClick={() => setPanel(i)} style={{ flex:1, background:'none', border:'none', padding:'12px 16px', cursor:'pointer', fontFamily:MONO, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color: panel===i ? panels[i].accent : T.textMuted, borderBottom: panel===i ? `2px solid ${panels[i].accent}` : '2px solid transparent', transition:'all 0.2s', marginBottom:-1 }}>
              {i===0 ? (ko?'AGP 론치 기프트':'AGP Launch Gift') : (ko?'Founders 혜택':'Founders Benefits')}
            </button>
          ))}
          <button onClick={dismiss} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', padding:'12px 16px', fontSize:18, lineHeight:1 }}>×</button>
        </div>

        {/* Panel content */}
        <div style={{ padding: isMobile ? '24px 20px' : '32px 36px', background:`radial-gradient(ellipse at 80% 20%, ${p.glow}, transparent 60%)` }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:p.accent, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:14 }}>{p.badge}</div>
          <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile ? 24 : 30, fontWeight:400, color:T.text, marginBottom:14, lineHeight:1.15 }}>{p.title}</h2>
          <p style={{ fontFamily:SANS, fontSize:14, color:T.textSub, lineHeight:1.75, marginBottom:24 }}>{p.body}</p>

          {/* Mini tier/gate display */}
          <div style={{ display:'flex', gap:8, marginBottom:24 }}>
            {p.items.map((item, i) => (
              <div key={i} style={{ flex:1, background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'12px 10px', textAlign:'center' }}>
                <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:11, color:item.color, marginBottom:3 }}>{item.tier}</div>
                <div style={{ fontFamily:MONO, fontSize:panel===0?9:11, color:T.textMuted, marginBottom:3 }}>{panel===0 ? item.min : item.threshold}</div>
                <div style={{ fontFamily:MONO, fontSize:panel===0?14:18, color:item.color, fontWeight:700 }}>{panel===0 ? item.gift : item.discount}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display:'flex', gap:10, flexDirection:isMobile?'column':'row' }}>
            <button onClick={() => { navigate(p.route); dismiss(); }} style={{ flex:2, background:p.accent, border:'none', color: panel===1?'#0d0b08':'#0d0b08', padding:'14px 20px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
              {p.cta}
            </button>
            <button onClick={dismiss} style={{ flex:1, background:'none', border:`1px solid ${T.border}`, color:T.textMuted, padding:'14px 16px', fontSize:13, cursor:'pointer', fontFamily:SANS }}>
              {ko?'나중에':'Later'}
            </button>
          </div>
        </div>

        {/* Panel indicator dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'12px 0 16px', borderTop:`1px solid ${T.border}` }}>
          {panels.map((_, i) => (
            <div key={i} onClick={() => setPanel(i)} style={{ width: panel===i?20:6, height:4, background:panel===i?p.accent:T.border, transition:'all 0.3s', cursor:'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
