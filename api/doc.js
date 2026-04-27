// GET /api/doc?id=package|structural|faq      — bundled materials PDFs
// GET /api/doc?id=nda-mine                     — member's own signed NDA
// GET /api/doc?id=member-doc&doc_id=<id>       — a specific blob-stored doc on the member's portfolio
// All paths require a valid aurum_access cookie (set by /api/verify-code).

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { json, getQuery, getCookie, unauthorized, notFound, methodNotAllowed } from './_lib/http.js';
import { verifyToken } from './_lib/auth.js';
import { getLead, saveLead } from './_lib/storage.js';
import { getPrivate, isConfigured as blobConfigured } from './_lib/blob.js';
import { extractGeo, geoSummary } from './_lib/geo.js';
import { watermarkPdf } from './_lib/pdf-watermark.js';

const DOCS = {
  package:    { file: 'package.pdf',    label: 'AURUM Century Club Package' },
  structural: { file: 'structural.pdf', label: 'AURUM Structural Memo' },
  faq:        { file: 'faq.pdf',        label: 'AURUM Member FAQ' },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const id = String(getQuery(req).id || '').toLowerCase();

  // ── Special case: id=access (used by /main only). Admin cookie alone is
  //    sufficient — partners need to preview the program without a member
  //    context. No ?lead= required. Falls through to standard auth otherwise.
  if (id === 'access') {
    const adminTok0 = getCookie(req, 'aurum_admin');
    const adminSess0 = verifyToken(adminTok0);
    if (adminSess0 && adminSess0.sub === 'admin') {
      res.statusCode = 200;
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Viewer-Kind', 'admin');
      res.setHeader('X-Member-Email', (adminSess0.email || adminSess0.id || 'admin') + ' (admin preview)');
      res.setHeader('Content-Type', 'application/json');
      return res.end('{"ok":true,"viewer":"admin"}');
    }
    // No admin cookie — fall through to member auth below
  }

  // Two auth paths:
  //   1. Admin (aurum_admin cookie) + ?lead=L_xxx → view any member's doc / portfolio session ping
  //   2. Member (aurum_access cookie) → own doc only
  let lead = null;
  let viewerKind = 'member';
  let viewerEmail = null;
  const adminTok = getCookie(req, 'aurum_admin');
  const adminSession = verifyToken(adminTok);
  if (adminSession && adminSession.sub === 'admin') {
    const leadIdParam = String(getQuery(req).lead || '').trim();
    if (!leadIdParam) {
      // Admin without ?lead= — fall through to member auth (in case the request is from an admin
      // who's also a member testing their own flow). If neither works, will 401 below.
    } else {
      try { lead = await getLead(leadIdParam); } catch {}
      if (lead) {
        viewerKind = 'admin';
        viewerEmail = adminSession.email || adminSession.id || 'admin';
      }
    }
  }
  if (!lead) {
    // Member auth path
    const session = verifyToken(getCookie(req, 'aurum_access'));
    if (!session || session.sub !== 'member') return unauthorized(res, 'no access — verify your code');
    try { lead = await getLead(session.leadId); } catch {}
    if (!lead) return unauthorized(res, 'access not found');
    if (lead.code_revoked || lead.code !== session.code) return unauthorized(res, 'code revoked');
    viewerEmail = lead.email || lead.code || '';
  }

  // ── Auth ping — used by /memo and /portfolio to verify session + get
  //    identity headers for the on-screen watermark. Doesn't serve a doc.
  if (id === 'memo' || id === 'session') {
    // Members must have NDA approved. Admins can ping any time (it's their tool).
    if (viewerKind === 'member' && lead.nda_state !== 'approved') {
      res.statusCode = 403;
      res.setHeader('X-Aurum-Gate', 'nda');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'nda required' }));
    }
    res.statusCode = 200;
    res.setHeader('Cache-Control', 'private, no-store');
    if (lead.code) res.setHeader('X-Member-Code', lead.code);
    // Watermark identity: admin sees own email (so leak traces to partner who pulled the view)
    if (viewerKind === 'admin') res.setHeader('X-Member-Email', viewerEmail + ' (admin viewing ' + (lead.email || lead.code) + ')');
    else if (lead.email) res.setHeader('X-Member-Email', lead.email);
    res.setHeader('X-Viewer-Kind', viewerKind);
    res.setHeader('Content-Type', 'application/json');
    return res.end('{"ok":true}');
  }

  // ── Access ping — used by /main (marketing) to verify code-cookie only.
  //    No NDA gate. Returns 200 if user has valid invitation code session,
  //    401 otherwise. /main calls this on load and redirects to /code if 401.
  if (id === 'access') {
    res.statusCode = 200;
    res.setHeader('Cache-Control', 'private, no-store');
    if (lead.code) res.setHeader('X-Member-Code', lead.code);
    if (lead.email) res.setHeader('X-Member-Email', lead.email);
    if (lead.nda_state) res.setHeader('X-Nda-State', lead.nda_state);
    res.setHeader('Content-Type', 'application/json');
    return res.end('{"ok":true}');
  }

  // ── NDA self-download — member can re-download their own signed NDA ───
  if (id === 'nda-mine') {
    if (lead.nda_state !== 'approved' && lead.nda_state !== 'uploaded') {
      return notFound(res, 'NDA not yet on file');
    }
    if (!lead.nda_file_pathname) return notFound(res, 'NDA file not found');
    if (!blobConfigured()) return notFound(res, 'storage not configured');
    let blob;
    try { blob = await getPrivate(lead.nda_file_pathname); }
    catch (e) { console.error('nda-mine blob get failed', e); return notFound(res, 'NDA unavailable'); }
    if (!blob) return notFound(res, 'NDA unavailable');
    res.statusCode = 200;
    res.setHeader('Content-Type', blob.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="aurum-nda-${lead.id || 'signed'}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (typeof blob.stream?.pipe === 'function') return blob.stream.pipe(res);
    // Fallback: collect to buffer
    const chunks = [];
    for await (const chunk of blob.stream) chunks.push(chunk);
    return res.end(Buffer.concat(chunks));
  }

  // ── Member-doc — specific blob-stored doc on the member's portfolio ─
  if (id === 'member-doc') {
    if (lead.nda_state !== 'approved') {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'nda required' }));
    }
    const doc_id = String(getQuery(req).doc_id || '');
    if (!doc_id) return notFound(res, 'missing doc_id');
    const doc = (lead.docs || []).find((d) => d.id === doc_id);
    if (!doc) return notFound(res, 'doc not found');
    if (doc.source !== 'blob' || !doc.blob_pathname) return notFound(res, 'not a blob doc');
    if (!blobConfigured()) return notFound(res, 'storage not configured');
    let blob;
    try { blob = await getPrivate(doc.blob_pathname); }
    catch (e) { console.error('member-doc blob get failed', e); return notFound(res, 'doc unavailable'); }
    if (!blob) return notFound(res, 'doc unavailable');
    // Audit
    try {
      lead.audit = lead.audit || [];
      lead.audit.push({ at: Date.now(), actor: 'member', action: 'doc_download', doc_id });
      await saveLead(lead);
    } catch {}
    res.statusCode = 200;
    res.setHeader('Content-Type', blob.contentType || 'application/pdf');
    const safeLabel = String(doc.label || doc.kind || 'document').replace(/[^\w\-. ]/g, '_').slice(0, 80);
    res.setHeader('Content-Disposition', `inline; filename="${safeLabel}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (typeof blob.stream?.pipe === 'function') return blob.stream.pipe(res);
    const chunks = [];
    for await (const chunk of blob.stream) chunks.push(chunk);
    return res.end(Buffer.concat(chunks));
  }

  // ── Bundled materials (package | structural | faq) ───────────────────
  const def = DOCS[id];
  if (!def) return notFound(res, 'unknown doc');

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

  // Apply per-member watermark before sending
  try {
    buf = await watermarkPdf(buf, {
      email: lead.email || '',
      code: lead.code || '',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  } catch (e) {
    console.warn('[doc] watermark failed, sending unmarked', e);
  }

  // Audit (with geo)
  try {
    const geo = extractGeo(req);
    lead.audit = lead.audit || [];
    lead.audit.push({
      at: Date.now(),
      actor: 'member',
      action: 'download',
      doc: id,
      geo,
    });
    lead.downloads = (lead.downloads || 0) + 1;
    await saveLead(lead);
  } catch {}

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${def.file}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (lead.code) res.setHeader('X-Member-Code', lead.code);
  if (lead.email) res.setHeader('X-Member-Email', lead.email);
  res.end(buf);
}
