import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from 'lucide-react'
import {
  importarTransacoes,
  type TransacaoImportacao,
} from '../services/transicoes'
import { invalidarDashboardCache } from './dashboard'

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
  tipoImportacao?: 'entrada' | 'saida'
}


function converterData(data: string): string {
  const valor = data.trim()

  if (!valor) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor
  }

  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`
  }

  return valor
}


function converterValor(
  valor: string,
  tipoImportacao: 'entrada' | 'saida',
): number {
  const texto = valor
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .trim()

  if (!texto) {
    throw new Error('Existe uma transação sem valor na planilha.')
  }

 
  const negativoOriginal = texto.startsWith('-')
  const limpo = texto.replace(/[^\d.,]/g, '')

  let numero: number

  if (limpo.includes(',') && limpo.includes('.')) {
    
    numero = Number(limpo.replace(/\./g, '').replace(',', '.'))
  } else if (limpo.includes(',')) {
    
    numero = Number(limpo.replace(',', '.'))
  } else {
    
    numero = Number(limpo)
  }

  if (!Number.isFinite(numero)) {
    throw new Error(`Valor inválido na planilha: ${valor}`)
  }


  if (tipoImportacao === 'entrada') {
    return Math.abs(numero)
  }


  void negativoOriginal
  return -Math.abs(numero)
}

function converterNumeroOpcional(valor: string): number | null {
  const texto = valor?.trim()
  if (!texto) return null

  const numero = Number(texto)
  return Number.isInteger(numero) && numero > 0 ? numero : null
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function ConfirmarPlanilha() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const linhas = state?.linhas || []
  const arquivo = state?.arquivo


  const tipoSalvo =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('finly-tipo-importacao-planilha')
      : null

  const tipoImportacao: 'entrada' | 'saida' =
    state?.tipoImportacao === 'entrada' ||
    tipoSalvo === 'entrada' ||
    location.pathname.includes('confirmar-entradas')
      ? 'entrada'
      : 'saida'

  const [importando, setImportando] = useState(false)
  const [erro, setErro] = useState('')
  const importacaoEmAndamento = useRef(false)

  function voltarParaPreview() {
    navigate('/conexoes/planilha/preview', {
      state: {
        ...location.state,
        tipoImportacao,
      },
    })
  }

  const transacoes = useMemo<TransacaoImportacao[]>(() => {
    return linhas.map((linha) => ({
      data: converterData(linha.data || ''),
      estabelecimento: (linha.estabelecimento || '').trim(),
      valor: converterValor(linha.valor || '', tipoImportacao),
      metodoPagamento: (linha.metodoPagamento || '').trim(),
      categoria: (linha.categoria || '').trim().toLocaleUpperCase('pt-BR'),
      subcategoria: (linha.subcategoria || '').trim(),
      parcelaAtual: converterNumeroOpcional(linha.parcelaAtual || ''),
      parcelaTotal: converterNumeroOpcional(linha.parcelaTotal || ''),
      observacao: (linha.observacao || '').trim(),
    }))
  }, [linhas, tipoImportacao])

  if (!state || !linhas.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f0] px-6">
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
    if (importacaoEmAndamento.current || importando) return

    importacaoEmAndamento.current = true
    setImportando(true)
    setErro('')

    try {
      const resposta = await importarTransacoes(transacoes)
      invalidarDashboardCache()

      const tipoNotificacao =
        resposta.inseridas > 0
          ? resposta.ignoradas > 0
            ? 'warning'
            : 'success'
          : 'error'

      const mensagem =
        resposta.inseridas > 0
          ? resposta.ignoradas > 0
            ? `Importação parcial: ${resposta.inseridas} transação(ões) adicionada(s) e ${resposta.ignoradas} ignorada(s).`
            : `Planilha importada com sucesso! ${resposta.inseridas} transação(ões) adicionada(s).`
          : resposta.erros?.[0]?.erro || 'Nenhuma transação foi inserida.'

      sessionStorage.setItem(
        'finly-import-notification',
        JSON.stringify({ tipo: tipoNotificacao, mensagem }),
      )
      sessionStorage.setItem('finly-refresh-dashboard', 'true')
      sessionStorage.removeItem('finly-tipo-importacao-planilha')

      navigate('/dashboard', { replace: true })
    } catch (error) {
      invalidarDashboardCache()
      setErro(
        error instanceof Error
          ? `Não foi possível importar a planilha: ${error.message}`
          : 'Não foi possível importar a planilha. Tente novamente.',
      )
    } finally {
      importacaoEmAndamento.current = false
      setImportando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f0] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={voltarParaPreview}
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
            Confira os dados antes de enviar as transações para o Finly.
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
            <p className="text-sm text-[#68736d]">Tipo de importação</p>
            <p className="mt-2 font-semibold text-[#10231c]">
              {tipoImportacao === 'entrada' ? 'Entradas' : 'Saídas'}
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
              {' '}Os valores serão salvos como{' '}
              {tipoImportacao === 'entrada' ? 'positivos (entradas)' : 'negativos (saídas)'}.
            </p>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="sticky top-0 bg-[#f1f3ed] text-[#68736d]">
                <tr>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Estabelecimento</th>
                  <th className="px-5 py-3 font-medium">Valor a importar</th>
                  <th className="px-5 py-3 font-medium">Método</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Subcategoria</th>
                  <th className="px-5 py-3 font-medium">Parcela</th>
                  <th className="px-5 py-3 font-medium">Total parcelas</th>
                  <th className="px-5 py-3 font-medium">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0eb]">
                {transacoes.map((transacao, index) => (
                  <tr
                    key={`${transacao.data}-${index}`}
                    className="text-[#10231c]"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      {linhas[index].data || '-'}
                    </td>
                    <td className="max-w-[260px] truncate px-5 py-3">
                      {transacao.estabelecimento || '-'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-5 py-3 font-semibold ${
                        transacao.valor < 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatarMoeda(transacao.valor)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {transacao.metodoPagamento || '-'}
                    </td>
                    <td className="px-5 py-3">{transacao.categoria || '-'}</td>
                    <td className="px-5 py-3">{transacao.subcategoria || '-'}</td>
                    <td className="px-5 py-3">{transacao.parcelaAtual ?? '-'}</td>
                    <td className="px-5 py-3">{transacao.parcelaTotal ?? '-'}</td>
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
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={voltarParaPreview}
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
