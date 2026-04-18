import { useState } from 'react';
import { T } from '../lib/index.jsx';

/* ─── Badge ──────────────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default', style = {} }) {
  const colors = {
    default: { color: T.gold,  border: T.goldBorder },
    solid:   { color: '#0a0a0a', border: T.gold, background: T.gold },
    green:   { color: T.green, border: 'rgba(74,222,128,0.3)' },
    red:     { color: T.red,   border: 'rgba(248,113,113,0.3)' },
    amber:   { color: T.amber, border: 'rgba(245,158,11,0.3)' },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 11, letterSpacing: '0.16em',
      color: c.color, border: `1px solid ${c.border}`, padding: '5px 12px',
      textTransform: 'uppercase', display: 'inline-block',
      background: c.background || 'transparent', ...style,
    }}>{children}</span>
  );
}

/* ─── Stat Bar ───────────────────────────────────────────────────────────── */
export function StatBar({ stats, cols }) {
  const n = cols || stats.length;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`,
      borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '20px 24px', textAlign: 'center',
          borderRight: i < stats.length - 1 ? `1px solid ${T.border}` : 'none',
        }}>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: s.color || T.gold, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.value}</div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 5, letterSpacing: '0.05em', lineHeight: 1.4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────────────────────────── */
export function Tabs({ tabs, children, style = {} }) {
  const [active, setActive] = useState(0);
  return (
    <div style={style}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, marginBottom: 28 }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 24px', fontFamily: T.sans, fontSize: 14,
            color: active === i ? T.gold : T.textMuted,
            borderBottom: active === i ? `2px solid ${T.gold}` : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.2s', fontWeight: active === i ? 600 : 400,
          }}>{tab}</button>
        ))}
      </div>
      {Array.isArray(children) ? children[active] : children}
    </div>
  );
}

/* ─── Accordion ──────────────────────────────────────────────────────────── */
export function Accordion({ items, allowMultiple = false }) {
  const [open, setOpen] = useState(allowMultiple ? [] : null);
  const toggle = i => {
    if (allowMultiple) setOpen(o => o.includes(i) ? o.filter(x => x !== i) : [...o, i]);
    else setOpen(o => o === i ? null : i);
  };
  const isOpen = i => allowMultiple ? open.includes(i) : open === i;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: isOpen(i) ? T.bg1 : 'transparent',
          border: `1px solid ${isOpen(i) ? T.goldBorder : T.border}`,
          transition: 'all 0.25s',
        }}>
          <button onClick={() => toggle(i)} style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            padding: '18px 24px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', color: T.text, fontFamily: T.sans,
            fontSize: 15, fontWeight: isOpen(i) ? 600 : 400, textAlign: 'left', gap: 12,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.goldDim, letterSpacing: '0.08em', flexShrink: 0, minWidth: 22 }}>{String(i + 1).padStart(2, '0')}</span>
              {item.icon && <div style={{ width:44, height:44, background:T.bgCard, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:T.gold }}>{item.icon}</div>}
              {item.title}
            </span>
            <span style={{
              color: T.gold, fontSize: 20, fontFamily: T.serif, flexShrink: 0,
              transform: isOpen(i) ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s',
            }}>+</span>
          </button>
          {isOpen(i) && (
            <div style={{ padding: item.icon ? '0 24px 22px 82px' : '0 24px 22px 40px', color: T.textSub, fontFamily: T.sans, fontSize: 14, lineHeight: 1.8 }}>
              {typeof item.content === 'string' ? <p>{item.content}</p> : item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Form Step wrapper ──────────────────────────────────────────────────── */
export function FormStep({ active, children }) {
  if (!active) return null;
  return (
    <div style={{ animation: 'fadeUp 0.35s ease' }}>
      {children}
    </div>
  );
}

/* ─── Consent Checkbox ───────────────────────────────────────────────────── */
export function ConsentCheckbox({ checked, onChange, label, required, onView }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 0', borderBottom: `1px dashed ${T.goldBorder}`, cursor: 'pointer',
    }} onClick={() => onChange(!checked)}>
      <div style={{
        width: 18, height: 18, border: `1.5px solid ${checked ? T.gold : T.goldBorder}`,
        background: checked ? T.gold : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 2, transition: 'all 0.2s',
      }}>
        {checked && <span style={{ color: '#0a0a0a', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.sansKr, color: T.text, fontSize: 14, flexWrap: 'wrap' }}>
          <span>{label}</span>
          <span style={{ color: required ? T.gold : T.textMuted, fontSize: 11, fontFamily: T.mono }}>
            {required ? '[필수]' : '[선택]'}
          </span>
          {onView && (
            <button onClick={e => { e.stopPropagation(); onView(); }} style={{
              marginLeft: 'auto', fontSize: 11, color: T.textMuted, fontFamily: T.mono,
              letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>View →</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Method Card ────────────────────────────────────────────────── */
export function PaymentMethodCard({ value, selected, onChange, label, subtitle, badge, fee, children }) {
  const isSel = selected === value;
  return (
    <div onClick={() => onChange(value)} style={{
      cursor: 'pointer', padding: '20px 18px',
      background: isSel ? T.goldGlow : T.bgElevated,
      border: `1px solid ${isSel ? T.goldBorderStrong : T.goldBorder}`,
      transition: 'all 0.25s', userSelect: 'none',
    }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.15em', color: isSel ? T.gold : T.goldDim, textTransform: 'uppercase', marginBottom: 8 }}>{badge}</div>
      <div style={{ fontFamily: T.sansKr, fontWeight: 500, color: T.text, fontSize: 15, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.goldDim, fontSize: 13, marginBottom: 10 }}>{subtitle}</div>
      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.gold, paddingTop: 10, borderTop: `1px dashed ${T.goldBorder}` }}>{fee}</div>
      {isSel && children && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.goldBorder}` }}>{children}</div>
      )}
    </div>
  );
}

/* ─── Trust Strip ────────────────────────────────────────────────────────── */
export function TrustStrip() {
  const items = [
    { icon: '🇸🇬', title: 'Singapore FTZ', sub: 'Malca-Amit 보관' },
    { icon: '🛡️', title: "Lloyd's of London", sub: '전액 보험' },
    { icon: '✅', title: 'LBMA 승인',  sub: '귀금속 바' },
    { icon: '🔒', title: 'AML/KYC 준수', sub: '싱가포르 등록' },
    { icon: '📊', title: '매일 감사', sub: '백킹 리포트 공개' },
  ];
  return (
    <div style={{ padding: '28px 80px', background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 500 }}>{item.title}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
export function SectionHead({ badge, title, sub, align = 'center', style = {} }) {
  return (
    <div style={{ textAlign: align, marginBottom: 48, ...style }}>
      {badge && <Badge style={{ marginBottom: 20 }}>{badge}</Badge>}
      <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3vw,40px)', fontWeight: 500, color: T.text, margin: badge ? '0' : '0', lineHeight: 1.2 }}>
        {title}
      </h2>
      {sub && <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, marginTop: 14, lineHeight: 1.75 }}>{sub}</p>}
    </div>
  );
}

/* ─── Flag components ────────────────────────────────────────────────────── */
export const FlagSG = ({ size = 18 }) => (
  <img src="https://hatscripts.github.io/circle-flags/flags/sg.svg" alt="SG" style={{ width: size, height: size, verticalAlign: 'middle', display: 'inline-block', flexShrink: 0 }} />
);
export const FlagKR = ({ size = 18 }) => (
  <img src="https://hatscripts.github.io/circle-flags/flags/kr.svg" alt="KR" style={{ width: size, height: size, verticalAlign: 'middle', display: 'inline-block', flexShrink: 0 }} />
);
