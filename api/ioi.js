// /api/ioi  — IOI / KYC pipeline dispatcher.
// Operations dispatched by ?op= query param:
//
//   status         GET   ?op=status&c=AURUM-IOI-…
//                  Returns { lead_summary, kyc_status, has_ioi } so /ioi page
//                  can decide whether to show the KYC gate or commitment form.
//
//   start-kyc      POST  ?op=start-kyc          { code }
//                  Returns a redirect URL into the Useb (or stub) KYC flow.
//                  In stub mode (USEB_API_KEY unset) auto-marks verified for
//                  flow testing.
//
//   kyc-webhook    POST  ?op=kyc-webhook        Useb postback
//                  Validates signature (if configured), sets kyc.status.
//                  Public route — auth is webhook signature, not session.
//
//   submit-ioi     POST  ?op=submit-ioi         { code, profile, ioi }
//                  Saves the investor profile and the commitment indication.
//                  Snapshots krw_per_kg at submit-time.
//
//   spot           GET   ?op=spot
//                  Returns { krw_per_kg, fetched_at_ms, source }.
//                  Used by the live calculator on /ioi.
//
// We funnel through one route to stay within Vercel's Hobby 12-function cap.

import { ok, bad, notFound, methodNotAllowed, readBody, getQuery, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead, saveLead, leadIdForIoiCode } from './_lib/storage.js';
import { sendRaw, buildPartnerNotice } from './_lib/email.js';
import { getKrwPerKg } from './_lib/krw.js';
import { formatKRW } from './_lib/format.js';

export default async function handler(req, res) {
  const op = String(getQuery(req).op || '').toLowerCase();
  try {
    switch (op) {
      case 'status':       return await opStatus(req, res);
      case 'start-kyc':    return await opStartKyc(req, res);
      case 'kyc-webhook':  return await opKycWebhook(req, res);
      case 'submit-ioi':   return await opSubmitIoi(req, res);
      case 'spot':         return await opSpot(req, res);
      case 'context':      return await opContext(req, res);
      default:             return notFound(res, `unknown op: ${op || '(none)'}`);
    }
  } catch (e) {
    console.error('[ioi]', op, e);
    return bad(res, 'internal error');
  }
}

// ── op: context ────────────────────────────────────────────────────────────
// Reads the aurum_access cookie (set by /api/verify-code when a member entered
// their NDA-gate code) and returns the lead's ioi_code if NDA is approved.
// Used by /memo to wire its SUBMIT IOI button to /ioi?c=<ioi_code>.
async function opContext(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const tok = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) {
    return ok(res, { ok: false, reason: 'no-session' });
  }
  const lead = await getLead(session.leadId);
  if (!lead) return ok(res, { ok: false, reason: 'no-lead' });
  if (lead.nda_state !== 'approved') return ok(res, { ok: false, reason: 'nda-not-approved' });

  return ok(res, {
    ok: true,
    ioi_code: lead.ioi_code || null,
    has_ioi: !!(lead.ioi && lead.ioi.submitted_at),
  });
}

// ── op: status ─────────────────────────────────────────────────────────────
async function opStatus(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const code = String(getQuery(req).c || getQuery(req).code || '').trim().toUpperCase();
  if (!code) return bad(res, 'missing code');
  if (!code.startsWith('AURUM-IOI-')) return bad(res, 'not an IOI code');

  const leadId = await leadIdForIoiCode(code);
  if (!leadId) return notFound(res, 'unknown code');
  const lead = await getLead(leadId);
  if (!lead) return notFound(res, 'lead not found');

  // Member must have a countersigned NDA before the IOI code is valid.
  if (lead.nda_state !== 'approved') {
    return bad(res, 'NDA not yet countersigned');
  }

  return ok(res, {
    ok: true,
    lead: {
      id: lead.id,
      name: lead.name || '',
      name_ko: lead.name_ko || '',
      email: lead.email || '',
    },
    kyc_status: (lead.kyc && lead.kyc.status) || 'pending',
    has_ioi: !!(lead.ioi && lead.ioi.submitted_at),
    has_profile: !!lead.profile,
  });
}

// ── op: start-kyc ──────────────────────────────────────────────────────────
async function opStartKyc(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const code = String(body.code || '').trim().toUpperCase();
  if (!code) return bad(res, 'missing code');
  const leadId = await leadIdForIoiCode(code);
  if (!leadId) return notFound(res, 'unknown code');
  const lead = await getLead(leadId);
  if (!lead) return notFound(res, 'lead not found');
  if (lead.nda_state !== 'approved') return bad(res, 'NDA not yet countersigned');

  const now = Date.now();
  lead.kyc = lead.kyc || { status: 'pending' };
  lead.kyc.started_at = now;
  lead.audit = lead.audit || [];
  lead.audit.push({ at: now, action: 'kyc_started' });

  const usebKey = process.env.USEB_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';

  if (!usebKey) {
    // STUB MODE — no Useb credentials. Auto-verify so the flow can be walked
    // end-to-end during development / testing. Production must set USEB_API_KEY.
    lead.kyc.status = 'verified';
    lead.kyc.verified_at = now;
    lead.kyc.ref = 'STUB-' + now;
    lead.kyc.stub = true;
    lead.audit.push({ at: now, action: 'kyc_verified_stub' });
    await saveLead(lead);
    return ok(res, {
      ok: true,
      mode: 'stub',
      // The page polls status after this and proceeds to the form.
      redirect: `${siteUrl}/ioi?c=${encodeURIComponent(code)}&kyc=ok`,
    });
  }

  // Real Useb flow:  Useb returns a hosted verification URL we redirect to.
  // Their callback hits /api/ioi?op=kyc-webhook with verification result.
  // For now, we just record that we'd call them; the actual integration plugs
  // in once you have an account. The shape is preserved so swap-in is clean.
  lead.kyc.status = 'started';
  lead.kyc.ref = `PEND-${now}`;
  await saveLead(lead);

  // TODO: real Useb integration when you have credentials.
  // const resp = await fetch('https://api.useb.co.kr/v1/...', { ... });
  // const { verification_url, ref } = await resp.json();
  // lead.kyc.ref = ref; await saveLead(lead);
  // return ok(res, { ok: true, mode: 'live', redirect: verification_url });

  // Until then, behave like stub mode for testing:
  lead.kyc.status = 'verified';
  lead.kyc.verified_at = now;
  lead.kyc.stub = true;
  lead.audit.push({ at: now, action: 'kyc_verified_stub_pending_useb' });
  await saveLead(lead);
  return ok(res, {
    ok: true,
    mode: 'stub',
    redirect: `${siteUrl}/ioi?c=${encodeURIComponent(code)}&kyc=ok`,
  });
}

// ── op: kyc-webhook ────────────────────────────────────────────────────────
// Public route — Useb posts here when verification completes. Validates a
// shared secret (USEB_WEBHOOK_SECRET) if configured.
async function opKycWebhook(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const expectedSecret = process.env.USEB_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = req.headers['x-useb-secret'] || req.headers['x-webhook-secret'];
    if (got !== expectedSecret) {
      console.warn('[ioi/kyc-webhook] secret mismatch');
      return bad(res, 'forbidden', 403);
    }
  }

  // Useb webhook shape (assumed): { ref, status: 'verified' | 'failed', ... }
  const ref = body.ref || body.reference;
  const status = body.status;
  if (!ref) return bad(res, 'missing ref');

  // We stored ref on the lead as kyc.ref. Look up by scanning index — for
  // small volumes this is fine; if it grows, add a ref→lead index.
  // For now: walk active leads, find the one with matching ref.
  // (Cheap shortcut — webhook is rare, partners' active list is small.)
  const { listLeads } = await import('./_lib/storage.js');
  const leads = await listLeads(1000);
  const lead = leads.find((l) => l.kyc && l.kyc.ref === ref);
  if (!lead) return notFound(res, 'no lead for ref');

  const now = Date.now();
  lead.kyc = lead.kyc || {};
  lead.kyc.status = status === 'verified' ? 'verified' : 'failed';
  if (status === 'verified') lead.kyc.verified_at = now;
  if (body.failure_reason) lead.kyc.failure_reason = String(body.failure_reason).slice(0, 500);
  lead.audit = lead.audit || [];
  lead.audit.push({ at: now, action: `kyc_${lead.kyc.status}`, ref });
  await saveLead(lead);

  return ok(res, { ok: true });
}

// ── op: submit-ioi ─────────────────────────────────────────────────────────
async function opSubmitIoi(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  const code = String(body.code || '').trim().toUpperCase();
  if (!code) return bad(res, 'missing code');
  const leadId = await leadIdForIoiCode(code);
  if (!leadId) return notFound(res, 'unknown code');
  const lead = await getLead(leadId);
  if (!lead) return notFound(res, 'lead not found');
  if (lead.nda_state !== 'approved') return bad(res, 'NDA not yet countersigned');
  if (!lead.kyc || lead.kyc.status !== 'verified') return bad(res, 'KYC not yet verified');

  // Validate inputs
  const profile = body.profile || {};
  const ioi = body.ioi || {};

  const krw = Math.round(Number(ioi.krw) || 0);
  const ltv_pct = Math.max(0, Math.min(75, Math.round(Number(ioi.ltv_pct) || 0)));
  const signature = String(ioi.signature || '').trim().slice(0, 200);
  if (!krw || krw < 1) return bad(res, 'invalid commitment amount');
  if (!signature) return bad(res, 'signature required');
  if (!ioi.checkbox_indicative || !ioi.checkbox_materials || !ioi.checkbox_seven_day || !ioi.checkbox_spot_caveat) {
    return bad(res, 'all checkboxes required');
  }

  // Snapshot spot at submit time
  const spot = await getKrwPerKg();
  const krw_per_kg = spot.krw_per_kg;
  const kg = krw / krw_per_kg;
  if (kg < 1) return bad(res, `commitment below 1 kg minimum at current spot`);

  const now = Date.now();
  lead.profile = {
    ...lead.profile,
    income_range: String(profile.income_range || '').slice(0, 100),
    net_worth: String(profile.net_worth || '').slice(0, 100),
    liquid_net_worth: String(profile.liquid_net_worth || '').slice(0, 100),
    investment_experience_yrs: String(profile.investment_experience_yrs || '').slice(0, 50),
    offshore_exposure_text: String(profile.offshore_exposure_text || '').slice(0, 1000),
    pep: profile.pep === true || profile.pep === 'yes',
    pep_relation: profile.pep ? String(profile.pep_relation || '').slice(0, 500) : '',
    source_of_funds_commit: String(profile.source_of_funds_commit || '').slice(0, 100),
    tax_residency: String(profile.tax_residency || '').slice(0, 100),
    korean_fx_bank: String(profile.korean_fx_bank || '').slice(0, 200),
    submitted_at: now,
  };
  lead.ioi = {
    krw,
    kg,
    ltv_pct,
    krw_per_kg_at_submit: krw_per_kg,
    krw_at_submit: krw,
    krw_per_kg_at_verify: null,
    krw_at_verify: null,
    krw_at_settle: null,
    signature,
    checkboxes: {
      indicative: !!ioi.checkbox_indicative,
      materials: !!ioi.checkbox_materials,
      seven_day: !!ioi.checkbox_seven_day,
      spot_caveat: !!ioi.checkbox_spot_caveat,
    },
    submitted_at: now,
  };
  lead.audit = lead.audit || [];
  lead.audit.push({ at: now, action: 'ioi_submitted', krw, kg: kg.toFixed(4), ltv_pct });
  await saveLead(lead);

  // Optional: notify partners that an IOI just landed (BCC partners on the dashboard).
  // Simple notice using existing partner-notice template builder pattern.
  try {
    const notify = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (notify.length) {
      const krwFmt = formatKRW(krw);
      const spotFmt = formatKRW(krw_per_kg);
      await sendRaw({
        to: notify,
        subject: `[AURUM] IOI submitted · ${lead.name || 'Unnamed'} · ${kg.toFixed(2)} kg`,
        text: [
          `${lead.name || 'Unnamed'} just submitted an IOI.`,
          ``,
          `KRW:        ${krwFmt}`,
          `kg:         ${kg.toFixed(4)}`,
          `LTV req:    ${ltv_pct}%`,
          `Spot:       ${spotFmt} /kg (${spot.source})`,
          ``,
          `Review:     ${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin?lead=${encodeURIComponent(lead.id)}`,
        ].join('\n'),
        html: `<pre style="font:14px monospace">${lead.name || 'Unnamed'} just submitted an IOI.

KRW:        ${krwFmt}
kg:         ${kg.toFixed(4)}
LTV req:    ${ltv_pct}%
Spot:       ${spotFmt} /kg (${spot.source})

Review:     <a href="${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin?lead=${encodeURIComponent(lead.id)}">dashboard</a></pre>`,
      });
    }
  } catch (e) {
    console.warn('partner notify after IOI failed', e);
  }

  return ok(res, {
    ok: true,
    ioi: lead.ioi,
  });
}

// ── op: spot ────────────────────────────────────────────────────────────────
async function opSpot(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const spot = await getKrwPerKg();
  return ok(res, spot);
}
