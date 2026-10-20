/* Service Worker · Eleições Digitais */
importScripts('./db.js');

const VERSAO = 'v3';
const CACHE_SHELL = `eleicao-shell-${VERSAO}`;     // arquivos do app + dados
const CACHE_EXTERNO = `eleicao-externo-${VERSAO}`; // fontes do Google
const SHELL = ['./', './index.html', './resultado.html', './offline.html', './style.css', './app.js', './db.js',
  './data/candidatos.json', './manifest.webmanifest', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_SHELL).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => ![CACHE_SHELL, CACHE_EXTERNO].includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---------- Estratégias de cache ---------- */
const comTimeout = req => fetch(req, { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined });

// Network First: páginas e dados (sempre tenta o mais novo; cai para o cache)
async function networkFirst(req, fallback) {
  const cache = await caches.open(CACHE_SHELL);
  try {
    const res = await comTimeout(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (fallback ? await cache.match(fallback) : Response.error());
  }
}

// Cache First: arquivos estáticos do app (CSS, JS, ícones)
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE_SHELL)).put(req, res.clone());
    return res;
  } catch { return new Response('Recurso indisponível offline', { status: 503, statusText: 'Offline' }); }
}

// Stale While Revalidate: recursos externos (fontes)
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_EXTERNO);
  const hit = await cache.match(req);
  const rede = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || rede;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') return e.respondWith(networkFirst(req, './offline.html'));
  if (url.origin !== location.origin) return e.respondWith(staleWhileRevalidate(req));
  if (url.pathname.endsWith('/candidatos.json')) return e.respondWith(networkFirst(req));
  e.respondWith(cacheFirst(req));
});

/* ---------- Background Sync ---------- */
let emAndamento = null;

function sincronizarPendencias() {
  if (emAndamento) return emAndamento;
  const p = (async () => {
    const fila = await DB.all('fila');
    if (!fila.length) return 0;
    // Teste de conectividade: lança erro se estiver offline -> o navegador tenta o sync de novo depois.
    await fetch('./manifest.webmanifest', { cache: 'no-store' });
    await new Promise(r => setTimeout(r, 800)); // simula o tempo de envio ao servidor
    let n = 0;
    for (const voto of fila) {
      await DB.put('votos', { ...voto, syncedAt: Date.now() }); // "servidor" simulado (apuração)
      await DB.del('fila', voto.id);
      n++;
    }
    const clientes = await self.clients.matchAll({ includeUncontrolled: true });
    clientes.forEach(c => c.postMessage({ type: 'SYNC_DONE', count: n }));
    return n;
  })();
  emAndamento = p.finally(() => { emAndamento = null; });
  return emAndamento;
}

self.addEventListener('sync', e => {
  if (e.tag === 'sincronizar-votos') e.waitUntil(sincronizarPendencias());
});

/* ---------- Push e notificações ---------- */
function notificar(titulo, body, url) {
  return self.registration.showNotification(titulo || 'Eleições Digitais', {
    body, icon: './assets/icon-192.png', badge: './assets/icon-192.png', tag: 'eleicao', data: { url: url || './index.html' }
  });
}

// Push real (servidor ou botão "Push" do DevTools)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(notificar(d.titulo, d.body || 'Há uma nova atualização da eleição.', d.url || './resultado.html'));
});

// Mensagens vindas da página (simulação de push e sincronização manual)
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type === 'SIMULAR_PUSH') e.waitUntil(notificar(m.titulo, m.body, m.url));
  if (m.type === 'SYNC_NOW') e.waitUntil(sincronizarPendencias().catch(() => {}));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const alvo = new URL(e.notification.data.url, self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const aberta = cs.find(c => 'focus' in c);
    return aberta ? aberta.navigate(alvo).then(c => c && c.focus()) : self.clients.openWindow(alvo);
  }));
});
