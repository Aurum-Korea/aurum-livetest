import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AUSquare · chemical-element cell · transparent fill (v10a2)
//
// Gold frame only, no solid fill — black page background shows through.
// ═══════════════════════════════════════════════════════════════════════
export default function AUSquare({ size = 40, serif = T.serif }) {
  const uid = `au-${size}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8C885" />
          <stop offset="50%"  stopColor="#C5A572" />
          <stop offset="100%" stopColor="#8A6C3F" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="25%" cy="25%" r="60%">
          <stop offset="0%"  stopColor="rgba(232,200,133,0.18)" />
          <stop offset="70%" stopColor="rgba(232,200,133,0.02)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <rect x="3" y="3" width="94" height="94" fill="transparent" />
      <rect x="3" y="3" width="94" height="94" fill={`url(#${uid}-glow)`} />

      <rect x="3" y="3" width="94" height="94"
        fill="none" stroke={`url(#${uid}-stroke)`} strokeWidth="2" />
      <rect x="7" y="7" width="86" height="86"
        fill="none" stroke="rgba(197,165,114,0.28)" strokeWidth="0.5" />

      <text x="50" y="64"
        textAnchor="middle"
        fontFamily={serif}
        fontWeight="500"
        fontSize="46"
        fill="#C5A572"
        letterSpacing="-0.02em"
      >
        Au
      </text>
    </svg>
  );
}
