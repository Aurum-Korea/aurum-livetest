// Geo-IP helper.
//
// On Vercel, every request has free geo headers attached:
//   x-forwarded-for          — IP chain
//   x-real-ip                — fallback IP
//   x-vercel-ip-country      — ISO country code (e.g. "KR")
//   x-vercel-ip-country-region — region/state (e.g. "11" or "Seoul")
//   x-vercel-ip-city         — city (URL-encoded, e.g. "Seoul")
//   x-vercel-ip-latitude     — float
//   x-vercel-ip-longitude    — float
//
// Locally / in dev, these are absent — we return null fields gracefully.

export function extractGeo(req) {
  const h = req.headers || {};
  const fwd = String(h['x-forwarded-for'] || '');
  const ip = (fwd.split(',')[0] || '').trim() || h['x-real-ip'] || null;
  const country = h['x-vercel-ip-country'] || null;
  const region = h['x-vercel-ip-country-region'] || null;
  const cityRaw = h['x-vercel-ip-city'] || null;
  // Vercel URL-encodes the city header
  let city = null;
  if (cityRaw) {
    try { city = decodeURIComponent(cityRaw); } catch { city = String(cityRaw); }
  }
  return {
    ip: ip ? maskIp(ip) : null,        // mask last octet for privacy
    country: country || null,
    region: region || null,
    city: city || null,
  };
}

// Mask the last octet of an IPv4 (or last 80 bits of IPv6).
// We keep enough info to spot anomalies without storing full PII.
function maskIp(ip) {
  if (!ip) return null;
  // IPv4: a.b.c.d → a.b.c.0
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    return ip.replace(/\.\d+$/, '.0');
  }
  // IPv6: keep first 3 groups
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + '::';
  }
  return ip;
}

// Build a single-line geo summary for audit display.
//   "Seoul, KR · 203.0.113.0"
export function geoSummary(geo) {
  if (!geo || (!geo.country && !geo.city && !geo.ip)) return '';
  const parts = [];
  if (geo.city && geo.country) parts.push(`${geo.city}, ${geo.country}`);
  else if (geo.country) parts.push(geo.country);
  if (geo.ip) parts.push(geo.ip);
  return parts.join(' · ');
}
