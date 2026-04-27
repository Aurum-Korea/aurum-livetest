// GET /api/me — returns admin session info, or 401.
import { ok, unauthorized, methodNotAllowed, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res, 'no session');
  return ok(res, {
    ok: true,
    email: session.email || null,
    id: session.id || null,
    exp: session.exp,
  });
}
