// api/admin.js — consolidated admin router (Hobby plan: 12-function limit)
// vercel.json rewrite passes the sub-path as ?_r=<path> so routing is
// explicit and does not rely on req.url being preserved through rewrites.
//
// Routes:
//   list            → admin-handler-list.js
//   approve         → admin-handler-approve.js
//   update          → admin-handler-update.js
//   create-advisor  → admin-handler-create-advisor.js
//   deals           → admin-handler-deals.js
//   deal-update     → admin-handler-deal-update.js
//   nda             → nda-review / nda-download / nda-archive (via ?op= or body.op)
//   nda-review      → admin-nda-review.js (direct alias)
//   nda-download    → admin-nda-download.js (direct alias)
//   nda-archive     → admin-nda-archive.js (direct alias)

import listHandler          from './_lib/admin-handler-list.js';
import approveHandler       from './_lib/admin-handler-approve.js';
import updateHandler        from './_lib/admin-handler-update.js';
import createAdvisorHandler from './_lib/admin-handler-create-advisor.js';
import dealsHandler         from './_lib/admin-handler-deals.js';
import dealUpdateHandler    from './_lib/admin-handler-deal-update.js';
import ndaReviewHandler     from './_lib/admin-nda-review.js';
import ndaDownloadHandler   from './_lib/admin-nda-download.js';
import ndaArchiveHandler    from './_lib/admin-nda-archive.js';
import { json, getQuery, readBody } from './_lib/http.js';

export default async function handler(req, res) {
  const q = getQuery(req);
  // _r is injected by vercel.json rewrite: /api/admin/:path* → ?_r=:path*
  // Fallback to parsing req.url for local dev / direct invocation.
  let seg = (q._r || '').split('/')[0].split('?')[0].toLowerCase();
  if (!seg) {
    seg = (req.url || '').split('?')[0].replace(/\/+$/, '').split('/').pop() || '';
  }

  switch (seg) {
    case 'list':           return listHandler(req, res);
    case 'approve':        return approveHandler(req, res);
    case 'update':         return updateHandler(req, res);
    case 'create-advisor': return createAdvisorHandler(req, res);
    case 'deals':          return dealsHandler(req, res);
    case 'deal-update':    return dealUpdateHandler(req, res);

    case 'nda': {
      // op arrives as query param (URL rewrite) OR in the JSON body
      let op = (q.op || '').toLowerCase();
      if (!op) {
        const body = await readBody(req);
        op = (body.op || '').toLowerCase();
      }
      if (op === 'review')   return ndaReviewHandler(req, res);
      if (op === 'download') return ndaDownloadHandler(req, res);
      if (op === 'archive')  return ndaArchiveHandler(req, res);
      return json(res, 400, { ok: false, error: 'missing or unknown nda op' });
    }

    // Direct aliases for backwards-compat with any external callers
    case 'nda-review':   return ndaReviewHandler(req, res);
    case 'nda-download': return ndaDownloadHandler(req, res);
    case 'nda-archive':  return ndaArchiveHandler(req, res);

    default:
      return json(res, 404, { ok: false, error: 'unknown admin route: "' + seg + '"' });
  }
}
