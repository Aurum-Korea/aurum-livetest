import { useState } from 'react';
import { T, useIsMobile, API } from '../lib/index.jsx';
import { Accordion } from '../components/UI.jsx';

const AGP_TIERS = [
  { num:'I',   nameKR:'브론즈',    nameEN:'Bronze · the open door',    monthly:'₩200,000+', min:200000, gift:'₩50,000',     giftVal:50000,   featured:false, perks:['Founding Year 가격 12개월','스테인리스 마크 발급','Founders Club 자동 등록'] },
  { num:'II',  nameKR:'실버',      nameEN:'Silver · the accelerator',  monthly:'₩500,000+', min:500000, gift:'₩200,000',    giftVal:200000,  featured:false, perks:['Founding 500 가격 24개월','시리얼 번호 #001–500','Vault Weekend 초대'] },
  { num:'III', nameKR:'골드',      nameEN:'Gold · the prestige',       monthly:'₩1,000,000+',min:1000000,gift:'₩500,000',  giftVal:500000,  featured:true,  perks:['Founder 우선가 12개월','골드 마크 예약','Concierge 전화 연결'] },
  { num:'IV',  nameKR:'플래티넘',  nameEN:'Platinum · the patron',    monthly:'₩2,000,000+',min:2000000,gift:'₩1,500,000',giftVal:1500000, featured:false, perks:['Patron 최우선가 평생','10K 솔리드 골드 마크','SG Vault 단독 방문'] },
  { num:'V',   nameKR:'소브린',    nameEN:'Sovereign · the apex',     monthly:'₩5,000,000+',min:5000000,gift:'₩5,000,000',giftVal:5000000, featured:false, perks:['Founder Apex 가격 — 최저','전용 금고 배정','패밀리 오피스 서비스'] },
];

const GMV_BONUSES = [
  { gate:'I',  gmv:'$5K',   gmvKR:'₩7.2M',  bonus:'+₩50K',    bonusVal:50000,    desc:'첫 게이트 달성 축하 크레딧' },
  { gate:'II', gmv:'$15K',  gmvKR:'₩21.6M', bonus:'+₩150K',   bonusVal:150000,   desc:'성장 가속 크레딧' },
  { gate:'III',gmv:'$35K',  gmvKR:'₩50.4M', bonus:'+₩400K',   bonusVal:400000,   desc:'정점 달성 특별 크레딧', apex:true },
  { gate:'IV', gmv:'$65K',  gmvKR:'₩93.6M', bonus:'+₩1,000K', bonusVal:1000000,  desc:'볼트 순례 크레딧' },
  { gate:'V',  gmv:'$100K', gmvKR:'₩144M',  bonus:'+₩2,500K', bonusVal:2500000,  desc:'평생 표식 달성 기념 크레딧' },
];

const AURUM_UP = 0.02, KR_MULT = 1.184;

function WaxSeal({ size=64 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'radial-gradient(circle at 35% 30%,rgba(255,220,150,0.4),transparent 50%),linear-gradient(135deg,#6a5a3a 0%,#C5A572 45%,#8a6f3a 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'inset 0 2px 4px rgba(255,255,255,0.2),inset 0 -2px 6px rgba(0,0,0,0.4),0 4px 14px rgba(0,0,0,0.5)', flexShrink:0 }}>
      <div style={{ position:'absolute', inset:size*0.06, border:'1px solid rgba(20,14,8,0.4)', borderRadius:'50%' }} />
      <span style={{ fontFamily:T.serif, fontStyle:'italic', fontWeight:600, fontSize:size*0.28, color:'rgba(20,14,8,0.78)', zIndex:1, position:'relative' }}>AU</span>
    </div>
  );
}
function SealDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'36px 32px', gap:28 }}>
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
      <WaxSeal />
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
    </div>
  );
}

// ─── Ingot visual ─────────────────────────────────────────────────────────────
function Ingot({ activeTier }) {
  const [hov, setHov] = useState(false);
  const tier = AGP_TIERS[activeTier];
  return (
    <div style={{ position:'relative', height:340, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ width:260, height:165, background:'linear-gradient(135deg,#2a2418 0%,#4a3e26 38%,#C5A572 50%,#E3C187 55%,#C5A572 62%,#6a5a3a 80%,#2a2418 100%)', borderRadius:4, boxShadow:'0 24px 60px rgba(197,165,114,0.20),0 0 0 1px rgba(197,165,114,0.4),inset 0 1px 0 rgba(255,255,255,0.15)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#1a1814', transform:hov?'perspective(900px) rotateX(4deg) rotateY(-2deg) translateY(-6px)':'perspective(900px) rotateX(8deg) rotateY(-5deg)', transition:'transform 0.7s cubic-bezier(0.2,0.8,0.2,1)', cursor:'default' }}>
        <div style={{ fontFamily:T.serif, fontSize:9, fontWeight:600, letterSpacing:'0.45em', color:'rgba(26,24,20,0.9)', marginBottom:8 }}>A U R U M</div>
        <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:'rgba(26,24,20,0.95)', letterSpacing:'0.02em' }}>AGP</div>
        <div style={{ fontFamily:T.mono, fontSize:8, fontWeight:500, color:'rgba(26,24,20,0.7)', letterSpacing:'0.22em', marginTop:5 }}>999.9 FINE GOLD</div>
        <div style={{ fontFamily:T.mono, fontSize:7, color:'rgba(26,24,20,0.55)', letterSpacing:'0.1em', marginTop:8 }}>SG · MMXXVI</div>
      </div>
      <div style={{ position:'absolute', top:24, right:-8, background:T.bgElevated, border:`1px solid ${T.gold}`, padding:'12px 16px', boxShadow:'0 18px 40px rgba(0,0,0,0.7),0 0 24px rgba(197,165,114,0.12)', transform:'rotate(-2.5deg)', animation:'floatY 4.5s ease-in-out infinite', transition:'all 0.4s' }}>
        <div style={{ fontFamily:T.mono, fontSize:7, fontWeight:500, letterSpacing:'0.26em', color:T.goldDim, textTransform:'uppercase', marginBottom:3 }}>{tier.nameKR.toUpperCase()} GIFT</div>
        <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold }}>
          <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, marginRight:3, color:T.goldDim }}>₩</span>
          {tier.giftVal.toLocaleString('ko-KR')}
        </div>
        <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:10, color:T.textMuted, marginTop:2 }}>in physical gold</div>
      </div>
    </div>
  );
}

// ─── Launch Calculator ────────────────────────────────────────────────────────
function LaunchCalc({ activeTier, setActiveTier, prices = { gold: 3342.80 }, krwRate = 1368 }) {
  const [monthly, setMonthly] = useState(1000000);
  const SPOT_KRW_G = prices.gold * krwRate / 31.1035; // KRW per gram, live
  const aurumUnit = SPOT_KRW_G * (1 + AURUM_UP);
  const grams = monthly / aurumUnit;
  const krCost = grams * SPOT_KRW_G * KR_MULT;
  const tierIdx = AGP_TIERS.slice().reverse().findIndex(t => monthly >= t.min);
  const tier = tierIdx >= 0 ? AGP_TIERS[AGP_TIERS.length - 1 - tierIdx] : AGP_TIERS[0];
  const pct = ((monthly - 200000) / (5000000 - 200000) * 100).toFixed(1);
  const fmt = n => Math.round(n).toLocaleString('ko-KR');

  // sync tier card selection
  const tIdx = AGP_TIERS.indexOf(tier);
  if (tIdx !== activeTier) setActiveTier(tIdx);

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'28px 28px', height:'100%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.26em', textTransform:'uppercase', marginBottom:22 }}>AGP LAUNCH ESTIMATOR</div>

      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:14 }}>월 적립액</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:16 }}>
          <span style={{ fontFamily:T.mono, fontSize:28, fontWeight:700, color:T.text }}>₩{fmt(monthly)}</span>
          <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.textSub }}>/ 월</span>
          <span style={{ marginLeft:'auto', fontFamily:T.sans, fontSize:11, color:T.goldDim, background:T.goldGlow, border:`1px solid ${T.goldBorder}`, padding:'3px 10px', whiteSpace:'nowrap' }}>{tier.nameKR} 티어</span>
        </div>
        <input type="range" min="200000" max="5000000" step="100000" value={monthly} style={{ '--pct':`${pct}%` }} onChange={e=>setMonthly(+e.target.value)} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontFamily:T.mono, fontSize:10, color:T.textMuted, letterSpacing:'0.12em' }}>
          <span>₩200K</span><span>₩1M</span><span>₩2M</span><span>₩3M</span><span>₩5M</span>
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${T.goldBorder}`, paddingTop:20, flex:1, display:'flex', flexDirection:'column', gap:0 }}>
        {[
          { label:'받게 되실 금', en:'Metal received', value:`${grams.toFixed(3)} g`, unit:`· ${(grams/31.1035).toFixed(4)} oz` },
          { label:'한국 소매 환산', en:'Korea retail equiv.', value:`₩${fmt(krCost)}`, dim:true },
        ].map((row,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 0', borderBottom:`1px solid rgba(197,165,114,0.06)` }}>
            <div>
              <span style={{ fontFamily:T.sansKr, fontSize:13, color:T.textSub }}>{row.label}</span>
              <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:T.textMuted, marginLeft:6 }}>{row.en}</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <span style={{ fontFamily:T.mono, fontSize:row.dim?14:17, color:row.dim?T.textSub:T.text, fontWeight:500 }}>{row.value}</span>
              {row.unit && <span style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, marginLeft:4 }}>{row.unit}</span>}
            </div>
          </div>
        ))}
        {/* Gift row */}
        <div style={{ borderTop:`1px solid ${T.goldBorderStrong}`, marginTop:12, paddingTop:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.gold, fontWeight:500 }}>+ {tier.nameKR} Tier Launch Gift</div>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:T.goldDim, marginTop:2 }}>첫 결제 즉시 실물 금으로 적립</div>
          </div>
          <div style={{ fontFamily:T.mono, fontSize:24, color:T.goldBright, fontWeight:700 }}>{tier.gift}</div>
        </div>
      </div>

      <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', fontFamily:T.mono, fontSize:8, letterSpacing:'0.18em', color:T.textMuted, textTransform:'uppercase' }}>
        <span>SPOT REF · LONDON FIX</span>
        <span style={{ display:'flex', alignItems:'center', gap:7, color:T.gold }}><span className="live-dot" />LIVE · MMXXVI</span>
      </div>
    </div>
  );
}

// ─── GMV Bonus Track ──────────────────────────────────────────────────────────
function GMVBonusTrack({ navigate }) {
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'28px 28px', height:'100%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.26em', textTransform:'uppercase', marginBottom:8 }}>GMV GROWTH REWARDS · 성장 보너스</div>
      <p style={{ fontFamily:T.sansKr, fontSize:12, color:T.textSub, lineHeight:1.65, marginBottom:22 }}>
        론치 기프트에 더해, GMV가 성장할수록 추가 금 크레딧이 지급됩니다. 내 구매 + 친구의 구매 모두 카운트.
      </p>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:0, position:'relative' }}>
        {/* Vertical line */}
        <div style={{ position:'absolute', left:16, top:10, bottom:10, width:1, background:`linear-gradient(180deg,${T.gold},${T.goldBorder})`, zIndex:0 }} />
        {GMV_BONUSES.map((row,i)=>(
          <div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', alignItems:'center', gap:12, padding:'12px 0', borderBottom:i<GMV_BONUSES.length-1?`1px solid rgba(197,165,114,0.06)`:'none', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ width:10, height:10, background:row.apex?T.gold:T.bg2, border:`1px solid ${T.gold}`, transform:'rotate(45deg)', zIndex:2, boxShadow:row.apex?`0 0 10px ${T.gold}`:'none' }} />
            </div>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:3 }}>
                <span style={{ fontFamily:T.mono, fontSize:8, color:T.gold, border:`1px solid ${T.goldBorder}`, padding:'2px 6px', letterSpacing:'0.14em' }}>GATE {row.gate}</span>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.text, fontWeight:600 }}>{row.gmvKR}</span>
                <span style={{ fontFamily:T.sansKr, fontSize:10, color:T.textMuted }}>≈ {row.gmv}</span>
              </div>
              <div style={{ fontFamily:T.sansKr, fontSize:11, color:T.textSub, lineHeight:1.4 }}>{row.desc}</div>
            </div>
            <div style={{ fontFamily:T.mono, fontSize:15, color:T.green, fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{row.bonus}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
        <button onClick={()=>navigate('campaign-founders')} style={{ width:'100%', background:T.goldGlow, border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'11px', cursor:'pointer', fontFamily:T.sans, fontSize:13, transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor=T.goldBorderStrong} onMouseLeave={e=>e.currentTarget.style.borderColor=T.goldBorder}>
          Founders Club에서 더 알아보기 →
        </button>
      </div>
    </div>
  );
}

// ─── 5-Tier cards ─────────────────────────────────────────────────────────────
function TierCards({ activeTier, setActiveTier }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(5,1fr)', gap:12 }}>
      {AGP_TIERS.map((tier,i)=>{
        const isActive = activeTier===i;
        return (
          // M-19: featured tier (골드, index 2) spans both columns on mobile for emphasis
          <div key={i} onClick={()=>setActiveTier(i)} style={{ gridColumn:isMobile&&tier.featured?'1 / -1':'auto', background:tier.featured?`linear-gradient(180deg,${T.goldGlow},${T.bg})`:T.bg, border:`1px solid ${isActive?T.goldBorderStrong:tier.featured?T.goldBorder:T.border}`, padding:isMobile?(tier.featured?'24px 20px':'20px 12px'):'28px 16px', textAlign:'center', position:'relative', overflow:'hidden', cursor:'pointer', transform:isActive?'translateY(-4px)':'none', boxShadow:isActive?`0 10px 32px rgba(197,165,114,0.15)`:'none', transition:'all 0.3s cubic-bezier(0.2,0.8,0.2,1)' }}>
            {tier.featured && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
            {tier.featured && <div style={{ position:'absolute', top:10, right:10, fontFamily:T.mono, fontSize:7, color:T.bg, background:T.gold, padding:'2px 7px', letterSpacing:'0.18em' }}>추천</div>}

            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.goldDim, marginBottom:5 }}>{tier.num}</div>
            <div style={{ fontFamily:T.serifKr, fontSize:18, fontWeight:600, color:T.text, marginBottom:3 }}>{tier.nameKR}</div>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:10, color:T.goldDim, marginBottom:18 }}>{tier.nameEN}</div>
            <div style={{ height:1, background:T.goldBorder, margin:'0 0 18px' }} />
            <div style={{ fontFamily:T.mono, fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:T.textMuted, marginBottom:5 }}>LAUNCH GIFT</div>
            <div style={{ fontFamily:T.serif, fontSize:26, fontWeight:600, color:isActive?T.goldBright:T.gold, letterSpacing:'-0.01em', marginBottom:16 }}>
              <span style={{ fontFamily:T.mono, fontSize:11, color:T.goldDim, marginRight:3 }}>₩</span>
              {tier.giftVal.toLocaleString('ko-KR')}
            </div>
            <div style={{ fontFamily:T.mono, fontSize:11, color:isActive?T.goldBright:T.textSub, fontWeight:600, marginBottom:16 }}>{tier.monthly}</div>
            <div style={{ paddingTop:14, borderTop:`1px solid ${T.border}` }}>
              {tier.perks.map((perk,pi)=>(
                <div key={pi} style={{ display:'flex', gap:6, alignItems:'flex-start', padding:'4px 0', textAlign:'left' }}>
                  <span style={{ color:T.gold, fontFamily:T.mono, fontSize:9, flexShrink:0, marginTop:2 }}>—</span>
                  <span style={{ fontFamily:T.sansKr, fontSize:10, color:T.textSub, lineHeight:1.4 }}>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline() {
  const steps = [
    { when:'Diem Zero · 오늘',    title:'AGP 론치 이벤트 사전예약', desc:'이메일로 자리 확보. 론치 시 자동 안내.', active:true },
    { when:'Diem I—III',          title:'본인확인 · 자동이체 설정',  desc:'10분 온라인 KYC. 주거래은행 자동이체 등록.' },
    { when:'Diem VII—XIV',        title:'첫 자동이체',               desc:'설정한 날짜에 첫 결제 정산.' },
    { when:'Eadem Die · 같은 날', title:'Launch Gift 적립',          desc:'결제 정산 즉시 해당 티어의 Gift 적립.' },
    { when:'Diem XLIV',           title:'자유로운 운용',              desc:'30일 유지 후 Gift 그램은 평생 회원님의 자산.' },
  ];
  return (
    <div>
      <h3 style={{ fontFamily:T.serifKr, fontSize:'clamp(18px,2.5vw,28px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
        예약부터 적립까지, <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>十四日</span>
      </h3>
      <p style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.goldDim, marginBottom:28 }}>From reservation to your first measure of gold.</p>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:20, top:12, bottom:12, width:1, background:`linear-gradient(180deg,${T.gold},${T.goldBorder})` }} />
        {steps.map((row,i)=>(
          <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr', alignItems:'start', padding:'16px 0' }}>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ width:12, height:12, background:row.active?T.gold:T.bg, border:`1px solid ${T.gold}`, transform:'rotate(45deg)', zIndex:2, boxShadow:row.active?`0 0 12px ${T.gold}`:'none', marginTop:4 }} />
            </div>
            <div>
              <div style={{ fontFamily:T.mono, fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase', color:T.goldDim, marginBottom:4 }}>{row.when}</div>
              <div style={{ fontFamily:T.serifKr, fontSize:15, fontWeight:500, color:T.text, marginBottom:3 }}>{row.title}</div>
              <div style={{ fontFamily:T.sansKr, fontSize:12, color:T.textSub, lineHeight:1.65 }}>{row.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Email CTA Panel ──────────────────────────────────────────────────────────
function CTAPanel() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReserve = async e => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try { await API.campaign.signupBonus(email); setSubmitted(true); setTimeout(() => navigate('agp-enroll'), 1000); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background:`radial-gradient(ellipse at 50% 0%,rgba(197,165,114,0.12),transparent 65%),${T.bg2}`, border:`1px solid ${T.goldBorderStrong}`, padding:'36px 32px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${T.gold},${T.goldBright},${T.gold},transparent)` }} />

      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.gold, letterSpacing:'0.28em', marginBottom:20, textTransform:'uppercase' }}>— 론치 이벤트 사전예약 —</div>
      <h3 style={{ fontFamily:T.serifKr, fontSize:'clamp(20px,2.5vw,30px)', fontWeight:500, color:T.text, marginBottom:8, lineHeight:1.15 }}>
        지금 이메일을 남기면<br /><span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>론치 첫날 Gift가<br />자동 적용</span>됩니다.
      </h3>
      <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.7, marginBottom:28 }}>Founding Season closes when the cohort fills.</p>

      {submitted ? (
        <div style={{ background:T.goldGlow, border:`1px solid ${T.goldBorderStrong}`, padding:'18px 20px' }}>
          <div style={{ fontFamily:T.serif, fontSize:18, color:T.gold, fontWeight:600, marginBottom:6 }}>✓ 예약 완료</div>
          <div style={{ fontFamily:T.sansKr, fontSize:12, color:T.textSub, lineHeight:1.6 }}>론치 시 가장 먼저 알려드립니다.</div>
        </div>
      ) : (
        <form onSubmit={handleReserve}>
          <div style={{ display:'flex', gap:0, border:`1px solid ${T.goldBorderStrong}`, background:T.bg3, marginBottom:14 }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소 · your@email.com" required
              style={{ flex:1, padding:'16px 18px', background:'transparent', border:'none', outline:'none', fontFamily:T.sansKr, fontSize:14, color:T.text }} />
            <button type="submit" disabled={submitting} style={{ background:T.gold, color:T.bg, border:'none', cursor:submitting?'not-allowed':'pointer', padding:'0 24px', fontFamily:T.sans, fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', flexShrink:0 }}>
              {submitting?'...':'사전예약'}
            </button>
          </div>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', fontFamily:T.mono, fontSize:8, letterSpacing:'0.18em', color:T.textMuted, textTransform:'uppercase' }}>
            {['론치 이벤트 한정','KakaoTalk 알림','스팸 없음'].map((t,i)=>(
              <span key={i} style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ color:T.gold }}>·</span>{t}</span>
            ))}
          </div>
        </form>
      )}

      {/* Mini trust signals */}
      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:8 }}>
        {["🛡️ Lloyd's of London 전액 보험", "✅ LBMA 승인 실물 금", "🔒 30일 후 완전 소유 · 취소 수수료 없음"].map((t,i)=>(
          <div key={i} style={{ fontFamily:T.sansKr, fontSize:11, color:T.textSub, display:'flex', gap:8 }}>
            <span>{t.slice(0,2)}</span><span>{t.slice(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AGPLaunchPage({ lang, navigate, user, setShowLogin, prices = { gold: 3342.80 }, krwRate = 1368 }) {
  const isMobile = useIsMobile();
  const [activeTier, setActiveTier] = useState(2);
  const pad = isMobile ? '48px 20px' : '80px 80px';

  const faqItems = [
    { icon:'🥇', title:'Launch Gift는 현금인가요, 금인가요?', content:'금입니다. 적립 시점의 국제 시세 기준 해당 금액의 그램이 회원님 계정에 즉시 적립됩니다. 싱가포르 Malca-Amit FTZ 금고에 실물로 배분 보관됩니다.' },
    { icon:'📊', title:'GMV 보너스는 언제 지급되나요?', content:'게이트 달성 직후 자동 크레딧됩니다. 내 구매 + 추천 구매 합산이 해당 GMV 문턱을 초과하는 시점에 즉시 지급됩니다.' },
    { icon:'🔒', title:'Gift를 받고 해지하면 어떻게 되나요?', content:'Launch Gift는 첫 결제일 기준 30일간 잠금됩니다. 30일 이내 해지 시 Gift 그램은 자동 회수되고 원금은 전액 환급됩니다. 30일 이후에는 완전한 회원님의 자산입니다.' },
    { icon:'❓', title:'AGP와 Founders Club은 별개인가요?', content:'AGP 가입 시 자동으로 Founders Club에 등록됩니다. AGP 월 적립액은 내 GMV로 카운트되어 Founders Club의 5개 게이트를 향해 누적됩니다. 두 혜택이 동시에 적용됩니다.' },
  ];

  return (
    <div style={{ background:T.bg }}>

      {/* ══ HERO ══ */}
      <div style={{ padding:isMobile?'70px 20px 60px':'100px 80px 90px', background:`radial-gradient(ellipse at 75% 30%,rgba(197,165,114,0.10),transparent 55%),linear-gradient(180deg,${T.bg} 0%,${T.bg2} 100%)`, borderBottom:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:T.serif, fontSize:isMobile?80:240, fontWeight:600, letterSpacing:'0.06em', color:'rgba(197,165,114,0.018)', pointerEvents:'none', whiteSpace:'nowrap', userSelect:'none', zIndex:0 }}>AURUM</div>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'1.1fr 1fr', gap:isMobile?48:64, alignItems:'center', position:'relative', zIndex:1 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:32, height:1, background:T.gold }} />
              <span style={{ fontFamily:T.mono, fontSize:9, fontWeight:500, letterSpacing:'0.32em', textTransform:'uppercase', color:T.gold }}>AGP 론치 이벤트 · 창립 한정</span>
            </div>
            <h1 style={{ fontFamily:T.serifKr, fontWeight:500, fontSize:isMobile?32:50, lineHeight:1.12, color:T.text, margin:'0 0 18px', letterSpacing:'-0.005em' }}>
              AGP 적금 론치 이벤트.<br />시작하는 날, <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>금을 더 드립니다.</span>
            </h1>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:17, color:T.goldDim, marginBottom:22, letterSpacing:'0.005em' }}>A founding gift, in physical gold. Your tier, your bonus.</div>
            <p style={{ fontFamily:T.sansKr, fontSize:14, color:T.textSub, lineHeight:1.85, maxWidth:480, marginBottom:28 }}>
              첫 자동이체가 정산되는 날, <strong style={{ color:T.text }}>선택한 티어에 따라 실물 금이 자동 적립</strong>됩니다. 그리고 GMV가 성장할수록 추가 금 크레딧도 계속 지급됩니다.
            </p>
            <div style={{ display:'flex', gap:10, flexDirection:isMobile?'column':'row' }}>
              <button onClick={()=>navigate('agp-enroll')} style={{ background:T.gold, border:'none', color:'#0a0a0a', padding:'14px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans, flex:1 }}>AGP 론치 이벤트 참여 →</button>
              <button onClick={()=>navigate('agp')} style={{ background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding:'14px 20px', fontSize:13, cursor:'pointer', fontFamily:T.sans, flex:1 }}>AGP 상세 보기</button>
            </div>
          </div>
          {!isMobile && <Ingot activeTier={activeTier} />}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background:T.bg3, borderBottom:`1px solid ${T.goldBorder}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:0 }}>
          {[{val:'5단계',label:'론치 기프트 티어'},{val:'₩50K~₩5M',label:'티어별 실물 금 기프트'},{val:'30일',label:'잠금 해제 후 영구 소유'},{val:'GMV+',label:'성장할수록 추가 크레딧'}].map((s,i)=>(
            <div key={i} style={{ textAlign:'center', padding:isMobile?'14px 8px':'20px 16px', borderRight:!isMobile&&i<3?`1px solid ${T.goldBorder}`:'none', borderBottom:isMobile&&i<2?`1px solid ${T.goldBorder}`:'none' }}>
              <div style={{ fontFamily:T.mono, fontSize:isMobile?16:22, color:T.gold, fontWeight:700 }}>{s.val}</div>
              <div style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted, marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding:isMobile?'40px 20px':'56px 80px', background:T.bg2, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 60px 1fr 60px 1fr', gap:0, alignItems:'start' }}>
          {[
            { roman:'I',   kr:'예약',    desc:'이메일로 자리 확보. 론치 시 자동 안내.' },
            null,
            { roman:'II',  kr:'첫 결제', desc:'토스·카카오·은행 자동이체로 첫 적립 완료.' },
            null,
            { roman:'III', kr:'Gift 적립',desc:'결제 즉시 선택 티어 Launch Gift 계정 적립.' },
          ].map((s,i)=>s===null?(
            <div key={i} style={{ textAlign:'center', color:T.gold, fontFamily:T.serif, fontSize:24, opacity:0.4, paddingTop:16, transform:isMobile?'rotate(90deg)':'none' }}>—</div>
          ):(
            <div key={i} style={{ textAlign:'center', padding:'0 10px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:54, height:54, border:`1px solid ${T.goldBorderStrong}`, borderRadius:'50%', marginBottom:16, fontFamily:T.serif, fontStyle:'italic', fontSize:20, color:T.gold, fontWeight:500, background:T.bg }}>{s.roman}</div>
              <div style={{ fontFamily:T.serifKr, fontSize:15, fontWeight:500, color:T.text, marginBottom:4 }}>{s.kr}</div>
              <div style={{ fontFamily:T.sansKr, fontSize:11, color:T.textSub, lineHeight:1.65, maxWidth:180, margin:'0 auto' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tier Cards ── */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>5 Tiers · 5가지 티어</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,38px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
              월 얼마로 시작하시겠습니까? <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>더 크게 시작할수록</span>
            </h2>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>티어를 클릭하면 계산기에 자동 반영됩니다.</p>
          </div>
          <TierCards activeTier={activeTier} setActiveTier={setActiveTier} />
        </div>
      </div>

      {/* ── Image 9: Calculator + GMV Bonus SIDE BY SIDE ── */}
      <div style={{ padding:pad, background:T.bg1, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>Launch Estimator + GMV Growth</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,36px)', fontWeight:500, color:T.text, marginBottom:8 }}>
              첫 달, 정확히 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>얼마나 받나요?</span>
            </h2>
          </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16, alignItems:'stretch' }}>
            <LaunchCalc activeTier={activeTier} setActiveTier={setActiveTier} prices={prices} krwRate={krwRate} />
            <GMVBonusTrack navigate={navigate} />
          </div>
        </div>
      </div>

      <SealDivider />

      {/* ── Image 10: Timeline + CTA Form SIDE BY SIDE ── */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:isMobile?40:48, alignItems:'start' }}>
            <Timeline />
            <CTAPanel />
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding:pad }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,36px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>자주 묻는 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>질문</span></h2>
            <p style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.goldDim }}>Quietly answered.</p>
          </div>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      {/* T&C */}
      <div style={{ background:T.bg2, padding:'32px 80px', borderTop:`1px solid ${T.goldBorder}` }}>
        <p style={{ fontFamily:T.sansKr, fontSize:11, color:T.textMuted, lineHeight:1.85, maxWidth:880, margin:'0 auto', textAlign:'center' }}>
          ※ AGP 론치 이벤트는 Aurum Pte. Ltd. (싱가포르)의 한국 시장 출시 단계에서 운영되는 한정 프로그램입니다. 최종 약관 및 적용 조건은 출시 시점의 공식 문서를 따릅니다. 투자에는 원금 손실 가능성이 있습니다. 한국 외국환거래법 및 개인정보보호법(PIPA) 준수.
        </p>
      </div>
    </div>
  );
}
