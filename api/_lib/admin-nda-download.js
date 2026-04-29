// GET /api/admin/nda-download?id=LEAD_ID[&archive=N]
// Streams an uploaded NDA file (current or an archived version).
//   id=LEAD_ID       → required.
//   archive=<index>  → optional. If omitted, streams the CURRENT upload.
//                      If 0..N-1, streams nda_archive[index].
//
// The blob URL is private (never sent to the member); this endpoint is
// the only way to access it after upload.

import { unauthorized, notFound, bad, methodNotAllowed, getCookie, getQuery, json } from './http.js';
import { verifyToken } from './auth.js';
import { getLead, saveLead } from './storage.js';
import { getPrivate, isConfigured as blobConfigured } from './blob.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const tok = getCookie(req, 'aurum_admin');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'admin') return unauthorized(res, 'admin only');
  const actor = session.id || session.email || 'admin';

  const q = getQuery(req);
  const id = q.id;
  if (!id) return bad(res, 'missing id');

  const lead = await getLead(id);
  if (!lead) return notFound(res, 'lead not found');

  let file_url, file_name, file_type, archive_idx = null;
  if (q.archive !== undefined && q.archive !== '') {
    const idx = parseInt(q.archive, 10);
    if (!Number.isInteger(idx) || idx < 0) return bad(res, 'invalid archive index');
    const archive = Array.isArray(lead.nda_archive) ? lead.nda_archive : [];
    if (idx >= archive.length) return notFound(res, 'archive entry not found');
    const entry = archive[idx];
    file_url = entry.file_url;
    file_name = entry.file_name;
    file_type = entry.file_type;
    archive_idx = idx;
  } else {
    if (!lead.nda_file_url) return notFound(res, 'no NDA uploaded');
    file_url = lead.nda_file_url;
    file_name = lead.nda_file_name;
    file_type = lead.nda_file_type;
  }

  if (!blobConfigured()) return json(res, 503, { ok: false, error: 'blob not configured' });

  let result;
  try {
    result = await getPrivate(file_url);
  } catch (e) {
    console.error('[aurum] nda-download failed:', e && e.message);
    return json(res, 500, { ok: false, error: 'fetch failed' });
  }
  if (!result) return notFound(res, 'file not found in storage');

  try {
    lead.audit = lead.audit || [];
    lead.audit.push({
      at: Date.now(), actor, action: 'nda_viewed',
      ...(archive_idx !== null ? { archive_idx } : {}),
    });
    await saveLead(lead);
  } catch {}

  res.statusCode = 200;
  res.setHeader('Content-Type', result.contentType || file_type || 'application/octet-stream');
  const downloadName = file_name || `${lead.id}-nda${archive_idx !== null ? `-archive-${archive_idx}` : ''}`;
  res.setHeader('Content-Disposition', `attachment; filename="${String(downloadName).replace(/"/g, '')}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (result.stream && typeof result.stream.getReader === 'function') {
    const reader = result.stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } else {
    try {
      const chunks = [];
      for await (const chunk of result.stream) chunks.push(chunk);
      res.end(Buffer.concat(chunks));
    } catch (e) {
      console.error('[aurum] stream consume failed:', e);
      res.end();
    }
  }
}
