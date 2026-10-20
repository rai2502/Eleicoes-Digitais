# Roteiro de testes — "Desliguem a internet"
Preparação: `localhost`, Chrome, DevTools › Application › *Clear site data*. Abra a página **online** uma vez e recarregue (para o SW assumir o controle).
Salve os prints em `/screenshots` com os nomes sugeridos.

| # | Teste | Resultado esperado | Print | OK |
|---|---|---|---|---|
| 1 | Network › **Offline**, recarregar | Página inicial abre | `01-home-offline.png` | ☐ |
| 2 | Observar estilo, JS, ícone | Tudo carregado do cache (Network: "ServiceWorker") | `02-recursos-cache.png` | ☐ |
| 3 | Ver candidatos e propostas | Dados disponíveis | `03-candidatos-offline.png` | ☐ |
| 4 | Votar offline | Mensagem "guardado para envio posterior" | `04-voto-offline.png` | ☐ |
| 5 | Application › IndexedDB › `eleicao-db › fila` e painel | Voto **pendente** (fila = 1) | `05-fila-pendente.png` | ☐ |
| 6 | Voltar para **Online** | Toast "sincronizado"; fila = 0 | `06-sincronizado.png` | ☐ |
| 7 | Ativar notificações e clicar "Apuração" | Notificação aparece; clique abre `resultado.html` | `07-notificacao.png` | ☐ |
| 8 | Network: ver preload/prefetch/dns | Identificados e explicados | `08-network-otimizacoes.png` | ☐ |
| 9 | Application › Service Workers / Cache Storage / Manifest | SW ativo e caches criados | `09-sw-cache.png` | ☐ |
| 10 | Tentar votar de novo | Bloqueado (duplicidade) | `10-duplicidade.png` | ☐ |

Dica: *Sync* de teste em Application › Service Workers › campo Sync (`sincronizar-votos`). Para repetir, use **Reiniciar simulação**.
