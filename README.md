# Aurum Korea — Website v2.0

Luxury precious metals SPA for Korean investors. Real physical gold & silver allocated storage via Singapore Malca-Amit FTZ.

## Tech Stack
- **React 18 + Vite** — SPA with client-side routing
- **Zero CSS frameworks** — pure CSS custom properties + token-driven inline styles
- **Vercel Serverless** — `/api/prices.js` for live spot prices (Yahoo Finance + er-api, no API keys needed)

## Project Structure

```
aurum-website/
├── api/
│   └── prices.js              ← Vercel serverless: Yahoo Finance + er-api
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                ← Root: all routing + state
│   ├── main.jsx
│   ├── index.css              ← Unified token-driven CSS (all phases replaced)
│   ├── lib/
│   │   ├── index.jsx          ← T tokens, API stubs, hooks, products, data
│   │   └── magnetic.js        ← Cursor-tracking hover effect
│   ├── components/
│   │   ├── Nav.jsx            ← Sticky, scroll-aware, mobile menu, lang toggle
│   │   ├── Ticker.jsx         ← Live price ticker bar
│   │   ├── Footer.jsx
│   │   ├── UI.jsx             ← Badge, StatBar, Tabs, Accordion, ConsentCheckbox, PaymentMethodCard, TrustStrip, SectionHead
│   │   ├── Toast.jsx
│   │   ├── Logo.jsx
│   │   └── LoginModal.jsx
│   ├── pages/
│   │   ├── HomePage.jsx       ← Hero, Paper vs Physical, Savings, Why Aurum accordion, Shop CTAs, Campaign teasers, News
│   │   ├── ShopPages.jsx      ← ShopSelectorPage, ShopPage (product grid), ProductPage
│   │   ├── CartCheckout.jsx   ← CartPage, CheckoutPage (3-step: review → confirm → success)
│   │   ├── UserPages.jsx      ← DashboardPage, SellFlowPage, WithdrawFlowPage, OrderHistoryPage, AccountPage, KYCFlowPage
│   │   ├── InfoPages.jsx      ← WhyGoldPage, StoragePage, AGPPage, AGPBackingReport, LearnPage
│   │   └── AGPPages.jsx       ← AGPIntroPage (5-step carousel), AGPEnrollPage (4-step form)
│   └── campaigns/
│       ├── FoundingGiftPage.jsx  ← Founding Season: ingot visual, calculator, tier cards, timeline, FAQ, email CTA
│       └── FiveGatesPage.jsx     ← Five Gates referral dashboard: gold card, ladder, activity, leaderboard, tier gallery, share templates
└── vercel.json
```

## Routes

| Route | Page |
|-------|------|
| `home` | HomePage |
| `shop` | ShopSelectorPage |
| `shop-physical` | ShopPage (product grid) |
| `product` | ProductPage |
| `cart` | CartPage |
| `checkout` | CheckoutPage |
| `dashboard` | DashboardPage |
| `sell` | SellFlowPage |
| `withdraw` | WithdrawFlowPage |
| `orders` | OrderHistoryPage |
| `account` | AccountPage |
| `kyc` | KYCFlowPage |
| `why` | WhyGoldPage |
| `storage` | StoragePage |
| `agp` | AGPPage (info overview) |
| `agp-intro` | AGPIntroPage (5-step walkthrough) |
| `agp-enroll` | AGPEnrollPage (full form) |
| `agp-report` | AGPBackingReport |
| `learn` | LearnPage |
| `campaign-founding` | FoundingGiftPage |
| `campaign-referral` | FiveGatesPage |

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

> **Note:** Live prices (`/api/prices`) will 404 locally unless you use Vercel CLI.
> Fallback prices are used automatically when the API is unavailable.

```bash
# With live prices (requires Vercel CLI):
npm install -g vercel
vercel dev
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel dashboard
3. Framework: **Vite** (auto-detected)
4. No environment variables needed — prices API uses no API keys

## Design Tokens

All tokens live in two places (kept in sync):
- **CSS custom properties** in `src/index.css` `:root` block — for use in className-based styles
- **JS `T` object** in `src/lib/index.jsx` — for use in inline styles

Key tokens:
```js
T.gold        // #C5A572
T.goldBright  // #E3C187
T.bg          // #0a0a0a
T.serif       // 'Cormorant Garamond', 'Noto Serif KR', ...
T.serifKr     // 'Noto Serif KR', 'Cormorant Garamond', ...
T.mono        // 'JetBrains Mono', ...
```

## Campaign Pages

### FoundingGiftPage (`campaign-founding`)
- Ingot 3D CSS visual with float animation
- Live slider calculator (KRW/gram → gift preview)
- 3-tier system: Founding Year (₩50K) / Founding 500 (₩200K) / Aurum Patron (₩500K)
- Latin timeline: Diem Zero → Eadem Die → Diem XLIV
- Email reservation form with API stub
- FAQ accordion
- T&C band

### FiveGatesPage (`campaign-referral`)
- Gold card with rotateX/Y CSS transform and wax seal stamp overlay
- Stats bar: gates passed, savings %, GMV, remaining
- 5-gate progress ladder with --progress CSS animation
- Share panel: ref link copy, KakaoTalk/Instagram/Naver/Card buttons
- Activity feed + leaderboard (with "you" highlighted row)
- 5-gate tier gallery with mini-card visuals
- Share templates (2 cards)
- 4 rules grid

## Pricing Constants (lib/index.jsx)

```js
KR_GOLD_PREMIUM   = 0.184  // ~18.4% Korean retail premium
KR_SILVER_PREMIUM = 0.30   // ~30% Korean retail premium
AURUM_GOLD_PREMIUM   = 0.02  // 2% Aurum premium
AURUM_SILVER_PREMIUM = 0.06  // 6% Aurum premium
```

## To-Do Before Production

- [ ] Replace `API.*` stubs in `src/lib/index.jsx` with live backend calls
- [ ] Add real KYC provider (e.g. Jumio, Onfido)
- [ ] Integrate Toss Payments SDK
- [ ] Wire up KakaoTalk notification API
- [ ] Connect Malca-Amit vault reporting API for live AGP backing report
- [ ] Add i18n library for full EN/KO content switching (currently partial)
- [ ] SEO: add react-helmet-async for per-page meta tags
