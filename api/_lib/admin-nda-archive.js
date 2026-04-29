// GET /api/admin/nda-archive[?format=csv|json]
//
// Returns a manifest of every NDA file across every lead — current upload
// plus all archived (superseded) uploads. Includes lead metadata so the
// output is self-contained for legal/compliance use.
//
// Each row corresponds to ONE FILE (not one lead), so a lead with three
// re-uploads produces three rows. The download_url column is a relative
// path the partner can use against this API to fetch each file.
//
// Query params:
//   format=csv   → CSV with header row (default)
//   format=json  → JSON array

import { unauthorized, methodNotAllowed, getCookie, getQuery, json } from './http.js';
import { verifyToken } from './auth.js';
import { listLeads } from './storage.js';

function fmt(ms) {
  if (!ms) return '';
  return new Date(ms).toISOString();
}
function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res, 'admin only');

  const q = getQuery(req);
  const format = (q.format || 'csv').toLowerCase();

  let leads = [];
  try { leads = await listLeads(2000); } catch (e) { console.error(e); }

  // Build flat list of file rows
  const rows = [];
  for (const l of leads) {
    if (!l) continue;
    // Archived (superseded) uploads first, oldest to newest
    const archive = Array.isArray(l.nda_archive) ? l.nda_archive : [];
    archive.forEach((a, idx) => {
      rows.push({
        lead_id: l.id,
        lead_name: l.name || '',
        lead_name_ko: l.name_ko || '',
        lead_email: l.email || '',
        lead_country: l.country || '',
        lead_wealth_tier: l.wealth || '',
        lead_status: l.status || '',
        code: l.code || '',
        version: 'archived',
        archive_index: idx,
        file_name: a.file_name || '',
        file_size_bytes: a.file_size || 0,
        file_type: a.file_type || '',
        uploaded_at: fmt(a.uploaded_at),
        final_state: a.final_state || '',
        reviewed_at: fmt(a.reviewed_at),
        reviewed_by: a.reviewed_by || '',
        rejection_reason: a.rejection_reason || '',
        superseded_at: fmt(a.superseded_at),
        download_url: `/api/admin/nda-download?id=${encodeURIComponent(l.id)}&archive=${idx}`,
      });
    });
    // Then current upload (if any)
    if (l.nda_file_url) {
      rows.push({
        lead_id: l.id,
        lead_name: l.name || '',
        lead_name_ko: l.name_ko || '',
        lead_email: l.email || '',
        lead_country: l.country || '',
        lead_wealth_tier: l.wealth || '',
        lead_status: l.status || '',
        code: l.code || '',
        version: 'current',
        archive_index: '',
        file_name: l.nda_file_name || '',
        file_size_bytes: l.nda_file_size || 0,
        file_type: l.nda_file_type || '',
        uploaded_at: fmt(l.nda_uploaded_at),
        final_state: l.nda_state || '',
        reviewed_at: fmt(l.nda_reviewed_at),
        reviewed_by: l.nda_reviewed_by || '',
        rejection_reason: l.nda_rejection_reason || '',
        superseded_at: '',
        download_url: `/api/admin/nda-download?id=${encodeURIComponent(l.id)}`,
      });
    }
  }

  if (format === 'json') {
    return json(res, 200, {
      ok: true,
      generated_at: new Date().toISOString(),
      total_files: rows.length,
      total_leads_with_uploads: new Set(rows.map((r) => r.lead_id)).size,
      rows,
    });
  }

  // CSV
  const cols = [
    'lead_id', 'lead_name', 'lead_name_ko', 'lead_email', 'lead_country',
    'lead_wealth_tier', 'lead_status', 'code', 'version', 'archive_index',
    'file_name', 'file_size_bytes', 'file_type', 'uploaded_at',
    'final_state', 'reviewed_at', 'reviewed_by', 'rejection_reason',
    'superseded_at', 'download_url',
  ];
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => csvEscape(r[c])).join(','));
  const body = lines.join('\r\n') + '\r\n';

  const stamp = new Date().toISOString().slice(0, 10);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="aurum-nda-archive-${stamp}.csv"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.end(body);
}
