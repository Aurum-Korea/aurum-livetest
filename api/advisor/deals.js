// POST /api/advisor/deals
//
// Advisor-scoped deal actions. All writes are gated to the advisor's own deals.
// Advisors cannot read or modify deals they don't own.
//
// Body: { action: string, ...fields }
//
// Actions:
//   submit    — submit a new deal for TACC review
//     Required: name, type, target_irr, term_months, notes
//     Optional: target_alloc_usd, funding_source, gate_notes
//
//   qa        — append a Q&A message to an existing deal
//     Required: deal_id, text
//
//   update    — update gate_notes or next_action on advisor's own deal
//     Required: deal_id
//     Allowed:  gate_notes, next_action, notes (advisors cannot change stage/health)
//
// Auth: aurum_advisor cookie

import { ok, bad, unauthorized, notFound, methodNotAllowed, serverError, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getAdvisor } from '../_lib/advisor-storage.js';
import { getDeal, saveDeal, generateDealId, daysInStage } from '../_lib/deal-storage.js';

const VALID_TYPES = new Set(['pe','credit','re','infra','equity']);

async function getAdvisorSession(req) {
  const tok     = getCookie(req, 'aurum_advisor');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor' || !session.advisorId) return null;
  const advisor = await getAdvisor(session.advisorId).catch(() => null);
  if (!advisor || advisor.status === 'suspended') return null;
  return { session, advisor };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const auth = await getAdvisorSession(req);
  if (!auth) return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const { advisor } = auth;
  const action = String(body.action || '').trim();

  // ── SUBMIT — create a new deal attributed to this advisor ──────────────────
  if (action === 'submit') {
    const name = String(body.name || '').trim();
    if (!name) return bad(res, 'name is required');
    const type = VALID_TYPES.has(body.type) ? body.type : 'pe';
    const now  = new Date().toISOString();

    const deal = {
      id:               generateDealId(),
      name,
      type,
      stage:            'review',
      advisor_id:       advisor.id,
      advisor_firm:     advisor.firm,
      target_alloc_usd: 0,                           // set by TACC after review
      target_irr:       Math.max(0, Number(body.target_irr) || 0) || null,
      term_months:      body.term_months ? Math.max(1, Math.round(Number(body.term_months))) : null,
      funding_source:   body.funding_source === 'reserve' ? 'reserve' : 'ltv',
      ioi_count:        0,
      ioi_agg_usd:      0,
      gate_status:      'open',
      gate_notes:       String(body.gate_notes || 'Submitted for TACC review').trim(),
      next_action:      'Initial credit review',
      health:           'green',
      deployed_usd:     0,
      notes:            String(body.notes || '').trim(),
      qa: [{
        id:   'qa_' + Date.now().toString(36),
        from: advisor.name || advisor.firm,
        role: 'advisor',
        text: body.intro_note
          ? String(body.intro_note).trim()
          : `Deal submitted by ${advisor.firm}. Please review.`,
        ts:   now,
      }],
      created_at:       now,
      stage_entered_at: now,
      funded_at:        null,
      closed_at:        null,
      created_by:       advisor.id,
      updated_at:       now,
    };

    try {
      await saveDeal(deal);
      return ok(res, { ok: true, deal: { ...deal, days_in_stage: 0 } });
    } catch (e) {
      console.error('[advisor/deals] submit', e);
      return serverError(res, 'submit failed');
    }
  }

  // ── QA — append a message to the deal's Q&A thread ────────────────────────
  if (action === 'qa') {
    const dealId = String(body.deal_id || '').trim();
    const text   = String(body.text    || '').trim();
    if (!dealId) return bad(res, 'deal_id required');
    if (!text)   return bad(res, 'text required');

    let deal;
    try { deal = await getDeal(dealId); } catch (e) {
      console.error('[advisor/deals] qa getDeal', e);
      return serverError(res, 'storage error');
    }
    if (!deal) return notFound(res, 'deal not found');

    // Scope check — advisor can only comment on their own deals
    if (deal.advisor_id !== advisor.id && deal.advisor_firm !== advisor.firm) {
      return unauthorized(res, 'not your deal');
    }

    deal.qa = deal.qa || [];
    deal.qa.push({
      id:   'qa_' + Date.now().toString(36),
      from: advisor.name || advisor.firm,
      role: 'advisor',
      text,
      ts:   new Date().toISOString(),
    });

    try {
      await saveDeal(deal);
      return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } });
    } catch (e) {
      console.error('[advisor/deals] qa save', e);
      return serverError(res, 'save failed');
    }
  }

  // ── UPDATE — limited field updates on advisor's own deal ───────────────────
  if (action === 'update') {
    const dealId = String(body.deal_id || '').trim();
    if (!dealId) return bad(res, 'deal_id required');

    let deal;
    try { deal = await getDeal(dealId); } catch (e) {
      return serverError(res, 'storage error');
    }
    if (!deal) return notFound(res, 'deal not found');
    if (deal.advisor_id !== advisor.id && deal.advisor_firm !== advisor.firm) {
      return unauthorized(res, 'not your deal');
    }

    // Only allow advisors to update informational fields, not stage/health/alloc
    if (body.gate_notes  != null) deal.gate_notes  = String(body.gate_notes).trim();
    if (body.next_action != null) deal.next_action = String(body.next_action).trim();
    if (body.notes       != null) deal.notes       = String(body.notes).trim();

    try {
      await saveDeal(deal);
      return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } });
    } catch (e) {
      return serverError(res, 'update failed');
    }
  }

  return bad(res, `unknown action: ${action}`);
}
