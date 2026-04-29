// KRW format / parse helpers.
//
// Korean denominations:
//   1 = 10,000        (ten thousand)
//   1 = 100,000,000   (hundred million)
//
// Per round-2 directive: formatKRW always returns / — even in EN mode.
// Per round-A1 (launch readiness): rounds to nearest  universally.  The
// trailing  amount (single digits up to 9,999) is dropped at display
// time — values like "1 5,977 5,127" become "1 5,978".  Raw
// numbers are preserved in the database; only the display rounds.
//
// formatKRW(amount)
//   formatKRW(500000000)   → '5'
//   formatKRW(471250000)   → '4 7,125'
//   formatKRW(159775127)   → '1 5,978'   ← rounded up from 5,127
//   formatKRW(1200000000)  → '12'
//   formatKRW(8500)        → '8,500'        ← only sub-1 amounts keep 
//
// parseKRW(input) is unchanged — still handles the full spectrum of
// inputs including bare won, since user input may be precise.

const EOK = 100_000_000;
const MAN = 10_000;

export function formatKRW(amount, _lang) {
  if (amount == null || isNaN(amount)) return '0';
  const a = Math.round(amount);
  if (a === 0) return '0';

  // Sub-1 amounts: show as raw won (rare edge case — gas, tip-jar amounts)
  if (a < MAN) return `${a.toLocaleString('en-US')}`;

  // Round to nearest  for clean display
  const rounded = Math.round(a / MAN) * MAN;
  const eok = Math.floor(rounded / EOK);
  const remainder = rounded % EOK;
  const man = Math.floor(remainder / MAN);

  const parts = [];
  if (eok) parts.push(`${eok.toLocaleString('en-US')}`);
  if (man) parts.push(`${man.toLocaleString('en-US')}`);
  return parts.join(' ') || '0';
}

export function parseKRW(input) {
  if (input == null) return 0;
  let s = String(input).trim();
  if (!s) return 0;

  // Strip ₩ and Korean won marker, commas, whitespace inside numbers
  s = s.replace(/[₩,\s]/g, '');

  // Western shorthand: 500m, 1.5b, 5k → expand
  const western = /^(\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(s);
  if (western) {
    const n = parseFloat(western[1]);
    const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[western[2].toLowerCase()];
    return Math.round(n * mult);
  }

  // Korean: capture (X) (Y) (Z) - any combination
  let total = 0;
  let consumed = false;
  const eokMatch = /(\d+(?:\.\d+)?)/.exec(s);
  if (eokMatch) {
    total += parseFloat(eokMatch[1]) * EOK;
    s = s.replace(eokMatch[0], '');
    consumed = true;
  }
  const manMatch = /(\d+(?:\.\d+)?)/.exec(s);
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
