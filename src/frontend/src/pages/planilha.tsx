import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Planilha() {
  const navigate = useNavigate()

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState('')

  function selecionarArquivo(file: File | undefined) {
    if (!file) {
      return
    }

    const extensoesPermitidas = [
      '.xlsx',
      '.xls',
      '.csv',
    ]

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

    navigate('/conexoes/planilha/preparar', {
      state: {
        arquivo,
      },
    })
  }
  return (
    <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
      <main className="mx-auto max-w-[1000px] px-5 py-6 sm:px-8 lg:px-11 lg:py-9">
        <button
          type="button"
          onClick={() => navigate('/conexoes')}
          className="mb-8 flex items-center gap-2 text-sm text-[#68736d] transition hover:text-[#10231c]"
        >
          <ArrowLeft size={17} />
          Voltar para conexões
        </button>

        <div className="max-w-2xl">
          

          <h1 className="mt-2 text-[34px] font-normal tracking-[-0.04em] text-[#10231c] sm:text-[42px]">
            Conecte sua planilha
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#68736d]">
            Envie sua planilha de gastos. Depois, vamos pedir algumas
            informações para entender exatamente onde cada dado está.
          </p>
        </div>

        <section className="mt-8 max-w-3xl rounded-[24px] border border-[#dfe3dc] bg-white p-5 sm:p-7">
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
              className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-6 text-center transition ${arrastando
                  ? 'border-[#9dbb24] bg-[#f5fbdc]'
                  : 'border-[#cfd5cd] bg-[#fafaf6] hover:border-[#aeb8ae] hover:bg-[#f7f8f2]'
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

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8ff3e] text-[#10231c]">
                <FileSpreadsheet size={25} />
              </div>

              <h2 className="mt-5 text-base font-semibold">
                Arraste sua planilha aqui
              </h2>

              <p className="mt-2 text-sm text-[#7b857f]">
                ou clique para selecionar um arquivo
              </p>

              <span className="mt-5 text-[11px] text-[#9aa39e]">
                Excel (.xlsx, .xls) ou CSV
              </span>
            </label>
          ) : (
            <div className="rounded-[18px] border border-[#dfe3dc] bg-[#fafaf6] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d8ff3e] text-[#10231c]">
                  <FileSpreadsheet size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {arquivo.name}
                  </p>

                  <p className="mt-1 text-xs text-[#8a958f]">
                    {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removerArquivo}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8a958f] transition hover:bg-[#eef0eb] hover:text-[#10231c]"
                  aria-label="Remover arquivo"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#eef7d2] px-4 py-3 text-xs text-[#526159]">
                <CheckCircle2 size={15} />
                Arquivo pronto para ser analisado.
              </div>
            </div>
          )}

          {erro && (
            <p className="mt-4 text-sm text-[#b75b4a]">
              {erro}
            </p>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/conexoes')}
              className="h-11 rounded-xl border border-[#dfe3dc] bg-white px-5 text-sm font-medium text-[#526159] transition hover:bg-[#f5f6f1]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={continuar}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10231c] px-5 text-sm font-semibold text-white transition hover:bg-[#19372c]"
            >
              <Upload size={16} />
              Continuar
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Planilha