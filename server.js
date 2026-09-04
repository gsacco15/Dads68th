#!/usr/bin/env node
/* =============================================================
   Tiny zero-dependency dev/prod server.

   Serves the static site AND proxies image generation so your
   Google API key never touches the browser.

     GEMINI_API_KEY=xxxx node server.js
     open http://localhost:5173

   Without a key it still serves the site — the page just falls
   back to asking for a key in the ⚙ panel.
   ============================================================= */
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5173;
const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview'
]);

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ 'Cache-Control': 'no-cache' }, headers || {}));
  res.end(body);
}

function serveStatic(req, res) {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname === '/') pathname = '/index.html';

  // keep requests inside the project directory
  const filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, { 'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  });
}

function callGoogle(model, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-goog-api-key': KEY
      }
    }, (r) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.setTimeout(180000, () => req.destroy(new Error('Upstream timed out')));
    req.write(body);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  // health / capability probe the page uses to decide whether to ask for a key
  if (pathname === '/api/generate' && req.method === 'GET') {
    return send(res, 200, JSON.stringify({ ready: !!KEY }), { 'Content-Type': 'application/json' });
  }

  if (pathname === '/api/generate' && req.method === 'POST') {
    if (!KEY) {
      return send(res, 503, JSON.stringify({ error: { message: 'Server has no GEMINI_API_KEY set.' } }),
        { 'Content-Type': 'application/json' });
    }
    let raw = '';
    let tooBig = false;
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 25 * 1024 * 1024) { tooBig = true; req.destroy(); }
    });
    req.on('end', async () => {
      if (tooBig) return;
      try {
        const { model, payload } = JSON.parse(raw);
        if (!ALLOWED_MODELS.has(model)) {
          return send(res, 400, JSON.stringify({ error: { message: 'Unknown model: ' + model } }),
            { 'Content-Type': 'application/json' });
        }
        const out = await callGoogle(model, payload);
        send(res, out.status, out.body, { 'Content-Type': 'application/json' });
      } catch (e) {
        send(res, 500, JSON.stringify({ error: { message: e.message } }), { 'Content-Type': 'application/json' });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n  🕺 Pa @ 68  →  http://localhost:${PORT}`);
  console.log(KEY ? '  API key: loaded from environment (browser never sees it)'
                  : '  API key: none set — the page will ask for one in the ⚙ panel');
  console.log('');
});
