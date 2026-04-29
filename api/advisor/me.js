// GET /api/advisor/me
//
// Returns the authenticated advisor's profile plus their deal pipeline.
// Reads aurum_advisor cookie.
//
// Response:
//   { ok:true, advisor:{id,name,firm,email,intro_fee_pct,carry_pct,last_login_at},
//     deals:[...deals where advisor_id === session.advisorId...] }
//
// Error:
//   { ok:false, reason:'no-session' | 'not-found' | 'suspended' }

import { ok, unauthorized, methodNotAllowed, serverError, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { getAdvisor, safeAdvisor } from '../_lib/advisor-storage.js';
import { listDeals, daysInStage } from '../_lib/deal-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok     = getCookie(req, 'aurum_advisor');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor' || !session.advisorId) {
    return ok(res, { ok: false, reason: 'no-session' });
  }

  let advisor;
  try { advisor = await getAdvisor(session.advisorId); } catch (e) {
    console.error('[advisor/me] getAdvisor', e);
    return serverError(res, 'session load failed');
  }
  if (!advisor) return ok(res, { ok: false, reason: 'not-found' });
  if (advisor.status === 'suspended') return ok(res, { ok: false, reason: 'suspended' });

  // Fetch deals scoped to this advisor
  let deals = [];
  try {
    const all = await listDeals(200);
    deals = all
      .filter(d => d.advisor_id === advisor.id || d.advisor_firm === advisor.firm)
      .map(d => ({ ...d, days_in_stage: daysInStage(d) }));
  } catch (e) {
    console.error('[advisor/me] listDeals', e);
    // Non-fatal — return advisor with empty deals
  }

  return ok(res, { ok: true, advisor: safeAdvisor(advisor), deals });
}
