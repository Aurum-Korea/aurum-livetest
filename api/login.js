// POST /api/login — admin login.
// Body: { email, password }   (or legacy { password } — back-compat)
// On success, sets aurum_admin cookie (HMAC-signed, 12-hour TTL).

import { ok, bad, unauthorized, methodNotAllowed, readBody, setCookie } from './_lib/http.js';
import { checkAdminCredentials, checkAdminPassword, signToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const email = body && typeof body.email === 'string' ? body.email : '';
  const password = body && typeof body.password === 'string' ? body.password : '';

  let match = null;
  if (email) {
    match = checkAdminCredentials(email, password);
  } else if (password) {
    // Legacy: password-only. Resolves to first roster entry with that pw.
    match = checkAdminPassword(password);
  }

  if (!match) {
    // Constant-time delay to dampen brute force.
    await new Promise((r) => setTimeout(r, 600));
    return unauthorized(res, 'incorrect email or password');
  }

  const ttl = 60 * 60 * 12; // 12h
  const token = signToken(
    { sub: 'admin', email: match.email, id: match.id },
    ttl
  );
  setCookie(res, 'aurum_admin', token, { maxAge: ttl, sameSite: 'Lax' });
  return ok(res, { ok: true, email: match.email, id: match.id });
}
