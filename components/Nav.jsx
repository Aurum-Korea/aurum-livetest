import { useState, useEffect } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';
import Logo from './Logo.jsx';

function CartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

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
    { page: 'campaign-founders',   ko: 'Founders Club', en: 'Founders Club', highlight: true  },
    { page: 'campaign-agp-launch', ko: 'AGP Launch',    en: 'AGP Launch',    highlight: true  },
    { page: 'shop',                ko: '매장',           en: 'Shop',          highlight: false },
    { page: 'agp',                 ko: 'AGP 적립',      en: 'AGP',           highlight: false },
    { page: 'why',                 ko: '왜 금인가',      en: 'Why Gold',      highlight: false },
    { page: 'storage',             ko: '보관',           en: 'Storage',       highlight: false },
    { page: 'learn',               ko: '교육',           en: 'Learn',         highlight: false },
  ];

  const NAV_H = 68;
  const BTN_H = 36;
  const btnBase = { height: BTN_H, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0 };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,10,0.97)' : T.bg,
      borderBottom: `1px solid ${scrolled ? T.goldBorder : T.border}`,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.3s',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <style>{`
        @keyframes nav-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .nav-hl{position:relative;overflow:hidden}
        .nav-hl:hover{background:rgba(197,165,114,0.18)!important;border-color:rgba(197,165,114,0.55)!important;color:#E3C187!important;box-shadow:0 0 14px rgba(197,165,114,0.16)}
        .nav-hl:hover::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,220,150,0.18) 50%,transparent 70%);background-size:200% auto;animation:nav-shimmer 0.7s ease-out;pointer-events:none}
        .nav-dot{transition:box-shadow 0.25s}
        .nav-hl:hover .nav-dot{box-shadow:0 0 10px rgba(197,165,114,0.9),0 0 20px rgba(197,165,114,0.5)!important}
      `}</style>

      <div className="aurum-container" style={{ display: 'flex', alignItems: 'center', height: NAV_H, gap: 0 }}>

        {/* Logo — no minWidth, true left edge */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <Logo onClick={e => { e.preventDefault(); navigate('home'); }} size={36} />
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0, flex: 1 }}>
            {links.map(l => {
              const isActive       = page === l.page;
              const isHL           = l.highlight;
              const isFirstRegular = !isHL && links.filter(x => !x.highlight).indexOf(l) === 0;
              const btnStyle = {
                background: isActive ? (isHL ? 'rgba(197,165,114,0.14)' : T.goldGlow) : 'none',
                border: `1px solid ${isActive ? T.goldBorder : isHL ? 'rgba(197,165,114,0.22)' : 'transparent'}`,
                color: isHL ? T.gold : (isActive ? T.gold : T.textMuted),
                padding: isHL ? '7px 14px' : '7px 11px',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: T.sans,
                fontSize: 12,
                fontWeight: isHL ? 500 : 400,
                letterSpacing: isHL ? '0.02em' : 0,
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: 7,
                borderBottom: isActive && !isHL ? `2px solid ${T.gold}` : '2px solid transparent',
                marginLeft: isFirstRegular ? 20 : 0,
                borderLeft: isFirstRegular ? `1px solid ${T.goldBorder}` : undefined,
                paddingLeft: isFirstRegular ? 20 : undefined,
                boxShadow: 'none',
                whiteSpace: 'nowrap',
              };
              return (
                <button key={l.page}
                  onClick={() => navigate(l.page)}
                  className={isHL ? 'nav-hl' : ''}
                  onMouseEnter={e => {
                    if (!isActive && !isHL) { e.currentTarget.style.borderBottomColor = T.goldDim; e.currentTarget.style.color = T.text; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive && !isHL) { e.currentTarget.style.borderBottomColor = 'transparent'; e.currentTarget.style.color = T.textMuted; }
                  }}
                  style={btnStyle}>
                  {isHL && <span className="nav-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, flexShrink: 0, boxShadow: `0 0 5px ${T.gold}` }} />}
                  {ko ? l.ko : l.en}
                </button>
              );
            })}
          </div>
        )}

        {/* Right controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>

          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, width: 36, fontFamily: T.mono, fontSize: 11, letterSpacing: '0.08em' }}
          >{lang === 'ko' ? 'EN' : 'KO'}</button>

          <button
            onClick={() => navigate('cart')}
            style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, width: 36, gap: 4, position: 'relative' }}
          >
            <CartIcon size={15} />
            {cartCount > 0 && (
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, fontWeight: 700, lineHeight: 1 }}>{cartCount}</span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => navigate('dashboard')} style={{ ...btnBase, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '0 14px', fontFamily: T.sans, fontSize: 12 }}>
                {user.name || user.email}
              </button>
              <button onClick={() => { setUser(null); navigate('home'); }} style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '0 12px', fontFamily: T.mono, fontSize: 11 }}>
                {ko ? '로그아웃' : 'Out'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '0 16px', fontFamily: T.sans, fontSize: 12 }}>
              {ko ? '로그인' : 'Login'}
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => navigate('agp-enroll')}
              style={{ ...btnBase, background: T.gold, border: 'none', color: '#0a0a0a', padding: '0 20px', fontFamily: T.sans, fontSize: 12, fontWeight: 700 }}
            >
              {ko ? 'AGP 가입' : 'Join AGP'}
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.text, width: 44 }}
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
              padding: '13px 4px', cursor: 'pointer', fontFamily: T.sans, fontSize: 15, textAlign: 'left',
              borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {l.highlight && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, boxShadow: `0 0 6px ${T.gold}`, flexShrink: 0 }} />}
              {ko ? l.ko : l.en}
            </button>
          ))}
          <button
            onClick={() => { navigate('agp-enroll'); setMobileOpen(false); }}
            style={{ background: T.gold, border: 'none', color: '#0a0a0a', padding: '14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 15, fontWeight: 700, marginTop: 10, borderRadius: 0 }}
          >
            {ko ? 'AGP 가입하기' : 'Join AGP'}
          </button>
        </div>
      )}
    </nav>
  );
}
