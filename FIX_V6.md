# Build Fix v6 · Aurum · FULL REMEDIATION

## What v6 fixes

You reported 3 categories of broken:

**1. Missing content vs architecture**
- ✅ V4 Quiet is now default at `/` (was Hybrid)
- ✅ Dev ViewportToggle hidden in production (only shows in `npm run dev`)
- ✅ 한본/EN toggle is now FUNCTIONAL (was static decor)
- ✅ Top nav now has links to /start, /founders, /shop, /referral
- ✅ Active-state highlighting on nav (gold underline on current page)
- ✅ Login/Account button in nav (toggles based on auth state)

**2. Outstanding enhancements**
- ✅ 4 missing CSS animations added (ticker now scrolls)
- ✅ 15 CTAs wired to `useNavigate`
- ✅ Shop cart checkout wired (→ /kyc unauth, → /terminal authed)
- ✅ Login flow signs user in + navigates to return path
- ✅ KYC submit signs user in + navigates to /terminal
- ✅ HybridNav spans (Founders/GoldPath/Why/Vault) now real Link elements

**3. Live site connection**
- ✅ All 12 pages now render shared QuietNav with working links
- ✅ Wordmark always → `/`
- ✅ Every CTA goes somewhere
- ✅ Auth-gated `/terminal` (redirects to /login if not authed)
- ✅ RequireAuth component preserves return path through login redirect

## File manifest

### New files (add to your repo)
- `src/lib/lang.jsx` — Language context with `useLang()` hook + `t(ko, en)` helper
- `src/lib/auth.jsx` — Mock auth context with `useAuth()` + `signIn()` / `signOut()`
- `src/components/RequireAuth.jsx` — Route guard component

### Rewritten (overwrite existing)
- `src/main.jsx` — Adds LangProvider + AuthProvider wrapping
- `src/App.jsx` — Adds RequireAuth around `/terminal` route
- `src/index.css` — Adds 4 missing keyframes
- `src/components/QuietNav.jsx` — Functional nav with 4 links + lang toggle + auth state
- `src/components/UI.jsx` — PrimaryCTA + GhostCTA accept `to` prop for navigation
- All 12 `src/pages/*.jsx` files — CTAs wired, QuietNav injected, dev chrome gated

## To deploy

```bash
unzip build-fix-v6.zip
cd build-fix-v6

# Merge into your repo (overwrites files that exist, adds new ones)
cp -r src/* ~/aurum-livetest/src/

cd ~/aurum-livetest
git add src/
git commit -m "fix: v6 — functional nav, lang toggle, auth, CTA wiring"
git push
```

## What to expect after deploy

Once Vercel rebuilds:

1. **Homepage** opens with **V4 Quiet Door** (not Hybrid)
2. **Top nav** shows: Aurum | 시작 · 패트론 · 상점 · 추천 | 한본·EN · LOGIN
3. Click any nav link — page actually changes
4. Click **한본·EN** — toggle flips; nav labels go EN → Start · Founders · Shop · Refer
5. Click **LOGIN** — goes to /login. After form submit → /terminal (auth gated)
6. Click any "Claim your invite" or "지금 시작" CTA — goes to /signup
7. Signup → /kyc → /terminal (signs you in at KYC submit)
8. Shop → add to cart → checkout → /kyc (unauth) or /terminal (authed)
9. **/terminal** — if not signed in, redirects to /login
10. After login from /terminal redirect, you return to /terminal (return path preserved)
11. No more "QUIET/HYBRID/LIVE/@HANDLES" dev toggle in production
12. Ticker bar animates (scrolls left continuously)

## What's still hardcoded Korean (next pass)

The lang toggle works in nav labels and login/account buttons, but hero copy and body paragraphs remain Korean. Full bilingual prose retrofit is a separate pass — all the copy lives in 12 pages with `fontFamily: T.serifKr` and literal Korean strings. Wrapping every one in `t('ko', 'en')` is ~2 hours of grunt work. For now:

- 한본 mode: Fully Korean (current state, everything reads naturally)
- EN mode: Nav is English, page content stays Korean

Acceptable for v1 ship. If EN-primary audiences matter for launch, that's the next big task.

## Validation · all 12 pages pass these checks

- Balanced braces (0 imbalance)
- Exactly 1 `export default` per file
- No orphan `) {` artifacts
- No truncated function signatures
- All `T.x` token refs resolve to defined keys
- All imports from `../lib/constants` exist as exports
- All imports from `../components/UI` exist as exports
- All `<Component />` tags imported or locally defined
- `navigate()` calls paired with `useNavigate` imports
- `<Link>` tags paired with Link imports
- `useLang()` / `useAuth()` calls paired with their imports
