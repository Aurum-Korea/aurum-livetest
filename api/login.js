// POST /api/login — admin login. Body: { password }
// On success, sets aurum_admin cookie (HMAC-signed, 12-hour TTL).

import { json, ok, bad, unauthorized, methodNotAllowed, readBody, setCookie } from './_lib/http.js';
import { checkAdminPassword, signToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const match = checkAdminPassword(body.password);
  if (!match) {
    // small constant-time delay to dampen brute force
    await new Promise((r) => setTimeout(r, 600));
    return unauthorized(res, 'incorrect password');
  }

  const ttl = 60 * 60 * 12; // 12h
  const token = signToken({ sub: 'admin', partner: match.partner }, ttl);
  setCookie(res, 'aurum_admin', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, partner: match.partner });
}
