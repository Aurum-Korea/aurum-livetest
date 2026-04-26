// Email — Resend REST API. Optional: if RESEND_API_KEY is unset, send() returns
// { sent: false, reason: 'no-resend' } so the dashboard can fall back to "copy the message."

const RESEND_URL = 'https://api.resend.com/emails';

function fromAddress() {
  return process.env.FROM_EMAIL || 'Aurum Partners <partners@theaurumcc.com>';
}
function brand() {
  return process.env.SITE_URL || 'https://www.theaurumcc.com';
}

export async function sendRaw({ to, subject, html, text, replyTo, bcc }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: 'no-resend' };
  const body = {
    from: fromAddress(),
    to: Array.isArray(to) ? to : [to],
    subject, html, text,
  };
  if (replyTo) body.reply_to = replyTo;
  if (bcc) body.bcc = Array.isArray(bcc) ? bcc : [bcc];

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

// 1) Notify the partners that a new inquiry came in.
export function buildPartnerNotice(lead) {
  const subject = `[AURUM] New inquiry · ${lead.name || 'Unnamed'} · ${tierLabel(lead.wealth)}`;
  const lines = [
    `Name:        ${lead.name || ''}${lead.name_ko ? '  (' + lead.name_ko + ')' : ''}`,
    `Email:       ${lead.email || ''}`,
    `Phone:       ${(lead.phone_cc || '') + ' ' + (lead.phone || '')}`,
    `Country:     ${lead.country || ''}`,
    `Wealth:      ${tierLabel(lead.wealth)}`,
    `Interests:   ${interestsLabel(lead)}`,
    `Referral:    ${lead.referral || '—'}`,
    `Note:        ${lead.note || '—'}`,
    ``,
    `Submitted:   ${new Date(lead.submitted_at_ms || Date.now()).toISOString()}`,
    `Lead ID:     ${lead.id}`,
    ``,
    `Open the dashboard:  ${brand()}/admin?lead=${encodeURIComponent(lead.id)}`,
  ];
  const text = lines.join('\n');
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
      ${row('Phone', (lead.phone_cc || '') + ' ' + (lead.phone || ''))}
      ${row('Country', lead.country)}
      ${row('Wealth', tierLabel(lead.wealth))}
      ${row('Interests', interestsLabel(lead))}
      ${row('Referral', lead.referral || '—')}
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

// 2) The patron's invitation code email (bilingual)
export function buildInvitationEmail({ lead, code, accessUrl }) {
  const firstName = (lead.name || '').trim().split(/\s+/)[0] || '';
  const subject = `${firstName ? firstName + ', ' : ''}your Aurum invitation code · 초대 코드`;
  const text = [
    `Dear ${lead.name || 'Member'},`,
    ``,
    `Thank you for your interest in The Aurum Century Club. Following our review, we are`,
    `pleased to extend you access to the full Memo and the two opening positions.`,
    ``,
    `Your invitation code:  ${code}`,
    ``,
    `Open the materials:    ${accessUrl}`,
    ``,
    `Or visit ${brand()}/code and enter the code above. After signing in, you will be`,
    `asked to download a brief NDA, sign it, and upload the signed copy. Once a partner`,
    `confirms the signed NDA, the Founders Memo, the Companion Memo, and the Patron FAQ`,
    `become available.`,
    ``,
    `We will be in touch shortly to begin the conversation.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `${lead.name_ko || lead.name || ''} 님께,`,
    ``,
    `아름 센추리 클럽에 관심을 가져 주셔서 감사합니다. 검토를 거쳐 전체 투자 메모와`,
    `두 개시 포지션에 대한 접근 권한을 부여해 드리게 되어 영광입니다.`,
    ``,
    `초대 코드:  ${code}`,
    ``,
    `자료 열람:  ${accessUrl}`,
    ``,
    `또는 ${brand()}/code 페이지에서 위 코드를 입력해 주세요. 입장 후, 간단한 NDA를`,
    `다운로드 받아 서명하시고, 서명본을 업로드해 주시면 됩니다. 파트너가 서명본을`,
    `확인한 후 창립 회원 메모, 보조 메모, 회원 FAQ가 열람 가능합니다.`,
    ``,
    `곧 연락드려 본격적인 대화를 시작하겠습니다.`,
    ``,
    `— 파트너 일동`,
    `Aurum · TACC Pte Ltd · 싱가포르`,
  ].join('\n');

  const html = `
<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;color:#e8e3d8;font-family:'Cormorant Garamond',Georgia,serif">
  <div style="max-width:600px;margin:0 auto;padding:48px 32px">
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
      <td style="vertical-align:middle;padding-right:14px">
        <div style="border:1px solid #C5A572;width:38px;height:38px;text-align:center;line-height:38px;color:#C5A572;font-style:italic;font-family:Georgia,serif;font-size:18px;letter-spacing:-0.04em">Au</div>
      </td>
      <td style="vertical-align:middle">
        <div style="font-family:'Outfit',Arial,sans-serif;font-weight:600;font-size:14px;letter-spacing:0.34em;color:#ececec;line-height:1">AURUM</div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:400;font-size:8.5px;letter-spacing:0.36em;color:#8a7d6b;line-height:1;margin-top:6px">CENTURY · CLUB</div>
      </td>
    </tr></table>

    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.34em;color:#C5A572;margin:32px 0 8px">INVITATION · 초대</div>

    <h1 style="font-family:Georgia,serif;font-weight:500;font-size:36px;line-height:1.15;letter-spacing:-0.01em;color:#e8e3d8;margin:0 0 18px">
      ${firstName ? escape(firstName) + ', ' : ''}<span style="font-style:italic;color:#C5A572">welcome.</span>
    </h1>

    <p style="font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a;margin:0 0 28px">
      Thank you for your interest in The Aurum Century Club. Following our review, the partners are pleased to extend you access to the <em style="color:#E3C187">full Memo</em> and the two opening positions.
    </p>

    <div style="border:1px solid rgba(197,165,114,0.50);background:rgba(197,165,114,0.04);padding:24px;margin:0 0 28px;text-align:center">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#8a7d6b;margin-bottom:10px">YOUR INVITATION CODE · 초대 코드</div>
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:22px;letter-spacing:.18em;color:#E3C187;font-weight:500">${code}</div>
    </div>

    <div style="margin:0 0 36px">
      <a href="${accessUrl}" style="display:inline-block;padding:16px 28px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11.5px;letter-spacing:.30em;font-weight:500">OPEN MATERIALS · 자료 열람 →</a>
    </div>

    <p style="font-family:Georgia,serif;font-size:14.5px;line-height:1.78;color:#aaa39a;margin:0 0 20px">
      Or visit <a href="${brand()}/code" style="color:#E3C187;text-decoration:none;border-bottom:1px solid rgba(197,165,114,0.3)">${escape(brand().replace(/^https?:\/\//, ''))}/code</a> and enter the code above. After signing in, you will be asked to download a brief <em>NDA</em>, sign it, and upload the signed copy. Once a partner confirms the signed document, the <em>Founders Memo</em>, <em>Companion Memo</em>, and <em>Patron FAQ</em> become available.
    </p>

    <p style="font-family:Georgia,serif;font-size:14.5px;line-height:1.78;color:#aaa39a;margin:0 0 36px">
      We will be in touch shortly to begin the conversation.
    </p>

    <hr style="border:0;height:1px;background:rgba(197,165,114,0.22);margin:0 0 28px">

    <p style="font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a;margin:0 0 14px">
      ${escape(lead.name_ko || lead.name || '')} 님께,
    </p>
    <p style="font-family:'Noto Serif KR',Georgia,serif;font-size:14px;line-height:1.85;color:#aaa39a;margin:0 0 18px">
      아름 센추리 클럽에 관심을 가져 주셔서 감사합니다. 파트너 검토를 거쳐 <em style="color:#E3C187">전체 투자 메모</em>와 두 개시 포지션 열람 권한을 부여해 드립니다.
    </p>
    <p style="font-family:'Noto Serif KR',Georgia,serif;font-size:14px;line-height:1.85;color:#aaa39a;margin:0 0 24px">
      위의 초대 코드를 사용하시거나 <a href="${accessUrl}" style="color:#E3C187;text-decoration:none">자료 열람</a> 링크를 클릭해 주세요. 입장 후 간단한 <em style="color:#E3C187">NDA</em>를 다운로드 받아 서명하시고, 서명본을 업로드해 주시면 됩니다. 파트너가 서명본 확인 후 창립 회원 메모, 보조 메모, 회원 FAQ가 열람 가능합니다.
    </p>

    <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#6b655e">
      <div>— THE PARTNERS · 파트너 일동</div>
      <div style="margin-top:6px">AURUM · TACC PTE LTD · SINGAPORE</div>
      <div style="margin-top:14px;color:#3a3733">CONFIDENTIAL  ·  QUALIFIED INVESTORS ONLY</div>
    </div>
  </div>
</body></html>`;
  return { subject, text, html };
}

// ── tiny helpers ──────────────────────────────────────────────────────────
function escape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function row(label, val) {
  return `<tr><td style="padding:6px 12px 6px 0;color:#8a7d6b;font:9.5px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.30em;width:90px;vertical-align:top">${escape(label)}</td><td style="padding:6px 0;color:#e8e3d8">${escape(val || '—')}</td></tr>`;
}
function tierLabel(w) {
  return ({
    '500k_1m': '$500K – $1M  · Emerging',
    '1m_5m':   '$1M – $5M    · Established',
    '5m_25m':  '$5M – $25M   · Senior',
    '25m_plus':'$25M+        · Principal',
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
