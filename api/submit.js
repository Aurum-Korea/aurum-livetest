// POST /api/submit — public form endpoint.
// Receives the interest form payload, stores the lead, notifies the partners.

import { json, ok, bad, methodNotAllowed, readBody, clientIp } from './_lib/http.js';
import { generateLeadId } from './_lib/auth.js';
import { saveLead, leadsCount } from './_lib/storage.js';
import { sendRaw, buildPartnerNotice, buildInquiryReceivedEmail, partnerEmailsOff } from './_lib/email.js';

const REQUIRED = ['name', 'email', 'country', 'hear_about', 'reverse_solicitation_ack'];
const ALLOWED  = [
  'name', 'email', 'country', 'hear_about', 'note', 'reverse_solicitation_ack',
  // Legacy fields — accepted for backward compatibility (older form versions / API clients)
  'name_ko', 'phone_cc', 'phone', 'wealth',
  'occupation', 'source_of_wealth',
  'interest_deals', 'interest_gold', 'interest_familyoffice', 'interest_all',
  'referral', 'nda_ack',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try { body = await readBody(req); }
  catch { return bad(res, 'invalid body'); }

  // Validate required
  for (const k of REQUIRED) {
    if (body[k] === undefined || body[k] === null || body[k] === '') {
      return bad(res, `missing field: ${k}`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    return bad(res, 'invalid email');
  }
  // Accept either the new reverse_solicitation_ack or the legacy nda_ack
  if (!body.reverse_solicitation_ack && !body.nda_ack) {
    return bad(res, 'acknowledgement required');
  }

  // Build clean lead record
  const id = generateLeadId();
  const now = Date.now();
  const lead = { id, status: 'new', submitted_at_ms: now };
  for (const k of ALLOWED) {
    if (body[k] !== undefined) lead[k] = String(body[k]).slice(0, 4000);
  }
  // Booleans for interest checkboxes (legacy fields)
  for (const k of ['interest_deals', 'interest_gold', 'interest_familyoffice', 'interest_all']) {
    lead[k] = !!body[k] && body[k] !== '0' && body[k] !== 'false';
  }
  // Normalize: new schema uses reverse_solicitation_ack; we set both flags true
  // so downstream code that checks either continues to work.
  lead.reverse_solicitation_ack = true;
  lead.nda_ack = true;
  lead.meta = {
    user_agent: String(body._meta?.user_agent || req.headers['user-agent'] || '').slice(0, 500),
    referer:    String(req.headers['referer'] || '').slice(0, 500),
    ip:         clientIp(req),
    page:       String(body._meta?.page || ''),
  };
  lead.notes = []; // partner-added notes appended later
  lead.audit = [{ at: now, actor: 'system', action: 'submitted' }];

  let saved = false;
  try {
    await saveLead(lead);
    saved = true;
  } catch (e) {
    console.error('[aurum] saveLead failed:', e && e.stack || e);
    // Fall through — we'll still try to email the partners so the inquiry
    // isn't lost. The error message in the UI will be polite either way.
  }

  // Notify partners (best effort — never fail the form because of this).
  // If storage failed above, this becomes the only record of the lead, so
  // the partner-notice template includes everything needed to follow up.
  // Suppressed entirely when PARTNER_EMAILS_OFF=1 (testing mode).
  const notifyTo = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  let emailed = false;
  if (partnerEmailsOff()) {
    // Audit suppression so dashboard surfaces it
    try {
      lead.audit = lead.audit || [];
      lead.audit.push({ at: Date.now(), actor: 'system', action: 'partner_notify_suppressed', reason: 'PARTNER_EMAILS_OFF' });
      if (saved) await saveLead(lead);
    } catch {}
  } else if (notifyTo.length) {
    try {
      const tpl = buildPartnerNotice(lead);
      const r = await sendRaw({ to: notifyTo, ...tpl });
      emailed = !!r.sent;
      if (!r.sent) console.warn('[aurum] partner notice not sent:', r.reason);
    } catch (e) {
      console.warn('[aurum] notify error:', e && e.stack || e);
    }
  }

  // Autoresponder to the applicant — quiet acknowledgement, no code, no promises.
  // Best effort, isolated try/catch so a failure here never affects partner notice
  // or the form's success response.
  if (lead.email) {
    try {
      const tpl = buildInquiryReceivedEmail({ lead });
      const r = await sendRaw({
        to: lead.email,
        subject: tpl.subject, html: tpl.html, text: tpl.text,
        replyTo: process.env.REPLY_TO || undefined,
      });
      if (!r.sent) console.warn('[aurum] applicant autoresponder not sent:', r.reason);
      else {
        // Best-effort audit append — don't block on a save failure.
        try {
          lead.audit = lead.audit || [];
          lead.audit.push({ at: Date.now(), actor: 'system', action: 'inquiry_ack_sent' });
          if (saved) await saveLead(lead);
        } catch {}
      }
    } catch (e) {
      console.warn('[aurum] autoresponder error:', e && e.stack || e);
    }
  }

  // If both paths failed, the lead is effectively lost — surface a real 500
  // so the user retries. Otherwise return 200 even if storage failed (email
  // will reach the partners, dashboard count may be off until next cold start).
  if (!saved && !emailed) {
    return json(res, 500, { ok: false, error: 'storage error' });
  }

  let count = 0;
  try { count = await leadsCount(); } catch {}

  return ok(res, { ok: true, id, count });
}
