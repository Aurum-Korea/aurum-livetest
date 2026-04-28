// POST /api/admin/update — update a lead.
// Body: { id, status?, note?, action? }
//   status: 'new' | 'reviewing' | 'approved' | 'declined' | 'sent'
//   note:   string — appended to lead.notes with timestamp + actor
//   action: one of:
//     'revoke_code'    — invalidates the existing NDA access code (does NOT email)
//     'verify_ioi'     — partner has verified the IOI; sends wire-instructions email
//     'mark_wired'     — partner observed inbound funds in flight
//     'mark_cleared'   — funds settled; sends admission email

import { ok, bad, unauthorized, notFound, methodNotAllowed, readBody, getCookie } from '../_lib/http.js';
import { verifyToken, signToken } from '../_lib/auth.js';
import { getLead, saveLead, unbindCode } from '../_lib/storage.js';
import { sendRaw, buildWireInstructionsEmail, buildAdmissionEmail, buildQuarterlyStatementEmail, buildWireReminderEmail, buildCapitalCallEmail, partnerBcc} from '../_lib/email.js';
import { getKrwPerKg } from '../_lib/krw.js';
import { putPrivate, isConfigured as blobConfigured } from '../_lib/blob.js';

const VALID_STATUSES = new Set(['new', 'reviewing', 'approved', 'declined', 'sent']);
const VALID_ACTIONS = new Set([
  'revoke_code',
  'verify_ioi',
  'mark_wired',
  'mark_cleared',
  // Member portfolio management (post-admission)
  'add_bar',
  'remove_bar',
  'set_ltv',
  'add_doc',
  'upload_doc',
  'remove_doc',
  // Phase 3 — Positions (reserved for Q4 2026 deployment)
  'add_position',
  'update_position',
  'remove_position',
  // Capital calls (Phase 3 follow-on)
  'add_capital_call',
  'update_capital_call',
  'remove_capital_call',
  // Notification triggers
  'send_quarterly_email',
  'send_wire_reminder',
  // Resend any prior email (NDA invite / IOI reminder / wire instructions / admission)
  'resend_email',
]);

// Wire reference: AURUM-W-{LEAD_ID_SUFFIX}-{YYYYMMDD}
function wireRef(leadId) {
  const d = new Date();
  const yyyymmdd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  // last 6 chars of lead id, uppercased — stable, short, distinct
  const suffix = String(leadId || '').replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
  return `AURUM-W-${suffix}-${yyyymmdd}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const session = verifyToken(getCookie(req, 'aurum_admin'));
  if (!session || session.sub !== 'admin') return unauthorized(res);

  let body;
  try { body = await readBody(req); } catch { return bad(res, 'invalid body'); }
  if (!body.id) return bad(res, 'missing id');

  const lead = await getLead(body.id);
  if (!lead) return notFound(res, 'lead not found');

  const actor = session.id || session.email || 'admin';
  const now = Date.now();
  lead.audit = lead.audit || [];

  // Status / note updates (existing behavior)
  if (body.status) {
    if (!VALID_STATUSES.has(body.status)) return bad(res, 'invalid status');
    const prev = lead.status;
    lead.status = body.status;
    lead.audit.push({ at: now, actor, action: 'status', from: prev, to: body.status });
  }

  if (typeof body.note === 'string' && body.note.trim()) {
    lead.notes = lead.notes || [];
    lead.notes.push({ at: now, actor, text: body.note.trim().slice(0, 4000) });
    lead.audit.push({ at: now, actor, action: 'note' });
  }

  // Action handling
  if (body.action) {
    if (!VALID_ACTIONS.has(body.action)) return bad(res, 'invalid action');

    if (body.action === 'revoke_code') {
      if (lead.code) {
        try { await unbindCode(lead.code); } catch {}
        lead.audit.push({ at: now, actor, action: 'revoke_code', code: lead.code });
        lead.code_revoked = true;
      }
    }

    // verify_ioi — partner has confirmed the IOI submission. Generates wire
    // ref + snapshots spot at verify time + sends wire instructions email.
    // B8: Accepts optional approved_ltv_pct — partner's decision (50–requested).
    if (body.action === 'verify_ioi') {
      if (!lead.ioi || !lead.ioi.submitted_at) return bad(res, 'no IOI submitted');
      if (lead.ioi_verified_at) return bad(res, 'IOI already verified');

      // B8: LTV partner override
      const requested = lead.ioi.ltv_pct;
      let approved = body.approved_ltv_pct != null ? Number(body.approved_ltv_pct) : requested;
      if (!isFinite(approved) || approved < 50) approved = 50;
      if (approved > requested) approved = requested;
      const ltvNotes = String(body.ltv_notes || '').slice(0, 1000);

      const spot = await getKrwPerKg();
      lead.ioi.krw_per_kg_at_verify = spot.krw_per_kg;
      lead.ioi.krw_at_verify = Math.round(lead.ioi.kg * spot.krw_per_kg);
      lead.ioi_verified_at = now;
      lead.ioi_verified_by = actor;
      // Persist approved LTV separately from member-requested
      lead.ltv = lead.ltv || {};
      lead.ltv.approved_pct = approved;
      lead.ltv.ceiling_pct = approved;
      lead.ltv.margin_pct = lead.ltv.margin_pct || 80;
      lead.ltv.drawn_krw = lead.ltv.drawn_krw || 0;
      if (ltvNotes) lead.ltv.partner_notes = ltvNotes;
      lead.audit.push({
        at: now, actor, action: 'ioi_verified',
        krw_per_kg_at_verify: spot.krw_per_kg,
        ltv_requested: requested,
        ltv_approved: approved,
        ltv_notes: ltvNotes || undefined,
      });

      // Initialize the wire panel
      lead.wire = lead.wire || {};
      if (!lead.wire.ref) lead.wire.ref = wireRef(lead.id);
      lead.wire.instructions_sent_at = now;

      await saveLead(lead);

      // Send wire instructions email
      let mailResult = { sent: false, reason: 'skipped' };
      if (lead.email) {
        const tpl = buildWireInstructionsEmail({ lead, ioi: lead.ioi, wire: lead.wire });
        try {
          mailResult = await sendRaw({
            to: lead.email,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
          if (mailResult.sent) {
            lead.audit.push({ at: Date.now(), actor, action: 'wire_instructions_sent', to: lead.email });
          } else {
            lead.audit.push({ at: Date.now(), actor, action: 'wire_instructions_failed', reason: mailResult.reason });
          }
          await saveLead(lead);
        } catch (e) {
          console.error('wire instructions send error', e);
          mailResult = { sent: false, reason: 'exception' };
        }
      }
      return ok(res, { ok: true, lead, mail: mailResult });
    }

    if (body.action === 'mark_wired') {
      lead.wire = lead.wire || {};
      lead.wire.wired_at = now;
      lead.audit.push({ at: now, actor, action: 'wire_marked_wired' });
    }

    if (body.action === 'mark_cleared') {
      lead.wire = lead.wire || {};
      lead.wire.cleared_at = now;
      lead.status = 'admitted';

      // B12: Snapshot live spot AT SETTLEMENT — locks gold cost basis used for
      // growth indicators on portfolio + admin position summary thereafter.
      try {
        const settleSpot = await getKrwPerKg();
        lead.ioi = lead.ioi || {};
        lead.ioi.krw_per_kg_at_settle = settleSpot.krw_per_kg;
        lead.ioi.krw_at_settle = lead.ioi.kg ? Math.round(lead.ioi.kg * settleSpot.krw_per_kg) : null;
      } catch (e) {
        console.warn('settle spot snapshot failed', e);
      }

      // B7: At launch, drawn = full ceiling (we pull LTV immediately when wire clears
      // and gold settles).  Partner can override afterwards via the LTV facility form.
      lead.ltv = lead.ltv || {};
      const ceilingPct = lead.ltv.ceiling_pct || lead.ltv.approved_pct || (lead.ioi && lead.ioi.ltv_pct) || 60;
      const settleSpotKrwPerKg = (lead.ioi && lead.ioi.krw_per_kg_at_settle) || 225_000_000;
      const goldValueAtSettle = (lead.ioi && lead.ioi.kg ? lead.ioi.kg : 0) * settleSpotKrwPerKg;
      const ceilingKrwAtSettle = goldValueAtSettle * (ceilingPct / 100);
      // Only auto-set drawn if not already manually set
      if (!lead.ltv.drawn_krw) {
        lead.ltv.drawn_krw = Math.round(ceilingKrwAtSettle);
        lead.ltv.drawn_set_at = now;
        lead.ltv.drawn_auto = true;
        lead.audit.push({
          at: now, actor: 'system', action: 'ltv_auto_drawn',
          drawn_krw: lead.ltv.drawn_krw,
          ceiling_pct: ceilingPct,
        });
      }

      lead.audit.push({ at: now, actor, action: 'wire_marked_cleared' });

      await saveLead(lead);

      // Send admission email
      let mailResult = { sent: false, reason: 'skipped' };
      if (lead.email) {
        // Mint a 7-day pw-setup token. Email F links to /setup-password?ml=<token>.
        // Member sets password → cookie set → /portfolio. Code is revoked at setup.
        const mlToken = signToken({
          sub: 'pw-setup',
          leadId: lead.id,
          email: lead.email,
          n: Math.random().toString(36).slice(2),
        }, 60 * 60 * 24 * 7);
        const tpl = buildAdmissionEmail({ lead, magicLinkToken: mlToken });
        try {
          mailResult = await sendRaw({
            to: lead.email,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
          if (mailResult.sent) {
            lead.audit.push({ at: Date.now(), actor, action: 'admission_email_sent' });
          } else {
            lead.audit.push({ at: Date.now(), actor, action: 'admission_email_failed', reason: mailResult.reason });
          }
          await saveLead(lead);
        } catch (e) {
          console.error('admission send error', e);
        }
      }
      return ok(res, { ok: true, lead, mail: mailResult });
    }

    // ── Bars ────────────────────────────────────────────────────────────
    if (body.action === 'add_bar') {
      const serial = String(body.serial || '').trim().toUpperCase().slice(0, 40);
      const kg = Number(body.kg) || 0;
      const status = body.bar_status === 'pledged' ? 'pledged' : 'allocated';
      const custodian = String(body.custodian || 'Singapore Freeport').slice(0, 200);
      if (!serial) return bad(res, 'missing serial');
      if (kg <= 0 || kg > 100) return bad(res, 'invalid kg');
      lead.bars = lead.bars || [];
      // De-dupe by serial
      if (lead.bars.find((b) => b.serial === serial)) {
        return bad(res, `bar ${serial} already exists for this member`);
      }
      lead.bars.push({ serial, kg, status, custodian, allocated_at: now });
      lead.audit.push({ at: now, actor, action: 'bar_added', serial, kg });
    }

    if (body.action === 'remove_bar') {
      const serial = String(body.serial || '').trim().toUpperCase();
      if (!serial) return bad(res, 'missing serial');
      lead.bars = (lead.bars || []).filter((b) => b.serial !== serial);
      lead.audit.push({ at: now, actor, action: 'bar_removed', serial });
    }

    // ── LTV ─────────────────────────────────────────────────────────────
    if (body.action === 'set_ltv') {
      const drawn_krw = body.drawn_krw != null ? Math.max(0, Math.round(Number(body.drawn_krw) || 0)) : null;
      const ceiling_pct = body.ceiling_pct != null ? Math.max(0, Math.min(100, Math.round(Number(body.ceiling_pct) || 0))) : null;
      const margin_pct = body.margin_pct != null ? Math.max(0, Math.min(100, Math.round(Number(body.margin_pct) || 0))) : null;
      const facility_id = body.facility_id != null ? String(body.facility_id).slice(0, 100) : null;
      lead.ltv = lead.ltv || {};
      if (drawn_krw != null) lead.ltv.drawn_krw = drawn_krw;
      if (ceiling_pct != null) lead.ltv.ceiling_pct = ceiling_pct;
      if (margin_pct != null) lead.ltv.margin_pct = margin_pct;
      if (facility_id != null) lead.ltv.facility_id = facility_id;
      lead.ltv.updated_at = now;
      lead.audit.push({ at: now, actor, action: 'ltv_updated', drawn_krw, ceiling_pct });
    }

    // ── Documents ───────────────────────────────────────────────────────
    // For v1, partners provide a URL (e.g., from Vercel Blob admin or cloud
    // storage) + label. File upload via dashboard is Phase 2.
    if (body.action === 'add_doc') {
      const kind = String(body.kind || 'other').slice(0, 40);
      const label = String(body.label || '').slice(0, 200).trim();
      const url = String(body.url || '').slice(0, 1000).trim();
      const version = String(body.version || '').slice(0, 40);
      if (!label) return bad(res, 'missing label');
      if (!url) return bad(res, 'missing url');
      if (!/^https?:\/\//.test(url)) return bad(res, 'url must be http(s)');
      lead.docs = lead.docs || [];
      const doc_id = 'doc_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
      lead.docs.push({ id: doc_id, kind, label, version, source: 'url', url, issued_at: now });
      lead.audit.push({ at: now, actor, action: 'doc_added', kind, label, source: 'url' });
    }

    if (body.action === 'remove_doc') {
      const id = String(body.doc_id || '').trim();
      if (!id) return bad(res, 'missing doc_id');
      lead.docs = (lead.docs || []).filter((d) => d.id !== id);
      lead.audit.push({ at: now, actor, action: 'doc_removed', doc_id: id });
    }

    // ── Doc upload (private blob) ───────────────────────────────────────
    // Body shape: { action:'upload_doc', kind, label, version, filename,
    //               contentType, dataBase64 }
    // Uploads to private blob storage; saves doc record with source='blob'.
    // Members access via /api/doc?id=member-doc&doc_id=<id> (cookie-gated).
    if (body.action === 'upload_doc') {
      if (!blobConfigured()) return bad(res, 'storage not configured');
      const kind = String(body.kind || 'other').slice(0, 40);
      const label = String(body.label || '').slice(0, 200).trim();
      const version = String(body.version || '').slice(0, 40);
      const filename = String(body.filename || 'document.pdf').slice(0, 200).replace(/[\\\/\x00-\x1f"'`]/g, '_');
      const contentType = String(body.contentType || 'application/pdf').toLowerCase();
      if (!label) return bad(res, 'missing label');
      const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
      if (!ALLOWED.has(contentType)) return bad(res, 'file must be PDF, JPG, or PNG');
      const b64 = String(body.dataBase64 || '');
      if (!b64) return bad(res, 'missing dataBase64');
      let buf;
      try { buf = Buffer.from(b64, 'base64'); }
      catch { return bad(res, 'invalid base64'); }
      if (!buf.length) return bad(res, 'empty file');
      const MAX_BYTES = 4 * 1024 * 1024;
      if (buf.length > MAX_BYTES) return bad(res, 'file too large (max 4 MB)');
      // Header sanity check
      const head = buf.slice(0, 4);
      const looksPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
      const looksJpg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
      const looksPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
      if (contentType === 'application/pdf' && !looksPdf) return bad(res, 'file does not look like PDF');
      if ((contentType === 'image/jpeg' || contentType === 'image/jpg') && !looksJpg) return bad(res, 'file does not look like JPG');
      if (contentType === 'image/png' && !looksPng) return bad(res, 'file does not look like PNG');
      // Upload
      const stamp = new Date().toISOString().replace(/[:T.]/g, '-').slice(0, 19);
      const ext = contentType === 'application/pdf' ? 'pdf' : (contentType === 'image/png' ? 'png' : 'jpg');
      const path = `member-docs/${lead.id}/${kind}-${stamp}.${ext}`;
      let putResult;
      try { putResult = await putPrivate(path, buf, { contentType }); }
      catch (e) { console.error('[upload_doc] blob put failed:', e); return bad(res, 'storage error'); }
      lead.docs = lead.docs || [];
      const doc_id = 'doc_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
      lead.docs.push({
        id: doc_id, kind, label, version,
        source: 'blob',
        blob_pathname: putResult.pathname,
        blob_url: putResult.url,
        filename,
        size: buf.length,
        issued_at: now,
      });
      lead.audit.push({ at: now, actor, action: 'doc_added', kind, label, source: 'blob', filename });
    }

    // ── Capital calls (Phase 3 follow-on) ──────────────────────────────
    if (body.action === 'add_capital_call') {
      const position_code = String(body.position_code || '').trim().toUpperCase().slice(0, 16);
      const amount_krw = Math.max(0, Math.round(Number(body.amount_krw) || 0));
      const response_by = body.response_by ? Number(body.response_by) : null;
      const pdf_url = String(body.pdf_url || '').slice(0, 1000).trim();
      if (amount_krw <= 0) return bad(res, 'amount_krw must be > 0');
      if (pdf_url && !/^https?:\/\//.test(pdf_url)) return bad(res, 'pdf_url must be http(s) if provided');
      lead.capital_calls = lead.capital_calls || [];
      const cc_id = 'cc_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
      const number = lead.capital_calls.length + 1;
      lead.capital_calls.push({
        id: cc_id, number, position_code, amount_krw, response_by,
        pdf_url: pdf_url || null,
        status: 'pending',
        acknowledged_at: null, paid_at: null,
        created_at: now,
      });
      lead.audit.push({ at: now, actor, action: 'capital_call_added', number, position_code, amount_krw });

      // Notify member by email
      if (lead.email) {
        try {
          const tpl = buildCapitalCallEmail({
            lead,
            cc: { number, position_code, amount_krw, response_by, pdf_url: pdf_url || null },
          });
          await sendRaw({
            to: lead.email,
            subject: tpl.subject, html: tpl.html, text: tpl.text,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
          lead.audit.push({ at: now, actor, action: 'capital_call_email_sent', number });
        } catch (e) { console.error('[capital_call email]', e); }
      }
    }

    if (body.action === 'update_capital_call') {
      const cc_id = String(body.cc_id || '').trim();
      const status = ['pending', 'acknowledged', 'paid'].includes(body.status) ? body.status : null;
      if (!cc_id) return bad(res, 'missing cc_id');
      lead.capital_calls = lead.capital_calls || [];
      const cc = lead.capital_calls.find((c) => c.id === cc_id);
      if (!cc) return bad(res, 'capital call not found');
      if (status) {
        cc.status = status;
        if (status === 'acknowledged' && !cc.acknowledged_at) cc.acknowledged_at = now;
        if (status === 'paid' && !cc.paid_at) cc.paid_at = now;
      }
      lead.audit.push({ at: now, actor, action: 'capital_call_updated', cc_id, status });
    }

    if (body.action === 'remove_capital_call') {
      const cc_id = String(body.cc_id || '').trim();
      if (!cc_id) return bad(res, 'missing cc_id');
      lead.capital_calls = (lead.capital_calls || []).filter((c) => c.id !== cc_id);
      lead.audit.push({ at: now, actor, action: 'capital_call_removed', cc_id });
    }

    // ── Notification triggers ──────────────────────────────────────────
    if (body.action === 'send_quarterly_email') {
      const period = String(body.period || '').trim().slice(0, 20);
      const statement_url = String(body.statement_url || '').slice(0, 500).trim();
      if (!period) return bad(res, 'missing period');
      if (!lead.email) return bad(res, 'no email on file');
      try {
        const tpl = buildQuarterlyStatementEmail({ lead, period, statement_url });
        const r = await sendRaw({
          to: lead.email, subject: tpl.subject, html: tpl.html, text: tpl.text,
          replyTo: process.env.REPLY_TO || undefined,
          bcc: partnerBcc(),
        });
        lead.audit.push({ at: now, actor, action: 'quarterly_email_sent', period, sent: !!r.sent });
      } catch (e) { console.error('[quarterly email]', e); return bad(res, 'send failed'); }
    }

    if (body.action === 'send_wire_reminder') {
      if (!lead.email) return bad(res, 'no email on file');
      if (!lead.wire || !lead.wire.instructions_sent_at || lead.wire.cleared_at) {
        return bad(res, 'no pending wire to remind on');
      }
      try {
        const tpl = buildWireReminderEmail({ lead, ioi: lead.ioi || {}, wire: lead.wire });
        const r = await sendRaw({
          to: lead.email, subject: tpl.subject, html: tpl.html, text: tpl.text,
          replyTo: process.env.REPLY_TO || undefined,
          bcc: partnerBcc(),
        });
        lead.audit.push({ at: now, actor, action: 'wire_reminder_sent', sent: !!r.sent });
      } catch (e) { console.error('[wire reminder]', e); return bad(res, 'send failed'); }
    }

    // ── Positions (Phase 3) ────────────────────────────────────────────
    // Each position has a coded label (E3 · AI · Series D format) — never
    // a real GP/company name in member-facing surfaces (GP confidentiality).
    if (body.action === 'add_position') {
      const code = String(body.code || '').trim().toUpperCase().slice(0, 16);
      const sector = String(body.sector || '').trim().slice(0, 40);
      const stage = String(body.stage || '').trim().slice(0, 40);
      const type = ['equity', 'venture', 'private_credit', 'real_estate', 'other'].includes(body.type) ? body.type : 'other';
      const committed_krw = Math.max(0, Math.round(Number(body.committed_krw) || 0));
      const drawn_krw = Math.max(0, Math.round(Number(body.drawn_krw) || 0));
      const marked_krw = Math.max(0, Math.round(Number(body.marked_krw) || 0));
      if (!code) return bad(res, 'missing position code');
      if (committed_krw <= 0) return bad(res, 'committed_krw must be > 0');
      lead.positions = lead.positions || [];
      const pos_id = 'pos_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
      lead.positions.push({
        id: pos_id, code, sector, stage, type,
        committed_krw, drawn_krw, marked_krw,
        status: 'active', deployed_at: now, realized_at: null,
      });
      lead.audit.push({ at: now, actor, action: 'position_added', code, committed_krw });
    }

    if (body.action === 'update_position') {
      const pos_id = String(body.pos_id || '').trim();
      if (!pos_id) return bad(res, 'missing pos_id');
      lead.positions = lead.positions || [];
      const pos = lead.positions.find((p) => p.id === pos_id);
      if (!pos) return bad(res, 'position not found');
      if (body.drawn_krw != null) pos.drawn_krw = Math.max(0, Math.round(Number(body.drawn_krw) || 0));
      if (body.marked_krw != null) pos.marked_krw = Math.max(0, Math.round(Number(body.marked_krw) || 0));
      if (body.status && ['active', 'realized', 'written_off'].includes(body.status)) {
        pos.status = body.status;
        if (body.status === 'realized' && !pos.realized_at) pos.realized_at = now;
      }
      pos.updated_at = now;
      lead.audit.push({ at: now, actor, action: 'position_updated', pos_id, code: pos.code });
    }

    if (body.action === 'remove_position') {
      const pos_id = String(body.pos_id || '').trim();
      if (!pos_id) return bad(res, 'missing pos_id');
      lead.positions = (lead.positions || []).filter((p) => p.id !== pos_id);
      lead.audit.push({ at: now, actor, action: 'position_removed', pos_id });
    }

    // ── resend_email — universal resend for any prior email ─────────────
    // body.kind: 'nda_invite' | 'ioi_reminder' | 'wire_instructions' | 'admission'
    if (body.action === 'resend_email') {
      if (!lead.email) return bad(res, 'no email on lead');
      const kind = String(body.kind || '').trim();
      let mailResult = { sent: false, reason: 'unknown_kind' };
      try {
        if (kind === 'wire_instructions') {
          if (!lead.wire || !lead.wire.instructions_sent_at) return bad(res, 'wire instructions never issued');
          const tpl = buildWireInstructionsEmail({ lead, ioi: lead.ioi, wire: lead.wire });
          mailResult = await sendRaw({
            to: lead.email, subject: tpl.subject, html: tpl.html, text: tpl.text,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
        } else if (kind === 'admission') {
          if (!lead.wire || !lead.wire.cleared_at) return bad(res, 'member not yet admitted');
          // Mint fresh pw-setup token so the link points to /setup-password
          const mlToken = signToken({
            sub: 'pw-setup', leadId: lead.id, email: lead.email,
            n: Math.random().toString(36).slice(2),
          }, 60 * 60 * 24 * 7);
          const tpl = buildAdmissionEmail({ lead, magicLinkToken: mlToken });
          mailResult = await sendRaw({
            to: lead.email, subject: tpl.subject, html: tpl.html, text: tpl.text,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
        } else if (kind === 'nda_invite') {
          // Re-use the invitation email build path — just re-send the same code
          if (!lead.code) return bad(res, 'no invitation code on lead');
          // We don't have a separate buildInvitationEmail here, so use a simple resend via the approve.js path.
          // Instead, send a custom-body reminder.
          const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
          const codeUrl = `${siteUrl}/code?c=${encodeURIComponent(lead.code)}`;
          mailResult = await sendRaw({
            to: lead.email,
            subject: 'Reminder · Your Aurum invitation · 초대장 안내',
            text: `Reminder: your AURUM invitation code is ${lead.code}.\n\nOpen: ${codeUrl}\n\nThe code unlocks the NDA which precedes the materials.\n\n— Aurum Partners`,
            html: `<p>Reminder: your AURUM invitation code is <strong style="font-family:monospace;letter-spacing:0.16em">${lead.code}</strong>.</p><p><a href="${codeUrl}">Open invitation</a></p><p style="color:#888">The code unlocks the NDA which precedes the materials.</p><p>— Aurum Partners</p>`,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
        } else if (kind === 'nda_reminder') {
          // Reminder to a member who has an invitation code but hasn't uploaded their NDA yet
          if (!lead.code) return bad(res, 'no invitation code on lead');
          if (lead.nda_state === 'approved') return bad(res, 'NDA already approved');
          const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
          const ndaUrl = `${siteUrl}/code?c=${encodeURIComponent(lead.code)}`;
          mailResult = await sendRaw({
            to: lead.email,
            subject: 'Reminder · Please upload your signed NDA · NDA 업로드 안내',
            text: `When you're ready, please upload your signed NDA at ${ndaUrl}\n\nThe materials open immediately upon NDA approval.\n\n— Aurum Partners`,
            html: `<p>When you're ready, please upload your signed NDA:</p><p><a href="${ndaUrl}" style="display:inline-block;padding:10px 18px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:monospace;letter-spacing:0.18em">UPLOAD NDA →</a></p><p style="color:#888">The materials open immediately upon NDA approval.</p><p>— Aurum Partners</p>`,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
        } else if (kind === 'ioi_reminder') {
          if (lead.nda_state !== 'approved') return bad(res, 'NDA not yet approved');
          const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
          const ioiUrl = lead.ioi_code ? `${siteUrl}/ioi?c=${encodeURIComponent(lead.ioi_code)}` : `${siteUrl}/ioi`;
          mailResult = await sendRaw({
            to: lead.email,
            subject: 'Reminder · Your IOI form awaits · 의향서 작성 안내',
            text: `When ready, indicate your interest at ${ioiUrl}\n\nThe form is non-binding — you may revise after submission.\n\n— Aurum Partners`,
            html: `<p>When ready, indicate your interest:</p><p><a href="${ioiUrl}" style="display:inline-block;padding:10px 18px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:monospace;letter-spacing:0.18em">SUBMIT IOI →</a></p><p style="color:#888">The form is non-binding — you may revise after submission.</p><p>— Aurum Partners</p>`,
            replyTo: process.env.REPLY_TO || undefined,
            bcc: partnerBcc(),
          });
        } else {
          return bad(res, 'unknown email kind');
        }
      } catch (e) {
        console.error('resend_email error', e);
        mailResult = { sent: false, reason: 'exception' };
      }
      lead.audit.push({
        at: now, actor, action: 'email_resent', kind,
        sent: !!(mailResult && mailResult.sent),
        reason: mailResult && mailResult.reason,
      });
      await saveLead(lead);
      return ok(res, { ok: true, lead, mail: mailResult });
    }
  }

  await saveLead(lead);
  return ok(res, { ok: true, lead });
}
