// GET /api/nda-template — serves the blank NDA PDF for the member to sign.
// Gated by member access cookie (so it's still confidential).

import { unauthorized, notFound, methodNotAllowed, getCookie } from './http.js';
import { verifyToken } from './auth.js';
import { getLead, saveLead } from './storage.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) {
    return unauthorized(res, 'no member session');
  }
  const lead = await getLead(session.leadId);
  if (!lead || !lead.code || lead.code_revoked || lead.code !== session.code) {
    return unauthorized(res, 'access revoked');
  }

  let buf;
  try {
    const path = join(process.cwd(), '_docs', 'nda-template.pdf');
    buf = await readFile(path);
  } catch (e) {
    console.error('[aurum] nda-template read failed:', e && e.message);
    return notFound(res, 'NDA template unavailable');
  }

  // Audit (best-effort)
  try {
    lead.audit = lead.audit || [];
    lead.audit.push({ at: Date.now(), actor: 'member', action: 'nda_template_downloaded' });
    await saveLead(lead);
  } catch {}

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="AURUM-NDA-template.pdf"');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(buf);
}
