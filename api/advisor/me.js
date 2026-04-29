// GET /api/advisor/me — returns advisor session or 401
import { ok, unauthorized, methodNotAllowed, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const tok = getCookie(req, 'aurum_advisor');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor') return unauthorized(res, 'no session');
  return ok(res, { ok: true, id: session.advisorId, email: session.email, firm: session.firm, name: session.name });
}
