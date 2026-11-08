import ExcelJS from "exceljs";
import { Buffer } from "node:buffer";
import {obterOuCriarContaManual} from "./transaction.service.js";
import {
  buscarCategoriaIdPorNome,
} from "../../categorizar.js";
import {
  inserirTransacoesSemDuplicidade,
  type NovaTransacao,
} from "./transaction-deduplication.service.js";
export interface TransacaoImportada {
  data: string;
  estabelecimento: string;
  valor: number;
  metodoPagamento?: string;
  categoria?: string;
  observacao?: string;
  parcelaAtual?: number | string | null;
  parcelaTotal?: number | string | null;
}

export interface PreviewImportacao {
  colunasEncontradas: string[];
  totalLinhas: number;
  validas: number;
  invalidas: number;
  transacoes: TransacaoImportada[];
  erros: {
    linha: number;
    erro: string;
  }[];
}

interface MapaColunas {
  data: number;
  estabelecimento: number;
  valor: number;
  metodoPagamento?: number;
  categoria?: number;
  observacao?: number;
  parcelaAtual?: number;
  parcelaTotal?: number;
}

function formatarData(data: Date): string {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function valorCelulaParaString(
  valor: ExcelJS.CellValue
): string {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  if (
    typeof valor === "string" ||
    typeof valor === "number" ||
    typeof valor === "boolean"
  ) {
    return String(valor);
  }

  if (valor instanceof Date) {
    return formatarData(valor);
  }

  if (
    typeof valor === "object" &&
    "text" in valor
  ) {
    return String(valor.text);
  }

  if (
    typeof valor === "object" &&
    "result" in valor
  ) {
    return String(valor.result ?? "");
  }

  return String(valor);
}

function normalizarCabecalho(
  valor: string
): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizarValor(
  valor: ExcelJS.CellValue
): number {
  if (typeof valor === "number") {
    return valor;
  }

  const texto =
    valorCelulaParaString(valor)
      .replace("R$", "")
      .trim();

  if (!texto) {
    throw new Error("Valor não informado.");
  }

  let normalizado = texto;

  if (normalizado.includes(",")) {
    normalizado = normalizado
      .replace(/\./g, "")
      .replace(",", ".");
  }

  const numero = Number(normalizado);

  if (Number.isNaN(numero)) {
    throw new Error(
      `Valor inválido: ${texto}`
    );
  }

  return numero;
}

function normalizarData(
  valor: ExcelJS.CellValue
): string {
  if (valor instanceof Date) {
    return formatarData(valor);
  }

  const texto =
    valorCelulaParaString(valor).trim();

  if (!texto) {
    throw new Error("Data não informada.");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  const brasileiro = texto.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (brasileiro) {
    const [, dia, mes, ano] = brasileiro;

    return `${ano}-${mes}-${dia}`;
  }

  const brasileiroCurto = texto.match(
    /^(\d{2})\/(\d{2})\/(\d{2})$/
  );

  if (brasileiroCurto) {
    const [, dia, mes, ano] =
      brasileiroCurto;

    return `20${ano}-${mes}-${dia}`;
  }

  throw new Error(
    `Data inválida: ${texto}`
  );
}

function normalizarParcela(
  valor: unknown,
  nomeCampo: string
): number | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto =
    typeof valor === "number"
      ? String(valor)
      : valorCelulaParaString(
          valor as ExcelJS.CellValue
        ).trim();

  if (!texto) {
    return null;
  }

  const numero = Number(texto.replace(",", "."));

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 999
  ) {
    throw new Error(
      `${nomeCampo} inválida: ${texto}`
    );
  }

  return numero;
}

function validarParcelas(
  parcelaAtual: number | null,
  parcelaTotal: number | null
): void {
  if (
    parcelaAtual !== null &&
    parcelaTotal !== null &&
    parcelaAtual > parcelaTotal
  ) {
    throw new Error(
      `Parcela atual (${parcelaAtual}) maior que o total de parcelas (${parcelaTotal}).`
    );
  }
}

function criarMapaColunas(
  colunas: string[]
): Partial<MapaColunas> {
  const mapa: Partial<MapaColunas> = {};

  colunas.forEach((coluna, index) => {
    const nome = normalizarCabecalho(coluna);

    const numeroColuna = index + 1;

    if (
      nome === "data" ||
      nome === "data compra" ||
      nome === "data transacao"
    ) {
      mapa.data = numeroColuna;
    }

    if (
      nome === "estabelecimento" ||
      nome === "descricao" ||
      nome === "descricao transacao"
    ) {
      mapa.estabelecimento = numeroColuna;
    }

    if (
      nome === "valor" ||
      nome === "valor r$" ||
      nome === "valor transacao"
    ) {
      mapa.valor = numeroColuna;
    }

    if (
      nome === "metodo de pagamento" ||
      nome === "metodo pagamento" ||
      nome === "pagamento"
    ) {
      mapa.metodoPagamento = numeroColuna;
    }

    if (nome === "categoria") {
      mapa.categoria = numeroColuna;
    }

    if (
      nome === "observacao" ||
      nome === "observacoes"
    ) {
      mapa.observacao = numeroColuna;
    }

    if (
      nome === "parcela atual" ||
      nome === "parcela_atual" ||
      nome === "parcela"
    ) {
      mapa.parcelaAtual = numeroColuna;
    }

    if (
      nome === "parcela total" ||
      nome === "parcela_total" ||
      nome === "total de parcelas" ||
      nome === "total parcelas" ||
      nome === "parcelas"
    ) {
      mapa.parcelaTotal = numeroColuna;
    }
  });

  return mapa;
}

function validarColunasObrigatorias(
  mapa: Partial<MapaColunas>
): asserts mapa is MapaColunas {
  const faltando: string[] = [];

  if (!mapa.data) {
    faltando.push("Data");
  }

  if (!mapa.estabelecimento) {
    faltando.push("Estabelecimento");
  }

  if (!mapa.valor) {
    faltando.push("Valor");
  }

  if (faltando.length > 0) {
    throw new Error(
      `Colunas obrigatórias não encontradas: ${faltando.join(
        ", "
      )}`
    );
  }
}

export async function converterExcelParaPreview(
  arquivo: ArrayBuffer
): Promise<PreviewImportacao> {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(arquivo);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(
      "A planilha não possui nenhuma aba."
    );
  }

  const primeiraLinha = worksheet.getRow(1);

  const colunasEncontradas: string[] = [];

  primeiraLinha.eachCell((cell) => {
    colunasEncontradas.push(
      valorCelulaParaString(cell.value)
    );
  });

  const mapaColunas =
    criarMapaColunas(colunasEncontradas);

  validarColunasObrigatorias(
    mapaColunas
  );

  const transacoes: TransacaoImportada[] = [];

  const erros: {
    linha: number;
    erro: string;
  }[] = [];

  worksheet.eachRow((row, numeroLinha) => {
    if (numeroLinha === 1) {
      return;
    }

    try {
      const estabelecimento =
        valorCelulaParaString(
          row.getCell(
            mapaColunas.estabelecimento
          ).value
        ).trim();

      const dataBruta =
        row.getCell(
          mapaColunas.data
        ).value;

      const valorBruto =
        row.getCell(
          mapaColunas.valor
        ).value;

      if (
        !estabelecimento &&
        dataBruta === null &&
        valorBruto === null
      ) {
        return;
      }

      if (!estabelecimento) {
        throw new Error(
          "Estabelecimento não informado."
        );
      }

      const data =
        normalizarData(dataBruta);

      const valor =
        normalizarValor(valorBruto);

      const metodoPagamento =
        mapaColunas.metodoPagamento
          ? valorCelulaParaString(
              row.getCell(
                mapaColunas.metodoPagamento
              ).value
            ).trim()
          : null;

      const categoria =
        mapaColunas.categoria
          ? valorCelulaParaString(
              row.getCell(
                mapaColunas.categoria
              ).value
            ).trim()
          : null;

      const observacao =
        mapaColunas.observacao
          ? valorCelulaParaString(
              row.getCell(
                mapaColunas.observacao
              ).value
            ).trim()
          : null;

      const parcelaAtual = mapaColunas.parcelaAtual
        ? normalizarParcela(
            row.getCell(
              mapaColunas.parcelaAtual
            ).value,
            "Parcela atual"
          )
        : null;

      const parcelaTotal = mapaColunas.parcelaTotal
        ? normalizarParcela(
            row.getCell(
              mapaColunas.parcelaTotal
            ).value,
            "Total de parcelas"
          )
        : null;

      validarParcelas(parcelaAtual, parcelaTotal);

      transacoes.push({
  data,
  estabelecimento,
  valor,
  ...(metodoPagamento
    ? { metodoPagamento }
    : {}),
  ...(categoria
    ? { categoria }
    : {}),
  ...(observacao
    ? { observacao }
    : {}),
  ...(parcelaAtual !== null
    ? { parcelaAtual }
    : {}),
  ...(parcelaTotal !== null
    ? { parcelaTotal }
    : {}),
});
    } catch (error) {
      erros.push({
        linha: numeroLinha,
        erro:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      });
    }
  });

  return {
    colunasEncontradas,
    totalLinhas:
      transacoes.length + erros.length,
    validas: transacoes.length,
    invalidas: erros.length,
    transacoes,
    erros,
  };
}

export interface ResultadoImportacao {
  total: number;
  inseridas: number;
  ignoradas: number;
  erros: {
    linha: number;
    erro: string;
  }[];
}

export async function confirmarImportacao(
  usuarioId: string,
  transacoesImportadas: TransacaoImportada[]
): Promise<ResultadoImportacao> {
  if (!transacoesImportadas.length) {
    throw new Error(
      "Nenhuma transação enviada para importação."
    );
  }

  const contaId =
    await obterOuCriarContaManual(usuarioId);

  const erros: {
    linha: number;
    erro: string;
  }[] = [];

  const valoresParaInserir: NovaTransacao[] = [];

  for (
    let i = 0;
    i < transacoesImportadas.length;
    i++
  ) {
    const transacao = transacoesImportadas[i];

    if (!transacao) {
      continue;
    }

    try {
      if (!transacao.data) {
        throw new Error("Data não informada.");
      }

      if (!transacao.estabelecimento) {
        throw new Error(
          "Estabelecimento não informado."
        );
      }

      if (
        typeof transacao.valor !== "number" ||
        Number.isNaN(transacao.valor)
      ) {
        throw new Error("Valor inválido.");
      }

      let categoriaId: number | null = null;

      if (transacao.categoria) {
        categoriaId =
          await buscarCategoriaIdPorNome(
            transacao.categoria
          );

        if (!categoriaId) {
          throw new Error(
            `Categoria não encontrada: ${transacao.categoria}`
          );
        }
      }

      const parcelaAtual = normalizarParcela(
        transacao.parcelaAtual,
        "Parcela atual"
      );

      const parcelaTotal = normalizarParcela(
        transacao.parcelaTotal,
        "Total de parcelas"
      );

      validarParcelas(parcelaAtual, parcelaTotal);

      valoresParaInserir.push({
        contaId,
        data: transacao.data,
        estabelecimentoBruto:
          transacao.estabelecimento,
        valor: transacao.valor.toString(),
        metodoPagamento:
          transacao.metodoPagamento ?? "Não informado",
        categoriaId,
        observacao:
          transacao.observacao ?? null,
        parcelaAtual,
        parcelaTotal,
        origem: "manual",
      });
    } catch (error) {
      erros.push({
        linha: i + 2,
        erro:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      });
    }
  }

  const resultadoInsercao =
    await inserirTransacoesSemDuplicidade(
      valoresParaInserir
    );

  // "ignoradas" = linhas inválidas + linhas duplicadas
  return {
    total: transacoesImportadas.length,
    inseridas: resultadoInsercao.inseridas,
    ignoradas:
      erros.length + resultadoInsercao.ignoradas,
    erros,
  };
}