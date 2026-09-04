/* =============================================================
   NANO — talks to Nano Banana (Gemini image models).

   Two routes, picked automatically:
     1. /api/generate  — if a server proxy is running (key stays
                         server-side). Preferred.
     2. Google direct  — using a key pasted into the ⚙ panel and
                         kept in this browser only.

   Add ?demo=1 to the URL to run the whole UI with fake, locally
   drawn images — handy for checking layout without spending
   quota.
   ============================================================= */
window.NANO = (function () {
  'use strict';

  var C = window.CONFIG;
  var proxyChecked = false;
  var proxyOK = false;

  // Forced on in the hosted preview, where the sandbox blocks outside API calls.
  var DEMO = /[?&]demo=1/.test(location.search) || !!window.PA68_PREVIEW;

  /* ---------------------------------------------------------
     Is a server proxy sitting at /api/generate?
     --------------------------------------------------------- */
  function checkProxy() {
    if (proxyChecked) return Promise.resolve(proxyOK);
    if (location.protocol === 'file:') { proxyChecked = true; return Promise.resolve(false); }
    return fetch(C.PROXY_PATH, { method: 'GET' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { proxyOK = !!(j && j.ready); proxyChecked = true; return proxyOK; })
      .catch(function () { proxyChecked = true; proxyOK = false; return false; });
  }

  function getKey() { return window.STORE.local('key') || ''; }
  function setKey(k) { return window.STORE.local('key', k || null); }
  function getModel() { return window.STORE.local('model') || C.MODEL; }
  function setModel(m) { return window.STORE.local('model', m); }

  /* ---------------------------------------------------------
     Request bodies, most-featureful first. If the API rejects
     one with a 400 we fall down the ladder rather than failing
     — model support for these fields moves around.
     --------------------------------------------------------- */
  function bodies(prompt, images) {
    var parts = [{ text: prompt }];
    images.forEach(function (img) {
      parts.push({ inline_data: { mime_type: img.mime, data: img.b64 } });
    });
    var contents = [{ role: 'user', parts: parts }];

    return [
      { contents: contents, generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: C.ASPECT } } },
      { contents: contents, generationConfig: { responseModalities: ['IMAGE'] } },
      { contents: contents }
    ];
  }

  /* ---------------------------------------------------------
     Pull the first image out of a Gemini response. Handles both
     camelCase and snake_case shapes.
     --------------------------------------------------------- */
  function extractImage(json) {
    var cand = json && json.candidates && json.candidates[0];
    if (!cand) return null;
    var content = cand.content || {};
    var parts = content.parts || [];
    var textBits = [];

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var inline = p.inlineData || p.inline_data;
      if (inline && inline.data) {
        return {
          mime: inline.mimeType || inline.mime_type || 'image/png',
          b64: inline.data
        };
      }
      if (p.text) textBits.push(p.text);
    }
    // No image came back — surface whatever the model said instead.
    var why = textBits.join(' ').trim();
    var reason = cand.finishReason || cand.finish_reason;
    var err = new Error(
      why ? ('The model answered with words instead of a picture: "' + why.slice(0, 220) + '"')
          : ('No image came back' + (reason ? ' (' + reason + ')' : '') + '. Try rewording the prompt.')
    );
    err.soft = true;
    throw err;
  }

  function readError(res, text) {
    var msg = '';
    try { var j = JSON.parse(text); msg = (j.error && j.error.message) || ''; } catch (e) {}
    if (!msg) msg = text ? text.slice(0, 200) : '';

    if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg)) {
      return 'That API key was rejected. Double-check it in the ⚙ panel.';
    }
    if (res.status === 401 || res.status === 403) {
      return 'Google turned the key away (' + res.status + '). ' +
             'Check the key is enabled for the Generative Language API. ' + msg;
    }
    if (res.status === 429) {
      if (/limit: ?0/.test(msg) || /free_tier/.test(msg)) {
        return 'Image generation has no free tier. This key\'s Google project needs billing ' +
               'switched on — aistudio.google.com → Billing → set up paid tier. It costs a few ' +
               'cents per picture, then this works immediately.';
      }
      return 'Rate limited — too many shots too quickly. Give it a minute, then reshoot.';
    }
    if (res.status === 404) {
      return 'That model name is not available on this key (' + getModel() + '). ' +
             'Try the other model in the ⚙ panel.';
    }
    if (res.status >= 500) return 'Google had a wobble (' + res.status + '). Try again.';
    return msg || ('Request failed (' + res.status + ')');
  }

  /* ---------------------------------------------------------
     Demo images — procedurally drawn, no network.
     --------------------------------------------------------- */
  function demoImage(prompt) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        var c = document.createElement('canvas');
        c.width = 800; c.height = 600;
        var x = c.getContext('2d');
        var hues = [[255, 46, 136], [245, 194, 76], [70, 224, 255], [138, 79, 255]];
        var a = hues[Math.floor(Math.random() * 4)], b = hues[Math.floor(Math.random() * 4)];
        var g = x.createLinearGradient(0, 0, 800, 600);
        g.addColorStop(0, 'rgb(' + a.join(',') + ')');
        g.addColorStop(1, 'rgb(' + b.join(',') + ')');
        x.fillStyle = g; x.fillRect(0, 0, 800, 600);
        x.fillStyle = 'rgba(0,0,0,.35)';
        for (var i = 0; i < 40; i++) {
          x.beginPath();
          x.arc(Math.random() * 800, Math.random() * 600, Math.random() * 40 + 5, 0, 7);
          x.fill();
        }
        x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 430, 800, 170);
        x.fillStyle = '#fff'; x.font = 'bold 26px sans-serif';
        x.fillText('DEMO FRAME', 40, 480);
        x.font = '19px sans-serif'; x.fillStyle = 'rgba(255,255,255,.85)';
        var words = prompt.split(' '), line = '', y = 515;
        for (var w = 0; w < words.length && y < 590; w++) {
          var test = line + words[w] + ' ';
          if (x.measureText(test).width > 720) { x.fillText(line, 40, y); line = words[w] + ' '; y += 26; }
          else line = test;
        }
        x.fillText(line, 40, y);
        resolve(c.toDataURL('image/jpeg', 0.85));
      }, 900 + Math.random() * 900);
    });
  }

  /* ---------------------------------------------------------
     generate(prompt, referenceImages, label) -> data URL
     `label` is only used to caption demo-mode frames.
     --------------------------------------------------------- */
  function generate(prompt, images, label) {
    images = images || [];
    if (DEMO) return demoImage(label || prompt);

    return checkProxy().then(function (useProxy) {
      var key = getKey();
      if (!useProxy && !key) {
        var e = new Error('NO_KEY');
        e.noKey = true;
        throw e;
      }

      var list = bodies(prompt, images);
      var model = getModel();

      function attempt(i, lastErr) {
        if (i >= list.length) throw lastErr || new Error('Generation failed.');

        var url, init;
        if (useProxy) {
          url = C.PROXY_PATH;
          init = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model, payload: list[i] })
          };
        } else {
          url = C.API_BASE + encodeURIComponent(model) + ':generateContent';
          init = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify(list[i])
          };
        }

        return fetch(url, init).then(function (res) {
          return res.text().then(function (text) {
            if (!res.ok) {
              var msg = readError(res, text);
              // A 400 may just mean this model dislikes one of the optional
              // fields — walk down the ladder before giving up.
              if (res.status === 400 && i < list.length - 1) {
                return attempt(i + 1, new Error(msg));
              }
              throw new Error(msg);
            }
            var json = JSON.parse(text);
            var img = extractImage(json);
            return 'data:' + img.mime + ';base64,' + img.b64;
          });
        });
      }

      return attempt(0, null);
    });
  }

  return {
    generate: generate,
    checkProxy: checkProxy,
    getKey: getKey,
    setKey: setKey,
    getModel: getModel,
    setModel: setModel,
    isDemo: function () { return DEMO; }
  };
})();
