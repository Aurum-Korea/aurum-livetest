import { useState, useEffect } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';
import Logo from './Logo.jsx';

export default function Nav({ page, navigate, lang, setLang, user, setUser, setShowLogin, cart }) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartCount = cart?.reduce((s, i) => s + i.qty, 0) || 0;
  const ko = lang === 'ko';

  const links = [
    { page:'shop',    ko:'매장',       en:'Shop' },
    { page:'agp',     ko:'AGP',        en:'AGP' },
    { page:'why',     ko:'왜 금인가',   en:'Why Gold' },
    { page:'storage', ko:'보관',        en:'Storage' },
    { page:'learn',   ko:'교육',        en:'Learn' },
    { page:'campaign-founding', ko:'창립 혜택', en:'Founding', special:true },
  ];

  const navStyle = {
    position:'sticky', top:0, zIndex:100,
    background: scrolled ? 'rgba(10,10,10,0.96)' : T.bg,
    borderBottom:`1px solid ${scrolled ? T.goldBorder : T.border}`,
    backdropFilter: scrolled ? 'blur(14px)' : 'none',
    transition:'all 0.3s',
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <Logo onClick={e => { e.preventDefault(); navigate('home'); }} />

        {!isMobile && (
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {links.map(l => (
              <button key={l.page} onClick={() => navigate(l.page)} style={{
                background: page === l.page ? T.goldGlow : 'none',
                border: page === l.page ? `1px solid ${T.goldBorder}` : '1px solid transparent',
                color: l.special ? T.gold : (page === l.page ? T.gold : T.textMuted),
                padding:'6px 14px', cursor:'pointer', fontFamily:T.sans, fontSize:13,
                transition:'all 0.2s', letterSpacing: l.special ? '0.05em' : 0,
              }}>
                {ko ? l.ko : l.en}
              </button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* Language toggle */}
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} style={{
            background:'none', border:`1px solid ${T.border}`, color:T.textMuted,
            padding:'5px 10px', cursor:'pointer', fontFamily:T.mono, fontSize:11,
            letterSpacing:'0.1em', transition:'all 0.2s',
          }}>{lang === 'ko' ? 'EN' : 'KO'}</button>

          {/* Cart */}
          <button onClick={() => navigate('cart')} style={{
            background:'none', border:`1px solid ${T.border}`, color:T.textMuted,
            padding:'5px 12px', cursor:'pointer', fontFamily:T.mono, fontSize:11,
            position:'relative', transition:'all 0.2s',
          }}>
            🛒{cartCount > 0 && <span style={{ marginLeft:4, color:T.gold, fontWeight:700 }}>{cartCount}</span>}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button onClick={() => navigate('dashboard')} style={{
                background:T.goldGlow, border:`1px solid ${T.goldBorder}`, color:T.gold,
                padding:'5px 14px', cursor:'pointer', fontFamily:T.sans, fontSize:12, transition:'all 0.2s',
              }}>{user.name || user.email}</button>
              <button onClick={() => { setUser(null); navigate('home'); }} style={{
                background:'none', border:`1px solid ${T.border}`, color:T.textMuted,
                padding:'5px 10px', cursor:'pointer', fontFamily:T.mono, fontSize:10,
              }}>↩</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{
              background:'none', border:`1px solid ${T.border}`, color:T.textMuted,
              padding:'6px 16px', cursor:'pointer', fontFamily:T.sans, fontSize:12, transition:'all 0.2s',
            }}>{ko ? '로그인' : 'Login'}</button>
          )}

          {!isMobile && (
            <button onClick={() => navigate('shop')} style={{
              background:T.gold, border:'none', color:'#0a0a0a',
              padding:'8px 20px', cursor:'pointer', fontFamily:T.sans,
              fontSize:13, fontWeight:700,
            }}>{ko ? '지금 시작' : 'Start Now'}</button>
          )}

          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{
              background:'none', border:`1px solid ${T.border}`, color:T.text,
              padding:'6px 12px', cursor:'pointer', fontFamily:T.mono, fontSize:16,
            }}>{mobileOpen ? '✕' : '☰'}</button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileOpen && (
        <div style={{
          background:T.bg1, borderTop:`1px solid ${T.border}`,
          padding:'16px 20px', display:'flex', flexDirection:'column', gap:2,
        }}>
          {links.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              background:'none', border:'none', color: page === l.page ? T.gold : T.textSub,
              padding:'12px 0', cursor:'pointer', fontFamily:T.sans, fontSize:15, textAlign:'left',
              borderBottom:`1px solid ${T.border}`,
            }}>{ko ? l.ko : l.en}</button>
          ))}
          <button onClick={() => { navigate('shop'); setMobileOpen(false); }} style={{
            background:T.gold, border:'none', color:'#0a0a0a', padding:'14px',
            cursor:'pointer', fontFamily:T.sans, fontSize:15, fontWeight:700, marginTop:8,
          }}>{ko ? '지금 시작' : 'Start Now'}</button>
        </div>
      )}
    </nav>
  );
}
