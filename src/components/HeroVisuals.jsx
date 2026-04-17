// HeroVisuals.jsx — Luxury SVG hero illustrations
// Desktop-only right-column visuals. All use site gold palette.
// Import and place inside {!isMobile && (...)} guards in each page hero.

// ─── Shared constants ─────────────────────────────────────────────────────────
const GOLD       = '#C5A572';
const GOLD_BRIGHT = '#E3C187';
const GOLD_DIM   = '#8a7d6b';
const GOLD_DEEP  = '#6a5a3a';
const BG         = '#0a0a0a';
const BG2        = '#141414';
const BORDER     = 'rgba(197,165,114,0.18)';

// ─── AGP Visual — Stacked Gold Ingots ────────────────────────────────────────
// Represents gram accumulation over time
export function AGPHeroVisual() {
  return (
    <svg
      viewBox="0 0 480 400"
      width="100%"
      style={{ maxWidth: 480, opacity: 0.92 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ingot-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#4a3e26" />
          <stop offset="35%"  stopColor={GOLD} />
          <stop offset="50%"  stopColor={GOLD_BRIGHT} />
          <stop offset="65%"  stopColor={GOLD} />
          <stop offset="100%" stopColor="#2a2418" />
        </linearGradient>
        <linearGradient id="ingot-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6a5a3a" />
          <stop offset="100%" stopColor="#2a2010" />
        </linearGradient>
        <linearGradient id="ingot-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4a3e26" />
          <stop offset="100%" stopColor="#1a1408" />
        </linearGradient>
        <linearGradient id="glow-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor={GOLD} stopOpacity="0.15" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background glow pool */}
      <ellipse cx="240" cy="340" rx="180" ry="40" fill="url(#glow-grad)" />

      {/* ── Ingot row 3 (back, smallest) ── */}
      {[0, 1].map(i => {
        const x = 80 + i * 150, y = 140;
        return (
          <g key={`r3-${i}`} opacity="0.7">
            {/* top face */}
            <polygon points={`${x},${y} ${x+120},${y} ${x+100},${y+20} ${x-20},${y+20}`} fill="url(#ingot-top)" stroke={GOLD_DIM} strokeWidth="0.5" />
            {/* front face */}
            <polygon points={`${x-20},${y+20} ${x+100},${y+20} ${x+100},${y+50} ${x-20},${y+50}`} fill="url(#ingot-face)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            {/* right side */}
            <polygon points={`${x+120},${y} ${x+120},${y+30} ${x+100},${y+50} ${x+100},${y+20}`} fill="url(#ingot-side)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            {/* AU mark */}
            <text x={x+36} y={y+40} fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="11" fill="rgba(197,165,114,0.6)" letterSpacing="2">AU</text>
          </g>
        );
      })}

      {/* ── Ingot row 2 (middle) ── */}
      {[0, 1, 2].map(i => {
        const x = 30 + i * 130, y = 195;
        return (
          <g key={`r2-${i}`} opacity="0.85">
            <polygon points={`${x},${y} ${x+120},${y} ${x+100},${y+20} ${x-20},${y+20}`} fill="url(#ingot-top)" stroke={GOLD_DIM} strokeWidth="0.5" />
            <polygon points={`${x-20},${y+20} ${x+100},${y+20} ${x+100},${y+52} ${x-20},${y+52}`} fill="url(#ingot-face)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            <polygon points={`${x+120},${y} ${x+120},${y+32} ${x+100},${y+52} ${x+100},${y+20}`} fill="url(#ingot-side)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            <text x={x+36} y={y+42} fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="11" fill="rgba(197,165,114,0.6)" letterSpacing="2">AU</text>
          </g>
        );
      })}

      {/* ── Ingot row 1 (front, largest) ── */}
      {[0, 1, 2, 3].map(i => {
        const x = -10 + i * 118, y = 260;
        const isCenter = i === 1 || i === 2;
        return (
          <g key={`r1-${i}`}>
            <polygon points={`${x},${y} ${x+108},${y} ${x+88},${y+18} ${x-20},${y+18}`} fill="url(#ingot-top)" stroke={GOLD} strokeWidth={isCenter ? '0.8' : '0.5'} />
            <polygon points={`${x-20},${y+18} ${x+88},${y+18} ${x+88},${y+54} ${x-20},${y+54}`} fill="url(#ingot-face)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            <polygon points={`${x+108},${y} ${x+108},${y+36} ${x+88},${y+54} ${x+88},${y+18}`} fill="url(#ingot-side)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            {/* Stamp line detail */}
            <line x1={x+8} y1={y+32} x2={x+78} y2={y+32} stroke={GOLD_DIM} strokeWidth="0.4" opacity="0.5" />
            <text x={x+24} y={y+44} fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="12" fill={isCenter ? GOLD : 'rgba(197,165,114,0.55)'} letterSpacing="2">AU</text>
          </g>
        );
      })}

      {/* ── Gram counter badge ── */}
      <rect x="170" y="46" width="140" height="56" rx="2" fill={BG2} stroke={BORDER} strokeWidth="1" />
      <line x1="170" y1="46" x2="310" y2="46" stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <text x="240" y="68" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill={GOLD_DIM} letterSpacing="2">ACCUMULATED</text>
      <text x="240" y="88" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="22" fontWeight="700" fill={GOLD_BRIGHT} letterSpacing="-0.5">4.291 g</text>

      {/* ── Subtle grid lines ── */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1="20" y1={340 + i * 12} x2="460" y2={340 + i * 12} stroke={GOLD} strokeWidth="0.3" opacity={0.03 + i * 0.01} />
      ))}

      {/* ── LBMA badge ── */}
      <rect x="174" y="340" width="132" height="22" rx="1" fill="none" stroke={BORDER} strokeWidth="0.8" />
      <text x="240" y="355" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={GOLD_DIM} letterSpacing="2">LBMA APPROVED · 999.9</text>
    </svg>
  );
}

// ─── WhyGold Visual — Gold Coin + Chart ──────────────────────────────────────
// Represents the investment case: history + upward value
export function WhyGoldHeroVisual() {
  const chartPoints = "60,260 100,240 140,250 180,210 220,220 260,180 300,170 340,150 380,130 420,110";
  const chartFill   = "60,260 100,240 140,250 180,210 220,220 260,180 300,170 340,150 380,130 420,110 420,320 60,320";

  return (
    <svg
      viewBox="0 0 480 400"
      width="100%"
      style={{ maxWidth: 480, opacity: 0.9 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="coin-bg" cx="45%" cy="38%" r="55%">
          <stop offset="0%"   stopColor={GOLD_BRIGHT} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GOLD}        stopOpacity="0" />
        </radialGradient>
        <radialGradient id="coin-face" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#b8914a" />
          <stop offset="40%"  stopColor={GOLD} />
          <stop offset="100%" stopColor="#4a3820" />
        </radialGradient>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={GOLD} stopOpacity="0.12" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <clipPath id="chart-clip">
          <rect x="40" y="80" width="400" height="260" />
        </clipPath>
      </defs>

      {/* Chart area fill */}
      <polygon points={chartFill} fill="url(#chart-fill)" clipPath="url(#chart-clip)" />

      {/* Chart grid lines */}
      {[100, 160, 220, 280].map((y, i) => (
        <line key={i} x1="40" y1={y} x2="440" y2={y} stroke={GOLD} strokeWidth="0.4" strokeDasharray="4 8" opacity="0.15" />
      ))}
      {[60, 140, 220, 300, 380].map((x, i) => (
        <line key={i} x1={x} y1="80" x2={x} y2="320" stroke={GOLD} strokeWidth="0.4" strokeDasharray="4 8" opacity="0.1" />
      ))}

      {/* Chart line */}
      <polyline points={chartPoints} fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chart-clip)" />

      {/* Chart dots at key points */}
      {[
        [180, 210], [260, 180], [340, 150], [420, 110]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 5 : 3} fill={i === 3 ? GOLD_BRIGHT : GOLD} stroke={BG} strokeWidth="1.5" />
      ))}

      {/* Latest value badge */}
      <rect x="320" y="78" width="120" height="44" rx="2" fill={BG2} stroke={BORDER} strokeWidth="0.8" />
      <line x1="320" y1="78" x2="440" y2="78" stroke={GOLD_BRIGHT} strokeWidth="1" />
      <text x="380" y="96" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={GOLD_DIM} letterSpacing="1.5">XAU / USD</text>
      <text x="380" y="113" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="15" fontWeight="700" fill={GOLD_BRIGHT}>$4,817</text>

      {/* ── Large gold coin ── */}
      {/* Outer glow */}
      <circle cx="200" cy="220" r="115" fill="url(#coin-bg)" />
      {/* Coin rim outer */}
      <circle cx="200" cy="220" r="100" fill="none" stroke={GOLD_DIM} strokeWidth="1" opacity="0.4" />
      {/* Coin body */}
      <circle cx="200" cy="220" r="94" fill="url(#coin-face)" />
      {/* Rim detail inner ring */}
      <circle cx="200" cy="220" r="88" fill="none" stroke="rgba(197,165,114,0.35)" strokeWidth="1" />
      <circle cx="200" cy="220" r="82" fill="none" stroke="rgba(197,165,114,0.2)" strokeWidth="0.5" />

      {/* Coin notch marks around rim */}
      {Array.from({length: 36}).map((_, i) => {
        const angle = (i * 10) * Math.PI / 180;
        const x1 = 200 + 84 * Math.cos(angle);
        const y1 = 220 + 84 * Math.sin(angle);
        const x2 = 200 + 89 * Math.cos(angle);
        const y2 = 220 + 89 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DIM} strokeWidth="1" opacity="0.5" />;
      })}

      {/* AU symbol */}
      <text x="200" y="205" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="52" fontWeight="600" fill="rgba(20,14,8,0.85)" letterSpacing="-1">AU</text>
      {/* 79 atomic number */}
      <text x="200" y="230" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="11" fill="rgba(20,14,8,0.6)" letterSpacing="3">AURUM</text>
      {/* Bottom text */}
      <text x="200" y="248" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="rgba(20,14,8,0.45)" letterSpacing="2">999.9 · FINE GOLD</text>

      {/* Year engraved */}
      <text x="200" y="290" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="rgba(20,14,8,0.4)" letterSpacing="4">MMXXVI</text>

      {/* ── Stats below ── */}
      <line x1="60" y1="348" x2="360" y2="348" stroke={BORDER} strokeWidth="0.8" />
      {[
        ['5,000+', 'years of history'],
        ['+13.2%', '2024 return'],
        ['36,000t', 'CB reserves'],
      ].map(([v, l], i) => (
        <g key={i} transform={`translate(${80 + i * 120}, 0)`}>
          <text x="0" y="368" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="13" fontWeight="700" fill={GOLD}>{v}</text>
          <text x="0" y="382" textAnchor="middle" fontFamily="'Outfit',sans-serif" fontSize="9" fill={GOLD_DIM}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Storage Visual — Vault Door ─────────────────────────────────────────────
// Represents Malca-Amit Singapore FTZ vault security
export function StorageHeroVisual() {
  return (
    <svg
      viewBox="0 0 480 440"
      width="100%"
      style={{ maxWidth: 480, opacity: 0.9 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="vault-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={GOLD} stopOpacity="0.08" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="door-face" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#2a2418" />
          <stop offset="60%"  stopColor="#1a1408" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
        <radialGradient id="dial-face" cx="42%" cy="38%" r="55%">
          <stop offset="0%"   stopColor="#3a3028" />
          <stop offset="100%" stopColor="#1a1408" />
        </radialGradient>
        <linearGradient id="spoke-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={GOLD_DIM} stopOpacity="0.3" />
          <stop offset="50%"  stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_DIM} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Background radial glow */}
      <circle cx="240" cy="210" r="200" fill="url(#vault-glow)" />

      {/* ── Vault frame / surround ── */}
      <rect x="60" y="50" width="360" height="340" rx="8" fill="none" stroke={GOLD_DIM} strokeWidth="0.8" opacity="0.3" />
      <rect x="68" y="58" width="344" height="324" rx="6" fill="none" stroke={GOLD_DIM} strokeWidth="0.4" opacity="0.15" />

      {/* Corner rivets */}
      {[[80,70],[408,70],[80,370],[408,370]].map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#1e1e1e" stroke={GOLD_DIM} strokeWidth="0.8" />
          <circle cx={x} cy={y} r="2" fill={GOLD_DIM} opacity="0.6" />
        </g>
      ))}

      {/* ── Main vault door circle ── */}
      {/* Outer shadow ring */}
      <circle cx="240" cy="210" r="158" fill="none" stroke={GOLD_DIM} strokeWidth="0.5" opacity="0.2" />
      {/* Outer ring */}
      <circle cx="240" cy="210" r="150" fill="#0f0f0f" stroke={GOLD} strokeWidth="1.2" />
      {/* Rim detail */}
      <circle cx="240" cy="210" r="144" fill="none" stroke={GOLD_DIM} strokeWidth="0.6" opacity="0.4" />

      {/* Bolt holes around rim (12 positions) */}
      {Array.from({length: 12}).map((_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const bx = 240 + 136 * Math.cos(angle);
        const by = 210 + 136 * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r="7" fill="#1a1a1a" stroke={GOLD_DIM} strokeWidth="0.8" />
            <circle cx={bx} cy={by} r="3.5" fill="#111" stroke={GOLD} strokeWidth="0.5" opacity="0.6" />
          </g>
        );
      })}

      {/* Door face */}
      <circle cx="240" cy="210" r="120" fill="url(#door-face)" stroke={GOLD_DIM} strokeWidth="0.6" opacity="0.5" />

      {/* ── Handle spokes (4-spoke wheel) ── */}
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = 240 + 28 * Math.cos(rad);
        const y1 = 210 + 28 * Math.sin(rad);
        const x2 = 240 + 88 * Math.cos(rad);
        const y2 = 210 + 88 * Math.sin(rad);
        return (
          <g key={deg}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#spoke-grad)" strokeWidth="8" strokeLinecap="round" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
            {/* Handle grip at end */}
            <circle cx={x2} cy={y2} r="10" fill="#1e1e1e" stroke={GOLD} strokeWidth="0.8" />
            <circle cx={x2} cy={y2} r="5"  fill={GOLD_DEEP} />
          </g>
        );
      })}

      {/* ── Centre hub ── */}
      <circle cx="240" cy="210" r="28" fill="#1a1a1a" stroke={GOLD} strokeWidth="1" />
      <circle cx="240" cy="210" r="22" fill="url(#dial-face)" stroke={GOLD_DIM} strokeWidth="0.6" />
      <circle cx="240" cy="210" r="6"  fill={GOLD} opacity="0.8" />

      {/* ── Combination dial numbers ── */}
      {[0, 20, 40, 60, 80].map((n, i) => {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const tx = 240 + 108 * Math.cos(angle);
        const ty = 210 + 108 * Math.sin(angle);
        return (
          <text key={i} x={tx} y={ty + 4} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill={GOLD_DIM} opacity="0.6">{n}</text>
        );
      })}

      {/* Tick marks */}
      {Array.from({length: 40}).map((_, i) => {
        const angle = (i * 9 - 90) * Math.PI / 180;
        const isMajor = i % 4 === 0;
        const r1 = isMajor ? 122 : 125;
        const r2 = 130;
        return (
          <line key={i}
            x1={240 + r1 * Math.cos(angle)} y1={210 + r1 * Math.sin(angle)}
            x2={240 + r2 * Math.cos(angle)} y2={210 + r2 * Math.sin(angle)}
            stroke={GOLD_DIM} strokeWidth={isMajor ? 1 : 0.5} opacity={isMajor ? 0.5 : 0.25}
          />
        );
      })}

      {/* ── Keyhole ── */}
      <circle cx="240" cy="198" r="8" fill="#0a0a0a" stroke={GOLD_DIM} strokeWidth="0.8" opacity="0.7" />
      <rect x="236.5" y="198" width="7" height="14" rx="3" fill="#0a0a0a" stroke={GOLD_DIM} strokeWidth="0.8" opacity="0.7" />

      {/* ── Singapore FTZ label ── */}
      <rect x="148" y="376" width="184" height="32" rx="2" fill={BG2} stroke={BORDER} strokeWidth="0.8" />
      <line x1="148" y1="376" x2="332" y2="376" stroke={GOLD} strokeWidth="0.8" opacity="0.5" />
      <text x="240" y="387" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={GOLD_DIM} letterSpacing="2">MALCA-AMIT · SINGAPORE FTZ</text>
      <text x="240" y="400" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={GOLD_DIM} letterSpacing="1.5" opacity="0.7">ZONE A · ISO 9001:2015</text>

      {/* ── LOCKED status ── */}
      <rect x="192" y="22" width="96" height="22" rx="1" fill="none" stroke="rgba(74,222,128,0.3)" strokeWidth="0.8" />
      <text x="240" y="37" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#4ade80" letterSpacing="3">● SECURED</text>
    </svg>
  );
}
