// /api/login — multi-op dispatcher.
//   Default (POST, no op):       admin login (email + password) → aurum_admin cookie
//   POST ?op=magic-request:      member magic-link request → emails one-time link
// Magic-link consumption happens at /api/verify-code?ml=<token> (GET).

import { ok, bad, unauthorized, methodNotAllowed, readBody, setCookie, getQuery } from './_lib/http.js';
import { checkAdminCredentials, checkAdminPassword, signToken } from './_lib/auth.js';
import { findLeadByEmail, saveLead } from './_lib/storage.js';
import { sendRaw, buildMagicLinkEmail } from './_lib/email.js';

export default async function handler(req, res) {
  const op = (getQuery(req).op || '').toLowerCase();
  if (op === 'magic-request') return opMagicRequest(req, res);
  return opAdminLogin(req, res);
}

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
    await new Promise((r) => setTimeout(r, 600));
    return unauthorized(res, 'incorrect email or password');
  }

  const ttl = 60 * 60 * 12; // 12h
  const token = signToken({ sub: 'admin', email: match.email, id: match.id }, ttl);
  setCookie(res, 'aurum_admin', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, email: match.email, id: match.id });
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
    await new Promise((r) => setTimeout(r, 400));
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
    await new Promise((r) => setTimeout(r, 400));
  }

  return ok(res, { ok: true, sent: true });
}
