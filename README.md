# 🗳️ Eleição do Grêmio Estudantil 2026


Aplicação web progressiva (PWA) desenvolvida para simular uma eleição do Grêmio Estudantil, permitindo consultar candidatos e propostas, registrar votos simulados e acompanhar a sincronização mesmo sem conexão com a internet.


## 📌 Sobre o projeto


O projeto foi desenvolvido pela equipe **Squad Gremio Digital**, formada por quatro estudantes do curso Técnico em Desenvolvimento de Sistemas, sob orientação do professor **Leandro Gaudio Rosa**.


O objetivo é demonstrar como uma aplicação web pode continuar funcionando mesmo quando a conexão com a internet é interrompida.


**Pergunta-guia:** O que continua funcionando quando a internet cai?


**Resposta:** O aplicativo permite acessar as páginas disponíveis em cache, consultar candidatos e propostas, registrar um voto simulado e acompanhar os votos pendentes de sincronização.


 ⚠️ **Importante:** Esta é uma eleição exclusivamente simulada para fins educacionais. Os votos não são reais e a aplicação não coleta dados pessoais.
## 🎯 Objetivos


Simular uma eleição do Grêmio Estudantil.
Apresentar candidatos e suas propostas.
Permitir o registro de votos simulados.
Evitar votos duplicados no armazenamento local.
Demonstrar o funcionamento offline de uma aplicação web.
Armazenar votos pendentes e tentar sincronizá-los quando a conexão retornar.
Demonstrar recursos de uma Progressive Web App (PWA).
## 👥 Público-alvo


Estudantes.
Professores.
Equipe escolar.
Comunidade escolar.
## 🔗 Links do projeto


**Repositório GitHub:** [Eleicoes-Digitais](https://github.com/rai2502/Eleicoes-Digitais.git)
**Vídeo de demonstração:** [Assistir no YouTube](https://youtu.be/NCTl-xfHil4)
**Documentação completa:** [Abrir documento no Google Docs](https://docs.google.com/document/d/1kmw-vNxVJJmUEZkmMQSYxYskXndK6QFT9iRCFHl4Uyo/edit?usp=sharing)
**Aplicação publicada:** A definir.
## 🛠️ Tecnologias utilizadas


| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript puro | Interatividade e regras da aplicação |
| Service Worker | Recursos offline e processamento em segundo plano |
| Cache API | Armazenamento de arquivos para acesso offline |
| IndexedDB | Persistência local e fila de votos pendentes |
| Background Sync | Tentativa de sincronização quando a conexão retorna |
| Notifications API | Exibição de notificações |
| Push API | Suporte a notificações push em ambientes compatíveis |
| Web App Manifest | Configuração da instalação como PWA |


O projeto utiliza tecnologias nativas da plataforma web, sem frameworks ou dependências externas de aplicação.


## ✨ Funcionalidades


**Candidatos e propostas:** consulta às informações dos candidatos.
**Votação simulada:** registro local de votos.
**Controle de duplicidade:** utilização da chave meuVoto no IndexedDB.
**Apuração:** visualização dos resultados simulados em resultado.html.
**Modo offline:** acesso aos recursos previamente armazenados em cache.
**Fila de sincronização:** armazenamento de votos pendentes no IndexedDB.
**Background Sync:** tentativa de sincronização em navegadores compatíveis.
**Notificações:** demonstração de notificações locais e suporte ao evento push.
**PWA:** possibilidade de instalação em navegadores compatíveis.
## 📡 Funcionamento offline


A aplicação utiliza estratégias de cache para manter a experiência de uso quando a internet está indisponível.


### Network First


Prioriza a rede para buscar versões atualizadas de páginas e dados. Quando a conexão falha, tenta utilizar o conteúdo armazenado em cache.


### Cache First


Prioriza os arquivos armazenados, como CSS, JavaScript e ícones, reduzindo a dependência da conexão.


### Stale While Revalidate


Permite utilizar um recurso armazenado enquanto o navegador tenta buscar uma versão atualizada em segundo plano.


### Fallback offline


Quando uma página não pode ser carregada, a aplicação pode apresentar offline.html, desde que esse arquivo esteja disponível no cache.


## 🔄 Sincronização dos votos


O processo de sincronização funciona da seguinte maneira:


1. O estudante registra um voto simulado.
2. O voto é armazenado localmente no IndexedDB.
3. O voto permanece na fila enquanto aguarda sincronização.
4. Quando a conexão retorna, o Service Worker tenta processar os registros pendentes.
5. A aplicação recebe uma mensagem de confirmação e atualiza a apuração simulada.


O funcionamento do Background Sync depende do suporte do navegador.


**Limitação:** a sincronização é simulada localmente e não representa o envio de votos para um servidor eleitoral real.


## 🔔 Notificações


O projeto demonstra o uso da Notifications API para apresentar mensagens ao usuário.


Também contempla os eventos push e notificationclick no Service Worker. Notificações push reais dependem de infraestrutura adicional, como servidor, assinaturas de usuários e chaves VAPID.


## ⚡ Otimizações de carregamento


**Preload:** antecipa o carregamento de recursos importantes, como a folha de estilos.
**Prefetch:** permite antecipar recursos que provavelmente serão acessados em seguida, como a página de resultados.
**DNS-prefetch:** antecipa a resolução DNS de domínios externos utilizados pelas fontes.
**Cache:** reduz novas requisições e melhora a disponibilidade offline.
## 🧪 Testes e validação


Os testes do projeto incluem:


[ ] Carregamento da página com internet.
[ ] Consulta aos candidatos e às propostas.
[ ] Registro de um voto simulado.
[ ] Verificação do armazenamento no IndexedDB.
[ ] Identificação de votos pendentes na fila.
[ ] Desativação da rede e acesso às páginas armazenadas.
[ ] Retorno da conexão e verificação da sincronização.
[ ] Inspeção do Service Worker e do Cache Storage.
[ ] Verificação das notificações e do Web App Manifest.
Os itens devem ser marcados como concluídos após a execução dos respectivos testes.


## 📂 Estrutura do projeto


Estrutura ilustrativa, que deve ser conferida com os arquivos existentes no repositório:
text
Eleicoes-Digitais/
├── index.html
├── resultado.html
├── offline.html
├── app.js
├── sw.js
├── manifest.json
├── data/
│   └── candidatos.json
├── assets/
├── screenshots/
└── docs/
    └── ROTEIRO-TESTES.md


## ▶️ Como executar localmente


O Service Worker exige um contexto seguro, como localhost ou HTTPS. Não abra o arquivo index.html diretamente pelo explorador de arquivos.


### Opção 1 — Python


Com o Python instalado, execute no terminal, dentro da pasta do projeto:
bash
python -m http.server 8080


Abra o navegador no endereço:


http://localhost:8080


### Opção 2 — Node.js


Com o Node.js instalado, execute:
bash
npx serve .


Acesse o endereço local exibido no terminal.


### Como testar o modo offline


1. Abra a aplicação no navegador.
2. Aguarde o carregamento e a instalação do Service Worker.
3. Abra as ferramentas de desenvolvedor.
4. Acesse a aba **Network** e habilite a opção **Offline**.
5. Atualize a página e verifique os recursos disponíveis.
6. Teste o voto simulado e a fila de pendências.
7. Reative a conexão e verifique o comportamento da sincronização.


Os resultados podem variar de acordo com o navegador e o suporte às funcionalidades utilizadas.


## ⚠️ Limitações e melhorias futuras


A votação é simulada e não possui backend eleitoral real.
O controle de duplicidade local pode ser contornado pela limpeza dos dados do navegador ou pelo uso de outro dispositivo.
A sincronização depende dos recursos disponíveis no navegador.
Notificações push reais exigem backend e configuração adicional.
A aplicação não deve ser utilizada em eleições oficiais.
### Melhorias futuras


Implementar backend para persistência remota.
Criar painel de apuração com atualização em tempo real.
Implementar sincronização com tratamento de erros e conflitos.
Adicionar testes automatizados.
Melhorar as evidências de funcionamento offline.
## 🎥 Vídeo de demonstração


▶️ [Assistir à demonstração no YouTube](https://youtu.be/NCTl-xfHil4)


## 📄 Documentação completa


📘 [Acessar a documentação no Google Docs](https://docs.google.com/document/d/1kmw-vNxVJJmUEZkmMQSYxYskXndK6QFT9iRCFHl4Uyo/edit?usp=sharing)


## 👨‍💻 Equipe responsável


**Equipe:** Squad Gremio Digital
**Integrantes:** 4 estudantes
**Curso:** Técnico em Desenvolvimento de Sistemas
**Professor:** Leandro Gaudio Rosa
## 📜 Finalidade do projeto


Projeto acadêmico desenvolvido para fins educacionais, com foco no estudo de Progressive Web Apps (PWAs), armazenamento local, funcionamento offline, sincronização e notificações.


---


**Eleição do Grêmio Estudantil 2026 — Squad Gremio Digital**


Tecnologia, participação estudantil e aprendizado na prática.
