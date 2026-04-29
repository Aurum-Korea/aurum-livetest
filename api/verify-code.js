// /api/verify-code — three modes:
//   POST { code }                  — manual code entry, returns JSON
//   GET  ?c=XXX                    — code magic link from email, returns JSON
//   GET  ?ml=<signed_token>        — passwordless magic link (Path B), redirects to /customer

import { json, ok, bad, unauthorized, getQuery, readBody, setCookie, getCookie } from './_lib/http.js';
import { signToken, verifyToken } from './_lib/auth.js';
import { getLead, leadIdForCode, saveLead } from './_lib/storage.js';
import { extractGeo } from './_lib/geo.js';

const ACCESS_TTL = 60 * 60 * 24 * 30; // 30 days

export default async function handler(req, res) {
  if (req.method === 'GET' && getQuery(req).ml) {
    return handleMagicLink(req, res);
  }

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
    await new Promise((r) => setTimeout(r, 400));
    return unauthorized(res, 'invalid code');
  }
  const lead = await getLead(leadId);
  if (!lead) return unauthorized(res, 'invalid code');
  if (lead.code_revoked) return unauthorized(res, 'code revoked');
  if (lead.code !== code) return unauthorized(res, 'code mismatch');

  await logOpen(req, lead, 'opened', code);
  setAccessCookie(res, lead.id, code);

  // Route to the right surface based on lead state:
  //   wire cleared → /customer (admitted member, post-launch view)
  //   NDA approved → /memo (materials hub for review pre-IOI)
  //   else → /main (read marketing pitch, then continue to NDA)
  let nextPath = '/main';
  if (lead.wire && lead.wire.cleared_at) nextPath = '/customer';
  else if (lead.nda_state === 'approved') nextPath = '/memo';

  const safe = { name: lead.name, name_ko: lead.name_ko, email: lead.email, issued_at: lead.code_issued_at };
  return ok(res, { ok: true, lead: safe, next_path: nextPath });
}

async function handleMagicLink(req, res) {
  const ml = String(getQuery(req).ml || '');
  if (!ml) return redirectToLogin(res, 'missing-link');

  const session = verifyToken(ml);
  if (!session || session.sub !== 'magic' || !session.leadId) {
    return redirectToLogin(res, 'expired');
  }

  const lead = await getLead(session.leadId);
  if (!lead) return redirectToLogin(res, 'not-found');
  if (lead.code_revoked) return redirectToLogin(res, 'revoked');
  if (!lead.code) return redirectToLogin(res, 'no-access');

  const jti = `${session.iat || ''}:${session.n || ''}:${session.exp || ''}`;
  lead.consumed_magic_links = lead.consumed_magic_links || [];
  if (lead.consumed_magic_links.includes(jti)) {
    return redirectToLogin(res, 'already-used');
  }
  lead.consumed_magic_links.push(jti);
  if (lead.consumed_magic_links.length > 50) {
    lead.consumed_magic_links = lead.consumed_magic_links.slice(-50);
  }

  await logOpen(req, lead, 'magic_link_opened', lead.code);
  setAccessCookie(res, lead.id, lead.code);

  // State-aware redirect: same logic as code-entry path.
  //   wire cleared → /customer
  //   NDA approved → /memo
  //   else → /main (read marketing, then continue to NDA)
  let target = '/main';
  if (lead.wire && lead.wire.cleared_at) target = '/customer';
  else if (lead.nda_state === 'approved') target = '/memo';

  res.statusCode = 302;
  res.setHeader('Location', target);
  res.end();
}

function redirectToLogin(res, err) {
  res.statusCode = 302;
  res.setHeader('Location', `/login?err=${encodeURIComponent(err)}`);
  res.end();
}

async function logOpen(req, lead, action, code) {
  const now = Date.now();
  const session = verifyToken(getCookie(req, 'aurum_access'));
  const already = session?.leadId === lead.id;
  if (!already) {
    const geo = extractGeo(req);
    lead.audit = lead.audit || [];
    lead.audit.push({ at: now, actor: 'member', action, code, geo });
    lead.last_opened_at = now;
    lead.opens = (lead.opens || 0) + 1;
  }
  try { await saveLead(lead); } catch {}
}

function setAccessCookie(res, leadId, code) {
  const token = signToken({ sub: 'member', leadId, code }, ACCESS_TTL);
  setCookie(res, 'aurum_access', token, { maxAge: ACCESS_TTL, sameSite: 'Lax' });
}
