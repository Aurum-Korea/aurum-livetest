// POST /api/admin/approve — generate an invitation code, mark lead approved,
// send the member the bilingual invitation email with the code + magic link.
//
// Body: { id, send_email?: boolean }   send_email defaults to true.
// Returns the code so the dashboard can display it (and offer a "copy" if email failed).

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from '../_lib/http.js';
import { verifyToken, generateCode } from '../_lib/auth.js';
import { getLead, saveLead, bindCode } from '../_lib/storage.js';
import { sendRaw, buildInvitationEmail, partnerBcc} from '../_lib/email.js';

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

  // Reuse existing code if already approved & not revoked, else generate new.
  let code = lead.code;
  if (!code || lead.code_revoked) {
    code = generateCode();
    try {
      await bindCode(code, lead.id);
    } catch (e) {
      console.error('bindCode failed', e);
      return bad(res, 'storage error');
    }
    lead.code = code;
    lead.code_revoked = false;
    lead.code_issued_at = now;
  }

  lead.status = 'approved';
  // Initialize the NDA gate. If a prior code was revoked then re-issued,
  // we keep any existing nda_state — partner may have already approved one.
  if (!lead.nda_state) lead.nda_state = 'awaiting';
  lead.audit = lead.audit || [];
  lead.audit.push({ at: now, actor, action: 'approve', code });

  await saveLead(lead);

  // Build email
  const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
  const accessUrl = `${siteUrl}/code?c=${encodeURIComponent(code)}`;
  const tpl = buildInvitationEmail({ lead, code, accessUrl });

  let mailResult = { sent: false, reason: 'skipped' };
  if (body.send_email !== false && lead.email) {
    try {
      mailResult = await sendRaw({
        to: lead.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        replyTo: process.env.REPLY_TO || undefined,
        bcc: partnerBcc(),
      });
      if (mailResult.sent) {
        lead.status = 'sent';
        lead.email_sent_at = Date.now();
        lead.audit.push({ at: lead.email_sent_at, actor, action: 'email_sent', to: lead.email });
        await saveLead(lead);
      } else {
        lead.audit.push({ at: Date.now(), actor, action: 'email_failed', reason: mailResult.reason });
        await saveLead(lead);
      }
    } catch (e) {
      console.error('send error', e);
      mailResult = { sent: false, reason: 'exception' };
    }
  }

  return ok(res, {
    ok: true,
    code,
    accessUrl,
    email: mailResult,
    preview: { subject: tpl.subject, text: tpl.text }, // for the dashboard "show what was sent"
    lead,
  });
}
