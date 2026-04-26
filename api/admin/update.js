// POST /api/admin/update — update a lead.
// Body: { id, status?, note?, action? }
//   status: 'new' | 'reviewing' | 'approved' | 'declined' | 'sent'
//   note:   string — appended to lead.notes with timestamp + actor
//   action: 'revoke_code' — invalidates the existing code (does NOT email)

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getLead, saveLead, unbindCode } from '../_lib/storage.js';

const VALID_STATUSES = new Set(['new', 'reviewing', 'approved', 'declined', 'sent']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  if (!body.id) return bad(res, 'missing id');

  const lead = await getLead(body.id);
  if (!lead) return notFound(res, 'lead not found');

  const actor = session.id || session.email || 'admin';
  const now = Date.now();
  lead.audit = lead.audit || [];

  if (body.status) {
    if (!VALID_STATUSES.has(body.status)) return bad(res, 'invalid status');
    const prev = lead.status;
    lead.status = body.status;
    lead.audit.push({ at: now, actor, action: 'status', from: prev, to: body.status });
  }

  if (typeof body.note === 'string' && body.note.trim()) {
    lead.notes = lead.notes || [];
    lead.notes.push({ at: now, actor, text: body.note.trim().slice(0, 4000) });
    lead.audit.push({ at: now, actor, action: 'note' });
  }

  if (body.action === 'revoke_code') {
    if (lead.code) {
      try { await unbindCode(lead.code); } catch {}
      lead.audit.push({ at: now, actor, action: 'revoke_code', code: lead.code });
      lead.code_revoked = true;
    }
  }

  await saveLead(lead);
  return ok(res, { ok: true, lead });
}
