// =============================================
// CONFIGURAÇÃO
// =============================================
const ID_PLANILHA         = "ID_PLANILHA_AQUI";
const NOME_ABA            = "Lançamentos";
const NOME_ABA_DICIONARIO = "_Dicionario";
const PLUGGY_API_URL      = "https://api.pluggy.ai";

const COL_DATA      = 1;
const COL_DESCRICAO = 2;
const COL_BANCO     = 3;
const COL_METODO    = 4;
const COL_CATEGORIA = 5;
const COL_VALOR     = 7;
const COL_ID        = 10;

// =============================================
// APELIDOS DE ESTABELECIMENTO
// Chave: trecho que aparece no nome bruto (MAIÚSCULO)
// Valor: nome legível que vai pra planilha
// Adicione novos conforme aparecerem
// =============================================
const APELIDOS_ESTABELECIMENTO = {
  "IFD"             : "iFood",
  "IFOOD"           : "iFood",
  "UBER"            : "Uber",
  "RAPPI"           : "Rappi",
  "CLARO S A"       : "Claro",
  "CLARO"           : "Claro",
  "VIVO"            : "Vivo",
  "TIM"             : "TIM",
  "NETFLIX"         : "Netflix",
  "SPOTIFY"         : "Spotify",
  "AMAZON"          : "Amazon",
  "MERCADO PAGO"    : "Mercado Pago",
  "MERCADOLIVRE"    : "Mercado Livre",
  "NOSSO MERCADINHO": "Nosso Mercadinho",
  "NOVO SHOP"       : "Novo Shop",
  "DYLLE"           : "Dylle",
};

// =============================================
// PESSOAS CONHECIDAS (PIX para pessoas físicas)
// Chave: nome exato que vem do banco (MAIÚSCULO, sem acento)
// Valor: { apelido, categoria }
// =============================================
const PESSOAS_CONHECIDAS = {
  "YASMIM BEATRIZ DA SILVA LIMA"     : { apelido: "Yasmim amorzin",  categoria: "Lazer" },
  "MARIA EDUARDA DE CASTRO MOREIRA"  : { apelido: "Duda",    categoria: "Outros" },
  "DANIEL SANTOS SILVA"              : { apelido: "Daniel",  categoria: "Trevo" },
  "JULIA ALMEIDA FERREIRA BARBOSA"   : { apelido: "Julia",   categoria: "Outros" },
  "GABRIEL BERARDO MAZZO DOS SANTOS" : { apelido: "Gabriel", categoria: "Contas/Utilidades" },
};

// =============================================
// MAPEAMENTO DE CATEGORIAS PLUGGY → SUAS CATEGORIAS
// =============================================
const MAPA_CATEGORIAS = {
  "Food and Drink"  : "Mercado",
  "Supermarket"     : "Mercado",
  "Restaurants"     : "Lazer",
  "Ifood"           : "Lazer",
  "iFood"           : "Lazer",
  "Transport"       : "Transporte",
  "Uber"            : "Transporte",
  "Gas Station"     : "Transporte",
  "Health"          : "Saúde",
  "Pharmacy"        : "Saúde",
  "Education"       : "Educação",
  "Entertainment"   : "Lazer",
  "Shopping"        : "Vestuário",
  "Electronics"     : "Eletrônicos",
  "Utilities"       : "Contas/Utilidades",
  "Housing"         : "Moradia",
  "Rent"            : "Moradia",
  "Subscription"    : "Assinaturas",
  "Transfer"        : "Outros",
  "Payment"         : "Outros",
};

// =============================================
// LIMPEZA E NORMALIZAÇÃO DO ESTABELECIMENTO
// =============================================

function limparEstabelecimento(descricao) {
  if (!descricao) return "";

  // Remove prefixo de tipo de transação (ex: "Compra no débito|", "Transferência enviada|")
  let nome = descricao.includes("|") ? descricao.split("|").pop() : descricao;

  // Remove prefixos de operadora conhecidos
  nome = nome
    .replace(/^IFD\*/i, "IFD ")        // IFD*NOME → IFD NOME
    .replace(/^MP \*/i, "")            // MP *NOME → NOME
    .replace(/^CRD\*\d+\s*/i, "")     // CRD*67 024 389 → remove
    .replace(/^Uber UBER \*/i, "Uber ") // Uber UBER *TRIP → Uber TRIP
    .trim();

  // Substitui por apelido conhecido (busca por qualquer trecho no nome)
  const nomeUpper = nome.toUpperCase();
  for (const [chave, apelido] of Object.entries(APELIDOS_ESTABELECIMENTO)) {
    if (nomeUpper.includes(chave)) return apelido;
  }

  // Capitaliza corretamente (Primeira Letra De Cada Palavra)
  return nome.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function normalizarParaBusca(descricao) {
  if (!descricao) return "";
  let nome = descricao.includes("|") ? descricao.split("|").pop() : descricao;
  return nome
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\bLTDA\b|\bME\b|\bEIRELI\b|\bS\.?A\.?\b|\bCIA\b|\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =============================================
// INFERÊNCIA DO MÉTODO DE PAGAMENTO (PELA DESCRIÇÃO BRUTA)
// =============================================

function inferirMetodo(descricao) {
  if (!descricao) return null;
  const upper = descricao.toUpperCase();
  if (upper.includes("TRANSFERÊNCIA ENVIADA") || upper.includes("TRANSFERENCIA ENVIADA")) {
    return "PIX";
  }
  if (upper.includes("COMPRA NO DÉBITO") || upper.includes("COMPRA NO DEBITO")) {
    return "Débito";
  }
  if (upper.includes("COMPRA NO CRÉDITO") || upper.includes("COMPRA NO CREDITO")) {
    return "Crédito";
  }
  // Você pode adicionar outros padrões se necessário
  return null;
}

// =============================================
// CATEGORIZAÇÃO
// =============================================

function mapearCategoriaGenerica(categoriaPluggy) {
  for (const chave of Object.keys(MAPA_CATEGORIAS)) {
    if (categoriaPluggy.includes(chave)) return MAPA_CATEGORIAS[chave];
  }
  return "Outros";
}

function categorizarTransacao(tx, dicionarioEstabelecimentos) {
  const isPix = tx.paymentData?.paymentMethod === "PIX";
  const nomeNormalizado = normalizarParaBusca(tx.description || "");

  // 1. PIX para pessoa física conhecida
  if (isPix && PESSOAS_CONHECIDAS[nomeNormalizado]) {
    return PESSOAS_CONHECIDAS[nomeNormalizado].categoria;
  }

  // 2. Dicionário aprendido (coluna Categoria editada manualmente pelo usuário)
  if (dicionarioEstabelecimentos[nomeNormalizado]) {
    return dicionarioEstabelecimentos[nomeNormalizado];
  }

  // 3. Fuzzy match no dicionário aprendido
  const match = melhorMatchFuzzy(nomeNormalizado, dicionarioEstabelecimentos);
  if (match) return dicionarioEstabelecimentos[match];

  // 4. Apelido de estabelecimento → categoria derivada
  const nomeUpper = nomeNormalizado.toUpperCase();
  for (const [chave] of Object.entries(APELIDOS_ESTABELECIMENTO)) {
    if (nomeUpper.includes(chave)) {
      return mapearCategoriaGenerica(chave);
    }
  }

  // 5. Categoria genérica da Pluggy
  return mapearCategoriaGenerica(tx.category || "");
}

// =============================================
// ABA _DICIONARIO (aprendizado incremental)
// =============================================

function garantirAbaDicionario() {
  const planilha = SpreadsheetApp.openById(ID_PLANILHA);
  let aba = planilha.getSheetByName(NOME_ABA_DICIONARIO);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_DICIONARIO);
    aba.appendRow(["Estabelecimento Normalizado", "Categoria"]);
    aba.hideSheet();
  }
  return aba;
}

function carregarDicionarioEstabelecimentos() {
  const aba = garantirAbaDicionario();
  const ultima = aba.getLastRow();
  if (ultima < 2) return {};
  const dados = aba.getRange(2, 1, ultima - 1, 2).getValues();
  const dicionario = {};
  dados.forEach(([estabelecimento, categoria]) => {
    if (estabelecimento) dicionario[estabelecimento] = categoria;
  });
  return dicionario;
}

function salvarNoDicionario(estabelecimentoNormalizado, categoria) {
  if (!estabelecimentoNormalizado) return;
  const aba = garantirAbaDicionario();
  const ultima = aba.getLastRow();
  const dados = ultima >= 2 ? aba.getRange(2, 1, ultima - 1, 1).getValues() : [];
  for (let i = 0; i < dados.length; i++) {
    if (dados[i][0] === estabelecimentoNormalizado) {
      aba.getRange(i + 2, 2).setValue(categoria);
      return;
    }
  }
  aba.appendRow([estabelecimentoNormalizado, categoria]);
}

function similaridadeTokens(a, b) {
  const tokensA = new Set(a.split(" ").filter(Boolean));
  const tokensB = new Set(b.split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const intersecao = [...tokensA].filter(t => tokensB.has(t)).length;
  const uniao = new Set([...tokensA, ...tokensB]).size;
  return intersecao / uniao;
}

function melhorMatchFuzzy(nome, dicionario, limiar = 0.6) {
  let melhorChave = null;
  let melhorScore = 0;
  for (const chave in dicionario) {
    const score = similaridadeTokens(nome, chave);
    if (score > melhorScore) {
      melhorScore = score;
      melhorChave = chave;
    }
  }
  return melhorScore >= limiar ? melhorChave : null;
}

// =============================================
// APRENDIZADO INCREMENTAL: trigger de edição manual
// Rode criarTriggerOnEdit() UMA VEZ pelo editor
// =============================================

function onEditInstalavel(e) {
  const aba = e.range.getSheet();
  if (aba.getName() !== NOME_ABA) return;
  if (e.range.getColumn() !== COL_CATEGORIA) return;
  const linha = e.range.getRow();
  if (linha < 2) return;
  const descricao = aba.getRange(linha, COL_DESCRICAO).getValue();
  const novaCategoria = e.range.getValue();
  if (!novaCategoria) return;
  const nomeNormalizado = normalizarParaBusca(descricao);
  salvarNoDicionario(nomeNormalizado, novaCategoria);
}

function criarTriggerOnEdit() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "onEditInstalavel") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("onEditInstalavel")
    .forSpreadsheet(SpreadsheetApp.openById(ID_PLANILHA))
    .onEdit()
    .create();
  console.log("Trigger de onEdit instalável criado.");
}

// =============================================
// 1. PONTO DE ENTRADA: ATALHO DO IPHONE
// =============================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nenhum dado recebido no POST.");
    }

    const dados = JSON.parse(e.postData.contents);

    const estabelecimento = dados.estabelecimento || "";
    const bancoCartao     = dados.bancoCartao     || "Nubank";
    const metodoPagamento = dados.metodoPagamento || "Crédito";
    const categoria       = dados.categoria       || "";
    const subcategoria    = dados.subcategoria    || "";
    const observacao      = dados.observacao      || "";

    let valorTotal = dados.valor;
    if (typeof valorTotal === "string") {
      valorTotal = valorTotal
        .replace("R$", "").replace(/\s/g, "")
        .replace(/\./g, "").replace(",", ".");
    }
    valorTotal = Number(valorTotal);
    if (isNaN(valorTotal) || valorTotal <= 0) throw new Error("Valor inválido.");

    let parcelas = Math.floor(Number(dados.parcelas) || 1);
    if (parcelas < 1) parcelas = 1;

    const dataInicial  = parseData(dados.data);
    const valorParcela = valorTotal / parcelas;
    const linhas       = [];

    for (let i = 0; i < parcelas; i++) {
      const dataParcela = new Date(dataInicial);
      dataParcela.setMonth(dataParcela.getMonth() + i);
      const parcelaTexto = parcelas > 1 ? `${i + 1}/${parcelas}` : "À vista";
      linhas.push([
        dataParcela, estabelecimento, bancoCartao, metodoPagamento,
        categoria, subcategoria, valorParcela, parcelaTexto, observacao, ""
      ]);
    }

    inserirLinhas(linhas);

    return jsonOut({
      sucesso: true,
      mensagem: `${linhas.length} gasto(s) registrado(s) com sucesso.`,
      parcelas: parcelas
    });

  } catch (erro) {
    return jsonOut({ sucesso: false, erro: erro.message });
  }
}

// =============================================
// 2. SINCRONIZAÇÃO PRINCIPAL (Pluggy)
// =============================================

function sincronizarPluggy() {
  const props        = PropertiesService.getScriptProperties();
  const clientId     = props.getProperty("PLUGGY_CLIENT_ID");
  const clientSecret = props.getProperty("PLUGGY_CLIENT_SECRET");
  const itemId       = props.getProperty("PLUGGY_ITEM_ID");

  if (!clientId || !clientSecret || !itemId) {
    console.log("Credenciais não configuradas.");
    return;
  }

  const apiKey = obterApiKey(clientId, clientSecret);
  if (!apiKey) { console.log("Falha ao obter API key."); return; }

  const itemStatus = verificarItem(apiKey, itemId);
  if (itemStatus !== "READY" && itemStatus !== "UPDATED") {
    console.log(`Item não está pronto. Status: ${itemStatus}`);
    return;
  }

  const contas = buscarContas(apiKey, itemId);
  if (!contas || contas.length === 0) { console.log("Nenhuma conta encontrada."); return; }

  const idsExistentes            = obterIdsExistentes();
  const dicionarioEstabelecimentos = carregarDicionarioEstabelecimentos();

  const hoje          = new Date();
  const inicioJanela  = new Date(hoje);
  inicioJanela.setDate(inicioJanela.getDate() - 30);
  const from = inicioJanela.toISOString().split("T")[0];
  const to   = hoje.toISOString().split("T")[0];

  const linhasNovas = [];

  contas.forEach(conta => {
    const transacoes = buscarTransacoes(apiKey, conta.id, from, to);
    transacoes.forEach(tx => {
  if (idsExistentes.has(tx.id)) return;
  if (tx.amount >= 0) return; // só gastos

  const valor = Math.abs(tx.amount);
  const nomeClean = limparEstabelecimento(tx.description || "");
  const categoria = categorizarTransacao(tx, dicionarioEstabelecimentos);
  const banco = "Nubank";

  // Método padrão (inferido ou da Pluggy)
  const metodoInferido = inferirMetodo(tx.description);
  let metodo = metodoInferido || tx.paymentData?.paymentMethod || "Débito";

  // REGRA ESPECIAL: Uber → Ariele Crédito
  if (nomeClean === "Uber") {
    metodo = "Ariele Crédito";
  }

  linhasNovas.push([
    new Date(tx.date),
    nomeClean,
    banco,
    metodo,
    categoria,
    "",
    valor,
    "À vista",
    "",
    tx.id
  ]);
});
  });

  if (linhasNovas.length > 0) {
    inserirLinhas(linhasNovas);
    console.log(`${linhasNovas.length} transações inseridas.`);
  } else {
    console.log("Nenhuma transação nova.");
  }
}

// =============================================
// 3. HELPERS — PLUGGY API
// =============================================

function obterApiKey(clientId, clientSecret) {
  const resp = UrlFetchApp.fetch(`${PLUGGY_API_URL}/auth`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ clientId, clientSecret }),
    muteHttpExceptions: true
  });
  const status = resp.getResponseCode();
  console.log("Auth status:", status);
  if (status !== 200) { console.error("Erro auth:", resp.getContentText()); return null; }
  return JSON.parse(resp.getContentText()).apiKey || null;
}

function buscarContas(apiKey, itemId) {
  const url  = `${PLUGGY_API_URL}/accounts?itemId=${itemId}`;
  const resp = UrlFetchApp.fetch(url, {
    headers: { "X-API-KEY": apiKey },
    muteHttpExceptions: true
  });
  console.log("Status buscarContas:", resp.getResponseCode());
  const data = JSON.parse(resp.getContentText());
  return data.results || [];
}

function buscarTransacoes(apiKey, accountId, from, to) {
  let todas = [];
  let url   = `${PLUGGY_API_URL}/v2/transactions?accountId=${accountId}`;
  if (from) url += `&dateFrom=${from}`;
  if (to)   url += `&dateTo=${to}`;

  while (url) {
    const resp = UrlFetchApp.fetch(url, {
      headers: { "X-API-KEY": apiKey },
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) break;
    const data = JSON.parse(resp.getContentText());
    if (data.results?.length > 0) todas = todas.concat(data.results);
    url = data.next ? `${PLUGGY_API_URL}/v2/transactions${data.next}` : null;
  }
  return todas;
}

function verificarItem(apiKey, itemId) {
  const resp = UrlFetchApp.fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
    headers: { "X-API-KEY": apiKey },
    muteHttpExceptions: true
  });
  console.log("Status verificarItem:", resp.getResponseCode());
  if (resp.getResponseCode() !== 200) { console.error(resp.getContentText()); return null; }
  const data = JSON.parse(resp.getContentText());
  return data.status || data.item?.status || null;
}

// =============================================
// 4. HELPERS — PLANILHA
// =============================================

function inserirLinhas(linhas) {
  const aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(NOME_ABA);
  aba.insertRowsBefore(2, linhas.length);
  aba.getRange(2, 1, linhas.length, 10).setValues(linhas);
}

function obterIdsExistentes() {
  const aba    = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(NOME_ABA);
  const ultima = aba.getLastRow();
  if (ultima < 2) return new Set();
  const valores = aba.getRange(2, COL_ID, ultima - 1, 1).getValues();
  return new Set(valores.flat().filter(Boolean));
}

// =============================================
// 5. HELPERS — GERAIS
// =============================================

function parseData(input) {
  if (!input) return new Date();
  const str = String(input).trim();
  let m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  const fallback = new Date(str + "T12:00:00");
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// 6. TRIGGERS
// =============================================

function criarTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "sincronizarPluggy") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sincronizarPluggy")
    .timeBased().everyHours(6).create();
  console.log("Trigger criado: sincronizarPluggy a cada 6 horas.");
}

function verTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    console.log("Função:", t.getHandlerFunction());
    console.log("Próxima execução:", t.getNextExecutionTime());
  });
}

// =============================================
// 7. DEBUG / TESTES
// =============================================

function testarBuscarTodasTransacoes() {
  const props        = PropertiesService.getScriptProperties();
  const clientId     = props.getProperty("PLUGGY_CLIENT_ID");
  const clientSecret = props.getProperty("PLUGGY_CLIENT_SECRET");
  const itemId       = props.getProperty("PLUGGY_ITEM_ID");
  const apiKey       = obterApiKey(clientId, clientSecret);
  if (!apiKey) { console.log("API key não obtida."); return; }
  console.log("Status item:", verificarItem(apiKey, itemId));
  const contas = buscarContas(apiKey, itemId);
  console.log("Contas:", contas.length);
  contas.forEach(conta => {
    console.log("Conta:", conta.id, conta.type);
    const txs = buscarTransacoes(apiKey, conta.id);
    console.log("Transações:", txs.length);
    console.log(JSON.stringify(txs.slice(0, 3), null, 2));
  });
}

function debugItem() {
  const props        = PropertiesService.getScriptProperties();
  const clientId     = props.getProperty("PLUGGY_CLIENT_ID");
  const clientSecret = props.getProperty("PLUGGY_CLIENT_SECRET");
  const itemId       = props.getProperty("PLUGGY_ITEM_ID");
  const apiKey       = obterApiKey(clientId, clientSecret);
  const resp         = UrlFetchApp.fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
    headers: { "X-API-KEY": apiKey }, muteHttpExceptions: true
  });
  console.log("Status:", resp.getResponseCode());
  const data = JSON.parse(resp.getContentText());
  console.log(JSON.stringify(data, null, 2));
}

function debugContas() {
  const props        = PropertiesService.getScriptProperties();
  const clientId     = props.getProperty("PLUGGY_CLIENT_ID");
  const clientSecret = props.getProperty("PLUGGY_CLIENT_SECRET");
  const itemId       = props.getProperty("PLUGGY_ITEM_ID");
  const apiKey       = obterApiKey(clientId, clientSecret);
  const resp         = UrlFetchApp.fetch(`${PLUGGY_API_URL}/accounts?itemId=${itemId}`, {
    headers: { "X-API-KEY": apiKey }, muteHttpExceptions: true
  });
  console.log("Status:", resp.getResponseCode());
  console.log(JSON.stringify(JSON.parse(resp.getContentText()), null, 2));
}

function listarItems() {
  const props        = PropertiesService.getScriptProperties();
  const clientId     = props.getProperty("PLUGGY_CLIENT_ID");
  const clientSecret = props.getProperty("PLUGGY_CLIENT_SECRET");
  const apiKey       = obterApiKey(clientId, clientSecret);
  const resp         = UrlFetchApp.fetch(`${PLUGGY_API_URL}/items`, {
    headers: { "X-API-KEY": apiKey }, muteHttpExceptions: true
  });
  const data = JSON.parse(resp.getContentText());
  console.log(JSON.stringify(data.results?.map(i => ({
    id: i.id, connector: i.connector?.name, status: i.status
  })), null, 2));
}

// =============================================
// TESTE DE LIMPEZA DE NOMES (rode no editor pra validar)
// =============================================
function testarLimpezaNomes() {
  const casos = [
    "Compra no débito|IFD*NARDIN BURGER GOUR",
    "Compra no débito|Uber UBER *TRIP HELP.U",
    "Transferência enviada|CLARO S A",
    "Compra no débito|NOSSO MERCADINHO",
    "Compra no débito|MP *DYLLE",
    "Compra no débito|CRD*67 024 389 Edivone",
    "Compra no débito|NOVO SHOP RIBEIRAO PRE",
    "Transferência enviada|Julia Almeida Ferreira Barbosa Silva",
  ];
  casos.forEach(c => console.log(`"${c}" → "${limparEstabelecimento(c)}"`));
}

// =============================================
// TESTE DE INFERÊNCIA DE MÉTODO
// =============================================
function testarInferencia() {
  const exemplos = [
    "Transferência enviada|YASMIM BEATRIZ DA SILVA LIMA",
    "Compra no débito|IFD*NARDIN BURGER GOUR",
    "Compra no crédito|AMAZON PRIME",
    "Pagamento com cartão|UBER TRIP",
    "Compra no débito|NOSSO MERCADINHO"
  ];
  exemplos.forEach(d => {
    console.log(`"${d}" → método inferido: "${inferirMetodo(d)}"`);
  });
}