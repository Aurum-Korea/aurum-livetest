// Blob — thin wrapper around @vercel/blob with sensible defaults for AURUM.
// All NDA files are stored as PRIVATE blobs (only readable via this server,
// never via direct URL). The blob URL is saved to the lead record but never
// leaks to patrons — partners download via /api/admin/nda-download.

import { put as blobPut, del as blobDel, get as blobGet } from '@vercel/blob';

const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN || '';

export function isConfigured() {
  return !!TOKEN();
}

// Upload a Buffer to private storage. Returns { url, pathname }.
export async function putPrivate(pathname, buffer, { contentType }) {
  if (!isConfigured()) throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  const result = await blobPut(pathname, buffer, {
    access: 'private',
    contentType: contentType || 'application/octet-stream',
    addRandomSuffix: true,
    token: TOKEN(),
  });
  return { url: result.url, pathname: result.pathname };
}

// Stream a private blob back. Returns { stream, contentType, size } or null.
export async function getPrivate(pathnameOrUrl) {
  if (!isConfigured()) throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  const r = await blobGet(pathnameOrUrl, { access: 'private', token: TOKEN() });
  if (!r) return null;
  return {
    stream: r.stream,
    contentType: r.blob?.contentType || 'application/octet-stream',
    size: r.blob?.size || 0,
  };
}

// Delete a private blob. Best-effort.
export async function deletePrivate(pathnameOrUrl) {
  if (!isConfigured()) return;
  try {
    await blobDel(pathnameOrUrl, { token: TOKEN() });
  } catch (e) {
    console.warn('[aurum] blob delete failed:', e && e.message);
  }
}
