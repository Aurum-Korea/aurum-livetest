import { T } from '../lib/tokens';
import AUSquare from './AUSquare';
import AurumWordmark from './AurumWordmark';

export default function QuietFooter() {
  return (
    <div style={{
      borderTop: `1px solid ${T.goldBorder}`,
      padding: '60px 24px 56px',
      background: T.deep || T.bg,
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        marginBottom: 14,
      }}>
        <AUSquare size={36} />
        <AurumWordmark size={18} serial="MMXXVI" />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.32em' }}>
        QUIETLY · FOREVER
      </div>
    </div>
  );
}
