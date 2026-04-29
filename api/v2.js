// api/v2.js — Aurum v2 consolidated dispatcher
//
// Routes by ?resource= param so all new API surface lives in one
// serverless function, keeping total count at Vercel Hobby limit (12).
//
// Routes:
//   POST /api/v2?resource=admin&op=approve   — issue invite code + send email
//   GET  /api/v2?resource=deals              — list deals (admin)
//   POST /api/v2?resource=deals              — create | update | seed (action in body)
//   POST /api/v2?resource=advisor&op=login   — advisor login → set cookie
//   POST /api/v2?resource=advisor&op=logout  — clear advisor cookie
//   GET  /api/v2?resource=advisor&op=me      — advisor profile + their deals
//   POST /api/v2?resource=advisor&op=deals   — submit | qa | update (advisor-scoped)
//   POST /api/v2?resource=advisor&op=create  — create advisor account (admin)
//   POST /api/v2?resource=advisor&op=seed    — seed test advisors (admin, delete before prod)
//   GET  /api/v2?resource=member&op=me       — member portfolio (member-scoped)
//
// vercel.json rewrites map original paths here, so callers don't change:
//   /api/admin/approve        → /api/v2?resource=admin&op=approve
//   /api/deals/list           → /api/v2?resource=deals
//   /api/deals/create         → /api/v2?resource=deals
//   /api/deals/update         → /api/v2?resource=deals
//   /api/deals/seed           → /api/v2?resource=deals&op=seed
//   /api/advisor/login        → /api/v2?resource=advisor&op=login
//   /api/advisor/logout       → /api/v2?resource=advisor&op=logout
//   /api/advisor/me           → /api/v2?resource=advisor&op=me
//   /api/advisor/deals        → /api/v2?resource=advisor&op=deals
//   /api/advisor/create       → /api/v2?resource=advisor&op=create
//   /api/advisor/seed         → /api/v2?resource=advisor&op=seed
//   /api/member/me            → /api/v2?resource=member&op=me

import {
  ok, bad, unauthorized, notFound, methodNotAllowed,
  serverError, readBody, getCookie, getQuery, setCookie, clearCookie,
} from './_lib/http.js';
import { verifyToken, signToken, generateCode } from './_lib/auth.js';
import { getLead, saveLead, bindCode, listLeads } from './_lib/storage.js';
import { getKrwPerKg } from './_lib/krw.js';
import {
  sendRaw, buildInvitationEmail, partnerBcc, buildAdvisorSetupEmail,
} from './_lib/email.js';
import {
  saveDeal, getDeal, listDeals, generateDealId, daysInStage,
} from './_lib/deal-storage.js';
import {
  saveAdvisor, getAdvisor, findAdvisorByEmail, generateAdvisorId,
  hashPassword, verifyPassword, safeAdvisor, listAdvisors,
} from './_lib/advisor-storage.js';

// ── Main dispatcher ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const q        = getQuery(req);
  const resource = String(q.resource || '').trim();
  const op       = String(q.op       || '').trim();

  switch (resource) {
    case 'admin':   return handleAdmin(req, res, op);
    case 'deals':   return handleDeals(req, res, op);
    case 'advisor': return handleAdvisor(req, res, op);
    case 'member':  return handleMember(req, res, op);
    case 'advisors': return handleAdvisorsList(req, res, op);
    case 'public':   return handlePublic(req, res, op);
    default:        return bad(res, `unknown resource: ${resource || '(none)'}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN — approve (issue invite code + send email)
// Absorbs api/admin/approve.js
// ═══════════════════════════════════════════════════════════════
async function handleAdmin(req, res, op) {
  if (op !== 'approve') return bad(res, `unknown admin op: ${op}`);
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  if (!body.id) return bad(res, 'missing id');

  const lead = await getLead(body.id);
  if (!lead) return notFound(res, 'lead not found');

  const actor = session.id || session.email || 'admin';
  const now   = Date.now();

  // Reuse existing code if already approved & not revoked, else generate new
  let code = lead.code;
  if (!code || lead.code_revoked) {
    code = generateCode();
    try { await bindCode(code, lead.id); } catch (e) {
      console.error('bindCode failed', e);
      return bad(res, 'storage error');
    }
    lead.code = code;
    lead.code_revoked = false;
    lead.code_issued_at = now;
  }

  lead.status   = 'approved';
  if (!lead.nda_state) lead.nda_state = 'awaiting';
  lead.audit    = lead.audit || [];
  lead.audit.push({ at: now, actor, action: 'approve', code });

  await saveLead(lead);

  const siteUrl   = process.env.SITE_URL || 'https://www.theaurumcc.com';
  const accessUrl = `${siteUrl}/code?c=${encodeURIComponent(code)}`;
  const tpl       = buildInvitationEmail({ lead, code, accessUrl });

  let mailResult = { sent: false, reason: 'skipped' };
  if (body.send_email !== false && lead.email) {
    try {
      mailResult = await sendRaw({
        to: lead.email, subject: tpl.subject,
        html: tpl.html, text: tpl.text,
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
    ok: true, code, accessUrl, email: mailResult,
    preview: { subject: tpl.subject, text: tpl.text },
    lead,
  });
}

// ═══════════════════════════════════════════════════════════════
// DEALS — list / create / update / seed  (admin-gated)
// Absorbs api/deals/list.js, create.js, update.js, seed.js
// ═══════════════════════════════════════════════════════════════
const VALID_TYPES   = new Set(['pe','credit','re','infra','equity']);
const VALID_STAGES  = new Set(['review','live','ioi','dd','terms','close','realized','killed']);
const VALID_HEALTH  = new Set(['green','amber','red']);
const VALID_GATE    = new Set(['open','blocked','stalled']);
const VALID_SOURCES = new Set(['ltv','reserve']);

async function handleDeals(req, res, op) {
  // ── MARKETPLACE — member-visible deals, no admin auth required ──
  if (op === 'marketplace' && req.method === 'GET') {
    // Allow: admin cookie, advisor cookie, or valid member access cookie
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    const advSess   = verifyToken(getCookie(req, 'aurum_advisor'));
    const memberSess= verifyToken(getCookie(req, 'aurum_access'));
    if (!adminSess && !advSess && (!memberSess || memberSess.sub !== 'member')) return unauthorized(res);
    try {
      let deals = await listDeals(200);
      deals = deals
        .filter(d => d.member_visible || adminSess || advSess)  // admins/advisors see all
        .map(d => {
          // Strip sensitive originator detail for pure member sessions
          if (memberSess && !adminSess && !advSess) {
            const { advisor_id, advisor_separate_fee_note, ...pub } = d;
            return { ...pub, days_in_stage: daysInStage(d) };
          }
          return { ...d, days_in_stage: daysInStage(d) };
        });
      return ok(res, { ok: true, deals, count: deals.length });
    } catch (e) {
      console.error('[deals/marketplace]', e);
      return serverError(res, 'failed to load marketplace');
    }
  }

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  // GET → list
  if (req.method === 'GET') {
    const q = getQuery(req);
    try {
      let deals = await listDeals(200);
      if (q.stage && q.stage !== 'all') deals = deals.filter(d => d.stage === q.stage);
      if (q.advisor_id) deals = deals.filter(d => d.advisor_id === q.advisor_id);
      deals = deals.map(d => ({ ...d, days_in_stage: daysInStage(d) }));
      return ok(res, { ok: true, deals, count: deals.length });
    } catch (e) {
      console.error('[deals/list]', e);
      return serverError(res, 'failed to list deals');
    }
  }

  if (req.method !== 'POST') return methodNotAllowed(res, ['GET','POST']);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const action = String(body.action || op || '').trim();

  // ── SEED ──────────────────────────────────────────────────────
  if (action === 'seed') {
    const SEED = [
      { id:'deal_pc3', name:'Pacific Credit III', type:'credit', stage:'dd', advisor_firm:'Apex Credit Management', target_alloc_usd:1_200_000, target_irr:11, term_months:36, funding_source:'ltv', ioi_count:11, ioi_agg_usd:4_800_000, gate_status:'blocked', gate_notes:'3 VDR documents outstanding', next_action:'Advance to Terms once VDR complete', health:'green', deployed_usd:775_000, notes:'Asia-Pacific private credit. Strong GP track record. 11 IOIs at $4.8M aggregate.', qa:[{id:'qa_001',from:'tkj',role:'partner',text:'CIM reviewed. Credit committee approved.',ts:'2025-01-17T10:00:00Z'}], created_at:'2025-01-14T08:00:00Z', stage_entered_at:'2025-03-01T09:00:00Z', funded_at:'2025-03-01T00:00:00Z', closed_at:null, created_by:'tkj' },
      { id:'deal_atl', name:'Project Atlas', type:'pe', stage:'terms', advisor_firm:'SG Capital Group', target_alloc_usd:2_000_000, target_irr:22, term_months:60, funding_source:'ltv', ioi_count:13, ioi_agg_usd:6_200_000, gate_status:'open', gate_notes:'Term sheet issued Apr 22', next_action:'LP counter-signature', health:'green', deployed_usd:160_000, notes:'Pre-IPO Singapore AI infrastructure secondary.', qa:[{id:'qa_010',from:'jwc',role:'partner',text:'Allocation confirmed at $2M. IOI closed.',ts:'2026-02-28T10:00:00Z'}], created_at:'2025-12-01T08:00:00Z', stage_entered_at:'2026-04-22T09:00:00Z', funded_at:'2026-04-22T00:00:00Z', closed_at:null, created_by:'jwc' },
      { id:'deal_mbt', name:'Marina Bay Tower', type:'re', stage:'live', advisor_firm:'Prime Real Estate', target_alloc_usd:850_000, target_irr:14, term_months:12, funding_source:'ltv', ioi_count:9, ioi_agg_usd:2_800_000, gate_status:'open', gate_notes:'IOI window open until May 30', next_action:'IOI close then set allocation', health:'green', deployed_usd:550_000, notes:'Singapore CBD senior bridge loan.', qa:[{id:'qa_020',from:'wsl',role:'partner',text:'Reviewed. 12mo senior bridge, clean security.',ts:'2026-02-10T09:00:00Z'}], created_at:'2026-01-20T08:00:00Z', stage_entered_at:'2026-02-10T09:00:00Z', funded_at:'2026-03-20T00:00:00Z', closed_at:null, created_by:'wsl' },
      { id:'deal_cit', name:'Project Citadel', type:'pe', stage:'review', advisor_firm:'Meridian Capital', target_alloc_usd:0, target_irr:18, term_months:48, funding_source:'ltv', ioi_count:0, ioi_agg_usd:0, gate_status:'blocked', gate_notes:'CIM under credit committee review', next_action:'TACC credit decision within 10 business days', health:'amber', deployed_usd:0, notes:'PE secondaries — Asia infrastructure.', qa:[{id:'qa_030',from:'system',role:'partner',text:'Deal submitted. CIM received.',ts:'2026-04-15T09:00:00Z'}], created_at:'2026-04-15T09:00:00Z', stage_entered_at:'2026-04-15T09:00:00Z', funded_at:null, closed_at:null, created_by:'jwc' },
      { id:'deal_pc4', name:'Pacific Credit IV', type:'credit', stage:'review', advisor_firm:'Apex Credit Management', target_alloc_usd:0, target_irr:13, term_months:12, funding_source:'ltv', ioi_count:0, ioi_agg_usd:0, gate_status:'open', gate_notes:'Submitted Apr 25, 2026', next_action:'Initial review — CIM under assessment', health:'green', deployed_usd:0, notes:'Short-duration KR/JP restructuring credit.', qa:[{id:'qa_040',from:'system',role:'partner',text:'Deal submitted by Apex Credit Management.',ts:'2026-04-25T08:00:00Z'}], created_at:'2026-04-25T08:00:00Z', stage_entered_at:'2026-04-25T08:00:00Z', funded_at:null, closed_at:null, created_by:'tkj' },
    ];
    try {
      const now = new Date().toISOString();
      for (const d of SEED) await saveDeal({ ...d, updated_at: now });
      return ok(res, { ok: true, seeded: SEED.length, ids: SEED.map(d => d.id),
        message: 'Seed complete. Delete seed capability before production.' });
    } catch (e) { return serverError(res, 'seed failed: ' + e.message); }
  }

  // ── CREATE ─────────────────────────────────────────────────────
  if (action === 'create') {
    const name = String(body.name || '').trim();
    if (!name) return bad(res, 'name is required');
    const now = new Date().toISOString();
    const deal = {
      id: generateDealId(), name,
      type: VALID_TYPES.has(body.type) ? body.type : 'pe',
      stage: VALID_STAGES.has(body.stage) ? body.stage : 'review',
      advisor_id: String(body.advisor_id || '').trim() || null,
      advisor_firm: String(body.advisor_firm || '').trim(),
      target_alloc_usd: Math.max(0, Number(body.target_alloc_usd) || 0),
      target_irr: body.target_irr != null ? Math.max(0, Number(body.target_irr)) : null,
      term_months: body.term_months != null ? Math.max(1, Math.round(Number(body.term_months))) : null,
      funding_source: VALID_SOURCES.has(body.funding_source) ? body.funding_source : 'ltv',
      ioi_count: 0, ioi_agg_usd: 0,
      documents: [],
      gate_status: 'open',
      gate_notes: String(body.gate_notes || '').trim(),
      next_action: String(body.next_action || '').trim(),
      health: VALID_HEALTH.has(body.health) ? body.health : 'green',
      deployed_usd: 0,
      notes: String(body.notes || '').trim(),
      // Extended deal fields (v2 advisor platform)
      deal_structure:      String(body.deal_structure   || '').trim(),
      geography:           String(body.geography        || '').trim(),
      originator:          String(body.originator       || '').trim(),
      return_type:         String(body.return_type      || '').trim(),
      hurdle_rate:         body.hurdle_rate  != null ? Math.max(0, Number(body.hurdle_rate))  : 8,
      total_deal_size_usd: Math.max(0, Number(body.total_deal_size_usd) || 0),
      min_ticket_usd:      Math.max(0, Number(body.min_ticket_usd)      || 0),
      max_ticket_usd:      Math.max(0, Number(body.max_ticket_usd)      || 0),
      round_name:          String(body.round_name  || '').trim(),
      round_size_usd:      Math.max(0, Number(body.round_size_usd)      || 0),
      tacc_platform_fee_pct: Math.min(2, Math.max(0.5, Number(body.tacc_platform_fee_pct) || 1)),
      tacc_carry_pct:        Math.min(20, Math.max(5,  Number(body.tacc_carry_pct)        || 12)),
      member_visible:      false,
      advisor_has_separate_fee:  !!body.advisor_has_separate_fee,
      advisor_separate_fee_note: String(body.advisor_separate_fee_note || '').trim(),
      qa: [], created_at: now, stage_entered_at: now,
      funded_at: null, closed_at: null,
      created_by: session.id || 'partner', updated_at: now,
    };
    try { await saveDeal(deal); return ok(res, { ok: true, deal }); }
    catch (e) { return serverError(res, 'failed to create deal'); }
  }

  // ── UPDATE ─────────────────────────────────────────────────────
  if (action === 'update' || body.id) {
    const id = String(body.id || '').trim();
    if (!id) return bad(res, 'id is required');
    let deal;
    try { deal = await getDeal(id); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, `deal ${id} not found`);

    if (body.name             != null) deal.name             = String(body.name).trim();
    if (VALID_TYPES.has(body.type))    deal.type             = body.type;
    if (body.advisor_firm     != null) deal.advisor_firm     = String(body.advisor_firm).trim();
    if (body.advisor_id       !== undefined) deal.advisor_id = body.advisor_id || null;
    if (body.target_alloc_usd != null) deal.target_alloc_usd= Math.max(0, Number(body.target_alloc_usd) || 0);
    if (body.target_irr       != null) deal.target_irr       = Math.max(0, Number(body.target_irr));
    if (body.term_months      != null) deal.term_months      = Math.max(1, Math.round(Number(body.term_months)));
    if (VALID_SOURCES.has(body.funding_source)) deal.funding_source = body.funding_source;
    if (body.ioi_count        != null) deal.ioi_count        = Math.max(0, Math.round(Number(body.ioi_count) || 0));
    if (body.ioi_agg_usd      != null) deal.ioi_agg_usd      = Math.max(0, Number(body.ioi_agg_usd) || 0);
    if (VALID_GATE.has(body.gate_status)) deal.gate_status   = body.gate_status;
    if (body.gate_notes       != null) deal.gate_notes       = String(body.gate_notes).trim();
    if (body.next_action      != null) deal.next_action      = String(body.next_action).trim();
    if (VALID_HEALTH.has(body.health)) deal.health           = body.health;
    if (body.deployed_usd     != null) deal.deployed_usd     = Math.max(0, Number(body.deployed_usd) || 0);
    if (body.notes            != null) deal.notes            = String(body.notes).trim();
    if (body.funded_at        !== undefined) deal.funded_at  = body.funded_at || null;
    // Extended deal fields (v2 advisor platform)
    if (body.deal_structure      != null) deal.deal_structure      = String(body.deal_structure).trim();
    if (body.geography           != null) deal.geography           = String(body.geography).trim();
    if (body.originator          != null) deal.originator          = String(body.originator).trim();
    if (body.return_type         != null) deal.return_type         = String(body.return_type).trim();
    if (body.hurdle_rate         != null) deal.hurdle_rate         = Math.max(0, Number(body.hurdle_rate));
    if (body.total_deal_size_usd != null) deal.total_deal_size_usd = Math.max(0, Number(body.total_deal_size_usd) || 0);
    if (body.min_ticket_usd      != null) deal.min_ticket_usd      = Math.max(0, Number(body.min_ticket_usd)      || 0);
    if (body.max_ticket_usd      != null) deal.max_ticket_usd      = Math.max(0, Number(body.max_ticket_usd)      || 0);
    if (body.round_name          != null) deal.round_name          = String(body.round_name).trim();
    if (body.round_size_usd      != null) deal.round_size_usd      = Math.max(0, Number(body.round_size_usd) || 0);
    if (body.tacc_platform_fee_pct != null) deal.tacc_platform_fee_pct = Math.min(2, Math.max(0.5, Number(body.tacc_platform_fee_pct)));
    if (body.tacc_carry_pct        != null) deal.tacc_carry_pct        = Math.min(20, Math.max(5, Number(body.tacc_carry_pct)));
    if (body.member_visible !== undefined) deal.member_visible = !!body.member_visible;
    if (Array.isArray(body.documents))     deal.documents     = body.documents;
    if (body.advisor_has_separate_fee  !== undefined) deal.advisor_has_separate_fee  = !!body.advisor_has_separate_fee;
    if (body.advisor_separate_fee_note != null)       deal.advisor_separate_fee_note = String(body.advisor_separate_fee_note).trim();

    // Stage transition
    if (body.stage && VALID_STAGES.has(body.stage) && body.stage !== deal.stage) {
      deal.stage           = body.stage;
      deal.stage_entered_at = new Date().toISOString();
      if (['realized','killed'].includes(body.stage)) deal.closed_at = new Date().toISOString();
      deal.qa = deal.qa || [];
      deal.qa.push({ id:'evt_'+Date.now().toString(36), from:session.id||'partner', role:'partner',
        text:`Stage advanced to ${body.stage.toUpperCase()}.`, ts:new Date().toISOString() });
    }

    // Q&A partner message
    if (body.qa_message) {
      const msg = String(body.qa_message).trim();
      if (msg) {
        deal.qa = deal.qa || [];
        deal.qa.push({ id:'qa_'+Date.now().toString(36), from:session.id||'partner',
          role:'partner', text:msg, ts:new Date().toISOString() });
      }
    }

    try { await saveDeal(deal); return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } }); }
    catch (e) { return serverError(res, 'failed to update deal'); }
  }

  return bad(res, `unknown deals action: ${action}`);
}

// ═══════════════════════════════════════════════════════════════
// ADVISOR — login / logout / me / deals / create / seed
// Absorbs api/advisor/*.js
// ═══════════════════════════════════════════════════════════════
const ADV_SESSION_TTL  = 60 * 60 * 24 * 30;
const ADV_COOKIE       = 'aurum_advisor';

async function getAdvisorSession(req) {
  const tok     = getCookie(req, ADV_COOKIE);
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor' || !session.advisorId) return null;
  const adv = await getAdvisor(session.advisorId).catch(() => null);
  if (!adv || adv.status === 'suspended') return null;
  return { session, advisor: adv };
}

async function handleAdvisor(req, res, op) {
  // ── LOGIN ──────────────────────────────────────────────────────
  if (op === 'login') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const email    = String(body.email    || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    if (!email || !password) return bad(res, 'email and password required');
    let advisor = null;
    try { advisor = await findAdvisorByEmail(email); } catch (e) {
      return serverError(res, 'login failed');
    }
    const match = advisor ? verifyPassword(password, advisor.password_hash || '') : false;
    if (!advisor || !match) {
      await new Promise(r => setTimeout(r, 400));
      return unauthorized(res, 'invalid credentials');
    }
    if (advisor.status === 'suspended') return unauthorized(res, 'account suspended');
    try { await saveAdvisor({ ...advisor, last_login_at: new Date().toISOString() }); } catch {}
    const token = signToken({ sub:'advisor', advisorId:advisor.id, firm:advisor.firm }, ADV_SESSION_TTL);
    setCookie(res, ADV_COOKIE, token, { maxAge: ADV_SESSION_TTL, sameSite:'Lax' });
    return ok(res, { ok: true, advisor: safeAdvisor(advisor) });
  }

  // ── LOGOUT ────────────────────────────────────────────────────
  if (op === 'logout') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    clearCookie(res, ADV_COOKIE);
    return ok(res, { ok: true });
  }

  // ── ME ────────────────────────────────────────────────────────
  if (op === 'me') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

    // Partners (admin cookie) get full portal access — no separate advisor login needed
    const adminTok = getCookie(req, 'aurum_admin');
    const adminSess = verifyToken(adminTok);
    if (adminSess && adminSess.sub === 'admin') {
      let allDeals = [];
      try { allDeals = (await listDeals(200)).map(d => ({ ...d, days_in_stage: daysInStage(d) })); } catch {}
      return ok(res, {
        ok: true, role: 'partner',
        advisor: { id: 'partner', name: adminSess.id || 'Partner', firm: 'Aurum Century Club', email: adminSess.email || '', status: 'active' },
        deals: allDeals,
      });
    }

    const auth = await getAdvisorSession(req);
    if (!auth) return ok(res, { ok: false, reason: 'no-session' });
    let deals = [];
    try {
      const all = await listDeals(200);
      deals = all
        .filter(d => d.advisor_id === auth.advisor.id || d.advisor_firm === auth.advisor.firm)
        .map(d => ({ ...d, days_in_stage: daysInStage(d) }));
    } catch {}
    return ok(res, { ok: true, role: 'advisor', advisor: safeAdvisor(auth.advisor), deals });
  }

  // ── DEALS (advisor-scoped: submit | qa | update) ──────────────
  if (op === 'deals') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const auth = await getAdvisorSession(req);
    if (!auth) return unauthorized(res);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const { advisor } = auth;
    const action = String(body.action || '').trim();

    if (action === 'submit') {
      const name = String(body.name || '').trim();
      if (!name) return bad(res, 'name is required');
      const now  = new Date().toISOString();
      const deal = {
        id: generateDealId(), name,
        type: VALID_TYPES.has(body.type) ? body.type : 'pe',
        stage: 'review', advisor_id: advisor.id, advisor_firm: advisor.firm,
        target_alloc_usd: 0,
        target_irr: body.target_irr ? Math.max(0, Number(body.target_irr)) : null,
        term_months: body.term_months ? Math.max(1, Math.round(Number(body.term_months))) : null,
        funding_source: body.funding_source === 'reserve' ? 'reserve' : 'ltv',
        ioi_count: 0, ioi_agg_usd: 0,
      documents: [], gate_status: 'open',
        gate_notes: String(body.gate_notes || 'Submitted for TACC review').trim(),
        next_action: 'Initial credit review', health: 'green', deployed_usd: 0,
        notes: String(body.notes || '').trim(),
        // Extended deal fields (v2 advisor platform)
        deal_structure:      String(body.deal_structure   || '').trim(),
        geography:           String(body.geography        || '').trim(),
        originator:          String(body.originator       || '').trim(),
        return_type:         String(body.return_type      || '').trim(),
        hurdle_rate:         body.hurdle_rate != null ? Math.max(0, Number(body.hurdle_rate)) : 8,
        total_deal_size_usd: Math.max(0, Number(body.total_deal_size_usd) || 0),
        min_ticket_usd:      Math.max(0, Number(body.min_ticket_usd)      || 0),
        max_ticket_usd:      Math.max(0, Number(body.max_ticket_usd)      || 0),
        tacc_platform_fee_pct: 1,
        tacc_carry_pct:        12,
        member_visible:      false,
        advisor_has_separate_fee:  !!body.advisor_has_separate_fee,
        advisor_separate_fee_note: String(body.advisor_separate_fee_note || '').trim(),
        qa: [{ id:'qa_'+Date.now().toString(36), from:advisor.name||advisor.firm, role:'advisor',
          text: body.intro_note ? String(body.intro_note).trim() : `Deal submitted by ${advisor.firm}.`,
          ts: now }],
        created_at: now, stage_entered_at: now, funded_at: null, closed_at: null,
        created_by: advisor.id, updated_at: now,
      };
      try { await saveDeal(deal); return ok(res, { ok: true, deal: { ...deal, days_in_stage: 0 } }); }
      catch (e) { return serverError(res, 'submit failed'); }
    }

    if (action === 'qa') {
      const dealId = String(body.deal_id || '').trim();
      const text   = String(body.text    || '').trim();
      if (!dealId || !text) return bad(res, 'deal_id and text required');
      let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
      if (!deal) return notFound(res, 'deal not found');
      if (deal.advisor_id !== advisor.id && deal.advisor_firm !== advisor.firm) return unauthorized(res, 'not your deal');
      deal.qa = deal.qa || [];
      deal.qa.push({ id:'qa_'+Date.now().toString(36), from:advisor.name||advisor.firm,
        role:'advisor', text, ts:new Date().toISOString() });
      try { await saveDeal(deal); return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } }); }
      catch { return serverError(res, 'save failed'); }
    }

    if (action === 'update') {
      const dealId = String(body.deal_id || '').trim();
      if (!dealId) return bad(res, 'deal_id required');
      let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
      if (!deal) return notFound(res, 'deal not found');
      if (deal.advisor_id !== advisor.id && deal.advisor_firm !== advisor.firm) return unauthorized(res, 'not your deal');
      if (body.gate_notes  != null) deal.gate_notes  = String(body.gate_notes).trim();
    if (Array.isArray(body.documents)) deal.documents = body.documents;
      if (body.next_action != null) deal.next_action = String(body.next_action).trim();
      if (body.notes       != null) deal.notes       = String(body.notes).trim();
      try { await saveDeal(deal); return ok(res, { ok: true, deal: { ...deal, days_in_stage: daysInStage(deal) } }); }
      catch { return serverError(res, 'update failed'); }
    }

    return bad(res, `unknown advisor deals action: ${action}`);
  }

  // ── CREATE ADVISOR (admin-gated) — sends setup link, no password in UI ──
  if (op === 'create') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const adminSession = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSession || adminSession.sub !== 'admin') return unauthorized(res);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const name  = String(body.name  || '').trim();
    const firm  = String(body.firm  || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!name || !firm || !email) return bad(res, 'name, firm and email are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'invalid email');
    const existing = await findAdvisorByEmail(email).catch(() => null);
    if (existing) return bad(res, `an advisor with this email already exists`);
    const now = new Date().toISOString();
    const adv = {
      id: generateAdvisorId(), name, firm, email,
      password_hash: null,          // set by advisor via setup link
      intro_fee_pct: Math.max(0, Number(body.intro_fee_pct ?? 1.0)),
      carry_pct: Math.max(0, Number(body.carry_pct ?? 0)),
      notes: String(body.notes || '').trim(), status: 'pending',
      created_at: now, created_by: adminSession.id || 'partner',
      last_login_at: null, updated_at: now,
    };
    try { await saveAdvisor(adv); } catch(e) { return serverError(res, 'create failed'); }

    // Mint a 7-day setup token
    const setupToken = signToken({ sub: 'advisor-setup', advisorId: adv.id, email, nonce: Math.random().toString(36).slice(2) }, 60 * 60 * 24 * 7);
    const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
    const setupUrl = `${siteUrl}/advisor-setup?token=${encodeURIComponent(setupToken)}`;

    let mailResult = { sent: false, reason: 'not attempted' };
    try {
      const tpl = buildAdvisorSetupEmail({ advisor: adv, setupUrl, siteUrl });
      mailResult = await sendRaw({ to: adv.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    } catch(e) { console.warn('[advisor/create] email failed', e && e.message); }

    return ok(res, { ok: true, advisor: safeAdvisor(adv), setup_url: setupUrl, email: mailResult });
  }

  // ── SETUP ADVISOR (first-time password from email link) ──────────────────
  if (op === 'setup') {
    // GET: validate token
    if (req.method === 'GET') {
      const q = new URL('http://x' + req.url).searchParams;
      const token = String(q.get('token') || '').trim();
      if (!token) return bad(res, 'missing token');
      const sess = verifyToken(token);
      if (!sess || sess.sub !== 'advisor-setup') return unauthorized(res, 'invalid or expired setup link');
      const adv = await getAdvisor(sess.advisorId).catch(() => null);
      if (!adv) return unauthorized(res, 'advisor not found');
      if (adv.status === 'active' && adv.password_hash) return bad(res, 'already set up — sign in at /login?r=advisor');
      return ok(res, { ok: true, name: adv.name, firm: adv.firm, email: adv.email });
    }
    // POST: set password
    if (req.method === 'POST') {
      let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
      const token    = String(body.token || '').trim();
      const password = String(body.password || '');
      const confirm  = String(body.confirm || '');
      if (!token) return bad(res, 'missing token');
      if (!password || password.length < 8) return bad(res, 'password must be at least 8 characters');
      if (password !== confirm) return bad(res, 'passwords do not match');
      const sess = verifyToken(token);
      if (!sess || sess.sub !== 'advisor-setup') return unauthorized(res, 'invalid or expired setup link');
      const adv = await getAdvisor(sess.advisorId).catch(() => null);
      if (!adv) return unauthorized(res, 'advisor not found');
      // One-time use check
      const usedKey = `used:${sess.iat}:${sess.nonce || ''}:${sess.exp}`;
      if ((adv._used_tokens || []).includes(usedKey)) return unauthorized(res, 'setup link already used');
      adv.password_hash = hashPassword(password);
      adv.status = 'active';
      adv.password_set_at = new Date().toISOString();
      adv._used_tokens = [...(adv._used_tokens || []).slice(-9), usedKey];
      try { await saveAdvisor(adv); } catch(e) { return serverError(res, 'save failed'); }
      // Issue session cookie
      const sessionTok = signToken({ sub: 'advisor', advisorId: adv.id, firm: adv.firm }, ADV_SESSION_TTL);
      setCookie(res, 'aurum_advisor', sessionTok, { maxAge: ADV_SESSION_TTL, sameSite: 'Lax' });
      return ok(res, { ok: true, redirect: '/advisor' });
    }
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  // ── SEED ADVISORS (admin-gated, delete before prod) ───────────
  if (op === 'seed') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const adminSession = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSession || adminSession.sub !== 'admin') return unauthorized(res);
    const SEED = [
      { id:'adv_apex001', name:'Jin-ho Park', firm:'Apex Credit Management', email:'jpark@apexcredit.sg', _pw:'ApexAdv2026!', intro_fee_pct:1.0, carry_pct:0, notes:'Primary credit sourcing partner.' },
      { id:'adv_sgcap002', name:'Wei-Lin Tan', firm:'SG Capital Group', email:'wtan@sgcapital.sg', _pw:'SGCap2026!', intro_fee_pct:1.5, carry_pct:0, notes:'PE secondaries specialist.' },
      { id:'adv_meridian003', name:'Daniel Cho', firm:'Meridian Capital', email:'dcho@meridiancap.co', _pw:'Meridian2026!', intro_fee_pct:1.0, carry_pct:0, notes:'Asia infra + PE.' },
    ];
    const now = new Date().toISOString();
    const creds = [];
    try {
      for (const a of SEED) {
        await saveAdvisor({ ...a, password_hash: hashPassword(a._pw), status:'active',
          created_at: now, created_by: adminSession.id || 'partner', last_login_at: null, updated_at: now });
        creds.push({ id: a.id, email: a.email, password: a._pw });
      }
      return ok(res, { ok: true, seeded: creds.length, credentials: creds,
        message: 'Seed complete. Credentials shown once. Delete seed op before production.' });
    } catch (e) { return serverError(res, 'seed failed: ' + e.message); }
  }

  return bad(res, `unknown advisor op: ${op}`);
}

// ═══════════════════════════════════════════════════════════════
// MEMBER — portfolio data (member-scoped)
// Absorbs api/member/me.js
// ═══════════════════════════════════════════════════════════════
async function handleMember(req, res, op) {
  if (op !== 'me' && op !== '') return bad(res, `unknown member op: ${op}`);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok     = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) {
    return ok(res, { ok: false, reason: 'no-session' });
  }

  let lead;
  try { lead = await getLead(session.leadId); } catch {
    return ok(res, { ok: false, reason: 'lookup-failed' });
  }
  if (!lead) return ok(res, { ok: false, reason: 'no-lead' });
  if (lead.code_revoked) return ok(res, { ok: false, reason: 'revoked' });
  if (lead.nda_state !== 'approved') return ok(res, { ok: false, reason: 'nda-not-approved' });
  if (!lead.ioi || !lead.ioi.submitted_at) return ok(res, { ok: false, reason: 'no-ioi' });

  let spot = null;
  try { spot = await getKrwPerKg(); } catch {}

  const auditLabels = {
    nda_approved:     { en:'NDA approved · Portal access activated', ko:'NDA 승인 · 포털 접속 활성화' },
    ioi_submitted:    { en:'Indication of Interest submitted', ko:'투자의향서 제출 완료' },
    ioi_verified:     { en:'IOI verified · Wire instructions issued', ko:'IOI 확인 · 송금 안내 발송' },
    wire_received:    { en:'Wire received · Clearance in progress', ko:'송금 수령 · 정산 진행 중' },
    wire_cleared:     { en:'Wire cleared · Gold purchased · Member admitted', ko:'정산 완료 · 금 매입 · 회원 가입 확정' },
    bars_assigned:    { en:'Gold bars assigned · Vault confirmed', ko:'금괴 배정 · 보관 확인' },
    position_opened:  { en:'Deal position opened', ko:'딜 포지션 개설' },
    quarterly_statement:{ en:'Quarterly statement issued', ko:'분기 보고서 발행' },
  };
  const memberAudit = (lead.audit || [])
    .filter(a => auditLabels[a.action])
    .sort((a, b) => b.at - a.at).slice(0, 20)
    .map(a => ({ at: a.at, en: auditLabels[a.action]?.en || a.action, ko: auditLabels[a.action]?.ko || a.action }));

  return ok(res, {
    ok: true, viewer:'member', viewer_id: lead.email || lead.code || 'member',
    member: { name:lead.name||'', name_ko:lead.name_ko||'', email:lead.email||'', code:lead.code||'' },
    ioi: { kg:lead.ioi.kg, ltv_pct_requested:lead.ioi.ltv_pct, submitted_at:lead.ioi.submitted_at,
      verified_at:lead.ioi_verified_at||null, krw_at_submit:lead.ioi.krw_at_submit||null,
      krw_per_kg_at_submit:lead.ioi.krw_per_kg_at_submit||null,
      krw_per_kg_at_settle:lead.ioi.krw_per_kg_at_settle||null },
    wire: { ref:(lead.wire?.ref)||null, instructions_sent_at:(lead.wire?.instructions_sent_at)||null,
      wired_at:(lead.wire?.wired_at)||null, cleared_at:(lead.wire?.cleared_at)||null,
      amount_krw:(lead.wire?.amount_krw)||null },
    bars:lead.bars||[], ltv:lead.ltv||{drawn_krw:0,ceiling_pct:lead.ioi.ltv_pct||65,margin_pct:80},
    docs:lead.docs||[], positions:lead.positions||[], capital_calls:lead.capital_calls||[],
    activity:memberAudit, spot,
  });
}


// ═══════════════════════════════════════════════════════════════
// PUBLIC STATS — no auth required, returns member count for /main
// GET /api/v2?resource=public&op=stats
// ═══════════════════════════════════════════════════════════════
async function handlePublic(req, res, op) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const leads = await listLeads(500).catch(() => []);
    // Admitted = wire cleared (full members on the book)
    const admitted = leads.filter(l => l.wire && l.wire.cleared_at).length;
    // Capacity is fixed at 100
    const capacity = 100;
    const remaining = Math.max(0, capacity - admitted);
    const pct = Math.round(admitted / capacity * 100);
    // Set aggressive cache headers — fresh enough for live feel, not hammering storage
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return ok(res, { ok: true, admitted, capacity, remaining, pct });
  } catch (e) {
    console.error('[public/stats]', e);
    // Fallback — never expose errors publicly
    return ok(res, { ok: true, admitted: 0, capacity: 100, remaining: 100, pct: 0 });
  }
}


// ═══════════════════════════════════════════════════════════════
// ADVISORS LIST — admin views all advisor accounts + their deals
// GET /api/v2?resource=advisors&op=list
// ═══════════════════════════════════════════════════════════════
async function handleAdvisorsList(req, res, op) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  try {
    const advisors = await listAdvisors(200);
    const allDeals = await listDeals(200).catch(() => []);

    // Attach deals to each advisor
    const result = advisors.map(adv => {
      const advDeals = allDeals
        .filter(d => d.advisor_id === adv.id || d.advisor_firm === adv.firm)
        .map(d => ({ ...d, days_in_stage: daysInStage(d) }));
      return { ...safeAdvisor(adv), deals: advDeals };
    });

    return ok(res, { ok: true, advisors: result, count: result.length });
  } catch (e) {
    console.error('[advisors/list]', e);
    return serverError(res, 'failed to list advisors');
  }
}
