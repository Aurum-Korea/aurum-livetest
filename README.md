# Aurum Century Club — Platform v2.1
## MMXXVI · TACC Pte Ltd

### Deploy
Push this repo to GitHub → connect to Vercel → deploy.
No build step. Pure serverless Node.js + static HTML.

### First-run after deploy
1. POST /api/deals/seed  (admin cookie required) — seed 5 demo deals
2. POST /api/advisor/seed (admin cookie required) — seed 3 test advisor accounts
3. Verify at /admin, /advisor, /portfolio, /mktplace

### Surfaces
| URL          | Who                        | Auth                         |
|--------------|----------------------------|------------------------------|
| /admin       | Partners (JWC/TKJ/WSL)     | aurum_admin cookie           |
| /advisor     | Deal advisors              | aurum_advisor cookie (email+pw) |
| /portfolio   | Admitted TACC members      | aurum_access cookie (invite code) |
| /mktplace    | TACC members + Institutions| aurum_access / aurum_inst cookie |
| /            | Public                     | None                         |

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
- NOTIFY_EMAILS                         (comma-separated partner emails for IOI notifications)
- SITE_URL                              (e.g. https://www.theaurumcc.com)

### v2.1 additions (this release)
mktplace.html              NEW — Deal Marketplace for institutional investors
api/me.js                  UPDATED — now handles admin / inst / member sessions
api/v2.js                  UPDATED — added inst and marketplace resource handlers:
                               inst: register, login, me, list, create (approve)
                               marketplace: ioi, my-iois, approve-ioi, deal-iois
                               deals/update: now stores mk_* marketplace fields
                               deals/marketplace: now accepts aurum_inst cookie
admin.html                 UPDATED — new Marketplace tab:
                               Institutions panel (pending applications + approve)
                               Deal IOIs panel (per-deal IOI queue + data room approval)
                               Publish Deals panel (set mk_* terms, publish/unpublish)
advisor.html               UPDATED — mockup design refinements (wiz-title, timeline,
                               liveCalc params in title, separator label)
vercel.json                UPDATED — /mktplace route, 12 new API rewrites,
                               no-store headers for /mktplace

### Marketplace flow
1. Institution visits /mktplace → clicks "Request Institutional Access"
2. Fills inline registration form → submitted to admin queue
3. Partner approves in /admin → Marketplace tab → Institutions → "Approve & Issue Code"
4. Institution receives welcome email with INST-XXXXXXXX access code
5. Institution logs in at /mktplace with email + access code
6. Browses deals, opens drawer, submits IOI with amount + acknowledgments
7. IOI appears in /admin → Marketplace → Deal IOIs → "Approve Data Room"
8. Institution's drawer updates to full access state with document hub unlocked

### TACC Member marketplace access
Members use their existing invite code at /mktplace Member Access tab.
Same deals visible to members and institutions (gated by same approval flow).
