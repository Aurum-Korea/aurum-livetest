import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════
// AurumWordmark · locked wordmark treatment
//
// Matches reference /mnt/user-data/uploads/1776710278831_image.png:
//   AURUM · bold sans (Outfit 800), uppercase, ~0.16em tracked
//   optional serial · mono, tiny, gold-dim, right-aligned
//
// Used site-wide wherever "aurum" appears as the brand mark in text form.
// Pair with <AUSquare/> for full badge, or use alone.
// ═══════════════════════════════════════════════════════════════════════
export default function AurumWordmark({
  size = 16,          // primary letter size in px
  serial,             // optional serial e.g. "001" · MMXXVI · membership
  color = T.text,     // text color
  serialColor,        // override serial color (default: T.goldD)
  letterSpacing = '0.14em',
}) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: Math.max(6, size * 0.55),
      lineHeight: 1,
    }}>
      <span style={{
        fontFamily: T.sans || "'Outfit',sans-serif",
        fontWeight: 800,
        fontSize: size,
        letterSpacing,
        color,
        textTransform: 'uppercase',
      }}>
        AURUM
      </span>
      {serial && (
        <span style={{
          fontFamily: T.mono || "'JetBrains Mono',monospace",
          fontSize: Math.max(9, size * 0.5),
          letterSpacing: '0.22em',
          color: serialColor || T.goldD || '#8a7d6b',
          fontWeight: 500,
        }}>
          {serial}
        </span>
      )}
    </span>
  );
}
