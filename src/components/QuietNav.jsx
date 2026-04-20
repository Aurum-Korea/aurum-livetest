import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { T } from '../lib/tokens';
import { useLang } from '../lib/lang';
import { useAuth } from '../lib/auth';
import AUSquare from './AUSquare';
import AurumWordmark from './AurumWordmark';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · QuietNav · v8
// AU-square logo · 5 links · 한본/EN · login/account
// Mobile (<720px): hamburger drawer
// ═══════════════════════════════════════════════════════════════════════

const LINKS = [
  { path: '/start',     ko: '시작',          en: 'Start' },
  { path: '/founders',  ko: 'Founders Club', en: 'Founders Club' },
  { path: '/goldpath',  ko: 'GoldPath',      en: 'GoldPath' },
  { path: '/shop',      ko: '상점',          en: 'Shop' },
  { path: '/analytics', ko: '분석',          en: 'Analytics' },
  { path: '/referral',  ko: '추천',          en: 'Refer' },
];

export default function QuietNav({ page, sticky = true, palette = 'gold' }) {
  const { lang, setLang, t } = useLang();
  const { isAuthed } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  // Palette-aware accent overrides · when palette='neo' the gold accents swap to hot pink
  const A = palette === 'neo' ? {
    accent:    '#ff3d8a',        // T.gold equiv
    accentB:   '#ff6aa8',        // T.goldB equiv
    accentD:   '#9aa5c4',        // T.goldD equiv (cool chrome)
    border:    'rgba(255,61,138,0.22)',
    borderS:   'rgba(255,61,138,0.5)',
    bg:        'rgba(11,11,20,0.86)',   // plum-black tinted · matches T_NS.bg
  } : {
    accent:    T.gold,
    accentB:   T.goldB,
    accentD:   T.goldD,
    border:    T.goldBorder,
    borderS:   T.goldBorderS,
    bg:        'rgba(10,10,10,0.86)',   // original neutral black tint
  };

  return (
    <>
      <div style={{
        padding: '14px 20px',
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 30 : 'auto',
        zIndex: sticky ? 49 : 'auto',
        background: A.bg, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${A.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          {/* Logo + AURUM wordmark + serial */}
          <Link to="/" aria-label="Aurum home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <AUSquare size={30} />
            <AurumWordmark size={14} serial="001" />
          </Link>

          {/* Desktop nav links */}
          <nav className="aurum-nav-desktop" style={{ display: 'flex', gap: 18, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {LINKS.map(l => {
              const isActive = location.pathname === l.path;
              return (
                <Link key={l.path} to={l.path} style={{
                  fontFamily: T.sansKr, fontSize: 13, fontWeight: 500,
                  color: isActive ? A.accentB : T.sub, textDecoration: 'none',
                  letterSpacing: '0.02em', position: 'relative', padding: '4px 0',
                  whiteSpace: 'nowrap', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = T.text; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = T.sub; }}
                >
                  {lang === 'ko' ? l.ko : l.en}
                  {isActive && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 1, background: A.accent }} />}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right cluster */}
          <div className="aurum-nav-right-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              style={{
                background: 'transparent', border: `1px solid ${T.border}`,
                padding: '4px 8px', fontFamily: T.mono, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.16em', color: A.accentD, cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = A.borderS; e.currentTarget.style.color = A.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = A.accentD; }}
              aria-label={t('언어 전환', 'Switch language')}
            >
              {lang === 'ko' ? '한본 · EN' : 'EN · 한본'}
            </button>

            {isAuthed ? (
              <Link to="/terminal" style={{
                fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                color: A.accent, textDecoration: 'none',
                padding: '4px 9px', border: `1px solid ${A.border}`, whiteSpace: 'nowrap',
              }}>
                {t('내 계정', 'ACCOUNT')}
              </Link>
            ) : (
              <Link to="/login" style={{
                fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                color: A.accentD, textDecoration: 'none', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = A.accent; }}
                onMouseLeave={e => { e.currentTarget.style.color = A.accentD; }}
              >
                {t('로그인', 'LOGIN')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="aurum-nav-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{
              display: 'none',
              background: 'transparent', border: `1px solid ${T.border}`,
              color: A.accent, cursor: 'pointer',
              width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 18,
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 100,
            backdropFilter: 'blur(4px)',
            animation: 'drawer-fade 0.2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 'min(320px, 86vw)',
              background: T.deep || T.bg,
              borderLeft: `1px solid ${A.border}`,
              padding: '20px 0',
              display: 'flex', flexDirection: 'column',
              animation: 'drawer-slide-in 0.28s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 18px', borderBottom: `1px solid ${T.border}` }}>
              <AUSquare size={28} />
              <button
                onClick={closeDrawer}
                aria-label="Close menu"
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: A.accent, cursor: 'pointer', width: 34, height: 34, fontSize: 16, fontFamily: T.mono }}
              >
                ✕
              </button>
            </div>

            <nav style={{ padding: '8px 0', flex: 1 }}>
              {LINKS.map(l => {
                const isActive = location.pathname === l.path;
                return (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={closeDrawer}
                    style={{
                      display: 'block', padding: '16px 24px',
                      fontFamily: T.sansKr, fontSize: 16, fontWeight: 500,
                      color: isActive ? A.accent : T.text,
                      textDecoration: 'none',
                      borderLeft: isActive ? `2px solid ${A.accent}` : '2px solid transparent',
                      background: isActive ? 'rgba(197,165,114,0.06)' : 'transparent',
                    }}
                  >
                    {lang === 'ko' ? l.ko : l.en}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  padding: '8px 12px', fontFamily: T.mono, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.16em', color: A.accentD, cursor: 'pointer',
                }}
              >
                {lang === 'ko' ? '한본 · EN' : 'EN · 한본'}
              </button>

              {isAuthed ? (
                <Link to="/terminal" onClick={closeDrawer} style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                  color: A.accent, textDecoration: 'none',
                  padding: '8px 12px', border: `1px solid ${A.border}`,
                }}>
                  {t('내 계정', 'ACCOUNT')}
                </Link>
              ) : (
                <Link to="/login" onClick={closeDrawer} style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                  color: A.accentD, textDecoration: 'none',
                }}>
                  {t('로그인', 'LOGIN')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes drawer-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawer-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }

        @media (max-width: 720px) {
          .aurum-nav-desktop { display: none !important; }
          .aurum-nav-right-desktop { display: none !important; }
          .aurum-nav-hamburger { display: flex !important; }
          .aurum-nav-crumb { display: none !important; }
        }
      `}</style>
    </>
  );
}
