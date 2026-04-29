// POST /api/advisor/login
//
// Authenticates an advisor with email + password.
// Sets aurum_advisor cookie: { sub:'advisor', advisorId, firm }
// 30-day session.
//
// Body: { email: string, password: string }
// Response: { ok:true, advisor:{ id, name, firm, email } }

import { ok, bad, unauthorized, methodNotAllowed, serverError, readBody } from '../_lib/http.js';
import { signToken } from '../_lib/auth.js';
import { findAdvisorByEmail, verifyPassword, safeAdvisor } from '../_lib/advisor-storage.js';
import { setCookie } from '../_lib/http.js';

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days
const COOKIE_NAME = 'aurum_advisor';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const email    = String(body.email    || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!email || !password) return bad(res, 'email and password required');

  // Timing-safe lookup — always run both lookups regardless of outcome
  let advisor = null;
  try { advisor = await findAdvisorByEmail(email); } catch (e) {
    console.error('[advisor/login] lookup', e);
    return serverError(res, 'login failed');
  }

  // Always run verifyPassword to keep timing flat even on miss
  const passwordMatch = advisor
    ? verifyPassword(password, advisor.password_hash || '')
    : (verifyPassword(password, 'a'.repeat(64)), false); // timing decoy

  if (!advisor || !passwordMatch) {
    await new Promise(r => setTimeout(r, 400)); // rate-limit on bad creds
    return unauthorized(res, 'invalid credentials');
  }

  if (advisor.status === 'suspended') return unauthorized(res, 'account suspended');

  // Update last_login_at (best-effort, non-fatal)
  try {
    const { saveAdvisor } = await import('../_lib/advisor-storage.js');
    await saveAdvisor({ ...advisor, last_login_at: new Date().toISOString() });
  } catch {}

  const token = signToken({ sub: 'advisor', advisorId: advisor.id, firm: advisor.firm }, SESSION_TTL);
  setCookie(res, COOKIE_NAME, token, { maxAge: SESSION_TTL, sameSite: 'Lax' });

  return ok(res, { ok: true, advisor: safeAdvisor(advisor) });
}
