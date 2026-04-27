// POST /api/nda-upload — member uploads their signed NDA.
// Auth: aurum_access cookie (code-based session) — no separate ID required.
// Body: { filename, contentType, dataBase64 }
//
// Replaces any prior upload for the same lead. Sets nda_state='uploaded'
// (or back to 'uploaded' if it was previously 'rejected').

import { ok, bad, unauthorized, methodNotAllowed, readBody, getCookie, json } from './http.js';
import { verifyToken } from './auth.js';
import { getLead, saveLead } from './storage.js';
import { putPrivate, isConfigured as blobConfigured } from './blob.js';
import { sendRaw, buildNdaUploadedAlert } from './email.js';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);
const ALLOWED_EXT = /\.(pdf|jpe?g|png)$/i;
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB cap (Vercel function body ~4.5 MB)

function safeFilename(s) {
  s = String(s || 'signed-nda').trim().slice(0, 120);
  // strip path separators, control chars, and quotes
  s = s.replace(/[\\\/\x00-\x1f"'`]/g, '_');
  if (!ALLOWED_EXT.test(s)) s = s + '.pdf';
  return s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  // Auth via member access cookie
  const tok = getCookie(req, 'aurum_access');
  const session = verifyToken(tok);
  if (!session || session.sub !== 'member' || !session.leadId) {
    return unauthorized(res, 'no member session');
  }

  // Re-validate the lead and code on every request — a partner may have revoked.
  const lead = await getLead(session.leadId);
  if (!lead) return unauthorized(res, 'lead not found');
  if (!lead.code || lead.code_revoked || lead.code !== session.code) {
    return unauthorized(res, 'access revoked');
  }

  if (!blobConfigured()) {
    return json(res, 503, { ok: false, error: 'file storage not configured' });
  }

  let body;
  try { body = await readBody(req); }
  catch { return bad(res, 'invalid body'); }

  const filename = safeFilename(body.filename);
  const contentType = String(body.contentType || '').toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) {
    return bad(res, 'file must be PDF, JPG, or PNG');
  }

  const b64 = String(body.dataBase64 || '');
  if (!b64) return bad(res, 'missing dataBase64');
  let buf;
  try { buf = Buffer.from(b64, 'base64'); }
  catch { return bad(res, 'invalid base64'); }
  if (!buf.length) return bad(res, 'empty file');
  if (buf.length > MAX_BYTES) {
    return bad(res, 'file too large (max 4 MB)');
  }

  // Sanity-check headers — reject obvious mismatches
  const head = buf.slice(0, 4);
  const looksLikePdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
  const looksLikeJpg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const looksLikePng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  if (contentType === 'application/pdf' && !looksLikePdf) return bad(res, 'file does not look like a PDF');
  if ((contentType === 'image/jpeg' || contentType === 'image/jpg') && !looksLikeJpg) return bad(res, 'file does not look like a JPG');
  if (contentType === 'image/png' && !looksLikePng) return bad(res, 'file does not look like a PNG');

  // Upload to private blob storage
  const stamp = new Date().toISOString().replace(/[:T.]/g, '-').slice(0, 19);
  const ext = contentType === 'application/pdf' ? 'pdf' : (contentType === 'image/png' ? 'png' : 'jpg');
  const path = `nda/${lead.id}/${stamp}.${ext}`;
  let putResult;
  try {
    putResult = await putPrivate(path, buf, { contentType });
  } catch (e) {
    console.error('[aurum] blob put failed:', e && e.stack || e);
    return json(res, 500, { ok: false, error: 'storage error' });
  }

  // Archive: never delete previous uploads. If there was a prior file,
  // push its full record into nda_archive[] so the legal trail is complete.
  // This array is append-only and grows whenever a member re-uploads
  // (typically after a rejection).
  lead.nda_archive = lead.nda_archive || [];
  if (lead.nda_file_url) {
    lead.nda_archive.push({
      file_url: lead.nda_file_url,
      file_pathname: lead.nda_file_pathname || null,
      file_name: lead.nda_file_name || null,
      file_size: lead.nda_file_size || 0,
      file_type: lead.nda_file_type || null,
      uploaded_at: lead.nda_uploaded_at || null,
      // Capture the disposition this version received before being superseded
      final_state: lead.nda_state || null,
      reviewed_at: lead.nda_reviewed_at || null,
      reviewed_by: lead.nda_reviewed_by || null,
      rejection_reason: lead.nda_rejection_reason || null,
      superseded_at: Date.now(),
    });
  }

  // Update lead record with the new upload as the current one
  const now = Date.now();
  lead.nda_state = 'uploaded';
  lead.nda_file_url = putResult.url;
  lead.nda_file_pathname = putResult.pathname;
  lead.nda_file_name = filename;
  lead.nda_file_size = buf.length;
  lead.nda_file_type = contentType;
  lead.nda_uploaded_at = now;
  // Clear the per-version review fields since this is a fresh upload
  lead.nda_reviewed_at = null;
  lead.nda_reviewed_by = null;
  lead.nda_rejection_reason = '';
  lead.audit = lead.audit || [];
  lead.audit.push({
    at: now, actor: 'member', action: 'nda_uploaded',
    filename, size: buf.length, type: contentType,
    archive_count: lead.nda_archive.length,
  });
  await saveLead(lead);

  // Notify partners — best effort. Never fail the upload because of email.
  const notifyTo = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (notifyTo.length) {
    try {
      const tpl = buildNdaUploadedAlert({ lead });
      const r = await sendRaw({ to: notifyTo, subject: tpl.subject, html: tpl.html, text: tpl.text });
      if (r.sent) {
        try {
          lead.audit.push({ at: Date.now(), actor: 'system', action: 'nda_upload_alert_sent' });
          await saveLead(lead);
        } catch {}
      } else {
        console.warn('[aurum] nda upload alert not sent:', r.reason);
      }
    } catch (e) {
      console.warn('[aurum] nda upload alert error:', e && e.stack || e);
    }
  }

  return ok(res, {
    ok: true,
    state: 'uploaded',
    filename,
    size: buf.length,
    uploaded_at: now,
  });
}
