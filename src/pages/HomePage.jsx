import { useState } from 'react';
import { T, useIsMobile, fUSD, fKRW, KR_GOLD_PREMIUM, KR_SILVER_PREMIUM, AURUM_GOLD_PREMIUM, AURUM_SILVER_PREMIUM } from '../lib/index.jsx';
import { Badge, StatBar, Tabs, Accordion, SectionHead } from '../components/UI.jsx';

function CampaignBanner({ navigate }) {
  const isMobile = useIsMobile();
  const panels = [
    { route:'campaign-founders',   badge:'파운더스 클럽 · FOUNDERS CLUB', headline:'더 많이 구매할수록', sub:'더 싸게 — 영원히.', desc:'GMV 5개 게이트 통과 시 Aurum Listed Price 자동 차감 · 최대 −3.0% · 평생', cta:'클럽 가입하기 →', gold:true },
    { route:'campaign-agp-launch', badge:'AGP 론치 이벤트 · LAUNCH EVENT', headline:'시작하는 날', sub:'금을 더 드립니다.', desc:'브론즈 ₩50,000 → 소브린 ₩5,000,000 · 5단계 실물 금 기프트 · 첫 결제 즉시', cta:'사전예약 →', gold:false },
  ];
  return (
    <div style={{ background:'linear-gradient(135deg,#0e0b06 0%,#141008 50%,#0e0b06 100%)', borderBottom:`1px solid ${T.goldBorder}`, position:'relative', overflow:'hidden' }}>
      <div style={{ height:2, background:`linear-gradient(90deg,transparent,${T.gold},${T.goldBright},${T.gold},transparent)` }} />
      <div style={{ maxWidth:1380, margin:'0 auto', padding: isMobile?'0 16px':'0 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:0 }}>
          {panels.map((p,i)=>(
            <div key={i} onClick={()=>navigate(p.route)} style={{ padding: isMobile?'22px 0':'24px 32px', borderRight: !isMobile&&i===0?`1px solid ${T.goldBorder}`:'none', borderBottom: isMobile&&i===0?`1px solid ${T.border}`:'none', display:'flex', alignItems:'center', gap:16, cursor:'pointer', transition:'background 0.2s', paddingLeft: !isMobile&&i===1?40:undefined }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(197,165,114,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:T.mono, fontSize:8, color:T.gold, letterSpacing:'0.28em', textTransform:'uppercase', marginBottom:6 }}>{p.badge}</div>
                <div style={{ fontFamily:T.serifKr, fontSize: isMobile?17:21, color:T.text, lineHeight:1.2, fontWeight:500 }}>
                  {p.headline} <span style={{ color:T.gold, fontFamily:T.serif, fontStyle:'italic' }}>{p.sub}</span>
                </div>
                <div style={{ fontFamily:T.sansKr, fontSize:11, color:T.textSub, marginTop:5, lineHeight:1.6 }}>{p.desc}</div>
              </div>
              <button style={{ background:p.gold?T.gold:'transparent', border:p.gold?'none':`1px solid ${T.goldBorder}`, color:p.gold?'#0a0a0a':T.gold, padding:'10px 18px', fontFamily:T.sans, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>{p.cta}</button>
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${T.border}`, padding:'9px 0', display:'flex', gap:24, flexWrap:'wrap', overflow:'hidden', alignItems:'center' }}>
          {["🇸🇬 Singapore FTZ","🛡️ Lloyd's of London","✅ LBMA","🔒 PSPM Act 2019","📊 100% Backing"].map((t,i)=>(
            <span key={i} style={{ fontFamily:T.mono, fontSize:9, color:'#444', letterSpacing:'0.1em', flexShrink:0 }}>{t}</span>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <span className="live-dot" />
            <span style={{ fontFamily:T.mono, fontSize:9, color:T.gold, letterSpacing:'0.15em' }}>FOUNDING SEASON OPEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavingsPanel({ prices, krwRate, currency }) {
  const fP = usd => currency==='KRW'?fKRW(usd*krwRate):fUSD(usd);
  const KG = 1000/31.1035;
  const goldKR=prices.gold*krwRate*(1+KR_GOLD_PREMIUM), goldAU=prices.gold*(1+AURUM_GOLD_PREMIUM);
  const goldSave=goldKR-goldAU*krwRate, goldPct=(goldSave/goldKR*100).toFixed(1);
  const silvKR=(prices.silver||32.9)*KG*krwRate*(1+KR_SILVER_PREMIUM), silvAU=(prices.silver||32.9)*KG*(1+AURUM_SILVER_PREMIUM);
  const silvSave=silvKR-silvAU*krwRate, silvPct=(silvSave/silvKR*100).toFixed(1);

  const row = (label, value, color) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:`1px dashed ${T.border}` }}>
      <span style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{label}</span>
      <span style={{ fontFamily:T.mono, fontSize:20, color, fontWeight:600 }}>{value}</span>
    </div>
  );
  const saveBox = (val, pct) => (
    <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', padding:'16px 20px', marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontFamily:T.sans, fontSize:14, color:T.text, fontWeight:600 }}>절약 금액</span>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontFamily:T.mono, fontSize:24, color:T.green, fontWeight:700 }}>{val}</div>
        <div style={{ fontFamily:T.mono, fontSize:12, color:T.textMuted }}>{pct}% 절약</div>
      </div>
    </div>
  );

  return (
    <Tabs tabs={['🥇 금 Gold (1 oz)','🥈 은 Silver (1 kg)']}>
      {[
        <div key="g">
          <div style={{ background:T.bg, border:`1px solid ${T.border}`, padding:'28px' }}>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted, letterSpacing:'0.15em', marginBottom:20, textTransform:'uppercase' }}>금 1 oz 구매 시 절약</div>
            {row('한국금거래소 (KRX, 부가세 포함)', fKRW(goldKR), T.red)}
            {row('Aurum 실물가', fP(goldAU), T.green)}
            {saveBox(fKRW(goldSave), goldPct)}
          </div>
          <p style={{ marginTop:10, fontSize:11, color:T.textMuted, fontFamily:T.sans, lineHeight:1.6 }}>* 실시간 국제 현물가 기준. KRX 부가세(10%) 포함. Aurum 프리미엄 +{(AURUM_GOLD_PREMIUM*100).toFixed(0)}%.</p>
        </div>,
        <div key="s">
          <div style={{ background:T.bg, border:`1px solid ${T.border}`, padding:'28px' }}>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted, letterSpacing:'0.15em', marginBottom:20, textTransform:'uppercase' }}>은 1 kg 구매 시 절약</div>
            {row('국내 은행 은 (부가세 포함)', fKRW(silvKR), T.red)}
            {row('Aurum 실물가', fP(silvAU), T.green)}
            {saveBox(fKRW(silvSave), silvPct)}
          </div>
          <p style={{ marginTop:10, fontSize:11, color:T.textMuted, fontFamily:T.sans, lineHeight:1.6 }}>* 실시간 현물가 기준. Aurum 프리미엄 +{(AURUM_SILVER_PREMIUM*100).toFixed(0)}%.</p>
        </div>,
      ]}
    </Tabs>
  );
}

function ShopCard({ icon, badge, title, desc, bullets, cta, onClick, featured }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} className="magnetic-card"
      style={{ background:featured?T.goldGlow:T.bg, border:`1px solid ${featured||hov?T.goldBorderStrong:T.border}`, padding:'36px 32px', cursor:'pointer', display:'flex', flexDirection:'column', position:'relative' }}>
      {featured&&<div style={{ position:'absolute', top:20, right:20 }}><Badge>추천</Badge></div>}
      <div style={{ width:64, height:64, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontSize:18, color:T.gold, marginBottom:24 }}>{icon}</div>
      <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>{badge}</div>
      <h3 style={{ fontFamily:T.serifKr, fontSize:26, color:T.text, fontWeight:500, margin:'0 0 14px', lineHeight:1.2 }}>{title}</h3>
      <p style={{ fontFamily:T.sans, fontSize:14, color:T.textSub, lineHeight:1.8, marginBottom:24, flex:1 }}>{desc}</p>
      {bullets.map((b,i)=>(
        <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 0', borderBottom:i<bullets.length-1?`1px dashed ${T.border}`:'none' }}>
          <span style={{ color:T.gold, fontFamily:T.mono, fontSize:12, flexShrink:0, marginTop:2 }}>—</span>
          <span style={{ fontFamily:T.sans, fontSize:14, color:T.text, lineHeight:1.5 }}>{b}</span>
        </div>
      ))}
      <div style={{ marginTop:24, paddingTop:16, borderTop:`1px solid ${T.goldBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:T.mono, fontSize:12, letterSpacing:'0.12em', color:T.gold, textTransform:'uppercase' }}>{cta}</span>
        <span style={{ color:T.gold, transform:hov?'translateX(5px)':'none', transition:'transform 0.2s' }}>→</span>
      </div>
    </div>
  );
}

export default function HomePage({ navigate, prices, krwRate, currency, setCurrency, lang }) {
  const isMobile = useIsMobile();
  const pad = isMobile?'40px 20px':'72px 80px';

  const whyAccordion = [
    { icon:'⚖️', title:'완전 배분 보관 — 귀하의 금속, 귀하의 이름', content:'귀하의 금속은 다른 고객의 자산과 절대 섞이지 않습니다. 싱가포르 Malca-Amit FTZ 금고에 고유 일련번호와 함께 귀하의 명의로 등록됩니다. Aurum의 대차대조표와는 완전히 분리되어 있습니다.' },
    { icon:'📊', title:'국제 현물가 — 한국 프리미엄을 피하세요', content:'한국금거래소(KRX) 및 시중 은행은 국제 현물가 대비 약 15~20%의 프리미엄이 붙습니다. Aurum은 LBMA 국제 현물가 + 2.0% 투명 프리미엄으로 거래합니다. 금 1 oz 기준 수십만원 이상 절약 가능합니다.' },
    { icon:'🛡️', title:"Lloyd's of London 완전 보험", content:"모든 보유 금속은 Lloyd's of London 기관 보험으로 전액 보장됩니다. 자연재해, 절도, 분실 모두 포함. 매일 감사 리포트가 공개됩니다." },
    { icon:'✅', title:'LBMA 승인 바 & 실물 인출 옵션', content:'모든 금속은 LBMA(런던귀금속시장협회) 승인 제련소 제품입니다. 100g 이상 보유 시 언제든 실물 바로 전환 또는 KRW 정산 가능합니다.' },
    { icon:'🔍', title:'매일 공개 — 100% 백킹 증명', content:'모든 AGP 그램 및 배분 보관 금속의 100% 실물 백킹을 매일 감사 리포트로 공개합니다. 귀하의 일련번호를 직접 조회할 수 있습니다. 숨겨진 레버리지 없음.' },
  ];

  return (
    <div>
      {/* ① Campaign Banner — ABOVE FOLD, first element */}
      <CampaignBanner navigate={navigate} />

      {/* ② Hero */}
      <div style={{ minHeight:isMobile?420:500, background:`linear-gradient(145deg,${T.bg} 0%,#141008 50%,${T.bg} 100%)`, display:'flex', alignItems:'center', padding:isMobile?'60px 20px':'0 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.022, backgroundImage:'repeating-linear-gradient(0deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#c5a572 0,#c5a572 1px,transparent 1px,transparent 48px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-200, right:-100, width:700, height:700, background:'radial-gradient(ellipse,rgba(197,165,114,0.06) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:T.serif, fontSize:isMobile?100:260, fontWeight:600, color:'rgba(197,165,114,0.018)', pointerEvents:'none', whiteSpace:'nowrap', letterSpacing:'0.06em', userSelect:'none' }}>AURUM</div>
        <div style={{ maxWidth:680, position:'relative', zIndex:1 }}>
          <div className="eyebrow">배분 보관 · 국제 현물가 · 한국 투자자 전용</div>
          <h1 style={{ fontFamily:T.serifKr, fontSize:isMobile?36:58, fontWeight:500, color:T.text, lineHeight:1.1, margin:'0 0 20px', letterSpacing:'-0.005em' }}>
            <span style={{ color:T.gold }}>진짜 금. 진짜 은.</span><br />진짜 소유.
          </h1>
          <p style={{ fontFamily:T.sans, fontSize:isMobile?15:17, color:T.textSub, lineHeight:1.85, maxWidth:540, margin:'0 0 32px' }}>
            은행 통장도 아니고, KRX 계좌도 아닙니다. 싱가포르 Malca-Amit 금고에 귀하의 이름으로 등록된 실물 금속 — 국제 현물가 기준.
          </p>
          <div style={{ display:'flex', gap:12, flexDirection:isMobile?'column':'row' }}>
            <button onClick={()=>navigate('shop')} className="btn-primary" style={{ flex:1, padding:'16px 24px' }}>내 자산 배분 시작 →</button>
            <button onClick={()=>navigate('agp-intro')} className="btn-outline" style={{ flex:1, padding:'16px 24px' }}>AGP — 월 20만원 시작</button>
          </div>
          <div style={{ marginTop:18, display:'flex', gap:20, flexWrap:'wrap' }}>
            {["Lloyd's 보험",'LBMA 승인','100% 배분 보관','매일 공개 감사'].map((t,i)=>(
              <span key={i} style={{ fontFamily:T.mono, fontSize:10, color:T.goldDim, letterSpacing:'0.1em' }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ③ Trust stats bar */}
      <StatBar stats={[
        { value:'100%',    label:'배분 보관 비율' },
        { value:'+2.0%',   label:'Aurum 프리미엄 (투명 공개)' },
        { value:"Lloyd's", label:'보험사 (전액 보장)' },
        { value:'LBMA',    label:'승인 제련소' },
      ]} />

      {/* ④ Savings Comparison — FIRST content section */}
      <div style={{ padding:pad, background:T.bg1, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36, flexWrap:'wrap', gap:12 }}>
            <SectionHead badge="가격 비교" title="얼마나 절약하나요?" sub="Aurum 현물가 vs 한국금거래소 (KRX) 실시간 비교" align="left" style={{ marginBottom:0 }} />
            <button onClick={()=>setCurrency(c=>c==='KRW'?'USD':'KRW')} style={{ background:T.goldGlow, border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'6px 14px', cursor:'pointer', fontFamily:T.mono, fontSize:11, flexShrink:0 }}>
              {currency==='KRW'?'₩ / $':'$ / ₩'}
            </button>
          </div>
          <SavingsPanel prices={prices} krwRate={krwRate} currency={currency} />
        </div>
      </div>

      {/* ⑤ Paper vs Physical — comes AFTER savings */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <SectionHead badge="근본적인 차이" title={<>금을 소유하는 두 가지 방법.<br /><span style={{ color:T.gold }}>진짜는 하나입니다.</span></>} />
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16 }}>
            <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:T.red, flexShrink:0 }} />
                <span style={{ fontFamily:T.sans, fontSize:11, color:T.red, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>페이퍼 금·은</span>
              </div>
              <p style={{ fontFamily:T.serif, fontSize:18, color:T.text, marginBottom:16, fontStyle:'italic', lineHeight:1.4 }}>"귀하는 금에 대한 청구권을 보유합니다"</p>
              {['은행 금통장, KRX 계좌, 펀드','상대방 리스크 (은행 부도 시 손실)','법적 소유권 없음. 일련번호 없음.','인출 불가 또는 높은 수수료'].map((t,i)=>(
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'9px 0', borderBottom:i<3?`1px dashed ${T.border}`:'none' }}>
                  <span style={{ color:T.red, fontFamily:T.mono, fontSize:12, marginTop:2, flexShrink:0 }}>×</span>
                  <span style={{ fontFamily:T.sans, fontSize:14, color:T.textSub, lineHeight:1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:T.green, flexShrink:0 }} />
                <span style={{ fontFamily:T.sans, fontSize:11, color:T.green, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>실물 배분 금속 (Aurum)</span>
              </div>
              <p style={{ fontFamily:T.serif, fontSize:18, color:T.text, marginBottom:16, fontStyle:'italic', lineHeight:1.4 }}>"귀하가 금 <em style={{ color:T.gold }}>자체</em>를 소유합니다"</p>
              {['귀하의 이름 · 귀하의 일련번호','완전 분리 보관 — 어떤 은행과도 무관','법적 소유권은 첫날부터 귀하의 것','LBMA 바로 무료 실물 인출'].map((t,i)=>(
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'9px 0', borderBottom:i<3?`1px dashed rgba(197,165,114,0.15)`:'none' }}>
                  <span style={{ color:T.green, fontFamily:T.mono, fontSize:12, marginTop:2, flexShrink:0 }}>✓</span>
                  <span style={{ fontFamily:T.sans, fontSize:14, color:T.text, lineHeight:1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ Why Aurum accordion */}
      <div style={{ padding:pad, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <SectionHead badge="핵심 차별점" title="왜 Aurum인가?" sub="5가지 이유를 클릭해서 확인하세요." align="left" />
          <Accordion items={whyAccordion} />
        </div>
      </div>

      {/* ⑦ Shop CTAs */}
      <div style={{ padding:pad, background:T.bg1, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:980, margin:'0 auto' }}>
          <SectionHead badge="시작 방법" title="어떻게 시작하시겠습니까?" />
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16 }}>
            <ShopCard badge="일회 구매" icon="AU/AG" title="실물 금·은 매매" desc="LBMA 승인 골드·실버 바를 국제 현물가 + 2% 프리미엄으로 즉시 구매. 귀하 명의 금고에 즉시 배분." bullets={['1 oz ~ 1 kg 바 · 1/2 oz 코인','유선·카드·암호화폐 지원','100g 이상 실물 인출 무료']} cta="제품 둘러보기" onClick={()=>navigate('shop')} />
            <ShopCard badge="AGP 저축 플랜 · 추천" icon="AGP" title="Aurum 골드 플랜" desc="월 20만원부터 그램 단위 자동 적립. 토스뱅크 자동이체 · 신용카드 · 암호화폐 지원." bullets={['월 200,000원부터 시작','100g 도달 시 실물 바 무료 전환','매일 백킹 리포트 공개']} cta="AGP 시작하기" onClick={()=>navigate('agp-intro')} featured />
          </div>
        </div>
      </div>

      {/* ⑧ Trust strip */}
      <div style={{ padding:isMobile?'28px 20px':'32px 80px' }}>
        <div style={{ maxWidth:980, margin:'0 auto', display:'flex', justifyContent:'center', gap:isMobile?24:48, flexWrap:'wrap' }}>
          {[['🇸🇬','Singapore FTZ','Malca-Amit 보관'],["🛡️","Lloyd's of London",'전액 보험'],['✅','LBMA 승인','귀금속 바'],['🔒','AML/KYC 준수','싱가포르 등록'],['📊','매일 감사','백킹 리포트']].map(([icon,title,sub],i)=>(
            <div key={i} style={{ textAlign:'center', minWidth:90 }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
              <div style={{ fontFamily:T.sans, fontSize:12, color:T.text, fontWeight:500 }}>{title}</div>
              <div style={{ fontFamily:T.sans, fontSize:11, color:T.textMuted, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
