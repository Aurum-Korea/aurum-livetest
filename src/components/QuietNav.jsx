import { Link } from 'react-router-dom';
import { T } from '../lib/tokens';

export default function QuietNav({ page }) {
  return (
    <div style={{
      padding: '20px 24px', position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.text, fontWeight: 500 }}>Aurum</span>
          {page && (
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
              / {page}
            </span>
          )}
        </Link>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em' }}>한 · EN</span>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.goldD, letterSpacing: '0.12em', cursor: 'pointer' }}>☰</span>
        </div>
      </div>
    </div>
  );
}
