// POST /api/advisor/seed
//
// Seeds 3 test advisor accounts with fixed IDs.
// Uses fixed IDs — safe to call multiple times (overwrites).
// Delete this file before opening to real advisors.
//
// Auth: aurum_admin cookie

import { ok, unauthorized, methodNotAllowed, serverError, getCookie } from '../_lib/http.js';
import { verifyToken } from '../_lib/auth.js';
import { saveAdvisor, hashPassword, safeAdvisor } from '../_lib/advisor-storage.js';

const SEED_ADVISORS = [
  {
    id:            'adv_apex001',
    name:          'Jin-ho Park',
    firm:          'Apex Credit Management',
    email:         'jpark@apexcredit.sg',
    password_hash: null, // set below
    _password:     'ApexAdv2026!',
    intro_fee_pct: 1.0,
    carry_pct:     0,
    notes:         'Primary credit sourcing partner. Pacific Credit III + IV. 14yr track record.',
    status:        'active',
    created_at:    '2025-01-10T09:00:00Z',
    created_by:    'jwc',
  },
  {
    id:            'adv_sgcap002',
    name:          'Wei-Lin Tan',
    firm:          'SG Capital Group',
    email:         'wtan@sgcapital.sg',
    password_hash: null,
    _password:     'SGCap2026!',
    intro_fee_pct: 1.5,
    carry_pct:     0,
    notes:         'PE secondaries specialist. Project Atlas sourced.',
    status:        'active',
    created_at:    '2025-03-14T09:00:00Z',
    created_by:    'tkj',
  },
  {
    id:            'adv_meridian003',
    name:          'Daniel Cho',
    firm:          'Meridian Capital',
    email:         'dcho@meridiancap.co',
    password_hash: null,
    _password:     'Meridian2026!',
    intro_fee_pct: 1.0,
    carry_pct:     0,
    notes:         'Asia infra + PE. Project Citadel in review.',
    status:        'active',
    created_at:    '2026-03-01T09:00:00Z',
    created_by:    'wsl',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  try {
    const now = new Date().toISOString();
    const seeded = [];
    for (const a of SEED_ADVISORS) {
      const advisor = {
        ...a,
        password_hash: hashPassword(a._password),
        last_login_at: null,
        updated_at:    now,
      };
      delete advisor._password;
      await saveAdvisor(advisor);
      seeded.push({ id: advisor.id, email: advisor.email, password: a._password });
    }
    return ok(res, {
      ok: true,
      seeded: seeded.length,
      credentials: seeded, // returned once for partner to communicate to advisors
      message: 'Seed complete. Credentials shown once — store securely. Delete this endpoint before production.',
    });
  } catch (e) {
    console.error('[advisor/seed]', e);
    return serverError(res, 'seed failed: ' + e.message);
  }
}
