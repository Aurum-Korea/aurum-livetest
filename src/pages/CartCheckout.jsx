import { useState } from 'react';
import { T, useIsMobile, fUSD, fKRW, API, getStorageRate, KR_GOLD_PREMIUM, KR_SILVER_PREMIUM, AURUM_GOLD_PREMIUM, AURUM_SILVER_PREMIUM } from '../lib/index.jsx';
import { PaymentMethodCard, ConsentCheckbox } from '../components/UI.jsx';

// Issue 9: ₩ in sans so it renders in JetBrains Mono contexts
const Won = () => <span style={{ fontFamily: "'Pretendard','Outfit',sans-serif" }}>₩</span>;

/* ═══════════════════════════════════════════════════════════════════════
   CART PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function CartPage({ lang, navigate, cart, removeFromCart, updateCartQty, prices, krwRate, currency, setCurrency, setProduct, cartPayMethod, setCartPayMethod }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (!cart.length) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'80px 20px' }}>
      <div style={{ fontSize:48 }}>🛒</div>
      <h2 style={{ fontFamily:T.serifKr, fontSize:26, color:T.text, fontWeight:300 }}>{ko ? '장바구니가 비어있습니다' : 'Your cart is empty'}</h2>
      <button onClick={() => navigate('shop-physical')} className="btn-primary">{ko ? '제품 보러 가기' : 'Browse Products'}</button>
    </div>
  );

  return (
    <div style={{ background:T.bg, minHeight:'85vh', padding: isMobile ? '32px 16px' : '56px 80px' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32, flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontFamily:T.serifKr, fontSize:'clamp(24px,3vw,36px)', fontWeight:300, color:T.text, margin:0 }}>{ko ? '장바구니' : 'Cart'}</h1>
          <button onClick={() => setCurrency(c=>c==='KRW'?'USD':'KRW')} style={{ background:T.goldGlow, border:`1px solid ${T.goldBorder}`, color:T.gold, padding:'6px 14px', cursor:'pointer', fontFamily:T.mono, fontSize:11 }}>{currency} ⇄</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap:32 }}>
          {/* Items */}
          <div>
            {cart.map(item => {
              const auP  = item.metal === 'gold' ? AURUM_GOLD_PREMIUM : AURUM_SILVER_PREMIUM;
              const krP  = item.metal === 'gold' ? KR_GOLD_PREMIUM    : KR_SILVER_PREMIUM;
              const spot = item.price / (1 + auP);
              const krWon = spot * (1 + krP) * krwRate;
              const auWon = item.price * krwRate;
              const discPct = ((1 - auWon / krWon) * 100).toFixed(0);
              return (
              <div key={item.cartKey} style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:'16px 18px', marginBottom:10 }}>
                <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom: 8 }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{item.image}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.sansKr, fontSize: isMobile?13:14, color:T.text, fontWeight:500, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ko ? item.nameKo : item.name}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:T.mono, fontSize: isMobile?12:10, color:T.textMuted }}>SG Vault</span>
                      <span style={{ fontFamily:T.mono, fontSize:10, color:'#4ade80', background:'rgba(74,222,128,0.07)', padding:'1px 6px' }}>한국 대비 −{discPct}%</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    <button onClick={() => updateCartQty(item.cartKey, item.qty-1)} style={{ width:26, height:26, background:'none', border:`1px solid ${T.border}`, color:T.text, cursor:'pointer', fontFamily:T.mono, fontSize:14 }}>−</button>
                    <span style={{ fontFamily:T.mono, fontSize:13, color:T.text, minWidth:18, textAlign:'center' }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.cartKey, item.qty+1)} style={{ width:26, height:26, background:'none', border:`1px solid ${T.border}`, color:T.text, cursor:'pointer', fontFamily:T.mono, fontSize:14 }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.cartKey)} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:16, padding:'0 2px', flexShrink:0 }}>✕</button>
                </div>
                {/* Price + Korea comparison */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingLeft:42 }}>
                  <div>
                    <div style={{ fontFamily:T.mono, fontSize: isMobile?12:10, color:T.textMuted }}>{ko?'한국 시세':'Korea retail'} ₩{Math.round(krWon/1000).toLocaleString()}K/oz</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:T.mono, fontSize: isMobile?15:16, color:T.gold, fontWeight:600 }}>{fP(item.price * item.qty)}</div>
                    {currency==='KRW' && <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>{fUSD(item.price * item.qty)}</div>}
                  </div>
                </div>
              </div>
            );})}
          </div>

          {/* Summary + payment */}
          <div>
            <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'24px' }}>
              <div style={{ fontFamily:T.serifKr, fontSize:18, color:T.text, marginBottom:20, fontWeight:600 }}>{ko ? '주문 요약' : 'Order Summary'}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{ko ? '소계' : 'Subtotal'}</span>
                <span style={{ fontFamily:T.mono, fontSize:14, color:T.text }}>{fP(subtotal)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:16, borderBottom:`1px solid ${T.border}`, marginBottom:16 }}>
                <span style={{ fontFamily:T.sans, fontSize:13, color:T.textSub }}>{ko ? '보관료 (연간)' : 'Storage (annual)'}</span>
                <span style={{ fontFamily:T.mono, fontSize:12, color:T.textMuted }}>0.15% p.a.</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <span style={{ fontFamily:T.sans, fontSize:15, color:T.text, fontWeight:600 }}>{ko ? '합계' : 'Total'}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:T.mono, fontSize:20, color:T.gold, fontWeight:700 }}>{fP(subtotal)}</div>
                  {currency==='KRW' && <div style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted }}>{fUSD(subtotal)}</div>}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:T.sans, fontSize: isMobile?13:11, color:T.textMuted, marginBottom:10 }}>{ko ? '결제 방법 선택' : 'Payment Method'}</div>
                {[
                  { v:'toss',   badge:'TOSS PAY',         label:ko?'토스페이':'TossPay',         sub:ko?'최대 2% 캐시백':'Up to 2% cashback', fee:ko?'수수료 없음':'No fee' },
                  { v:'card',   badge:'CREDIT CARD',      label:ko?'신용카드':'Credit Card',     sub:'Visa · Mastercard',                     fee:ko?'수수료 없음':'No fee' },
                  { v:'wire',   badge:'WIRE TRANSFER',     label:ko?'전신환 송금':'Wire Transfer', sub:'DBS Singapore',                        fee:'USD 기준' },
                  { v:'crypto', badge:'CRYPTO',            label:'USDT / USDC',                   sub:'TRC-20 / ERC-20',                       fee:ko?'최소 수수료':'Minimal fee' },
                ].map(opt => (
                  <PaymentMethodCard key={opt.v} value={opt.v} selected={cartPayMethod} onChange={setCartPayMethod}
                    label={opt.label} subtitle={opt.sub} badge={opt.badge} fee={opt.fee} />
                ))}
              </div>

              <button onClick={() => navigate('checkout')} style={{ width:'100%', background:T.gold, border:'none', color:'#0a0a0a', padding:'15px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
                {ko ? '주문하기 →' : 'Place Order →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function CheckoutPage({ lang, navigate, cart, clearCart, prices, krwRate, user, addOrder, toast, currency, setCurrency, initialPayMethod, setShowLogin }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState(initialPayMethod || 'toss');
  const [consents, setConsents] = useState({ terms:false, privacy:false, marketing:false });
  const [submitting, setSubmitting] = useState(false);
  const [wireDetails, setWireDetails] = useState(null);
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const canProceed = consents.terms && consents.privacy;

  const handleSubmit = async () => {
    if (!canProceed) { toast(ko ? '필수 약관에 동의해 주세요.' : 'Please accept required terms.', 'error'); return; }
    setSubmitting(true);
    try {
      const order = await API.orders.create({ items: cart, total, paymentMethod: payMethod });
      if (payMethod === 'wire') {
        const result = await API.payments.wire({ id: order.id, total });
        setWireDetails(result.bankDetails);
        setStep(3);
      } else {
        await API.payments[payMethod]({ id: order.id, total });
        addOrder({ id: order.id, date: new Date().toISOString(), status: 'processing', items: cart.map(i => ({ nameKo: i.nameKo, name: i.name, qty: i.qty, unitPrice: i.price, metal: i.metal, image: i.image })), subtotal: total, total, paymentMethod: payMethod, storageOption: 'singapore' });
        clearCart();
        setStep(3);
      }
    } catch { toast(ko ? '결제 오류. 다시 시도하세요.' : 'Payment error. Please retry.', 'error'); }
    finally { setSubmitting(false); }
  };

  const inp = { width:'100%', background:T.bg1, border:`1px solid ${T.border}`, color:T.text, padding:'11px 14px', fontSize:13, outline:'none', fontFamily:T.sans, marginBottom:10 };

  return (
    <div style={{ background:T.bg, minHeight:'85vh', padding: isMobile ? '32px 16px' : '56px 80px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <button onClick={() => navigate('cart')} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:13, fontFamily:T.sans, marginBottom:24 }}>← {ko?'장바구니':'Cart'}</button>
        <h1 style={{ fontFamily:T.serifKr, fontSize:'clamp(24px,3vw,36px)', fontWeight:300, color:T.text, marginBottom:28 }}>{ko?'주문 완료':'Checkout'}</h1>

        {/* Step 1: Review + Payment */}
        {step === 1 && (
          <div>
            <div style={{ background:T.bg1, border:`1px solid ${T.border}`, padding:'20px 24px', marginBottom:20 }}>
              <div style={{ fontFamily:T.mono, fontSize: isMobile?12:10, color:T.textMuted, letterSpacing:'0.18em', marginBottom:14, textTransform:'uppercase' }}>{ko?'주문 내역':'Order Items'}</div>
              {cart.map((item,i) => {
                const krPremium   = item.metal === 'gold' ? KR_GOLD_PREMIUM   : KR_SILVER_PREMIUM;
                const auPremium   = item.metal === 'gold' ? AURUM_GOLD_PREMIUM : AURUM_SILVER_PREMIUM;
                const spotUSD     = item.price / (1 + auPremium);
                const koreaUSD    = spotUSD * (1 + krPremium);
                const savingsUSD  = (koreaUSD - item.price) * item.qty;
                const storageRate = getStorageRate(user);
                return (
                  <div key={i} style={{ borderBottom: i<cart.length-1 ? `1px solid ${T.border}` : 'none', paddingBottom:12, marginBottom:12 }}>
                    {/* Name + price row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <span style={{ fontFamily:T.sans, fontSize:13, color:T.text, flex:1, marginRight:12 }}>{ko?item.nameKo:item.name} ×{item.qty}</span>
                      <span style={{ fontFamily:T.sans, fontSize:13, color:T.gold, flexShrink:0 }}>{fP(item.price*item.qty)}</span>
                    </div>
                    {/* Transparency rows — no 순도, no Aurum premium */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 12px', paddingLeft:8 }}>
                      {[
                        { label: ko?'한국 시세':'Korea retail', val: fP(koreaUSD),                       color: T.textMuted },
                        { label: ko?'절감':'Savings',           val: `-${((1-(item.price/koreaUSD))*100).toFixed(0)}%`, color: '#4ade80' },
                        { label: ko?'절감액 /oz':'Saved /oz',   val: `+${fP(savingsUSD/item.qty)}`,      color: '#4ade80'  },
                        { label: ko?'보관료':'Storage',         val: `${storageRate}% p.a.`,              color: T.textSub  },
                        { label: ko?'보관 위치':'Vault',         val: 'Malca-Amit SG FTZ',               color: T.textMuted },
                      ].map((r,ri) => (
                        <div key={ri} style={{ display:'flex', justifyContent:'space-between', gap:4 }}>
                          <span style={{ fontFamily:T.mono, fontSize: isMobile?10:9, color:T.textMuted, letterSpacing:'0.08em' }}>{r.label}</span>
                          <span style={{ fontFamily:T.sans, fontSize: isMobile?11:10, color:r.color, textAlign:'right' }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4 }}>
                <span style={{ fontFamily:T.sans, fontSize:15, color:T.text, fontWeight:600 }}>{ko?'합계':'Total'}</span>
                <span style={{ fontFamily:T.sans, fontSize:18, color:T.gold, fontWeight:700 }}>{fP(total)}</span>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:T.sans, fontSize: isMobile?13:12, color:T.textMuted, marginBottom:10 }}>{ko?'결제 수단':'Payment Method'}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { v:'toss',   badge:'TOSS PAY',    label:ko?'토스페이':'TossPay',       sub:ko?'최대 2% 캐시백':'Up to 2% cashback', fee:ko?'수수료 없음':'No fee' },
                  { v:'card',   badge:'CREDIT CARD', label:ko?'신용카드':'Credit Card',   sub:'Visa · Mastercard',                     fee:ko?'수수료 없음':'No fee' },
                  { v:'wire',   badge:'WIRE',         label:ko?'전신환':'Wire Transfer',   sub:'DBS Singapore',                         fee:'USD' },
                  { v:'crypto', badge:'CRYPTO',       label:'USDT/USDC',                   sub:'TRC-20 / ERC-20',                       fee:ko?'소액 수수료':'Min fee' },
                ].map(opt => (
                  <PaymentMethodCard key={opt.v} value={opt.v} selected={payMethod} onChange={setPayMethod}
                    label={opt.label} subtitle={opt.sub} badge={opt.badge} fee={opt.fee} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:T.sans, fontSize:12, color:T.textMuted, marginBottom:4 }}>{ko?'약관 동의':'Terms'}</div>
              {[
                { k:'terms',     label:ko?'이용약관 및 귀금속 구매 조건 동의':'I agree to Terms of Service and Purchase Conditions', required:true },
                { k:'privacy',   label:ko?'개인정보 수집·이용 동의 (PIPA)':'I agree to Privacy Policy (PIPA)', required:true },
                { k:'marketing', label:ko?'마케팅 정보 수신 동의 (가격 알림, 뉴스레터)':'Marketing communications (optional)', required:false },
              ].map(c => (
                <ConsentCheckbox key={c.k} checked={consents[c.k]} onChange={v => setConsents(s=>({...s,[c.k]:v}))} label={c.label} required={c.required} />
              ))}
            </div>

            <button onClick={() => setStep(2)} disabled={!canProceed} style={{
              width:'100%', background: canProceed ? T.gold : T.border, border:'none',
              color: canProceed ? '#0a0a0a' : T.textMuted, padding:'15px', fontSize:15,
              fontWeight:700, cursor: canProceed ? 'pointer' : 'not-allowed', fontFamily:T.sans,
            }}>{ko?'결제 진행':'Proceed to Payment'} →</button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div>
            <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'24px', marginBottom:20 }}>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold, letterSpacing:'0.2em', marginBottom:16 }}>CONFIRMATION</div>
              <div style={{ fontFamily:T.serifKr, fontSize:22, color:T.text, marginBottom:8 }}>{ko?'총 결제 금액':'Total'}</div>
              <div style={{ fontFamily:T.mono, fontSize:32, color:T.gold, fontWeight:700, marginBottom:4 }}>{fP(total)}</div>
              <div style={{ fontFamily:T.sans, fontSize: isMobile?13:12, color:T.textMuted }}>{ko?`${cart.length}개 품목 · ${payMethod.toUpperCase()} · Malca-Amit SG FTZ 보관`:`${cart.length} item(s) · ${payMethod.toUpperCase()} · Malca-Amit SG FTZ`}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(1)} className="btn-outline" style={{ flex:1 }}>← {ko?'이전':'Back'}</button>
              {!user ? (
                <button onClick={() => setShowLogin && setShowLogin(true)} style={{
                  flex:2, background:T.gold, border:'none', color:'#0a0a0a', padding:'15px', fontSize:15,
                  fontWeight:700, cursor:'pointer', fontFamily:T.sans,
                }}>{ko ? '로그인 후 결제' : 'Login to Pay'}</button>
              ) : user.kycStatus !== 'verified' ? (
                <div style={{ flex:2, background:T.border, padding:'15px', textAlign:'center' }}>
                  <div style={{ fontFamily:T.mono, fontSize:11, color:T.amber, letterSpacing:'0.1em' }}>KYC 검토 중 — 1-2 영업일 후 거래 가능</div>
                </div>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} style={{
                  flex:2, background: submitting ? T.border : T.gold, border:'none',
                  color: submitting ? T.textMuted : '#0a0a0a', padding:'15px', fontSize:15,
                  fontWeight:700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily:T.sans,
                }}>{submitting ? (ko?'처리 중...':'Processing...') : (ko?'결제 완료':'Confirm Payment')}</button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:56, marginBottom:20 }}>✅</div>
            <h2 style={{ fontFamily:T.serifKr, fontSize:28, color:T.text, fontWeight:300, marginBottom:12 }}>
              {payMethod==='wire' ? (ko?'전신환 안내':'Wire Instructions') : (ko?'주문 완료!':'Order Confirmed!')}
            </h2>
            {wireDetails ? (
              <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:'24px', textAlign:'left', marginBottom:24 }}>
                <div style={{ fontFamily:T.mono, fontSize:10, color:T.gold, letterSpacing:'0.2em', marginBottom:16 }}>WIRE TRANSFER DETAILS</div>
                {Object.entries(wireDetails).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:T.textMuted, textTransform:'capitalize' }}>{k.replace(/([A-Z])/g,' $1')}</span>
                    <span style={{ fontFamily:T.mono, fontSize:12, color:T.text }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily:T.sans, fontSize:15, color:T.textSub, lineHeight:1.8, marginBottom:24 }}>
                {ko ? '결제가 완료되었습니다. 이메일로 확인서가 발송됩니다. 귀하의 금속은 즉시 Malca-Amit SG FTZ 금고에 배분 보관됩니다.' : 'Payment received. Confirmation sent by email. Your metal is being allocated to vault.'}
              </p>
            )}
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => navigate('dashboard')} className="btn-primary">{ko?'보유자산 확인':'View Holdings'}</button>
              <button onClick={() => navigate('home')} className="btn-outline">{ko?'홈으로':'Home'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
