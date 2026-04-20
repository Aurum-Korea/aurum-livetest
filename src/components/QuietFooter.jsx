import { T } from '../lib/tokens';

export default function QuietFooter() {
  return (
    <div style={{
      borderTop: `1px solid ${T.goldBorder}`,
      padding: '60px 24px 56px',
      background: T.deep,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: T.serif, fontStyle: 'italic', fontSize: 22,
        color: T.gold, fontWeight: 500, letterSpacing: '-0.01em',
        marginBottom: 10,
      }}>
        Aurum
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.32em' }}>
        MMXXVI · QUIETLY · FOREVER
      </div>
    </div>
  );
}
