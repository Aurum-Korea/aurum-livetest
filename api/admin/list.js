// GET /api/admin/list — list all leads, sorted newest-first.
// Returns { leads, stats }.

import { ok, unauthorized, methodNotAllowed, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { listLeads } from '../_lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  const leads = await listLeads(1000);
  const stats = computeStats(leads);

  return ok(res, { ok: true, leads, stats });
}

function computeStats(leads) {
  const out = {
    total: leads.length,
    new: 0, reviewing: 0, approved: 0, declined: 0, sent: 0,
    by_tier: { '250k_500k': 0, '500k_2m': 0, '2m_5m': 0, '5m_plus': 0 },
    by_country: {},
    last_24h: 0, last_7d: 0,
  };
  const now = Date.now();
  for (const l of leads) {
    out[l.status] = (out[l.status] || 0) + 1;
    if (l.wealth) out.by_tier[l.wealth] = (out.by_tier[l.wealth] || 0) + 1;
    if (l.country) out.by_country[l.country] = (out.by_country[l.country] || 0) + 1;
    const age = now - (l.submitted_at_ms || 0);
    if (age < 24 * 3600 * 1000) out.last_24h++;
    if (age < 7 * 24 * 3600 * 1000) out.last_7d++;
  }
  return out;
}
