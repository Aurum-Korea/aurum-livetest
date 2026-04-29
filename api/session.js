// /api/session?op=me     GET  — check admin session
// /api/session?op=logout POST — clear admin cookie
import { ok, unauthorized, methodNotAllowed, getQuery, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';

export default async function handler(req, res) {
  const op = String(getQuery(req).op || '').toLowerCase();

  // ── op=me ──────────────────────────────────────────────────────────────
  if (op === 'me') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const session = verifyToken(getCookie(req, 'aurum_admin'));
    if (!session || session.sub !== 'admin') return unauthorized(res, 'no session');
    return ok(res, { ok: true, email: session.email || null, id: session.id || null, exp: session.exp });
  }

  // ── op=logout ───────────────────────────────────────────────────────────
  if (op === 'logout') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    res.setHeader('Set-Cookie', 'aurum_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    return ok(res, { ok: true });
  }

  return ok(res, { ok: false, error: 'unknown op' });
}
