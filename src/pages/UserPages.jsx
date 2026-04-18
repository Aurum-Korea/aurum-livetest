import { useState } from 'react';
import { T, useIsMobile, fUSD, fKRW, fDateLong, AUDIT_TRAIL_INIT, MOCK_ORDERS_INIT, API } from '../lib/index.jsx';
import { Badge, FlagSG } from '../components/UI.jsx';
import PriceChart from '../components/PriceChart.jsx';

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════ */
export function DashboardPage({ lang, navigate, prices, krwRate, user, orders, holdings, toast }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [showAudit, setShowAudit] = useState(false);
  const [auditTrail] = useState(AUDIT_TRAIL_INIT);

  if (!user) return (
    <div style={{ padding:'80px 20px', textAlign:'center', background:T.bg, minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:48 }}>🔐</div>
      <h2 style={{ fontFamily:T.serifKr, fontSize:26, color:T.text, fontWeight:300 }}>{ko?'로그인이 필요합니다':'Login Required'}</h2>
      <button onClick={() => navigate('home')} className="btn-primary">{ko?'홈으로':'Go Home'}</button>
    </div>
  );

  const goldOz    = holdings.filter(h=>h.metal==='gold').reduce((s,h)=>s+h.weightOz,0);
  const silverOz  = holdings.filter(h=>h.metal==='silver').reduce((s,h)=>s+h.weightOz,0);
  const goldVal   = goldOz   * prices.gold;
  const silverVal = silverOz * prices.silver;
  const totalVal  = goldVal + silverVal;
  const totalCost = holdings.reduce((s,h)=>s+h.purchasePrice,0);
  const totalPnL  = totalVal - totalCost;
  const goldPct   = totalVal > 0 ? (goldVal/totalVal*100).toFixed(0) : 0;
  const silverPct = totalVal > 0 ? (silverVal/totalVal*100).toFixed(0) : 0;
  const curVal    = h => (h.metal==='gold' ? prices.gold : prices.silver) * h.weightOz;

  const [genCert, setGenCert] = useState(false);
  const requestCert = async () => {
    setGenCert(true);
    await API.vault.generateCertificate(user.id);
    setGenCert(false);
    toast(ko?'볼트 인증서가 이메일로 발송되었습니다.':'Vault certificate sent to your email.', 'info');
  };

  const pad = isMobile ? '20px 16px' : '40px 80px';

  return (
    <div style={{ padding:pad, background:T.bg, minHeight:'80vh' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems: isMobile?'flex-start':'center', marginBottom:24, flexDirection: isMobile?'column':'row', gap: isMobile?14:0 }}>
        <div>
          <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?26:32, color:T.text, fontWeight:300, margin:'0 0 3px' }}>{ko?'내 보유자산':'My Holdings'}</h2>
          <p style={{ fontSize:12, color:T.goldDim, margin:0, fontFamily:T.sans, display:'flex', alignItems:'center', gap:6 }}>
            Malca-Amit Singapore FTZ <FlagSG size={14} /> · Lloyd's of London Insured
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={() => navigate('sell')} style={{ background:'transparent', border:'1px solid rgba(248,113,113,0.4)', color:T.red, padding: isMobile?'8px 14px':'9px 18px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.sans }}>{ko?'매도':'Sell'}</button>
          <button onClick={() => navigate('withdraw')} style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, padding: isMobile?'8px 14px':'9px 18px', fontSize:13, cursor:'pointer', fontFamily:T.sans }}>{ko?'실물 인출':'Withdraw'}</button>
          <button onClick={() => navigate('shop')} style={{ background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, border:'none', color:'#0a0a0a', padding: isMobile?'8px 14px':'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>+ {ko?'구매':'Buy More'}</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap: isMobile?10:16, marginBottom:16 }}>
        {[
          { label:ko?'총 가치':'Total Value', value:fKRW(totalVal*krwRate), sub:fUSD(totalVal), col:T.gold },
          { label:ko?'금':'Gold',           value:`${goldOz.toFixed(2)} oz`, sub:fKRW(goldVal*krwRate), col:T.gold },
          { label:ko?'은':'Silver',         value:`${silverOz.toFixed(0)} oz`, sub:fKRW(silverVal*krwRate), col:'#aaa' },
          { label:'P&L', value:`${totalPnL>=0?'+':''}${fUSD(totalPnL)}`, sub:`${totalCost>0?((totalPnL/totalCost)*100).toFixed(1):'0'}%`, col: totalPnL>=0 ? T.green : T.red },
        ].map((c,i) => (
          <div key={i} style={{ background:T.bg1, border:`1px solid ${T.border}`, padding: isMobile?12:20 }}>
            <div style={{ fontSize:10, color:T.textMuted, marginBottom:5, fontFamily:T.sans, textTransform:'uppercase', letterSpacing:1 }}>{c.label}</div>
            <div style={{ fontFamily:T.mono, fontSize: isMobile?14:19, color:c.col, fontWeight:600 }}>{c.value}</div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:'#666', marginTop:3 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      {totalVal > 0 && (
        <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding: isMobile?14:20, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:12, color:T.textMuted, fontFamily:T.sans, textTransform:'uppercase', letterSpacing:1 }}>{ko?'자산 배분':'Allocation'}</span>
            <div style={{ display:'flex', gap:16 }}>
              <span style={{ fontSize:12, color:T.gold, fontFamily:T.sans }}>🥇 {ko?'금':'Gold'} {goldPct}%</span>
              <span style={{ fontSize:12, color:'#aaa', fontFamily:T.sans }}>🥈 {ko?'은':'Silver'} {silverPct}%</span>
            </div>
          </div>
          <div style={{ height:10, background:T.border, overflow:'hidden', display:'flex' }}>
            <div style={{ width:`${goldPct}%`, background:`linear-gradient(90deg,${T.gold},${T.goldDeep})`, transition:'width 0.6s ease' }} />
            <div style={{ width:`${silverPct}%`, background:'#666', transition:'width 0.6s ease' }} />
          </div>
        </div>
      )}

      {/* Insurance badge */}
      <div style={{ background:`linear-gradient(135deg,${T.goldGlow},rgba(197,165,114,0.08))`, border:`1px solid ${T.goldBorder}`, padding:'12px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <span style={{ fontSize:22 }}>🛡️</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:T.gold, fontFamily:T.sans, fontWeight:600 }}>Lloyd's of London — {ko?'완전 보험 적용':'Fully Insured'}</div>
          <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.sans }}>{ko?'보유 자산 전액에 대해 Lloyd\'s of London 보험이 적용됩니다.':'All holdings covered by Lloyd\'s of London insurance.'}</div>
        </div>
        <button onClick={requestCert} disabled={genCert} style={{ background:'none', border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'6px 14px', fontSize:11, cursor:'pointer', fontFamily:T.sans, whiteSpace:'nowrap', flexShrink:0 }}>
          {genCert ? '...' : (ko?'인증서 발급':'Get Certificate')}
        </button>
      </div>

      {/* Holdings */}
      <h3 style={{ fontFamily:T.sans, fontSize:13, color:T.textMuted, textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>{ko?'보유 항목':'Holdings'}</h3>
      {isMobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {holdings.map(h => {
            const cur = curVal(h); const pnl = cur - h.purchasePrice;
            return (
              <div key={h.id} style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:28 }}>{h.image}</span>
                    <div>
                      <div style={{ fontSize:13, color:T.text, fontWeight:500, fontFamily:T.sans }}>{ko?h.nameKo:h.product}</div>
                      <div style={{ fontSize:10, color:T.textMuted, fontFamily:T.mono }}>{h.serial}</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('sell')} style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:T.red, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:T.sans }}>{ko?'매도':'Sell'}</button>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  {[[ko?'매수가':'Bought',fUSD(h.purchasePrice),'#ddd'],[ko?'현재가':'Now',fUSD(cur),T.gold],['P&L',`${pnl>=0?'+':''}${fUSD(pnl)}`,pnl>=0?T.green:T.red]].map(([l,v,c],i) => (
                    <div key={i} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#555', fontFamily:T.sans, marginBottom:2 }}>{l}</div>
                      <div style={{ fontFamily:T.mono, fontSize:12, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background:T.bg1, border:`1px solid ${T.border}`, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:720 }}>
            <thead>
              <tr style={{ background:T.bg2 }}>
                {[ko?'상품':'Product', ko?'일련번호':'Serial', ko?'매수가':'Buy Price', ko?'현재가':'Current', 'P&L', ko?'볼트':'Vault', ''].map((h,i) => (
                  <th key={i} style={{ textAlign:'left', padding:'12px 14px', color:T.textMuted, fontSize:10, letterSpacing:1, textTransform:'uppercase', fontFamily:T.sans }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const cur = curVal(h); const pnl = cur - h.purchasePrice;
                return (
                  <tr key={h.id} style={{ borderBottom:`1px solid ${T.border}` }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bg2}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:14 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <span style={{ fontSize:24 }}>{h.image}</span>
                        <div>
                          <div style={{ color:T.text, fontSize:13, fontFamily:T.sans }}>{ko?h.nameKo:h.product}</div>
                          <div style={{ fontSize:10, color:T.textMuted, fontFamily:T.sans }}>{h.weightOz} oz · {h.purchaseDate}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:14, fontFamily:T.mono, color:T.textMuted, fontSize:11 }}>{h.serial}</td>
                    <td style={{ padding:14, fontFamily:T.mono, color:'#ddd', fontSize:13 }}>{fUSD(h.purchasePrice)}</td>
                    <td style={{ padding:14, fontFamily:T.mono, color:T.gold, fontSize:13 }}>{fUSD(cur)}</td>
                    <td style={{ padding:14, fontFamily:T.mono, color: pnl>=0?T.green:T.red, fontSize:13 }}>{pnl>=0?'+':''}{fUSD(pnl)}</td>
                    <td style={{ padding:14, fontSize:11, color:T.textMuted, fontFamily:T.sans }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}><FlagSG size={12} /> {h.zone}</div>
                    </td>
                    <td style={{ padding:14 }}>
                      <button onClick={() => navigate('sell')} style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:T.red, padding:'5px 12px', fontSize:11, cursor:'pointer', fontFamily:T.sans }}>{ko?'매도':'Sell'}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* S-03: Price Charts — dual panel above audit trail */}
      <div style={{ marginTop: 28, marginBottom: 28, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '16px 18px' }}>
          <PriceChart price={prices?.gold} metal="gold" label={ko ? 'XAU/USD · 30일' : 'XAU/USD · 30D'} height={160} />
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '16px 18px' }}>
          <PriceChart price={prices?.silver} metal="silver" label={ko ? 'XAG/USD · 30일' : 'XAG/USD · 30D'} height={160} />
        </div>
      </div>

      {/* Audit Trail */}
      <div style={{ marginTop:28 }}>
        <button onClick={() => setShowAudit(!showAudit)} style={{ background:'none', border:'none', color:T.textMuted, fontSize:13, cursor:'pointer', fontFamily:T.sans, display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
          <span style={{ transform: showAudit?'rotate(180deg)':'none', transition:'0.2s', display:'inline-block' }}>▾</span>
          {ko?'감사 추적 (Audit Trail)':'Audit Trail'}
        </button>
        {showAudit && (
          <div style={{ background:T.bg1, border:`1px solid ${T.border}`, overflow:'hidden' }}>
            {auditTrail.map((entry,i) => (
              <div key={i} style={{ display:'flex', gap:14, padding:'12px 16px', borderBottom: i<auditTrail.length-1?`1px solid ${T.border}`:'none', alignItems:'flex-start' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: entry.type==='vault'?T.gold:T.green, marginTop:5, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:T.text, fontFamily:T.sans, fontWeight:500, marginBottom:2 }}>{entry.event}</div>
                  <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.sans, overflow:'hidden', textOverflow:'ellipsis' }}>{entry.detail}</div>
                </div>
                <div style={{ fontFamily:T.mono, fontSize:11, color:'#555', flexShrink:0 }}>{entry.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SELL FLOW
   ═══════════════════════════════════════════════════════════════════════ */
export function SellFlowPage({ lang, navigate, prices, krwRate, holdings, toast }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1);
  const [payout, setPayout] = useState('krw');
  const [submitting, setSubmitting] = useState(false);
  const bidFactor = 0.995;
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const selHoldings = holdings.filter(h => selected.includes(h.id));
  const totalBid = selHoldings.reduce((s,h) => s + (h.metal==='gold'?prices.gold:prices.silver)*h.weightOz*bidFactor, 0);

  const submit = async () => {
    setSubmitting(true);
    await API.vault.requestSell(selected);
    setSubmitting(false);
    toast(ko?'매도 요청이 접수되었습니다. 영업일 1일 내에 처리됩니다.':'Sell request submitted. Processed within 1 business day.', 'info');
    navigate('dashboard');
  };

  return (
    <div style={{ padding: isMobile?'24px 16px':'40px 80px', background:T.bg, minHeight:'80vh' }}>
      <button onClick={() => navigate('dashboard')} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:13, marginBottom:20, fontFamily:T.sans }}>← {ko?'보유자산으로':'Back to Holdings'}</button>
      <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?26:32, color:T.text, fontWeight:300, margin:'0 0 24px' }}>{ko?'실물 금 매도':'Sell Holdings'}</h2>
      {step === 1 && (
        <div style={{ maxWidth:660 }}>
          <p style={{ color:T.textMuted, fontFamily:T.sans, fontSize:13, marginBottom:20 }}>{ko?'매도할 자산을 선택하세요. 현재 매수 호가로 정산됩니다.':'Select holdings to sell. Settlement at current bid price.'}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {holdings.map(h => {
              const bid = (h.metal==='gold'?prices.gold:prices.silver)*h.weightOz*bidFactor;
              const isSel = selected.includes(h.id);
              return (
                <div key={h.id} onClick={() => toggle(h.id)} style={{ background:T.bg1, border:`1.5px solid ${isSel?T.gold:T.border}`, padding:16, cursor:'pointer', display:'flex', gap:14, alignItems:'center', transition:'border-color 0.15s' }}>
                  <div style={{ width:20, height:20, border:`2px solid ${isSel?T.gold:T.border}`, background: isSel?T.gold:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{isSel && <span style={{ color:'#0a0a0a', fontSize:12, fontWeight:700 }}>✓</span>}</div>
                  <span style={{ fontSize:28 }}>{h.image}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:T.text, fontFamily:T.sans, fontWeight:500 }}>{ko?h.nameKo:h.product}</div>
                    <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono }}>{h.serial}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:T.mono, fontSize:14, color:T.gold, fontWeight:600 }}>{fKRW(bid*krwRate)}</div>
                    <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted }}>{fUSD(bid)}</div>
                    <div style={{ fontSize:10, color:'#555', fontFamily:T.sans }}>bid {((1-bidFactor)*100).toFixed(1)}% spread</div>
                  </div>
                </div>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:18, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:T.textMuted, fontFamily:T.sans }}>{ko?'선택 항목':'Selected'}</span>
                <span style={{ fontSize:13, color:T.text, fontFamily:T.sans }}>{selected.length}{ko?'개':' items'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:14, color:T.text, fontFamily:T.sans, fontWeight:600 }}>{ko?'예상 정산금':'Expected Payout'}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:T.mono, fontSize:20, color:T.green, fontWeight:700 }}>{fKRW(totalBid*krwRate)}</div>
                  <div style={{ fontFamily:T.mono, fontSize:12, color:'#666' }}>{fUSD(totalBid)}</div>
                  <div style={{ fontFamily:T.mono, fontSize:11, color:'#666' }}>{fKRW(totalBid*krwRate)}</div>
                </div>
              </div>
            </div>
          )}
          <button disabled={selected.length===0} onClick={() => setStep(2)} style={{ width:'100%', background: selected.length>0?T.gold:T.border, border:'none', color: selected.length>0?'#0a0a0a':T.textMuted, padding:'14px', fontSize:15, fontWeight:700, cursor: selected.length>0?'pointer':'not-allowed', fontFamily:T.sans }}>
            {ko?'계속':'Continue'} →
          </button>
        </div>
      )}
      {step === 2 && (
        <div style={{ maxWidth:560 }}>
          <h3 style={{ fontFamily:T.sans, fontSize:15, color:T.gold, margin:'0 0 18px', fontWeight:600 }}>{ko?'정산 방법 선택':'Payout Method'}</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {[{k:'krw',label:ko?'KRW 은행 이체 (한국)':'KRW Bank Transfer (Korea)'},{k:'usd',label:ko?'USD 전신환 (국제)':'USD Wire Transfer (International)'}].map(o => (
              <button key={o.k} onClick={() => setPayout(o.k)} style={{ background: payout===o.k?T.goldGlow:T.bg1, border:`1.5px solid ${payout===o.k?T.gold:T.border}`, padding:'14px 18px', cursor:'pointer', textAlign:'left', fontSize:14, color:T.text, fontFamily:T.sans }}>{o.label}</button>
            ))}
          </div>
          <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:16, marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:13, color:T.textMuted, fontFamily:T.sans }}>{ko?'정산 금액':'Payout'}</span>
              <span style={{ fontFamily:T.mono, fontSize:16, color:T.green, fontWeight:700 }}>{payout==='krw'?fKRW(totalBid*krwRate):fUSD(totalBid)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'#555', fontFamily:T.sans }}>{ko?'처리 시간':'Settlement'}</span>
              <span style={{ fontSize:12, color:T.textMuted, fontFamily:T.sans }}>{ko?'영업일 1일':'1 business day'}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setStep(1)} className="btn-outline" style={{ flex:1 }}>← {ko?'이전':'Back'}</button>
            <button onClick={submit} disabled={submitting} style={{ flex:2, background: submitting?T.border:T.gold, border:'none', color: submitting?T.textMuted:'#0a0a0a', padding:'13px', fontSize:15, fontWeight:700, cursor: submitting?'not-allowed':'pointer', fontFamily:T.sans }}>
              {submitting?(ko?'처리 중...':'Submitting...'):(ko?'매도 요청':'Submit Sell Request')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WITHDRAW FLOW
   ═══════════════════════════════════════════════════════════════════════ */
export function WithdrawFlowPage({ lang, navigate, holdings, krwRate, toast }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({ name:'', street:'', city:'', zip:'', country:'KR' });
  const [shipping, setShipping] = useState('express');
  const [submitting, setSubmitting] = useState(false);
  const toggle = id => setSelected(s => s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const submit = async () => {
    setSubmitting(true);
    await API.vault.requestWithdraw(selected, addr);
    setSubmitting(false);
    toast(ko?'실물 인출 요청이 접수되었습니다. 영업일 2~3일 내에 발송됩니다.':'Withdrawal request submitted. Ships within 2–3 business days.', 'info');
    navigate('dashboard');
  };

  const inp = { width:'100%', background:T.bg1, border:`1px solid ${T.border}`, color:T.text, padding:'10px 13px', fontSize:13, outline:'none', fontFamily:T.sans, marginBottom:10 };

  return (
    <div style={{ padding: isMobile?'24px 16px':'40px 80px', background:T.bg, minHeight:'80vh' }}>
      <button onClick={() => navigate('dashboard')} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:13, marginBottom:20, fontFamily:T.sans }}>← {ko?'보유자산으로':'Back'}</button>
      <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?26:32, color:T.text, fontWeight:300, margin:'0 0 16px' }}>{ko?'실물 인출 요청':'Request Physical Withdrawal'}</h2>
      <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', padding:'12px 16px', marginBottom:24 }}>
        <p style={{ fontSize:12, color:T.red, fontFamily:T.sans, margin:0, lineHeight:1.6 }}>⚠️ {ko?'한국으로 반입 시 관세(3%) + 부가세(10%) = 약 13%가 부과됩니다. 인출 전 세무사 상담을 권장합니다.':'Import to Korea incurs ~13% duties. Consult a tax advisor before withdrawing.'}</p>
      </div>
      {step === 1 && (
        <div style={{ maxWidth:640 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {holdings.map(h => {
              const isSel = selected.includes(h.id);
              return (
                <div key={h.id} onClick={() => toggle(h.id)} style={{ background:T.bg1, border:`1.5px solid ${isSel?T.gold:T.border}`, padding:16, cursor:'pointer', display:'flex', gap:12, alignItems:'center', transition:'border-color 0.15s' }}>
                  <div style={{ width:20, height:20, border:`2px solid ${isSel?T.gold:T.border}`, background: isSel?T.gold:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{isSel && <span style={{ color:'#0a0a0a', fontSize:12, fontWeight:700 }}>✓</span>}</div>
                  <span style={{ fontSize:28 }}>{h.image}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:T.text, fontFamily:T.sans }}>{ko?h.nameKo:h.product}</div>
                    <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono }}>{h.serial} · {h.vault}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button disabled={selected.length===0} onClick={() => setStep(2)} style={{ width:'100%', background: selected.length>0?T.gold:T.border, border:'none', color: selected.length>0?'#0a0a0a':T.textMuted, padding:'14px', fontSize:15, fontWeight:700, cursor: selected.length>0?'pointer':'not-allowed', fontFamily:T.sans }}>
            {ko?'배송지 입력':'Enter Delivery Address'} →
          </button>
        </div>
      )}
      {step === 2 && (
        <div style={{ maxWidth:560 }}>
          <h3 style={{ fontFamily:T.sans, fontSize:15, color:T.gold, margin:'0 0 18px', fontWeight:600 }}>{ko?'배송지 정보':'Delivery Address'}</h3>
          <input value={addr.name}   onChange={e=>setAddr({...addr,name:e.target.value})}   placeholder={ko?'수령인 이름':'Recipient Name'} style={inp} />
          <input value={addr.street} onChange={e=>setAddr({...addr,street:e.target.value})} placeholder={ko?'주소':'Street Address'} style={inp} />
          <input value={addr.city}   onChange={e=>setAddr({...addr,city:e.target.value})}   placeholder={ko?'도시':'City'} style={inp} />
          <input value={addr.zip}    onChange={e=>setAddr({...addr,zip:e.target.value})}     placeholder={ko?'우편번호':'Postal Code'} style={inp} />
          <select value={addr.country} onChange={e=>setAddr({...addr,country:e.target.value})} style={{...inp, background:T.bg1}}>
            <option value="KR">{ko?'대한민국':'South Korea'}</option>
            <option value="SG">{ko?'싱가포르':'Singapore'}</option>
            <option value="US">{ko?'미국':'United States'}</option>
            <option value="OTHER">{ko?'기타':'Other'}</option>
          </select>
          <div style={{ marginTop:10, marginBottom:14 }}>
            <div style={{ fontSize:12, color:T.textMuted, fontFamily:T.sans, marginBottom:8 }}>{ko?'배송 옵션':'Shipping'}</div>
            {[{k:'express',label:`${ko?'특급 보험 배송':'Express Insured'} (DHL/FedEx)`,price:'$150'},{k:'standard',label:`${ko?'일반 보험 배송':'Standard Insured'}`,price:'$80'}].map(o => (
              <button key={o.k} onClick={() => setShipping(o.k)} style={{ width:'100%', background: shipping===o.k?T.goldGlow:T.bg1, border:`1.5px solid ${shipping===o.k?T.gold:T.border}`, padding:'12px 16px', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:13, color:T.text, fontFamily:T.sans }}>{o.label}</span>
                <span style={{ fontFamily:T.mono, fontSize:13, color:T.gold }}>{o.price}</span>
              </button>
            ))}
          </div>
          {addr.country==='KR' && <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', padding:'10px 14px', marginBottom:16 }}><p style={{ fontSize:12, color:T.red, fontFamily:T.sans, margin:0 }}>{ko?'한국 반입 시 약 13% 관세/부가세가 별도 부과됩니다.':'~13% duties apply on import to Korea.'}</p></div>}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setStep(1)} className="btn-outline" style={{ flex:1 }}>← {ko?'이전':'Back'}</button>
            <button onClick={submit} disabled={submitting||!addr.name||!addr.street} style={{ flex:2, background:(!addr.name||!addr.street||submitting)?T.border:T.gold, border:'none', color:(!addr.name||!addr.street||submitting)?T.textMuted:'#0a0a0a', padding:'13px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
              {submitting?(ko?'처리 중...':'Submitting...'):(ko?'인출 요청':'Submit Request')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ORDER HISTORY
   ═══════════════════════════════════════════════════════════════════════ */
export function OrderHistoryPage({ lang, navigate, orders, krwRate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const statusConfig = {
    pending_payment: { ko:'입금 대기', en:'Awaiting Payment', col:T.amber },
    processing:      { ko:'처리 중',   en:'Processing',       col:T.blue  },
    confirmed:       { ko:'주문 확인', en:'Confirmed',         col:T.blue  },
    vaulted:         { ko:'보관 중',   en:'Vaulted',           col:T.green },
    delivered:       { ko:'배송 완료', en:'Delivered',         col:T.gold  },
    cancelled:       { ko:'취소됨',   en:'Cancelled',          col:T.red   },
  };
  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  return (
    <div style={{ padding: isMobile?'24px 16px':'40px 80px', background:T.bg, minHeight:'80vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:T.serifKr, fontSize: isMobile?26:32, color:T.text, fontWeight:300, margin:0 }}>{ko?'주문 내역':'Order History'}</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[{k:'all',ko:'전체',en:'All'},{k:'vaulted',ko:'보관중',en:'Vaulted'},{k:'processing',ko:'처리중',en:'Processing'}].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{ background: filter===f.k?T.gold:'transparent', color: filter===f.k?'#0a0a0a':T.textMuted, border:`1px solid ${filter===f.k?T.gold:T.border}`, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontFamily:T.sans, fontWeight: filter===f.k?600:400 }}>{ko?f.ko:f.en}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#555', fontFamily:T.sans }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <p>{ko?'주문 내역이 없습니다.':'No orders found.'}</p>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(order => {
          const sc = statusConfig[order.status] || {ko:order.status, en:order.status, col:'#888'};
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} style={{ background:T.bg1, border:`1px solid ${T.border}`, overflow:'hidden', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.goldBorder}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div onClick={() => setExpanded(isOpen?null:order.id)} style={{ padding: isMobile?'14px':'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', gap:10 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', flex:1, minWidth:0 }}>
                  <div style={{ fontSize: isMobile?22:28 }}>{order.items[0]?.image||'🥇'}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:T.mono, fontSize: isMobile?10:12, color:T.gold, marginBottom:2 }}>{order.id}</div>
                    <div style={{ fontFamily:T.sans, fontSize: isMobile?12:13, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.items.map(i=>(ko?i.nameKo:i.name)).join(', ')}</div>
                    <div style={{ fontSize:11, color:'#555', fontFamily:T.sans }}>{fDateLong(order.date)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexShrink:0 }}>
                  <span style={{ background:`${sc.col}18`, color:sc.col, border:`1px solid ${sc.col}40`, padding:'3px 10px', borderRadius:20, fontSize:11, fontFamily:T.sans, fontWeight:600 }}>{ko?sc.ko:sc.en}</span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:T.mono, fontSize: isMobile?12:15, color:T.gold, fontWeight:600 }}>{fKRW(order.total*krwRate)}</div>
                  </div>
                  <span style={{ color:'#555', fontSize:16, transform: isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop:`1px solid ${T.border}`, padding: isMobile?'14px':'18px 22px', background:T.bg2 }}>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr 1fr', gap:14, marginBottom:16 }}>
                    {[[ko?'결제 수단':'Payment',order.paymentMethod],[ko?'보관':'Storage','Singapore FTZ'],[ko?'합계 (KRW)':'Total (KRW)',fKRW(order.total*krwRate)]].map(([l,v],i) => (
                      <div key={i}>
                        <div style={{ fontSize:10, color:'#555', fontFamily:T.sans, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{l}</div>
                        <div style={{ fontFamily:T.mono, fontSize:13, color:T.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <button onClick={() => {}} style={{ background:`${T.goldGlow}`, border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'7px 14px', fontSize:12, cursor:'pointer', fontFamily:T.sans }}>📥 {ko?'영수증 다운로드':'Download Receipt'}</button>
                    <button onClick={() => navigate('dashboard')} style={{ background:'none', border:`1px solid ${T.border}`, color:T.textMuted, padding:'7px 14px', fontSize:12, cursor:'pointer', fontFamily:T.sans }}>{ko?'보유자산 확인':'View Holdings'}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ACCOUNT PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function AccountPage({ lang, navigate, user, setUser, toast }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name||'');
  const [phone, setPhone] = useState(user?.phone||'');
  const [notifEmail, setNotifEmail] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  if (!user) return <div style={{ padding:'80px', textAlign:'center', color:T.textMuted, fontFamily:T.sans }}>{ko?'로그인이 필요합니다.':'Login required.'}</div>;

  const kycBadge = { unverified:{ko:'미인증',en:'Unverified',col:T.red}, in_review:{ko:'검토 중',en:'In Review',col:T.amber}, verified:{ko:'인증 완료',en:'Verified',col:T.green} };
  const kyc = kycBadge[user.kycStatus] || kycBadge.unverified;
  const initials = (user.name||user.email||'A').slice(0,2).toUpperCase();

  const saveProfile = () => { setUser({...user,name,phone}); setEditMode(false); toast(ko?'프로필이 업데이트되었습니다.':'Profile updated.'); };

  const pad = isMobile ? '24px 16px' : '40px 80px';
  const inp = { width:'100%', background:T.bg1, border:`1px solid ${T.border}`, color:T.text, padding:'10px 14px', fontSize:13, outline:'none', fontFamily:T.sans, marginBottom:10 };

  const Card = ({ title, children }) => (
    <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:'24px', marginBottom:16 }}>
      <h3 style={{ fontFamily:T.serifKr, fontSize:16, color:T.text, fontWeight:600, margin:'0 0 18px', paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ padding:pad, background:T.bg, minHeight:'80vh' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontSize:22, color:'#0a0a0a', fontWeight:700, flexShrink:0 }}>{initials}</div>
          <div>
            <div style={{ fontFamily:T.serifKr, fontSize:22, color:T.text }}>{user.name || user.email}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
              <span style={{ background:`${kyc.col}18`, color:kyc.col, border:`1px solid ${kyc.col}40`, padding:'2px 10px', borderRadius:20, fontSize:11, fontFamily:T.sans, fontWeight:600 }}>{ko?kyc.ko:kyc.en}</span>
              {user.kycStatus !== 'verified' && <button onClick={() => navigate('kyc')} style={{ background:'none', border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'2px 10px', fontSize:11, cursor:'pointer', fontFamily:T.sans }}>{ko?'KYC 인증하기':'Verify KYC'}</button>}
            </div>
          </div>
        </div>

        <Card title={ko?'프로필':'Profile'}>
          {editMode ? (
            <>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder={ko?'이름':'Name'} style={inp} />
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={ko?'전화번호':'Phone'} style={inp} />
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={saveProfile} className="btn-primary" style={{ flex:2 }}>{ko?'저장':'Save'}</button>
                <button onClick={() => setEditMode(false)} className="btn-outline" style={{ flex:1 }}>{ko?'취소':'Cancel'}</button>
              </div>
            </>
          ) : (
            <>
              {[['Email', user.email],[ko?'이름':'Name',user.name||'—'],[ko?'전화':'Phone',user.phone||'—']].map(([k,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom: i<2?`1px solid ${T.border}`:'none' }}>
                  <span style={{ fontFamily:T.sans, fontSize:12, color:T.textMuted }}>{k}</span>
                  <span style={{ fontFamily:T.mono, fontSize:12, color:T.text }}>{v}</span>
                </div>
              ))}
              <button onClick={() => setEditMode(true)} style={{ marginTop:14, background:'none', border:`1px solid ${T.border}`, color:T.textMuted, padding:'8px 20px', cursor:'pointer', fontSize:12, fontFamily:T.sans }}>{ko?'수정':'Edit'}</button>
            </>
          )}
        </Card>

        <Card title={ko?'알림 설정':'Notifications'}>
          {[[ko?'이메일 가격 알림':'Email price alerts',notifEmail,setNotifEmail]].map(([label,val,set],i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0' }}>
              <span style={{ fontFamily:T.sans, fontSize:13, color:T.text }}>{label}</span>
              <button onClick={() => set(!val)} style={{ width:44, height:24, background: val?T.gold:T.border, border:'none', borderRadius:12, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                <div style={{ width:18, height:18, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: val?23:3, transition:'left 0.2s' }} />
              </button>
            </div>
          ))}
        </Card>

        <Card title={ko?'보안':'Security'}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontFamily:T.sans, fontSize:13, color:T.text }}>{ko?'2단계 인증 (2FA)':'Two-Factor Auth (2FA)'}</span>
            <button onClick={() => { setTwoFA(!twoFA); toast(twoFA?(ko?'2FA가 비활성화되었습니다.':'2FA disabled.'):(ko?'2FA가 활성화되었습니다.':'2FA enabled.')); }} style={{ width:44, height:24, background: twoFA?T.gold:T.border, border:'none', borderRadius:12, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
              <div style={{ width:18, height:18, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: twoFA?23:3, transition:'left 0.2s' }} />
            </button>
          </div>
          <button onClick={() => {}} style={{ marginTop:14, background:'none', border:'1px solid rgba(248,113,113,0.3)', color:T.red, padding:'8px 20px', cursor:'pointer', fontSize:12, fontFamily:T.sans }}>{ko?'비밀번호 변경':'Change Password'}</button>
        </Card>

        <button onClick={() => { setUser(null); navigate('home'); }} style={{ width:'100%', background:'none', border:`1px solid ${T.border}`, color:T.textMuted, padding:'12px', cursor:'pointer', fontSize:13, fontFamily:T.sans }}>
          {ko?'로그아웃':'Log Out'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   KYC FLOW
   ═══════════════════════════════════════════════════════════════════════ */
export function KYCFlowPage({ lang, navigate, user, setUser, toast }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ realName:'', idNumber:'', phone:'', idType:'resident', idFront:null });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <div style={{ padding:'80px', textAlign:'center', color:T.textMuted, fontFamily:T.sans }}>{ko?'로그인이 필요합니다.':'Login required.'}</div>;

  const inp = { width:'100%', background:T.bg1, border:`1px solid ${T.border}`, color:T.text, padding:'11px 14px', fontSize:13, outline:'none', fontFamily:T.sans, marginBottom:12 };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await API.kyc.submit(form);
      setUser({...user, kycStatus:'in_review'});
      setStep(3);
      toast(ko?'KYC 서류가 제출되었습니다. 1~2 영업일 내에 검토됩니다.':'KYC submitted. Review within 1–2 business days.', 'info');
    } catch { toast(ko?'제출 오류. 다시 시도하세요.':'Submission error.', 'error'); }
    finally { setSubmitting(false); }
  };

  const steps = [ko?'신분증 선택':'ID Type', ko?'정보 입력':'Enter Info', ko?'완료':'Done'];

  return (
    <div style={{ padding: isMobile?'24px 16px':'56px 80px', background:T.bg, minHeight:'80vh' }}>
      <div style={{ maxWidth:580, margin:'0 auto' }}>
        <div className="eyebrow" style={{ marginBottom:20 }}>KYC · {ko?'본인 확인':'Identity Verification'}</div>
        <div style={{ display:'flex', gap:0, marginBottom:32 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ flex:1, display:'flex', alignItems:'center' }}>
              <div style={{ flex:1 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background: step>i+1?T.gold:step===i+1?T.bg1:T.bg1, border:`2px solid ${step>=i+1?T.gold:T.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.mono, fontSize:12, color: step>i+1?'#0a0a0a':step===i+1?T.gold:T.textMuted, margin:'0 auto 8px' }}>{step>i+1?'✓':i+1}</div>
                <div style={{ fontFamily:T.sans, fontSize:11, color: step===i+1?T.text:T.textMuted, textAlign:'center' }}>{s}</div>
              </div>
              {i<steps.length-1 && <div style={{ flex:1, height:2, background: step>i+1?T.gold:T.border, marginBottom:20 }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:22, color:T.text, marginBottom:8 }}>{ko?'신분증 종류 선택':'Select ID Type'}</h2>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, lineHeight:1.7, marginBottom:24 }}>{ko?'한국 거주자는 주민등록증 또는 운전면허증을 사용하실 수 있습니다.':'Korean residents may use national ID or driver\'s license.'}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[{k:'resident',label:ko?'주민등록증':'National ID Card',sub:ko?'가장 빠른 승인':'Fastest approval'},{k:'passport',label:ko?'여권':'Passport',sub:ko?'외국인 투자자 가능':'For foreign investors'}].map(opt => (
                <button key={opt.k} onClick={() => setForm({...form,idType:opt.k})} style={{ background: form.idType===opt.k?T.goldGlow:T.bg1, border:`1px solid ${form.idType===opt.k?T.goldBorderStrong:T.border}`, padding:'16px 20px', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:T.sans, fontSize:14, color:T.text }}>{opt.label}</span>
                  <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.goldDim }}>{opt.sub}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary" style={{ width:'100%' }}>{ko?'다음':'Next'} →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:22, color:T.text, marginBottom:20 }}>{ko?'정보 입력':'Enter Your Information'}</h2>
            <input value={form.realName} onChange={e=>setForm({...form,realName:e.target.value})} placeholder={ko?'실명 (신분증 기재 이름)':'Full Legal Name'} style={inp} />
            <input value={form.idNumber} onChange={e=>setForm({...form,idNumber:e.target.value})} placeholder={ko?'주민등록번호 앞 7자리 (예: 901231-1)':'ID Number (partial)'}  style={inp} />
            <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder={ko?'휴대폰 번호 (예: 010-1234-5678)':'Mobile Number'} style={inp} />
            <div style={{ background:T.bg1, border:`1px dashed ${T.border}`, padding:'24px', textAlign:'center', marginBottom:20, cursor:'pointer' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
              <div style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{ko?'신분증 앞면 사진을 업로드하세요':'Upload front of ID document'}</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, marginTop:4 }}>JPG · PNG · PDF · 최대 10MB</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(1)} className="btn-outline" style={{ flex:1 }}>← {ko?'이전':'Back'}</button>
              <button onClick={handleSubmit} disabled={submitting||!form.realName||!form.idNumber} style={{ flex:2, background:(!form.realName||!form.idNumber||submitting)?T.border:T.gold, border:'none', color:(!form.realName||!form.idNumber||submitting)?T.textMuted:'#0a0a0a', padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
                {submitting?(ko?'제출 중...':'Submitting...'):(ko?'KYC 제출':'Submit KYC')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:26, color:T.text, fontWeight:300, marginBottom:12 }}>{ko?'서류 검토 중':'Under Review'}</h2>
            <p style={{ fontFamily:T.sans, fontSize:14, color:T.textSub, lineHeight:1.8, marginBottom:24 }}>{ko?'1~2 영업일 내에 검토가 완료됩니다. 카카오톡 및 이메일로 결과를 알려드립니다.':'Review completed within 1–2 business days. You\'ll be notified via email.'}</p>
            <button onClick={() => navigate('dashboard')} className="btn-primary">{ko?'보유자산 확인':'View Dashboard'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
