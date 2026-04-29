// POST /api/advisor/login — advisor email + password → aurum_advisor cookie
import { ok, bad, methodNotAllowed, readBody, setCookie } from './http.js';
import { signToken } from './auth.js';
import { getAdvisorByEmail } from './deal-storage.js';
import crypto from 'crypto';

function hashPass(password) {
  const secret = process.env.AURUM_SECRET || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const body     = await readBody(req);
  const email    = String(body.email    || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  if (!email || !password) return bad(res, 'email and password required');

  const advisor = await getAdvisorByEmail(email);
  if (!advisor || advisor.status !== 'active')
    return bad(res, 'invalid credentials');

  const expected = hashPass(password);
  // Constant-time comparison
  const actual   = Buffer.from(advisor.password_hash || '', 'hex');
  const attempt  = Buffer.from(expected, 'hex');
  if (actual.length !== attempt.length || !crypto.timingSafeEqual(actual, attempt))
    return bad(res, 'invalid credentials');

  const tok = signToken({ sub:'advisor', advisorId:advisor.id, email:advisor.email }, 60*60*12); // 12h
  setCookie(res, 'aurum_advisor', tok, { httpOnly:true, sameSite:'Lax', maxAge:60*60*12 });

  const { password_hash, ...safe } = advisor;
  return ok(res, { ok:true, advisor:safe });
}
