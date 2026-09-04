/* =============================================================
   Serverless version of the image proxy — for Vercel / Netlify
   functions. Deploy the repo, set GEMINI_API_KEY in the project's
   environment variables, and the page finds this automatically
   (no key needed in the browser).

   Local development uses ../server.js instead, which does the
   same thing with zero dependencies.
   ============================================================= */

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview'
]);

export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  // The page probes with GET to decide whether it needs to ask for a key.
  if (req.method === 'GET') {
    return res.status(200).json({ ready: !!KEY });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  if (!KEY) {
    return res.status(503).json({ error: { message: 'Server has no GEMINI_API_KEY set.' } });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { model, payload } = body || {};

    if (!ALLOWED_MODELS.has(model)) {
      return res.status(400).json({ error: { message: 'Unknown model: ' + model } });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
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
}

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } }
};
