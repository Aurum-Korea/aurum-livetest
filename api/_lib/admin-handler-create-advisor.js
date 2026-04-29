// POST /api/admin/create-advisor — invite a GP advisor (token-based, no raw password)
// GET  /api/admin/create-advisor — list all advisors
import { ok, bad, unauthorized, methodNotAllowed, readBody, getCookie } from './http.js';
import { verifyToken, signToken } from './auth.js';
import { saveAdvisor, listAdvisors, getAdvisorByEmail } from './deal-storage.js';
import { sendRaw, buildAdvisorSetupEmail } from './email.js';

export default async function handler(req, res) {
  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res);

  if (req.method === 'GET') {
    const advisors = await listAdvisors();
    return ok(res, { advisors: advisors.map(({ password_hash, ...a }) => a) });
  }

  if (req.method === 'POST') {
    const body  = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const name  = String(body.name  || '').trim().slice(0, 200);
    const firm  = String(body.firm  || '').trim().slice(0, 200);

    if (!email || !name || !firm)
      return bad(res, 'email, name and firm required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return bad(res, 'invalid email');

    const existing = await getAdvisorByEmail(email);
    if (existing) return bad(res, 'an advisor with this email already exists');

    const now = Date.now();
    const id  = 'adv_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
    const advisor = {
      id, email, name, firm,
      password_hash: null,         // set by advisor on first login via setup link
      status: 'pending',           // becomes 'active' after password setup
      created_at: now,
      created_by: session.email || 'admin',
      specialisations: body.specialisations || [],
    };
    await saveAdvisor(advisor);

    // Mint a 7-day setup token (same pattern as member pw-setup)
    const setupToken = signToken({
      sub: 'advisor-setup',
      advisorId: id,
      email,
      n: Math.random().toString(36).slice(2),
    }, 60 * 60 * 24 * 7);

    const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
    const setupUrl = `${siteUrl}/advisor-setup?token=${encodeURIComponent(setupToken)}`;

    // Send setup email
    let mailResult = { sent: false, reason: 'skipped' };
    try {
      const tpl = buildAdvisorSetupEmail({ advisor, setupUrl });
      mailResult = await sendRaw({
        to: email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        replyTo: process.env.REPLY_TO || undefined,
      });
    } catch (e) {
      console.warn('[create-advisor] email send failed', e && e.message);
    }

    const { password_hash, ...safeAdvisor } = advisor;
    return ok(res, { ok: true, advisor: safeAdvisor, setup_url: setupUrl, email: mailResult });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
