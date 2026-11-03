
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Laptop,
  Lightbulb,
  MoreHorizontal,
  PiggyBank,
  Plane,
  Plus,
  Target,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout'

interface Meta {
  id: number
  nome: string
  descricao: string
  icone: 'reserva' | 'viagem' | 'notebook' | 'outra'
  valorAtual: number
  valorObjetivo: number
  prazo: string
}

const metasIniciais: Meta[] = [
  {
    id: 1,
    nome: 'Reserva',
    descricao: 'Mais tranquilidade para o seu futuro.',
    icone: 'reserva',
    valorAtual: 640,
    valorObjetivo: 1000,
    prazo: '2026-12-31',
  },
  {
    id: 2,
    nome: 'Viagem',
    descricao: 'Conhecer novos lugares faz bem.',
    icone: 'viagem',
    valorAtual: 420,
    valorObjetivo: 2000,
    prazo: '2027-07-31',
  },
  {
    id: 3,
    nome: 'Notebook',
    descricao: 'Mais produtividade para os seus planos.',
    icone: 'notebook',
    valorAtual: 900,
    valorObjetivo: 3500,
    prazo: '2027-05-31',
  },
]

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const formatarPrazo = (prazo: string) => {
  if (!prazo) return 'Sem prazo'

  const [ano, mes, dia] = prazo.split('-').map(Number)

  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

const icones = {
  reserva: PiggyBank,
  viagem: Plane,
  notebook: Laptop,
  outra: Target,
}

const fundosIcones = {
  reserva: 'bg-[#e8f7ef] text-[#36bd85]',
  viagem: 'bg-[#f0ebff] text-[#8055f5]',
  notebook: 'bg-[#fff0ef] text-[#ed7777]',
  outra: 'bg-[#f0ebff] text-[#8055f5]',
}

function Metas() {
  const [metas, setMetas] = useState<Meta[]>(metasIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null)
  const [menuAberto, setMenuAberto] = useState<number | null>(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    icone: 'outra' as Meta['icone'],
    valorAtual: '0',
    valorObjetivo: '',
    prazo: '',
  })

  const mesAtual = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
  }, [])

  const progressoGeral = useMemo(() => {
    const atual = metas.reduce((total, meta) => total + meta.valorAtual, 0)
    const objetivo = metas.reduce(
      (total, meta) => total + meta.valorObjetivo,
      0,
    )

    return objetivo > 0 ? Math.min((atual / objetivo) * 100, 100) : 0
  }, [metas])

  function criarMeta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const valorObjetivo = Number(formulario.valorObjetivo)
    const valorAtual = Number(formulario.valorAtual)

    if (
      !formulario.nome.trim() ||
      valorObjetivo <= 0 ||
      valorAtual < 0
    ) {
      return
    }

    const novaMeta: Meta = {
      id: Date.now(),
      nome: formulario.nome.trim(),
      descricao:
        formulario.descricao.trim() ||
        'Uma conquista para o seu futuro.',
      icone: formulario.icone,
      valorAtual,
      valorObjetivo,
      prazo: formulario.prazo,
    }

    setMetas((anteriores) => [...anteriores, novaMeta])

    setFormulario({
      nome: '',
      descricao: '',
      icone: 'outra',
      valorAtual: '0',
      valorObjetivo: '',
      prazo: '',
    })

    setModalAberto(false)
  }

  function excluirMeta(id: number) {
    setMetas((anteriores) => anteriores.filter((meta) => meta.id !== id))
    setMenuAberto(null)

    if (metaSelecionada?.id === id) {
      setMetaSelecionada(null)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen w-full min-w-0 bg-transparent px-5 py-6 text-[#17213b] sm:px-7 lg:px-8">


        <div className="mb-8 flex items-center justify-end gap-3">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e9e9e4] bg-white px-3 text-xs text-[#263654] shadow-sm">
            <CalendarDays size={15} />
            <span className="capitalize">{mesAtual}</span>
          </div>

          <button
            type="button"
            aria-label="Notificações"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#34415f] transition hover:bg-[#f0ebff]"
          >
            <Bell size={18} />
            <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#8055f5]" />
          </button>

          <button
            type="button"
            aria-label="Perfil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#34415f] transition hover:bg-[#f0ebff]"
          >
            <UserRound size={18} />
          </button>
        </div>


        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[25px] font-bold tracking-tight text-[#101b38] sm:text-[28px]">
              Metas que fazem sentido
            </h1>

            <p className="mt-1 text-sm text-[#71809e]">
              Pequenos passos para chegar onde você quer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7950f5] px-5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(117,77,245,0.18)] transition hover:bg-[#6740df]"
          >
            <Plus size={18} />
            Nova meta
          </button>
        </div>


        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#17213b]">
              Suas metas
            </h2>

            <span className="text-xs text-[#8490a8]">
              {metas.length} {metas.length === 1 ? 'objetivo cadastrado' : 'objetivos cadastrados'}
            </span>
          </div>

          {metas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcd5ef] bg-white px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebff] text-[#7950f5]">
                <Target size={30} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#17213b]">
                Você ainda não possui metas
              </h3>

              <p className="mt-2 text-sm text-[#8490a8]">
                Comece criando seu primeiro objetivo financeiro.
              </p>

              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#7950f5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6740df]"
              >
                <Plus size={17} />
                Criar primeira meta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {metas.map((meta) => {
                const progresso =
                  meta.valorObjetivo > 0
                    ? Math.min(
                        (meta.valorAtual / meta.valorObjetivo) * 100,
                        100,
                      )
                    : 0

                const Icone = icones[meta.icone]

                return (
                  <article
                    key={meta.id}
                    className="min-w-0 rounded-xl border border-[#e9e9e4] bg-white p-4 shadow-[0_4px_18px_rgba(27,39,73,0.035)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-[17px]"
                  >
  
                    <div className="mb-5 flex items-start gap-3">
                      <div
                        className={`flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full ${fundosIcones[meta.icone]}`}
                      >
                        <Icone size={34} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0 flex-1 pt-2">
                        <h3 className="text-[15px] font-bold text-[#101b38]">
                          {meta.nome}
                        </h3>

                        <p className="mt-1 text-xs leading-[1.5] text-[#71809e]">
                          {meta.descricao}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          aria-label={`Opções da meta ${meta.nome}`}
                          onClick={() =>
                            setMenuAberto(
                              menuAberto === meta.id ? null : meta.id,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#edf0f5] text-[#71809e] transition hover:bg-[#f5f2ff]"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {menuAberto === meta.id && (
                          <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-[#e9e9e4] bg-white p-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setMetaSelecionada(meta)
                                setMenuAberto(null)
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#34415f] hover:bg-[#f5f2ff]"
                            >
                              Ver detalhes
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirMeta(meta.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#dc5555] hover:bg-[#fff2f2]"
                            >
                              <Trash2 size={13} />
                              Excluir meta
                            </button>
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="mb-2 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[22px] font-bold tracking-tight text-[#07844b]">
                          {formatarMoeda(meta.valorAtual)}
                        </p>

                        <p className="mt-0.5 text-[13px] text-[#71809e]">
                          de {formatarMoeda(meta.valorObjetivo)}
                        </p>
                      </div>

                      <span className="pb-0.5 text-xs font-semibold text-[#34415f]">
                        {progresso.toFixed(0)}%
                      </span>
                    </div>


                    <div className="h-[13px] w-full overflow-hidden rounded-full bg-[#e9edf3]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#43c98b] to-[#36bc83] transition-all duration-500"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>


                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#edf0f5] pt-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-[#172b50]"
                        />

                        <div className="min-w-0">
                          <p className="text-[10px] text-[#8490a8]">
                            Meta para
                          </p>

                          <p className="truncate text-[11px] font-semibold capitalize text-[#24304e]">
                            {formatarPrazo(meta.prazo)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMetaSelecionada(meta)}
                        className="flex shrink-0 items-center gap-1 rounded-xl bg-[#f4efff] px-3 py-2.5 text-[11px] font-semibold text-[#7048f4] transition hover:bg-[#eae0ff]"
                      >
                        Ver meta
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-7 flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#f5efff] to-[#eee7ff] px-5 py-5 sm:px-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#7950f5]">
            <Lightbulb size={37} strokeWidth={1.7} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#7549f5]">
              Você está mais perto do que parece.
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#7a83a0]">
              Grandes conquistas começam com pequenas metas. Continue assim! 💜
            </p>
          </div>
        </section>


        {modalAberto && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101b38]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setModalAberto(false)
              }
            }}
          >
            <div className="my-auto w-full max-w-[480px] rounded-2xl border border-[#e9e9e4] bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#17213b]">
                    Nova meta
                  </h2>
                  <p className="mt-1 text-xs text-[#8490a8]">
                    Defina seu próximo objetivo financeiro.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f8] text-[#53607b] transition hover:bg-[#e9e5f7]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={criarMeta} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                    Nome da meta
                  </label>

                  <input
                    required
                    maxLength={60}
                    value={formulario.nome}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        nome: event.target.value,
                      })
                    }
                    placeholder="Ex.: Viagem, notebook, reserva..."
                    className="h-11 w-full rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 text-sm text-[#263654] outline-none transition focus:border-[#8b73f7]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                    Descrição
                  </label>

                  <textarea
                    maxLength={150}
                    value={formulario.descricao}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        descricao: event.target.value,
                      })
                    }
                    placeholder="O que você deseja conquistar?"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 py-3 text-sm text-[#263654] outline-none transition focus:border-[#8b73f7]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                    Ícone da meta
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['reserva', PiggyBank],
                        ['viagem', Plane],
                        ['notebook', Laptop],
                        ['outra', Target],
                      ] as const
                    ).map(([tipo, Icone]) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() =>
                          setFormulario({
                            ...formulario,
                            icone: tipo,
                          })
                        }
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                          formulario.icone === tipo
                            ? 'border-[#7950f5] bg-[#f2edff] text-[#7950f5]'
                            : 'border-[#e5e7ef] bg-white text-[#71809e] hover:bg-[#f8f6ff]'
                        }`}
                      >
                        <Icone size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                      Valor desejado (R$)
                    </label>

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formulario.valorObjetivo}
                      onChange={(event) =>
                        setFormulario({
                          ...formulario,
                          valorObjetivo: event.target.value,
                        })
                      }
                      placeholder="2000"
                      className="h-11 w-full rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 text-sm outline-none focus:border-[#8b73f7]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                      Já guardado (R$)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.valorAtual}
                      onChange={(event) =>
                        setFormulario({
                          ...formulario,
                          valorAtual: event.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 text-sm outline-none focus:border-[#8b73f7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#34415f]">
                    Prazo para alcançar a meta
                  </label>

                  <input
                    type="date"
                    value={formulario.prazo}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        prazo: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 text-sm outline-none focus:border-[#8b73f7]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7950f5] text-sm font-semibold text-white shadow-[0_5px_12px_rgba(103,70,239,.18)] transition hover:bg-[#6740df]"
                >
                  <Plus size={17} />
                  Criar meta
                </button>
              </form>
            </div>
          </div>
        )}


        {metaSelecionada && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101b38]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setMetaSelecionada(null)
              }
            }}
          >
            <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#17213b]">
                  Detalhes da meta
                </h2>

                <button
                  type="button"
                  onClick={() => setMetaSelecionada(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f8] text-[#53607b]"
                >
                  <X size={18} />
                </button>
              </div>

              {(() => {
                const progresso = Math.min(
                  (metaSelecionada.valorAtual /
                    metaSelecionada.valorObjetivo) *
                    100,
                  100,
                )

                return (
                  <>
                    <div className="mb-5 rounded-xl bg-[#f3efff] px-5 py-6 text-center">
                      <div className="mb-3 flex justify-center text-[#7950f5]">
                        {(() => {
                          const Icone = icones[metaSelecionada.icone]
                          return <Icone size={38} />
                        })()}
                      </div>

                      <p className="text-3xl font-bold text-[#7048f4]">
                        {progresso.toFixed(0)}%
                      </p>

                      <p className="mt-1 text-xs text-[#78849d]">
                        do seu objetivo alcançado
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">Meta</span>
                        <strong className="text-[#24304e]">
                          {metaSelecionada.nome}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">
                          Valor acumulado
                        </span>
                        <strong className="text-[#07844b]">
                          {formatarMoeda(metaSelecionada.valorAtual)}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">
                          Valor desejado
                        </span>
                        <strong className="text-[#24304e]">
                          {formatarMoeda(metaSelecionada.valorObjetivo)}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">
                          Falta alcançar
                        </span>
                        <strong className="text-[#24304e]">
                          {formatarMoeda(
                            Math.max(
                              metaSelecionada.valorObjetivo -
                                metaSelecionada.valorAtual,
                              0,
                            ),
                          )}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">Prazo</span>
                        <strong className="capitalize text-[#24304e]">
                          {formatarPrazo(metaSelecionada.prazo)}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMetaSelecionada(null)}
                      className="mt-6 h-11 w-full rounded-xl bg-[#7950f5] text-sm font-semibold text-white transition hover:bg-[#6740df]"
                    >
                      Fechar
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Metas
