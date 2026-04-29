// /api/admin/nda — admin-side NDA dispatcher.
// Routes to the right handler based on the `op` query param. The original
// nice URLs (/api/admin/nda-review, /api/admin/nda-download, /api/admin/nda-archive)
// are preserved via rewrites in vercel.json.

import reviewHandler   from '../_lib/admin-nda-review.js';
import downloadHandler from '../_lib/admin-nda-download.js';
import archiveHandler  from '../_lib/admin-nda-archive.js';
import { json, getQuery } from '../_lib/http.js';

export default async function handler(req, res) {
  const q = getQuery(req);
  const op = (q.op || '').toLowerCase();
  switch (op) {
    case 'review':   return reviewHandler(req, res);
    case 'download': return downloadHandler(req, res);
    case 'archive':  return archiveHandler(req, res);
    default:
      return json(res, 404, { ok: false, error: 'unknown admin nda op' });
  }
}
