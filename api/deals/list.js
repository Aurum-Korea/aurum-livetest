// GET /api/deals/list
//
// Returns all deals from the deals:index sorted set, newest first.
// Optionally filter by stage or advisor_id via query params.
//
// Query params (all optional):
//   stage        = 'review' | 'live' | 'ioi' | 'dd' | 'terms' | 'close' | 'realized' | 'killed' | 'all'
//   advisor_id   = string
//   limit        = number (default 200)
//
// Response:
//   { ok: true, deals: Deal[], count: number }
//
// Auth: aurum_admin cookie (same as /api/admin/list)

import { ok, unauthorized, methodNotAllowed, serverError, getCookie, getQuery } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { listDeals, daysInStage } from '../_lib/deal-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  try {
    const q = getQuery(req);
    const limit     = Math.min(500, Math.max(1, parseInt(q.limit || '200', 10) || 200));
    const stageFilter   = q.stage && q.stage !== 'all' ? q.stage : null;
    const advisorFilter = q.advisor_id || null;

    let deals = await listDeals(limit);

    // Apply filters
    if (stageFilter)   deals = deals.filter((d) => d.stage === stageFilter);
    if (advisorFilter) deals = deals.filter((d) => d.advisor_id === advisorFilter);

    // Hydrate computed fields that shouldn't be stored (always fresh)
    deals = deals.map((d) => ({
      ...d,
      days_in_stage: daysInStage(d),
    }));

    return ok(res, { ok: true, deals, count: deals.length });
  } catch (err) {
    console.error('[deals/list]', err);
    return serverError(res, 'failed to list deals');
  }
}
