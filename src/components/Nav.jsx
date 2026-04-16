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
    { page: 'campaign-founders',   ko: '파운더스 클럽',     en: 'Founders Club',   highlight: true  },
    { page: 'campaign-agp-launch', ko: 'AGP 론치 이벤트',   en: 'AGP Launch',      highlight: true  },
    { page: 'shop',                ko: '매장',               en: 'Shop',            highlight: false },
    { page: 'agp',                 ko: 'AGP',               en: 'AGP',             highlight: false },
    { page: 'why',                 ko: '왜 금인가',          en: 'Why Gold',        highlight: false },
    { page: 'storage',             ko: '보관',               en: 'Storage',         highlight: false },
    { page: 'learn',               ko: '교육',               en: 'Learn',           highlight: false },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,10,0.96)' : T.bg,
      borderBottom: `1px solid ${scrolled ? T.goldBorder : T.border}`,
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Logo onClick={e => { e.preventDefault(); navigate('home'); }} size={36} />

        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {links.map(l => {
              const isActive = page === l.page;
              const isHL = l.highlight;
              return (
                <button key={l.page} onClick={() => navigate(l.page)} style={{
                  background: isActive ? (isHL ? 'rgba(197,165,114,0.12)' : T.goldGlow) : 'none',
                  border: `1px solid ${isActive ? T.goldBorder : isHL ? 'rgba(197,165,114,0.18)' : 'transparent'}`,
                  color: isHL ? T.gold : (isActive ? T.gold : T.textMuted),
                  padding: isHL ? '6px 14px' : '6px 12px', cursor: 'pointer',
                  fontFamily: T.sans, fontSize: 13, fontWeight: isHL ? 500 : 400,
                  letterSpacing: isHL ? '0.02em' : 0, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {isHL && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, boxShadow: `0 0 6px ${T.gold}`, flexShrink: 0 }} />}
                  {ko ? l.ko : l.en}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '5px 10px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.1em', transition: 'all 0.2s' }}>{lang === 'ko' ? 'EN' : 'KO'}</button>
          <button onClick={() => navigate('cart')} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '5px 12px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, transition: 'all 0.2s' }}>
            🛒{cartCount > 0 && <span style={{ marginLeft: 4, color: T.gold, fontWeight: 700 }}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => navigate('dashboard')} style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '5px 12px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, transition: 'all 0.2s' }}>{user.name || user.email}</button>
              <button onClick={() => { setUser(null); navigate('home'); }} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '5px 8px', cursor: 'pointer', fontFamily: T.mono, fontSize: 10 }}>↩</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '6px 14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, transition: 'all 0.2s' }}>{ko ? '로그인' : 'Login'}</button>
          )}
          {!isMobile && (
            <button onClick={() => navigate('campaign-founders')} style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '8px 18px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, fontWeight: 700 }}>{ko ? '클럽 가입' : 'Join Club'}</button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.text, padding: '6px 12px', cursor: 'pointer', fontFamily: T.mono, fontSize: 16 }}>{mobileOpen ? '✕' : '☰'}</button>
          )}
        </div>
      </div>

      {isMobile && mobileOpen && (
        <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              background: 'none', border: 'none', color: page === l.page ? T.gold : l.highlight ? T.gold : T.textSub,
              padding: '13px 0', cursor: 'pointer', fontFamily: T.sans, fontSize: 15, textAlign: 'left',
              borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {l.highlight && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, boxShadow: `0 0 6px ${T.gold}`, flexShrink: 0 }} />}
              {ko ? l.ko : l.en}
            </button>
          ))}
          <button onClick={() => { navigate('campaign-founders'); setMobileOpen(false); }} style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 15, fontWeight: 700, marginTop: 10 }}>{ko ? '파운더스 클럽 가입하기' : 'Join Founders Club'}</button>
        </div>
      )}
    </nav>
  );
}
