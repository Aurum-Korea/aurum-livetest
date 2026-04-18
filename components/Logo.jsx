import { T } from '../lib/index.jsx';

export default function Logo({ size = 40, showWordmark = true, onClick }) {
  return (
    <a href="/" onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:14, textDecoration:'none' }}>
      <span className="aurum-logo-mark" style={{
        width:size, height:size, border:`1px solid ${T.goldBorder}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:T.serif, fontSize:size*0.42, fontWeight:500,
        color:T.gold, letterSpacing:'0.04em', transition:'border-color 0.3s', flexShrink:0,
      }}>AU</span>
      {showWordmark && (
        <span style={{ fontFamily:T.serif, fontSize:size*0.52, fontWeight:500, letterSpacing:'0.32em', color:T.text }}>
          AURUM
        </span>
      )}
    </a>
  );
}
