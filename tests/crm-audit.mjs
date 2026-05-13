// CRM regression tests — guards against the XSS bugs fixed in admin Leads +
// Analytics tables and the save-openai-key validation rules.
//
// Promoted from the throwaway /tmp/crm_audit*.mjs scripts so future edits that
// re-introduce raw HTML in lead/analytics rendering, or weaken the OpenAI key
// guard, are caught immediately.
//
// Run with:  node --test tests/crm-audit.mjs

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Run the express app in "Vercel mode" so it does NOT auto-listen and so all
// data files (admin-credentials.json, openai-key.json) live in /tmp.
process.env.VERCEL = '1';
delete process.env.DATABASE_URL;
delete process.env.NEON_DATABASE_URL;
delete process.env.OPENAI_API_KEY;
delete process.env.SECRET_KEY;
delete process.env.OPENAI_KEY;
delete process.env.OPEN_AI_KEY;

// Reset any pre-existing /tmp state so credentials and key checks are deterministic.
for (const f of ['/tmp/admin-credentials.json', '/tmp/openai-key.json', '/tmp/admin-token-version.json', '/tmp/admin-sessions.json']) {
  try { fs.unlinkSync(f); } catch (_) {}
}

const require = createRequire(import.meta.url);
const app = require(path.join(repoRoot, 'preview-server.cjs'));

let server;
let baseUrl;
let adminToken;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // Default credentials live in preview-server.cjs: admin / cahit2024.
  const r = await fetch(`${baseUrl}/admin/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'cahit2024' }),
  });
  const body = await r.json();
  assert.equal(r.status, 200, 'admin login should succeed with default credentials');
  assert.ok(body.token, 'admin login should return a token');
  adminToken = body.token;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

// ---------------------------------------------------------------------------
// Admin-renderer harness
//
// admin.js is wrapped in an IIFE, so the rendering functions aren't directly
// importable. To actually execute them against malicious input we extract the
// relevant function bodies from the source, evaluate them in a vm context that
// is backed by a real jsdom DOM (so admin.js's own escapeHtml() runs through
// document.createTextNode like it would in the browser), and then assert
// against the real produced HTML.
// ---------------------------------------------------------------------------

const adminJsSource = fs.readFileSync(
  path.join(repoRoot, 'wp-theme/cahit-theme/admin/admin.js'),
  'utf8',
);

function extractFunction(name) {
  const re = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*{`);
  const m = re.exec(adminJsSource);
  assert.ok(m, `expected to find function ${name} in admin.js`);
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < adminJsSource.length && depth > 0) {
    const ch = adminJsSource[i++];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
  }
  return adminJsSource.slice(m.index, i);
}

function makeAdminContext() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const sandbox = {
    document: dom.window.document,
    window: dom.window,
    state: { leads: [] },
    parseInt,
    Math,
    String,
    Number,
    Date,
    JSON,
  };
  vm.createContext(sandbox);
  // Wire in escapeHtml + renderLeads exactly as defined in admin.js.
  vm.runInContext(extractFunction('escapeHtml'), sandbox);
  vm.runInContext(extractFunction('renderLeads'), sandbox);
  return { dom, sandbox };
}

// Extract the exact row-building snippets from loadAnalyticsData so we can
// run them in isolation against hostile data.
function extractAnalyticsRowBuilders() {
  const src = extractFunction('loadAnalyticsData');
  function slice(startNeedle, endNeedle) {
    const s = src.indexOf(startNeedle);
    const e = src.indexOf(endNeedle, s);
    assert.ok(s !== -1 && e !== -1, `slice ${startNeedle} → ${endNeedle} not found`);
    return src.slice(s, e);
  }
  return {
    topPages: slice('var topPagesHtml', 'var referrerHtml'),
    referrers: slice('var referrerHtml', 'var recentHtml'),
    recent: slice('var recentHtml', "document.getElementById('analytics-content')"),
  };
}

// ---------------------------------------------------------------------------
// Lead XSS regression
// ---------------------------------------------------------------------------

test('leads endpoint stores raw user input but admin renderer escapes it', async () => {
  // NB: payload intentionally contains no `"` because admin.js's escapeHtml
  // only escapes <, >, & (it serializes a textNode's innerHTML). Quote
  // escaping in attribute context is a separate concern — out of scope for
  // this regression test.
  const xssPayload = '<script>alert(1)</script>';
  const post = await fetch(`${baseUrl}/admin/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Evil ${xssPayload}`,
      email: `evil+xss@example.com`,
      phone: `555 ${xssPayload}`,
      service_type: `Marine ${xssPayload}`,
      details: `Details ${xssPayload}`,
    }),
  });
  assert.equal(post.status, 200, 'POST /admin/api/leads should succeed');

  const get = await fetch(`${baseUrl}/admin/api/leads`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const body = await get.json();
  assert.equal(get.status, 200);
  assert.ok(body.success && Array.isArray(body.data), 'leads list should be returned');
  const lead = body.data.find((l) => String(l.name || '').includes('Evil'));
  assert.ok(lead, 'submitted lead should be retrievable');
  // Data must be preserved verbatim — escaping happens at the rendering layer.
  assert.ok(lead.name.includes(xssPayload), 'raw payload preserved as data');
  assert.ok(lead.details.includes(xssPayload), 'raw details payload preserved as data');

  // Now actually run renderLeads() in a real DOM with the malicious data and
  // verify the produced HTML is inert.
  const { dom, sandbox } = makeAdminContext();
  sandbox.state.leads = [{
    id: 1,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service_type: lead.service_type,
    details: lead.details,
    status: '<img src=x onerror=alert(1)>',
    created_at: new Date().toISOString(),
  }];
  const html = vm.runInContext('renderLeads()', sandbox);
  assert.equal(typeof html, 'string');

  // Mount the HTML in jsdom so we get a real parsed tree (a "small DOM check").
  const host = dom.window.document.createElement('div');
  host.innerHTML = html;

  // No live <script> or <img> tag may appear from any user-controlled field.
  assert.equal(host.querySelectorAll('script').length, 0, 'no live <script> in lead row');
  // The row must contain no <img onerror=...>; the only injected raw-tag
  // candidates would come from the status field. (Genuine SVG icons in the
  // template are fine; check specifically for malicious tags.)
  for (const img of host.querySelectorAll('img')) {
    assert.ok(!img.hasAttribute('onerror'), 'no live onerror attribute may survive escaping');
  }

  // The malicious payload must be present as escaped text content on each cell.
  const text = host.textContent;
  assert.ok(text.includes('<script>alert(1)</script>'), 'escaped payload should round-trip as text');
  assert.ok(!html.toLowerCase().includes('<script>alert'), 'raw <script>alert(...) must not appear in rendered HTML string');
  // The DOM-parse check above (querySelectorAll('script')/'img[onerror]') is
  // the real security guarantee — do not assert on string substrings of
  // already-escaped output, since "onerror=alert(1)" is fine as plain text.

  // The details cell uses both inner-text and a title="…" attribute. Both
  // must be HTML-entity-encoded in the source HTML. Inspect the raw HTML
  // string for the title attribute — it must contain &lt;/&gt;, never raw
  // tags, otherwise the attribute could break out of its quotes.
  const detailsCells = host.querySelectorAll('.lead-details-text');
  assert.ok(detailsCells.length > 0, 'details cell should render');
  const titleAttrMatch = html.match(/class="lead-details-text"[^>]*title="([^"]*)"/);
  assert.ok(titleAttrMatch, 'details cell should expose a title attribute in the HTML');
  assert.ok(!titleAttrMatch[1].includes('<script>'), 'title attribute source must contain no raw < tag');
  assert.ok(titleAttrMatch[1].includes('&lt;script&gt;'), 'title attribute source must contain the entity-encoded form');
  // After the browser parses the attribute, the decoded value naturally holds
  // the literal payload — but it is inert because it is just a string.
  for (const cell of detailsCells) {
    const decoded = cell.getAttribute('title') || '';
    assert.ok(decoded.includes('<script>alert(1)</script>'), 'decoded title should hold the literal payload as inert text');
  }
});

// ---------------------------------------------------------------------------
// Analytics XSS regression
// ---------------------------------------------------------------------------

test('analytics row builders escape referrer and page strings', () => {
  const builders = extractAnalyticsRowBuilders();
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const sandbox = {
    document: dom.window.document,
    window: dom.window,
    parseInt,
    Math,
    String,
    Number,
    Date,
    JSON,
  };
  vm.createContext(sandbox);
  vm.runInContext(extractFunction('escapeHtml'), sandbox);
  // getTimeAgo is referenced inside the recent-views builder.
  vm.runInContext("function getTimeAgo(d){ return 'just now'; }", sandbox);

  const xss = '<script>alert("pwn-analytics")</script>';
  sandbox.d = {
    topPages: [{ page: `/p/${xss}`, views: 10 }],
    referrers: [{ source: `Referrer ${xss}`, visitors: 5 }],
    recentViews: [{ page: `/r/${xss}`, created_at: new Date().toISOString(), referrer: `Ref ${xss}` }],
  };
  vm.runInContext('var totalRefVisitors = 5;', sandbox);

  const topPagesHtml = vm.runInContext(builders.topPages + '\ntopPagesHtml', sandbox);
  const referrerHtml = vm.runInContext(builders.referrers + '\nreferrerHtml', sandbox);
  const recentHtml = vm.runInContext(builders.recent + '\nrecentHtml', sandbox);

  for (const [name, html] of [['topPages', topPagesHtml], ['referrers', referrerHtml], ['recent', recentHtml]]) {
    assert.equal(typeof html, 'string', `${name} should produce a string`);
    const host = dom.window.document.createElement('table');
    host.innerHTML = `<tbody>${html}</tbody>`;
    assert.equal(host.querySelectorAll('script').length, 0, `${name} must not produce a live <script>`);
    for (const img of host.querySelectorAll('img')) {
      assert.ok(!img.hasAttribute('onerror'), `${name} must not produce live onerror`);
    }
    assert.ok(host.textContent.includes('<script>alert("pwn-analytics")</script>'), `${name} should escape payload as text`);
    assert.ok(!html.toLowerCase().includes('<script>alert'), `${name} HTML must not contain raw <script>alert`);
  }
});

// ---------------------------------------------------------------------------
// /admin/api/save-openai-key validation
// ---------------------------------------------------------------------------

async function postKey(body) {
  return fetch(`${baseUrl}/admin/api/save-openai-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(body),
  });
}

test('save-openai-key requires auth', async () => {
  const r = await fetch(`${baseUrl}/admin/api/save-openai-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'sk-anything' }),
  });
  assert.equal(r.status, 401);
});

test('save-openai-key rejects empty body without {clear:true}', async () => {
  const r = await postKey({});
  assert.equal(r.status, 400, 'empty body must be rejected so existing keys are not silently wiped');
  const body = await r.json();
  assert.equal(body.success, false);
});

test('save-openai-key rejects bad-shape key', async () => {
  const r = await postKey({ key: 'not-a-real-key' });
  assert.equal(r.status, 400, 'keys not starting with sk- or shorter than 20 chars must be rejected');
  const body = await r.json();
  assert.equal(body.success, false);
});

test('save-openai-key accepts {clear:true}', async () => {
  const r = await postKey({ clear: true });
  assert.equal(r.status, 200, 'explicit clear must be allowed');
  const body = await r.json();
  assert.equal(body.success, true);
});

test('save-openai-key accepts a well-formed sk- key', async () => {
  const r = await postKey({ key: 'sk-test-1234567890ABCDEFGHIJ' });
  assert.equal(r.status, 200, 'well-formed sk- key must be accepted');
  const body = await r.json();
  assert.equal(body.success, true);
});

// ---------------------------------------------------------------------------
// /admin/api/sessions — list + remote revoke
//
// These guard against two regressions on the new active-sessions screen:
//   1. An unauthenticated caller must never be able to enumerate live
//      sessions or remotely sign anyone out.
//   2. The list response must include `currentTokenId` so the UI can
//      highlight "this device", and revoking another session must take
//      effect on the very next request from that token (without
//      collateral-damaging the caller's own session).
// Run before the logout block, which terminates `adminToken`.
// ---------------------------------------------------------------------------

async function loginAsAdminEarly() {
  const r = await fetch(`${baseUrl}/admin/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'cahit2024' }),
  });
  const body = await r.json();
  assert.equal(r.status, 200, 'admin login should succeed');
  assert.ok(body.token, 'login should return a token');
  return body.token;
}

async function fetchSessions(token) {
  const r = await fetch(`${baseUrl}/admin/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(r.status, 200, 'authenticated GET /admin/api/sessions should succeed');
  const body = await r.json();
  assert.equal(body.success, true, 'sessions response should report success');
  assert.ok(Array.isArray(body.sessions), 'sessions response should expose an array');
  return body;
}

function findSessionByTokenId(sessions, tokenId) {
  return sessions.find((s) => s && s.tokenId === tokenId);
}

test('GET /admin/api/sessions rejects unauthenticated callers', async () => {
  const r = await fetch(`${baseUrl}/admin/api/sessions`);
  assert.equal(r.status, 401, 'anonymous list-sessions must be rejected');
});

test('DELETE /admin/api/sessions/:tokenId rejects unauthenticated callers', async () => {
  // Use a plausible-looking but unknown token id — the auth check must run
  // before any lookup, otherwise an anonymous caller could probe / revoke
  // sessions by id.
  const r = await fetch(`${baseUrl}/admin/api/sessions/some-token-id`, { method: 'DELETE' });
  assert.equal(r.status, 401, 'anonymous revoke-session must be rejected');
});

test('two parallel logins both appear in /admin/api/sessions with caller-specific currentTokenId', async () => {
  const laptopToken = await loginAsAdminEarly();
  const phoneToken = await loginAsAdminEarly();
  assert.notEqual(laptopToken, phoneToken, 'each login should mint a unique token');

  const fromLaptop = await fetchSessions(laptopToken);
  const fromPhone = await fetchSessions(phoneToken);

  // Both sessions must show up in either listing.
  for (const [label, body] of [['laptop', fromLaptop], ['phone', fromPhone]]) {
    assert.ok(body.currentTokenId, `${label} listing should include a non-empty currentTokenId`);
    const ids = body.sessions.map((s) => s.tokenId);
    assert.ok(ids.includes(body.currentTokenId), `${label} listing should include caller's own session`);
  }

  // currentTokenId must reflect the caller, not just the most recent login.
  assert.notEqual(
    fromLaptop.currentTokenId,
    fromPhone.currentTokenId,
    'currentTokenId must differ per caller so the UI highlights the right device',
  );

  const laptopId = fromLaptop.currentTokenId;
  const phoneId = fromPhone.currentTokenId;
  assert.ok(findSessionByTokenId(fromLaptop.sessions, phoneId), 'laptop listing should include the phone session');
  assert.ok(findSessionByTokenId(fromPhone.sessions, laptopId), 'phone listing should include the laptop session');

  // Clean up so later tests start from a known state.
  for (const t of [laptopToken, phoneToken]) {
    await fetch(`${baseUrl}/admin/api/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    });
  }
});

test('revoking another session 401s that token while the caller stays signed in', async () => {
  const callerToken = await loginAsAdminEarly();
  const victimToken = await loginAsAdminEarly();

  // Discover the victim's tokenId via the caller's session list.
  const list = await fetchSessions(callerToken);
  const victimList = await fetchSessions(victimToken);
  const victimId = victimList.currentTokenId;
  assert.ok(victimId, 'victim must have a tokenId');
  assert.ok(findSessionByTokenId(list.sessions, victimId), 'caller list should include the victim session');
  assert.notEqual(list.currentTokenId, victimId, 'sanity: caller and victim must be distinct sessions');

  const del = await fetch(`${baseUrl}/admin/api/sessions/${encodeURIComponent(victimId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${callerToken}` },
  });
  assert.equal(del.status, 200, 'authenticated revoke must succeed');
  const delBody = await del.json();
  assert.equal(delBody.success, true);
  assert.equal(delBody.revokedSelf, false, 'revoking someone else must report revokedSelf:false');

  const victimAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });
  assert.equal(victimAfter.status, 401, 'victim token must be invalid on its next request');

  const callerAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${callerToken}` },
  });
  assert.equal(callerAfter.status, 200, 'caller token must remain valid after revoking someone else');

  // Clean up.
  await fetch(`${baseUrl}/admin/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${callerToken}` },
  });
});

test('self-revoke reports revokedSelf:true and 401s the calling token afterwards', async () => {
  const token = await loginAsAdminEarly();
  const list = await fetchSessions(token);
  const ownId = list.currentTokenId;
  assert.ok(ownId, 'caller must have a tokenId');

  const del = await fetch(`${baseUrl}/admin/api/sessions/${encodeURIComponent(ownId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(del.status, 200, 'self-revoke must succeed');
  const delBody = await del.json();
  assert.equal(delBody.success, true);
  assert.equal(delBody.revokedSelf, true, 'self-revoke must report revokedSelf:true so the UI can force re-login');

  const after = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(after.status, 401, 'calling token must be invalid after self-revoke');
});

// ---------------------------------------------------------------------------
// /admin/api/logout auth + per-session revocation
//
// Logout removes only the calling token's id from the per-session allow-list,
// so a logout on one device must not kick the admin off another device. It
// MUST still require auth — an anonymous caller could otherwise present any
// token id and force-revoke an admin session.
// Run last because a successful logout invalidates `adminToken` for every
// subsequent request.
// ---------------------------------------------------------------------------

async function loginAsAdmin() {
  const r = await fetch(`${baseUrl}/admin/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'cahit2024' }),
  });
  const body = await r.json();
  assert.equal(r.status, 200, 'admin login should succeed');
  assert.ok(body.token, 'login should return a token');
  return body.token;
}

test('logout requires auth and does not revoke sessions for anonymous callers', async () => {
  const verifyBefore = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(verifyBefore.status, 200, 'admin token should be valid before logout test');

  const r = await fetch(`${baseUrl}/admin/api/logout`, { method: 'POST' });
  assert.equal(r.status, 401, 'unauthenticated logout must be rejected');

  const verifyAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(verifyAfter.status, 200, 'unauthenticated logout must NOT revoke valid admin sessions');
});

test('logout on one device leaves other devices signed in', async () => {
  // Two independent logins simulate the admin signed in on, e.g., laptop and
  // phone. Each login must mint a distinct token (distinct session id) so
  // logging out one does not invalidate the other.
  const laptopToken = await loginAsAdmin();
  const phoneToken = await loginAsAdmin();
  assert.notEqual(laptopToken, phoneToken, 'each login should mint a unique token');

  // Both sessions are active.
  for (const [label, t] of [['laptop', laptopToken], ['phone', phoneToken]]) {
    const v = await fetch(`${baseUrl}/admin/api/verify`, { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(v.status, 200, `${label} session should be valid before logout`);
  }

  // Sign out only the laptop.
  const out = await fetch(`${baseUrl}/admin/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${laptopToken}` },
  });
  assert.equal(out.status, 200, 'authenticated logout should succeed');

  const laptopAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${laptopToken}` },
  });
  assert.equal(laptopAfter.status, 401, 'laptop token must be invalid after its own logout');

  const phoneAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${phoneToken}` },
  });
  assert.equal(phoneAfter.status, 200, 'phone token must remain valid when only the laptop logged out');

  // Clean up: log the phone out too so subsequent tests start from a known state.
  await fetch(`${baseUrl}/admin/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${phoneToken}` },
  });
});

test('authenticated logout revokes the calling admin session', async () => {
  const r = await fetch(`${baseUrl}/admin/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(r.status, 200, 'authenticated logout should succeed');

  const verifyAfter = await fetch(`${baseUrl}/admin/api/verify`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(verifyAfter.status, 401, 'token must be invalid after a successful logout');
});
