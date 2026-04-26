// POST /api/admin/nda-review — partner approves or rejects an uploaded NDA.
// Body: { id, decision: 'approve'|'reject', reason?: string }

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { getLead, saveLead } from './storage.js';

const VALID = new Set(['approve', 'reject']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res, 'admin only');
  const actor = session.id || session.email || 'admin';

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const id = body && body.id;
  const decision = body && body.decision;
  const reason = (body && body.reason ? String(body.reason).slice(0, 500) : '').trim();
  if (!id) return bad(res, 'missing id');
  if (!VALID.has(decision)) return bad(res, 'decision must be approve|reject');

  const lead = await getLead(id);
  if (!lead) return notFound(res, 'lead not found');

  if (!lead.nda_state || lead.nda_state === 'awaiting') {
    return bad(res, 'no NDA uploaded for this lead yet');
  }

  const now = Date.now();
  lead.audit = lead.audit || [];

  if (decision === 'approve') {
    lead.nda_state = 'approved';
    lead.nda_reviewed_at = now;
    lead.nda_reviewed_by = actor;
    lead.nda_rejection_reason = '';
    lead.audit.push({ at: now, actor, action: 'nda_approved' });
  } else {
    if (!reason) return bad(res, 'rejection requires a reason');
    lead.nda_state = 'rejected';
    lead.nda_reviewed_at = now;
    lead.nda_reviewed_by = actor;
    lead.nda_rejection_reason = reason;
    lead.audit.push({ at: now, actor, action: 'nda_rejected', reason });
  }

  await saveLead(lead);

  return ok(res, {
    ok: true,
    state: lead.nda_state,
    reviewed_at: now,
    reviewed_by: actor,
    reason: lead.nda_rejection_reason || '',
  });
}
