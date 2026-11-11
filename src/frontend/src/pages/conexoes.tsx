import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlugZap,
  LockKeyhole,
  FileSpreadsheet,
  ChevronRight,
  Construction,
  X,
} from 'lucide-react'

import { getMe } from '../services/auth'
import MainLayout from '../../components/layout/MainLayout'

interface Usuario {
  id: string
  nome: string
  email: string
}

function Conexoes() {
  const navigate = useNavigate()

  const [, setUsuario] = useState<Usuario | null>(null)
  const [pluggyModalOpen, setPluggyModalOpen] = useState(false)

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dadosUsuario = await getMe()
        setUsuario(dadosUsuario)
      } catch {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    carregarUsuario()
  }, [])

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPluggyModalOpen(false)
      }
    }

    window.addEventListener('keydown', fecharComEscape)

    return () => {
      window.removeEventListener('keydown', fecharComEscape)
    }
  }, [])

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
        <div className="w-full max-w-none px-5 pb-8 pt-7 sm:px-10 lg:px-12">

          <div className="mb-8">
            <h1 className="text-[40px] font-extrabold leading-tight tracking-[-.7px] sm:text-[44px]">
              Conexões
            </h1>

            <p className="mt-2 max-w-xl text-[16px] leading-6 text-[#77839e] sm:text-[18px]">
              Escolha como suas movimentações serão conectadas ao Camélia.
            </p>
          </div>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">


            <button
              type="button"
              onClick={() => setPluggyModalOpen(true)}
              className="group relative flex min-h-[245px] flex-col rounded-[18px] border border-[#e6e8f0] bg-white p-6 text-left shadow-[0_2px_8px_rgba(34,45,80,.025)] transition hover:-translate-y-0.5 hover:border-[#d5d8e5] hover:shadow-[0_14px_35px_rgba(34,45,80,.08)] focus:outline-none focus:ring-4 focus:ring-violet-100 sm:p-7"
            >
              <div className="mb-7 flex w-full items-start justify-between gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0edff] text-[#7653f5]">
                  <PlugZap size={27} />
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f1ff] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7653f5]">
                  <LockKeyhole size={12} />
                  Em desenvolvimento
                </span>
              </div>

              <h2 className="text-[21px] font-bold tracking-[-.3px] text-[#17213b]">
                Conexão bancária via Pluggy
              </h2>

              <p className="mt-2 max-w-lg text-[15px] leading-6 text-[#77839e]">
                Conecte suas contas bancárias e cartões diretamente ao Camélia
                e acompanhe suas movimentações automaticamente.
              </p>

              <div className="mt-auto flex items-center gap-1 pt-6 text-[14px] font-semibold text-[#7653f5]">
                Saiba mais
                <ChevronRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/conexoes/planilha')}
              className="group flex min-h-[245px] flex-col rounded-[18px] border border-[#e6e8f0] bg-white p-6 text-left shadow-[0_2px_8px_rgba(34,45,80,.025)] transition hover:-translate-y-0.5 hover:border-[#d5d8e5] hover:shadow-[0_14px_35px_rgba(34,45,80,.08)] focus:outline-none focus:ring-4 focus:ring-violet-100 sm:p-7"
            >
              <div className="mb-7 flex w-full items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9ff] text-[#7653f5]">
                  <FileSpreadsheet size={27} />
                </span>

                <ChevronRight
                  size={21}
                  className="text-[#9aa5b8] transition group-hover:translate-x-1 group-hover:text-[#7653f5]"
                />
              </div>

              <h2 className="text-[21px] font-bold tracking-[-.3px] text-[#17213b]">
                Importar por planilha
              </h2>

              <p className="mt-2 max-w-lg text-[15px] leading-6 text-[#77839e]">
                Importe suas movimentações financeiras por meio de uma
                planilha. A identificação de entradas e saídas acontece
                durante a importação.
              </p>
            </button>

          </section>
        </div>
      </div>


      {pluggyModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#172b4d]/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPluggyModalOpen(false)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pluggy-modal-title"
            className="w-full max-w-md rounded-[24px] border border-[#e6e8f0] bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0edff] text-[#7653f5]">
                <Construction size={22} />
              </div>

              <button
                type="button"
                onClick={() => setPluggyModalOpen(false)}
                aria-label="Fechar aviso"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f8] text-[#77839e] transition hover:bg-[#e8eaf2] hover:text-[#17213b]"
              >
                <X size={17} />
              </button>
            </div>

            <span className="mt-5 inline-flex rounded-full bg-[#f3f1ff] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7653f5]">
              Em desenvolvimento
            </span>

            <h2
              id="pluggy-modal-title"
              className="mt-3 text-[25px] font-bold leading-tight tracking-[-.5px] text-[#17213b]"
            >
              Conexão bancária via Pluggy
            </h2>

            <p className="mt-3 text-[15px] leading-6 text-[#77839e]">
              Estamos trabalhando para trazer a conexão bancária automática
              ao Camélia, permitindo integrar suas contas e acompanhar suas
              movimentações com mais praticidade.
            </p>

            <p className="mt-3 text-[15px] leading-6 text-[#77839e]">
              Esse recurso estará disponível futuramente em um dos nossos
              <strong className="font-semibold text-[#17213b]">
                {' '}planos pagos
              </strong>.
              Enquanto isso, você pode continuar importando suas transações
              por meio de planilhas.
            </p>

            <button
              type="button"
              onClick={() => setPluggyModalOpen(false)}
              className="mt-6 h-12 w-full rounded-xl bg-[#7653f5] text-[14px] font-semibold text-white transition hover:bg-[#6543e8]"
            >
              Entendi
            </button>
          </section>
        </div>
      )}
    </MainLayout>
  )
}

export default Conexoes
