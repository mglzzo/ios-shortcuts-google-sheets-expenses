const ID_PLANILHA = "1T7N0q7aVitSWLr7xzvZPLB3Q2aWjngvaA8inHc1rkYo";
const NOME_ABA = "Lançamentos";

function doPost(e) {
  try {

    // ==========================================
    // 1. RECEBE OS DADOS DO POST
    // ==========================================

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nenhum dado foi recebido no POST.");
    }

    const dados = JSON.parse(e.postData.contents);

    // ==========================================
    // 2. ABRE A PLANILHA
    // ==========================================

    const planilha = SpreadsheetApp.openById(ID_PLANILHA);
    const aba = planilha.getSheetByName(NOME_ABA);

    if (!aba) {
      throw new Error(`A aba "${NOME_ABA}" não foi encontrada.`);
    }

    // ==========================================
    // 3. RECEBE OS CAMPOS
    // ==========================================

    const estabelecimento = dados.estabelecimento || "";
    const bancoCartao = dados.bancoCartao || "";
    const metodoPagamento = dados.metodoPagamento || "";
    const categoria = dados.categoria || "";
    const subcategoria = dados.subcategoria || "";
    const observacao = dados.observacao || "";

    // ==========================================
    // 4. CONVERTE O VALOR
    // ==========================================

    let valorTotal = dados.valor;

    if (typeof valorTotal === "string") {
      valorTotal = valorTotal
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
    }

    valorTotal = Number(valorTotal);

    if (isNaN(valorTotal) || valorTotal <= 0) {
      throw new Error("O valor informado é inválido.");
    }

    // ==========================================
    // 5. DEFINE O NÚMERO DE PARCELAS
    // ==========================================

    let parcelas = Number(dados.parcelas);

    if (isNaN(parcelas) || parcelas < 1) {
      parcelas = 1;
    }

    parcelas = Math.floor(parcelas);

    // ==========================================
    // 6. DEFINE A DATA INICIAL
    // ==========================================

    const dataInicial = parseData(dados.data);

    // ==========================================
    // 7. CALCULA O VALOR DE CADA PARCELA
    // ==========================================

    const valorParcela = valorTotal / parcelas;

    // ==========================================
    // 8. MONTA TODAS AS LINHAS
    // ==========================================

    const linhas = [];

    for (let i = 0; i < parcelas; i++) {

      const dataParcela = new Date(dataInicial);

      // Adiciona um mês para cada parcela
      dataParcela.setMonth(
        dataParcela.getMonth() + i
      );

      // Define o texto da parcela
      const parcelaTexto = parcelas > 1
        ? `${i + 1}/${parcelas}`
        : "À vista";

      linhas.push([
        dataParcela,
        estabelecimento,
        bancoCartao,
        metodoPagamento,
        categoria,
        subcategoria,
        valorParcela,
        parcelaTexto,
        observacao
      ]);
    }

    // ==========================================
    // 9. INSERE NOVAS LINHAS A PARTIR DA LINHA 2
    // ==========================================

    aba.insertRowsBefore(2, linhas.length);

    // ==========================================
    // 10. ESCREVE OS DADOS
    // ==========================================

    aba
      .getRange(
        2,
        1,
        linhas.length,
        9
      )
      .setValues(linhas);

    // ==========================================
    // 11. RETORNA SUCESSO
    // ==========================================

    return ContentService
      .createTextOutput(
        JSON.stringify({
          sucesso: true,
          mensagem: `${linhas.length} gasto(s) registrado(s) com sucesso.`,
          primeiraLinha: 2,
          ultimaLinha: 1 + linhas.length,
          parcelas: parcelas
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {

    // ==========================================
    // 12. RETORNA ERRO
    // ==========================================

    return ContentService
      .createTextOutput(
        JSON.stringify({
          sucesso: false,
          erro: erro.message
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// PARSER DE DATA — aceita DD-MM-YYYY, DD/MM/YYYY ou YYYY-MM-DD
// Se vier vazio ou em formato não reconhecido, usa a data/hora atual.
// ==========================================
function parseData(input) {
  if (!input) return new Date();
  const str = String(input).trim();

  // DD-MM-YYYY ou DD/MM/YYYY
  let m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0);
  }

  // YYYY-MM-DD (ISO)
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0);
  }

  const fallback = new Date(str + "T12:00:00");
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}