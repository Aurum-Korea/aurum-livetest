import { useNavigate } from 'react-router-dom';
import { T } from '../lib/tokens';

// Palette accent resolver · 'neo' uses hot pink, default uses gold
const getAccent = (palette) => palette === 'neo' ? {
  primary:  '#ff3d8a',
  primaryB: '#ff6aa8',
  border:   'rgba(255,61,138,0.22)',
} : {
  primary:  T.gold,
  primaryB: T.goldB,
  border:   T.goldBorder,
};

// Section heading · § numeral + Korean + English italic
export function SectionHead({ num, ko, en }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 14, textTransform: 'uppercase' }}>
        § {num}
      </div>
      <h2 style={{
        fontFamily: T.serifKr,
        fontSize: 'clamp(26px, 3.6vw, 38px)',
        fontWeight: 500, color: T.text, lineHeight: 1.1,
        margin: '0 0 8px', letterSpacing: '-0.01em',
      }}>
        {ko}
      </h2>
      {en && (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldD, lineHeight: 1.3 }}>
          {en}
        </div>
      )}
    </div>
  );
}

// Korean serif body paragraph · max-width 680 for readability
export function Prose({ children }) {
  return (
    <p style={{
      fontFamily: T.serifKr, fontSize: 16, color: T.sub, lineHeight: 1.85,
      margin: '0 0 20px', fontWeight: 300, maxWidth: 680,
    }}>
      {children}
    </p>
  );
}

// Primary gold-fill CTA · optional `to` prop for navigation
export function PrimaryCTA({ children, onClick, disabled, fullWidth, to, palette = 'gold' }) {
  const navigate = useNavigate();
  const A = getAccent(palette);
  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
    if (to && !e.defaultPrevented) navigate(to);
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        background: disabled ? T.card : A.primary,
        color: disabled ? T.muted : T.bg,
        padding: '15px 28px',
        fontFamily: T.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        border: `1px solid ${disabled ? T.border : A.primary}`,
      }}
      onMouseEnter={e => { if (!disabled) e.target.style.background = A.primaryB; }}
      onMouseLeave={e => { if (!disabled) e.target.style.background = A.primary; }}
    >
      {children}
    </button>
  );
}

// Ghost italic CTA · optional `to` prop
export function GhostCTA({ children, onClick, to, palette = 'gold' }) {
  const navigate = useNavigate();
  const A = getAccent(palette);
  const borderStrong = palette === 'neo' ? 'rgba(255,61,138,0.5)' : T.goldBorderS;
  const glow = palette === 'neo' ? 'rgba(255,61,138,0.12)' : T.goldGlow;
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (to && !e.defaultPrevented) navigate(to);
  };
  return (
    <button
      onClick={handleClick}
      style={{
        background: 'transparent', border: `1px solid ${A.border}`,
        color: A.primary, padding: '15px 28px',
        fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, fontWeight: 400,
        cursor: 'pointer', transition: 'all 0.3s',
      }}
      onMouseEnter={e => {
        e.target.style.borderColor = borderStrong;
        e.target.style.background = glow;
      }}
      onMouseLeave={e => {
        e.target.style.borderColor = A.border;
        e.target.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
