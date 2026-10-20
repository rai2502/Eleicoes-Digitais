# 1. Eleição do Grêmio Estudantil 2026

**Equipe:** Squad Gremio Digital · **Integrantes:** 4 estudantes · **Curso:** Técnico em Desenvolvimento de Sistemas · **Prof.:** Leandro Gaudio Rosa

## 2. Objetivo e público
Eleição **simulada** para escolher a chapa do Grêmio Estudantil da escola. Público: estudantes, professores e comunidade escolar. Nenhum voto é real e nenhum dado pessoal é coletado. A pergunta-guia é: *o que continua funcionando quando a internet cai?* → **tudo**: abrir o app, ver candidatos e propostas, votar e acompanhar a fila de sincronização.

## 3. Aplicação publicada
_(adicione aqui o link do GitHub Pages / Netlify / Vercel, se houver)_

## 4. Tecnologias
HTML5, CSS3, JavaScript puro, Service Worker, Cache API, IndexedDB, Background Sync, Notifications/Push, Web App Manifest. Sem frameworks e sem dependências.

## 5. Funcionalidades implementadas
| Requisito | Onde |
|---|---|
| Candidatos e propostas | `index.html` + `data/candidatos.json` |
| Votação simulada, sem duplicidade | `app.js` (`votar`, chave `meuVoto` no IndexedDB) |
| Apuração | `resultado.html` |
| Offline | `sw.js` (precache + fallback `offline.html`) |
| Sincronização | `sw.js` (`sync` / `sincronizarPendencias`) |
| Notificação | painel da home + `push`/`notificationclick` no `sw.js` |

## 6. Estratégia de cache e funcionamento offline
A aplicação usa um shell do app com precache na instalação. A estratégia foi:
- **Network First** para páginas e dados dinâmicos (`index.html`, `resultado.html`, `candidatos.json`), permitindo exibir a versão mais recente quando houver rede e cair para o cache quando a conexão falhar.
- **Cache First** para arquivos estáticos como CSS, JavaScript e ícones, que são fundamentais para manter a interface funcionando offline.
- **Stale While Revalidate** para recursos externos, como as fontes do Google, reduzindo indisponibilidade e mantendo o visual funcional.
- **Fallback** para `offline.html` quando a página requisitada não pode ser carregada.

## 7. Estratégia de Background Sync
O voto é salvo primeiro no IndexedDB na store `fila` e bloqueado por sessão via `meuVoto`. Quando a rede volta, o Service Worker registra o evento `sync` com `sync.register('sincronizar-votos')` e envia os votos pendentes para o armazenamento simulado `votos`. A página recebe confirmação por `postMessage` e atualiza a apuração.

## 8. Estratégia de Push Notifications
A aplicação usa uma **simulação didática controlada**: a página solicita permissão e dispara uma mensagem para o Service Worker, que chama `showNotification`. Também há suporte ao evento `push`, em cenário real com backend e VAPID. O clique na notificação leva o usuário para a página relevante.

## 9. Justificativa para preload, prefetch e DNS-prefetch
- `preload` de `style.css`: este recurso é essencial para renderização inicial e reduz o “FOUC” na primeira pintura.
- `prefetch` de `resultado.html`: a navegação para a página de apuração é provável após votar, então o navegador pode buscar em segundo plano.
- `dns-prefetch` para `fonts.googleapis.com` e `fonts.gstatic.com`: os domínios externos são usados pela fonte do projeto, então a resolução do DNS é antecipada para melhorar o tempo de resposta.

## 10. Testes realizados e evidências
Os testes incluem:
- carregamento da página com internet;
- desligamento da rede no DevTools e acesso às telas em cache;
- confirmação de que o voto é salvo em `fila` e aparece como pendente;
- retorno da conexão e sincronização dos votos;
- verificação do Service Worker e do Cache Storage;
- validação de notificações e do `manifest` no DevTools.

Evidências: ver a pasta [`screenshots/`](screenshots/) e o roteiro em [`docs/ROTEIRO-TESTES.md`](docs/ROTEIRO-TESTES.md).

## 11. Problemas encontrados e soluções
Durante o desenvolvimento, o principal desafio foi manter o app funcional quando offline sem perder dados. A solução foi separar a lógica em duas camadas: persistência local em IndexedDB e sincronização assíncrona via Service Worker. Também foi necessário versionar o cache para evitar que versões antigas do app fossem servidas quando o código mudava.

## 12. Limitações e ideias de melhoria
- O envio de votos é simulado localmente, sem backend real.
- A duplicidade é controlada por sessão/local do navegador; limpar dados do site permite novo voto.
- Push real precisa de serviço de notificação com credenciais VAPID e servidor backend.
- Melhorias: autenticação por matrícula, backend real, dashboard de apuração em tempo real e suporte a sincronização mais robusta.

## 13. Vídeo de demonstração
_(adicione aqui o link do vídeo, com prova de funcionamento offline, máximo de 7 minutos)_

---
## Como executar localmente
Service Worker exige `localhost` ou HTTPS:
```bash
python3 -m http.server 8080
```
Ou:
```bash
npx serve .
```
Abra `http://localhost:8080` no navegador.
