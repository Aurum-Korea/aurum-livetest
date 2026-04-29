// POST /api/deals/create
//
// Creates a new deal. Partners create deals from the console;
// in Phase 2 advisors will also call this via /api/advisor/deals/submit.
//
// Body (all fields except name are optional):
//   name              string   required
//   type              string   'pe' | 'credit' | 're' | 'infra' | 'equity'  default 'pe'
//   stage             string   default 'review'
//   advisor_firm      string
//   advisor_id        string   (Phase 2: linked advisor account)
//   target_alloc_usd  number
//   target_irr        number
//   term_months       number
//   funding_source    string   'ltv' | 'reserve'  default 'ltv'
//   notes             string
//   gate_notes        string
//   next_action       string
//   health            string   'green' | 'amber' | 'red'  default 'green'
//
// Response:
//   { ok: true, deal: Deal }
//
// Auth: aurum_admin cookie

import { ok, bad, unauthorized, methodNotAllowed, serverError, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { saveDeal, generateDealId } from '../_lib/deal-storage.js';

const VALID_TYPES   = new Set(['pe', 'credit', 're', 'infra', 'equity']);
const VALID_STAGES  = new Set(['review', 'live', 'ioi', 'dd', 'terms', 'close', 'realized', 'killed']);
const VALID_HEALTH  = new Set(['green', 'amber', 'red']);
const VALID_SOURCES = new Set(['ltv', 'reserve']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const name = String(body.name || '').trim();
  if (!name) return bad(res, 'name is required');

  const now   = new Date().toISOString();
  const stage = VALID_STAGES.has(body.stage) ? body.stage : 'review';

  const deal = {
    id:               generateDealId(),
    name,
    type:             VALID_TYPES.has(body.type) ? body.type : 'pe',
    stage,
    advisor_id:       String(body.advisor_id || '').trim() || null,
    advisor_firm:     String(body.advisor_firm || '').trim(),
    target_alloc_usd: Math.max(0, Number(body.target_alloc_usd) || 0),
    target_irr:       body.target_irr != null ? Math.max(0, Number(body.target_irr)) : null,
    term_months:      body.term_months != null ? Math.max(1, Math.round(Number(body.term_months))) : null,
    funding_source:   VALID_SOURCES.has(body.funding_source) ? body.funding_source : 'ltv',
    ioi_count:        0,
    ioi_agg_usd:      0,
    gate_status:      'open',
    gate_notes:       String(body.gate_notes || '').trim(),
    next_action:      String(body.next_action || '').trim(),
    health:           VALID_HEALTH.has(body.health) ? body.health : 'green',
    deployed_usd:     0,
    notes:            String(body.notes || '').trim(),
    qa:               [],
    created_at:       now,
    stage_entered_at: now,
    funded_at:        null,
    closed_at:        null,
    created_by:       session.id || 'partner',
    updated_at:       now,
  };

  try {
    await saveDeal(deal);
    return ok(res, { ok: true, deal });
  } catch (err) {
    console.error('[deals/create]', err);
    return serverError(res, 'failed to create deal');
  }
}
