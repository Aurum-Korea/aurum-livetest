// POST /api/submit — public form endpoint.
// Receives the interest form payload, stores the lead, notifies the partners.

import { json, ok, bad, methodNotAllowed, readBody, clientIp } from './_lib/http.js';
import { generateLeadId } from './_lib/auth.js';
import { saveLead, leadsCount } from './_lib/storage.js';
import { sendRaw, buildPartnerNotice } from './_lib/email.js';

const REQUIRED = ['name', 'email', 'country', 'wealth', 'nda_ack'];
const ALLOWED  = [
  'name', 'name_ko', 'email', 'phone_cc', 'phone', 'country', 'wealth',
  'interest_deals', 'interest_gold', 'interest_familyoffice', 'interest_all',
  'referral', 'note', 'nda_ack',
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
  if (!body.nda_ack) return bad(res, 'NDA acknowledgement required');

  // Build clean lead record
  const id = generateLeadId();
  const now = Date.now();
  const lead = { id, status: 'new', submitted_at_ms: now };
  for (const k of ALLOWED) {
    if (body[k] !== undefined) lead[k] = String(body[k]).slice(0, 4000);
  }
  // Booleans for interest checkboxes
  for (const k of ['interest_deals', 'interest_gold', 'interest_familyoffice', 'interest_all']) {
    lead[k] = !!body[k] && body[k] !== '0' && body[k] !== 'false';
  }
  lead.nda_ack = true;
  lead.meta = {
    user_agent: String(body._meta?.user_agent || req.headers['user-agent'] || '').slice(0, 500),
    referer:    String(req.headers['referer'] || '').slice(0, 500),
    ip:         clientIp(req),
    page:       String(body._meta?.page || ''),
  };
  lead.notes = []; // partner-added notes appended later
  lead.audit = [{ at: now, actor: 'system', action: 'submitted' }];

  try {
    await saveLead(lead);
  } catch (e) {
    console.error('saveLead failed', e);
    return json(res, 500, { ok: false, error: 'storage error' });
  }

  // Notify partners (best effort — never fail the form because of this)
  const notifyTo = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (notifyTo.length) {
    try {
      const tpl = buildPartnerNotice(lead);
      const r = await sendRaw({ to: notifyTo, ...tpl });
      if (!r.sent) console.warn('partner notice not sent:', r.reason);
    } catch (e) { console.warn('notify error', e); }
  }

  let count = 0;
  try { count = await leadsCount(); } catch {}

  return ok(res, { ok: true, id, count });
}
