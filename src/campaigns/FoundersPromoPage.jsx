// FoundersPromoPage.jsx — Rich Founders marketing page with interactive tools
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fKRW } from '../lib/index.jsx';

const FOUNDERS_CAP    = 500;
const SPOTS_REMAINING = 247;
const FILLED_PCT      = Math.round((FOUNDERS_CAP - SPOTS_REMAINING) / FOUNDERS_CAP * 100);

const GATES = [
  { num:'I',  label:'시작의 문',   en:'The Opening',    discount:1.0, storage:'0.75%', gmvUSD:5000,   color:'#8a7d6b' },
  { num:'II', label:'성장의 표식', en:'The Growth',     discount:1.5, storage:'0.50%', gmvUSD:15000,  color:'#a09070' },
  { num:'III',label:'정점 ✦',      en:'The Apex ✦',     discount:2.0, storage:'0.50%', gmvUSD:35000,  color:'#C5A572', apex:true },
  { num:'IV', label:'금고의 문',   en:'Vault Gate',     discount:2.5, storage:'0.30%', gmvUSD:65000,  color:'#d4b880' },
  { num:'V',  label:'평생의 표식', en:'Lifetime Mark',  discount:3.0, storage:'0.30%', gmvUSD:100000, color:'#E3C187' },
];

const TESTIMONIALS = [
  { initials:'K.Y', name:'KIM Y.', gate:'Gate III', quote:'한국 은행 대비 온스당 40만원 절약. 계산하기도 부끄러울 정도입니다.', en:'Saving ₩400K per oz vs Korean banks. Almost embarrassing.' },
  { initials:'P.J', name:'PARK J.',gate:'Gate II',  quote:'AGP로 매달 자동 적립하면서 게이트 II까지 올라왔습니다.', en:'Auto-accumulating with AGP, reached Gate II. Discounts are real.' },
  { initials:'L.S', name:'LEE S.', gate:'Gate I',  quote:'투명한 백킹 리포트와 Lloyd\'s 보험이 마음을 바꿨습니다.', en:'Transparent audit and Lloyd\'s cover convinced me.' },
];

function useCountUp(target, duration=1200, run=true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = 0; const step = Math.ceil(target/60);
    const t = setInterval(() => { start += step; if (start >= target) { setN(target); clearInterval(t); } else setN(start); }, duration/60);
    return () => clearInterval(t);
  }, [target, run]);
  return n;
}

// ── Gold Savings Calculator ─────────────────────────────────────────────────
function SavingsCalculator({ lang, prices, krwRate=1440 }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [ozPerYear, setOzPerYear] = useState(5);
  const [gate, setGate] = useState(2);
  const goldSpot = prices?.gold || 3342;
  const koreaPrice  = goldSpot * krwRate * 1.20;
  const aurumPrice  = goldSpot * krwRate * 1.08;
  const gateDiscount = GATES[gate].discount / 100;
  const aurumWithGate = aurumPrice * (1 - gateDiscount);
  const savingVsKorea = (koreaPrice - aurumWithGate) * ozPerYear;
  const savingPct = ((koreaPrice - aurumWithGate) / koreaPrice * 100).toFixed(1);

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}` }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase' }}>💰 {ko?'절감액 계산기':'Savings Calculator'}</span>
      </div>
      <div style={{ padding: isMobile?'16px':'24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, letterSpacing:'0.12em', marginBottom:8 }}>{ko?'연간 구매량 (oz)':'Annual Purchase (oz)'}</div>
            <input type="range" min={1} max={50} value={ozPerYear} onChange={e=>setOzPerYear(+e.target.value)}
              style={{ width:'100%', accentColor:T.gold, cursor:'pointer' }} />
            <div style={{ fontFamily:T.mono, fontSize:18, color:T.gold, fontWeight:700, marginTop:4 }}>{ozPerYear} oz</div>
          </div>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, letterSpacing:'0.12em', marginBottom:8 }}>{ko?'현재 게이트':'Your Gate'}</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {GATES.map((g,i) => (
                <button key={i} onClick={()=>setGate(i)} style={{ background:gate===i?g.color:'transparent', border:`1px solid ${gate===i?g.color:T.border}`, color:gate===i?'#0a0a0a':T.textMuted, padding:'4px 10px', fontFamily:T.mono, fontSize:10, cursor:'pointer', transition:'all 0.2s' }}>
                  {g.num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:T.border, marginBottom:16 }}>
          {[
            { lbl:ko?'한국 소매가':'Korea Retail', val:`₩${Math.round(koreaPrice/1000).toLocaleString()}K/oz`, color:'#f87171' },
            { lbl:`Aurum ${GATES[gate].num}`, val:`₩${Math.round(aurumWithGate/1000).toLocaleString()}K/oz`, color:T.gold },
            { lbl:ko?`연간 절감 (${savingPct}%)`:`Annual save (${savingPct}%)`, val:`₩${Math.round(savingVsKorea/10000).toLocaleString()}만`, color:'#4ade80' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'#0d0b08', padding:'14px 12px', textAlign:'center' }}>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, letterSpacing:'0.1em', marginBottom:5 }}>{s.lbl}</div>
              <div style={{ fontFamily:T.mono, fontSize: isMobile?14:18, color:s.color, fontWeight:700 }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:T.sans, fontSize:12, color:T.textSub, lineHeight:1.7 }}>
          {ko ? `Gate ${GATES[gate].num} 멤버로서 연간 ${ozPerYear}oz 구매 시, 한국 소매 대비 약 ₩${Math.round(savingVsKorea/10000).toLocaleString()}만원 절감됩니다.` : `As a Gate ${GATES[gate].num} member buying ${ozPerYear}oz/year, you save approximately ₩${Math.round(savingVsKorea/10000).toLocaleString()}K vs Korean retail.`}
        </div>
      </div>
    </div>
  );
}

// ── Gold/Silver Ratio ──────────────────────────────────────────────────────
function RatioWidget({ prices, lang }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const gold = prices?.gold || 3342;
  const silver = prices?.silver || 32.9;
  const ratio = (gold/silver).toFixed(1);
  const histData = [80,85,92,88,76,68,72,79,84,87,Number(ratio)];
  const maxH = Math.max(...histData);
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}` }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}` }}>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase' }}>📊 {ko?'금/은 비율':'Gold/Silver Ratio'}</span>
      </div>
      <div style={{ padding: isMobile?'16px':'24px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:10 }}>
          <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:48, color:T.gold, lineHeight:1 }}>{ratio}</span>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>oz gold / oz silver</div>
            <div style={{ fontFamily:T.sans, fontSize:12, color:Number(ratio)>80?'#4ade80':T.textSub }}>
              {Number(ratio)>80?(ko?'은 역사적 저평가':'Silver undervalued'):(ko?'정상 범위':'Normal range')}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:40, marginBottom:10 }}>
          {histData.map((v,i)=>{
            const h = ((v-60)/(maxH-60))*100;
            return <div key={i} style={{ flex:1, background:i===histData.length-1?T.gold:'rgba(197,165,114,0.25)', height:`${Math.max(h,8)}%`, transition:'height 0.3s' }} />;
          })}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[{l:ko?'20년 평균':'20yr avg',v:'68x'},{l:ko?'지금':'Now',v:`${ratio}x`,g:true},{l:ko?'역대 최고':'ATH',v:'126x'}].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, padding:'8px', textAlign:'center' }}>
              <div style={{ fontFamily:T.mono, fontSize:8, color:T.textMuted, marginBottom:2 }}>{s.l}</div>
              <div style={{ fontFamily:T.mono, fontSize:14, color:s.g?T.gold:T.textSub, fontWeight:600 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Real Estate vs Gold ────────────────────────────────────────────────────
function RealEstateWidget({ prices, krwRate=1440, lang }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const gold = prices?.gold || 3342;
  const goldKRW = Math.round(gold * krwRate);
  const seoulApt = 1200000000;
  const ozForApt = (seoulApt/goldKRW).toFixed(1);
  const returns = [
    { label:ko?'서울 아파트':'Seoul Apt',  val:180, color:'#f87171' },
    { label:ko?'금 (KRW)':'Gold (KRW)',  val:394, color:T.gold     },
    { label:ko?'코스피':'KOSPI',          val:45,  color:'#60a5fa'  },
    { label:ko?'은행 예금':'Bank',         val:25,  color:'#888'     },
  ];
  const maxRet = 394;
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}` }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}` }}>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase' }}>🏘 {ko?'서울 아파트 vs 금':'Seoul Apt vs Gold'}</span>
      </div>
      <div style={{ padding: isMobile?'16px':'24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.25)', padding:'12px', textAlign:'center' }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:'#f87171', letterSpacing:'0.1em', marginBottom:5 }}>{ko?'서울 평균':'Seoul Avg'}</div>
            <div style={{ fontFamily:T.mono, fontSize:20, color:'#f87171', fontWeight:700 }}>₩1.2B</div>
            <div style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted, marginTop:3 }}>{ko?'취득세 10% 포함':'incl. 10% tax'}</div>
          </div>
          <div style={{ background:T.goldGlow, border:`1px solid ${T.goldBorder}`, padding:'12px', textAlign:'center' }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.1em', marginBottom:5 }}>{ko?'동일 가치 금':'Same in Gold'}</div>
            <div style={{ fontFamily:T.mono, fontSize:20, color:T.gold, fontWeight:700 }}>{ozForApt}oz</div>
            <div style={{ fontFamily:T.sans, fontSize:10, color:T.textSub, marginTop:3 }}>{ko?'Malca-Amit SG FTZ':'Singapore vault'}</div>
          </div>
        </div>
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>{ko?'10년 수익률':'10yr Returns'}</div>
        {returns.map((r,i)=>(
          <div key={i} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontFamily:T.sans, fontSize:11, color:T.textSub }}>{r.label}</span>
              <span style={{ fontFamily:T.mono, fontSize:11, color:r.color, fontWeight:600 }}>+{r.val}%</span>
            </div>
            <div style={{ height:3, background:'rgba(255,255,255,0.05)' }}>
              <div style={{ height:'100%', width:`${(r.val/maxRet)*100}%`, background:r.color, opacity:0.7 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gate Progress Simulator ────────────────────────────────────────────────
function GateSimulator({ lang, krwRate=1440 }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [monthly, setMonthly] = useState(1000000);
  const monthlyUSD = monthly / krwRate;
  const annualUSD  = monthlyUSD * 12;
  let cumulativeMonths = 0;
  const gateTimeline = GATES.map(g => {
    const months = Math.ceil(g.gmvUSD / monthlyUSD);
    cumulativeMonths = months;
    return { ...g, months, years: (months/12).toFixed(1) };
  });
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}` }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}` }}>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase' }}>⏱ {ko?'게이트 도달 시뮬레이터':'Gate Timeline Simulator'}</span>
      </div>
      <div style={{ padding: isMobile?'16px':'24px' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, letterSpacing:'0.1em', marginBottom:8 }}>{ko?'월 구매액':'Monthly Purchase'}</div>
          <input type="range" min={200000} max={10000000} step={100000} value={monthly} onChange={e=>setMonthly(+e.target.value)}
            style={{ width:'100%', accentColor:T.gold, cursor:'pointer' }} />
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontFamily:T.mono, fontSize:17, color:T.gold, fontWeight:700 }}>₩{(monthly/10000).toLocaleString()}만</span>
            <span style={{ fontFamily:T.mono, fontSize:12, color:T.textMuted }}>≈ ${Math.round(monthlyUSD).toLocaleString()}/mo</span>
          </div>
        </div>
        {/* Gate timeline — single horizontal row */}
        <div style={{ overflowX:'auto', marginTop:4 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4, minWidth:320 }}>
            {/* Header */}
            {['Gate','Threshold','Est. Time','Discount'].map((h,i) => (
              <div key={i} style={{ display:'none' }} />
            ))}
            {gateTimeline.map((g,i) => (
              <div key={i} style={{ background:g.apex?'rgba(197,165,114,0.08)':'rgba(255,255,255,0.02)', border:`1px solid ${g.apex?T.gold:T.border}`, padding:'10px 8px', textAlign:'center', position:'relative' }}>
                {g.apex && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:g.color, marginBottom:3 }}>{g.num}</div>
                <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, marginBottom:3 }}>${g.gmvUSD.toLocaleString()}</div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, marginBottom:4 }}>{g.years}yr</div>
                <div style={{ fontFamily:T.mono, fontSize:14, color:g.color, fontWeight:700 }}>−{g.discount}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FoundersPromoPage({ lang, navigate, prices, krwRate=1440 }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [activeGate, setActiveGate] = useState(2);
  const [email, setEmail] = useState('');
  const [notifyDone, setNotifyDone] = useState(false);
  const spotsCount = useCountUp(SPOTS_REMAINING, 1000, true);

  const goldSpot = prices?.gold || 3342;
  const koreaPrice = Math.round(goldSpot * krwRate * 1.20);
  const aurumPrice  = Math.round(goldSpot * krwRate * 1.08);
  const savingsPerOz = koreaPrice - aurumPrice;

  const SERIF=T.serif; const SANS=T.sans; const MONO=T.mono;

  return (
    <div style={{ background:T.bg, color:T.text }}>

      {/* ── HERO ── */}
      <div style={{ position:'relative', minHeight: isMobile?'auto':600, background:'linear-gradient(135deg,#0a0a0a,#0d0b08 50%,#0a0a0a)', borderBottom:`1px solid ${T.goldBorder}`, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'repeating-linear-gradient(45deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', right:'10%', width:400, height:400, background:'radial-gradient(ellipse,rgba(197,165,114,0.1),transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, right:-10, fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?80:200, color:'rgba(197,165,114,0.02)', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>FOUNDERS</div>

        <div className="aurum-container" style={{ paddingTop: isMobile?48:100, paddingBottom: isMobile?48:100, position:'relative', zIndex:1, display: isMobile?'block':'grid', gridTemplateColumns:'1.1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <span className="live-dot-gold" />
              <span style={{ fontFamily:MONO, fontSize:9, color:T.goldDim, letterSpacing:'0.26em', textTransform:'uppercase' }}>
                {ko?'Founders Club · 한정 모집 · 500명':'Founders Club · Limited · 500 Members'}
              </span>
            </div>
            <h1 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?36:'clamp(40px,5.5vw,68px)', fontWeight:300, color:T.text, lineHeight:1.05, marginBottom:20 }}>
              {ko?<>한국보다 최대<br /><span style={{ color:T.gold }}>−3% 저렴하게.</span><br />지금 가입하면<br /><span style={{ color:T.gold }}>첫날부터.</span></> : <>Up to −3% below<br /><span style={{ color:T.gold }}>Korea retail.</span><br />Your gates start<br /><span style={{ color:T.gold }}>day one.</span></>}
            </h1>
            <p style={{ fontFamily:SANS, fontSize: isMobile?14:17, color:T.textSub, lineHeight:1.8, maxWidth:500, marginBottom:32 }}>
              {ko?'Founders Club 멤버는 누적 거래액에 따라 자동으로 가격 할인이 적용됩니다. 한 번 열린 게이트는 영원히 열려있습니다.':'Founders Club members receive automatic lifetime discounts based on cumulative volume. Gates never close once opened.'}
            </p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => navigate('register')} style={{ background:T.gold, border:'none', color:'#0d0b08', padding: isMobile?'14px 24px':'16px 36px', fontSize: isMobile?14:16, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
                {ko?'지금 가입하기 →':'Join Now →'}
              </button>
              <button onClick={() => navigate('founders')} style={{ background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding: isMobile?'14px 20px':'16px 28px', fontSize: isMobile?14:15, cursor:'pointer', fontFamily:SANS }}>
                {ko?'Founders Club 상세':'Full Details'}
              </button>
            </div>
          </div>

          {/* Right: member counter + live savings */}
          {!isMobile && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Spots counter */}
              <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'28px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
                <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', marginBottom:10 }}>{ko?'남은 멤버십 자리':'Spots Remaining'}</div>
                <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:72, color:T.gold, lineHeight:1 }}>{spotsCount}</div>
                <div style={{ fontFamily:MONO, fontSize:11, color:T.textMuted, marginBottom:12 }}>/ {FOUNDERS_CAP}</div>
                <div style={{ height:3, background:'rgba(197,165,114,0.1)', marginBottom:6 }}>
                  <div style={{ height:'100%', width:`${FILLED_PCT}%`, background:`linear-gradient(90deg,${T.goldDeep},${T.gold})` }} />
                </div>
                <div style={{ fontFamily:MONO, fontSize:9, color:T.goldDim, letterSpacing:'0.14em' }}>{FILLED_PCT}% FILLED</div>
              </div>

              {/* Live price comparison */}
              <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'20px 24px' }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{ko?'실시간 절감액 (1oz)':'Live Savings per oz'}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:9, color:'#f87171', marginBottom:4 }}>{ko?'한국 소매':'Korea Retail'}</div>
                    <div style={{ fontFamily:MONO, fontSize:18, color:'#f87171', fontWeight:700 }}>₩{Math.round(koreaPrice/1000).toLocaleString()}K</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:9, color:T.gold, marginBottom:4 }}>Aurum</div>
                    <div style={{ fontFamily:MONO, fontSize:18, color:T.gold, fontWeight:700 }}>₩{Math.round(aurumPrice/1000).toLocaleString()}K</div>
                  </div>
                </div>
                <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:SANS, fontSize:12, color:T.text }}>{ko?'절감':'You save'}</span>
                  <span style={{ fontFamily:MONO, fontSize:18, color:'#4ade80', fontWeight:700 }}>+₩{Math.round(savingsPerOz/1000).toLocaleString()}K</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── INTERACTIVE TOOLS ── */}
      <div style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:64, paddingBottom: isMobile?32:64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?24:40 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>{ko?'분석 도구':'Analytics Tools'}</div>
            <h2 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?24:38, color:T.text, fontWeight:300 }}>
              {ko?<>숫자로 보는 <span style={{ color:T.gold }}>Founders 가치</span></> : <>The Founders value — <span style={{ color:T.gold }}>by the numbers</span></>}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:16, marginBottom:16 }}>
            <SavingsCalculator lang={lang} prices={prices} krwRate={krwRate} />
            <GateSimulator lang={lang} krwRate={krwRate} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:16 }}>
            <RatioWidget prices={prices} lang={lang} />
            <RealEstateWidget prices={prices} krwRate={krwRate} lang={lang} />
          </div>
        </div>
      </div>

      {/* ── GATE DETAIL ── */}
      <div style={{ borderBottom:`1px solid ${T.border}`, background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:64, paddingBottom: isMobile?32:64 }}>
          <div style={{ textAlign:'center', marginBottom: isMobile?24:40 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>THE FIVE GATES</div>
            <h2 style={{ fontFamily:SERIF, fontStyle:'italic', fontSize: isMobile?24:38, color:T.text, fontWeight:300 }}>
              {ko?<>문을 통과할수록 <span style={{ color:T.gold }}>가격이 낮아집니다</span></>:<>Each gate passed, <span style={{ color:T.gold }}>your price drops</span></>}
            </h2>
          </div>

          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
            {GATES.map((g,i) => (
              <button key={i} onClick={()=>setActiveGate(i)} style={{ background:activeGate===i?(g.apex?'rgba(74,222,128,0.1)':'rgba(197,165,114,0.1)'):'transparent', border:`1px solid ${activeGate===i?g.color:T.border}`, color:activeGate===i?g.color:T.textMuted, padding:'6px 18px', fontFamily:MONO, fontSize:10, cursor:'pointer', transition:'all 0.2s' }}>
                Gate {g.num}
              </button>
            ))}
          </div>

          {GATES[activeGate] && (() => { const g = GATES[activeGate]; return (
            <div style={{ background:g.apex?'rgba(74,222,128,0.04)':T.bgCard, border:`1px solid ${g.apex?'rgba(74,222,128,0.3)':T.goldBorder}`, padding: isMobile?'24px 20px':'40px 48px', position:'relative' }}>
              {g.apex && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#4ade80,transparent)' }} />}
              <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap: isMobile?16:0 }}>
                {[
                  { lbl:ko?'게이트':'Gate', val:`Gate ${g.num}`, sub:ko?g.label:g.en, color:g.color },
                  { lbl:ko?'GMV 기준':'Threshold', val:g.gmvUSD>=1000?`$${g.gmvUSD/1000}K`:`$${g.gmvUSD}`, sub:ko?'누적 구매액':'Cumulative', color:T.text },
                  { lbl:ko?'가격 할인':'Discount', val:`−${g.discount}%`, sub:ko?'평생 자동':'Lifetime auto', color:g.color },
                  { lbl:ko?'보관료':'Storage', val:`${g.storage}/yr`, sub:ko?'연간 보관':'Annual fee', color:'#60a5fa' },
                ].map((s,i)=>(
                  <div key={i} style={{ textAlign:'center', padding: isMobile?0:'0 24px', borderRight: !isMobile&&i<3?`1px solid ${T.border}`:'none' }}>
                    <div style={{ fontFamily:MONO, fontSize:9, color:T.textMuted, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:8 }}>{s.lbl}</div>
                    <div style={{ fontFamily:MONO, fontSize: isMobile?24:32, color:s.color, fontWeight:700, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontFamily:SANS, fontSize:11, color:T.textMuted }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          );})()}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(5,1fr)`, gap:4, marginTop:12 }}>
            {GATES.map((g,i)=>(<div key={i} onClick={()=>setActiveGate(i)} style={{ height:3, background:i<=activeGate?g.color:T.border, cursor:'pointer', transition:'background 0.3s' }} />))}
          </div>
        </div>
      </div>

      {/* ── MACRO CONTEXT ── */}
      <div style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:64, paddingBottom: isMobile?32:64 }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:24, textAlign:'center' }}>{ko?'2026년 지금, 왜 금인가':'Why Gold, Why Now — 2026'}</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:1, background:T.border }}>
            {[
              { val:'220t',    lbl:ko?'Q3\'25 중앙은행 매입':'CB Q3\'25 buy',      sub:ko?'+28% QoQ':'+28% QoQ',     color:T.gold   },
              { val:'$4,800+', lbl:ko?'금 현재가 (ATH 근접)':'Gold near ATH',       sub:ko?'2026년 4월':'April 2026',  color:T.gold   },
              { val:'6yr',     lbl:ko?'연속 은 공급 부족':'Silver supply deficit', sub:ko?'2026 67Moz 부족':'67Moz short', color:'#7dd3dc'},
              { val:'20%',     lbl:ko?'한국 현재 프리미엄':'Korea premium now',    sub:ko?'vs 국제 현물가':'vs int\'l spot', color:'#f87171'},
            ].map((s,i)=>(
              <div key={i} style={{ background:'#0a0a0a', padding: isMobile?'20px 14px':'28px 24px', textAlign:'center' }}>
                <div style={{ fontFamily:MONO, fontSize: isMobile?22:30, color:s.color, fontWeight:700, marginBottom:6 }}>{s.val}</div>
                <div style={{ fontFamily:MONO, fontSize: isMobile?8:9, color:T.textMuted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>{s.lbl}</div>
                <div style={{ fontFamily:SANS, fontSize:10, color:T.textMuted }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ borderBottom:`1px solid ${T.border}`, background:'#0d0b08' }}>
        <div className="aurum-container" style={{ paddingTop: isMobile?32:64, paddingBottom: isMobile?32:64 }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:28, textAlign:'center' }}>{ko?'Founders 멤버 후기':'Member Reviews'}</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'24px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:14, right:18, fontFamily:SERIF, fontStyle:'italic', fontSize:36, color:'rgba(197,165,114,0.12)', lineHeight:1 }}>"</div>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.75, marginBottom:20, fontStyle:'italic' }}>"{ko?t.quote:t.en}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, background:'rgba(197,165,114,0.1)', border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:MONO, fontSize:10, color:T.gold }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily:MONO, fontSize:11, color:T.text }}>{t.name}</div>
                    <div style={{ fontFamily:MONO, fontSize:9, color:T.goldDim }}>{t.gate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: isMobile?'60px 20px':'90px 60px', textAlign:'center', background:`radial-gradient(ellipse at 50% 100%,rgba(197,165,114,0.1),transparent 55%)` }}>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:16, color:T.goldDim, letterSpacing:'0.2em', marginBottom:18 }}>— Exclusive · First-Come, First-Served —</div>
        <h2 style={{ fontFamily: ko?T.serifKr:SERIF, fontStyle:'italic', fontSize: isMobile?28:48, fontWeight:300, color:T.text, marginBottom:12, lineHeight:1.1 }}>
          {ko?<>지금 가입하면 <span style={{ color:T.gold }}>첫날부터 게이트가 시작됩니다</span></> : <>Join today and <span style={{ color:T.gold }}>your gates start from day one</span></>}
        </h2>
        <p style={{ fontFamily:SANS, fontSize:14, color:T.textSub, lineHeight:1.8, maxWidth:480, margin:'0 auto 32px' }}>
          {ko?`Founders Club 멤버십은 ${FOUNDERS_CAP}명으로 제한됩니다. 현재 ${SPOTS_REMAINING}자리 남았습니다.`:`Capped at ${FOUNDERS_CAP} members. ${SPOTS_REMAINING} spots remaining.`}
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={()=>navigate('register')} style={{ background:T.gold, border:'none', color:'#0d0b08', padding: isMobile?'14px 28px':'16px 44px', fontSize: isMobile?14:16, fontWeight:700, cursor:'pointer', fontFamily:SANS }}>
            {ko?'파운더스 클럽 가입 →':'Join Founders Club →'}
          </button>
          <button onClick={()=>navigate('founders')} style={{ background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding: isMobile?'14px 22px':'16px 32px', fontSize: isMobile?14:15, cursor:'pointer', fontFamily:SANS }}>
            {ko?'멤버십 상세 보기':'View Full Details'}
          </button>
        </div>
      </div>

    </div>
  );
}
