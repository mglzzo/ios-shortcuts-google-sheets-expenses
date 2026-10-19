import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'
import {
  importarTransacoes,
  type ImportarTransacoesResponse,
  type TransacaoImportacao,
} from '../services/transactions'

interface LinhaPreview {
  data: string
  estabelecimento: string
  valor: string
  metodoPagamento: string
  categoria: string
  subcategoria: string
  parcelaAtual: string
  parcelaTotal: string
  observacao: string
}

interface LocationState {
  linhas?: LinhaPreview[]
  arquivo?: File
}

function converterData(data: string) {
  const valor = data.trim()

  if (!valor) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor
  }

  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`
  }

  return valor
}

function converterValor(valor: string) {
  const texto = valor
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .trim()

  if (!texto) {
    return 0
  }

  const negativo = texto.startsWith('-')
  const limpo = texto.replace(/-/g, '')

  let numero = 0

  if (limpo.includes(',') && limpo.includes('.')) {
    numero = Number(limpo.replace(/\./g, '').replace(',', '.'))
  } else if (limpo.includes(',')) {
    numero = Number(limpo.replace(',', '.'))
  } else {
    numero = Number(limpo)
  }

  return negativo ? -Math.abs(numero) : numero
}

export default function ConfirmarPlanilha() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LocationState | null

  const linhas = state?.linhas || []
  const arquivo = state?.arquivo

  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] =
    useState<ImportarTransacoesResponse | null>(null)
  const [erro, setErro] = useState('')

  const transacoes = useMemo<TransacaoImportacao[]>(() => {
    return linhas.map((linha) => ({
      data: converterData(linha.data),
      estabelecimento: linha.estabelecimento || '',
      valor: converterValor(linha.valor),
      metodoPagamento: linha.metodoPagamento || '',
      categoria: linha.categoria || '',
      observacao: linha.observacao || '',
    }))
  }, [linhas])

  if (!state || !linhas.length) {
    return (
      <div className="min-h-screen bg-[#f7f7f0] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#d9ded8] bg-white p-8 text-center shadow-sm">
          <FileSpreadsheet className="mx-auto mb-4 h-10 w-10 text-[#68736d]" />

          <h1 className="text-xl font-semibold text-[#10231c]">
            Nenhuma importação encontrada
          </h1>

          <p className="mt-2 text-sm text-[#68736d]">
            Volte para a configuração da planilha e tente novamente.
          </p>

          <button
            type="button"
            onClick={() => navigate('/conexoes/planilha')}
            className="mt-6 w-full rounded-xl bg-[#10231c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a3329]"
          >
            Voltar para planilha
          </button>
        </div>
      </div>
    )
  }

  async function handleImportar() {
    try {
      setImportando(true)
      setErro('')

      const resposta = await importarTransacoes(transacoes)

      setResultado(resposta)
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível importar as transações.',
      )
    } finally {
      setImportando(false)
    }
  }

  if (resultado) {
    return (
      <div className="min-h-screen bg-[#f7f7f0] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d8ff3e]">
              <CheckCircle2 className="h-6 w-6 text-[#10231c]" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-[#10231c] sm:text-3xl">
              Importação concluída
            </h1>

            <p className="mt-2 text-sm text-[#68736d]">
              Confira o resultado da importação da sua planilha.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
              <p className="text-sm text-[#68736d]">Total</p>
              <p className="mt-2 text-3xl font-semibold text-[#10231c]">
                {resultado.total}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
              <p className="text-sm text-[#68736d]">Inseridas</p>
              <p className="mt-2 text-3xl font-semibold text-[#10231c]">
                {resultado.inseridas}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
              <p className="text-sm text-[#68736d]">Ignoradas</p>
              <p className="mt-2 text-3xl font-semibold text-[#10231c]">
                {resultado.ignoradas}
              </p>
            </div>
          </div>

          {resultado.erros.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />

                <h2 className="font-semibold text-[#10231c]">
                  Registros com erro
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {resultado.erros.map((item, index) => (
                  <div
                    key={`${item.linha}-${index}`}
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-red-700">
                      Linha {item.linha}
                    </span>

                    <span className="ml-2 text-red-600">
                      {item.erro}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-xl bg-[#10231c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1a3329]"
            >
              Ir para o dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate('/conexoes/planilha')}
              className="flex-1 rounded-xl border border-[#cfd4ce] bg-white px-5 py-3.5 text-sm font-semibold text-[#10231c] transition hover:bg-[#f1f3ed]"
            >
              Importar outra planilha
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f0] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#68736d] transition hover:text-[#10231c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d8ff3e]">
            <Upload className="h-6 w-6 text-[#10231c]" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-[#10231c] sm:text-3xl">
            Confirmar importação
          </h1>

          <p className="mt-2 text-sm text-[#68736d]">
            Revise os dados antes de enviar as transações para o Finly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
            <p className="text-sm text-[#68736d]">Arquivo</p>

            <p className="mt-2 truncate font-semibold text-[#10231c]">
              {arquivo?.name || 'Planilha'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
            <p className="text-sm text-[#68736d]">Transações</p>

            <p className="mt-2 text-2xl font-semibold text-[#10231c]">
              {transacoes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9ded8] bg-white p-5">
            <p className="text-sm text-[#68736d]">Origem</p>

            <p className="mt-2 font-semibold text-[#10231c]">
              Planilha
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#d9ded8] bg-white">
          <div className="border-b border-[#e4e7e2] px-5 py-4">
            <h2 className="font-semibold text-[#10231c]">
              Dados que serão importados
            </h2>

            <p className="mt-1 text-sm text-[#68736d]">
              {transacoes.length} transações serão enviadas para sua conta.
            </p>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f1f3ed] text-[#68736d]">
                <tr>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">
                    Estabelecimento
                  </th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Método</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Observação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0eb]">
                {transacoes.map((transacao, index) => (
                  <tr key={index} className="text-[#10231c]">
                    <td className="whitespace-nowrap px-5 py-3">
                      {linhas[index].data}
                    </td>

                    <td className="max-w-[260px] truncate px-5 py-3">
                      {transacao.estabelecimento || '-'}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 font-medium">
                      {linhas[index].valor || '-'}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {transacao.metodoPagamento || '-'}
                    </td>

                    <td className="px-5 py-3">
                      {transacao.categoria || '-'}
                    </td>

                    <td className="max-w-[240px] truncate px-5 py-3 text-[#68736d]">
                      {transacao.observacao || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {erro && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={importando}
            className="rounded-xl border border-[#cfd4ce] bg-white px-6 py-3.5 text-sm font-semibold text-[#10231c] transition hover:bg-[#f1f3ed] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleImportar}
            disabled={importando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10231c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1a3329] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Importar transações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}