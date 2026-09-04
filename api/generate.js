/* =============================================================
   Serverless image proxy — Vercel (or any host that runs an
   /api folder of Node functions).

   Set GEMINI_API_KEY in the project's environment variables and
   the page finds this on its own: no visitor ever needs a key,
   nobody sees yours, and everyone shoots on your quota.

   CommonJS on purpose — Vercel's Node runtime treats a .js file
   as CommonJS unless package.json says otherwise, and server.js
   next door is CommonJS too. `export default` here would fail at
   runtime with a syntax error.
   ============================================================= */
'use strict';

const ALLOWED_MODELS = new Set([
  'gemini-3-pro-image',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image'
]);

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
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', c => { raw += c; });
        req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
        req.on('error', reject);
      });
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { model, payload } = body || {};
    if (!ALLOWED_MODELS.has(model)) {
      return res.status(400).json({ error: { message: 'Unknown model: ' + model } });
    }

    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
        body: JSON.stringify(payload)
      }
    );

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
};
