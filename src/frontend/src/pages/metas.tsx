
import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Lightbulb,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout'

type IconeMeta = 'reserva' | 'viagem' | 'notebook' | 'casa'

interface Meta {
  id: number
  nome: string
  descricao: string
  icone: IconeMeta
  valorAtual: number
  valorObjetivo: number
  prazo: string
  cor: string
}

const cores = [
  { nome: 'Roxo', valor: '#8055f5', fundo: '#f0ebff' },
  { nome: 'Verde', valor: '#43c98b', fundo: '#e8f7ef' },
  { nome: 'Rosa', valor: '#ff9999', fundo: '#fff0ef' },
  { nome: 'Azul', valor: '#80b8ff', fundo: '#edf5ff' },
  { nome: 'Amarelo', valor: '#ffd66b', fundo: '#fff8e6' },
]

const opcoesIcones: {
  tipo: IconeMeta
  nome: string
  emoji: string
}[] = [
  { tipo: 'reserva', nome: 'Reserva', emoji: '🐷' },
  { tipo: 'viagem', nome: 'Viagem', emoji: '✈️' },
  { tipo: 'notebook', nome: 'Notebook', emoji: '💻' },
  { tipo: 'casa', nome: 'Casa', emoji: '🏠' },
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

function Metas() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [criandoMeta, setCriandoMeta] = useState(false)
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null)
  const [menuAberto, setMenuAberto] = useState<number | null>(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    icone: 'reserva' as IconeMeta,
    valorAtual: '0',
    valorObjetivo: '',
    prazo: '',
    cor: '#8055f5',
  })

  const corSelecionada =
    cores.find((cor) => cor.valor === formulario.cor) ?? cores[0]

  const valorAtual = Number(formulario.valorAtual) || 0
  const valorObjetivo = Number(formulario.valorObjetivo) || 0

  const progresso =
    valorObjetivo > 0
      ? Math.min((valorAtual / valorObjetivo) * 100, 100)
      : 0

  const iconeSelecionado =
    opcoesIcones.find((item) => item.tipo === formulario.icone) ??
    opcoesIcones[0]

  function atualizarFormulario(
    campo: keyof typeof formulario,
    valor: string,
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function abrirCriacao() {
    setFormulario({
      nome: '',
      descricao: '',
      icone: 'reserva',
      valorAtual: '0',
      valorObjetivo: '',
      prazo: '',
      cor: '#8055f5',
    })

    setCriandoMeta(true)
  }

  function criarMeta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nome = formulario.nome.trim()
    const objetivo = Number(formulario.valorObjetivo)
    const atual = Number(formulario.valorAtual)

    if (
      !nome ||
      !Number.isFinite(objetivo) ||
      !Number.isFinite(atual) ||
      objetivo <= 0 ||
      atual < 0
    ) {
      return
    }

    const novaMeta: Meta = {
      id: Date.now(),
      nome,
      descricao: formulario.descricao.trim(),
      icone: formulario.icone,
      valorAtual: atual,
      valorObjetivo: objetivo,
      prazo: formulario.prazo,
      cor: formulario.cor,
    }

    setMetas((anteriores) => [...anteriores, novaMeta])
    setCriandoMeta(false)
  }

  function excluirMeta(id: number) {
    setMetas((anteriores) =>
      anteriores.filter((meta) => meta.id !== id),
    )

    setMenuAberto(null)

    if (metaSelecionada?.id === id) {
      setMetaSelecionada(null)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen w-full min-w-0 bg-transparent px-5 py-6 text-[#17213b] sm:px-7 lg:px-8 xl:px-10">
        {criandoMeta ? (
          <div className="w-full max-w-none">
            <button
              type="button"
              onClick={() => setCriandoMeta(false)}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-[#7950f5] transition hover:text-[#6740df]"
            >
              <ArrowLeft size={17} />
              Voltar para metas
            </button>

            <div className="mb-7">
              <h1 className="text-[28px] font-bold tracking-tight text-[#101b38] sm:text-[32px]">
                Criar nova meta
              </h1>

              <p className="mt-1 text-base text-[#71809e]">
                Dê um nome para o que você quer conquistar.
              </p>
            </div>

            <form onSubmit={criarMeta}>
              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.9fr)] 2xl:grid-cols-[minmax(0,1.25fr)_minmax(440px,0.9fr)]">
                <section className="w-full rounded-2xl border border-[#eeeef2] bg-white p-7 shadow-[0_4px_20px_rgba(27,39,73,0.035)] xl:p-9">
                  <h2 className="text-xl font-bold text-[#17213b]">
                    O que você quer realizar?
                  </h2>

                  <p className="mb-7 text-sm text-[#71809e]">
                    Escolha um ícone para a sua meta.
                  </p>

                  <div className="mb-8 grid grid-cols-4 gap-3 sm:gap-5">
                    {opcoesIcones.map((item) => {
                      const selecionado =
                        formulario.icone === item.tipo

                      return (
                        <button
                          key={item.tipo}
                          type="button"
                          onClick={() =>
                            atualizarFormulario('icone', item.tipo)
                          }
                          className="flex min-w-0 flex-col items-center gap-2"
                        >
                          <div
                            className={`flex aspect-square w-full max-w-[125px] items-center justify-center rounded-xl border-2 transition ${
                              selecionado
                                ? 'border-[#8055f5] bg-[#f7f3ff]'
                                : 'border-[#edf0f5] bg-white hover:border-[#cfc1ff]'
                            }`}
                          >
                            <span className="text-5xl sm:text-6xl">
                              {item.emoji}
                            </span>
                          </div>

                          <span
                            className={`text-sm ${
                              selecionado
                                ? 'font-semibold text-[#7950f5]'
                                : 'text-[#34415f]'
                            }`}
                          >
                            {item.nome}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#34415f]">
                        Nome da meta
                      </label>

                      <input
                        required
                        maxLength={60}
                        value={formulario.nome}
                        onChange={(event) =>
                          atualizarFormulario('nome', event.target.value)
                        }
                        placeholder="Ex.: Minha reserva"
                        className="h-12 w-full rounded-xl border border-[#e1e5ee] bg-white px-4 text-sm outline-none transition focus:border-[#8b73f7] focus:ring-2 focus:ring-[#8055f5]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#34415f]">
                        Quanto você precisa?
                      </label>

                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formulario.valorObjetivo}
                        onChange={(event) =>
                          atualizarFormulario(
                            'valorObjetivo',
                            event.target.value,
                          )
                        }
                        placeholder="R$ 1.000"
                        className="h-12 w-full rounded-xl border border-[#e1e5ee] bg-white px-4 text-sm outline-none transition focus:border-[#8b73f7] focus:ring-2 focus:ring-[#8055f5]/10"
                      />
                    </div>
                  </div>

                  <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#34415f]">
                        Quando quer alcançar?
                      </label>

                      <input
                        type="date"
                        value={formulario.prazo}
                        onChange={(event) =>
                          atualizarFormulario('prazo', event.target.value)
                        }
                        className="h-12 w-full min-w-0 rounded-xl border border-[#e1e5ee] bg-white px-4 text-sm outline-none transition focus:border-[#8b73f7]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#34415f]">
                        Quanto já tem?
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formulario.valorAtual}
                        onChange={(event) =>
                          atualizarFormulario(
                            'valorAtual',
                            event.target.value,
                          )
                        }
                        placeholder="R$ 0"
                        className="h-12 w-full rounded-xl border border-[#e1e5ee] bg-white px-4 text-sm outline-none transition focus:border-[#8b73f7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-4 block text-sm font-medium text-[#34415f]">
                      Escolha uma cor para sua meta
                    </label>

                    <div className="flex flex-wrap items-center gap-4">
                      {cores.map((cor) => (
                        <button
                          key={cor.valor}
                          type="button"
                          aria-label={`Selecionar cor ${cor.nome}`}
                          title={cor.nome}
                          onClick={() =>
                            atualizarFormulario('cor', cor.valor)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                          style={{
                            backgroundColor: cor.valor,
                            outline:
                              formulario.cor === cor.valor
                                ? `2px solid ${cor.valor}`
                                : 'none',
                            outlineOffset: '3px',
                          }}
                        >
                          {formulario.cor === cor.valor && (
                            <Check size={18} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section
                  className="w-full rounded-2xl p-7 xl:p-9"
                  style={{ backgroundColor: corSelecionada.fundo }}
                >
                  <h2 className="text-xl font-bold text-[#17213b]">
                    Sua meta
                  </h2>

                  <p className="mb-5 text-sm text-[#71809e]">
                    Veja como ela vai ficar.
                  </p>

                  <div className="rounded-xl bg-white p-6 text-center sm:p-7">
                    <div
                      className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full"
                      style={{ backgroundColor: corSelecionada.fundo }}
                    >
                      <span className="text-6xl">
                        {iconeSelecionado.emoji}
                      </span>
                    </div>

                    <h3 className="break-words text-2xl font-bold text-[#101b38]">
                      {formulario.nome.trim() || 'Nome da sua meta'}
                    </h3>

                    <p className="mt-2 text-base text-[#71809e]">
                      {formatarMoeda(valorAtual)} guardados de{' '}
                      {formatarMoeda(valorObjetivo)}
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-[#e9edf3]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progresso}%`,
                            backgroundColor: formulario.cor,
                          }}
                        />
                      </div>

                      <span className="text-sm font-semibold text-[#34415f]">
                        {progresso.toFixed(0)}%
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-[#8490a8]">
                      Faltam{' '}
                      {formatarMoeda(
                        Math.max(valorObjetivo - valorAtual, 0),
                      )}{' '}
                      para chegar lá
                    </p>

                    {formulario.prazo && (
                      <p className="mt-3 text-sm capitalize text-[#8490a8]">
                        Prazo: {formatarPrazo(formulario.prazo)}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-start gap-4 rounded-xl bg-white/65 p-5">
                    <Lightbulb
                      size={32}
                      className="shrink-0"
                      style={{ color: formulario.cor }}
                    />

                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: formulario.cor }}
                      >
                        Começar pequeno também conta.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#8490a8]">
                        Grandes conquistas começam com pequenos passos.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setCriandoMeta(false)}
                  className="h-12 rounded-xl border border-[#d9ddeb] bg-white px-8 text-sm font-semibold text-[#34415f] transition hover:bg-[#f8f7fc]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7950f5] px-8 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(117,77,245,0.18)] transition hover:bg-[#6740df]"
                >
                  <Plus size={18} />
                  Criar meta
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[28px] font-bold tracking-tight text-[#101b38]">
                  Metas que fazem sentido
                </h1>

                <p className="mt-1 text-base text-[#71809e]">
                  Pequenos passos para chegar onde você quer.
                </p>
              </div>

              <button
                type="button"
                onClick={abrirCriacao}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7950f5] px-6 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(117,77,245,0.18)] transition hover:bg-[#6740df]"
              >
                <Plus size={19} />
                Nova meta
              </button>
            </div>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#17213b]">
                  Suas metas
                </h2>

                <span className="text-sm text-[#8490a8]">
                  {metas.length}{' '}
                  {metas.length === 1
                    ? 'objetivo cadastrado'
                    : 'objetivos cadastrados'}
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
                    onClick={abrirCriacao}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-[#7950f5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6740df]"
                  >
                    <Plus size={17} />
                    Criar primeira meta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  {metas.map((meta) => {
                    const percentual =
                      meta.valorObjetivo > 0
                        ? Math.min(
                            (meta.valorAtual / meta.valorObjetivo) * 100,
                            100,
                          )
                        : 0

                    const itemIcone = opcoesIcones.find(
                      (item) => item.tipo === meta.icone,
                    )

                    return (
                      <article
                        key={meta.id}
                        className="min-w-0 rounded-xl border border-[#e9e9e4] bg-white p-5 shadow-[0_4px_18px_rgba(27,39,73,0.035)] transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-5 flex items-start gap-3">
                          <div
                            className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full text-4xl"
                            style={{
                              backgroundColor:
                                cores.find((cor) => cor.valor === meta.cor)
                                  ?.fundo ?? '#f0ebff',
                            }}
                          >
                            {itemIcone?.emoji ?? '🎯'}
                          </div>

                          <div className="min-w-0 flex-1 pt-2">
                            <h3 className="text-base font-bold text-[#101b38]">
                              {meta.nome}
                            </h3>

                            <p className="mt-1 text-sm leading-5 text-[#71809e]">
                              {meta.descricao || 'Meta financeira pessoal'}
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
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#edf0f5] text-[#71809e] transition hover:bg-[#f5f2ff]"
                            >
                              <MoreHorizontal size={18} />
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
                            <p className="text-2xl font-bold tracking-tight text-[#07844b]">
                              {formatarMoeda(meta.valorAtual)}
                            </p>

                            <p className="mt-1 text-sm text-[#71809e]">
                              de {formatarMoeda(meta.valorObjetivo)}
                            </p>
                          </div>

                          <span className="pb-1 text-sm font-semibold text-[#34415f]">
                            {percentual.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#e9edf3]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentual}%`,
                              backgroundColor: meta.cor,
                            }}
                          />
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#edf0f5] pt-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <CalendarDays
                              size={18}
                              className="shrink-0 text-[#172b50]"
                            />

                            <div className="min-w-0">
                              <p className="text-xs text-[#8490a8]">
                                Meta para
                              </p>

                              <p className="truncate text-xs font-semibold capitalize text-[#24304e]">
                                {formatarPrazo(meta.prazo)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setMetaSelecionada(meta)}
                            className="flex shrink-0 items-center gap-1 rounded-xl bg-[#f4efff] px-3 py-2.5 text-xs font-semibold text-[#7048f4] transition hover:bg-[#eae0ff]"
                          >
                            Ver meta
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="mt-8 flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#f5efff] to-[#eee7ff] px-6 py-6 sm:px-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#7950f5]">
                <Lightbulb size={38} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#7549f5]">
                  Você está mais perto do que parece.
                </h3>

                <p className="mt-1 text-sm leading-5 text-[#7a83a0]">
                  Grandes conquistas começam com pequenas metas. Continue assim! 💜
                </p>
              </div>
            </section>
          </>
        )}

        {metaSelecionada && !criandoMeta && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101b38]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setMetaSelecionada(null)
              }
            }}
          >
            <div className="w-full max-w-[460px] rounded-2xl bg-white p-7 shadow-2xl">
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
                const percentual = Math.min(
                  (metaSelecionada.valorAtual /
                    metaSelecionada.valorObjetivo) *
                    100,
                  100,
                )

                const itemIcone = opcoesIcones.find(
                  (item) => item.tipo === metaSelecionada.icone,
                )

                return (
                  <>
                    <div className="mb-5 rounded-xl bg-[#f3efff] px-5 py-7 text-center">
                      <span className="text-5xl">
                        {itemIcone?.emoji ?? '🎯'}
                      </span>

                      <p className="mt-3 text-3xl font-bold text-[#7048f4]">
                        {percentual.toFixed(0)}%
                      </p>

                      <p className="mt-1 text-sm text-[#78849d]">
                        do seu objetivo alcançado
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">Meta</span>
                        <strong>{metaSelecionada.nome}</strong>
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
                        <strong>
                          {formatarMoeda(metaSelecionada.valorObjetivo)}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[#8490a8]">
                          Falta alcançar
                        </span>
                        <strong>
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
                        <strong className="capitalize">
                          {formatarPrazo(metaSelecionada.prazo)}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMetaSelecionada(null)}
                      className="mt-7 h-12 w-full rounded-xl bg-[#7950f5] text-sm font-semibold text-white transition hover:bg-[#6740df]"
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
