import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AUSquare · chemical-element cell
//
// Matches reference /mnt/user-data/uploads/1776704208857_image.png:
//   - warm gold metallic gradient (periodic-table cell look)
//   - italic serif "AU" centered
//   - thin inner border hairline
//   - subtle inset shadow for depth
//   - no "999.9" subtext, no rule line
//   - sharp right angles (no rounded corners)
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
        <linearGradient id={`${uid}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8C885" />
          <stop offset="24%"  stopColor="#D4AF6F" />
          <stop offset="52%"  stopColor="#B08D54" />
          <stop offset="78%"  stopColor="#8A6C3F" />
          <stop offset="100%" stopColor="#6B5130" />
        </linearGradient>
        <radialGradient id={`${uid}-sheen`} cx="30%" cy="25%" r="70%">
          <stop offset="0%"   stopColor="rgba(255,235,190,0.35)" />
          <stop offset="50%"  stopColor="rgba(255,220,170,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id={`${uid}-depth`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.35)" />
          <stop offset="30%"  stopColor="rgba(0,0,0,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="96" height="96" fill={`url(#${uid}-face)`} />
      <rect x="2" y="2" width="96" height="96" fill={`url(#${uid}-sheen)`} />
      <rect x="2" y="2" width="96" height="96" fill={`url(#${uid}-depth)`} />

      <rect x="2" y="2" width="96" height="96"
        fill="none" stroke="rgba(40,26,12,0.55)" strokeWidth="1.5" />
      <rect x="6" y="6" width="88" height="88"
        fill="none" stroke="rgba(255,230,180,0.18)" strokeWidth="0.6" />

      <text x="50" y="64"
        textAnchor="middle"
        fontFamily={serif}
        fontStyle="italic"
        fontWeight="500"
        fontSize="48"
        fill="rgba(30,20,8,0.85)"
        letterSpacing="-0.02em"
      >
        AU
      </text>
    </svg>
  );
}
