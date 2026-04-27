// POST /api/admin/update — update a lead.
// Body: { id, status?, note?, action? }
//   status: 'new' | 'reviewing' | 'approved' | 'declined' | 'sent'
//   note:   string — appended to lead.notes with timestamp + actor
//   action: one of:
//     'revoke_code'    — invalidates the existing NDA access code (does NOT email)
//     'verify_ioi'     — partner has verified the IOI; sends wire-instructions email
//     'mark_wired'     — partner observed inbound funds in flight
//     'mark_cleared'   — funds settled; sends admission email

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getLead, saveLead, unbindCode } from '../_lib/storage.js';
import { sendRaw, buildWireInstructionsEmail, buildAdmissionEmail } from '../_lib/email.js';
import { getKrwPerKg } from '../_lib/krw.js';

const VALID_STATUSES = new Set(['new', 'reviewing', 'approved', 'declined', 'sent']);
const VALID_ACTIONS = new Set(['revoke_code', 'verify_ioi', 'mark_wired', 'mark_cleared']);

// Wire reference: AURUM-W-{LEAD_ID_SUFFIX}-{YYYYMMDD}
function wireRef(leadId) {
  const d = new Date();
  const yyyymmdd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  // last 6 chars of lead id, uppercased — stable, short, distinct
  const suffix = String(leadId || '').replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
  return `AURUM-W-${suffix}-${yyyymmdd}`;
}

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

  // Status / note updates (existing behavior)
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

  // Action handling
  if (body.action) {
    if (!VALID_ACTIONS.has(body.action)) return bad(res, 'invalid action');

    if (body.action === 'revoke_code') {
      if (lead.code) {
        try { await unbindCode(lead.code); } catch {}
        lead.audit.push({ at: now, actor, action: 'revoke_code', code: lead.code });
        lead.code_revoked = true;
      }
    }

    // verify_ioi — partner has confirmed the IOI submission. Generates wire
    // ref + snapshots spot at verify time + sends wire instructions email.
    if (body.action === 'verify_ioi') {
      if (!lead.ioi || !lead.ioi.submitted_at) return bad(res, 'no IOI submitted');
      if (lead.ioi_verified_at) return bad(res, 'IOI already verified');

      const spot = await getKrwPerKg();
      lead.ioi.krw_per_kg_at_verify = spot.krw_per_kg;
      lead.ioi.krw_at_verify = Math.round(lead.ioi.kg * spot.krw_per_kg);
      lead.ioi_verified_at = now;
      lead.ioi_verified_by = actor;
      lead.audit.push({ at: now, actor, action: 'ioi_verified', krw_per_kg_at_verify: spot.krw_per_kg });

      // Initialize the wire panel
      lead.wire = lead.wire || {};
      if (!lead.wire.ref) lead.wire.ref = wireRef(lead.id);
      lead.wire.instructions_sent_at = now;

      await saveLead(lead);

      // Send wire instructions email
      let mailResult = { sent: false, reason: 'skipped' };
      if (lead.email) {
        const tpl = buildWireInstructionsEmail({ lead, ioi: lead.ioi, wire: lead.wire });
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
            lead.audit.push({ at: Date.now(), actor, action: 'wire_instructions_sent', to: lead.email });
          } else {
            lead.audit.push({ at: Date.now(), actor, action: 'wire_instructions_failed', reason: mailResult.reason });
          }
          await saveLead(lead);
        } catch (e) {
          console.error('wire instructions send error', e);
          mailResult = { sent: false, reason: 'exception' };
        }
      }
      return ok(res, { ok: true, lead, mail: mailResult });
    }

    if (body.action === 'mark_wired') {
      lead.wire = lead.wire || {};
      lead.wire.wired_at = now;
      lead.audit.push({ at: now, actor, action: 'wire_marked_wired' });
    }

    if (body.action === 'mark_cleared') {
      lead.wire = lead.wire || {};
      lead.wire.cleared_at = now;
      lead.status = 'admitted';
      lead.audit.push({ at: now, actor, action: 'wire_marked_cleared' });

      await saveLead(lead);

      // Send admission email
      let mailResult = { sent: false, reason: 'skipped' };
      if (lead.email) {
        const tpl = buildAdmissionEmail({ lead });
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
            lead.audit.push({ at: Date.now(), actor, action: 'admission_email_sent' });
          } else {
            lead.audit.push({ at: Date.now(), actor, action: 'admission_email_failed', reason: mailResult.reason });
          }
          await saveLead(lead);
        } catch (e) {
          console.error('admission send error', e);
        }
      }
      return ok(res, { ok: true, lead, mail: mailResult });
    }
  }

  await saveLead(lead);
  return ok(res, { ok: true, lead });
}
