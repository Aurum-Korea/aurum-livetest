// GET /api/nda-status — patron-facing: returns current NDA state for this lead.
// Auth: aurum_access cookie. Returns minimal info — no admin-side fields.

import { ok, unauthorized, methodNotAllowed, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead } from './_lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'patron' || !session.leadId) {
    return unauthorized(res, 'no patron session');
  }

  const lead = await getLead(session.leadId);
  if (!lead) return unauthorized(res, 'lead not found');
  if (!lead.code || lead.code_revoked || lead.code !== session.code) {
    return unauthorized(res, 'access revoked');
  }

  return ok(res, {
    ok: true,
    state: lead.nda_state || 'awaiting',
    filename: lead.nda_file_name || null,
    size: lead.nda_file_size || 0,
    uploaded_at: lead.nda_uploaded_at || null,
    reviewed_at: lead.nda_reviewed_at || null,
    rejection_reason: lead.nda_state === 'rejected' ? (lead.nda_rejection_reason || '') : '',
  });
}
