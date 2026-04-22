import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns/promises';
import net from 'node:net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 80);
const ICON_CACHE_TTL_MS = 1000 * 60 * 60;
const ICON_CACHE_MAX_ENTRIES = 200;
const ICON_FETCH_TIMEOUT_MS = 6000;
const ICON_MAX_BYTES = 256 * 1024;
const GAME_THUMB_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const GAME_THUMB_CACHE_MAX_ENTRIES = 600;
const GAME_THUMB_FETCH_TIMEOUT_MS = 8000;
const GAME_THUMB_MAX_BYTES = 512 * 1024;
const GAME_THUMB_ALLOWED_HOST = 'storage.googleapis.com';
const GAME_THUMB_ALLOWED_PATH_PREFIX = '/images.imbaweb.com/';
const TRUSTED_COMPANIES_API_URL = 'https://api.tipsmega888.com/api/companies';
const TRUSTED_COMPANIES_CACHE_TTL_MS = 1000 * 60 * 5;
const TRUSTED_COMPANY_FALLBACK_LINKS = [
  'https://masuk10.com/Winbest',
  'http://ezchat4u.com/REZ88',
  'https://masuk10.com/X9',
  'https://masuk10.com/Aiplay'
];
const iconCache = new Map();
const gameThumbCache = new Map();
let trustedOriginsCache = { expiresAt: 0, origins: new Set() };

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function send(res, statusCode, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(payload);
}

function notFound(res) {
  send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
}

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function normalizeRequestPath(pathname) {
  const decoded = decodeURIComponent(pathname || '/');
  const stripped = decoded.replace(/^\/+/, '');
  return stripped;
}

function normalizeTrustedOrigin(value) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.origin.toLowerCase();
  } catch {
    return '';
  }
}

async function getAllowedTrustedOrigins() {
  if (trustedOriginsCache.expiresAt > Date.now() && trustedOriginsCache.origins.size) {
    return trustedOriginsCache.origins;
  }

  let origins = new Set();

  try {
    const response = await fetch(TRUSTED_COMPANIES_API_URL, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(ICON_FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': 'SlotpatcherTrustedIconProxy/1.0 (+https://slotpatcher.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Trusted companies API unavailable');
    }

    const payload = await response.json();
    const companies = Array.isArray(payload?.companies) ? payload.companies : [];
    origins = new Set(
      companies
        .filter((company) => company && company.status === 'ACTIVE')
        .map((company) => normalizeTrustedOrigin(company.link || ''))
        .filter(Boolean)
    );

    if (!origins.size) {
      throw new Error('Trusted companies API returned no usable origins');
    }
  } catch {
    origins = new Set(TRUSTED_COMPANY_FALLBACK_LINKS.map(normalizeTrustedOrigin).filter(Boolean));
  }

  trustedOriginsCache = {
    expiresAt: Date.now() + TRUSTED_COMPANIES_CACHE_TTL_MS,
    origins
  };

  return origins;
}

async function resolveStaticFile(pathname) {
  const relativePath = normalizeRequestPath(pathname);
  let candidate = path.resolve(ROOT_DIR, relativePath || 'index.html');

  if (!candidate.startsWith(ROOT_DIR)) {
    return null;
  }

  try {
    let stat = await fs.stat(candidate);
    if (stat.isDirectory()) {
      const nestedIndex = path.join(candidate, 'index.html');
      stat = await fs.stat(nestedIndex);
      if (stat.isFile()) return nestedIndex;
    }
    if (stat.isFile()) return candidate;
  } catch {}

  if (!path.extname(candidate)) {
    const indexCandidate = path.resolve(ROOT_DIR, relativePath, 'index.html');
    if (indexCandidate.startsWith(ROOT_DIR)) {
      try {
        const stat = await fs.stat(indexCandidate);
        if (stat.isFile()) return indexCandidate;
      } catch {}
    }
  }

  return null;
}

function isPrivateIp(address) {
  if (!address) return true;
  if (net.isIPv4(address)) {
    const parts = address.split('.').map(Number);
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }

  const normalized = address.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('::ffff:')) {
    return isPrivateIp(normalized.replace('::ffff:', ''));
  }
  return false;
}

async function validateTrustedTarget(targetValue) {
  let parsed;
  try {
    parsed = new URL(targetValue);
  } catch {
    throw new Error('Invalid URL');
  }

  const { protocol, hostname, username, password } = parsed;
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('Unsupported URL scheme');
  }

  if (username || password) {
    throw new Error('Credentials in URL are not allowed');
  }

  const lowerHostname = hostname.toLowerCase();
  if (!lowerHostname || lowerHostname === 'localhost' || lowerHostname.endsWith('.local')) {
    throw new Error('Local targets are not allowed');
  }

  if (/^\d+$/.test(lowerHostname) || lowerHostname.startsWith('0x')) {
    throw new Error('Obfuscated numeric hosts are not allowed');
  }

  if (net.isIP(lowerHostname)) {
    if (isPrivateIp(lowerHostname)) {
      throw new Error('Private IP targets are not allowed');
    }
    return parsed;
  }

  const addresses = await dns.lookup(lowerHostname, { all: true, verbatim: true });
  if (!addresses.length) {
    throw new Error('Target host could not be resolved');
  }

  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error('Private network targets are not allowed');
  }

  return parsed;
}

function cacheKeyForTarget(targetUrl) {
  return targetUrl.origin.toLowerCase();
}

function pruneIconCache() {
  if (iconCache.size < ICON_CACHE_MAX_ENTRIES) return;
  const oldestKey = iconCache.keys().next().value;
  if (oldestKey) iconCache.delete(oldestKey);
}

function pruneGameThumbCache() {
  if (gameThumbCache.size < GAME_THUMB_CACHE_MAX_ENTRIES) return;
  const oldestKey = gameThumbCache.keys().next().value;
  if (oldestKey) gameThumbCache.delete(oldestKey);
}

function cacheKeyForGameThumb(targetUrl) {
  return targetUrl.toString();
}

function validateGameThumbnailTarget(targetValue) {
  let parsed;
  try {
    parsed = new URL(targetValue);
  } catch {
    throw new Error('Invalid thumbnail URL');
  }

  const { protocol, hostname, pathname, username, password } = parsed;
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('Unsupported thumbnail URL scheme');
  }

  if (username || password) {
    throw new Error('Credentials in thumbnail URL are not allowed');
  }

  if (hostname.toLowerCase() !== GAME_THUMB_ALLOWED_HOST) {
    throw new Error('Thumbnail host is not allowlisted');
  }

  if (!pathname.startsWith(GAME_THUMB_ALLOWED_PATH_PREFIX)) {
    throw new Error('Thumbnail path is not allowlisted');
  }

  if (!/\.(png|jpe?g|webp|gif|avif)$/i.test(pathname)) {
    throw new Error('Thumbnail file type is not allowed');
  }

  return parsed;
}

async function fetchGameThumbnail(targetUrl, redirectDepth = 0) {
  if (redirectDepth > 2) {
    throw new Error('Too many thumbnail redirects');
  }

  const key = cacheKeyForGameThumb(targetUrl);
  const cached = gameThumbCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const response = await fetch(targetUrl, {
    method: 'GET',
    redirect: 'manual',
    signal: AbortSignal.timeout(GAME_THUMB_FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'SlotpatcherGameThumbProxy/1.0 (+https://slotpatcher.com)',
      'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
    }
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Thumbnail redirect target missing');
    }
    const redirectedUrl = validateGameThumbnailTarget(new URL(location, targetUrl).toString());
    return fetchGameThumbnail(redirectedUrl, redirectDepth + 1);
  }

  if (!response.ok) {
    throw new Error('Thumbnail unavailable');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Thumbnail response is not an image');
  }

  const declaredLength = Number(response.headers.get('content-length') || '0');
  if (declaredLength && declaredLength > GAME_THUMB_MAX_BYTES) {
    throw new Error('Thumbnail too large');
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length) {
    throw new Error('Thumbnail body empty');
  }

  if (body.length > GAME_THUMB_MAX_BYTES) {
    throw new Error('Thumbnail too large');
  }

  const cachedResult = {
    body,
    contentType,
    expiresAt: Date.now() + GAME_THUMB_CACHE_TTL_MS
  };
  pruneGameThumbCache();
  gameThumbCache.set(key, cachedResult);
  return cachedResult;
}

async function fetchTrustedIconCandidate(candidateUrl, redirectDepth = 0) {
  if (redirectDepth > 3) {
    throw new Error('Too many redirects');
  }

  const response = await fetch(candidateUrl, {
    method: 'GET',
    redirect: 'manual',
    signal: AbortSignal.timeout(ICON_FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'SlotpatcherTrustedIconProxy/1.0 (+https://slotpatcher.com)',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect target missing');
    }
    const redirectedUrl = new URL(location, candidateUrl);
    await validateTrustedTarget(redirectedUrl.toString());
    return fetchTrustedIconCandidate(redirectedUrl.toString(), redirectDepth + 1);
  }

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    return null;
  }

  const declaredLength = Number(response.headers.get('content-length') || '0');
  if (declaredLength && declaredLength > ICON_MAX_BYTES) {
    throw new Error('Icon too large');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) {
    return null;
  }
  if (buffer.length > ICON_MAX_BYTES) {
    throw new Error('Icon too large');
  }

  return {
    body: buffer,
    contentType
  };
}

async function fetchTrustedIcon(targetUrl) {
  const key = cacheKeyForTarget(targetUrl);
  const cached = iconCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const candidates = [
    new URL('/favicon.ico', targetUrl.origin).toString(),
    new URL('/apple-touch-icon.png', targetUrl.origin).toString(),
    new URL('/apple-touch-icon-precomposed.png', targetUrl.origin).toString()
  ];

  for (const candidate of candidates) {
    const result = await fetchTrustedIconCandidate(candidate);
    if (!result) {
      continue;
    }

    const cachedResult = {
      ...result,
      expiresAt: Date.now() + ICON_CACHE_TTL_MS
    };
    pruneIconCache();
    iconCache.set(key, cachedResult);
    return cachedResult;
  }

  throw new Error('Icon not found');
}

async function handleTrustedIcon(req, res, requestUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, { error: 'Method not allowed' }, { 'Content-Type': 'application/json; charset=utf-8' });
    return;
  }

  const target = requestUrl.searchParams.get('target');
  if (!target) {
    send(res, 400, { error: 'Missing target URL' }, { 'Content-Type': 'application/json; charset=utf-8' });
    return;
  }

  try {
    const targetUrl = await validateTrustedTarget(target);
    const allowedOrigins = await getAllowedTrustedOrigins();
    if (!allowedOrigins.has(targetUrl.origin.toLowerCase())) {
      throw new Error('Target is not in trusted-company allowlist');
    }
    const icon = await fetchTrustedIcon(targetUrl);
    res.writeHead(200, {
      'Content-Type': icon.contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(icon.body);
  } catch (error) {
    send(res, 404, { error: error.message || 'Trusted icon unavailable' }, { 'Content-Type': 'application/json; charset=utf-8' });
  }
}

async function handleGameThumbnail(req, res, requestUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, { error: 'Method not allowed' }, { 'Content-Type': 'application/json; charset=utf-8' });
    return;
  }

  const src = requestUrl.searchParams.get('src');
  if (!src) {
    send(res, 400, { error: 'Missing thumbnail source URL' }, { 'Content-Type': 'application/json; charset=utf-8' });
    return;
  }

  try {
    const targetUrl = validateGameThumbnailTarget(src);
    const thumbnail = await fetchGameThumbnail(targetUrl);
    res.writeHead(200, {
      'Content-Type': thumbnail.contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(thumbnail.body);
  } catch (error) {
    send(res, 404, { error: error.message || 'Game thumbnail unavailable' }, { 'Content-Type': 'application/json; charset=utf-8' });
  }
}

async function handleStatic(req, res, requestUrl) {
  const filePath = await resolveStaticFile(requestUrl.pathname);
  if (!filePath) {
    notFound(res);
    return;
  }

  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(body);
  } catch {
    notFound(res);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (requestUrl.pathname === '/api/trusted-icon') {
      await handleTrustedIcon(req, res, requestUrl);
      return;
    }
    if (requestUrl.pathname === '/api/game-thumb') {
      await handleGameThumbnail(req, res, requestUrl);
      return;
    }
    await handleStatic(req, res, requestUrl);
  } catch (error) {
    send(res, 500, { error: error.message || 'Internal server error' }, { 'Content-Type': 'application/json; charset=utf-8' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Slotpatcher server listening on ${PORT}`);
});
