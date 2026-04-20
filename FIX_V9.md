# Build Fix v9 · Analytics Dashboard

## What ships

### New page: `/analytics` (1138 lines, 9 sections)

A full analytical dashboard serving both MZ stackers and HNW institutional investors. Strategy: **"Glassbox"** — every number visible, every chart answers a specific investment question, every widget ends with a conversion hook.

**9 sections:**

1. **§I · Market Strip** — live XAU/USD, XAU/KRW, USD/KRW, KR premium stats + TradingView Lightweight 30-day area chart
2. **§II · Kimchi Premium Meter** — semi-circle gauge (green/amber/red zones) + live 4-lane price comparison (Spot / KR retail / Aurum / Founders III) + savings CTA
3. **§III · Five Ratios** (4-tab panel) — CB Holdings / Gold-Silver / Gold-Dow / Real Estate vs Gold
4. **§IV · KRW Debasement** — 21-year SVG line chart: ₩1M purchasing power 2005→2026, shown in grams of gold
5. **§V · Central Bank Buying Cadence** — interactive canvas bar chart with 2022 inflection highlight + hover tooltips
6. **§VI · Korea Allocation** — two side-by-side SVG donut charts: KR household vs Global CB reserve composition
7. **§VII · Calculators** (3-tab panel) — Kumtong unit converter / Overpay calculator / GoldPath Accumulator with live projections
8. **§VIII · Aurum Price Lane** — 4-row honest comparison with live price flashes
9. **§IX · Final CTA** — dual buttons → /signup + /founders

### Nav updated: 6 links

```
시작 · Founders Club · GoldPath · 상점 · 분석 · 추천
```

New `분석` / `Analytics` entry between 상점 and 추천.

### New dependency

Adds `lightweight-charts@^4.2.0` to `package.json` for the TradingView chart on §I Market Strip. `npm install` will pick it up automatically on Vercel.

## File manifest

- `package.json` — adds lightweight-charts
- `src/App.jsx` — adds `/analytics` route
- `src/components/QuietNav.jsx` — 6 links, tighter gap
- `src/pages/AnalyticsPage.jsx` — NEW · 1138 lines

## Data approach

Mock data with slight animation (per your decision):
- XAU/USD chart: pre-seeded 30-day series with `seedPriceHistory()`
- Market strip prices: update every 3.5s with random walk
- Kimchi gauge: premium ticks every 4.5s within bounded range
- Price Lane: flashes on tick every 4.2s
- All other charts: static historical (CB buying 2010-2025, KRW debase 2005-2026, ratios 2015-2026)

## To deploy

```bash
unzip build-fix-v9.zip
cp -r build-fix-v9/src/* ~/aurum-livetest/src/
cp build-fix-v9/package.json ~/aurum-livetest/package.json
cd ~/aurum-livetest
git add src/ package.json
git commit -m "feat: v9 — Analytics dashboard (9 sections) + 6-link nav"
git push
```

Vercel will `npm install` on deploy and pick up lightweight-charts automatically.

## What to check post-deploy

1. `/analytics` renders all 9 sections
2. Nav shows 6 links with 분석 visible
3. Active-state gold underline shows on 분석 when on /analytics
4. Mobile <720px: hamburger drawer shows all 6 links
5. Market Strip chart renders (TradingView area chart, gold line)
6. Kimchi gauge animates every 4.5s
7. Tab switching on §III Ratios + §VII Calculators works
8. CB Buying chart hover tooltip appears
9. Donuts render on §VI
10. All CTAs route to /signup or /founders

## Validation

- 14 pages all pass brace balance, export default count, import resolution, JSX component refs
- AnalyticsPage: 1138 lines, 0 brace imbalance, exactly 1 export default
- lightweight-charts imported in AnalyticsPage only (tree-shakes cleanly)

## Not done (still pending per v9 scope)

- Dead CTA audit across all 14 pages → v10
- Full Korean/EN prose retrofit for lang toggle → backlog
- Double footers on primary pages → backlog
- Real-data API integration (WGC, LBMA) → post-launch
