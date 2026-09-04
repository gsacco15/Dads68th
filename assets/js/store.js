/* =============================================================
   STORE — keeps the roll and the reference photos around so a
   refresh doesn't cost you five generations.

   Images go in IndexedDB (they're too big for localStorage).
   Small settings go in localStorage. Everything degrades quietly
   if storage is blocked (private windows, file:// on some
   browsers) — you just lose persistence, not the app.
   ============================================================= */
window.STORE = (function () {
  'use strict';

  var DB_NAME = 'pa68';
  var STORE_NAME = 'kv';
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      try {
        if (!('indexedDB' in window)) return resolve(null);
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }

  function idbGet(key) {
    return openDB().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_NAME, 'readonly');
          var req = tx.objectStore(STORE_NAME).get(key);
          req.onsuccess = function () { resolve(req.result === undefined ? null : req.result); };
          req.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    });
  }

  function idbSet(key, value) {
    return openDB().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(value, key);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
          tx.onabort = function () { resolve(false); };
        } catch (e) { resolve(false); }
      });
    });
  }

  /* ---- small settings ---- */
  function local(key, value) {
    try {
      if (value === undefined) return localStorage.getItem('pa68.' + key);
      if (value === null) { localStorage.removeItem('pa68.' + key); return null; }
      localStorage.setItem('pa68.' + key, value);
      return value;
    } catch (e) { return null; }
  }

  return {
    getRoll:  function () { return idbGet('roll'); },
    setRoll:  function (roll) { return idbSet('roll', roll); },
    getCrew:  function () { return idbGet('crew'); },
    setCrew:  function (crew) { return idbSet('crew', crew); },
    local:    local
  };
})();
