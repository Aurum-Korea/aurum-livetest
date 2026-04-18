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
  { id:'kimchi-premium-explained', emoji:'🇰🇷', category:'한국 시장', title:'국내 금 구매 시 왜 더 비싼가?', subtitle:'구조적 프리미엄의 원인 — 김치 프리미엄', readTime:'5분', sections:[{ heading:'10% 부가세의 영구적 적용', body:'한국에서 실물 금을 구매하면 거래 방식에 관계없이 부가가치세 10%가 부과됩니다. 국내 귀금속 매장에서의 구매 시에도 마찬가지입니다.', bullets:['시중 은행 금통장: 계좌 보유 중 VAT 없음. 단, 실물 인출 시 10% 부과','국내 귀금속 딜러: 구매 즉시 10% VAT 포함 가격 적용','Aurum: 싱가포르 FTZ 내 보관 — 한국 부가세 비적용'], highlight:'같은 금 1온스를 국내에서 사면 Aurum보다 유의미하게 더 비쌉니다. 10% VAT가 영구적으로 포함되기 때문입니다.' }] },
  { id:'overseas-gold-vs-domestic', emoji:'🌏', category:'한국 시장', title:'해외금 투자와 국내 금 투자의 차이', subtitle:'해외 보관 금과 국내 거래의 법적·경제적 차이', readTime:'6분', sections:[{ heading:'소유 구조의 차이', body:'국내에서 금을 구매하는 방법은 크게 세 가지입니다: 실물 매입(KRX 또는 귀금속 매장), 시중 은행 금통장, ETF. 이 중 실물 외의 방법은 모두 종이 금 — 즉 금에 대한 청구권입니다.', bullets:['시중 금통장: 은행 장부상 금 보유. 예금자보호 적용 불가.','국내 귀금속 구매: 실물이지만 10% VAT + 국내 보관 비용','Aurum 해외 보관 금: 싱가포르 FTZ 내 귀하 명의 실물 배분. VAT 없음.'], highlight:'해외 보관 금은 국내 규제 위험에서 구조적으로 독립되어 있습니다.' }] },
  { id:'gold-wealth-protection', emoji:'🛡️', category:'기초', title:'금으로 재산을 지키는 법', subtitle:'재산 금(Wealth Gold)의 개념과 실전 전략', readTime:'7분', sections:[{ heading:'재산 금이란?', body:'재산 금은 단순한 투자 수익 목적이 아닌, 구매력 보존과 포트폴리오 방어를 위해 보유하는 금을 의미합니다.', bullets:['인플레이션 헤지: 화폐 가치 하락 시 금 가격 상승 경향','지정학적 리스크: 전쟁·금융위기 시 안전자산 수요 급증','포트폴리오 상관관계: 주식·채권과 낮은 상관관계'], highlight:'역사적으로 금은 주요 금융위기 때마다 구매력을 보존한 유일한 자산이었습니다.' }, { heading:'한국인에게 재산 금이 특히 중요한 이유', body:'한국은 1997년 IMF 외환위기와 2008년 금융위기를 경험했습니다. 두 사건 모두 원화 가치가 급격히 하락하는 동안 금 가격(달러 기준)은 상승했습니다.', bullets:null, highlight:'원화 약세 + 금 강세의 복합 효과는 한국 투자자에게 이중 수익으로 작용합니다.' }] },
  { id:'silver-market-deficit', emoji:'🥈', category:'기초', title:'은 시장의 공급 부족과 해외 투자', subtitle:'4년 연속 구조적 공급 부족 — 은 투자의 현재', readTime:'5분', sections:[{ heading:'은 공급 부족의 구조', body:'Silver Institute 데이터에 따르면 글로벌 은 시장은 2021년부터 4년 연속 구조적 공급 부족 상태입니다. 태양광 패널 제조, 전기차 배터리, 반도체 등 산업 수요가 증가하는 반면 새로운 은광 개발은 제한적입니다.', bullets:['산업 수요: 태양광(2024년 기준 전체 수요의 17%)','전기차: 차량 1대당 25-50g의 은 사용','의료: 항균 특성으로 의료기기 수요 증가'], highlight:null }, { heading:'은 투자의 방법', body:'은 투자는 금과 마찬가지로 실물 보유가 가장 직접적인 방법입니다. Aurum에서는 PAMP Suisse, Heraeus 등 LBMA 승인 제련소의 은 바를 취급합니다.', bullets:null, highlight:'금/은 비율이 역사적 평균(68x) 대비 높을 때 은의 상대적 저평가 가능성을 검토합니다.' }] },
  { id:'legal-safety-hub', emoji:'⚖️', category:'법률·안전', title:'합법성·안전성 완전 가이드', subtitle:'한국인의 해외 금 투자 — 법적 구조, 보호 장치, 신고 의무', readTime:'10분', legalHub:true, sections:[
    { heading:'해외에서 금을 구매하는 게 합법인가요?', body:'네. 외국환거래법상 연간 $50,000 이하의 해외 투자는 사전 신고 없이 가능합니다. Aurum은 싱가포르 귀금속서비스법(PSPM Act) 2019에 등록된 공식 딜러입니다. 해외 금융 계좌 잔고가 $10,000 이상이면 매년 6월 국세청에 신고하셔야 합니다. Aurum은 이 신고에 필요한 계좌 정보를 자동으로 제공합니다.', bullets:null, highlight:'✓ 합법 확인 — 외국환거래법 준수, PSPM 2019 등록 딜러',
      table:{ headers:['조건','기준','의무'], rows:[['연간 해외 투자','$50,000 이하','사전 신고 불필요'],['연간 해외 투자','$50,000 초과','사전 신고 필요'],['해외 금융계좌 잔액','$10,000 초과 (연중 최고)','6월 국세청 신고'],['실물 국내 반입','금액 무관','관세 3% + VAT 10%']] } },
    { heading:'금이 실제로 금고에 있나요?', body:'귀하의 금은 싱가포르 자유무역지대(FTZ) 내 Malca-Amit 금고에 물리적으로 보관됩니다. 완전 배분(fully allocated) 방식으로 다른 고객의 자산과 절대 혼합되지 않습니다. 구매 즉시 고유 일련번호가 발급됩니다.', bullets:null, highlight:'✓ 물리적으로 존재 — 귀하의 금속, 귀하의 일련번호', custodyChain:true },
    { heading:'Aurum이 폐업하면 내 금은 어떻게 되나요?', body:'배분 보관 구조상, 귀하의 금은 법적으로 Aurum의 자산이 아닙니다. Aurum이 폐업하더라도 귀하의 금속은 귀하 명의로 Malca-Amit 금고에 그대로 존재하며, 귀하는 해당 금속에 대한 직접 소유권을 갖습니다.', bullets:null, highlight:'✓ 법적 분리 보장 — 귀하의 금은 귀하의 금입니다', comparisonTable:true },
  ] },
];
export const EDUCATION_CATEGORIES = ['전체','기초','가격','구매','보관','세금·법률','한국 시장','법률·안전','용어집'];

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
export const FC_GATES = [
  { num:'I',   label:'시작의 문',   labelEn:'The Opening',      color:'#8a7d6b', gmv:5000,  gmvKR:'₩7.2M',  discount:1.0, storage:'0.75%' },
  { num:'II',  label:'셋의 표식',   labelEn:'The Three',        color:'#a09070', gmv:15000, gmvKR:'₩21.6M', discount:1.5, storage:'0.50%' },
  { num:'III', label:'정점',        labelEn:'The Apex',         color:'#C5A572', gmv:35000, gmvKR:'₩50.4M', discount:2.0, storage:'0.50%', apex:true },
  { num:'IV',  label:'볼트 순례',   labelEn:'Vault Pilgrimage', color:'#d4b880', gmv:65000, gmvKR:'₩93.6M', discount:2.5, storage:'0.30%' },
  { num:'V',   label:'평생의 표식', labelEn:'Lifetime Mark',    color:'#E3C187', gmv:100000,gmvKR:'₩144M',  discount:3.0, storage:'0.30%' },
];

// ─── MONTHLY_DATA_2000  ────────────────────────────────────────────────────────
// Format: [year, month(1-12), xau_usd, krw_per_usd]
// Source: LBMA monthly average + Bank of Korea KRW/USD monthly average
// Covers Jan 2000 → Dec 2024  (300 rows)
export const MONTHLY_DATA_2000 = [
  // ── 2000 ── (post-Asian crisis recovery, gold cheap at ~$270-290)
  [2000,1,284,1127],[2000,2,290,1128],[2000,3,284,1115],
  [2000,4,277,1108],[2000,5,274,1096],[2000,6,285,1108],
  [2000,7,279,1111],[2000,8,274,1103],[2000,9,273,1122],
  [2000,10,270,1152],[2000,11,264,1231],[2000,12,272,1263],
  // ── 2001 ── (post-9/11 safe-haven bid, ~$255-283)
  [2001,1,265,1275],[2001,2,261,1291],[2001,3,263,1315],
  [2001,4,260,1325],[2001,5,270,1320],[2001,6,270,1306],
  [2001,7,267,1295],[2001,8,272,1302],[2001,9,283,1333],
  [2001,10,283,1320],[2001,11,274,1273],[2001,12,276,1274],
  // ── 2002 ── (gold bull starts, USD weakens, ~$280-350)
  [2002,1,281,1315],[2002,2,295,1328],[2002,3,294,1326],
  [2002,4,302,1285],[2002,5,314,1259],[2002,6,321,1242],
  [2002,7,313,1214],[2002,8,310,1210],[2002,9,319,1250],
  [2002,10,316,1270],[2002,11,319,1254],[2002,12,332,1205],
  // ── 2003 ── (Iraq war, gold ~$330-415)
  [2003,1,356,1192],[2003,2,352,1200],[2003,3,340,1247],
  [2003,4,327,1225],[2003,5,354,1188],[2003,6,356,1174],
  [2003,7,350,1163],[2003,8,363,1166],[2003,9,383,1153],
  [2003,10,379,1160],[2003,11,390,1188],[2003,12,408,1190],
  // ── 2004 ── (commodity supercycle, ~$390-455, KRW strengthening)
  [2004,1,414,1185],[2004,2,405,1155],[2004,3,406,1143],
  [2004,4,403,1129],[2004,5,383,1145],[2004,6,393,1147],
  [2004,7,398,1155],[2004,8,400,1151],[2004,9,405,1143],
  [2004,10,420,1131],[2004,11,438,1083],[2004,12,441,1044],
  // ── 2005 ── (gold ~$425-515, KRW at multi-year high ~1000-1040)
  [2005,1,427,1032],[2005,2,434,1011],[2005,3,429,1010],
  [2005,4,429,1010],[2005,5,422,1012],[2005,6,430,1015],
  [2005,7,424,1026],[2005,8,441,1030],[2005,9,473,1030],
  [2005,10,470,1065],[2005,11,481,1043],[2005,12,510,1013],
  // ── 2006 ── (major bull run, gold ~$525-690)
  [2006,1,549,1000],[2006,2,555,968],[2006,3,557,968],
  [2006,4,610,956],[2006,5,675,946],[2006,6,596,948],
  [2006,7,632,949],[2006,8,633,956],[2006,9,598,953],
  [2006,10,585,958],[2006,11,627,943],[2006,12,636,931],
  // ── 2007 ── (sub-prime begins, gold ~$630-840)
  [2007,1,632,941],[2007,2,664,940],[2007,3,654,941],
  [2007,4,679,930],[2007,5,666,927],[2007,6,655,924],
  [2007,7,665,922],[2007,8,665,931],[2007,9,713,920],
  [2007,10,754,909],[2007,11,806,914],[2007,12,838,937],
  // ── 2008 ── (GFC, gold volatile ~$740-1020, KRW crashes to 1500)
  [2008,1,889,944],[2008,2,922,973],[2008,3,968,988],
  [2008,4,910,993],[2008,5,888,1033],[2008,6,889,1050],
  [2008,7,939,1025],[2008,8,839,1074],[2008,9,741,1176],
  [2008,10,745,1400],[2008,11,760,1460],[2008,12,816,1377],
  // ── 2009 ── (QE begins, gold surges ~$860-1220)
  [2009,1,858,1381],[2009,2,943,1484],[2009,3,924,1451],
  [2009,4,889,1344],[2009,5,928,1259],[2009,6,946,1274],
  [2009,7,934,1282],[2009,8,949,1246],[2009,9,996,1226],
  [2009,10,1043,1178],[2009,11,1127,1173],[2009,12,1104,1170],
  // ── 2010 ── (QE2, gold ~$1090-1420)
  [2010,1,1118,1167],[2010,2,1095,1157],[2010,3,1114,1131],
  [2010,4,1149,1106],[2010,5,1199,1126],[2010,6,1232,1185],
  [2010,7,1188,1202],[2010,8,1215,1185],[2010,9,1271,1147],
  [2010,10,1344,1128],[2010,11,1369,1143],[2010,12,1405,1150],
  // ── 2011 ── (gold peaks Aug at $1,900, all-time high until 2020)
  [2011,1,1356,1119],[2011,2,1372,1116],[2011,3,1428,1121],
  [2011,4,1473,1082],[2011,5,1512,1072],[2011,6,1529,1078],
  [2011,7,1572,1064],[2011,8,1757,1064],[2011,9,1772,1114],
  [2011,10,1665,1140],[2011,11,1739,1125],[2011,12,1563,1153],
  // ── 2012 ── (QE3, gold ~$1590-1790)
  [2012,1,1656,1127],[2012,2,1723,1127],[2012,3,1674,1133],
  [2012,4,1649,1136],[2012,5,1583,1155],[2012,6,1598,1155],
  [2012,7,1600,1141],[2012,8,1627,1127],[2012,9,1770,1119],
  [2012,10,1746,1093],[2012,11,1726,1085],[2012,12,1687,1063],
  // ── 2013 ── (gold crashes Apr -13%, ~$1195-1680)
  [2013,1,1671,1062],[2013,2,1630,1091],[2013,3,1592,1097],
  [2013,4,1487,1124],[2013,5,1388,1105],[2013,6,1314,1133],
  [2013,7,1286,1129],[2013,8,1368,1117],[2013,9,1341,1082],
  [2013,10,1311,1063],[2013,11,1272,1053],[2013,12,1202,1054],
  // ── 2014 ── (USD surges, gold ~$1170-1345)
  [2014,1,1244,1056],[2014,2,1285,1063],[2014,3,1337,1069],
  [2014,4,1299,1031],[2014,5,1287,1026],[2014,6,1274,1021],
  [2014,7,1311,1007],[2014,8,1297,1018],[2014,9,1238,1040],
  [2014,10,1224,1054],[2014,11,1172,1099],[2014,12,1199,1095],
  // ── 2015 ── (dollar peak, gold ~$1050-1300)
  [2015,1,1251,1083],[2015,2,1228,1094],[2015,3,1179,1107],
  [2015,4,1204,1092],[2015,5,1205,1089],[2015,6,1175,1120],
  [2015,7,1131,1162],[2015,8,1117,1180],[2015,9,1122,1186],
  [2015,10,1156,1131],[2015,11,1080,1157],[2015,12,1060,1165],
  // ── 2016 ── (Brexit+Trump, gold ~$1075-1380)
  [2016,1,1097,1199],[2016,2,1185,1230],[2016,3,1232,1238],
  [2016,4,1244,1147],[2016,5,1270,1179],[2016,6,1287,1195],
  [2016,7,1342,1118],[2016,8,1343,1118],[2016,9,1319,1108],
  [2016,10,1267,1134],[2016,11,1224,1168],[2016,12,1152,1199],
  // ── 2017 ── (gold recovers ~$1155-1310)
  [2017,1,1208,1192],[2017,2,1233,1143],[2017,3,1228,1124],
  [2017,4,1268,1136],[2017,5,1252,1128],[2017,6,1257,1131],
  [2017,7,1231,1131],[2017,8,1285,1128],[2017,9,1314,1144],
  [2017,10,1280,1138],[2017,11,1283,1107],[2017,12,1302,1071],
  // ── 2018 ── (Fed tightening, USD strong, gold ~$1175-1345)
  [2018,1,1309,1064],[2018,2,1330,1075],[2018,3,1324,1070],
  [2018,4,1286,1083],[2018,5,1302,1080],[2018,6,1271,1073],
  [2018,7,1228,1117],[2018,8,1201,1130],[2018,9,1193,1113],
  [2018,10,1225,1131],[2018,11,1222,1127],[2018,12,1250,1114],
  // ── 2019 ── (trade war, rate cuts, gold ~$1280-1520)
  [2019,1,1291,1124],[2019,2,1317,1124],[2019,3,1293,1134],
  [2019,4,1283,1131],[2019,5,1286,1173],[2019,6,1341,1155],
  [2019,7,1413,1160],[2019,8,1510,1183],[2019,9,1494,1205],
  [2019,10,1491,1162],[2019,11,1462,1169],[2019,12,1479,1156],
  // ── 2020 ── (COVID, gold ATH $2,070)
  [2020,1,1580,1165],[2020,2,1586,1188],[2020,3,1591,1227],
  [2020,4,1686,1219],[2020,5,1715,1230],[2020,6,1728,1204],
  [2020,7,1972,1192],[2020,8,1969,1184],[2020,9,1886,1168],
  [2020,10,1879,1133],[2020,11,1873,1108],[2020,12,1887,1085],
  // ── 2021 ──
  [2021,1,1855,1101],[2021,2,1794,1122],[2021,3,1736,1134],
  [2021,4,1778,1118],[2021,5,1869,1124],[2021,6,1824,1131],
  [2021,7,1815,1152],[2021,8,1807,1166],[2021,9,1756,1179],
  [2021,10,1782,1184],[2021,11,1791,1190],[2021,12,1806,1192],
  // ── 2022 ── (Russia-Ukraine, Fed hikes, gold volatile)
  [2022,1,1819,1198],[2022,2,1875,1204],[2022,3,1940,1214],
  [2022,4,1924,1235],[2022,5,1845,1278],[2022,6,1830,1304],
  [2022,7,1728,1315],[2022,8,1754,1332],[2022,9,1658,1406],
  [2022,10,1632,1428],[2022,11,1734,1350],[2022,12,1788,1281],
  // ── 2023 ── (banking crisis, new ATH Dec)
  [2023,1,1929,1245],[2023,2,1836,1262],[2023,3,1966,1304],
  [2023,4,1999,1335],[2023,5,1963,1330],[2023,6,1921,1316],
  [2023,7,1958,1284],[2023,8,1938,1326],[2023,9,1920,1354],
  [2023,10,1983,1357],[2023,11,2041,1298],[2023,12,2063,1296],
  // ── 2024 ── (central bank buying, new ATH $2,800)
  [2024,1,2040,1332],[2024,2,2052,1338],[2024,3,2230,1335],
  [2024,4,2335,1378],[2024,5,2346,1370],[2024,6,2327,1382],
  [2024,7,2426,1381],[2024,8,2503,1341],[2024,9,2659,1326],
  [2024,10,2736,1382],[2024,11,2673,1403],[2024,12,2625,1445],
];
