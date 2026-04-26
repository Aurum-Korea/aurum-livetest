// Auth — HMAC-signed tokens (cookie payloads) and constant-time password compare.
// Zero deps; uses node:crypto.

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const SECRET = () => {
  const s = process.env.AURUM_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!s) throw new Error('AURUM_SECRET (or ADMIN_PASSWORD) not configured');
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

// Sign a JSON payload. Returns "<b64url(payload)>.<b64url(hmac)>".
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

// Constant-time password compare. Supports a single ADMIN_PASSWORD or
// a comma-separated ADMIN_PASSWORDS list (one per partner — first match wins).
export function checkAdminPassword(input) {
  if (!input || typeof input !== 'string') return null;
  const single = process.env.ADMIN_PASSWORD || '';
  const list = (process.env.ADMIN_PASSWORDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const candidates = list.length ? list : (single ? [single] : []);
  if (!candidates.length) return null;
  const inBuf = Buffer.from(input);
  for (let i = 0; i < candidates.length; i++) {
    const c = Buffer.from(candidates[i]);
    if (c.length === inBuf.length && timingSafeEqual(c, inBuf)) {
      // Return a partner index so the dashboard can show "you are partner N"
      return { partner: i + 1 };
    }
  }
  return null;
}

// Generate a human-friendly invitation code, e.g. "AURUM-K7-A4F2-9XJM"
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

// Short opaque ID for leads: "L_<base32>"
export function generateLeadId() {
  return 'L_' + b64url(randomBytes(8)).slice(0, 11);
}

// One-time nonce for email magic links
export function generateNonce() {
  return b64url(randomBytes(16));
}
