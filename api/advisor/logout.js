import { ok, methodNotAllowed } from '../_lib/http.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  res.setHeader('Set-Cookie', 'aurum_advisor=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return ok(res, { ok: true });
}
