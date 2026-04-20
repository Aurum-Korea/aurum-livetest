import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { AGP_CREDITS, TOTAL_CREDITS, fUSD, OZ_G, KR_RETAIL_MARKUP, SAVINGS_APY } from '../lib/constants';
import { useAuth } from '../lib/auth';


/* ═══════════════════════════════════════════════════════════════════════════
   AURUM · /shop · v3 · EDITORIAL CATALOG REDESIGN
   
   Per user directive:
   · Removed the two category-split boxes (they were ugly)
   · Museum-catalog product rendering — stylized SVG bars & coins, not emoji
   · KYC deferred — shop is browsable without signup/KYC, only checkout requires it
   · 만원 / 억원 formatting throughout
   · V4 Quiet footer (2-line Roman numeral only)
   
   Design research inspired by Patek Philippe, Cartier, Net-a-Porter patterns:
   · Reference-number treatment (MINT + ref code beneath each product)
   · Generous negative space per product
   · No prominent CTA on card — the object IS the hero
   · Filter as inline text links with dividers (not chips)
   · Editorial section header ("A small catalog")
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS · from source /lib/index.jsx PRODUCTS + reference codes added
// ═══════════════════════════════════════════════════════════════════════════
const PRODUCTS = [
  { id: 1, ref: 'AU-1oz-PAMP-001', name: '1 oz Gold Bar — PAMP Suisse', nameKo: '1 온스 금바 — PAMP 스위스', metal: 'gold', type: 'bar', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'PAMP Suisse', premium: 0.06, inStock: true, descKo: '세계에서 가장 인지도 높은 금바. LBMA 인증 PAMP Suisse 제조.' },
  { id: 2, ref: 'AU-1KG-HER-002', name: '1 kg Gold Bar — Heraeus', nameKo: '1 kg 금바 — 헤레우스', metal: 'gold', type: 'bar', weight: '1 kg', weightOz: 32.1507, purity: '99.99%', mint: 'Heraeus', premium: 0.05, inStock: true, descKo: '기관·고액 투자자 선호. 최저 프리미엄, 독일 헤레우스 제조.' },
  { id: 3, ref: 'AU-1oz-RCM-003', name: '1 oz Gold Maple Leaf', nameKo: '1 온스 골드 메이플리프', metal: 'gold', type: 'coin', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'Royal Canadian Mint', premium: 0.06, inStock: true, descKo: '캐나다 왕립 조폐국 발행. 세계적으로 가장 많이 거래되는 금화.' },
  { id: 4, ref: 'AU-1oz-SAM-004', name: '1 oz Gold Krugerrand', nameKo: '1 온스 골드 크루거랜드', metal: 'gold', type: 'coin', weight: '1 oz', weightOz: 1, purity: '91.67%', mint: 'South African Mint', premium: 0.06, inStock: true, descKo: '세계 최초 투자용 금화 (1967). 남아프리카공화국 조폐국 제조.' },
  { id: 5, ref: 'AG-100oz-PAMP-005', name: '100 oz Silver Bar — PAMP', nameKo: '100 온스 은바 — PAMP', metal: 'silver', type: 'bar', weight: '100 oz', weightOz: 100, purity: '99.99%', mint: 'PAMP Suisse', premium: 0.06, inStock: true, descKo: '대규모 은 투자에 최적. PAMP 스위스 제조, LBMA 인증.' },
  { id: 6, ref: 'AG-1oz-RCM-006', name: '1 oz Silver Maple Leaf', nameKo: '1 온스 실버 메이플리프', metal: 'silver', type: 'coin', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'Royal Canadian Mint', premium: 0.08, inStock: true, descKo: '캐나다 왕립 조폐국 발행 순은 동전. 컬렉터·투자자 선호.' },
  { id: 7, ref: 'AG-1KG-HER-007', name: '1 kg Silver Bar — Heraeus', nameKo: '1 kg 은바 — 헤레우스', metal: 'silver', type: 'bar', weight: '1 kg', weightOz: 32.1507, purity: '99.99%', mint: 'Heraeus', premium: 0.06, inStock: true, descKo: '독일 헤레우스 제조 순은 바. 표준 규격.' },
  { id: 8, ref: 'AU-10oz-VAL-008', name: '10 oz Gold Bar — Valcambi', nameKo: '10 온스 금바 — 발캄비', metal: 'gold', type: 'bar', weight: '10 oz', weightOz: 10, purity: '99.99%', mint: 'Valcambi', premium: 0.055, inStock: true, descKo: '스위스 발캄비 제조 10온스 금바. 개인 고액 투자자에게 적합.' },
];

const SPOT_USD = 4842.10;
const FX_KRW = 1440.20;
const AURUM_MARKUP = 1.08;
const SILVER_FACTOR = 0.012;

function calcPrice(p) {
  const base = p.metal === 'gold' ? SPOT_USD : (SPOT_USD * SILVER_FACTOR);
  const withPremium = base * p.weightOz * (1 + p.premium);
  const aurumPrice = withPremium * AURUM_MARKUP;
  return { usd: aurumPrice, krw: aurumPrice * FX_KRW };
}

function fKRW(n) {
  const abs = Math.abs(n);
  if (abs >= 100_000_000) return '₩' + (abs / 100_000_000).toFixed(2).replace(/\.?0+$/, '') + '억원';
  if (abs >= 10_000) return '₩' + Math.round(abs / 10_000).toLocaleString() + '만원';
  return '₩' + Math.round(abs).toLocaleString() + '원';
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLIZED PRODUCT SVGs · replacing emojis with museum-catalog rendering
// ═══════════════════════════════════════════════════════════════════════════
function GoldBarSVG({ size = 1 }) {
  // Size 1 = 1oz, size 10 = 10oz, etc. Visual scale subtle.
  const scale = Math.min(1.15, 0.85 + Math.log(size + 1) * 0.08);
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" className="product-svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="bar-face" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a2418" />
          <stop offset="14%" stopColor="#6a5a3a" />
          <stop offset="38%" stopColor="#C5A572" />
          <stop offset="52%" stopColor="#E3C187" />
          <stop offset="66%" stopColor="#F2D4A0" />
          <stop offset="82%" stopColor="#C5A572" />
          <stop offset="100%" stopColor="#4a3a20" />
        </linearGradient>
        <linearGradient id="bar-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F2D4A0" />
          <stop offset="100%" stopColor="#8a7448" />
        </linearGradient>
        <filter id="bar-shadow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {/* Drop shadow */}
      <ellipse cx="200" cy={170 + (scale * 5)} rx={120 * scale} ry="6" fill="#000" opacity="0.55" filter="url(#bar-shadow)" />
      {/* Main face */}
      <g transform={`translate(200,100) scale(${scale}) translate(-200,-100)`}>
        <rect x="80" y="60" width="240" height="100" fill="url(#bar-face)" rx="2" />
        {/* Top bevel */}
        <polygon points="80,60 96,48 336,48 320,60" fill="url(#bar-top)" opacity="0.85" />
        {/* Right bevel */}
        <polygon points="320,60 336,48 336,148 320,160" fill="#6a5a3a" opacity="0.65" />
        {/* Engraved markings */}
        <text x="200" y="92" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontWeight="600" fontSize="22" fill="rgba(40,26,12,0.9)" letterSpacing="0.02em">AURUM</text>
        <text x="200" y="116" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.3em" fill="rgba(40,26,12,0.78)" fontWeight="700">999.9 FINE GOLD</text>
        <text x="200" y="138" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7" letterSpacing="0.28em" fill="rgba(40,26,12,0.5)">LBMA · CERTIFIED</text>
        {/* Corner serial */}
        <text x="310" y="155" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="rgba(40,26,12,0.4)" letterSpacing="0.12em">SN·MMXXVI</text>
      </g>
    </svg>
  );
}

function SilverBarSVG({ size = 1 }) {
  const scale = Math.min(1.15, 0.85 + Math.log(size + 1) * 0.08);
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" className="product-svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sil-face" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3a3a42" />
          <stop offset="14%" stopColor="#6a6a72" />
          <stop offset="38%" stopColor="#aaaab4" />
          <stop offset="52%" stopColor="#d4d4dc" />
          <stop offset="66%" stopColor="#e8e8ec" />
          <stop offset="82%" stopColor="#aaaab4" />
          <stop offset="100%" stopColor="#4a4a52" />
        </linearGradient>
        <linearGradient id="sil-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e8ec" />
          <stop offset="100%" stopColor="#7a7a82" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy={170 + (scale * 5)} rx={120 * scale} ry="6" fill="#000" opacity="0.55" />
      <g transform={`translate(200,100) scale(${scale}) translate(-200,-100)`}>
        <rect x="80" y="60" width="240" height="100" fill="url(#sil-face)" rx="2" />
        <polygon points="80,60 96,48 336,48 320,60" fill="url(#sil-top)" opacity="0.85" />
        <polygon points="320,60 336,48 336,148 320,160" fill="#5a5a62" opacity="0.65" />
        <text x="200" y="92" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontWeight="600" fontSize="22" fill="rgba(30,30,36,0.85)" letterSpacing="0.02em">AURUM</text>
        <text x="200" y="116" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.3em" fill="rgba(30,30,36,0.72)" fontWeight="700">999.9 FINE SILVER</text>
        <text x="200" y="138" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7" letterSpacing="0.28em" fill="rgba(30,30,36,0.48)">LBMA · CERTIFIED</text>
      </g>
    </svg>
  );
}

function GoldCoinSVG({ purity }) {
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" className="product-svg" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="coin-face" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F2D4A0" />
          <stop offset="28%" stopColor="#E3C187" />
          <stop offset="62%" stopColor="#C5A572" />
          <stop offset="86%" stopColor="#8a7448" />
          <stop offset="100%" stopColor="#4a3a20" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="165" rx="70" ry="6" fill="#000" opacity="0.55" />
      <circle cx="200" cy="100" r="68" fill="url(#coin-face)" />
      {/* Rim */}
      <circle cx="200" cy="100" r="68" fill="none" stroke="rgba(255,228,180,0.35)" strokeWidth="0.8" />
      <circle cx="200" cy="100" r="60" fill="none" stroke="rgba(40,26,12,0.3)" strokeWidth="0.6" />
      <circle cx="200" cy="100" r="54" fill="none" stroke="rgba(40,26,12,0.15)" strokeWidth="0.4" strokeDasharray="2 2" />
      {/* Center motif */}
      <text x="200" y="112" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontWeight="600" fontSize="36" fill="rgba(40,26,12,0.82)" letterSpacing="-0.02em">Au</text>
      {/* Purity arc top */}
      <text x="200" y="72" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(40,26,12,0.58)" letterSpacing="0.24em" fontWeight="700">{purity}</text>
      <text x="200" y="142" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="rgba(40,26,12,0.45)" letterSpacing="0.24em">1 OZ · AURUM</text>
    </svg>
  );
}

function SilverCoinSVG({ purity }) {
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" className="product-svg" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="sil-coin-face" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#e8e8ec" />
          <stop offset="28%" stopColor="#d4d4dc" />
          <stop offset="62%" stopColor="#aaaab4" />
          <stop offset="86%" stopColor="#6a6a72" />
          <stop offset="100%" stopColor="#3a3a42" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="165" rx="70" ry="6" fill="#000" opacity="0.55" />
      <circle cx="200" cy="100" r="68" fill="url(#sil-coin-face)" />
      <circle cx="200" cy="100" r="68" fill="none" stroke="rgba(232,232,236,0.35)" strokeWidth="0.8" />
      <circle cx="200" cy="100" r="60" fill="none" stroke="rgba(30,30,36,0.3)" strokeWidth="0.6" />
      <circle cx="200" cy="100" r="54" fill="none" stroke="rgba(30,30,36,0.15)" strokeWidth="0.4" strokeDasharray="2 2" />
      <text x="200" y="112" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontWeight="600" fontSize="36" fill="rgba(30,30,36,0.82)" letterSpacing="-0.02em">Au</text>
      <text x="200" y="72" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(30,30,36,0.58)" letterSpacing="0.24em" fontWeight="700">{purity}</text>
      <text x="200" y="142" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="rgba(30,30,36,0.45)" letterSpacing="0.24em">1 OZ · AURUM</text>
    </svg>
  );
}

function ProductRender({ p }) {
  if (p.type === 'bar' && p.metal === 'gold') return <GoldBarSVG size={p.weightOz} />;
  if (p.type === 'bar' && p.metal === 'silver') return <SilverBarSVG size={p.weightOz} />;
  if (p.type === 'coin' && p.metal === 'gold') return <GoldCoinSVG purity={p.purity} />;
  if (p.type === 'coin' && p.metal === 'silver') return <SilverCoinSVG purity={p.purity} />;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHROME
// ═══════════════════════════════════════════════════════════════════════════
function ShopNav({ page, cartCount, onCartClick }) {
  return (
    <div style={{ padding: '12px 24px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button onClick={onCartClick} style={{
          background: cartCount > 0 ? T.goldGlow : 'transparent',
          border: `1px solid ${cartCount > 0 ? T.goldBorderS : T.border}`,
          color: cartCount > 0 ? T.gold : T.sub,
          padding: '6px 14px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          CART <span style={{ fontWeight: 700 }}>{cartCount}</span>
        </button>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// FILTER BAR · editorial text-link style (not chip bar)
// ═══════════════════════════════════════════════════════════════════════════
function EditorialFilter({ filters, setFilters, count }) {
  const setMetal = (v) => setFilters({ ...filters, metal: v });
  const setType = (v) => setFilters({ ...filters, type: v });

  const linkStyle = (active) => ({
    fontFamily: active ? T.serif : T.mono,
    fontStyle: active ? 'italic' : 'normal',
    fontSize: active ? 16 : 11,
    fontWeight: active ? 500 : 600,
    letterSpacing: active ? '0.04em' : '0.18em',
    color: active ? T.goldB : T.muted,
    background: 'transparent', border: 'none', padding: '4px 0',
    cursor: 'pointer', transition: 'color 0.2s',
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20, paddingBottom: 18,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginRight: 8 }}>METAL</span>
          <button onClick={() => setMetal('all')} style={linkStyle(filters.metal === 'all')}>All</button>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <button onClick={() => setMetal('gold')} style={linkStyle(filters.metal === 'gold')}>Gold · 금</button>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <button onClick={() => setMetal('silver')} style={linkStyle(filters.metal === 'silver')}>Silver · 은</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginRight: 8 }}>FORM</span>
          <button onClick={() => setType('all')} style={linkStyle(filters.type === 'all')}>All</button>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <button onClick={() => setType('bar')} style={linkStyle(filters.type === 'bar')}>Bars · 바</button>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <button onClick={() => setType('coin')} style={linkStyle(filters.type === 'coin')}>Coins · 코인</button>
        </div>

        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.18em' }}>
          {count} of {PRODUCTS.length} · 제품
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD · editorial, museum-catalog style
// ═══════════════════════════════════════════════════════════════════════════
function ProductCard({ p, onAdd, i }) {
  const price = calcPrice(p);
  const isGold = p.metal === 'gold';

  return (
    <div className="editorial-card" style={{
      background: T.bg,
      borderTop: `1px solid ${T.border}`,
      borderLeft: `1px solid ${T.border}`,
      borderRight: `1px solid ${T.border}`,
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      animation: `lift-in 0.5s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.04}s both`,
      cursor: 'pointer',
    }} onClick={() => onAdd(p)}
       onMouseEnter={e => { e.currentTarget.style.borderTopColor = T.goldBorderS; }}
       onMouseLeave={e => { e.currentTarget.style.borderTopColor = T.border; }}>

      {/* Reference code — top */}
      <div style={{
        padding: '14px 18px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        borderBottom: `1px dashed ${T.border}`,
      }}>
        <span style={{
          fontFamily: T.mono, fontSize: 9, color: T.goldD,
          letterSpacing: '0.18em', fontWeight: 600,
        }}>
          {p.mint.toUpperCase()}
        </span>
        <span style={{
          fontFamily: T.mono, fontSize: 9, color: T.muted,
          letterSpacing: '0.14em',
        }}>
          {p.ref}
        </span>
      </div>

      {/* Product rendering · generous space */}
      <div style={{
        padding: '40px 24px',
        background: `radial-gradient(ellipse at center top, ${isGold ? 'rgba(197,165,114,0.06)' : 'rgba(192,192,192,0.04)'} 0%, transparent 70%)`,
        minHeight: 220,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 320, aspectRatio: '2/1' }}>
          <ProductRender p={p} />
        </div>
      </div>

      {/* Title block */}
      <div style={{ padding: '18px 20px 16px', flex: 1, borderTop: `1px dashed ${T.border}` }}>
        <div style={{
          fontFamily: T.serifKr, fontSize: 16, color: T.text,
          fontWeight: 500, lineHeight: 1.3, marginBottom: 4,
        }}>
          {p.nameKo}
        </div>
        <div style={{
          fontFamily: T.serif, fontStyle: 'italic', fontSize: 13,
          color: T.goldD, lineHeight: 1.4,
        }}>
          {p.name}
        </div>
      </div>

      {/* Spec + price · quiet bottom row */}
      <div style={{
        padding: '14px 20px', borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: T.bg1,
      }}>
        <div style={{
          fontFamily: T.mono, fontSize: 10, color: T.muted,
          letterSpacing: '0.14em',
        }}>
          {p.weight} · {p.purity}
        </div>
        <div style={{
          fontFamily: T.mono, fontSize: 14,
          color: isGold ? T.goldB : T.silver,
          fontWeight: 700, letterSpacing: '0.02em',
        }}>
          {fKRW(price.krw)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CART DRAWER · KYC-deferred variant
// ═══════════════════════════════════════════════════════════════════════════
function CartDrawer({ open, cart, onClose, onRemove, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + calcPrice(item).krw * item.qty, 0);
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99,
        backdropFilter: 'blur(4px)', animation: 'fade-up 0.2s both',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 420, background: T.bg1,
        borderLeft: `1px solid ${T.goldBorderS}`, zIndex: 100,
        padding: '24px 22px', overflowY: 'auto',
        animation: 'slide-in-right 0.3s cubic-bezier(0.2,0.8,0.2,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.28em' }}>CART · 장바구니</div>
            <div style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, fontWeight: 500, marginTop: 4 }}>{cart.length} 품목</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '6px 10px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer' }}>
            ✕ 닫기
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted, fontFamily: T.serifKr, fontSize: 15 }}>
            장바구니가 비어있습니다.
          </div>
        ) : (
          <>
            {cart.map((item, i) => {
              const price = calcPrice(item);
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 12,
                  padding: '16px 0', borderBottom: `1px solid ${T.border}`,
                  alignItems: 'center',
                }}>
                  <div style={{ width: 70, height: 40 }}>
                    <ProductRender p={item} />
                  </div>
                  <div>
                    <div style={{ fontFamily: T.serifKr, fontSize: 13, color: T.text, fontWeight: 500, lineHeight: 1.3 }}>
                      {item.nameKo}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.12em', marginTop: 3 }}>
                      {item.weight} · ×{item.qty}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.goldB, fontWeight: 600, marginTop: 4 }}>
                      {fKRW(price.krw * item.qty)}
                    </div>
                  </div>
                  <button onClick={() => onRemove(i)} style={{
                    background: 'transparent', border: `1px solid ${T.border}`, color: T.muted,
                    padding: '6px 8px', fontFamily: T.mono, fontSize: 10, cursor: 'pointer',
                  }}>✕</button>
                </div>
              );
            })}

            <div style={{ marginTop: 24, padding: '20px 0', borderTop: `2px solid ${T.goldBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.18em' }}>SUBTOTAL</span>
                <span style={{ fontFamily: T.mono, fontSize: 16, color: T.text, fontWeight: 700 }}>{fKRW(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.18em' }}>STORAGE · SINGAPORE</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.green }}>FREE · 첫 12개월</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, borderTop: `1px dashed ${T.border}`, marginBottom: 20 }}>
                <span style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, fontWeight: 500 }}>합계 · TOTAL</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.goldB, fontWeight: 600 }}>{fKRW(subtotal)}</span>
              </div>

              {/* KYC-deferred notice · this is where it gates */}
              <div style={{
                padding: '14px 16px', marginBottom: 16,
                background: 'rgba(197,165,114,0.04)', border: `1px dashed ${T.goldBorder}`,
              }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 6 }}>
                  ⓘ 결제 전 본인인증 필요
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.7 }}>
                  장바구니는 자유롭게 사용 가능. 결제 시 KYC 완료 필요 (약 3분). MAS PSPM 2019 규정.
                </div>
              </div>

              <button onClick={onCheckout} style={{
                width: '100%', background: T.gold, color: T.bg,
                padding: '15px 20px', fontFamily: T.sans, fontWeight: 700,
                fontSize: 13, letterSpacing: '0.1em', border: 'none', cursor: 'pointer',
                marginBottom: 10,
              }}>
                결제 진행 → KYC · CHECKOUT →
              </button>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: 'center', letterSpacing: '0.14em', lineHeight: 1.6 }}>
                TossPay · KakaoPay · Wire · Crypto
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function ShopPage() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [filters, setFilters] = useState({ metal: 'all', type: 'all' });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');

  const handleCheckout = () => {
    setCartOpen(false);
    // Not authed → send to signup, KycPage will complete auth
    // Authed → send to terminal order ticket
    navigate(isAuthed ? '/terminal' : '/signup');
  };

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    if (filters.metal !== 'all' && p.metal !== filters.metal) return false;
    if (filters.type !== 'all' && p.type !== filters.type) return false;
    return true;
  }), [filters]);

  const handleAdd = (p) => {
    setCart(prev => {
      const found = prev.findIndex(i => i.id === p.id);
      if (found >= 0) {
        const next = [...prev];
        next[found] = { ...next[found], qty: next[found].qty + 1 };
        return next;
      }
      return [...prev, { ...p, qty: 1 }];
    });
    setToast(`${p.nameKo} 추가됨`);
    setTimeout(() => setToast(''), 2200);
  };

  const handleRemove = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <>
      <TickerBar />
      <QuietNav page="shop" />
      <ShopNav page="shop" cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      {/* Editorial hero — no category boxes, just the page itself */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 22 }}>
          CATALOG · MMXXVI · SPRING
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(44px, 7vw, 72px)', fontWeight: 400, color: T.text, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          A small <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>catalog.</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(17px, 2.4vw, 22px)', color: T.goldD, fontWeight: 300, marginBottom: 30 }}>
          Eight objects. Each one weighed, stamped, witnessed.
        </div>
        <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.85, maxWidth: 560, margin: '0 auto' }}>
          모든 제품은 LBMA 인증 정제소 제조, 싱가포르 Malca-Amit FTZ 즉시 보관. 장바구니는 로그인 없이 사용 가능하며, 결제 시 본인인증이 필요합니다.
        </div>
      </div>

      {/* Editorial filter */}
      <EditorialFilter filters={filters} setFilters={setFilters} count={filtered.length} />

      {/* Product grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', border: `1px dashed ${T.goldBorder}` }}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 36, color: T.goldD, marginBottom: 12 }}>—</div>
            <div style={{ fontFamily: T.serifKr, fontSize: 16, color: T.sub, marginBottom: 16 }}>선택한 조건에 맞는 제품이 없습니다.</div>
            <button onClick={() => setFilters({ metal: 'all', type: 'all' })} style={{
              background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold,
              padding: '10px 18px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.18em',
            }}>필터 초기화 · RESET</button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 22,
          }}>
            {filtered.map((p, i) => (
              <ProductCard key={p.id} p={p} onAdd={handleAdd} i={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footnote band — editorial caption, not compliance strip */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 40 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.goldD, lineHeight: 1.7, marginBottom: 16 }}>
            Every bar and coin is LBMA-certified, Singapore-vaulted,<br />
            and Lloyd's-insured — from the moment you add to cart.
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.24em' }}>
            MALCA-AMIT FTZ · LLOYD'S · BRINK'S · MAS PSPM 2019
          </div>
        </div>
      </div>

      <QuietFooter />

      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onRemove={handleRemove} onCheckout={handleCheckout} />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: T.goldB, color: T.bg,
          padding: '12px 20px', fontFamily: T.mono, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.14em', zIndex: 200,
          animation: 'fade-up 0.3s both',
        }}>
          ✓ {toast}
        </div>
      )}
    </>
  );
}
