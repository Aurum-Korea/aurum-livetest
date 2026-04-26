# AURUM · The Quiet Room

Backend + private dashboard for **theaurumcc.com** (TACC PTE LTD).

This package is a drop-in upgrade to the existing static site. It keeps every
existing page intact and adds:

- A **dedicated members log-in** at `/members` where the three founding
  partners enter email + password to reach the dashboard.
- A **partners-only dashboard** (`/admin`) for the principals to review
  sign-ups, add notes, generate invitation codes, and send branded
  bilingual emails.
- A **gated patron portal** (`/memo`) with three documents (Founders Memo,
  Companion, FAQ), reachable only with a valid invitation code.
- A **public code-entry page** (`/code`) so invitees can land directly via the
  magic link in their email.
- Backend serverless functions on Vercel — no build step, no npm dependencies.

Everything lives inside `/api/` (Vercel serverless functions) and four new
HTML pages at the root. The original `index.html` and `interest.html` are
kept; the only patch to `interest.html` is one line that points the form to
`/api/submit`.

---

## What's in this folder

```
.
├── index.html              ← original landing (unchanged)
├── interest.html           ← original sign-up form (one line patched)
├── members.html            ← NEW · dedicated partner log-in page
├── admin.html              ← NEW · partners dashboard
├── code.html               ← NEW · public code-entry page
├── memo.html               ← NEW · gated patron portal
├── vercel.json             ← updated · routing + headers
├── package.json            ← minimal · type:module · node>=20
├── _docs/                  ← PDFs served only via /api/doc (gated)
│   ├── memo.pdf
│   ├── companion.pdf
│   └── faq.pdf
└── api/
    ├── _lib/               ← shared helpers (not directly routable)
    │   ├── http.js         ← request/response helpers
    │   ├── auth.js         ← HMAC-signed cookies, password check, code gen
    │   ├── storage.js      ← Upstash Redis REST client + dev fallback
    │   └── email.js        ← Resend REST + bilingual invitation template
    ├── submit.js           ← POST  · public form receiver
    ├── login.js            ← POST  · admin login
    ├── logout.js           ← POST  · admin logout
    ├── me.js               ← GET   · session probe
    ├── verify-code.js      ← GET/POST · patron code check
    ├── doc.js              ← GET   · gated PDF stream
    └── admin/
        ├── list.js         ← GET   · all leads + stats
        ├── update.js       ← POST  · status / notes / revoke
        └── approve.js      ← POST  · generate code + send email
```

---

## How the flow works

1. A prospect fills out the form on `/interest`. The form posts to
   `/api/submit`. A lead record is written to Upstash and both partners get
   a notification email.
2. Either partner signs in at `/admin` with the shared password (or their own,
   if you set two), reviews the lead, and clicks **Approve & Send**.
3. The system generates an invitation code in the format
   `AURUM-XX-XXXX-XXXX`, binds it to the lead, and emails the prospect a
   branded bilingual (EN/KO) invitation with a magic link.
4. The prospect clicks the link → lands on `/code?c=…` → code is auto-checked
   → cookie is set → forwarded to `/memo`.
5. On `/memo`, the three doc cards stream PDFs through `/api/doc?id=…`. Each
   open is logged in the lead's audit trail. If a partner revokes the code,
   access is killed instantly.

---

## Required environment variables

Set these in Vercel → Project → Settings → Environment Variables (apply to
**Production** at minimum; Preview if you want to test).

### Storage (required)

```
KV_REST_API_URL          ← from Upstash via Vercel Marketplace
KV_REST_API_TOKEN        ← from Upstash via Vercel Marketplace
```

### Auth (required)

```
AURUM_SECRET             ← random 32+ char string. used to sign cookies.
                           generate one: `openssl rand -hex 32`
ADMIN_USERS              ← partner roster. two formats accepted:
                           per-user pw:  email:pass,email:pass,email:pass
                           shared pw:    email,email,email   (uses ADMIN_PASSWORD)
ADMIN_PASSWORD           ← shared password. used when ADMIN_USERS holds
                           plain emails, or when ADMIN_USERS is unset.
```

**Default roster (baked in if ADMIN_USERS is not set):**

```
jwc@theaurumcc.com
tkj@theaurumcc.com
wsl@theaurumcc.com
```

**Default password (baked in if neither ADMIN_USERS:pw nor ADMIN_PASSWORD set):**
`1234` — soft-launch placeholder only. Replace before the first real prospect.

**Recommended production setup** (per-partner passwords):

```
ADMIN_USERS = jwc@theaurumcc.com:<strong-pw-1>,tkj@theaurumcc.com:<strong-pw-2>,wsl@theaurumcc.com:<strong-pw-3>
```

The audit log credits actions by the email's local part — `jwc`, `tkj`, or
`wsl` — so each partner's actions are distinguishable in the lead history.

### Email (recommended — without it, codes still generate but no email is sent)

```
RESEND_API_KEY           ← from resend.com
FROM_EMAIL               ← e.g. "Aurum <hello@theaurumcc.com>"
                           must be on a verified Resend domain.
NOTIFY_EMAILS            ← comma-separated. who gets new-inquiry alerts.
                           example: changmin@…,sora@…
BCC_PARTNERS             ← "true" to BCC partners on every patron invitation.
                           default: true
REPLY_TO                 ← optional. e.g. "partners@theaurumcc.com"
```

### Site (recommended)

```
SITE_URL                 ← e.g. https://theaurumcc.com
                           used to build the magic link in the email.
                           if unset, falls back to the request's host.
```

---

## Setup, step by step

### 1. Connect Upstash (storage)

In your Vercel project:

1. **Storage** tab → **Create Database** → **Upstash for Redis** (via Marketplace)
2. Pick the region closest to your Vercel functions (Singapore = `ap-southeast-1`)
3. Click **Connect to Project**. Vercel auto-injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`.

That's it. Upstash has a generous free tier; nothing to install.

### 2. Set up Resend (email)

1. Sign up at **resend.com**
2. **Domains** → **Add Domain** → enter `theaurumcc.com`
3. Resend gives you 3–4 DNS records (SPF, DKIM, MX). Add them at your DNS
   provider (Cloudflare, Vercel DNS, wherever the apex of `theaurumcc.com`
   is hosted). Verification usually takes 5–30 minutes.
4. **API Keys** → **Create API Key** → copy the key.
5. Set `RESEND_API_KEY` in Vercel.
6. Set `FROM_EMAIL` to something like `Aurum <hello@theaurumcc.com>` (the
   address must be on the verified domain).
7. Set `NOTIFY_EMAILS` to the partner inboxes.

If you skip Resend entirely, the system still works — it just doesn't send
emails. The dashboard surfaces the generated code so you can copy/paste it
manually into your own email client.

### 3. Set the secret + admin roster

```
AURUM_SECRET     = <output of: openssl rand -hex 32>
ADMIN_USERS      = jwc@theaurumcc.com:<pw1>,tkj@theaurumcc.com:<pw2>,wsl@theaurumcc.com:<pw3>
```

If you skip `ADMIN_USERS` entirely, the system uses the three baked-in
emails with shared password `1234` — fine for clicking through the flow,
not fine for real prospects.

### 4. Deploy

`git push`. Vercel rebuilds. The API routes appear automatically — no config.

### 5. First login

Visit `https://theaurumcc.com/members`. Enter your email and password.
You're forwarded to `/admin`.

---

## Operating notes

### The partner workflow

- New sign-up arrives → both partners get an email with the lead's name,
  contact, tier, and a deep link to the dashboard entry.
- In `/admin`, partner reviews the patron note, marks status (`reviewing` /
  `approved` / `declined`), adds private notes (visible only to partners).
- When ready: **Approve & Send**. The lead jumps to `approved`, a code is
  generated and bound, the email goes out, and the lead jumps to `sent`.
- If something goes wrong (email bounces, address typo): **Revoke Code**.
  The patron's session is killed on the next click; you can re-approve
  with a new code afterward.

### Codes

- Format `AURUM-XX-XXXX-XXXX` (alphabet excludes `0`/`O`/`1`/`I` to avoid
  confusion when read aloud).
- One code per lead. Approving the same lead twice (without revoking)
  reuses the existing code.
- Revoking is instant. Both `/api/verify-code` and `/api/doc` re-check the
  code against the lead record on every request.

### Audit trail

Every action (submit, status change, note added, code generated, code
revoked, email sent, doc opened) is appended to the lead's audit log with
the partner's index and a timestamp. Visible in the dashboard's detail pane.

### What never leaves your project

- No third-party analytics, no embedded scripts, no fonts that aren't in the
  existing site.
- The `/admin`, `/code`, `/memo`, and `/api/*` paths all set `noindex` and
  `Cache-Control: no-store`.
- The `/_docs/` folder is rewritten to a 404 — PDFs only stream through
  `/api/doc`, which checks the cookie and the binding on every request.

### Local development

```
npm i -g vercel
vercel dev
```

If `KV_REST_API_URL` is not set, storage falls back to an in-memory map (data
clears on every restart — fine for clicking through flows). If
`RESEND_API_KEY` is not set, emails are stubbed out and logged.

---

## File-by-file, briefly

| File | What it does |
|---|---|
| `api/submit.js` | Validates form, writes `lead:{id}`, emails partners. |
| `api/login.js` | Checks email + password, sets `aurum_admin` cookie (12h). |
| `api/logout.js` | Clears the admin cookie. |
| `api/me.js` | Returns current session info `{email, id}` or 401. |
| `api/verify-code.js` | Validates a code, sets `aurum_access` cookie (30d). |
| `api/doc.js` | Streams a PDF after re-checking the code binding. |
| `api/admin/list.js` | Returns all leads and stats (admin only). |
| `api/admin/update.js` | Status, notes, revoke (admin only). |
| `api/admin/approve.js` | Generate code, bind, send email (admin only). |
| `api/_lib/http.js` | JSON, cookies, body-reader, query parser. |
| `api/_lib/auth.js` | HMAC sign/verify, credential check, code generator. |
| `api/_lib/storage.js` | Upstash REST client + dev fallback. |
| `api/_lib/email.js` | Resend client + bilingual templates. |

---

## Brand & copy

The dashboard, code page, and portal all use the existing brand tokens
verbatim — same fonts, same gold (`#C5A572`), same dark canvas (`#0a0a0a`).
Bilingual EN/KO with Korean as default. The invitation email is also
bilingual, with the code prominent in JetBrains Mono and a single gold CTA
button to the magic link.

If you want to tune the email copy, it lives in
`api/_lib/email.js → buildInvitationEmail()`. Both the EN and KO blocks are
side-by-side.

---

## Troubleshooting

- **"login keeps bouncing me back"** — `AURUM_SECRET` isn't set, so the
  signed cookie can't be verified on the next request. Set it.
- **"can't log in with my email"** — check the `ADMIN_USERS` env var. If
  unset, only the three baked-in addresses (`jwc@`, `tkj@`, `wsl@`) work
  with shared password `1234`.
- **"approve works but no email"** — Resend either isn't configured or the
  domain isn't verified yet. Check the dashboard response toast — it will
  tell you the reason. Domain verification takes up to 30 minutes.
- **"doc returns 401"** — cookie expired (30 days) or code was revoked.
  Patron re-enters the code at `/code` and they're back in.
- **"new sign-ups not appearing"** — `KV_REST_API_URL` / `KV_REST_API_TOKEN`
  not set, so writes land in the in-memory dev store and vanish on cold
  starts. The form will succeed, partner notification emails will go out
  (if Resend is configured), but the dashboard list will be empty.
  Connect Upstash via the Vercel Marketplace to fix.
- **"There was a problem submitting your inquiry"** — the form's catch
  block fired, meaning `/api/submit` returned non-200. Check the Vercel
  function logs for the inquiry timestamp; the most common cause is a
  missing `RESEND_API_KEY` combined with no `NOTIFY_EMAILS` (in which case
  the lead has no record at all if storage also fails). Set at minimum
  `AURUM_SECRET` and connect Upstash.

---

## A word about the room

The dashboard is built for two people. It is not a CRM. It does not have
seats, roles, integrations, or webhooks. It will hold a few hundred leads
without breaking a sweat, which is more than the founding group should ever
contain. If the program grows past that, this becomes the wrong tool —
and that will be a good problem.

— *quietly · forever*
