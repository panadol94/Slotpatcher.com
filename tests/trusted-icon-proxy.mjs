import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const dockerfile = fs.readFileSync(path.join(repoRoot, 'Dockerfile'), 'utf8');
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');
const serverFile = path.join(repoRoot, 'server.mjs');

assert.ok(fs.existsSync(serverFile), 'expected repo to add a server.mjs entrypoint for trusted icon proxy support');

const serverCode = fs.readFileSync(serverFile, 'utf8');

assert.match(
  dockerfile,
  /FROM\s+node:/i,
  'expected deployment Dockerfile to switch from pure nginx static hosting to a Node runtime that can expose a proxy/API route'
);

assert.match(
  dockerfile,
  /server\.mjs/,
  'expected deployment Dockerfile to start the Node server entrypoint'
);

assert.match(
  serverCode,
  /\/api\/trusted-icon/,
  'expected server to expose a dedicated /api/trusted-icon proxy route'
);

assert.match(
  serverCode,
  /TRUSTED_COMPANIES_API_URL|api\.tipsmega888\.com\/api\/companies/,
  'expected trusted-icon proxy to derive its allowlist from the trusted companies API rather than accepting arbitrary external targets'
);

assert.match(
  serverCode,
  /getAllowedTrustedOrigins\(/,
  'expected trusted-icon proxy to gate icon fetches through an explicit trusted-origin allowlist'
);

assert.match(
  serverCode,
  /Target is not in trusted-company allowlist/,
  'expected trusted-icon proxy to reject targets outside the trusted-company allowlist'
);

assert.match(
  serverCode,
  /protocol\s*!==\s*'http:'[\s\S]*protocol\s*!==\s*'https:'/,
  'expected trusted-icon proxy to reject non-http(s) schemes'
);

assert.match(
  serverCode,
  /redirect:\s*'manual'/,
  'expected trusted-icon proxy to avoid blindly following redirects when fetching third-party icons'
);

assert.match(
  serverCode,
  /location\s*=\s*response\.headers\.get\('location'\)[\s\S]*validateTrustedTarget\(redirectedUrl\.toString\(\)\)/,
  'expected trusted-icon proxy to validate redirect targets before following them'
);

assert.match(
  serverCode,
  /AbortSignal\.timeout\(ICON_FETCH_TIMEOUT_MS\)/,
  'expected trusted-icon proxy to enforce a fetch timeout for remote icon requests'
);

assert.match(
  serverCode,
  /ICON_MAX_BYTES|content-length|Icon too large/,
  'expected trusted-icon proxy to enforce a response size limit for remote icons'
);

assert.match(
  serverCode,
  /localhost|127\.0\.0\.1|::1|Private network targets are not allowed|Obfuscated numeric hosts are not allowed/,
  'expected trusted-icon proxy to guard against localhost/private-target requests and obfuscated host forms'
);

assert.match(
  trustedHtml,
  /\/api\/trusted-icon\?target=/,
  'expected trusted page to route link-derived icon requests through the local proxy endpoint instead of third-party direct requests'
);

assert.doesNotMatch(
  trustedHtml,
  /new URL\(company\.link\)\.origin \+ '\/favicon\.ico'/,
  'expected trusted page to stop requesting favicon.ico directly from third-party company domains in the browser'
);

console.log('Trusted icon proxy checks passed.');
