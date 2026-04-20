import { Link, useLocation } from 'react-router-dom';
import { T } from '../lib/tokens';
import { useLang } from '../lib/lang';
import { useAuth } from '../lib/auth';

// ═══════════════════════════════════════════════════════════════════════
// AURUM · QuietNav · MINIMAL
// Wordmark + 4 links (시작 / 패트론 / 상점 / 추천) + 한본/EN + login
// ═══════════════════════════════════════════════════════════════════════

const LINKS = [
  { path: '/start',    ko: '시작',    en: 'Start' },
  { path: '/founders', ko: '패트론',  en: 'Founders' },
  { path: '/shop',     ko: '상점',    en: 'Shop' },
  { path: '/referral', ko: '추천',    en: 'Refer' },
];

export default function QuietNav({ page }) {
  const { lang, setLang, t } = useLang();
  const { isAuthed } = useAuth();
  const location = useLocation();

  return (
    <div style={{
      padding: '20px 24px', position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.text, fontWeight: 500 }}>Aurum</span>
          {page && (
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
              / {page}
            </span>
          )}
        </Link>

        <nav className="aurum-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {LINKS.map(l => {
            const isActive = location.pathname === l.path;
            return (
              <Link key={l.path} to={l.path} style={{
                fontFamily: T.sansKr, fontSize: 13, fontWeight: 500,
                color: isActive ? T.goldB : T.sub, textDecoration: 'none',
                letterSpacing: '0.02em', position: 'relative', padding: '4px 0',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = T.sub; }}
              >
                {lang === 'ko' ? l.ko : l.en}
                {isActive && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 1, background: T.gold }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{
              background: 'transparent', border: `1px solid ${T.border}`,
              padding: '4px 10px', fontFamily: T.mono, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.18em', color: T.goldD, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldBorderS; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.goldD; }}
            aria-label={t('언어 전환', 'Switch language')}
          >
            {lang === 'ko' ? '한본 · EN' : 'EN · 한본'}
          </button>

          {isAuthed ? (
            <Link to="/terminal" style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
              color: T.gold, textDecoration: 'none',
              padding: '4px 10px', border: `1px solid ${T.goldBorder}`,
            }}>
              {t('내 계정', 'ACCOUNT')}
            </Link>
          ) : (
            <Link to="/login" style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
              color: T.goldD, textDecoration: 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.goldD; }}
            >
              {t('로그인', 'LOGIN')}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aurum-nav-links { gap: 16px !important; }
          .aurum-nav-links a { font-size: 12px !important; }
        }
        @media (max-width: 480px) {
          .aurum-nav-links { gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}
