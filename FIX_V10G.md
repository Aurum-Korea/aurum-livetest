# Build Fix v10g · batched hotfix pack · F20–F29

Big stack. Ten hotfixes rolled into one ship across pages + components + globals.

## File manifest (22 changed)

```
src/
├── App.jsx                                · (v10f ScrollToTop preserved)
├── index.css                              · + global mobile spacing audit
├── lib/
│   ├── tokens.js                          · (v10d/f T_NS preserved)
│   └── constants.js                       · (v10f fmtManEok preserved)
├── components/
│   ├── AUSquare.jsx                       · (v10d Au preserved)
│   ├── TickerBar.jsx                      · palette bg now plum-black on neo
│   ├── QuietNav.jsx                       · palette bg now plum-tinted on neo
│   ├── PromoBar.jsx                       · + palette prop · plum gradient on neo
│   ├── UI.jsx                             · PrimaryCTA + GhostCTA · + palette prop
│   ├── DashboardPreview.jsx               · monthly slider · 20만원 floor · correct gain math
│   └── ScrollToTop.jsx                    · (v10f preserved)
└── pages/
    ├── StartPage.jsx                      · bridge intro left-aligned
    ├── GoldPathPage.jsx                   · gold literals → pink · PromoBar neo
    ├── _goldpath_merged.jsx               · FinalCTA neo · 11 gold literals → pink · PrimaryCTA neo
    ├── FoundersPage.jsx                   · reserve CTA 1-line mobile · gate fill on select · green twin-hero · Au seal
    ├── HomePage.jsx                       · (v10f preserved)
    ├── TerminalPage.jsx                   · (v10f preserved)
    ├── ReferralPage.jsx                   · (v10f preserved)
    ├── AnalyticsPage.jsx                  · (v10f MarketStrip preserved)
    ├── ShopPage.jsx                       · A → Au on engraved marks
    ├── SecurityPage.jsx                   · A → Au on engraved marks
    ├── VaultPage.jsx                      · A → Au on engraved marks
    └── WhyPage.jsx                        · A → Au on engraved marks
```

## F20–F29 hotfix list

### F20 · /start bridge intro left-aligned
Centered text overlapped with top-right floating nav on mobile (eyebrow "— EST. MMXXIV · SINGAPORE · TWO ENGINES —" got clipped behind Au square + hamburger). Removed decorative em-dashes, anchored block to left edge with `maxWidth: 720px, marginLeft: 0, marginRight: auto`.

### F21 · Founders reserve CTA single-line on mobile
"파운더스 멤버십 예약 · Reserve Founders Membership →" wrapped to 2 rows under 480px. Split into `.reserve-ko` + `.reserve-en` spans; CSS hides English half on mobile, tightens padding 13/18, font-size 12. Button now reads one line on 390px viewport as Korean-only.

### F22 · GateLadder circle fill tracks selection
Bug: Gate III (apex) had permanent gold fill regardless of which gate was tapped. Tapping I or II left III looking selected. Rewrote: **only the actively-selected circle gets filled.** Apex keeps prestige via permanent brighter border + soft halo when inactive. When apex active, wins with brightest fill + white border + strong glow.

### F23 · GateSimulator · Projected GMV promoted to twin green hero
Old: Projected was a small muted row below Cumulative. User intent is emotional payoff = input → output comparison.
New: Cumulative (white italic serif 26px) + Projected (green italic serif 26px, same size) sit side-by-side above the dashed line. GAIN / DISCOUNT / SAVINGS stay small below. Mental math "what I put in → what I get" is instant.

### F24 · TransitionStripe seal fixed
Circular seal was `position: absolute` center-of-section and overlapped the "Beyond the drop, the program." headline on mobile. Now sits above text with `margin: 0 auto 28px`. Letter inside changed `A` → `Au` to match canonical mark.

### F25 · Universal engraved-mark A → Au
8 engraved "A" marks on product surfaces (gold coins, bars, vault seals) across ShopPage, SecurityPage, VaultPage, WhyPage, GoldPathPage, _goldpath_merged.jsx converted to "Au". Font sizes scaled ~38% (180→112, 58→36, 40→25, 11→7) so Au occupies the same visual footprint as the old single-letter A.

### F26 · Top bands fully absorb Neo-Seoul palette
Previous F17 swapped borders + text colors but left backgrounds as pure black or gold-tinted gradients. Now three components have full palette awareness:
- **TickerBar** · neo bg → `#050510` plum-black (was pure `#050505`)
- **QuietNav** · neo bg → `rgba(11,11,20,0.86)` plum-tint (was neutral black)
- **PromoBar** · new `palette` prop · neo gradient → `#0b0b14 → #131320` plum-black (was gold-tinted `#0a0806 → #0d0a06`), pink border/countdown

Wired `palette="neo"` on GoldPath PromoBar. Referral already covered by F17.

### F27 · Dashboard slider · monthly toggle + correct gain math
Bug: Monthly was binary toggle (₩500K vs ₩2M). Delta displayed was `(lastMonth - firstMonth) / firstMonth × 100` → +936.7% nonsense (it was comparing cumulative to first-month deposit, not appreciation).

Fix:
- **Monthly is now a full slider** · range `20만원 → 500만원`, step `10만원`, default `20만원` (actual AGP floor)
- **Correct gain math** · `(krwValue / gmv − 1) × 100` = real appreciation net of contributions
- Math-agent validated: 50만원/mo × 10mo → grams 19.77g, KRW 518만원, GMV 500만원, **GAIN 3.67%** (honest, not +936%)
- Labels use `fmtManEok` · plan displays `20만원`, `100만원`, `500만원` not `₩500K / mo`

### F28 · Gold CTA bleeds on /goldpath final section
`PrimaryCTA` + `GhostCTA` in `UI.jsx` always hardcoded gold. On /goldpath the "GoldPath 가입하기 →" button at FinalCTA rendered tan-gold, clashing with the hot-pink page palette.
- Added `palette` prop to both components (`gold` default | `neo`)
- `_goldpath_merged.jsx` FinalCTA section bg swapped from `rgba(197,165,114,0.10)` gold radial → `rgba(255,61,138,0.10)` pink radial
- 11 other hardcoded `rgba(197,165,114,X)` gold literals across `_goldpath_merged.jsx` (7) + `GoldPathPage.jsx` (4) swapped to pink alphas — UI chrome only; SVG `stopColor="#C5A572"` gold-coin gradients preserved as legitimate product imagery

### F29 · Global mobile spacing audit
Added global CSS rules in `index.css`:
- `section { padding-inline: 18px !important }` under 720px
- `section { padding-inline: 16px !important }` under 480px
- Korean h1/h2 line-height relief: 1.22 / 1.26 on mobile
- Long prose line-height tightens to 1.72 so 3-line blocks don't feel airy
- Any section with `padding: '100px…'` or `'120px…'` throttled to `padding: 64px` top/bottom on <480px
- `body, #root { max-width: 100vw }` prevents horizontal scroll from rogue overflow

Uses `padding-inline` so inline vertical padding on each section stays intact — only horizontal gutters compress.

## Deploy

```bash
unzip build-fix-v10g.zip
cp -r build-fix-v10g/src/* ~/aurum-livetest/src/
cd ~/aurum-livetest
git add src/ && git commit -m "fix: v10g · 10 batched hotfixes · F20-F29"
git push
```

No package.json changes. No new dependencies.

## Validation

22 files · all brace / export / token balanced. Math agent run confirms DashboardPreview gain math produces honest 3-15% range at 10% CAGR.

## To verify after deploy

| Where | Check |
|---|---|
| `/start` mobile | Intro text left-aligned · no overlap with top-right nav |
| `/founders` hero mobile | "파운더스 멤버십 예약 →" fits on one line (Korean only) |
| `/founders` ladder | Tap I → I fills gold · tap II → II fills · tap III → III fills brightest with glow |
| `/founders` simulator | Cumulative (white italic 26px) + Projected (green italic 26px) twin heroes above dashed line |
| `/founders` §VI seal transition | "Beyond the drop, the program." seal sits ABOVE text (not through it) · reads "Au" |
| Any engraved coin/bar | Shows "Au" not "A" |
| `/goldpath` top ticker/nav/promo | All three bands plum-black + hot pink (no black/gold bleed) |
| `/goldpath` final CTA section | "GoldPath 가입하기 →" button is hot pink (not gold) |
| `/goldpath` dashboard preview | Two sliders: monthly (20만원-500만원) + months (1-36) · GAIN % is small honest 3-15% range |
| Any mobile page | Horizontal gutters feel generous · no text hits screen edges |
| Long Korean paragraphs | Line-height 1.72 · reads dense but not cramped |

## Post-v10g backlog

- Real data API wiring for F18 MarketStrip ratios (FRED / BOK ECOS)
- Content pages still outstanding: /about, /press, /faq, /legal, /blog
- DevChrome legacy cleanup
