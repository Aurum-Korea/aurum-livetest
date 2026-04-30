// GET /api/me — unified session check for all surfaces.
//
// Priority: aurum_admin → aurum_inst → aurum_access (member)
//
// Returns 200 {ok:true, role, name, email, id} on valid session.
// Returns 401 {ok:false} on NO valid session — lets callers throw/catch cleanly.
//   admin.html    — api() throws on 401 → catch → redirect to /members
//   mktplace.html — checks r.ok before using j → login screen stays on 401

import { ok, unauthorized, methodNotAllowed, getCookie } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead } from './_lib/storage.js';

const KV_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL   || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function kvGet(key) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const j = await r.json().catch(() => ({}));
    if (!j.result) return null;
    return typeof j.result === 'string' ? JSON.parse(j.result) : j.result;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // ── 1. Admin ──────────────────────────────────────────────────
  const adminTok  = getCookie(req, 'aurum_admin');
  const adminSess = verifyToken(adminTok);
  if (adminSess && adminSess.sub === 'admin') {
    return ok(res, {
      ok:    true,
      role:  'admin',
      email: adminSess.email || null,
      name:  adminSess.id   || adminSess.email || 'Partner',
      id:    adminSess.id   || null,
      exp:   adminSess.exp,
    });
  }

  // ── 2. Institution ────────────────────────────────────────────
  const instTok  = getCookie(req, 'aurum_inst');
  const instSess = verifyToken(instTok);
  if (instSess && instSess.sub === 'inst' && instSess.instId) {
    const inst = await kvGet(`inst:${instSess.instId}`);
    if (inst && inst.status === 'approved') {
      return ok(res, {
        ok:    true,
        role:  'inst',
        name:  inst.first_name ? `${inst.first_name} ${inst.last_name}` : inst.email,
        email: inst.email,
        firm:  inst.firm || '',
        id:    inst.id,
      });
    }
    return unauthorized(res, 'institution session invalid');
  }

  // ── 3. TACC Member (invite code) ─────────────────────────────
  const memberTok  = getCookie(req, 'aurum_access');
  const memberSess = verifyToken(memberTok);
  if (memberSess && memberSess.sub === 'member' && memberSess.leadId) {
    const lead = await getLead(memberSess.leadId).catch(() => null);
    if (lead && !lead.code_revoked) {
      return ok(res, {
        ok:    true,
        role:  'member',
        name:  lead.name || lead.email || 'Member',
        email: lead.email  || null,
        code:  lead.code   || memberSess.code || null,
        id:    lead.id,
      });
    }
    return unauthorized(res, 'member session invalid');
  }

  // ── No valid session ──────────────────────────────────────────
  return unauthorized(res, 'no session');
}
