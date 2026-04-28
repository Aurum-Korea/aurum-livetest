// HTTP / JSON helpers — shared across all /api endpoints.
// Vercel serverless functions are vanilla Node req/res handlers.

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function ok(res, body = { ok: true }) { return json(res, 200, body); }
export function bad(res, msg = 'bad request') { return json(res, 400, { ok: false, error: msg }); }
export function unauthorized(res, msg = 'unauthorized') { return json(res, 401, { ok: false, error: msg }); }
export function notFound(res, msg = 'not found') { return json(res, 404, { ok: false, error: msg }); }
export function serverError(res, msg = 'server error') { return json(res, 500, { ok: false, error: msg }); }

export async function readBody(req) {
  // Vercel parses JSON automatically when content-type is application/json,
  // but we read manually to be safe and to support form-encoded fallback.
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', (c) => { buf += c; if (buf.length > 1_000_000) reject(new Error('payload too large')); });
    req.on('end', () => {
      if (!buf) return resolve({});
      try { resolve(JSON.parse(buf)); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

export function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';').map((s) => s.trim());
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i < 0) continue;
    if (p.slice(0, i) === name) return decodeURIComponent(p.slice(i + 1));
  }
  return null;
}

export function setCookie(res, name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path || '/'}`);
  parts.push(`Max-Age=${opts.maxAge ?? 60 * 60 * 24 * 7}`);
  parts.push('HttpOnly');
  parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite || 'Lax'}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow.join(', '));
  return json(res, 405, { ok: false, error: 'method not allowed' });
}

export function getQuery(req) {
  const url = new URL(req.url, 'http://x');
  const out = {};
  for (const [k, v] of url.searchParams) out[k] = v;
  return out;
}

export function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}
