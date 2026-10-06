/* ======================================================================
   Otimizacao Comercial WT - motor de analise + interface
   Porta fielmente a metodologia usada nas planilhas (Formato 1: Sugestao
   de Compra; Formato 2: Posicao de Estoque/Giro por Secao, com ou sem
   coluna FORA_DE_LINHA, com 1 ou varias filiais).
   ====================================================================== */

/* ---------------------------------------------------------------------
   VERSAO / HISTORICO DE ALTERACOES
   Atualizados a mao a cada publicacao que muda layout/comportamento
   (nao um timestamp automatico de build - reflete quando o codigo desta
   pagina foi de fato alterado). BUILD_VERSION aparece no rodape; CHANGELOG
   alimenta o painel de historico protegido por senha (mais recente primeiro).
   --------------------------------------------------------------------- */
const BUILD_VERSION = "01/09/2026 as 10:10 (horario de Brasilia)";
const CHANGELOG_PASSWORD = "123";
const CHANGELOG = [
  { date: "01/09/2026", summary: "Cobertura em dias (QTESTDIAS) passa a ser conferida contra a venda FECHADA real dos 3 meses anteriores: quando o GIROMEDIO que o arquivo traz nao bate com essa venda (mostra zero apesar de venda real, ou diverge de mais de 50%), o painel recalcula a cobertura a partir da venda fechada em vez de usar o QTESTDIAS bruto do arquivo, para a classificacao de Parado/Lento. Cobre tanto o caso de GIROMEDIO desatualizado/zerado (superestimava parado) quanto o de GIROMEDIO inflado (mascarava um item realmente parado). Marcado como \"(corrigido)\" na tabela Parado/Lento, com o giro do arquivo e o calculado visiveis no tooltip." },
  { date: "01/09/2026", summary: "Corrigida distorcao de estoque parado/lento para produtos sem historico de venda nos 3 meses anteriores (cadastro novo ou que estava em falta): quando a soma dos 3 meses e zero, a classificacao passa a usar uma estimativa a partir da venda do mes atual (do dia 01 ate o dia do relatorio, projetada para 30 dias) em vez de tratar como parado automaticamente. A cobertura em dias tambem e recalculada a partir dessa estimativa nesses casos, ja que o QTESTDIAS do arquivo sofre da mesma distorcao. Itens classificados dessa forma aparecem marcados como \"(estimado)\" na tabela Parado/Lento, com a venda real (3m) e o QTESTDIAS original do arquivo continuando visiveis para conferencia." },
  { date: "31/08/2026", summary: "Historico da equipe passou a mostrar o fornecedor de forma resumida, cortando no ponto onde comeca o tipo/forma juridica da empresa (ex.: 'LUA NOVA INDUSTRIA E COMERCIO DE PRODUTOS ALIMENTICIOS LTDA' vira so 'LUA NOVA'; reconhece tambem DISTRIBUIDORA/DIST, LTDA, S.A./SA, EIRELI, ME/EPP, IND/COM, IMP/EXP, ATACADO/ATACADISTA, entre outros)." },
  { date: "31/08/2026", summary: "Historico da equipe passou a mostrar so o primeiro nome do comprador (ex.: 'Almifrancy De S S' vira 'Almifrancy'; 'Almifrancy' especificamente aparece como 'Almi', apelido usado pela equipe). Removido o painel \"Gerar Excel completo\" do topo da analise (nao baixava nada de fato, so gerava um texto para colar no chat) - desnecessario." },
  { date: "31/08/2026", summary: "Corrigido bug de layout: a tela de senha do historico de alteracoes (e, quando aplicavel, o modo tela cheia da tabela) podia aparecer aberta ja no carregamento da pagina, mesmo sem o usuario clicar em nada. A causa era uma regra de CSS que sobrescrevia o atributo padrao do navegador que esconde esses paineis; corrigido para o atributo hidden ser sempre respeitado." },
  { date: "31/08/2026", summary: "Corrigida a interpretacao da coluna de valor de estoque (ex.: VL_CUSTOFIN): agora e tratada como o valor TOTAL do item naquela filial, sem multiplicar por quantidade (antes multiplicava, como se fosse valor por unidade/caixa). Corrigida tambem a separacao de codigo/descricao do produto para o caso de um arquivo trazer coluna CODIGO propria mas sem uma coluna DESCRICAO dedicada (usa CODIGO + o campo PRODUTO inteiro como descricao)." },
  { date: "31/08/2026", summary: "Rodape com versao (data/hora da ultima alteracao de layout) e historico de alteracoes protegido por senha." },
  { date: "31/08/2026", summary: "Plano de Acao e indicadores por filial ficaram clicaveis (levam direto a lista filtrada correspondente). Tabelas de resultado passaram a ter altura maxima com rolagem interna (vertical e horizontal) e um modo de tela cheia com menu para trocar de aba. Upload deixou de pedir comprador/fornecedor/filial/data manualmente - tudo extraido automaticamente do proprio arquivo; adicionada busca no historico por comprador, fornecedor ou data." },
  { date: "31/08/2026", summary: "Historico da equipe passou a exibir Comprador - Fornecedor - Filial (campos estruturados no upload) em vez do nome do arquivo." },
  { date: "31/08/2026", summary: "Separacao de codigo/descricao do produto ajustada para exigir prefixo numerico antes do \" - \". Sugestao de origem de transferencia (multi-filial) refinada para a hierarquia real de abastecimento: 1 pede da 3, 4 pede da 5, e 5/6/7 pedem de 1 ou 3 (com excecao por dias de cobertura)." },
  { date: "31/08/2026", summary: "Regra de deposito refinada: ruptura zerada em deposito (filial 3 ou 5) so conta como ruptura de verdade se a loja abastecida tambem estiver em risco. Temas de cor (claro/escuro/quente/frio) e espaco reservado para logo adicionados." },
  { date: "31/08/2026", summary: "Regras de rede de filiais: 3 e 5 sao depositos fechados (nao pontos de venda, ficam fora de parado/lento/revisar status); sugestao de transferencia passou a considerar geografia (mesma cidade > matriz > outra). Botao \"Gerar Excel completo\" e KPIs clicaveis adicionados." },
  { date: "31/08/2026", summary: "Publicacao inicial do painel web: upload direto do .xlsx no navegador, deteccao automatica de formato, KPIs, abas curadas e Plano de Acao, com historico compartilhado entre a equipe." },
];

/* ---------------------------------------------------------------------
   ENGINE (pure functions, no DOM) - mirrors engine.js validated in Node
   against the four reference files before this page was built.
   --------------------------------------------------------------------- */

const FILIAL_COLS = { 1: "QTESTF1", 3: "QTESTF3", 4: "QTESTF4", 5: "QTESTF5", 6: "QTESTF6", 7: "QTESTF7" };
const ALL_F_COLS = ["QTESTF1", "QTESTF3", "QTESTF4", "QTESTF5", "QTESTF6", "QTESTF7"];

// Operational map for this specific network - filiais 3 and 5 are closed
// depots (no retail sales of their own), not points of sale; geography
// groups filiais for transfer-distance reasoning. Adjust here if the
// network of filiais changes.
const FILIAL_META = {
  1: { cidade: "Campinas", tipo: "matriz" },
  3: { cidade: "Campinas", tipo: "deposito" },
  4: { cidade: "Santa Bárbara D'Oeste", tipo: "loja" },
  5: { cidade: "Santa Bárbara D'Oeste", tipo: "deposito" },
  6: { cidade: "Sorocaba", tipo: "loja" },
  7: { cidade: "Campinas", tipo: "loja" },
};
function isDeposito(filial) { return !!FILIAL_META[filial] && FILIAL_META[filial].tipo === "deposito"; }
function filialLabel(filial) {
  const m = FILIAL_META[filial];
  if (!m) return `Filial ${filial}`;
  if (m.tipo === "deposito") return `Filial ${filial} (depósito)`;
  if (m.tipo === "matriz") return `Filial ${filial} (matriz)`;
  return `Filial ${filial}`;
}
// Lower tier = better transfer origin: 0 = same city as destination
// (covers the local depot), 1 = matriz (best trucks + separation/expedition
// capacity even across cities), 2 = any other filial, 3 = unmapped filial.
function originTier(originFilial, destFilial) {
  const om = FILIAL_META[originFilial], dm = FILIAL_META[destFilial];
  if (!om || !dm) return 3;
  if (om.cidade === dm.cidade) return 0;
  if (originFilial === 1) return 1;
  return 2;
}
function distanciaLabel(originFilial, destFilial) {
  const tier = originTier(originFilial, destFilial);
  if (tier === 0) return "mesma cidade";
  if (tier === 1) return "via matriz";
  if (tier === 2) return "outra cidade";
  return "";
}
// Filial 3 abastece principalmente a filial 1 (matriz); filial 5 atende
// basicamente a filial 4. Usado para nao alarmar ruptura no deposito quando
// a loja que ele abastece esta saudavel (ver splitProdutoCodigo/override de
// ruptura em analyzeFormat2).
const DEPOSITO_RETAIL = { 3: 1, 5: 4 };

// Ate agora PRODUTO chega como "CODIGO - DESCRICAO" num campo so. As
// proximas planilhas devem trazer os dois campos separados - se existirem
// colunas dedicadas, usa-las; senao, separa o campo combinado no primeiro
// " - ".
function splitProdutoCodigo(row, headers) {
  const codCol = ["CODIGO", "COD_PRODUTO", "CODPRODUTO"].find((c) => headers.includes(c));
  const descCol = ["DESCRICAO", "DESCR_PRODUTO", "NOME_PRODUTO"].find((c) => headers.includes(c));
  const raw = String(row.PRODUTO ?? "").trim();
  // So separa o campo combinado quando o inicio e realmente um codigo
  // numerico seguido de " - " (ex.: "249912 - LEITE COND MOCA 395G"). Se a
  // descricao tiver um hifen mas nao comecar com numeros, mantem tudo como
  // descricao em vez de cortar no lugar errado.
  const m = raw.match(/^(\d+)\s*-\s*(.+)$/);
  if (codCol) {
    // Coluna de codigo dedicada existe (ex.: arquivo Ype corrigido,
    // 31/08/26) - usa ela mesmo que nao haja uma coluna DESCRICAO/
    // DESCR_PRODUTO/NOME_PRODUTO dedicada: nesse caso PRODUTO ja vem so
    // com a descricao (sem prefixo de codigo), entao usa PRODUTO inteiro
    // como descricao; se por algum motivo PRODUTO ainda tiver o prefixo
    // "codigo - ", tira o prefixo redundante.
    const descricao = descCol ? String(row[descCol] ?? "").trim() : (m ? m[2].trim() : raw);
    return { codigo: String(row[codCol] ?? "").trim(), descricao };
  }
  if (m) return { codigo: m[1], descricao: m[2].trim() };
  return { codigo: "", descricao: raw };
}

function excelSerialToDate(v) {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(Math.round((v - 25569) * 86400 * 1000));
  if (typeof v === "string" && v.trim() !== "") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}
function daysBetween(a, b) { return Math.round((a.getTime() - b.getTime()) / 86400000); }
function num(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}
function detectValueColumn(headers) {
  const candidates = headers.filter((h) => {
    const u = h.toUpperCase();
    return u.includes("VALOR") || u.includes("CUSTO") || u.includes("PRECO");
  });
  const unitCol = candidates.find((h) => /UNIT|UNITARIO/i.test(h));
  return unitCol || candidates[0] || null;
}
function detectFormat(headers) {
  const set = new Set(headers);
  const hasF2 = set.has("FILIAL") && set.has("COD_COMPRADOR") && set.has("QTESTDIAS") && set.has("DTPREVENT");
  const hasF1 = set.has("REQUISITAR") && set.has("QTDEREQUISITAR") && set.has("ULTIMA_VENDA");
  if (hasF2) return "format2";
  if (hasF1) return "format1";
  return "unknown";
}
function presentFCols(headers) { return ALL_F_COLS.filter((c) => headers.includes(c)); }
function outrasFiliaisSum(row, fcols) { return fcols.reduce((s, c) => s + num(row[c]), 0); }
// Format 1 has no explicit FILIAL column - its own filial's QTESTFx column
// is structurally absent (the report never lists stock "in itself" that
// way). The one filial missing from the known set {1,3,4,5,6,7} is the
// report's own filial.
function inferOwnFilial(fcols) {
  const known = [1, 3, 4, 5, 6, 7];
  const present = new Set(fcols.map((c) => Number(c.replace("QTESTF", ""))));
  const missing = known.filter((f) => !present.has(f));
  return missing.length === 1 ? missing[0] : null;
}

function analyzeFormat1(rows, headers, reportDate) {
  const fcols = presentFCols(headers);
  const statusCol = headers.includes("FORA_DE_LINHA") ? "FORA_DE_LINHA" : headers.includes("STATUS") ? "STATUS" : headers.includes("SITUACAO") ? "SITUACAO" : null;
  const valueCol = detectValueColumn(headers);
  const ownFilial = inferOwnFilial(fcols);
  const deposito = isDeposito(ownFilial);

  const items = rows.map((row) => {
    const ativo = !statusCol || String(row[statusCol]).toUpperCase() !== "FL";
    const qtest = num(row.QTEST), qtdisp = num(row.QTDISP), vendas = num(row.QTVENDAMESES);
    const ultimaVenda = excelSerialToDate(row.ULTIMA_VENDA);
    const diasSemVenda = ultimaVenda ? daysBetween(reportDate, ultimaVenda) : null;
    const estoqueOutras = outrasFiliaisSum(row, fcols);
    const qtdereq = num(row.QTDEREQUISITAR), qtdiascx = num(row.QTDIASCX);
    const numped = row.NUMPED !== null && row.NUMPED !== undefined && row.NUMPED !== "";

    let flagRuptura = "";
    if (ativo) {
      if (qtdisp === 0 && vendas > 0) flagRuptura = "CRITICO";
      else if (qtest === 0 && vendas > 0) flagRuptura = "ATENCAO";
    }
    let flagParado = "";
    if (ativo && !deposito && diasSemVenda !== null) {
      if (diasSemVenda > 30) flagParado = "PARADO (30+ dias)";
      else if (diasSemVenda > 15) flagParado = "LENTO (15-30 dias)";
    }
    const flagTransferencia = ativo && qtdereq > 0 && estoqueOutras >= qtdereq ? "AVALIAR TRANSFERENCIA" : "";
    let prioridade = "4-NORMAL";
    if (!ativo) prioridade = "N/A (FORA DE LINHA)";
    else if (flagRuptura === "CRITICO") prioridade = "1-URGENTE";
    else if (qtdiascx < 0 || flagRuptura === "ATENCAO") prioridade = "2-ALTA";
    else if (flagParado) prioridade = "3-REVISAR";

    // Coluna de valor detectada (ex.: VL_CUSTOFIN) ja vem como o valor TOTAL
    // do item nesta filial - nao e valor por unidade/caixa, entao nao
    // multiplica por quantidade (corrigido em 31/08/26 apos confirmacao do
    // usuario com o arquivo Ype corrigido: "considerar o valor como sendo o
    // total para o item por filial").
    const valorEstoque = valueCol ? num(row[valueCol]) : null;

    return { ativo, codprod: row.CODPROD, descricao: row.DESCRICAO, fornecedor: row.FORNECEDOR || "",
      qtest, qtdisp, vendas, qtvend1: num(row.QTVENDMES1), qtvend2: num(row.QTVENDMES2), qtvend3: num(row.QTVENDMES3),
      giromedio: num(row.GIROMEDIO), qtdereq, qtdereqPallet: num(row.QTDEREQUISITAR_PALLET),
      ultimaVenda, diasSemVenda, estoqueOutras, qtdiascx, numped, flagRuptura, flagParado, flagTransferencia,
      prioridade, valorEstoque };
  });

  const ativos = items.filter((i) => i.ativo);
  const fl = items.filter((i) => !i.ativo);
  const kpis = {
    total: items.length, ativos: ativos.length, fl: fl.length,
    rupturaCritica: ativos.filter((i) => i.flagRuptura === "CRITICO").length,
    rupturaAtencao: ativos.filter((i) => i.flagRuptura === "ATENCAO").length,
    parado: ativos.filter((i) => i.flagParado === "PARADO (30+ dias)").length,
    lento: ativos.filter((i) => i.flagParado === "LENTO (15-30 dias)").length,
    transferencia: ativos.filter((i) => i.flagTransferencia).length,
    jaTemPedido: ativos.filter((i) => i.numped).length,
    qtdeSugeridaCaixas: ativos.reduce((s, i) => s + i.qtdereq, 0),
    hasValueData: !!valueCol,
    valorParadoTotal: valueCol ? ativos.filter((i) => i.flagParado).reduce((s, i) => s + (i.valorEstoque || 0), 0) : null,
  };
  const priorityDist = {
    "1-URGENTE": ativos.filter((i) => i.prioridade === "1-URGENTE").length,
    "2-ALTA": ativos.filter((i) => i.prioridade === "2-ALTA").length,
    "3-REVISAR": ativos.filter((i) => i.prioridade === "3-REVISAR").length,
    "4-NORMAL": ativos.filter((i) => i.prioridade === "4-NORMAL").length,
  };
  return {
    format: "format1", hasStatus: !!statusCol, valueCol, multiFilial: false, filiais: [], ownFilial, deposito, kpis, priorityDist, perFilial: null,
    ruptura: ativos.filter((i) => i.flagRuptura).sort((a, b) => (a.flagRuptura === "CRITICO" ? -1 : 1) - (b.flagRuptura === "CRITICO" ? -1 : 1) || b.giromedio - a.giromedio),
    sugestaoCompra: [...ativos].sort((a, b) => {
      const order = { "1-URGENTE": 0, "2-ALTA": 1, "3-REVISAR": 2, "4-NORMAL": 3 };
      return order[a.prioridade] - order[b.prioridade] || a.qtdiascx - b.qtdiascx;
    }),
    parado: ativos.filter((i) => i.flagParado).sort((a, b) => (b.diasSemVenda || 0) - (a.diasSemVenda || 0)),
    transferencia: ativos.filter((i) => i.flagTransferencia).sort((a, b) => b.estoqueOutras - a.estoqueOutras),
    foraDeLinha: fl,
  };
}

function productKey(row) {
  return String(row.CODIGO ?? row.COD_PRODUTO ?? row.CODPRODUTO ?? row.PRODUTO ?? "");
}
function recomputePrioridade(it) {
  if (!it.ativo) return "N/A (FORA DE LINHA)";
  if (it.flagRuptura === "CRITICO") return "1-URGENTE";
  if (it.flagDivergencia) return "2-ALTA";
  if (it.flagParado) return "3-MEDIA";
  if (it.flagRevisar) return "4-REVISAR STATUS";
  return "5-NORMAL";
}

function analyzeFormat2(rows, headers, reportDate) {
  const hasFL = headers.includes("FORA_DE_LINHA");
  const filiais = [...new Set(rows.map((r) => num(r.FILIAL)))].sort((a, b) => a - b);
  const multiFilial = filiais.length > 1;
  const valueCol = detectValueColumn(headers);

  const items = rows.map((row) => {
    const filial = num(row.FILIAL);
    const produtoKey = productKey(row);
    const { codigo, descricao } = splitProdutoCodigo(row, headers);
    const ativo = !hasFL || String(row.FORA_DE_LINHA).toUpperCase() === "ATIVO";
    const qtdisp = num(row.QTDISP);
    const vendas = num(row.QTVENDAMES1) + num(row.QTVENDAMES2) + num(row.QTVENDAMES3);
    // Quando os 3 meses anteriores somam zero, isso tanto pode ser um item
    // realmente parado quanto um cadastro novo ou que ficou em falta nesse
    // periodo (sem historico para tras, mas ja vendendo agora). Nesse caso,
    // estimar a demanda pela venda do mes atual (QTVENDAMESFILTRO) dividida
    // pelos dias decorridos do periodo (dia 01 ate o dia do relatorio) e
    // projetada para 30 dias - evita marcar como parado/lento um item que
    // na verdade ja tem movimento, so nao tem 3 meses de historico (pedido
    // do usuario, 01/09/26). A coluna "Vendas (3m)" exibida na tabela
    // continua mostrando o valor real (sem a estimativa); a estimativa
    // entra só na classificacao parado/lento abaixo.
    const qtvendafiltro = headers.includes("QTVENDAMESFILTRO") ? num(row.QTVENDAMESFILTRO) : null;
    const diasDecorridos = Math.max(1, reportDate.getDate());
    const vendaEstimadaMesAtual = vendas === 0 && qtvendafiltro !== null && qtvendafiltro > 0
      ? (qtvendafiltro / diasDecorridos) * 30
      : null;
    const vendasParaStatus = vendaEstimadaMesAtual != null ? vendaEstimadaMesAtual : vendas;
    const qtestdias = num(row.QTESTDIAS);
    const giromedioArquivo = num(row.GIROMEDIO);
    // Giro medio proprio, calculado a partir da venda FECHADA dos 3 meses
    // anteriores (dado real do arquivo, nao estimado) - serve para conferir
    // se o GIROMEDIO/QTESTDIAS que o arquivo traz pronto bate com o
    // historico de venda de verdade (pedido do usuario, 01/09/26: "usar a
    // venda fechada de meses anteriores para calcular a media e comparar
    // com a media que a planilha traz para corrigir eventuais
    // inconsistencias, principalmente no caso relatado" - a distorcao de
    // parado/lento tratada acima).
    const giroMedioCalculado = vendas > 0 ? vendas / 3 / 30 : null; // unidades/dia
    const qtestdiasCalculado = giroMedioCalculado ? qtdisp / giroMedioCalculado : null;
    // Considera inconsistente quando ha venda fechada real nos 3 meses mas
    // o GIROMEDIO do arquivo diverge muito dela: mostra zero apesar de
    // venda real, ou a diferenca passa de 50% para mais ou para menos.
    // Nesses casos o GIROMEDIO/QTESTDIAS do arquivo provavelmente reflete
    // uma janela diferente (ex.: giro de 6-12 meses) ou esta desatualizado,
    // e o calculo a partir da venda fechada recente e mais confiavel.
    const giromedioInconsistente = giroMedioCalculado != null &&
      (giromedioArquivo <= 0 || Math.abs(giromedioArquivo - giroMedioCalculado) / giroMedioCalculado > 0.5);
    // QTESTDIAS vem pronto do Winthor e tambem costuma ser calculado a
    // partir do giro historico - ou seja, sofre da mesma distorcao (fica
    // artificialmente alto para um item sem historico, ou desatualizado
    // quando o GIROMEDIO do arquivo nao bate com a venda fechada real).
    // Prioridade para a cobertura usada na classificacao: (1) sem nenhum
    // historico de 3 meses mas ja vendendo no mes atual -> estimativa do
    // mes atual (bloco acima); (2) com historico real, mas o GIROMEDIO do
    // arquivo parece inconsistente com ele -> recalcula a partir da venda
    // fechada; (3) caso normal -> usa o QTESTDIAS do proprio arquivo.
    const qtestdiasParaStatus = vendaEstimadaMesAtual != null
      ? qtdisp / (vendaEstimadaMesAtual / 30)
      : (giromedioInconsistente && qtestdiasCalculado != null) ? qtestdiasCalculado : qtestdias;
    const totalRede = ALL_F_COLS.reduce((s, c) => s + num(row[c]), 0);
    const ownCol = FILIAL_COLS[filial];
    const estoqueOutras = ownCol && headers.includes(ownCol) ? totalRede - num(row[ownCol]) : totalRede;
    const qtpedida = num(row.QTPEDIDA);
    const dtprevent = excelSerialToDate(row.DTPREVENT);
    // Filiais 3 e 5 sao depositos fechados de abastecimento, nao pontos de
    // venda - "sem venda" nao e um problema para elas, entao os flags de
    // parado/lento/sem-movimento (baseados em ausencia de venda) nao se
    // aplicam.
    const deposito = isDeposito(filial);

    let flagRuptura = "";
    if (ativo && qtdisp === 0 && vendas > 0) flagRuptura = "CRITICO";
    let flagDivergencia = "";
    if (ativo && qtdisp < 0) flagDivergencia = "ESTOQUE NEGATIVO";
    let flagParado = "";
    if (ativo && !deposito && qtdisp > 0 && vendasParaStatus === 0) flagParado = "PARADO (sem venda 3m)";
    else if (ativo && !deposito && qtdisp > 0 && qtestdiasParaStatus > 60 && vendasParaStatus > 0) flagParado = "LENTO (cobertura 60+ dias)";
    let flagRevisar = "";
    if (ativo && !deposito && qtdisp <= 0 && vendas === 0) flagRevisar = multiFilial ? "SEM MOVIMENTO NESTA FILIAL" : "SEM MOVIMENTO";
    const flagTransferencia = ativo && qtdisp <= 0 && estoqueOutras > 0 ? "AVALIAR TRANSFERENCIA" : "";
    const pedidoAtrasado = ativo && qtpedida > 0 && dtprevent && dtprevent < reportDate ? "ATRASADO" : "";

    let prioridade = "5-NORMAL";
    if (!ativo) prioridade = "N/A (FORA DE LINHA)";
    else if (flagRuptura === "CRITICO") prioridade = "1-URGENTE";
    else if (flagDivergencia) prioridade = "2-ALTA";
    else if (flagParado) prioridade = "3-MEDIA";
    else if (flagRevisar) prioridade = "4-REVISAR STATUS";

    // Origem de transferencia priorizada por distancia: mesma cidade do
    // destino primeiro (cobre o deposito local), depois a matriz (filial 1,
    // melhor estrutura de caminhoes/separacao/expedicao mesmo entre
    // cidades), depois as demais - dentro de cada nivel, maior saldo vence.
    let origemSugerida = null;
    if (flagTransferencia) {
      let best = null;
      for (const f of Object.keys(FILIAL_COLS).map(Number)) {
        if (f === filial) continue;
        const c = FILIAL_COLS[f];
        if (!headers.includes(c)) continue;
        const v = num(row[c]);
        if (v <= 0) continue;
        const tier = originTier(f, filial);
        if (!best || tier < best.tier || (tier === best.tier && v > best.qtd)) best = { filial: f, qtd: v, tier };
      }
      origemSugerida = best ? { filial: best.filial, qtd: best.qtd, distancia: distanciaLabel(best.filial, filial) } : null;
    }
    // Coluna de valor (ex.: VL_CUSTOFIN) ja vem como valor TOTAL do item
    // nesta filial - nao multiplica por quantidade (ver nota em
    // analyzeFormat1, mesma correcao de 31/08/26).
    const valorEstoque = valueCol ? num(row[valueCol]) : null;

    return { ativo, produto: row.PRODUTO, produtoKey, codigo, descricao, filial, deposito, secao: row.SECAO, categoria: row.CATEGORIA, subcategoria: row.SUBCATEGORIA,
      qtdisp, vendas, qtvend1: num(row.QTVENDAMES1), qtvend2: num(row.QTVENDAMES2), qtvend3: num(row.QTVENDAMES3),
      vendaEstimadaMesAtual, qtestdiasParaStatus, giroMedioCalculado, giromedioInconsistente,
      giromedio: num(row.GIROMEDIO), qtestdias, qtpedida, dtprevent, estoqueOutras, flagRuptura, flagDivergencia,
      flagParado, flagRevisar, flagTransferencia, pedidoAtrasado, prioridade, origemSugerida, valorEstoque };
  });

  if (multiFilial) {
    // Indice geral produto -> filial -> item, usado tanto para reavaliar
    // ruptura no deposito quanto para a origem de transferencia refinada
    // abaixo (precisa do QTESTDIAS de CADA filial, que so existe na
    // propria linha daquela filial, nao nas colunas QTESTFx).
    const filialIndex = new Map();
    for (const it of items) {
      if (!filialIndex.has(it.produtoKey)) filialIndex.set(it.produtoKey, {});
      filialIndex.get(it.produtoKey)[it.filial] = it;
    }

    // Um deposito (3/5) com estoque zerado nao esta necessariamente em
    // ruptura: se a loja que ele abastece (1 para o 3, 4 para o 5) esta
    // saudavel - tem estoque disponivel e nao esta ela mesma em ruptura -
    // o zero no deposito e giro normal, nao uma falta. So mantem a ruptura
    // no deposito quando a loja abastecida tambem esta sob risco.
    for (const it of items) {
      if (!it.ativo || it.flagRuptura !== "CRITICO") continue;
      const retailFilial = DEPOSITO_RETAIL[it.filial];
      if (!retailFilial) continue;
      const entry = filialIndex.get(it.produtoKey);
      const retail = entry && entry[retailFilial];
      if (retail && retail.qtdisp > 0 && retail.flagRuptura !== "CRITICO") {
        it.flagRuptura = "";
        it.prioridade = recomputePrioridade(it);
      }
    }

    // Origem de transferencia refinada pela hierarquia real de
    // abastecimento (pedido do usuario, 31/08/26):
    // - 1 pede da 3; 4 pede da 5 (pares diretos de abastecimento).
    // - 5, 6 e 7 recebem de 1 ou 3, o que tiver mais estoque disponivel -
    //   exceto quando isso deixaria a matriz (1) com MENOS dias de
    //   cobertura do que o excesso de outra filial; nesse caso, a origem
    //   vira a filial com mais dias de cobertura (nao esvazia a matriz
    //   para favorecer uma filial que ja tem folga em outro lugar).
    // - Qualquer outro caso cai no criterio antigo (mesma cidade > matriz
    //   > outra, por quantidade).
    for (const it of items) {
      if (!it.flagTransferencia) continue;
      const idx = filialIndex.get(it.produtoKey) || {};
      const has = (f) => idx[f] && idx[f].qtdisp > 0;
      let picked = null;

      if (it.filial === 1 && has(3)) picked = { filial: 3 };
      else if (it.filial === 4 && has(5)) picked = { filial: 5 };
      else if ([5, 6, 7].includes(it.filial)) {
        const c1 = has(1) ? idx[1] : null;
        const c3 = has(3) ? idx[3] : null;
        let pref = null;
        if (c1 && c3) pref = c1.qtdisp >= c3.qtdisp ? { filial: 1, item: c1 } : { filial: 3, item: c3 };
        else if (c1) pref = { filial: 1, item: c1 };
        else if (c3) pref = { filial: 3, item: c3 };
        if (pref && pref.filial === 1) {
          let alt = null;
          for (const [fStr, cand] of Object.entries(idx)) {
            const f = Number(fStr);
            if (f === 1 || f === it.filial || cand.qtdisp <= 0) continue;
            if (cand.qtestdias > pref.item.qtestdias && (!alt || cand.qtestdias > alt.item.qtestdias)) alt = { filial: f, item: cand };
          }
          pref = alt || pref;
        }
        if (pref) picked = { filial: pref.filial };
      }

      if (!picked) {
        let best = null;
        for (const [fStr, cand] of Object.entries(idx)) {
          const f = Number(fStr);
          if (f === it.filial || cand.qtdisp <= 0) continue;
          const tier = originTier(f, it.filial);
          if (!best || tier < best.tier || (tier === best.tier && cand.qtdisp > best.qtd)) best = { filial: f, qtd: cand.qtdisp, tier };
        }
        picked = best ? { filial: best.filial } : null;
      }

      it.origemSugerida = picked ? { filial: picked.filial, qtd: idx[picked.filial].qtdisp, distancia: distanciaLabel(picked.filial, it.filial) } : null;
    }
  }

  const ativos = items.filter((i) => i.ativo);
  const fl = items.filter((i) => !i.ativo);
  const kpis = {
    total: items.length, ativos: ativos.length, fl: fl.length,
    rupturaCritica: ativos.filter((i) => i.flagRuptura === "CRITICO").length,
    divergencia: ativos.filter((i) => i.flagDivergencia).length,
    pedidosAtrasados: ativos.filter((i) => i.pedidoAtrasado).length,
    transferencia: ativos.filter((i) => i.flagTransferencia).length,
    parado: ativos.filter((i) => i.flagParado === "PARADO (sem venda 3m)").length,
    lento: ativos.filter((i) => i.flagParado === "LENTO (cobertura 60+ dias)").length,
    revisarStatus: ativos.filter((i) => i.flagRevisar).length,
    hasValueData: !!valueCol,
    valorParadoTotal: valueCol ? ativos.filter((i) => i.flagParado).reduce((s, i) => s + (i.valorEstoque || 0), 0) : null,
  };
  const priorityDist = {
    "1-URGENTE": ativos.filter((i) => i.prioridade === "1-URGENTE").length,
    "2-ALTA": ativos.filter((i) => i.prioridade === "2-ALTA").length,
    "3-MEDIA": ativos.filter((i) => i.prioridade === "3-MEDIA").length,
    "4-REVISAR STATUS": ativos.filter((i) => i.prioridade === "4-REVISAR STATUS").length,
    "5-NORMAL": ativos.filter((i) => i.prioridade === "5-NORMAL").length,
  };
  let perFilial = null;
  if (multiFilial) {
    perFilial = filiais.map((f) => {
      const sub = ativos.filter((i) => i.filial === f);
      return { filial: f, deposito: isDeposito(f), ruptura: sub.filter((i) => i.flagRuptura === "CRITICO").length,
        divergencia: sub.filter((i) => i.flagDivergencia).length,
        parado: sub.filter((i) => i.flagParado === "PARADO (sem venda 3m)").length,
        lento: sub.filter((i) => i.flagParado === "LENTO (cobertura 60+ dias)").length,
        transferencia: sub.filter((i) => i.flagTransferencia).length };
    });
  }
  const ruptura = ativos.filter((i) => i.flagRuptura || i.flagDivergencia)
    .sort((a, b) => (a.flagRuptura === "CRITICO" ? 0 : 1) - (b.flagRuptura === "CRITICO" ? 0 : 1) || b.giromedio - a.giromedio);
  const transferencia = ativos.filter((i) => i.flagTransferencia)
    .sort((a, b) => (a.flagRuptura === "CRITICO" ? 0 : 1) - (b.flagRuptura === "CRITICO" ? 0 : 1) || b.estoqueOutras - a.estoqueOutras);
  const parado = ativos.filter((i) => i.flagParado)
    .sort((a, b) => (a.flagParado.startsWith("PARADO") ? 0 : 1) - (b.flagParado.startsWith("PARADO") ? 0 : 1) || b.qtestdias - a.qtestdias);
  const revisar = ativos.filter((i) => i.flagRevisar).sort((a, b) => (a.secao || "").localeCompare(b.secao || ""));
  const pedidosAtrasadosLista = ativos.filter((i) => i.pedidoAtrasado).sort((a, b) => (a.dtprevent && b.dtprevent ? a.dtprevent - b.dtprevent : 0));
  const hasDepositos = filiais.some((f) => isDeposito(f));

  return { format: "format2", hasFL, valueCol, multiFilial, filiais, hasDepositos, kpis, priorityDist, perFilial,
    ruptura, transferencia, parado, revisar, pedidosAtrasadosLista, foraDeLinha: fl };
}

function analyzeWorkbookRows(rows, headers, reportDateStr) {
  const reportDate = new Date(reportDateStr + "T00:00:00");
  const fmt = detectFormat(headers);
  if (fmt === "format1") return analyzeFormat1(rows, headers, reportDate);
  if (fmt === "format2") return analyzeFormat2(rows, headers, reportDate);
  return null;
}

/* ---------------------------------------------------------------------
   PLANO DE ACAO - builds a short prioritized action list from a result,
   mirroring the "Plano de Acao" sheet pattern used in the xlsx builds.
   --------------------------------------------------------------------- */
function buildPlanoDeAcao(result) {
  const items = [];
  const k = result.kpis;
  if (result.format === "format1") {
    if (k.rupturaCritica > 0) items.push({ prioridade: "1-URGENTE", achado: `${k.rupturaCritica} itens em ruptura critica (estoque disponivel zerado, com venda no periodo)`, acao: "Confirmar pedido de compra hoje; verificar se ja existe pedido em aberto antes de duplicar.", qtd: k.rupturaCritica, prazo: "Hoje", tabKey: "ruptura" });
    if (k.rupturaAtencao > 0) items.push({ prioridade: "2-ALTA", achado: `${k.rupturaAtencao} itens com estoque total zerado e ainda com venda recente`, acao: "Priorizar na proxima requisicao; risco de ruptura critica se nao for reposto.", qtd: k.rupturaAtencao, prazo: "Ate 2 dias", tabKey: "ruptura" });
    if (k.transferencia > 0) items.push({ prioridade: "2-ALTA", achado: `${k.transferencia} itens tem estoque suficiente em outras filiais para cobrir a necessidade`, acao: "Avaliar transferencia entre filiais antes de gerar novo pedido de compra.", qtd: k.transferencia, prazo: "Ate 3 dias", tabKey: "transferencia" });
    if (k.parado > 0) items.push({ prioridade: "3-REVISAR", achado: `${k.parado} itens parados ha mais de 30 dias sem venda`, acao: "Revisar necessidade de compra futura; avaliar acao comercial (promocao, devolucao ao fornecedor).", qtd: k.parado, prazo: "Ate 7 dias", tabKey: "parado" });
    if (k.lento > 0) items.push({ prioridade: "3-REVISAR", achado: `${k.lento} itens com giro lento (15 a 30 dias sem venda)`, acao: "Monitorar; reduzir quantidade da proxima requisicao se o padrao persistir.", qtd: k.lento, prazo: "Ate 7 dias", tabKey: "parado" });
    if (k.fl > 0) items.push({ prioridade: "N/A", achado: `${k.fl} itens fora de linha (FL) identificados no arquivo`, acao: "Excluidos automaticamente de sugestao de compra e transferencia, conforme regra vigente.", qtd: k.fl, prazo: "-", tabKey: "fl" });
  } else {
    if (k.rupturaCritica > 0) items.push({ prioridade: "1-URGENTE", achado: `${k.rupturaCritica} itens em ruptura critica (sem estoque disponivel, com venda nos ultimos 3 meses)`, acao: "Verificar pedido em aberto e avaliar transferencia antes de comprar; se nao houver origem, comprar com urgencia.", qtd: k.rupturaCritica, prazo: "Hoje", tabKey: "ruptura" });
    if (k.divergencia > 0) items.push({ prioridade: "2-ALTA", achado: `${k.divergencia} itens com estoque disponivel negativo (divergencia de cadastro/inventario)`, acao: "Investigar causa (pedido pendente de baixa, erro de inventario) junto ao setor responsavel.", qtd: k.divergencia, prazo: "Ate 2 dias", tabKey: "ruptura" });
    if (k.pedidosAtrasados > 0) items.push({ prioridade: "2-ALTA", achado: `${k.pedidosAtrasados} pedidos de compra com previsao de chegada vencida`, acao: "Contatar fornecedor/comprador para atualizar previsao ou cobrar entrega.", qtd: k.pedidosAtrasados, prazo: "Ate 2 dias", tabKey: "atrasados" });
    if (k.transferencia > 0) items.push({ prioridade: "2-ALTA", achado: `${k.transferencia} itens sem estoque disponivel tem saldo em outra(s) filial(is)`, acao: "Avaliar transferencia entre filiais como alternativa mais rapida que compra.", qtd: k.transferencia, prazo: "Ate 3 dias", tabKey: "transferencia" });
    if (k.parado > 0) items.push({ prioridade: "3-MEDIA", achado: `${k.parado} itens parados sem nenhuma venda nos ultimos 3 meses`, acao: "Avaliar acao comercial ou reducao de compra; considerar devolucao ao fornecedor se aplicavel.", qtd: k.parado, prazo: "Ate 7 dias", tabKey: "parado" });
    if (k.lento > 0) items.push({ prioridade: "3-MEDIA", achado: `${k.lento} itens com cobertura de estoque acima de 60 dias`, acao: "Reduzir quantidade das proximas compras ate normalizar a cobertura.", qtd: k.lento, prazo: "Ate 7 dias", tabKey: "parado" });
    if (k.revisarStatus > 0) items.push({ prioridade: "4-REVISAR STATUS", achado: `${k.revisarStatus} itens sem estoque e sem venda no periodo${result.multiFilial ? " (nesta filial)" : ""}`, acao: "Revisar se o item deve continuar ativo nesta secao/filial; considerar marcar como fora de linha.", qtd: k.revisarStatus, prazo: "Ate 15 dias", tabKey: "revisar" });
    if (k.fl > 0) items.push({ prioridade: "N/A", achado: `${k.fl} itens fora de linha (FL) identificados no arquivo`, acao: "Excluidos automaticamente de sugestao de compra e transferencia, conforme regra vigente.", qtd: k.fl, prazo: "-", tabKey: "fl" });
  }
  if (k.hasValueData && k.valorParadoTotal) {
    items.unshift({ prioridade: "2-ALTA", achado: `Estoque parado/lento representa aproximadamente ${formatCurrency(k.valorParadoTotal)} em valor imobilizado`, acao: "Priorizar reducao via aumento de venda (promocao/exposicao) ou reducao das proximas compras.", qtd: null, prazo: "Ate 7 dias", tabKey: "parado" });
  }
  const order = { "1-URGENTE": 0, "2-ALTA": 1, "3-REVISAR": 2, "3-MEDIA": 2, "4-REVISAR STATUS": 3, "N/A": 9 };
  items.sort((a, b) => (order[a.prioridade] ?? 5) - (order[b.prioridade] ?? 5));
  return items;
}

function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}
function formatNum(v) {
  return new Intl.NumberFormat("pt-BR").format(Math.round((v + Number.EPSILON) * 100) / 100);
}
function formatDate(d) {
  if (!d) return "-";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
const STATE = (function loadInitialState() {
  const el = document.getElementById("app-state");
  let parsed = null;
  try { parsed = JSON.parse(el.textContent); } catch (e) { parsed = null; }
  return parsed || { history: [], currentId: null };
})();

let ARTIFACT_NS = null;
let IS_READONLY = false;
let ACTIVE_TAB = "ruptura";
let ROW_FILTER = "";
let HISTORY_SEARCH = "";
let TABLE_FULLSCREEN = false;
let ESCAPE_KEY_WIRED = false;
let CHANGELOG_OPEN = false;
let CHANGELOG_UNLOCKED = false;
let CHANGELOG_ERROR = false;

function currentEntry() {
  return STATE.history.find((h) => h.id === STATE.currentId) || null;
}

/* ---------------------------------------------------------------------
   FULL DOCUMENT TEMPLATE - reads back the page's own <style>/<script>
   tags (never the mutated live DOM) so a republish always reproduces
   the same canonical source, only the embedded state JSON changes.
   --------------------------------------------------------------------- */
const HEAD_EXTRA =
  '<title>Comercial WT \u2014 Painel de Analise</title>\n' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">\n' +
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></' + 'script>';

function buildFullDocument(state) {
  const css = document.getElementById("app-style").textContent;
  const js = document.getElementById("app-script").textContent;
  const stateJson = JSON.stringify(state).replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");
  return "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
    HEAD_EXTRA +
    "\n<style id=\"app-style\">" + css + "</style>\n</head>\n<body>\n<div id=\"app\"></div>\n" +
    "<script id=\"app-state\" type=\"application/json\">" + stateJson + "</" + "script>\n" +
    "<script id=\"app-script\">" + js + "</" + "script>\n</body>\n</html>";
}

async function persist() {
  if (!ARTIFACT_NS || IS_READONLY) return { ok: false, skipped: true };
  const doc = buildFullDocument(STATE);
  try {
    await ARTIFACT_NS.publish(doc);
    return { ok: true };
  } catch (err) {
    const code = err && err.code;
    if (code === "conflict") {
      showToast("Alguem publicou uma atualizacao ao mesmo tempo. Recarregando com a versao mais recente...");
      setTimeout(() => location.reload(), 1200);
      return { ok: false, code };
    }
    if (code === "not_writer" || code === "not_granted") {
      IS_READONLY = true;
      showToast("Este link e somente leitura para voce.");
      render();
      return { ok: false, code };
    }
    console.error("publish failed", err);
    showToast("Nao foi possivel salvar. Tente novamente.");
    return { ok: false, code: code || "unknown" };
  }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("toast--visible");
  clearTimeout(showToast._h);
  showToast._h = setTimeout(() => t.classList.remove("toast--visible"), 4200);
}

/* ---------------------------------------------------------------------
   BADGES / FORMAT LABELS
   --------------------------------------------------------------------- */
function sevClass(flag) {
  if (!flag) return "sev-ok";
  const f = String(flag).toUpperCase();
  if (f.includes("CRITICO") || f.includes("NEGATIVO") || f.includes("URGENTE")) return "sev-critical";
  if (f.includes("ATENCAO") || f.includes("ATRASADO") || f.includes("2-ALTA")) return "sev-high";
  if (f.includes("PARADO")) return "sev-medium";
  if (f.includes("LENTO") || f.includes("MEDIA") || f.includes("REVISAR")) return "sev-medium";
  if (f.includes("TRANSFEREN")) return "sev-info";
  if (f.includes("FORA DE LINHA") || f === "N/A") return "sev-fl";
  if (f.includes("SEM MOVIMENTO")) return "sev-neutral";
  if (f.includes("NORMAL")) return "sev-ok";
  return "sev-neutral";
}
function badge(text) {
  if (!text) return "";
  return `<span class="badge ${sevClass(text)}">${esc(text)}</span>`;
}
function formatLabel(fmt) {
  return fmt === "format1" ? "Sugestão de Compra" : fmt === "format2" ? "Posição de Estoque / Giro" : "Formato não reconhecido";
}

/* ---------------------------------------------------------------------
   TAB DEFINITIONS - columns are render(row) => escaped/html string
   --------------------------------------------------------------------- */
function buildTabs(result) {
  const tabs = [];
  if (result.format === "format1") {
    tabs.push({ key: "ruptura", label: `Ruptura (${result.ruptura.length})`, rows: result.ruptura, columns: [
      { label: "Código", render: (r) => esc(r.codprod) },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Fornecedor", render: (r) => esc(r.fornecedor) },
      { label: "Situação", render: (r) => badge(r.flagRuptura) },
      { label: "Qt. Estoque", render: (r) => formatNum(r.qtest) },
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
      { label: "Vendas (período)", render: (r) => formatNum(r.vendas) },
      { label: "Giro médio", render: (r) => formatNum(r.giromedio) },
      { label: "Estoque outras filiais", render: (r) => formatNum(r.estoqueOutras) },
    ]});
    tabs.push({ key: "sugestao", label: `Sugestão de Compra (${result.sugestaoCompra.length})`, rows: result.sugestaoCompra, columns: [
      { label: "Prioridade", render: (r) => badge(r.prioridade) },
      { label: "Código", render: (r) => esc(r.codprod) },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Fornecedor", render: (r) => esc(r.fornecedor) },
      { label: "Qtd. sugerida (cx)", render: (r) => formatNum(r.qtdereq) },
      { label: "Dias cobertura", render: (r) => formatNum(r.qtdiascx) },
      { label: "Já tem pedido?", render: (r) => (r.numped ? "Sim" : "Não") },
      { label: "Giro médio", render: (r) => formatNum(r.giromedio) },
    ]});
    tabs.push({ key: "parado", label: `Estoque Parado (${result.parado.length})`, rows: result.parado, columns: [
      { label: "Código", render: (r) => esc(r.codprod) },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Fornecedor", render: (r) => esc(r.fornecedor) },
      { label: "Situação", render: (r) => badge(r.flagParado) },
      { label: "Dias sem venda", render: (r) => (r.diasSemVenda ?? "-") },
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
      { label: "Estoque outras filiais", render: (r) => formatNum(r.estoqueOutras) },
    ]});
    tabs.push({ key: "transferencia", label: `Transferência (${result.transferencia.length})`, rows: result.transferencia, columns: [
      { label: "Código", render: (r) => esc(r.codprod) },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Fornecedor", render: (r) => esc(r.fornecedor) },
      { label: "Qtd. sugerida (cx)", render: (r) => formatNum(r.qtdereq) },
      { label: "Estoque outras filiais", render: (r) => formatNum(r.estoqueOutras) },
      { label: "Giro médio", render: (r) => formatNum(r.giromedio) },
    ]});
    if (result.hasStatus && result.foraDeLinha.length) tabs.push({ key: "fl", label: `Fora de Linha (${result.foraDeLinha.length})`, rows: result.foraDeLinha, columns: [
      { label: "Código", render: (r) => esc(r.codprod) },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Fornecedor", render: (r) => esc(r.fornecedor) },
      { label: "Qt. Estoque", render: (r) => formatNum(r.qtest) },
      { label: "Última venda", render: (r) => formatDate(r.ultimaVenda) },
    ]});
  } else if (result.format === "format2") {
    const filialCol = result.multiFilial ? [{ label: "Filial", render: (r) => esc(filialLabel(r.filial)) }] : [];
    tabs.push({ key: "ruptura", label: `Ruptura / Divergências (${result.ruptura.length})`, rows: result.ruptura, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Situação", render: (r) => badge(r.flagRuptura || r.flagDivergencia) },
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
      { label: "Vendas (3m)", render: (r) => formatNum(r.vendas) },
      { label: "Giro médio", render: (r) => formatNum(r.giromedio) },
      { label: "Estoque outras filiais", render: (r) => formatNum(r.estoqueOutras) },
    ]});
    tabs.push({ key: "transferencia", label: `Transferência (${result.transferencia.length})`, rows: result.transferencia, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
      { label: "Estoque outras filiais", render: (r) => formatNum(r.estoqueOutras) },
      { label: "Origem sugerida", render: (r) => (r.origemSugerida ? `${esc(filialLabel(r.origemSugerida.filial))} · ${formatNum(r.origemSugerida.qtd)} · <span class="muted">${esc(r.origemSugerida.distancia)}</span>` : "-") },
    ]});
    tabs.push({ key: "parado", label: `Parado / Lento (${result.parado.length})`, rows: result.parado, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Situação", render: (r) => badge(r.flagParado) + (
          r.vendaEstimadaMesAtual != null
            ? ` <span class="muted" title="Sem venda nos 3 meses anteriores, mas classificado a partir da venda do mês atual (estimativa: ${formatNum(r.vendaEstimadaMesAtual)}/mês) — provável cadastro novo ou item que estava em falta.">(estimado)</span>`
            : r.giromedioInconsistente
              ? ` <span class="muted" title="Giro médio do arquivo (${formatNum(r.giromedio)}/dia) não bate com a venda fechada dos 3 meses anteriores (${formatNum(r.giroMedioCalculado)}/dia calculado) — usada a venda fechada real em vez do giro do arquivo.">(corrigido)</span>`
              : ""
        ) },
      { label: "Vendas (3m)", render: (r) => formatNum(r.vendas) },
      { label: "Cobertura (dias)", render: (r) => {
          if (r.vendaEstimadaMesAtual != null) return `${formatNum(Math.round(r.qtestdiasParaStatus))} <span class="muted" title="Recalculado a partir da venda estimada do mês atual — o QTESTDIAS do arquivo (${formatNum(r.qtestdias)}) parte do giro dos 3 meses anteriores, que este item não tem.">(estimado)</span>`;
          if (r.giromedioInconsistente) return `${formatNum(Math.round(r.qtestdiasParaStatus))} <span class="muted" title="Recalculado a partir da venda fechada real dos 3 meses anteriores — o QTESTDIAS do arquivo (${formatNum(r.qtestdias)}) parte de um giro médio (${formatNum(r.giromedio)}/dia) que não bate com essa venda.">(corrigido)</span>`;
          return formatNum(r.qtestdias);
        } },
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
    ]});
    tabs.push({ key: "revisar", label: `Revisar Status (${result.revisar.length})`, rows: result.revisar, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Categoria", render: (r) => esc(r.categoria) },
      { label: "Situação", render: (r) => badge(r.flagRevisar) },
    ]});
    if (result.pedidosAtrasadosLista && result.pedidosAtrasadosLista.length) tabs.push({ key: "atrasados", label: `Pedidos Atrasados (${result.pedidosAtrasadosLista.length})`, rows: result.pedidosAtrasadosLista, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Qt. Pedida", render: (r) => formatNum(r.qtpedida) },
      { label: "Previsão de chegada", render: (r) => formatDate(r.dtprevent) },
      { label: "Qt. Disponível", render: (r) => formatNum(r.qtdisp) },
    ]});
    if (result.hasFL && result.foraDeLinha.length) tabs.push({ key: "fl", label: `Fora de Linha (${result.foraDeLinha.length})`, rows: result.foraDeLinha, columns: [
      { label: "Código", render: (r) => esc(r.codigo || "-") },
      { label: "Descrição", render: (r) => esc(r.descricao) },
      { label: "Seção", render: (r) => esc(r.secao) },
      ...filialCol,
      { label: "Categoria", render: (r) => esc(r.categoria) },
    ]});
  }
  return tabs;
}

/* ---------------------------------------------------------------------
   RENDER
   --------------------------------------------------------------------- */
function kpiCard(label, value, sev, tabKey) {
  const clickable = !!tabKey;
  return `<div class="kpi-card kpi-card--${sev || "neutral"} ${clickable ? "kpi-card--clickable goto-tab" : ""}" ${clickable ? `data-tab="${esc(tabKey)}" role="button" tabindex="0"` : ""}><span class="kpi-card__value">${value}</span><span class="kpi-card__label">${esc(label)}</span></div>`;
}

function renderKPIs(result) {
  const k = result.kpis;
  const cards = [];
  cards.push(kpiCard("Itens no arquivo", formatNum(k.total), "neutral"));
  if (result.format === "format1" || result.hasStatus || result.hasFL) cards.push(kpiCard("Itens ativos", formatNum(k.ativos), "ok"));
  if (result.format === "format1" && result.hasStatus) cards.push(kpiCard("Fora de linha", formatNum(k.fl), "fl", "fl"));
  if (result.format === "format2" && result.hasFL) cards.push(kpiCard("Fora de linha", formatNum(k.fl), "fl", "fl"));
  cards.push(kpiCard("Ruptura crítica", formatNum(k.rupturaCritica), "critical", "ruptura"));
  if (result.format === "format1") {
    cards.push(kpiCard("Ruptura - atenção", formatNum(k.rupturaAtencao), "high", "ruptura"));
    cards.push(kpiCard("Já com pedido aberto", formatNum(k.jaTemPedido), "info", "sugestao"));
    cards.push(kpiCard("Qtd. sugerida (caixas)", formatNum(k.qtdeSugeridaCaixas), "neutral", "sugestao"));
  } else {
    cards.push(kpiCard("Divergências (estoque negativo)", formatNum(k.divergencia), "high", "ruptura"));
    cards.push(kpiCard("Pedidos atrasados", formatNum(k.pedidosAtrasados), "high", "atrasados"));
    cards.push(kpiCard("Revisar status", formatNum(k.revisarStatus), "neutral", "revisar"));
  }
  cards.push(kpiCard("Transferência recomendada", formatNum(k.transferencia), "info", "transferencia"));
  cards.push(kpiCard("Parado", formatNum(k.parado), "medium", "parado"));
  cards.push(kpiCard("Lento", formatNum(k.lento), "medium", "parado"));
  let valueBlock = "";
  if (k.hasValueData && k.valorParadoTotal != null) {
    valueBlock = `<div class="value-callout"><strong>${formatCurrency(k.valorParadoTotal)}</strong> em valor de estoque parado/lento imobilizado — avaliar redução de compra ou ação para aumentar venda.</div>`;
  } else {
    valueBlock = `<div class="value-callout value-callout--muted">Dados de valor de estoque ainda não disponíveis neste relatório. Quando o Winthor passar a exportar valor por unidade/caixa, o impacto financeiro do excesso aparecerá aqui automaticamente.</div>`;
  }
  const depositoNote = (result.format === "format2" && result.hasDepositos) || (result.format === "format1" && result.deposito)
    ? `<div class="value-callout value-callout--muted">Filiais 3 e 5 são depósitos de abastecimento, não pontos de venda — não entram nos indicadores de parado/lento/revisar status. Sugestões de transferência priorizam a mesma cidade e, em seguida, a matriz (filial 1), que tem melhor estrutura logística.</div>`
    : "";
  return `<div class="kpi-grid">${cards.join("")}</div>${valueBlock}${depositoNote}`;
}

function renderPerFilial(result) {
  if (!result.multiFilial || !result.perFilial) return "";
  const naCell = `<td><span class="muted" title="Não aplicável — depósito de abastecimento, não é ponto de venda">—</span></td>`;
  const goCell = (val, tabKey, filialFilter) => `<td><span class="goto-tab filial-cell--clickable" role="button" tabindex="0" data-tab="${esc(tabKey)}" data-filter="${esc(filialFilter)}">${formatNum(val)}</span></td>`;
  const rows = result.perFilial.map((f) => {
    const filialFilter = `Filial ${f.filial}`;
    return `<tr><td>${esc(filialLabel(f.filial))}</td>${goCell(f.ruptura, "ruptura", filialFilter)}${goCell(f.divergencia, "ruptura", filialFilter)}${f.deposito ? naCell : goCell(f.parado, "parado", filialFilter)}${f.deposito ? naCell : goCell(f.lento, "parado", filialFilter)}${goCell(f.transferencia, "transferencia", filialFilter)}</tr>`;
  }).join("");
  const note = result.hasDepositos ? `<p class="muted table-note">— nas colunas Parado/Lento indica depósito de abastecimento, onde esse indicador não se aplica. Clique em um número para ver a lista filtrada por filial.</p>` : `<p class="muted table-note">Clique em um número para ver a lista filtrada por filial.</p>`;
  return `<div class="panel">
    <h3 class="panel__title">Indicadores por filial</h3>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>Filial</th><th>Ruptura</th><th>Divergência</th><th>Parado</th><th>Lento</th><th>Transferência</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${note}
  </div>`;
}

function renderPlano(result) {
  const items = buildPlanoDeAcao(result);
  if (!items.length) return `<div class="panel"><h3 class="panel__title">Plano de Ação</h3><p class="muted">Nenhum ponto prioritário identificado neste relatório.</p></div>`;
  const rows = items.map((it) => {
    const cls = "plano-row" + (it.tabKey ? " goto-tab plano-row--clickable" : "");
    const attrs = it.tabKey ? ` data-tab="${esc(it.tabKey)}" role="button" tabindex="0"` : "";
    return `<tr class="${cls}"${attrs}><td>${badge(it.prioridade)}</td><td>${esc(it.achado)}</td><td>${esc(it.acao)}</td><td>${it.qtd != null ? formatNum(it.qtd) : "-"}</td><td>${esc(it.prazo)}</td></tr>`;
  }).join("");
  return `<div class="panel">
    <h3 class="panel__title">Plano de Ação</h3>
    <p class="muted table-note">Clique em uma linha para ir direto à lista correspondente.</p>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>Prioridade</th><th>Achado</th><th>Ação recomendada</th><th>Itens</th><th>Prazo</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

function renderTable(tab) {
  const filter = ROW_FILTER.trim().toLowerCase();
  let rows = tab.rows;
  if (filter) {
    rows = rows.filter((r) => tab.columns.some((c) => String(c.render(r)).replace(/<[^>]+>/g, "").toLowerCase().includes(filter)));
  }
  const shown = rows.slice(0, 400);
  const head = tab.columns.map((c) => `<th>${esc(c.label)}</th>`).join("");
  const body = shown.map((r) => `<tr>${tab.columns.map((c) => `<td>${c.render(r)}</td>`).join("")}</tr>`).join("");
  const note = rows.length > shown.length ? `<p class="muted table-note">Mostrando ${shown.length} de ${rows.length} itens. Refine a busca para ver outros.</p>` : "";
  if (!rows.length) return `<p class="muted">Nenhum item encontrado${filter ? " para essa busca" : " nesta categoria"}.</p>`;
  return `<div class="table-scroll"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${note}`;
}

function renderDashboard(entry) {
  const result = entry.result;
  const tabs = buildTabs(result);
  if (!tabs.find((t) => t.key === ACTIVE_TAB)) ACTIVE_TAB = tabs[0] ? tabs[0].key : "";
  const tabButtons = tabs.map((t) => `<button class="tab-btn ${t.key === ACTIVE_TAB ? "tab-btn--active" : ""}" data-tab="${t.key}">${esc(t.label)}</button>`).join("");
  const activeTab = tabs.find((t) => t.key === ACTIVE_TAB);
  const tableHtml = activeTab ? renderTable(activeTab) : "";
  return `
    <div class="dash-header">
      <div>
        <h2 class="dash-title">${esc(historyDisplayLabel(entry))}</h2>
        <p class="dash-meta">${formatLabel(result.format)} · relatório de ${formatDate(new Date(entry.reportDate + "T00:00:00"))} · enviado em ${formatDate(new Date(entry.uploadedAt))}${result.multiFilial ? ` · ${result.filiais.length} filiais` : ""}</p>
      </div>
    </div>
    ${renderKPIs(result)}
    ${renderPerFilial(result)}
    ${renderPlano(result)}
    <div class="panel">
      <div class="tabs-bar">
        <div class="tabs">${tabButtons}</div>
        <div class="tabs-bar__actions">
          <input type="search" id="rowFilter" class="search-input" placeholder="Buscar nesta lista..." value="${esc(ROW_FILTER)}">
          <button class="btn btn--ghost" id="maximizeTable" type="button" title="Expandir tabela em tela cheia">⤢ Maximizar</button>
        </div>
      </div>
      <div id="tableHost">${tableHtml}</div>
    </div>
    <div class="fullscreen-overlay" id="tableFullscreen"${TABLE_FULLSCREEN ? "" : " hidden"}>
      <div class="fullscreen-panel">
        <div class="fullscreen-header">
          <div class="tabs">${tabButtons}</div>
          <div class="fullscreen-header__actions">
            <input type="search" id="rowFilterFullscreen" class="search-input" placeholder="Buscar nesta lista..." value="${esc(ROW_FILTER)}">
            <button class="btn btn--ghost" id="closeFullscreen" type="button">Fechar ✕</button>
          </div>
        </div>
        <div class="fullscreen-body" id="tableHostFullscreen">${tableHtml}</div>
      </div>
    </div>`;
}

function renderHistoryRail() {
  if (!STATE.history.length) return `<p class="muted history-empty">Nenhuma análise enviada ainda.</p>`;
  const term = HISTORY_SEARCH.trim().toLowerCase();
  let list = STATE.history;
  if (term) {
    list = list.filter((h) => {
      const reportDateFmt = h.reportDate ? formatDate(new Date(h.reportDate + "T00:00:00")) : "";
      const haystack = [h.comprador, h.fornecedor, h.reportDate, reportDateFmt].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }
  if (!list.length) return `<p class="muted history-empty">Nenhuma análise encontrada para essa busca.</p>`;
  const items = list.map((h) => `
    <button class="history-item ${h.id === STATE.currentId ? "history-item--active" : ""}" data-id="${h.id}">
      <span class="history-item__label">${esc(historyDisplayLabel(h))}</span>
      <span class="history-item__meta">${formatLabel(h.result.format)} · ${formatDate(new Date(h.uploadedAt))}</span>
    </button>`).join("");
  return items;
}

function renderUploadPanel() {
  return `
    <div class="panel upload-panel">
      <h3 class="panel__title">Nova análise</h3>
      <p class="muted">Envie o relatório exportado do Winthor (.xlsx). Formato, comprador, fornecedor, filial(is) e data são identificados automaticamente a partir do próprio arquivo.</p>
      <div class="dropzone" id="dropzone">
        <p><strong>Arraste o arquivo aqui</strong> ou clique para escolher</p>
        <input type="file" id="fileInput" accept=".xlsx" hidden>
      </div>
      <div id="uploadStatus" class="upload-status"></div>
    </div>`;
}

const THEME_OPTIONS = [
  { value: "system", label: "Automático (sistema)" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "warm", label: "Quente" },
  { value: "cold", label: "Frio" },
];
function getStoredTheme() {
  try { return localStorage.getItem("wt-theme") || "system"; } catch (e) { return "system"; }
}
function applyTheme(value) {
  if (value && value !== "system") document.documentElement.dataset.theme = value;
  else delete document.documentElement.dataset.theme;
}

function renderShell() {
  const entry = currentEntry();
  const currentTheme = getStoredTheme();
  const themeOptions = THEME_OPTIONS.map((t) => `<option value="${t.value}" ${t.value === currentTheme ? "selected" : ""}>${esc(t.label)}</option>`).join("");
  return `
    <header class="topbar">
      <div class="topbar__brand">
        <div class="logo-slot" title="Espaço reservado para o logo da empresa">Logo</div>
        <span class="topbar__mark">WT</span>
        <div>
          <h1>Otimização Comercial</h1>
          <p>Painel de análise Winthor</p>
        </div>
      </div>
      <div class="topbar__right">
        <select id="themeSelect" class="theme-select" title="Tema de cor">${themeOptions}</select>
        <div class="topbar__status" id="topbarStatus">${IS_READONLY ? '<span class="badge sev-neutral">Somente leitura</span>' : ""}</div>
      </div>
    </header>
    <div class="layout">
      <aside class="history-rail">
        <h3 class="history-rail__title">Histórico da equipe</h3>
        <input type="search" id="historySearch" class="search-input history-search" placeholder="Buscar por comprador, fornecedor ou data..." value="${esc(HISTORY_SEARCH)}">
        <div class="history-list">${renderHistoryRail()}</div>
      </aside>
      <main class="content">
        ${renderUploadPanel()}
        ${entry ? renderDashboard(entry) : `<div class="panel empty-state"><p class="muted">Envie um relatório acima para gerar KPIs, análises e plano de ação.</p></div>`}
      </main>
    </div>
    ${renderFooter()}
    ${renderChangelogModal()}
    <div id="toast" class="toast"></div>`;
}

function renderFooter() {
  return `<footer class="app-footer">
    <span class="app-footer__version">Versão do painel: <strong>${esc(BUILD_VERSION)}</strong></span>
    <button class="app-footer__link" id="openChangelog" type="button">Histórico de alterações</button>
  </footer>`;
}

function renderChangelogBody() {
  if (CHANGELOG_UNLOCKED) {
    return `<ul class="changelog-list">${CHANGELOG.map((c) => `<li><span class="changelog-date">${esc(c.date)}</span><span class="changelog-summary">${esc(c.summary)}</span></li>`).join("")}</ul>`;
  }
  return `
    <p class="muted">Esta área é restrita à equipe. Informe a senha para ver o histórico de alterações do painel.</p>
    <div class="changelog-auth">
      <input type="password" id="changelogPassword" class="search-input" placeholder="Senha" autocomplete="off">
      <button class="btn btn--primary" id="submitChangelogPassword" type="button">Entrar</button>
    </div>
    ${CHANGELOG_ERROR ? `<p class="changelog-error">Senha incorreta. Tente novamente.</p>` : ""}`;
}

function renderChangelogModal() {
  return `<div class="modal-overlay" id="changelogModal"${CHANGELOG_OPEN ? "" : " hidden"}>
    <div class="modal-panel modal-panel--small">
      <div class="modal-header">
        <h3>Histórico de alterações</h3>
        <button class="btn btn--ghost" id="closeChangelog" type="button">Fechar ✕</button>
      </div>
      <div class="modal-body" id="changelogBody">${renderChangelogBody()}</div>
    </div>
  </div>`;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = renderShell();
  wireEvents();
}

/* ---------------------------------------------------------------------
   EVENTS / UPLOAD FLOW
   --------------------------------------------------------------------- */
function wireChangelogAuth() {
  const pwInput = document.getElementById("changelogPassword");
  const submitBtn = document.getElementById("submitChangelogPassword");
  if (!pwInput || !submitBtn) return;
  const tryUnlock = () => {
    if (pwInput.value === CHANGELOG_PASSWORD) {
      CHANGELOG_UNLOCKED = true;
      CHANGELOG_ERROR = false;
    } else {
      CHANGELOG_ERROR = true;
    }
    const body = document.getElementById("changelogBody");
    if (body) body.innerHTML = renderChangelogBody();
    wireChangelogAuth();
  };
  submitBtn.addEventListener("click", tryUnlock);
  pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tryUnlock(); } });
}

function wireHistoryItems() {
  document.querySelectorAll(".history-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      STATE.currentId = btn.dataset.id;
      ACTIVE_TAB = null;
      ROW_FILTER = "";
      TABLE_FULLSCREEN = false;
      render();
    });
  });
}

function wireEvents() {
  const dz = document.getElementById("dropzone");
  const fi = document.getElementById("fileInput");
  if (dz && fi) {
    dz.addEventListener("click", () => fi.click());
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dropzone--over"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("dropzone--over"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("dropzone--over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fi.addEventListener("change", () => { if (fi.files[0]) handleFile(fi.files[0]); });
  }
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => { ACTIVE_TAB = btn.dataset.tab; ROW_FILTER = ""; render(); });
  });
  const rf = document.getElementById("rowFilter");
  const rff = document.getElementById("rowFilterFullscreen");
  [rf, rff].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      ROW_FILTER = input.value;
      if (rf && rf !== input) rf.value = ROW_FILTER;
      if (rff && rff !== input) rff.value = ROW_FILTER;
      const tabs = buildTabs(currentEntry().result);
      const activeTab = tabs.find((t) => t.key === ACTIVE_TAB);
      const html = activeTab ? renderTable(activeTab) : "";
      const host = document.getElementById("tableHost");
      const hostFs = document.getElementById("tableHostFullscreen");
      if (host) host.innerHTML = html;
      if (hostFs) hostFs.innerHTML = html;
    });
  });
  const maximizeBtn = document.getElementById("maximizeTable");
  if (maximizeBtn) maximizeBtn.addEventListener("click", () => { TABLE_FULLSCREEN = true; render(); });
  const closeFsBtn = document.getElementById("closeFullscreen");
  if (closeFsBtn) closeFsBtn.addEventListener("click", () => { TABLE_FULLSCREEN = false; render(); });
  const overlay = document.getElementById("tableFullscreen");
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) { TABLE_FULLSCREEN = false; render(); } });
  if (!ESCAPE_KEY_WIRED) {
    ESCAPE_KEY_WIRED = true;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (TABLE_FULLSCREEN) { TABLE_FULLSCREEN = false; render(); }
      else if (CHANGELOG_OPEN) { CHANGELOG_OPEN = false; render(); }
    });
  }
  const openChangelogBtn = document.getElementById("openChangelog");
  if (openChangelogBtn) openChangelogBtn.addEventListener("click", () => { CHANGELOG_OPEN = true; CHANGELOG_ERROR = false; render(); });
  const closeChangelogBtn = document.getElementById("closeChangelog");
  if (closeChangelogBtn) closeChangelogBtn.addEventListener("click", () => { CHANGELOG_OPEN = false; render(); });
  const changelogModal = document.getElementById("changelogModal");
  if (changelogModal) changelogModal.addEventListener("click", (e) => { if (e.target === changelogModal) { CHANGELOG_OPEN = false; render(); } });
  wireChangelogAuth();
  wireHistoryItems();
  const historySearch = document.getElementById("historySearch");
  if (historySearch) {
    historySearch.addEventListener("input", () => {
      HISTORY_SEARCH = historySearch.value;
      const list = document.querySelector(".history-list");
      if (list) list.innerHTML = renderHistoryRail();
      wireHistoryItems();
    });
  }
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      const value = themeSelect.value;
      applyTheme(value);
      try { localStorage.setItem("wt-theme", value); } catch (e) {}
    });
  }
  document.querySelectorAll(".goto-tab").forEach((el) => {
    const go = () => {
      ACTIVE_TAB = el.dataset.tab;
      ROW_FILTER = el.dataset.filter || "";
      TABLE_FULLSCREEN = false;
      render();
      const panel = document.getElementById("tableHost");
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
}

let pendingFile = null;
function handleFile(file) {
  pendingFile = file;
  const dz = document.getElementById("dropzone");
  if (dz) dz.innerHTML = `<p><strong>${esc(file.name)}</strong> selecionado</p><button class="btn btn--primary" id="processBtn" type="button">Processar</button>`;
  document.getElementById("processBtn").addEventListener("click", processFile);
}

// Comprador/fornecedor/data do relatorio ja vem no proprio arquivo (nao
// precisa ser digitado): COMPRADOR/CODCOMPRADOR por linha, FORNECEDOR por
// linha (quando a coluna existe), e o fim do periodo em PERIODO_FILTRO
// ("DD/MM/AAAA A DD/MM/AAAA") como data do relatorio. Quando uma dessas
// colunas nao existe no arquivo (ex.: FORNECEDOR no Formato 2 atual, ou
// nenhuma pista de data), o campo correspondente fica vazio/usa o dia do
// upload como fallback, sem bloquear o envio.
function titleCaseName(s) {
  return String(s).trim().toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

// Nomes específicos que a equipe prefere ver encurtados no histórico (além
// do corte padrão para o primeiro nome), ex.: apelido usado no dia a dia.
// Chave em minúsculas, sem acento.
const COMPRADOR_APELIDOS = { "almifrancy": "Almi" };

// Histórico mostra só o primeiro nome do comprador (pedido da equipe,
// 31/08/26) — o nome completo continua salvo em h.comprador para a busca.
function shortComprador(nome) {
  const trimmed = String(nome || "").trim();
  if (!trimmed) return trimmed;
  if (/^Vários compradores$/i.test(trimmed) || /^Comprador\s/i.test(trimmed)) return trimmed;
  const primeiro = trimmed.split(/\s+/)[0];
  const apelido = COMPRADOR_APELIDOS[primeiro.toLowerCase()];
  return apelido || primeiro;
}

// Razão social do fornecedor costuma vir completa (ex.: "LUA NOVA INDUSTRIA
// E COMERCIO DE PRODUTOS ALIMENTICIOS LTDA"). No histórico, mostrar só o
// nome fantasia/comercial: corta no primeiro token que descreve o TIPO da
// empresa (industria, comercio, distribuidora/dist, forma juridica como
// LTDA/S.A. etc.) e mantém tudo antes dele (pedido da equipe, 31/08/26).
const EMPRESA_TIPO_KEYWORDS = new Set([
  "INDUSTRIA", "INDUSTRIAL", "IND",
  "COMERCIO", "COMERCIAL", "COM",
  "DISTRIBUIDORA", "DISTRIBUIDOR", "DIST",
  "IMPORTACAO", "IMPORTADORA", "IMP",
  "EXPORTACAO", "EXPORTADORA", "EXP",
  "ATACADO", "ATACADISTA",
  "REPRESENTACOES", "REPRESENTACAO", "REPRESENTANTE",
  "LTDA", "LIMITADA", "EIRELI", "EPP", "MEI", "ME", "SA", "S/A",
]);
function normalizeToken(tok) {
  return tok.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w/]/g, "").toUpperCase();
}
function shortFornecedorUm(nome) {
  const trimmed = String(nome || "").trim();
  if (!trimmed) return trimmed;
  const tokens = trimmed.split(/\s+/);
  const keep = [];
  for (const tok of tokens) {
    if (EMPRESA_TIPO_KEYWORDS.has(normalizeToken(tok))) break;
    keep.push(tok);
  }
  const result = keep.join(" ").trim();
  return result || trimmed;
}
function shortFornecedor(nome) {
  const trimmed = String(nome || "").trim();
  if (!trimmed || /^Vários fornecedores$/i.test(trimmed)) return trimmed;
  return trimmed.split(" / ").map(shortFornecedorUm).join(" / ");
}

// Reconstrói o texto exibido no histórico a partir dos campos estruturados
// (comprador/fornecedor/filial), aplicando os cortes de nome acima — em vez
// de usar h.label (string fixa salva no upload), para que entradas antigas
// também sejam exibidas encurtadas sem precisar reprocessar o arquivo.
function historyDisplayLabel(h) {
  if (h.comprador) {
    const parts = [shortComprador(h.comprador), shortFornecedor(h.fornecedor), h.filialLabel].filter(Boolean);
    if (parts.length) return parts.join(" - ");
  }
  return h.label;
}
function extractUploadMeta(rows, headers) {
  let comprador = "";
  if (headers.includes("COMPRADOR")) {
    const vals = Array.from(new Set(rows.map((r) => String(r.COMPRADOR ?? "").trim()).filter(Boolean)));
    if (vals.length === 1) comprador = titleCaseName(vals[0]);
    else if (vals.length > 1) comprador = "Vários compradores";
  } else if (headers.includes("CODCOMPRADOR")) {
    const vals = Array.from(new Set(rows.map((r) => r.CODCOMPRADOR).filter((v) => v !== null && v !== undefined && v !== "")));
    if (vals.length === 1) comprador = `Comprador ${vals[0]}`;
  }
  let fornecedor = "";
  if (headers.includes("FORNECEDOR")) {
    const vals = Array.from(new Set(rows.map((r) => String(r.FORNECEDOR ?? "").trim()).filter(Boolean)));
    if (vals.length === 1) fornecedor = vals[0];
    else if (vals.length > 1 && vals.length <= 3) fornecedor = vals.join(" / ");
    else if (vals.length > 3) fornecedor = "Vários fornecedores";
  }
  let reportDateStr = null;
  if (headers.includes("PERIODO_FILTRO")) {
    const raw = String(rows.find((r) => r.PERIODO_FILTRO)?.PERIODO_FILTRO ?? "");
    const m = raw.match(/(\d{2})\/(\d{2})\/(\d{4})\s*A\s*(\d{2})\/(\d{2})\/(\d{4})/i);
    if (m) reportDateStr = `${m[6]}-${m[5]}-${m[4]}`;
  }
  if (!reportDateStr) reportDateStr = new Date().toISOString().slice(0, 10);
  return { comprador, fornecedor, reportDateStr };
}
function deriveFilialLabel(result) {
  const ALL_FILIAIS = [1, 3, 4, 5, 6, 7];
  if (result.format === "format2") {
    const fs = (result.filiais || []).slice().sort((a, b) => a - b);
    if (!fs.length) return "";
    if (fs.length === ALL_FILIAIS.length && ALL_FILIAIS.every((f) => fs.includes(f))) return "Todas as filiais";
    if (fs.length === 1) return `Filial ${fs[0]}`;
    return `Filiais ${fs.join(", ")}`;
  }
  if (result.format === "format1" && result.ownFilial) return `Filial ${result.ownFilial}`;
  return "";
}

async function processFile() {
  if (!pendingFile) return;
  const statusEl = document.getElementById("uploadStatus");
  statusEl.textContent = "Lendo arquivo...";
  try {
    const buf = await pendingFile.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
    if (!rows.length) { statusEl.textContent = "Arquivo vazio ou sem dados reconhecíveis."; return; }
    const headers = Object.keys(rows[0]);
    const meta = extractUploadMeta(rows, headers);
    const result = analyzeWorkbookRows(rows, headers, meta.reportDateStr);
    if (!result) {
      statusEl.textContent = "Formato não reconhecido. Verifique se é um relatório de Sugestão de Compra ou Posição de Estoque/Giro do Winthor.";
      return;
    }
    const id = "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filialLabelStr = deriveFilialLabel(result);
    const labelParts = [meta.comprador, meta.fornecedor, filialLabelStr].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" - ") : pendingFile.name.replace(/\.xlsx$/i, "");
    const entry = { id, filename: pendingFile.name, comprador: meta.comprador, fornecedor: meta.fornecedor, filialLabel: filialLabelStr, label, reportDate: meta.reportDateStr, uploadedAt: new Date().toISOString(), result };
    STATE.history.unshift(entry);
    if (STATE.history.length > 12) STATE.history.length = 12;
    STATE.currentId = id;
    ACTIVE_TAB = null;
    ROW_FILTER = "";
    TABLE_FULLSCREEN = false;
    pendingFile = null;
    statusEl.textContent = "Salvando...";
    render();
    const res = await persist();
    const statusEl2 = document.getElementById("uploadStatus");
    if (statusEl2) statusEl2.textContent = res.ok ? "Análise gerada e salva no histórico da equipe." : (res.skipped ? "Análise gerada (histórico compartilhado indisponível nesta visualização)." : "");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Não foi possível processar o arquivo. Confirme que é um .xlsx exportado do Winthor.";
  }
}

/* ---------------------------------------------------------------------
   INIT
   --------------------------------------------------------------------- */
async function init() {
  render();
  if (window.claude && typeof window.claude.use === "function") {
    try {
      const ns = await window.claude.use("artifact");
      ARTIFACT_NS = ns;
    } catch (e) { ARTIFACT_NS = null; }
  }
}

// Apply any saved theme choice immediately (before first render) to avoid
// a flash of the default palette.
applyTheme(getStoredTheme());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
