/* Camada IndexedDB compartilhada entre a página (window) e o Service Worker (self). */
(function (g) {
  const NOME = 'eleicao-db', VERSAO = 1;
  function abrir() {
    return new Promise((ok, erro) => {
      const r = indexedDB.open(NOME, VERSAO);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('fila')) d.createObjectStore('fila', { keyPath: 'id' });   // votos pendentes
        if (!d.objectStoreNames.contains('votos')) d.createObjectStore('votos', { keyPath: 'id' }); // votos sincronizados
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });    // meuVoto etc.
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => erro(r.error);
    });
  }
  async function tx(store, modo, fn) {
    const d = await abrir();
    return new Promise((ok, erro) => {
      const t = d.transaction(store, modo);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => { d.close(); ok(req && req.result); };
      t.onerror = t.onabort = () => { d.close(); erro(t.error); };
    });
  }
  g.DB = {
    put: (s, v) => tx(s, 'readwrite', o => o.put(v)),
    get: (s, k) => tx(s, 'readonly', o => o.get(k)),
    all: s => tx(s, 'readonly', o => o.getAll()),
    del: (s, k) => tx(s, 'readwrite', o => o.delete(k)),
    clear: s => tx(s, 'readwrite', o => o.clear())
  };
})(self);
