// GET /api/doc?id=memo|companion|faq
// Streams the requested PDF if the requester has a valid aurum_access cookie
// (set by /api/verify-code).  Logs the download.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { json, getQuery, getCookie, unauthorized, notFound, methodNotAllowed } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead, saveLead } from './_lib/storage.js';

const DOCS = {
  memo:      { file: 'memo.pdf',      label: 'AURUM Founders Memo' },
  companion: { file: 'companion.pdf', label: 'AURUM Companion Memo' },
  faq:       { file: 'faq.pdf',       label: 'AURUM Patron FAQ' },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const id = String(getQuery(req).id || '').toLowerCase();
  const def = DOCS[id];
  if (!def) return notFound(res, 'unknown doc');

  // Auth: require a valid patron cookie (issued via /api/verify-code)
  const session = verifyToken(getCookie(req, 'aurum_access'));
  if (!session || session.sub !== 'patron') return unauthorized(res, 'no access — verify your code');

  // Re-check the lead is still valid (in case the partners revoked the code)
  let lead = null;
  try { lead = await getLead(session.leadId); } catch {}
  if (!lead) return unauthorized(res, 'access not found');
  if (lead.code_revoked || lead.code !== session.code) return unauthorized(res, 'code revoked');

  // NDA gate — must be approved by a partner before materials are released
  if (lead.nda_state !== 'approved') {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Aurum-Gate', 'nda');
    res.end(JSON.stringify({
      ok: false,
      error: 'nda required',
      nda_state: lead.nda_state || 'awaiting',
      redirect: '/nda',
    }));
    return;
  }

  // Read the PDF from the bundled /_docs folder
  let buf;
  try {
    const path = join(process.cwd(), '_docs', def.file);
    buf = await readFile(path);
  } catch (e) {
    console.error('doc read failed', e);
    return notFound(res, 'document unavailable');
  }

  // Audit
  try {
    lead.audit = lead.audit || [];
    lead.audit.push({ at: Date.now(), actor: 'patron', action: 'download', doc: id });
    lead.downloads = (lead.downloads || 0) + 1;
    await saveLead(lead);
  } catch {}

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${def.file}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (lead.code) res.setHeader('X-Patron-Code', lead.code);
  res.end(buf);
}
