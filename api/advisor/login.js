// POST /api/advisor/login
// Checks credentials against ADVISOR_USERS env var (format: "email:password,email:password")
// Falls back to demo credentials in test mode.
// Sets aurum_advisor cookie on success.

import { ok, bad, unauthorized, methodNotAllowed, readBody, json } from '../_lib/http.js';
import { signToken } from '../_lib/auth.js';
import { timingSafeEqual } from 'node:crypto';

const DEMO_ADVISORS = [
  { email: 'mpark@apexcredit.com', password: 'advisor1234', id: 'mpark', firm: 'Apex Credit Management', name: 'M. Park' },
  { email: 'jkim@sgcapital.com',   password: 'advisor1234', id: 'jkim',  firm: 'SG Capital Group',       name: 'J. Kim'  },
];

function loadAdvisors() {
  const raw = (process.env.ADVISOR_USERS || '').trim();
  if (!raw) return DEMO_ADVISORS;
  return raw.split(',').map(s => {
    const [email, ...rest] = s.trim().split(':');
    const password = rest.join(':');
    const id = email.split('@')[0].toLowerCase();
    return { email: email.toLowerCase(), password, id, firm: '', name: '' };
  }).filter(a => a.email && a.password);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return bad(res, 'missing credentials');

  const advisors = loadAdvisors();
  let matched = null;
  for (const a of advisors) {
    const eMatch = Buffer.from(a.email).length === Buffer.from(email).length &&
                   timingSafeEqual(Buffer.from(a.email), Buffer.from(email));
    const pMatch = Buffer.from(a.password).length === Buffer.from(password).length &&
                   timingSafeEqual(Buffer.from(a.password), Buffer.from(password));
    if (eMatch && pMatch && !matched) matched = a;
  }
  if (!matched) {
    await new Promise(r => setTimeout(r, 400));
    return unauthorized(res, 'invalid credentials');
  }

  const token = signToken({ sub: 'advisor', advisorId: matched.id, email: matched.email, firm: matched.firm, name: matched.name }, 60 * 60 * 12);
  res.setHeader('Set-Cookie', `aurum_advisor=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*12}`);
  return ok(res, { ok: true, id: matched.id, firm: matched.firm, name: matched.name });
}
