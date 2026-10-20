/* Eleições Digitais · lógica da página (votação, fila offline, notificações) */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const DADOS_PADRAO = {
  evento: 'Eleição do Grêmio Estudantil 2026',
  candidatos: [
    { numero: 10, nome: 'Juntos pela Escola', emoji: '🎓', lema: 'A voz do estudante em ação dentro e fora da sala.', propostas: ['Mais eventos culturais e acadêmicos', 'Melhoria do ambiente escolar e da sinalização', 'Ações de apoio ao bem-estar estudantil'] },
    { numero: 20, nome: 'Voz Estudantil', emoji: '📢', lema: 'Representatividade, escuta e projetos que atendem ao cotidiano.', propostas: ['Canais permanentes de diálogo com a direção', 'Ações de mobilização e participação estudantil', 'Projetos para melhoria da vida escolar'] },
    { numero: 30, nome: 'Ação e Futuro', emoji: '🚀', lema: 'Inovação com responsabilidade social e protagonismo jovem.', propostas: ['Laboratórios e oficinas de tecnologia e pesquisa', 'Projetos de empreendedorismo estudantil', 'Parcerias para eventos e feiras de conhecimento'] },
    { numero: 40, nome: 'União Estudantil', emoji: '🤝', lema: 'Fortalecer a comunidade escolar com inclusão e participação.', propostas: ['Programas de acolhimento e inclusão', 'Atividades de esporte, arte e cultura', 'Projetos de convivência e convivência escolar'] }
  ],
  votosIniciais: { 10: 14, 20: 18, 30: 9, 40: 11 }
};
let DADOS = DADOS_PADRAO;

function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 3500);
}

async function carregarDados() {
  try {
    const r = await fetch('data/candidatos.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    DADOS = await r.json();
    if (!DADOS || !Array.isArray(DADOS.candidatos)) throw new Error('Formato inválido');
    return DADOS;
  } catch (erro) {
    console.warn('Usando dados locais de fallback:', erro);
    DADOS = DADOS_PADRAO;
    return DADOS;
  }
}

function atualizarConexao() {
  const el = $('#conexao'); if (!el) return;
  el.dataset.on = navigator.onLine;
  el.textContent = navigator.onLine ? 'Online' : 'Offline';
}

/* ---------- Service Worker ---------- */
async function registrarSW() {
  if (!('serviceWorker' in navigator)) return;
  try { await navigator.serviceWorker.register('sw.js'); console.log('SW registrado'); }
  catch (e) { console.error('Falha ao registrar SW', e); }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'SYNC_DONE') {
      toast(`${e.data.count} voto(s) sincronizado(s) com sucesso`);
      atualizarTudo();
    }
  });
}

async function pedirSync() {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  if ('sync' in reg) await reg.sync.register('sincronizar-votos');         // Background Sync
  else if (navigator.onLine && reg.active) reg.active.postMessage({ type: 'SYNC_NOW' }); // alternativa (Safari/Firefox)
}

/* ---------- Home: candidatos e votação ---------- */
function renderCandidatos() {
  const dados = DADOS || DADOS_PADRAO;
  $('#lista-candidatos').innerHTML = dados.candidatos.map(c => `
    <article class="cand">
      <div class="urna"><span class="num" aria-label="Número ${c.numero}">${c.numero}</span><span class="emoji" aria-hidden="true">${c.emoji}</span></div>
      <div class="corpo"><h3>${esc(c.nome)}</h3><p>${esc(c.lema)}</p>
      <details><summary>Ver propostas</summary><ul>${c.propostas.map(p => `<li>${esc(p)}</li>`).join('')}</ul></details></div>
    </article>`).join('');
  $('#opcoes').insertAdjacentHTML('beforeend', dados.candidatos.map(c => `
    <label class="opcao"><input type="radio" name="voto" value="${c.numero}"><span class="num">${c.numero}</span><span>${esc(c.nome)}</span></label>`).join(''));
}

async function atualizarVotacao() {
  const meu = await DB.get('meta', 'meuVoto');
  const fila = await DB.all('fila');
  const f = $('#fila-qtd'); if (f) f.textContent = fila.length;
  const msg = $('#msg-voto'), form = $('#form-voto');
  if (!meu) { msg.textContent = ''; msg.className = 'msg'; form.querySelectorAll('input,button').forEach(i => i.disabled = false); return; }
  form.querySelectorAll('input,button').forEach(i => i.disabled = true);
  const radio = form.querySelector(`input[value="${meu.v.candidato}"]`); if (radio) radio.checked = true;
  const dados = DADOS || DADOS_PADRAO;
  const c = dados.candidatos.find(x => x.numero === meu.v.candidato) || { nome: 'Candidato desconhecido' };
  const pend = fila.some(v => v.id === meu.v.id);
  msg.className = 'msg ' + (pend ? 'pend' : 'ok');
  msg.textContent = pend
    ? `Voto em ${c.nome} registrado neste aparelho. Status: PENDENTE de sincronização.`
    : `Voto em ${c.nome} confirmado e sincronizado. Obrigado!`;
}

async function votar(ev) {
  ev.preventDefault();
  const msg = $('#msg-voto');
  const sel = document.querySelector('input[name="voto"]:checked');
  if (!sel) { msg.className = 'msg erro'; msg.textContent = 'Escolha um tema antes de confirmar.'; return; }
  if (await DB.get('meta', 'meuVoto')) { msg.className = 'msg erro'; msg.textContent = 'Você já votou nesta sessão.'; return; }
  const voto = { id: uid(), candidato: Number(sel.value), ts: Date.now() };
  await DB.put('fila', voto);                       // 1) guarda localmente
  await DB.put('meta', { k: 'meuVoto', v: voto });  // 2) bloqueia duplicidade
  await atualizarTudo();
  toast(navigator.onLine ? 'Voto registrado. Enviando…' : 'Sem conexão: voto guardado para envio posterior.');
  await pedirSync();                                // 3) agenda sincronização
}

/* ---------- Notificações ---------- */
function enviarNotificacaoSimulada({ titulo, body, url }) {
  const payload = {
    titulo: titulo || 'Grêmio Estudantil',
    body: body || 'Há uma nova atualização da eleição.',
    url: url || 'index.html'
  };

  return (async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg && reg.active) {
          reg.active.postMessage({ type: 'SIMULAR_PUSH', titulo: payload.titulo, body: payload.body, url: payload.url });
          return true;
        }
      }
    } catch (e) {
      console.warn('Falha ao disparar push via SW:', e);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.titulo, {
        body: payload.body,
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        data: { url: payload.url }
      });
      return true;
    }

    return false;
  })();
}

function atualizarNotif() {
  const el = $('#notif-estado'); if (!el) return;
  const ok = 'Notification' in window;
  const p = ok ? Notification.permission : 'indisponível';
  el.textContent = 'Permissão: ' + ({ granted: 'concedida', denied: 'negada', default: 'não solicitada' }[p] || p);
  document.querySelectorAll('[data-push]').forEach(b => b.disabled = p !== 'granted');
  $('#btn-notif').disabled = !ok || p === 'granted';
}

function configurarPainel() {
  $('#btn-notif').onclick = async () => {
    if (!('Notification' in window)) {
      toast('Seu navegador não suporta notificações.');
      return;
    }
    const perm = await Notification.requestPermission();
    atualizarNotif();
    if (perm === 'granted') {
      toast('Notificações ativadas.');
    }
  };

  document.querySelectorAll('[data-push]').forEach(b => b.onclick = async () => {
    const ok = await enviarNotificacaoSimulada({
      titulo: 'Grêmio Estudantil',
      body: b.dataset.body,
      url: b.dataset.url
    });

    if (ok) {
      toast('Notificação enviada.');
    } else {
      toast('Ative as notificações para receber o aviso.');
    }
  });

  $('#btn-sync').onclick = async () => { toast('Tentando sincronizar…'); await pedirSync(); };
  $('#btn-reset').onclick = async () => {
    for (const s of ['fila', 'votos', 'meta']) await DB.clear(s);
    toast('Simulação reiniciada.'); atualizarTudo();
  };
  atualizarNotif();
}

/* ---------- Resultado ---------- */
async function renderResultado() {
  const dados = DADOS || DADOS_PADRAO;
  const votos = await DB.all('votos'), fila = await DB.all('fila');
  const cont = {};
  dados.candidatos.forEach(c => cont[c.numero] = Number(dados.votosIniciais?.[c.numero] || 0));
  votos.forEach(v => { if (Object.prototype.hasOwnProperty.call(cont, v.candidato)) cont[v.candidato]++; });

  const total = Object.values(cont).reduce((a, b) => a + b, 0);
  const lista = dados.candidatos.map(c => ({ ...c, n: cont[c.numero] })).sort((a, b) => b.n - a.n);

  $('#resumo').textContent = `${total} votos contabilizados. Liderando: ${lista[0].nome}.`;
  $('#barras').innerHTML = lista.map(c => {
    const pct = total ? Number(((c.n / total) * 100).toFixed(1)) : 0;
    const plural = c.n === 1 ? 'voto' : 'votos';
    return `
      <li>
        <span class="nome"><span class="num" aria-hidden="true">${c.numero}</span> ${c.emoji} ${esc(c.nome)}</span>
        <div class="trilho"><div class="preench" style="width:${pct}%"></div></div>
        <strong class="valor">${c.n} ${plural} · ${pct}%</strong>
      </li>`;
  }).join('');

  const p = $('#pendentes');
  p.className = 'msg ' + (fila.length ? 'pend' : '');
  p.textContent = fila.length ? `${fila.length} voto(s) aguardando sincronização.` : '';
}

async function atualizarTudo() {
  if (document.body.dataset.page === 'home') await atualizarVotacao();
  else await renderResultado();
}

/* ---------- Início ---------- */
(async function iniciar() {
  atualizarConexao();
  addEventListener('online', () => { atualizarConexao(); toast('Conexão restabelecida'); pedirSync(); });
  addEventListener('offline', () => { atualizarConexao(); toast('Você está offline. O app continua funcionando.'); });
  registrarSW();
  try { await carregarDados(); }
  catch { const a = $('#lista-candidatos') || $('#barras'); a.innerHTML = '<p class="msg erro">Não foi possível carregar os dados. Conecte-se uma vez para salvá-los no aparelho.</p>'; return; }
  if (document.body.dataset.page === 'home') {
    renderCandidatos(); configurarPainel();
    $('#form-voto').addEventListener('submit', votar);
  }
  atualizarTudo();
})();
