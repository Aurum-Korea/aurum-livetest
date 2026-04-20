import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { T } from '../lib/tokens';
import { useLang } from '../lib/lang';
import { useAuth } from '../lib/auth';
import AUSquare from './AUSquare';
import AurumWordmark from './AurumWordmark';

// ═══════════════════════════════════════════════════════════════════════
// FloatingMenu · minimal nav access for the clean landing page
//
// Used ONLY on `/` landing where TickerBar + QuietNav are removed.
// Renders:
//   - top-right: floating AU-square logo (clickable to "/")
//   - top-right: hamburger button that opens the full drawer
//
// Drawer matches QuietNav's mobile drawer structure so the feel is consistent.
// ═══════════════════════════════════════════════════════════════════════

const LINKS = [
  { path: '/start',     ko: '시작',          en: 'Start' },
  { path: '/founders',  ko: 'Founders Club', en: 'Founders Club' },
  { path: '/goldpath',  ko: 'GoldPath',      en: 'GoldPath' },
  { path: '/shop',      ko: '상점',          en: 'Shop' },
  { path: '/analytics', ko: '분석',          en: 'Analytics' },
  { path: '/referral',  ko: '추천',          en: 'Refer' },
];

export default function FloatingMenu() {
  const { lang, setLang, t } = useLang();
  const { isAuthed } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Floating top-right cluster */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Link to="/" aria-label="Aurum home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <AUSquare size={32} />
          <span className="fm-wordmark" style={{ display: 'flex' }}>
            <AurumWordmark size={13} serial="001" />
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{
            background: 'rgba(10,10,10,0.75)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${T.goldBorder}`,
            color: T.gold, cursor: 'pointer',
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.mono, fontSize: 18,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.goldBorder}
        >
          ☰
        </button>
      </div>

      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 100,
            backdropFilter: 'blur(4px)',
            animation: 'fm-fade 0.2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 'min(320px, 86vw)',
              background: T.deep || T.bg,
              borderLeft: `1px solid ${T.goldBorder}`,
              padding: '20px 0',
              display: 'flex', flexDirection: 'column',
              animation: 'fm-slide 0.28s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0 20px 18px', borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AUSquare size={28} />
                <AurumWordmark size={13} serial="001" />
              </div>
              <button
                onClick={close}
                aria-label="Close menu"
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  color: T.gold, cursor: 'pointer',
                  width: 34, height: 34, fontSize: 16, fontFamily: T.mono,
                }}
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
                    onClick={close}
                    style={{
                      display: 'block', padding: '16px 24px',
                      fontFamily: T.sansKr, fontSize: 16, fontWeight: 500,
                      color: isActive ? T.gold : T.text,
                      textDecoration: 'none',
                      borderLeft: isActive ? `2px solid ${T.gold}` : '2px solid transparent',
                      background: isActive ? 'rgba(197,165,114,0.06)' : 'transparent',
                    }}
                  >
                    {lang === 'ko' ? l.ko : l.en}
                  </Link>
                );
              })}
            </nav>

            <div style={{
              padding: '16px 24px', borderTop: `1px solid ${T.border}`,
              display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between',
            }}>
              <button
                onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  padding: '8px 12px', fontFamily: T.mono, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.16em', color: T.goldD, cursor: 'pointer',
                }}
              >
                {lang === 'ko' ? '한본 · EN' : 'EN · 한본'}
              </button>

              {isAuthed ? (
                <Link to="/terminal" onClick={close} style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                  color: T.gold, textDecoration: 'none',
                  padding: '8px 12px', border: `1px solid ${T.goldBorder}`,
                }}>
                  {t('내 계정', 'ACCOUNT')}
                </Link>
              ) : (
                <Link to="/login" onClick={close} style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                  color: T.goldD, textDecoration: 'none',
                }}>
                  {t('로그인', 'LOGIN')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fm-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 520px) {
          .fm-wordmark { display: none !important; }
        }
      `}</style>
    </>
  );
}
