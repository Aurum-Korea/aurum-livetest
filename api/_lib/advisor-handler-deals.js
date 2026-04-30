// GET  /api/advisor/deals — list this advisor's deals (or ALL deals if admin cookie)
// POST /api/advisor/deals — submit a new deal for review
import { ok, bad, unauthorized, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { getAdvisor, listDeals, saveDeal, nextDealId } from './deal-storage.js';
import { sendRaw } from './email.js';

function notifyEmails() {
  return (process.env.NOTIFY_EMAILS||'').split(',').map(e=>e.trim()).filter(Boolean);
}

export default async function handler(req, res) {
  // Admin cookie — full access to all deals (partner view)
  const adminTok = getCookie(req, 'aurum_admin');
  const adminSess = verifyToken(adminTok);
  if (adminSess && adminSess.sub === 'admin') {
    if (req.method === 'GET') {
      const all = await listDeals();
      return ok(res, { deals: all, role: 'admin' });
    }
    return methodNotAllowed(res, ['GET']);
  }

  const tok     = getCookie(req, 'aurum_advisor');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'advisor') return unauthorized(res);

  const advisor = await getAdvisor(session.advisorId);
  if (!advisor || advisor.status !== 'active') return unauthorized(res);

  if (req.method === 'GET') {
    const all   = await listDeals();
    const mine  = all.filter(d => d.advisor_id === advisor.id);
    // Strip internal-only fields before returning to advisor
    const safe  = mine.map(d => ({
      id:d.id, name:d.name, ac:d.ac, stage:d.stage, raise_usd:d.raise_usd,
      min_usd:d.min_usd, ret:d.ret, hold:d.hold, vehicle:d.vehicle,
      carry:d.carry, hurdle:d.hurdle, sector:d.sector, geo:d.geo,
      created_at:d.created_at, alloc_usd:d.alloc_usd,
      // IOI: aggregate only, no member identity
      ioi_count: (d.iois||[]).length,
      ioi_vol_usd: 0, // will be USD when members submit amounts
      docs: (d.docs||[]).map(({id,kind,label,url,added_at,approved})=>({id,kind,label,url,added_at,approved})),
      qa: (d.qa||[]).filter(q=>q.published).map(({id,question,answer,published_at})=>({id,question,answer,published_at})),
      qa_pending: (d.qa||[]).filter(q=>!q.published).length,
      audit: (d.audit||[]).map(a=>({at:a.at,action:a.action})), // strip actor identity
    }));
    return ok(res, { deals:safe, advisor:{ id:advisor.id, name:advisor.name, firm:advisor.firm } });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name||'').trim().slice(0,200);
    if (!name) return bad(res,'name required');

    const now = Date.now();
    const id  = await nextDealId();
    const deal = {
      id, name,
      ac:          String(body.ac||'PE').slice(0,20),
      stage:       'review',
      raise_usd:   Number(body.raise_usd)||0,
      min_usd:     Number(body.min_usd)||0,
      ret:         String(body.ret||'').slice(0,80),
      hold:        String(body.hold||'').slice(0,80),
      vehicle:     String(body.vehicle||'SPV').slice(0,80),
      carry:       String(body.carry||'20%').slice(0,20),
      hurdle:      String(body.hurdle||'8%').slice(0,20),
      sector:      String(body.sector||'').slice(0,100),
      geo:         String(body.geo||'').slice(0,100),
      description: String(body.description||'').slice(0,2000),
      advisor_id:  advisor.id,
      advisor_firm:advisor.firm,
      created_by:  advisor.email,
      visible_to:  'none', // not visible to members until partner approves
      docs:[], qa:[], iois:[],
      alloc_usd:0, alloc_history:[],
      rating:0, rag:'a', notes:'',
      created_at:now,
      audit:[{at:now,actor:advisor.firm,action:'deal_submitted_by_advisor'}],
    };
    await saveDeal(deal);

    // Notify partners
    const notify = notifyEmails();
    if (notify.length) {
      try {
        await sendRaw({
          to: notify[0], bcc:notify.slice(1),
          subject: `[Aurum] New deal submitted: ${name} — ${advisor.firm}`,
          html:`<p>A new deal has been submitted for review.</p>
<p><strong>${name}</strong> · ${deal.ac} · ${id}</p>
<p>Submitted by: ${advisor.name} (${advisor.firm})</p>
<p>Review in the <a href="${process.env.SITE_URL||'https://theaurumcc.com'}/admin">Partners Console</a>.</p>`,
          text:`New deal: ${name} · ${id} · from ${advisor.firm}`,
        });
      } catch {}
    }

    return ok(res, { ok:true, deal:{ id:deal.id, name:deal.name, stage:deal.stage, created_at:deal.created_at } });
  }

  return methodNotAllowed(res, ['GET','POST']);
}
