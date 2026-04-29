// POST /api/deals/seed
//
// Seeds the deals store with realistic dummy deals for testing.
// Safe to call multiple times — uses fixed IDs so it won't
// duplicate entries (it will overwrite on repeat calls).
//
// Remove or gate this endpoint before opening to real deal flow.
// To disable permanently: delete this file and remove the route.
//
// Response:
//   { ok: true, seeded: number, deals: Deal[] }
//
// Auth: aurum_admin cookie

import { ok, unauthorized, methodNotAllowed, serverError, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { saveDeal } from '../_lib/deal-storage.js';

// ── Seed data — matches the MOCK_DEALS in fund_dashboard_v1.html ──
// These IDs are fixed so re-seeding overwrites cleanly.
const SEED_DEALS = [
  {
    id:               'deal_pc3',
    name:             'Pacific Credit III',
    type:             'credit',
    stage:            'dd',
    advisor_id:       null,
    advisor_firm:     'Apex Credit Management',
    target_alloc_usd: 1_200_000,
    target_irr:       11,
    term_months:      36,
    funding_source:   'ltv',
    ioi_count:        11,
    ioi_agg_usd:      4_800_000,
    gate_status:      'blocked',
    gate_notes:       '3 VDR documents outstanding',
    next_action:      'Advance to Terms once VDR complete',
    health:           'green',
    deployed_usd:     775_000,
    notes:            'Asia-Pacific private credit, unitranche structure. Strong GP track record. 11 IOIs at $4.8M aggregate against $1.2M allocation.',
    qa: [
      { id:'qa_001', from:'tkj', role:'partner', text:'CIM reviewed. Credit committee approved. VDR access granted to Apex.', ts:'2025-01-17T10:00:00Z' },
      { id:'qa_002', from:'adv_apex', role:'advisor', text:'VDR uploaded: CIM, track record, fund docs. Still outstanding: 3-year projections, management deck, term sheet.', ts:'2025-03-15T14:30:00Z' },
      { id:'qa_003', from:'tkj', role:'partner', text:'Management Q&A call completed. 1 question outstanding re: hedging policy.', ts:'2025-04-18T09:00:00Z' },
    ],
    created_at:       '2025-01-14T08:00:00Z',
    stage_entered_at: '2025-03-01T09:00:00Z',
    funded_at:        '2025-03-01T00:00:00Z',
    closed_at:        null,
    created_by:       'tkj',
    updated_at:       '2025-04-18T09:00:00Z',
  },
  {
    id:               'deal_atl',
    name:             'Project Atlas',
    type:             'pe',
    stage:            'terms',
    advisor_id:       null,
    advisor_firm:     'SG Capital Group',
    target_alloc_usd: 2_000_000,
    target_irr:       22,
    term_months:      60,
    funding_source:   'ltv',
    ioi_count:        13,
    ioi_agg_usd:      6_200_000,
    gate_status:      'open',
    gate_notes:       'Term sheet issued Apr 22',
    next_action:      'LP counter-signature then final allocation',
    health:           'green',
    deployed_usd:     160_000,
    notes:            'Pre-IPO Singapore AI infrastructure secondary. Late-stage, primary market closed. Direct-LP secondary allocation via manager counterparty network.',
    qa: [
      { id:'qa_010', from:'jwc', role:'partner', text:'Allocation confirmed at $2M. IOI closed.', ts:'2026-02-28T10:00:00Z' },
      { id:'qa_011', from:'jwc', role:'partner', text:'DD completed. Term sheet issued to SG Capital.', ts:'2026-04-22T15:00:00Z' },
    ],
    created_at:       '2025-12-01T08:00:00Z',
    stage_entered_at: '2026-04-22T09:00:00Z',
    funded_at:        '2026-04-22T00:00:00Z',
    closed_at:        null,
    created_by:       'jwc',
    updated_at:       '2026-04-22T15:00:00Z',
  },
  {
    id:               'deal_mbt',
    name:             'Marina Bay Tower',
    type:             're',
    stage:            'live',
    advisor_id:       null,
    advisor_firm:     'Prime Real Estate',
    target_alloc_usd: 850_000,
    target_irr:       14,
    term_months:      12,
    funding_source:   'ltv',
    ioi_count:        9,
    ioi_agg_usd:      2_800_000,
    gate_status:      'open',
    gate_notes:       'IOI window open until May 30',
    next_action:      'IOI close then set allocation',
    health:           'green',
    deployed_usd:     550_000,
    notes:            'Singapore CBD senior bridge loan. Developer refinancing office tranche. Asset value 2.4x facility at 42% LTV on underlying. 12-month term.',
    qa: [
      { id:'qa_020', from:'wsl', role:'partner', text:'Reviewed. 12mo senior bridge, clean security. IOI window open.', ts:'2026-02-10T09:00:00Z' },
    ],
    created_at:       '2026-01-20T08:00:00Z',
    stage_entered_at: '2026-02-10T09:00:00Z',
    funded_at:        '2026-03-20T00:00:00Z',
    closed_at:        null,
    created_by:       'wsl',
    updated_at:       '2026-02-10T09:00:00Z',
  },
  {
    id:               'deal_cit',
    name:             'Project Citadel',
    type:             'pe',
    stage:            'review',
    advisor_id:       null,
    advisor_firm:     'Meridian Capital',
    target_alloc_usd: 0,
    target_irr:       18,
    term_months:      48,
    funding_source:   'ltv',
    ioi_count:        0,
    ioi_agg_usd:      0,
    gate_status:      'blocked',
    gate_notes:       'CIM under credit committee review',
    next_action:      'TACC credit decision within 10 business days',
    health:           'amber',
    deployed_usd:     0,
    notes:            'PE secondaries — Asia infrastructure. Submitted by Meridian Capital Apr 15. Teaser reviewed; CIM requested and received.',
    qa: [
      { id:'qa_030', from:'system', role:'partner', text:'Deal submitted. CIM received. Under review.', ts:'2026-04-15T09:00:00Z' },
    ],
    created_at:       '2026-04-15T09:00:00Z',
    stage_entered_at: '2026-04-15T09:00:00Z',
    funded_at:        null,
    closed_at:        null,
    created_by:       'jwc',
    updated_at:       '2026-04-15T09:00:00Z',
  },
  {
    id:               'deal_pc4',
    name:             'Pacific Credit IV',
    type:             'credit',
    stage:            'review',
    advisor_id:       null,
    advisor_firm:     'Apex Credit Management',
    target_alloc_usd: 0,
    target_irr:       13,
    term_months:      12,
    funding_source:   'ltv',
    ioi_count:        0,
    ioi_agg_usd:      0,
    gate_status:      'open',
    gate_notes:       'Submitted Apr 25, 2026',
    next_action:      'Initial review — CIM under assessment',
    health:           'green',
    deployed_usd:     0,
    notes:            'Short-duration KR/JP restructuring credit. Diversified receivables pool. Apex track record 14yr, no realized losses since 2018.',
    qa: [
      { id:'qa_040', from:'system', role:'partner', text:'Deal submitted by Apex Credit Management.', ts:'2026-04-25T08:00:00Z' },
    ],
    created_at:       '2026-04-25T08:00:00Z',
    stage_entered_at: '2026-04-25T08:00:00Z',
    funded_at:        null,
    closed_at:        null,
    created_by:       'tkj',
    updated_at:       '2026-04-25T08:00:00Z',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  try {
    const seeded = [];
    for (const deal of SEED_DEALS) {
      await saveDeal({ ...deal });
      seeded.push(deal.id);
    }
    return ok(res, { ok: true, seeded: seeded.length, ids: seeded,
      message: 'Seed complete. Call GET /api/deals/list to verify. Delete this file before production.' });
  } catch (err) {
    console.error('[deals/seed]', err);
    return serverError(res, 'seed failed: ' + err.message);
  }
}
