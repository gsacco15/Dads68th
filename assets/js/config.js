/* =============================================================
   CONFIG — the knobs you'll actually want to turn.
   ============================================================= */
window.CONFIG = {

  /* -----------------------------------------------------------
     THE VAULT
     -----------------------------------------------------------
     Two ways in, two completely different letters.

     Passwords are stored as SHA-256 hashes so nobody snooping
     through "view source" spoils it. Input is trimmed and
     lower-cased before hashing, so "Wilmette", " wilmette "
     and "WILMETTE" all work.

     TO CHANGE A PASSWORD:
       1. open this page in a browser
       2. open the dev console (F12)
       3. run:  hashPass("your new word")
       4. paste the 64-character result below.

     Prefer plain text? Swap `hash:` for `plain: "yourword"` and
     it'll be compared directly (but it will be visible in source).
  ----------------------------------------------------------- */
  VAULT: {
    real: {
      // "Wilmette"  <- placeholder. Replace with the word you print on his card.
      hash: '9f888cb58193849615e627f6b7a12b4a5824d405f0f7b9e12241abc4cd178155',
      letter: 'REAL_LETTER'
    },
    decoy: {
      // "1315"  <- the one the sisters will get their hands on.
      hash: 'b3b32ef85491ba019823218698a8dc82ed5ea963b1c0444cda283894440de5f9',
      letter: 'DECOY_LETTER'
    }
  },

  /* Bouncer lines for a wrong password, in order. Last one repeats. */
  REJECTIONS: [
    "That's not it, sweetheart.",
    "Nope. Try again.",
    "You're not on the list, pal.",
    "Still no. This is getting embarrassing for both of us.",
    "The word is on the card. You do have a card, right?"
  ],

  /* -----------------------------------------------------------
     IMAGE GENERATION (Nano Banana / Gemini)
     -----------------------------------------------------------
     The app talks to Google directly from the browser using a key
     you paste into the ⚙ panel (stored in localStorage only).

     If you'd rather keep the key on a server, run `node server.js`
     with GEMINI_API_KEY set — the page will find /api/generate on
     its own and never ask for a key.
  ----------------------------------------------------------- */
  MODEL: 'gemini-2.5-flash-image',   // "Nano Banana" — the cheap, known-good one
  API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/',
  PROXY_PATH: '/api/generate',

  SLOTS: 5,          // frames on the roll
  MAX_CREW: 4,       // reference photos
  CREW_MAX_PX: 1024, // references get downscaled to this before upload
  ASPECT: '4:3'
};
