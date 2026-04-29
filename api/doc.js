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
  package:    { file: 'TACC_Onboarding_May_2026.pdf', label: 'TACC Onboarding · May 2026' },
  structural: { file: 'TACC_Structural_Memo.pdf',     label: 'TACC Structural Memo' },
  faq:        { file: 'TACC_Member_FAQ.pdf',          label: 'TACC Member FAQ' },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const id = String(getQuery(req).id || '').toLowerCase();

  // ════════════════════════════════════════════════════════════════════════
  //  SERVER-SIDE PAGE GATE — for /main /memo /portfolio /nda /ioi
  //  These URLs are rewritten by vercel.json to /api/doc?id=*-page.
  //  HTML is served ONLY after auth validates. Anonymous → 302 to /.
  //  This is the real gate; the client-side overlay in each page is
  //  defense-in-depth for stale cookies between requests.
  // ════════════════════════════════════════════════════════════════════════
  const PAGE_IDS = {
    // page-id          file in _pages/    auth requirement
    'program-page':    { file: 'main.html',      require: 'cookie' },
    'nda-page':        { file: 'nda.html',       require: 'cookie' },
    'memo-page':       { file: 'memo.html',      require: 'nda-approved' },
    'ioi-page':        { file: 'ioi.html',       require: 'nda-approved' },
    'portfolio-page':  { file: 'portfolio.html', require: 'nda-approved' },
    'customer-page':   { file: 'customer.html',   require: 'wire-cleared' },
  };

  if (PAGE_IDS[id]) {
    const cfg = PAGE_IDS[id];
    // Try admin auth first — partners can preview any gated page
    const adminTok = getCookie(req, 'aurum_admin');
    const adminSession = verifyToken(adminTok);
    const isAdmin = !!(adminSession && adminSession.sub === 'admin');
    let pageLead = null;
    if (!isAdmin) {
      // Member auth path
      const memberSession = verifyToken(getCookie(req, 'aurum_access'));
      if (!memberSession || memberSession.sub !== 'member') {
        return redirectToInquiry(res);
      }
      try { pageLead = await getLead(memberSession.leadId); } catch {}
      if (!pageLead || pageLead.code_revoked || pageLead.code !== memberSession.code) {
        return redirectToInquiry(res);
      }
      // State checks per page
      if (cfg.require === 'nda-approved' && pageLead.nda_state !== 'approved') {
        return redirectToInquiry(res);
      }
      if (cfg.require === 'wire-cleared' && !(pageLead.wire && pageLead.wire.cleared_at)) {
        return redirectToInquiry(res);
      }
    }
    // Auth passed — serve the HTML from _pages/
    let html;
    try {
      const fpath = join(process.cwd(), '_pages', cfg.file);
      html = await readFile(fpath, 'utf-8');
    } catch (e) {
      console.error('page read failed:', cfg.file, e);
      return notFound(res, 'page not found');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.end(html);
  }

  function redirectToInquiry(r) {
    r.statusCode = 302;
    r.setHeader('Location', '/');
    r.setHeader('Cache-Control', 'private, no-store');
    return r.end();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Admin pass-through for ping endpoints (id=access, id=session, id=memo).
  //  These are HEAD calls used by the gated pages to verify cookie + get
  //  identity headers for the watermark. An admin cookie alone is enough —
  //  no ?lead= required. If ?lead= is supplied, we look up the lead so the
  //  watermark can show "admin viewing X". If the lookup fails, we still
  //  return 200 (the partner is authenticated; lead lookup failure is not
  //  an auth failure).
  // ════════════════════════════════════════════════════════════════════════
  if (id === 'access' || id === 'session' || id === 'memo') {
    const adminTok0 = getCookie(req, 'aurum_admin');
    const adminSess0 = verifyToken(adminTok0);
    if (adminSess0 && adminSess0.sub === 'admin') {
      // Optional lead lookup for watermark context
      const leadIdParam0 = String(getQuery(req).lead || '').trim();
      let pingLead = null;
      if (leadIdParam0) {
        try { pingLead = await getLead(leadIdParam0); } catch {}
      }
      const adminEmail = adminSess0.email || adminSess0.id || 'admin';
      res.statusCode = 200;
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Viewer-Kind', 'admin');
      // Watermark: partner identity + (if available) which member they're viewing
      const watermark = pingLead
        ? `${adminEmail} (admin viewing ${pingLead.email || pingLead.code || pingLead.id})`
        : `${adminEmail} (admin preview)`;
      res.setHeader('X-Member-Email', watermark);
      if (pingLead && pingLead.code) res.setHeader('X-Member-Code', pingLead.code);
      if (pingLead && pingLead.nda_state) res.setHeader('X-Nda-State', pingLead.nda_state);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: true, viewer: 'admin', leadFound: !!pingLead }));
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
