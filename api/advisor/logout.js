// POST /api/advisor/logout — clears aurum_advisor session cookie.
import { ok, methodNotAllowed, clearCookie } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearCookie(res, 'aurum_advisor');
  return ok(res, { ok: true });
}
