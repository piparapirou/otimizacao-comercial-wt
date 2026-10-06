# Metodologia — Calculadora CBS/IBS de Compras (out/2026)

Artefato: https://claude.ai/artifact/HNz3UcWzm6gBTskVzSvTmy (compartilhado por link)
Catálogo de temas (Design): https://claude.ai/artifact/UhKGGRuWFuiXsyfYoqYux6

## Escopo atual (decisão de 05/10/2026)
- Foco só em hoje (2026) × 2027. Os anos 2028–2033 dependem de definições e não há estoque que dure esse tempo; as regras desses anos ficam no código (desligadas) para uso futuro.
- Uso principal: compra para revenda. Destinação aparece discreta ("Destinação: Revenda · Alterar"), com Revenda e Uso interno; "Usar na produção" foi retirado da tela (cálculo de industrialização mantido no código).
- Regime fixo: Lucro Real (empresa).

## Tela
- Topo: seletor de Tema (Automático, Claro, Escuro, Retrô, Planilha, Alto contraste, Litoral, Café, Lavanda, Meia-noite, Cerrado) e botões de exemplo.
- Passo 1 — Dados da nota: valor do produto, alíquota do ICMS, tem ST? (Sim/Não), IPI.
- ST: o usuário escolhe como a informação aparece na nota (Valor da ST, % da ST, MVA ou Base da ST) e digita um único valor; os demais aparecem como texto calculado. Mesmo modelo para IPI (% ou R$) e ICMS (redução %, base ou valor).
- Passo 2 — Mais opções (recolhido): frete, despesas, desconto, redução de base do ICMS e da ST, PIS/COFINS, alíquota da CBS, redução de alíquota da reforma, e as opções de repasse de preço, IPI ZFM e CBS/IBS na base do ICMS (SEFAZ-SP). O IBS fica oculto (fixo em 0,1% em 2027).
- Resultado: frase-resposta ("Em 2027 este item deve custar R$ X, Y% mais barato que hoje…"), custo líquido, total da nota, créditos, tabela Hoje × 2027 com diferença; detalhe imposto por imposto e metodologia recolhidos.
- Celular: barra fixa no rodapé com o custo líquido de 2027.

## Entradas e padrões
IPI 0%, ICMS 18%, alíquota de destino da ST 18%, PIS 1,65% + COFINS 7,6% (9,25%), CBS 8,8%.

## Cálculo atual (2026)
- Valor da operação = produto + frete + despesas − desconto
- IPI = operação × alíq.
- Base ICMS = (operação [+ IPI se uso interno]) × (1 − redução); ICMS = base × alíq.
- Base ST = (operação + IPI) × (1 + MVA) × (1 − red. ST); ST = base ST × alíq. interna − ICMS próprio
- PIS/COFINS (embutidos) = (operação − ICMS) × alíq.
- CBS 0,9% e IBS 0,1% apenas destacados (teste), sem custo.

## Cálculo 2027
- Base CBS/IBS = operação − ICMS (sem IPI, sem PIS/COFINS) — LC 214/2025, art. 12
- Total NF = operação + IPI + ST + CBS + IBS (por fora)
- PIS/COFINS extintos; CBS = referência − 0,1 p.p.; IBS 0,1%; IPI zero (exceto ZFM, opcional); ICMS igual
- Opção "fornecedor retira do preço" (ligada por padrão): preço recalculado para manter a receita líquida do fornecedor (sem ICMS, PIS, COFINS) igual à de hoje
- Opção "CBS/IBS na base do ICMS/ST" (entendimento SEFAZ-SP, Consulta 32303/2025) — desligada por padrão

## Regras guardadas para depois (2028–2033)
- 2028: igual a 2027
- 2029–2032: ICMS a 90/80/70/60% da alíquota; IBS a 10/20/30/40% da referência (17,7% estimado)
- 2033: ICMS extinto; IBS integral

## Créditos (Lucro Real)
- ICMS: sem ST, revenda
- PIS/COFINS: base sem ICMS destacado (Lei 14.592/23) e sem ICMS-ST (STJ Tema 1231); inclui IPI não recuperável; uso interno sem crédito
- CBS/IBS: integral, inclusive uso interno
- Custo líquido = total NF − créditos

## Avisos de campos sem impacto
A página testa cada campo (variação pequena, em 2026 e 2027) e mostra no próprio campo "⚠ Não muda o custo" ou "⚠ Muda o custo só em <ano>", com "Por quê?" expansível. Na tabela detalhada, valores que voltam inteiros como crédito levam a marca "crédito integral".

## Premissas a revisar
CBS de referência 8,8% (estimativa). Resolução do Senado para a CBS 2027 prevista até 15/12/2026. Estimativa CGIBS (Res. 14/2026): 27,91% (IBS 18,70% + CBS 9,21%).
