/* =============================================================
   Serverless image proxy — Vercel (or any host that runs an
   /api folder of Node functions).

   Set GEMINI_API_KEY in the project's environment variables and
   the page finds this on its own: no visitor ever needs a key,
   nobody sees yours, and everyone shoots on your quota.

   Two deliberate choices here, both about not breaking on the
   host's Node version:

     • CommonJS. Vercel treats a .js file as CommonJS unless
       package.json says otherwise, and there is no package.json.
       `export default` would throw a syntax error on the first
       request.
     • node:https rather than global fetch, which only exists on
       Node 18+. This works on anything.
   ============================================================= */
'use strict';

const https = require('https');

const ALLOWED_MODELS = new Set([
  'gemini-3-pro-image',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image'
]);

function callGoogle(model, payload, key) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-goog-api-key': key
      }
    }, (r) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    // Pro generations regularly run past a minute
    req.setTimeout(110000, () => req.destroy(new Error('Upstream timed out')));
    req.write(body);
    req.end();
  });
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.reject(e); }
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  // the page probes with GET to decide whether it needs to ask for a key
  if (req.method === 'GET') {
    return res.status(200).json({ ready: !!KEY });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  if (!KEY) {
    return res.status(503).json({
      error: { message: 'This deployment has no GEMINI_API_KEY set in its environment variables.' }
    });
  }

  try {
    const body = await readBody(req);
    const model = body && body.model;
    const payload = body && body.payload;

    if (!ALLOWED_MODELS.has(model)) {
      return res.status(400).json({ error: { message: 'Unknown model: ' + model } });
    }

    const out = await callGoogle(model, payload, KEY);
    res.status(out.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(out.body);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
};
