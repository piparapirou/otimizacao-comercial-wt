# Metodologia — Análise da Sugestão de Compra (Winthor)

Playbook usado para transformar exportações brutas do Winthor em planilhas de análise
comercial. Existem (pelo menos) 2 formatos de relatório distintos vistos até agora — sempre
checar as colunas do arquivo recebido antes de aplicar um dos dois modelos abaixo.

## Painel web (autoatendimento da equipe)
Publicado em 31/08/26, atualizado no mesmo dia com as regras de filial/geografia:
**https://claude.ai/code/artifact/14fc7ec1-0e79-4de2-aa06-086a489ae370**
("Comercial WT — Painel de Análise"). A equipe sobe o .xlsx exportado do Winthor direto no
navegador (sem precisar pedir a análise no chat); o formato é detectado automaticamente
(Formato 1 ou 2, com/sem FL, 1 ou várias filiais) e o painel gera na hora: cards de KPI
clicáveis (levam direto à lista correspondente, com destaque visual no mouse over), tabela
por filial (quando multi-filial), abas com as mesmas listas curadas das planilhas
(Ruptura/Divergências, Transferência com filial de origem sugerida e distância, Parado/Lento,
Revisar Status, Pedidos Atrasados, Fora de Linha) e o Plano de Ação. Cada análise enviada
entra num **histórico compartilhado** — todo mundo que abrir o link vê as análises que a
equipe já rodou. A equipe já começou a usar (primeiro envio real: arquivo Nestlé multi-filial
do Paulo, 31/08/26).

**Desde 03/09/26 o link acima abre um portal**, não mais direto o painel de análise — ver
seção "Portal de ferramentas + Ruptura Zero" mais abaixo. O painel de análise descrito acima
continua exatamente igual, agora como uma das "visões" do portal.

Decisões tomadas com o usuário sobre esse painel:
- Histórico compartilhado (não é só local do navegador de quem sobe o arquivo).
- Detecta os 2 formatos já usados automaticamente, sem precisar escolher.
- **Não gera .xlsx pela própria página** — a plataforma de artifacts não permite download de
  .xlsx a partir da página (só gif/png/jpg/webp/mp4/webm/txt/json/md/docx/pptx/epub/csv/ttf/
  html/svg/pdf). Existia um botão "Gerar Excel completo" que montava um texto para colar
  aqui no chat, mas ele foi **removido em 01/09/26** a pedido do usuário ("não há
  necessidade se o botão de baixar já foi criado") — não baixava nada de fato, só gerava
  texto, e ficava ocupando espaço no topo de toda análise. A exportação em Excel completo
  (com fórmulas/abas/formatação, como os exemplos já entregues) continua disponível, só que
  agora exclusivamente pedindo direto aqui no chat, sem o atalho da página.
- **Navegação cruzada entre KPIs, Plano de Ação e tabelas, ampliada em 31/08/26**: além dos
  cards de KPI (clicam e vão direto à aba/lista correspondente), agora também são clicáveis:
  cada linha do **Plano de Ação** (leva à aba do achado que ela descreve — ex. clicar na
  linha "93 itens em ruptura crítica" abre a aba Ruptura) e cada número da tabela
  **Indicadores por Filial** (leva à aba correspondente já filtrada só para aquela filial,
  reaproveitando a busca da própria tabela). Todos usam o mesmo destaque visual no hover
  para indicar que são clicáveis.
- **Tabelas com tamanho controlado e modo tela cheia, adicionado em 31/08/26**: as tabelas de
  resultado (Ruptura, Transferência, Parado/Lento, Revisar Status, Pedidos Atrasados, Fora de
  Linha, Plano de Ação, Indicadores por Filial) agora têm altura máxima com **rolagem interna
  própria** (vertical e horizontal, já que muitas colunas não cabem na largura da tela) em vez
  de esticar a página inteira. Cada tabela de resultado tem um botão **"⤢ Maximizar"** que
  abre a mesma tabela em um modo de tela cheia, com um menu para trocar entre as outras abas
  sem precisar fechar — útil para conferir uma lista grande com mais espaço. Fecha com o
  botão "Fechar", clicando fora do painel, ou tecla Esc.
- KPIs da aba de indicadores são clicáveis: clicar leva à aba/lista correspondente do
  relatório (ex.: clicar em "Ruptura crítica" abre a lista de ruptura), com destaque visual
  (leve elevação/realce) no hover para indicar que é clicável.
- O motor de análise (JS embutido na página, `webtool/app.js` no ambiente da sessão que
  gerou o painel) já tem um campo `hasValueData`/`valorParadoTotal` pronto para os próximos
  relatórios que vierem com valor de estoque por unidade/caixa (ver nota abaixo) — quando
  essa coluna aparecer num arquivo, o painel já mostra o valor parado automaticamente, sem
  precisar de mudança nova.
- Temas de cor selecionáveis pelo usuário (menu no topo): Automático (segue o sistema),
  Claro, Escuro, Quente e Frio — a escolha fica salva no navegador de cada pessoa (não é
  compartilhada no histórico, é uma preferência pessoal de visualização).
- Espaço reservado (`.logo-slot`, ao lado da marca "WT" no topo da página) para o logo da
  empresa quando houver um arquivo de imagem — por enquanto é só uma caixa tracejada com
  "Logo" escrito, sem afetar o layout quando for trocado por uma `<img>` de verdade.
- **Identificação da análise no histórico, sem preenchimento manual desde 31/08/26**: o
  upload não pede mais nenhum campo — nem rótulo livre, nem comprador/fornecedor/filial/data
  em separado. O painel extrai tudo automaticamente do próprio arquivo:
  - **Comprador**: do Formato 2, direto da coluna `COMPRADOR` (nome, ex. "Paulo C M"); do
    Formato 1, que só tem `CODCOMPRADOR` (código numérico, sem nome), usa "Comprador
    `<código>`" como identificação.
  - **Fornecedor**: só existe como coluna própria no Formato 1 (`FORNECEDOR`, por linha) — se
    houver mais de um fornecedor distinto no arquivo, mostra até 3 nomes separados por "/" ou
    "Vários fornecedores" acima disso. **O Formato 2 atual não tem coluna de fornecedor** (os
    arquivos do Paulo/Nestlé e do Daniel não trazem essa informação) — nesses casos o campo
    fica em branco no rótulo automático até que um formato futuro traga essa coluna.
  - **Filial**: do Formato 2, a partir da própria coluna `FILIAL` presente nas linhas —
    "Todas as filiais" quando as 6 aparecem, "Filial X" quando só uma, "Filiais X, Y" quando
    algumas; do Formato 1 (que não tem coluna FILIAL explícita), usa a filial já inferida da
    ausência de uma das colunas QTESTFx.
  - **Data do relatório**: do Formato 2, extraída do fim do período em `PERIODO_FILTRO`
    ("DD/MM/AAAA A DD/MM/AAAA" → usa a segunda data). O Formato 1 não tem nenhuma coluna de
    data/período — nesse caso usa o dia do upload como data do relatório (era o valor padrão
    do campo manual antigo, então o comportamento pré-31/08/26 é mantido nesse caso).
  O rótulo do histórico continua no formato `Comprador - Fornecedor - Filial(is)` (partes
  vazias são omitidas), ex.: "Paulo C M - Todas as filiais" para o arquivo Nestlé atual (sem
  fornecedor, por não existir a coluna no Formato 2). Se nenhuma das 3 partes for detectada,
  cai de volta no nome do arquivo, como antes. Entradas de histórico já salvas antes dessa
  mudança mantêm o rótulo antigo — não são reprocessadas retroativamente.
- **Nomes encurtados no histórico, adicionado em 01/09/26** (pedido explícito do usuário):
  o rótulo exibido no histórico (não o dado salvo internamente, que continua completo para a
  busca) passa por dois cortes:
  - **Comprador**: mostra só o primeiro nome (ex.: "Rodrigo C De A" → "Rodrigo"). Existe uma
    tabela de apelidos (**agora editável pelo painel de admin — ver seção de segurança
    abaixo**, vive em `STATE.compradorApelidos`, não mais como constante fixa em `app.js`)
    para casos específicos que a equipe prefere ver diferente do primeiro nome cru — hoje só
    tem uma entrada: "Almifrancy" → "Almi".
  - **Fornecedor**: corta a razão social no ponto onde começa o tipo/forma jurídica da
    empresa, mantendo só o nome comercial antes disso (ex.: "LUA NOVA INDUSTRIA E COMERCIO
    DE PRODUTOS ALIMENTICIOS LTDA" → "LUA NOVA"; "BRF S.A." → "BRF"). A lista de palavras-
    gatilho (`EMPRESA_TIPO_KEYWORDS` em `app.js`) cobre INDUSTRIA/IND, COMERCIO/COM,
    DISTRIBUIDORA/DIST, IMPORTACAO/IMP, EXPORTACAO/EXP, ATACADO/ATACADISTA,
    REPRESENTACOES, LTDA/LIMITADA, EIRELI, EPP/MEI/ME, SA/S.A. — corta no primeiro token
    que bater (comparação por palavra inteira, sem acento, então "DISTRITO" não é
    confundido com "DIST"). Se o primeiro token já for uma dessas palavras (nome não
    reconhecido), mantém o texto original inteiro, para nunca mostrar um rótulo vazio. Essa
    lista continua fixa no código (não editável pelo admin, diferente dos apelidos de
    comprador) por ser uma regra linguística geral, não uma preferência pontual da equipe.
  Essa lógica reconstrói o texto exibido a partir dos campos estruturados
  (`h.comprador`/`h.fornecedor`/`h.filialLabel`) toda vez que a página renderiza, em vez de
  usar um texto fixo salvo no momento do upload — por isso entradas de histórico antigas
  também aparecem encurtadas automaticamente, sem precisar reprocessar o arquivo original.
- **Busca no histórico, adicionada em 31/08/26**: um campo de busca acima da lista de
  histórico filtra pelas análises já enviadas por **comprador, fornecedor ou data** do
  relatório (pedido explícito do usuário) — a busca por filial foi deixada de fora
  propositalmente, a pedido dele. A busca continua usando o nome/razão social **completos**
  salvos internamente, não o texto encurtado do rótulo.
- **Rodapé com versão e histórico de alterações, adicionado em 31/08/26**: o rodapé da
  página mostra a data/hora da última alteração de layout/comportamento (ex.: "Versão do
  painel: 31/08/2026 às 16:57"). Esse valor é escrito à mão no código (`BUILD_VERSION` em
  `app.js`) toda vez que uma mudança de página é publicada — não é um timestamp automático
  de build, então preciso atualizá-lo manualmente a cada nova versão publicada, junto com
  uma nova entrada no array `CHANGELOG` (também em `app.js`, mais recente primeiro) que
  alimenta o link **"Histórico de alterações"** no rodapé. Esse link abre uma janela que
  pede uma **senha (padrão `123`, definida em `CHANGELOG_PASSWORD` em `app.js`)** antes de
  mostrar a lista de alterações — pedido explícito do usuário. **Ressalva importante para o
  usuário:** como a página é 100% estática e roda só no navegador (sem servidor por trás),
  essa senha é apenas uma barreira de conveniência/UX para reduzir acesso casual — ela fica
  visível no código-fonte da própria página para quem souber procurar (Ver código-fonte),
  então não deve ser tratada como proteção real de informação sensível. Serve para não deixar
  o histórico de alterações à mostra por padrão, não para guardar segredo.
- **Bug de layout corrigido em 01/09/26**: a tela de senha do histórico de alterações (e,
  quando havia uma análise carregada, o modo tela cheia da tabela) podiam aparecer abertos
  já no carregamento da página, mesmo sem ninguém clicar em nada. A causa era uma regra de
  CSS (`display: flex` nas classes `.modal-overlay`/`.fullscreen-overlay`) que sobrescrevia
  o atributo `hidden` padrão do navegador, usado para manter esses painéis escondidos até
  serem abertos. Corrigido adicionando `[hidden] { display: none !important; }` no topo da
  folha de estilos — garante que `hidden` sempre vence, independente de outras regras.
- **Atenção sobre compartilhamento:** o usuário compartilhou o link publicamente. A
  plataforma de artifacts pode manter quem já tem o link "fixado" numa versão específica —
  ao republicar (o que faço a cada ajuste pedido), pode ser necessário que o usuário mova
  esse "pin" para a versão mais recente na própria página do artifact, para a equipe ver as
  mudanças mais novas.

### Cores por filial + fluxo "De → Para" na transferência (01/09/26)
Pedido explícito do usuário: "utilizar cores para identificar mais facilmente as filiais,
com gradientes de cor que não confundam o usuário mas que não sejam muito diferentes um do
outro" e tornar a sugestão de transferência mais intuitiva sobre "de onde deve sair o
produto e para qual loja seguir".

- **Paleta**: 6 cores categóricas (uma por filial: 1, 3, 4, 5, 6, 7 — mesma ordem usada em
  `ALL_FILIAIS`/`FILIAL_COLS` no `app.js`), escolhidas e validadas com o método de paleta
  categórica acessível (checagem de separação para daltonismo e de contraste, não só
  "olhômetro"): azul (filial 1), laranja (filial 3), verde-água (filial 4), amarelo (filial
  5), magenta (filial 6), verde (filial 7). Cores fixas em `styles.css`
  (`--filial-1`...`--filial-7` + variante `-bg` para o fundo do badge), iguais nos temas
  Claro/Quente/Frio e com um segundo conjunto (mais claro) para o tema Escuro — mesmo padrão
  já usado nas cores de severidade (`--sev-*`).
- **Badge colorido** (`filialBadge()` em `app.js`): toda vez que uma filial aparece — coluna
  "Filial" das tabelas, tabela "Indicadores por Filial", sugestão de transferência — agora
  vem como uma pílula colorida com um pontinho, em vez de texto simples. O texto dentro do
  badge continua sendo o rótulo completo (`filialLabel`, ex. "Filial 3 (depósito)"), não só a
  cor — importante porque a busca da tabela e o clique nos números de "Indicadores por
  Filial" (que filtra a lista por aquela filial) dependem desse texto aparecer literalmente
  na célula; só embrulhar em cor, sem mudar o texto, evitou quebrar essas duas funcionalidades
  já existentes.
- **Sugestão de transferência mais visual**: a coluna que antes só mostrava texto ("Filial X
  · quantidade · distância") virou **"De → Para"**: mostra o badge da filial de origem, uma
  seta, e o badge da filial de destino, lado a lado — cada um na sua cor — com a quantidade
  disponível e a distância ("mesma cidade" / "via matriz" / "outra cidade") numa linha
  abaixo. Antes, em arquivo de uma única filial, a filial de destino nem aparecia (só a
  origem); agora aparece sempre, já que o dado (`r.filial`) sempre existe por linha,
  independente de o arquivo ser single ou multi-filial.
- Testado via Playwright: 6 cores de badge distintas na tabela de Indicadores por Filial,
  fluxo "De → Para" renderizando origem/destino com cores diferentes entre si, cabeçalho da
  coluna renomeado, clique num número de "Indicadores por Filial" continuando a filtrar a
  tabela corretamente (a checagem que valida que o texto "Filial N" continua presente e
  buscável dentro do badge), e troca de tema clara/escura mudando a cor do badge.
- Nenhuma regra de negócio mudou nessa atualização — é só apresentação/leitura visual.

### Camada de senha da página inteira + painel de admin (01/09/26)
Pedido explícito do usuário: impedir que qualquer pessoa com o link acesse a página (só
existia a senha do histórico de alterações até então), com login persistente sem expirar, e
um painel de admin com ferramentas comuns de gestão. Pediu também um backup da versão
anterior antes de aplicar, para poder reverter rápido se algo quebrasse.

**Pesquisa feita antes de implementar**: confirmado via documentação oficial
(`support.claude.com/en/articles/9547008-publish-and-share-artifacts`) que artifacts em
plano individual (Free/Pro/Max) são binários — privado ao dono OU público para quem tem o
link — sem senha, sem expiração, sem restrição por pessoa, e sem opção de reverter um
artifact publicado de volta para privado; não é preciso login para visualizar. Controle de
acesso real (login de verdade restrito à organização) só existe como recurso de
compartilhamento do próprio claude.ai em planos Team/Enterprise — não é algo que o código da
página consiga implementar. Isso foi explicado ao usuário antes de perguntar como prosseguir;
ele optou pela **senha de conveniência** (opção rápida), ciente da limitação.

**O que foi implementado** (`app.js`/`styles.css`, a partir da versão "01/09/2026 às 11:40"):
- **Tela de senha para a página inteira**: enquanto não desbloqueada, a página mostra só um
  cartão de login (nada do conteúdo real — histórico, KPIs, dados — é renderizado no DOM
  nessa tela), pedindo a senha de acesso. Ao acertar, fica salva no `localStorage` do
  navegador daquela pessoa **sem expiração** (mesmo padrão já usado para a preferência de
  tema) — não pede de novo nas próximas visitas, a menos que a senha seja trocada (ver
  abaixo) ou o navegador limpe os dados salvos.
- **Painel de admin** (botão "Admin" no rodapé, ao lado do histórico de alterações), atrás de
  uma **segunda senha, separada** da senha de acesso — só quem tem a senha de admin vê as
  ferramentas de gestão, mesmo que já tenha acesso à página. Contém as 4 ferramentas pedidas:
  1. **Excluir itens do histórico**: lista todas as análises salvas com um botão Excluir por
     item; pede confirmação (Sim/Não) antes de remover de verdade, para evitar exclusão
     acidental com um clique só.
  2. **Editar apelidos de comprador**: lista/adiciona/remove entradas do mapa de apelidos
     (`STATE.compradorApelidos` — movido de constante fixa em `app.js` para dentro do estado
     compartilhado, exatamente para poder ser editado pela própria página sem precisar pedir
     uma alteração de código a cada apelido novo).
  3. **Estatísticas de uso**: total de análises no histórico, contagem por comprador
     (ranking). É deixado explícito na própria tela que **não é contagem de acessos/
     visualizações da página** — a arquitetura atual (sem servidor, sem contas de usuário)
     não tem como registrar isso; só sabe o que está no histórico compartilhado de análises.
  4. **Trocar senha de acesso e senha de admin**: formulário separado para cada uma. Ao
     salvar, a senha nova é gravada no estado compartilhado (mesmo mecanismo do
     upload/histórico) — passa a valer para todo mundo que abrir o link depois disso.
     Importante: quem já estava logado em outro navegador com a senha antiga **não** é
     deslogado automaticamente nesse instante (não há como avisar navegadores já abertos numa
     página estática) — mas na próxima vez que a página carregar nesse navegador, a senha
     salva localmente não vai mais bater com a nova, e ele volta a pedir login. Isso faz a
     troca de senha ter efeito real (não é só cosmético), mesmo sem um mecanismo de sessão de
     verdade.
- **Onde as senhas ficam salvas**: `STATE.sitePassword`/`STATE.adminPassword` (dentro do
  mesmo JSON de estado compartilhado do histórico) — não são mais constantes fixas em
  `app.js` como a senha do histórico de alterações (`CHANGELOG_PASSWORD`, que continua como
  estava, sem mudança). Isso é o que permite trocar a senha pela própria tela, sem precisar
  pedir uma alteração de código a cada vez. **A equipe já trocou as duas senhas pelo próprio
  painel de admin em 01/09/26** (visto ao ler o estado compartilhado antes da publicação
  seguinte, a das cores por filial) — os valores padrão `wt2026`/`wtadmin2026` da primeira
  publicação **não valem mais**; a senha atual só está disponível para quem já está no
  painel de admin ou pergunta à equipe, propositalmente não é reanotada aqui em texto puro.
- **Ressalva de segurança — a mesma lógica da senha do histórico de alterações, só que agora
  cobrindo a página inteira e os dados do histórico**: como a página não tem servidor por
  trás, **essa senha não é proteção real** — é só uma barreira de conveniência contra acesso
  casual de quem tem o link. Qualquer pessoa que veja o código-fonte da página (Ver
  código-fonte do navegador) consegue ler as senhas e **todos os dados do histórico
  compartilhado** (nomes de comprador/fornecedor, quantidades, valores de estoque etc.), já
  que esses dados continuam embutidos no HTML da página independente da senha — a tela de
  login só controla o que é *renderizado na tela*, não o que está *no arquivo enviado ao
  navegador*. Isso é uma limitação estrutural de qualquer página estática publicada como
  artifact (não existe servidor para reter os dados até autenticar) — não seria diferente
  com qualquer outra senha "de conveniência" que eu implementasse em JS. Uma restrição de
  acesso de verdade só existe via configuração de compartilhamento do próprio claude.ai
  (Team/Enterprise), fora do alcance deste código.
- **Backup tirado antes da mudança**: cópia da versão anterior (`content.html`, `app.js`,
  `styles.css`, estado "01/09/2026 às 10:10", antes de qualquer código de senha/admin) salva
  neste projeto em `claude/backups/painel-backup-2026-09-01-pre-auth-*` (3 arquivos) — permite
  restaurar rapidamente publicando esse conteúdo de volta no mesmo link, se a mudança causar
  algum problema.

## Regra de negócio geral: itens Fora de Linha (FL)
Pedido explícito do usuário (31/08/26): **itens com status "FL" (fora de linha) devem ser
sempre desconsiderados das sugestões de compra e de transferência entre filiais.**

- No Formato 2 (ver abaixo), a coluna se chama `FORA_DE_LINHA`, com valores `"ATIVO"` ou
  `"FL"`. Toda fórmula de flag/prioridade na aba Dados é condicionada a
  `FORA_DE_LINHA="ATIVO"` — um item FL nunca recebe FLAG_RUPTURA, FLAG_DIVERGENCIA,
  FLAG_PARADO, FLAG_TRANSFERENCIA etc.; sua PRIORIDADE fica fixa em `"N/A (FORA DE LINHA)"`.
  Todos os KPIs do Resumo e todas as abas de ação (Ruptura, Transferência, Parado/Lento,
  Plano de Ação) são calculados só sobre os ATIVOS.
- Os itens FL não somem do arquivo: entram numa aba própria e informativa **"Itens Fora de
  Linha"**, sem flags/prioridade, só para consulta/cadastro.
- O Formato 1 (`filial_4_paulo_280826.xlsx`, 28/08/26) **não tinha** essa coluna. Se uma
  próxima planilha desse formato trouxer status de FL, aplicar a mesma lógica de exclusão;
  se a coluna não existir em um arquivo novo, perguntar ao usuário onde o status aparece
  antes de aplicar o filtro "no escuro".

## Regra de negócio: papel e geografia das filiais (rede: 1, 3, 4, 5, 6, 7)
Pedido explícito do usuário (31/08/26), aplicado tanto no motor do painel web quanto em
qualquer construção futura de planilha:

- **Filial 3** é um depósito fechado — abastece principalmente a matriz (filial 1) e as
  demais filiais. Não é um ponto de venda.
- **Filial 5** é um depósito fechado — atende basicamente a filial 4. Também não é um ponto
  de venda.
- Só as filiais **1, 4, 6 e 7** são pontos de venda de fato (1 é também a matriz).
- Como filiais 3 e 5 não vendem para o consumidor final, "sem venda" nelas **não é sinal de
  problema** — é o comportamento esperado. Por isso os flags de **Parado, Lento e Revisar
  Status/Sem Movimento** (todos baseados em ausência de venda) **não se aplicam a itens das
  filiais 3 e 5** — ficam de fora dessas listas, dos KPIs de parado/lento/revisar e do Plano
  de Ação. Divergência de estoque negativo continua valendo normalmente para elas (é sobre
  integridade de cadastro, não sobre venda).
- **Ruptura no depósito, refinado em 31/08/26**: estoque zerado num depósito (3 ou 5) só
  entra na lista de Ruptura quando a loja que ele abastece (filial 1 para o depósito 3,
  filial 4 para o depósito 5) **também** está com sinal de risco naquele produto — ou seja,
  ela mesma sem estoque disponível ou em ruptura crítica. Se a loja abastecida tem estoque
  saudável (não zerado e não em ruptura), o zero no depósito é giro normal — ele está
  fazendo o papel de buffer/redistribuição, não faltando de verdade — e **não é
  classificado como ruptura**. Essa comparação só é possível em arquivo multi-filial
  (precisa da linha da loja e do depósito lado a lado no mesmo arquivo); em arquivo
  single-filial a ruptura do depósito é avaliada sem esse cruzamento. Validado no arquivo
  Nestlé: dos 35 casos que antes apareciam como "ruptura" nos depósitos 3 e 5, só 1
  continuou sendo ruptura de verdade (a loja abastecida também estava zerada) — os outros
  34 eram estoque saudável na loja, com o depósito só girando normalmente. Ruptura nos
  pontos de venda normais (1, 4, 6, 7) não muda — a regra só reinterpreta o zero dentro dos
  depósitos.
- **Geografia** — as filiais estão em 3 cidades: Campinas (1, 3, 7), Santa Bárbara D'Oeste
  (4, 5) e Sorocaba (6 — sozinha na cidade). A matriz (filial 1) tem a melhor estrutura
  logística da rede (caminhões, equipe de separação e expedição), então consegue atender
  outras cidades melhor que as demais filiais.
- **Sugestão de origem de transferência** passa a ser priorizada por proximidade, não só por
  quantidade em estoque: 1º) mesma cidade do destino (cobre o depósito local — filial 3 para
  quem está em Campinas, filial 5 para a filial 4); 2º) matriz (filial 1), mesmo que em
  cidade diferente, pela capacidade logística; 3º) qualquer outra filial. Dentro de cada
  nível de prioridade, desempata pela maior quantidade disponível. O painel mostra a
  filial de origem sugerida junto com uma etiqueta de distância ("mesma cidade" / "via
  matriz" / "outra cidade") — desde 01/09/26, num fluxo visual "De → Para" com badges
  coloridos por filial (ver seção acima), em vez de só texto.
- No Formato 1 (que não tem coluna FILIAL explícita — a filial do próprio relatório é a que
  falta entre as colunas QTESTFx presentes), a mesma lógica de depósito é aplicada inferindo
  a filial do relatório a partir de qual coluna QTESTFx está ausente.

### Dois novos filtros de segurança na sugestão de transferência (01/09/26)
Pedido explícito do usuário: "caso haja pedidos a serem entregues nas filiais com estoque
baixo ou ruptura, não sugerir transferência se o pedido não estiver atrasado" e "caso a
transferência ocasione ruptura ou pré-ruptura na filial de origem (30 ou menos dias), não
sugerir a transferência do item".

- **Filtro 1 — pedido de compra já a caminho, ainda no prazo**: se a filial que precisaria
  da transferência já tem um pedido de compra em aberto (`QTPEDIDA > 0`) e a data prevista de
  chegada (`DTPREVENT`) ainda não venceu, o item deixa de aparecer na lista de Transferência —
  o reforço já está a caminho, transferir também duplicaria o esforço. Volta a sugerir
  transferência normalmente quando: não há pedido em aberto, ou quando o pedido existente já
  está atrasado (mesmo flag `pedidoAtrasado` usado na aba "Pedidos Atrasados") — nesse caso o
  reforço está incerto, então vale avaliar a transferência como alternativa mais rápida
  enquanto o pedido não chega. Quando existe pedido mas sem `DTPREVENT` preenchida (sem como
  confirmar se está no prazo), o padrão é tratar como "no prazo" por segurança — não sugere
  transferência. Aplicado ao Formato 2 (`analyzeFormat2`, tem `QTPEDIDA`/`DTPREVENT` por
  linha). **No Formato 1** o mesmo princípio foi aplicado de forma mais conservadora: o motor
  só sabe se existe pedido em aberto (`NUMPED` preenchido), sem uma data de previsão ligada a
  ele mapeada neste código (o único arquivo visto desse formato trazia `DTPREVENT_F4`/`F5`,
  colunas específicas de duas filiais, não uma previsão genérica por pedido) — então, sem
  como confirmar atraso, um pedido em aberto **sempre** bloqueia a sugestão de transferência
  nesse formato (equivalente a tratar todo pedido sem data confirmável como "no prazo").
- **Filtro 2 — não esvaziar quem já está apertado**: ao escolher a filial de origem de uma
  transferência (Formato 2, arquivo multi-filial — é o único caso em que o motor tem os dados
  de cada filial lado a lado para avaliar isso), uma filial só é considerada uma origem válida
  se ela própria não estiver em ruptura (`QTDISP > 0`, checagem que já existia) **nem em
  pré-ruptura** — definida aqui como cobertura de até 30 dias (`QTESTDIAS`/estimativa
  corrigida, o mesmo `qtestdiasParaStatus` usado na regra de estoque parado/lento). Se
  nenhuma filial com saldo sobrar depois desse filtro, o item some da lista de Transferência
  em vez de mostrar uma origem arriscada. **Ressalva importante**: essa checagem de cobertura
  só é aplicada quando a origem candidata tem giro de fato mensurável (venda real nos 3 meses,
  ou a estimativa do mês atual) — em depósitos (filiais 3 e 5), que normalmente não têm
  indicador de giro confiável (mesmo motivo pelo qual eles já ficam fora das listas de
  parado/lento — ver regra acima), a cobertura em dias não reflete risco real de faltar, então
  só a ruptura literal (estoque zerado) desqualifica um depósito como origem. Sem essa
  ressalva, praticamente todo depósito seria descartado como origem por "cobertura zero",
  quebrando o caminho principal de abastecimento (1 pede da 3, 4 pede da 5). Esse filtro
  **não é aplicado** em arquivo single-filial (Formato 2) nem no Formato 1 — nesses casos o
  motor só enxerga a quantidade em estoque de outras filiais via as colunas QTESTFx (um
  snapshot), sem o giro/cobertura de cada uma, então não há dado suficiente para avaliar se a
  origem ficaria apertada.
- **Testado**: `node vmtest.js` confirma que as contagens de ruptura, divergência, pedidos
  atrasados, parado e lento **não mudam** com esses dois filtros (só afetam a lista/KPI de
  Transferência, como esperado); as contagens de transferência caíram de forma consistente
  em todos os arquivos de referência (ex.: arquivo Nestlé multi-filial, de 429 para 371 itens
  no total, com queda em todas as 6 filiais). Também testado via Playwright contra uma cópia
  local do app.js/styles.css publicados: a coluna "De → Para" e os badges coloridos continuam
  renderizando normalmente com a lista filtrada, sem erros de página, e nenhum item da lista
  final de Transferência tem um pedido em aberto ainda no prazo nem uma origem sugerida com
  estoque zerado.

## Regra de negócio: estoque parado/lento distorcido por giro pouco confiável (Formato 2)
Pedido explícito do usuário (01/09/26): **quando um produto não tem vendas nos 3 meses
anteriores (`QTVENDAMES1+2+3 == 0`), isso não significa necessariamente que ele está parado
de verdade** — pode ser um cadastro novo (sem histórico ainda) ou um item que ficou em falta
nesse período (sem estoque para vender, então sem venda registrada). Marcar automaticamente
como "parado" nesses casos distorce o indicador.

- **Correção aplicada em `analyzeFormat2` (`app.js`)**: quando a soma dos 3 meses anteriores
  é zero, em vez de tratar a demanda como zero puro, o motor estima a demanda a partir da
  venda do **mês atual** (`QTVENDAMESFILTRO`) dividida pelos dias decorridos do período (do
  dia 01 até o dia do relatório, extraído de `reportDate.getDate()`) e projetada para 30
  dias — `vendaEstimadaMesAtual = (QTVENDAMESFILTRO / diasDecorridos) * 30`. Essa estimativa
  substitui o valor de vendas usado **só na classificação** de Parado/Lento (a coluna
  "Vendas (3m)" exibida na tabela continua mostrando o valor real, 0, para conferência).
- **`QTESTDIAS` (cobertura em dias) também é recalculado** nesse mesmo caso
  (`qtdisp / (vendaEstimadaMesAtual / 30)`), porque o `QTESTDIAS` que vem pronto no arquivo
  também costuma ser calculado a partir do giro histórico — ou seja, sofre da mesma
  distorção (fica artificialmente altíssimo para um item sem histórico) e continuaria
  empurrando o item para "Lento" mesmo depois de corrigida a parte de vendas.
- **Resultado**: um item sem histórico de 3 meses só continua marcado como parado se
  também não tiver vendido nada no mês atual (`QTVENDAMESFILTRO == 0` também); se tiver
  vendido bem no mês atual, some da lista de parado; se tiver vendido pouco, pode aparecer
  como "Lento" (cobertura recalculada, não a do arquivo). Itens classificados usando essa
  estimativa aparecem marcados como **"(estimado)"** na tabela Parado/Lento (na coluna
  Situação e na coluna Cobertura), com um tooltip explicando a estimativa usada — para não
  esconder do usuário que aquele número não veio direto do arquivo.
- Só entra em jogo quando o próprio arquivo traz a coluna `QTVENDAMESFILTRO` (nem todo
  arquivo Formato 2 visto até agora tem essa coluna preenchida de forma útil).
- **Escopo**: a correção foi aplicada só ao Formato 2 (que tem os campos
  `QTVENDAMESFILTRO`/`PERIODO_FILTRO` necessários). O Formato 1 já não sofre dessa distorção
  pelo mesmo motivo — ele classifica parado/lento pela data da `ULTIMA_VENDA`, e um produto
  sem nenhuma venda registrada simplesmente não é avaliado (`diasSemVenda` fica nulo, sem
  flag), então não há falso positivo a corrigir ali.
- Validado com casos sintéticos (não com um arquivo real, pois nenhum arquivo recebido até
  agora tinha um item nessa situação específica): produto novo com 40 unidades vendidas nos
  primeiros 20 dias do mês e 50 em estoque → deixa de ser marcado parado; produto novo com
  estoque de 500 e só 5 vendidas no mês → continua aparecendo, agora como "Lento" com
  cobertura recalculada (~2000 dias) em vez de "Parado"; produto realmente sem nenhuma venda
  (nem no mês atual) → continua "Parado" normalmente; produto com histórico normal nos 3
  meses → comportamento inalterado (estimativa nunca entra em jogo).

### Segunda camada: conferência contra a venda fechada real (01/09/26)
Pedido explícito do usuário como acompanhamento do caso acima: **"usar a venda fechada de
meses anteriores para calcular a média e comparar com a média que a planilha traz para
corrigir eventuais inconsistências"** — não confiar cegamente no `GIROMEDIO`/`QTESTDIAS`
prontos do arquivo mesmo quando existe histórico de 3 meses.

- **Giro médio calculado**: `giroMedioCalculado = (QTVENDAMES1+QTVENDAMES2+QTVENDAMES3) / 3
  / 30` (unidades/dia), a partir da venda **fechada** real — só calculado quando a soma dos
  3 meses é maior que zero (ou seja, é um complemento à camada anterior, não uma
  substituição: quando os 3 meses somam zero, quem resolve é a estimativa do mês atual
  descrita acima).
- **Inconsistente quando**: o `GIROMEDIO` do arquivo é zero/vazio apesar de haver venda
  fechada real, OU a diferença entre o `GIROMEDIO` do arquivo e o `giroMedioCalculado`
  passa de 50% (para mais ou para menos). Threshold escolhido para pegar distorções reais
  (giro desatualizado, ou calculado sobre uma janela diferente, ex. 6-12 meses) sem reagir a
  flutuação normal de mês a mês.
- Quando inconsistente, a cobertura usada na classificação de Parado/Lento passa a ser
  `qtestdiasCalculado = QTDISP / giroMedioCalculado`, no lugar do `QTESTDIAS` bruto do
  arquivo. Cobre os dois sentidos do problema: **GIROMEDIO desatualizado/zerado** (fazia o
  `QTESTDIAS` disparar e um item saudável parecer super parado/lento — o mesmo tipo de
  efeito do caso relatado originalmente) e **GIROMEDIO inflado** (fazia o `QTESTDIAS` cair
  demais e mascarar um item que está parado de verdade).
- Itens corrigidos por essa camada aparecem marcados como **"(corrigido)"** na tabela
  Parado/Lento (diferente de "(estimado)", que é só para o caso de zero histórico) — com um
  tooltip mostrando o giro do arquivo e o giro calculado lado a lado, para conferência.
- Validado com casos sintéticos: item com `GIROMEDIO=0` no arquivo mas venda fechada real de
  ~1 un./dia e `QTESTDIAS` absurdo (99999) → corrigido para cobertura real (~100 dias,
  continua Lento, mas com número plausível); item com `GIROMEDIO` e venda fechada batendo →
  não mexe em nada; item com `GIROMEDIO` do arquivo bem mais alto que a venda fechada real
  (dava só 15 dias de cobertura no arquivo, mas a venda fechada real implica ~300 dias) →
  descoberto como Lento pela primeira vez, corrigindo um falso negativo que o `QTESTDIAS`
  do arquivo estava escondendo.

### Estoque virtual (erro de contagem) e alerta de cobertura configurável (01/09/26)
Pedido explícito do usuário: tratar itens como o **365399** — estoque disponível de **1
unidade**, **venda zero** no período e **cobertura zero** — como estoque virtual que precisa
de contagem física, não como produto parado; e tornar configurável o limite de dias de
cobertura (padrão 60) que dispara o alerta "Lento".

- **Estoque virtual**: novo flag `flagEstoqueVirtual`, calculado em `analyzeFormat2` antes do
  flag de Parado (e o exclui de lá): dispara quando `QTDISP > 0 E QTDISP <= 1 E vendas nos 3
  meses = 0 E cobertura (QTESTDIAS/estimativa corrigida) = 0`. A lógica por trás: a fórmula de
  cobertura é `QTDISP / GIROMEDIO` — ela só dá exatamente **zero** com estoque positivo
  quando o próprio arquivo já zera o giro por falta de venda, o que não é o comportamento
  esperado de um item realmente parado (que tenderia a mostrar cobertura alta/indefinida, não
  zero) — é a assinatura típica de um saldo residual de 1 unidade que não existe fisicamente
  (quebra não baixada, erro de contagem, resquício de devolução etc.). Não se aplica a
  depósitos (3 e 5, mesma exceção do Parado/Lento) nem ao Formato 1 (que não tem o conceito de
  `QTESTDIAS`/cobertura em dias — usa dias desde a última venda). **Deliberadamente estreito**
  (exatamente 1 unidade, o exemplo dado pelo usuário) — se a equipe achar que residuais de 2
  ou 3 unidades também se encaixam nesse padrão, o limite (`qtdisp <= 1` no código) pode ser
  ampliado.
  - Ganhou aba própria **"Estoque Virtual"** no painel (mesmas colunas de Parado/Lento), KPI
    clicável, entrada na tabela "Indicadores por Filial" e linha própria no Plano de Ação
    ("incluir na próxima contagem/inventário físico; não tratar como item parado").
  - Testado com os arquivos reais de referência: 2 itens reclassificados no arquivo do Paulo
    (biscoito wafer e chocolate baton, ambos com 1 un. disponível/0 vendas/cobertura 0) e 4 no
    arquivo Nestlé multi-filial — conferido que todos batem exatamente com o padrão descrito
    (não é um efeito colateral capturando itens diferentes do esperado).
- **Alerta de cobertura configurável**: o limite de dias que classifica um item como "Lento"
  (`qtestdiasParaStatus > limite`, antes fixo em 60) agora vem de
  `STATE.coberturaAlertaDias` (novo campo do estado compartilhado, padrão 60 quando ausente) e
  pode ser alterado pela equipe direto no **painel de admin**, numa nova seção "Alerta de
  cobertura de estoque" (mesmo padrão de formulário + botão Salvar das outras configurações do
  admin). **Importante, e avisado na própria tela do admin**: como cada análise salva o
  resultado já calculado no momento do upload (não recalcula ao abrir depois), mudar esse
  limite só afeta as **próximas** análises enviadas — as que já estão no histórico mantêm o
  limite que estava em vigor quando foram geradas. Isso segue o mesmo padrão de todas as
  outras mudanças de regra de negócio deste projeto (nenhuma delas jamais recalculou
  retroativamente análises já salvas).
  - O texto do badge "Lento" passou a mostrar o número de dias realmente usado (ex.: "⚠ LENTO
    (cobertura 75+ dias)" se configurado para 75) em vez do texto fixo "60+ dias" — o ⚠ foi
    adicionado como reforço visual de "precisa de atenção", a pedido do usuário ("deve haver
    uma notificação de atenção ao item"). Como a busca da tabela ignora esse prefixo (segue
    funcionando por substring), continua possível filtrar por "LENTO" normalmente.
  - Abaixo dos indicadores (KPIs), quando há itens Lento, aparece um aviso destacado (mesmo
    estilo visual da nota de valor de estoque parado) com a contagem e o limite em uso:
    "⚠ N itens estão com cobertura de estoque acima de X dias (limite configurável no painel
    de admin) — avaliar redução das próximas compras."
  - Internamente, a classificação (`paradoTipo`: "PARADO"/"LENTO"/vazio) foi separada do texto
    exibido no badge (`flagParado`), já que o texto passou a variar conforme o limite
    configurado — os contadores/KPIs/agrupamento por filial usam `paradoTipo`, nunca mais uma
    comparação de texto exata contra "LENTO (cobertura 60+ dias)".
- Nenhuma mudança nesta rodada afeta ruptura, divergência, pedidos atrasados ou a lógica de
  transferência — confirmado via `node vmtest.js` (as únicas contagens que mudaram foram
  Parado, agora refletindo os itens reclassificados como Estoque Virtual) e via Playwright
  contra uma cópia local do app.js/styles.css publicados, cobrindo: a aba Estoque Virtual, o
  aviso de cobertura, o badge "⚠ LENTO" com o número dinâmico ainda buscável por "LENTO", e o
  novo campo do painel de admin salvando o valor em `STATE.coberturaAlertaDias`.

### Colunas ordenáveis por clique + ordenação padrão revisada (01/09/26)
Pedido explícito do usuário: tornar as colunas das tabelas de resultado ordenáveis ao
clicar, com shift+clique acumulando mais uma coluna de critério de desempate e ctrl/cmd+
clique removendo uma coluna da ordenação acumulada; e revisar a ordenação padrão (antes de
qualquer clique) de três listas específicas do Formato 2.

- **Ordenação interativa por coluna**: cada coluna de cada aba (Formato 1 e Formato 2) ganhou
  um `sortKey` (id estável) e um `sortValue(r)` (número, string ou data usado na comparação),
  além de um `sortDir` (direção usada no primeiro clique — a maioria dos campos "quanto
  maior, mais urgente" como Vendas/Giro médio/Estoque outras filiais começa em decrescente;
  campos de texto e código, e onde "menor é mais urgente" como Qt. Disponível nas abas de
  ruptura/transferência, começam em crescente). Clique simples substitui a ordenação da aba
  por aquela única coluna (ou inverte a direção, se ela já era a única coluna ativa);
  shift+clique acumula (ou inverte, se a coluna já estava na lista); ctrl/cmd+clique remove a
  coluna da ordenação acumulada, se presente. Cabeçalhos ordenáveis mostram uma seta ▲/▼
  quando ativos (⇅ apagado quando não usados) e um número sobrescrito quando há mais de uma
  coluna ativa, indicando a prioridade de desempate. Um botão **"↺ Ordenação padrão"** aparece
  ao lado do "⤢ Maximizar" sempre que há uma ordenação manual ativa na aba, para voltar à
  ordem original com um clique — soma-se ao "⤢ Maximizar" existente, também reproduzido no
  modo tela cheia. A ordenação escolhida é guardada por aba (trocar de aba não perde a
  ordenação da aba anterior) mas não é persistida entre sessões/dispositivos (fica só na
  memória da página, como o filtro de busca).
- **Ordenação padrão revisada** (o motor `analyzeFormat2`, não a interação por clique — só
  muda a ordem inicial antes de qualquer clique, nenhuma contagem/KPI foi afetada):
  - **Ruptura/Divergências**: agora ordena por `QTDISP` **crescente** (os valores mais
    negativos primeiro), com giro médio decrescente como desempate — cobre tanto ruptura
    crítica (`QTDISP = 0`) quanto divergência (`QTDISP < 0`) numa única régua, priorizando as
    maiores divergências de estoque negativo no topo.
  - **Transferência**: agora ordena por `vendas` (a venda da própria filial que precisa do
    item, não da origem) **decrescente**, com estoque disponível nas outras filiais como
    desempate — prioriza o item que mais vende na filial carente. A aba ganhou uma coluna
    **"Vendas (3m)"** nova para deixar esse critério visível (antes só existia internamente).
  - **Parado/Lento**: agora ordena por `qtestdiasParaStatus` (a mesma cobertura corrigida já
    mostrada na coluna "Cobertura (dias)") **decrescente** — maiores coberturas primeiro. Como
    itens PARADO (zero venda em 3 meses) estruturalmente têm cobertura zerada/não
    significativa, eles afundam sozinhos para o fim da lista com esse sort numérico simples,
    sem precisar de nenhuma regra especial para separá-los dos itens LENTO — satisfaz a
    ressalva do usuário de que "cobertura zerada não é estoque parado" sem código adicional.
  - Formato 1 não foi alterado nessa rodada (o pedido do usuário, pelo texto, girava em torno
    de conceitos específicos do Formato 2 — estoque negativo/divergência e cobertura em dias
    — que o Formato 1 não tem da mesma forma).
- Validado com `node vmtest.js` (nenhuma contagem mudou — só a ordem interna dos arrays) e com
  Playwright contra uma cópia local do app.js/styles.css publicados: clique simples, clique
  duplo (inverte direção), shift+clique (acumula), ctrl+clique (remove), botão de reset,
  funcionamento espelhado no modo tela cheia, e as três novas ordens padrão conferidas item a
  item (ex.: primeiros valores de Qt. Disponível em Ruptura/Divergências saindo -10, -5, -3,
  -3, -2... corretamente crescente).

### Bug corrigido: seletor de arquivo do sistema reabria ao clicar "Processar" (02/09/26)
Reportado pela equipe: depois de escolher o arquivo e clicar em "Processar", a janela do
Windows para escolher arquivo abria de novo sozinha, sem nenhuma necessidade de escolher ou
gravar outro arquivo — interrompendo o processamento que tinha acabado de começar.

- **Causa**: a área de arrastar-e-soltar (`#dropzone`) tem um listener de clique que abre o
  seletor de arquivo do sistema (`fileInput.click()`) — correto para quando o usuário clica na
  área vazia para escolher um arquivo. Só que depois que um arquivo é escolhido,
  `handleFile()` substitui o conteúdo interno dessa mesma área por uma mensagem + o botão
  "Processar" — ou seja, o botão passa a ficar **dentro** da área clicável. Como cliques
  borbulham pelo DOM por padrão, clicar em "Processar" também contava como clique na área de
  arrastar-e-soltar, reabrindo o seletor de arquivo por cima do processamento.
- **Correção**: o listener de clique da área agora ignora cliques que se originam de dentro de
  um `<button>` (`e.target.closest("button")`), então só abre o seletor quando o clique é
  realmente na área vazia, nunca em cima de um botão interno.
- Validado com Playwright escutando o evento nativo `filechooser` do Chromium (que dispara
  sempre que um `<input type="file">` seria clicado, mesmo programaticamente) — confirmado que
  o bug antigo disparava um segundo `filechooser` ao clicar em "Processar" e que, com a
  correção, só dispara o esperado (um, ao clicar na área vazia originalmente).

### Valor financeiro do excesso por item + refinamento de cadastro novo/falta no fornecedor (02/09/26)
Pedido da equipe de compras: (1) ao detectar excesso/estoque parado, trazer também o valor
financeiro do problema, item a item, não só o total agregado; (2) para itens sem venda em
todos os 3 meses anteriores, diferenciar cadastro novo (sem histórico, não é excesso de
verdade), falta no fornecedor (1-2 meses sem venda, reabastecido depois) e possível ruptura na
loja — hoje só dá pra tratar os dois primeiros casos com o dado disponível no arquivo (ver
ressalva abaixo).

- **Coluna "Valor (R$)" por item**: as tabelas "Estoque Parado" (Formato 1) e "Parado / Lento"
  (Formato 2) ganharam uma coluna com o `valorEstoque` de cada item (mesmo dado que já
  alimentava o total agregado — ver nota abaixo), ordenável, só aparece quando o arquivo tem
  coluna de valor (`hasValueData`). O texto do KPI de valor parado/lento passou a apontar para
  essa coluna explicitamente.
- **"Cadastro Novo" — aba própria, não conta mais como parado/lento**: itens com soma zero de
  venda nos 3 meses anteriores mas já vendendo no mês atual (`vendaEstimadaMesAtual` — cálculo
  que já existia desde 01/09/26, ver seção acima) deixam de entrar na classificação
  Parado/Lento e passam a ter aba/indicador/coluna por filial próprios, "Cadastro Novo". A
  lógica: sem nenhum histórico anterior não há base de comparação, então não é excesso de
  verdade — só falta acompanhar normalmente até completar histórico. Prioridade
  `4-CADASTRO NOVO` no Plano de Ação (mesmo nível de "Estoque Virtual").
- **Falta no fornecedor (1-2 dos 3 meses sem venda)**: novo campo `possivelFaltaFornecedor`
  (`vendas > 0 && mesesComVenda` entre 1 e 2). Nesse caso, `giroMedioCalculado` passa a dividir
  a venda total pelos meses que **tiveram** venda em vez de sempre 3 — evita diluir o giro real
  pelo(s) mês(es) em que o item provavelmente ficou sem estoque para vender (não é queda real
  de demanda). Esse giro recalculado entra no mesmo mecanismo de correção do `giromedioInconsistente`
  que já existia (01/09/26, seção "Segunda camada" acima) — quando o `GIROMEDIO` do arquivo não
  bate com o recalculado, a cobertura em dias usada na classificação passa a ser a recalculada.
  Aparece marcado como "(corrigido — meses sem venda)" na tabela, com tooltip explicando quantos
  dos 3 meses tiveram venda — texto distinto do "(corrigido)" genérico já existente, para deixar
  claro que é um caso diferente (falta no fornecedor, não giro desatualizado).
- **Ressalva sobre ruptura por vales e picos**: o pedido original também mencionava identificar
  ruptura pela alternância de venda/estoque zerado ao longo do período ("muitos vales e picos").
  O arquivo **não traz estoque histórico por mês** (só venda por mês — `QTVENDAMES1/2/3` no
  Formato 2), então não dá para confirmar esse padrão com certeza a partir do dado disponível;
  fica coberto pela mesma lógica de falta no fornecedor acima (1-2 meses sem venda), que é a
  aproximação possível com os dados que o Winthor exporta hoje. Se um arquivo futuro trouxer
  estoque histórico por mês, esse ponto pode ser revisitado.
- **Escopo**: as duas mudanças acima (cadastro novo e falta no fornecedor) foram aplicadas só
  ao Formato 2 — o Formato 1 usa uma lógica de "Estoque Parado" baseada em dias desde a última
  venda (`diasSemVenda`/`ULTIMA_VENDA`), estruturalmente diferente do giro/cobertura por 3 meses
  do Formato 2, mesmo padrão de escopo já usado nas mudanças de 01/09/26. Já a coluna "Valor
  (R$)" por item se aplica aos dois formatos, já que ambos já tinham a infraestrutura de
  `valorEstoque`/detecção de coluna de valor.
- **Testado**: `node vmtest.js` (baselines atualizadas, com comentários datados) e um teste
  Playwright cobrindo upload real do arquivo com dado de valor (`8268 rodrigo 310826 ype 99
  corrigido valor est.xlsx`), a coluna "Valor (R$)" renderizando com valores formatados
  corretos, o tooltip "(corrigido — meses sem venda)" aparecendo na tabela, a coluna "Cadastro
  Novo" no indicador por filial, e a regressão do bug do seletor de arquivo (02/09/26, acima)
  seguindo corrigida. Também um teste isolado forçando o padrão de cadastro novo (sem esse
  padrão presente nos arquivos de referência reais) para confirmar que a aba/KPI/Plano de Ação
  aparecem corretamente quando há itens nesse caso.

### Portal de ferramentas + Ruptura Zero (03/09/26)
Pedido da equipe: (1) transformar a página num portal, já que vão existir visões/ferramentas
diferentes; (2) primeira ferramenta nova, "Ruptura Zero" — monitora itens que não podem faltar
nas lojas, alimentados por uma planilha de cadastro enviada com frequência; a análise em cima
desse cadastro ainda não foi detalhada pelo usuário, só a estrutura de cadastro/upload; (3)
investigar um bug relatado (código de produto não aparecia numa coluna, tema claro).

- **Portal**: a tela inicial (depois da senha de acesso) agora mostra um **cartão por
  ferramenta** em vez de abrir direto no painel de análise — hoje só "Painel de Análise" e
  "Ruptura Zero", com espaço para novas ferramentas no futuro (bastaria adicionar num array,
  `PORTAL_APPS` em `app.js`). Cada cartão mostra uma estatística rápida (nº de análises no
  histórico / nº de itens cadastrados). Qual tela está ativa (`ACTIVE_APP`: portal/analise/
  rupturaZero) é uma preferência de navegação por pessoa, salva no navegador (`localStorage`,
  mesmo mecanismo do tema de cor) — não faz parte do histórico compartilhado da equipe. Cada
  ferramenta tem um link "← Portal" no topo para voltar. Login (senha da página), painel de
  admin e configurações (senha, apelidos de comprador, alerta de cobertura) continuam
  **compartilhados** entre as ferramentas — não há senha por ferramenta.
- **Ruptura Zero — estrutura pronta, análise ainda por detalhar**: nova aba/ferramenta com
  upload de planilha (mesmo padrão de drag-and-drop do painel de análise, incluindo a correção
  do bug do seletor de arquivo de 02/09/26) que vira um "cadastro" — lista de itens
  monitorados. Cada envio substitui o cadastro ativo e fica salvo num **histórico próprio**
  (`STATE.rupturaZero.history`, mesmo padrão do histórico de análises, até 12 envios mais
  recentes), pra poder reenviar sempre que a lista mudar sem perder os cadastros anteriores.
  Reconhecimento de colunas genérico (reaproveita `splitProdutoCodigo`, a mesma lógica robusta
  do painel de análise — ver bug abaixo): tenta achar código/descrição por nome de coluna ou
  separando um campo combinado tipo "código - descrição"; qualquer outra coluna do arquivo
  aparece como coluna extra na tabela, sem exigir um layout fixo, já que o formato exato do
  cadastro ainda não foi definido pelo usuário. **Não há nenhuma lógica de análise de ruptura
  ainda** (comparar o cadastro com outra fonte, alertar item zerado etc.) — só cadastro +
  visualização + busca. Isso é proposital: a lógica será detalhada pelo usuário numa próxima
  rodada e entra em cima dessa mesma estrutura, sem precisar mudar o upload/histórico.
- **Bug investigado: código de produto não aparecia numa coluna (tema claro)**: revisão
  completa do CSS de tabela e dos tokens de cor do tema claro (`:root` em `styles.css`) não
  encontrou nenhum problema de contraste/sobreposição específico do tema claro — texto de
  célula usa `--text` sobre `--surface`, sem regra que esconda ou pinte a primeira coluna de
  forma diferente das demais. O usuário esclareceu que não era problema dos dados vindos da
  planilha, e sim da apresentação na página — não foi possível reproduzir o caso exato sem o
  arquivo/print original. Como precaução, a extração de código ficou mais robusta nos dois
  formatos: `splitProdutoCodigo` (usada quando o código vem embutido no campo `PRODUTO`, ex.
  "249912 - LEITE COND MOCA") passou a aceitar mais variações de separador (hífen, travessão/
  en-dash, dois-pontos, com ou sem espaço) em vez de só o hífen original, e ganhou um fallback
  extra: se a coluna de código dedicada existir mas vier vazia numa linha específica, tenta
  extrair o código do campo `PRODUTO` combinado antes de deixar a célula em branco. O Formato 1
  (`analyzeFormat1`) ganhou a mesma cadeia de fallback de nomes de coluna que o Formato 2 já
  tinha (`CODPROD`/`CODIGO`/`COD_PRODUTO`/`CODPRODUTO`) e as colunas "Código" de ambos os
  formatos agora mostram "-" (em vez de célula vazia) quando o código realmente não é
  encontrado, pra ficar visualmente claro que é uma ausência de dado e não um bug de
  renderização. **Se o problema voltar a acontecer**, o mais útil é o arquivo original (ou pelo
  menos a linha do item) ou um print da tela — sem isso não dá pra confirmar a causa exata.
- **Testado**: `node vmtest.js` (sem regressão nos totais/contagens de nenhum arquivo de
  referência) e um teste Playwright cobrindo o fluxo completo: portal → cartões corretos →
  entrar no painel de análise (histórico da equipe intacto, código de produto renderizando
  normalmente, link "← Portal" funcionando) → voltar ao portal → entrar em Ruptura Zero →
  upload de um arquivo de referência real → tabela de cadastro com código/descrição
  reconhecidos + colunas extras do arquivo original → busca funcionando → item aparecendo no
  histórico de cadastros → regressão do bug do seletor de arquivo (02/09/26) confirmada
  corrigida também nesse novo upload.

### Limite de cobertura por envio, nota de depósito removida, Plano de Ação no fim, KPIs redesenhados (03/09/26)
Quatro ajustes pedidos pela equipe no painel de análise, sem relação entre si.

- **Limite de cobertura (dias) saiu do admin, virou campo por envio**: antes `STATE.coberturaAlertaDias`
  era configurado uma vez no painel de admin e valia fixo pra equipe toda até alguém trocar de
  novo lá. Pedido do usuário: tirar do admin, colocar um campo perto do upload, preenchido a
  cada envio. Antes de implementar, perguntei se "o campo" deveria ser um número de dias (igual
  ao que já existia, só que por envio) ou uma data de referência para cálculo dinâmico — o
  usuário confirmou **campo numérico de dias**. Implementado: campo `#coberturaAlertaInput` no
  painel de "Nova análise", ao lado do dropzone, pré-preenchido com o último valor usado
  (`STATE.coberturaAlertaDias` agora serve só de sugestão de preenchimento, não de valor fixo
  aplicado). `processFile()` lê o valor do campo no momento do envio (com fallback pro último
  valor caso o campo esteja vazio/inválido) e passa pra `analyzeWorkbookRows` — o mesmo
  mecanismo de sempre, só que a fonte do número mudou. Cada análise no histórico continua
  guardando o limite realmente usado (`result.coberturaAlertaDias`), então análises antigas não
  são afetadas. Removida a seção "Alerta de cobertura de estoque" do painel de admin.
- **Nota de depósito removida dos KPIs**: a mensagem "Filiais 3 e 5 são depósitos de
  abastecimento, não pontos de venda — não entram nos indicadores de parado/lento/estoque
  virtual/revisar status. Sugestões de transferência priorizam a mesma cidade e, em seguida, a
  matriz (filial 1)..." aparecia em toda análise multi-filial com depósito. Pedido do usuário:
  remover, "o comercial já tem ciência dessa característica". A regra em si (depósito fora
  desses indicadores) continua no motor sem nenhuma mudança — só a explicação textual repetida
  saiu da tela. A legenda mais curta da tabela "Indicadores por Filial" (explicando o símbolo
  "—" nas colunas onde depósito não se aplica) foi mantida, por ser diferente (funcional, não
  repetitiva) e não ter sido citada pelo usuário.
- **Plano de Ação movido para o fim da página**: antes vinha logo após KPIs/Indicadores por
  Filial, antes da tabela de resultados. Passou a vir depois da tabela (e do modo tela cheia),
  como o último bloco de conteúdo da análise antes do rodapé.
- **KPIs redesenhados**: pedido do usuário, "caso tenha sugestão baseado em sistemas atuais e
  modernos" — usei a skill de dataviz do Claude como referência (contrato de stat tile, e o
  anti-padrão explícito de "blocos grandes com cor saturada sólida" que era exatamente o estilo
  anterior dos cartões). Duas mudanças: (1) cada cartão deixou de ter o fundo inteiro colorido
  (`--sev-x-bg`) e passou a ter fundo neutro com uma faixa de 3px na borda esquerda na cor de
  severidade — cor como acento, não como bloco grande; (2) os cartões passaram a ficar
  agrupados em seções com rótulo (`kpiSection()`): "Visão geral", "Ruptura & divergência",
  "Estoque parado & lento", "Movimentação" — mais fácil de escanear o que é prioritário em vez
  de uma grade única indiferenciada. O valor grande do cartão deixou de usar
  `font-variant-numeric: tabular-nums` (que só faz sentido pra colunas de tabela alinhadas;
  atrapalhava o espaçamento de um número grande sozinho, também um anti-padrão citado pela
  skill). Clique/hover pra ir à lista filtrada continua funcionando igual.
- **Testado**: `node vmtest.js` sem regressão (o `coberturaAlertaDias` agora vem de um argumento
  explícito em vez de `STATE` direto, mas a função `analyzeWorkbookRows` não mudou de
  assinatura) e um teste Playwright cobrindo: campo de cobertura visível e fora do admin, admin
  sem a seção removida, nota de depósito ausente (inclusive numa análise multi-filial com
  depósito real), Plano de Ação depois da tabela no DOM, seções/rótulos dos KPIs corretos,
  borda esquerda colorida presente, e um upload real com limite customizado (5 dias) confirmando
  que o texto do alerta de cobertura reflete o valor preenchido no campo (não mais um valor
  fixo) — além da regressão do bug do seletor de arquivo (02/09/26) confirmada intacta.

### Limite de cobertura "ao vivo", com botão OK para recalcular sem reenviar o arquivo (04/09/26)
Ajuste de um dia sobre o item acima: o campo por envio criado em 03/09/26 exigia reenviar o
arquivo inteiro toda vez que a equipe queria testar outro limite de cobertura — na prática não
era "ao vivo". Pedido do usuário: "o campo de dias de cobertura deve funcionar 'on the fly',
então o cálculo é refeito na alteração então é necessário ter um botão de ok para confirmar e
assim refazer o cálculo".

- **Campo saiu do painel de upload e entrou na própria análise**: `renderCoberturaLiveControl(entry)`
  substitui o antigo campo de `renderUploadPanel()` — aparece logo abaixo do cabeçalho da
  análise (antes das KPIs), só para Formato 2 (único formato com o conceito de cobertura em
  dias). O upload em si passou a usar sempre `STATE.coberturaAlertaDias` (60 por padrão, ou o
  último valor confirmado) sem pedir nada no momento do envio — o ajuste fino acontece depois,
  já vendo o resultado.
- **Recalcula sem reenviar o arquivo, via `RAW_DATA_BY_ENTRY`**: as linhas brutas do arquivo
  (`rows`/`headers`/`reportDateStr`) lidas em `processFile()` passaram a ficar guardadas num
  `Map` module-level (`RAW_DATA_BY_ENTRY`, chave = id da análise), só na memória da aba/navegador
  de quem fez o upload — deliberadamente **não** entra em `STATE`/no histórico compartilhado,
  para não inflar o estado salvo (persistido a cada publish) com milhares de linhas por análise.
  Ao clicar em "OK, recalcular" (ou Enter no campo), `recalcCobertura()` roda de novo
  `analyzeWorkbookRows()` com o novo limite sobre essas linhas guardadas, substitui
  `entry.result` inteiro (recalculando Parado/Lento e tudo que deriva disso: KPIs, abas, tabela,
  Plano de Ação) e persiste o resultado atualizado pro histórico da equipe — as próximas pessoas
  que abrirem essa análise já veem o resultado recalculado, mesmo sem ter os dados brutos na
  própria aba.
- **Análises sem dados brutos nesta aba ficam com o controle desabilitado**: uma análise aberta
  a partir do histórico compartilhado (enviada por outra pessoa, ou reaberta depois de recarregar
  a página) não tem entrada em `RAW_DATA_BY_ENTRY` nesta aba — o campo/botão aparecem desabilitados
  com um aviso pedindo para reenviar o arquivo original se quiser ajustar o limite dela. Extensão
  natural do mesmo trade-off: recalcular "de verdade" sempre exigiu os dados originais; a
  diferença agora é que, enquanto esses dados existem na aba de quem enviou, não é mais preciso
  reenviar o arquivo a cada tentativa de valor.
- **Testado**: `node vmtest.js` sem regressão e um teste Playwright cobrindo o fluxo completo:
  upload real → controle habilitado com valor padrão (60) → KPI "Lento" antes do recálculo →
  alterar para 5 dias e clicar "OK, recalcular" → KPI "Lento" aumenta (mais itens cruzam um
  limite menor) → callout de alerta reflete o novo limite (5, não mais 60) → trocar para uma
  análise antiga do histórico compartilhado → controle aparece desabilitado com o aviso de
  reenvio → regressão do bug do seletor de arquivo (02/09/26) confirmada intacta.

### Correção: campo de cobertura "ao vivo" aparecia bloqueado fora da aba do upload (05/09/26)
Bug relatado pelo usuário logo após o item acima ir ao ar: "o campo está bloqueado para
alteração". Causa raiz: a primeira versão guardava as linhas brutas do arquivo
(`rows`/`headers`/`reportDateStr`) num `Map` (`RAW_DATA_BY_ENTRY`) só na memória da aba que fez
o upload — deliberadamente fora de `STATE`, achando que era proteção contra inflar o histórico
salvo. Na prática isso quebrava o próprio objetivo do recurso: o campo só ficava editável
enquanto a página não fosse recarregada e só para quem tinha acabado de subir o arquivo — em
qualquer outro caso (reload, outro navegador, outra pessoa da equipe, ou simplesmente voltar
depois) o controle aparecia desabilitado, o que pareceu um bug (e na prática limitava demais o
recurso).

- **Correção**: `rawData` (rows/headers/reportDateStr) passou a ser um campo do próprio objeto
  de entrada do histórico (`entry.rawData`, só para Formato 2), gravado em `processFile()` junto
  com o resto da análise. Como `persist()` simplesmente serializa `STATE` inteiro
  (`JSON.stringify(STATE)` dentro de `buildFullDocument()`), `rawData` passa a ser publicado
  junto com a análise — qualquer pessoa que abrir essa análise, em qualquer aparelho, a qualquer
  momento, consegue usar o recálculo. `RAW_DATA_BY_ENTRY` (o `Map` em memória) foi removido por
  completo, junto com toda a lógica de limpeza associada a ele (na exclusão de item do histórico,
  no corte do histórico em 12 itens).
- **Efeito colateral aceito conscientemente**: cada análise Formato 2 no histórico compartilhado
  fica mais pesada no estado salvo (as linhas originais do arquivo, não só o resultado
  calculado) — testado com o maior arquivo de referência (~1200 linhas, 30 colunas): ~700KB a
  mais por análise. Como o histórico já é limitado a 12 itens, o tamanho tem um teto, e o
  resultado calculado já expõe virtualmente os mesmos dados por item (código, descrição, filial,
  quantidades, valor etc.) — guardar as linhas originais não é uma exposição de dado
  qualitativamente nova.
- **Análises enviadas antes desta correção continuam sem o recurso** (não têm `rawData`
  salvo) — o controle continua aparecendo desabilitado para elas, agora com um texto mais claro
  ("esta análise foi enviada antes deste recurso existir...") em vez do texto anterior que dava a
  entender (incorretamente) que bastava trocar de aba/navegador para resolver.
- **Testado**: `node vmtest.js` sem regressão e um teste Playwright que reproduz o cenário do
  bug: upload → confirma que `STATE.history[0].rawData` está populado (é isso que `persist()`
  salva) → reconstrói o documento exatamente como `buildFullDocument()`/`persist()` fariam →
  reabre esse documento "publicado" simulando outro navegador/pessoa → confirma que o campo
  continua editável (bug corrigido) → confirma que o recálculo ainda funciona normalmente nesse
  cenário → confirma que uma análise antiga (sem `rawData`) continua corretamente desabilitada,
  com o novo texto de aviso → regressão do bug do seletor de arquivo (02/09/26) confirmada
  intacta.

### Novo indicador "Risco de Falta" (iminência de falta), usando o mesmo limite de cobertura (05/09/26)
Pedido do usuário: "o campo de dias deve servir também para o cálculo de ruptura, para que
seja possível ter a visão daquilo que há em excesso ou em falta - ou na iminência de falta."
Até então o campo de limite de cobertura (o mesmo do controle "ao vivo" descrito acima) só
servia para sinalizar excesso (cobertura ALTA demais → "Lento"). Faltava o lado oposto: itens
com estoque ainda positivo e ainda vendendo, mas com cobertura BAIXA demais — no meio do
caminho entre "Lento" (excesso) e "Ruptura Crítica" (estoque já zerado).

- **Mecânica escolhida** (perguntado ao usuário antes de implementar, entre 3 opções — fração
  do mesmo limite, mesmo valor fixo nas duas direções, ou um segundo campo separado): **fração
  do mesmo limite** (25% do valor configurado). Reaproveita o único campo de cobertura já
  existente — não introduz um segundo controle na interface. Ex.: com o limite em 60 dias
  (padrão), qualquer item ativo, sem ser depósito/estoque virtual/cadastro novo, com estoque
  disponível > 0, ainda vendendo, e cobertura estimada abaixo de 15 dias (25% de 60) entra
  nessa nova classificação.
- **Implementação** (`analyzeFormat2` em `app.js`): nova constante `RISCO_FALTA_FRACAO = 0.25`;
  `flagIminenciaFalta` calculado logo após o bloco de `flagParado`/`paradoTipo`, com as mesmas
  exclusões já usadas pelas outras classificações (depósito, estoque virtual, cadastro novo).
  Prioridade no Plano de Ação: `"2-RISCO DE FALTA"`, mesmo nível de `"2-ALTA"` (divergência).
  Verificado analiticamente e por regressão (`vmtest.js`, zero mudança nas contagens
  pré-existentes de nenhuma classificação) que as condições não podem se sobrepor com Ruptura
  Crítica (exige `qtdisp === 0`), Parado (exige venda zerada) ou Lento (exige cobertura ACIMA
  do limite cheio, direção oposta) — a nova classificação é puramente aditiva.
- **Onde aparece**: indicador (KPI) novo na seção "Ruptura & divergência" ("Risco de falta
  (cobertura curta)"); aba própria "Risco de Falta" (mesmas colunas de Ruptura, ordenada pela
  cobertura mais baixa primeiro); nova coluna "Risco de Falta" na tabela "Indicadores por
  Filial" (entre Divergência e Parado); novo item no Plano de Ação ("itens com estoque ainda
  positivo e vendendo, mas cobertura curta demais... priorizar reposição/transferência antes
  que o estoque zere").
- **Integração com o controle "ao vivo"** (04/09/26): como usa o mesmo `coberturaAlertaDias`
  do controle já existente, ajustar o campo e clicar "OK, recalcular" atualiza também a
  contagem de Risco de Falta, não só a de Lento — sem nenhuma mudança adicional no botão/campo,
  já que `recalcCobertura()` simplesmente re-roda `analyzeWorkbookRows` inteiro com o novo
  limite. Só funciona para análises que já têm `rawData` salvo (ver correção acima).
- **Testado**: `node vmtest.js` com novas asserções de `iminenciaFalta` (contagem geral e por
  filial) nos 4 arquivos de referência, sem nenhuma regressão nas contagens já existentes; teste
  Playwright completo (upload real → KPI aparece com valor > 0 → clique no KPI abre a aba
  correta → linhas da aba têm cobertura abaixo do limite esperado → Plano de Ação menciona o
  novo item → coluna "Risco de Falta" aparece em Indicadores por Filial → alterar o limite pelo
  controle "ao vivo" e clicar "OK, recalcular" aumenta corretamente a contagem de Risco de
  Falta) — todos os passos passaram; regressão do bug do seletor de arquivo (02/09/26)
  reconfirmada intacta.

### KPIs compactos, correção real do bug "Pedidos Atrasados não acessível", destaque do valor em excesso e editor de colunas (05/09/26)
Quatro pedidos numa mesma rodada:

- **Cartões de indicador mais compactos**: pedido do usuário ("os botões estão muito grandes
  e espaçados, melhor fazer caber em um espaço horizontal maior para ocupar menos linhas de
  tela"). `.kpi-grid` passou de `minmax(150px, 1fr)`/gap 10px para `minmax(116px, 1fr)`/gap
  8px, e o cartão (`.kpi-card`) ficou com padding e fonte menores — cabem mais cartões por
  linha, menos altura total de página. O título de cada seção (`.kpi-section__title`) ganhou
  mais destaque (cor de acento, peso 700, linha embaixo) para separar visualmente os grupos.
- **Causa raiz real do bug "Pedidos Atrasados não está acessível clicando nele nem no botão
  dos destaques da visão geral"**: investigando com o Playwright contra uma análise real já
  salva no histórico da equipe (não só arquivos de referência locais), o clique lançava
  `TypeError: d.toLocaleDateString is not a function` dentro de `formatDate()`, ao renderizar
  a coluna "Previsão de chegada" (campo `dtprevent`) da aba Pedidos Atrasados — e o mesmo valia
  para "Última venda" (`ultimaVenda`) na aba Fora de Linha do Formato 1. Causa: esses campos são
  objetos `Date` de verdade só enquanto a análise está "fresca" (calculada na hora, na mesma aba
  que processou o arquivo); depois que a análise é publicada e recarregada
  (`JSON.stringify`/`JSON.parse` em `persist()`/carregamento do `STATE`), `Date` não sobrevive
  ao round-trip — vira uma string ISO comum, e `d.toLocaleDateString(...)` chamado direto nela
  quebra. Ou seja: **o clique não fazia nada porque o `render()` da aba de destino lançava uma
  exceção no meio e a tela ficava travada na tela anterior**, sem nenhum aviso — parecia que o
  clique estava simplesmente sem efeito. Isso acontecia com qualquer análise que não fosse a que
  acabou de ser processada naquela mesma aba do navegador (ou seja, na prática, quase sempre).
  - **Correção**: nova função `toDateSafe()` em `app.js`, que aceita tanto um `Date` de verdade
    quanto uma string (ou qualquer coisa que dê pra converter) sem nunca lançar — `formatDate()`
    passou a usá-la, e os dois `sortValue` que chamavam `.getTime()` direto no campo bruto
    (`ultimaVenda`, `dtprevent`) também.
  - **Correção complementar (mais defensiva)**: análises bem antigas no histórico foram
    calculadas com uma versão anterior do motor e por isso o objeto `result` salvo pode não ter
    um campo/lista que só passou a existir depois (ex.: `pedidosAtrasadosLista` antes de uma
    certa data, `iminenciaFalta` antes de 05/09). Nesses casos a aba correspondente nem chega a
    existir em `buildTabs()`. Cartões de KPI, linhas do Plano de Ação e células de "Indicadores
    por Filial" agora recebem o conjunto de abas realmente disponíveis nesta análise
    (`validTabKeys`) e só se comportam como clicáveis quando a aba de destino existe de verdade
    — senão ficam só de leitura, com um tooltip explicando que é uma análise antiga. De quebra,
    "Indicadores por Filial" agora mostra "—" (com tooltip) em vez de "NaN" quando falta algum
    indicador novo (ex.: Risco de Falta) numa análise antiga que nunca teve esse campo calculado.
  - **Testado**: reproduzido o bug de verdade contra uma análise real do histórico da equipe
    (arquivo "8268 paulo 31-08-26 nestle 99", sem `pedidosAtrasadosLista`) via Playwright, antes
    e depois da correção; confirmado que o clique agora navega corretamente numa análise que TEM
    os campos (`node vmtest.js` sem regressão + Playwright completo), e que uma análise antiga
    sem os campos mostra os números normalmente mas sem fingir ser clicável, sem "NaN" na tabela
    por filial, e sem quebrar o carregamento da página.
- **Destaque do valor financeiro do excesso já na Visão Geral**: pedido do usuário ("dar
  destaque para o valor financeiro de excesso já na visão geral"). Além do texto corrido que já
  existia mais abaixo na página (`value-callout`), o valor (`kpis.valorParadoTotal`) ganhou um
  cartão próprio ("Valor em excesso (parado/lento)") na seção "Visão geral" dos indicadores,
  clicável para a aba Parado/Lento, quando o arquivo tem dado de valor de estoque.
- **Editor de colunas** (mostrar/esconder, reordenar): pedido do usuário ("tornar possível a
  edição de colunas - mover, esconder, etc"), com uma ordem padrão específica: FILIAL, COD,
  DESCRIÇÃO, VENDAS, COBERTURA, QT DISPONÍVEL, ESTOQUE OUTRAS FILIAIS, SEÇÃO, SITUAÇÃO — e, na
  aba Transferência, a coluna "De → Para" antes de Vendas.
  - **Implementação**: preferência por navegador/pessoa (via `localStorage`, mesmo padrão já
    usado para tema e tela ativa — não faz parte do histórico compartilhado, cada pessoa pode
    preferir ver colunas diferentes). `DEFAULT_COLUMN_ORDER` é uma lista de prioridade de
    `sortKey`s (`["filial","codigo","descricao","origemQtd","vendas","cobertura","qtdisp",
    "estoqueOutras","secao","situacao"]`) aplicada a QUALQUER aba — sem precisar de regra
    especial por aba: `"origemQtd"` (a coluna "De → Para") só existe na aba Transferência, então
    colocá-la nessa posição da lista de prioridade automaticamente produz "De → Para antes de
    Vendas" ali, sem afetar a ordem das demais abas (que não têm essa coluna). Colunas da aba que
    não aparecem na lista de prioridade mantêm sua ordem relativa original, no final.
  - Botão "⚙ Colunas" ao lado de "Maximizar" abre um modal (`renderColumnsModal`) listando todas
    as colunas da aba atual (inclusive escondidas), com checkbox (mostrar/esconder, sempre
    exigindo pelo menos uma coluna visível) e setas ↑/↓ (reordenar); um botão "Restaurar padrão"
    limpa a personalização daquela aba. Preferência persiste por aba (`tab.key`) em
    `localStorage["wt-col-prefs-v1"]`.
  - **Testado**: `node vmtest.js` sem regressão; Playwright cobrindo a ordem padrão da aba
    Transferência (De → Para antes de Vendas), esconder uma coluna (some da tabela), reordenar
    (muda a ordem), e "Restaurar padrão" (volta ao estado original) — todos os passos passaram.

### Coluna QTVENDAMESFILTRO substituída por QTVENDAMES no arquivo do Winthor (05/09/26)
Aviso do usuário sobre uma mudança que vem do próprio Winthor, não um pedido de ajuste de
regra: "agora a planilha não virá mais com o campo qtvendamesfiltro, e sim com qtvendames
que corresponde a venda do acumulado do mês até a data que o arquivo foi gerado, portanto
será quase a fotografia exata do mês corrente."

- **O que muda de fato**: só o nome da coluna de onde o painel lê a venda acumulada do mês
  corrente (usada como estimativa de demanda quando os 3 meses anteriores somam zero — ver
  "Regra de negócio: estoque parado/lento distorcido por giro pouco confiável" acima). O
  significado do dado é o mesmo (venda acumulada do dia 01 até a data de geração do
  relatório); a diferença, pela descrição do usuário, é que `QTVENDAMES` é um número mais
  exato/confiável ("quase a fotografia exata do mês corrente") do que a estimativa que
  `QTVENDAMESFILTRO` representava antes. **A fórmula de projeção não mudou** — continua
  dividindo pelos dias decorridos do período e projetando para 30 dias
  (`vendaEstimadaMesAtual = (QTVENDAMES / diasDecorridos) * 30`), já que o próprio usuário
  descreve o novo campo como carregando o mesmo tipo de informação, só que mais preciso.
- **Implementação** (`analyzeFormat2` em `app.js`): a leitura da coluna passou a preferir
  `QTVENDAMES` quando presente, com `QTVENDAMESFILTRO` mantido como fallback defensivo — se
  algum arquivo mais antigo ainda chegar no formato anterior (por exemplo um reprocessamento
  ou um comprador que ainda não migrou), o painel continua funcionando exatamente como antes,
  sem quebrar nem exigir reenvio. Quando os dois campos existirem juntos no mesmo arquivo (não
  esperado na prática, mas coberto por segurança), `QTVENDAMES` tem prioridade. Nenhuma outra
  parte do motor mudou — todos os usos posteriores desse valor (estimativa de venda do mês
  atual, cobertura recalculada, classificação Cadastro Novo/Parado/Lento/Risco de Falta,
  coluna "Venda estimada (mês atual)" na aba Cadastro Novo) continuam iguais, já que dependem
  só do valor calculado (`vendaEstimadaMesAtual`), não do nome da coluna de origem.
- **Escopo**: nenhum dos 6 arquivos de referência usados no `vmtest.js` já traz `QTVENDAMES`
  (todos ainda estão no formato antigo, com `QTVENDAMESFILTRO`) — checado antes de implementar
  para confirmar que a mudança não quebraria a suíte de regressão existente. `node vmtest.js`
  confirma que todas as contagens permanecem idênticas (o fallback garante que os arquivos
  atuais continuam sendo lidos exatamente como antes). Testado também com um caso sintético
  isolado (linha com `QTVENDAMES` preenchido e `QTVENDAMES1/2/3` zerados) confirmando que a
  estimativa de venda do mês atual é calculada corretamente a partir do novo campo, que o
  fallback para `QTVENDAMESFILTRO` continua funcionando quando só ele está presente, e que
  `QTVENDAMES` tem prioridade sobre `QTVENDAMESFILTRO` quando os dois aparecem juntos.

## Nota sobre dados de valor de estoque
Pedido original do usuário (31/08/26): os relatórios deveriam trazer valor de estoque para
mostrar o quanto o estoque parado/excesso onera financeiramente e ajudar a priorizar a ação
recomendada (reduzir compra vs. aumentar venda) em vez de só sinalizar "parado". O motor
(`detectValueColumn` em `app.js`) detecta automaticamente qualquer coluna cujo nome contenha
VALOR, CUSTO ou PRECO (dando preferência a uma variante "UNIT/UNITARIO" se houver mais de uma
candidata) — isso não mudou.

**O que mudou em 31/08/26, com o primeiro arquivo real trazendo essa coluna** (`8268 rodrigo
310826 ype 99 corrigido valor est.xlsx`, coluna `VL_CUSTOFIN`): o usuário corrigiu a
interpretação — **o valor da coluna já é o valor TOTAL do item naquela filial**, não um valor
por unidade/caixa que precisasse ser multiplicado pela quantidade. A primeira versão do motor
assumia "valor unitário" e multiplicava por `QTDISP`/`QTEST`, o que inflava o valor calculado
em várias vezes (ex.: `VL_CUSTOFIN = 175.47` com `QTDISP = 10` virava `R$ 1.754,70` em vez do
correto `R$ 175,47`). Corrigido: `valorEstoque` agora usa o valor da coluna diretamente, sem
multiplicação, tanto em `analyzeFormat1` quanto em `analyzeFormat2`. Validado no arquivo Ype
corrigido (multi-filial, 684 linhas): `hasValueData=true`, valor total em itens parados/lentos
≈ R$ 872.274,67, conferido célula a célula contra o `VL_CUSTOFIN` bruto do arquivo antes de
publicar.

## Nota sobre padrão de entrega por fornecedor (futuro)
Aviso do usuário (31/08/26): muitos fornecedores entregam loja a loja (cada filial recebe
diretamente), outros centralizam a entrega na filial 1 ou na 3, e em raros casos centralizam
na filial 6. O usuário vai subir futuramente um **arquivo separado** com essa informação de
como cada fornecedor entrega. Ainda não foi enviado nenhum arquivo assim — quando vier,
avaliar como essa informação deve influenciar a sugestão de compra/transferência (por
exemplo, um fornecedor que centraliza na 3 pode tornar a rota de abastecimento "1 pede da 3"
ainda mais relevante para os produtos dele; um que entrega loja a loja não depende do
depósito para chegar até a filial). Não implementar nada a respeito até esse arquivo chegar
e o formato dele ser entendido.

## Formato 1 — "Sugestão de Compra" (ex.: `filial_4_paulo_280826.xlsx`)
53 colunas (CODPROD, DESCRICAO, CODCOMPRADOR, CODFORNEC, QTEST, GIROMEDIO, REQUISITAR,
QTDEREQUISITAR, QTBLOQUEADA, QTRESERV, QTDISP, QTVENDMES1/2/3, QTVENDAMESES,
QTESTF1/F3/F5/F6/F7 (estoque nas outras filiais — a coluna da própria filial do relatório
está estruturalmente ausente, o que também serve para inferir qual é essa filial), ULTIMA_
VENDA, NUMPED (pedido já em aberto), FORNECEDOR, DTPREVENT_F4/F5, QTDIASCX, etc.).
Normalmente já vem pré-filtrado pelo Winthor para REQUISITAR = "S" — todos os itens já são
candidatos a compra; a análise serve para priorizar, não para descobrir quem entra na lista.
Sem coluna FL na versão vista. Não tem nenhuma coluna de data/período do relatório — o
painel usa o dia do upload como data do relatório para este formato.

**As 3 análises padrão:**
1. **Ruptura de estoque** — `QTDISP == 0 AND QTVENDAMESES > 0` → CRÍTICO; `QTEST == 0 AND
   QTVENDAMESES > 0` → ATENÇÃO (raro isolado, pois QTDISP ≤ QTEST).
2. **Sugestão de requisição/compra priorizada** — coluna PRIORIDADE: 1-URGENTE (ruptura
   crítica) > 2-ALTA (QTDIASCX < 0, ou ruptura em atenção) > 3-REVISAR (estoque parado) >
   4-NORMAL.
3. **Estoque parado/excesso** — dias desde ULTIMA_VENDA: > 30 dias = "PARADO"; 15–30 dias =
   "LENTO". Não se aplica se a filial do relatório for um depósito (3 ou 5) — ver regra de
   filiais acima.
Extra: **avaliar transferência entre filiais** — se `QTESTF1+F3+F5+F6+F7 >= QTDEREQUISITAR`,
marcar para avaliação de transferência interna em vez de compra do fornecedor.

**Saída (abas):** Resumo (KPIs via COUNTIF/SUMIFS) → Ruptura → Sugestão de Compra (completa,
priorizada) → Estoque Parado → Transferência → Dados (base + colunas calculadas como
fórmulas do Excel). Se houver itens FL num arquivo futuro deste formato, replicar o padrão
do Formato 2: excluir das 4 abas de ação e criar uma aba "Itens Fora de Linha" informativa.

Exemplo processado: `filial_4_paulo_280826.xlsx` (579 itens, comprador 2654, Mercearia
Alimentos, filial 4, 28/08/26) → 225 em ruptura crítica, 72 com estoque parado/lento, 466
com possibilidade de transferência, 61 já com pedido em aberto.

## Formato 2 — "Posição de Estoque/Giro por Seção" (ex.: `8268_daniel_310826.xlsx`,
`8268_paulo_310826.xlsx`)
29-30 colunas (FILIAL, PRODUTO, [FORA_DE_LINHA — presente só na versão do Paulo],
PERIODO_FILTRO, COD_COMPRADOR, COMPRADOR, DEPARTAMENTO, SECAO, CATEGORIA, SUBCATEGORIA,
QTESTGER, QTBLOQUEADA, QTRESERV, QTPEDIDA, DTPREVENT (data prevista de chegada do pedido em
aberto), QTDISP, GIROMEDIO (giro diário, float), QTESTDIAS (cobertura em dias =
QTDISP/GIROMEDIO — ver ressalva na regra de negócio de estoque parado/lento acima quando o
item não tem histórico), QTVENDAMES — chamada QTVENDAMESFILTRO nos arquivos anteriores a
05/09/26, ainda aceita como fallback (vendas do mês/período atual, acumulada até a data de
geração do relatório — usada para estimar demanda quando os 3 meses anteriores somam zero,
ver regra acima e a nota sobre a troca de nome mais abaixo), QTVENDAMES1/2/3,
QTESTF1 (duplica QTDISP — é a própria filial, ignorar para "outras filiais"),
QTESTF3/F4/F5/F6/F7). Ao contrário do Formato 1, **não vem filtrado** — é o mix completo de
uma seção/departamento para um comprador, incluindo itens que nunca giram nesta filial ou
que já estão fora de linha. Pode vir **single-filial** (uma única filial em toda a planilha)
ou **multi-filial** (cada produto repetido uma vez por filial — ex.: 202 produtos × 6
filiais = 1212 linhas). **Não tem coluna de fornecedor** — ao contrário do Formato 1. A data
do relatório é extraída de `PERIODO_FILTRO` (ver seção do painel web acima).

O campo PRODUTO tradicionalmente chega como texto único "CÓDIGO - DESCRIÇÃO" (ex.: "249912 -
LEITE COND MOCA 395G SEMI DESN TP"). O usuário avisou (31/08/26) que os próximos relatórios
trariam código e descrição em colunas separadas, e o primeiro arquivo real nesse formato
chegou ainda em 31/08/26 (`8268 rodrigo 310826 ype 99 corrigido valor est.xlsx`): tem coluna
`CODIGO` própria, mas **sem** uma coluna `DESCRICAO`/`DESCR_PRODUTO`/`NOME_PRODUTO` dedicada —
nesse caso o campo `PRODUTO` já vem só com a descrição pura (ex.: "DET YPE 7L NEUTRO", sem
prefixo de código). A lógica em `splitProdutoCodigo` cobre os três casos, nesta ordem: (1) se
existir coluna de código dedicada (CODIGO/COD_PRODUTO/CODPRODUTO), usa ela para o código, e
usa a coluna de descrição dedicada se houver, senão usa o campo PRODUTO inteiro como
descrição (caso do arquivo Ype); (2) sem coluna de código dedicada, tenta separar o campo
PRODUTO combinado com uma expressão regular que exige que o INÍCIO seja numérico seguido de
" - " (confirmado pelo usuário em 31/08/26: "os números antes do - são o código interno") —
evita cortar errado caso a descrição em si tenha um hífen sem ser precedida de número; (3) se
nada bater, todo o campo vira descrição e o código fica vazio. As tabelas do painel (Ruptura,
Transferência, Parado/Lento, Revisar Status, Pedidos Atrasados, Fora de Linha) mostram
"Código" e "Descrição" como colunas separadas em vez de "Produto" único.

**Análises aplicadas (todas restritas a itens ATIVOS quando a coluna FORA_DE_LINHA existe):**
1. **Ruptura crítica** — `QTDISP == 0 AND (QTVENDAMES1+2+3) > 0`.
2. **Divergência de estoque** — `QTDISP < 0` (erro de contagem/saldo) → conferência física.
3. **Pedido atrasado** — `QTPEDIDA > 0 AND DTPREVENT preenchida AND DTPREVENT < data do
   relatório` → cobrar fornecedor/logística. Ajuda a explicar rupturas (pedido não chegou).
   Tem aba própria no painel ("Pedidos Atrasados").
4. **Transferência entre filiais** — `QTDISP <= 0 AND (estoque nas outras filiais) > 0` →
   avaliar transferência interna antes de comprar do fornecedor. Single-filial: soma
   F3+F4+F5+F6+F7 (exclui F1, que duplica QTDISP), origem sugerida por proximidade (mesma
   cidade > matriz > outra), sem cruzamento entre filiais (não há como, é 1 arquivo = 1
   filial). **Multi-filial, origem sugerida refinada em 31/08/26 pela hierarquia real de
   abastecimento** (pedido explícito do usuário), em ordem de prioridade:
   1) **1 pede da 3** e **4 pede da 5** — pares diretos de abastecimento: se a filial que
      precisa é a 1, a origem é a 3 (se tiver saldo); se é a 4, a origem é a 5 (se tiver
      saldo).
   2) Para quem precisa é **5, 6 ou 7**: a origem é **1 ou 3, o que tiver mais estoque
      disponível** — **exceto** quando a origem preferida for a 1 e outra filial tiver mais
      dias de cobertura (QTESTDIAS) que a 1 nesse produto; nesse caso a origem vira essa
      outra filial com mais cobertura, para não esvaziar a matriz em favor de uma filial que
      já tem folga. (Ex. validado: produto com filial 1 tendo 205 un./32 dias de cobertura e
      filial 7 tendo 120 un./40 dias — a sugestão vai para a 7, não para a 1.)
   3) Qualquer outro caso (inclusive quando a 1/3/5 preferida não tem saldo daquele produto)
      cai no critério anterior: mesma cidade do destino > matriz (filial 1) > qualquer outra
      filial, desempatando por maior saldo disponível.
   O motor usa o estoque e a cobertura (QTESTDIAS) **da própria linha de cada filial**
   (não a coluna QTESTFx-snapshot) para essa comparação, via um índice produto→filial
   construído a partir de todas as linhas do arquivo. Exibida desde 01/09/26 no fluxo visual
   "De → Para" (ver seção do painel web acima).
5. **Parado/Lento** — `QTDISP > 0 AND vendas_3m == 0` (parado) ou `QTDISP > 0 AND
   QTESTDIAS > 60 AND vendas_3m > 0` (giro lento). **Não se aplica às filiais 3 e 5**
   (depósitos, não pontos de venda). **Desde 01/09/26**, a classificação não confia cegamente
   nos dados prontos do arquivo: quando `vendas_3m == 0`, o motor primeiro tenta uma
   estimativa a partir da venda do mês atual; quando há venda fechada real mas o `GIROMEDIO`
   do arquivo diverge muito dela, o motor recalcula a cobertura a partir dessa venda fechada
   — ver "Regra de negócio: estoque parado/lento distorcido por giro pouco confiável" acima.
6. **Revisar Status / Sem movimento** — `QTDISP <= 0 AND vendas_3m == 0` entre os ATIVOS:
   candidato a virar FL no cadastro (quando a coluna FORA_DE_LINHA não existe no arquivo,
   vira a aba genérica "Sem Movimento" de higiene de cadastro, como no caso do Daniel; em
   arquivo multi-filial, o rótulo é "sem movimento nesta filial", já que o produto pode
   estar girando em outra filial). **Também não se aplica às filiais 3 e 5.** Em resumo:
   Revisar Status é a lista de "sem estoque disponível e sem nenhuma venda no período" —
   não é urgente como ruptura (não há demanda no momento), mas sinaliza item parado no
   cadastro que vale avaliar se ainda faz sentido manter ativo (ou já devia virar FL). Ao
   contrário do Parado/Lento (item 5), esta lista **ainda não** usa a estimativa do mês
   atual — fica para avaliar se faz sentido estender a mesma correção aqui.
7. **Plano de Ação** (aba nova) — tabela com Prioridade / Achado / Ação Recomendada / Itens
   Envolvidos (fórmula ligada à Dados/Resumo) / Responsável / Prazo Sugerido, priorizada
   1-URGENTE → 5-NORMAL (+ linha "N/A" para os FL, só para mostrar quantos foram excluídos),
   seguida de "Próximos Passos (cadência)" com frequência sugerida de revisão.

**Saída (abas) quando existe coluna FL (ex.: Paulo):** Resumo → Plano de Ação → Ruptura e
Divergências → Transferência → Estoque Parado e Lento → Revisar Status → Itens Fora de
Linha (informativo) → Dados.
**Saída (abas) quando NÃO existe coluna FL (ex.: Daniel):** Resumo → Plano de Ação →
Ruptura e Divergências → Estoque Parado e Lento → Sem Movimento → Dados (sem aba de
Transferência dedicada nesse exemplo específico porque nenhum item de ruptura tinha estoque
em outra filial — mas a lógica deve ser testada e incluída sempre que houver casos).
**Saída (abas) multi-filial (ex.: Paulo/Nestlé):** Resumo (com tabela extra "Indicadores por
Filial", COUNTIFS por filial × flag, marcando as colunas Parado/Lento como não aplicável nas
linhas das filiais 3 e 5) → Plano de Ação → Ruptura e Divergências → Transferência (com
filial de origem sugerida e distância) → Estoque Parado e Lento → Sem Movimento por Filial →
Pedidos Atrasados → Dados.

Exemplos processados:
- `8268_daniel_310826.xlsx` (543 SKUs, seção Bebidas, comprador Daniel 2887, filial 1,
  período 01–31/08/2026, sem coluna FL) → 6 ruptura crítica, 4 divergência de estoque
  negativo, 16 pedidos atrasados, 28 parado/lento, 374 sem movimento.
- `8268_paulo_310826.xlsx` (709 SKUs, seções Bomboniere/Biscoitos/Leites e Matinais/etc.,
  comprador Paulo 2654, filial 1, período 01–31/08/2026, **com coluna FORA_DE_LINHA**) →
  507 FL (excluídos) / 202 ATIVOS, dos quais: 7 ruptura crítica, 7 divergência de estoque
  negativo, 21 pedidos atrasados, 13 com possibilidade de transferência, 8 parados + 35
  lentos, 16 "ativo sem movimento" (candidatos a virar FL).
- `8268_paulo_310826_nestle_99.xlsx` (1212 linhas = 202 produtos × 6 filiais [1,3,4,5,6,7],
  comprador Paulo 2654, todos ATIVO, 31/08/2026) → 93 ruptura crítica, 24 divergência, 98
  pedidos atrasados, 429 com possibilidade de transferência. **Números originais antes da
  regra de depósito** (contavam parado/lento nas filiais 3 e 5 como se fossem pontos de
  venda): 47 parados + 151 lentos, detalhe por filial (ruptura/divergência/parado/lento/
  transferência): filial 1 = 7/7/8/35/13; filial 3 = 4/0/0/0/185; filial 4 = 12/5/13/32/19;
  filial 5 = 31/0/9/9/165; filial 6 = 18/6/6/35/22; filial 7 = 21/6/11/40/25. **Após aplicar
  a regra de depósito** (31/08/26): parado cai para 38 e lento para 142 (a diferença de 9+9
  vem inteira da filial 5, que zera parado/lento; filial 3 já estava zerada nesses dois
  indicadores antes mesmo da regra). Os demais indicadores (ruptura, divergência,
  transferência) não mudam.
- `8268 rodrigo 310826 ype 99 corrigido valor est.xlsx` (684 linhas = 114 produtos × 6
  filiais [1,3,4,5,6,7], comprador Rodrigo, seção Artigos p/ Limpeza Geral, 31/08/2026,
  **primeiro arquivo com coluna de valor (`VL_CUSTOFIN`) e com coluna `CODIGO` própria**) →
  13 ruptura crítica, 0 divergência, 28 pedidos atrasados, 199 com possibilidade de
  transferência, 24 parados + 138 lentos, 53 revisar status, valor total em itens
  parados/lentos ≈ R$ 872.274,67 (após a correção de interpretação — ver nota de valor de
  estoque acima). Usado para validar a correção do cálculo de valor e o novo caminho de
  código/descrição via coluna `CODIGO` dedicada.

## Cuidados técnicos válidos para os dois formatos
- **`ws.max_row` costuma incluir uma linha em branco extra** no fim da planilha Winthor.
  Sempre calcular o total de linhas a partir de `len(pd.read_excel(...))`, nunca do
  `max_row` do openpyxl, para não contaminar contagens (COUNTIF) e prioridades com uma
  linha fantasma (já causou bug real na primeira versão da análise do Formato 1).
- **Coluna FILIAL pode vir como texto** em vez de número no arquivo de origem (visto no
  arquivo multi-filial da Nestlé), mesmo quando o pandas mostra tipo inteiro ao ler (o
  pandas coage silenciosamente). Isso quebra comparação numérica (`IF(FILIAL=1,...)`) e
  `COUNTIFS` contra critério numérico sem gerar erro nenhum — resultado fica errado/zerado
  silenciosamente. Sempre checar o tipo real célula a célula via openpyxl (não via pandas)
  antes de montar fórmulas que comparam FILIAL, e fazer cast explícito para `int` ao copiar
  os valores da origem para a aba Dados.
- Estilo visual: fonte Arial, cabeçalhos com fundo escuro, linhas zebradas, cores por
  severidade (vermelho=crítico/urgente, âmbar=atenção/alta, laranja=parado/lento,
  azul=transferência, cinza=revisar status/cadastro, roxo=fora de linha (informativo),
  verde=normal/ok). O painel web usa a mesma lógica de cores por severidade (badges), além
  da paleta separada de cores por filial (ver seção "Cores por filial" acima).
- KPIs da aba Resumo sempre via fórmula (COUNTIF/SUMIFS sobre a aba Dados), nunca
  hardcoded, para recalcular se o usuário editar a base.
- Colunas auxiliares (flags, prioridade) são escritas como fórmulas do Excel na aba Dados,
  sempre com a condição `FORA_DE_LINHA="ATIVO"` embutida quando essa coluna existir (e, a
  partir de 31/08/26, também a condição de não ser depósito para parado/lento/revisar); as
  abas "curadas" (Ruptura, Transferência, Estoque Parado etc.) são filtradas/ordenadas em
  Python (pandas replica a mesma lógica das fórmulas, com o mesmo filtro ATIVO) e gravadas
  como valores — dinâmico não é viável ali sem FILTER/SORT do Excel, que a stack de
  recálculo (LibreOffice) não suporta.
- Sempre rodar `recalc.py` (skill xlsx) antes de entregar e checar `total_errors: 0`; depois
  conferir os totais da aba Resumo batem com uma contagem independente em pandas (inclusive
  que ATIVOS + FL = total de linhas, quando aplicável). Um `total_errors: 0` só prova que as
  fórmulas calculam, não que estão certas — sempre fazer a checagem cruzada independente.
- A mesma lógica de flags/prioridade/KPIs foi portada para JS puro (`analyzeFormat1`/
  `analyzeFormat2` no painel web, incluindo `FILIAL_META`/`isDeposito`/`originTier` para a
  regra de depósito e geografia, e a estimativa de venda do mês atual para itens sem
  histórico) e validada linha a linha contra os exemplos acima antes de publicar a página —
  qualquer ajuste na regra de negócio deve ser replicado nos dois lugares (build Python das
  planilhas E motor JS do painel) para não desalinhar.

### Indicadores por Departamento/Categoria (toggle) + alerta cruzado com a Ruptura Zero (06/09/26)
Pedido do usuário: "nos indicadores, criar uma visão adicional na mesma tabela para
indicadores por departamento para poder alterar entre filiais e categorias dos produtos" e
"caso o item na planilha carregado esteja entre os itens da ruptura zero, fazer a analise
nessa visão e gerar a notificação caso verificado ruptura ou tendência de ruptura".

- **Toggle Por Filial / Por Departamento / Por Categoria** (perguntado ao usuário antes de
  implementar): confirmado que a visão alternativa deveria cobrir os dois campos
  (Departamento e Categoria, não só um), com **dois toggles** (três opções no total, incluindo
  a visão por filial já existente), e como **tabela simples** (uma linha por grupo, mesmas 8
  colunas de indicador — Ruptura, Divergência, Risco de Falta, Parado, Lento, Estoque Virtual,
  Cadastro Novo, Transferência — sem cruzar com filial).
- **Implementação** (`app.js`): nova função genérica `buildGroupIndicadores(ativos, keyFn,
  emptyLabel)`, que agrupa os itens ativos por uma função de chave arbitrária (departamento ou
  categoria) nas mesmas contagens já usadas na agregação por filial; itens sem o campo caem
  num grupo dedicado ("(sem departamento)"/"(sem categoria)") em vez de desaparecer ou se
  misturar com um grupo de string vazia. `analyzeFormat2` passou a capturar
  `item.departamento` (coluna `DEPARTAMENTO` do Winthor, já lida mas não usada até então) e a
  calcular `porDepartamento`/`porCategoria` com essa função, ao lado do `perFilial` já
  existente. A tabela (antes `renderPerFilial`, renomeada/generalizada para
  `renderIndicadores`) escolhe dinamicamente quais visões oferecer (só inclui "filial" se a
  análise for multi-filial; só inclui departamento/categoria se a coluna existir no arquivo —
  arquivos Formato 1 não têm `DEPARTAMENTO`/`CATEGORIA` e continuam mostrando só a visão por
  filial) e cai para a primeira visão disponível se a preferência salva não existir para
  aquele resultado. Toggle implementado com classe CSS própria (`view-toggle-btn`, distinta de
  `.tab-btn`) para não colidir com o listener genérico de abas — bug pego e corrigido antes do
  teste (o listener de `.tab-btn` setaria `ACTIVE_TAB = undefined` ao clicar no toggle, já que
  os botões não têm `data-tab`).
- **Clique-through nas novas visões**: clicar num número da tabela por departamento/categoria
  filtra a aba correspondente por aquele grupo, do mesmo jeito que já funcionava por filial.
  Para não depender de Departamento/Categoria estarem entre as colunas visíveis de cada aba
  (o que infiaria o editor de colunas, ou quebraria se o usuário escondesse a coluna), o filtro
  de `renderTable` ganhou um fallback por igualdade exata direto contra `r.categoria`/
  `r.departamento`, independente da visibilidade de colunas.
- **Verificado**: soma das contagens de Ruptura em todos os grupos de `porDepartamento` (59) e
  de `porCategoria` (59) bate exatamente com o KPI já validado `rupturaCritica` (59) no arquivo
  de referência multi-filial da Nestlé — sem duplicar, perder ou classificar errado nenhum
  item. Teste Playwright confirmou o toggle trocando de visão corretamente e o clique-through
  funcionando mesmo em abas sem a coluna Categoria/Departamento visível.

**Alerta cruzado com a Ruptura Zero**: ao processar uma planilha no Painel de Análise
(Formato 2), o sistema agora verifica se algum item em ruptura crítica ou em risco de falta
(tendência de ruptura, indicador de 05/09/26) está entre os itens cadastrados na ferramenta
Ruptura Zero (por código do produto).

- **Implementação**: nova função `checkRupturaZeroAlerts(result)`, que lê o cadastro ativo da
  Ruptura Zero, monta o conjunto de códigos monitorados e cruza contra `result.ruptura`
  (restrito a `flagRuptura === "CRITICO"`) e `result.iminenciaFalta`. Roda em dois pontos: (1)
  `processFile()`, logo após montar a nova entrada do histórico, mostrando um toast imediato se
  houver correspondência; (2) `recalcCobertura()`, já que mudar o limite de cobertura "ao vivo"
  pode mudar quais itens entram em risco de falta — reprocessa o cruzamento com o resultado
  recalculado, limpando o alerta (`null`) se ele deixar de se aplicar.
- **Onde fica salvo**: o resultado (`{ itens: [...] }`, cada item com código, descrição,
  filial, situação e tipo RUPTURA/RISCO_FALTA) é gravado em `cadastro.ultimoAlerta`, no próprio
  cadastro da Ruptura Zero dentro do `STATE` compartilhado — não em memória nem preso à sessão
  de quem subiu o arquivo. Isso garante que (a) sobrevive à publicação/recarregamento e fica
  visível para qualquer pessoa da equipe que abrir a tela de Ruptura Zero depois, e (b) cada
  novo cruzamento substitui o alerta anterior, sem acumular histórico de alertas antigos. A
  tela de Ruptura Zero ganhou um painel de alerta persistente (`renderRupturaZeroAlertPanel`)
  antes do painel de upload, mostrando o `ultimoAlerta` do cadastro ativo quando existir.
- **Testado**: cadastro sintético de Ruptura Zero com 3 códigos (dois presentes em ruptura/
  risco de falta no arquivo de referência da Nestlé, um que nunca deveria casar); confirmado
  via teste isolado do motor (Node/vm) que o cruzamento identifica exatamente 5 ocorrências de
  RUPTURA e 2 de RISCO_FALTA, excluindo corretamente o código que não deveria casar — e
  reconfirmado ponta a ponta via Playwright (upload do cadastro → upload da análise → toast com
  as contagens → painel de alerta permanece com as mesmas contagens após navegar para outra
  tela e voltar).

### Sugestão de Compra por Fornecedor — relatório 227 (08/09/26)
Pedido do usuário: analisar um novo relatório anexado (arquivo `227_sepac_080926.xlsx`),
diferente das planilhas de análise já usadas — trazia "quase os mesmos dados... porém com mais
informações como última entrada, preço das 2 últimas entradas, avarias, preço de venda
unitário e caixa, promoção unitária e caixa, período da oferta, entre outras", e usá-lo "para
que possamos trabalhar junto com a planilha" — evoluindo depois para: "dar condições do
comprador entender a necessidade de compra (ou não) dos itens do fornecedor que irá atender.
Com a sugestão, demonstrar a quantidade que poderá causar excesso ou ruptura e uma média
equilibrada para que os itens possam ter um estoque seguro e saudável."

**Formato do relatório 227**: diferente das duas planilhas já usadas (Formato 1/2, com
cabeçalho de coluna tradicional), o 227 é um "print" formatado do Winthor — sem linha de
cabeçalho, com rótulos de texto embutidos no meio dos números (`ICMS/IVA/IPI:`, `VENDA MES`,
`ESTOQUE:`, `RES:`, `De` ... `à`). Cada produto ocupa um bloco de linhas consecutivas, uma por
filial em que é vendido (no arquivo de exemplo: filiais 1, 4, 5, 6, 7 — sem a 3, que é
depósito nos outros relatórios); só a primeira linha do bloco traz código/descrição. Mapeamento
de colunas fechado em conversa com o usuário (posições fixas, arquivo sem cabeçalho — ver
`COL227` em `app.js`):
- Código (só 1ª linha do bloco), descrição (idem), filial.
- Duas últimas entradas: a primeira data do bloco é sempre a mais recente (confirmado
  comparando as datas do arquivo de exemplo) — vira "última entrada"; a segunda vira
  "penúltima". Preço de cada uma pareado pela mesma posição.
- Avarias — confirmado pelo usuário como o valor decimal que aparece duas vezes na mesma
  linha (nas duas metades do bloco "ESTOQUE"), mesmo valor nas duas.
- Bloco "VENDA MES": os 4 primeiros números alternam mês atual / semana atual / mês
  anterior-1 / semana anterior-1 (confirmado pelo usuário) — usados nas médias semanal/mensal
  da fórmula de sugestão abaixo; os números seguintes do mesmo bloco (mais meses anteriores)
  não foram decifrados, não são usados por ora.
- Preço "De X Y data à Z W data": o `X`/`Y` antes da data são o preço de tabela (varejo/
  atacado, matriz "1-1 varejo unitário / 1-2 atacado-atacarejo unitário / 2-1 fardo varejo /
  2-2 fardo atacado", conforme o comprador lê visualmente o relatório — mapeamento de qual
  célula é qual ainda é "melhor esforço", não fechado 100% com certeza, mas **não afeta a
  sugestão de compra**, só aparece como referência); o `Z` depois do "à" é o preço da última
  oferta vigente, e as duas datas (antes do "De"/depois do "à") são o período de vigência
  dessa oferta — confirmado pelo usuário com o exemplo real (`14,98` vigente de 28/04/2026 a
  04/05/2026, batendo exatamente com o cálculo).
- Tributação/paletização (`12/0`, `L10 X C3 = 30`) — capturados no bloco de embalagem do
  arquivo mas não usados em nenhum cálculo (ICMS de entrada/ST e configuração de pallet, sem
  relação com estoque/compra).

**Mesmo botão de upload do Painel de Análise (08/09/26, pedido do usuário)**: o relatório 227
não tem tela/dropzone própria — é enviado pelo mesmo `dropzone`/`fileInput` já usado pelas
planilhas Formato 1/2. Em `processFile()`, quando `analyzeWorkbookRows` não reconhece o arquivo
como Formato 1/2, antes de mostrar o erro o código tenta `is227Report()` (assinatura: o rótulo
fixo `"ICMS/IVA/IPI:"` repetido em pelo menos 2 linhas na mesma coluna) — se bater, chama
`parseRelatorio227Rows()` e mostra um formulário rápido (fornecedor pré-preenchido a partir do
nome do arquivo, periodicidade obrigatória, tempo de entrega opcional) antes de salvar o
cadastro, sem nunca pedir pra escolher o tipo de arquivo manualmente.

**Cadastro por fornecedor**: `STATE.relatorio227.history` (mesmo padrão do cadastro da
Ruptura Zero) — cada envio de um 227 vira uma entrada nova e vira a ativa; cada entrada guarda
`fornecedor`, `periodicidadeDias` (obrigatório, dias entre visitas do fornecedor) e
`tempoEntregaDias` (opcional, lead time — campo já criado mesmo sem fonte de dado real ainda,
"penso em implementar em algum campo isso" nas palavras do usuário) editáveis "ao vivo" depois
de salvo, sem precisar reenviar o arquivo (mesmo espírito do controle de cobertura "ao vivo"
já existente no Painel).

**Fórmula da sugestão de compra** (fechada em conversa com o usuário, várias rodadas de
ajuste): para cada item do 227 ativo, cruza com o estoque disponível (`QTDISP`) da análise
Formato 2 mais recente do Painel, casando por código do produto + filial (lê direto de
`entry.rawData.rows/headers`, sem depender de nenhuma mudança no motor `analyzeFormat2`).
- **Base de venda diária**: semanal (média de venda-semana-atual + venda-semana-anterior-1,
  dividida por 7) quando a periodicidade do fornecedor é de até 15 dias — fornecedor de giro
  alto ou produto perecível/shelf-life curto que visita mais de 1x por mês, conforme o usuário
  explicou ("às vezes não é apenas a venda mensal que conta, e sim semanal... por serem
  produtos de alto giro ou perecíveis"); mensal (média mês-atual + mês-anterior-1, /30) quando
  a periodicidade é maior.
- **Horizonte de cobertura** = periodicidade + tempo de entrega.
- **Estoque líquido** = estoque disponível do Painel − avarias do 227.
- **Mínimo (gatilho)** = venda diária × horizonte.
- **Sugestão equilibrada** = mínimo × 1,2 (20% de folga) − estoque líquido.
- **Aviso de excesso** (visual, nunca bloqueia a sugestão): dispara quando estoque líquido +
  sugestão ultrapassa o **menor** valor entre (mínimo × 1,5) e (venda diária × 60 dias) — dois
  critérios simultâneos, não um substituindo o outro (pedido do usuário: "balancear entre o
  estoque de 60 dias e o percentual sobre o disponível atual também pro excesso"). O teto de 60
  dias veio de uma regra de negócio explícita ("o que devemos evitar é um estoque acima de 60
  dias, com exceção de negociações agressivas, onde há um aproveitamento de preço e algumas
  vezes combinadas com prazo maior") — por isso o aviso nunca impede a sugestão, fica a
  critério do comprador aceitar ultrapassar o teto numa negociação vantajosa, sem exigir marcar
  nada previamente no cadastro.
- Preços/oferta do 227 aparecem na tabela de sugestão só como referência ao lado de cada item —
  não entram em nenhum cálculo de quantidade.
- Item do 227 sem correspondência na análise mais recente do Painel (código não encontrado)
  aparece na tabela com "não encontrado" no lugar do estoque, sem sugestão calculada, em vez de
  desaparecer silenciosamente.

**Testado**: teste isolado do motor (Node/vm) com o arquivo real do 227 (`is227Report`,
`parseRelatorio227Rows` — 20 itens, 4 produtos × 5 filiais, valores de avaria/venda mês-semana/
oferta conferidos contra os valores confirmados pelo usuário) e um cadastro sintético
correspondente na análise Formato 2 (`buildSugestaoCompra`/`calcSugestaoItem`) validando os
três cenários: item com estoque baixo (sugestão > 0, sem aviso de excesso), item com estoque
muito alto (aviso de excesso, sugestão = 0) e item sem correspondência no Painel (estoque/
sugestão aparecem como não disponível, sem quebrar o cálculo dos demais). Depois repetido ponta
a ponta via Playwright, usando exatamente o fluxo real da equipe: upload de uma planilha
Formato 2 sintética pelo botão único → upload do relatório 227 real pelo mesmo botão →
reconhecimento automático → formulário de periodicidade/tempo de entrega → salvar cadastro →
navegar para a tela "Sugestão de Compra por Fornecedor" → tabela final conferida linha a linha
contra os mesmos três cenários. Todos os passos e contagens bateram; nenhuma regressão nos
testes já existentes (`vmtest.js`, Formato 1/2) depois da mudança.

## Arquivos de referência já enviados (sem análise própria, só formato)
- `filial_4_daniel_240826.xlsx` (239 itens, Formato 1, 24/08/26) — confirmou o formato de
  entrada do Formato 1, não continha análise pronta.

## Uso pela equipe (registro)
- 31/08/26, ~17h: primeiro envio real no painel — arquivo Nestlé multi-filial do Paulo
  (mesmo já usado como exemplo acima).
- 31/08/26, ~18h: segundo envio — `8268 rodrigo 31-08-26 ype 99` (comprador/arquivo Ype,
  enviado por Rodrigo). Conteúdo ainda não conferido linha a linha nesta sessão; registrar
  aqui só para não perder o histórico ao reconstruir a página.
- 31/08/26, ~19h-20h: mais três envios reais pela equipe, vistos ao ler o estado
  compartilhado antes de cada republicação (conteúdo não conferido linha a linha nesta
  sessão, só registrado para não perder o histórico): Almifrancy (sem fornecedor
  identificado), Almifrancy com fornecedor BRF S.A., e Maicon com fornecedor "LUA NOVA
  INDUSTRIA E COMERCIO DE PRODUTOS ALIMENTICIOS LTDA" (esse último foi o caso real que
  motivou o pedido de encurtar o nome do fornecedor no histórico).
- 01/09/26, ~12h20: sexto envio, visto ao ler o estado compartilhado antes da publicação das
  cores por filial — Rodrigo, fornecedor Unilever Brasil Ltda, todas as filiais. Mesma
  sessão em que a equipe já havia trocado as senhas de acesso/admin pelo próprio painel
  (primeiro uso real da camada de segurança implementada mais cedo em 01/09/26).
