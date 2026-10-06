# Análise de clientes e margem por item (extrato de movimentação do item, Winthor)

Primeiro uso: 23/09/26, Suflair item 366945, matriz, ago/26 (PMZ informado R$ 94,95).

## Entrada
Extrato de movimentação de um item/filial/mês com as colunas: data, hora, operacao, descricao operacao,
motivo ajuste, transacao entrada, transacao venda, rca, cod cliente, cliente, doc, preco unit, qt entrada,
qt saida (negativa), saldo. Códigos de operação vistos: S (venda), ED (devolução cliente), SB (bonificação,
preço 0), ST (saída transf., lançada a custo), ET (entrada transf., com linha de cancelamento), SP
(requisição/uso interno). Cód cliente 1 = consumidor final (cupom; RCAs = operadores de caixa).

## Regras de cálculo
- Qtd venda líquida = S − ED; bonificação = SB. Receita = qtd × preço unit.
- Resultado vs PMZ = receita − (qtd vendida + qtd bonificada) × PMZ (bonificação entra como custo, a pedido do usuário).
- Preço efetivo c/ bonif. = receita ÷ (vendida + bonificada) — mostra desconto disfarçado de bonificação.
- Segunda régua: custo de referência = preço médio ponderado das ST do mês (Winthor transfere a custo).
- Separar "grandes negociações" (notas ≥ 60 un ou com bonificação) do canal pulverizado.
- Faixas de preço, semana de oferta x semanas normais (elasticidade aparente), RCA, diário/dia da semana,
  movimentação e cobertura de estoque (saldo inicial reconstituído = saldo do 1º movimento − qtd dele; conferir saldo final = 0 de diferença).
- "Valeu a pena sacrificar margem": sacrifício = (qtd+bonif) × preço médio do pulverizado − receita obtida;
  benefício = custo de carregar evitado = (qtd+bonif) × custo × taxa a.m. (premissa 1,5%) × meses p/ girar ÷ 2,
  com demanda normal = pulverizado + ST + SP.

## Verba do fornecedor para margem alvo (acrescentado 23/09/26)
Pedido do usuário: o fornecedor participa com verba para reduzir o custo de venda; calcular a verba para fechar
o período com margem de pelo menos 5%.
- Margem = (Receita − Custo a PMZ + Verba) ÷ Receita, com a bonificação dentro do custo a PMZ.
- Verba necessária = (Margem alvo × Receita − Resultado vs PMZ) ÷ fator de repasse.
- Fator de repasse = quanto R$ 1 de verba reduz o PMZ. Padrão 1,000 (abatimento direto, conservador). Se o PMZ
  for custo ÷ (1 − despesas% sobre venda), usar PMZ ÷ custo (≈1,058 no Suflair), o que reduz a verba ~5,5%.
- Mostrar: total do período, por negociação (5 grandes + pulverizado) e tabela de negociação por preço:
  verba/un = (PMZ − (1 − alvo) × preço) ÷ fator; bonificação precisa de verba = PMZ inteiro por unidade.
- Suflair ago/26: R$ 164,7 mil (R$ 21,85/un vendida; 26,5% da receita). ~86% vem das 5 grandes negociações.
  Pulverizado sozinho: R$ 23,4 mil (~R$ 9,60/un). Cupom a R$ 92,90: R$ 6,70/un; negociação a R$ 71,99: R$ 26,56/un.

## Entrega
.xlsx com fórmulas (abas Resumo, Premissas, Clientes com ABC, Faixas de preço, Promo x Normal, Grandes
negociações, Verba p margem 5%, RCA, Diário com gráfico, Estoque, Base). PMZ, custo, taxa, margem alvo e fator
de repasse ficam editáveis na aba Premissas. Desde 23/09/26 também disponível como ferramenta do portal (abaixo).

## Achados do caso Suflair ago/26 (referência)
Todas as faixas de preço ficaram abaixo do PMZ (tabela R$ 92,90 < PMZ R$ 94,95). Um cliente (3.360 un a R$ 71,99,
em 26 NFs no mesmo dia) = 44,6% do volume e 58% do prejuízo. Bonificações de 20–30% levaram o preço efetivo a
R$ 71,50–77,00 mesmo com nota a preço cheio. Oferta a R$ 85,90 (11–17/08): +76% volume com −6,4% preço, mas prejuízo ~5x
o de uma semana normal.

## Simulador de preço na ponta (acrescentado 23/09/26)
Pergunta do usuário: se suspendêssemos (ou reduzíssemos) as operações com os maiores clientes e usássemos a verba só
nos clientes normais da loja, que preço na ponta daria para trabalhar com 5% de margem?
- Preço sem verba para 5%: PMZ ÷ (1 − alvo) = R$ 99,95 (Suflair).
- Verba POR UNIDADE (mesmos R$ 21,85/un): preço = (PMZ − verba/un × fator) ÷ (1 − alvo) = R$ 76,95 (−14% vs média
  da loja R$ 89,86). A verba total acompanha o volume: ~R$ 53 mil com 2.438 un/mês; R$ 62–85 mil com elasticidade −1 a −3.
- Verba FIXA (R$ 164,7 mil mesmo com menos volume): preço e volume resolvidos juntos, q = q0 × (p/p0)^e, por bisseção.
  e = −1: R$ 55,80; −2: R$ 63,94; −3: R$ 68,48 (sem reação de volume: R$ 28,85, irreal). Improvável que o fornecedor
  mantenha a verba com menos da metade do volume.
- Meio-termo: preço efetivo mínimo único (R$ 76,95, com bonificação como desconto) para todos os clientes; em ago/26
  ficaram abaixo Claudio (71,99), Carioca (71,50) e Mario Gaboli (75,80).
- Elasticidades são hipóteses; a observada na oferta (≈ −11,5) inclui compra antecipada e não vale para preço permanente.

## Ferramenta no portal (23/09/26)
Pedido do usuário: "inclua esse artefato como página na análise, como ferramenta de apoio". Nova ferramenta
"Margem por Item" no portal Comercial WT (https://claude.ai/code/artifact/14fc7ec1-0e79-4de2-aa06-086a489ae370),
quinta aba, BUILD_VERSION "23/09/2026 as 17:30".
- Upload próprio (dropzone) do extrato do item + campos Item, PMZ (obrigatório) e margem alvo. Reconhece as colunas
  pelo nome do cabeçalho (MI_HEADER_ALIASES), não por posição; exige operação, cód. cliente, preço unit, qt entrada, qt saída.
- Guarda as linhas compactadas ([data, op, rca, codcli, cliente, doc, preço, qe, qs, saldo]) em
  STATE.margemItem.history (até 12) — PMZ, margem alvo, fator de repasse, custo de referência manual e taxa de
  carregamento são editáveis na própria análise (Recalcular) e salvos para a equipe, sem reenviar o arquivo.
- Motor puro computeMargemItem(entry), com cache por id+parâmetros. Mesmas regras deste documento; grandes
  negociações = nota ≥ 60 un ou cliente com bonificação (nunca o consumidor final). Custo de referência: manual > ST > ET.
- Oferta detectada automaticamente: preço regular = mediana do preço predominante (por qtd) de cada dia no
  pulverizado; oferta = maior sequência (≥ 3 dias) com preço predominante ≥ 3% abaixo dele. Suflair: 11–17/08, correto.
- Abas: Clientes (ordenável, busca), Grandes negociações, Faixas de preço & verba, Oferta, RCA, Estoque, Simulador.
  "Principais leituras" são geradas a partir dos números (não texto fixo).
- Primeira análise já carregada no histórico: 366945 — Suflair (Matriz), ago/26. Validado contra a planilha: todos os
  totais batem (receita 622.046,80; resultado −133.565,30; verba 164.667,64; saldo final 11.741, diferença 0).
- De quebra: corrigido o estouro horizontal da topbar em celular (~60px) em todas as ferramentas (quebra em 2 linhas < 640px).
- Publicado com a disciplina padrão: estado ao vivo lido antes, reconstrução a partir dele (só a chave margemItem
  adicionada; demais chaves conferidas idênticas), teste Playwright ponta a ponta, segunda leitura (mesma versão) antes de publicar.

## Parâmetros editáveis ao vivo (24/09/26)
Pedido do usuário: editar PMZ e margem desejada em análises já calculadas (ex.: corrigir PMZ digitado errado), com
slider de margem de −5% a 100%, maior que o campo de texto, recalculando dinamicamente.
- Painel de parâmetros: PMZ (com aviso se ≤ 0, sem recalcular valor inválido) e margem desejada = campo numérico
  (96px) + slider largo (flex, ocupa o resto da linha), passo 0,5 ponto, marcas −5/0/10/25/50/75/100%. Campo e slider
  sincronizados nos dois sentidos. Fator de repasse, custo de referência e custo de carregar estoque em "Mais parâmetros".
- Recálculo sem botão: cada mudança redesenha só #miResults (KPIs, leituras, abas/tabelas, simulador); o painel de
  parâmetros não é redesenhado, então o slider não perde o arraste. Slider via requestAnimationFrame; campos com
  debounce de 250 ms. Cache do motor limitado a 60 combinações.
- Salvamento para a equipe (persist) agendado 1,5 s após a última mudança, com status ao lado do título
  ("salvando em instantes…" → "Salvo para a equipe ✓").
- Testado (Playwright): arraste de 5% a 40% atualiza a verba a cada passo (R$ 164.668 → R$ 382.384) mantendo o foco no
  slider e a aba aberta; PMZ 0 mostra erro; PMZ 90 recalcula; voltar a 94,95/5% reproduz os números originais; −5% ok;
  celular sem estouro horizontal (slider vai para a linha de baixo).

## Bases de custo (PMZ, custo financeiro, custo real) e colunas configuráveis (24/09/26)
Pedido do usuário: incluir custo financeiro e custo real além do PMZ, como opções de visualização com multiseleção,
e permitir editar visibilidade e ordem das colunas arrastando.
- Parâmetros: params.cfin e params.creal (R$/un, opcionais) — no envio e editáveis ao vivo na análise, salvos para a
  equipe. Ao informar um custo pela primeira vez, a base passa a aparecer selecionada.
- Motor: computeMargemItem(entry, baseKey) roda uma vez por base ("pmz" | "cfin" | "creal"); a base substitui o PMZ
  em resultado, margem, verba (total, por negociação, por faixa de preço), oferta e simulador. Custo usado no
  "valeu a pena" (carregar estoque): transferências (ST/ET) > custo real > custo financeiro.
- Seletor "Ver resultados por" (chips com multiseleção; base sem valor fica desabilitada; mínimo 1). Escolha salva no
  navegador (wt-mi-bases). Cor fixa por base: PMZ = acento, financeiro = azul (info), real = roxo (fl).
- KPIs: bloco "Volume & receita" + um bloco "Resultado & verba — <base>" por base selecionada. Leituras usam a primeira
  base selecionada e, com mais de uma, uma linha comparando resultado/margem/verba entre as bases. Simulador ganhou
  seletor de base de custo.
- Tabelas Clientes, Grandes negociações, Faixas de preço e RCA: colunas por base com id "grupo@base". Arrastar o
  cabeçalho reordena; "⚙ Colunas" abre um popover com caixa de seleção (mostrar/esconder) e lista arrastável, mais
  "Restaurar padrão". Preferência por tabela no navegador (wt-mi-cols-<tabela>); coluna nova (ex.: ao ligar outra base)
  entra logo após a vizinha anterior da ordem padrão.
- Suflair ago/26 (teste com custo financeiro 92,50 e custo real 89,764): resultado −133.565 (PMZ), −114.068 (fin.),
  −92.295 (real, bate com o antigo "vs custo de transferência"); verba p/ 5%: 164.668 / 145.171 / 123.397.
- Na publicação, o estado ao vivo tinha a margem do Suflair alterada pela equipe para 18% — preservada (a página foi
  reconstruída sobre o estado lido na hora, não sobre a cópia local).

## CORREÇÃO — regras de tributação (24/09/26) — substitui o cálculo "preço − PMZ" das seções acima
Regras passadas pelo usuário:
- Custo financeiro = valor pago na NF, sem crédito/débito de impostos.
- Custo real = custo financeiro − créditos de impostos (ICMS, PIS/COFINS) − verbas de fornecedor.
- PMZ = custo real ÷ (1 − impostos de saída sobre a venda). Suflair: 76,67 ÷ (1 − 0,0925) = 84,48 (usuário citou 84,49,
  arredondamento). Item em substituição tributária: ICMS já recolhido na entrada, sem débito/crédito de ICMS; PIS/COFINS
  9,25% na saída e crédito de 9,25% na entrada. O "crédito sempre é realizado".
- Bonificação: não gera PIS/COFINS na saída, mas gera débito de ICMS quando o ICMS incidir no produto.
- O PMZ de R$ 94,95 usado na primeira análise (planilha de 23/09 e respostas no chat) estava ERRADO: os números
  daquela planilha estão desatualizados.
Modelo implementado na ferramenta Margem por Item:
- Resultado = receita bruta × (1 − ICMS saída − PIS/COFINS saída) − qtd vendida × custo líquido − qtd bonificada ×
  (custo líquido + ICMS saída × preço médio de venda). Margem = resultado ÷ receita bruta. Alvo aplicado sobre a receita bruta.
- Duas bases: "Custo real / PMZ" (custo real; PMZ e custo real dão o mesmo resultado, PMZ = equilíbrio em preço) e
  "Custo financeiro (reposição)" = custo financeiro × (1 − créditos de entrada) (Suflair: NF 85,21 última entrada → 77,33).
- Custo real ⇄ PMZ vinculados (editar um recalcula o outro); impostos de saída e créditos de entrada editáveis por item
  (padrão PIS/COFINS 9,25%/9,25%, ICMS 0%/0%).
- Verba abate o custo real 1:1 (fator de repasse removido). Verba/un por preço = custo líquido − preço × (1 − impostos
  saída − alvo). Simulador: preço = (custo líquido − verba/un) ÷ (1 − impostos saída − alvo).
- Suflair ago/26 com custo real 76,67: resultado −R$ 45.632 (margem −7,3%); grandes negociações −R$ 57.521;
  pulverizado +R$ 11.888; Claudio −R$ 38.099 (único preço abaixo do PMZ, R$ 71,99; 83% do prejuízo); Carioca −R$ 14.706;
  Mario Gaboli −R$ 4.637. Verba p/ 5%: R$ 76.735 (R$ 10,18/un). Sem verba, 5% exige preço ≥ R$ 89,41.

## Extrato sem cabeçalho (24/09/26)
Pedido do usuário: "caso a planilha suba sem os cabeçalhos nas colunas, considere a estrutura que já foi anteriormente".
- Se nenhuma das 5 primeiras linhas tem cabeçalho reconhecível, a ferramenta lê por POSIÇÃO a estrutura do extrato de
  referência (Suflair): 0 data, 1 hora, 2 operação, 3 descrição, 4 motivo, 5 transação entrada, 6 transação venda, 7 RCA,
  8 cód. cliente, 9 cliente, 10 doc, 11 preço unit, 12 qt entrada, 13 qt saída, 14 saldo (MI_POSITIONAL).
- Tolera linhas de título antes dos dados e 0–3 colunas extras à esquerda. Só aceita se ≥ 60% das linhas (e pelo menos 3)
  tiverem data válida, operação de 1–3 letras e números nas colunas de valor; linhas que não batem são ignoradas.
- A análise fica marcada "sem cabeçalho — lida pela estrutura padrão" (entry.layout = "posicional").
- Testado: extrato do Suflair sem cabeçalho, com linha de título e com uma coluna extra à esquerda → totais idênticos
  à versão com cabeçalho (274 clientes, 7.538 un, R$ 622.047, −R$ 45.632); arquivo sem essa estrutura é recusado.

## Rolagem horizontal (24/09/26)
Barra de rolagem espelho com botões ◀ ▶ acima de toda .table-scroll mais larga que a tela (todas as ferramentas, via
MutationObserver em #app), barras nativas sempre visíveis e, na Margem por Item, primeira coluna fixa (Cliente passou a
ser a 1ª coluna padrão) e posição de rolagem preservada ao filtrar/reordenar.

## Estrutura completa do extrato, LGPD e Snickers (24/09/26)
Estrutura real do extrato (as próximas planilhas virão assim), 17 colunas:
0 data, 1 hora, 2 operação, 3 descrição, 4 motivo, 5 Nº CARREGAMENTO, 6 transação entrada, 7 transação venda, 8 RCA,
9 cód. cliente, 10 cliente, 11 CNPJ/CPF, 12 doc, 13 preço unit, 14 qt entrada, 15 qt saída, 16 saldo.
- A planilha do Suflair veio sem carregamento e sem CNPJ/CPF; a do Snickers veio com carregamento e sem CNPJ/CPF.
- Leitura sem cabeçalho testa 4 variantes (com/sem carregamento × com/sem CNPJ/CPF) × deslocamento 0–3, com pontuação por
  linhas válidas + continuidade do saldo (saldo anterior + entrada − saída). Com cabeçalho, "carregamento" e "cnpj/cpf"
  são reconhecidos. A análise mostra qual variante foi lida.
- LGPD: a coluna CNPJ/CPF só é localizada para ser PULADA; nunca é lida, guardada ou exibida. Nomes de clientes passam
  por limpeza que remove sequências de 8+ dígitos (CPF/CNPJ digitado junto ao nome); análises já salvas foram limpas.
- Grande negociação passou a ser: nota com valor ≥ R$ 5.000 (editável) ou cliente com bonificação. O critério antigo
  (≥ 60 un) marcava 60 clientes no Snickers, item de preço baixo. Suflair continua com os mesmos 5.
- Aba de estoque mostra as linhas E (entrada por compra) e SD.
Snickers ago/26 (recalculado; a leitura original tinha deslocado 1 coluna por causa do carregamento). Parâmetros: custo real
2,20, custo financeiro 2,42, PMZ 2,42, alvo 5%:
- 318 clientes, 275.129 un, receita R$ 740.023, 35.760 un bonificadas (13%), preço médio R$ 2,69, efetivo R$ 2,38.
- Resultado −R$ 12.385 (−1,7%): 7 grandes −R$ 36.499; pulverizado +R$ 24.113. Carioca: 66.480 un + 28.560 bonificadas,
  efetivo R$ 2,08, −R$ 29.303. Verba p/ 5%: R$ 49.386 (R$ 0,18/un).
- 65,4% das unidades vendidas acima do PMZ; menor preço R$ 2,29. Oferta 18–25/08: +54% volume com −9,1% preço.
- Compras (E): 330.000 un a R$ 2,88/un (MARS), acima do custo financeiro informado (2,42): conferir.
- Saldo de estoque perdido na recuperação (a análise foi refeita a partir dos dados salvos); subir a planilha de novo restaura.
