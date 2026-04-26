// /api/nda — patron-side NDA dispatcher.
// Routes to the right handler based on the `op` query param. The original
// nice URLs (/api/nda-template, /api/nda-upload, /api/nda-status) are
// preserved via rewrites in vercel.json — clients never see ?op=…
//
// This consolidation keeps us under the Hobby-plan 12-function limit.

import templateHandler from './_lib/nda-template.js';
import uploadHandler   from './_lib/nda-upload.js';
import statusHandler   from './_lib/nda-status.js';
import { json, getQuery } from './_lib/http.js';

export default async function handler(req, res) {
  const q = getQuery(req);
  const op = (q.op || '').toLowerCase();
  switch (op) {
    case 'template': return templateHandler(req, res);
    case 'upload':   return uploadHandler(req, res);
    case 'status':   return statusHandler(req, res);
    default:
      return json(res, 404, { ok: false, error: 'unknown nda op' });
  }
}
