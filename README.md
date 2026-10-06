# Coimbra Move — versão inicial para GitHub Pages

Aplicação independente em português para consultar transportes de Coimbra, sem servidor permanente, sem chave de API e sem dependências JavaScript externas. Os dados são da AGIT, em NeTEx, com atribuição CC BY 4.0. Inclui uma fotografia dos dados descarregada em 6 de outubro de 2026.

## O que funciona

- Cartão permanente da linha 37 com **ida e regresso**, seleção de hoje/amanhã e grelha de partidas. Selecionar uma partida mostra as horas de passagem nas paragens do segmento disponível. O regresso usa viagens reais desde Armando Gonçalves; não inverte artificialmente as paragens da ida. A continuação da ida depois dos HUC mantém a hora desconhecida.
- Pesquisa de paragens com contagem de resultados, apresentação até 100 resultados e indicação para refinar pesquisas maiores.

- Atalho **37: Vale das Flores → Armando Gonçalves** no início e em **Linhas**, com paragens ordenadas via HUC, variantes e partidas de Vale das Flores por data. A continuidade é apresentada como percurso de referência: a fonte separa viagens nos HUC e não permite confirmar o mesmo veículo nem a hora de chegada a Armando Gonçalves. O planeador geral mantém as regras de transbordo existentes.

- Consulta por número no separador **Linhas** (por exemplo, **37**), com todas as paragens ordenadas de cada sentido/variante e localização no mapa. Os percursos são extraídos das viagens dos dados carregados; a lista não garante circulação numa data específica.

- Pesquisa entre paragens dos SMTUC ou Metro Mondego, com partidas programadas.
- Melhor chegada encontrada para cada número de veículos, até dois transbordos, numa janela de quatro horas. Suporte a horários após meia-noite e dias de circulação específicos.
- Transbordos apenas no mesmo identificador de paragem, com cinco minutos de margem. **Não há transferências entre os operadores nesta versão**, pois os identificadores são distintos e faltam caminhos pedonais validados.
- Consulta de paragens, localização das mais próximas (distância em linha reta), mapa da paragem e favoritos no navegador.
- Interface adaptada a telemóvel, manifesto de instalação e cache para voltar a consultar os dados anteriormente carregados sem rede. O mapa requer Internet; a instalação depende do navegador.
- Atualização diária e publicação com GitHub Actions. Falhas de download, estrutura ou validade impedem a publicação e conservam a versão publicada anterior. A interface avisa sobre dados antigos ou expirados.

## Publicar no GitHub Pages

1. Cria um repositório **público** chamado, por exemplo, `coimbra-move`, com ramo principal `main`.
2. Extrai este ZIP. Coloca **o conteúdo da pasta `coimbra-move` na raiz do repositório**, incluindo `.github/workflows/pages.yml`. Não carregues apenas o ZIP. Se o explorador ocultar `.github`, ativa a apresentação de ficheiros ocultos.
3. Em **Settings → Pages → Build and deployment → Source**, escolhe **GitHub Actions**.
4. Em **Actions**, abre **Atualizar horários e publicar** e escolhe **Run workflow**. Se estiver a correr uma execução anterior, aguarda a conclusão. A publicação precisa que Pages já esteja ativado.
5. Quando o trabalho `deploy` terminar, abre a ligação apresentada. O endereço habitual é `https://O-TEU-UTILIZADOR.github.io/coimbra-move/`.
6. No Android, abre o site no Chrome e usa **Instalar** quando disponível, ou o menu do navegador. No iPhone, usa Safari → Partilhar → Adicionar ao ecrã principal.

O workflow corre às 05:23 UTC diariamente (06:23 em Lisboa durante o horário de verão). O GitHub pode atrasar execuções e desativa agendamentos em repositórios públicos sem atividade durante 60 dias: verifica a aba Actions e reativa o workflow se necessário. A atualização automática só fica ativa depois de publicares o projeto; o ZIP não executa tarefas sozinho. Ativa notificações de falhas no GitHub.

## Experimentar localmente

Com Python instalado, abre um terminal na pasta do projeto:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000`. Não abras `index.html` por duplo clique: os módulos JavaScript e o carregamento dos dados precisam de HTTP/HTTPS.

## Atualizar dados manualmente

```sh
python scripts/update_data.py
```

O importador requer Python 3.10+ e usa apenas a biblioteca padrão. Os ficheiros são validados antes de substituir `data/network.json`. O formato implementado é o perfil NeTEx atualmente fornecido pela AGIT, não toda a norma NeTEx. Uma alteração de estrutura pode exigir adaptação do importador.

## Testar

Com Node.js 20 ou superior:

```sh
node --test tests/*.test.js
```

Os testes verificam embarque, margem de transbordo, restrições de subida/descida, datas de circulação e mudança de dia. As horas são tratadas como horas locais de serviço em Lisboa. Na hora repetida da mudança de horário de outono, o formato de origem pode não distinguir a primeira da segunda ocorrência.

## Limites desta primeira versão

- Não tem chegadas em tempo real, alertas operacionais automáticos, cálculo de tarifas ou venda de bilhetes.
- Não calcula percursos a pé, declives, escadas, acessibilidade, transbordos entre paragens diferentes, nem pesquisa de moradas. A escolha de uma paragem próxima exige verificar o acesso no mapa.
- O mapa mostra uma paragem, não a geometria da viagem. O desenho do cabeçalho é ilustrativo.
- O SIT e a CP não estão integrados. Mantêm-se troços exteriores a Coimbra das redes incluídas para preservar as viagens.
- A pesquisa não enumera todas as partidas alternativas: devolve a melhor chegada por número de veículos e elimina alternativas dominadas por outras com menos veículos.
- Uma data dentro do intervalo global não significa que todas as linhas circulem nessa data. O motor consulta os calendários específicos.
- Guardar favoritos não cria uma conta nem sincroniza entre dispositivos. A localização não é enviada pela aplicação; o mapa externo recebe as coordenadas da paragem selecionada. O alojamento e o fornecedor do mapa podem registar pedidos técnicos.
- Sem validação em campo; confirma avisos dos operadores antes de depender da aplicação numa viagem.

## Fontes e atribuição

Dados AGIT / SMTUC / Metro Mondego, **Creative Commons Attribution 4.0**. Os dados foram transformados de NeTEx em JSON compacto; a aplicação é independente e não implica apoio dos titulares.

- SMTUC: https://dados.gov.pt/pt/datasets/transportes-urbanos-de-coimbra-netex/
- Metro Mondego: https://dados.gov.pt/pt/datasets/metro-mondego-netex/
- Licença dos dados: https://creativecommons.org/licenses/by/4.0/
- Mapa: © OpenStreetMap contributors, https://www.openstreetmap.org/copyright
- Avisos SMTUC: https://www.smtuc.pt/
- AGIT: https://agit.pt/

Os endereços de download e hashes SHA-256 das fontes estão em `data/network.json`.

## Custos e manutenção

A arquitetura usa os serviços gratuitos do GitHub para repositórios públicos e não inclui APIs pagas. A disponibilidade gratuita das fontes e os limites dos serviços podem mudar. O GitHub Pages é alojamento estático, com limite de 1 GB por site e limite indicativo de 100 GB de tráfego mensal; não é destinado a alojar um SaaS comercial. Não há monitorização externa ou garantia de disponibilidade.

Documentação verificada em 6 de outubro de 2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Estrutura

`index.html`, `style.css`, `app.js`: interface; `router.js`: motor; `data/network.json`: dados; `scripts/update_data.py`: importador; `.github/workflows/pages.yml`: atualização e publicação; `tests/`: testes; `sw.js` e `manifest.webmanifest`: instalação/cache.

## Validação desta entrega

- Importação dos dois ficheiros oficiais realizada com sucesso.
- Seis testes automáticos do motor aprovados; verificação adicional de dez viagens diretas existentes nos dados reais.
- Sintaxe dos módulos JavaScript verificada.
- A validação visual/interativa em navegador ficou por concluir: o navegador de testes não estava disponível e o download falhou neste ambiente. A publicação real no GitHub Actions também só poderá ser verificada no repositório de destino.
