# Build Fix v4 · Aurum

## The error

```
ERROR: Unexpected ")"
file: /vercel/path0/src/pages/ShopPage.jsx:200:0
```

## Why

My bulk transform's `stripFunction()` had a bug with destructured parameter functions. When the original mockup had:

```jsx
function QuietNav({ page, cartCount, onCartClick }) {
  return (...)
}
```

My stripper looked for `function QuietNav(` then found the first `{` and tried to match it to a `}`. But the first `{` belonged to the destructuring `{ page, cartCount, onCartClick }`, so it matched that closing brace and deleted up to there — leaving `) { return ...` orphaned at line 200.

## Fix

Restored the ShopPage's cart-aware nav as a separate component `ShopNav` (not `QuietNav`, to avoid name collision with the shared component). Updated the render call:

- `<QuietNav page="shop" cartCount=... onCartClick=.../>` → `<ShopNav page="shop" cartCount=... onCartClick=.../>`
- Removed unused `import QuietNav from '../components/QuietNav'` from ShopPage

ShopPage now uses its own inline nav (because it needs cart button state). Other pages still use the shared `QuietNav`.

## Verified

- 0 orphaned `) {` patterns remaining in ShopPage
- ShopNav defined once, called once
- No QuietNav references in ShopPage (no collision)
- Swept all 12 pages for same bug pattern — only ShopPage was affected

## To deploy

```bash
cp src/pages/ShopPage.jsx ~/aurum-livetest/src/pages/ShopPage.jsx
cp src/pages/FoundersPage.jsx ~/aurum-livetest/src/pages/FoundersPage.jsx
cd ~/aurum-livetest
git add src/pages/ShopPage.jsx src/pages/FoundersPage.jsx
git commit -m "fix: restore ShopNav after bulk transform corruption"
git push
```

FoundersPage is unchanged from v3 but included so you can drop both in at once.
