// Resend (transactional email) client wired to the Replit-managed connection.
// Always fetches a fresh API key — tokens expire, do NOT cache the client.
// Connection: conn_resend_01KQ22438EG8D3JWF4H12CQV1J

const { Resend } = require('resend');

let _lastSettings = null;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X-Replit-Token not found for repl/depl');
  const resp = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    { headers: { 'Accept': 'application/json', 'X-Replit-Token': xReplitToken } }
  );
  const data = await resp.json();
  const item = data && data.items && data.items[0];
  if (!item || !item.settings || !item.settings.api_key) {
    throw new Error('Resend not connected');
  }
  _lastSettings = item.settings;
  return { apiKey: item.settings.api_key, fromEmail: item.settings.from_email || '' };
}

async function getResendClient() {
  const creds = await getCredentials();
  return { client: new Resend(creds.apiKey), fromEmail: creds.fromEmail };
}

module.exports = { getResendClient };
