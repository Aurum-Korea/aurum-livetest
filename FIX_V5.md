# Build Fix v5 · FULL REBUILD OF ALL 12 PAGES

## What went wrong

My bulk transform script had a bug with functions that use destructured parameters:

```jsx
function Photo({ type = 'corridor', caption, tag, height = 420 }) {
  return (...)
}
```

When stripping helper functions from source mockups, my regex looked for the first `{` after the function name — but that matched the destructuring brace `{` (in the parameter list), not the function body brace.

Result: the function got truncated mid-signature in 6 of 12 pages. You saw this as:
- v3: `GATES has already been declared` (different bug, fixed)
- v4: `Unexpected ")" at ShopPage:200` (stripFunction in primary transform)
- Today: `Expected ")" but found "export" at SecurityPage:9` (same bug in helper extractor)

Same underlying parser bug. I fixed it in one place (primary transform v4) but not in the helper extractor that built the 6 sub-pages (VaultPage, WhyPage, SecurityPage, SignupPage, LoginPage, KycPage). You were right to call that out.

## What I did this time

Rewrote both transform functions with a proper paren-matching algorithm. The new logic:

1. Find `function NAME(`
2. Match parens with depth counting to find the closing `)` (handles destructuring correctly)
3. Skip whitespace
4. Find the body opening `{`
5. Match braces to find body closing `}`

Re-ran against ALL source mockups. All 12 pages regenerated.

## Full validation run before shipping

On all 12 pages:

- ✓ No orphaned `) {` artifacts
- ✓ No truncated function signatures
- ✓ No duplicate top-level declarations
- ✓ No import/local collisions
- ✓ All `T.x` tokens resolve to defined keys
- ✓ All imports from `../lib/constants` exist as exports
- ✓ All imports from `../components/UI` exist as exports
- ✓ All `<Component />` refs are imported or locally defined
- ✓ Exactly 1 `export default` per file

## The 12 replacement files

All in `src/pages/`. Drop the whole directory in:

```bash
cp src/pages/*.jsx ~/aurum-livetest/src/pages/
cd ~/aurum-livetest
git add src/pages/
git commit -m "fix: full rebuild with destructuring-aware transform (v5)"
git push
```

## What changed file-by-file

| File | Prior v4 | v5 | Why |
|------|---------|----|----|
| FoundersPage.jsx | OK | unchanged | already clean |
| HomePage.jsx | OK | unchanged | already clean |
| StartPage.jsx | OK | unchanged | already clean |
| TerminalPage.jsx | OK | unchanged | already clean |
| ShopPage.jsx | OK | unchanged | manual fixes from v4 held |
| ReferralPage.jsx | OK | unchanged | hand-written, never corrupted |
| VaultPage.jsx | **BROKEN** | **FIXED** | Photo() helper truncated |
| WhyPage.jsx | **BROKEN** | **FIXED** | Photo() helper truncated |
| SecurityPage.jsx | **BROKEN** | **FIXED** | Photo() helper truncated |
| SignupPage.jsx | **BROKEN** | **FIXED** | FormCard/Field/ProgressBar truncated |
| LoginPage.jsx | **BROKEN** | **FIXED** | FormCard/Field truncated |
| KycPage.jsx | **BROKEN** | **FIXED** | FormCard/Field/ProgressBar truncated |

6 pages actually had latent bugs. Vercel only reported the first one it hit. Now all are fixed together.
