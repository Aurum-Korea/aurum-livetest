# Aurum Site

Production Vite + React site consolidating all 12 Aurum surfaces into one routed SPA.

## Install & run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Output in `dist/`. Deploy as static site (Vercel, Netlify, Cloudflare Pages).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Homepage · V4 Quiet + Hybrid toggle |
| `/start` | MZ acquisition page |
| `/founders` | Founders Club tier ladder |
| `/terminal` | Authenticated dashboard (mock data) |
| `/shop` | Product catalog · bars + coins |
| `/vault` | Malca-Amit deep-dive |
| `/why` | The thesis · four forces |
| `/security` | Trust infrastructure |
| `/signup` | Onboarding · 4-step |
| `/login` | KakaoTalk SSO + email |
| `/kyc` | MAS PSPM 2019 compliance flow |
| `/referral` | GMV growth engine · 5-tier + 90-day promo |

## Structure

```
src/
├── main.jsx              React root + BrowserRouter
├── App.jsx               Routes + layout
├── index.css             Global resets + font imports
├── lib/
│   ├── tokens.js         Design tokens (T object, single source of truth)
│   └── constants.js      GATES, AGP_CREDITS, PRODUCTS, math helpers
├── components/
│   ├── QuietNav.jsx      Sticky top nav
│   ├── QuietFooter.jsx   2-line Roman numeral finish
│   ├── SectionHead.jsx   § numeral + bilingual heading
│   └── UI.jsx            Prose, PrimaryCTA, GhostCTA
└── pages/
    └── (12 page components)
```

## Design notes

- V4 Quiet register throughout (serif Korean + italic English pairing)
- Gold palette: `#C5A572` (mid), `#E3C187` (bright), `#8a7d6b` (dim)
- Fonts: Cormorant Garamond (serif), Pretendard (Korean sans), Outfit (English sans), JetBrains Mono
- Korean-first: KRW shown before USD, Korean labels before English
- Two-line Roman numeral footer on every page: `MMXXVI · QUIETLY · FOREVER`

## Membership tiers

| Level | Name (KO/EN) | GMV threshold | Founder discount | AGP bonus credit |
|-------|--------------|---------------|------------------|------------------|
| I | 브론즈 / Bronze | ₩7.2M | −1.0% | +₩50K |
| II | 실버 / Silver | ₩21.6M | −1.5% | +₩150K |
| III | 골드 / Gold (APEX) | ₩50.4M | −2.0% | +₩400K |
| IV | 플래티넘 / Platinum | ₩93.6M | −2.5% | +₩1M |
| V | 소브린 / Sovereign | ₩144M | −3.0% | +₩2.5M |

Total max AGP bonus: ₩4.1M in free physical gold over lifetime.

## Every new signup

Gets the tier-above discount rate for 90 days (Bronze → Silver rate, etc). Sovereign is max — no uplift.

## Discount applied to

**Aurum price** (spot × 1.08 platform markup), not spot. Discount compounds as GMV crosses each gate.

## Four GMV sources

1. My physical (direct bar/coin purchases)
2. My GoldPath (monthly subscription auto-debit)
3. Referral physical (friends' purchases)
4. Referral GoldPath (friends' AGP commitments)

Referrals are **unlimited**. Referee purchases count toward the referrer's GMV.
