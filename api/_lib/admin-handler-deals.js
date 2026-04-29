// GET  /api/admin/deals  — list all deals
// POST /api/admin/deals  — create deal (partner or system)
import { ok, bad, unauthorized, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { listDeals, saveDeal, nextDealId } from './deal-storage.js';
import { sendRaw } from './email.js';

function notifyEmails() {
  return (process.env.NOTIFY_EMAILS||'').split(',').map(e=>e.trim()).filter(Boolean);
}

export default async function handler(req, res) {
  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res);
  const actor = (session.email||'').split('@')[0]||'partner';

  if (req.method === 'GET') {
    const deals = await listDeals();
    return ok(res, { deals });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name||'').trim().slice(0,200);
    if (!name) return bad(res, 'name required');
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
      notes:       String(body.notes||'').slice(0,2000),
      created_by:  session.email||actor,
      advisor_id:  body.advisor_id||null,
      visible_to:  body.visible_to||'all',
      docs:[], qa:[], iois:[], alloc_usd:0,
      rating:0, rag:'a', created_at:now,
      alloc_history:[],
      audit:[{at:now,actor,action:'deal_created',source:'admin_console'}],
    };
    await saveDeal(deal);
    const notify = notifyEmails();
    if (notify.length) {
      try { await sendRaw({ to:notify[0], bcc:notify.slice(1),
        subject:`[Aurum] New deal: ${name}`,
        html:`<p>New deal added by ${actor}: <strong>${name}</strong> · ${deal.ac} · ${id}</p>`,
        text:`New deal: ${name} · ${id}` }); } catch {}
    }
    return ok(res, { ok:true, deal });
  }

  return methodNotAllowed(res, ['GET','POST']);
}
