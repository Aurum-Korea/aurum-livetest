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

// 1) Notify the partners that a new inquiry came in.
export function buildPartnerNotice(lead) {
  const subject = `[AURUM] New inquiry · ${lead.name || 'Unnamed'} · ${tierLabel(lead.wealth)}`;
  const lines = [
    `Name:        ${lead.name || ''}${lead.name_ko ? '  (' + lead.name_ko + ')' : ''}`,
    `Email:       ${lead.email || ''}`,
    `Phone:       ${(lead.phone_cc || '') + ' ' + (lead.phone || '')}`,
    `Country:     ${lead.country || ''}`,
    `Wealth:      ${tierLabel(lead.wealth)}`,
    `Occupation:  ${lead.occupation || '—'}`,
    `Source:      ${sourceOfWealthLabel(lead.source_of_wealth)}`,
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
      ${row('Occupation', lead.occupation || '—')}
      ${row('Source', sourceOfWealthLabel(lead.source_of_wealth))}
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
  const subject = `An invitation from The Aurum Century Club  ·  아름 센추리 클럽 초대장`;

  const text = [
    `Welcome to The Aurum Century Club.`,
    ``,
    `The code below opens your NDA.`,
    ``,
    `Access code:  ${code}`,
    `Open NDA:     ${accessUrl}`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `아름 센추리 클럽에 오신 것을 환영합니다.`,
    ``,
    `아래 코드로 NDA를 여십시오.`,
    ``,
    `접근 코드:  ${code}`,
    `NDA 열기:   ${accessUrl}`,
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
      The code below opens your NDA.
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
      <a href="${accessUrl}" style="display:inline-block;padding:13px 22px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.22em;font-weight:600;white-space:nowrap">OPEN NDA &nbsp;→</a>
    </td></tr>

    <!-- Divider -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <!-- Korean section -->
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      아름 센추리 클럽에 오신 것을 환영합니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      아래 코드로 NDA를 여십시오.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'The code below opens your NDA.' });
  return { subject, text, html };
}

// 3) Materials open — Email 2.  Sent when a partner approves the signed NDA.
//    Member's NDA is countersigned; the three documents are now visible.
//    Carries the IOI code that will let them return to /ioi when ready.
export function buildMaterialsOpenEmail({ lead, ioiCode, ioiUrl }) {
  const subject = `The materials are open  ·  자료가 열렸습니다`;

  const text = [
    `Your materials are open in the member portal.`,
    ``,
    `When you are ready to commit, the code below begins the next step.`,
    ``,
    `Code:           ${ioiCode}`,
    `Open form:      ${ioiUrl}`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `포털에서 자료가 열렸습니다.`,
    ``,
    `의향 표명 준비가 되시면, 아래 코드로 다음 단계를 시작하실 수 있습니다.`,
    ``,
    `코드:           ${ioiCode}`,
    `양식 열기:      ${ioiUrl}`,
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

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 26px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:#aaa39a">
      Your materials are open in the member portal. When you are ready to commit, the code below begins the next step.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
        <td bgcolor="#0a0a0a" align="center" style="background:#0a0a0a;border:1px solid rgba(197,165,114,0.50);padding:22px 24px">
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.30em;color:#8a7d6b;margin-bottom:10px">CODE  ·  코드</div>
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:18px;letter-spacing:.14em;color:#E3C187;font-weight:500">${ioiCode}</div>
        </td>
      </tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" align="left" style="background:#0a0a0a;padding:0 32px 30px">
      <a href="${ioiUrl}" style="display:inline-block;padding:13px 22px;background:#C5A572;color:#0a0a0a;text-decoration:none;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.22em;font-weight:600;white-space:nowrap">INDICATE COMMITMENT &nbsp;→</a>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      포털에서 자료가 열렸습니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      의향 표명 준비가 되시면, 아래 코드로 다음 단계를 시작하실 수 있습니다.
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

// 5) Admission email — sent when a partner clicks MARK CLEARED on the wire panel.
//    Quiet, brief. Welcome to the 100.
export function buildAdmissionEmail({ lead }) {
  const subject = `Welcome to the 100  ·  창립 100인에 오신 것을 환영합니다`;

  const text = [
    `Your wire has cleared. You are admitted to the founding cohort.`,
    ``,
    `A partner will be in touch shortly with onboarding next steps —`,
    `bar serial assignment, custody confirmation, portal credentials.`,
    ``,
    `— The Partners`,
    `Aurum · TACC Pte Ltd · Singapore`,
    ``,
    `─────────────────────────────────────────`,
    ``,
    `송금이 정산되었습니다. 창립 회원으로 정식 등재되셨습니다.`,
    ``,
    `곧 파트너가 연락드려 온보딩 다음 단계를 안내해 드립니다 —`,
    `금괴 일련번호 배정, 보관 확인, 포털 접근 정보.`,
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

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 30px;font-family:Georgia,serif;font-size:16px;line-height:1.78;color:#aaa39a">
      Your wire has cleared. You are admitted to the founding cohort. A partner will be in touch shortly with onboarding next steps — bar serial assignment, custody confirmation, portal credentials.
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#1a1815" style="background:#1a1815;line-height:1px;font-size:1px">&nbsp;</td></tr></table>
    </td></tr>

    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 14px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      송금이 정산되었습니다. 창립 회원으로 정식 등재되셨습니다.
    </td></tr>
    <tr><td bgcolor="#0a0a0a" style="background:#0a0a0a;padding:0 32px 36px;font-family:'Noto Serif KR',Georgia,serif;font-size:14.5px;line-height:1.85;color:#aaa39a">
      곧 파트너가 연락드려 온보딩 다음 단계를 안내해 드립니다.
    </td></tr>

    ${signOffRow}
  `;
  const html = shellHtml({ inner, hidden_preheader: 'Welcome to the founding cohort.' });
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
