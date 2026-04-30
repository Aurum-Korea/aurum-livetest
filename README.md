# Aurum Century Club — Platform v2
## MMXXVI · TACC Pte Ltd

### Deploy
Push this repo to GitHub → connect to Vercel → deploy.
No build step. Pure serverless Node.js + static HTML.

### First-run after deploy
1. POST /api/deals/seed  (admin cookie required) — seed 5 demo deals
2. POST /api/advisor/seed (admin cookie required) — seed 3 test advisor accounts
3. Verify at /admin, /advisor, /portfolio

### Surfaces
| URL       | Who            | Auth            |
|-----------|----------------|-----------------|
| /admin    | Partners (JWC/TKJ/WSL) | aurum_admin cookie |
| /advisor  | Deal advisors  | aurum_advisor cookie (email+pw) |
| /portfolio| Admitted members | aurum_access cookie (invite code) |
| /         | Public         | None            |

### Before real advisors go live
Delete: api/deals/seed.js and api/advisor/seed.js
Harden: set ADMIN_USERS env var in Vercel with strong passwords
Set: AURUM_SECRET env var to a random 32+ char string

### Env vars (Vercel)
- KV_REST_API_URL / KV_REST_API_TOKEN  (Upstash — connect via Vercel Storage)
- AURUM_SECRET                          (JWT signing key — set before launch)
- ADMIN_USERS                           (email:password,... override)
- ADMIN_PASSWORD                        (shared fallback — harden before launch)
- RESEND_API_KEY                        (email — optional, graceful fallback)

### New files (v2 additions)
api/_lib/deal-storage.js      Deal entity KV CRUD
api/_lib/advisor-storage.js   Advisor entity KV CRUD
api/deals/list.js             GET all deals (admin)
api/deals/create.js           POST create deal (admin)
api/deals/update.js           POST update deal stage/fields (admin)
api/deals/seed.js             POST seed demo deals (delete before launch)
api/advisor/login.js          POST advisor login → cookie
api/advisor/logout.js         POST clear advisor cookie
api/advisor/me.js             GET advisor profile + deals
api/advisor/deals.js          POST submit/qa/update (advisor-scoped)
api/advisor/create.js         POST create advisor account (admin)
api/advisor/seed.js           POST seed test advisors (delete before launch)
api/member/me.js              GET member portfolio (member-scoped)
