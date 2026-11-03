
import { useState } from 'react'
import {
  Target,
  Calculator,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Info,
  Wallet,
  CreditCard,
  TrendingUp,
  Lightbulb,
  CalendarDays,
  PiggyBank,
  CircleAlert,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'

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

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function Dashboard() {
  const navigate = useNavigate()

  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth()
  )
  const [anoSelecionado] = useState(new Date().getFullYear())
  const [menuMesAberto, setMenuMesAberto] = useState(false)


  const nome = 'Testegi'
  const renda = 0
  const comprometido = 0
  const disponivel = 0
  const parcelasPendentes = 0
  const progressoDesafio = 0
  const metaDesafio = 25

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">

       
        <header className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-7 sm:px-10 lg:px-12">
          <div>
            <h1 className="text-[36px] font-extrabold leading-tight tracking-[-.7px] sm:text-[44px]">
              Oi, {nome}!
            </h1>

            <p className="mt-1 text-[16px] text-[#77839e] sm:text-[20px]">
              Vamos cuidar do seu dinheiro sem complicação.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuMesAberto((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-[#e6e8f0] bg-white px-4 py-3 text-[14px] text-[#34415e] shadow-sm sm:px-5 sm:text-[15px]"
              >
                <CalendarDays size={19} />
                {meses[mesSelecionado]} {anoSelecionado}
                <ChevronDown size={13} className="ml-1 text-[#8b96ac]" />
              </button>

              {menuMesAberto && (
                <div className="absolute right-0 top-12 z-40 max-h-64 w-40 overflow-y-auto rounded-xl border border-[#e6e8f0] bg-white p-1.5 shadow-xl">
                  {meses.map((mes, index) => (
                    <button
                      type="button"
                      key={mes}
                      onClick={() => {
                        setMesSelecionado(index)
                        setMenuMesAberto(false)
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                        mesSelecionado === index
                          ? 'bg-violet-50 font-semibold text-violet-700'
                          : 'text-[#52607b] hover:bg-slate-50'
                      }`}
                    >
                      {mes} {anoSelecionado}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full space-y-5 px-5 pb-8 sm:px-10 lg:px-12">


          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">


            <article className="min-h-[270px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <PiggyBank size={22} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Sua vida financeira
                </h2>
                <Info size={12} className="ml-1 text-[#9aa5ba]" />
              </div>

              <div className="flex flex-col items-center pt-2">
                <div
                  className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full"
                  style={{
                    background: 'conic-gradient(#dfe5e2 0deg 360deg)',
                  }}
                >
                  <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-[28px] font-bold text-[#263550]">
                      0
                      <span className="text-[14px] font-medium text-[#9aa5ba]">
                        /100
                      </span>
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-[16px] font-bold text-[#263550]">
                  Vamos começar!
                </p>
                <p className="mt-0.5 text-center text-[14px] text-[#8b96aa]">
                  Adicione seus primeiros lançamentos
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f3f6fb] px-3 py-2.5 text-[13px] leading-[19px] text-[#71809b]">
                <TrendingUp size={23} className="shrink-0 text-[#36b982]" />
                Seus indicadores aparecerão aqui conforme você organizar suas finanças.
              </div>
            </article>


            <article className="min-h-[270px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcf5eb] text-[#159967]">
                  <Wallet size={22} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Dinheiro disponível
                </h2>
              </div>

              <p className="mt-4 text-[40px] font-extrabold tracking-[-.5px] text-[#168b55]">
                {moeda(disponivel)}
              </p>

              <p className="mt-1 text-[14px] text-[#596783]">
                {moeda(comprometido)} comprometidos
              </p>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#e0e5ee]">
                <div className="h-full w-0 rounded-full bg-[#41c394]" />
              </div>

              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[13px] text-[#71809b]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#21aa76]" />
                  Livre {moeda(disponivel)}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#aab4c7]" />
                  Parcelas {moeda(comprometido)}
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#f5f0ff] px-3 py-2.5 text-[13px] leading-[19px] text-[#8060dc]">
                <Lightbulb size={23} className="shrink-0" />
                <span>
                  <strong>Dica da Finly:</strong> em breve vamos ajudar você a planejar seu dinheiro.
                </span>
              </div>
            </article>


            <article className="relative min-h-[270px] overflow-hidden rounded-[22px] border border-[#f0e6e6] bg-[#fff7f6] p-6 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="absolute -right-3 top-14 flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#ffebe9] text-[#ffd0ca]">
                <CircleAlert size={43} />
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe0dc] text-[#f06452]">
                  <CreditCard size={22} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Atenção com o parcelamento
                </h2>
              </div>

              <div className="relative z-10 mt-5">
                <p className="text-[14px] font-bold leading-5 text-[#263550]">
                  {parcelasPendentes === 0
                    ? 'Nenhuma parcela cadastrada'
                    : `${parcelasPendentes} parcelas pendentes`}
                </p>

                <p className="mt-2 max-w-[210px] text-[14px] leading-[21px] text-[#8791a5]">
                  Quando você adicionar compras parceladas, acompanhe seus próximos compromissos por aqui.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/lancamentos')}
                  className="mt-5 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#f1715c] text-[14px] font-semibold text-white transition hover:bg-[#e85e49]"
                >
                  Entender melhor <ArrowRight size={13} />
                </button>
              </div>
            </article>
          </section>


          <section className="min-h-[185px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <Target size={15} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Desafio da semana
                </h2>
              </div>

              <span className="flex items-center gap-1 rounded-lg border border-[#e8eaf1] px-2 py-1 text-[13px] text-[#7c879d]">
                <CalendarDays size={11} />
                Começa em breve
              </span>
            </div>

            <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[150px_minmax(0,1fr)_minmax(150px,190px)_minmax(190px,240px)]">
              <div className="flex h-[125px] items-center justify-center overflow-visible">
                <img
                  src="/porco-grande.png"
                  alt="Porquinho Finly"
                  className="h-[145px] w-[145px] object-contain drop-shadow-sm"
                />
              </div>

              <div>
                <p className="text-[16px] font-bold text-[#263550]">
                  Guarde R$ 25 esta semana
                </p>

                <p className="mt-1 text-[13px] text-[#8994a9]">
                  {moeda(progressoDesafio)} de {moeda(metaDesafio)}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e5e9ef]">
                    <div className="h-full w-0 rounded-full bg-[#53c58f]" />
                  </div>
                  <span className="text-[13px] text-[#596783]">0%</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/metas')}
                  className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#7958ed] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#6846dc]"
                >
                  Continuar desafio <ArrowRight size={15} />
                </button>
              </div>

              <div className="rounded-xl bg-[#f6f2ff] px-3 py-2.5 text-[13px] leading-[19px] text-[#8b72dc]">
                Pequenas escolhas de hoje constroem grandes conquistas 💜
              </div>
            </div>
          </section>


          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)]">


            <article className="min-h-[185px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <Calculator size={15} />
                </span>

                <div>
                  <h2 className="text-[16px] font-bold">
                    Se eu comprar agora...
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#8994a9]">
                    Veja como uma compra afeta o seu mês antes de decidir.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid items-center gap-3 rounded-xl bg-[#f7f5ff] p-3 sm:grid-cols-[minmax(110px,.8fr)_minmax(0,1fr)_auto]">
                <div>
                  <label
                    htmlFor="valor-compra"
                    className="block text-[13px] text-[#8994a9]"
                  >
                    Compra de
                  </label>

                  <div className="mt-1 flex items-center gap-1 rounded-lg border border-[#e7e2fa] bg-white px-2 py-2">
                    <span className="text-[14px] text-[#687590]">R$</span>
                    <input
                      id="valor-compra"
                      type="number"
                      min="0"
                      placeholder="0,00"
                      className="w-full min-w-0 bg-transparent text-[16px] font-bold text-[#263550] outline-none"
                    />
                  </div>
                </div>

                <div className="border-l border-[#d8cdfa] pl-3">
                  <p className="text-[13px] text-[#71809b]">
                    Você ainda tem no mês
                  </p>
                  <p className="mt-1 text-[25px] font-extrabold text-[#168b55]">
                    {moeda(renda)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/simulador')}
                  className="flex h-8 items-center justify-center gap-2 rounded-lg bg-[#7958ed] px-3 text-[13px] font-semibold text-white transition hover:bg-[#6846dc]"
                >
                  Simular decisão <ArrowRight size={12} />
                </button>
              </div>
            </article>


            <article className="min-h-[185px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <BookOpen size={15} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Aprenda em 2 min
                </h2>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-[82px] w-[100px] shrink-0 items-center justify-center rounded-xl bg-[#f0eaff] text-[#8969ef]">
                  <div className="relative">
                    <CreditCard size={39} strokeWidth={1.5} />
                    <span className="absolute -bottom-2 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f0eaff] bg-white text-[14px] font-bold">
                      %
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="rounded bg-[#eee8ff] px-2 py-0.5 text-[8px] text-[#7654ed]">
                    Juros
                  </span>

                  <p className="mt-1 text-[14px] font-bold text-[#263550]">
                    Parcelado sem juros também ocupa seu orçamento.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/aprender')}
                    className="mt-2 text-[13px] text-[#8060dc] underline underline-offset-2"
                  >
                    Ver mais conteúdos
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Ver conteúdo"
                  onClick={() => navigate('/aprender')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[#7654ed]"
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </article>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export function invalidarDashboardCache() {
  // Mantida para compatibilidade com as telas que já importam esta função.
}

export default Dashboard
