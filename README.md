# The Aurum Century Club · Livetest · v10

A two-page bilingual (Korean / English) static site. Pure HTML/CSS/JS, no build step.

**Live domain:** www.theaurumcc.com  
**Entity:** TACC PTE LTD

## Files
| File | Purpose |
|---|---|
| `index.html` (~124 KB) | Bilingual landing → 6 numbered sections → CTA |
| `interest.html` (~37 KB) | Bilingual sign-up form with confirmation screen |
| `vercel.json` | Static-site config + security headers |

## What's new in v10
- **Platform/Portal teaser** added inside §VI Opening Book — two compact cards ("The pipeline." / "The portal." / 파이프라인 / 포털) sit between the deals-summary numbers strip and the disclaimer. Hints at what membership delivers post-close (private deal channel + member portal with NAV/LTV) without expanding into new sections.
- **Mobile compression** — reduced section padding, hero/Founding 100 padding, h2 sizes, divider margins, mechanism step gap, engines chart padding, walls/replacement padding, path grid gap, ctas padding. Total mobile scroll height reduced by ~25%.

## Site structure
```
LANDING · "The Aurum Century Club" door
HERO · "The Kilo."
FOUNDING 100 · 8/100 cohort scoreboard
§I  ORIGIN · "The deals were there."
§II  THE FORM · "Three forces. One fund." (telescope)
§III QUALIFIER · "One kilogram. The Founding 100." (toggle)
§IV  MECHANISM · "Two jobs." + 4-step flow + Two engines + chart
§V   SIMPLIFICATION · "Four walls. One subscription."
§VI  OPENING BOOK · "Two positions." + BEYOND OPENING teaser
PATH · "Four steps. One conversation."
```

## Deploy
```bash
git add . && git commit -m "TACC v10 — teaser + mobile compression" && git push
```

## License
Proprietary. TACC Pte Ltd · MMXXVI.
