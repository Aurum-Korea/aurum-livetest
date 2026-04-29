// GET /api/advisor/me — return session or 401
// Accepts both aurum_advisor AND aurum_admin cookies so partners can
// preview the advisor portal without a separate login.
import { ok, unauthorized, methodNotAllowed, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { getAdvisor } from './deal-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // Path 1 — admin cookie (partner previewing advisor portal)
  const adminTok = getCookie(req, 'aurum_admin');
  const adminSess = verifyToken(adminTok);
  if (adminSess && adminSess.sub === 'admin') {
    return ok(res, {
      ok: true,
      role: 'admin',
      advisor: {
        id:    'partner',
        name:  adminSess.id || 'Partner',
        firm:  'Aurum Century Club',
        email: adminSess.email || '',
        status:'active',
      },
      email: adminSess.email || '',
    });
  }

  // Path 2 — advisor cookie
  const tok     = getCookie(req, 'aurum_advisor');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor') return unauthorized(res);
  const advisor = await getAdvisor(session.advisorId);
  if (!advisor || advisor.status !== 'active') return unauthorized(res);
  const { password_hash, ...safe } = advisor;
  return ok(res, { ok: true, role: 'advisor', advisor: safe, email: advisor.email });
}
