# The Aurum Century Club · Livetest · v8

A two-page bilingual (Korean / English) static site with proper landing page, compact section dividers, and full-flow interactivity. Pure HTML/CSS/JS, no build step.

**Live domain:** www.theaurumcc.com  
**Entity:** TACC PTE LTD

## Files
| File | Purpose |
|---|---|
| `index.html` (~124 KB) | Bilingual landing → 6 numbered sections → CTA |
| `interest.html` (~30 KB) | Bilingual sign-up form with confirmation screen |
| `vercel.json` | Static-site config + security headers |
| `README.md` | This file |

## What's new in v8

### 1. Proper landing page · "the door"

Full 100vh entry section before the main site. **Black canvas + breathing gold ambient gradient.** Centered:
- Au seal in gold-bordered frame with soft glow
- Wordmark: "THE AURUM CENTURY CLUB" + "아우럼 센추리 클럽"
- Thin gold rule
- Tagline: "*For the Founding 100. By invitation.*" / "*창립 100인. 초청제.*"
- Arrow that appears on hover

Entire centered block is one `<a href="#top">` — click anywhere on the seal/wordmark/tagline to smooth-scroll into the main site (The Kilo hero). Sequential fade-in on first load (seal → wordmark → rule → tag → meta) over ~1.5s.

Bottom-of-viewport stamp: `● INAUGURAL CLOSE · Q3 MMXXVI` / `● 제1차 클로즈 · Q3 MMXXVI` with pulse dot.

Reduced-motion: ambient breathing and fade-ins disabled, content visible immediately.

### 2. Compact section dividers (replaces v7 bloat)

Single-line chapter markers: thin gold rule + 24px gold tick + Roman numeral inline with eyebrow. ~80-100px total per divider (was ~350px in v7). Mobile-readable.

Same 6 sections, same numbering as v7:
- **I.** ORIGIN · 서장
- **II.** THE FORM · 형태
- **III.** THE QUALIFIER · 자격
- **IV.** MECHANISM · 메커니즘
- **V.** SIMPLIFICATION · 단순화
- **VI.** OPENING BOOK · 개시 도서
- **→** THE PATH · 절차

### 3. Updated side rail
`[○][100][I][II][III][IV][V][VI][→]` — landing first (○), Founding 100 (100), six content sections (I-VI), CTA arrow.

## Carried from earlier versions
- Bilingual EN/KO toggle (Korean default, persists via localStorage)
- TACC PTE LTD legal entity, AURUM brand wordmark
- "Member" replaces "patron" everywhere
- "Memo" replaces "Founders Package"
- Three Forces telescope (auto-rotate, click to freeze)
- Qualifier toggle (HOLD / DEPLOYS / RECEIVES)
- Mechanism flow sequential lit + hover freeze
- Subscription scroll-reveal (walls dim → arrow → replacement glows)
- Founding 100 count-up (0→8 grid)
- All inquiries flow through the form (no email exposed)
- All interactions honor `prefers-reduced-motion`
- Mobile-first responsive throughout

## Deploy
```bash
git add . && git commit -m "TACC v8 — landing + compact dividers" && git push
```

Vercel auto-deploys; `vercel.json` confirms no build step.

## Before launch
- Set form endpoint in `interest.html` (`const ENDPOINT = ''`)
- Update cohort count when subscriptions close
- Remove `<meta name="robots" content="noindex">` when ready to go public

## License
Proprietary. TACC Pte Ltd · MMXXVI.
