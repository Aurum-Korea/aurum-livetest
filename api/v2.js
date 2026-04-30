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
    case 'inst':        return handleInst(req, res, op);
    case 'marketplace': return handleMarketplace(req, res, op);
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
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    const advSess   = verifyToken(getCookie(req, 'aurum_advisor'));
    const memberSess= verifyToken(getCookie(req, 'aurum_access'));
    const instSess  = verifyToken(getCookie(req, 'aurum_inst'));
    const hasAccess = adminSess || advSess
      || (memberSess && memberSess.sub === 'member')
      || (instSess   && instSess.sub   === 'inst');
    if (!hasAccess) return unauthorized(res);
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
    const now = new Date().toISOString();
    const SEED = [
      // ── DEAL 1: Pacific Credit V · Due Diligence · Marketplace LIVE ──
      {
        id:'deal_pc5', name:'Pacific Credit V', type:'credit', stage:'dd',
        advisor_id:'adv_apex001', advisor_firm:'Apex Credit Management',
        deal_structure:'senior_secured', geography:'east_asia', originator:'Apex Credit Management',
        return_type:'fixed_coupon', hurdle_rate:8,
        target_alloc_usd:1_200_000, target_irr:11, term_months:18,
        total_deal_size_usd:5_000_000, min_ticket_usd:50_000, max_ticket_usd:300_000,
        round_name:'Pacific Credit V — Senior Tranche', round_size_usd:1_200_000,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:11, ioi_agg_usd:4_800_000, deployed_usd:775_000,
        gate_status:'blocked', gate_notes:'Financial Model + Mgmt Presentation outstanding before Terms.',
        next_action:'Advisor to upload VDR documents. 3 required to advance.', health:'green',
        member_visible:true, marketplace_visible:true,
        mk_irr:11, mk_alloc:1_200_000, mk_min_ticket:50_000, mk_max_ticket:300_000,
        mk_term:18, mk_hurdle:8, mk_return_type:'fixed_coupon',
        mk_closing:'2026-05-30T23:59:00+08:00', mk_badge:'new',
        mk_notes:'Senior secured bridge facility providing first-lien financing to a portfolio of restructuring credits across Korea and Japan. GP has deployed $4.2B across 3 prior vintages with zero principal loss events. Personal guarantee from controlling shareholder. LTV collar capped at 65%. Quarterly coupon payments with early redemption option at 12 months at par.',
        mk_highlights:[
          {s:'GP Track Record',b:'3 prior vintages, $4.2B deployed, zero principal loss events across 14-year history in Asia-Pacific restructuring credit.'},
          {s:'Security Package',b:'Senior secured with first-ranking pledge. Personal guarantee from controlling shareholder. LTV capped at 65%.'},
          {s:'Short Duration',b:'18-month term with quarterly coupon payments. Early redemption at 12 months at par plus accrued interest.'},
          {s:'Strong IOI Momentum',b:'11 IOIs received. Round oversubscribed on indication. Allocation at TACC discretion.'},
        ],
        mk_timeline:[
          {l:'Deal Submitted',d:'Jan 14, 2026',s:'done',desc:'Submitted by Apex Credit Management. CIM and teaser received. Partner review initiated.'},
          {l:'TACC Approval',d:'Jan 22, 2026',s:'done',desc:'Credit committee approved. Allocation set at $1.2M. Published to member marketplace.'},
          {l:'IOI Window Open',d:'Apr 29 – May 30, 2026',s:'curr',desc:'Members and institutions may submit indicative IOIs. Data room opens on TACC approval.'},
          {l:'IOI Close & Allocation',d:'May 30, 2026',s:'future',desc:'IOI window closes. TACC finalises allocation. Subscription documents issued.'},
          {l:'First Draw',d:'Jun 15, 2026',s:'future',desc:'Capital called. Wire instructions issued. Positions opened on portfolios.'},
          {l:'Expected Maturity',d:'Dec 15, 2027',s:'future',desc:'Full principal redemption plus final coupon. 18-month term from first draw.'},
        ],
        mk_docs:[
          {id:'d1',name:'Pacific Credit V — Teaser',type:'pdf',access:'public',size:'1.2 MB',date:'Apr 14, 2026'},
          {id:'d2',name:'CIM — Confidential Information Memorandum',type:'pdf',access:'ioi',size:'8.4 MB',date:'Jan 22, 2026'},
          {id:'d3',name:'Financial Model — Scenarios v3',type:'xlsx',access:'ioi',size:'2.1 MB',date:'Mar 10, 2026'},
          {id:'d4',name:'Management Presentation — Q1 2026',type:'pptx',access:'ioi',size:'12.7 MB',date:'Jan 30, 2026'},
        ],
        mk_activity:[{init:'KS',who:'Member ···S',ts:'2h ago'},{init:'JP',who:'Member ···P',ts:'5h ago'}],
        notes:'Asia-Pacific private credit facility. Senior secured. Strong GP track record across 3 prior vintages. 11 IOIs at $4.8M aggregate. LTV collar with personal guarantee from borrower entity.',
        documents:['Teaser / One-Pager','CIM / Info Memo'],
        qa:[
          {id:'qa_001',from:'Jin-ho Park',role:'advisor',text:'Submitted for TACC review. CIM and teaser attached. GP available for call.',ts:'2026-01-14T08:00:00Z'},
          {id:'qa_002',from:'tkj',role:'partner',text:'CIM reviewed. Credit committee approved. Proceed to VDR and financial model upload to advance to Terms. 10-day turnaround once docs received.',ts:'2026-01-17T10:00:00Z'},
          {id:'qa_003',from:'Jin-ho Park',role:'advisor',text:'Understood. Financial model ready. Uploading today. Management presentation to follow by end of week.',ts:'2026-01-18T14:00:00Z'},
        ],
        created_at:'2026-01-14T08:00:00Z', stage_entered_at:'2026-03-01T09:00:00Z',
        funded_at:'2026-03-01T00:00:00Z', closed_at:null, created_by:'tkj', updated_at:now,
      },

      // ── DEAL 2: Project Helios · Terms · Marketplace LIVE ──
      {
        id:'deal_hel', name:'Project Helios', type:'pe', stage:'terms',
        advisor_id:'adv_sgcap002', advisor_firm:'SG Capital Group',
        deal_structure:'equity_secondary', geography:'sea', originator:'SG Capital Group',
        return_type:'equity_upside', hurdle_rate:8,
        target_alloc_usd:2_000_000, target_irr:22, term_months:48,
        total_deal_size_usd:12_000_000, min_ticket_usd:100_000, max_ticket_usd:500_000,
        round_name:'Project Helios — Series C Co-Invest', round_size_usd:2_000_000,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:7, ioi_agg_usd:3_200_000, deployed_usd:200_000,
        gate_status:'open', gate_notes:'Term sheet issued. LP counter-signature pending.', next_action:'LP counter-signature. Then move to Close.', health:'green',
        member_visible:true, marketplace_visible:true,
        mk_irr:22, mk_alloc:2_000_000, mk_min_ticket:100_000, mk_max_ticket:500_000,
        mk_term:48, mk_hurdle:8, mk_return_type:'equity_upside',
        mk_closing:'2026-06-14T23:59:00+08:00', mk_badge:'',
        mk_notes:'Late-stage pre-IPO secondary in a Singapore-headquartered enterprise AI platform used by Fortune 500 firms across APAC. Revenue growing at 3x YoY with IPO pathway targeted for H1 2028. Allocation at a 12% discount to latest primary round valuation. TACC routes through an SPV with full LP documentation.',
        mk_highlights:[
          {s:'Pre-IPO AI Platform',b:'Singapore-HQ enterprise AI, Fortune 500 APAC clients, 3x YoY revenue growth, $280M last primary round valuation.'},
          {s:'12% Secondary Discount',b:'Direct co-investor access at 12% discount to Series C primary. KKR leading the round.'},
          {s:'Multiple Exit Paths',b:'SGX or NASDAQ IPO targeted H1 2028. Strategic M&A and PE buyout also viable.'},
          {s:'SPV Structure',b:'TACC allocates via SPV with full LP documentation, pass-through distributions, clean governance.'},
        ],
        mk_timeline:[
          {l:'Deal Submitted',d:'Feb 3, 2026',s:'done',desc:'Pre-IPO secondary teaser received. Co-investor relationship confirmed.'},
          {l:'TACC Approval',d:'Feb 18, 2026',s:'done',desc:'Investment committee approved. SPV structure confirmed. Allocation $2M.'},
          {l:'IOI Window',d:'Feb 18 – Jun 14, 2026',s:'done',desc:'7 IOIs received. Round oversubscribed. IOI window closed.'},
          {l:'Term Sheet Issued',d:'Apr 22, 2026',s:'curr',desc:'Term sheet issued. LP counter-signature pending. Allocation confirmed pro-rata.'},
          {l:'SPV Close',d:'Jul 1, 2026',s:'future',desc:'SPV formed. Capital called. Member positions opened.'},
          {l:'Target IPO Window',d:'H1 2028',s:'future',desc:'IPO on SGX or NASDAQ. Exit and distribution to SPV LPs.'},
        ],
        mk_docs:[
          {id:'d5',name:'Project Helios — Teaser',type:'pdf',access:'public',size:'2.1 MB',date:'Feb 18, 2026'},
          {id:'d6',name:'Company Brief & SPV Term Sheet',type:'pdf',access:'ioi',size:'5.8 MB',date:'Feb 20, 2026'},
          {id:'d7',name:'Financial Summary — FY2025',type:'xlsx',access:'ioi',size:'1.4 MB',date:'Mar 1, 2026'},
        ],
        mk_activity:[{init:'HK',who:'Member ···K',ts:'4h ago'},{init:'ST',who:'Institution ···T',ts:'8h ago'}],
        notes:'Pre-IPO Singapore AI infrastructure secondary. Allocation confirmed at $2M. IOI closed. Term sheet issued April 2026. Targeting H2 2026 close.',
        documents:['Teaser / One-Pager','CIM / Info Memo','Financial Model','Mgmt. Presentation'],
        qa:[
          {id:'qa_010',from:'Wei-Lin Tan',role:'advisor',text:'Pre-IPO secondary opportunity confirmed. Teaser attached. KKR leading the round.',ts:'2026-02-03T09:00:00Z'},
          {id:'qa_011',from:'jwc',role:'partner',text:'Allocation confirmed at $2M. IOI closed. Term sheet issued April 22. LP counter-signature required to proceed.',ts:'2026-02-28T10:00:00Z'},
        ],
        created_at:'2026-02-03T08:00:00Z', stage_entered_at:'2026-04-22T09:00:00Z',
        funded_at:'2026-04-22T00:00:00Z', closed_at:null, created_by:'jwc', updated_at:now,
      },

      // ── DEAL 3: Marina Bay Commerce · Live IOI · Marketplace LIVE ──
      {
        id:'deal_mbc', name:'Marina Bay Commerce', type:'re', stage:'live',
        advisor_id:'adv_sgcap002', advisor_firm:'Prime Real Estate Partners',
        deal_structure:'bridge', geography:'sg', originator:'Prime Real Estate Partners',
        return_type:'fixed_coupon', hurdle_rate:0,
        target_alloc_usd:850_000, target_irr:14, term_months:12,
        total_deal_size_usd:4_000_000, min_ticket_usd:25_000, max_ticket_usd:200_000,
        round_name:'Marina Bay Commerce — Senior Bridge', round_size_usd:850_000,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:9, ioi_agg_usd:2_700_000, deployed_usd:550_000,
        gate_status:'open', gate_notes:'IOI window open until May 23. 65% filled by confirmed capital.', next_action:'Close IOI May 23. Issue subscription docs.', health:'green',
        member_visible:true, marketplace_visible:true,
        mk_irr:14, mk_alloc:850_000, mk_min_ticket:25_000, mk_max_ticket:200_000,
        mk_term:12, mk_hurdle:0, mk_return_type:'fixed_coupon',
        mk_closing:'2026-05-23T23:59:00+08:00', mk_badge:'closing',
        mk_notes:'Senior bridge loan secured against a Grade A commercial asset in the Marina Bay Financial Centre precinct. First-ranking mortgage. LTV not to exceed 55%. 12-month term with a 3-month extension option at par. Monthly coupon payments from day one.',
        mk_highlights:[
          {s:'Grade A Security',b:'First-ranking mortgage over Marina Bay CBD asset. Independent JLL valuation confirms clean LTV at 55%.'},
          {s:'Fixed 14% Coupon',b:'Monthly coupon payments from day one. Income-focused, no equity risk or performance dependency.'},
          {s:'Clear Exit',b:'Refinance by major Singapore bank in advanced discussions. 12-month bridge with 3-month extension.'},
          {s:'Short Window',b:'IOI closes May 23. Hard deadline — no extensions. Round 65% filled by confirmed capital.'},
        ],
        mk_timeline:[
          {l:'Deal Submitted',d:'Mar 10, 2026',s:'done',desc:'Senior bridge loan submission. Valuation report and borrower financials received.'},
          {l:'TACC Approval',d:'Mar 24, 2026',s:'done',desc:'Credit approved. First-ranking mortgage confirmed. Allocation set at $850K.'},
          {l:'IOI Window Open',d:'Apr 29 – May 23, 2026',s:'curr',desc:'Short IOI window. Hard close May 23. No extensions.'},
          {l:'IOI Close · Hard Deadline',d:'May 23, 2026',s:'future',desc:'Subscription docs issued to confirmed investors.'},
          {l:'Drawdown',d:'Jun 1, 2026',s:'future',desc:'Capital drawn. Mortgage registered. Monthly coupons commence.'},
          {l:'Maturity / Exit',d:'Jun 1, 2027',s:'future',desc:'Bridge repaid via refinance. Principal plus final coupon returned.'},
        ],
        mk_docs:[
          {id:'d8',name:'Marina Bay Commerce — Teaser',type:'pdf',access:'public',size:'1.4 MB',date:'Mar 24, 2026'},
          {id:'d9',name:'CIM + Valuation Report (JLL)',type:'pdf',access:'ioi',size:'9.2 MB',date:'Mar 25, 2026'},
          {id:'d10',name:'Loan Term Sheet',type:'pdf',access:'ioi',size:'0.8 MB',date:'Apr 1, 2026'},
        ],
        mk_activity:[{init:'PJ',who:'Member ···J',ts:'1h ago'},{init:'LW',who:'Institution ···W',ts:'3h ago'},{init:'CR',who:'Member ···R',ts:'6h ago'}],
        notes:'Singapore CBD senior bridge loan. 12-month duration. Clean security. IOI window open until May 23, 2026. Exit via asset sale or refinance.',
        documents:['Teaser / One-Pager','CIM / Info Memo'],
        qa:[
          {id:'qa_020',from:'wsl',role:'partner',text:'Reviewed. 12mo senior bridge, clean security. JLL valuation confirmed. Approved for IOI.',ts:'2026-02-10T09:00:00Z'},
          {id:'qa_021',from:'Prime Real Estate Partners',role:'advisor',text:'Originator confirms hard IOI close of May 23. No extensions possible given drawdown timeline.',ts:'2026-04-20T11:00:00Z'},
        ],
        created_at:'2026-01-20T08:00:00Z', stage_entered_at:'2026-02-10T09:00:00Z',
        funded_at:'2026-03-20T00:00:00Z', closed_at:null, created_by:'wsl', updated_at:now,
      },

      // ── DEAL 4: Asia Infrastructure Debt II · Live · Marketplace LIVE ──
      {
        id:'deal_aid', name:'Asia Infrastructure Debt II', type:'infra', stage:'ioi',
        advisor_id:'adv_meridian003', advisor_firm:'Meridian Infrastructure Capital',
        deal_structure:'mezzanine', geography:'sea', originator:'Meridian Infrastructure Capital',
        return_type:'hybrid', hurdle_rate:7,
        target_alloc_usd:3_000_000, target_irr:10, term_months:60,
        total_deal_size_usd:20_000_000, min_ticket_usd:100_000, max_ticket_usd:500_000,
        round_name:'Asia Infrastructure Debt II', round_size_usd:3_000_000,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:3, ioi_agg_usd:1_200_000, deployed_usd:0,
        gate_status:'open', gate_notes:'IOI window open. 3 IOIs received.', next_action:'Continue IOI collection. Target close Jun 30.', health:'green',
        member_visible:true, marketplace_visible:true,
        mk_irr:10, mk_alloc:3_000_000, mk_min_ticket:100_000, mk_max_ticket:500_000,
        mk_term:60, mk_hurdle:7, mk_return_type:'hybrid',
        mk_closing:'2026-06-30T23:59:00+08:00', mk_badge:'inst',
        mk_notes:'Mezzanine debt facility financing three operational renewable energy assets across Vietnam and Indonesia — two solar farms and one hydro project with 20-year government offtake agreements. USD-denominated. 7% preferred coupon with a 3% PIK kicker payable at maturity.',
        mk_highlights:[
          {s:'Government Offtake',b:'20-year PPAs with Vietnamese and Indonesian government entities. USD-denominated payments with no FX risk on distributions.'},
          {s:'Hard Asset Security',b:'First-ranking security over project assets and accounts. USD cash flows with independent technical advisor oversight.'},
          {s:'Hybrid Return',b:'7% preferred cash coupon plus 3% PIK kicker at maturity. Capital preservation focus with fixed income characteristics.'},
          {s:'Institutional Tranche',b:'Open to qualified institutional investors. Minimum $250K. Suitable for family offices and impact allocations.'},
        ],
        mk_timeline:[
          {l:'Deal Submitted',d:'Mar 28, 2026',s:'done',desc:'Infrastructure debt facility with project financials and offtake agreements received.'},
          {l:'TACC Approval',d:'Apr 15, 2026',s:'done',desc:'Credit committee approved. USD cash flow structure confirmed. Allocation set at $3M.'},
          {l:'IOI Window',d:'Apr 29 – Jun 30, 2026',s:'curr',desc:'Members and institutions may express interest. Extended window.'},
          {l:'IOI Close',d:'Jun 30, 2026',s:'future',desc:'Allocation confirmed. Subscription documents issued.'},
          {l:'Financial Close',d:'Jul 31, 2026',s:'future',desc:'Mezz facility drawn. Security package registered. Coupon payments begin.'},
          {l:'Maturity',d:'Jul 2031',s:'future',desc:'Principal plus PIK kicker returned. 5-year term from financial close.'},
        ],
        mk_docs:[
          {id:'d11',name:'Asia Infrastructure Debt II — Teaser',type:'pdf',access:'public',size:'2.8 MB',date:'Apr 15, 2026'},
          {id:'d12',name:'Project Summaries + Offtake Contracts',type:'pdf',access:'ioi',size:'15.2 MB',date:'Apr 16, 2026'},
          {id:'d13',name:'Financial Model + Sensitivity Analysis',type:'xlsx',access:'ioi',size:'3.4 MB',date:'Apr 18, 2026'},
        ],
        mk_activity:[{init:'FO',who:'Institution ···O',ts:'1d ago'},{init:'KT',who:'Member ···T',ts:'2d ago'}],
        notes:'Mezzanine debt facility. Three operational renewable energy assets across Vietnam and Indonesia. 20-year government offtake agreements. USD-denominated.',
        documents:['Teaser / One-Pager','CIM / Info Memo'],
        qa:[
          {id:'qa_030',from:'Daniel Cho',role:'advisor',text:'Infrastructure debt facility submitted. Three operational assets with government PPAs. Project financials and offtake docs attached.',ts:'2026-03-28T09:00:00Z'},
          {id:'qa_031',from:'tkj',role:'partner',text:'Credit approved. USD structure confirmed. Excellent institutional fit. Approved for marketplace.',ts:'2026-04-15T10:00:00Z'},
        ],
        created_at:'2026-03-28T08:00:00Z', stage_entered_at:'2026-04-20T09:00:00Z',
        funded_at:null, closed_at:null, created_by:'tkj', updated_at:now,
      },

      // ── DEAL 5: Korea Growth Select · Review ──
      {
        id:'deal_kgs', name:'Korea Growth Select', type:'equity', stage:'review',
        advisor_id:'adv_meridian003', advisor_firm:'Hanwha Alternatives',
        deal_structure:'primary_equity', geography:'east_asia', originator:'Hanwha Alternatives',
        return_type:'equity_upside', hurdle_rate:8,
        target_alloc_usd:0, target_irr:18, term_months:36,
        total_deal_size_usd:30_000_000, min_ticket_usd:75_000, max_ticket_usd:400_000,
        round_name:'Korea Growth Select — Series C', round_size_usd:0,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:0, ioi_agg_usd:0, deployed_usd:0,
        gate_status:'blocked', gate_notes:'CIM under credit committee review.', next_action:'Credit decision within 10 business days.', health:'amber',
        member_visible:false, marketplace_visible:false,
        notes:'Series C co-investment in a Seoul-headquartered B2B SaaS company. $42M ARR growing 80% YoY. KKR leading the Series C at $280M valuation.',
        documents:['Teaser / One-Pager'],
        qa:[
          {id:'qa_040',from:'Daniel Cho',role:'advisor',text:'Series C co-invest submitted. KKR lead confirmed. Company financials and CIM attached.',ts:'2026-04-01T09:00:00Z'},
          {id:'qa_041',from:'system',role:'partner',text:'Deal received. Under credit committee review.',ts:'2026-04-01T09:05:00Z'},
        ],
        created_at:'2026-04-01T09:00:00Z', stage_entered_at:'2026-04-01T09:00:00Z',
        funded_at:null, closed_at:null, created_by:'jwc', updated_at:now,
      },

      // ── DEAL 6: Pacific Credit VI · Just Submitted · Review ──
      {
        id:'deal_pc6', name:'Pacific Credit VI', type:'credit', stage:'review',
        advisor_id:'adv_apex001', advisor_firm:'Apex Credit Management',
        deal_structure:'bridge', geography:'east_asia', originator:'Apex Credit Management',
        return_type:'fixed_coupon', hurdle_rate:8,
        target_alloc_usd:0, target_irr:13, term_months:12,
        total_deal_size_usd:8_000_000, min_ticket_usd:50_000, max_ticket_usd:250_000,
        round_name:'', round_size_usd:0,
        funding_source:'ltv', tacc_platform_fee_pct:1, tacc_carry_pct:12,
        ioi_count:0, ioi_agg_usd:0, deployed_usd:0,
        gate_status:'open', gate_notes:'Submitted Apr 25. Under initial review.', next_action:'Initial review — CIM under assessment.', health:'green',
        member_visible:false, marketplace_visible:false,
        notes:'Short-duration KR/JP restructuring credit. 12-month bridge. Strong collateral package. Personal guarantee from borrower.',
        documents:['Teaser / One-Pager'],
        qa:[
          {id:'qa_050',from:'Jin-ho Park',role:'advisor',text:'Pacific Credit VI submitted. Short-duration KR/JP bridge. CIM attached. Timeline is tight — originator needs commitment by May 30.',ts:'2026-04-25T08:00:00Z'},
          {id:'qa_051',from:'system',role:'partner',text:'Deal received. Under review.',ts:'2026-04-25T08:05:00Z'},
        ],
        created_at:'2026-04-25T08:00:00Z', stage_entered_at:'2026-04-25T08:00:00Z',
        funded_at:null, closed_at:null, created_by:'tkj', updated_at:now,
      },
    ];

    try {
      for (const d of SEED) await saveDeal(d);
      return ok(res, {
        ok: true, seeded: SEED.length, ids: SEED.map(d => d.id),
        message: `${SEED.length} deals seeded. 4 marketplace-visible, 3 member-visible. Delete seed endpoint before production.`,
        deals_by_stage: { dd:1, terms:1, live:1, ioi:1, review:2 },
      });
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
    // Marketplace-specific terms (mk_* prefix — separate from TACC member terms)
    if (body.marketplace_visible !== undefined)  deal.marketplace_visible  = !!body.marketplace_visible;
    if (body.mk_irr       != null) deal.mk_irr        = Math.max(0, Number(body.mk_irr));
    if (body.mk_alloc     != null) deal.mk_alloc      = Math.max(0, Number(body.mk_alloc) || 0);
    if (body.mk_min_ticket!= null) deal.mk_min_ticket = Math.max(0, Number(body.mk_min_ticket) || 250000);
    if (body.mk_max_ticket!= null) deal.mk_max_ticket = Math.max(0, Number(body.mk_max_ticket) || 0);
    if (body.mk_term      != null) deal.mk_term       = Math.max(1, Math.round(Number(body.mk_term) || 12));
    if (body.mk_hurdle    != null) deal.mk_hurdle     = Math.max(0, Number(body.mk_hurdle) || 8);
    if (body.mk_return_type != null) deal.mk_return_type = String(body.mk_return_type).trim();
    if (body.mk_closing   != null) deal.mk_closing    = String(body.mk_closing).trim();
    if (body.mk_notes     != null) deal.mk_notes      = String(body.mk_notes).trim();
    if (Array.isArray(body.mk_highlights)) deal.mk_highlights = body.mk_highlights;
    if (Array.isArray(body.mk_timeline))   deal.mk_timeline   = body.mk_timeline;
    if (Array.isArray(body.mk_docs))       deal.mk_docs       = body.mk_docs;

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
// INSTITUTION — register / login / me / list / create
// ─────────────────────────────────────────────────────────────
// KV schema: inst:{id}  →  institution object
//            inst_by_email:{email} → id
//            inst_list → [ id, ... ] (append-only index)
// ═══════════════════════════════════════════════════════════════
const INST_COOKIE = 'aurum_inst';
const INST_TTL    = 60 * 60 * 24 * 30; // 30 days

// ── KV helpers (inline — avoids new _lib file) ───────────────
const KV_URL   = () => process.env.KV_REST_API_URL;
const KV_TOKEN = () => process.env.KV_REST_API_TOKEN;

async function kvGet(key) {
  const u = KV_URL(), t = KV_TOKEN();
  if (!u || !t) return null;
  const r = await fetch(`${u}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${t}` } });
  const j = await r.json().catch(() => ({}));
  if (!j.result) return null;
  try { return JSON.parse(j.result); } catch { return j.result; }
}
async function kvSet(key, value) {
  const u = KV_URL(), t = KV_TOKEN();
  if (!u || !t) return;
  await fetch(`${u}/set/${encodeURIComponent(key)}`, {
    method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value)),
  });
}
async function kvLpush(key, value) {
  const u = KV_URL(), t = KV_TOKEN();
  if (!u || !t) return;
  await fetch(`${u}/lpush/${encodeURIComponent(key)}`, {
    method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([JSON.stringify(value)]),
  });
}
async function kvLrange(key, start = 0, stop = 200) {
  const u = KV_URL(), t = KV_TOKEN();
  if (!u || !t) return [];
  const r = await fetch(`${u}/lrange/${encodeURIComponent(key)}/${start}/${stop}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!Array.isArray(j.result)) return [];
  return j.result.map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
}

function generateInstId() { return 'inst_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function generateInstCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'INST-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function handleInst(req, res, op) {

  // ── REGISTER (public — new institution applies for access) ────
  if (op === 'register') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !body.first_name || !body.firm) return bad(res, 'first_name, firm and email required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'invalid email');
    // Check for existing
    const existing = await kvGet(`inst_by_email:${email}`);
    if (existing) return bad(res, 'An application from this email already exists');
    const now = new Date().toISOString();
    const inst = {
      id: generateInstId(),
      first_name: String(body.first_name || '').trim().slice(0, 80),
      last_name:  String(body.last_name  || '').trim().slice(0, 80),
      firm:       String(body.firm       || '').trim().slice(0, 200),
      title:      String(body.title      || '').trim().slice(0, 100),
      email,
      investor_type: String(body.investor_type || '').trim(),
      jurisdiction:  String(body.jurisdiction  || '').trim(),
      source:        String(body.source        || '').trim(),
      status: 'pending',
      access_code: null,
      created_at: now, approved_at: null, approved_by: null,
    };
    try {
      await kvSet(`inst:${inst.id}`, inst);
      await kvSet(`inst_by_email:${email}`, inst.id);
      await kvLpush('inst_list', inst.id);
    } catch (e) { return serverError(res, 'storage error'); }

    // Notify partners (best effort)
    try {
      const notify = (process.env.NOTIFY_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
      if (notify.length) {
        await sendRaw({
          to: notify,
          subject: `[AURUM] Institutional access request · ${inst.firm} · ${inst.first_name} ${inst.last_name}`,
          text: `New institutional access request.\n\nFirm: ${inst.firm}\nContact: ${inst.first_name} ${inst.last_name}\nEmail: ${inst.email}\nType: ${inst.investor_type}\nJurisdiction: ${inst.jurisdiction}\n\nApprove at: ${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin`,
          html: `<pre>New institutional access request.\n\nFirm: ${inst.firm}\nContact: ${inst.first_name} ${inst.last_name}\nEmail: ${inst.email}\nType: ${inst.investor_type}\nJurisdiction: ${inst.jurisdiction}\n\nApprove at: <a href="${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin">TACC Admin</a></pre>`,
        });
      }
    } catch (e) { console.warn('[inst/register] notify failed', e); }

    return ok(res, { ok: true, message: 'Application submitted. TACC partners will review within 2 business days.' });
  }

  // ── LOGIN (existing institution — email + access code) ────────
  if (op === 'login') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const email = String(body.email || '').trim().toLowerCase();
    const code  = String(body.code  || '').trim().toUpperCase();
    if (!email || !code) return bad(res, 'email and access code required');
    const instId = await kvGet(`inst_by_email:${email}`).catch(() => null);
    if (!instId) { await new Promise(r => setTimeout(r, 400)); return unauthorized(res, 'invalid credentials'); }
    const inst = await kvGet(`inst:${instId}`).catch(() => null);
    if (!inst || inst.status !== 'approved' || inst.access_code !== code) {
      await new Promise(r => setTimeout(r, 400));
      return unauthorized(res, inst?.status === 'pending' ? 'application pending approval' : 'invalid credentials');
    }
    const token = signToken({ sub: 'inst', instId: inst.id, email: inst.email }, INST_TTL);
    setCookie(res, INST_COOKIE, token, { maxAge: INST_TTL, sameSite: 'Lax' });
    return ok(res, { ok: true, name: `${inst.first_name} ${inst.last_name}`, firm: inst.firm, email: inst.email });
  }

  // ── ME (check inst session) ────────────────────────────────────
  if (op === 'me') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const tok  = getCookie(req, INST_COOKIE);
    const sess = verifyToken(tok);
    if (!sess || sess.sub !== 'inst') return ok(res, { ok: false });
    const inst = await kvGet(`inst:${sess.instId}`).catch(() => null);
    if (!inst || inst.status !== 'approved') return ok(res, { ok: false });
    return ok(res, { ok: true, role: 'inst', name: `${inst.first_name} ${inst.last_name}`, firm: inst.firm, email: inst.email });
  }

  // ── LIST (admin — all institution applications) ────────────────
  if (op === 'list') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSess || adminSess.sub !== 'admin') return unauthorized(res);
    try {
      const ids = await kvLrange('inst_list', 0, 500);
      const insts = (await Promise.all(ids.map(id => kvGet(`inst:${id}`).catch(() => null)))).filter(Boolean);
      return ok(res, { ok: true, institutions: insts, count: insts.length });
    } catch (e) { return serverError(res, 'failed to list institutions'); }
  }

  // ── CREATE (admin — approve application, issue access code, email) ─
  if (op === 'create') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSess || adminSess.sub !== 'admin') return unauthorized(res);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const instId = String(body.id || '').trim();
    if (!instId) return bad(res, 'id required');
    const inst = await kvGet(`inst:${instId}`).catch(() => null);
    if (!inst) return notFound(res, 'institution not found');
    // Generate access code if not already approved
    const code = inst.access_code || generateInstCode();
    inst.access_code  = code;
    inst.status       = 'approved';
    inst.approved_at  = new Date().toISOString();
    inst.approved_by  = adminSess.id || adminSess.email || 'admin';
    await kvSet(`inst:${inst.id}`, inst);
    const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
    // Send welcome email with access code
    let mailResult = { sent: false, reason: 'skipped' };
    if (body.send_email !== false && inst.email) {
      try {
        mailResult = await sendRaw({
          to: inst.email,
          subject: `Your Aurum Deal Marketplace access · ${inst.firm}`,
          text: `Dear ${inst.first_name},\n\nYour application for institutional access to the Aurum Century Club Deal Marketplace has been approved.\n\nAccess the marketplace at: ${siteUrl}/mktplace\n\nYour credentials:\nEmail: ${inst.email}\nAccess Code: ${code}\n\nAll deal information is subject to NDA. By logging in you confirm you are a qualified institutional investor and that all information accessed remains strictly confidential.\n\nTACC Partners\nAurum Century Club`,
          html: `<p>Dear ${inst.first_name},</p><p>Your application for institutional access to the Aurum Century Club Deal Marketplace has been approved.</p><p><strong>Access the marketplace at:</strong> <a href="${siteUrl}/mktplace">${siteUrl}/mktplace</a></p><p><strong>Email:</strong> ${inst.email}<br><strong>Access Code:</strong> <code>${code}</code></p><p>All deal information is subject to NDA. By logging in you confirm you are a qualified institutional investor and that all information accessed remains strictly confidential.</p><p>TACC Partners<br>Aurum Century Club</p>`,
        });
      } catch (e) { console.warn('[inst/create] email failed', e); }
    }
    return ok(res, { ok: true, institution: inst, access_code: code, email: mailResult });
  }

  // ── LOGOUT ────────────────────────────────────────────────────
  if (op === 'logout') {
    clearCookie(res, INST_COOKIE);
    return ok(res, { ok: true });
  }

  return bad(res, `unknown inst op: ${op}`);
}

// ═══════════════════════════════════════════════════════════════
// MARKETPLACE — deal-level IOI management (separate from TACC fund IOI)
// ─────────────────────────────────────────────────────────────
// KV schema:
//   mk_ioi:{deal_id}:{investor_id}  → IOI object
//   mk_ioi_by_deal:{deal_id}        → [ investor_id, ... ]
//   mk_ioi_by_inv:{investor_id}     → [ deal_id, ... ]
// ═══════════════════════════════════════════════════════════════
async function handleMarketplace(req, res, op) {

  // ── Resolve investor identity from cookie ─────────────────────
  async function resolveInvestor(req) {
    // Member
    const memTok  = getCookie(req, 'aurum_access');
    const memSess = verifyToken(memTok);
    if (memSess && memSess.sub === 'member' && memSess.leadId) {
      return { id: memSess.leadId, type: 'member', code: memSess.code };
    }
    // Institution
    const instTok  = getCookie(req, INST_COOKIE);
    const instSess = verifyToken(instTok);
    if (instSess && instSess.sub === 'inst' && instSess.instId) {
      return { id: instSess.instId, type: 'inst', email: instSess.email };
    }
    return null;
  }

  // ── SUBMIT IOI ────────────────────────────────────────────────
  if (op === 'ioi') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const investor = await resolveInvestor(req);
    if (!investor) return unauthorized(res);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const dealId = String(body.deal_id || '').trim();
    const amount = Math.round(Number(body.amount) || 0);
    if (!dealId) return bad(res, 'deal_id required');
    if (!amount || amount < 1000) return bad(res, 'invalid amount');
    // Check deal exists and is marketplace-visible
    let deal; try { deal = await getDeal(dealId); } catch { return serverError(res, 'deal lookup failed'); }
    if (!deal || !deal.member_visible) return notFound(res, 'deal not found or not published');
    // Check for existing IOI (allow re-submission)
    const ioiKey = `mk_ioi:${dealId}:${investor.id}`;
    const existing = await kvGet(ioiKey).catch(() => null);
    const now = new Date().toISOString();
    const ioi = {
      id: existing?.id || ('mki_' + Date.now().toString(36)),
      deal_id: dealId,
      investor_id: investor.id,
      investor_type: investor.type,
      amount,
      notes: String(body.notes || '').trim().slice(0, 1000),
      status: existing?.status === 'approved' ? 'approved' : 'pending', // preserve approved state on revision
      data_room_access: existing?.data_room_access || false,
      submitted_at: existing?.submitted_at || now,
      updated_at: now,
      approved_at: existing?.approved_at || null,
      approved_by: existing?.approved_by || null,
      funding: 'hard_capital',
      source: 'marketplace',
    };
    try {
      await kvSet(ioiKey, ioi);
      if (!existing) {
        await kvLpush(`mk_ioi_by_deal:${dealId}`, investor.id);
        await kvLpush(`mk_ioi_by_inv:${investor.id}`, dealId);
        // Update deal IOI count
        deal.ioi_count = (deal.ioi_count || 0) + 1;
        deal.ioi_agg_usd = (deal.ioi_agg_usd || 0) + amount;
        await saveDeal(deal);
      }
    } catch (e) { return serverError(res, 'failed to save IOI'); }
    // Notify partners
    try {
      const notify = (process.env.NOTIFY_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
      if (notify.length) {
        await sendRaw({
          to: notify,
          subject: `[AURUM Marketplace] IOI · ${deal.name} · $${(amount/1000).toFixed(0)}K`,
          text: `Marketplace IOI received.\n\nDeal: ${deal.name}\nAmount: $${amount.toLocaleString()} USD\nInvestor type: ${investor.type}\nNotes: ${ioi.notes || '—'}\n\nApprove data room at: ${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin`,
          html: `<pre>Marketplace IOI received.\n\nDeal: ${deal.name}\nAmount: $${amount.toLocaleString()} USD\nInvestor type: ${investor.type}\nNotes: ${ioi.notes || '—'}\n\nApprove data room at: <a href="${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin">TACC Admin</a></pre>`,
        });
      }
    } catch (e) { console.warn('[marketplace/ioi] notify failed', e); }
    return ok(res, { ok: true, ioi });
  }

  // ── MY IOIs (investor's portfolio) ────────────────────────────
  if (op === 'my-iois') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const investor = await resolveInvestor(req);
    if (!investor) return ok(res, { ok: true, iois: [] });
    try {
      const dealIds = await kvLrange(`mk_ioi_by_inv:${investor.id}`, 0, 200);
      const iois = (await Promise.all(
        dealIds.map(did => kvGet(`mk_ioi:${did}:${investor.id}`).catch(() => null))
      )).filter(Boolean);
      return ok(res, { ok: true, iois });
    } catch (e) { return serverError(res, 'failed to load IOIs'); }
  }

  // ── APPROVE IOI (admin — grants data room access) ─────────────
  if (op === 'approve-ioi') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSess || adminSess.sub !== 'admin') return unauthorized(res);
    let body; try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
    const { deal_id, investor_id } = body;
    if (!deal_id || !investor_id) return bad(res, 'deal_id and investor_id required');
    const ioiKey = `mk_ioi:${deal_id}:${investor_id}`;
    const ioi = await kvGet(ioiKey).catch(() => null);
    if (!ioi) return notFound(res, 'IOI not found');
    ioi.status = 'approved';
    ioi.data_room_access = true;
    ioi.approved_at = new Date().toISOString();
    ioi.approved_by = adminSess.id || adminSess.email || 'admin';
    await kvSet(ioiKey, ioi);
    return ok(res, { ok: true, ioi });
  }

  // ── LIST IOIs FOR DEAL (admin) ─────────────────────────────────
  if (op === 'deal-iois') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const adminSess = verifyToken(getCookie(req, 'aurum_admin'));
    if (!adminSess || adminSess.sub !== 'admin') return unauthorized(res);
    const dealId = String(getQuery(req).deal_id || '').trim();
    if (!dealId) return bad(res, 'deal_id required');
    try {
      const invIds = await kvLrange(`mk_ioi_by_deal:${dealId}`, 0, 500);
      const iois = (await Promise.all(
        invIds.map(iid => kvGet(`mk_ioi:${dealId}:${iid}`).catch(() => null))
      )).filter(Boolean);
      return ok(res, { ok: true, iois, count: iois.length });
    } catch (e) { return serverError(res, 'failed to load deal IOIs'); }
  }

  return bad(res, `unknown marketplace op: ${op}`);
}
