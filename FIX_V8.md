# Build Fix v8 · GoldPath + Universal Top Bars + Mobile Fixes

## What v8 delivers

### 1. New /goldpath page (13th route)
- 100% conversion-focused on GoldPath monthly subscription
- Every CTA → `/signup`
- Founders Club mentioned ONCE in FAQ as auto-benefit (never linked)
- V4 Quiet polish — editorial breath, no aggressive scarcity
- Hero visual: GoldPath coin SVG only (line→diamond + "GoldPath" serif italic + 금환)
- 9 sections: Hero, Stats, How It Works, Tier Cards (5-tier interactive), Calculator + Growth Rewards (2-col), Seal Divider, Timeline, Email Reservation, FAQ, Final CTA, T&C
- Calculator ↔ Tier Cards bidirectional sync (click tier → snaps slider; move slider → highlights tier)

### 2. Universal top-bar order: Ticker → MENU → Promo
Applied across ALL 13 pages:
- Ticker (shared component) at the very top
- QuietNav (menu) second
- PromoBar (drop/scarcity banner) third — only shown on primary pages with active drops

Bespoke navs HybridNav + StartNav killed (they were duplicating QuietNav's wordmark). DropCountdownBar + DropBar replaced by shared `PromoBar`.

### 3. Mobile fixes

**QuietNav at <720px:**
- 5 desktop links hide
- Right cluster (한본·EN + LOGIN) hides
- Hamburger ☰ appears, opens full-screen drawer with all 5 links + lang toggle + login
- Drawer animates in from right, dims page behind

**PromoBar at <720px:**
- "FOUNDERS DROP · LIVE" → "● LIVE"
- "ENDS IN" label hidden
- Seconds digit hidden (just D H M)
- Joined count stays visible

### 4. Label fixes
- 패트론 removed from codebase (QuietNav label + comment)
- Nav now reads: `시작 · Founders Club · GoldPath · 상점 · 추천`
- "Founders Club" + "GoldPath" kept as English labels in both ko/en modes (not translated to Korean)

## File manifest

### New files
- `src/components/TickerBar.jsx` — shared ticker, used on all 13 pages
- `src/components/PromoBar.jsx` — shared drop countdown, mobile-compact
- `src/pages/GoldPathPage.jsx` — the new page

### Rewritten
- `src/components/QuietNav.jsx` — 5 links + hamburger drawer + AU-square
- `src/App.jsx` — adds /goldpath route

### Modified (12 pages · TickerBar injected everywhere)
- All pages except GoldPathPage now render `<TickerBar />` above `<QuietNav />`
- HomePage, StartPage, FoundersPage also lost their local TickerBar/DropCountdownBar/DropBar/HybridNav/StartNav functions

## To deploy

```bash
unzip build-fix-v8.zip
cd build-fix-v8
cp -r src/* ~/aurum-livetest/src/
cd ~/aurum-livetest
git add src/
git commit -m "fix: v8 — /goldpath page, universal top bars, mobile hamburger, 패트론 removed"
git push
```

## What you'll see after deploy

1. **All 13 pages** have identical top-bar pattern: Ticker → Menu → (optional promo)
2. **Nav links** show: 시작 · Founders Club · GoldPath · 상점 · 추천 (with 한본·EN + LOGIN right)
3. **Mobile <720px**: nav collapses to AU-square + hamburger. Drawer has all 5 links.
4. **Mobile promo bar**: no more wrapping. Single compact row.
5. **New /goldpath** page — subscribe flow anchored on 5 tiers with calculator
6. Click any GoldPath CTA anywhere → lands on `/signup`

## Validation

All 13 pages pass:
- Braces balanced
- Exactly 1 export default each
- No orphan syntax
- All T.x tokens resolve
- All imports resolve (AUSquare, TickerBar, PromoBar, QuietNav, useNavigate, useAuth, useLang)
- All JSX components defined or imported
- No 패트론 anywhere in source

## Not done (next pass)

- Full Korean/English prose retrofit for lang toggle (hero copy and body paragraphs still Korean only)
- Double footers on primary pages (DropFinale + QuietFooter)
- /founders page needs its own CTA copy sweep to match v7 "Reserve Founders Membership" change (v7 handled that, still intact)
- Scarcity strip appears on /founders and /start headers — light urgency but NOT on /goldpath (per your "remove scarcity" decision)
