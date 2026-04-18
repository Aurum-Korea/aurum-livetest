// MarketRatios.jsx — Gold/Silver ratio, Gold/Dow ratio, CB holdings, real estate comparison
// Positioned on Why Gold page and homepage for conversion
import { useState, useEffect, useRef } from 'react';
import { T, useIsMobile, fKRW } from '../lib/index.jsx';

const MONO = T.mono;
const SANS = T.sans;
const SERIF = T.serif;

// Static reference data (updated periodically)
const CB_HOLDINGS = [
  { country:'미국 (US)',      flag:'🇺🇸', tonnes:8133,  pct:68 },
  { country:'독일 (DE)',      flag:'🇩🇪', tonnes:3352,  pct:68 },
  { country:'이탈리아 (IT)', flag:'🇮🇹', tonnes:2452,  pct:65 },
  { country:'중국 (CN)',      flag:'🇨🇳', tonnes:2262,  pct:4  },
  { country:'한국 (KR)',      flag:'🇰🇷', tonnes:104,   pct:1  },
  { country:'개인 투자자',    flag:'👤',  tonnes:null,  pct:null, isUser:true },
];

function MiniBarChart({ data, label, color }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div>
      <div style={{ fontFamily:MONO, fontSize:9, color:T.goldDim, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
            <span style={{ fontFamily:SANS, fontSize:11, color:T.textSub }}>{d.label}</span>
            <span style={{ fontFamily:MONO, fontSize:11, color:color, fontWeight:600 }}>{d.display}</span>
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.05)', position:'relative' }}>
            <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${(d.value/max)*100}%`, background:color, opacity:0.7 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketRatios({ prices, krwRate, lang }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [activeTab, setActiveTab] = useState(0);

  const gold  = prices?.gold   || 3342;
  const silver= prices?.silver || 32.9;
  const dow   = 38500; // reference (Dow Jones approximate)
  const gsRatio  = (gold / silver).toFixed(1);
  const gdRatio  = (dow / gold).toFixed(2);
  const goldKRW  = Math.round(gold * (krwRate || 1440));
  const seoulApt = 1200000000; // avg Seoul apt ~₩1.2B
  const ozForApt = (seoulApt / goldKRW).toFixed(1);

  const tabs = [
    { label: ko?'금/은 비율':'Gold/Silver',  key:'gs'  },
    { label: ko?'금/다우 비율':'Gold/Dow',   key:'gd'  },
    { label: ko?'중앙은행 보유':'CB Holdings', key:'cb' },
    { label: ko?'부동산 vs 금':'Real Estate', key:'re'  },
  ];

  const goldHistGS  = [80,85,92,88,76,68,72,79,84,87,Number(gsRatio)];
  const goldHistGD  = [8.2,7.8,7.1,6.8,7.4,7.9,8.1,8.4,7.6,Number(gdRatio)+1.2,Number(gdRatio)];

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.goldBorder}` }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, overflowX:'auto' }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex:isMobile?'none':1, whiteSpace:'nowrap', background:'none', border:'none', padding: isMobile?'10px 14px':'11px 16px', fontFamily:MONO, fontSize:isMobile?9:10, letterSpacing:'0.1em', textTransform:'uppercase', color:activeTab===i?T.gold:T.textMuted, borderBottom:activeTab===i?`2px solid ${T.gold}`:'2px solid transparent', cursor:'pointer', transition:'color 0.2s', marginBottom:-1 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: isMobile?16:24 }}>

        {/* Gold/Silver Ratio */}
        {activeTab === 0 && (
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:8 }}>
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:isMobile?40:52, color:T.gold, lineHeight:1 }}>{gsRatio}</div>
              <div>
                <div style={{ fontFamily:MONO, fontSize:11, color:T.textMuted }}>oz gold / oz silver</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:Number(gsRatio) > 80 ? '#4ade80' : T.textSub }}>
                  {Number(gsRatio) > 80 ? (ko?'은이 역사적 저평가':'Silver historically undervalued') : (ko?'정상 범위':'Normal range')}
                </div>
              </div>
            </div>
            {/* Mini sparkline */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:48, marginBottom:12 }}>
              {goldHistGS.map((v, i) => {
                const h = ((v-60)/(100-60))*100;
                const isLast = i === goldHistGS.length-1;
                return <div key={i} style={{ flex:1, background:isLast?T.gold:'rgba(197,165,114,0.25)', height:`${h}%`, transition:'height 0.3s' }} />;
              })}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
              {[{label:ko?'20년 평균':'20yr avg',val:'68x'},{label:ko?'현재':'Now',val:`${gsRatio}x`,gold:true},{label:ko?'역대 최고':'ATH',val:'126x'}].map((s,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, padding:'10px', textAlign:'center' }}>
                  <div style={{ fontFamily:MONO, fontSize:9, color:T.textMuted, marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontFamily:MONO, fontSize:16, color:s.gold?T.gold:T.textSub, fontWeight:600 }}>{s.val}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:SANS, fontSize:12, color:T.textSub, lineHeight:1.7 }}>
              {ko ? `현재 금/은 비율(${gsRatio})이 역사 평균(68x)보다 높습니다. 이는 은이 상대적으로 저평가되어 있음을 시사합니다.` : `Current ratio (${gsRatio}) exceeds the historical mean (68x), suggesting silver is relatively undervalued.`}
            </p>
          </div>
        )}

        {/* Gold/Dow Ratio */}
        {activeTab === 1 && (
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:8 }}>
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:isMobile?40:52, color:T.gold, lineHeight:1 }}>{gdRatio}</div>
              <div>
                <div style={{ fontFamily:MONO, fontSize:11, color:T.textMuted }}>Dow Jones / oz gold</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:T.textSub }}>{ko?'주식 대비 금의 가치':'Value of gold vs equities'}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:48, marginBottom:12 }}>
              {goldHistGD.map((v, i) => {
                const h = ((v-5)/(12-5))*100;
                const isLast = i === goldHistGD.length-1;
                return <div key={i} style={{ flex:1, background:isLast?T.gold:'rgba(197,165,114,0.25)', height:`${Math.max(h,5)}%` }} />;
              })}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
              {[{label:'Dow (ref)',val:dow.toLocaleString()},{label:ko?'금 가격':'Gold',val:`$${gold.toFixed(0)}`,gold:true},{label:ko?'비율':'Ratio',val:`${gdRatio}x`,gold:true}].map((s,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, padding:'10px', textAlign:'center' }}>
                  <div style={{ fontFamily:MONO, fontSize:9, color:T.textMuted, marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontFamily:MONO, fontSize:isMobile?12:15, color:s.gold?T.gold:T.textSub, fontWeight:600 }}>{s.val}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:SANS, fontSize:12, color:T.textSub, lineHeight:1.7 }}>
              {ko ? '2000년 고점 때 이 비율은 1x에 불과했습니다. 비율이 낮을수록 금이 주식 대비 강세입니다.' : 'At the 2000 peak this ratio was near 1x. A lower ratio signals gold strength relative to equities.'}
            </p>
          </div>
        )}

        {/* Central Bank Holdings */}
        {activeTab === 2 && (
          <div>
            <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>
              {ko?'중앙은행 금 보유량 (2026)':'Central Bank Gold Holdings (2026)'}
            </div>
            {CB_HOLDINGS.map((cb, i) => {
              const maxT = 8133;
              const pct  = cb.tonnes ? Math.round((cb.tonnes/maxT)*100) : null;
              return (
                <div key={i} style={{ marginBottom:10, padding: cb.isUser?'10px 12px':'0', background:cb.isUser?'rgba(74,222,128,0.05)':'transparent', border:cb.isUser?'1px solid rgba(74,222,128,0.2)':'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:cb.isUser?0:3, alignItems:'center' }}>
                    <span style={{ fontFamily:SANS, fontSize:12, color:cb.isUser?'#4ade80':T.textSub }}>{cb.flag} {cb.country}</span>
                    <span style={{ fontFamily:MONO, fontSize:11, color:cb.isUser?'#4ade80':T.gold }}>
                      {cb.isUser ? (ko?'Aurum으로 지금 시작':'Start with Aurum now') : `${cb.tonnes?.toLocaleString()}t`}
                    </span>
                  </div>
                  {!cb.isUser && (
                    <div style={{ height:3, background:'rgba(255,255,255,0.05)' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:T.gold, opacity:0.6 }} />
                    </div>
                  )}
                </div>
              );
            })}
            <p style={{ fontFamily:SANS, fontSize:11, color:T.textMuted, lineHeight:1.6, marginTop:12 }}>
              {ko ? '2023년 이후 중앙은행들은 역대 최대 규모로 금을 매입하고 있습니다. 220톤 (2025 Q3, +28% QoQ).' : 'Central banks have been buying gold at record pace since 2023. 220t in Q3 2025 (+28% QoQ).'}
            </p>
          </div>
        )}

        {/* Real Estate vs Gold */}
        {activeTab === 3 && (
          <div>
            <div style={{ fontFamily:MONO, fontSize:10, color:T.goldDim, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>
              {ko?'서울 아파트 vs 금':'Seoul Apartment vs Gold'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:isMobile?'14px 12px':'18px 16px', textAlign:'center' }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:'#f87171', letterSpacing:'0.12em', marginBottom:6 }}>{ko?'서울 평균 아파트':'Seoul Avg. Apt'}</div>
                <div style={{ fontFamily:MONO, fontSize:isMobile?16:20, color:'#f87171', fontWeight:700 }}>₩1.2B</div>
                <div style={{ fontFamily:SANS, fontSize:10, color:T.textMuted, marginTop:4 }}>{ko?'취득세·중개수수료 포함':'incl. acquisition tax'}</div>
              </div>
              <div style={{ background:T.goldGlow, border:`1px solid ${T.goldBorder}`, padding:isMobile?'14px 12px':'18px 16px', textAlign:'center' }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:T.gold, letterSpacing:'0.12em', marginBottom:6 }}>{ko?'동일 가치 금':'Same Value in Gold'}</div>
                <div style={{ fontFamily:MONO, fontSize:isMobile?16:20, color:T.gold, fontWeight:700 }}>{ozForApt}oz</div>
                <div style={{ fontFamily:SANS, fontSize:10, color:T.textSub, marginTop:4 }}>{ko?`≈ ${Math.round(Number(ozForApt)*31.1)}g · Malca-Amit`:`≈ ${Math.round(Number(ozForApt)*31.1)}g in Singapore`}</div>
              </div>
            </div>
            <MiniBarChart
              label={ko?'10년 수익률 비교 (KRW)':'10yr Return Comparison (KRW)'}
              color={T.gold}
              data={[
                {label:ko?'서울 아파트':'Seoul Apt', value:180, display:'+180%'},
                {label:ko?'금 (KRW 기준)':'Gold (KRW)', value:394, display:'+394%'},
                {label:ko?'코스피 (KOSPI)':'KOSPI', value:45,  display:'+45%'},
                {label:ko?'예금 금리':'Bank Deposit', value:25, display:'+25%'},
              ]}
            />
            <p style={{ fontFamily:SANS, fontSize:11, color:T.textMuted, lineHeight:1.6, marginTop:12 }}>
              {ko ? '취득세 10%, 보유세, 중개수수료, 공실 위험 없음. Aurum에서는 어제와 같은 가격으로 내일도 팔 수 있습니다.' : 'No acquisition tax (10%), holding tax, agency fees, or vacancy risk. Same-day liquidity at international spot.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
