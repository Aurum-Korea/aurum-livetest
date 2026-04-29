// POST /api/deals/update
//
// Updates an existing deal. Handles both field-level patches and
// stage transitions. All fields are optional except 'id'.
//
// Body:
//   id                string   required
//   --- Field patches (any combination) ---
//   name              string
//   type              string
//   advisor_firm      string
//   advisor_id        string|null
//   target_alloc_usd  number
//   target_irr        number
//   term_months       number
//   funding_source    'ltv' | 'reserve'
//   ioi_count         number
//   ioi_agg_usd       number
//   gate_status       'open' | 'blocked' | 'stalled'
//   gate_notes        string
//   next_action       string
//   health            'green' | 'amber' | 'red'
//   deployed_usd      number
//   notes             string
//   funded_at         string (ISO) | null
//   --- Stage transition ---
//   stage             string   triggers transitionStage() + stage_entered_at reset
//   --- Q&A thread entry ---
//   qa_message        string   appended to deal.qa with partner attribution
//
// Response:
//   { ok: true, deal: Deal }
//
// Auth: aurum_admin cookie

import { ok, bad, unauthorized, notFound, methodNotAllowed, serverError, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getDeal, saveDeal, transitionStage, daysInStage } from '../_lib/deal-storage.js';

const VALID_TYPES      = new Set(['pe', 'credit', 're', 'infra', 'equity']);
const VALID_STAGES     = new Set(['review', 'live', 'ioi', 'dd', 'terms', 'close', 'realized', 'killed']);
const VALID_HEALTH     = new Set(['green', 'amber', 'red']);
const VALID_GATE_ST    = new Set(['open', 'blocked', 'stalled']);
const VALID_SOURCES    = new Set(['ltv', 'reserve']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const id = String(body.id || '').trim();
  if (!id) return bad(res, 'id is required');

  let deal;
  try { deal = await getDeal(id); } catch (err) {
    console.error('[deals/update] getDeal', err);
    return serverError(res, 'storage error');
  }
  if (!deal) return notFound(res, `deal ${id} not found`);

  // ── Field patches ────────────────────────────────────────────────────────
  if (body.name              != null) deal.name              = String(body.name).trim();
  if (VALID_TYPES.has(body.type))     deal.type              = body.type;
  if (body.advisor_firm      != null) deal.advisor_firm      = String(body.advisor_firm).trim();
  if (body.advisor_id        !== undefined) deal.advisor_id  = body.advisor_id || null;
  if (body.target_alloc_usd  != null) deal.target_alloc_usd = Math.max(0, Number(body.target_alloc_usd) || 0);
  if (body.target_irr        != null) deal.target_irr       = Math.max(0, Number(body.target_irr));
  if (body.term_months       != null) deal.term_months      = Math.max(1, Math.round(Number(body.term_months)));
  if (VALID_SOURCES.has(body.funding_source)) deal.funding_source = body.funding_source;
  if (body.ioi_count         != null) deal.ioi_count        = Math.max(0, Math.round(Number(body.ioi_count) || 0));
  if (body.ioi_agg_usd       != null) deal.ioi_agg_usd      = Math.max(0, Number(body.ioi_agg_usd) || 0);
  if (VALID_GATE_ST.has(body.gate_status)) deal.gate_status  = body.gate_status;
  if (body.gate_notes        != null) deal.gate_notes       = String(body.gate_notes).trim();
  if (body.next_action       != null) deal.next_action      = String(body.next_action).trim();
  if (VALID_HEALTH.has(body.health))  deal.health           = body.health;
  if (body.deployed_usd      != null) deal.deployed_usd     = Math.max(0, Number(body.deployed_usd) || 0);
  if (body.notes             != null) deal.notes            = String(body.notes).trim();
  if (body.funded_at         !== undefined) deal.funded_at  = body.funded_at || null;

  // ── Stage transition ─────────────────────────────────────────────────────
  if (body.stage && VALID_STAGES.has(body.stage) && body.stage !== deal.stage) {
    deal = transitionStage(deal, body.stage, session.id || 'partner');
  }

  // ── Q&A message ──────────────────────────────────────────────────────────
  if (body.qa_message) {
    const msg = String(body.qa_message).trim();
    if (msg) {
      deal.qa = deal.qa || [];
      deal.qa.push({
        id:   'qa_' + Date.now().toString(36),
        from: session.id || 'partner',
        role: 'partner',
        text: msg,
        ts:   new Date().toISOString(),
      });
    }
  }

  try {
    await saveDeal(deal);
    return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } });
  } catch (err) {
    console.error('[deals/update]', err);
    return serverError(res, 'failed to update deal');
  }
}
