import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · AU SQUARE MARK
// 
// The locked corporate mark: tight gold-gradient square tile with italic
// "AU" letterform. Used everywhere as the site-wide logo.
// 
// Props:
//   size     — pixel size (default 22 for nav, 200+ for hero)
//   rotating — if true, slow 3D flip animation (for hero use)
//   dark     — render as dark-on-gold vs gold-on-dark (default dark-on-gold)
// ═══════════════════════════════════════════════════════════════════════

export default function AUSquare({ size = 22, rotating = false, dark = false }) {
  const fontSize = Math.round(size * 0.58);
  const innerPad = Math.round(size * 0.08);
  const radius = Math.max(2, Math.round(size * 0.08));

  return (
    <div
      className={rotating ? 'au-square-rotating' : ''}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: dark
          ? 'transparent'
          : `linear-gradient(135deg, ${T.goldB} 0%, ${T.gold} 50%, ${T.goldDeep} 100%)`,
        border: dark ? `1px solid ${T.gold}` : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: dark ? 'none' : `0 0 ${Math.round(size * 0.6)}px rgba(197,165,114,0.2)`,
        position: 'relative',
        flexShrink: 0,
        padding: innerPad,
        perspective: rotating ? `${size * 4}px` : 'none',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{
          display: 'block',
          animation: rotating ? 'au-flip 6s cubic-bezier(0.4,0,0.2,1) infinite' : 'none',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Inner polish gradient for depth */}
        {!dark && (
          <defs>
            <radialGradient id={`au-sheen-${size}`} cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="rgba(255,245,215,0.4)" />
              <stop offset="100%" stopColor="rgba(255,245,215,0)" />
            </radialGradient>
          </defs>
        )}
        {!dark && (
          <rect x="0" y="0" width="100" height="100" fill={`url(#au-sheen-${size})`} />
        )}

        {/* AU letterform · italic serif, weighty */}
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="68"
          letterSpacing="-0.04em"
          fill={dark ? T.gold : 'rgba(20,14,6,0.88)'}
        >
          AU
        </text>

        {/* Thin rule at base (like bullion mark) */}
        <line
          x1="20"
          y1="85"
          x2="80"
          y2="85"
          stroke={dark ? T.goldDim : 'rgba(20,14,6,0.28)'}
          strokeWidth="1.2"
        />

        {/* Micro fineness text · shows at larger sizes only */}
        {size >= 80 && (
          <text
            x="50"
            y="94"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="6"
            letterSpacing="0.28em"
            fill={dark ? T.goldDim : 'rgba(20,14,6,0.5)'}
            fontWeight="600"
          >
            999.9 · AU
          </text>
        )}
      </svg>

      {rotating && (
        <style>{`
          @keyframes au-flip {
            0%   { transform: rotateY(0deg); }
            45%  { transform: rotateY(180deg); }
            50%  { transform: rotateY(180deg); }
            95%  { transform: rotateY(360deg); }
            100% { transform: rotateY(360deg); }
          }
        `}</style>
      )}
    </div>
  );
}
