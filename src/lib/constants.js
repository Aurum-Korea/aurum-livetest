// ═══════════════════════════════════════════════════════════════════════
// AURUM · CONSTANTS
// Membership tiers, AGP bonus credits, product catalog, price math.
// All source-doc aligned.
// ═══════════════════════════════════════════════════════════════════════

// ─── Membership tier ladder ─────────────────────────────────────────────
export const GATES = [
  { n: 'I',   ko: '브론즈',     en: 'Bronze',    gmv: 7_200_000,   disc: 1.0, monthlyMin: '₩200K+' },
  { n: 'II',  ko: '실버',       en: 'Silver',    gmv: 21_600_000,  disc: 1.5, monthlyMin: '₩500K+' },
  { n: 'III', ko: '골드',       en: 'Gold',      gmv: 50_400_000,  disc: 2.0, apex: true, monthlyMin: '₩1M+' },
  { n: 'IV',  ko: '플래티넘',   en: 'Platinum',  gmv: 93_600_000,  disc: 2.5, monthlyMin: '₩2M+' },
  { n: 'V',   ko: '소브린',     en: 'Sovereign', gmv: 144_000_000, disc: 3.0, monthlyMin: '₩5M+' },
];

// ─── AGP bonus credits (GoldPath only, per gate crossing) ───────────────
export const AGP_CREDITS = [
  { gate: 'I',   credit: 50_000,    desc: '브론즈 도달 크레딧' },
  { gate: 'II',  credit: 150_000,   desc: '실버 도달 크레딧' },
  { gate: 'III', credit: 400_000,   desc: '골드 도달 크레딧 · APEX', apex: true },
  { gate: 'IV',  credit: 1_000_000, desc: '플래티넘 도달 크레딧' },
  { gate: 'V',   credit: 2_500_000, desc: '소브린 도달 크레딧' },
];

export const TOTAL_CREDITS = AGP_CREDITS.reduce((a, b) => a + b.credit, 0); // ₩4.1M

// ─── Product catalog (from source /lib/index.jsx) ───────────────────────
export const PRODUCTS = [
  { id: 1, name: '1 oz Gold Bar — PAMP Suisse', nameKo: '1 온스 금바 — PAMP 스위스', metal: 'gold', type: 'bar', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'PAMP Suisse', premium: 0.06, image: '🥇', inStock: true, descKo: '세계에서 가장 인지도 높은 금바. LBMA 인증 PAMP Suisse 제조. Lady Fortuna 디자인.' },
  { id: 2, name: '1 kg Gold Bar — Heraeus', nameKo: '1 kg 금바 — 헤레우스', metal: 'gold', type: 'bar', weight: '1 kg', weightOz: 32.1507, purity: '99.99%', mint: 'Heraeus', premium: 0.05, image: '🥇', inStock: true, descKo: '기관·고액 투자자 선호. 최저 프리미엄으로 최대 효율. 독일 헤레우스 제조.' },
  { id: 3, name: '1 oz Gold Maple Leaf', nameKo: '1 온스 골드 메이플리프', metal: 'gold', type: 'coin', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'Royal Canadian Mint', premium: 0.06, image: '🪙', inStock: true, descKo: '캐나다 왕립 조폐국 발행. 세계적으로 가장 많이 거래되는 금화 중 하나.' },
  { id: 4, name: '1 oz Gold Krugerrand', nameKo: '1 온스 골드 크루거랜드', metal: 'gold', type: 'coin', weight: '1 oz', weightOz: 1, purity: '91.67%', mint: 'South African Mint', premium: 0.06, image: '🪙', inStock: true, descKo: '세계 최초 투자용 금화(1967년 발행). 남아프리카공화국 조폐국 제조.' },
  { id: 5, name: '100 oz Silver Bar — PAMP', nameKo: '100 온스 은바 — PAMP', metal: 'silver', type: 'bar', weight: '100 oz', weightOz: 100, purity: '99.99%', mint: 'PAMP Suisse', premium: 0.06, image: '🥈', inStock: true, descKo: '대규모 은 투자에 최적. PAMP 스위스 제조, LBMA 인증 순은 바.' },
  { id: 6, name: '1 oz Silver Maple Leaf', nameKo: '1 온스 실버 메이플리프', metal: 'silver', type: 'coin', weight: '1 oz', weightOz: 1, purity: '99.99%', mint: 'Royal Canadian Mint', premium: 0.08, image: '🥈', inStock: true, descKo: '캐나다 왕립 조폐국 발행 순은 동전. 컬렉터·투자자 모두 선호.' },
  { id: 7, name: '1 kg Silver Bar — Heraeus', nameKo: '1 kg 은바 — 헤레우스', metal: 'silver', type: 'bar', weight: '1 kg', weightOz: 32.1507, purity: '99.99%', mint: 'Heraeus', premium: 0.06, image: '🥈', inStock: true, descKo: '독일 헤레우스 제조 순은 바. 산업·투자 수요 모두 높은 표준 규격.' },
  { id: 8, name: '10 oz Gold Bar — Valcambi', nameKo: '10 온스 금바 — 발캄비', metal: 'gold', type: 'bar', weight: '10 oz', weightOz: 10, purity: '99.99%', mint: 'Valcambi', premium: 0.055, image: '🥇', inStock: true, descKo: '스위스 발캄비 제조 10온스 금바. 개인 고액 투자자에게 적합한 크기.' },
];

// ─── Price constants (locked projection-math baseline) ──────────────────
export const SPOT_USD = 4842.10;
export const FX_KRW = 1440.20;
export const OZ_G = 31.1035;
export const AURUM_MARKUP = 1.08;
export const KR_RETAIL_MARKUP = 1.20;
export const SILVER_FACTOR = 0.012;
export const SAVINGS_APY = 0.028;

// ─── Helpers ────────────────────────────────────────────────────────────
export function calcPrice(p) {
  const base = p.metal === 'gold' ? SPOT_USD : (SPOT_USD * SILVER_FACTOR);
  const withPremium = base * p.weightOz * (1 + p.premium);
  const aurumPrice = withPremium * AURUM_MARKUP;
  return { usd: aurumPrice, krw: aurumPrice * FX_KRW };
}

export function fKRW(n) {
  const abs = Math.abs(n);
  if (abs >= 100_000_000) return '₩' + (abs / 100_000_000).toFixed(2) + '억';
  if (abs >= 10_000) return '₩' + Math.round(abs / 10_000).toLocaleString() + '만';
  return '₩' + Math.round(abs).toLocaleString();
}

export function fUSD(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// ─── Canonical KRW formatter · 만원 / 억원 convention ───────────────────
// Koreans read amounts by 만 (10,000) and 억 (100,000,000), not 000,000,000.
// Rules:
//   n <  10,000          → '₩8,500원' (원 form)
//   n ≥ 10,000 & < 1억  → '500만원' / '2,000만원' / '6,820만원'
//   n ≥ 1억              → '1억 4,400만원' / '50억원' (drops trailing '0만원')
//
// Use this everywhere instead of raw toLocaleString. One source of truth.
export function fmtManEok(n, { withComma = true, compact = false } = {}) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? '−' : '';
  if (abs < 10_000) return sign + '₩' + abs.toLocaleString('ko-KR');
  const eok = Math.floor(abs / 100_000_000);
  const manPart = Math.floor((abs % 100_000_000) / 10_000);
  const wonPart = abs % 10_000;
  if (eok === 0) {
    const manStr = withComma ? manPart.toLocaleString('ko-KR') : String(manPart);
    if (compact && wonPart === 0) return sign + manStr + '만원';
    return sign + manStr + '만원';
  }
  const eokStr = withComma ? eok.toLocaleString('ko-KR') : String(eok);
  if (manPart === 0) return sign + eokStr + '억원';
  const manStr = withComma ? manPart.toLocaleString('ko-KR') : String(manPart);
  return sign + eokStr + '억 ' + manStr + '만원';
}

// Short form · for tight UI cells, drops '원' suffix.
// '500만' / '1억 4,400만' / '50억'
export function fmtManEokShort(n) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? '−' : '';
  if (abs < 10_000) return sign + '₩' + abs.toLocaleString('ko-KR');
  const eok = Math.floor(abs / 100_000_000);
  const manPart = Math.floor((abs % 100_000_000) / 10_000);
  if (eok === 0) return sign + '₩' + manPart.toLocaleString('ko-KR') + '만';
  if (manPart === 0) return sign + '₩' + eok.toLocaleString('ko-KR') + '억';
  return sign + '₩' + eok.toLocaleString('ko-KR') + '억 ' + manPart.toLocaleString('ko-KR') + '만';
}
