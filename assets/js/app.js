/* =============================================================
   APP — the whole party.
   ============================================================= */
(function () {
  'use strict';

  var C = window.CONFIG;
  var T = window.CONTENT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* =========================================================
     1. ATMOSPHERE — floor, skyline, reveals, counters, nav
     ========================================================= */
  function buildFloor() {
    var grid = $('#floorGrid');
    if (!grid) return;
    var n = 20 * 12;
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<i style="animation-delay:' + (-Math.random() * 6).toFixed(2) + 's"></i>';
    }
    grid.innerHTML = html;
  }

  function buildWindows() {
    var g = $('.windows');
    if (!g) return;
    var ns = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 90; i++) {
      var r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', (Math.random() * 1420 + 10).toFixed(0));
      r.setAttribute('y', (Math.random() * 90 + 140).toFixed(0));
      r.setAttribute('width', '3');
      r.setAttribute('height', '4');
      r.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
      g.appendChild(r);
    }
  }

  function reveals() {
    var els = $$('.reveal');
    $$('.cards .card').forEach(function (c, i) { c.style.setProperty('--i', i); });
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function counters() {
    var done = false;
    function run() {
      if (done) return;
      var stats = $('#stats');
      if (!stats) return;
      var r = stats.getBoundingClientRect();
      if (r.top > innerHeight * 0.9) return;
      done = true;
      $$('.count').forEach(function (el) {
        var to = parseInt(el.dataset.to, 10);
        var start = performance.now();
        var dur = 1400;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }
    addEventListener('scroll', run, { passive: true });
    run();
  }

  function topbar() {
    var bar = $('#topbar');
    addEventListener('scroll', function () {
      bar.classList.toggle('stuck', scrollY > 40);
    }, { passive: true });
  }

  /* =========================================================
     2. CONFETTI
     ========================================================= */
  var FX = (function () {
    var cv = $('#fx'), ctx = cv.getContext('2d'), bits = [], raf = null;
    function size() { cv.width = innerWidth; cv.height = innerHeight; }
    addEventListener('resize', size); size();

    var colors = ['#FF2E88', '#F5C24C', '#46E0FF', '#8A4FFF', '#FF6B2C', '#F7EFE2'];

    function burst(n) {
      n = n || 120;
      for (var i = 0; i < n; i++) {
        bits.push({
          x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
          y: innerHeight * 0.35 + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 11,
          vy: Math.random() * -12 - 3,
          w: Math.random() * 9 + 4,
          h: Math.random() * 5 + 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          c: colors[(Math.random() * colors.length) | 0],
          life: 1
        });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function loop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var i = bits.length - 1; i >= 0; i--) {
        var b = bits[i];
        b.vy += 0.34; b.vx *= 0.995;
        b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        if (b.y > innerHeight + 60) { bits.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (bits.length) raf = requestAnimationFrame(loop);
      else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
    }

    return { burst: burst };
  })();

  /* =========================================================
     3. THE CREW — reference photos
     ========================================================= */
  var crew = [];

  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onerror = function () { reject(new Error('Could not read that file.')); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('That did not look like an image.')); };
        img.onload = function () {
          var max = C.CREW_MAX_PX;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          var cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          var url = cv.toDataURL('image/jpeg', 0.88);
          resolve({ mime: 'image/jpeg', b64: url.split(',')[1], url: url, who: 'both of them' });
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  var WHO = [
    ['both of them', 'Both'],
    ['PA, the older man', 'Pa'],
    ['GRANT, the younger man', 'Grant']
  ];

  function renderCrew() {
    var grid = $('#crewGrid');
    grid.innerHTML = '';
    crew.forEach(function (c, i) {
      var card = document.createElement('div');
      card.className = 'crew-card';
      var opts = WHO.map(function (w) {
        return '<option value="' + w[0] + '"' + (c.who === w[0] ? ' selected' : '') + '>' + w[1] + '</option>';
      }).join('');
      card.innerHTML =
        '<button class="kill" type="button" title="Remove">✕</button>' +
        '<img src="' + c.url + '" alt="Reference ' + (i + 1) + '">' +
        '<select>' + opts + '</select>';
      $('.kill', card).onclick = function () {
        crew.splice(i, 1); renderCrew(); saveCrew();
      };
      $('select', card).onchange = function () { c.who = this.value; saveCrew(); };
      grid.appendChild(card);
    });

    var hint = $('#crewHint');
    if (crew.length) {
      hint.textContent = crew.length + ' reference photo' + (crew.length > 1 ? 's' : '') + ' loaded ✓';
      hint.classList.add('ok');
    } else {
      hint.textContent = 'Add reference photos so it actually looks like you two →';
      hint.classList.remove('ok');
    }
    $('.upload').style.display = crew.length >= C.MAX_CREW ? 'none' : 'inline-block';
  }

  function saveCrew() {
    window.STORE.setCrew(crew.map(function (c) {
      return { mime: c.mime, b64: c.b64, url: c.url, who: c.who };
    }));
  }

  function initCrew() {
    $('#crewInput').addEventListener('change', function (e) {
      var files = Array.prototype.slice.call(e.target.files || []);
      var room = C.MAX_CREW - crew.length;
      if (files.length > room) {
        say('bot', 'I can hold ' + C.MAX_CREW + ' reference photos. Taking the first ' + room + '.');
        files = files.slice(0, room);
      }
      Promise.all(files.map(shrink))
        .then(function (list) {
          crew = crew.concat(list);
          renderCrew(); saveCrew();
          say('bot', 'Got it. ' + crew.length + ' reference' + (crew.length > 1 ? 's' : '') +
                     ' on file — tag which is which under each photo and I\'ll keep your faces straight.');
        })
        .catch(function (err) { say('err', err.message); });
      e.target.value = '';
    });

    window.STORE.getCrew().then(function (saved) {
      if (saved && saved.length) { crew = saved; renderCrew(); }
      else renderCrew();
    });
  }

  /* =========================================================
     4. CHAT
     ========================================================= */
  var style = window.STORE.local('style') || 'film';

  function say(kind, html) {
    var log = $('#chatLog');
    var el = document.createElement('div');
    el.className = 'msg ' + kind;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function typing() {
    var el = say('bot typing', '<span></span><span></span><span></span>');
    return { done: function () { el.remove(); } };
  }

  function initStyles() {
    $$('#styles button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.style === style);
      b.onclick = function () {
        style = b.dataset.style;
        window.STORE.local('style', style);
        $$('#styles button').forEach(function (x) { x.classList.toggle('on', x === b); });
        say('bot', 'Switched the look to <b>' + T.STYLES[style].label + '</b>.');
      };
    });
  }

  /* ---- floating ideas ---- */
  var SPOTS = [
    { left: '1%',  top: '6%',  rot: '-3deg' },
    { left: '3%',  top: '31%', rot: '2deg' },
    { left: '0%',  top: '57%', rot: '-2deg' },
    { left: '5%',  top: '82%', rot: '3deg' },
    { right: '2%', top: '10%', rot: '3deg' },
    { right: '0%', top: '36%', rot: '-2deg' },
    { right: '4%', top: '62%', rot: '2deg' },
    { right: '1%', top: '86%', rot: '-3deg' }
  ];

  function initIdeas() {
    var box = $('#ideas');
    var pool = T.IDEAS.slice();
    var live = [];

    function pick() {
      var used = live.map(function (l) { return l.idea; });
      var free = pool.filter(function (p) { return used.indexOf(p) === -1; });
      return free[(Math.random() * free.length) | 0] || pool[0];
    }

    function load(idea) {
      var input = $('#promptInput');
      input.value = idea.prompt;
      input.focus();
    }

    SPOTS.forEach(function (spot) {
      var idea = pick();
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'idea';
      el.textContent = idea.chip;
      el.title = idea.prompt;
      el.style.setProperty('--rot', spot.rot);
      if (spot.left) el.style.left = spot.left;
      if (spot.right) el.style.right = spot.right;
      el.style.top = spot.top;
      el.style.animationDelay = (-Math.random() * 7).toFixed(2) + 's';

      var slot = { spot: spot, idea: idea, el: el };
      el.onclick = function () { load(slot.idea); };
      live.push(slot);
      box.appendChild(el);
    });

    // slowly cycle one chip at a time so the wall feels alive
    setInterval(function () {
      if (document.hidden) return;
      var slot = live[(Math.random() * live.length) | 0];
      slot.el.style.transition = 'opacity .5s';
      slot.el.style.opacity = '0';
      setTimeout(function () {
        slot.idea = pick();
        slot.el.textContent = slot.idea.chip;
        slot.el.title = slot.idea.prompt;
        slot.el.style.opacity = '';
      }, 520);
    }, 6500);
  }

  /* =========================================================
     5. THE ROLL
     ========================================================= */
  var roll = new Array(C.SLOTS).fill(null); // {prompt, style, url}
  var busy = new Array(C.SLOTS).fill(false);
  var target = null;
  var queue = [];
  var working = false;

  function filledCount() { return roll.filter(Boolean).length; }

  function updateQueueInfo() {
    var n = filledCount();
    var pending = queue.length + (working ? 1 : 0);
    $('#queueInfo').textContent = 'Roll: ' + n + ' / ' + C.SLOTS + ' frames' +
      (pending ? ' · ' + pending + ' developing' : '');
    $('#printBtn').disabled = n === 0;
    $('#shareBtn').disabled = n === 0;
  }

  function renderStrip() {
    var strip = $('#strip');
    strip.innerHTML = '';
    for (var i = 0; i < C.SLOTS; i++) {
      (function (i) {
        var f = document.createElement('div');
        f.className = 'frame';
        var num = '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>';

        if (busy[i]) {
          f.className += ' busy';
          f.innerHTML = num + '<div class="spin"></div>';
        } else if (roll[i]) {
          f.className += ' filled';
          f.innerHTML = num +
            '<button class="kill" type="button" title="Clear frame">✕</button>' +
            '<img src="' + roll[i].url + '" alt="' + escapeAttr(roll[i].prompt) + '">' +
            '<span class="cap">' + escapeHtml(roll[i].prompt) + '</span>';
          $('img', f).onclick = function () { openLightbox(i); };
          $('.kill', f).onclick = function (e) {
            e.stopPropagation();
            roll[i] = null; persist(); renderStrip(); updateQueueInfo();
          };
        } else {
          f.className += ' empty' + (target === i ? ' target' : '');
          f.innerHTML = num + '<div class="ph">empty<br>frame</div>';
          f.onclick = function () {
            target = (target === i ? null : i);
            renderStrip();
            if (target === i) {
              $('#promptInput').focus();
              say('bot', 'Frame <b>' + String(i + 1).padStart(2, '0') + '</b> is loaded. What are we shooting?');
            }
          };
        }
        strip.appendChild(f);
      })(i);
    }
    updateQueueInfo();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, '&#39;'); }

  function persist() {
    window.STORE.setRoll(roll.map(function (r) {
      return r ? { prompt: r.prompt, style: r.style, url: r.url } : null;
    }));
  }

  function nextEmpty() {
    if (target !== null && !roll[target] && !busy[target]) return target;
    for (var i = 0; i < C.SLOTS; i++) if (!roll[i] && !busy[i]) return i;
    return -1;
  }

  /* ---- the queue worker ---- */
  function enqueue(prompt, slot, styleKey) {
    queue.push({ prompt: prompt, slot: slot, style: styleKey || style });
    busy[slot] = true;
    renderStrip();
    pump();
  }

  function pump() {
    if (working || !queue.length) return;
    working = true;
    var job = queue.shift();
    updateQueueInfo();

    var tick = typing();
    var full = T.buildPrompt(job.prompt, job.style, crew);

    window.NANO.generate(full, crew, job.prompt)
      .then(function (url) {
        tick.done();
        busy[job.slot] = false;
        roll[job.slot] = { prompt: job.prompt, style: job.style, url: url };
        if (target === job.slot) target = null;
        persist(); renderStrip();
        say('bot', 'Frame <b>' + String(job.slot + 1).padStart(2, '0') + '</b> is up. ' +
                   (filledCount() === C.SLOTS ? 'That\'s a full roll — print it.' : ''));
        if (filledCount() === C.SLOTS) FX.burst(160);
      })
      .catch(function (err) {
        tick.done();
        busy[job.slot] = false;
        renderStrip();
        if (err && err.noKey) {
          say('err', 'I need an API key before I can shoot anything. Hit <b>⚙ key</b> up there.');
          openOverlay('keyModal');
        } else {
          say('err', (err && err.message) || 'Something went wrong.');
        }
      })
      .then(function () {
        working = false;
        updateQueueInfo();
        pump();
      });
  }

  function initChat() {
    $('#chatForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#promptInput');
      var text = input.value.trim();
      if (!text) return;

      var slot = nextEmpty();
      if (slot === -1) {
        say('err', 'The roll is full. Clear a frame (hover it, hit ✕) or start a new roll.');
        return;
      }

      say('you', escapeHtml(text));
      input.value = '';
      say('bot', T.PATTER[(Math.random() * T.PATTER.length) | 0] +
                 ' <b>Frame ' + String(slot + 1).padStart(2, '0') + '</b>.');
      enqueue(text, slot);
    });

    $('#clearBtn').onclick = function () {
      if (filledCount() && !confirm('Dump the whole roll and start over?')) return;
      roll = new Array(C.SLOTS).fill(null);
      busy = new Array(C.SLOTS).fill(false);
      target = null;
      persist(); renderStrip();
      say('bot', 'Fresh roll loaded. Five frames, no pressure.');
    };

    window.STORE.getRoll().then(function (saved) {
      if (saved && saved.length === C.SLOTS) {
        roll = saved;
      } else if (T.PRESET_ROLL && T.PRESET_ROLL.length) {
        // first visit: open on the frames that were shot ahead of time
        T.PRESET_ROLL.slice(0, C.SLOTS).forEach(function (r, i) {
          roll[i] = { prompt: r.prompt, style: r.style, url: r.file };
        });
      }
      renderStrip();
      var n = filledCount();
      if (window.PA68_PREVIEW) {
        say('bot', '<b>Preview.</b> This hosted copy can\'t reach the image model — the page sandbox ' +
                   'blocks outside API calls — so frames are drawn placeholders. Everything else is ' +
                   'real: try the looks, the strip, print, share and the vault.');
      } else if (window.NANO.isDemo()) {
        say('bot', '<b>Demo mode.</b> Images are fake, drawn right here — good for checking the layout. ' +
                   'Drop the <code>?demo=1</code> from the URL to shoot for real.');
      }
      var preset = !saved && T.PRESET_ROLL && T.PRESET_ROLL.length;
      say('bot', preset
        ? 'There\'s already a roll in the camera — five we shot earlier. Click any frame to ' +
          'blow it up. Want more? Tell me a scene, or hit <b>New roll</b> to start clean.'
        : (n ? 'Welcome back — ' + n + ' frame' + (n > 1 ? 's' : '') + ' still on the roll.'
             : 'Alright. Tell me where to put you two and I\'ll shoot it. Grab an idea floating ' +
               'around if you want a head start.'));
    });
  }

  /* =========================================================
     6. LIGHTBOX
     ========================================================= */
  var lbIndex = null;

  function openLightbox(i) {
    lbIndex = i;
    $('#lightboxImg').src = roll[i].url;
    $('#lightboxCap').textContent = roll[i].prompt;
    openOverlay('lightbox');
  }

  function initLightbox() {
    $('#lbDownload').onclick = function () {
      if (lbIndex === null || !roll[lbIndex]) return;
      toBlob(roll[lbIndex].url).then(function (b) {
        saveFile(b, 'pa-68-frame-' + (lbIndex + 1) + '.jpg');
      });
    };
    $('#lbRegen').onclick = function () {
      if (lbIndex === null || !roll[lbIndex]) return;
      var item = roll[lbIndex];
      closeOverlay('lightbox');
      say('bot', 'Reshooting frame <b>' + String(lbIndex + 1).padStart(2, '0') + '</b>.');
      roll[lbIndex] = null;
      enqueue(item.prompt, lbIndex, item.style);
      persist();
    };
  }

  /* Handing a file to the viewer.

     Served as a plain web page, an <a download> is all it takes. Served
     inside the claude.ai artifact viewer, that link is inert and the host
     mediates saves through the `downloads` capability instead — so ask for
     it, and fall back to the link when it isn't there. */
  var downloadsApi = null;

  function initDownloads() {
    if (window.claude && typeof window.claude.use === 'function') {
      window.claude.use('downloads').then(
        function (d) { downloadsApi = d; },
        function () {}
      );
    }
  }

  function dataUrlToBlob(url) {
    var comma = url.indexOf(',');
    var mime = (url.slice(0, comma).match(/:(.*?);/) || [])[1] || 'application/octet-stream';
    var bin = atob(url.slice(comma + 1));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  /* Frames are data URLs when freshly generated and file paths when they
     came from the preset roll — normalise either to a Blob. */
  function toBlob(url) {
    if (url.slice(0, 5) === 'data:') return Promise.resolve(dataUrlToBlob(url));
    return fetch(url).then(function (r) { return r.blob(); });
  }

  function saveFile(blob, name) {
    if (downloadsApi) {
      return downloadsApi.save({ filename: name, data: blob }).then(function () {
        say('bot', 'Saved <b>' + name + '</b>.');
      }, function (err) {
        if (err && err.code === 'declined') return;
        say('err', 'Could not save that one' + (err && err.message ? ' — ' + err.message : '') + '.');
      });
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    return Promise.resolve();
  }

  /* =========================================================
     7. PRINT + SHARE
     ========================================================= */
  function buildPrintSheet() {
    var frames = roll.map(function (r, i) { return r ? { r: r, i: i } : null; }).filter(Boolean);
    var body = frames.length
      ? '<div class="ps-grid">' + frames.map(function (f) {
          return '<figure><img src="' + f.r.url + '"><figcaption>' +
                 String(f.i + 1).padStart(2, '0') + ' — ' + escapeHtml(f.r.prompt) +
                 '</figcaption></figure>';
        }).join('') + '</div>'
      : '<p style="text-align:center;font-family:var(--cond);letter-spacing:.2em;' +
        'text-transform:uppercase">Nothing on the roll yet — go shoot five frames.</p>';

    $('#printsheet').innerHTML =
      '<div class="ps-head"><h1>Pa\'s 68th</h1><p>The roll · shot in Brooklyn, mostly</p></div>' +
      body +
      '<div class="ps-foot">Happy birthday, Pa — still the best dancer on the floor</div>';
  }

  /* The page hides almost everything when printing, so whatever triggers a
     print — our button or the browser's own Ctrl+P — has to decide first
     what's actually going on the paper. */
  function preparePrint() {
    if (!document.getElementById('letter').hidden) {
      document.body.classList.remove('printing-roll'); // the open letter prints instead
      return;
    }
    buildPrintSheet();
    document.body.classList.add('printing-roll');
  }

  function initPrint() {
    addEventListener('beforeprint', preparePrint);
    addEventListener('afterprint', function () {
      document.body.classList.remove('printing-roll');
    });
    $('#printBtn').onclick = function () {
      if (!filledCount()) return;
      preparePrint();
      setTimeout(function () { window.print(); }, 60);
    };
    $('#printLetter').onclick = function () { window.print(); };
  }

  /* ---- one shareable image of the whole roll ---- */
  function contactSheet() {
    var frames = roll.filter(Boolean);
    if (!frames.length) return Promise.reject(new Error('Nothing on the roll yet.'));

    var W = 1200, pad = 54, cols = 2;
    var cellW = (W - pad * 3) / cols;
    var cellH = cellW * 0.75;
    var rows = Math.ceil(frames.length / cols);
    var headH = 220, footH = 110;
    var H = headH + rows * (cellH + 74) + footH;

    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var x = cv.getContext('2d');

    // background
    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#150E24'); g.addColorStop(0.5, '#08060B'); g.addColorStop(1, '#1a0c1c');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    // header
    x.textAlign = 'center';
    x.fillStyle = '#F5C24C';
    x.font = '600 22px "Barlow Condensed", Arial, sans-serif';
    x.fillText('B R O O K L Y N   ·   1 9 5 8   ·   F O R E V E R', W / 2, 78);
    x.fillStyle = '#F7EFE2';
    x.font = '96px Anton, Impact, sans-serif';
    x.fillText("PA'S 68TH", W / 2, 168);
    x.strokeStyle = 'rgba(247,239,226,.25)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(pad, headH - 24); x.lineTo(W - pad, headH - 24); x.stroke();

    return Promise.all(frames.map(function (f) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = f.url;
      });
    })).then(function (imgs) {
      imgs.forEach(function (img, i) {
        var col = i % cols, row = (i / cols) | 0;
        var cx = pad + col * (cellW + pad);
        var cy = headH + row * (cellH + 74);

        x.fillStyle = '#000';
        x.fillRect(cx - 4, cy - 4, cellW + 8, cellH + 8);
        if (img) {
          // cover-fit
          var s = Math.max(cellW / img.width, cellH / img.height);
          var dw = img.width * s, dh = img.height * s;
          x.save();
          x.beginPath(); x.rect(cx, cy, cellW, cellH); x.clip();
          x.drawImage(img, cx + (cellW - dw) / 2, cy + (cellH - dh) / 2, dw, dh);
          x.restore();
        }
        x.strokeStyle = 'rgba(247,239,226,.35)'; x.lineWidth = 1;
        x.strokeRect(cx, cy, cellW, cellH);

        x.textAlign = 'left';
        x.fillStyle = 'rgba(247,239,226,.72)';
        x.font = '20px "Barlow Condensed", Arial, sans-serif';
        var cap = frames[i].prompt;
        if (cap.length > 58) cap = cap.slice(0, 55) + '…';
        x.fillText(String(i + 1).padStart(2, '0') + '  ' + cap, cx, cy + cellH + 32);
      });

      x.textAlign = 'center';
      x.fillStyle = '#FF2E88';
      x.font = '600 26px "Barlow Condensed", Arial, sans-serif';
      x.fillText('HAPPY BIRTHDAY, PA — STILL THE BEST DANCER ON THE FLOOR',
                 W / 2, H - footH / 2 + 8);

      return new Promise(function (resolve) {
        cv.toBlob(function (blob) { resolve(blob); }, 'image/jpeg', 0.92);
      });
    });
  }

  function initShare() {
    $('#shareBtn').onclick = function () {
      var btn = this;
      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = '… building';
      contactSheet().then(function (blob) {
        var file = new File([blob], 'pas-68th.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({
            files: [file],
            title: "Pa's 68th",
            text: "Pa's 68th birthday roll 🕺"
          });
        }
        return saveFile(blob, 'pas-68th.jpg');
      }).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        say('err', (err && err.message) || 'Could not build the strip.');
      }).then(function () {
        btn.disabled = false; btn.textContent = old;
        updateQueueInfo();
      });
    };
  }

  /* =========================================================
     8. API KEY PANEL
     ========================================================= */
  function initKey() {
    var note = $('#keyNote');

    function refresh() {
      window.NANO.checkProxy().then(function (proxy) {
        var hasKey = !!window.NANO.getKey();
        $('#keyBtn').classList.toggle('warn', !proxy && !hasKey && !window.NANO.isDemo());
        if (window.NANO.isDemo()) note.textContent = 'Demo mode is on — no key needed, no real images.';
        else if (proxy) note.textContent = 'A server proxy is running. The key lives there; you don\'t need one here.';
        else if (hasKey) note.textContent = 'Key saved in this browser.';
        else note.textContent = '';
      });
    }

    $('#keyBtn').onclick = function () {
      $('#keyInput').value = window.NANO.getKey();
      $('#modelSelect').value = window.NANO.getModel();
      openOverlay('keyModal');
      refresh();
    };
    $('#keySave').onclick = function () {
      window.NANO.setKey($('#keyInput').value.trim());
      window.NANO.setModel($('#modelSelect').value);
      refresh();
      closeOverlay('keyModal');
      say('bot', 'Key\'s in. Let\'s shoot something.');
    };
    $('#keyClear').onclick = function () {
      window.NANO.setKey('');
      $('#keyInput').value = '';
      refresh();
    };
    $('#modelSelect').onchange = function () { window.NANO.setModel(this.value); };

    refresh();
  }

  /* =========================================================
     9. THE VAULT
     ========================================================= */
  var tries = 0;

  function checkPass(input) {
    var v = String(input).trim().toLowerCase();
    var h = window.hashPass(input);
    var vault = C.VAULT;
    for (var name in vault) {
      if (!Object.prototype.hasOwnProperty.call(vault, name)) continue;
      var entry = vault[name];
      if (entry.plain !== undefined) {
        if (String(entry.plain).trim().toLowerCase() === v) return entry;
      } else if (entry.hash && entry.hash === h) return entry;
    }
    return null;
  }

  function showLetter(which) {
    $('#paper').innerHTML = T[which] || '';
    $('#paper').scrollTop = 0;
    closeOverlay('vault');
    openOverlay('letter');
    document.documentElement.scrollTop = 0;
    FX.burst(180);
  }

  function initVault() {
    var seen = window.STORE.local('unlocked');
    if (seen && C.VAULT[seen]) {
      $('#openVault').textContent = 'Open your letter';
      $('#openVault').onclick = function () { showLetter(C.VAULT[seen].letter); };
    } else {
      $('#openVault').onclick = function () {
        openOverlay('vault');
        setTimeout(function () { $('#vaultInput').focus(); }, 80);
      };
    }

    $('#vaultForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var val = $('#vaultInput').value;
      if (!val.trim()) return;
      var hit = checkPass(val);

      if (hit) {
        var name = Object.keys(C.VAULT).filter(function (k) { return C.VAULT[k] === hit; })[0];
        window.STORE.local('unlocked', name);
        $('#vaultMsg').textContent = '';
        $('#vaultMsg').className = 'vault-msg';
        $('#vaultInput').value = '';
        tries = 0;
        showLetter(hit.letter);
        return;
      }

      tries++;
      var box = $('.vault-box');
      box.classList.remove('shake');
      void box.offsetWidth;
      box.classList.add('shake');
      var msg = $('#vaultMsg');
      if (tries >= 4) {
        msg.className = 'vault-msg hint';
        msg.textContent = 'Hint: it\'s printed on the card. The paper one. In your hand.';
      } else {
        msg.className = 'vault-msg';
        msg.textContent = C.REJECTIONS[Math.min(tries - 1, C.REJECTIONS.length - 1)];
      }
      $('#vaultInput').select();
    });
  }

  /* =========================================================
     10. OVERLAY PLUMBING
     ========================================================= */
  function openOverlay(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    if (!$$('.overlay:not([hidden])').length) document.body.style.overflow = '';
  }

  function initOverlays() {
    $$('[data-close]').forEach(function (b) {
      b.onclick = function () { closeOverlay(b.dataset.close); };
    });
    addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = $$('.overlay:not([hidden])');
      if (open.length) closeOverlay(open[open.length - 1].id);
    });
    // click the dark surround to dismiss (but not the letter — too easy to lose your place)
    ['vault', 'lightbox', 'keyModal'].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('click', function (e) { if (e.target === el) closeOverlay(id); });
    });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    initDownloads();
    buildFloor();
    buildWindows();
    reveals();
    counters();
    topbar();
    initOverlays();
    initIdeas();
    initStyles();
    initCrew();
    initChat();
    initLightbox();
    initPrint();
    initShare();
    initKey();
    initVault();
    renderStrip();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
