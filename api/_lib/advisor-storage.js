// advisor-storage.js — KV helpers for advisor entities.
// Follows the same pattern as deal-storage.js and storage.js.
//
// Key namespace:
//   advisor:{id}          → full advisor object (JSON)
//   advisors:index        → sorted set, score = created_at ms, member = id
//   advisor_email:{email} → advisorId  (for login lookup by email)
//
// Advisor object shape:
//   id              string    'adv_' + 11-char b64url
//   name            string    contact name
//   firm            string    firm / company name
//   email           string    login email (lower-cased)
//   password_hash   string    HMAC-SHA256 of password (using AURUM_SECRET)
//   intro_fee_pct   number    introduction fee % of TACC allocation on deal close
//   carry_pct       number    carry % (fund-level, typically 0 for sourcing advisors)
//   notes           string    internal partner notes
//   status          string    'active' | 'suspended'
//   created_at      string    ISO
//   created_by      string    partner id
//   last_login_at   string|null  ISO
//   updated_at      string    ISO

import { setJSON, getJSON, zAdd, zRevRange, zCard } from './storage.js';
import { randomBytes, createHmac } from 'node:crypto';

// ── Secret (same key as auth.js JWT signing) ──────────────────────────────────
const SECRET = () =>
  process.env.AURUM_SECRET ||
  process.env.ADMIN_PASSWORD ||
  'aurum-dev-secret-CHANGE-ME-in-production';

// ── Password hashing — HMAC-SHA256 with AURUM_SECRET ─────────────────────────
// Not as strong as bcrypt/argon2 but zero-dependency and consistent with
// the existing codebase. Upgrade to argon2 before high-value production use.
export function hashPassword(password) {
  return createHmac('sha256', SECRET()).update(String(password)).digest('hex');
}
export function verifyPassword(input, storedHash) {
  const inputHash = Buffer.from(hashPassword(input));
  const storedBuf = Buffer.from(storedHash);
  if (inputHash.length !== storedBuf.length) return false;
  // Timing-safe comparison
  let mismatch = 0;
  for (let i = 0; i < inputHash.length; i++) mismatch |= inputHash[i] ^ storedBuf[i];
  return mismatch === 0;
}

// ── Key helpers ───────────────────────────────────────────────────────────────
const ADV_KEY       = (id)    => `advisor:${id}`;
const ADV_IDX       = 'advisors:index';
const ADV_EMAIL_KEY = (email) => `advisor_email:${email.toLowerCase().trim()}`;

// ── ID generation ─────────────────────────────────────────────────────────────
function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export function generateAdvisorId() {
  return 'adv_' + b64url(randomBytes(8)).slice(0, 11);
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function saveAdvisor(advisor) {
  if (!advisor?.id) throw new Error('advisor.id required');
  advisor.updated_at = new Date().toISOString();
  await setJSON(ADV_KEY(advisor.id), advisor);
  const score = advisor.created_at ? new Date(advisor.created_at).getTime() : Date.now();
  await zAdd(ADV_IDX, score, advisor.id);
  // Keep email index in sync
  if (advisor.email) {
    await setJSON(ADV_EMAIL_KEY(advisor.email), advisor.id);
  }
  return advisor;
}

export async function getAdvisor(id) {
  return getJSON(ADV_KEY(id));
}

export async function findAdvisorByEmail(email) {
  if (!email) return null;
  const id = await getJSON(ADV_EMAIL_KEY(email.toLowerCase().trim()));
  if (!id) return null;
  return getAdvisor(id);
}

export async function listAdvisorIds(limit = 200) {
  return zRevRange(ADV_IDX, 0, limit - 1);
}

export async function listAdvisors(limit = 200) {
  const ids = await listAdvisorIds(limit);
  if (!ids?.length) return [];
  const out = [];
  for (const id of ids) {
    const a = await getAdvisor(id);
    if (a) out.push(a);
  }
  return out;
}

export async function advisorsCount() {
  return zCard(ADV_IDX);
}

// ── Safe public shape (strip password_hash before sending to client) ──────────
export function safeAdvisor(advisor) {
  if (!advisor) return null;
  const { password_hash, ...rest } = advisor; // eslint-disable-line no-unused-vars
  return rest;
}
