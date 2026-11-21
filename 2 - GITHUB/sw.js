/* Caixa Zenith - service worker
   - Página: busca sempre a versão nova na internet (se não tiver internet, abre a última salva)
   - Ícones e bibliotecas: guarda no aparelho
   - Dados (Supabase): nunca guarda, sempre direto do servidor */
const CACHE = 'caixa-zenith-v1';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co') || u.hostname.endsWith('supabase.in')) return;   // dados: nunca do cache
  if (r.mode === 'navigate' || (u.origin === location.origin && u.pathname.endsWith('.html'))) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok && (u.origin === location.origin || u.hostname === 'cdn.jsdelivr.net' || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com'))) {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res; })));
});
