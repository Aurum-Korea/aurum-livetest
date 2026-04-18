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
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
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

  // Founders FIRST — anchor of the brand
  const links = [
    { page: 'founders', ko: 'Founders', en: 'Founders', isFounders: true },
    { page: 'shop',     ko: '매장',      en: 'Shop'    },
    { page: 'agp',      ko: 'AGP 적금',  en: 'AGP'     },
    { page: 'why',      ko: '왜 금인가', en: 'Why Gold' },
    { page: 'storage',  ko: '보관',       en: 'Storage' },
    { page: 'learn',    ko: '교육',       en: 'Learn'   },
  ];

  const promos = [
    { page: 'campaign-agp-launch', ko: 'AGP Launch',    en: 'AGP Launch'    },
    { page: 'founders-promo',      ko: 'Founders 한정', en: 'Founders Promo' },
  ];

  const NAV_H = 72;
  const BTN_H = 36;
  const btnBase = { height: BTN_H, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0 };

  const isFoundersActive = page === 'founders' || page === 'campaign-founders' || page === 'founders-promo';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,11,8,0.97)' : T.bg,
      borderBottom: `1px solid ${scrolled ? T.goldBorder : T.border}`,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.3s',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <style>{`
        @keyframes nav-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes founders-sweep{0%{background-position:-300% center}100%{background-position:300% center}}
        @keyframes founders-glow{0%,100%{box-shadow:0 0 8px rgba(197,165,114,0.25),inset 0 0 6px rgba(197,165,114,0.06)}50%{box-shadow:0 0 20px rgba(197,165,114,0.45),inset 0 0 12px rgba(197,165,114,0.12)}}
        .founders-btn{
          position:relative;overflow:hidden;
          border:1px solid rgba(197,165,114,0.6)!important;
          background:linear-gradient(105deg,rgba(197,165,114,0.06),rgba(197,165,114,0.14),rgba(197,165,114,0.06))!important;
          background-size:300% auto!important;
          animation:founders-sweep 4s linear infinite,founders-glow 3s ease-in-out infinite;
          color:#E3C187!important;
        }
        .founders-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,220,150,0.18) 50%,transparent 70%);background-size:300% auto;animation:founders-sweep 4s linear infinite;pointer-events:none}
        .founders-btn:hover{border-color:rgba(197,165,114,0.95)!important;background:rgba(197,165,114,0.2)!important;color:#fff!important}
        .founders-btn.active-founders{border-color:#c5a572!important;background:rgba(197,165,114,0.2)!important}
        .nav-ct{position:relative;overflow:hidden;border:1px solid rgba(197,165,114,0.45)!important;background:rgba(197,165,114,0.07)!important;transition:all 0.25s;border-radius:0}
        .nav-ct:hover{border-color:rgba(197,165,114,0.88)!important;background:rgba(197,165,114,0.13)!important;color:#E3C187!important}
        .nav-ct:hover::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,220,150,0.16) 50%,transparent 70%);background-size:200% auto;animation:nav-shimmer 0.65s ease-out;pointer-events:none}
        .nav-ul{background:none!important;border:1px solid transparent!important;color:#888!important;transition:color 0.2s}
        .nav-ul:hover{color:#f5f0e8!important}
        .nav-ul.nav-ul-active{color:#C5A572!important}
        .nav-promo{background:none!important;border:none!important;color:rgba(197,165,114,0.5)!important;font-style:italic;transition:color 0.2s}
        .nav-promo:hover{color:rgba(197,165,114,0.85)!important}
      `}</style>

      <div className="aurum-container" style={{ display: 'flex', alignItems: 'center', height: NAV_H, gap: 0 }}>
        {/* Logo */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginRight: 20 }}>
          <Logo onClick={e => { e.preventDefault(); navigate('home'); }} size={36} />
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            {links.map(l => {
              const isActive = page === l.page || (l.page === 'founders' && isFoundersActive);
              if (l.isFounders) {
                return (
                  <button key={l.page} onClick={() => navigate(l.page)}
                    className={`founders-btn${isActive ? ' active-founders' : ''}`}
                    style={{ ...btnBase, padding: '0 18px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, letterSpacing: '0.04em', borderRadius: 0, whiteSpace: 'nowrap' }}>
                    {ko ? l.ko : l.en}
                  </button>
                );
              }
              return (
                <button key={l.page} onClick={() => navigate(l.page)}
                  className={`nav-ul${isActive ? ' nav-ul-active' : ''}`}
                  style={{ ...btnBase, padding: '0 10px', fontFamily: T.sansKr, fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap', borderBottom: `2px solid ${isActive ? 'rgba(197,165,114,0.5)' : 'transparent'}` }}>
                  {ko ? l.ko : l.en}
                </button>
              );
            })}

            <div style={{ width: 1, height: 18, background: T.border, margin: '0 6px', flexShrink: 0 }} />

            {promos.map(p => (
              <button key={p.page} onClick={() => navigate(p.page)}
                className="nav-promo"
                style={{ ...btnBase, padding: '0 8px', fontFamily: T.serif, fontSize: 11, whiteSpace: 'nowrap' }}>
                {ko ? p.ko : p.en} →
              </button>
            ))}
          </div>
        )}

        {/* Right side — mobile: marginLeft auto for correct alignment */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 'auto', paddingRight: isMobile ? 4 : 0 }}>
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, width: 34, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.08em' }}>
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>

          <button onClick={() => navigate('cart')}
            style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, width: 34, gap: 3, position: 'relative' }}>
            <CartIcon size={14} />
            {cartCount > 0 && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, fontWeight: 700 }}>{cartCount}</span>}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => navigate('dashboard')} style={{ ...btnBase, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '0 12px', fontFamily: T.sansKr, fontSize: 11 }}>
                {(user.name || user.email || '').slice(0, 12)}
              </button>
              <button onClick={() => { setUser(null); navigate('home'); }} style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '0 10px', fontFamily: T.mono, fontSize: 10 }}>
                {ko ? '로그아웃' : 'Out'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, padding: '0 12px', fontFamily: T.sansKr, fontSize: 11 }}>
              {ko ? '로그인' : 'Login'}
            </button>
          )}

          {!isMobile && (
            <button onClick={() => navigate('register')}
              className="nav-cta-pulse"
              style={{ ...btnBase, background: T.gold, border: 'none', color: '#0d0b08', padding: '0 18px', fontFamily: T.sansKr, fontSize: 12, fontWeight: 700 }}>
              {ko ? '가입하기' : 'Register'}
            </button>
          )}

          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ ...btnBase, background: 'none', border: `1px solid ${T.border}`, color: T.text, width: 40 }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
              <MenuIcon open={mobileOpen} size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileOpen && (
        <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Founders — extravagant mobile treatment */}
          <button onClick={() => { navigate('founders'); setMobileOpen(false); }} style={{
            background: 'linear-gradient(105deg,rgba(197,165,114,0.08),rgba(197,165,114,0.16),rgba(197,165,114,0.08))',
            border: '1px solid rgba(197,165,114,0.5)', color: '#E3C187',
            padding: '14px 12px', cursor: 'pointer',
            fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 18, textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 4,
          }}>
            Founders Club
            <span style={{ fontSize: 12, opacity: 0.7 }}>→</span>
          </button>
          {links.filter(l => !l.isFounders).map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              background: 'none', border: 'none', color: page === l.page ? T.gold : T.textSub,
              padding: '12px 4px', cursor: 'pointer', fontFamily: T.sansKr, fontSize: 15,
              textAlign: 'left', borderBottom: `1px solid ${T.border}`,
            }}>
              {ko ? l.ko : l.en}
            </button>
          ))}
          <div style={{ height: 1, background: T.border, margin: '6px 0' }} />
          {promos.map(p => (
            <button key={p.page} onClick={() => { navigate(p.page); setMobileOpen(false); }} style={{
              background: 'none', border: 'none', color: 'rgba(197,165,114,0.55)',
              padding: '9px 4px', cursor: 'pointer', fontFamily: T.serif, fontStyle: 'italic',
              fontSize: 13, textAlign: 'left',
            }}>
              {ko ? p.ko : p.en} →
            </button>
          ))}
          <button onClick={() => { navigate('register'); setMobileOpen(false); }}
            style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: '14px', cursor: 'pointer', fontFamily: T.sansKr, fontSize: 15, fontWeight: 700, marginTop: 10 }}>
            {ko ? '가입하기 →' : 'Register →'}
          </button>
        </div>
      )}
    </nav>
  );
}
