import { useState, useEffect, useCallback, useRef } from 'react';

// ─── JS Design Token Object ───────────────────────────────────────────────────
// Use T.gold, T.serif etc. in inline styles for full token parity with CSS vars
export const T = {
  bg:         '#0d0b08',
  bg1:        '#141108',
  bg2:        '#0f0d0a',
  bg3:        '#16140f',
  bgElevated: '#1c1a14',
  bgCard:     '#161309',
  gold:       '#C5A572',
  goldBright: '#E3C187',
  goldDim:    '#8a7d6b',
  goldDeep:   '#6a5a3a',
  goldGlow:   'rgba(197,165,114,0.08)',
  goldBorder: 'rgba(197,165,114,0.20)',
  goldBorderStrong: 'rgba(197,165,114,0.50)',
  text:       '#f5f0e8',
  textSub:    '#a0a0a0',
  textMuted:  '#888888',
  border:     '#242424',
  red:        '#f87171',
  green:      '#4ade80',
  amber:      '#f59e0b',
  blue:       '#60a5fa',
  serif:          "'Cormorant Garamond',Georgia,serif",
  serifKr:        "'Nanum Myeongjo','Noto Serif KR',serif",
  serifKrDisplay: "'Hahmlet','Nanum Myeongjo',serif",
  sans:           "'Pretendard','Outfit','Noto Sans KR',-apple-system,sans-serif",
  sansKr:         "'Pretendard','Noto Sans KR',sans-serif",
  mono:           "'JetBrains Mono','Courier New',monospace",
};

// ─── API Service Layer (stubbed — replace with live SDK) ──────────────────────
const _delay = ms => new Promise(r => setTimeout(r, ms));
const _genOrderId = () => 'AK-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000) + 100000);

export const API = {
  auth: {
    login:    async email => { await _delay(900); return { id: 'usr_'+Date.now(), email, name: email.split('@')[0], phone:'', kycStatus:'unverified', createdAt: new Date().toISOString() }; },
    register: async data  => { await _delay(1100); return { id: 'usr_'+Date.now(), ...data, kycStatus:'unverified', createdAt: new Date().toISOString() }; },
  },
  payments: {
    toss:   async () => { await _delay(1600); return { success:true, paymentKey:'toss_'+Date.now() }; },
    kakao:  async () => { await _delay(1600); return { success:true, tid:'kakao_'+Date.now() }; },
    wire:   async order => { await _delay(500); return { success:true, bankDetails:{ bank:'DBS Bank Singapore', accountName:'Aurum Korea Pte Ltd', accountNo:'003-938871-01-0', swift:'DBSSSGSG', reference:order.id, currency:'USD', amount:order.total } }; },
    card:   async () => { await _delay(1600); return { success:true, chargeId:'ch_'+Date.now() }; },
    crypto: async () => { await _delay(1200); return { success:true, address:'0xAurumKoreaPteDemo...' }; },
  },
  orders: {
    create: async () => { await _delay(200); return { id: _genOrderId() }; },
  },
  vault: {
    getHoldings:         async ()   => { await _delay(300); return MOCK_HOLDINGS; },
    generateCertificate: async ()   => { await _delay(1200); return { url:'#cert-stub' }; },
    requestSell:         async ids  => { await _delay(700); return { requestId:'SELL-'+Date.now(), holdingIds:ids }; },
    requestWithdraw:     async (ids,addr) => { await _delay(700); return { requestId:'WD-'+Date.now(), holdingIds:ids, address:addr }; },
  },
  kyc: {
    submit: async () => { await _delay(1200); return { submissionId:'KYC-'+Date.now(), status:'in_review' }; },
  },
  agp: {
    enroll: async data => { await _delay(1400); return { planId:'AGP-'+Date.now(), ...data, status:'active' }; },
  },
  campaign: {
    signupBonus:  async email => { await _delay(800); return { reservationId:'FY-MMXXVI-'+Math.floor(Math.random()*9000+1000), email, tier:'founding-year' }; },
    getReferral:  async userId => { await _delay(600); return MOCK_REFERRAL_DATA; },
  },
};

// ─── Market constants ─────────────────────────────────────────────────────────
export const MARKET_FACTS = {
  goldATH: 5608.35, goldATHLabel: '역대 최고가 (2026년 1월)',
  totalMinedTonnes: 219890, centralBanksWithGold: 80,
  tenYearReturn: '+280%', cbBuying2023: '1,037t', lastVerified: '2026-04-11',
};

export const FALLBACK_PRICES = { gold: 3342.80, silver: 32.90, platinum: 980.00 };
export const FALLBACK_KRW    = 1368.00;

// Shared premium constants (used in savings calculations across pages)
export const KR_GOLD_PREMIUM   = 0.20;  // 20% Korean retail premium (kimchi premium + VAT)
export const KR_SILVER_PREMIUM = 0.30;  // 30% Korean retail premium
export const AURUM_GOLD_PREMIUM   = 0.08; // 8% Aurum premium (gold)
export const AURUM_SILVER_PREMIUM = 0.15; // 15% Aurum premium (silver)

// 1 돈 = 3.75 grams (traditional Korean gold weight unit)
export const DON_IN_GRAMS = 3.75;
export const OZ_IN_GRAMS  = 31.1035;

// Price helpers using live prices
export function goldPerDonKRW(goldSpotUSD, krwRate, premium = AURUM_GOLD_PREMIUM) {
  return goldSpotUSD * (1 + premium) * krwRate / OZ_IN_GRAMS * DON_IN_GRAMS;
}
export function silverPerKgKRW(silverSpotUSD, krwRate, premium = AURUM_SILVER_PREMIUM) {
  return silverSpotUSD * (1 + premium) * krwRate / OZ_IN_GRAMS * 1000;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const PRODUCTS = [
  { id:1, name:'1 oz Gold Bar — PAMP Suisse',  nameKo:'1 온스 금바 — PAMP 스위스',  metal:'gold',   type:'bar',  weight:'1 oz',   weightOz:1,       purity:'99.99%', mint:'PAMP Suisse',          premium:0.06, image:'🥇', inStock:true, descKo:'세계에서 가장 인지도 높은 금바. LBMA 인증 PAMP Suisse 제조. Lady Fortuna 디자인.' },
  { id:2, name:'1 kg Gold Bar — Heraeus',       nameKo:'1 kg 금바 — 헤레우스',       metal:'gold',   type:'bar',  weight:'1 kg',   weightOz:32.1507, purity:'99.99%', mint:'Heraeus',              premium:0.05, image:'🥇', inStock:true, descKo:'기관 및 고액 투자자 선호. 최저 프리미엄으로 최대 효율. 독일 헤레우스 제조.' },
  { id:3, name:'1 oz Gold Maple Leaf',          nameKo:'1 온스 골드 메이플리프',      metal:'gold',   type:'coin', weight:'1 oz',   weightOz:1,       purity:'99.99%', mint:'Royal Canadian Mint',  premium:0.06, image:'🪙', inStock:true, descKo:'캐나다 왕립 조폐국 발행. 세계적으로 가장 많이 거래되는 금화 중 하나.' },
  { id:4, name:'1 oz Gold Krugerrand',          nameKo:'1 온스 골드 크루거랜드',      metal:'gold',   type:'coin', weight:'1 oz',   weightOz:1,       purity:'91.67%', mint:'South African Mint',   premium:0.06, image:'🪙', inStock:true, descKo:'세계 최초 투자용 금화(1967년 발행). 남아프리카 공화국 조폐국 제조.' },
  { id:5, name:'100 oz Silver Bar — PAMP',      nameKo:'100 온스 은바 — PAMP',        metal:'silver', type:'bar',  weight:'100 oz', weightOz:100,     purity:'99.99%', mint:'PAMP Suisse',          premium:0.06, image:'🥈', inStock:true, descKo:'대규모 은 투자에 최적. PAMP 스위스 제조, LBMA 인증 순은 바.' },
  { id:6, name:'1 oz Silver Maple Leaf',        nameKo:'1 온스 실버 메이플리프',      metal:'silver', type:'coin', weight:'1 oz',   weightOz:1,       purity:'99.99%', mint:'Royal Canadian Mint',  premium:0.08, image:'🥈', inStock:true, descKo:'캐나다 왕립 조폐국 발행 순은 동전. 컬렉터와 투자자 모두 선호.' },
  { id:7, name:'1 kg Silver Bar — Heraeus',     nameKo:'1 kg 은바 — 헤레우스',        metal:'silver', type:'bar',  weight:'1 kg',   weightOz:32.1507, purity:'99.99%', mint:'Heraeus',              premium:0.06, image:'🥈', inStock:true, descKo:'독일 헤레우스 제조 순은 바. 산업용·투자 수요 모두 높은 표준 규격.' },
  { id:8, name:'10 oz Gold Bar — Valcambi',     nameKo:'10 온스 금바 — 발캄비',       metal:'gold',   type:'bar',  weight:'10 oz',  weightOz:10,      purity:'99.99%', mint:'Valcambi',             premium:0.055, image:'🥇', inStock:true, descKo:'스위스 발캄비 제조 10온스 금바. 개인 고액 투자자에게 적합한 크기.' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_HOLDINGS = [
  { id:1, product:'1 oz Gold Bar — PAMP Suisse', nameKo:'1 온스 금바 — PAMP 스위스', serial:'PAMP-2026-44891', purchasePrice:4892.50, purchaseDate:'2026-03-15', weightOz:1,   metal:'gold',   vault:'Singapore — Malca-Amit FTZ', zone:'Zone A, Bay 204', image:'🥇', assayCert:true, insurance:"Lloyd's of London" },
  { id:2, product:'100 oz Silver Bar — PAMP',    nameKo:'100 온스 은바 — PAMP',       serial:'PAMP-AG-77234', purchasePrice:2920.00,  purchaseDate:'2026-03-20', weightOz:100, metal:'silver', vault:'Singapore — Malca-Amit FTZ', zone:'Zone B, Bay 118', image:'🥈', assayCert:true, insurance:"Lloyd's of London" },
  { id:3, product:'1 oz Gold Maple Leaf',        nameKo:'1 온스 골드 메이플리프',     serial:'RCM-ML-88123',  purchasePrice:4945.20,  purchaseDate:'2026-04-01', weightOz:1,   metal:'gold',   vault:'Singapore — Malca-Amit FTZ', zone:'Zone A, Bay 204', image:'🪙', assayCert:true, insurance:"Lloyd's of London" },
];

export const MOCK_ORDERS_INIT = [
  { id:'AK-2026-001847', date:'2026-04-01T14:30:00Z', status:'vaulted',    items:[{ nameKo:'1 온스 골드 메이플리프', name:'1 oz Gold Maple Leaf',     qty:1, unitPrice:4945.20, metal:'gold',   image:'🪙' }], subtotal:4945.20, total:4945.20, paymentMethod:'toss', storageOption:'singapore' },
  { id:'AK-2026-001612', date:'2026-03-20T09:15:00Z', status:'vaulted',    items:[{ nameKo:'100 온스 은바 — PAMP',  name:'100 oz Silver Bar — PAMP', qty:1, unitPrice:2920.00, metal:'silver', image:'🥈' }], subtotal:2920.00, total:2920.00, paymentMethod:'wire', storageOption:'singapore' },
  { id:'AK-2026-001344', date:'2026-03-15T11:45:00Z', status:'vaulted',    items:[{ nameKo:'1 온스 금바 — PAMP 스위스', name:'1 oz Gold Bar — PAMP Suisse', qty:2, unitPrice:4892.50, metal:'gold', image:'🥇' }], subtotal:9785.00, total:9785.00, paymentMethod:'toss', storageOption:'singapore' },
];

export const AUDIT_TRAIL_INIT = [
  { date:'2026-04-01', event:'보관 배정', detail:'1 온스 골드 메이플리프 → Malca-Amit SG FTZ (Zone A, Bay 204)', type:'vault' },
  { date:'2026-04-01', event:'결제 완료', detail:'주문 AK-2026-001847 · TossPay · $4,945.20', type:'payment' },
  { date:'2026-03-20', event:'보관 배정', detail:'100 온스 은바 PAMP → Malca-Amit SG FTZ (Zone B, Bay 118)', type:'vault' },
  { date:'2026-03-20', event:'결제 완료', detail:'주문 AK-2026-001612 · Wire Transfer · $2,920.00', type:'payment' },
  { date:'2026-03-15', event:'보관 배정', detail:'1 온스 금바 PAMP (×2) → Malca-Amit SG FTZ (Zone A, Bay 191)', type:'vault' },
  { date:'2026-03-15', event:'결제 완료', detail:'주문 AK-2026-001344 · TossPay · $9,785.00', type:'payment' },
];

export const MOCK_REFERRAL_DATA = {
  userId: 'usr_demo', name: 'Woosung K.', memberId: 'FY-MMXXVI-1247',
  tier: 'founding-year', gatesPassed: 2, currentSavings: -1.5,
  totalGMV: 18000, nextGate: { number: 3, name: '정점', gmvRequired: 35000, savings: -2.0 },
  referralCode: 'woosung-k-7g4q9p',
  referralLink: 'aurum.sg/founding?s=woosung-k-7g4q9p',
  recentReferrals: [
    { initial:'S', name:'SOO-MIN J.', status:'PASSED',  note:'첫 결제 정산 · 두 시간 전' },
    { initial:'D', name:'DAE-HYUN P.', status:'PENDING', note:'본인확인 진행 · 어제' },
    { initial:'J', name:'JI-WOO L.', status:'PASSED',  note:'첫 결제 정산 · 사흘 전' },
    { initial:'H', name:'HYE-RIN C.', status:'PASSED',  note:'첫 결제 정산 · 일주일 전' },
  ],
  leaderboard: [
    { rank:1, name:'YOUNG-HO K.', tier:'PATRON', gates:5 },
    { rank:2, name:'HA-EUN R.', tier:'PATRON', gates:4 },
    { rank:3, name:'SEUNG-WOO L.', tier:'PATRON', gates:4 },
    { rank:4, name:'JI-AH M.', tier:'FOUNDING', gates:3 },
    { rank:5, name:'DOO-HYUN J.', tier:'FOUNDING', gates:3 },
  ],
  userRank: 247,
};

// ─── Education content ────────────────────────────────────────────────────────
export const EDUCATION_ARTICLES = [
  { id:'what-is-gold', emoji:'🥇', category:'기초', title:'실물 금이란 무엇인가?', subtitle:'금 ETF, 금 통장과 다른 진짜 금의 의미', readTime:'5분', sections:[{ heading:'실물 금 vs 종이 금', body:'투자용 금은 크게 두 종류로 나뉩니다. 종이 금은 금 ETF, KRX 금 시장, 금 통장처럼 금을 실제 보유하지 않고 가격만 추종하는 상품입니다. 실물 금은 실제로 제련된 금 바(bar) 또는 금화(coin)로, 당신이 손에 들고 금고에 넣을 수 있는 금속 그 자체입니다.', bullets:['금 ETF: 거래소에 상장된 펀드. 편리하지만 발행사 리스크 존재.','KRX 금 시장: 한국 내 금 현물 거래. 세금 혜택 있음.','실물 금 바: 직접 소유하는 순도 999.9 금괴. Aurum Korea가 취급.','금 통장(KB, 신한 등): 은행이 금을 대신 보유. 예금자 보호 미적용.'], highlight:'실물 금은 발행자도, 거래상대방 리스크도 없는 유일한 금융 자산입니다.' }] },
  { id:'gold-pricing', emoji:'📈', category:'가격', title:'금 가격은 어떻게 결정되나?', subtitle:'현물가, 프리미엄, 환율의 3중 구조', readTime:'7분', sections:[{ heading:'국제 현물가 (Spot Price)', body:'금 가격의 기준은 LBMA가 하루 두 번 발표하는 현물가입니다. 이 가격은 트로이 온스(31.1034g) 당 USD로 표시됩니다.', bullets:null, highlight:'현재 금 현물가는 홈페이지 상단의 실시간 시세 위젯에서 확인할 수 있습니다.' }, { heading:'프리미엄 (Premium)', body:'실물 금 바의 판매가 = 현물가 + 프리미엄입니다.', bullets:['제련·제조비: 정련소가 금괴를 만드는 비용 (보통 0.5~1%)','운송·보험료: 싱가포르 → 보관 금고까지','Aurum 수수료: 투명하게 공개 (상품 페이지 확인)','소량일수록 프리미엄 높음 → 1g < 10g < 1oz < 1kg 순'], highlight:null }] },
  { id:'how-to-buy', emoji:'🛒', category:'구매', title:'Aurum Korea에서 금 구매하는 방법', subtitle:'회원가입부터 보관까지 5단계 가이드', readTime:'4분', sections:[{ heading:'구매 프로세스 (5단계)', body:'Aurum Korea의 구매 과정은 단순하고 투명합니다.', bullets:['1단계: 회원가입 — 이메일 또는 카카오 소셜 로그인 (5분 이내)','2단계: 상품 선택 — 중량·브랜드별 금 바 선택','3단계: 결제 — 토스페이, 카카오페이, 전신환(Wire Transfer), 암호화폐','4단계: 주문 확인 — 이메일 + 카카오 알림으로 즉시 발송','5단계: 보관 시작 — Malca-Amit 싱가포르 금고에 즉시 배정'], highlight:'구매 즉시 Malca-Amit 전용 금고에 배정됩니다. 별도 보관 신청 불필요.' }] },
  { id:'storage-security', emoji:'🔐', category:'보관', title:'보관 및 안전성', subtitle:'Malca-Amit 싱가포르 금고의 보안 구조', readTime:'5분', sections:[{ heading:'Malca-Amit이란?', body:'Malca-Amit은 다이아몬드·귀금속 보관 및 운송 분야 세계 최고 수준의 전문 업체입니다.', bullets:['24시간 무장 경비 및 다중 생체인식 보안','고객별 분리 보관 (세그리게이션) 가능','보험: Lloyd\'s of London 신디케이트 완전 보장','ISO 9001:2015 인증','싱가포르 MAS(금융통화청) 규제 환경'], highlight:'고객 자산은 Aurum Korea의 재무 상태와 완전히 분리됩니다.' }] },
  { id:'tax-legal', emoji:'📋', category:'세금·법률', title:'세금 및 법률 (한국)', subtitle:'해외 실물 금 투자 시 알아야 할 의무', readTime:'8분', sections:[{ heading:'해외 금융계좌 신고', body:'해외 금융계좌 잔액이 연중 어느 하루라도 5억 원을 초과하면 다음 해 6월 1일~30일 사이에 국세청에 신고해야 합니다.', bullets:null, highlight:'미신고 시 최대 20% 과태료. 세무사 상담을 권장합니다.' }, { heading:'실물 금 국내 반입 시 관세', body:'싱가포르 보관 금을 국내로 반입할 경우 관세(3%) + 부가가치세(10%)가 부과됩니다.', bullets:null, highlight:'본 내용은 일반 정보 제공 목적이며 법적·세무적 조언이 아닙니다.' }] },
  { id:'glossary', emoji:'📚', category:'용어집', title:'금 투자 용어 사전', subtitle:'알아두면 유용한 귀금속 투자 용어 A–Z', readTime:'3분', sections:[{ heading:'기본 용어', body:'', bullets:['Spot Price (현물가): 즉시 인도 기준 금 시세. 국제 금 가격의 기준.','Troy Ounce (트로이 온스): 금 계량 단위. 1 troy oz = 31.1034g.','Premium (프리미엄): 현물가 대비 실물 금 판매가의 추가 마진.','LBMA: 런던 귀금속 시장협회. 국제 금 가격 Fix 기준.'], highlight:null }] },
  {
    id: 'kimchi-premium-explained',
    category: '가격',
    title: '국내 금 구매 시 왜 더 비싼가?',
    titleEn: 'Why Is Gold More Expensive in Korea?',
    date: '2026-04',
    readMin: 5,
    body: '한국에서 금을 구매할 때 국제 현물가보다 유의미하게 높은 가격을 지불하게 되는 구조적 이유가 있습니다. 첫째, 실물 금 구매 시 부가가치세 10%가 즉시 부과됩니다. 이 세금은 매도 시 환급되지 않으므로 영구적인 비용이 됩니다. 둘째, 국내 귀금속 딜러는 국제 금시장(LBMA) 현물가에 자체 마진을 추가합니다. 셋째, 시중 은행 금통장은 실물 금이 아닌 은행 장부상 청구권으로, 세금 부담은 유사하면서 법적 보호는 취약합니다. 싱가포르는 귀금속에 GST 0%를 적용하여 이 구조적 프리미엄을 우회할 수 있습니다.',
    bodyEn: 'There are structural reasons why buying gold in Korea costs significantly more than the international spot price. First, a 10% VAT is immediately applied to physical gold purchases — this tax is never recovered on sale, making it a permanent cost. Second, domestic precious metals dealers add their own margin on top of the international LBMA spot price. Third, bank gold savings accounts are ledger entries, not physical gold, with similar tax treatment but weaker legal protection. Singapore applies 0% GST on precious metals, bypassing this structural premium.',
    tags: ['금시장', '한국 금', '세금 금', '김치프리미엄'],
  },
  {
    id: 'overseas-gold-vs-domestic',
    category: '기초',
    title: '해외금 투자와 국내 금 투자의 차이',
    titleEn: 'Offshore Gold vs Domestic Gold Investment',
    date: '2026-04',
    readMin: 6,
    body: '해외금 투자는 싱가포르, 스위스, 홍콩 등의 귀금속 보관 센터를 통해 국제 현물가로 실물 금속을 취득하는 방식입니다. 국내 금 투자와의 핵심 차이는 세 가지입니다. (1) 세금 구조: 해외 자유무역지대는 부가세 없이 거래 가능. (2) 소유권: 해외 금보관은 완전 배분(fully allocated) 방식으로 법적 소유권이 명확. (3) 관할권: 싱가포르 법률에 따라 보호되어 국내 규제 리스크 분산. 외국 금 투자 시 주의점: 연간 $50,000 이하는 신고 없이 가능하나, 해외 금융 계좌 잔고 $10,000 초과 시 매년 국세청 신고 필요.',
    bodyEn: 'Offshore gold investing means acquiring physical metals at international spot prices through precious metals custody centers in Singapore, Switzerland, or Hong Kong. Three key differences from domestic investment: (1) Tax structure: free trade zones allow transactions without VAT. (2) Ownership: overseas gold storage uses fully allocated custody with clear legal title. (3) Jurisdiction: Singapore law provides protection diversifying domestic regulatory risk. Note for foreign gold investing: under ₩50,000/yr no pre-notification required, but overseas financial account balances over $10,000 require annual reporting to Korean tax authorities.',
    tags: ['해외금', '외국 금', '금보관', '해외 보관 금'],
  },
  {
    id: 'domestic-frustration',
    category: '한국 시장',
    title: '국내 금·은 구매에서 실망하는 이유',
    titleEn: 'Why Buying Gold & Silver in Korea Is Frustrating',
    date: '2026-04',
    readMin: 4,
    gcReview: true,
    body: '국내에서 금이나 은을 구매해 보신 분들이 공통적으로 경험하는 불만이 있습니다. 은시장의 경우 국내 딜러가 국제 은 시세(XAG/USD)에 30% 이상의 프리미엄을 적용하는 경우가 일반적입니다. 금의 경우에도 10% 부가세와 딜러 마진이 구조적으로 포함됩니다. 투자자가 원하는 것은 단순합니다 — 국제 현물가에 투명한 수수료로 실물을 취득하고, 안전하게 보관하는 것. 이 구조는 싱가포르 기반 플랫폼에서 가능합니다.',
    bodyEn: 'Investors who have tried to buy gold or silver domestically in Korea commonly share the same frustrations. In the silver market, it is common for Korean dealers to apply premiums of 30%+ over the international silver spot price (XAG/USD). For gold, 10% VAT and dealer margins are structurally embedded. What investors want is simple — physical acquisition at international spot prices with transparent fees, and secure offshore storage. This structure is available through Singapore-based platforms.',
    tags: ['은시장', '국내 금', '금 구매 한국'],
  },
  {
    id: 'gold-wealth-protection',
    category: '기초',
    title: '금으로 재산을 지키는 법',
    titleEn: 'Protecting Wealth with Physical Gold',
    date: '2026-04',
    readMin: 7,
    body: '재산 금 투자의 핵심 원칙은 실물 소유권입니다. 금 ETF, 금통장, 선물계약은 모두 금에 연동된 금융 상품이지, 금 자체가 아닙니다. 재산 보호 수단으로서 금이 효과적인 이유는 통화 발행 리스크로부터 독립적이기 때문입니다. 역사적으로 금은 원화 가치 하락 구간에서 KRW 기준 상승하는 경향을 보였습니다. 해외 보관 금의 경우 한국 내 법적·경제적 리스크로부터 자산을 분리할 수 있습니다. 실물 금의 법적 소유권은 보관 기관이 도산하더라도 보호됩니다.',
    bodyEn: 'The core principle of wealth protection gold investing is physical ownership. Gold ETFs, bank gold accounts, and futures contracts are all financial instruments linked to gold — not gold itself. Physical gold is effective for wealth protection because it is independent of currency issuance risk. Historically, gold has tended to appreciate in KRW terms during periods of KRW depreciation. Offshore gold storage separates assets from domestic Korean legal and economic risks. Legal ownership of physical gold is protected even if the custodian becomes insolvent.',
    tags: ['재산 금', '해외 보관 금', '금 투자', '자산 보호'],
  },
  {
    id: 'silver-market-deficit',
    category: '기초',
    title: '은 시장의 공급 부족과 해외 투자',
    titleEn: 'Silver Market Deficit & Offshore Investment',
    date: '2026-04',
    readMin: 5,
    body: '은시장은 2021년부터 구조적 공급 부족 상태에 있습니다. 산업 수요(태양광 패널, 전기차, 반도체)가 급증하는 반면, 광산 공급 증가는 제한적입니다. 금/은 비율(Gold-Silver Ratio)은 역사적 평균인 55~65배를 크게 상회하고 있어 은의 상대적 저평가를 시사합니다. 국내 은 투자의 문제점: 은 실물 구매 시 10% 부가세 + 딜러 프리미엄이 적용됩니다. 싱가포르는 은에도 GST 0%를 적용하므로, 해외금보관 방식으로 은에 접근하는 것이 비용 효율적입니다.',
    bodyEn: 'The silver market has been in structural supply deficit since 2021. Industrial demand (solar panels, EVs, semiconductors) is surging while mine supply growth remains limited. The Gold-Silver Ratio significantly exceeds its historical average of 55–65x, suggesting silver is relatively undervalued. The problem with domestic silver investment: 10% VAT plus dealer premium applies. Singapore applies 0% GST on silver as well, making offshore precious metals storage the cost-efficient way to access silver.',
    tags: ['은시장', '은 투자', '은 부족', '해외 보관 금'],
  },
];
export const EDUCATION_CATEGORIES = ['전체','기초','가격','구매','보관','세금·법률','한국 시장','용어집'];

export const WHY_GOLD_REASONS = [
  { icon:'shield',    titleKo:'인플레이션 헤지', titleEn:'Inflation Hedge', body:'금은 수천 년간 구매력을 보존해왔습니다. 지폐가 인쇄될수록 금의 실질 가치는 올라갑니다. 한국의 소비자물가지수(CPI)가 상승할 때, 금은 원화 자산을 보호하는 방패 역할을 합니다.', stat:MARKET_FACTS.tenYearReturn, statLabel:'최근 10년 금 수익률 (USD 기준)' },
  { icon:'globe',     titleKo:'지정학적 안전 자산', titleEn:'Safe Haven Asset', body:'전쟁, 금융위기, 무역분쟁 등 불확실성이 높아질 때마다 투자자들은 금으로 피신합니다. 2008년 금융위기, 2020년 팬데믹, 2022년 러-우 전쟁 때 금 가격은 급등했습니다.', stat:'$5,608', statLabel:'역대 최고가 (2026년 1월, USD/oz)' },
  { icon:'split',     titleKo:'포트폴리오 분산', titleEn:'Portfolio Diversification', body:'금은 주식·채권과 낮은 상관관계를 가집니다. 포트폴리오의 5~15%를 금에 배분하면 변동성을 낮추면서도 장기 수익률을 개선할 수 있습니다.', stat:'10-20%', statLabel:'Morgan Stanley 추천 자산 배분 율' },
  { icon:'bank',      titleKo:'중앙은행의 선택', titleEn:'Central Bank Reserve', body:'한국은행을 포함한 세계 각국 중앙은행은 외환보유액의 일부를 금으로 보유합니다. 중앙은행들이 2022년 이후 역대 최대 규모로 금을 매입하고 있습니다.', stat:MARKET_FACTS.cbBuying2023, statLabel:'2023 중앙은행 금 순매입량' },
  { icon:'diamond',   titleKo:'희소성과 내재 가치', titleEn:'Scarcity & Intrinsic Value', body:'지구상에 채광된 금은 올림픽 수영장 약 3.5개 분량에 불과합니다. 새로운 채광량은 매년 제한적이며, 금은 부식되거나 소멸되지 않습니다.', stat:'~220천t', statLabel:'역대 총 채광량 추정 (WGC 2024)' },
  { icon:'exchange',  titleKo:'환율 위험 분산', titleEn:'FX Risk Mitigation', body:'원화(KRW)가 약세를 보일 때, 달러로 표시된 금의 원화 가치는 상승합니다. 미국 금리 인상, 글로벌 리스크-오프 국면에서 원화 자산을 보호하는 자연 헤지 수단입니다.', stat:'+394%', statLabel:'최근 10년 금 수익률 (KRW 기준)' },
];
export const WHY_GOLD_STATS = [
  { value:'5,000+', label:'년의 가치 저장 역사' },
  { value:`약 ${MARKET_FACTS.centralBanksWithGold}개국`, label:'중앙은행 금 보유' },
  { value:'0%', label:'발행자 리스크 (무기명 실물 자산)' },
  { value:'99.99%', label:'순도 보장 (Malca-Amit 보관)' },
];
export const WHY_SILVER_STATS = [
  { value:'67 Moz', label:'2026 공급 부족' }, { value:'6년째', label:'연속 공급 부족' },
  { value:'>60%', label:'산업·기술 수요 비중' }, { value:'품귀', label:'한국 은행 은 공급' },
];
export const WHY_SILVER_REASONS = [
  { icon:'circuit', titleKo:'산업의 필수 금속', titleEn:'Industrial Backbone', body:'태양광 패널, 전기차, 5G 전자기기, AI 데이터센터, 방위산업 모두 은에 의존합니다. 이 수요는 구조적이며 가속화되고 있습니다.', stat:'>60%', statLabel:'산업·기술 글로벌 수요 비중 (2026)' },
  { icon:'chartdown', titleKo:'구조적 공급 부족', titleEn:'Structural Supply Deficit', body:'은 시장은 2026년 6년 연속 부족을 기록하며, 6,700만 온스 부족이 예상됩니다. 중국의 수출 통제 강화로 공급이 더욱 타이트해졌습니다.', stat:'67 Moz', statLabel:'2026년 예상 공급 부족' },
  { icon:'flag', titleKo:'한국 접근 프리미엄', titleEn:'Korean Access Premium', body:'한국 은행들은 만성적인 부족으로 은바 판매를 반복적으로 중단했습니다. Aurum은 국제 현물가로 해외 배분 방식을 통해 이 문제를 해결합니다.', stat:'+394%', statLabel:'최근 10년 금 수익률 (KRW 기준)' },
];

const STATIC_NEWS = [
  { title:'중앙은행 금 매입 역대 최고 수준 지속 — 금 가격 고공행진', link:'https://www.mining.com/', pubDate:'2026-04-11T06:00:00Z', source:'Mining.com', category:'gold', snippet:'전 세계 중앙은행들이 2026년 1분기에도 기록적인 속도로 금을 매입하며 금 가격이 온스당 $3,300 이상을 유지하고 있습니다.' },
  { title:'Fed 금리 동결 신호 — 금 강세장 연장 전망', link:'https://www.mining.com/', pubDate:'2026-04-10T08:30:00Z', source:'Mining.com', category:'gold', snippet:'연방준비제도의 금리 인상 중단 결정이 금에 유리한 환경을 조성, 실질 수익률 추가 하락이 예상됩니다.' },
  { title:'태양광 붐으로 은 수요 10년 최고치 — 공급 부족 지속', link:'https://goldbroker.com/news', pubDate:'2026-04-10T04:00:00Z', source:'GoldBroker', category:'silver', snippet:'태양광 패널 제조 수요로 은 산업 수요가 10년 최고치를 기록, 구조적 공급 부족이 가격을 지지하고 있습니다.' },
  { title:'2026년 은 공급 부족 확대 전망 — Silver Institute', link:'https://goldbroker.com/news', pubDate:'2026-04-07T05:00:00Z', source:'GoldBroker', category:'silver', snippet:'Silver Institute는 2026년 글로벌 은 시장 부족이 2억 온스 이상으로 확대될 것으로 예측, 4년 연속 구조적 공급 부족입니다.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function calcPrice(p, prices) {
  const spot = prices[p.metal] ?? prices.gold;
  return spot * p.weightOz * (1 + p.premium);
}
export const fUSD   = n => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n);
export const fKRW   = n => new Intl.NumberFormat('ko-KR', { style:'currency', currency:'KRW', maximumFractionDigits:0 }).format(n);
export const fKRWShort = n => {
  if (n >= 100_000_000) return `₩${(n/100_000_000).toFixed(1)}억`;
  if (n >= 10_000)      return `₩${Math.round(n/10_000).toLocaleString()}만`;
  return fKRW(n);
};
export function fDate(dateStr) {
  const hrs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (hrs < 1)  return '방금 전';
  if (hrs < 24) return `${hrs}시간 전`;
  if (hrs < 48) return '어제';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month:'short', day:'numeric' });
}
export function fDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold:0.05, rootMargin:'-50px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export function useLivePrices() {
  const [prices, setPrices]         = useState(FALLBACK_PRICES);
  const [krwRate, setKrwRate]       = useState(FALLBACK_KRW);
  const [priceError, setPriceError] = useState(null);
  const [dailyChanges, setDailyChanges] = useState({});
  const [loaded, setLoaded]         = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPrices(data.prices);
      setKrwRate(data.krwRate);
      setDailyChanges(data.changes || {});
      setPriceError(null);
      setLoaded(true);
    } catch {
      setPriceError('가격 로딩 실패 — 최근 데이터 표시 중');
    }
  }, []);

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, 10_000);
    return () => clearInterval(t);
  }, [fetch_]);

  return { prices, krwRate, priceError, dailyChanges, loaded };
}

export function useNewsData() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Reliable gold/silver feeds — keyword filtered for relevance
        const feeds = [
          { url:'https://www.kitco.com/rss/news.xml', source:'Kitco News', category:'gold' },
          { url:'https://www.nasdaq.com/feed/rssoutbound?symbol=GLD', source:'Nasdaq Gold', category:'gold' },
        ];
        const KEYWORDS = ['gold','silver','central bank','china','dollar','treasury','precious metal','은','금','중앙은행'];
        const res = await Promise.allSettled(feeds.map(f =>
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}&count=8`)
            .then(r => r.ok ? r.json() : null)
            .then(d => (!d || d.status !== 'ok') ? [] : d.items
              .filter(i => { const t = ((i.title||'')+(i.description||'')).toLowerCase(); return KEYWORDS.some(k => t.includes(k)); })
              .map(i => ({ title:i.title||'', link:i.link||'#', pubDate:i.pubDate||new Date().toISOString(), source:f.source, category:f.category, snippet:(i.description||'').replace(/<[^>]*>/g,'').trim().slice(0,200) })))
            .catch(() => [])
        ));
        if (!cancelled) {
          const all = res.flatMap(r => r.status === 'fulfilled' ? r.value : []);
          const seen = new Set();
          const unique = all.filter(a => { const k = a.title.toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; });
          setArticles(unique.length >= 4 ? unique.slice(0,12) : STATIC_NEWS);
        }
      } catch { if (!cancelled) setArticles(STATIC_NEWS); }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  return { articles, loading };
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);
  return { toasts, show };
}

// ─── getStorageRate — returns annual storage % based on Founders gate ─────────
export function getStorageRate(user) {
  const gate = user?.foundersGate ?? user?.gate ?? 0;
  if (gate >= 5) return 0.30;
  if (gate >= 3) return 0.50;
  return 0.75;
}
