// GET /api/deals — member-facing: returns live deals this member can see
// Auth: aurum_access cookie (member session)
import { ok, unauthorized, methodNotAllowed, getCookie, getQuery } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { listDeals } from './_lib/deal-storage.js';
import { getLead } from './_lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok     = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) return unauthorized(res);

  const lead = await getLead(session.leadId).catch(()=>null);
  if (!lead || lead.status !== 'admitted') return unauthorized(res);

  const all = await listDeals();

  // Filter to deals the member can see:
  //   - stage must be 'live' or beyond (not 'review', not 'declined')
  //   - visible_to must be 'all' OR include this lead's id
  const LIVE_STAGES = new Set(['live','ioi','dd','terms','close']);
  const visible = all.filter(d => {
    if (!LIVE_STAGES.has(d.stage)) return false;
    if (d.visible_to === 'all') return true;
    if (Array.isArray(d.visible_to)) return d.visible_to.includes(lead.id);
    return false;
  });

  // Check which deals this member has already indicated interest in
  const indicatedIds = new Set(visible
    .filter(d => (d.iois||[]).some(i => i.lead_id === lead.id))
    .map(d => d.id));

  // Return member-safe shape — no GP identity, no internal IOI names
  const deals = visible.map(d => ({
    id:          d.id,
    name:        d.name,
    ac:          d.ac,
    stage:       d.stage,
    raise_usd:   d.raise_usd,
    ret:         d.ret,
    hold:        d.hold,
    vehicle:     d.vehicle,
    sector:      d.sector,
    geo:         d.geo,
    ioi_count:   (d.iois||[]).length,
    fill_pct:    d.alloc_usd && d.raise_usd
                   ? Math.min(100, Math.round(d.alloc_usd / d.raise_usd * 100))
                   : 0,
    alloc_usd:   d.alloc_usd||0,
    indicated:   indicatedIds.has(d.id),
    qa:          (d.qa||[]).filter(q=>q.published),
    created_at:  d.created_at,
  }));

  return ok(res, { deals });
}
