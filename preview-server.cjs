const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const dbPool = DB_URL ? new Pool({ connectionString: DB_URL, ssl: DB_URL.includes('sslmode=disable') ? false : { rejectUnauthorized: false } }) : null;

async function dbQuery(text, params) {
  if (!dbPool) return null;
  try { const r = await dbPool.query(text, params); return r; } catch (e) { console.error('DB error:', e.message); return null; }
}

async function dbGetSetting(key, fallback) {
  const r = await dbQuery('SELECT value FROM site_settings WHERE key = $1', [key]);
  return (r && r.rows.length > 0) ? r.rows[0].value : (fallback || '');
}

async function dbSetSetting(key, value) {
  await dbQuery('INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()', [key, value]);
}

async function dbGetKnowledgeEntries() {
  const r = await dbQuery('SELECT id, title, content FROM chatbot_knowledge ORDER BY sort_order, id');
  return r ? r.rows : [];
}

async function dbSaveKnowledgeEntries(entries) {
  await dbQuery('DELETE FROM chatbot_knowledge');
  for (let i = 0; i < entries.length; i++) {
    await dbQuery('INSERT INTO chatbot_knowledge (title, content, sort_order) VALUES ($1, $2, $3)', [entries[i].title || '', entries[i].content || '', i]);
  }
}

async function dbSaveLead(lead) {
  const r = await dbQuery('INSERT INTO leads (name, email, phone, service_type, details, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [lead.name, lead.email, lead.phone || '', lead.service_type || '', lead.details || '', 'new']);
  return r ? r.rows[0] : lead;
}

async function dbGetLeads() {
  const r = await dbQuery('SELECT * FROM leads ORDER BY created_at DESC');
  return r ? r.rows : [];
}

const app = express();
const PORT = 5000;

// ===== SEO =====
const SITE_URL = process.env.SITE_URL || 'https://cahitcontracting.com';
const DEFAULT_OG_IMAGE = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png';

const SEO_PAGES = {
  '/': {
    title: 'Marine & Coastal Construction Company in Oman | Cahit Trading & Contracting LLC',
    description: 'Cahit Trading & Contracting LLC — leading marine and coastal construction company in Oman. Breakwaters, quay walls, dredging, dewatering, civil infrastructure and MEP across the Sultanate of Oman. Based in Muscat since 2009.'
  },
  '/about': {
    title: 'About Us | Marine Construction Contractor in Oman | Cahit Contracting',
    description: 'Learn about Cahit Trading & Contracting LLC — a marine and coastal construction company headquartered in Muscat, Oman, delivering infrastructure projects across the Sultanate since 2009.'
  },
  '/services': {
    title: 'Marine & Coastal Construction Services in Oman | Breakwaters, Dredging, Dewatering',
    description: 'Marine construction, coastal protection, dredging, earthworks, dewatering, civil infrastructure and MEP services across Oman. Request a quote from Cahit Trading & Contracting LLC.'
  },
  '/projects': {
    title: 'Marine & Civil Construction Projects in Oman | Cahit Contracting Portfolio',
    description: 'Selected marine, coastal and civil construction projects delivered by Cahit Trading & Contracting across the Sultanate of Oman — breakwaters, quay walls, dredging and infrastructure.'
  },
  '/clients': {
    title: 'Our Clients | Cahit Trading & Contracting LLC – Oman',
    description: 'Trusted by leading government bodies, oil & gas operators and developers across Oman for marine, coastal and civil construction.'
  },
  '/blog': {
    title: 'Insights on Marine & Coastal Construction in Oman | Cahit Blog',
    description: 'Articles, case studies and insights on marine, coastal and civil construction in the Sultanate of Oman from Cahit Trading & Contracting LLC.'
  },
  '/careers': {
    title: 'Careers at Cahit Trading & Contracting | Construction Jobs in Oman',
    description: 'Join Cahit Contracting — explore engineering and construction career opportunities in Muscat and across the Sultanate of Oman.'
  }
};

function escSeo(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildJsonLd(route) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': SITE_URL + '/#organization',
    name: 'Cahit Trading & Contracting LLC',
    alternateName: 'Cahit Contracting',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description: 'Marine and coastal construction company in Oman specialising in breakwaters, quay walls, dredging, dewatering, civil infrastructure and MEP.',
    foundingDate: '2009',
    telephone: '+968 24062411',
    email: 'ctc@cahitcontracting.com',
    priceRange: '$$$',
    areaServed: [
      { '@type': 'Country', name: 'Oman' },
      { '@type': 'AdministrativeArea', name: 'Muscat Governorate' }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Khaleej Tower, 6th Floor No. 603, Ghala',
      addressLocality: 'Muscat',
      addressRegion: 'Muscat Governorate',
      postalCode: '',
      addressCountry: 'OM'
    },
    geo: { '@type': 'GeoCoordinates', latitude: 23.5859, longitude: 58.4059 },
    sameAs: [],
    knowsAbout: [
      'Marine construction', 'Coastal construction', 'Breakwater construction',
      'Quay wall construction', 'Dredging', 'Dewatering',
      'Civil infrastructure', 'Earthworks', 'MEP'
    ],
    serviceArea: { '@type': 'Country', name: 'Oman' }
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_URL + '/#website',
    url: SITE_URL,
    name: 'Cahit Trading & Contracting LLC',
    publisher: { '@id': SITE_URL + '/#organization' },
    inLanguage: ['en', 'ar']
  };

  const blocks = [org, website];

  // Breadcrumbs
  if (route && route !== '/') {
    const seg = route.split('/').filter(Boolean);
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }];
    let acc = '';
    seg.forEach((s, i) => {
      acc += '/' + s;
      crumbs.push({
        '@type': 'ListItem',
        position: i + 2,
        name: s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        item: SITE_URL + acc
      });
    });
    blocks.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs });
  }

  // Services list on /services
  if (route === '/services') {
    const services = [
      { name: 'Marine Construction', description: 'Breakwaters, quay walls, revetments and coastal protection in Oman.' },
      { name: 'Civil Infrastructure', description: 'Civil infrastructure development across the Sultanate of Oman.' },
      { name: 'Earthworks', description: 'Bulk excavation, grading, compaction and site preparation.' },
      { name: 'Dewatering', description: 'Site dewatering services for marine and civil projects in Oman.' },
      { name: 'MEP', description: 'Mechanical, electrical and plumbing for industrial and infrastructure projects.' }
    ];
    services.forEach(s => blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      description: s.description,
      provider: { '@id': SITE_URL + '/#organization' },
      areaServed: { '@type': 'Country', name: 'Oman' }
    }));
  }

  return blocks.map(b => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n');
}

function injectSeo(html, route, overrides) {
  const cfg = Object.assign({}, SEO_PAGES[route] || SEO_PAGES['/'], overrides || {});
  const title = escSeo(cfg.title);
  const desc = escSeo(cfg.description);
  const canonical = SITE_URL + route;
  const image = cfg.image || DEFAULT_OG_IMAGE;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + title + '</title>');
  // Replace meta description
  html = html.replace(/<meta\s+name="description"[^>]*>/i, '<meta name="description" content="' + desc + '">');
  // Replace canonical
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + canonical + '">');
  // Replace OG title/description/url
  html = html.replace(/<meta\s+property="og:title"[^>]*>/i, '<meta property="og:title" content="' + title + '">');
  html = html.replace(/<meta\s+property="og:description"[^>]*>/i, '<meta property="og:description" content="' + desc + '">');
  html = html.replace(/<meta\s+property="og:url"[^>]*>/i, '<meta property="og:url" content="' + canonical + '">');
  html = html.replace(/<meta\s+property="og:image"[^>]*>/i, '<meta property="og:image" content="' + image + '">');
  // Replace Twitter
  html = html.replace(/<meta\s+name="twitter:title"[^>]*>/i, '<meta name="twitter:title" content="' + title + '">');
  html = html.replace(/<meta\s+name="twitter:description"[^>]*>/i, '<meta name="twitter:description" content="' + desc + '">');
  html = html.replace(/<meta\s+name="twitter:image"[^>]*>/i, '<meta name="twitter:image" content="' + image + '">');
  // Replace hreflang
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="en"[^>]*>/i, '<link rel="alternate" hreflang="en" href="' + canonical + '">');
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="ar"[^>]*>/i, '<link rel="alternate" hreflang="ar" href="' + canonical + '">');
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="x-default"[^>]*>/i, '<link rel="alternate" hreflang="x-default" href="' + canonical + '">');

  // Inject JSON-LD just before </head>
  const ld = buildJsonLd(route);
  html = html.replace(/<\/head>/i, ld + '\n</head>');

  return html;
}
// ===== /SEO =====


const DATA_DIR = process.env.VERCEL ? '/tmp' : __dirname;
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin-credentials.json');
const BCRYPT_ROUNDS = 10;
const DEFAULT_ADMIN_PASSWORD = 'cahit2024';

function isBcryptHash(s) {
  return typeof s === 'string' && /^\$2[aby]?\$\d{2}\$/.test(s);
}
function hashPassword(plain) {
  return bcrypt.hashSync(String(plain), BCRYPT_ROUNDS);
}
function verifyPassword(plain, stored) {
  if (!stored || typeof plain !== 'string') return false;
  if (isBcryptHash(stored)) {
    try { return bcrypt.compareSync(plain, stored); } catch (e) { return false; }
  }
  return plain === stored;
}

function loadCredentials() {
  let raw = null;
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      raw = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    }
  } catch (e) {}
  if (!raw || typeof raw !== 'object') raw = {};
  const username = raw.username || 'admin';
  let passwordHash = raw.passwordHash;
  // Migrate legacy plaintext password field on read.
  if (!passwordHash && raw.password) {
    passwordHash = isBcryptHash(raw.password) ? raw.password : hashPassword(raw.password);
    saveCredentials({ username, passwordHash });
  }
  if (!passwordHash) {
    passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
  }
  return { username, passwordHash };
}
function saveCredentials(creds) {
  try {
    const out = { username: creds.username, passwordHash: creds.passwordHash };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(out, null, 2));
  } catch (e) {}
}
const TOKEN_SECRET_FILE = path.join(DATA_DIR, 'admin-token-secret.json');
function loadOrCreateTokenSecret() {
  const envSecret = process.env.SESSION_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    return envSecret;
  }
  if (envSecret && envSecret.trim().length > 0) {
    console.error('[admin-auth] SESSION_SECRET is set but too short (need >= 16 chars). Refusing to start.');
    process.exit(1);
  }
  try {
    if (fs.existsSync(TOKEN_SECRET_FILE)) {
      const j = JSON.parse(fs.readFileSync(TOKEN_SECRET_FILE, 'utf8'));
      if (j && typeof j.secret === 'string' && j.secret.length >= 32) {
        return j.secret;
      }
    }
  } catch (e) {}
  const generated = crypto.randomBytes(48).toString('hex');
  try {
    fs.writeFileSync(TOKEN_SECRET_FILE, JSON.stringify({ secret: generated }, null, 2), { mode: 0o600 });
    try { fs.chmodSync(TOKEN_SECRET_FILE, 0o600); } catch (e) {}
    console.warn('[admin-auth] SESSION_SECRET not set; generated and persisted a random secret to ' + TOKEN_SECRET_FILE + '. Set SESSION_SECRET in the environment for production deployments.');
  } catch (e) {
    console.error('[admin-auth] SESSION_SECRET not set and unable to persist a generated secret (' + e.message + '). Refusing to start; please set SESSION_SECRET in the environment.');
    process.exit(1);
  }
  return generated;
}
const TOKEN_SECRET = loadOrCreateTokenSecret();
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days max lifetime
const TOKEN_VERSION_FILE = path.join(DATA_DIR, 'admin-token-version.json');
const TOKEN_SESSIONS_FILE = path.join(DATA_DIR, 'admin-sessions.json');

// Token revocation has two layers:
//
//   1. A monotonically increasing "version" number (per-installation). Every
//      issued token embeds the version current at issue time; bumping the
//      version invalidates every previously-issued token at once. Used by
//      change-credentials so a password change kicks every device off.
//
//   2. A per-token allow-list ("sessions") keyed by a random token id embedded
//      in each token. Logout removes only the calling token's id from the
//      allow-list, leaving sessions on other devices intact. Sessions are
//      persisted (DB when available, JSON file fallback) so revocation
//      survives restarts; expired rows are pruned opportunistically.
let cachedTokenVersion = null;
function loadTokenVersionFromFile() {
  try {
    if (fs.existsSync(TOKEN_VERSION_FILE)) {
      const j = JSON.parse(fs.readFileSync(TOKEN_VERSION_FILE, 'utf8'));
      if (typeof j.version === 'number' && j.version >= 1) return j.version;
    }
  } catch (e) {}
  return 1;
}
function saveTokenVersionToFile(v) {
  try { fs.writeFileSync(TOKEN_VERSION_FILE, JSON.stringify({ version: v }, null, 2)); } catch (e) {}
}
async function getCurrentTokenVersion() {
  if (dbPool) {
    const v = await dbGetSetting('admin_token_version', null);
    const n = v == null ? NaN : parseInt(v, 10);
    if (Number.isFinite(n) && n >= 1) {
      cachedTokenVersion = n;
      return n;
    }
  }
  if (cachedTokenVersion == null) cachedTokenVersion = loadTokenVersionFromFile();
  return cachedTokenVersion;
}
async function bumpTokenVersion() {
  const cur = await getCurrentTokenVersion();
  const next = cur + 1;
  cachedTokenVersion = next;
  saveTokenVersionToFile(next);
  if (dbPool) await dbSetSetting('admin_token_version', String(next));
  return next;
}

// ---------- Per-token session allow-list ----------

function normalizeSessionEntry(v) {
  // Backwards compat: legacy entries were a bare expires-ms number.
  if (Number.isFinite(v)) return { expiresMs: v };
  if (v && typeof v === 'object') return v;
  return null;
}
function loadSessionsFromFile() {
  try {
    if (fs.existsSync(TOKEN_SESSIONS_FILE)) {
      const j = JSON.parse(fs.readFileSync(TOKEN_SESSIONS_FILE, 'utf8'));
      if (j && typeof j.sessions === 'object' && j.sessions) return j.sessions;
    }
  } catch (e) {}
  return {};
}
function saveSessionsToFile(sessions) {
  try { fs.writeFileSync(TOKEN_SESSIONS_FILE, JSON.stringify({ sessions }, null, 2)); } catch (e) {}
}

function clientIpFromReq(req) {
  if (!req) return '';
  const fwd = (req.headers && req.headers['x-forwarded-for']) || '';
  if (fwd) return String(fwd).split(',')[0].trim();
  return (req.ip || (req.connection && req.connection.remoteAddress) || '').toString();
}
function clientUaFromReq(req) {
  if (!req || !req.headers) return '';
  return String(req.headers['user-agent'] || '').slice(0, 500);
}

async function pruneExpiredSessions() {
  const now = Date.now();
  if (dbPool) {
    await dbQuery('DELETE FROM admin_sessions WHERE expires_at < $1', [new Date(now)]);
    return;
  }
  const sessions = loadSessionsFromFile();
  let changed = false;
  for (const id of Object.keys(sessions)) {
    const e = normalizeSessionEntry(sessions[id]);
    if (!e || !Number.isFinite(e.expiresMs) || e.expiresMs < now) {
      delete sessions[id];
      changed = true;
    }
  }
  if (changed) saveSessionsToFile(sessions);
}

async function recordAdminSession(tokenId, username, expiresMs, req) {
  const ip = clientIpFromReq(req);
  const ua = clientUaFromReq(req);
  const now = Date.now();
  if (dbPool) {
    await dbQuery(
      'INSERT INTO admin_sessions (token_id, username, expires_at, last_seen_at, last_ip, last_user_agent, created_ip, created_user_agent) ' +
      'VALUES ($1, $2, $3, NOW(), $4, $5, $4, $5) ' +
      'ON CONFLICT (token_id) DO UPDATE SET username = $2, expires_at = $3, last_seen_at = NOW(), last_ip = $4, last_user_agent = $5',
      [tokenId, username, new Date(expiresMs), ip, ua]
    );
    return;
  }
  const sessions = loadSessionsFromFile();
  const prev = normalizeSessionEntry(sessions[tokenId]) || {};
  sessions[tokenId] = {
    expiresMs: expiresMs,
    username: username,
    createdAt: prev.createdAt || now,
    createdIp: prev.createdIp || ip,
    createdUa: prev.createdUa || ua,
    lastSeenAt: now,
    lastIp: ip,
    lastUa: ua
  };
  saveSessionsToFile(sessions);
}

async function touchAdminSession(tokenId, req) {
  if (!tokenId) return;
  const ip = clientIpFromReq(req);
  const ua = clientUaFromReq(req);
  if (dbPool) {
    try {
      await dbQuery(
        'UPDATE admin_sessions SET last_seen_at = NOW(), last_ip = $2, last_user_agent = $3 WHERE token_id = $1',
        [tokenId, ip, ua]
      );
    } catch (e) {}
    return;
  }
  const sessions = loadSessionsFromFile();
  const e = normalizeSessionEntry(sessions[tokenId]);
  if (!e) return;
  e.lastSeenAt = Date.now();
  if (ip) e.lastIp = ip;
  if (ua) e.lastUa = ua;
  sessions[tokenId] = e;
  saveSessionsToFile(sessions);
}

async function isSessionActive(tokenId, expiresMs) {
  if (Date.now() > expiresMs) return false;
  if (dbPool) {
    const r = await dbQuery(
      'SELECT 1 FROM admin_sessions WHERE token_id = $1 AND expires_at > NOW()',
      [tokenId]
    );
    return !!(r && r.rows.length);
  }
  const sessions = loadSessionsFromFile();
  const e = normalizeSessionEntry(sessions[tokenId]);
  return !!(e && Number.isFinite(e.expiresMs) && e.expiresMs > Date.now());
}

async function revokeAdminSession(tokenId) {
  if (dbPool) {
    await dbQuery('DELETE FROM admin_sessions WHERE token_id = $1', [tokenId]);
    return;
  }
  const sessions = loadSessionsFromFile();
  if (sessions[tokenId] != null) {
    delete sessions[tokenId];
    saveSessionsToFile(sessions);
  }
}

async function listAdminSessions() {
  if (dbPool) {
    const r = await dbQuery(
      'SELECT token_id, username, created_at, expires_at, last_seen_at, last_ip, last_user_agent, created_ip, created_user_agent ' +
      'FROM admin_sessions WHERE expires_at > NOW() ORDER BY last_seen_at DESC NULLS LAST, created_at DESC',
      []
    );
    return (r.rows || []).map(function(row) {
      return {
        tokenId: row.token_id,
        username: row.username || '',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
        lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).toISOString() : null,
        lastIp: row.last_ip || '',
        lastUserAgent: row.last_user_agent || '',
        createdIp: row.created_ip || '',
        createdUserAgent: row.created_user_agent || ''
      };
    });
  }
  const now = Date.now();
  const sessions = loadSessionsFromFile();
  const out = [];
  for (const id of Object.keys(sessions)) {
    const e = normalizeSessionEntry(sessions[id]);
    if (!e || !Number.isFinite(e.expiresMs) || e.expiresMs < now) continue;
    out.push({
      tokenId: id,
      username: e.username || '',
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
      expiresAt: new Date(e.expiresMs).toISOString(),
      lastSeenAt: e.lastSeenAt ? new Date(e.lastSeenAt).toISOString() : null,
      lastIp: e.lastIp || '',
      lastUserAgent: e.lastUa || '',
      createdIp: e.createdIp || '',
      createdUserAgent: e.createdUa || ''
    });
  }
  out.sort(function(a, b) {
    const av = a.lastSeenAt || a.createdAt || '';
    const bv = b.lastSeenAt || b.createdAt || '';
    return bv.localeCompare(av);
  });
  return out;
}

function newTokenId() {
  return crypto.randomBytes(16).toString('hex');
}

function createAdminToken(username, version, tokenId) {
  const issued = Date.now();
  const expires = issued + TOKEN_TTL_MS;
  const payload = [username, issued, expires, version, tokenId].join('|');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return { token: Buffer.from(payload + '|' + sig).toString('base64'), tokenId, expires };
}
function decodeAdminToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('|');
    // Expected fields: username, issued, expires, version, tokenId, sig (>= 6 parts)
    if (parts.length < 6) return null;
    const sig = parts.pop();
    const payload = parts.join('|');
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const tokenId = parts[parts.length - 1];
    const version = parseInt(parts[parts.length - 2], 10);
    const expires = parseInt(parts[parts.length - 3], 10);
    const issued = parseInt(parts[parts.length - 4], 10);
    const username = parts.slice(0, parts.length - 4).join('|');
    if (!Number.isFinite(issued) || !Number.isFinite(expires) || !Number.isFinite(version)) return null;
    if (!tokenId) return null;
    return { username, issued, expires, version, tokenId };
  } catch (e) { return null; }
}
async function verifyAdminToken(token) {
  const data = decodeAdminToken(token);
  if (!data) return false;
  if (Date.now() > data.expires) return false;
  const cur = await getCurrentTokenVersion();
  if (data.version !== cur) return false;
  if (!(await isSessionActive(data.tokenId, data.expires))) return false;
  return data;
}
function decodeAdminTokenFromHeader(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  return token ? decodeAdminToken(token) : null;
}

// Auth guard for admin API routes. Every /admin/api/* route should be guarded
// with this middleware EXCEPT:
//   - POST /admin/api/login         (used to obtain a token)
//   - POST /admin/api/leads         (public lead submission from the site forms)
// /admin/api/logout MUST be guarded — without it, any anonymous caller could
// pass a stolen/guessed token id and force-revoke an admin session.
async function requireAdminAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = await verifyAdminToken(token);
  if (!data) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.adminToken = data;
  // Best-effort: keep the per-session "last seen" / IP / user-agent fresh so
  // the Active Sessions panel shows useful info. Don't await — failures here
  // must not break the request.
  touchAdminSession(data.tokenId, req).catch(function() {});
  next();
}

const THEME_DIR = path.join(__dirname, 'wp-theme', 'cahit-theme');
const BASE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/';

function readThemeFile(filename) {
  const filePath = path.join(THEME_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function executePhpTemplate(phpContent, currentPage) {
  let base_url = BASE_URL;

  let logos = [
    { name: 'Doosan Heavy Industries & Construction', file: 'cxoRXpdmBqwcLedo.png' },
    { name: 'Al Jazeera International Group', file: 'qFCAQxxNiSjFqwyq.png' },
    { name: 'Al-Hashemi & Al-Rawas Trading & Contracting', file: 'KXeFROoDmbydRpuQ.png' },
    { name: 'Fisia Italimpianti', file: 'NhkgkgOdoRAutEDK.png' },
    { name: 'GPS In The New Millennium', file: 'ssANHVRFYXALYoKI.png' },
    { name: 'Makyol', file: 'IqZMAjrvgmDdBJaW.png' },
    { name: 'Omran', file: 'cCzhlyOLGOdtqfjD.jpg' },
    { name: 'Salalah Sanitary Drainage Services', file: 'eGXMGushzTuSHdCj.png' },
    { name: 'SNC-Lavalin', file: 'dIjoxYdtJmpPvEZG.png' },
    { name: 'STFA', file: 'MrphYkzHpiuuKwNm.png' },
    { name: 'TAV Construction', file: 'fOxkXRAGOOnYlnkI.png' },
  ];

  let rolling_images = [
    { src: 'gvWLawWCNocSINuR.jpeg', alt: 'Road construction with heavy rollers' },
    { src: 'GjfldJYeoGyqGIMR.jpeg', alt: 'Asphalt paving with Vogele machine' },
    { src: 'mejIiORMfOESXWxO.jpeg', alt: 'Road line marking operations' },
    { src: 'jdGZtMFCClzefYrV.png', alt: 'Underground pipe installation' },
  ];

  let services = [
    { id: 'marine', name: 'Marine & Coastal Construction', image: 'EGRSgZmJXJSrWKJY.png', desc: 'Design and construction of marine infrastructure including breakwaters, quay walls, revetments, dredging, and coastal protection systems.' },
    { id: 'infrastructure', name: 'Infrastructure Development', image: 'gvWLawWCNocSINuR.jpeg', desc: 'Civil infrastructure development including utilities, industrial facilities, and integrated project delivery solutions.' },
    { id: 'earthworks', name: 'Earthworks', image: 'hMZPCXiHvRhErvHk.gif', desc: 'Bulk excavation, grading, compaction, and large-scale site preparation using modern heavy equipment.' },
    { id: 'dewatering', name: 'Dewatering & Shoring', image: 'NHQbvhqluSlDGrrN.png', desc: 'Advanced groundwater control systems and structural support solutions ensuring safe and stable construction environments.' },
    { id: 'mep', name: 'MEP Works', image: 'qZRtUjMizSFySgTf.png', desc: 'Mechanical, electrical and plumbing systems supporting industrial facilities, infrastructure and utility projects.' },
    { id: 'general', name: 'General Construction', image: '/assets/images/general-construction.jpg', localImage: true, desc: 'Comprehensive residential, commercial, and industrial building solutions. Skilled workforce with modern equipment and proven expertise. Commitment to safety, quality, and on-time delivery. Renovation, remodeling, and project management services.' },
  ];

  let capabilities = [
    'Sea Harbors', 'Breakwaters and Groynes', 'Coastal Protection Systems', 'Rock Armour Installation',
    'Geotextile Protection', 'Beach Reclamation', 'Dredging', 'Underwater Excavation',
    'Boat Ramps and Pontoons', 'Quay Wall Construction',
  ];

  let html = phpContent;

  html = html.replace(/<\?php\s+get_header\(\);\s*\?>/g, () => {
    return processPhpSimple(readThemeFile('header.php'), currentPage);
  });

  html = html.replace(/<\?php\s+get_footer\(\);\s*\?>/g, () => {
    return processPhpSimple(readThemeFile('footer.php'), currentPage);
  });

  // Remove $base_url definition line
  html = html.replace(/<\?php\s+\$base_url\s*=\s*'[^']*';\s*\?>/g, '');

  html = processPhpSimple(html, currentPage);

  // Execute PHP loops for front-page logos marquee
  html = html.replace(/<\?php\s+\$logos\s*=\s*array[\s\S]*?endfor;[\s\S]*?\?>/g, () => {
    let result = '';
    for (let repeat = 0; repeat < 2; repeat++) {
      logos.forEach((logo, idx) => {
        result += `<div class="marquee-logo-card" data-testid="img-logo-${(repeat * logos.length) + idx}">
          <img src="${base_url}${logo.file}" alt="${logo.name}" class="marquee-logo-img" />
        </div>\n`;
      });
    }
    return result;
  });

  // Execute PHP loops for rolling images
  html = html.replace(/<\?php\s+\$rolling_images[\s\S]*?endforeach;\s*\?>/g, () => {
    let result = '';
    rolling_images.forEach((img, idx) => {
      result += `<div class="rolling-image-item ${idx === 0 ? 'active' : ''}" data-rolling-index="${idx}">
        <img src="${base_url}${img.src}" alt="${img.alt}" />
      </div>\n`;
    });
    return result;
  });

  // Execute PHP loops for services
  html = html.replace(/<\?php\s+\$services\s*=\s*array[\s\S]*?endforeach;\s*\?>/g, () => {
    let result = '';
    services.forEach(service => {
      result += `<div class="service-card" data-testid="card-service-${service.id}">
        <div class="service-card-image">
          <img src="${service.localImage ? service.image : base_url + service.image}" alt="${service.name}" />
        </div>
        <div class="service-card-body">
          <h3 class="service-card-title">${service.name}</h3>
          <p class="service-card-desc">${service.desc}</p>
          <a href="/services" class="service-card-link">
            Learn More
            <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>\n`;
    });
    return result;
  });

  // Execute PHP loops for marine capabilities
  html = html.replace(/<\?php\s+\$capabilities\s*=\s*array[\s\S]*?endforeach;\s*\?>/g, () => {
    let result = '';
    capabilities.forEach(cap => {
      result += `<div class="marine-pill">
        <svg class="marine-pill-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
        <p class="marine-pill-text">${cap}</p>
      </div>\n`;
    });
    return result;
  });

  // Handle WP_Query blog loop: keep only the else (fallback) block for preview
  html = html.replace(/<\?php\s+\$blog_query[\s\S]*?if\s*\(\$blog_query->have_posts\(\)\)[\s\S]*?\?>\s*([\s\S]*?)<\?php\s+wp_reset_postdata[\s\S]*?\?>\s*<\?php\s+else\s*:\s*\?>\s*([\s\S]*?)<\?php\s+endif;\s*\?>/g, '$2');

  // Handle generic WordPress conditionals: have_posts/the_post loops
  html = html.replace(/<\?php\s+if\s*\(have_posts\(\)\)\s*:\s*\?>([\s\S]*?)<\?php\s+else\s*:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '$2');
  html = html.replace(/<\?php\s+while\s*\(have_posts\(\)\)\s*:\s*the_post\(\);\s*\?>([\s\S]*?)<\?php\s+endwhile;\s*\?>/g, '$1');

  // Handle comments_open blocks
  html = html.replace(/<\?php\s+if\s*\(comments_open\(\)[\s\S]*?\)[\s\S]*?\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '');

  // Handle has_post_thumbnail conditionals
  html = html.replace(/<\?php\s+if\s*\(has_post_thumbnail\(\)\)\s*:\s*\?>([\s\S]*?)<\?php\s+else\s*:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '$2');
  html = html.replace(/<\?php\s+if\s*\(has_post_thumbnail\(\)\)\s*:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '');

  // Handle prev/next post nav
  html = html.replace(/<\?php\s+\$prev_post[\s\S]*?endif;\s*\?>/g, '');
  html = html.replace(/<\?php\s+\$next_post[\s\S]*?endif;\s*\?>/g, '');

  // Handle post_password_required
  html = html.replace(/<\?php\s+if\s*\(post_password_required\(\)\)\s*return;\s*\?>/g, '');

  // Handle have_comments conditionals
  html = html.replace(/<\?php\s+if\s*\(have_comments\(\)\)\s*:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '');

  // Handle comment_form
  html = html.replace(/<\?php\s+comment_form\([\s\S]*?\);\s*\?>/g, '');

  // Handle the_archive_title / the_archive_description
  html = html.replace(/<\?php\s+the_archive_title\(\);\s*\?>/g, 'Archive');
  html = html.replace(/<\?php\s+the_archive_description\('[^']*',\s*'[^']*'\);\s*\?>/g, '');

  // Handle wp_list_comments
  html = html.replace(/<\?php\s+wp_list_comments[\s\S]*?\?>/g, '');
  html = html.replace(/<\?php\s+the_comments_navigation\(\);\s*\?>/g, '');

  // Handle paginate_links / the_posts_pagination
  html = html.replace(/<\?php[\s\S]*?paginate_links[\s\S]*?\?>/g, '');
  html = html.replace(/<\?php[\s\S]*?the_posts_pagination[\s\S]*?\?>/g, '');

  // Handle the_title, the_content, the_date, the_author etc
  html = html.replace(/<\?php\s+the_title\(\);\s*\?>/g, 'Page Title');
  html = html.replace(/<\?php\s+the_title_attribute\(\);\s*\?>/g, 'Page Title');
  html = html.replace(/<\?php\s+the_content\(\);\s*\?>/g, '<p>Page content goes here.</p>');
  html = html.replace(/<\?php\s+the_permalink\(\);\s*\?>/g, '#');
  html = html.replace(/<\?php\s+the_ID\(\);\s*\?>/g, '0');
  html = html.replace(/<\?php\s+echo\s+esc_html\(get_the_date\(\)\);\s*\?>/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  html = html.replace(/<\?php\s+echo\s+esc_html\(get_the_excerpt\(\)\);\s*\?>/g, 'Excerpt text here.');
  html = html.replace(/<\?php\s+the_author\(\);\s*\?>/g, 'Admin');
  html = html.replace(/<\?php\s+the_post_thumbnail\([^)]*\);\s*\?>/g, '');

  // Handle is_active_sidebar
  html = html.replace(/<\?php\s+if\s*\(is_active_sidebar[\s\S]*?\)[\s\S]*?\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, '');
  html = html.replace(/<\?php\s+dynamic_sidebar[\s\S]*?\?>/g, '');

  // Handle wp_body_open
  html = html.replace(/<\?php\s+if\s*\(function_exists\('wp_body_open'\)\)\s*\{\s*wp_body_open\(\);\s*\}\s*\?>/g, '');

  // Handle _n, _e, __ translation functions
  html = html.replace(/<\?php\s+_e\('([^']*)',\s*'cahit-theme'\);\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+__\('([^']*)',\s*'cahit-theme'\);\s*\?>/g, '$1');

  // Clean up remaining PHP blocks  
  html = html.replace(/<\?php[\s\S]*?\?>/g, '');

  return html;
}

function processPhpSimple(content, currentPage) {
  let html = content;

  html = html.replace(/<\?php\s+language_attributes\(\);\s*\?>/g, 'lang="en"');
  html = html.replace(/<\?php\s+bloginfo\('charset'\);\s*\?>/g, 'UTF-8');
  html = html.replace(/<\?php\s+wp_head\(\);\s*\?>/g, `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/theme.css">
  `);
  html = html.replace(/<\?php\s+wp_footer\(\);\s*\?>/g, `
    <script>var cahitData = { ajaxUrl: '/api/ajax', themeUrl: '', nonce: 'preview' };</script>
    <script src="/assets/js/theme.js"></script>
    <script src="/assets/js/chatbot.js"></script>
  `);
  html = html.replace(/<\?php\s+body_class\(\);\s*\?>/g, `class="page-${currentPage}"`);

  // URL replacements
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/'\)\);\s*\?>/g, '/');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/about'\)\);\s*\?>/g, '/about');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/services'\)\);\s*\?>/g, '/services');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/projects'\)\);\s*\?>/g, '/projects');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/clients'\)\);\s*\?>/g, '/clients');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/blog'\)\);\s*\?>/g, '/blog');
  html = html.replace(/<\?php\s+echo\s+esc_url\(home_url\('\/careers'\)\);\s*\?>/g, '/careers');
  html = html.replace(/<\?php\s+echo\s+home_url\('\/services'\);\s*\?>/g, '/services');
  html = html.replace(/<\?php\s+echo\s+home_url\('\/about'\);\s*\?>/g, '/about');
  html = html.replace(/<\?php\s+echo\s+home_url\('\/projects'\);\s*\?>/g, '/projects');
  html = html.replace(/<\?php\s+echo\s+home_url\('\/'\);\s*\?>/g, '/');

  // Template directory URI -> serve from /assets
  html = html.replace(/<\?php\s+echo\s+esc_url\(get_template_directory_uri\(\)\);\s*\?>/g, '');
  html = html.replace(/<\?php\s+echo\s+get_template_directory_uri\(\);\s*\?>/g, '');

  // Base URL variable
  html = html.replace(/<\?php\s+echo\s+\$base_url;\s*\?>/g, BASE_URL);

  // WordPress function calls used in footer/header
  html = html.replace(/<\?php\s+echo\s+date\('Y'\);\s*\?>/g, new Date().getFullYear().toString());
  html = html.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_html\(get_theme_mod\('cahit_company_name',\s*'([^']*)'\)\)\s*:\s*'[^']*';\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_html__\('([^']*)',\s*'cahit-theme'\)\s*:\s*'[^']*';\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_html\(get_theme_mod\('cahit_tagline',\s*'([^']*)'\)\)\s*:\s*'[^']*';\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_url\(wp_login_url\(home_url\('\/admin'\)\)\)\s*:\s*'([^']*)';\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_url\(home_url\('\/'\)\)\s*:\s*'[^']*';\s*\?>/g, '/');
  html = html.replace(/<\?php\s+esc_html_e\('([^']*)',\s*'cahit-theme'\);\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+esc_attr_e\('([^']*)',\s*'cahit-theme'\);\s*\?>/g, '$1');
  html = html.replace(/<\?php\s+echo\s+esc_html\(date_i18n\('[^']*'\)\);\s*\?>/g, () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  html = html.replace(/<\?php\s+echo\s+esc_html\(date_i18n\('[^']*',\s*strtotime\('([^']*)'\)\)\);\s*\?>/g, (match, offset) => {
    const d = new Date();
    const months = parseInt(offset.replace(/[^-\d]/g, '')) || 0;
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  html = html.replace(/<\?php\s+printf\(esc_html__\('([^']*)',\s*'cahit-theme'\),\s*'<span>'\s*\.\s*get_search_query\(\)\s*\.\s*'<\/span>'\);\s*\?>/g, '$1');

  // Active nav links
  const activeChecks = {
    home: 'is_front_page\\(\\)',
    about: "is_page\\('about'\\)",
    services: "is_page\\('services'\\)",
    projects: "is_page\\('projects'\\)",
    clients: "is_page\\('clients'\\)",
    blog: "is_page\\('blog'\\)\\s*\\|\\|\\s*is_home\\(\\)",
    careers: "is_page\\('careers'\\)",
  };

  for (const [page, regex] of Object.entries(activeChecks)) {
    const isActive = currentPage === page;
    const pattern = new RegExp(`<\\?php\\s+if\\s*\\(${regex}\\)\\s+echo\\s+'\\s*active';\\s*\\?>`, 'g');
    html = html.replace(pattern, isActive ? ' active' : '');
  }

  return html;
}

// Serve theme assets
app.use('/assets', express.static(path.join(THEME_DIR, 'assets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function parseMultipart(req) {
  return new Promise((resolve) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        const fields = {};
        const boundary = req.headers['content-type'].split('boundary=')[1];
        if (boundary) {
          const parts = body.split('--' + boundary);
          parts.forEach(part => {
            const match = part.match(/name="([^"]+)"\r?\n\r?\n([\s\S]*?)(?:\r?\n--|\r?\n$)/);
            if (match) fields[match[1]] = match[2].trim();
          });
        }
        resolve(fields);
      });
    } else {
      resolve(req.body || {});
    }
  });
}

const leadsStore = [];

function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendLeadEmail(lead) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log('SMTP not configured — skipping email notification for lead:', lead.name);
    return;
  }
  const subject = `New Lead: ${lead.name} — ${lead.service_type || 'General Inquiry'}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0A3D6B;color:#fff;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="margin:0">New Contact Form Submission</h2>
        <p style="margin:5px 0 0;opacity:0.8">Cahit Trading & Contracting LLC</p>
      </div>
      <div style="padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B;width:120px">Name:</td><td style="padding:8px 0">${lead.name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B">Email:</td><td style="padding:8px 0"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B">Phone:</td><td style="padding:8px 0">${lead.phone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B">Service:</td><td style="padding:8px 0">${lead.service_type || 'Not specified'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B">Details:</td><td style="padding:8px 0">${lead.details || 'No additional details'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#0A3D6B">Date:</td><td style="padding:8px 0">${lead.created_at}</td></tr>
        </table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0">
        <p style="color:#64748b;font-size:13px;margin:0">This lead was submitted via the Cahit website contact form.</p>
      </div>
    </div>`;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await transporter.sendMail({
      from: `"Cahit Website" <${fromEmail}>`,
      to: 'ctc@cahitcontracting.com',
      subject,
      html
    });
    console.log('Lead email sent to ctc@cahitcontracting.com for:', lead.name);
  } catch (err) {
    console.error('Failed to send lead email:', err.message);
  }
}

app.post('/api/track', express.json(), async (req, res) => {
  try {
    if (!dbPool) return res.json({ ok: true });
    const page = (req.body.page || req.path || '/').substring(0, 500);
    const referrer = (req.body.referrer || req.headers.referer || '').substring(0, 1000);
    const ua = (req.headers['user-agent'] || '').substring(0, 500);
    const sessionId = (req.body.sid || '').substring(0, 100);
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim().substring(0, 100);
    await dbQuery('INSERT INTO page_views (page, referrer, user_agent, session_id, ip) VALUES ($1, $2, $3, $4, $5)', [page, referrer, ua, sessionId, ip]);
    res.json({ ok: true });
  } catch (e) { res.json({ ok: true }); }
});

app.get('/admin/api/analytics', requireAdminAuth, async (req, res) => {
  try {
    if (!dbPool) return res.json({ success: true, data: {} });

    const totalR = await dbQuery("SELECT COUNT(*) as cnt FROM page_views");
    const totalViews = totalR && totalR.rows.length ? parseInt(totalR.rows[0].cnt) : 0;

    const uniqueR = await dbQuery("SELECT COUNT(DISTINCT session_id) as cnt FROM page_views WHERE session_id != ''");
    const uniqueVisitors = uniqueR && uniqueR.rows.length ? parseInt(uniqueR.rows[0].cnt) : 0;

    const todayR = await dbQuery("SELECT COUNT(*) as cnt FROM page_views WHERE created_at >= CURRENT_DATE");
    const todayViews = todayR && todayR.rows.length ? parseInt(todayR.rows[0].cnt) : 0;

    const yesterdayR = await dbQuery("SELECT COUNT(*) as cnt FROM page_views WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE");
    const yesterdayViews = yesterdayR && yesterdayR.rows.length ? parseInt(yesterdayR.rows[0].cnt) : 0;

    const thisMonthR = await dbQuery("SELECT COUNT(*) as cnt FROM page_views WHERE created_at >= date_trunc('month', CURRENT_DATE)");
    const thisMonthViews = thisMonthR && thisMonthR.rows.length ? parseInt(thisMonthR.rows[0].cnt) : 0;

    const lastMonthR = await dbQuery("SELECT COUNT(*) as cnt FROM page_views WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)");
    const lastMonthViews = lastMonthR && lastMonthR.rows.length ? parseInt(lastMonthR.rows[0].cnt) : 0;

    const uniqueThisMonthR = await dbQuery("SELECT COUNT(DISTINCT session_id) as cnt FROM page_views WHERE session_id != '' AND created_at >= date_trunc('month', CURRENT_DATE)");
    const uniqueThisMonth = uniqueThisMonthR && uniqueThisMonthR.rows.length ? parseInt(uniqueThisMonthR.rows[0].cnt) : 0;

    const uniqueLastMonthR = await dbQuery("SELECT COUNT(DISTINCT session_id) as cnt FROM page_views WHERE session_id != '' AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)");
    const uniqueLastMonth = uniqueLastMonthR && uniqueLastMonthR.rows.length ? parseInt(uniqueLastMonthR.rows[0].cnt) : 0;

    const topPagesR = await dbQuery("SELECT page, COUNT(*) as views FROM page_views GROUP BY page ORDER BY views DESC LIMIT 10");
    const topPages = topPagesR && topPagesR.rows ? topPagesR.rows : [];

    const dailyR = await dbQuery("SELECT date_trunc('day', created_at)::date as day, COUNT(*) as views FROM page_views WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY day ORDER BY day");
    const dailyData = dailyR && dailyR.rows ? dailyR.rows : [];

    const monthlyR = await dbQuery("SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*) as views FROM page_views WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' GROUP BY month ORDER BY month");
    const monthlyData = monthlyR && monthlyR.rows ? monthlyR.rows : [];

    const referrerR = await dbQuery("SELECT CASE WHEN referrer = '' OR referrer IS NULL THEN 'Direct' WHEN referrer LIKE '%google%' THEN 'Google Search' WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn' WHEN referrer LIKE '%facebook%' THEN 'Facebook' WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'X / Twitter' WHEN referrer LIKE '%instagram%' THEN 'Instagram' ELSE 'Other Referral' END as source, COUNT(*) as visitors FROM page_views GROUP BY source ORDER BY visitors DESC LIMIT 10");
    const referrers = referrerR && referrerR.rows ? referrerR.rows : [];

    const recentR = await dbQuery("SELECT page, created_at, referrer, ip FROM page_views ORDER BY created_at DESC LIMIT 20");
    const recentViews = recentR && recentR.rows ? recentR.rows : [];

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        todayViews,
        yesterdayViews,
        thisMonthViews,
        lastMonthViews,
        uniqueThisMonth,
        uniqueLastMonth,
        topPages,
        dailyData,
        monthlyData,
        referrers,
        recentViews
      }
    });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/ajax', async (req, res) => {
  const fields = await parseMultipart(req);
  const action = fields.action || (req.body && req.body.action) || '';
  if (action === 'cahit_chat') {
    const message = fields.message || '';
    const chatSessionId = fields.sessionId || 'ajax_' + Date.now();
    if (!message) return res.json({ success: true, data: { reply: 'Please type a message.' } });
    const apiKey = await loadOpenAIKeyAsync();
    if (!apiKey) {
      return res.json({ success: true, data: { reply: 'Thank you for your message. Our team will get back to you soon. You can also reach us at ctc@cahitcontracting.com or call +968 2411 2406.' } });
    }
    try {
      if (!chatSessions[chatSessionId]) {
        chatSessions[chatSessionId] = [{ role: 'system', content: await buildSystemPrompt() }];
      }
      chatSessions[chatSessionId].push({ role: 'user', content: message });
      if (chatSessions[chatSessionId].length > 20) {
        chatSessions[chatSessionId] = [chatSessions[chatSessionId][0], ...chatSessions[chatSessionId].slice(-10)];
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: chatSessions[chatSessionId], max_tokens: 500, temperature: 0.7 })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices[0].message.content;
      chatSessions[chatSessionId].push({ role: 'assistant', content: reply });
      res.json({ success: true, data: { reply } });
    } catch (err) {
      console.error('Ajax chat error:', err.message || err);
      res.json({ success: true, data: { reply: 'Sorry, I\'m having trouble right now. Please contact us at ctc@cahitcontracting.com or call +968 2411 2406 Ext: 101.' } });
    }
  } else {
    if (fields.name || fields.email) {
      const lead = {
        id: leadsStore.length + 1,
        name: fields.name || '',
        email: fields.email || '',
        phone: fields.phone || '',
        service_type: fields.service_type || '',
        details: fields.details || '',
        status: 'new',
        created_at: new Date().toISOString().split('T')[0]
      };
      if (dbPool) {
        const saved = await dbSaveLead(lead);
        sendLeadEmail(saved || lead);
      } else {
        leadsStore.push(lead);
        sendLeadEmail(lead);
      }
    }
    res.json({ success: true, data: { id: leadsStore.length } });
  }
});

const OPENAI_KEY_FILE = path.join(DATA_DIR, 'openai-key.json');
let cachedApiKey = null;
async function loadOpenAIKeyAsync() {
  const envKey = process.env.OPENAI_API_KEY || process.env.SECRET_KEY || process.env.OPENAI_KEY || process.env.OPEN_AI_KEY || '';
  if (envKey) return envKey;
  if (cachedApiKey) return cachedApiKey;
  const dbKey = await dbGetSetting('openai_api_key');
  if (dbKey) { cachedApiKey = dbKey; return dbKey; }
  try {
    if (fs.existsSync(OPENAI_KEY_FILE)) {
      return JSON.parse(fs.readFileSync(OPENAI_KEY_FILE, 'utf8')).key || '';
    }
  } catch (e) {}
  return '';
}
function loadOpenAIKey() {
  const envKey = process.env.OPENAI_API_KEY || process.env.SECRET_KEY || process.env.OPENAI_KEY || process.env.OPEN_AI_KEY || '';
  if (envKey) return envKey;
  if (cachedApiKey) return cachedApiKey;
  try {
    if (fs.existsSync(OPENAI_KEY_FILE)) {
      return JSON.parse(fs.readFileSync(OPENAI_KEY_FILE, 'utf8')).key || '';
    }
  } catch (e) {}
  return '';
}

app.get('/api/chat-status', async (req, res) => {
  const key = await loadOpenAIKeyAsync();
  res.json({ hasKey: !!key, keySource: process.env.OPENAI_API_KEY ? 'env' : (key ? 'db' : 'none'), keyPreview: key ? key.substring(0, 7) + '...' : '' });
});
function saveOpenAIKey(key) {
  try { fs.writeFileSync(OPENAI_KEY_FILE, JSON.stringify({ key }, null, 2)); } catch (e) {}
}

app.post('/admin/api/save-openai-key', requireAdminAuth, express.json(), async (req, res) => {
  const { key, clear } = req.body || {};
  const trimmed = (key == null ? '' : String(key)).trim();
  // Refuse to silently wipe an existing key. Caller must pass `clear: true` to clear it.
  if (!trimmed && clear !== true) {
    return res.status(400).json({ success: false, message: 'Empty key. Pass {clear:true} to explicitly remove the stored key.' });
  }
  // Basic sanity check: OpenAI keys start with "sk-" and are at least ~20 chars.
  if (trimmed && (!/^sk-/.test(trimmed) || trimmed.length < 20)) {
    return res.status(400).json({ success: false, message: 'That does not look like a valid OpenAI API key (should start with "sk-" and be at least 20 characters).' });
  }
  saveOpenAIKey(trimmed);
  await dbSetSetting('openai_api_key', trimmed);
  cachedApiKey = trimmed || null;
  res.json({ success: true });
});

app.get('/admin/api/openai-key-status', requireAdminAuth, async (req, res) => {
  const key = await loadOpenAIKeyAsync();
  res.json({ success: true, hasKey: !!key, maskedKey: key ? 'sk-...' + key.slice(-4) : '' });
});

const CAHIT_BASE_PROMPT = `You are the Cahit Assistant, a helpful AI assistant for Cahit Trading & Contracting LLC, a marine and coastal construction company based in Oman.

Company Information:
- Full name: Cahit Trading & Contracting LLC
- Location: Khaleej Tower, 6th floor, No 603, Ghala, Muscat, Sultanate of Oman
- Phone: +968 2411 2406 Ext: 101, +968 9096 6562 (Oman)
- Email: ctc@cahitcontracting.com

Services:
1. Marine & Coastal Construction (sea harbors, breakwaters, groynes, revetments)
2. Infrastructure Development (utilities, roads, industrial facilities)
3. Earthworks (excavation, grading, leveling, compaction)
4. Dewatering & Shoring (wellpoint systems, deep wells, sheet piling, soldier walls)
5. MEP Works (water & wastewater treatment, pumping stations, industrial piping, irrigation)
6. General Construction (residential, commercial, industrial building solutions)

Be professional, helpful, and concise. If asked about pricing or specific project details, encourage the visitor to contact the team directly. Respond in the same language the user writes in (English or Arabic).`;

const KNOWLEDGE_FILE_PROJECT = path.join(__dirname, 'chatbot-knowledge.json');
const KNOWLEDGE_FILE_TMP = path.join('/tmp', 'chatbot-knowledge.json');
function loadKnowledge() {
  if (process.env.CHATBOT_KNOWLEDGE) {
    try { return JSON.parse(Buffer.from(process.env.CHATBOT_KNOWLEDGE, 'base64').toString('utf8')); } catch (e) {}
  }
  try {
    if (fs.existsSync(KNOWLEDGE_FILE_PROJECT)) {
      return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE_PROJECT, 'utf8'));
    }
  } catch (e) {}
  try {
    if (fs.existsSync(KNOWLEDGE_FILE_TMP)) {
      return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE_TMP, 'utf8'));
    }
  } catch (e) {}
  return { entries: [], personality: '', language: 'en', position: 'right' };
}
function saveKnowledge(data) {
  try { fs.writeFileSync(KNOWLEDGE_FILE_PROJECT, JSON.stringify(data, null, 2)); } catch (e) {}
  try { fs.writeFileSync(KNOWLEDGE_FILE_TMP, JSON.stringify(data, null, 2)); } catch (e) {}
}
async function buildSystemPrompt() {
  let prompt = CAHIT_BASE_PROMPT;
  let entries = [];
  let personality = '';
  let language = 'en';
  if (dbPool) {
    entries = await dbGetKnowledgeEntries();
    personality = await dbGetSetting('chatbot_personality', '');
    language = await dbGetSetting('chatbot_language', 'en');
  } else {
    const knowledge = loadKnowledge();
    entries = knowledge.entries || [];
    personality = knowledge.personality || '';
    language = knowledge.language || 'en';
  }
  if (entries.length > 0) {
    prompt += '\n\nAdditional Company Knowledge:';
    entries.forEach(function(e) {
      if (e.title || e.content) {
        prompt += '\n\n' + (e.title ? '## ' + e.title + '\n' : '') + (e.content || '');
      }
    });
  }
  if (personality) {
    prompt += '\n\nBehavior Instructions: ' + personality;
  }
  if (language === 'ar') {
    prompt += '\n\nIMPORTANT: Default to responding in Arabic unless the user writes in English.';
  } else {
    prompt += '\n\nIMPORTANT: Default to responding in English unless the user writes in Arabic.';
  }
  return prompt;
}

app.get('/admin/api/chatbot-knowledge', requireAdminAuth, async (req, res) => {
  if (dbPool) {
    const entries = await dbGetKnowledgeEntries();
    const personality = await dbGetSetting('chatbot_personality', '');
    const language = await dbGetSetting('chatbot_language', 'en');
    const position = await dbGetSetting('chatbot_position', 'right');
    res.json({ success: true, data: { entries, personality, language, position } });
  } else {
    res.json({ success: true, data: loadKnowledge() });
  }
});

app.post('/admin/api/chatbot-knowledge', requireAdminAuth, express.json(), async (req, res) => {
  const { entries, personality, language, position } = req.body || {};
  if (dbPool) {
    await dbSaveKnowledgeEntries(entries || []);
    await dbSetSetting('chatbot_personality', personality || '');
    await dbSetSetting('chatbot_language', language || 'en');
    await dbSetSetting('chatbot_position', position || 'right');
  }
  saveKnowledge({ entries: entries || [], personality: personality || '', language: language || 'en', position: position || 'right' });
  res.json({ success: true });
});

app.get('/admin/api/chatbot-knowledge-export', requireAdminAuth, async (req, res) => {
  let knowledge;
  if (dbPool) {
    const entries = await dbGetKnowledgeEntries();
    const personality = await dbGetSetting('chatbot_personality', '');
    const language = await dbGetSetting('chatbot_language', 'en');
    const position = await dbGetSetting('chatbot_position', 'right');
    knowledge = { entries, personality, language, position };
  } else {
    knowledge = loadKnowledge();
  }
  const encoded = Buffer.from(JSON.stringify(knowledge)).toString('base64');
  res.json({ success: true, envValue: encoded });
});

app.get('/api/chatbot-settings', async (req, res) => {
  if (dbPool) {
    const language = await dbGetSetting('chatbot_language', 'en');
    const position = await dbGetSetting('chatbot_position', 'right');
    res.json({ language, position });
  } else {
    const knowledge = loadKnowledge();
    res.json({ language: knowledge.language || 'en', position: knowledge.position || 'right' });
  }
});

const chatSessions = {};

app.post('/api/chat', express.json(), async (req, res) => {
  const { message, sessionId } = req.body || {};
  if (!message) return res.json({ reply: 'Please type a message.' });

  const apiKey = await loadOpenAIKeyAsync();
  if (!apiKey) {
    return res.json({ reply: 'Thank you for your message. Our team will get back to you soon. You can reach us at ctc@cahitcontracting.com or call +968 2411 2406 Ext: 101.' });
  }

  try {
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = [{ role: 'system', content: await buildSystemPrompt() }];
    }
    chatSessions[sessionId].push({ role: 'user', content: message });
    if (chatSessions[sessionId].length > 20) {
      chatSessions[sessionId] = [chatSessions[sessionId][0], ...chatSessions[sessionId].slice(-10)];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: chatSessions[sessionId], max_tokens: 500, temperature: 0.7 })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const reply = data.choices[0].message.content;
    chatSessions[sessionId].push({ role: 'assistant', content: reply });
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message || err);
    res.json({ reply: 'Sorry, I\'m having trouble right now. Please contact us at ctc@cahitcontracting.com or call +968 2411 2406 Ext: 101.', error: err.message || 'Unknown error' });
  }
});

app.post('/admin/api/ai-blog-generate', requireAdminAuth, express.json(), async (req, res) => {
  const { topic, type, language, sourceText } = req.body || {};
  if (!topic && !sourceText) return res.json({ success: false, error: 'Please provide a topic or source text' });

  const apiKey = await loadOpenAIKeyAsync();
  if (!apiKey) {
    return res.json({ success: false, error: 'No OpenAI API key configured. Add one in Chatbot Knowledge > API Integrations.' });
  }

  const langInstructions = language === 'ar'
    ? 'Write entirely in Arabic. Use formal Modern Standard Arabic.'
    : 'Write entirely in English.';

  const typeInstructions = {
    'full-post': 'Write a full blog post with introduction, 3-4 sections with subheadings (use ## for headings), and a conclusion. Approximately 600-800 words.',
    'outline': 'Write a detailed blog post outline with a title, 5-7 main sections, and 2-3 bullet points under each section.',
    'title-ideas': 'Generate 10 compelling blog post title ideas for this topic. Return them as a numbered list. Each title should be catchy and SEO-friendly.',
    'excerpt': 'Write a compelling 2-3 sentence blog post excerpt/summary that would make readers want to click and read more.',
    'seo-meta': 'Write an SEO-optimized meta title (under 60 characters) and meta description (under 160 characters). Also suggest 5-8 SEO keywords. Format:\nMETA TITLE: ...\nMETA DESCRIPTION: ...\nKEYWORDS: keyword1, keyword2, ...',
    'translate': 'Translate the following text to ' + (language === 'ar' ? 'Arabic (Modern Standard Arabic, formal)' : 'English') + '. Preserve all formatting, headings, and structure. Only output the translation, nothing else.\n\nText to translate:\n' + (sourceText || ''),
    'improve': 'Improve and polish the following blog content. Fix grammar, enhance clarity, make it more engaging and professional. Preserve the structure and meaning. Only output the improved text.\n\nText to improve:\n' + (sourceText || ''),
    'image-prompt': 'Generate a detailed image generation prompt for a blog post cover image about this topic. The image should be professional, suitable for a marine/coastal construction company blog. Describe the scene, style, colors, composition in detail. The prompt should work with DALL-E or similar AI image generators. Only output the image prompt, nothing else.'
  };

  const prompt = typeInstructions[type] || typeInstructions['full-post'];
  const userMsg = (type === 'translate' || type === 'improve') ? prompt : (prompt + '\n\nTopic: ' + topic);

  try {
    const systemMsg = 'You are an expert content writer for Cahit Trading & Contracting LLC, a marine and coastal construction company based in Muscat, Oman. ' +
      'The company specializes in marine construction, infrastructure, earthworks, dewatering, and MEP works. ' +
      'Write professional, authoritative content that demonstrates industry expertise. ' +
      ((type !== 'translate' && type !== 'improve') ? langInstructions : '');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const content = data.choices[0].message.content;
    res.json({ success: true, content });
  } catch (err) {
    console.error('AI blog generation error:', err.message || err);
    res.json({ success: false, error: err.message || 'AI generation failed' });
  }
});

app.post('/admin/api/ai-blog-image', requireAdminAuth, express.json(), async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.json({ success: false, error: 'Please provide an image prompt' });

  const apiKey = await loadOpenAIKeyAsync();
  if (!apiKey) {
    return res.json({ success: false, error: 'No OpenAI API key configured.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'b64_json'
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let buffer = null;
    let mime = 'image/png';
    const b64 = data.data && data.data[0] && data.data[0].b64_json;
    if (b64) {
      buffer = Buffer.from(b64, 'base64');
    } else if (data.data && data.data[0] && data.data[0].url) {
      const imgRes = await fetch(data.data[0].url);
      if (!imgRes.ok) throw new Error('Failed to download generated image');
      const arr = await imgRes.arrayBuffer();
      buffer = Buffer.from(arr);
      const ct = (imgRes.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('jpeg') || ct.includes('jpg')) mime = 'image/jpeg';
      else if (ct.includes('webp')) mime = 'image/webp';
      else if (ct.includes('gif')) mime = 'image/gif';
    } else {
      throw new Error('No image data returned');
    }

    if (dbPool) {
      const ins = await dbQuery('INSERT INTO blog_images (mime_type, data) VALUES ($1, $2) RETURNING id', [mime, buffer]);
      const imgId = ins.rows[0].id;
      res.json({ success: true, url: '/blog-image/' + imgId });
    } else {
      try { if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
      const ext = mime === 'image/jpeg' ? '.jpg' : mime === 'image/webp' ? '.webp' : mime === 'image/gif' ? '.gif' : '.png';
      const safeName = 'ai-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
      fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);
      res.json({ success: true, url: '/uploads/' + safeName });
    }
  } catch (err) {
    console.error('AI image generation error:', err.message || err);
    res.json({ success: false, error: err.message || 'Image generation failed' });
  }
});

// Admin dashboard
const ADMIN_DIR = path.join(THEME_DIR, 'admin');

// Resolve current admin credentials, preferring the DB hash when available and
// transparently migrating legacy plaintext values to bcrypt hashes on read.
async function resolveAdminCredentials() {
  const fileCreds = loadCredentials();
  let username = fileCreds.username;
  let passwordHash = fileCreds.passwordHash;
  if (dbPool) {
    username = await dbGetSetting('admin_username', username);
    let dbHash = await dbGetSetting('admin_password_hash', null);
    if (!dbHash) {
      // Legacy: a plaintext password may live under admin_password. Migrate it.
      const legacyPlain = await dbGetSetting('admin_password', null);
      if (legacyPlain) {
        dbHash = isBcryptHash(legacyPlain) ? legacyPlain : hashPassword(legacyPlain);
        await dbSetSetting('admin_password_hash', dbHash);
        await dbSetSetting('admin_password', '');
      }
    }
    if (dbHash) passwordHash = dbHash;
  }
  return { username, passwordHash };
}

async function persistAdminCredentials(username, passwordHash) {
  saveCredentials({ username, passwordHash });
  if (dbPool) {
    await dbSetSetting('admin_username', username);
    await dbSetSetting('admin_password_hash', passwordHash);
    // Ensure no plaintext leftover lingers in the DB.
    await dbSetSetting('admin_password', '');
  }
}

app.post('/admin/api/login', express.json(), async (req, res) => {
  const { username, password } = req.body || {};
  const creds = await resolveAdminCredentials();
  const userOk = username === creds.username || username === 'admin@cahitcontracting.com';
  const passOk = userOk && verifyPassword(password || '', creds.passwordHash);
  if (userOk && passOk) {
    // Opportunistic upgrade: if the stored value wasn't a bcrypt hash (legacy
    // plaintext that happened to match), persist a hashed version now.
    if (!isBcryptHash(creds.passwordHash)) {
      try { await persistAdminCredentials(creds.username, hashPassword(password)); } catch (e) {}
    }
    const version = await getCurrentTokenVersion();
    const tokenId = newTokenId();
    const issued = createAdminToken(creds.username, version, tokenId);
    await recordAdminSession(tokenId, creds.username, issued.expires, req);
    pruneExpiredSessions().catch(() => {});
    res.json({ success: true, token: issued.token, user: { name: 'Admin', role: 'administrator' } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

app.post('/admin/api/change-credentials', requireAdminAuth, express.json(), async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body || {};
  const creds = await resolveAdminCredentials();
  if (!verifyPassword(currentPassword || '', creds.passwordHash)) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }
  const nextUsername = newUsername && newUsername.trim() ? newUsername.trim() : creds.username;
  const nextHash = hashPassword(newPassword);
  await persistAdminCredentials(nextUsername, nextHash);
  const newVersion = await bumpTokenVersion();
  // Bumping the version invalidates all old tokens; also clear the per-token
  // allow-list so stale rows don't accumulate.
  if (dbPool) {
    await dbQuery('DELETE FROM admin_sessions', []);
  } else {
    saveSessionsToFile({});
  }
  const newTokenIdValue = newTokenId();
  const issued = createAdminToken(nextUsername, newVersion, newTokenIdValue);
  await recordAdminSession(newTokenIdValue, nextUsername, issued.expires, req);
  res.json({ success: true, token: issued.token, message: 'Credentials updated successfully' });
});

app.get('/admin/api/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true });
});

const UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads' : path.join(THEME_DIR, 'uploads');
try { if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}

app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/blog-image/:id', async (req, res) => {
  if (!dbPool) return res.status(404).send('Not found');
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).send('Bad id');
    const r = await dbQuery('SELECT mime_type, data FROM blog_images WHERE id=$1', [id]);
    if (!r.rows.length) return res.status(404).send('Not found');
    const row = r.rows[0];
    res.setHeader('Content-Type', row.mime_type || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(row.data);
  } catch (e) {
    console.error('blog-image error:', e.message);
    res.status(500).send('Error');
  }
});

app.get('/blog-media/:id', async (req, res) => {
  if (!dbPool) return res.status(404).send('Not found');
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).send('Bad id');
    const r = await dbQuery('SELECT mime_type, data FROM blog_media WHERE id=$1', [id]);
    if (!r.rows.length) return res.status(404).send('Not found');
    const row = r.rows[0];
    res.setHeader('Content-Type', row.mime_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Accept-Ranges', 'bytes');
    res.end(row.data);
  } catch (e) {
    console.error('blog-media error:', e.message);
    res.status(500).send('Error');
  }
});

app.post('/admin/api/upload', requireAdminAuth, (req, res) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ success: false, message: 'Expected multipart/form-data' });
  }

  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    return res.status(400).json({ success: false, message: 'No boundary found' });
  }

  const MAX_BYTES = 25 * 1024 * 1024;
  const chunks = [];
  let total = 0;
  let aborted = false;
  req.on('data', chunk => {
    if (aborted) return;
    total += chunk.length;
    if (total > MAX_BYTES) {
      aborted = true;
      try { res.status(413).json({ success: false, message: 'File too large (max 25 MB). For larger videos, host on YouTube/Vimeo and embed the link.' }); } catch(e) {}
      try { req.destroy(); } catch(e) {}
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', async () => {
    if (aborted) return;
    const buffer = Buffer.concat(chunks);
    const boundaryBuf = Buffer.from('--' + boundary);
    const parts = [];
    let start = 0;
    while (true) {
      const idx = buffer.indexOf(boundaryBuf, start);
      if (idx === -1) break;
      if (start > 0) parts.push(buffer.slice(start, idx));
      start = idx + boundaryBuf.length;
    }

    let fileBuffer = null;
    let originalName = 'upload';
    let mimeType = 'application/octet-stream';

    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      const headers = part.slice(0, headerEnd).toString();
      if (!headers.includes('filename=')) continue;
      const nameMatch = headers.match(/filename="([^"]+)"/);
      if (nameMatch) originalName = nameMatch[1];
      const typeMatch = headers.match(/Content-Type:\s*(.+)/i);
      if (typeMatch) mimeType = typeMatch[1].trim();
      let body = part.slice(headerEnd + 4);
      if (body[body.length - 2] === 13 && body[body.length - 1] === 10) {
        body = body.slice(0, body.length - 2);
      }
      fileBuffer = body;
      break;
    }

    if (!fileBuffer) {
      return res.status(400).json({ success: false, message: 'No file found in upload' });
    }

    const isImage = /^image\//i.test(mimeType);
    const isVideo = /^video\//i.test(mimeType);
    if (!isImage && !isVideo) {
      return res.status(400).json({ success: false, message: 'Only image and video files are allowed' });
    }

    if (process.env.VERCEL && dbPool) {
      try {
        const ins = await dbQuery(
          'INSERT INTO blog_media (mime_type, original_name, data) VALUES ($1, $2, $3) RETURNING id',
          [mimeType, originalName.slice(0, 500), fileBuffer]
        );
        const mediaId = ins.rows[0].id;
        return res.json({
          success: true,
          url: '/blog-media/' + mediaId,
          name: originalName,
          size: fileBuffer.length,
          type: mimeType,
          kind: isVideo ? 'video' : 'image'
        });
      } catch (e) {
        console.error('blog_media insert failed:', e.message);
        return res.status(500).json({ success: false, message: 'Failed to store file' });
      }
    }

    try {
      const ext = path.extname(originalName) || '.bin';
      const safeName = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, fileBuffer);
      return res.json({
        success: true,
        url: '/uploads/' + safeName,
        name: originalName,
        size: fileBuffer.length,
        type: mimeType,
        kind: isVideo ? 'video' : 'image'
      });
    } catch (e) {
      console.error('upload write failed:', e.message);
      return res.status(500).json({ success: false, message: 'Failed to save file' });
    }
  });
});

app.get('/admin/api/uploads', requireAdminAuth, async (req, res) => {
  const files = [];
  try {
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.readdirSync(UPLOADS_DIR).forEach(name => {
        try {
          const stat = fs.statSync(path.join(UPLOADS_DIR, name));
          const ext = (name.split('.').pop() || '').toLowerCase();
          const isVid = ['mp4','mov','webm','avi','m4v','ogv'].indexOf(ext) !== -1;
          const isImg = ['png','jpg','jpeg','gif','webp','svg','bmp','avif'].indexOf(ext) !== -1;
          files.push({
            name, url: '/uploads/' + name,
            size: stat.size,
            date: stat.mtime.toISOString().split('T')[0],
            type: isVid ? ('video/' + ext) : (isImg ? ('image/' + (ext === 'jpg' ? 'jpeg' : ext)) : 'application/octet-stream'),
            kind: isVid ? 'video' : (isImg ? 'image' : 'file')
          });
        } catch (e) {}
      });
    }
  } catch (e) {}

  if (dbPool) {
    try {
      const r = await dbQuery("SELECT id, mime_type, original_name, octet_length(data) AS size, created_at FROM blog_media ORDER BY id DESC LIMIT 500");
      r.rows.forEach(row => {
        const mime = row.mime_type || 'application/octet-stream';
        const kind = /^video\//i.test(mime) ? 'video' : (/^image\//i.test(mime) ? 'image' : 'file');
        files.push({
          name: row.original_name || ('media-' + row.id),
          url: '/blog-media/' + row.id,
          size: Number(row.size) || 0,
          date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
          type: mime,
          kind: kind
        });
      });
    } catch (e) { console.error('blog_media list failed:', e.message); }
  }

  files.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
  res.json({ success: true, files });
});

app.get('/admin/api/sessions', requireAdminAuth, async (req, res) => {
  try {
    await pruneExpiredSessions();
    const sessions = await listAdminSessions();
    const currentTokenId = (req.adminToken && req.adminToken.tokenId) || '';
    res.json({ success: true, currentTokenId: currentTokenId, sessions: sessions });
  } catch (e) {
    console.error('list sessions error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to list sessions' });
  }
});

app.delete('/admin/api/sessions/:tokenId', requireAdminAuth, async (req, res) => {
  // Lets an admin remotely sign out any other device they're signed in on.
  // Revoking your own current token is allowed too — the next request will
  // 401 and force a fresh login on this device.
  try {
    const tid = String(req.params.tokenId || '').trim();
    if (!tid) return res.status(400).json({ success: false, message: 'Missing token id' });
    await revokeAdminSession(tid);
    const isSelf = !!(req.adminToken && req.adminToken.tokenId === tid);
    res.json({ success: true, revokedSelf: isSelf });
  } catch (e) {
    console.error('revoke session error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to revoke session' });
  }
});

app.post('/admin/api/logout', requireAdminAuth, express.json(), async (req, res) => {
  // Per-token revocation: remove only the calling session's id from the
  // allow-list, leaving any other devices the admin is signed in on intact.
  // Sessions are persisted (DB or JSON fallback) so the revocation survives
  // process restarts. Change-credentials remains the heavy hammer that wipes
  // every session at once.
  if (req.adminToken && req.adminToken.tokenId) {
    await revokeAdminSession(req.adminToken.tokenId);
  }
  pruneExpiredSessions().catch(() => {});
  res.json({ success: true });
});

app.get('/admin/login', (req, res) => {
  const loginFile = fs.existsSync(path.join(ADMIN_DIR, 'login.php'))
    ? path.join(ADMIN_DIR, 'login.php')
    : path.join(ADMIN_DIR, 'login.html');
  let content = fs.readFileSync(loginFile, 'utf8');
  content = content.replace(/<\?php\s+echo\s+defined\('ABSPATH'\)\s*\?\s*esc_url\(home_url\('\/'\)\)\s*:\s*'\/'\s*;\s*\?>/g, '/');
  content = content.replace(/<\?php[\s\S]*?\?>/g, '');
  res.send(content);
});

app.use('/admin', express.static(ADMIN_DIR));

app.get('/admin', (req, res) => {
  const indexFile = fs.existsSync(path.join(ADMIN_DIR, 'index.php'))
    ? path.join(ADMIN_DIR, 'index.php')
    : path.join(ADMIN_DIR, 'index.html');
  let content = fs.readFileSync(indexFile, 'utf8');
  content = content.replace(/<\?php[\s\S]*?\?>/g, '');
  res.send(content);
});

app.get('/admin/api/leads', requireAdminAuth, async (req, res) => {
  if (dbPool) {
    const leads = await dbGetLeads();
    res.json({ success: true, data: leads });
  } else {
    res.json({ success: true, data: leadsStore });
  }
});

app.post('/admin/api/leads', express.json(), async (req, res) => {
  const lead = {
    id: leadsStore.length + 1,
    name: req.body.name || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    service_type: req.body.service_type || '',
    details: req.body.details || '',
    status: 'new',
    created_at: new Date().toISOString().split('T')[0]
  };
  if (dbPool) {
    const saved = await dbSaveLead(lead);
    sendLeadEmail(saved || lead);
    res.json({ success: true, data: saved || lead });
  } else {
    leadsStore.push(lead);
    sendLeadEmail(lead);
    res.json({ success: true, data: lead });
  }
});

// Plain-text HTML escaper for non-RTE fields (title, excerpt, attribute values)
function escapeHtmlSafe(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// HTML sanitizer for blog content (allowlist of safe tags/attributes)
function sanitizeBlogHtml(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html;
  // Strip script/style/iframe/object/embed/form blocks entirely
  s = s.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  s = s.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)\b[^>]*\/?>/gi, '');
  // Strip on* event-handler attributes (quoted, single-quoted, AND unquoted)
  s = s.replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '');
  s = s.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');
  // Strip dangerous URL schemes in href/src — quoted, single-quoted, and unquoted
  s = s.replace(/(href|src)\s*=\s*"\s*(?:javascript|vbscript|data)\s*:[^"]*"/gi, '$1="#"');
  s = s.replace(/(href|src)\s*=\s*'\s*(?:javascript|vbscript|data)\s*:[^']*'/gi, "$1='#'");
  s = s.replace(/(href|src)\s*=\s*(?:javascript|vbscript|data)\s*:[^\s>]*/gi, '$1="#"');
  return s;
}

// Blog Posts CRUD
app.get('/admin/api/blog-posts', requireAdminAuth, async (req, res) => {
  try {
    if (dbPool) {
      const r = await dbQuery('SELECT * FROM blog_posts ORDER BY created_at DESC');
      res.json({ success: true, data: r.rows });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/admin/api/blog-posts', requireAdminAuth, express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { title, title_ar, excerpt, excerpt_ar, content, content_ar, slug, image_url, status } = req.body;
    const postSlug = slug || (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanContent = sanitizeBlogHtml(content || '');
    const cleanContentAr = sanitizeBlogHtml(content_ar || '');
    if (dbPool) {
      const r = await dbQuery(
        'INSERT INTO blog_posts (title, title_ar, excerpt, excerpt_ar, content, content_ar, slug, image_url, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [title || '', title_ar || '', excerpt || '', excerpt_ar || '', cleanContent, cleanContentAr, postSlug, image_url || '', status || 'published']
      );
      res.json({ success: true, data: r.rows[0] });
    } else {
      res.json({ success: false, error: 'Database not available' });
    }
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.patch('/admin/api/blog-posts/:id', requireAdminAuth, express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_ar, excerpt, excerpt_ar, content, content_ar, slug, image_url, status } = req.body;
    const cleanContent = content != null ? sanitizeBlogHtml(content) : null;
    const cleanContentAr = content_ar != null ? sanitizeBlogHtml(content_ar) : null;
    if (dbPool) {
      const r = await dbQuery(
        'UPDATE blog_posts SET title=COALESCE($1,title), title_ar=COALESCE($2,title_ar), excerpt=COALESCE($3,excerpt), excerpt_ar=COALESCE($4,excerpt_ar), content=COALESCE($5,content), content_ar=COALESCE($6,content_ar), slug=COALESCE($7,slug), image_url=COALESCE($8,image_url), status=COALESCE($9,status), updated_at=NOW() WHERE id=$10 RETURNING *',
        [title, title_ar, excerpt, excerpt_ar, cleanContent, cleanContentAr, slug, image_url, status, id]
      );
      res.json({ success: true, data: r.rows[0] });
    } else {
      res.json({ success: false, error: 'Database not available' });
    }
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.delete('/admin/api/blog-posts/:id', requireAdminAuth, async (req, res) => {
  try {
    if (dbPool) {
      await dbQuery('DELETE FROM blog_posts WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Database not available' });
    }
  } catch (e) { res.json({ success: false, error: e.message }); }
});

// Default cards data
const defaultProjectCards = [
  { id: 'proj-1', title: 'Seaport Infrastructure', slug: 'seaport-infrastructure', badge: 'Marine', location: 'Muscat, Oman', desc: 'Quay wall construction and breakwater installation', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/ScxGkCDjPFNOhvON.png' },
  { id: 'proj-2', title: 'Coastal Protection Systems', slug: 'coastal-protection', badge: 'Coastal', location: 'Salalah, Oman', desc: 'Rock armour installation and coastal defense', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/zrgzKMxwmxJkeDsu.jpg' },
  { id: 'proj-3', title: 'Road Infrastructure Development', slug: 'road-infrastructure', badge: 'Infrastructure', location: 'Oman', desc: 'Road construction and infrastructure development', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg' },
  { id: 'proj-4', title: 'Asphalt Paving Works', slug: 'asphalt-paving', badge: 'Infrastructure', location: 'Oman', desc: 'Asphalt paving with modern equipment', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GjfldJYeoGyqGIMR.jpeg' },
  { id: 'proj-5', title: 'Underground Pipe Installation', slug: 'pipe-installation', badge: 'Infrastructure', location: 'Oman', desc: 'Water and sewage pipe installation', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/IGKoWMSOFVCVNNKX.jpg' },
  { id: 'proj-6', title: 'Concrete Formwork', slug: 'concrete-formwork', badge: 'Infrastructure', location: 'Oman', desc: 'Concrete formwork and reinforcement works', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/JjoMvapXmvuuLACi.png' }
];

const defaultServiceCards = [
  { id: 'svc-1', title: 'Marine & Coastal Construction', slug: 'marine-coastal-construction', desc: 'Cahit Trading & Contracting LLC provides specialized marine construction services including:', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/eErINryfjAMBHdEq.png', titleAr: 'البناء البحري والساحلي', descAr: 'تقدم شركة كاهيت للتجارة والمقاولات خدمات بناء بحري متخصصة تشمل:' },
  { id: 'svc-2', title: 'Infrastructure Development', slug: 'infrastructure-development', desc: 'Infrastructure projects today require innovative engineering solutions and advanced construction techniques. Cahit delivers infrastructure solutions including utilities, roads and industrial facilities.', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg', titleAr: 'تطوير البنية التحتية', descAr: 'تتطلب مشاريع البنية التحتية اليوم حلول هندسية مبتكرة وتقنيات بناء متقدمة.' },
  { id: 'svc-3', title: 'Earthworks', slug: 'earthworks', desc: 'We provide comprehensive earthworks services including excavation, grading, leveling and compaction for infrastructure projects and construction sites.', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/hMZPCXiHvRhErvHk.gif', titleAr: 'أعمال الحفر والردم', descAr: 'نقدم خدمات أعمال ترابية شاملة تشمل الحفر والتسوية والتمهيد والدمك.' },
  { id: 'svc-4', title: 'Dewatering & Shoring', slug: 'dewatering-shoring', desc: 'We design and implement advanced groundwater control systems including:', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/eErINryfjAMBHdEq.png', titleAr: 'نزح المياه والتدعيم', descAr: 'نصمم وننفذ أنظمة متقدمة للتحكم في المياه الجوفية تشمل:' },
  { id: 'svc-5', title: 'MEP Works', slug: 'mep-works', desc: 'Our MEP services include:', img: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/qZRtUjMizSFySgTf.png', titleAr: 'الأعمال الكهروميكانيكية', descAr: 'تشمل خدماتنا الكهروميكانيكية:' },
  { id: 'svc-6', title: 'General Construction', slug: 'general-construction', desc: 'Comprehensive residential, commercial, and industrial building solutions:', img: '/assets/images/general-construction.jpg', titleAr: 'البناء العام', descAr: 'حلول بناء شاملة للمشاريع السكنية والتجارية والصناعية:' }
];

async function getProjectCards() {
  try {
    const val = await dbGetSetting('dynamic_project_cards');
    if (val) return JSON.parse(val);
  } catch(e) {}
  return defaultProjectCards;
}

async function getServiceCards() {
  try {
    const val = await dbGetSetting('dynamic_service_cards');
    if (val) return JSON.parse(val);
  } catch(e) {}
  return defaultServiceCards;
}

function renderProjectCardsHtml(cards) {
  const arrowSvg = '<svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  return cards.map(c => {
    const desc = c.desc || '';
    const descIsHtml = /<[a-z][\s\S]*>/i.test(desc);
    const descHtml = descIsHtml ? desc : ('<p>' + desc + '</p>');
    const arAttr = c.descAr ? ' data-ar-html="'+String(c.descAr).replace(/"/g,'&quot;')+'"' : '';
    return `<div class="project-card" data-testid="card-project-${c.slug}">
    <div class="project-card-image">
      <img src="${c.img || ''}" alt="${(c.title||'').replace(/"/g,'&quot;')}" />
      <span class="project-category-badge">${c.badge || ''}</span>
    </div>
    <div class="project-card-content">
      <h3 class="project-card-title">${c.title || ''}</h3>
      <p class="project-card-location">${c.location || ''}</p>
      <div class="project-card-desc"${arAttr}>${descHtml}</div>
      <a href="/projects/${c.slug}" class="service-card-link" data-ar="\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f">Read More ${arrowSvg}</a>
    </div>
  </div>`;
  }).join('\n');
}

function renderServiceCardsHtml(cards) {
  const arrowSvg = '<svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  return cards.map(c => {
    const desc = c.desc || '';
    const descIsHtml = /<[a-z][\s\S]*>/i.test(desc);
    const descHtml = descIsHtml ? desc : ('<p>' + desc + '</p>');
    const titleArAttr = c.titleAr ? ' data-ar="'+String(c.titleAr).replace(/"/g,'&quot;')+'"' : '';
    const descArAttr = c.descAr ? ' data-ar-html="'+String(c.descAr).replace(/"/g,'&quot;')+'"' : '';
    return `<div class="service-card" data-testid="service-${c.slug}">
    <div class="service-card-image">
      <img src="${c.img || ''}" alt="${(c.title||'').replace(/"/g,'&quot;')}" />
    </div>
    <div class="service-card-content">
      <h3 class="service-card-title"${titleArAttr}>${c.title || ''}</h3>
      <div class="service-card-desc"${descArAttr}>${descHtml}</div>
      <a href="/services/${c.slug}" class="service-card-link" data-ar="\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f">Read More ${arrowSvg}</a>
    </div>
  </div>`;
  }).join('\n');
}

// Dynamic Cards API
app.get('/admin/api/dynamic-cards/:type', requireAdminAuth, async (req, res) => {
  try {
    const cards = req.params.type === 'projects' ? await getProjectCards() : await getServiceCards();
    res.json({ success: true, cards });
  } catch(e) { res.json({ success: false, error: e.message }); }
});

app.put('/admin/api/dynamic-cards/:type', requireAdminAuth, express.json(), async (req, res) => {
  try {
    const key = req.params.type === 'projects' ? 'dynamic_project_cards' : 'dynamic_service_cards';
    await dbSetSetting(key, JSON.stringify(req.body.cards || []));
    res.json({ success: true });
  } catch(e) { res.json({ success: false, error: e.message }); }
});

// Site Content Save/Load
app.get('/admin/api/site-content/:key', requireAdminAuth, async (req, res) => {
  try {
    const val = await dbGetSetting('content_' + req.params.key);
    res.json({ success: true, data: val ? JSON.parse(val) : null });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.put('/admin/api/site-content/:key', requireAdminAuth, express.json(), async (req, res) => {
  try {
    await dbSetSetting('content_' + req.params.key, JSON.stringify(req.body.data || {}));
    res.json({ success: true });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

// Lead status update
app.post('/admin/api/leads/:id/status', requireAdminAuth, express.json(), async (req, res) => {
  try {
    const { status } = req.body;
    if (dbPool) {
      const r = await dbQuery('UPDATE leads SET status=$1 WHERE id=$2 RETURNING *', [status || 'contacted', req.params.id]);
      res.json({ success: true, data: r.rows[0] });
    } else {
      res.json({ success: false, error: 'Database not available' });
    }
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.get('/admin/api/pages', requireAdminAuth, (req, res) => {
  const pages = [
    { name: 'Home', path: '/', template: 'front-page.php', status: 'published' },
    { name: 'About Us', path: '/about', template: 'page-about.php', status: 'published' },
    { name: 'Services', path: '/services', template: 'page-services.php', status: 'published' },
    { name: 'Projects', path: '/projects', template: 'page-projects.php', status: 'published' },
    { name: 'Clients', path: '/clients', template: 'page-clients.php', status: 'published' },
    { name: 'Blog', path: '/blog', template: 'page-blog.php', status: 'published' },
    { name: 'Careers', path: '/careers', template: 'page-careers.php', status: 'published' }
  ];
  res.json({ success: true, data: pages });
});

// Apply saved content from DB to rendered HTML
async function applySavedContent(html, sectionKeys) {
  if (!dbPool) return html;
  try {
    for (const sectionKey of sectionKeys) {
      const r = await dbQuery('SELECT value FROM site_settings WHERE key=$1', ['content_' + sectionKey]);
      if (r.rows.length > 0) {
        const data = JSON.parse(r.rows[0].value);
        for (const [field, value] of Object.entries(data)) {
          if (!value) continue;
          if (field.endsWith('-img') || field.endsWith('-bg') || field.endsWith('-video')) {
            const srcRegex = new RegExp('(<[^>]*data-field="' + field.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '"[^>]*\\bsrc=")[^"]*(")', 'i');
            if (srcRegex.test(html)) {
              html = html.replace(srcRegex, '$1' + value + '$2');
            }
          } else {
            const contentRegex = new RegExp('(<[^>]*data-field="' + field.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '"[^>]*>)([\\s\\S]*?)(</[a-z][a-z0-9]*>)', 'i');
            const match = html.match(contentRegex);
            if (match) {
              html = html.replace(match[0], match[1] + value + match[3]);
            }
          }
        }
      }
    }
  } catch(e) { console.error('Apply saved content error:', e.message); }
  return html;
}

// Page routes
app.get('/', async (req, res) => {
  const content = readThemeFile('front-page.php');
  let html = executePhpTemplate(content, 'home');
  html = await applySavedContent(html, ['hero', 'logos', 'about-preview', 'services', 'marine', 'stats', 'projects', 'leadership', 'cta', 'header', 'footer']);
  html = injectSeo(html, '/');
  res.send(html);
});

app.get('/about', async (req, res) => {
  const content = readThemeFile('page-about.php');
  let html = executePhpTemplate(content, 'about');
  html = await applySavedContent(html, ['about-hero', 'about-overview', 'about-mission', 'about-leadership', 'about-commitment', 'about-clients', 'header', 'footer']);
  html = injectSeo(html, '/about');
  res.send(html);
});

app.get('/services', async (req, res) => {
  const content = readThemeFile('page-services.php');
  let html = executePhpTemplate(content, 'services');
  html = await applySavedContent(html, ['services-hero', 'services-cta', 'header', 'footer']);
  const cards = await getServiceCards();
  const cardsHtml = renderServiceCardsHtml(cards);
  html = html.replace(/<div class="services-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/m,
    '<div class="services-grid">' + cardsHtml + '</div></div></section>');
  html = injectSeo(html, '/services');
  res.send(html);
});

app.get('/projects', async (req, res) => {
  const content = readThemeFile('page-projects.php');
  let html = executePhpTemplate(content, 'projects');
  html = await applySavedContent(html, ['projects-hero', 'header', 'footer']);
  const cards = await getProjectCards();
  const cardsHtml = renderProjectCardsHtml(cards);
  html = html.replace(/<div class="projects-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/m,
    '<div class="projects-grid">' + cardsHtml + '</div></div></section>');
  html = injectSeo(html, '/projects');
  res.send(html);
});

app.get('/clients', async (req, res) => {
  const content = readThemeFile('page-clients.php');
  let html = executePhpTemplate(content, 'clients');
  html = await applySavedContent(html, ['clients-hero', 'clients-grid', 'clients-sectors', 'header', 'footer']);
  html = injectSeo(html, '/clients');
  res.send(html);
});

app.get('/blog', async (req, res) => {
  let content = readThemeFile('page-blog.php');
  let html = executePhpTemplate(content, 'blog');
  html = await applySavedContent(html, ['blog-hero', 'blog-posts', 'header', 'footer']);
  if (dbPool) {
    try {
      const r = await dbQuery("SELECT * FROM blog_posts WHERE status='published' ORDER BY created_at DESC LIMIT 20");
      if (r.rows.length > 0) {
        let postsHtml = '';
        r.rows.forEach(p => {
          const safeTitle = escapeHtmlSafe(p.title);
          const safeTitleAr = escapeHtmlSafe(p.title_ar);
          const safeExcerpt = escapeHtmlSafe(p.excerpt);
          const safeExcerptAr = escapeHtmlSafe(p.excerpt_ar);
          const safeImg = escapeHtmlSafe(p.image_url || '');
          const safeSlug = encodeURIComponent(p.slug || '');
          postsHtml += `<div class="blog-card" data-testid="card-blog-${p.id}">
            ${p.image_url ? '<div class="blog-card-image"><img src="' + safeImg + '" alt="' + safeTitle + '" /></div>' : '<div class="blog-card-image"><div style="height:200px;background:linear-gradient(135deg,#0A3D6B,#0ea5e9);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:700">' + escapeHtmlSafe((p.title || '')[0]) + '</div></div>'}
            <div class="blog-card-content">
              <span class="blog-card-date">${new Date(p.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long'})}</span>
              <h3 class="blog-card-title" ${p.title_ar ? 'data-ar="'+safeTitleAr+'"' : ''}>${safeTitle}</h3>
              <p class="blog-card-excerpt" ${p.excerpt_ar ? 'data-ar="'+safeExcerptAr+'"' : ''}>${safeExcerpt}</p>
              <a href="/blog/${safeSlug}" class="service-card-link" data-ar="اقرأ المزيد">Read More <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
            </div>
          </div>`;
        });
        html = html.replace(/(<div class="grid grid-3 gap-8">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/m, '$1' + postsHtml + '$3');
      }
    } catch(e) { console.error('Blog load error:', e.message); }
  }
  res.send(html);
});

app.get('/careers', async (req, res) => {
  const content = readThemeFile('page-careers.php');
  let html = executePhpTemplate(content, 'careers');
  html = await applySavedContent(html, ['careers-hero', 'careers-intro', 'careers-cta', 'header', 'footer']);
  html = injectSeo(html, '/careers');
  res.send(html);
});

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /admin\n' +
    'Disallow: /admin/\n' +
    'Disallow: /api/\n' +
    '\n' +
    'Sitemap: ' + SITE_URL + '/sitemap.xml\n'
  );
});

// SEO: sitemap.xml (dynamic - includes published blog posts + service/project detail pages)
app.get('/sitemap.xml', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/services', priority: '0.9', changefreq: 'monthly' },
    { loc: '/projects', priority: '0.9', changefreq: 'monthly' },
    { loc: '/clients', priority: '0.6', changefreq: 'monthly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/careers', priority: '0.5', changefreq: 'monthly' }
  ];
  try {
    if (typeof getServiceCards === 'function') {
      const svcs = await getServiceCards();
      svcs.forEach(s => { if (s.slug) urls.push({ loc: '/services/' + s.slug, priority: '0.7', changefreq: 'monthly' }); });
    }
    if (typeof getProjectCards === 'function') {
      const projs = await getProjectCards();
      projs.forEach(p => { if (p.slug) urls.push({ loc: '/projects/' + p.slug, priority: '0.7', changefreq: 'monthly' }); });
    }
    if (dbPool) {
      const r = await dbQuery("SELECT slug, updated_at FROM blog_posts WHERE status='published' ORDER BY updated_at DESC");
      if (r && r.rows) {
        r.rows.forEach(p => {
          if (p.slug) urls.push({
            loc: '/blog/' + p.slug,
            lastmod: (p.updated_at ? new Date(p.updated_at).toISOString().slice(0,10) : today),
            priority: '0.6', changefreq: 'monthly'
          });
        });
      }
    }
  } catch (e) { console.error('sitemap build error:', e.message); }

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u =>
      '  <url><loc>' + SITE_URL + u.loc + '</loc>' +
      '<lastmod>' + (u.lastmod || today) + '</lastmod>' +
      '<changefreq>' + u.changefreq + '</changefreq>' +
      '<priority>' + u.priority + '</priority></url>'
    ).join('\n') +
    '\n</urlset>\n';
  res.type('application/xml').send(xml);
});

app.get('/blog/:slug', async (req, res) => {
  try {
    let post = null;
    if (dbPool) {
      const r = await dbQuery('SELECT * FROM blog_posts WHERE slug=$1 AND status=$2', [req.params.slug, 'published']);
      post = r.rows[0];
    }
    if (!post) {
      const content = readThemeFile('404.php');
      return res.status(404).send(executePhpTemplate(content, '404'));
    }
    const headerContent = readThemeFile('header.php');
    const footerContent = readThemeFile('footer.php');
    let header = executePhpTemplate(headerContent, 'blog');
    let footer = executePhpTemplate(footerContent, 'blog');
    const safePostTitle = escapeHtmlSafe(post.title);
    const safePostTitleAr = escapeHtmlSafe(post.title_ar || '');
    const safePostImg = escapeHtmlSafe(post.image_url || '');
    const safePostContent = post.content ? sanitizeBlogHtml(post.content) : escapeHtmlSafe(post.excerpt || '');
    const safePostContentArHtml = post.content_ar ? sanitizeBlogHtml(post.content_ar) : '';
    const safePostContentArAttr = escapeHtmlSafe(safePostContentArHtml);
    const titleArAttr = post.title_ar ? ' data-ar="' + safePostTitleAr + '"' : '';
    const contentArAttr = post.content_ar ? ' data-ar-html="' + safePostContentArAttr + '" dir="auto"' : '';
    const dateEn = new Date(post.created_at).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
    let dateAr = '';
    try { dateAr = new Date(post.created_at).toLocaleDateString('ar', {year:'numeric',month:'long',day:'numeric'}); } catch(e) { dateAr = dateEn; }
    const postHtml = `
      <section class="hero-banner" style="min-height:200px">
        <div class="container text-center" style="padding-top:120px;padding-bottom:40px">
          <h1 class="hero-banner-title hero-banner-title-lg"${titleArAttr}>${safePostTitle}</h1>
          <p class="hero-banner-subtitle" data-ar="${escapeHtmlSafe(dateAr)}">${dateEn}</p>
        </div>
      </section>
      <section class="section bg-white">
        <div class="container" style="max-width:800px;margin:0 auto">
          ${post.image_url ? '<img src="' + safePostImg + '" style="width:100%;border-radius:12px;margin-bottom:2rem" alt="' + safePostTitle + '" />' : ''}
          <div class="blog-post-content" style="font-size:1.05rem;line-height:1.8;color:#334155"${contentArAttr}>${safePostContent}</div>
          <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid #e2e8f0">
            <a href="/blog" class="service-card-link" style="font-size:1rem" data-ar="&rarr; العودة إلى المدونة">&larr; Back to Blog</a>
          </div>
        </div>
      </section>`;
    let outHtml = header + postHtml + footer;
    outHtml = injectSeo(outHtml, '/blog/' + req.params.slug, {
      title: post.title + ' | Cahit Contracting Blog',
      description: (post.excerpt || post.title || '').toString().slice(0, 200),
      image: post.image_url || DEFAULT_OG_IMAGE
    });
    res.send(outHtml);
  } catch (e) {
    const content = readThemeFile('404.php');
    res.status(500).send(executePhpTemplate(content, '404'));
  }
});

app.get('/projects/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const headerContent = readThemeFile('header.php');
    const footerContent = readThemeFile('footer.php');
    let header = executePhpTemplate(headerContent, 'projects');
    let footer = executePhpTemplate(footerContent, 'projects');
    header = await applySavedContent(header, ['header']);
    footer = await applySavedContent(footer, ['footer']);

    let title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let subtitle = '';
    let heroImg = '';
    let location = '';
    let category = '';
    let client = '';
    let year = '';
    let content = '';
    let scope = '';
    let img2 = '';
    let img3 = '';
    let titleAr = '';
    let subtitleAr = '';
    let contentAr = '';
    let scopeAr = '';

    if (dbPool) {
      const r = await dbQuery('SELECT value FROM site_settings WHERE key=$1', ['content_project-detail-' + slug]);
      if (r && r.rows.length > 0) {
        const data = JSON.parse(r.rows[0].value);
        title = data['project-detail-title'] || title;
        subtitle = data['project-detail-subtitle'] || '';
        heroImg = data['project-detail-hero-img'] || '';
        location = data['project-detail-location'] || '';
        category = data['project-detail-category'] || '';
        client = data['project-detail-client'] || '';
        year = data['project-detail-year'] || '';
        content = data['project-detail-content'] || '';
        scope = data['project-detail-scope'] || '';
        img2 = data['project-detail-img2'] || '';
        img3 = data['project-detail-img3'] || '';
        titleAr = data['project-detail-title-ar'] || '';
        subtitleAr = data['project-detail-subtitle-ar'] || '';
        contentAr = data['project-detail-content-ar'] || '';
        scopeAr = data['project-detail-scope-ar'] || '';
      }
      const projCards = await getProjectCards();
      const matchCard = projCards.find(c => c.slug === slug);
      if (matchCard) {
        if (!heroImg) heroImg = matchCard.img || '';
        if (!title || title === slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) title = matchCard.title || title;
        if (!location) location = matchCard.location || '';
        if (!category) category = matchCard.badge || '';
      }
    }

    const infoItems = [
      location ? '<div class="detail-info-item"><strong>Location:</strong> ' + location + '</div>' : '',
      category ? '<div class="detail-info-item"><strong>Category:</strong> ' + category + '</div>' : '',
      client ? '<div class="detail-info-item"><strong>Client:</strong> ' + client + '</div>' : '',
      year ? '<div class="detail-info-item"><strong>Year:</strong> ' + year + '</div>' : ''
    ].filter(Boolean).join('');

    const galleryHtml = (img2 || img3) ? '<div class="detail-gallery" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem">' +
      (img2 ? '<img src="' + img2 + '" style="width:100%;border-radius:12px" alt="Project gallery" />' : '') +
      (img3 ? '<img src="' + img3 + '" style="width:100%;border-radius:12px" alt="Project gallery" />' : '') +
      '</div>' : '';

    const detailHtml = `
      <section class="hero-banner" data-testid="section-project-detail-hero">
        ${heroImg ? '<img src="' + heroImg + '" alt="' + title + '" class="hero-banner-bg" />' : ''}
        <div class="hero-banner-overlay"></div>
        <div class="hero-banner-content">
          <div class="container">
            <h1 class="hero-banner-title" data-field="project-detail-title"${titleAr ? ' data-ar="' + titleAr.replace(/"/g, '&quot;') + '"' : ''}>${title}</h1>
            ${subtitle ? '<p class="hero-banner-subtitle" data-field="project-detail-subtitle"' + (subtitleAr ? ' data-ar="' + subtitleAr.replace(/"/g, '&quot;') + '"' : '') + '>' + subtitle + '</p>' : ''}
          </div>
        </div>
      </section>
      <section class="section bg-white">
        <div class="container" style="max-width:900px;margin:0 auto">
          ${infoItems ? '<div class="detail-info-bar" style="display:flex;flex-wrap:wrap;gap:1.5rem;padding:1.5rem;background:#f8fafc;border-radius:12px;margin-bottom:2rem;font-size:0.95rem;color:#334155">' + infoItems + '</div>' : ''}
          ${content ? '<div class="detail-content" data-field="project-detail-content"' + (contentAr ? ' data-ar-html="' + contentAr.replace(/"/g, '&quot;') + '"' : '') + ' style="font-size:1.05rem;line-height:1.8;color:#334155;white-space:normal">' + content + '</div>' : '<div class="detail-content" style="font-size:1.05rem;line-height:1.8;color:#64748b;text-align:center;padding:3rem 0">Detail content coming soon. Edit this page from the admin dashboard.</div>'}
          ${scope ? '<div style="margin-top:2rem"><h3 style="font-size:1.2rem;font-weight:600;color:#0A3D6B;margin-bottom:1rem" data-ar="نطاق العمل">Scope of Work</h3><div data-field="project-detail-scope"' + (scopeAr ? ' data-ar-html="' + scopeAr.replace(/"/g, '&quot;') + '"' : '') + ' style="font-size:1rem;line-height:1.8;color:#334155;white-space:normal">' + scope + '</div></div>' : ''}
          ${galleryHtml}
          <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid #e2e8f0">
            <a href="/projects" class="service-card-link" style="font-size:1rem">&larr; Back to Projects</a>
          </div>
        </div>
      </section>`;
    let outHtml = header + detailHtml + footer;
    outHtml = injectSeo(outHtml, '/projects/' + slug, {
      title: title + ' | ' + (category || 'Construction Project') + ' in Oman | Cahit Contracting',
      description: (subtitle || (title + ' — a ' + (category || 'construction') + ' project delivered by Cahit Trading & Contracting in ' + (location || 'Oman') + '.')).toString().slice(0, 200),
      image: heroImg || DEFAULT_OG_IMAGE
    });
    res.send(outHtml);
  } catch (e) {
    console.error('Project detail error:', e.message);
    const content = readThemeFile('404.php');
    res.status(500).send(executePhpTemplate(content, '404'));
  }
});

app.get('/services/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const headerContent = readThemeFile('header.php');
    const footerContent = readThemeFile('footer.php');
    let header = executePhpTemplate(headerContent, 'services');
    let footer = executePhpTemplate(footerContent, 'services');
    header = await applySavedContent(header, ['header']);
    footer = await applySavedContent(footer, ['footer']);

    let title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let subtitle = '';
    let heroImg = '';
    let content = '';
    let features = '';
    let process = '';
    let img2 = '';
    let img3 = '';
    let titleAr = '';
    let subtitleAr = '';
    let contentAr = '';
    let featuresAr = '';
    let processAr = '';

    if (dbPool) {
      const r = await dbQuery('SELECT value FROM site_settings WHERE key=$1', ['content_service-detail-' + slug]);
      if (r && r.rows.length > 0) {
        const data = JSON.parse(r.rows[0].value);
        title = data['service-detail-title'] || title;
        subtitle = data['service-detail-subtitle'] || '';
        heroImg = data['service-detail-hero-img'] || '';
        content = data['service-detail-content'] || '';
        features = data['service-detail-features'] || '';
        process = data['service-detail-process'] || '';
        img2 = data['service-detail-img2'] || '';
        img3 = data['service-detail-img3'] || '';
        titleAr = data['service-detail-title-ar'] || '';
        subtitleAr = data['service-detail-subtitle-ar'] || '';
        contentAr = data['service-detail-content-ar'] || '';
        featuresAr = data['service-detail-features-ar'] || '';
        processAr = data['service-detail-process-ar'] || '';
      }
      const svcCards = await getServiceCards();
      const matchSvc = svcCards.find(c => c.slug === slug);
      if (matchSvc) {
        if (!heroImg) heroImg = matchSvc.img || '';
        if (!title || title === slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) title = matchSvc.title || title;
      }
    }

    const galleryHtml = (img2 || img3) ? '<div class="detail-gallery" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem">' +
      (img2 ? '<img src="' + img2 + '" style="width:100%;border-radius:12px" alt="Service gallery" />' : '') +
      (img3 ? '<img src="' + img3 + '" style="width:100%;border-radius:12px" alt="Service gallery" />' : '') +
      '</div>' : '';

    const detailHtml = `
      <section class="hero-banner" data-testid="section-service-detail-hero">
        ${heroImg ? '<img src="' + heroImg + '" alt="' + title + '" class="hero-banner-bg" />' : ''}
        <div class="hero-banner-overlay"></div>
        <div class="hero-banner-content">
          <div class="container">
            <h1 class="hero-banner-title" data-field="service-detail-title"${titleAr ? ' data-ar="' + titleAr.replace(/"/g, '&quot;') + '"' : ''}>${title}</h1>
            ${subtitle ? '<p class="hero-banner-subtitle" data-field="service-detail-subtitle"' + (subtitleAr ? ' data-ar="' + subtitleAr.replace(/"/g, '&quot;') + '"' : '') + '>' + subtitle + '</p>' : ''}
          </div>
        </div>
      </section>
      <section class="section bg-white">
        <div class="container" style="max-width:900px;margin:0 auto">
          ${content ? '<div class="detail-content" data-field="service-detail-content"' + (contentAr ? ' data-ar-html="' + contentAr.replace(/"/g, '&quot;') + '"' : '') + ' style="font-size:1.05rem;line-height:1.8;color:#334155;white-space:normal">' + content + '</div>' : '<div class="detail-content" style="font-size:1.05rem;line-height:1.8;color:#64748b;text-align:center;padding:3rem 0">Detail content coming soon. Edit this page from the admin dashboard.</div>'}
          ${features ? '<div style="margin-top:2rem"><h3 style="font-size:1.2rem;font-weight:600;color:#0A3D6B;margin-bottom:1rem" data-ar="الميزات والقدرات الرئيسية">Key Features & Capabilities</h3><div data-field="service-detail-features"' + (featuresAr ? ' data-ar-html="' + featuresAr.replace(/"/g, '&quot;') + '"' : '') + ' style="font-size:1rem;line-height:1.8;color:#334155;white-space:normal">' + features + '</div></div>' : ''}
          ${process ? '<div style="margin-top:2rem"><h3 style="font-size:1.2rem;font-weight:600;color:#0A3D6B;margin-bottom:1rem" data-ar="منهجيتنا في العمل">Our Process & Approach</h3><div data-field="service-detail-process"' + (processAr ? ' data-ar-html="' + processAr.replace(/"/g, '&quot;') + '"' : '') + ' style="font-size:1rem;line-height:1.8;color:#334155;white-space:normal">' + process + '</div></div>' : ''}
          ${galleryHtml}
          <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid #e2e8f0">
            <a href="/services" class="service-card-link" style="font-size:1rem">&larr; Back to Services</a>
          </div>
        </div>
      </section>
      <section class="cta-section">
        <div class="container text-center">
          <h2 class="cta-title">Interested in This Service?</h2>
          <p class="cta-subtitle">Contact our team to discuss your project requirements and get a consultation.</p>
          <button onclick="openContactPopup();" class="btn btn-white">Contact Our Team</button>
        </div>
      </section>`;
    let outHtml = header + detailHtml + footer;
    outHtml = injectSeo(outHtml, '/services/' + slug, {
      title: title + ' in Oman | Cahit Trading & Contracting LLC',
      description: (subtitle || (title + ' services across the Sultanate of Oman by Cahit Trading & Contracting LLC.')).toString().slice(0, 200),
      image: heroImg || DEFAULT_OG_IMAGE
    });
    res.send(outHtml);
  } catch (e) {
    console.error('Service detail error:', e.message);
    const content = readThemeFile('404.php');
    res.status(500).send(executePhpTemplate(content, '404'));
  }
});

app.get('/404', (req, res) => {
  const content = readThemeFile('404.php');
  res.send(executePhpTemplate(content, '404'));
});

app.use((req, res) => {
  const content = readThemeFile('404.php');
  res.status(404).send(executePhpTemplate(content, '404'));
});

async function initDatabase() {
  if (!dbPool) return;
  try {
    await dbQuery(`CREATE TABLE IF NOT EXISTS site_settings (key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL DEFAULT '', updated_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS chatbot_knowledge (id SERIAL PRIMARY KEY, title VARCHAR(500) NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL DEFAULT '', email VARCHAR(255) NOT NULL DEFAULT '', phone VARCHAR(100) DEFAULT '', service_type VARCHAR(255) DEFAULT '', details TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS blog_posts (id SERIAL PRIMARY KEY, title VARCHAR(500) NOT NULL DEFAULT '', title_ar VARCHAR(500) DEFAULT '', excerpt TEXT DEFAULT '', excerpt_ar TEXT DEFAULT '', content TEXT DEFAULT '', content_ar TEXT DEFAULT '', slug VARCHAR(255) UNIQUE, image_url TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'published', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS blog_images (id SERIAL PRIMARY KEY, mime_type VARCHAR(100) NOT NULL DEFAULT 'image/png', data BYTEA NOT NULL, created_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS blog_media (id SERIAL PRIMARY KEY, mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream', original_name VARCHAR(500) DEFAULT '', data BYTEA NOT NULL, created_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS page_views (id SERIAL PRIMARY KEY, page VARCHAR(500) NOT NULL, referrer VARCHAR(1000) DEFAULT '', user_agent TEXT DEFAULT '', session_id VARCHAR(100) DEFAULT '', ip VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT NOW())`);
    await dbQuery(`CREATE TABLE IF NOT EXISTS admin_sessions (token_id VARCHAR(64) PRIMARY KEY, username VARCHAR(255) NOT NULL DEFAULT '', expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`);
    await dbQuery(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ`);
    await dbQuery(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_ip VARCHAR(100) DEFAULT ''`);
    await dbQuery(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_user_agent VARCHAR(500) DEFAULT ''`);
    await dbQuery(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS created_ip VARCHAR(100) DEFAULT ''`);
    await dbQuery(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS created_user_agent VARCHAR(500) DEFAULT ''`);
    await dbQuery(`UPDATE admin_sessions SET created_ip = last_ip WHERE (created_ip IS NULL OR created_ip = '') AND last_ip IS NOT NULL AND last_ip <> ''`);
    await dbQuery(`UPDATE admin_sessions SET created_user_agent = last_user_agent WHERE (created_user_agent IS NULL OR created_user_agent = '') AND last_user_agent IS NOT NULL AND last_user_agent <> ''`);
    await dbQuery(`CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at)`);
    await dbQuery('DELETE FROM admin_sessions WHERE expires_at < NOW()');
    await dbQuery(`CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at)`);
    await dbQuery(`CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page)`);
    console.log('Database tables initialized');
  } catch (e) { console.error('DB init error:', e.message); }
}

if (!process.env.VERCEL) {
  initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`WordPress theme preview server running on http://0.0.0.0:${PORT}`);
      console.log(`Theme dir: ${THEME_DIR}`);
      console.log(`Database: ${dbPool ? 'PostgreSQL connected' : 'File-based fallback'}`);
    });
  });
} else {
  initDatabase();
}

module.exports = app;
