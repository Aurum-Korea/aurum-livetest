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
  { level:'',  gmv:'$5K',   gmvKR:'₩7.2M',  bonus:'+₩50K',    bonusVal:50000,    desc:'첫 게이트 달성 축하 크레딧',    descEn:'First gate achievement credit' },
  { level:'I', gmv:'$15K',  gmvKR:'₩21.6M', bonus:'+₩150K',   bonusVal:150000,   desc:'성장 가속 크레딧',              descEn:'Growth acceleration credit' },
  { level:'II',gmv:'$35K',  gmvKR:'₩50.4M', bonus:'+₩400K',   bonusVal:400000,   desc:'정점 달성 특별 크레딧', apex:true, descEn:'Apex achievement special credit' },
  { level:'V', gmv:'$65K',  gmvKR:'₩93.6M', bonus:'+₩1,000K', bonusVal:1000000,  desc:'볼트 순례 크레딧',              descEn:'Vault pilgrimage credit' },
  { gate:'V',  gmv:'$100K', gmvKR:'₩144M',  bonus:'+₩2,500K', bonusVal:2500000,  desc:'평생 표식 달성 기념 크레딧',    descEn:'Lifetime mark milestone credit' },
];

const LB = [
  { rank:1, nameEn:'YOUNG-HO K.', nameKo:'김영호', tier:'PATRON',  tierKo:'패트론',  gate:5, gmv:127400 },
  { rank:2, nameEn:'HA-EUN R.',   nameKo:'류하은', tier:'PATRON',  tierKo:'패트론',  gate:4, gmv:89200  },
  { rank:3, nameEn:'SEUNG-WOO L.',nameKo:'이승우', tier:'PATRON',  tierKo:'패트론',  gate:4, gmv:74800  },
  { rank:4, nameEn:'JI-AH M.',    nameKo:'민지아', tier:'FOUNDING',tierKo:'파운딩',  gate:3, gmv:42100  },
  { rank:5, nameEn:'DOO-HYUN J.', nameKo:'정두현', tier:'FOUNDING',tierKo:'파운딩',  gate:3, gmv:38900  },
];
const USER = { name:'WOOSUNG K.', rank:247, gate:2, gmv:18000, code:'woosung-k-7g4q9p' };

function getGateIdx(gmv) { for(let i=GATES.length-1;i>=0;i--) if(gmv>=GATES[i].gmv) return i; return -1; }

export function WaxSeal({ size=64 }) {
  return (
    <div style={{ width:size, height:size, background:'rgba(197,165,114,0.08)', border:'1px solid rgba(197,165,114,0.6)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'0 0 16px rgba(197,165,114,0.15)', flexShrink:0 }}>
      <span style={{ fontFamily:T.serif, fontStyle:'italic', fontWeight:500, fontSize:size*0.32, color:'rgba(197,165,114,0.9)', zIndex:1, position:'relative', letterSpacing:'0.04em' }}>AU</span>
    </div>
  );
}
export function SealDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', gap:28 }}>
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
      <WaxSeal />
      <div style={{ flex:1, maxWidth:360, height:1, background:`linear-gradient(to right,transparent,${T.goldBorderStrong},transparent)` }} />
    </div>
  );
}

// ─── Level Progress Widget ─────────────────────────────────────────────────────
function GateProgressWidget({ userGate, userGMV = 18000, krwRate = 1375, lang = 'ko' }) {
  const ko = lang === 'ko';
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}`, padding:'20px 18px', position:'relative', height:'100%', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
      <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>{ko ? 'GMV 진행 현황 (DEMO)' : 'GMV PROGRESS (DEMO)'}</div>
      {GATES.map((g,i)=>{
        const done = userGate>=i, cur = userGate===i-1;
        // BUG FIX #4: calculate partial fill for gate currently in progress
        const prevGmv = i > 0 ? GATES[i-1].gmv : 0;
        const fillPct = done ? 100
          : cur ? Math.min(((userGMV - prevGmv) / (g.gmv - prevGmv)) * 100, 98)
          : 0;
        return (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 1fr 48px 60px', gap:8, alignItems:'center', marginBottom:i<4?12:0 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:done?T.gold:T.bg2, border:`2px solid ${done?T.gold:cur?T.gold:T.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:done?T.bg:cur?T.gold:T.goldDim, flexShrink:0, boxShadow:done?'0 0 10px rgba(197,165,114,0.4)':'none', transition:'all 0.4s' }}>{g.num}</div>
            <div>
              <span style={{ fontFamily:T.sans, fontSize:11, color:done?T.text:T.textMuted, display:'block', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ko ? g.label : g.labelEn}</span>
              <div style={{ height:2, background:T.border, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${fillPct}%`, background:`linear-gradient(90deg,${T.gold},${T.goldBright})`, transition:'width 0.8s ease', boxShadow:done?`0 0 6px ${T.gold}`:cur?`0 0 4px ${T.gold}`:'none' }} />
              </div>
            </div>
            <span style={{ fontFamily:T.mono, fontSize:11, color:done?T.goldBright:T.goldDim, fontWeight:done?700:400, textAlign:'right' }}>−{g.discount}%</span>
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted, textAlign:'right' }}>₩{Math.round(g.gmv * krwRate / 1000000)}M</span>
          </div>
        );
      })}
      <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${T.border}`, display:'grid', gridTemplateColumns:'1fr auto' }}>
        <span style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted }}>{ko ? '현재 GMV' : 'Current GMV'}</span>
        <span style={{ fontFamily:T.mono, fontSize:13, color:T.gold, fontWeight:700 }}>₩{Math.round(USER.gmv * krwRate / 1000000)}M</span>
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
        <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{lang === 'ko' ? '파운더스 랭킹' : 'Founders Ranking'}</div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}><span className="live-dot" /><span style={{ fontFamily:T.mono, fontSize:10, color:T.gold, letterSpacing:'0.10em' }}>LIVE</span></div>
      </div>
      {[...LB].map((row,i)=>(
        <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 1fr 72px 52px', gap:8, alignItems:'center', minHeight:48, padding:'7px 0', borderBottom:i<LB.length-1?`1px solid rgba(197,165,114,0.06)`:'none' }}>
          {/* Col 1 — circle badge, matches GateProgressWidget exactly */}
          <div style={{ width:28, height:28, borderRadius:'50%', background:row.rank<=3?T.gold:T.bg2, border:`2px solid ${row.rank<=3?T.gold:T.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:row.rank<=3?T.bg:T.goldDim, flexShrink:0 }}>{['I','II','III','IV','V'][row.rank-1]}</div>
          {/* Col 2 — name + tier badge */}
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.text, letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ko ? row.nameKo : row.nameEn}</div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:row.tier==='PATRON'?T.gold:T.goldDim, border:`1px solid ${row.tier==='PATRON'?T.goldBorder:T.border}`, padding:'1px 5px', display:'inline-block', marginTop:2, letterSpacing:'0.12em' }}>{ko ? row.tierKo : row.tier}</div>
          </div>
          {/* Col 3 — GMV in M, fixed 72px */}
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, fontWeight:600, textAlign:'right' }}>₩{Math.round(row.gmv * krwRate / 1000000)}M</div>
          {/* Col 4 — discount %, fixed 52px */}
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.green, fontWeight:700, textAlign:'right' }}>−{GATES[row.gate-1].discount}%</div>
        </div>
      ))}
      {/* YOU row — same grid, gold highlight strip */}
      <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 72px 52px', gap:8, alignItems:'center', padding:'7px 10px', marginTop:4, background:`linear-gradient(90deg,rgba(197,165,114,0.08),transparent)`, borderLeft:`2px solid ${T.gold}`, marginLeft:-18, paddingLeft:20 }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold, textAlign:'center' }}>#{USER.rank}</div>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>YOU · {USER.name}</div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, fontWeight:600, textAlign:'right' }}>₩{Math.round(USER.gmv * krwRate / 1000000)}M</div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted, textAlign:'right' }}>−1.5%</div>
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
  // B2-20: currency-aware formatter — KRW in Korean, USD in English
  const showKRW = ko;
  const fVal = (krwAmount) => showKRW
    ? `₩${Math.round(krwAmount).toLocaleString('ko-KR')}`
    : `$${Math.round(krwAmount / krwRate).toLocaleString('en-US')}`;

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
            <div style={{ fontFamily:T.mono, fontSize:26, fontWeight:700, color:T.text, marginBottom:14 }}>{fVal(item.value)}</div>
            <input type="range" min="0" max="5000000" step="100000" value={item.value} style={{ '--pct':`${(item.value/5000000*100).toFixed(1)}%` }} onChange={e=>item.set(+e.target.value)} />
            {/* FIX 21: fontSize:11 → 13 */}
            <div style={{ fontFamily:T.sans, fontSize:13, color:T.textMuted, marginTop:6 }}>{item.hint}</div>
          </div>
        ))}
      </div>
      <div style={{ background:T.bg2, border:`1px solid ${T.goldBorder}`, padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:14, marginBottom:16 }}>
          {[
            { label: ko ? '연간 총 GMV' : 'Annual Total GMV', value:fVal(total*krwRate), sub:showKRW?`≈ ${fmtUSD(total)}`:`≈ ₩${Math.round(total*krwRate).toLocaleString('ko-KR')}` },
            { label: ko ? '현재 게이트' : 'Current Gate', value:gate?`Level ${gate.num}`:(ko?'미달':'None'), sub:gate?(ko?gate.label:gate.labelEn):(ko?'₩7.2M 부터':'From ₩7.2M') },
            { label:'Founder Savings', value:gate?`−${gate.discount}%`:'−', sub: '', hl:true },
            { label: ko ? '연간 절약 (추정)' : 'Annual Savings (est.)', value:gate?fVal(savings * krwRate):'−', sub: ko ? '프리미엄 기준' : 'vs listed price' },
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
              <span style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{ko ? `다음 게이트: Level ${next.num} · ${next.label} (−${next.discount}%)` : `Next gate: Level ${next.num} · ${next.labelEn} (−${next.discount}%)`}</span>
              <span style={{ fontFamily:T.mono, fontSize:11, color:T.gold }}>{fVal((next.gmv-total) * krwRate)} {ko ? '남음' : 'to go'}</span>
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
  const [monthly, setMonthly] = useState(1000000);  // BUG FIX #7: no longer hardcoded
  const gate = GATES[ag];
  const SPOT = prices.gold;
  const gPerG = SPOT * krwRate / 31.1035;
  const koreaPrice  = SPOT * 1.20;
  const aurumBase   = SPOT * 1.08;
  const withSavings = aurumBase * (1 - gate.discount / 100);
  const savedVsKorea = koreaPrice - withSavings;
  const gramsBase   = monthly / (gPerG * 1.08);
  const gramsWithS  = monthly / (gPerG * 1.08 * (1 - gate.discount / 100));
  const bonusG      = gramsWithS - gramsBase;

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>
      {/* BUG FIX #7: monthly slider */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.goldDim, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:8 }}>{ko ? '월 구매액' : 'Monthly'}</div>
        <div style={{ fontFamily:T.mono, fontSize:20, fontWeight:700, color:T.text, marginBottom:10 }}>₩{Math.round(monthly/10000).toLocaleString()}만원</div>
        <input type="range" min="200000" max="5000000" step="100000" value={monthly}
          style={{ width:'100%', accentColor:T.gold }} onChange={e=>setMonthly(+e.target.value)} />
      </div>
      <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:`1px solid ${T.border}` }}>
        {GATES.map((g,i)=>(
          <button key={i} onClick={()=>setAg(i)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'9px 4px', fontFamily:T.mono, fontSize:isMobile?11:13, color:ag===i?T.gold:T.textMuted, borderBottom:ag===i?`2px solid ${T.gold}`:'2px solid transparent', transition:'all 0.2s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {g.num}
          </button>
        ))}
      </div>
      {/* FIX 18: alignItems:'stretch' on grid */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:14, alignItems:'stretch' }}>
        {/* FIX 18: display:flex flexDirection:column on Physical card */}
        <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>{ko ? '실물 매수 · Physical' : 'Physical Purchase'}</div>
          {[
            { label: ko ? 'exgold 매도가 (VAT 포함)' : 'Korean retail (VAT incl.)',         value:`₩${Math.round(koreaPrice*krwRate/31.1035).toLocaleString('ko-KR')}`, color:'#888' },
            { label: ko ? 'Aurum 기본가 (프리미엄 +8%)' : 'Aurum base price (+8%)',          value:`₩${Math.round(aurumBase*krwRate/31.1035).toLocaleString('ko-KR')}`, color:T.textSub },
            { label:`Level ${gate.num} ${ko ? `적용가 (−${gate.discount}%)` : `price (−${gate.discount}%)`}`, value:`₩${Math.round(withSavings*krwRate/31.1035).toLocaleString('ko-KR')}`, color:T.goldBright, hl:true },
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
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>{ko ? 'AGP 월적립 · Savings Plan' : 'AGP Monthly Plan'}</div>
          <div style={{ fontFamily:T.sans, fontSize:10, color:T.textMuted, marginBottom:12 }}>{ko ? `기준: 월 ₩${Math.round(monthly/10000).toLocaleString()}만원 AGP 적립 시` : `Based on ₩${Math.round(monthly/10000).toLocaleString()}만/month AGP`}</div>
          {[
            { label: ko ? '할인 없이 받는 그램' : 'Grams without discount', value:`${gramsBase.toFixed(3)}g`, color:T.textSub },
            { label:`Level ${gate.num} ${ko ? `적용 그램 (−${gate.discount}%)` : `grams (−${gate.discount}%)`}`, value:`${gramsWithS.toFixed(3)}g`, color:T.goldBright, hl:true },
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
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>, label: ko ? '내 실물 매수' : 'My Physical', desc: ko ? '금·은 바, 코인 직접 구매액' : 'Direct gold & silver purchases' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, label: ko ? '내 AGP 적립액' : 'My AGP', desc: ko ? '월간 자동이체 누적 총액' : 'Monthly auto-debit cumulative total' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, label: ko ? '추천 실물 GMV' : 'Referral Physical', desc: ko ? '초대한 친구의 실물 매수액' : 'Friends\' physical purchase amounts' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a572" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: ko ? '추천 AGP GMV' : 'Referral AGP', desc: ko ? '초대한 친구의 AGP 월 약정 합산' : 'Friends\' AGP monthly commitments' },
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
            fontSize:item==='+'?(isMobile?36:42):item==='='?(isMobile?22:28):item==='Total GMV'?(isMobile?13:16):(isMobile?12:14),
            lineHeight:1,
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
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'Your Sigil · 초대 링크' : 'Your Sigil · Invite Link'}</div>
        <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(20px,3vw,32px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
          {ko ? <>친구를 초대할수록 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>더 빨리 문이 열립니다</span></> : <>The more friends you invite, <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>the faster the gates open</span></>}
        </h2>
        <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.9 }}>{ko ? '친구의 첫 결제가 정산되면 그 금액이 내 GMV에 합산됩니다.' : "Once a friend's first payment clears, their amount adds to your GMV."}</p>
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

// ─── Level Cards ───────────────────────────────────────────────────────────────
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
            {done && <div style={{ position:'absolute', top:10, right:10, fontFamily:T.mono, fontSize:10, color:T.bg, background:T.green, padding:'3px 7px', letterSpacing:'0.12em' }}>{ko?'UNLOCKED':'UNLOCKED'}</div>}
            {cur && !done && <div style={{ position:'absolute', top:10, right:10, fontFamily:T.mono, fontSize:10, color:T.gold, border:`1px solid ${T.goldBorder}`, padding:'3px 7px', letterSpacing:'0.12em' }}>NEXT</div>}
            <div style={{ width:44, height:44, borderRadius:'50%', margin:'0 auto 14px', background:done?T.gold:T.bg2, border:`2px solid ${done?T.gold:cur?T.gold:T.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:done?T.bg:cur?T.gold:T.goldDim, boxShadow:done?'0 0 16px rgba(197,165,114,0.5)':cur?'0 0 0 4px rgba(197,165,114,0.12),0 0 20px rgba(197,165,114,0.5)':'none', animation:cur&&!done?'pulseRing 2s ease-in-out infinite':'none' }}>{gate.num}</div>
            <div style={{ fontFamily:T.mono, fontSize:11, color:gate.apex?T.gold:T.goldDim, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>{gate.apex?'— APEX —':`— GATE ${gate.num} —`}</div>
            <div style={{ fontFamily:T.mono, fontSize:18, fontWeight:700, color:done?T.goldBright:T.gold, marginBottom:3 }}>₩{Math.round(gate.gmv * krwRate / 1000000).toFixed(0)}M</div>
            <div style={{ fontFamily:T.sansKr, fontSize:11, color:T.textMuted, marginBottom:14 }}>≈ {gate.gmvKR} GMV</div>
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
              <div style={{ fontFamily:T.mono, fontSize:12, color:T.goldDim, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:5 }}>Founder Savings</div>
              <div style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, color:done?T.goldBright:T.gold }}>−{gate.discount}%</div>
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
  const userLevel = USER.gate - 1;
  const userGate  = userLevel;
  const pad = isMobile ? '48px 20px' : '80px 60px';

  return (
    <div style={{ background:T.bg }}>

      {/* ══ HERO ══ */}
      <div style={{ padding:isMobile?'60px 20px 50px':'80px 80px 70px', background:`radial-gradient(ellipse at 80% 20%,rgba(197,165,114,0.10),transparent 55%),linear-gradient(180deg,${T.bg} 0%,${T.bg2} 100%)`, borderBottom:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?80:260, fontWeight:600, letterSpacing:'0.04em', color:'rgba(197,165,114,0.015)', pointerEvents:'none', whiteSpace:'nowrap', userSelect:'none', zIndex:0 }}>FOUNDERS</div>

        {/* FIX 11: alignItems:'start' → 'stretch' */}
        <div style={{ maxWidth:1340, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'minmax(0,1.15fr) minmax(0,0.55fr) minmax(0,0.55fr)', gap:isMobile?40:40, alignItems:'stretch', position:'relative', zIndex:1 }}>

          {/* Col 1 — Hero text */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'nowrap', overflow:'hidden' }}>
              <div style={{ width:32, height:1, background:T.gold, flexShrink:0 }} />
              <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:isMobile?11:13, color:T.gold, letterSpacing:'0.04em' }}>Founders Club</span>
              <span style={{ color:T.goldDim }}>·</span>
              <span style={{ fontFamily:T.mono, fontSize:isMobile?10:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase' }}>파운더스 클럽</span>
              {!isMobile && <div style={{ width:32, height:1, background:T.gold, flexShrink:0 }} />}
            </div>
            <h1 style={{ fontFamily:ko?T.serifKrDisplay:T.serifKr, fontWeight:500, fontSize:isMobile?28:54, lineHeight:1.1, color:T.text, margin:'0 0 18px', letterSpacing:'-0.01em', wordBreak:'keep-all' }}>
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
              <button onClick={()=>navigate('register')} style={{ flex:1, background:T.gold, border:'none', color:'#0a0a0a', padding:'14px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
                {ko ? '파운더스 클럽 가입 →' : 'Join Founders Club →'}
              </button>
              <button onClick={()=>navigate('shop')} style={{ flex:1, background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding:'14px 24px', fontSize:14, cursor:'pointer', fontFamily:T.sans }}>
                {ko ? '실물 구매로 GMV 쌓기' : 'Build GMV with Physical'}
              </button>
            </div>
          </div>

          {/* FIX 14: removed !isMobile guard — widgets now show on mobile too */}
          <GateProgressWidget userGate={userGate} userGMV={USER.gmv} krwRate={krwRate} lang={lang} />
          <LeaderboardWidget krwRate={krwRate} lang={lang} />
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
              {ko ? <>4가지 원칙 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold, fontWeight:400 }}>— 간단하고 공정합니다</span></> : <>4 Principles <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold, fontWeight:400 }}>— simple and fair</span></>}
            </h2>
          </div>
          {/* FIX 16: alignItems:'stretch' on grid */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:24, alignItems:'stretch' }}>
            {[
              { n:'I',   t: ko?'실제 GMV만 카운트':'Real GMV Only',      d: ko?'친구가 KYC를 통과하고 첫 결제가 정산되어야 GMV에 반영됩니다. 가짜 가입은 자동 차단.':'A friend must pass KYC and have their first payment settled before GMV is credited. Fake signups are auto-blocked.' },
              { n:'II',  t: ko?'한 번 열리면, 평생':'Once Unlocked, Forever', d: ko?'통과한 게이트의 Founder Savings는 회수되지 않습니다. 모든 미래 구매에 영구 적용.':'Founder Savings from passed gates are never revoked. Permanently applied to all future purchases.' },
              { n:'III', t: ko?'정점은 −3.0%':'Apex is −3.0%',            d: ko?'Level V를 넘는 추가 할인은 없습니다. 그러나 친구 초대는 언제나 환영합니다.':'No additional discount beyond Level V. But friend invitations are always welcome.' },
              { n:'IV',  t: ko?'익명 기본 보호':'Anonymous by Default',    d: ko?'리더보드는 이니셜 + ID 기본 표시. 본인 동의 시 실명 공개 가능. 통계는 비공개.':'Leaderboard shows initials + ID by default. Full name visible only with your consent. Statistics are private.' },
            // FIX 16: display:flex flexDirection:column on each card
            ].map((r,i)=>(
              <div key={i} style={{ paddingTop:20, borderTop:`1px solid ${T.goldBorderStrong}`, display:'flex', flexDirection:'column' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${T.goldBorderStrong}`, background:T.goldGlow, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, fontFamily:T.mono, fontSize:15, fontWeight:700, color:T.gold, boxShadow:`0 0 12px rgba(197,165,114,0.15)` }}>{i+1}</div>
                <div style={{ fontFamily:T.sansKr, fontSize:15, fontWeight:600, color:T.text, marginBottom:8 }}>{r.t}</div>
                {/* FIX 16: flex:1 on description so all cards same height */}
                <div style={{ fontFamily:T.sansKr, fontSize:12, color:T.textSub, lineHeight:1.9, flex:1 }}>{r.d}</div>
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
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'The Five Gates · 다섯 개의 문' : 'The Five Gates'}</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(24px,3.5vw,40px)', fontWeight:500, color:T.text, marginBottom:12, lineHeight:1.2 }}>
              {ko ? <>문을 통과할수록 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>가격이 낮아집니다</span></> : <>Each gate you pass <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>lowers your price</span></>}
            </h2>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.9, maxWidth:520, margin:'0 auto' }}>
              {ko ? '게이트는 한 번 열리면 닫히지 않습니다. 실물 매수·AGP 적립·추천 GMV 모든 거래에 평생 자동 적용.' : 'Gates never close once opened. Automatically applied lifetime to all physical purchases, AGP savings, and referral GMV.'}
            </p>
          </div>
          <GateCards userGate={userGate} krwRate={krwRate} lang={lang} />
        </div>
      </div>

      {/* ── Dual Savings + GMV Calculator ── */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{ko ? 'Dual Benefit · 이중 혜택' : 'Dual Benefit'}</div>
          <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,3vw,36px)', fontWeight:500, color:T.text, marginBottom:10, lineHeight:1.2 }}>
            {ko ? <>실물과 AGP, <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>모두 더 싸집니다</span></> : <>Physical and AGP — <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>both get cheaper</span></>}
          </h2>
          <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, maxWidth:480, margin:'0 auto', lineHeight:1.9 }}>{ko ? '게이트별 절약액을 직접 확인하세요.' : 'See your savings at each gate level.'}</p>
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

      {/* ── Join CTA — permanent, no urgency copy ── */}
      <div style={{ padding:isMobile?'56px 20px':'80px 60px', background:T.bg1, borderTop:`1px solid ${T.goldBorder}`, textAlign:'center' }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>
          {ko ? 'Founders Club 가입' : 'Join Founders Club'}
        </div>
        <h2 style={{ fontFamily:T.serifKr, fontSize:'clamp(22px,2.5vw,32px)', fontWeight:300, color:T.text, marginBottom:12 }}>
          {ko ? <>지금 가입하면 <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>첫날부터 게이트가 시작됩니다</span></> : <>Your gates start <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.gold }}>from day one</span></>}
        </h2>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop:24 }}>
          <button onClick={()=>navigate('register')} style={{ background:T.gold, border:'none', color:'#0a0a0a', padding:'14px 32px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
            {ko ? '가입하기 →' : 'Register →'}
          </button>
          <button onClick={()=>navigate('founders-promo')} style={{ background:'transparent', border:`1px solid ${T.goldBorder}`, color:T.textSub, padding:'14px 28px', fontSize:14, cursor:'pointer', fontFamily:T.sans }}>
            {ko ? '한정 멤버십 안내' : 'Limited membership info'}
          </button>
        </div>
      </div>

      {/* T&C */}
      <div style={{ background:T.bg2, borderTop:`1px solid ${T.goldBorder}` }}>
        <div className="aurum-container" style={{ paddingTop:32, paddingBottom:32 }}>
        <p style={{ fontFamily:T.sansKr, fontSize:11, color:T.textMuted, lineHeight:1.85, maxWidth:880, margin:'0 auto', textAlign:'center' }}>
          ※ Founders Club는 Aurum Pte. Ltd.의 GMV 기반 멤버십 프로그램입니다. Founder Savings는 Aurum Listed Price 기준으로 적용되며 실제 조건은 출시 시점의 공식 약관을 따릅니다. GMV 산정은 정산 완료된 거래만을 대상으로 합니다. 모든 투자에는 원금 손실 가능성이 있습니다.
        </p>
        </div>
      </div>

      {toastMsg && <div className="toast-container"><div className="toast-item">{toastMsg}</div></div>}
    </div>
  );
}
