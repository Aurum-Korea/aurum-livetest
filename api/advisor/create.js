// POST /api/advisor/create
//
// Partners create advisor accounts from the admin console.
// Auth: aurum_admin cookie.
//
// Body:
//   name           string  required
//   firm           string  required
//   email          string  required
//   password       string  required (set by partner, communicated to advisor)
//   intro_fee_pct  number  default 1.0  (% of TACC deal allocation on close)
//   carry_pct      number  default 0
//   notes          string
//
// Response: { ok:true, advisor:{...without password_hash} }

import { ok, bad, unauthorized, methodNotAllowed, serverError, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { saveAdvisor, generateAdvisorId, hashPassword, findAdvisorByEmail, safeAdvisor } from '../_lib/advisor-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const name     = String(body.name     || '').trim();
  const firm     = String(body.firm     || '').trim();
  const email    = String(body.email    || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!name)     return bad(res, 'name required');
  if (!firm)     return bad(res, 'firm required');
  if (!email)    return bad(res, 'email required');
  if (!password || password.length < 8) return bad(res, 'password must be at least 8 characters');

  // Prevent duplicate email
  const existing = await findAdvisorByEmail(email).catch(() => null);
  if (existing) return bad(res, `advisor with email ${email} already exists`);

  const now     = new Date().toISOString();
  const advisor = {
    id:             generateAdvisorId(),
    name,
    firm,
    email,
    password_hash:  hashPassword(password),
    intro_fee_pct:  Math.max(0, Number(body.intro_fee_pct ?? 1.0)),
    carry_pct:      Math.max(0, Number(body.carry_pct     ?? 0)),
    notes:          String(body.notes || '').trim(),
    status:         'active',
    created_at:     now,
    created_by:     session.id || 'partner',
    last_login_at:  null,
    updated_at:     now,
  };

  try {
    await saveAdvisor(advisor);
    return ok(res, { ok: true, advisor: safeAdvisor(advisor) });
  } catch (e) {
    console.error('[advisor/create]', e);
    return serverError(res, 'create failed');
  }
}
