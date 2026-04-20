// ═══════════════════════════════════════════════════════════════════════
// AURUM · DESIGN TOKENS
// Single source of truth. Every page imports T from here.
// ═══════════════════════════════════════════════════════════════════════

export const T = {
  // backgrounds
  bg: '#0a0a0a',
  bg1: '#0d0b08',
  bg3: '#16120c',
  card: '#0f0d0a',
  elev: '#16120c',
  deep: '#050505',
  deepBlack: '#050505',

  // text
  text: '#e8e3d8',
  sub: '#aaa39a',
  muted: '#6b655e',
  textMuted: '#6b655e',
  textSub: '#aaa39a',

  // gold scale
  gold: '#C5A572',
  goldB: '#E3C187',      // bright
  goldBright: '#E3C187',
  goldD: '#8a7d6b',      // dim
  goldDim: '#8a7d6b',
  goldDeep: '#6a5a3a',

  // gold with alpha
  goldBorder: 'rgba(197,165,114,0.22)',
  goldBorderS: 'rgba(197,165,114,0.5)',
  goldBorderStrong: 'rgba(197,165,114,0.5)',
  goldGlow: 'rgba(197,165,114,0.06)',

  // silver (shop)
  silver: '#c0c0c0',
  silverD: '#8a8a8a',
  silverB: '#D8DCE2',

  // neutrals
  border: 'rgba(255,255,255,0.08)',

  // semantic
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',

  // brand-specific (KakaoTalk SSO)
  kakao: '#FEE500',
  kakaoInk: '#191919',

  // type stacks
  serif: "'Cormorant Garamond', 'Noto Serif KR', Georgia, serif",
  serifKr: "'Noto Serif KR', 'Cormorant Garamond', Georgia, serif",
  sans: "'Outfit', system-ui, sans-serif",
  sansKr: "'Pretendard', 'Outfit', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── Neo-Seoul palette · for /goldpath + /referral ────────────────────
// Mirrors T's shape so components can swap imports transparently.
// All former "gold" roles become "hot pink" · cyan is the secondary accent.
export const T_NS = {
  // backgrounds — deeper plum-black, pulls from /referral
  bg: '#0b0b14',
  bg1: '#13131f',
  bg3: '#1b1b2b',
  card: '#13131f',
  elev: '#1b1b2b',
  deep: '#050510',
  deepBlack: '#050510',

  // text — slightly cooler
  text: '#f4f4ff',
  sub: '#a8a8c0',
  muted: '#6a6a85',
  textMuted: '#6a6a85',
  textSub: '#a8a8c0',

  // "gold" role → hot pink (legacy key preserved so components need no rewrite)
  gold: '#ff3d8a',
  goldB: '#ff6aa8',          // bright
  goldBright: '#ff6aa8',
  goldD: '#9aa5c4',          // dim → chrome-ish cool (for muted labels)
  goldDim: '#9aa5c4',
  goldDeep: '#d4206a',

  // tinted alpha
  goldBorder: 'rgba(255,61,138,0.22)',
  goldBorderS: 'rgba(255,61,138,0.5)',
  goldBorderStrong: 'rgba(255,61,138,0.5)',
  goldGlow: 'rgba(255,61,138,0.08)',

  // electric blue secondary
  blue: '#00e5ff',
  blueB: '#7ff0ff',
  blueD: '#0099bf',
  chrome: '#d4dcff',

  // silver passthrough (unused on /goldpath but keep shape)
  silver: '#c0c0c0',
  silverD: '#8a8a8a',
  silverB: '#D8DCE2',

  // neutrals
  border: 'rgba(255,255,255,0.08)',

  // semantic (shared)
  green: '#4ade80',
  red: '#f87171',

  // brand (shared)
  kakao: '#FEE500',
  kakaoInk: '#191919',

  // type stacks (shared)
  serif: "'Cormorant Garamond', 'Noto Serif KR', Georgia, serif",
  serifKr: "'Noto Serif KR', 'Cormorant Garamond', Georgia, serif",
  sans: "'Outfit', system-ui, sans-serif",
  sansKr: "'Pretendard', 'Outfit', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};
