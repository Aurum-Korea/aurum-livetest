// deal-storage.js — KV helpers for deal entities.
// Follows the exact same pattern as storage.js (lead helpers).
//
// Key namespace:
//   deal:{id}      → full deal object (JSON)
//   deals:index    → sorted set, score = created_at unix ms, member = id
//
// Deal object shape:
//   id              string    'deal_' + 11-char b64url random
//   name            string    human-readable deal name
//   type            string    'pe' | 'credit' | 're' | 'infra' | 'equity'
//   stage           string    'review' | 'live' | 'ioi' | 'dd' | 'terms' | 'close' | 'realized' | 'killed'
//   advisor_id      string|null  links to advisor:{id} (Phase 2)
//   advisor_firm    string
//   target_alloc_usd  number  TACC target allocation in USD
//   target_irr      number|null  gross IRR target %
//   term_months     number|null
//   funding_source  string    'ltv' | 'reserve'
//   ioi_count       number    total IOIs received
//   ioi_agg_usd     number    aggregate IOI demand in USD
//   gate_status     string    'open' | 'blocked' | 'stalled'
//   gate_notes      string    plain-English gate description
//   next_action     string    what needs to happen to advance
//   health          string    'green' | 'amber' | 'red'  (partner assessment)
//   deployed_usd    number    sum of member positions referencing this deal_id
//   notes           string    free-text deal notes
//   qa              array     [{id, from, role:'partner'|'advisor', text, ts}]
//   created_at      string    ISO 8601
//   stage_entered_at string   ISO when current stage was entered
//   funded_at       string|null  ISO when first deployment occurred
//   closed_at       string|null  ISO
//   created_by      string    partner id (e.g. 'jwc')
//   updated_at      string    ISO

import { setJSON, getJSON, zAdd, zRevRange, zRem, zCard } from './storage.js';
import { randomBytes } from 'node:crypto';

// ── Key helpers ──────────────────────────────────────────────────────────────
const DEAL_KEY   = (id) => `deal:${id}`;
const DEALS_IDX  = 'deals:index'; // sorted set: score = created_at ms, member = id

// ── ID generation (same alphabet as generateLeadId) ──────────────────────────
function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export function generateDealId() {
  return 'deal_' + b64url(randomBytes(8)).slice(0, 11);
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export async function saveDeal(deal) {
  if (!deal?.id) throw new Error('deal.id required');
  deal.updated_at = new Date().toISOString();
  await setJSON(DEAL_KEY(deal.id), deal);
  // Index by created_at so newest deals surface first in list
  const score = deal.created_at ? new Date(deal.created_at).getTime() : Date.now();
  await zAdd(DEALS_IDX, score, deal.id);
  return deal;
}

export async function getDeal(id) {
  return getJSON(DEAL_KEY(id));
}

export async function listDealIds(limit = 200) {
  return zRevRange(DEALS_IDX, 0, limit - 1);
}

export async function listDeals(limit = 200) {
  const ids = await listDealIds(limit);
  if (!ids?.length) return [];
  const out = [];
  for (const id of ids) {
    const d = await getDeal(id);
    if (d) out.push(d);
  }
  return out;
}

export async function dealsCount() {
  return zCard(DEALS_IDX);
}

// ── Stage transition helper ───────────────────────────────────────────────────
// Call this instead of manually setting stage so stage_entered_at stays accurate.
export function transitionStage(deal, newStage, actor) {
  deal.stage           = newStage;
  deal.stage_entered_at = new Date().toISOString();
  if (newStage === 'live' && !deal.funded_at) {
    // 'funded_at' is set when first deployment happens, not when stage goes live.
    // 'live' just means IOI window open.
  }
  if (['realized', 'killed'].includes(newStage)) {
    deal.closed_at = new Date().toISOString();
  }
  // Log stage change in qa thread for audit
  deal.qa = deal.qa || [];
  deal.qa.push({
    id:   'evt_' + Date.now().toString(36),
    from: actor || 'system',
    role: 'partner',
    text: `Stage advanced to ${newStage.toUpperCase()}.`,
    ts:   new Date().toISOString(),
  });
  return deal;
}

// ── Days in current stage ─────────────────────────────────────────────────────
export function daysInStage(deal) {
  const entered = deal.stage_entered_at || deal.created_at;
  if (!entered) return 0;
  return Math.floor((Date.now() - new Date(entered).getTime()) / 86_400_000);
}
