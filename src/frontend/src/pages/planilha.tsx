import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout'

function Planilha() {
  const navigate = useNavigate()

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState('')

  const tipoImportacao =
    sessionStorage.getItem('finly-tipo-importacao-planilha') === 'entrada'
      ? 'entrada'
      : 'saida'

  const textoTipo = tipoImportacao === 'entrada' ? 'entradas' : 'saídas'

  function selecionarArquivo(file: File | undefined) {
    if (!file) return

    const extensoesPermitidas = ['.xlsx', '.xls', '.csv']
    const extensao = `.${file.name.split('.').pop()?.toLowerCase()}`

    if (!extensoesPermitidas.includes(extensao)) {
      setErro('Selecione um arquivo Excel ou CSV.')
      return
    }

    setErro('')
    setArquivo(file)
  }

  function removerArquivo() {
    setArquivo(null)
    setErro('')
  }

  function continuar() {
    if (!arquivo) {
      setErro('Anexe sua planilha para continuar.')
      return
    }

    const tipoAtual =
      sessionStorage.getItem('finly-tipo-importacao-planilha') === 'entrada'
        ? 'entrada'
        : 'saida'

    navigate('/conexoes/planilha/preparar', {
      state: {
        arquivo,
        tipoImportacao: tipoAtual,
      },
    })
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
        <div className="w-full space-y-6 px-5 py-7 sm:px-8 sm:py-9 lg:px-11">

          <div className="max-w-4xl">

            <h1 className="text-[32px] font-extrabold leading-tight tracking-[-.7px] text-[#17213b] sm:text-[40px]">
              Conecte sua planilha de {textoTipo}
            </h1>

            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#77839e] sm:text-[17px]">
              Envie sua planilha de{' '}
              {tipoImportacao === 'entrada' ? 'recebimentos' : 'gastos'}.
              Depois, vamos pedir algumas informações para entender exatamente
              onde cada dado está.
            </p>
          </div>

          <section className="mx-auto w-full max-w-[820px] rounded-[22px] border border-[#e6e8f0] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)] sm:p-7">

            {!arquivo ? (
              <label
                onDragOver={(event) => {
                  event.preventDefault()
                  setArrastando(true)
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setArrastando(false)
                  selecionarArquivo(event.dataTransfer.files[0])
                }}
                className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-6 text-center transition sm:min-h-[300px] ${
                  arrastando
                    ? 'border-[#7653f5] bg-[#f3f0ff]'
                    : 'border-[#d7dbe7] bg-[#fafaff] hover:border-[#b7a8f8] hover:bg-[#f7f5ff]'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(event) =>
                    selecionarArquivo(event.target.files?.[0])
                  }
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0eaff] text-[#7653f5]">
                  <FileSpreadsheet size={25} />
                </div>

                <h2 className="mt-5 text-base font-semibold text-[#17213b]">
                  Arraste sua planilha aqui
                </h2>

                <p className="mt-2 text-sm text-[#77839e]">
                  ou clique para selecionar um arquivo
                </p>

                <span className="mt-5 text-[11px] text-[#9aa5b8]">
                  Excel (.xlsx, .xls) ou CSV
                </span>
              </label>
            ) : (
              <div className="rounded-[18px] border border-[#e6e8f0] bg-[#fafaff] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0eaff] text-[#7653f5]">
                    <FileSpreadsheet size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#17213b]">
                      {arquivo.name}
                    </p>

                    <p className="mt-1 text-xs text-[#8b96ac]">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removerArquivo}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8b96ac] transition hover:bg-[#eeeaf9] hover:text-[#17213b]"
                    aria-label="Remover arquivo"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#effaf5] px-4 py-3 text-xs text-[#39765d]">
                  <CheckCircle2 size={15} />
                  Arquivo pronto para ser analisado.
                </div>
              </div>
            )}

            {erro && (
              <p className="mt-4 text-sm text-[#c45151]">{erro}</p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/conexoes')}
                className="h-11 rounded-xl border border-[#e2e5ee] bg-white px-5 text-sm font-medium text-[#52607b] transition hover:bg-[#f7f8fc]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={continuar}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7653f5] px-5 text-sm font-semibold text-white transition hover:bg-[#6543e8]"
              >
                <Upload size={16} />
                Continuar
              </button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default Planilha