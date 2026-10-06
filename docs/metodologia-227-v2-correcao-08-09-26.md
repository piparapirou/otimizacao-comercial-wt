# Sugestão de Compra por Fornecedor (relatório 227) — correção e histórico por fornecedor (08/09/26, segunda rodada)

> Este documento complementa `claude/metodologia-analise-sugestao-compra.md` (seção
> "Sugestão de Compra por Fornecedor — relatório 227 (08/09/26)"), registrando a correção de
> bug e a evolução pedidas pela equipe logo após o primeiro uso real da ferramenta. Mantido
> como documento separado (em vez de reescrever o arquivo principal) para não arriscar
> corromper o histórico já registrado ali — numa próxima edição do arquivo principal, este
> conteúdo deve ser incorporado como uma nova subseção datada, seguindo o padrão já usado no
> projeto de sempre acrescentar, nunca reescrever o que já está registrado.

Depois do primeiro uso real pela equipe (envio do 227 "Shogaoki", 08/09/26), o usuário
reportou um bug: "ao subir a 227, não foi apresentada a análise dos dados. Será necessário
subir a planilha?" — e pediu duas evoluções na mesma rodada: "vamos criar um histórico por
fornecedor... para acompanhar a evolução dos dados. Mesmo a 227 pode ser usada como base
para a análise sem necessariamente ter que subir a planilha".

## Causa do bug
A primeira versão exigia encontrar uma análise Formato 2 do Painel já salva no histórico
compartilhado para calcular a sugestão (`buildSugestaoCompra` retornava
`{erro: "sem_painel"}` sem isso) — na prática, qualquer fornecedor cujo 227 fosse enviado
antes de existir uma análise do Painel correspondente ficava sem nenhuma sugestão calculada,
exatamente o caso relatado.

## Colunas do 227 corrigidas/completadas
Em conversa adicional com o usuário, identificadas com certeza (usando os valores reais de
uma linha de exemplo do arquivo real: `48732,6 / 478,33 / 46,05 / 6311 / 510`) as colunas que
faltavam em `COL227`:
- `valorEstoqueRS` (índice 44): valor financeiro do estoque em R$.
- `estoqueFardos` (índice 45): **o estoque atual do fornecedor, em FARDOS** (não unidades!) —
  esta é a peça que faltava para o 227 ser autossuficiente. O campo logo após o rótulo
  "ESTOQUE:" (índice 42) NÃO é o estoque, é outro dado ainda não identificado (fica sempre 0
  no arquivo de exemplo) — descartado do mapeamento.
- `coberturaDiasReport` (índice 47): cobertura em dias já calculada pelo próprio relatório
  227 — usada só como conferência/sanity-check (fórmula parecida com a do Painel), nunca como
  entrada de cálculo.
- `outrasEntradas`/`outrasSaidas` (índices 48/49): provavelmente transferência
  recebida/enviada entre filiais (confirmado pelo usuário como "provável"), não usado em
  nenhum cálculo — só capturado por completude.

## Motor reescrito para ser autossuficiente
`calcSugestaoItem`/`buildSugestaoCompra` em `app.js`: a sugestão de compra agora é sempre
calculada a partir dos próprios dados do 227 — `estoqueLiquido = item.estoqueFardos -
item.avarias` (ambos em fardos) — sem depender de achar uma análise do Painel.
`buildSugestaoCompra` nunca mais retorna `erro: "sem_painel"`. Quando existe uma análise do
Painel (Formato 2) cujo campo FORNECEDOR bate por nome (aproximação, já que não existe código
de fornecedor em nenhum dos dois relatórios — `findPainelEntryForFornecedor`), o estoque dela
(em UNIDADES) aparece numa coluna própria da tabela só como referência, nunca somado ou
combinado com o estoque em fardos do 227 — são unidades de medida diferentes e não existe
fator de conversão confirmado entre fardo e unidade.

## Venda diária mensal, agora pro-rateada pelo dia do mês
A base mensal (usada quando a periodicidade do fornecedor é maior que 15 dias) passou a
dividir a venda do mês atual pelos dias já decorridos do mês (extraídos do nome do arquivo do
227, padrão `ddmmaa` antes da extensão — `extractReportDateFromFilename227`) em vez de sempre
`/30`, mesma lógica já usada em `analyzeFormat2` para `vendaEstimadaMesAtual`. Sem essa
correção, um relatório gerado no início do mês (o caso real, dia 08/09) subestimava a venda
diária e superestimava a cobertura. Validado contra o próprio `coberturaDiasReport` do
relatório real (item 303615/filial 1: cobertura estimada pela fórmula corrigida ≈ 44,7 dias
vs. 46,05 dias do relatório — bem próximo; a versão antiga, sem pro-rateio, dava uma
estimativa bem mais distante).

## Histórico por fornecedor
`STATE.relatorio227` mudou de uma lista plana de envios (`{history: [...], currentId}`, uma
entrada nova a cada upload) para agrupado por fornecedor (`{fornecedores: {chave: {nome,
periodicidadeDias, tempoEntregaDias, uploads: [...]}}, currentFornecedor}`), chaveado por
nome normalizado (maiúsculas, sem acento — não existe código de fornecedor em nenhum dos
relatórios, e o usuário confirmou que o cadastro deve ficar fixo no fornecedor efetivado
mesmo quando a entrega real vem de um distribuidor/atacadista diferente: "o cadastro será
sempre naquele que foi efetivado, não se altera"). Cada novo envio do mesmo fornecedor entra
na lista `uploads` dele (mais recente primeiro, até 24 guardados) em vez de criar uma entrada
nova solta — a tela ganhou um painel "Evolução — envios anteriores" que deixa escolher qual
envio visualizar (preferência de tela, não persistida) para comparar como os dados mudaram
entre visitas.

Ao enviar um novo 227, o formulário de cadastro sugere automaticamente o fornecedor já
conhecido mais parecido com o nome do arquivo (`findBestFornecedorMatch` — aproximação por
substring contra fornecedores já cadastrados no 227 e nomes vistos no histórico do Painel)
com autocompletar (`<datalist>`), reaproveitando periodicidade/tempo de entrega já
cadastrados quando bate; digitar um nome que não corresponde a nenhum conhecido cria um
fornecedor novo normalmente.

**Migração**: como o estado ao vivo já tinha um cadastro real no formato antigo (fornecedor
"Shogaoki", exatamente o que motivou o bug relatado), foi escrita uma migração defensiva em
`loadInitialState` que converte automaticamente o formato antigo para o novo na primeira
carga, preservando esse cadastro sem perda de dado.

## Testado
`node --check app.js`, `node vmtest.js` (zero regressão nos formatos já existentes) e um
teste vm-sandbox novo, contra o arquivo real do 227 (não um sintético): confirmado que
`COL227` captura corretamente `estoqueFardos`/`valorEstoqueRS`/`coberturaDiasReport` nos
valores reais da linha de exemplo, que `buildSugestaoCompra` gera uma sugestão completa (sem
erro) sem nenhuma análise do Painel no estado, e que a migração do formato antigo (simulando
o estado real "Shogaoki" encontrado ao vivo) preserva fornecedor/periodicidade/tempo de
entrega/itens corretamente.

## Publicação
`BUILD_VERSION` atualizado para "08/09/2026 as 18:20 (horario de Brasilia)", com nova entrada
no `CHANGELOG` descrevendo esta correção/evolução. Publicado seguindo a disciplina padrão do
projeto: leitura do estado ao vivo antes de reconstruir (confirmando o cadastro real
"Shogaoki" existente), reconstrução do `content.html` a partir do estado lido + código fonte
atual, verificação byte-a-byte, segunda leitura de conferência imediatamente antes de
publicar (mesmo hash da primeira leitura — sem uso concorrente da equipe nesse intervalo).
