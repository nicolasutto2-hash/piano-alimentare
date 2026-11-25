// Service worker: prima la rete (così gli aggiornamenti arrivano subito), poi la copia salvata (per usare l'app senza internet).
const CACHE = 'piano-v12';
const CORE = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'icons/icon-192.png',
  'js/config.js','js/data.js','js/core.js','js/platform.js','js/profile.js','js/health.js','js/checkup.js','js/views_top.js','js/views_keep.js','js/views_extra.js','js/views_more.js','js/assist.js','js/views_bottom.js','js/app_tail.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => fetch(new Request(u, {cache:'reload'})).then(r => r.ok ? c.put(u, r) : null).catch(()=>null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;   // font e servizio assistente: non toccarli
  e.respondWith(
    fetch(req, {cache:'no-cache'}).then(res => {
      if(res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
