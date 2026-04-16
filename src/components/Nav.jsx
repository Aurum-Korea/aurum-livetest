import { useState, useEffect } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';
import Logo from './Logo.jsx';

// SVG Cart icon — replaces emoji (prevents missized icon bug)
function CartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

// SVG Hamburger / Close icon — replaces ☰ / ✕ emoji
function MenuIcon({ open, size = 18 }) {
  if (open) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

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
    { page: 'campaign-founders',   ko: 'Founders Club',      en: 'Founders Club',      highlight: true  },
    { page: 'campaign-agp-launch', ko: 'AGP 론치 이벤트',    en: 'AGP Launch Event',   highlight: true  },
    { page: 'shop',                ko: '매장',                en: 'Shop',               highlight: false },
    { page: 'agp',                 ko: 'AGP 적금',           en: 'AGP Savings',        highlight: false },
    { page: 'why',                 ko: '왜 금인가',           en: 'Why Gold',           highlight: false },
    { page: 'storage',             ko: '보관',                en: 'Storage',            highlight: false },
    { page: 'learn',               ko: '교육',                en: 'Learn',              highlight: false },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,10,0.96)' : T.bg,
      borderBottom: `1px solid ${scrolled ? T.goldBorder : T.border}`,
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Uses aurum-container so logo left-edge aligns with all page sections */}
      <div className="aurum-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
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
                  borderBottom: isActive && !isHL ? `1px solid ${T.gold}` : undefined,
                }}>
                  {isHL && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, boxShadow: `0 0 6px ${T.gold}`, flexShrink: 0 }} />}
                  {ko ? l.ko : l.en}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '5px 10px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.1em', transition: 'all 0.2s' }}
          >{lang === 'ko' ? 'EN' : 'KO'}</button>

          {/* Cart — SVG icon, not emoji */}
          <button
            onClick={() => navigate('cart')}
            style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '6px 10px', cursor: 'pointer', fontSize: 11, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}
          >
            <CartIcon size={15} />
            {cartCount > 0 && (
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, fontWeight: 700, lineHeight: 1 }}>{cartCount}</span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => navigate('dashboard')} style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '5px 12px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, transition: 'all 0.2s' }}>
                {user.name || user.email}
              </button>
              <button onClick={() => { setUser(null); navigate('home'); }} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '5px 8px', cursor: 'pointer', fontFamily: T.mono, fontSize: 11 }}>
                {ko ? '로그아웃' : 'Out'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '6px 14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, transition: 'all 0.2s' }}>
              {ko ? '로그인' : 'Login'}
            </button>
          )}

          {/* Primary CTA — goes to agp-enroll (not campaign-founders) */}
          {!isMobile && (
            <button
              onClick={() => navigate('agp-enroll')}
              style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '8px 18px', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
            >
              {ko ? 'AGP 적금 가입' : 'Start AGP'}
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: `1px solid ${T.border}`, color: T.text, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon open={mobileOpen} size={16} />
            </button>
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
          <button
            onClick={() => { navigate('agp-enroll'); setMobileOpen(false); }}
            style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 15, fontWeight: 700, marginTop: 10 }}
          >
            {ko ? 'AGP 적금 가입하기' : 'Start AGP Savings'}
          </button>
        </div>
      )}
    </nav>
  );
}
