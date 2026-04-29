// POST /api/advisor/logout
import { ok, methodNotAllowed, setCookie } from './http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  setCookie(res, 'aurum_advisor', '', { httpOnly:true, sameSite:'Lax', maxAge:0 });
  return ok(res, { ok:true });
}
