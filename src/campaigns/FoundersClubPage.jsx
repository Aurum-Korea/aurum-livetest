import { useState } from 'react';
import { T, useIsMobile, MOCK_REFERRAL_DATA, fUSD, fKRW } from '../lib/index.jsx';

const GATES = [
  { num:'I',   label:'시작의 문',   labelEn:'The Opening',     gmv:5000,   gmvKR:'₩7.2M',   discount:1.0, mark:'스테인리스 마크', card:'mc-stainless', apex:false },
  { num:'II',  label:'셋의 표식',   labelEn:'The Three',       gmv:15000,  gmvKR:'₩21.6M',  discount:1.5, mark:'시리얼 번호',     card:'mc-stainless', apex:false },
  { num:'III', label:'정점',        labelEn:'The Apex',        gmv:35000,  gmvKR:'₩50.4M',  discount:2.0, mark:'10K 솔리드 골드 마크', card:'mc-gold', apex:true  },
  { num:'IV',  label:'볼트 순례',   labelEn:'Vault Pilgrimage',gmv:65000,  gmvKR:'₩93.6M',  discount:2.5, mark:'싱가포르 볼트 방문', card:'mc-bronze', apex:false },
  { num:'V',   label:'평생의 표식', labelEn:'Lifetime Mark',   gmv:100000, gmvKR:'₩144M',   discount:3.0, mark:'평생 표식',       card:'mc-gold',     apex:false },
];

const GMV_BONUSES = [
  { gate:'I',  gmv:'$5K',   gmvKR:'₩7.2M',  bonus:'+₩50K',    bonusVal:50000,    desc:'첫 게이트 달성 축하 크레딧',    descEn:'First gate achievement credit' },
  { gate:'II', gmv:'$15K',  gmvKR:'₩21.6M', bonus:'+₩150K',   bonusVal:150000,   desc:'성장 가속 크레딧',              descEn:'Growth acceleration credit' },
  { gate:'III',gmv:'$35K',  gmvKR:'₩50.4M', bonus:'+₩400K',   bonusVal:400000,   desc:'정점 달성 특별 크레딧', apex:true, descEn:'Apex achievement special credit' },
  { gate:'IV', gmv:'$65K',  gmvKR:'₩93.6M', bonus:'+₩1,000K', bonusVal:1000000,  desc:'볼트 순례 크레딧',              descEn:'Vault pilgrimage credit' },
  { gate:'V',  gmv:'$100K', gmvKR:'₩144M',  bonus:'+₩2,500K', bonusVal:2500000,  desc:'평생 표식 달성 기념 크레딧',    descEn:'Lifetime mark milestone credit' },
];

const LB = [
  { rank:1, name:'YOUNG-HO K.', tier:'PATRON',  gate:5, gmv:127400 },
  { rank:2, name:'HA-EUN R.',   tier:'PATRON',  gate:4, gmv:89200  },
  { rank:3, name:'SEUNG-WOO L.',tier:'PATRON',  gate:4, gmv:74800  },
  { rank:4, name:'JI-AH M.',    tier:'FOUNDING',gate:3, gmv:42100  },
  { rank:5, name:'DOO-HYUN J.', tier:'FOUNDING',gate:3, gmv:38900  },
];
const USER = { name:'WOOSUNG K.', rank:247, gate:2, gmv:18000, code:'woosung-k-7g4q9p' };

function getGateIdx(gmv) { for(let i=GATES.length-1;i>=0;i--) if(gmv>=GATES[i].gmv) return i; return -1; }

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
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', gap:28 }}>
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
      <WaxSeal />
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
    </div>
  );
}

// ─── Gate Progress Widget ─────────────────────────────────────────────────────
function GateProgressWidget({ userGate, krwRate = 1375, lang = 'ko' }) {
  const ko = lang === 'ko';
  return (
    // FIX 12: height:'100%' so widget matches LeaderboardWidget height
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'20px 18px', position:'relative', height:'100%', boxSizing:'border-box' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      {/* FIX 12: fontSize:8 → 12 */}
      <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>{ko ? 'GMV 진행 현황 (DEMO)' : 'GMV PROGRESS (DEMO)'}</div>
      {GATES.map((g,i)=>{
        const done = userGate>=i, cur = userGate===i-1;
        return (
          <div key={i} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:i<4?12:0 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:done?T.gold:T.bg2, border:`2px solid ${done?T.gold:cur?T.gold:T.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:done?T.bg:cur?T.gold:T.goldDim, flexShrink:0, boxShadow:done?'0 0 10px rgba(197,165,114,0.4)':'none', transition:'all 0.4s' }}>{g.num}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontFamily:T.sans, fontSize:11, color:done?T.text:T.textMuted }}>{ko ? g.label : g.labelEn}</span>
                <span style={{ fontFamily:T.mono, fontSize:10, color:done?T.goldBright:T.goldDim, fontWeight:done?700:400 }}>−{g.discount}%</span>
              </div>
              <div style={{ height:2, background:T.border, overflow:'hidden' }}>
                <div style={{ height:'100%', width:done?'100%':'0%', background:`linear-gradient(90deg,${T.gold},${T.goldBright})`, transition:'width 0.8s ease', boxShadow:done?`0 0 6px ${T.gold}`:'none' }} />
              </div>
            </div>
            <span style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, flexShrink:0, minWidth:72, textAlign:'right' }}>₩{Math.round(g.gmv * krwRate / 1000000).toFixed(0)}M</span>
          </div>
        );
      })}
      <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted }}>{ko ? '현재 GMV' : 'Current GMV'}</span>
        <span style={{ fontFamily:T.mono, fontSize:13, color:T.gold, fontWeight:700 }}>₩{(USER.gmv * krwRate).toLocaleString('ko-KR')}</span>
      </div>
    </div>
  );
}

// ─── Leaderboard Widget ───────────────────────────────────────────────────────
function LeaderboardWidget({ krwRate = 1375, lang = 'ko' }) {
  const ko = lang === 'ko';
  return (
    // FIX 13: height:'100%' so widget matches GateProgressWidget height
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'20px 18px', position:'relative', height:'100%', boxSizing:'border-box' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        {/* FIX 13: fontSize:8 → 12 */}
        <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase' }}>GMV Kings</div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}><span className="live-dot" /><span style={{ fontFamily:T.mono, fontSize:8, color:T.gold, letterSpacing:'0.12em' }}>LIVE</span></div>
      </div>
      {[...LB].map((row,i)=>(
        <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr auto auto', gap:8, alignItems:'center', padding:'8px 0', borderBottom:i<LB.length-1?`1px solid rgba(197,165,114,0.06)`:'none' }}>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:16, color:row.rank<=3?T.gold:T.goldDim, textAlign:'center' }}>{['I','II','III','IV','V'][row.rank-1]}</div>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.text, letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.name}</div>
            <div style={{ fontFamily:T.mono, fontSize:7, color:row.tier==='PATRON'?T.gold:T.goldDim, border:`1px solid ${row.tier==='PATRON'?T.goldBorder:T.border}`, padding:'1px 5px', display:'inline-block', marginTop:2, letterSpacing:'0.12em' }}>{row.tier}</div>
          </div>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, fontWeight:600, textAlign:'right' }}>₩{Math.round(row.gmv * krwRate / 1000000)}M</div>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.green, fontWeight:700, textAlign:'right', minWidth:36 }}>−{GATES[row.gate-1].discount}%</div>
        </div>
      ))}
      <div style={{ display:'grid', gridTemplateColumns:'28px 1fr auto auto', gap:8, alignItems:'center', padding:'8px 8px', marginTop:4, background:`linear-gradient(90deg,rgba(197,165,114,0.08),transparent)`, borderLeft:`2px solid ${T.gold}`, marginLeft:-18, paddingLeft:20 }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold }}>#{USER.rank}</div>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ko ? 'YOU · ' : 'YOU · '}{USER.name}</div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, fontWeight:600, textAlign:'right' }}>₩{Math.round(USER.gmv * krwRate / 1000000)}M</div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted, textAlign:'right', minWidth:36 }}>−1.5%</div>
      </div>
    </div>
  );
}

// ─── GMV Calculator ───────────────────────────────────────────────────────────
function GMVCalculator({ prices = { gold: 3342.80 }, krwRate = 1368, lang = 'ko' }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [own, setOwn] = useState(500000), [ref, setRef] = useState(200000);

  const ownUSD = (own / krwRate) * 12;
  const refUSD = (ref / krwRate) * 12;
  const total  = ownUSD + refUSD;

  const gi = getGateIdx(total), gate = GATES[gi], next = GATES[gi + 1];
  const progress = next ? Math.min(((total - (gate?.gmv || 0)) / (next.gmv - (gate?.gmv || 0))) * 100, 100) : 100;
  const savings = total * ((gate?.discount || 0) / 100);
  const fmt = n => Math.round(n).toLocaleString('ko-KR');
  const fmtUSD = n => `$${Math.round(n).toLocaleString('en-US')}`;

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:isMobile?'24px 20px':'36px 44px', maxWidth:860, margin:'0 auto', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      {/* FIX 19: fontSize:9 → 12 */}
      <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.28em', textTransform:'uppercase', marginBottom:28 }}>{ko ? 'GMV 시뮬레이터 · FOUNDERS SAVINGS CALCULATOR' : 'GMV SIMULATOR · FOUNDERS SAVINGS CALCULATOR'}</div>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:24, marginBottom:28 }}>
        {[
          {label: ko ? '내 월 매수 (KRW)' : 'My Monthly Purchase (KRW)', value:own, set:setOwn, hint: ko ? '내 직접 구매액 (AGP + 실물)' : 'My direct purchases (AGP + physical)'},
          {label: ko ? '추천인 월 매수 (KRW)' : 'Referral Monthly Purchase (KRW)', value:ref, set:setRef, hint: ko ? '초대한 친구들 합산 월 구매액' : 'Combined monthly purchases of invited friends'}
        ].map((item,i)=>(
          <div key={i}>
            {/* FIX 20: fontSize:9 → 12 */}
            <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12 }}>{item.label}</div>
            <div style={{ fontFamily:T.mono, fontSize:26, fontWeight:700, color:T.text, marginBottom:14 }}>₩{fmt(item.value)}</div>
            <input type="range" min="0" max="5000000" step="100000" value={item.value} style={{ '--pct':`${(item.value/5000000*100).toFixed(1)}%` }} onChange={e=>item.set(+e.target.value)} />
            {/* FIX 21: fontSize:11 → 13 */}
            <div style={{ fontFamily:T.sans, fontSize:13, color:T.textMuted, marginTop:6 }}>{item.hint}</div>
          </div>
        ))}
      </div>
      <div style={{ background:T.bg2, border:`1px solid ${T.goldBorder}`, padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:14, marginBottom:16 }}>
          {[
            { label: ko ? '연간 총 GMV' : 'Annual Total GMV', value:`₩${fmt(total*krwRate)}`, sub:`≈ ${fmtUSD(total)}` },
            { label: ko ? '현재 게이트' : 'Current Gate', value:gate?`Gate ${gate.num}`:(ko?'미달':'None'), sub:gate?(ko?gate.label:gate.labelEn):(ko?'₩7.2M 부터':'From ₩7.2M') },
            { label:'Founder Savings', value:gate?`−${gate.discount}%`:'−', sub: ko ? 'on Listed Price · 평생' : 'on Listed Price · lifetime', hl:true },
            { label: ko ? '연간 절약 (추정)' : 'Annual Savings (est.)', value:gate?fKRW(savings * krwRate):'−', sub: ko ? '프리미엄 기준' : 'vs listed price' },
          ].map((s,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:T.mono, fontSize:i===2?20:16, color:s.hl?T.goldBright:T.gold, fontWeight:700 }}>{s.value}</div>
              {/* FIX 22: fontSize:9 → 11 */}
              <div style={{ fontFamily:T.sans, fontSize:11, color:T.textMuted, marginTop:3, letterSpacing:'0.05em' }}>{s.label}</div>
              {/* FIX 23: fontSize:9 → 11 */}
              <div style={{ fontFamily:T.mono, fontSize:11, color:'#555', marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {next && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              {/* FIX 24: fontSize:12 → 13 */}
              <span style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{ko ? `다음 게이트: Gate ${next.num} · ${next.label} (−${next.discount}%)` : `Next gate: Gate ${next.num} · ${next.labelEn} (−${next.discount}%)`}</span>
              <span style={{ fontFamily:T.mono, fontSize:11, color:T.gold }}>₩{Math.round((next.gmv-total) * krwRate).toLocaleString('ko-KR')} {ko ? '남음' : 'to go'}</span>
            </div>
            <div style={{ height:4, background:T.border, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress.toFixed(1)}%`, background:`linear-gradient(90deg,${T.gold},${T.goldBright})`, boxShadow:`0 0 10px ${T.gold}`, transition:'width 0.6s ease' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dual Savings Panel ───────────────────────────────────────────────────────
function DualSavingsPanel({ prices = { gold: 3342.80 }, krwRate = 1368, lang = 'ko' }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [ag, setAg] = useState(2);
  const gate = GATES[ag];
  const SPOT = prices.gold;
  const gPerG = SPOT * krwRate / 31.1035;
  const koreaPrice  = SPOT * 1.20;
  const aurumBase   = SPOT * 1.08;
  const withSavings = aurumBase * (1 - gate.discount / 100);
  const savedVsKorea = koreaPrice - withSavings;
  const monthly = 1000000;
  const gramsBase   = monthly / (gPerG * 1.08);
  const gramsWithS  = monthly / (gPerG * 1.08 * (1 - gate.discount / 100));
  const bonusG      = gramsWithS - gramsBase;

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>
      {/* FIX 17: fontSize:isMobile?8:10 → isMobile?11:13 */}
      <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:`1px solid ${T.border}` }}>
        {GATES.map((g,i)=>(
          <button key={i} onClick={()=>setAg(i)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'9px 4px', fontFamily:T.mono, fontSize:isMobile?11:13, color:ag===i?T.gold:T.textMuted, borderBottom:ag===i?`2px solid ${T.gold}`:'2px solid transparent', transition:'all 0.2s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {g.num} · {ko ? g.label : g.labelEn}
          </button>
        ))}
      </div>
      {/* FIX 18: alignItems:'stretch' on grid */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:14, alignItems:'stretch' }}>
        {/* FIX 18: display:flex flexDirection:column on Physical card */}
        <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>🥇 {ko ? '실물 매수 · Physical' : 'Physical Purchase'}</div>
          {[
            { label: ko ? 'exgold 매도가 (VAT 포함)' : 'Korean retail (VAT incl.)',         value:`₩${Math.round(koreaPrice*krwRate/31.1035).toLocaleString('ko-KR')}`, color:'#888' },
            { label: ko ? 'Aurum 기본가 (프리미엄 +8%)' : 'Aurum base price (+8%)',          value:`₩${Math.round(aurumBase*krwRate/31.1035).toLocaleString('ko-KR')}`, color:T.textSub },
            { label:`Gate ${gate.num} ${ko ? `적용가 (−${gate.discount}%)` : `price (−${gate.discount}%)`}`, value:`₩${Math.round(withSavings*krwRate/31.1035).toLocaleString('ko-KR')}`, color:T.goldBright, hl:true },
          ].map((row,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'9px 0', borderBottom:i<2?`1px dashed ${T.border}`:'none' }}>
              <span style={{ fontFamily:T.sans, fontSize:12, color:T.textSub }}>{row.label}</span>
              <span style={{ fontFamily:T.mono, fontSize:row.hl?18:13, color:row.color, fontWeight:row.hl?700:500 }}>{row.value}<span style={{ fontSize:10, color:T.textMuted, marginLeft:3 }}>/g</span></span>
            </div>
          ))}
          {/* FIX 18: marginTop:'auto' pushes savings badge to bottom */}
          <div style={{ marginTop:'auto', paddingTop:14, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:T.sans, fontSize:12, color:T.text }}>{ko ? '한국 대비 절약' : 'Savings vs Korea'}</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:T.mono, fontSize:16, color:T.green, fontWeight:700 }}>₩{Math.round(savedVsKorea*krwRate/31.1035).toLocaleString('ko-KR')}/g</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>{((savedVsKorea/koreaPrice)*100).toFixed(1)}% {ko ? '절약' : 'saved'}</div>
            </div>
          </div>
        </div>
        {/* FIX 18: display:flex flexDirection:column on AGP card */}
        <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>📈 {ko ? 'AGP 월적립 · Savings Plan' : 'AGP Monthly Plan'}</div>
          <div style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted, marginBottom:12 }}>{ko ? '기준: 월 ₩1,000,000 AGP 적립 시' : 'Based on ₩1,000,000/month AGP'}</div>
          {[
            { label: ko ? '할인 없이 받는 그램' : 'Grams without discount', value:`${gramsBase.toFixed(3)}g`, color:T.textSub },
            { label:`Gate ${gate.num} ${ko ? `적용 그램 (−${gate.discount}%)` : `grams (−${gate.discount}%)`}`, value:`${gramsWithS.toFixed(3)}g`, color:T.goldBright, hl:true },
          ].map((row,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:i<1?`1px dashed ${T.border}`:'none' }}>
              <span style={{ fontFamily:T.sans, fontSize:12, color:T.textSub }}>{row.label}</span>
              <span style={{ fontFamily:T.mono, fontSize:row.hl?18:13, color:row.color, fontWeight:row.hl?700:500 }}>{row.value}</span>
            </div>
          ))}
          {/* FIX 18: marginTop:'auto' pushes savings badge to bottom */}
          <div style={{ marginTop:'auto', paddingTop:14, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:T.sans, fontSize:12, color:T.text }}>{ko ? '월 추가 적립 그램' : 'Monthly bonus grams'}</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:T.mono, fontSize:16, color:T.green, fontWeight:700 }}>+{bonusG.toFixed(4)}g</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>/ {ko ? '매월 · 평생' : 'monthly · lifetime'}</div>
            </div>
          </div>
          <div style={{ marginTop:10, padding:'9px 12px', background:T.goldGlow, fontFamily:T.sans, fontSize:11, color:T.textSub, lineHeight:1.5 }}>
            {ko ? <>이 할인율은 모든 미래 AGP 적립 <strong style={{ color:T.text }}>평생</strong> 적용됩니다.</> : <>This discount applies to all future AGP savings <strong style={{ color:T.text }}>permanently</strong>.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GMV Explainer ────────────────────────────────────────────────────────────
function GMVExplainer({ lang = 'ko' }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const sources = [
    { icon:'🥇', label: ko ? '내 실물 매수'   : 'My Physical',   desc: ko ? '금·은 바, 코인 직접 구매액' : 'Direct gold & silver purchases' },
    { icon:'📈', label: ko ? '내 AGP 적립액'  : 'My AGP',        desc: ko ? '월간 자동이체 누적 총액'   : 'Monthly auto-debit cumulative total' },
    { icon:'👥', label: ko ? '추천 실물 GMV'  : 'Referral Physical', desc: ko ? '초대한 친구의 실물 매수액' : 'Friends\' physical purchase amounts' },
    { icon:'📊', label: ko ? '추천 AGP GMV'   : 'Referral AGP',  desc: ko ? '초대한 친구의 AGP 월 약정 합산' : 'Friends\' AGP monthly commitments' },
  ];
  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <div style={{ fontFamily:T.serifKr, fontSize:'clamp(20px,3vw,34px)', color:T.text, fontWeight:500, marginBottom:10, lineHeight:1.2 }}>
          {ko ? <>GMV란 무엇인가? <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>— 네 가지 원천</span></> : <>What is GMV? <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>— Four Sources</span></>}
        </div>
        <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.8, maxWidth:560, margin:'0 auto' }}>
          {ko ? 'GMV는 회원님이 Aurum 생태계에서 만들어낸 모든 거래의 합산입니다. 본인 구매 + 추천 구매 — 두 가지 모두 카운트됩니다.' : 'GMV is the sum of all transactions you generate in the Aurum ecosystem. Your purchases + referral purchases — both count.'}
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {sources.map((s,i)=>(
          <div key={i} style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'18px 14px', textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontFamily:T.sansKr, fontSize:13, color:T.text, fontWeight:600, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:T.sans, fontSize:11, color:T.textMuted, lineHeight:1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      {/* FIX 15: responsive font sizes — was all hardcoded causing mobile overflow */}
      <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:isMobile?'16px 20px':'24px 32px', display:'flex', justifyContent:'center', alignItems:'center', gap:isMobile?10:16, flexWrap:'wrap', textAlign:'center' }}>
        {[
          ko ? '내 실물' : 'Physical', '+',
          ko ? '내 AGP' : 'My AGP', '+',
          ko ? '추천 실물' : 'Ref. Physical', '+',
          ko ? '추천 AGP' : 'Ref. AGP', '=',
          'Total GMV'
        ].map((item,i)=>(
          <span key={i} style={{
            fontFamily:['=','+'].includes(item)?T.serif:T.mono,
            fontStyle:item==='='?'italic':'normal',
            // FIX 15: responsive — was fixed fontSize causing mobile overflow
            fontSize:item==='='?(isMobile?22:28):item==='Total GMV'?(isMobile?13:16):(isMobile?12:14),
            color:item==='+'||item==='='?T.goldDim:item==='Total GMV'?T.goldBright:T.text,
            fontWeight:item==='Total GMV'?700:400,
            textTransform:'uppercase',
            letterSpacing:item==='Total GMV'?'0.14em':'0.08em'
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Share Panel ──────────────────────────────────────────────────────────────
function SharePanel({ toast, lang = 'ko' }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(`https://aurum.sg/founders?s=${USER.code}`).catch(()=>{});
    setCopied(true); toast(ko ? '초대 링크가 복사되었습니다' : 'Invite link copied');
    setTimeout(()=>setCopied(false), 2200);
  };
  return (
    <div style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'Your Sigil · 초대 링크' : 'Your Sigil · Invite Link'}</div>
        <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(20px,3vw,32px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
          {ko ? <>친구를 초대할수록 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>더 빨리 문이 열립니다</span></> : <>The more friends you invite, <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>the faster the gates open</span></>}
        </h2>
        <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.7 }}>{ko ? '친구의 첫 결제가 정산되면 그 금액이 내 GMV에 합산됩니다.' : "Once a friend's first payment clears, their amount adds to your GMV."}</p>
      </div>
      <div style={{ background:T.bg2, border:`1px solid ${T.goldBorder}`, padding:'16px 20px', display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
        <div style={{ flex:1, fontFamily:T.mono, fontSize:13, color:T.gold, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>aurum.sg/founders?s={USER.code}</div>
        <button onClick={copy} style={{ background:copied?T.gold:'transparent', border:`1px solid ${T.goldBorderStrong}`, color:copied?T.bg:T.gold, padding:'10px 18px', fontFamily:T.sans, fontSize:11, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', flexShrink:0 }}>
          {copied?(ko?'복사됨 ✓':'Copied ✓'):(ko?'복사 · COPY':'Copy · COPY')}
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[{icon:'K',label:'KakaoTalk'},{icon:'@',label:'Instagram'},{icon:'N',label:'Naver'},{icon:'↓',label:'Card'}].map((btn,i)=>(
          <button key={i} onClick={()=>toast(`${btn.label} ${ko?'공유 — 데모':'share — demo'}`)} style={{ background:T.bg2, border:`1px solid ${T.goldBorder}`, padding:'16px 10px', fontFamily:T.sans, fontSize:11, fontWeight:500, letterSpacing:'0.14em', color:T.textSub, textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.gold;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.goldBorder;e.currentTarget.style.color=T.textSub;e.currentTarget.style.transform='none';}}>
            <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, fontWeight:600, color:T.gold }}>{btn.icon}</span>{btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Gate Cards ───────────────────────────────────────────────────────────────
function GateCards({ userGate, krwRate = 1375, lang = 'ko' }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const cardBg = { 'mc-gold':'linear-gradient(135deg,#6a5a3a,#E3C187 50%,#6a5a3a)', 'mc-stainless':'linear-gradient(135deg,#4a4a4a,#b8b8b8 50%,#4a4a4a)', 'mc-bronze':'linear-gradient(135deg,#4a3520,#b8804a 50%,#4a3520)' };
  return (
    <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(5,1fr)', gap:12 }}>
      {GATES.map((gate,i)=>{
        const done=userGate>=i, cur=userGate===i-1;
        return (
          <div key={i} style={{ background:gate.apex?`linear-gradient(180deg,${T.goldGlow},${T.bg})`:T.bg, border:`1px solid ${done||gate.apex?T.goldBorderStrong:T.border}`, padding:isMobile?'22px 14px':'28px 18px', textAlign:'center', position:'relative', overflow:'hidden', transition:'all 0.35s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor=T.goldBorderStrong;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=done||gate.apex?T.goldBorderStrong:T.border;}}>
            {gate.apex && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
            {done && <div style={{ position:'absolute', top:10, right:10, fontFamily:T.mono, fontSize:7, color:T.bg, background:T.green, padding:'2px 6px', letterSpacing:'0.15em' }}>{ko?'UNLOCKED':'UNLOCKED'}</div>}
            {cur && !done && <div style={{ position:'absolute', top:10, right:10, fontFamily:T.mono, fontSize:7, color:T.gold, border:`1px solid ${T.goldBorder}`, padding:'2px 6px', letterSpacing:'0.15em' }}>NEXT</div>}
            <div style={{ width:44, height:44, borderRadius:'50%', margin:'0 auto 14px', background:done?T.gold:T.bg2, border:`2px solid ${done?T.gold:cur?T.gold:T.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:done?T.bg:cur?T.gold:T.goldDim, boxShadow:done?'0 0 16px rgba(197,165,114,0.5)':cur?'0 0 0 4px rgba(197,165,114,0.12),0 0 20px rgba(197,165,114,0.5)':'none', animation:cur&&!done?'pulseRing 2s ease-in-out infinite':'none' }}>{gate.num}</div>
            <div style={{ fontFamily:T.mono, fontSize:8, color:gate.apex?T.gold:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:8 }}>{gate.apex?'— APEX —':`— GATE ${gate.num} —`}</div>
            <div style={{ fontFamily:T.mono, fontSize:18, fontWeight:700, color:done?T.goldBright:T.gold, marginBottom:3 }}>₩{Math.round(gate.gmv * krwRate / 1000000).toFixed(0)}M</div>
            <div style={{ fontFamily:T.sansKr, fontSize:9, color:T.textMuted, marginBottom:14 }}>≈ {gate.gmvKR} GMV</div>
            <div style={{ height:54, display:'flex', alignItems:'center', justifyContent:'center', margin:'8px 0 12px' }}>
              <div style={{ width:84, height:52, borderRadius:4, background:cardBg[gate.card], boxShadow:gate.card==='mc-gold'?'0 6px 20px rgba(197,165,114,0.3)':'0 6px 14px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%)', borderRadius:4 }} />
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:'rgba(20,20,20,0.85)', zIndex:1, position:'relative' }}>{i===4?'∞':'AU'}</div>
                <div style={{ fontSize:6, letterSpacing:'0.24em', color:'rgba(20,20,20,0.7)', zIndex:1, position:'relative' }}>{gate.mark.slice(0,8).toUpperCase()}</div>
              </div>
            </div>
            <div style={{ fontFamily:T.serifKr, fontSize:14, color:T.text, fontWeight:600, marginBottom:3, lineHeight:1.3 }}>{ko ? gate.label : gate.labelEn}</div>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:10, color:T.goldDim, marginBottom:14 }}>{gate.mark}</div>
            <div style={{ paddingTop:12, borderTop:`1px solid ${T.goldBorder}` }}>
              <div style={{ fontFamily:T.mono, fontSize:8, color:T.textMuted, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:5 }}>Founder Savings</div>
              <div style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, color:done?T.goldBright:T.gold }}>−{gate.discount}%</div>
              <div style={{ fontFamily:T.sans, fontSize:9, color:T.textMuted, marginTop:2 }}>on Listed Price · {ko?'평생':'lifetime'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function FoundersClubPage({ lang, navigate, user, setShowLogin, prices = { gold: 3342.80, silver: 32.90 }, krwRate = 1368 }) {
  const isMobile = useIsMobile();
  // FIX 29: add ko constant for bilingual support
  const ko = lang === 'ko';
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = msg => { setToastMsg(msg); setTimeout(()=>setToastMsg(null),2400); };
  const userGate = USER.gate - 1;
  const pad = isMobile ? '48px 20px' : '80px 60px';

  return (
    <div style={{ background:T.bg }}>

      {/* ══ HERO ══ */}
      <div style={{ padding:isMobile?'60px 20px 50px':'80px 60px 70px', background:`radial-gradient(ellipse at 80% 20%,rgba(197,165,114,0.10),transparent 55%),linear-gradient(180deg,${T.bg} 0%,${T.bg2} 100%)`, borderBottom:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?80:260, fontWeight:600, letterSpacing:'0.04em', color:'rgba(197,165,114,0.015)', pointerEvents:'none', whiteSpace:'nowrap', userSelect:'none', zIndex:0 }}>FOUNDERS</div>

        {/* FIX 11: alignItems:'start' → 'stretch' */}
        <div style={{ maxWidth:1340, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'minmax(0,1.15fr) minmax(0,0.55fr) minmax(0,0.55fr)', gap:isMobile?40:22, alignItems:'stretch', position:'relative', zIndex:1 }}>

          {/* Col 1 — Hero text */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:32, height:1, background:T.gold }} />
              {/* FIX 9: fontSize:9 → 13 */}
              <span style={{ fontFamily:T.mono, fontSize:13, fontWeight:500, letterSpacing:'0.22em', textTransform:'uppercase', color:T.gold }}>
                {ko ? 'Founders Club · 파운더스 클럽' : 'Founders Club · Permanent Savings'}
              </span>
            </div>
            <h1 style={{ fontFamily:T.serifKr, fontWeight:500, fontSize:isMobile?34:54, lineHeight:1.1, color:T.text, margin:'0 0 18px', letterSpacing:'-0.01em' }}>
              {ko ? <>더 많이 구매할수록,<br />더 싸게 <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>영원히</span>.</> : <>The more you buy,<br />the cheaper — <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>forever</span>.</>}
            </h1>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:17, color:T.goldDim, marginBottom:20, letterSpacing:'0.005em' }}>
              {ko ? 'The more your GMV grows, the deeper your Founder Savings — permanently.' : 'The more your GMV grows, the deeper your Founder Savings — permanently.'}
            </div>
            <p style={{ fontFamily:T.sansKr, fontSize:14, color:T.textSub, lineHeight:1.85, maxWidth:480, marginBottom:28 }}>
              {ko ? <>나의 구매 + 친구들의 구매 = GMV. GMV가 다섯 개의 문을 통과할 때마다 <strong style={{ color:T.text }}>표시가에서 자동 차감되는 Founder Savings</strong>가 깊어집니다. 실물 금 매수와 AGP 적립 모두 평생 적용.</> : <>Your purchases + friends' purchases = GMV. Each of the five gates you pass deepens your <strong style={{ color:T.text }}>Founder Savings — auto-deducted from listed price</strong>. Applies to physical gold and AGP savings, permanently.</>}
            </p>
            {/* FIX 10: equal buttons — same padding, fontSize, flex:1, alignItems:stretch */}
            <div style={{ display:'flex', gap:10, flexDirection:isMobile?'column':'row', alignItems:'stretch' }}>
              <button onClick={()=>navigate('agp-enroll')} style={{ flex:1, background:T.gold, border:'none', color:'#0a0a0a', padding:'14px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
                {ko ? '파운더스 클럽 가입 →' : 'Join Founders Club →'}
              </button>
              <button onClick={()=>navigate('shop')} style={{ flex:1, background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding:'14px 24px', fontSize:14, cursor:'pointer', fontFamily:T.sans }}>
                {ko ? '실물 구매로 GMV 쌓기' : 'Build GMV with Physical'}
              </button>
            </div>
          </div>

          {/* FIX 14: removed !isMobile guard — widgets now show on mobile too */}
          <GateProgressWidget userGate={userGate} krwRate={krwRate} lang={lang} />
          <LeaderboardWidget krwRate={krwRate} lang={lang} />
        </div>
      </div>

      {/* Stats bar */}
      {/* FIX 26-27: sublabel fontSize:9 → isMobile?9:13; value fontSize:isMobile?14:20 → isMobile?14:22 */}
      <div style={{ background:T.bg3, borderBottom:`1px solid ${T.goldBorder}` }}>
        <div style={{ maxWidth:1340, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(5,1fr)', gap:0 }}>
          {GATES.map((g,i)=>(
            <div key={i} style={{ textAlign:'center', padding:isMobile?'14px 8px':'22px 14px', borderRight:!isMobile&&i<4?`1px solid ${T.goldBorder}`:'none', borderBottom:isMobile&&i<3?`1px solid ${T.goldBorder}`:'none' }}>
              <div style={{ fontFamily:T.mono, fontSize:isMobile?14:22, color:T.gold, fontWeight:700 }}>−{g.discount}%</div>
              <div style={{ fontFamily:T.sans, fontSize:isMobile?9:13, color:T.textMuted, marginTop:4, letterSpacing:'0.05em' }}>Gate {g.num} · ₩{Math.round(g.gmv * krwRate / 1000000).toFixed(0)}M</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GMV Explainer ── */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <GMVExplainer lang={lang} />
      </div>

      {/* ── Share Panel ── */}
      <div style={{ padding:isMobile?'44px 20px':'64px 60px', background:T.bg1, borderBottom:`1px solid ${T.border}` }}>
        <SharePanel toast={showToast} lang={lang} />
      </div>

      {/* ── Rules ── */}
      <div style={{ padding:isMobile?'44px 20px':'64px 60px', background:T.bg3, borderTop:`1px solid ${T.goldBorder}`, borderBottom:`1px solid ${T.goldBorder}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,2.5vw,34px)', fontWeight:500, color:T.text }}>
              {ko ? <>네 가지 원칙 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold, fontWeight:400 }}>— 간단하고 공정합니다</span></> : <>Four Principles <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold, fontWeight:400 }}>— simple and fair</span></>}
            </h2>
          </div>
          {/* FIX 16: alignItems:'stretch' on grid */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:24, alignItems:'stretch' }}>
            {[
              { n:'I',   t: ko?'실제 GMV만 카운트':'Real GMV Only',      d: ko?'친구가 KYC를 통과하고 첫 결제가 정산되어야 GMV에 반영됩니다. 가짜 가입은 자동 차단.':'A friend must pass KYC and have their first payment settled before GMV is credited. Fake signups are auto-blocked.' },
              { n:'II',  t: ko?'한 번 열리면, 평생':'Once Unlocked, Forever', d: ko?'통과한 게이트의 Founder Savings는 회수되지 않습니다. 모든 미래 구매에 영구 적용.':'Founder Savings from passed gates are never revoked. Permanently applied to all future purchases.' },
              { n:'III', t: ko?'정점은 −3.0%':'Apex is −3.0%',            d: ko?'Gate V를 넘는 추가 할인은 없습니다. 그러나 친구 초대는 언제나 환영합니다.':'No additional discount beyond Gate V. But friend invitations are always welcome.' },
              { n:'IV',  t: ko?'익명 기본 보호':'Anonymous by Default',    d: ko?'리더보드는 이니셜 + ID 기본 표시. 본인 동의 시 실명 공개 가능. 통계는 비공개.':'Leaderboard shows initials + ID by default. Full name visible only with your consent. Statistics are private.' },
            // FIX 16: display:flex flexDirection:column on each card
            ].map((r,i)=>(
              <div key={i} style={{ paddingTop:20, borderTop:`1px solid ${T.goldBorderStrong}`, display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:28, color:T.gold, marginBottom:10 }}>{r.n}</div>
                <div style={{ fontFamily:T.sansKr, fontSize:15, fontWeight:600, color:T.text, marginBottom:8 }}>{r.t}</div>
                {/* FIX 16: flex:1 on description so all cards same height */}
                <div style={{ fontFamily:T.sansKr, fontSize:12, color:T.textSub, lineHeight:1.7, flex:1 }}>{r.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SealDivider />

      {/* ── Five Gates ── */}
      <div style={{ padding:pad, background:T.bg2, borderTop:`1px solid ${T.goldBorder}`, borderBottom:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?60:180, letterSpacing:'0.14em', fontWeight:500, color:'rgba(197,165,114,0.018)', pointerEvents:'none', whiteSpace:'nowrap', userSelect:'none', zIndex:0 }}>QVINQVE PORTAE</div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'The Five Gates · 다섯 개의 문' : 'The Five Gates'}</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(24px,3.5vw,40px)', fontWeight:500, color:T.text, marginBottom:12, lineHeight:1.2 }}>
              {ko ? <>문을 통과할수록 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>가격이 낮아집니다</span></> : <>Each gate you pass <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>lowers your price</span></>}
            </h2>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
              {ko ? '게이트는 한 번 열리면 닫히지 않습니다. 실물 매수·AGP 적립·추천 GMV 모든 거래에 평생 자동 적용.' : 'Gates never close once opened. Automatically applied lifetime to all physical purchases, AGP savings, and referral GMV.'}
            </p>
          </div>
          <GateCards userGate={userGate} krwRate={krwRate} lang={lang} />
        </div>
      </div>

      {/* ── Dual Savings + GMV Calculator ── */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <div style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'Dual Benefit · 이중 혜택' : 'Dual Benefit'}</div>
          <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,36px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
            {ko ? <>실물과 AGP, <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>모두 더 싸집니다</span></> : <>Physical and AGP — <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>both get cheaper</span></>}
          </h2>
          <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>{ko ? '게이트별 절약액을 직접 확인하세요.' : 'See your savings at each gate level.'}</p>
        </div>
        <DualSavingsPanel prices={prices} krwRate={krwRate} lang={lang} />
      </div>

      <div style={{ padding:pad, background:T.bg1, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          {/* FIX 19: fontSize:9 → 13 */}
          <div style={{ fontFamily:T.mono, fontSize:13, color:T.gold, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'GMV Simulator · 시뮬레이터' : 'GMV Simulator'}</div>
          <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,36px)', fontWeight:500, color:T.text, marginBottom:10 }}>
            {ko ? <>내 GMV, 직접 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>계산해 보세요</span></> : <>Calculate <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>your GMV</span></>}
          </h2>
        </div>
        <GMVCalculator prices={prices} krwRate={krwRate} lang={lang} />
      </div>

      {/* ── CTA ── */}
      <div style={{ padding:isMobile?'72px 20px':'110px 60px', background:`radial-gradient(ellipse at 50% 100%,rgba(197,165,114,0.15),transparent 60%),${T.bg}`, textAlign:'center', borderTop:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?60:130, color:'rgba(197,165,114,0.022)', whiteSpace:'nowrap', userSelect:'none', letterSpacing:'0.12em' }}>FOUNDERS</div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.gold, letterSpacing:'0.3em', marginBottom:20, textTransform:'uppercase' }}>— Exclusive · First-Come, First-Served —</div>
          <h2 style={{ fontFamily:T.serifKr, fontSize:isMobile?28:46, fontWeight:500, color:T.text, marginBottom:16, lineHeight:1.15 }}>
            {ko ? <>지금 가입하면<br /><span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>첫날부터 게이트가 시작됩니다</span></> : <>Join now and your <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>gates start from day one</span></>}
          </h2>
          <p style={{ fontFamily:T.sans, fontSize:14, color:T.textSub, lineHeight:1.8, maxWidth:480, margin:'0 auto 36px' }}>
            {ko ? 'Founders Club 멤버십은 한정 모집입니다. 조기 마감 시 재오픈 일정은 미정.' : 'Founders Club membership is limited. No reopening schedule if closed early.'}
          </p>
          {/* FIX 28: equal buttons — same padding, fontSize, minWidth, alignItems:stretch */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', alignItems:'stretch' }}>
            <button onClick={()=>navigate('agp-enroll')} style={{ background:T.gold, border:'none', color:'#0a0a0a', padding:'16px 36px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:T.sans, minWidth:220 }}>
              {ko ? '파운더스 클럽 가입 →' : 'Join Founders Club →'}
            </button>
            <button onClick={()=>navigate('shop')} style={{ background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding:'16px 36px', fontSize:15, cursor:'pointer', fontFamily:T.sans, minWidth:220 }}>
              {ko ? '실물 구매로 시작' : 'Start with Physical'}
            </button>
          </div>
        </div>
      </div>

      {/* T&C */}
      <div style={{ background:T.bg2, padding:'32px 60px', borderTop:`1px solid ${T.goldBorder}` }}>
        <p style={{ fontFamily:T.sansKr, fontSize:11, color:T.textMuted, lineHeight:1.85, maxWidth:880, margin:'0 auto', textAlign:'center' }}>
          ※ Founders Club는 Aurum Pte. Ltd.의 GMV 기반 멤버십 프로그램입니다. Founder Savings는 Aurum Listed Price 기준으로 적용되며 실제 조건은 출시 시점의 공식 약관을 따릅니다. GMV 산정은 정산 완료된 거래만을 대상으로 합니다. 모든 투자에는 원금 손실 가능성이 있습니다.
        </p>
      </div>

      {toastMsg && <div className="toast-container"><div className="toast-item">{toastMsg}</div></div>}
    </div>
  );
}
