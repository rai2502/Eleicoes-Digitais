# Documentação técnica

## Arquitetura
`index.html` / `resultado.html` / `offline.html` + `style.css` + `app.js` (UI) + `db.js` (IndexedDB, usado pela página **e** pelo SW via `importScripts`) + `sw.js` + `manifest.webmanifest`.

## Estratégia de cache
Dois caches versionados (`eleicao-shell-v1`, `eleicao-externo-v1`); o `activate` apaga versões antigas.
| Recurso | Estratégia | Justificativa |
|---|---|---|
| Shell (HTML, CSS, JS, ícones) | Precache no `install` + Cache First | Muda pouco; abre instantaneamente e offline |
| Navegações (páginas) | Network First (timeout 4 s) → cache → `offline.html` | Pega a versão nova se houver rede; tolera rede instável |
| `data/candidatos.json` | Network First | Dados podem mudar; cache garante o modo offline |
| Fontes do Google | Stale While Revalidate | Cross-origin; mostra o cache e atualiza em segundo plano |

Ao alterar arquivos do app, aumente `VERSAO` em `sw.js`.

## Background Sync
1. `votar()` grava o voto em `fila` e a marca `meuVoto` em `meta` (impede 2º voto).
2. `registration.sync.register('sincronizar-votos')`.
3. Evento `sync` no SW → `sincronizarPendencias()`: testa a rede com `fetch(..., {cache:'no-store'})` (se falhar, o navegador repete depois), move itens de `fila` para `votos` (servidor simulado) e envia `SYNC_DONE` às páginas.
4. Fallback: evento `online` + mensagem `SYNC_NOW`.
Estados exibidos: *pendente* (`fila`) e *sincronizado* (`votos`). A apuração só conta `votos` + `votosIniciais` do JSON.

## Push Notifications
**Simulado:** botões do painel → `postMessage({type:'SIMULAR_PUSH'})` → `showNotification`. **Real (já implementado no SW):** handler `push` lê JSON `{titulo, body, url}`; teste em DevTools › Application › Service Workers › *Push*. `notificationclick` foca/abre a URL.
**Em produção seria necessário:** servidor com chaves VAPID, `pushManager.subscribe()`, armazenar a assinatura e enviar via Web Push. Sem coleta de dados pessoais; só 3 mensagens manuais para evitar excesso.

## Preload / Prefetch / DNS-prefetch
| Técnica | Alvo | Por quê | Como validar |
|---|---|---|---|
| preload | `style.css` | CSS crítico para a primeira pintura | Network › prioridade *Highest*, iniciador "Preload" |
| prefetch | `resultado.html` | Próxima página provável | Network › tipo *prefetch*, prioridade *Lowest* |
| dns-prefetch | `fonts.googleapis.com`, `fonts.gstatic.com` | Domínios externos usados pela fonte | Network › Timing: DNS Lookup menor |

## Testes e limitações
Ver `ROTEIRO-TESTES.md` e a seção 12 do README.

## Desafio extra (Lighthouse)
Registrem Antes → Otimização → Depois (Performance, Acessibilidade, Boas práticas, PWA). Ideias: `font-display:swap` (já usado), ajustar contraste, comprimir ícones.
