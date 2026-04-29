// POST /api/deal-indicate — member clicks Indicate Interest on a deal
// Body: { deal_id }
// Records the IOI, notifies partners, returns updated deal state.
import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead } from './_lib/storage.js';
import { getDeal, saveDeal } from './_lib/deal-storage.js';
import { sendRaw } from './_lib/email.js';

function notifyEmails() {
  return (process.env.NOTIFY_EMAILS||'').split(',').map(e=>e.trim()).filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const tok     = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) return unauthorized(res);

  const lead = await getLead(session.leadId).catch(()=>null);
  if (!lead || lead.status !== 'admitted') return unauthorized(res);

  const body    = await readBody(req);
  const deal_id = String(body.deal_id||'').trim();
  if (!deal_id) return bad(res,'deal_id required');

  const deal = await getDeal(deal_id);
  if (!deal) return notFound(res);

  const LIVE_STAGES = new Set(['live','ioi','dd','terms']);
  if (!LIVE_STAGES.has(deal.stage)) return bad(res,'deal is not open for indications');

  // Check visibility
  const canSee = deal.visible_to === 'all' || (Array.isArray(deal.visible_to) && deal.visible_to.includes(lead.id));
  if (!canSee) return bad(res,'deal not visible to this member');

  // Idempotent — don't double-record
  deal.iois = deal.iois || [];
  const existing = deal.iois.find(i => i.lead_id === lead.id);
  if (existing) {
    return ok(res, { ok:true, already_indicated:true, ioi_count:(deal.iois||[]).length });
  }

  const now = Date.now();
  deal.iois.push({ lead_id:lead.id, indicated_at:now });
  deal.audit.push({ at:now, actor:'member', action:'ioi_received', lead_id:lead.id });
  await saveDeal(deal);

  // Notify partners — anonymised (no member name in email)
  const notify = notifyEmails();
  if (notify.length) {
    try {
      await sendRaw({
        to: notify[0], bcc:notify.slice(1),
        subject: `[Aurum] IOI received — ${deal.name}`,
        html: `<p>A member has indicated interest in <strong>${deal.name}</strong>.</p>
<p>Total indications: <strong>${deal.iois.length}</strong></p>
<p>Review in the <a href="${process.env.SITE_URL||'https://theaurumcc.com'}/admin">Partners Console → Deals</a>.</p>
<p style="font-size:11px;color:#888">Member identity is not disclosed in this notification.</p>`,
        text: `IOI received on ${deal.name}. Total: ${deal.iois.length}.`,
      });
    } catch {}
  }

  return ok(res, { ok:true, indicated:true, ioi_count:deal.iois.length });
}
