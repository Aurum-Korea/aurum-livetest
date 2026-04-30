// /api/login — multi-op dispatcher.
//   POST              admin login (email + password) → aurum_admin cookie
//   POST ?op=member-login          member email + password → aurum_access cookie (post-admission)
//   POST ?op=magic-request         member magic-link request → emails one-time link
//   POST ?op=password-setup        member with one-time setup token sets initial password
//   POST ?op=password-reset-request   member requests reset code by email
//   POST ?op=password-reset-confirm   member submits code + new password
// Magic-link consumption happens at /api/verify-code?ml=<token> (GET).

import { ok, bad, unauthorized, methodNotAllowed, readBody, setCookie, getQuery } from './_lib/http.js';
import { checkAdminCredentials, checkAdminPassword, signToken, verifyToken } from './_lib/auth.js';
import { findLeadByEmail, getLead, saveLead } from './_lib/storage.js';
import { sendRaw, buildMagicLinkEmail, buildPasswordResetEmail, partnerEmailsOff } from './_lib/email.js';
import { createHmac, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';

export default async function handler(req, res) {
  const op = (getQuery(req).op || '').toLowerCase();
  if (op === 'magic-request') return opMagicRequest(req, res);
  if (op === 'member-login') return opMemberLogin(req, res);
  if (op === 'password-setup') return opPasswordSetup(req, res);
  if (op === 'password-reset-request') return opPasswordResetRequest(req, res);
  if (op === 'password-reset-confirm') return opPasswordResetConfirm(req, res);
  return opAdminLogin(req, res);
}

// ── Helpers ─────────────────────────────────────────────────────
// scrypt password hashing — Node-native, no dependency
function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64);
  return 'scrypt$' + salt.toString('hex') + '$' + derived.toString('hex');
}
function verifyPassword(plain, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  const derived = scryptSync(plain, salt, 64);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
function generateResetCode() {
  // 6-digit numeric code — easy to type, low collision space (1M),
  // mitigated by 15-min expiry + rate limiting.
  const digits = '0123456789';
  let out = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) out += digits[bytes[i] % 10];
  return out;
}
async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function opAdminLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const email = body && typeof body.email === 'string' ? body.email : '';
  const password = body && typeof body.password === 'string' ? body.password : '';

  let match = null;
  if (email) {
    match = checkAdminCredentials(email, password);
  } else if (password) {
    match = checkAdminPassword(password);
  }

  if (!match) {
    await sleep(600);
    return unauthorized(res, 'incorrect email or password');
  }

  const ttl = 60 * 60 * 12; // 12h
  const token = signToken({ sub: 'admin', email: match.email, id: match.id }, ttl);
  setCookie(res, 'aurum_admin', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, email: match.email, id: match.id });
}

// ── Member email+password login ─────────────────────────────────
// Body: { email, password }
// Only works for admitted members who have set a password (post-wire).
async function opMemberLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const email = String((body && body.email) || '').trim().toLowerCase();
  const password = String((body && body.password) || '');
  if (!email || !password) {
    await sleep(400);
    return unauthorized(res, 'email and password required');
  }

  let lead = null;
  try { lead = await findLeadByEmail(email); } catch {}
  if (!lead || !lead.password_hash || !verifyPassword(password, lead.password_hash)) {
    await sleep(600);
    return unauthorized(res, 'incorrect email or password');
  }

  // Issue member cookie. Note: scope is 'member' (same as code-based session)
  // so all member-gated surfaces work.
  const ttl = 60 * 60 * 24 * 30; // 30 days
  const token = signToken(
    { sub: 'member', leadId: lead.id, code: lead.code || '', login: 'pw' },
    ttl
  );
  setCookie(res, 'aurum_access', token, { maxAge: ttl, sameSite: 'Lax' });
  try {
    lead.audit = lead.audit || [];
    lead.audit.push({ at: Date.now(), actor: 'member', action: 'pw_login' });
    lead.last_login_at = Date.now();
    await saveLead(lead);
  } catch {}
  return ok(res, { ok: true, leadId: lead.id, next: '/portfolio' });
}

// ── Password setup (first-time, after admission) ────────────────
// Body: { ml: <signed setup token>, password: <new pw>, confirm: <same> }
// Token was issued by api/admin/update.js when partner marked wire as cleared.
// On success: stores password hash, REVOKES the access code (option B), sets
// aurum_access cookie, returns redirect to /portfolio.
async function opPasswordSetup(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const ml = String((body && body.ml) || '').trim();
  const password = String((body && body.password) || '');
  const confirm = String((body && body.confirm) || '');

  if (!ml) return bad(res, 'missing setup token');
  if (!password || password.length < 8) return bad(res, 'password must be at least 8 characters');
  if (password !== confirm) return bad(res, 'passwords do not match');

  const session = verifyToken(ml);
  if (!session || session.sub !== 'pw-setup' || !session.leadId) {
    return unauthorized(res, 'setup link is invalid or expired — request a new one from a partner');
  }

  let lead = null;
  try { lead = await getLead(session.leadId); } catch {}
  if (!lead) return unauthorized(res, 'member not found');

  // One-time consumption — track JTI to prevent reuse
  const jti = `${session.iat || ''}:${session.n || ''}:${session.exp || ''}`;
  lead.consumed_setup_links = lead.consumed_setup_links || [];
  if (lead.consumed_setup_links.includes(jti)) {
    return unauthorized(res, 'setup link already used — log in at /login');
  }
  lead.consumed_setup_links.push(jti);
  if (lead.consumed_setup_links.length > 20) lead.consumed_setup_links = lead.consumed_setup_links.slice(-20);

  // Store password hash, revoke code (option B per architecture)
  lead.password_hash = hashPassword(password);
  lead.password_set_at = Date.now();
  lead.code_revoked = true;
  lead.code_revoked_reason = 'password_set';
  lead.audit = lead.audit || [];
  lead.audit.push({ at: Date.now(), actor: 'member', action: 'password_set' });
  try { await saveLead(lead); } catch (e) {
    console.error('[password-setup] saveLead failed', e);
    return bad(res, 'could not save password — please try again');
  }

  // Set member cookie immediately so they go straight to /portfolio
  const ttl = 60 * 60 * 24 * 30;
  const token = signToken(
    { sub: 'member', leadId: lead.id, code: lead.code || '', login: 'pw' },
    ttl
  );
  setCookie(res, 'aurum_access', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, redirect: '/portfolio' });
}

// ── Password reset — request a code by email ────────────────────
// Body: { email }
// Always returns sent:true to avoid email-enumeration.
async function opPasswordResetRequest(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const email = String((body && body.email) || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await sleep(400);
    return ok(res, { ok: true, sent: true });
  }

  let lead = null;
  try { lead = await findLeadByEmail(email); } catch {}

  // Only members who have set a password get a reset code. Others silently no-op.
  if (lead && lead.password_hash) {
    const code = generateResetCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    lead.password_reset_code_hash = createHmac('sha256', process.env.AURUM_SECRET || 'dev-secret').update(code).digest('hex');
    lead.password_reset_expires_at = expiresAt;
    lead.password_reset_attempts = 0;
    lead.audit = lead.audit || [];
    lead.audit.push({ at: Date.now(), actor: 'system', action: 'password_reset_requested' });
    try { await saveLead(lead); } catch (e) { console.warn('[reset-request] save err', e); }

    try {
      const tpl = buildPasswordResetEmail({ lead, resetCode: code });
      await sendRaw({
        to: lead.email,
        subject: tpl.subject, html: tpl.html, text: tpl.text,
        replyTo: process.env.REPLY_TO || undefined,
      });
    } catch (e) { console.warn('[reset-request] send err', e); }
  } else {
    await sleep(400);
  }

  return ok(res, { ok: true, sent: true });
}

// ── Password reset — confirm code + set new password ────────────
// Body: { email, code (6 digits), password, confirm }
async function opPasswordResetConfirm(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const email = String((body && body.email) || '').trim().toLowerCase();
  const code = String((body && body.code) || '').trim();
  const password = String((body && body.password) || '');
  const confirm = String((body && body.confirm) || '');

  if (!email || !code || !password) return bad(res, 'email, code, and new password required');
  if (password.length < 8) return bad(res, 'password must be at least 8 characters');
  if (password !== confirm) return bad(res, 'passwords do not match');

  let lead = null;
  try { lead = await findLeadByEmail(email); } catch {}
  if (!lead || !lead.password_reset_code_hash || !lead.password_reset_expires_at) {
    await sleep(600);
    return unauthorized(res, 'no pending reset — request a new code');
  }
  if (Date.now() > lead.password_reset_expires_at) {
    await sleep(400);
    return unauthorized(res, 'reset code has expired — request a new one');
  }
  if ((lead.password_reset_attempts || 0) >= 5) {
    await sleep(400);
    return unauthorized(res, 'too many failed attempts — request a new code');
  }

  const expectedHash = createHmac('sha256', process.env.AURUM_SECRET || 'dev-secret').update(code).digest('hex');
  const a = Buffer.from(lead.password_reset_code_hash);
  const b = Buffer.from(expectedHash);
  const codeMatches = a.length === b.length && timingSafeEqual(a, b);

  if (!codeMatches) {
    lead.password_reset_attempts = (lead.password_reset_attempts || 0) + 1;
    try { await saveLead(lead); } catch {}
    await sleep(600);
    return unauthorized(res, 'incorrect reset code');
  }

  // Code valid — set new password, clear reset state, revoke any old code
  lead.password_hash = hashPassword(password);
  lead.password_set_at = Date.now();
  delete lead.password_reset_code_hash;
  delete lead.password_reset_expires_at;
  delete lead.password_reset_attempts;
  lead.audit = lead.audit || [];
  lead.audit.push({ at: Date.now(), actor: 'member', action: 'password_reset_completed' });
  try { await saveLead(lead); } catch (e) {
    console.error('[reset-confirm] save err', e);
    return bad(res, 'could not save password — try again');
  }

  // Issue cookie immediately
  const ttl = 60 * 60 * 24 * 30;
  const token = signToken(
    { sub: 'member', leadId: lead.id, code: lead.code || '', login: 'pw' },
    ttl
  );
  setCookie(res, 'aurum_access', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, redirect: '/portfolio' });
}

// ── Magic link request ──────────────────────────────────────────
// Body: { email }
// Always returns 200 with sent: true to avoid leaking which emails are registered.
async function opMagicRequest(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const email = String((body && body.email) || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await sleep(400);
    return ok(res, { ok: true, sent: true });
  }

  let lead = null;
  try { lead = await findLeadByEmail(email); } catch (e) { console.warn('[magic] findLeadByEmail err', e); }

  if (lead && !lead.code_revoked && lead.email) {
    const ttl = 15 * 60; // 15 minutes
    const ml = signToken(
      { sub: 'magic', leadId: lead.id, email: lead.email, n: Math.random().toString(36).slice(2) },
      ttl
    );
    const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
    const linkUrl = `${siteUrl}/api/verify-code?ml=${encodeURIComponent(ml)}`;
    try {
      const tpl = buildMagicLinkEmail({ lead, linkUrl });
      await sendRaw({
        to: lead.email,
        subject: tpl.subject, html: tpl.html, text: tpl.text,
        replyTo: process.env.REPLY_TO || undefined,
      });
      try {
        lead.audit = lead.audit || [];
        lead.audit.push({ at: Date.now(), actor: 'system', action: 'magic_link_sent' });
        await saveLead(lead);
      } catch {}
    } catch (e) { console.warn('[magic] send err', e); }
  } else {
    await sleep(400);
  }

  return ok(res, { ok: true, sent: true });
}
