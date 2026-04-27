// Auth — HMAC-signed tokens (cookie payloads) and constant-time credential compare.
// Zero deps; uses node:crypto.

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

// ---------- Default partner roster ----------
// These are the three @theaurumcc.com inboxes the principals log in with.
// They can be overridden by the ADMIN_USERS env var (see below). The default
// password is "1234" (shared) and is intended ONLY as a soft-launch placeholder.
// Set ADMIN_USERS in Vercel before going to real prospects.
const DEFAULT_USERS = [
  { email: 'jwc@theaurumcc.com', id: 'jwc' },
  { email: 'tkj@theaurumcc.com', id: 'tkj' },
  { email: 'wsl@theaurumcc.com', id: 'wsl' },
];
const DEFAULT_SHARED_PASSWORD = '1234';

// ---------- Secret used to sign session cookies ----------
let _warnedSecret = false;
const SECRET = () => {
  const s =
    process.env.AURUM_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'aurum-dev-secret-CHANGE-ME-in-production';
  if (!process.env.AURUM_SECRET && !_warnedSecret) {
    console.warn('[aurum] AURUM_SECRET not set — using fallback. Set AURUM_SECRET in production.');
    _warnedSecret = true;
  }
  return s;
};

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fromB64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

// ---------- Token sign / verify ----------
export function signToken(payload, ttlSeconds = 60 * 60 * 12) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const p = b64url(Buffer.from(JSON.stringify(body), 'utf8'));
  const sig = b64url(createHmac('sha256', SECRET()).update(p).digest());
  return `${p}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const i = token.indexOf('.');
  if (i < 0) return null;
  const p = token.slice(0, i);
  const sig = token.slice(i + 1);
  let expected;
  try {
    expected = b64url(createHmac('sha256', SECRET()).update(p).digest());
  } catch { return null; }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let body;
  try { body = JSON.parse(fromB64url(p).toString('utf8')); } catch { return null; }
  if (!body || typeof body.exp !== 'number') return null;
  if (Date.now() / 1000 > body.exp) return null;
  return body;
}

// ---------- Roster loader ----------
//
// Reads ADMIN_USERS env var. Two accepted formats:
//
//   "email:password,email:password,email:password"   (per-user passwords)
//   "email,email,email"                              (uses ADMIN_PASSWORD as shared)
//
// If ADMIN_USERS is not set, falls back to the three @theaurumcc.com defaults
// + (ADMIN_PASSWORD || '1234') as shared.
//
// Returns: [{ email, id, password }]
const WEAK_PASSWORDS = new Set(['1234', 'password', 'admin', 'aurum', '0000', '12345678']);
let _warnedWeakPw = false;

function loadRoster() {
  const raw = (process.env.ADMIN_USERS || '').trim();
  const sharedPw = process.env.ADMIN_PASSWORD || '';
  const isProduction = process.env.VERCEL_ENV === 'production';
  // Soft-launch escape hatch: when DEV_ALLOW_WEAK_AUTH=1, the production weak-password
  // rejection is bypassed. This lets reviewers log in with the dummy "1234" password
  // before real partner credentials are configured. UNSET this before going live with
  // real prospects (or set ADMIN_USERS=email:STRONGPASS,... which makes this moot).
  const allowWeakDev = process.env.DEV_ALLOW_WEAK_AUTH === '1';

  function rejectIfWeak(pw, source) {
    if (allowWeakDev) {
      if (!_warnedWeakPw) {
        console.warn(`[aurum] DEV_ALLOW_WEAK_AUTH=1 — accepting weak password "${pw}" from ${source}. UNSET this before production launch.`);
        _warnedWeakPw = true;
      }
      return false;
    }
    if (isProduction && (WEAK_PASSWORDS.has(pw) || !pw || pw.length < 8)) {
      if (!_warnedWeakPw) {
        console.error(`[aurum] FATAL: weak/missing admin password from ${source}. Set ADMIN_USERS=email:STRONGPASS,... in Vercel env, or DEV_ALLOW_WEAK_AUTH=1 for soft-launch testing. Login is BLOCKED until fixed.`);
        _warnedWeakPw = true;
      }
      return true;
    }
    if (pw && pw.length < 8 && !_warnedWeakPw) {
      console.warn(`[aurum] WARN: admin password from ${source} is < 8 chars.`);
      _warnedWeakPw = true;
    }
    return false;
  }

  if (!raw) {
    const pw = sharedPw || DEFAULT_SHARED_PASSWORD;
    if (rejectIfWeak(pw, 'default fallback')) return [];
    return DEFAULT_USERS.map((u) => ({ ...u, password: pw }));
  }

  const out = [];
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    let email = part;
    let password = '';
    const colon = part.indexOf(':');
    if (colon > 0) {
      email = part.slice(0, colon).trim();
      password = part.slice(colon + 1);
    } else {
      password = sharedPw;
    }
    if (!email) continue;
    if (rejectIfWeak(password, `ADMIN_USERS (${email})`)) continue;
    const id = email.split('@')[0].toLowerCase();
    out.push({ email: email.toLowerCase(), id, password });
  }
  return out;
}

// ---------- Credential check ----------
// Constant-time compare; first match wins. Returns { email, id } on success,
// null on miss.
export function checkAdminCredentials(email, password) {
  if (!email || typeof email !== 'string') return null;
  if (!password || typeof password !== 'string') return null;
  const normEmail = email.trim().toLowerCase();
  const inEmail = Buffer.from(normEmail);
  const inPw = Buffer.from(password);
  const roster = loadRoster();

  // Always iterate the full roster to keep timing flat.
  let matched = null;
  for (const u of roster) {
    const eBuf = Buffer.from(u.email);
    const pBuf = Buffer.from(u.password || '');
    const eEq = eBuf.length === inEmail.length && timingSafeEqual(eBuf, inEmail);
    const pEq = pBuf.length === inPw.length && pBuf.length > 0 && timingSafeEqual(pBuf, inPw);
    if (eEq && pEq && !matched) matched = { email: u.email, id: u.id };
  }
  return matched;
}

// Back-compat: password-only login still resolves to a roster entry.
export function checkAdminPassword(input) {
  if (!input || typeof input !== 'string') return null;
  const inBuf = Buffer.from(input);
  const roster = loadRoster();
  for (let i = 0; i < roster.length; i++) {
    const u = roster[i];
    const pBuf = Buffer.from(u.password || '');
    if (pBuf.length === inBuf.length && pBuf.length > 0 && timingSafeEqual(pBuf, inBuf)) {
      return { email: u.email, id: u.id, partner: i + 1 };
    }
  }
  return null;
}

// ---------- Helpers for codes / IDs ----------
export function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  const seg = (n) => {
    const b = randomBytes(n);
    let out = '';
    for (let i = 0; i < n; i++) out += alphabet[b[i] % alphabet.length];
    return out;
  };
  return `AURUM-${seg(2)}-${seg(4)}-${seg(4)}`;
}

// Same alphabet as generateCode but with the IOI marker so members and partners
// can tell at-a-glance which code they're looking at. Cannot collide with NDA
// access codes because of the literal 'IOI' segment.
export function generateIoiCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n) => {
    const b = randomBytes(n);
    let out = '';
    for (let i = 0; i < n; i++) out += alphabet[b[i] % alphabet.length];
    return out;
  };
  return `AURUM-IOI-${seg(2)}-${seg(4)}-${seg(4)}`;
}

export function generateLeadId() {
  return 'L_' + b64url(randomBytes(8)).slice(0, 11);
}

export function generateNonce() {
  return b64url(randomBytes(16));
}
