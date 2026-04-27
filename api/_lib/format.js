// KRW format / parse helpers.
//
// Korean denominations:
//   1만 = 10,000        (ten thousand)
//   1억 = 100,000,000   (hundred million)
//
// formatKRW(amount, lang)
//   formatKRW(500000000,  'ko')   → '5억'
//   formatKRW(471250000,  'ko')   → '4억 7,125만'
//   formatKRW(471250000,  'en')   → '₩471,250,000'
//   formatKRW(500000000,  'en')   → '₩500,000,000'
//
// parseKRW(input)  — accepts any of these and returns a number:
//   '5억'                   → 500000000
//   '5억 1,000만'           → 510000000
//   '500,000,000'           → 500000000
//   '500000000'             → 500000000
//   '500m'                  → 500000000  (Western shorthand if user typed it)
//   '5e8'                   → 500000000
//   ''                      → 0
//   junk                    → NaN

const EOK = 100_000_000;
const MAN = 10_000;

export function formatKRW(amount, lang = 'ko') {
  if (amount == null || isNaN(amount)) return lang === 'ko' ? '0원' : '₩0';
  const a = Math.round(amount);
  if (lang === 'en') {
    return '₩' + a.toLocaleString('en-US');
  }
  // Korean: 억/만 split
  if (a === 0) return '0';
  const eok = Math.floor(a / EOK);
  const remainder = a % EOK;
  const man = Math.floor(remainder / MAN);
  const won = remainder % MAN;

  const parts = [];
  if (eok) parts.push(`${eok.toLocaleString('en-US')}억`);
  if (man) parts.push(`${man.toLocaleString('en-US')}만`);
  if (won) parts.push(`${won.toLocaleString('en-US')}원`);
  return parts.join(' ') || '0';
}

export function parseKRW(input) {
  if (input == null) return 0;
  let s = String(input).trim();
  if (!s) return 0;

  // Strip ₩ and Korean won marker, commas, whitespace inside numbers
  s = s.replace(/[₩,\s원]/g, '');

  // Western shorthand: 500m, 1.5b, 5k → expand
  const western = /^(\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(s);
  if (western) {
    const n = parseFloat(western[1]);
    const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[western[2].toLowerCase()];
    return Math.round(n * mult);
  }

  // Korean: capture (X)억 (Y)만 (Z) - any combination
  let total = 0;
  let consumed = false;
  const eokMatch = /(\d+(?:\.\d+)?)억/.exec(s);
  if (eokMatch) {
    total += parseFloat(eokMatch[1]) * EOK;
    s = s.replace(eokMatch[0], '');
    consumed = true;
  }
  const manMatch = /(\d+(?:\.\d+)?)만/.exec(s);
  if (manMatch) {
    total += parseFloat(manMatch[1]) * MAN;
    s = s.replace(manMatch[0], '');
    consumed = true;
  }
  if (consumed) {
    // Any remaining digits are bare won
    const rest = s.replace(/[^\d.]/g, '');
    if (rest) total += parseFloat(rest);
    return Math.round(total);
  }

  // Plain number (possibly scientific)
  const n = Number(s);
  if (isNaN(n)) return NaN;
  return Math.round(n);
}

// Convert KRW amount to kg, using krw_per_kg spot
export function krwToKg(krw, krw_per_kg) {
  if (!krw_per_kg) return 0;
  return krw / krw_per_kg;
}

// Convert kg to KRW
export function kgToKrw(kg, krw_per_kg) {
  return Math.round(kg * krw_per_kg);
}
