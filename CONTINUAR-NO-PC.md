# Coimbra Move — ponto de situação

Guardado em 6 de outubro de 2026, às 16:10, hora de Lisboa.

## Começa por aqui

Extrai o ZIP e abre a pasta `coimbra-move` no VS Code, ou segue o `README.md` para publicar através do GitHub. Este arquivo contém o projeto completo, os dados já descarregados, os testes e o workflow de publicação. Não precisas de recuperar o ZIP anterior.

## Objetivo e decisões acordadas

Criar uma aplicação de transportes para Coimbra, inspirada nas funcionalidades essenciais do Moovit, com identidade própria. Utilizar GitHub Pages, repositório público e GitHub Actions com executores padrão gratuitos. **Não usar APIs pagas, subscrições, executores pagos nem serviços que exijam faturação.** Se uma ação puder ter custos, parar e apresentar uma alternativa gratuita.

Arquitetura: site estático; atualização diária de dados oficiais pela AGIT; conversão NeTEx → JSON; cálculo de percursos no navegador; favoritos guardados localmente. Sem backend permanente e sem chaves de API.

## Estado da publicação

- Conta GitHub identificada pela ligação existente: `luiscunhacsc`.
- Nome proposto para o novo repositório: `coimbra-move` (disponibilidade ainda não verificada).
- **Nenhum repositório foi criado nesta sessão e o site não foi publicado.**
- Nenhum serviço pago, subscrição ou API paga foi ativado.
- A publicação parou no início de sessão do navegador. A tentativa mais recente ficou à espera de confirmação por passkey; não houve confirmação de autenticação concluída.
- O utilizador estava no telemóvel e pediu para guardar o trabalho e continuar no PC.
- O ZIP não contém credenciais, cookies, tokens ou sessões de autenticação. Será preciso iniciar sessão no GitHub no PC; a sessão do navegador anterior não é necessária.
- A integração GitHub disponível reconheceu a conta, mas não expôs operações para criar repositórios ou ativar Pages. No PC pode usar-se o site GitHub, ou uma ferramenta autenticada adequada, sem pedir senhas na conversa.

## O que está implementado

- Interface em português, adaptável ao telemóvel.
- Dados reais dos SMTUC e Metro Mondego com atribuição CC BY 4.0.
- Pesquisa entre paragens, viagens diretas ou até dois transbordos na mesma paragem, com margem de cinco minutos.
- Próximas partidas programadas, consulta de paragens e favoritos.
- Paragens próximas por localização do dispositivo, com distância em linha reta.
- Mapa externo OpenStreetMap da paragem selecionada.
- Manifesto PWA e cache para recursos já carregados.
- Importador `scripts/update_data.py` e publicação diária em `.github/workflows/pages.yml`.

## Limites que devem ser preservados na apresentação ao utilizador

Sem tempo real, percursos a pé, ligações entre paragens diferentes, pesquisa de moradas, tarifas, acessibilidade validada, CP ou SIT. Não há transferência entre os dois operadores nesta versão, porque os identificadores das paragens são distintos. O motor apresenta a melhor chegada por número de veículos, numa janela de quatro horas; não enumera todas as alternativas. O mapa não desenha o percurso do autocarro.

Os dados incluídos têm validade global até 12/11/2026 para SMTUC e 31/12/2026 para Metro Mondego. Existem calendários específicos por viagem. Executar a atualização antes de publicar, mesmo que se retome o projeto antes dessas datas.

## Validação efetuada

- Importação e análise dos dois ficheiros oficiais concluídas.
- Seis testes automáticos do motor aprovados: embarque, margem de transbordo, calendários, restrições de subida/descida e viagens após meia-noite.
- Verificação adicional de dez viagens diretas existentes nos dados reais.
- Verificação de sintaxe de `app.js` e `sw.js` concluída.
- **Pendente:** teste visual/interativo em navegador, instalação PWA em dispositivo e execução real do workflow GitHub. O download do navegador de testes falhou no ambiente anterior; não confundir isso com um erro da aplicação.

## Próximos passos no PC

1. Extrair o ZIP. Abrir terminal dentro de `coimbra-move`.
2. Experimentar localmente com `python -m http.server 8000` e abrir `http://localhost:8000`. Não abrir o HTML por duplo clique.
3. Executar `python scripts/update_data.py` e, com Node.js instalado, `node --test tests/*.test.js`.
4. Verificar no navegador a pesquisa entre paragens, partidas, favoritos e apresentação em ecrã estreito.
5. Iniciar sessão no GitHub e criar o repositório público `coimbra-move`, no ramo `main`. Se já existir, inspecionar antes de alterar qualquer conteúdo.
6. Colocar o conteúdo da pasta do projeto na raiz do repositório, incluindo `.github/workflows/pages.yml`; não carregar apenas o ZIP. Usar Git/GitHub Desktop ou o carregamento de ficheiros do GitHub, verificando que a pasta `.github` foi incluída.
7. Em Settings → Pages → Source, escolher GitHub Actions. Executar o workflow «Atualizar horários e publicar».
8. Confirmar que o deploy terminou com sucesso e abrir o endereço que o GitHub indicar. Só então declarar o site publicado.

As instruções detalhadas, fontes, atribuições e limitações estão no `README.md`. O workflow corre diariamente às 05:23 UTC após ativação no GitHub. Agendamentos podem atrasar-se e podem ser desativados após 60 dias sem atividade num repositório público; verificar notificações e a aba Actions.

## Texto para retomar com Codex / ChatGPT no PC

> Continua o projeto Coimbra Move desta pasta. Lê primeiro CONTINUAR-NO-PC.md e README.md. Quero publicá-lo na minha conta GitHub luiscunhacsc, num repositório público chamado coimbra-move, se disponível, e ativar GitHub Pages com o workflow incluído. Não usar APIs pagas nem gerar custos. O código, os dados e os testes estão completos para esta primeira versão, mas falta validar a interface no navegador e realizar a publicação. O site ainda não foi publicado. Verifica o estado atual antes de criar ou alterar o repositório. Atualiza os dados, testa, corrige problemas concretos e conclui a publicação se houver autenticação disponível. Não acrescentes funcionalidades nem serviços pagos. Dá-me o URL só depois de verificares que está online.
