// POST /api/admin/deal-update — modify a deal
// actions: advance_stage | decline | set_alloc | set_visibility |
//          add_doc | approve_doc | add_qa | publish_qa | set_rating | set_notes
import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { getDeal, saveDeal, getAdvisor } from './deal-storage.js';
import { sendRaw } from './email.js';

const STAGES = ['review','live','ioi','dd','terms','close'];
const KEY_STAGE_MSG = { live:'Your deal has been approved and is now live.',
  dd:'Your deal has advanced to due diligence.', terms:'Term sheet issued.',
  close:'Closed — congratulations.', declined:'We will not be proceeding at this time.' };

async function notifyAdvisor(deal, subject, msg) {
  if (!deal.advisor_id) return;
  try {
    const adv = await getAdvisor(deal.advisor_id);
    if (adv?.email) await sendRaw({ to:adv.email, subject,
      html:`<p>${msg}</p><p>Deal: <strong>${deal.name}</strong></p>`,
      text:`${msg} · ${deal.name}` });
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res);

  const body   = await readBody(req);
  const id     = String(body.id||'').trim();
  const action = String(body.action||'').trim();
  if (!id) return bad(res,'id required');

  const deal = await getDeal(id);
  if (!deal) return notFound(res);

  const now   = Date.now();
  const actor = (session.email||'').split('@')[0]||'partner';

  if (action === 'advance_stage') {
    const cur = STAGES.indexOf(deal.stage);
    if (cur < 0 || cur >= STAGES.length-1) return bad(res,'cannot advance from '+deal.stage);
    const next = STAGES[cur+1];
    deal.stage = next;
    deal.audit.push({at:now,actor,action:'stage_advanced',from:STAGES[cur],to:next});
    await saveDeal(deal);
    if (KEY_STAGE_MSG[next]) await notifyAdvisor(deal,`[Aurum] ${deal.name} — ${next}`,KEY_STAGE_MSG[next]);
    return ok(res,{ok:true,deal});
  }

  if (action === 'decline') {
    deal.stage = 'declined';
    deal.decline_reason = String(body.reason||'').slice(0,1000);
    deal.audit.push({at:now,actor,action:'deal_declined',reason:deal.decline_reason});
    await saveDeal(deal);
    await notifyAdvisor(deal,`[Aurum] ${deal.name} — not proceeding`,KEY_STAGE_MSG.declined);
    return ok(res,{ok:true,deal});
  }

  if (action === 'set_alloc') {
    const alloc = Math.max(0,Number(body.alloc_usd)||0);
    deal.alloc_usd = alloc; deal.alloc_set_at = now; deal.alloc_set_by = actor;
    deal.alloc_history = deal.alloc_history||[];
    deal.alloc_history.push({v:alloc,by:actor,at:now});
    deal.audit.push({at:now,actor,action:'alloc_set',alloc_usd:alloc});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'set_visibility') {
    deal.visible_to = body.visible_to||'all';
    deal.audit.push({at:now,actor,action:'visibility_set',visible_to:deal.visible_to});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'set_rating') {
    deal.rating = Math.max(0,Math.min(5,parseInt(body.rating)||0));
    if (['g','a','r'].includes(body.rag)) deal.rag = body.rag;
    deal.audit.push({at:now,actor,action:'rating_set',rating:deal.rating,rag:deal.rag});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'set_notes') {
    deal.notes = String(body.notes||'').slice(0,4000);
    deal.audit.push({at:now,actor,action:'notes_updated'});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'add_doc') {
    const label = String(body.label||'').trim().slice(0,200);
    const url   = String(body.url||'').trim().slice(0,1000);
    const kind  = String(body.kind||'other').slice(0,40);
    if (!label) return bad(res,'label required');
    if (url && !/^https?:\/\//.test(url)) return bad(res,'url must be https');
    const doc_id = 'ddoc_'+now.toString(36)+Math.random().toString(36).slice(2,5);
    deal.docs = deal.docs||[];
    deal.docs.push({id:doc_id,kind,label,url:url||null,source:'url',added_at:now,approved:false,added_by:actor});
    deal.audit.push({at:now,actor,action:'doc_added',kind,label});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'approve_doc') {
    const doc = (deal.docs||[]).find(d=>d.id===String(body.doc_id||''));
    if (!doc) return notFound(res);
    doc.approved=true; doc.approved_at=now; doc.approved_by=actor;
    deal.audit.push({at:now,actor,action:'doc_approved',doc_id:doc.id});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'add_qa') {
    const question = String(body.question||'').trim().slice(0,1000);
    if (!question) return bad(res,'question required');
    const qa_id = 'qa_'+now.toString(36)+Math.random().toString(36).slice(2,5);
    deal.qa = deal.qa||[];
    deal.qa.push({id:qa_id,question,answer:String(body.answer||'').slice(0,2000)||null,published:false,asked_at:now});
    deal.audit.push({at:now,actor,action:'qa_added'});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  if (action === 'publish_qa') {
    const qa = (deal.qa||[]).find(q=>q.id===String(body.qa_id||''));
    if (!qa) return notFound(res);
    qa.published = !qa.published; qa.published_at = qa.published ? now : null;
    deal.audit.push({at:now,actor,action:qa.published?'qa_published':'qa_unpublished'});
    await saveDeal(deal); return ok(res,{ok:true,deal});
  }

  return bad(res,'unknown action: '+action);
}
