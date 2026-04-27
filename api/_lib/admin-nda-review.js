// POST /api/admin/nda-review — partner approves or rejects an uploaded NDA.
// Body: { id, decision: 'approve'|'reject', reason?: string }
//
// On approve: generates an IOI code (if not already), sends Email 2
// (Materials Open) which carries the code and a link to /ioi.

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken, generateIoiCode } from './auth.js';
import { getLead, saveLead, bindIoiCode } from './storage.js';
import { sendRaw, buildMaterialsOpenEmail } from './email.js';

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

  let ioiCode = null;
  let mailResult = { sent: false, reason: 'skipped' };

  if (decision === 'approve') {
    lead.nda_state = 'approved';
    lead.nda_reviewed_at = now;
    lead.nda_reviewed_by = actor;
    lead.nda_rejection_reason = '';
    lead.audit.push({ at: now, actor, action: 'nda_approved' });

    // Generate IOI code if one isn't already assigned to this lead.
    if (!lead.ioi_code) {
      ioiCode = generateIoiCode();
      try {
        await bindIoiCode(ioiCode, lead.id);
      } catch (e) {
        console.error('bindIoiCode failed', e);
        // Continue — partner can resend later. Don't fail the NDA approval.
      }
      lead.ioi_code = ioiCode;
      lead.ioi_code_issued_at = now;
      lead.audit.push({ at: now, actor, action: 'ioi_code_issued', code: ioiCode });
    } else {
      ioiCode = lead.ioi_code;
    }

    // Save before email so audit captures state even if mail fails.
    await saveLead(lead);

    // Send Email 2 — Materials Open.
    if (lead.email) {
      const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
      const ioiUrl = `${siteUrl}/ioi?c=${encodeURIComponent(ioiCode)}`;
      const tpl = buildMaterialsOpenEmail({ lead, ioiCode, ioiUrl });
      try {
        mailResult = await sendRaw({
          to: lead.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          replyTo: process.env.REPLY_TO || undefined,
          bcc: (process.env.BCC_PARTNERS || '').split(',').map((s) => s.trim()).filter(Boolean).join(',') || undefined,
        });
        if (mailResult.sent) {
          lead.materials_email_sent_at = Date.now();
          lead.audit.push({ at: lead.materials_email_sent_at, actor, action: 'materials_email_sent', to: lead.email });
        } else {
          lead.audit.push({ at: Date.now(), actor, action: 'materials_email_failed', reason: mailResult.reason });
        }
        await saveLead(lead);
      } catch (e) {
        console.error('materials email send error', e);
        mailResult = { sent: false, reason: 'exception' };
      }
    }
  } else {
    if (!reason) return bad(res, 'rejection requires a reason');
    lead.nda_state = 'rejected';
    lead.nda_reviewed_at = now;
    lead.nda_reviewed_by = actor;
    lead.nda_rejection_reason = reason;
    lead.audit.push({ at: now, actor, action: 'nda_rejected', reason });
    await saveLead(lead);
  }

  return ok(res, {
    ok: true,
    state: lead.nda_state,
    reviewed_at: now,
    reviewed_by: actor,
    reason: lead.nda_rejection_reason || '',
    ioi_code: ioiCode,
    materials_email: mailResult,
  });
}
