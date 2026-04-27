// POST /api/logout — clear admin cookie.
import { ok, methodNotAllowed, clearCookie } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearCookie(res, 'aurum_admin');
  return ok(res, { ok: true });
}
