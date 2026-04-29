// POST /api/advisor/setup — advisor sets their initial password from welcome link
// GET  /api/advisor/setup?token=<tok> — validate token (returns advisor name/firm for display)
import { ok, bad, unauthorized, methodNotAllowed, readBody, getCookie, setCookie, getQuery } from './http.js';
import { verifyToken, signToken } from './auth.js';
import { getAdvisor, saveAdvisor } from './deal-storage.js';
import crypto from 'node:crypto';

function hashPass(password) {
  const secret = process.env.AURUM_SECRET || 'dev-secret';
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return 'scrypt$' + salt.toString('hex') + '$' + derived.toString('hex');
}

function verifyPass(plain, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  const derived = crypto.scryptSync(plain, salt, 64);
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Validate token — return advisor display info for setup page
    const q = getQuery(req);
    const token = String(q.token || '').trim();
    if (!token) return bad(res, 'missing token');
    const session = verifyToken(token);
    if (!session || session.sub !== 'advisor-setup' || !session.advisorId)
      return unauthorized(res, 'invalid or expired setup link');
    const advisor = await getAdvisor(session.advisorId);
    if (!advisor) return unauthorized(res, 'advisor not found');
    if (advisor.status === 'active' && advisor.password_hash)
      return bad(res, 'already set up — sign in at /login?r=advisor');
    return ok(res, { ok: true, name: advisor.name, firm: advisor.firm, email: advisor.email });
  }

  if (req.method === 'POST') {
    const body     = await readBody(req);
    const token    = String(body.token || '').trim();
    const password = String(body.password || '');
    const confirm  = String(body.confirm || '');

    if (!token)    return bad(res, 'missing token');
    if (!password || password.length < 8) return bad(res, 'password must be at least 8 characters');
    if (password !== confirm) return bad(res, 'passwords do not match');

    const session = verifyToken(token);
    if (!session || session.sub !== 'advisor-setup' || !session.advisorId)
      return unauthorized(res, 'invalid or expired setup link');

    const advisor = await getAdvisor(session.advisorId);
    if (!advisor) return unauthorized(res, 'advisor not found');

    // One-time JTI check
    const jti = `${session.iat}:${session.n}:${session.exp}`;
    advisor.consumed_setup_links = advisor.consumed_setup_links || [];
    if (advisor.consumed_setup_links.includes(jti))
      return unauthorized(res, 'setup link already used — sign in at /login?r=advisor');
    advisor.consumed_setup_links.push(jti);
    if (advisor.consumed_setup_links.length > 10)
      advisor.consumed_setup_links = advisor.consumed_setup_links.slice(-10);

    advisor.password_hash = hashPass(password);
    advisor.password_set_at = Date.now();
    advisor.status = 'active';
    await saveAdvisor(advisor);

    // Issue advisor cookie immediately
    const tok = signToken({ sub: 'advisor', advisorId: advisor.id, email: advisor.email }, 60 * 60 * 12);
    setCookie(res, 'aurum_advisor', tok, { maxAge: 60 * 60 * 12, sameSite: 'Lax' });

    return ok(res, { ok: true, redirect: '/advisor' });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
