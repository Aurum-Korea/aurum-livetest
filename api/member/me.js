// GET /api/member/me
//
// Returns the authenticated member's portfolio data.
// Reads aurum_access cookie (set by /api/verify-code).
//
// This is a clean alias for /api/ioi?op=portfolio — same response shape,
// kept here so the member portal has its own endpoint namespace and we
// can evolve it independently of the IOI submission flow.
//
// Response shape mirrors /api/ioi?op=portfolio:
//   { ok:true, viewer:'member', member:{name,email,code},
//     ioi:{kg,ltv_pct_requested,submitted_at,verified_at,krw_at_submit},
//     wire:{ref,instructions_sent_at,wired_at,cleared_at},
//     bars:[], ltv:{drawn_krw,ceiling_pct,margin_pct},
//     docs:[], positions:[], capital_calls:[], activity:[], spot:{...} }
//
// Error responses (all 200 OK, ok:false):
//   { ok:false, reason:'no-session' }      — no/expired aurum_access cookie
//   { ok:false, reason:'no-lead' }         — lead not found
//   { ok:false, reason:'nda-not-approved'} — NDA not done yet
//   { ok:false, reason:'no-ioi' }          — IOI not submitted yet
//
// Auth: aurum_access cookie only. No admin bypass — use /api/ioi?op=portfolio
//       with an aurum_admin cookie for admin portfolio previews.

import { ok, bad, methodNotAllowed, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getLead } from '../_lib/storage.js';
import { getKrwPerKg } from '../_lib/krw.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // Auth: member session cookie only
  const tok = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) {
    return ok(res, { ok: false, reason: 'no-session' });
  }

  let lead;
  try { lead = await getLead(session.leadId); } catch (e) {
    console.error('[member/me] getLead', e);
    return ok(res, { ok: false, reason: 'lookup-failed' });
  }
  if (!lead) return ok(res, { ok: false, reason: 'no-lead' });
  if (lead.code_revoked) return ok(res, { ok: false, reason: 'revoked' });

  // State gates — member must progress through onboarding
  if (lead.nda_state !== 'approved') return ok(res, { ok: false, reason: 'nda-not-approved' });
  if (!lead.ioi || !lead.ioi.submitted_at) return ok(res, { ok: false, reason: 'no-ioi' });

  // Live spot — non-fatal if unavailable
  let spot = null;
  try { spot = await getKrwPerKg(); } catch {}

  // Filtered audit (member-visible events only)
  const auditLabels = {
    nda_approved:         { en: 'NDA approved · Portal access activated', ko: 'NDA 승인 · 포털 접속 활성화' },
    ioi_submitted:        { en: 'Indication of Interest submitted', ko: '투자의향서 제출 완료' },
    ioi_verified:         { en: 'IOI verified · Wire instructions issued', ko: 'IOI 확인 · 송금 안내 발송' },
    wire_received:        { en: 'Wire received · Clearance in progress', ko: '송금 수령 · 정산 진행 중' },
    wire_cleared:         { en: 'Wire cleared · Gold purchased · Member admitted', ko: '정산 완료 · 금 매입 · 회원 가입 확정' },
    bars_assigned:        { en: 'Gold bars assigned · Vault confirmed', ko: '금괴 배정 · 보관 확인' },
    position_opened:      { en: 'Deal position opened', ko: '딜 포지션 개설' },
    capital_call_issued:  { en: 'Capital call issued', ko: '자본 청구 발행' },
    quarterly_statement:  { en: 'Quarterly statement issued', ko: '분기 보고서 발행' },
  };
  const memberAudit = (lead.audit || [])
    .filter(a => auditLabels[a.action])
    .sort((a, b) => b.at - a.at)
    .slice(0, 20)
    .map(a => ({
      at: a.at,
      en: auditLabels[a.action]?.en || a.action,
      ko: auditLabels[a.action]?.ko || a.action,
    }));

  return ok(res, {
    ok: true,
    viewer: 'member',
    viewer_id: lead.email || lead.code || 'member',
    member: {
      name:    lead.name    || '',
      name_ko: lead.name_ko || '',
      email:   lead.email   || '',
      code:    lead.code    || '',
    },
    ioi: {
      kg:                   lead.ioi.kg,
      ltv_pct_requested:    lead.ioi.ltv_pct,
      submitted_at:         lead.ioi.submitted_at,
      verified_at:          lead.ioi_verified_at || null,
      krw_at_submit:        lead.ioi.krw_at_submit || null,
      krw_per_kg_at_submit: lead.ioi.krw_per_kg_at_submit || null,
      krw_per_kg_at_settle: lead.ioi.krw_per_kg_at_settle || null,
    },
    wire: {
      ref:                  (lead.wire && lead.wire.ref)                  || null,
      instructions_sent_at: (lead.wire && lead.wire.instructions_sent_at) || null,
      wired_at:             (lead.wire && lead.wire.wired_at)             || null,
      cleared_at:           (lead.wire && lead.wire.cleared_at)           || null,
      amount_krw:           (lead.wire && lead.wire.amount_krw)           || null,
    },
    bars:          lead.bars          || [],
    ltv:           lead.ltv           || { drawn_krw:0, ceiling_pct:lead.ioi.ltv_pct||65, margin_pct:80 },
    docs:          lead.docs          || [],
    positions:     lead.positions     || [],
    capital_calls: lead.capital_calls || [],
    activity:      memberAudit,
    spot,
  });
}
