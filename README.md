# 🕺 Pa @ 68 — Saturday Night Forever

A one-page birthday site for Dad's 68th. Brooklyn, 1977, mirror ball, bad decisions.

Three things live here:

1. **A scrollable landing page** — neon hero over a lit dance floor, marquee tickers, a skyline, "the legend (mostly true)."
2. **The Photo Booth** — an AI image booth that puts *Pa and Grant* into absurd scenes. Type a prompt (or grab one of the ideas floating around the chat box), and it fills a five-frame film strip you can print, save as a PDF, or share as one image.
3. **The Vault** — a password screen with **two** doors. The word on Dad's card opens the real letter. A different PIN opens a completely different, very long letter.

No build step, no framework, no `npm install`. It's HTML, CSS and a few files of plain JavaScript.

---

## Run it

**The quick way** — double-click `index.html`. Everything works except image generation (browsers block cross-origin calls from `file://`).

**The real way** — a tiny zero-dependency server:

```bash
node server.js
# → http://localhost:5173
```

**Kick the tyres without spending any quota:**

```
http://localhost:5173/?demo=1
```

Demo mode draws fake frames locally so you can see the whole flow — queueing, the film strip, printing, sharing — without an API key.

---

## The photo booth

### 1. Give it an API key

The booth uses **Nano Banana** (Google's `gemini-2.5-flash-image`). Grab a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Two ways to wire it in:

| | How | Who should use it |
|---|---|---|
| **Browser key** | Click **⚙ key** in the chat header and paste it | You, on your own machine. The key is saved in *your* `localStorage` and never leaves your browser except to go to Google. If you host the site, visitors don't get your key — they'd need their own. |
| **Server key** | `GEMINI_API_KEY=xxx node server.js` | Hosting it for the family. The page detects `/api/generate`, stops asking for a key, and everyone shoots on your quota. |

There's a **Nano Banana Pro** option (`gemini-3-pro-image-preview`) in the same panel — slower and pricier, noticeably sharper.

### 2. Reference photos — already done

**The Crew** loads four reference crops of Pa and Grant automatically from
`assets/crew/`, so every generation has them without anyone uploading anything.
Open the panel and you'll see them tagged Pa / Pa / Grant / Grant.

Adding your own overrides the standing set (they're saved in that browser's
IndexedDB). What matters if you do:

- **Crop tight on the face.** This is the single biggest factor. In a full-scene
  photo the face is a couple of percent of the frame, the model has almost
  nothing to work from, and it invents a generic stranger instead. Waist-up is
  already too loose.
- Two angles per person beats one.
- Good light, no sunglasses, no hat brim shadowing the eyes.
- Tag each with the dropdown — that's what tells the model who's who.

### 2b. Use the Pro model for faces

`gemini-3-pro-image` holds facial identity dramatically better than the flash
models on an identical prompt. That difference is the whole ballgame here, so
it's the default. The flash models are cheaper and fine for scenery, but they
drift on likeness.

The prompt wrapper in `content.js` also demands close framing on purpose —
left to itself the model composes wide landscapes with both faces small and in
profile, which throws the likeness away no matter how good the references are.

### 3. Shoot

Type a prompt and hit enter. Fire off all five in a row if you like — they queue up and develop one at a time. Click an empty frame first to aim at a specific slot, hover a frame to clear it, click a photo to enlarge / save / reshoot.

The four **look** buttons (70s Film, Disco Inferno, Movie Poster, Polaroid) change the styling applied to every prompt.

### 4. Get it out

- **Print / PDF** — a proper contact sheet. Your browser's print dialog has "Save as PDF."
- **Share strip** — composites all five into one captioned image. On a phone this opens the native share sheet; on a desktop it downloads.

---

## The Vault

Two passwords, two letters, and they behave identically so nobody can tell which door they walked through.

| Password | Opens |
|---|---|
| `Wilmette` | The real letter. **Placeholder — change this to whatever you print on his card.** |
| `1315` | The decoy. ~2,200 words about a coffin, some marionettes and a Lionel train set. |

Anything else gets a bouncer line and a shake. Four wrong tries and it hints that the word is on the card.

### Changing the password

Passwords are stored as SHA-256 hashes so a nosy sister reading the page source doesn't get a free win.

1. Open the page, open the browser console (F12)
2. Run `hashPass("your new word")`
3. Paste the 64-character result into `assets/js/config.js` → `VAULT.real.hash`

Input is trimmed and lower-cased before hashing, so `Wilmette`, `wilmette` and `  WILMETTE ` all work.

Prefer plain text? Replace `hash: "..."` with `plain: "yourword"` in that same file — simpler, but readable in the source.

> This is a party trick, not a security control. Anyone determined enough with dev tools can read both letters. It's built to stop a sister with a phone, and it does.

### Changing the letters

Both live in `assets/js/content.js`, near the bottom, clearly marked. They're just HTML strings:

- `REAL_LETTER` — **write your own words here.** Mine is a decent skeleton but it should sound like you.
- `DECOY_LETTER` — the long one. Leave it be, it's doing important work.

Handy bits: `<h2>` for a section break, `<strong>` for the gold highlighter effect, `<hr>` for a divider, `<p class="sig">` for the signature, `<p class="ps">` for a postscript.

---

## Deploying it

**Static host** (GitHub Pages, Netlify drop, anything) — push the folder. Everything works; each person brings their own API key via the ⚙ panel.

**Vercel / Netlify with functions** — push the folder, set `GEMINI_API_KEY` in the project's environment variables. `api/generate.js` picks it up and nobody needs a key. Note this means anyone with the link spends your quota, so don't post it publicly.

---

## File map

```
index.html               the whole page
assets/css/style.css     all the styling, including the print stylesheet
assets/css/fonts.css     self-hosted @font-face rules
assets/fonts/            the font files (see NOTICE)
assets/crew/             the four reference face crops, loaded automatically
assets/roll/             the five frames the page opens with
assets/js/config.js      ← passwords, model, slot count
assets/js/content.js     ← the letters, the idea prompts, the prompt template
assets/js/app.js         UI: chat, queue, film strip, vault, print, share
assets/js/nano.js        talks to the image model
assets/js/store.js       IndexedDB + localStorage persistence
assets/js/sha256.js      hashing for the vault
server.js                zero-dependency static server + API proxy
api/generate.js          the same proxy, as a serverless function
```

The two files you'll actually want to edit are marked with `←`.

---

Happy birthday, Pa. 🪩
