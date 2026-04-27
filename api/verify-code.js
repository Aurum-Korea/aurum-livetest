// POST /api/verify-code — validates an invitation code and sets a short-lived
// access cookie. Body: { code }
// Also supports GET /api/verify-code?c=XXX for the email magic-link flow.

import { json, ok, bad, unauthorized, getQuery, readBody, setCookie, getCookie } from './_lib/http.js';
import { signToken, verifyToken } from './_lib/auth.js';
import { getLead, leadIdForCode, saveLead } from './_lib/storage.js';

export default async function handler(req, res) {
  let code = '';
  if (req.method === 'POST') {
    try { const body = await readBody(req); code = String(body.code || '').trim().toUpperCase(); }
    catch { return bad(res, 'invalid body'); }
  } else if (req.method === 'GET') {
    code = String(getQuery(req).c || '').trim().toUpperCase();
  } else {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'method not allowed' });
  }

  if (!code) return bad(res, 'missing code');

  const leadId = await leadIdForCode(code);
  if (!leadId) {
    await new Promise((r) => setTimeout(r, 400)); // soft rate-limit
    return unauthorized(res, 'invalid code');
  }
  const lead = await getLead(leadId);
  if (!lead) return unauthorized(res, 'invalid code');
  if (lead.code_revoked) return unauthorized(res, 'code revoked');
  if (lead.code !== code) return unauthorized(res, 'code mismatch');

  // Log first opens to the audit trail (max once per session-day, to keep audit clean)
  const now = Date.now();
  const session = verifyToken(getCookie(req, 'aurum_access'));
  const alreadyHasAccess = session?.leadId === lead.id;
  if (!alreadyHasAccess) {
    lead.audit = lead.audit || [];
    lead.audit.push({ at: now, actor: 'member', action: 'opened', code });
    lead.last_opened_at = now;
    lead.opens = (lead.opens || 0) + 1;
    try { await saveLead(lead); } catch {}
  }

  // Issue a 30-day access cookie
  const ttl = 60 * 60 * 24 * 30;
  const token = signToken({ sub: 'member', leadId: lead.id, code }, ttl);
  setCookie(res, 'aurum_access', token, { maxAge: ttl, sameSite: 'Lax' });

  // Strip sensitive fields before returning
  const safe = {
    name: lead.name, name_ko: lead.name_ko, email: lead.email,
    issued_at: lead.code_issued_at,
  };

  return ok(res, { ok: true, lead: safe });
}
