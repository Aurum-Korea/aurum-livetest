import { useState, useEffect, useRef } from 'react';
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
  const navRef = useRef(null);

  // Outside-click dismiss — document level to avoid stacking context
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('touchstart', handler, true);
    return () => {
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('touchstart', handler, true);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartCount = cart?.reduce((s, i) => s + i.qty, 0) || 0;
  const ko = lang === 'ko';

  // ── PRIMARY links — Founders pos.1, GoldPath pos.2 ─────────────────
  const links = [
    { page: 'founders',      ko: 'Founders',   en: 'Founders',       isFounders: true },
    { page: 'agp',           ko: 'GoldPath',   en: 'GoldPath',       isMain: true     },
    { page: 'shop-physical', ko: '매장',        en: 'Shop'            },
    { page: 'gold-today',    ko: '금 시장 현황', en: '금 시장 현황'      },
    { page: 'why',           ko: '금 전략',    en: 'Gold Strategy',  isStrategy: true },
    { page: 'storage',       ko: '인프라',      en: 'Infrastructure'  },
    { page: 'learn',         ko: '교육',        en: 'Learn'           },
  ];

  const promos = [
    { page: 'campaign-agp-launch', ko: 'AGP Launch',         en: 'AGP Launch'         },
    { page: 'founders-promo',      ko: 'Founders Enrollment', en: 'Founders Enrollment' },
  ];

  const NAV_H = 62;
  const BTN_H = 36;
  const btnBase = { height: BTN_H, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0 };

  // T1·01 — active state helpers
  const isFoundersActive = page === 'founders' || page === 'campaign-founders' || page === 'founders-promo';
  const isAGPActive      = page === 'agp-intro' || page === 'agp-enroll' || page === 'agp' || page === 'campaign-agp-launch';

  return (
    <nav ref={navRef} style={{
      position: 'relative', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,11,8,0.97)' : T.bg,
      borderBottom: `1px solid ${scrolled ? T.goldBorder : T.border}`,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.3s',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <style>{`
        @keyframes nav-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes founders-sweep{0%{background-position:-300% center}100%{background-position:300% center}}
        @keyframes founders-glow{0%,100%{box-shadow:0 0 8px rgba(197,165,114,0.22),inset 0 0 6px rgba(197,165,114,0.05)}50%{box-shadow:0 0 18px rgba(197,165,114,0.42),inset 0 0 10px rgba(197,165,114,0.1)}}
        @keyframes goldpath-flow{0%{background-position:0% center}100%{background-position:200% center}}
        @keyframes goldpath-pulse{0%,100%{box-shadow:0 0 0 0 rgba(197,165,114,0);border-color:rgba(197,165,114,0.45)}50%{box-shadow:0 0 12px 1px rgba(197,165,114,0.18);border-color:rgba(197,165,114,0.85)}}
        @keyframes goldpath-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
        .founders-btn{
          position:relative;overflow:hidden;
          border:1px solid rgba(197,165,114,0.6)!important;
          background:linear-gradient(105deg,rgba(197,165,114,0.06),rgba(197,165,114,0.14),rgba(197,165,114,0.06))!important;
          background-size:300% auto!important;
          animation:founders-sweep 4s linear infinite,founders-glow 3s ease-in-out infinite;
          color:#E3C187!important;
        }
        .founders-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,220,150,0.16) 50%,transparent 70%);background-size:300% auto;animation:founders-sweep 4s linear infinite;pointer-events:none}
        .founders-btn:hover{border-color:rgba(197,165,114,0.95)!important;background:rgba(197,165,114,0.2)!important;color:#fff!important}
        .founders-btn.active-founders{border-color:#c5a572!important;background:rgba(197,165,114,0.22)!important}
        .goldpath-btn{
          position:relative;overflow:hidden;flex-direction:column!important;gap:2px!important;
          border:1px solid rgba(197,165,114,0.45)!important;
          background:linear-gradient(135deg,rgba(197,165,114,0.03) 0%,rgba(197,165,114,0.09) 50%,rgba(197,165,114,0.03) 100%)!important;
          background-size:200% auto!important;
          animation:goldpath-flow 4s linear infinite,goldpath-pulse 3s ease-in-out infinite;
          height:42px!important;
        }
        .goldpath-btn::after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(90deg,transparent,rgba(227,193,135,0.12),transparent);animation:goldpath-sweep 3.5s ease-in-out infinite;pointer-events:none}
        .goldpath-btn:hover{border-color:rgba(197,165,114,0.9)!important;background:rgba(197,165,114,0.14)!important}
        .goldpath-btn.active-goldpath{border-color:#c5a572!important;background:rgba(197,165,114,0.18)!important}
        .nav-ul{background:none!important;border:1px solid transparent!important;color:#888!important;transition:color 0.2s}
        .nav-ul:hover{color:#f5f0e8!important}
        .nav-ul.nav-ul-active{color:#C5A572!important;border-bottom-color:rgba(197,165,114,0.5)!important}
        .nav-promo-agp{
          position:relative;overflow:hidden;background:transparent!important;
          border:1px solid rgba(197,165,114,0.4)!important;color:#c5a572!important;
          font-size:11px!important;font-weight:600!important;font-style:normal!important;letter-spacing:0.04em!important;
          animation:promo-blink 2.5s ease-in-out infinite;padding:0 12px!important;
        }
        .nav-promo-agp:hover{border-color:rgba(197,165,114,0.9)!important;color:#E3C187!important;background:rgba(197,165,114,0.1)!important}
        .nav-promo-founders{
          position:relative;overflow:hidden;background:transparent!important;
          border:1px solid rgba(74,222,128,0.45)!important;color:#4ade80!important;
          font-size:11px!important;font-weight:600!important;font-style:normal!important;letter-spacing:0.04em!important;
          animation:founders-promo-blink 2.8s ease-in-out infinite;padding:0 12px!important;
        }
        .nav-promo-founders:hover{border-color:rgba(74,222,128,0.9)!important;color:#86efac!important;background:rgba(74,222,128,0.07)!important}
        @keyframes promo-blink{0%,100%{border-color:rgba(197,165,114,0.35);box-shadow:none}50%{border-color:rgba(197,165,114,0.9);box-shadow:0 0 10px rgba(197,165,114,0.2)}}
        @keyframes founders-promo-blink{0%,100%{border-color:rgba(74,222,128,0.35);box-shadow:none}50%{border-color:rgba(74,222,128,0.9);box-shadow:0 0 10px rgba(74,222,128,0.18)}}
      `}</style>

      {/* ── FOUR-ZONE layout: Logo | Primary CTAs (left) | Secondary links (right) | Utility ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: NAV_H, padding: '0 24px', gap: 0 }}>

        {/* ZONE 1 — Logo, fixed left */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginRight: 24 }}>
          <Logo onClick={e => { e.preventDefault(); navigate('home'); }} size={36} />
        </div>

        {/* ZONE 2 — GoldPath logo + Founders — no boxes, equal visual size */}
        {!isMobile && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 20 }}>
            {links.filter(l => l.isFounders || l.isMain).map(l => {
              const isActive = (l.isFounders && isFoundersActive) || (l.isMain && isAGPActive);
              if (l.isMain) {
                return (
                  <button key={l.page} onClick={() => navigate(l.page)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', opacity: isActive ? 1 : 0.82, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <style>{`@keyframes gp-nav-blink{0%,100%{opacity:1}50%{opacity:0}}.gp-nav-cur{animation:gp-nav-blink 1.2s step-end infinite}`}</style>
                    <svg viewBox="0 0 240 70" width={114} height={33} style={{ display:'block' }}>
                      <text x="8" y="22" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="16" fill={isActive ? '#ffffff' : '#f0ece4'}>₩</text>
                      <rect x="28" y="16" width="7" height="6" fill="#1e1408"/>
                      <rect x="37" y="13" width="7" height="9" fill="#5a3c18"/>
                      <rect x="46" y="9"  width="7" height="13" fill="#C5A572"/>
                      <rect x="55" y="5"  width="7" height="17" fill="#E3C187"/>
                      <polyline points="31.5,16 40.5,13 49.5,9 58.5,5" fill="none" stroke="rgba(197,165,114,.22)" strokeWidth=".7"/>
                      <line x1="62" y1="12" x2="80" y2="12" stroke="#C5A572" strokeWidth="1.2"/>
                      <path d="M75 8 L82 12 L75 16" fill="none" stroke="#C5A572" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
                      <text x="87" y="22">
                        <tspan fontFamily="'Cormorant Garamond','Georgia',serif" fontStyle="italic" fontSize="14" fill="#E3C187">Au</tspan>
                        <tspan fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="10" fill="#7a6d58" dx="3">(금)</tspan>
                      </text>
                      <line x1="8" y1="28" x2="232" y2="28" stroke="#1e1c10" strokeWidth=".4"/>
                      <text x="8"  y="46" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="19" fill="#C5A572">›</text>
                      <text x="22" y="46" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="19" fill={isActive ? '#ffffff' : '#f0ece4'}>GoldPath</text>
                      <rect x="118" y="30" width="2" height="16" fill="#C5A572" className="gp-nav-cur"/>
                      <text x="8" y="62" fontFamily="'JetBrains Mono','Courier New',monospace" fontSize="14" fill="#7a6d58" letterSpacing=".2em">금환</text>
                    </svg>
                  </button>
                );
              }
              return (
                <button key={l.page} onClick={() => navigate(l.page)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', opacity: isActive ? 1 : 0.82, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', height: 33, flexShrink: 0 }}>
                  <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: isActive ? '#ffffff' : '#E3C187', letterSpacing: '0.04em', whiteSpace: 'nowrap', lineHeight: 1 }}>
                    {ko ? l.ko : l.en}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ZONE 3 — Secondary links — pushed to the right with marginLeft:auto */}
        {!isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {links.filter(l => !l.isFounders && !l.isMain).map(l => {
              const isActive = page === l.page;
              return (
                <button key={l.page} onClick={() => navigate(l.page)}
                  className={`nav-ul${isActive ? ' nav-ul-active' : ''}`}
                  style={{ ...btnBase, padding: '0 11px', fontFamily: T.sansKr, fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap', borderBottom: `2px solid transparent` }}>
                  {ko ? l.ko : l.en}
                </button>
              );
            })}
          </div>
        )}

        {/* ZONE 4 — Utility buttons, fixed right */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center', marginLeft: isMobile ? 'auto' : 16 }}>
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

      {/* ── Mobile menu ── */}
      {isMobile && mobileOpen && (
        <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 99 }}>

          {/* Founders — top, extravagant */}
          <button onClick={() => { navigate('founders'); setMobileOpen(false); }} style={{
            background: '#1a1610', border: '1px solid rgba(197,165,114,0.45)',
            borderLeft: '3px solid rgba(197,165,114,0.8)', color: '#E3C187',
            padding: '14px 12px', cursor: 'pointer', fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 17, textAlign: 'left', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 4,
            outline: 'none', WebkitAppearance: 'none', boxSizing: 'border-box',
          }}>
            <span style={{ pointerEvents: 'none' }}>Founders Club</span>
            <span style={{ fontSize: 12, opacity: 0.7, pointerEvents: 'none' }}>→</span>
          </button>

          {/* GoldPath — mobile compact mark */}
          <button onClick={() => { navigate('agp'); setMobileOpen(false); }} style={{
            background: '#161309', border: '1px solid rgba(197,165,114,0.45)',
            borderLeft: '3px solid rgba(197,165,114,0.6)', color: '#C5A572',
            padding: '12px 12px', cursor: 'pointer',
            fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 4,
            outline: 'none', WebkitAppearance: 'none', boxSizing: 'border-box',
          }}>
            <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#C5A572' }}>›</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#E3C187', letterSpacing: '0.03em' }}>GoldPath</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#C5A572' }}>▌</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#7a6d58', letterSpacing: '0.2em' }}>금환</span>
            </div>
            <span style={{ fontSize: 12, opacity: 0.7, pointerEvents: 'none' }}>→</span>
          </button>

          {/* Regular links — filter out both Founders and AGP */}
          {links.filter(l => !l.isFounders && !l.isMain).map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              background: 'none', border: 'none', color: page === l.page ? T.gold : T.textSub,
              padding: '12px 4px', cursor: 'pointer', fontFamily: T.sansKr, fontSize: 15,
              textAlign: 'left', borderBottom: `1px solid ${T.border}`,
            }}>
              {ko ? l.ko : l.en}
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
