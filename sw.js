/* =========================================================================
   sw.js - service worker

   Zorgt dat Rekenkitty ook werkt zonder internet (bijvoorbeeld in de auto of
   als de wifi even wegvalt). Er wordt eerst het netwerk geprobeerd, zodat een
   nieuwe versie meteen doorkomt; lukt dat niet, dan komt hij uit de cache.

   Heb je bestanden aangepast? Zet dan hieronder VERSIE een nummer hoger, dan
   ruimt de tablet de oude cache op.
   ========================================================================= */
const VERSIE = "rekenkitty-v2";

const BESTANDEN = [
  "./",
  "index.html",
  "css/stijl.css",
  "js/kern.js",
  "js/voortgang.js",
  "js/spellen.js",
  "js/spellen2.js",
  "js/app.js",
  "manifest.webmanifest",
  "iconen/icoon-192.png",
  "iconen/icoon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSIE)
      .then(c => c.addAll(BESTANDEN))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== VERSIE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(antwoord => {
        const kopie = antwoord.clone();
        caches.open(VERSIE).then(c => c.put(e.request, kopie)).catch(() => {});
        return antwoord;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
