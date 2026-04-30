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
    case 'deal':    return handleDealInteraction(req, res, op);
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
    const NOW = new Date().toISOString();
    const SEED = [
      {
        id: 'deal_pc5',
        name: 'Pacific Credit V',
        type: 'credit',
        stage: 'live',
        advisor_id: null,
        advisor_firm: 'Apex Credit Management',
        originator: 'Apex Credit Management',
        deal_structure: 'senior_secured',
        geography: 'apac',
        return_type: 'fixed_coupon',
        hurdle_rate: 8,
        target_irr: 11,
        term_months: 18,
        funding_source: 'ltv',
        total_deal_size_usd: 8_000_000,
        target_alloc_usd: 1_200_000,
        round_name: 'Series A',
        round_size_usd: 1_200_000,
        min_ticket_usd: 50_000,
        max_ticket_usd: 300_000,
        tacc_platform_fee_pct: 1.0,
        tacc_carry_pct: 10,
        member_visible: true,
        ioi_count: 0,
        ioi_agg_usd: 0,
        deal_iois: [],
        deployed_usd: 0,
        gate_status: 'open',
        gate_notes: 'Published for member IOI. All docs being prepared.',
        next_action: 'Collect member IOIs through May 30',
        health: 'green',
        notes: 'Senior secured bridge facility providing first-lien financing to a portfolio of restructuring credits across Korea and Japan. The GP has deployed $4.2B across 3 prior vintages with zero principal loss events. Personal guarantee from controlling shareholder. LTV collar capped at 65%. Quarterly coupon payments with early redemption option at 12 months at par.',
        documents_v2: [],
        subscription_docs: [],
        timeline: [
          { label: 'Deal submitted', date: 'Jan 14, 2026', status: 'done', description: 'CIM and teaser received from Apex Credit Management. Partner review initiated.' },
          { label: 'TACC approval', date: 'Jan 22, 2026', status: 'done', description: 'Credit committee approved. Allocation set at $1.2M. Published to member marketplace.' },
          { label: 'IOI window open', date: 'Apr 29, 2026', status: 'curr', description: 'Members may submit indicative IOIs. Data room opens automatically on submission.' },
          { label: 'IOI close & allocation', date: 'May 30, 2026', status: 'future', description: 'IOI window closes. TACC finalises allocation. Subscription documents issued to confirmed investors.' },
          { label: 'First draw / funding', date: 'Jun 15, 2026', status: 'future', description: 'Capital called. Wire instructions issued. Positions opened on member portfolios.' },
          { label: 'Expected maturity', date: 'Dec 15, 2027', status: 'future', description: 'Full principal redemption plus final coupon. 18-month term from first draw.' },
        ],
        data_room: { requires_nda: false, closing_date: '2026-05-30T23:59:00+08:00' },
        qa: [],
        created_at: '2026-01-14T08:00:00Z',
        stage_entered_at: '2026-04-29T09:00:00Z',
        funded_at: null, closed_at: null, created_by: 'seed',
      },
      {
        id: 'deal_hel',
        name: 'Project Helios',
        type: 'pe',
        stage: 'live',
        advisor_id: null,
        advisor_firm: 'SG Capital Group',
        originator: 'SG Capital Group',
        deal_structure: 'equity_secondary',
        geography: 'sg',
        return_type: 'equity_upside',
        hurdle_rate: 8,
        target_irr: 22,
        term_months: 48,
        funding_source: 'ltv',
        total_deal_size_usd: 40_000_000,
        target_alloc_usd: 2_000_000,
        round_name: 'Pre-IPO Secondary',
        round_size_usd: 2_000_000,
        min_ticket_usd: 100_000,
        max_ticket_usd: 500_000,
        tacc_platform_fee_pct: 1.5,
        tacc_carry_pct: 15,
        member_visible: true,
        ioi_count: 0,
        ioi_agg_usd: 0,
        deal_iois: [],
        deployed_usd: 0,
        gate_status: 'open',
        gate_notes: 'Published for member IOI.',
        next_action: 'Collect member IOIs through Jun 14',
        health: 'green',
        notes: 'Late-stage pre-IPO secondary in a Singapore-headquartered enterprise AI platform used by Fortune 500 firms across APAC. Revenue growing at 3x YoY with clear IPO pathway targeted for H1 2028 on SGX or NASDAQ. Allocation sourced through a direct co-investor relationship. Secondary at a 12% discount to latest primary round valuation. TACC routes through an SPV with full LP documentation.',
        documents_v2: [],
        subscription_docs: [],
        timeline: [
          { label: 'Deal submitted', date: 'Feb 3, 2026', status: 'done', description: 'Pre-IPO secondary teaser received. Co-investor relationship confirmed.' },
          { label: 'TACC approval', date: 'Feb 18, 2026', status: 'done', description: 'Investment committee approved. SPV structure confirmed. Allocation $2M.' },
          { label: 'IOI window open', date: 'Apr 29, 2026', status: 'curr', description: 'Members may express interest. Data room (including company brief and SPV term sheet) opens on IOI submission.' },
          { label: 'IOI close', date: 'Jun 14, 2026', status: 'future', description: 'IOI window closes. TACC allocates pro-rata. Subscription docs issued.' },
          { label: 'SPV close', date: 'Jul 1, 2026', status: 'future', description: 'SPV formed. Capital called. Member positions opened.' },
          { label: 'Target IPO window', date: 'H1 2028', status: 'future', description: 'Target IPO on SGX or NASDAQ. Exit and distribution to SPV LPs.' },
        ],
        data_room: { requires_nda: false, closing_date: '2026-06-14T23:59:00+08:00' },
        qa: [],
        created_at: '2026-02-03T08:00:00Z',
        stage_entered_at: '2026-04-29T09:00:00Z',
        funded_at: null, closed_at: null, created_by: 'seed',
      },
      {
        id: 'deal_mbc',
        name: 'Marina Bay Commerce',
        type: 're',
        stage: 'live',
        advisor_id: null,
        advisor_firm: 'Prime Real Estate Partners',
        originator: 'Prime Real Estate Partners',
        deal_structure: 'bridge',
        geography: 'sg',
        return_type: 'fixed_coupon',
        hurdle_rate: 0,
        target_irr: 14,
        term_months: 12,
        funding_source: 'ltv',
        total_deal_size_usd: 12_000_000,
        target_alloc_usd: 850_000,
        round_name: 'Bridge Tranche A',
        round_size_usd: 850_000,
        min_ticket_usd: 50_000,
        max_ticket_usd: 200_000,
        tacc_platform_fee_pct: 1.0,
        tacc_carry_pct: 10,
        member_visible: true,
        ioi_count: 0,
        ioi_agg_usd: 0,
        deal_iois: [],
        deployed_usd: 0,
        gate_status: 'open',
        gate_notes: 'Published for member IOI. Short window — closes end of May.',
        next_action: 'Collect member IOIs through May 23',
        health: 'green',
        notes: 'Senior bridge loan secured against a Grade A commercial asset in the Marina Bay Financial Centre precinct. Borrower is a licensed property developer with $800M AUM in Singapore. First-ranking mortgage over the asset. LTV at close not to exceed 55%. 12-month term with a 3-month extension option. Fixed coupon of 14% per annum paid monthly. Clean exit via refinance by a major Singapore bank already in advanced discussions.',
        documents_v2: [],
        subscription_docs: [],
        timeline: [
          { label: 'Deal submitted', date: 'Mar 10, 2026', status: 'done', description: 'Senior bridge loan submission. Valuation report and borrower financials received.' },
          { label: 'TACC approval', date: 'Mar 24, 2026', status: 'done', description: 'Credit approved. First-ranking mortgage confirmed. Allocation set at $850K.' },
          { label: 'IOI window open', date: 'Apr 29, 2026', status: 'curr', description: 'Short IOI window. Deal closes May 23. Data room opens on submission.' },
          { label: 'IOI close', date: 'May 23, 2026', status: 'future', description: 'Hard close. No extensions. Subscription docs issued to confirmed investors.' },
          { label: 'Drawdown', date: 'Jun 1, 2026', status: 'future', description: 'Capital drawn. Mortgage registered. Monthly coupons commence.' },
          { label: 'Maturity / exit', date: 'Jun 1, 2027', status: 'future', description: 'Bridge repaid via refinance. Principal + final coupon returned to members.' },
        ],
        data_room: { requires_nda: false, closing_date: '2026-05-23T23:59:00+08:00' },
        qa: [],
        created_at: '2026-03-10T08:00:00Z',
        stage_entered_at: '2026-04-29T09:00:00Z',
        funded_at: null, closed_at: null, created_by: 'seed',
      },
      {
        id: 'deal_aid',
        name: 'Asia Infrastructure Debt II',
        type: 'infra',
        stage: 'live',
        advisor_id: null,
        advisor_firm: 'Meridian Infrastructure Capital',
        originator: 'Meridian Infrastructure Capital',
        deal_structure: 'mezzanine',
        geography: 'sea',
        return_type: 'hybrid',
        hurdle_rate: 7,
        target_irr: 10,
        term_months: 60,
        funding_source: 'reserve',
        total_deal_size_usd: 25_000_000,
        target_alloc_usd: 3_000_000,
        round_name: 'Mezz Tranche',
        round_size_usd: 3_000_000,
        min_ticket_usd: 100_000,
        max_ticket_usd: 500_000,
        tacc_platform_fee_pct: 1.0,
        tacc_carry_pct: 10,
        member_visible: true,
        ioi_count: 0,
        ioi_agg_usd: 0,
        deal_iois: [],
        deployed_usd: 0,
        gate_status: 'open',
        gate_notes: 'Published for member IOI.',
        next_action: 'Collect member IOIs through Jun 30',
        health: 'green',
        notes: 'Mezzanine debt facility financing three operational renewable energy assets across Vietnam and Indonesia — two solar farms and one run-of-river hydro project with 20-year government offtake agreements. USD-denominated. Backed by USD cash flows. 7% preferred coupon with a 3% PIK kicker payable at maturity. Capital preservation focus with hard asset security. Targeted 10% net IRR over the 5-year term.',
        documents_v2: [],
        subscription_docs: [],
        timeline: [
          { label: 'Deal submitted', date: 'Mar 28, 2026', status: 'done', description: 'Infrastructure debt facility submission with project financials and offtake agreements.' },
          { label: 'TACC approval', date: 'Apr 15, 2026', status: 'done', description: 'Credit committee approved. USD cash flow structure confirmed. Allocation set at $3M.' },
          { label: 'IOI window open', date: 'Apr 29, 2026', status: 'curr', description: 'Members may express interest. Data room includes project summaries and offtake contracts.' },
          { label: 'IOI close', date: 'Jun 30, 2026', status: 'future', description: 'IOI close. Allocation confirmed. Subscription documents issued.' },
          { label: 'Financial close', date: 'Jul 31, 2026', status: 'future', description: 'Mezz facility drawn. Security package registered. Coupon payments begin.' },
          { label: 'Maturity', date: 'Jul 2031', status: 'future', description: 'Principal + PIK kicker returned. 5-year term from financial close.' },
        ],
        data_room: { requires_nda: false, closing_date: '2026-06-30T23:59:00+08:00' },
        qa: [],
        created_at: '2026-03-28T08:00:00Z',
        stage_entered_at: '2026-04-29T09:00:00Z',
        funded_at: null, closed_at: null, created_by: 'seed',
      },
      {
        id: 'deal_kge',
        name: 'Korea Growth Select',
        type: 'equity',
        stage: 'live',
        advisor_id: null,
        advisor_firm: 'Hanwha Alternatives',
        originator: 'Hanwha Alternatives',
        deal_structure: 'primary_equity',
        geography: 'apac',
        return_type: 'equity_upside',
        hurdle_rate: 8,
        target_irr: 18,
        term_months: 36,
        funding_source: 'reserve',
        total_deal_size_usd: 20_000_000,
        target_alloc_usd: 1_500_000,
        round_name: 'Series C Co-invest',
        round_size_usd: 1_500_000,
        min_ticket_usd: 75_000,
        max_ticket_usd: 400_000,
        tacc_platform_fee_pct: 1.5,
        tacc_carry_pct: 15,
        member_visible: true,
        ioi_count: 0,
        ioi_agg_usd: 0,
        deal_iois: [],
        deployed_usd: 0,
        gate_status: 'open',
        gate_notes: 'Published for member IOI.',
        next_action: 'Collect member IOIs through Jun 7',
        health: 'green',
        notes: 'Series C co-investment in a Seoul-headquartered B2B SaaS company providing supply chain intelligence to top-10 Korean conglomerates and their tier-1 suppliers. $42M ARR growing 80% YoY. Net revenue retention of 135%. KKR leading the Series C at a $280M valuation. TACC participates as a co-investor alongside the lead through a direct relationship. 3-year hold with multiple exit paths: strategic M&A, Korean PE buyout, or KOSDAQ IPO.',
        documents_v2: [],
        subscription_docs: [],
        timeline: [
          { label: 'Deal submitted', date: 'Apr 1, 2026', status: 'done', description: 'Series C co-invest submission. KKR lead confirmed. Company financials received.' },
          { label: 'TACC approval', date: 'Apr 18, 2026', status: 'done', description: 'Investment committee approved. Co-invest terms confirmed. Allocation set at $1.5M.' },
          { label: 'IOI window open', date: 'Apr 29, 2026', status: 'curr', description: 'Members may express interest. Data room includes company deck and Series C term sheet.' },
          { label: 'IOI close', date: 'Jun 7, 2026', status: 'future', description: 'IOI close. TACC finalises allocation. Subscription documents issued.' },
          { label: 'Series C close', date: 'Jun 30, 2026', status: 'future', description: 'KKR-led Series C closes. TACC capital deployed alongside lead.' },
          { label: 'Target exit window', date: '2028–2029', status: 'future', description: 'Strategic M&A, KOSDAQ IPO, or PE buyout. 3-year hold from close.' },
        ],
        data_room: { requires_nda: false, closing_date: '2026-06-07T23:59:00+08:00' },
        qa: [],
        created_at: '2026-04-01T08:00:00Z',
        stage_entered_at: '2026-04-29T09:00:00Z',
        funded_at: null, closed_at: null, created_by: 'seed',
      },
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

// ═══════════════════════════════════════════════════════════════
// DEAL INTERACTION — IOI · doc upload · doc serve · wire · position
// All member-facing deal actions for the marketplace
// resource=deal
// ═══════════════════════════════════════════════════════════════

async function handleDealInteraction(req, res, op) {
  const { putPrivate, getPrivate, isConfigured: blobOk } = await import('./_lib/blob.js');
  const { watermarkPdf } = await import('./_lib/pdf-watermark.js');

  // ── Helper: resolve current session across all roles ──────────────────────
  function getSession(req) {
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    if (adminSess && adminSess.sub === 'admin') return { role: 'admin', id: adminSess.id || 'partner', email: adminSess.email || '' };
    const advTok = getCookie(req, 'aurum_advisor');
    const advSess = verifyToken(advTok);
    if (advSess && advSess.sub === 'advisor' && advSess.advisorId) return { role: 'advisor', id: advSess.advisorId, email: advSess.email || '', firm: advSess.firm || '' };
    const memTok = getCookie(req, 'aurum_access');
    const memSess = verifyToken(memTok);
    if (memSess && memSess.sub === 'member' && memSess.leadId) return { role: 'member', id: memSess.leadId, email: memSess.email || '', code: memSess.code || '' };
    const instTok = getCookie(req, 'aurum_inst');
    const instSess = verifyToken(instTok);
    if (instSess && instSess.sub === 'inst' && instSess.investorId) return { role: 'inst', id: instSess.investorId, email: instSess.email || '' };
    return null;
  }

  // ── op: ioi — submit IOI + auto-grant data room ───────────────────────────
  if (op === 'ioi') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess) return unauthorized(res);

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId    = String(body.deal_id    || '').trim();
    const amountUsd = Math.max(0, Number(body.amount_usd) || 0);
    if (!dealId || !amountUsd) return bad(res, 'deal_id and amount_usd required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');
    if (!deal.member_visible && sess.role === 'member') return unauthorized(res, 'deal not published');

    const now = new Date().toISOString();
    deal.deal_iois = deal.deal_iois || [];

    const existing = deal.deal_iois.find(i => i.investor_id === sess.id);
    if (existing) {
      // Update existing
      const oldAmt = existing.amount_usd || 0;
      existing.amount_usd = amountUsd;
      existing.notes = String(body.notes || '').trim();
      existing.updated_at = now;
      deal.ioi_agg_usd = Math.max(0, (deal.ioi_agg_usd || 0) - oldAmt + amountUsd);
    } else {
      deal.deal_iois.push({
        id:              'ioi_' + Date.now().toString(36),
        investor_id:     sess.id,
        investor_email:  sess.email,
        investor_type:   sess.role,
        amount_usd:      amountUsd,
        notes:           String(body.notes || '').trim(),
        submitted_at:    now,
        status:          'pending',            // partner confirms allocation
        data_room_access: true,                // auto-grant (Answer A)
        data_room_granted_at: now,
        subscription_sent_at: null,
        wire_issued_at:  null,
        wire_cleared_at: null,
        position_created_at: null,
        updated_at:      now,
      });
      deal.ioi_count   = (deal.ioi_count   || 0) + 1;
      deal.ioi_agg_usd = (deal.ioi_agg_usd || 0) + amountUsd;
    }

    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }

    // Notify partners
    try {
      const { sendRaw, partnerBcc } = await import('./_lib/email.js');
      const bcc = partnerBcc();
      const subPct = deal.target_alloc_usd > 0
        ? Math.round(deal.ioi_agg_usd / deal.target_alloc_usd * 100) : 0;
      if (bcc) await sendRaw({
        to: bcc[0], bcc: bcc.slice(1),
        subject: `IOI: ${deal.name} — $${(amountUsd/1000).toFixed(0)}K from ${sess.email} (${subPct}% indicated)`,
        html: `<p>New IOI on <strong>${deal.name}</strong><br>Investor: ${sess.email}<br>Amount: $${amountUsd.toLocaleString()}<br>Total IOIs: ${deal.ioi_count} · Indicated: $${(deal.ioi_agg_usd/1000).toFixed(0)}K (${subPct}% of $${(deal.target_alloc_usd/1000).toFixed(0)}K round)<br>Data room access: Granted automatically.</p>`,
        text: `New IOI on ${deal.name} — ${sess.email} — $${amountUsd.toLocaleString()} — ${subPct}% of round indicated`,
      }).catch(() => {});
    } catch {}

    const myIoi = deal.deal_iois.find(i => i.investor_id === sess.id);
    return ok(res, { ok: true, my_ioi: myIoi, deal: { ...deal, days_in_stage: daysInStage(deal) } });
  }

  // ── op: ioi-status — check current user's IOI on a deal ─────────────────
  if (op === 'ioi-status') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const sess = getSession(req);
    const q = getQuery(req);
    const dealId = String(q.deal_id || '').trim();
    if (!dealId) return bad(res, 'deal_id required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    if (!sess) return ok(res, { ok: true, has_ioi: false, data_room_access: false, my_ioi: null });

    const ioi = (deal.deal_iois || []).find(i => i.investor_id === sess.id);
    return ok(res, { ok: true, has_ioi: !!ioi, data_room_access: !!(ioi?.data_room_access), my_ioi: ioi || null });
  }

  // ── op: upload-doc — advisor uploads document to Vercel Blob ─────────────
  if (op === 'upload-doc') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess || !['advisor','admin'].includes(sess.role)) return unauthorized(res);

    if (!blobOk()) return bad(res, 'BLOB_READ_WRITE_TOKEN not configured');

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId      = String(body.deal_id      || '').trim();
    const docName     = String(body.doc_name     || '').trim();
    const docType     = String(body.doc_type     || 'other').trim();
    const accessLevel = ['public','ioi','partner'].includes(body.access_level) ? body.access_level : 'ioi';
    const contentType = String(body.content_type || 'application/pdf').trim();
    const dataB64     = String(body.data_base64  || '').trim();
    if (!dealId || !docName || !dataB64) return bad(res, 'deal_id, doc_name, data_base64 required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');
    if (sess.role === 'advisor' && deal.advisor_id !== sess.id && deal.advisor_firm !== sess.firm) {
      return unauthorized(res, 'not your deal');
    }

    const buf = Buffer.from(dataB64, 'base64');
    if (buf.length > 20 * 1024 * 1024) return bad(res, 'file too large (max 20 MB)');

    const safeName = docName.replace(/[^\w\s.-]/g, '_').slice(0, 80);
    const pathname = `deals/${dealId}/docs/${Date.now()}-${safeName}`;
    let blobResult;
    try { blobResult = await putPrivate(pathname, buf, { contentType }); }
    catch (e) { return serverError(res, 'upload failed: ' + (e.message || '')); }

    const docEntry = {
      id:           'doc_' + Date.now().toString(36),
      name:         docName,
      type:         docType,
      access_level: accessLevel,
      blob_url:     blobResult.url,
      content_type: contentType,
      size_bytes:   buf.length,
      uploaded_at:  new Date().toISOString(),
      uploaded_by:  sess.id,
    };

    deal.documents_v2 = deal.documents_v2 || [];
    // Replace if same name+type already exists
    const existIdx = deal.documents_v2.findIndex(d => d.name === docName && d.type === docType);
    if (existIdx >= 0) deal.documents_v2[existIdx] = docEntry;
    else deal.documents_v2.push(docEntry);

    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }
    return ok(res, { ok: true, doc: docEntry });
  }

  // ── op: doc — serve document with auth check + watermark ─────────────────
  if (op === 'doc') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const sess = getSession(req);
    const q = getQuery(req);
    const dealId = String(q.deal_id || '').trim();
    const docId  = String(q.doc_id  || '').trim();
    if (!dealId || !docId) return bad(res, 'deal_id and doc_id required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    const doc = (deal.documents_v2 || []).find(d => d.id === docId);
    if (!doc) return notFound(res, 'document not found');

    // Auth by access level
    if (doc.access_level === 'public') {
      if (!sess) return unauthorized(res); // Must be logged in at minimum
    } else if (doc.access_level === 'ioi') {
      if (!sess) return unauthorized(res);
      if (sess.role !== 'admin') {
        const ioi = (deal.deal_iois || []).find(i => i.investor_id === sess.id && i.data_room_access);
        if (!ioi && sess.role !== 'advisor') return unauthorized(res, 'data room access required — submit an IOI first');
      }
    } else if (doc.access_level === 'partner') {
      if (!sess || !['admin','advisor'].includes(sess.role)) return unauthorized(res);
    }

    if (!blobOk()) return bad(res, 'BLOB_READ_WRITE_TOKEN not configured');
    const blob = await getPrivate(doc.blob_url).catch(() => null);
    if (!blob) return notFound(res, 'file not found in storage');

    const chunks = [];
    for await (const chunk of blob.stream) chunks.push(chunk);
    const rawBuf = Buffer.concat(chunks);

    let finalBuf = rawBuf;
    if (doc.content_type === 'application/pdf' && sess) {
      try {
        finalBuf = await watermarkPdf(rawBuf, {
          email: sess.email || sess.id,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' SGT',
        });
      } catch (e) { console.warn('watermark failed, serving original', e.message); }
    }

    // Log access
    if (sess && doc.access_level === 'ioi') {
      const ioi = (deal.deal_iois || []).find(i => i.investor_id === sess.id);
      if (ioi && !ioi.data_room_accessed_at) {
        ioi.data_room_accessed_at = new Date().toISOString();
        saveDeal(deal).catch(() => {});
      }
    }

    const ext  = doc.content_type === 'application/pdf' ? '.pdf' : '';
    const fname = doc.name.replace(/[^\w\s.-]/g, '_') + ext;
    res.statusCode = 200;
    res.setHeader('Content-Type', doc.content_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.end(finalBuf);
  }

  // ── op: approve-ioi — admin confirms allocation ───────────────────────────
  if (op === 'approve-ioi') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') return unauthorized(res);

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId     = String(body.deal_id     || '').trim();
    const investorId = String(body.investor_id || '').trim();
    const action     = String(body.action      || 'approve').trim(); // approve | reject
    if (!dealId || !investorId) return bad(res, 'deal_id and investor_id required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    const ioi = (deal.deal_iois || []).find(i => i.investor_id === investorId);
    if (!ioi) return notFound(res, 'IOI not found');

    const now = new Date().toISOString();
    if (action === 'approve') {
      ioi.status         = 'approved';
      ioi.approved_at    = now;
      ioi.approved_by    = sess.id;
      ioi.data_room_access = true;
      // Upload subscription docs if provided
      if (body.subscription_note) ioi.subscription_note = String(body.subscription_note).trim();
      ioi.subscription_sent_at = now;
    } else {
      ioi.status      = 'rejected';
      ioi.rejected_at = now;
      ioi.rejected_by = sess.id;
      ioi.reject_note = String(body.reject_note || '').trim();
      deal.ioi_count   = Math.max(0, (deal.ioi_count   || 0) - 1);
      deal.ioi_agg_usd = Math.max(0, (deal.ioi_agg_usd || 0) - (ioi.amount_usd || 0));
    }

    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }
    return ok(res, { ok: true, ioi, deal: { ...deal, days_in_stage: daysInStage(deal) } });
  }

  // ── op: wire-issue — admin issues wire instructions to investor ───────────
  if (op === 'wire-issue') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') return unauthorized(res);

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId     = String(body.deal_id     || '').trim();
    const investorId = String(body.investor_id || '').trim();
    if (!dealId || !investorId) return bad(res, 'deal_id and investor_id required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    const ioi = (deal.deal_iois || []).find(i => i.investor_id === investorId);
    if (!ioi) return notFound(res, 'IOI not found');

    ioi.wire_instructions = String(body.wire_instructions || '').trim();
    ioi.wire_ref          = String(body.wire_ref          || `TACC-${deal.id.slice(-4).toUpperCase()}-${investorId.slice(-4).toUpperCase()}`).trim();
    ioi.wire_issued_at    = new Date().toISOString();

    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }

    // Email investor
    try {
      const { sendRaw } = await import('./_lib/email.js');
      if (ioi.investor_email) await sendRaw({
        to: ioi.investor_email,
        subject: `Wire Instructions — ${deal.name} · TACC`,
        html: `<p>Your allocation in <strong>${deal.name}</strong> has been confirmed at <strong>USD ${ioi.amount_usd?.toLocaleString()}</strong>.<br><br>Wire reference: <strong>${ioi.wire_ref}</strong><br><br>${ioi.wire_instructions || 'Your TACC partner will follow up with full wire details.'}<br><br>Please reply to this email to confirm receipt.</p>`,
        text: `Wire instructions for ${deal.name}. Ref: ${ioi.wire_ref}. Amount: USD ${ioi.amount_usd?.toLocaleString()}.`,
      }).catch(() => {});
    } catch {}

    return ok(res, { ok: true, ioi, deal: { ...deal, days_in_stage: daysInStage(deal) } });
  }

  // ── op: wire-confirm — admin confirms wire received → create position ────
  if (op === 'wire-confirm') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') return unauthorized(res);

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId     = String(body.deal_id     || '').trim();
    const investorId = String(body.investor_id || '').trim();
    if (!dealId || !investorId) return bad(res, 'deal_id and investor_id required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    const ioi = (deal.deal_iois || []).find(i => i.investor_id === investorId);
    if (!ioi) return notFound(res, 'IOI not found');

    const now = new Date().toISOString();
    ioi.wire_cleared_at   = now;
    ioi.position_created_at = now;
    ioi.status            = 'funded';

    // Update deal deployed_usd
    deal.deployed_usd = (deal.deployed_usd || 0) + (ioi.amount_usd || 0);

    // If member (TACC), append a position to their lead record
    if (ioi.investor_type === 'member') {
      try {
        const lead = await getLead(investorId);
        if (lead) {
          lead.positions = lead.positions || [];
          lead.positions.push({
            deal_id:    dealId,
            deal_name:  deal.name,
            amount_usd: ioi.amount_usd,
            opened_at:  now,
            type:       deal.type,
            stage:      deal.stage,
            expected_irr: deal.target_irr,
            term_months: deal.term_months,
          });
          lead.audit = lead.audit || [];
          lead.audit.push({ at: Date.now(), actor: sess.id, action: 'position_opened', deal_id: dealId, amount_usd: ioi.amount_usd });
          await saveLead(lead);
        }
      } catch (e) { console.warn('position create on lead failed', e.message); }
    }

    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }
    return ok(res, { ok: true, ioi, deal: { ...deal, days_in_stage: daysInStage(deal) } });
  }

  // ── op: sub-doc — upload subscription document for a deal (admin) ─────────
  if (op === 'sub-doc') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') return unauthorized(res);
    if (!blobOk()) return bad(res, 'BLOB_READ_WRITE_TOKEN not configured');

    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId  = String(body.deal_id   || '').trim();
    const docName = String(body.doc_name  || '').trim();
    const dataB64 = String(body.data_base64 || '').trim();
    const ct      = String(body.content_type || 'application/pdf').trim();
    if (!dealId || !docName || !dataB64) return bad(res, 'deal_id, doc_name, data_base64 required');

    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'storage error'); }
    if (!deal) return notFound(res, 'deal not found');

    const buf = Buffer.from(dataB64, 'base64');
    const pathname = `deals/${dealId}/sub-docs/${Date.now()}-${docName.replace(/[^\w.-]/g,'_')}`;
    let blobResult; try { blobResult = await putPrivate(pathname, buf, { contentType: ct }); }
    catch (e) { return serverError(res, 'upload failed'); }

    deal.subscription_docs = deal.subscription_docs || [];
    deal.subscription_docs.push({ id:'sdoc_'+Date.now().toString(36), name:docName, blob_url:blobResult.url, content_type:ct, uploaded_at:new Date().toISOString() });
    try { await saveDeal(deal); } catch { return serverError(res, 'save failed'); }
    return ok(res, { ok: true });
  }

  return bad(res, `unknown deal op: ${op || '(none)'}`);
}
