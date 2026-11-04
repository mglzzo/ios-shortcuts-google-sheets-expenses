import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronDown,
} from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout.js'

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function Lancamentos() {
  const navigate = useNavigate()

  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth()
  )
  const [menuMesAberto, setMenuMesAberto] = useState(false)
  const [filtro, setFiltro] = useState<'todos' | 'entrada' | 'saida'>('todos')

  const anoAtual = new Date().getFullYear()

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
        <header className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-7 sm:px-10 lg:px-12">
          <div>
            <h1 className="text-[34px] font-extrabold leading-tight tracking-[-.7px] sm:text-[40px]">
              Seus lançamentos
            </h1>
            <p className="mt-1 text-[17px] text-[#77839e] sm:text-[20px]">
              Veja para onde seu dinheiro está indo.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuMesAberto((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[#e6e8f0] bg-white px-5 py-3 text-[14px] text-[#34415e] shadow-sm sm:text-[15px]"
            >
              <CalendarDays size={19} />
              {meses[mesSelecionado]} {anoAtual}
              <ChevronDown size={13} className="ml-1 text-[#8b96ac]" />
            </button>

            {menuMesAberto && (
              <div className="absolute right-0 top-14 z-40 max-h-64 w-44 overflow-y-auto rounded-xl border border-[#e6e8f0] bg-white p-1.5 shadow-xl">
                {meses.map((mes, index) => (
                  <button
                    key={mes}
                    type="button"
                    onClick={() => {
                      setMesSelecionado(index)
                      setMenuMesAberto(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      mesSelecionado === index
                        ? 'bg-violet-50 font-semibold text-violet-700'
                        : 'text-[#52607b] hover:bg-slate-50'
                    }`}
                  >
                    {mes} {anoAtual}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto w-full space-y-5 px-5 pb-8 sm:px-10 lg:px-12">
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="relative min-h-[130px] overflow-hidden rounded-[18px] border border-[#dff1e9] bg-[#f2fbf7] p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6f5e8] text-[#0a9b68]">
                  <TrendingUp size={25} />
                </span>

                <div>
                  <h2 className="text-[16px] font-bold">Entradas</h2>
                  <p className="mt-1 text-[30px] font-extrabold leading-none text-[#078c5d]">
                    R$ 0,00
                  </p>
                </div>
              </div>

              <TrendingUp className="absolute -bottom-3 -right-2 h-24 w-24 rotate-45 text-[#b7efd9] opacity-70" />
            </article>

            <article className="relative min-h-[130px] overflow-hidden rounded-[18px] border border-[#f7e2e2] bg-[#fff5f5] p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe0df] text-[#f45f55]">
                  <TrendingDown size={25} />
                </span>

                <div>
                  <h2 className="text-[16px] font-bold">Saídas</h2>
                  <p className="mt-1 text-[30px] font-extrabold leading-none text-[#f0524b]">
                    R$ 0,00
                  </p>
                </div>
              </div>

              <TrendingDown className="absolute -bottom-3 -right-2 h-24 w-24 -rotate-45 text-[#ffd1d0] opacity-70" />
            </article>
          </section>

          <section className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-fit items-center gap-1 rounded-full border border-[#e8e9f0] bg-white p-1 shadow-sm">
              {(['todos', 'entrada', 'saida'] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltro(opcao)}
                  className={`rounded-full px-6 py-2 text-[14px] font-medium transition ${
                    filtro === opcao
                      ? 'bg-[#eee8ff] text-[#6848ed]'
                      : 'text-[#697793] hover:bg-slate-50'
                  }`}
                >
                  {opcao === 'todos'
                    ? 'Todos'
                    : opcao === 'entrada'
                      ? 'Entradas'
                      : 'Saídas'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('/conexoes')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7653f5] px-6 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#6543e8] md:w-auto"
            >
              <Plus size={19} />
              Adicionar um novo lançamento
            </button>
          </section>

          {(['Hoje', 'Esta semana'] as const).map((grupo) => (
            <section
              key={grupo}
              className="overflow-hidden rounded-[16px] border border-[#e6e9f0] bg-white shadow-[0_2px_8px_rgba(34,45,80,.025)]"
            >
              <div className="flex items-center justify-between rounded-t-[16px] bg-[#f7f8fb] px-5 py-3">
                <h2 className="text-[17px] font-bold">{grupo}</h2>
                <span className="text-[13px] text-[#8290aa]"></span>
              </div>

              <div className="flex min-h-[92px] items-center justify-center px-5 py-6 text-[14px] text-[#9aa5b8]">
                Nenhum lançamento cadastrado
              </div>
            </section>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default Lancamentos