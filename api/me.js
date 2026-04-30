// GET /api/me — unified session check for all surfaces.
//
// Checks cookies in priority order:
//   aurum_admin   → admin session   (role: 'admin')
//   aurum_inst    → institution     (role: 'inst')
//   aurum_access  → TACC member     (role: 'member')
//
// Returns { ok: true, role, name, email, [code] } on valid session.
// Returns { ok: false } on no session (200, not 401 — callers decide redirect).
//
// Used by:
//   admin.html    — checks aurum_admin
//   mktplace.html — checks aurum_inst or aurum_access on page load

import { ok, methodNotAllowed, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead } from './_lib/storage.js';

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key) {
  if (!KV_URL || !KV_TOKEN) return null;
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!j.result) return null;
  try { return JSON.parse(j.result); } catch { return j.result; }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // 1. Admin
  const adminTok = getCookie(req, 'aurum_admin');
  const adminSess = verifyToken(adminTok);
  if (adminSess && adminSess.sub === 'admin') {
    return ok(res, {
      ok: true,
      role: 'admin',
      email: adminSess.email || null,
      name: adminSess.id || adminSess.email || 'Partner',
      id: adminSess.id || null,
      exp: adminSess.exp,
    });
  }

  // 2. Institution
  const instTok = getCookie(req, 'aurum_inst');
  const instSess = verifyToken(instTok);
  if (instSess && instSess.sub === 'inst' && instSess.instId) {
    try {
      const inst = await kvGet(`inst:${instSess.instId}`);
      if (inst && inst.status === 'approved') {
        return ok(res, {
          ok: true,
          role: 'inst',
          name: inst.first_name ? `${inst.first_name} ${inst.last_name}` : inst.email,
          email: inst.email,
          firm: inst.firm || '',
          id: inst.id,
        });
      }
    } catch (e) {
      console.error('[me] inst lookup failed', e);
    }
    return ok(res, { ok: false, reason: 'inst-session-invalid' });
  }

  // 3. TACC Member (invite code)
  const memberTok = getCookie(req, 'aurum_access');
  const memberSess = verifyToken(memberTok);
  if (memberSess && memberSess.sub === 'member' && memberSess.leadId) {
    try {
      const lead = await getLead(memberSess.leadId);
      if (lead && !lead.code_revoked) {
        return ok(res, {
          ok: true,
          role: 'member',
          name: lead.name || lead.email || 'Member',
          email: lead.email || null,
          code: lead.code || memberSess.code || null,
          id: lead.id,
        });
      }
    } catch (e) {
      console.error('[me] member lookup failed', e);
    }
    return ok(res, { ok: false, reason: 'member-session-invalid' });
  }

  return ok(res, { ok: false, reason: 'no-session' });
}
