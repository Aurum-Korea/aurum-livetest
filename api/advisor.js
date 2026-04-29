// api/advisor.js — consolidated advisor router
import loginHandler  from './_lib/advisor-handler-login.js';
import logoutHandler from './_lib/advisor-handler-logout.js';
import dealsHandler  from './_lib/advisor-handler-deals.js';
import meHandler     from './_lib/advisor-handler-me.js';
import setupHandler  from './_lib/advisor-handler-setup.js';
import { json, getQuery } from './_lib/http.js';

export default async function handler(req, res) {
  const q = getQuery(req);
  let seg = (q._r || '').split('/')[0].split('?')[0].toLowerCase();
  if (!seg) {
    seg = (req.url || '').split('?')[0].replace(/\/+$/, '').split('/').pop() || '';
  }
  switch (seg) {
    case 'login':  return loginHandler(req, res);
    case 'logout': return logoutHandler(req, res);
    case 'deals':  return dealsHandler(req, res);
    case 'me':     return meHandler(req, res);
    case 'setup':  return setupHandler(req, res);
    default:
      return json(res, 404, { ok: false, error: 'unknown advisor route: "' + seg + '"' });
  }
}
