# Build Fix v3 · Aurum

## v2 fix resolved

- `GATES` redeclaration in FoundersPage ✓
- `PRODUCTS/calcPrice/fKRW` collisions in ShopPage ✓

## v3 fix (additional · pre-emptive)

Caught during pre-flight: `ShopPage.jsx` had **two** declarations of `function ShopPage`:
- Line 485: the original content-rich component (product grid, filters, cart)
- Line 593: an empty wrapper from my transform that tried to render `<ShopPage />` inside itself (infinite recursion + name collision)

### Fixed

- Removed the empty wrapper at line 593
- Promoted the original `function ShopPage()` at line 485 to `export default function ShopPage()`

## Verified across all 12 pages

- 1 `export default` per file ✓
- No duplicate page-function declarations ✓
- No self-recursive components ✓
- All component references resolve ✓
- All imports resolve ✓
- Balanced braces ✓
- No deprecated react-router-dom v5 APIs (Switch, useHistory) ✓
- All React hooks used are imported ✓

## To deploy

Same 2 files as before (now with v3 patches on ShopPage):

```bash
cp src/pages/FoundersPage.jsx ~/aurum-livetest/src/pages/FoundersPage.jsx
cp src/pages/ShopPage.jsx ~/aurum-livetest/src/pages/ShopPage.jsx
cd ~/aurum-livetest
git add src/pages/FoundersPage.jsx src/pages/ShopPage.jsx
git commit -m "fix: resolve all esbuild redeclaration conflicts"
git push
```
