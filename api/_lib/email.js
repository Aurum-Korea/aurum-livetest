// Email — Resend REST API. Optional: if RESEND_API_KEY is unset, send() returns
// { sent: false, reason: 'no-resend' } so the dashboard can fall back to "copy the message."

const RESEND_URL = 'https://api.resend.com/emails';

function fromAddress() {
  return process.env.FROM_EMAIL || 'Aurum Partners <partners@theaurumcc.com>';
}
function brand() {
  return process.env.SITE_URL || 'https://www.theaurumcc.com';
}

// Partner-email kill switch.
// When PARTNER_EMAILS_OFF=1 (testing mode), all partner-facing notifications
// are suppressed: no NOTIFY_EMAILS sends, no BCC_PARTNERS attachments on
// customer emails. Customer-facing emails still send normally so end-to-end
// flow can be tested without burning email quota on partner copies.
// Audit logs at each call site still record the suppression so we know which
// leads didn't trigger a partner notification.
export function partnerEmailsOff() {
  const v = String(process.env.PARTNER_EMAILS_OFF || '').toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes';
}
// Returns the BCC string for partner copies on customer emails — '' when off.
export function partnerBcc() {
  if (partnerEmailsOff()) return undefined;
  const list = (process.env.BCC_PARTNERS || '').split(',').map((s) => s.trim()).filter(Boolean).join(',');
  return list || undefined;
}

export async function sendRaw({ to, subject, html, text, replyTo, bcc }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: 'no-resend' };
  // Resend requires `to` and `bcc` to be arrays of clean addresses.  Both call
  // sites and env-var helpers tend to produce comma-joined strings, so we
  // normalize here once: any string with commas is split, trimmed, and de-empty'd.
  const norm = (v) => {
    if (v == null || v === '') return undefined;
    if (Array.isArray(v)) {
      const arr = v.flatMap((x) => String(x).split(',')).map((s) => s.trim()).filter(Boolean);
      return arr.length ? arr : undefined;
    }
    const arr = String(v).split(',').map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  };
  const toArr = norm(to);
  const bccArr = norm(bcc);
  if (!toArr) return { sent: false, reason: 'no-recipient' };

  // Drop any BCC recipient that's also in TO — Resend 422s on duplicates.
  const toSet = new Set(toArr.map((s) => s.toLowerCase()));
  const cleanedBcc = bccArr ? bccArr.filter((s) => !toSet.has(s.toLowerCase())) : undefined;

  const body = {
    from: fromAddress(),
    to: toArr,
    subject, html, text,
  };
  if (replyTo) body.reply_to = replyTo;
  if (cleanedBcc && cleanedBcc.length) body.bcc = cleanedBcc;

  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    return { sent: false, reason: `resend-${r.status}`, detail: t };
  }
  const j = await r.json().catch(() => ({}));
  return { sent: true, id: j.id || null };
}

// ── Templates ─────────────────────────────────────────────────────────────

// Shared email shell — wraps body in nested tables with bgcolor at every
// level so Outlook/Gmail can't strip the dark theme.
function shellHtml({ inner, hidden_preheader }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body bgcolor="#0a0a0a" style="margin:0;padding:0;background:#0a0a0a;color:#e8e3d8;font-family:'Cormorant Garamond',Georgia,serif;-webkit-font-smoothing:antialiased">
${hidden_preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0a0a0a">${escape(hidden_preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0a0a" style="background:#0a0a0a;border-collapse:collapse">
  <tr><td align="center" bgcolor="#0a0a0a" style="background:#0a0a0a;padding:48px 16px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0a0a" style="background:#0a0a0a;max-width:600px;border-collapse:collapse">${inner}</table>
  </td></tr>
</table>
</body></html>`;
}

// Brand lockup row used at top of every email
const lockupRow = `<tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
    <td style="vertical-align:middle;padding-right:14px">
      <div style="border:1px solid #C5A572;width:38px;height:38px;text-align:center;line-height:38px;color:#C5A572;font-style:italic;font-family:Georgia,serif;font-size:18px;letter-spacing:-0.04em">Au</div>
    </td>
    <td style="vertical-align:middle">
      <div style="font-family:'Outfit',Arial,sans-serif;font-weight:600;font-size:14px;letter-spacing:0.34em;color:#ececec;line-height:1">AURUM</div>
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:400;font-size:8.5px;letter-spacing:0.36em;color:#8a7d6b;line-height:1;margin-top:6px">CENTURY · CLUB</div>
    </td>
  </tr></table>
</td></tr>`;

const signOffRow = `<tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 48px;border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#6b655e">
  <div>— THE PARTNERS  ·  파트너 일동</div>
  <div style="margin-top:6px">AURUM  ·  TACC PTE LTD  ·  SINGAPORE</div>
  <div style="margin-top:14px;color:#3a3733">CONFIDENTIAL  ·  QUALIFIED INVESTORS ONLY</div>
</td></tr>`;

// Magic link login email — passwordless single-use
export function buildMagicLinkEmail({ lead, linkUrl }) {
  const subject = `Sign in to your AURUM portfolio  ·  로그인 링크`;
  const text = [
    `Sign in to your AURUM portfolio.`,
    ``,
    `This link logs you in directly. It expires in 15 minutes`,
    `and works once.`,
    ``,
    linkUrl,
    ``,
    `If you didn't request this, ignore this email.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `AURUM 포트폴리오에 로그인하십시오.`,
    ``,
    `이 링크로 즉시 로그인됩니다. 15분 후 만료되며,`,
    `1회만 사용할 수 있습니다.`,
    ``,
    linkUrl,
    ``,
    `요청하지 않으셨다면 본 메일을 무시하셔도 됩니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">SIGN IN  ·  로그인</td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      One-time <span style="font-style:italic;color:#C5A572">link.</span>
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      This link logs you in directly. It expires in 15 minutes and works once.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px" align="left">
      <a href="${linkUrl}" style="display:inline-block;padding:14px 26px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase;font-weight:600">SIGN IN  →</a>
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      If you didn't request this, ignore this email.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table></td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      이 링크로 즉시 로그인됩니다. 15분 후 만료되며, 1회만 사용할 수 있습니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      요청하지 않으셨다면 본 메일을 무시하셔도 됩니다.
    </td></tr>
    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'One-time sign-in link to your AURUM portfolio.' });
  return { subject, text, html };
}

// 0a) Password reset — sent when a member hits "forgot password" on /login.
//     Includes a 6-digit code that the member types into /reset-password.
//     Code expires in 15 minutes; one-time use.
export function buildPasswordResetEmail({ lead, resetCode }) {
  const subject = `Reset your AURUM password  ·  비밀번호 재설정`;
  const text = [
    `Reset your AURUM password.`,
    ``,
    `Enter this 6-digit code on the reset page. It expires in 15 minutes.`,
    ``,
    `Reset code:  ${resetCode}`,
    ``,
    `If you didn't request this, ignore this email — your password is unchanged.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `AURUM 비밀번호를 재설정하십시오.`,
    ``,
    `재설정 페이지에 아래 6자리 코드를 입력하십시오. 15분 후 만료됩니다.`,
    ``,
    `재설정 코드:  ${resetCode}`,
    ``,
    `요청하지 않으셨다면 본 메일을 무시하셔도 됩니다 — 비밀번호는 변경되지 않습니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">PASSWORD RESET  ·  비밀번호 재설정</td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Reset <span style="font-style:italic;color:#C5A572">code.</span>
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      Enter this 6-digit code on the reset page. It expires in 15 minutes.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
        <td bgcolor="#0a0a0a" align="center" style="background:#0a0a0a;border:1px solid rgba(197,165,114,0.50);padding:22px 24px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#8a7d6b;margin-bottom:10px">RESET CODE  ·  재설정 코드</div>
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:28px;letter-spacing:.32em;color:#E3C187;font-weight:500">${resetCode}</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      If you didn't request this, ignore this email — your password is unchanged.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table></td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      재설정 페이지에 위 6자리 코드를 입력하십시오. 15분 후 만료됩니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      요청하지 않으셨다면 본 메일을 무시하셔도 됩니다 — 비밀번호는 변경되지 않습니다.
    </td></tr>
    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Reset your AURUM password.' });
  return { subject, text, html };
}

// 0) Confirmation back to the applicant — tells them their inquiry was received.
//    Deliberately quiet. No code, no link, no promise of timing — just acknowledgement.
//    A partner will follow up separately with the formal invitation if approved.
export function buildInquiryReceivedEmail({ lead }) {
  const subject = `Your inquiry has been received  ·  문의가 접수되었습니다`;
  const firstName = (lead.name_ko || lead.name || '').split(' ')[0] || '';
  const submittedIso = new Date(lead.submitted_at_ms || Date.now()).toISOString();

  const text = [
    `Your inquiry has been received.`,
    ``,
    `A timestamp record of your submission is on file. A member of the team will`,
    `review and respond from a private address. On verification, next steps will`,
    `be communicated, including review of the confidentiality agreement.`,
    ``,
    `This email confirms the receipt of your inquiry, made of your own accord.`,
    `The Aurum Century Club does not solicit publicly. All members initiate`,
    `contact in writing prior to receipt of substantive offering materials.`,
    ``,
    `Reference: ${lead.id}`,
    `Submitted: ${submittedIso}`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `문의가 접수되었습니다.`,
    ``,
    `제출하신 문의의 시각 기록이 보관되어 있습니다. 팀의 일원이 검토 후 비공개 주소에서`,
    `회신드립니다. 확인이 완료되면 비밀유지 계약 검토를 포함한 다음 단계가 안내됩니다.`,
    ``,
    `본 이메일은 귀하께서 자발적으로 제기하신 문의의 접수를 확인하는 것입니다.`,
    `The Aurum Century Club은 공개적인 권유를 하지 않습니다. 모든 회원은 실질적`,
    `자료 수령에 앞서 서면으로 직접 연락을 개시하셔야 합니다.`,
    ``,
    `참조 번호: ${lead.id}`,
    `제출 시각: ${submittedIso}`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">RECEIVED  ·  접수 완료</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Thank you${firstName ? ', <span style="font-style:italic;color:#C5A572">' + escape(firstName) + '</span>' : ''}.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 18px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      Your inquiry has been received. A timestamp record of your submission is on file. A member of the team will review and respond from a private address. On verification, next steps will be communicated, including review of the confidentiality agreement.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-style:italic;font-size:14px;line-height:1.7;color:#8a7d6b">
      This email confirms the receipt of your inquiry, made of your own accord. The Aurum Century Club does not solicit publicly. All members initiate contact in writing prior to receipt of substantive offering materials.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.18em;color:#6b655e;line-height:1.8">
      Reference: <span style="color:#C5A572">${escape(lead.id)}</span><br>
      Submitted: <span style="color:#C5A572">${escape(submittedIso)}</span>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      문의가 접수되었습니다. 제출하신 문의의 시각 기록이 보관되어 있습니다. 팀의 일원이 검토 후 비공개 주소에서 회신드립니다. 확인이 완료되면 비밀유지 계약 검토를 포함한 다음 단계가 안내됩니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 16px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#8a7d6b">
      본 이메일은 귀하께서 자발적으로 제기하신 문의의 접수를 확인하는 것입니다. The Aurum Century Club은 공개적인 권유를 하지 않습니다. 모든 회원은 실질적 자료 수령에 앞서 서면으로 직접 연락을 개시하셔야 합니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.18em;color:#6b655e;line-height:1.8">
      참조 번호: <span style="color:#C5A572">${escape(lead.id)}</span><br>
      제출 시각: <span style="color:#C5A572">${escape(submittedIso)}</span>
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Your inquiry to The Aurum Century Club has been received.' });
  return { subject, text, html };
}

// 0b) Partner alert — a lead just uploaded a signed NDA. Plain-text, terse,
//     internal use only. Routes to NOTIFY_EMAILS.
export function buildNdaUploadedAlert({ lead }) {
  const subject = `[AURUM] NDA uploaded · ${lead.name || 'Unnamed'} · review needed`;
  const adminUrl = `${process.env.SITE_URL || 'https://www.theaurumcc.com'}/admin?lead=${encodeURIComponent(lead.id)}`;
  const text = [
    `${lead.name || 'A lead'} just uploaded their signed NDA.`,
    ``,
    `Name:    ${lead.name || ''}${lead.name_ko ? '  (' + lead.name_ko + ')' : ''}`,
    `Email:   ${lead.email || ''}`,
    `Code:    ${lead.code || '—'}`,
    ``,
    `Review and approve/reject:`,
    `${adminUrl}`,
    ``,
    `— Aurum system`,
  ].join('\n');
  // Plain-text-only alert is fine here; partner-side, keep noise low.
  const html = `<pre style="font-family:ui-monospace,monospace;font-size:12px;color:#222;background:#fff;padding:18px">${escape(text)}</pre>`;
  return { subject, text, html };
}

// 0c) Lead notification — your NDA was rejected, please re-sign.
//     Sent automatically when a partner rejects an uploaded NDA.
export function buildNdaRejectedEmail({ lead, reason }) {
  const subject = `Your NDA needs revision  ·  NDA 재제출 요청`;
  const reasonLine = reason ? `Reason: ${reason}` : '';
  const reasonLineKo = reason ? `사유: ${reason}` : '';
  const accessCode = lead.code || '';

  const text = [
    `Hello,`,
    ``,
    `The signed NDA you uploaded was not accepted.${reason ? ' ' + reasonLine : ''}`,
    ``,
    `Please sign a fresh copy and re-upload it through the same link.`,
    `Your access code remains: ${accessCode}`,
    ``,
    `If anything is unclear, reply to this email and a partner will respond.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `안녕하세요,`,
    ``,
    `업로드해 주신 서명된 NDA가 승인되지 않았습니다.${reason ? ' ' + reasonLineKo : ''}`,
    ``,
    `새 사본에 서명하신 후 동일한 링크에서 재업로드해 주십시오.`,
    `접근 코드는 그대로 유효합니다: ${accessCode}`,
    ``,
    `궁금하신 점이 있으시면 본 메일에 회신 부탁드립니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">REVISION NEEDED  ·  재제출</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Your NDA needs <span style="font-style:italic;color:#C5A572">revision.</span>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 18px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      The signed NDA you uploaded was not accepted${reason ? '. <span style="color:#e8e3d8">' + escape(reason) + '</span>' : '.'}
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#6b655e;font-style:italic">
      Please sign a fresh copy and re-upload it through the same link. Your access code remains valid.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      업로드해 주신 서명된 NDA가 승인되지 않았습니다${reason ? '. <span style="color:#e8e3d8">' + escape(reason) + '</span>' : '.'}
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      새 사본에 서명하신 후 동일한 링크에서 재업로드해 주십시오. 접근 코드는 그대로 유효합니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Your AURUM NDA needs revision.' });
  return { subject, text, html };
}

// 0d) Lead acknowledgement — IOI received. Quiet thank-you, partner verifies next.
export function buildIoiReceivedEmail({ lead, ioi }) {
  const subject = `Your indication has been received  ·  의향서 접수 확인`;
  const kgText = ioi && ioi.kg ? `${Number(ioi.kg).toFixed(2)} kg` : '';
  const krwText = ioi && ioi.krw_at_submit ? formatKRWInline(ioi.krw_at_submit) : '';

  const text = [
    `Thank you. Your indication of interest has been received.`,
    ``,
    kgText ? `Commitment: ${kgText}` : '',
    krwText ? `Value at submit: ${krwText}` : '',
    ``,
    `A partner will review and verify within one to two business days,`,
    `then send wire instructions separately.`,
    ``,
    `You can track your status anytime at:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `의향서가 접수되었습니다. 감사합니다.`,
    ``,
    kgText ? `약정: ${kgText}` : '',
    krwText ? `제출 시 KRW: ${krwText}` : '',
    ``,
    `파트너가 1–2 영업일 이내 검토 및 확인 후`,
    `별도로 송금 안내를 발송해 드립니다.`,
    ``,
    `진행 상황은 포트폴리오에서 확인하실 수 있습니다:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].filter(Boolean).join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">RECEIVED  ·  접수 완료</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Indication <span style="font-style:italic;color:#C5A572">received.</span>
    </td></tr>

    ${kgText || krwText ? `<tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 18px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        ${kgText ? `<tr><td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:0.30em;color:#8a7d6b;padding:6px 18px 6px 0">COMMITMENT</td><td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;color:#E3C187;padding:6px 0">${escape(kgText)}</td></tr>` : ''}
        ${krwText ? `<tr><td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:0.30em;color:#8a7d6b;padding:6px 18px 6px 0">VALUE AT SUBMIT</td><td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;color:#e8e3d8;padding:6px 0">${escape(krwText)}</td></tr>` : ''}
      </table>
    </td></tr>` : ''}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      A partner will review and verify within one to two business days, then send wire instructions separately.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px" align="left">
      <a href="https://theaurumcc.com/portfolio" style="display:inline-block;padding:14px 26px;background:transparent;border:1px solid #C5A572;color:#C5A572;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase">TRACK STATUS  →</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      파트너가 1–2 영업일 이내 검토 및 확인 후, 별도로 송금 안내를 발송해 드립니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      진행 상황은 포트폴리오에서 확인하실 수 있습니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Your indication of interest has been received.' });
  return { subject, text, html };
}

// 1) Notify the partners that a new inquiry came in.
export function buildPartnerNotice(lead) {
  // Subject: handles missing wealth tier (new schema doesn't capture it)
  const subject = lead.wealth
    ? `[AURUM] New inquiry · ${lead.name || 'Unnamed'} · ${tierLabel(lead.wealth)}`
    : `[AURUM] New inquiry · ${lead.name || 'Unnamed'} · ${countryLabel(lead.country)}`;

  // Text body — conditional. Only show rows when data is populated.
  const lines = [
    `Name:        ${lead.name || ''}${lead.name_ko ? '  (' + lead.name_ko + ')' : ''}`,
  ];
  if (lead.email) lines.push(`Email:       ${lead.email}`);
  if (lead.country) lines.push(`Country:     ${countryLabel(lead.country)}`);
  if (lead.hear_about) lines.push(`Heard via:   ${hearAboutLabel(lead.hear_about)}`);
  // Legacy fields — only if populated (old leads pre-schema-change)
  const phone = ((lead.phone_cc || '') + ' ' + (lead.phone || '')).trim();
  if (phone) lines.push(`Phone:       ${phone}`);
  if (lead.wealth) lines.push(`Wealth:      ${tierLabel(lead.wealth)}`);
  if (lead.occupation) lines.push(`Occupation:  ${lead.occupation}`);
  if (lead.source_of_wealth) lines.push(`Source:      ${sourceOfWealthLabel(lead.source_of_wealth)}`);
  const interests = interestsLabel(lead);
  if (interests && interests !== '—') lines.push(`Interests:   ${interests}`);
  if (lead.referral) lines.push(`Referral:    ${lead.referral}`);

  if (lead.note) lines.push(`Note:        ${lead.note}`);
  lines.push(``);
  lines.push(`Submitted:   ${new Date(lead.submitted_at_ms || Date.now()).toISOString()}`);
  lines.push(`Lead ID:     ${lead.id}`);
  lines.push(``);
  lines.push(`Open the dashboard:  ${brand()}/admin?lead=${encodeURIComponent(lead.id)}`);

  const text = lines.join('\n');

  // HTML body — same conditional approach via the row() helper which now
  // returns empty string when value is falsy (see helper change below).
  const html = `
<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;color:#e8e3d8;font-family:Georgia,serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 28px">
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:18px"><tr>
      <td style="vertical-align:middle;padding-right:12px">
        <div style="border:1px solid rgba(197,165,114,0.6);width:32px;height:32px;text-align:center;line-height:32px;color:#C5A572;font-style:italic;font-family:Georgia,serif;font-size:15px;letter-spacing:-0.04em">Au</div>
      </td>
      <td style="vertical-align:middle">
        <div style="font-family:'Outfit',Arial,sans-serif;font-weight:600;font-size:12px;letter-spacing:0.32em;color:#ececec;line-height:1">AURUM</div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:400;font-size:8px;letter-spacing:0.34em;color:#8a7d6b;line-height:1;margin-top:5px">PARTNERS · CONSOLE</div>
      </td>
    </tr></table>
    <div style="font:11px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.32em;color:#C5A572;margin:0 0 4px">NEW INQUIRY</div>
    <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;color:#e8e3d8;margin:0 0 24px">${escape(lead.name || 'Unnamed')}${lead.name_ko ? ' <span style="color:#8a7d6b">· ' + escape(lead.name_ko) + '</span>' : ''}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-family:Georgia,serif;font-size:14px;color:#aaa39a;line-height:1.7">
      ${row('Email', lead.email)}
      ${row('Country', lead.country ? countryLabel(lead.country) : null)}
      ${row('Heard via', lead.hear_about ? hearAboutLabel(lead.hear_about) : null)}
      ${row('Phone', phone || null)}
      ${row('Wealth', lead.wealth ? tierLabel(lead.wealth) : null)}
      ${row('Occupation', lead.occupation)}
      ${row('Source', lead.source_of_wealth ? sourceOfWealthLabel(lead.source_of_wealth) : null)}
      ${row('Interests', interests && interests !== '—' ? interests : null)}
      ${row('Referral', lead.referral)}
    </table>
    ${lead.note ? `<div style="margin-top:18px;padding:14px;border-left:1px solid #C5A572;color:#e8e3d8;font-style:italic;font-size:14px;line-height:1.6">${escape(lead.note)}</div>` : ''}
    <div style="margin-top:32px">
      <a href="${brand()}/admin?lead=${encodeURIComponent(lead.id)}" style="display:inline-block;padding:14px 22px;background:#C5A572;color:#0a0a0a;text-decoration:none;font:11px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.30em">REVIEW IN DASHBOARD →</a>
    </div>
    <div style="margin-top:32px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);font:9px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.30em;color:#6b655e">TACC PTE LTD · ${new Date().getUTCFullYear()}</div>
  </div>
</body></html>`;
  return { subject, text, html };
}

function countryLabel(code) {
  return ({
    KR: 'South Korea', SG: 'Singapore', HK: 'Hong Kong SAR', JP: 'Japan',
    US: 'United States', GB: 'United Kingdom', AU: 'Australia', CA: 'Canada',
    CH: 'Switzerland', AE: 'United Arab Emirates', OTHER: 'Other',
  })[String(code || '').toUpperCase()] || code || '—';
}
function hearAboutLabel(code) {
  return ({
    member:    'Existing member',
    advisor:   'Advisor / family office',
    partner:   'Aurum partner',
    personal:  'Personal connection',
    community: 'HNW community',
  })[code] || code || '—';
}

function sourceOfWealthLabel(s) {
  return ({
    business:    'Business income',
    investment:  'Investment proceeds',
    inheritance: 'Inheritance',
    profession:  'Professional practice',
    other:       'Other',
  })[s] || (s || '—');
}

// 2) The member's invitation email — Email 1 in the flow.
//    Sent when the partner clicks Approve & Send on a /interest submission.
//    Short, four-line body. Single CTA. No process descriptions.
export function buildInvitationEmail({ lead, code, accessUrl }) {
  const subject = `An invitation from The Aurum Century Club`;

  const text = [
    `Welcome to The Aurum Century Club.`,
    ``,
    `The code below opens the program. Read about the Century Club at your pace, then continue to the confidentiality agreement when ready.`,
    ``,
    `Access code:  ${code}`,
    `Open the program:  ${accessUrl}`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `The Aurum Century Club에 오신 것을 환영합니다.`,
    ``,
    `아래 코드로 프로그램 안내를 열람하실 수 있습니다. 편한 속도로 검토하신 후, 준비가 되시면 비밀유지 계약 단계로 진행해 주십시오.`,
    ``,
    `접근 코드:    ${code}`,
    `프로그램 열기:  ${accessUrl}`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <!-- Eyebrow -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">INVITATION  ·  초대</td></tr>

    <!-- Headline (English) -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Welcome to <span style="font-style:italic;color:#C5A572">The Aurum Century Club.</span>
    </td></tr>

    <!-- One body line -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 26px;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#aaa39a">
      The code below opens the program. Read about the Century Club at your pace, then continue to the confidentiality agreement when ready.
    </td></tr>

    <!-- Code box -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
        <td bgcolor="#0a0a0a" align="center" style="background:#0a0a0a;border:1px solid rgba(197,165,114,0.50);padding:22px 24px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#8a7d6b;margin-bottom:10px">ACCESS CODE  ·  접근 코드</div>
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:21px;letter-spacing:.16em;color:#E3C187;font-weight:500">${code}</div>
        </td>
      </tr></table>
    </td></tr>

    <!-- CTA — single line, nowrap, tight padding for mobile -->
    <tr><td bgcolor="#0a0a0a" align="left" style="background:#0a0a0a;padding:0 32px 30px">
      <a href="${accessUrl}" style="display:inline-block;padding:13px 22px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.22em;font-weight:600;white-space:nowrap">OPEN THE PROGRAM &nbsp;→</a>
    </td></tr>

    <!-- Divider -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <!-- Korean section -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      The Aurum Century Club에 오신 것을 환영합니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      아래 코드로 프로그램 안내를 열람하실 수 있습니다. 편한 속도로 검토하신 후, 준비가 되시면 비밀유지 계약 단계로 진행해 주십시오.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'The code below opens the program.' });
  return { subject, text, html };
}

// 3) Materials open — Email 2.  Sent when a partner approves the signed NDA.
//    Member's NDA is countersigned; the three documents are now visible.
//    Per round-2 directive: NO IOI code/CTA in this email — IOI button
//    lives inside the document hub at /memo. Email is purely "materials open."
export function buildMaterialsOpenEmail({ lead, accessCode, accessUrl }) {
  const subject = `The materials are open  ·  자료가 열렸습니다`;

  const text = [
    `Your NDA has been countersigned. The materials are open in the member portal.`,
    ``,
    `Access code:    ${accessCode}`,
    `Open materials: ${accessUrl}`,
    ``,
    `Read at your pace. The path forward continues inside the portal.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `NDA가 확인되었습니다. 포털에서 자료가 열렸습니다.`,
    ``,
    `접근 코드:     ${accessCode}`,
    `자료 열람:     ${accessUrl}`,
    ``,
    `편한 속도로 검토하십시오. 다음 단계는 포털 내에서 안내됩니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">MATERIALS  ·  자료</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      <span style="font-style:italic;color:#C5A572">The materials</span> are open.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:#aaa39a">
      Your NDA has been countersigned. Read at your pace. The path forward continues inside the portal.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
        <td bgcolor="#0a0a0a" align="center" style="background:#0a0a0a;border:1px solid rgba(197,165,114,0.50);padding:22px 24px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#8a7d6b;margin-bottom:10px">ACCESS CODE  ·  접근 코드</div>
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:21px;letter-spacing:.16em;color:#E3C187;font-weight:500">${accessCode}</div>
        </td>
      </tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" align="left" style="background:#0a0a0a;padding:0 32px 30px">
      <a href="${accessUrl}" style="display:inline-block;padding:14px 24px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.24em;font-weight:600;white-space:nowrap">OPEN MATERIALS &nbsp;→</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      NDA가 확인되었습니다. 포털에서 자료가 열렸습니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      편한 속도로 검토하십시오. 다음 단계는 포털 내에서 안내됩니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Your materials are open in the member portal.' });
  return { subject, text, html };
}

// 4) Wire instructions — sent when a partner clicks VERIFY → on a submitted IOI.
//    Issues the wire reference, beneficiary, deadline. Restates the spot caveat.
export function buildWireInstructionsEmail({ lead, ioi, wire }) {
  const subject = `Wire instructions  ·  송금 안내`;
  const ref = wire.ref;
  const sc_bank = process.env.WIRE_BANK || 'Standard Chartered Bank (Singapore) Limited';
  const sc_account = process.env.WIRE_ACCOUNT || '[ACCOUNT NUMBER — TBD]';
  const sc_swift = process.env.WIRE_SWIFT || 'SCBLSGSGXXX';
  const sc_beneficiary = process.env.WIRE_BENEFICIARY || 'TACC PTE LTD';
  const deadline_days = 5; // 3-5 BD window per FAQ guidance

  const text = [
    `Your IOI has been confirmed. Wire instructions follow.`,
    ``,
    `Beneficiary:        ${sc_beneficiary}`,
    `Bank:               ${sc_bank}`,
    `Account:            ${sc_account}`,
    `SWIFT:              ${sc_swift}`,
    `Reference:          ${ref}    ← required`,
    `Currency:           KRW`,
    `Commitment:         ${ioi.kg.toFixed(2)} kg`,
    ``,
    `Final settlement is calculated at gold spot on the day your wire clears`,
    `plus two business days to convert. The KRW required at execution may`,
    `differ from the figure shown in the IOI form. We will confirm final`,
    `settlement on receipt.`,
    ``,
    `Please complete within ${deadline_days} business days. Use the reference`,
    `above on the wire memo so we can match it on receipt.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `의향서가 확인되었습니다. 송금 안내가 아래에 첨부되어 있습니다.`,
    ``,
    `수취인:            ${sc_beneficiary}`,
    `은행:              ${sc_bank}`,
    `계좌번호:          ${sc_account}`,
    `SWIFT:             ${sc_swift}`,
    `참조번호:          ${ref}    ← 필수`,
    `통화:              KRW`,
    `약정:              ${ioi.kg.toFixed(2)} kg`,
    ``,
    `최종 정산은 송금 도착일 + 영업일 2일의 환전 기간 후 시세로 계산됩니다.`,
    `실제 송금 시점의 KRW 금액은 의향서상 표시 금액과 차이가 있을 수 있습니다.`,
    ``,
    `${deadline_days} 영업일 이내 송금을 부탁드립니다. 입금 식별을 위해 위`,
    `참조번호를 송금 메모란에 반드시 기재해 주십시오.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  // table-row helper inline
  const wrow = (label, value) => `<tr>
    <td style="padding:8px 14px 8px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.26em;color:#8a7d6b;width:140px;vertical-align:top">${escape(label)}</td>
    <td style="padding:8px 0;font-family:Georgia,serif;font-size:14px;color:#e8e3d8;vertical-align:top">${escape(value)}</td>
  </tr>`;

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">WIRE INSTRUCTIONS  ·  송금 안내</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Your IOI is <span style="font-style:italic;color:#C5A572">confirmed.</span>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid rgba(197,165,114,0.30)">
        <tr><td style="padding:18px 22px">
          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse">
            ${wrow('BENEFICIARY', sc_beneficiary)}
            ${wrow('BANK', sc_bank)}
            ${wrow('ACCOUNT', sc_account)}
            ${wrow('SWIFT', sc_swift)}
            ${wrow('REFERENCE', ref + '   ← required')}
            ${wrow('CURRENCY', 'KRW')}
            ${wrow('COMMITMENT', ioi.kg.toFixed(2) + ' kg')}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-style:italic;font-size:14px;line-height:1.7;color:#8a7d6b">
      Final settlement is calculated at gold spot on the day your wire clears, plus two business days to convert. The KRW required at execution may differ from the figure shown in the IOI form. We will confirm final settlement on receipt.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#aaa39a">
      Please complete within ${deadline_days} business days. Use the reference above on the wire memo so we can match it on receipt.
    </td></tr>

    <!-- Korean -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 18px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      의향서가 확인되었습니다. 송금 안내는 위와 같습니다.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:13px;line-height:1.85;color:#8a7d6b;font-style:italic">
      최종 정산은 송금 도착일 + 영업일 2일의 환전 기간 후 시세로 계산됩니다. ${deadline_days} 영업일 이내 송금 부탁드리며, 위 참조번호를 송금 메모란에 반드시 기재해 주십시오.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px">&nbsp;</td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Wire instructions for your commitment.' });
  return { subject, text, html };
}

// 5) Admission email — sent when partner clicks MARK CLEARED on the wire panel.
//    Welcome to the 100, with a direct OPEN PORTFOLIO link (uses access code,
//    bookmark-able, 30-day cookie persistence per verify-code.js).
// 5) Admission email — sent when partner clicks MARK CLEARED on the wire panel.
//    Welcome to the 100, with a direct OPEN PORTFOLIO link.  We try to mint a
//    magic-link token so the click auto-authenticates without password — but
//    fall back to plain /portfolio if that fails (their existing 30-day cookie
//    should be live, or /portfolio will bounce to /login if needed).
export function buildAdmissionEmail({ lead, magicLinkToken }) {
  const subject = `Welcome to the 100  ·  Set up your password  ·  비밀번호 설정`;
  const siteUrl = process.env.SITE_URL || 'https://www.theaurumcc.com';
  // Direct password-setup URL. The token was minted as a "setup" magic link by
  // api/admin/update.js when the wire was marked cleared. One use only — once the
  // member sets their password, the access code is revoked and this token is consumed.
  const setupUrl = magicLinkToken
    ? `${siteUrl}/setup-password?ml=${encodeURIComponent(magicLinkToken)}`
    : `${siteUrl}/setup-password`;

  const text = [
    `Welcome to the 100. Your wire has cleared.`,
    ``,
    `You're now an admitted member. Set up a password to access your portfolio:`,
    ``,
    setupUrl,
    ``,
    `The link above is one-time. After you set a password, the access code from`,
    `earlier emails will no longer work — your email + password is your permanent`,
    `sign-in for ${siteUrl}/login.`,
    ``,
    `Bar serial numbers post within 5 business days as gold is allocated at`,
    `Singapore Freeport. You'll be notified by email at each milestone.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `창립 100인에 오신 것을 환영합니다. 송금이 정산되었습니다.`,
    ``,
    `정식 등재되셨습니다. 포트폴리오 접근을 위해 비밀번호를 설정해 주십시오:`,
    ``,
    setupUrl,
    ``,
    `위 링크는 1회용입니다. 비밀번호 설정 후에는 기존 접근 코드가 만료되며,`,
    `${siteUrl}/login 에서 이메일과 비밀번호로 로그인하시게 됩니다.`,
    ``,
    `금괴 일련번호는 싱가포르 Freeport 보관소에 배정 완료 후 영업일 5일 이내`,
    `포트폴리오에 게시됩니다. 각 단계마다 이메일로 알려드립니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">ADMITTED  ·  정식 등재</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Welcome to the <span style="font-style:italic;color:#C5A572">100.</span>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      Your wire has cleared. You're now an admitted member. Set up a password to access your portfolio.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 26px" align="left">
      <a href="${setupUrl}" style="display:inline-block;padding:14px 26px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase;font-weight:600">SET UP PASSWORD  →</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 12px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#aaa39a">
      The link above is one-time. After you set a password, the access code from earlier emails will no longer work — your email + password is your permanent sign-in for
      <a href="${siteUrl}/login" style="color:#C5A572;text-decoration:none">${siteUrl}/login</a>.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 16px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#aaa39a">
      Bar serial numbers post within 5 business days as gold is allocated at Singapore Freeport. You'll be notified by email at each milestone.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:14px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table></td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      송금이 정산되었습니다. 정식 등재되셨습니다. 포트폴리오 접근을 위해 비밀번호를 설정해 주십시오.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px" align="left">
      <a href="${setupUrl}" style="display:inline-block;padding:14px 26px;background:transparent;border:1px solid #C5A572;color:#C5A572;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase">비밀번호 설정  →</a>
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 16px;font-family:'Noto Serif KR',Georgia,serif;font-size:14px;line-height:1.7;color:#aaa39a">
      위 링크는 1회용입니다. 비밀번호 설정 후에는 기존 접근 코드가 만료되며,
      <a href="${siteUrl}/login" style="color:#C5A572;text-decoration:none">${siteUrl}/login</a>
      에서 이메일과 비밀번호로 로그인하시게 됩니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:'Noto Serif KR',Georgia,serif;font-size:14px;line-height:1.7;color:#aaa39a">
      금괴 일련번호는 싱가포르 Freeport 보관소에 배정 완료 후 영업일 5일 이내 포트폴리오에 게시됩니다. 각 단계마다 이메일로 알려드립니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Welcome to the 100. Set up your password.' });
  return { subject, text, html };
}

// ── Email 5: Quarterly Statement Notification ────────────────────────────────
// Sent when a quarterly statement PDF is added to the member's documents.
// Caller passes period (e.g. "Q1 2027") and statement_url for the deep link.
export function buildQuarterlyStatementEmail({ lead, period, statement_url }) {
  const subject = `Your ${period} statement is ready  ·  분기 보고서 발행`;

  const text = [
    `Your ${period} statement is now available in your portfolio.`,
    ``,
    `Open: https://theaurumcc.com/portfolio`,
    ``,
    `Direct link to PDF: ${statement_url || 'in your portfolio'}`,
    ``,
    `Figures shown are unaudited and subject to confirmation`,
    `by the fund administrator.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `${period} 보고서가 포트폴리오에 발행되었습니다.`,
    ``,
    `포트폴리오 열기: https://theaurumcc.com/portfolio`,
    ``,
    `표시된 모든 수치는 미감사이며,`,
    `펀드 행정사의 확인을 거쳐 확정됩니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">${escape(period)}  ·  STATEMENT</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Your <span style="font-style:italic;color:#C5A572">${escape(period)}</span> statement.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      Your ${escape(period)} statement is now available in your portfolio — top-line numbers, position-level marks, and the audited PDF.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px" align="left">
      <a href="https://theaurumcc.com/portfolio" style="display:inline-block;padding:14px 26px;background:transparent;border:1px solid #C5A572;color:#C5A572;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase">OPEN PORTFOLIO  →</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      ${escape(period)} 보고서가 포트폴리오에 발행되었습니다 — 주요 수치, 포지션별 평가, 그리고 감사 PDF가 포함되어 있습니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      표시된 모든 수치는 미감사이며, 펀드 행정사의 확인을 거쳐 확정됩니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: `${period} statement available in your portfolio.` });
  return { subject, text, html };
}

// ── Email 6: Capital Call Notice ─────────────────────────────────────────────
// Sent when a partner adds a capital call to the member's portfolio.
// Caller passes cc with { number, position_code, amount_krw, response_by, pdf_url }.
export function buildCapitalCallEmail({ lead, cc }) {
  const krwFmt = formatKRWInline(cc.amount_krw);
  const dueText = cc.response_by ? new Date(cc.response_by).toISOString().slice(0, 10) : '—';
  const subject = `Capital Call #${cc.number}  ·  ${cc.position_code} — ${krwFmt}  ·  자본 청구 안내`;

  const text = [
    `Capital Call #${cc.number} — ${cc.position_code}`,
    ``,
    `Amount: ${krwFmt}`,
    `Response by: ${dueText}`,
    cc.pdf_url ? `Notice PDF: ${cc.pdf_url}` : ``,
    ``,
    `Open your portfolio to acknowledge:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `자본 청구 #${cc.number} — ${cc.position_code}`,
    ``,
    `금액: ${krwFmt}`,
    `회신 기한: ${dueText}`,
    ``,
    `포트폴리오에서 확인하실 수 있습니다:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].filter(Boolean).join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">CAPITAL CALL #${cc.number}  ·  자본 청구</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      <span style="font-style:italic;color:#C5A572">${escape(cc.position_code)}</span> · ${escape(krwFmt)}
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      A capital call has been issued for your <span style="color:#C5A572">${escape(cc.position_code)}</span> position. Please acknowledge in your portfolio${dueText !== '—' ? ` by <span style="color:#e8e3d8">${escape(dueText)}</span>` : ''}.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px" align="left">
      <a href="https://theaurumcc.com/portfolio" style="display:inline-block;padding:14px 26px;background:transparent;border:1px solid #C5A572;color:#C5A572;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase">OPEN PORTFOLIO  →</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      <span style="color:#C5A572">${escape(cc.position_code)}</span> 포지션에 대해 자본 청구가 발행되었습니다. ${dueText !== '—' ? `<span style="color:#e8e3d8">${escape(dueText)}</span>까지 ` : ''}포트폴리오에서 확인해 주십시오.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: `Capital Call #${cc.number} for ${cc.position_code} — ${krwFmt}` });
  return { subject, text, html };
}

// ── Email 7: Wire Reminder ───────────────────────────────────────────────────
// Sent to nudge a member when their wire is pending and the deadline approaches.
// Caller can fire manually from admin or from a future cron at T-2 BD.
export function buildWireReminderEmail({ lead, ioi, wire }) {
  const subject = `Reminder · your wire is pending  ·  송금 안내 재발송`;
  const ref = wire.ref || '—';
  const kg = ioi.kg ? Number(ioi.kg).toFixed(2) : '—';

  const text = [
    `This is a friendly reminder that your wire is still pending.`,
    ``,
    `Wire reference: ${ref}`,
    `Commitment: ${kg} kg`,
    ``,
    `Original wire instructions remain valid. If you've already sent`,
    `the wire, please disregard — clearance can take 1–2 business days.`,
    ``,
    `Open your portfolio:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `송금이 아직 진행 중입니다. 안내드립니다.`,
    ``,
    `송금 참조번호: ${ref}`,
    `약정량: ${kg} kg`,
    ``,
    `송금 안내는 그대로 유효합니다. 이미 송금을 완료하신 경우`,
    `참고만 부탁드립니다 — 정산까지 1–2 영업일 소요됩니다.`,
    ``,
    `포트폴리오 열기:`,
    `https://theaurumcc.com/portfolio`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const inner = `
    ${lockupRow}

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:36px 32px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572">REMINDER  ·  송금 안내</td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px;font-family:Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;letter-spacing:-0.01em;color:#e8e3d8">
      Your wire is still <span style="font-style:italic;color:#C5A572">pending.</span>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 18px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      The wire instructions sent earlier remain valid. Reference: <span style="font-family:'JetBrains Mono',ui-monospace,monospace;color:#E3C187;letter-spacing:0.10em">${escape(ref)}</span>.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#6b655e;font-style:italic">
      If you've already sent the wire, please disregard — clearance typically takes 1–2 business days.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 32px" align="left">
      <a href="https://theaurumcc.com/portfolio" style="display:inline-block;padding:14px 26px;background:transparent;border:1px solid #C5A572;color:#C5A572;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.30em;text-transform:uppercase">OPEN PORTFOLIO  →</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      이전 송금 안내는 그대로 유효합니다. 참조번호: <span style="font-family:'JetBrains Mono',ui-monospace,monospace;color:#E3C187;letter-spacing:0.10em">${escape(ref)}</span>.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-style:italic;font-size:13px;line-height:1.7;color:#6b655e">
      이미 송금을 완료하신 경우 참고만 부탁드립니다 — 정산까지 1–2 영업일 소요됩니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: `Reminder: your AURUM wire is still pending. Reference ${ref}.` });
  return { subject, text, html };
}

// KRW formatter for inline use in email templates
function formatKRWInline(amount) {
  if (amount == null || isNaN(amount)) return '—';
  const a = Math.round(amount);
  if (a === 0) return '0';
  const EOK = 100000000, MAN = 10000;
  const eok = Math.floor(a / EOK);
  const rem = a % EOK;
  const man = Math.floor(rem / MAN);
  const won = rem % MAN;
  const parts = [];
  if (eok) parts.push(eok.toLocaleString('en-US') + '억');
  if (man) parts.push(man.toLocaleString('en-US') + '만');
  if (won) parts.push(won.toLocaleString('en-US') + '원');
  return parts.join(' ') || '0';
}

// ── tiny helpers ──────────────────────────────────────────────────────────
function escape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function row(label, val) {
  // Conditional render: skip the row entirely when value is empty or dash placeholder
  if (val === null || val === undefined || val === '' || val === '—') return '';
  return `<tr><td style="padding:6px 12px 6px 0;color:#8a7d6b;font:9.5px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.30em;width:90px;vertical-align:top">${escape(label)}</td><td style="padding:6px 0;color:#e8e3d8">${escape(val)}</td></tr>`;
}
function tierLabel(w) {
  return ({
    '250k_500k': '$250K – $500K  · Emerging',
    '500k_2m':   '$500K – $2M    · Established',
    '2m_5m':     '$2M – $5M      · Senior',
    '5m_plus':   '$5M+           · Principal',
  })[w] || (w || '—');
}
function interestsLabel(lead) {
  if (lead.interest_all) return 'All of the above';
  const out = [];
  if (lead.interest_deals) out.push('Global private deals');
  if (lead.interest_gold) out.push('Gold investment');
  if (lead.interest_familyoffice) out.push('Family office');
  return out.join(', ') || '—';
}
