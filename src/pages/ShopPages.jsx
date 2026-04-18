import { useState, useEffect } from 'react';
import { T, useIsMobile, calcPrice, fUSD, fKRW, PRODUCTS, getStorageRate } from '../lib/index.jsx';
import { Badge, StatBar, SectionHead, FlagSG } from '../components/UI.jsx';
import { initMagneticCards } from '../lib/magnetic.js';

// D-5: gold top-line — shared across all card types
const GOLD_LINE = { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c5a572, transparent)', pointerEvents: 'none', zIndex: 1 };

/* ═══════════════════════════════════════════════════════════════════════
   SHOP SELECTOR — front door
   M-7: replaced custom padding+maxWidth with aurum-container
   ═══════════════════════════════════════════════════════════════════════ */
export function ShopSelectorPage({ lang, navigate }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  useEffect(() => { const c = initMagneticCards(); return c; }, []);
  return (
    // M-7: background only on outer div, aurum-container handles alignment
    <div style={{ background: T.bg, minHeight: '85vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 48 : 80, paddingBottom: isMobile ? 48 : 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          {/* D-4: standardized eyebrow — mono 9px goldDim 0.26em */}
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldDim, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1, background: T.gold }} />
            {ko ? '매장' : 'Shop'}
            <span style={{ display: 'inline-block', width: 28, height: 1, background: T.gold }} />
          </div>
          <h1 style={{ fontFamily: ko ? T.serifKrDisplay : T.serifKr, fontSize: 'clamp(28px,5vw,52px)', fontWeight: 500, color: T.text, lineHeight: 1.2, marginBottom: 20 }}>
            {ko ? '어떻게 시작하시겠습니까?' : 'How Would You Like to Begin?'}
          </h1>
          <p style={{ maxWidth: 580, margin: '0 auto', color: T.textSub, fontSize: 15, lineHeight: 1.8, fontFamily: T.sans }}>
            {ko ? 'Aurum은 두 가지 방식으로 실물 금·은을 제공합니다.' : 'Aurum offers two ways to own physical gold and silver.'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 24 }}>
          {/* Physical */}
          {/* M-8: card padding unified to 28px (mobile) / 48px 40px (desktop). D-5: gold top-line */}
          <div className="magnetic-card" onClick={() => navigate('shop-physical')} style={{ background: `linear-gradient(180deg, ${T.bg2} 0%, ${T.bg} 100%)`, border: `1px solid ${T.goldBorder}`, padding: isMobile ? '28px 20px' : '48px 40px', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: 0 }}>
            <div style={GOLD_LINE} />
            {/* M-9: icon box 48px mobile, 72px desktop */}
            <div style={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, border: `1px solid ${T.goldBorderStrong}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 20 : 32, fontFamily: T.serif, fontSize: isMobile ? 16 : 22, fontWeight: 500, color: T.gold, lineHeight: 1.05, letterSpacing: '0.08em' }}><span>AU</span><span>AG</span></div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: T.text, marginBottom: 16, lineHeight: 1.2 }}>{ko ? '실물 금·은 매매' : 'Physical Gold & Silver'}</h2>
            <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.8, marginBottom: 24, fontFamily: T.sans, flex: 1 }}>
              {ko ? 'LBMA 승인 골드·실버 바를 일회성으로 구매합니다. 국제 현물가 + 투명한 프리미엄으로 고객님 명의 금고에 즉시 배분.' : 'One-time purchase of LBMA-approved bars and coins. Allocated directly to your vault at international spot price plus a transparent premium.'}
            </p>
            {(ko ? ['1 oz ~ 1 kg 바 · 1/2 oz 코인', '한 번의 결제 · 영구 보관', '유선·카드·암호화폐 결제 지원'] : ['Bars 1 oz–1 kg · Coins from 1/2 oz', 'One-time purchase, permanent allocation', 'Wire, card, and crypto supported']).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px dashed rgba(197,165,114,0.15)` : 'none', fontSize: 14, color: T.text, fontFamily: T.sans }}>
                <span style={{ color: T.gold, fontFamily: T.mono, flexShrink: 0 }}>—</span>{item}
              </div>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${T.goldBorder}`, display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 12, letterSpacing: '0.15em', color: T.gold, textTransform: 'uppercase' }}>
              <span>{ko ? '제품 둘러보기' : 'Browse Products'}</span><span>→</span>
            </div>
          </div>

          {/* AGP — D-5: gold top-line already prominent */}
          <div className="magnetic-card" onClick={() => navigate('agp-intro')} style={{ position: 'relative', background: `linear-gradient(180deg, ${T.goldGlow} 0%, ${T.bg} 100%)`, border: `1px solid rgba(197,165,114,0.35)`, padding: isMobile ? '28px 20px' : '48px 40px', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', borderRadius: 0 }}>
            <div style={GOLD_LINE} />
            <div style={{ position: 'absolute', top: 24, right: 24 }}><Badge>추천</Badge></div>
            {/* M-9: icon box 48px mobile */}
            <div style={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, border: `1px solid ${T.goldBorderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 20 : 32, fontFamily: T.serif, fontSize: isMobile ? 18 : 24, fontWeight: 500, color: T.gold, letterSpacing: '0.06em' }}>AGP</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: T.text, marginBottom: 16, lineHeight: 1.2 }}>{ko ? 'AGP 적금 Plan' : 'AGP 적금 Plan'}</h2>
            <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.8, marginBottom: 24, fontFamily: T.sans, flex: 1 }}>
              {ko ? '월 20만원부터 시작하는 그램 단위 자동 적립. 토스뱅크 자동이체, 신용카드, 암호화폐로 입금하고 100g 도달 시 실물 바로 무료 전환.' : 'Automated gram accumulation from KRW 200,000/month. Fund via Toss Bank, credit card, or crypto — convert free to a physical bar at 100g.'}
            </p>
            {(ko ? ['월 200,000원부터 시작', '매일·매주·매월 자동 적립', '100g 도달 시 실물 바 무료 전환'] : ['Start from KRW 200,000/month', 'Daily, weekly, or monthly auto-debit', 'Free conversion to physical at 100g']).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px dashed rgba(197,165,114,0.15)` : 'none', fontSize: 14, color: T.text, fontFamily: T.sans }}>
                <span style={{ color: T.gold, fontFamily: T.mono, flexShrink: 0 }}>—</span>{item}
              </div>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid rgba(197,165,114,0.3)`, display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 12, letterSpacing: '0.15em', color: T.gold, textTransform: 'uppercase' }}>
              <span>{ko ? 'AGP 시작하기' : 'Begin Enrollment'}</span><span>→</span>
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: T.textMuted, fontFamily: T.sans, lineHeight: 1.9 }}>
          {ko ? <>모든 귀금속은 싱가포르 Malca-Amit FTZ에 완전 배분 보관됩니다. Lloyd's of London 보험 적용. <FlagSG /></> : <>All precious metals are fully allocated at Malca-Amit Singapore FTZ. Insured by Lloyd's of London. <FlagSG /></>}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOP PAGE — product grid
   M-7 + M-10 + M-11: container, filter bar, product card fixes
   ═══════════════════════════════════════════════════════════════════════ */
export function ShopPage({ lang, navigate, setProduct, prices, krwRate, addToCart, toast, currency, setCurrency }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('all');
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);

  const filters = [
    { k: 'all',    ko: '전체',  en: 'All' },
    { k: 'gold',   ko: '금',    en: 'Gold' },
    { k: 'silver', ko: '은',    en: 'Silver' },
    { k: 'bar',    ko: '바',    en: 'Bars' },
    { k: 'coin',   ko: '코인',  en: 'Coins' },
  ];
  const filtered = PRODUCTS.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'gold' || filter === 'silver') return p.metal === filter;
    return p.type === filter;
  });

  return (
    // M-7: use aurum-container
    <div style={{ background: T.bg, minHeight: '85vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 32 : 60, paddingBottom: isMobile ? 40 : 60 }}>
        {/* M-10: header — separated back/title from filter row for cleaner mobile layout */}
        <div style={{ marginBottom: 32 }}>
          {/* Row 1: back + title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <button onClick={() => navigate('shop')} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: T.sans, marginBottom: 8, display: 'block', padding: 0 }}>← {ko ? '매장으로' : 'Back to Shop'}</button>
              <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px,4vw,40px)', fontWeight: 500, color: T.text, margin: 0 }}>{ko ? '실물 금·은 제품' : 'Physical Gold & Silver'}</h1>
            </div>
            {/* Currency toggle — right of title */}
            <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '6px 14px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, alignSelf: 'flex-end' }}>
              {currency === 'KRW' ? '₩ / $' : '$ / ₩'}
            </button>
          </div>
          {/* Row 2: filter pills — own row on mobile */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{
                background: filter === f.k ? T.gold : 'transparent', color: filter === f.k ? '#0a0a0a' : T.textMuted,
                border: `1px solid ${filter === f.k ? T.gold : T.border}`, padding: '5px 14px', borderRadius: 20,
                cursor: 'pointer', fontSize: 12, fontFamily: T.sans, fontWeight: filter === f.k ? 600 : 400,
              }}>{ko ? f.ko : f.en}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(product => {
            const price = calcPrice(product, prices);
            return (
              <div key={product.id} className="lift-card" style={{ background: product.metal === 'gold' ? T.bgCard : T.bg1, border: `1px solid ${product.metal === 'gold' ? T.goldBorder : T.border}`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                onClick={() => { setProduct(product); navigate('product'); }}>
                {/* D-5: gold top-line on gold products */}
                {product.metal === 'gold' && <div style={GOLD_LINE} />}
                {/* M-11: tighter image area padding on mobile */}
                <div style={{ padding: isMobile ? '20px 20px 16px' : '28px 24px 20px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
                  <div style={{ fontSize: isMobile ? 40 : 52, marginBottom: 12, filter: 'drop-shadow(0 0 20px rgba(197,165,114,0.2))' }}>{product.image}</div>
                  <Badge>{product.metal === 'gold' ? (ko ? '금' : 'GOLD') : (ko ? '은' : 'SILVER')}</Badge>
                </div>
                <div style={{ padding: isMobile ? '16px 20px 20px' : '20px 24px 24px' }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>{product.mint}</div>
                  {/* Issue 8: overflow protection for long names */}
                  <h3 style={{ fontFamily: T.sansKr, fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 6, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ko ? product.nameKo : product.name}</h3>
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub, lineHeight: 1.95, marginBottom: 18 }}>{product.descKo}</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[product.weight, product.purity, product.type === 'bar' ? (ko ? '바' : 'Bar') : (ko ? '코인' : 'Coin')].map((tag, i) => (
                      <span key={i} style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, border: `1px solid ${T.border}`, padding: '3px 8px', letterSpacing: '0.1em' }}>{tag}</span>
                    ))}
                  </div>
                  {/* Issue 7: storage rate from user tier */}
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.08em', marginBottom: 12 }}>
                    {ko ? '보관료' : 'Storage'}: {getStorageRate(user)}% p.a. · Malca-Amit SG
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {/* Issue 9: ₩ in sans font */}
                      <div style={{ fontFamily: T.sans, fontSize: 20, color: T.gold, fontWeight: 600 }}>{fP(price)}</div>
                      {currency === 'KRW' && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>≈ {fUSD(price)}</div>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); addToCart(product); toast(ko ? '장바구니에 추가됨' : 'Added to cart'); }} style={{
                      background: T.gold, border: 'none', color: '#0a0a0a', padding: '9px 18px',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans, borderRadius: 0,
                    }}>+ {ko ? '담기' : 'Add'}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCT PAGE — detail
   M-12 + M-13: image area padding + aurum-container
   ═══════════════════════════════════════════════════════════════════════ */
export function ProductPage({ product, lang, navigate, prices, krwRate, user, setShowLogin, addToCart, toast, currency, setCurrency }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [qty, setQty] = useState(1);
  const [storage, setStorage] = useState('singapore');

  if (!product) { navigate('shop-physical'); return null; }

  const price = calcPrice(product, prices);
  const fP = usd => currency === 'KRW' ? fKRW(usd * krwRate) : fUSD(usd);
  const storageFee = storage === 'singapore' ? 0.15 : 0;

  const handleAdd = () => {
    addToCart(product, qty, storage);
    toast(ko ? `${ko ? product.nameKo : product.name} 장바구니에 추가됨` : `Added to cart`);
  };

  return (
    // M-13: use aurum-container
    <div style={{ background: T.bg, minHeight: '85vh' }}>
      <div className="aurum-container" style={{ paddingTop: isMobile ? 28 : 56, paddingBottom: isMobile ? 40 : 72 }}>
        <button onClick={() => navigate('shop-physical')} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: T.sans, marginBottom: 28, padding: 0 }}>← {ko ? '제품 목록' : 'Products'}</button>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 48 }}>
          {/* Visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* M-12: reduced image area padding on mobile */}
            <div style={{ background: `linear-gradient(135deg, ${T.bg2}, ${T.bg3})`, border: `1px solid ${T.goldBorder}`, padding: isMobile ? '40px 24px' : '60px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={GOLD_LINE} />
              <div style={{ fontSize: isMobile ? 72 : 96, marginBottom: 16, filter: 'drop-shadow(0 0 40px rgba(197,165,114,0.3))' }}>{product.image}</div>
              <div style={{ fontFamily: T.serif, fontSize: 14, color: T.goldDim, fontStyle: 'italic' }}>{product.mint}</div>
            </div>
            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 600 }}>Lloyd's of London — {ko ? '완전 보험 적용' : 'Fully Insured'}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted }}>{ko ? '구매 즉시 보험 적용. Malca-Amit SG FTZ 보관.' : 'Insured immediately. Stored at Malca-Amit SG FTZ.'}</div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <Badge style={{ marginBottom: 16 }}>{product.metal === 'gold' ? (ko ? '금' : 'GOLD') : (ko ? '은' : 'SILVER')} · {product.purity}</Badge>
            <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 500, color: T.text, margin: '12px 0 8px', lineHeight: 1.2 }}>{ko ? product.nameKo : product.name}</h1>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, marginBottom: 24 }}>{product.descKo}</p>

            {/* Price */}
            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '20px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={GOLD_LINE} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>단가 (1{product.type === 'bar' ? '바' : '개'})</span>
                <button onClick={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')} style={{ background: 'none', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '3px 10px', cursor: 'pointer', fontFamily: T.mono, fontSize: 10 }}>{currency} ⇄</button>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 28, color: T.gold, fontWeight: 700 }}>{fP(price)}</div>
              {currency === 'KRW' && <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textMuted }}>≈ {fUSD(price)}</div>}
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 8 }}>프리미엄 +{(product.premium * 100).toFixed(1)}% · 현물가 기준</div>
            </div>

            {/* Qty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>{ko ? '수량' : 'Qty'}:</span>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, background: T.bg1, border: `1px solid ${T.border}`, color: T.text, cursor: 'pointer', fontFamily: T.mono }}>−</button>
              <span style={{ fontFamily: T.mono, fontSize: 16, color: T.text, minWidth: 28, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, background: T.bg1, border: `1px solid ${T.border}`, color: T.text, cursor: 'pointer', fontFamily: T.mono }}>+</button>
              <span style={{ fontFamily: T.mono, fontSize: 14, color: T.gold, marginLeft: 8 }}>{fP(price * qty)}</span>
            </div>

            {/* Storage */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginBottom: 8 }}>{ko ? '보관 옵션' : 'Storage'}</div>
              {[
                { k: 'singapore', label: ko ? '싱가포르 Malca-Amit FTZ' : 'Singapore Malca-Amit FTZ', fee: ko ? '₩3,000/g/년 (연간 from 0.30% p.a.)' : 'from 0.30% p.a. p.a.' },
              ].map(opt => (
                <button key={opt.k} onClick={() => setStorage(opt.k)} style={{
                  width: '100%', background: storage === opt.k ? T.goldGlow : T.bg1,
                  border: `1px solid ${storage === opt.k ? T.goldBorderStrong : T.border}`,
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text }}>{opt.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.gold }}>{opt.fee}</span>
                </button>
              ))}
            </div>

            <button onClick={handleAdd} style={{ width: '100%', background: T.gold, border: 'none', color: '#0a0a0a', padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans, marginBottom: 10 }}>
              {ko ? '장바구니에 담기' : 'Add to Cart'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: T.textMuted, fontFamily: T.sans }}>
              {ko ? '구매 즉시 Malca-Amit SG FTZ 금고에 배분 보관됩니다.' : 'Allocated to vault immediately upon purchase.'}
            </p>

            {/* Specs */}
            <div style={{ marginTop: 24, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
              {[
                [ko ? '중량' : 'Weight', product.weight],
                [ko ? '순도' : 'Purity', product.purity],
                [ko ? '제조사' : 'Mint', product.mint],
                [ko ? 'LBMA 승인' : 'LBMA Approved', '✓'],
                [ko ? '보관' : 'Storage', 'Malca-Amit SG FTZ'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>{k}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
