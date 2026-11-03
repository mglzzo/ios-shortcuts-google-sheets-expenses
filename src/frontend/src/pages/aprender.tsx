import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Leaf,
  Lightbulb,
  PiggyBank,
  ReceiptText,
  Target,
  Wallet,
  X,
  TrendingUp,
  Banknote,
  ShoppingBag,
  CircleDollarSign,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout'

type Categoria = 'cartao' | 'parcelas' | 'habitos'

type TipoIlustracao =
  | 'cartao'
  | 'juros'
  | 'reserva'
  | 'pix'
  | 'fatura'
  | 'calendario'
  | 'economia'
  | 'meta'
  | 'compras'

interface Conteudo {
  id: number
  titulo: string
  descricao: string
  duracao: string
  categoria: Categoria[]
  icone: TipoIlustracao
  introducao: string
  topicos: string[]
  exemplo: string
  dica: string
}

const abas: {
  id: Categoria
  nome: string
  icone: LucideIcon
}[] = [
  { id: 'cartao', nome: 'Cartão', icone: CreditCard },
  { id: 'parcelas', nome: 'Parcelas', icone: Wallet },
  { id: 'habitos', nome: 'Hábitos', icone: Leaf },
]

const conteudos: Conteudo[] = [

  {
    id: 1,
    titulo: 'Parcelado também compromete',
    descricao: 'Entenda o que acontece com seu limite.',
    duracao: '2 min',
    categoria: ['cartao', 'parcelas'],
    icone: 'cartao',
    introducao:
      'Parcelar uma compra pode parecer uma ótima solução, mas é importante entender como isso afeta seu orçamento nos próximos meses.',
    topicos: [
      'Cada parcela compromete uma parte da sua renda futura.',
      'Várias compras pequenas podem virar uma dívida grande.',
      'Antes de parcelar, some todas as parcelas que já possui.',
      'Considere se a compra realmente cabe no seu orçamento.',
    ],
    exemplo:
      'Imagine que você compre um celular de R$ 1.200 em 10 parcelas de R$ 120. Mesmo que pague apenas R$ 120 neste mês, os outros R$ 1.080 já estão comprometidos nos meses seguintes.',
    dica:
      'Antes de fazer uma nova compra parcelada, confira quanto da sua renda já está comprometido com parcelas anteriores.',
  },
  {
    id: 2,
    titulo: 'Juros sem mistério',
    descricao: 'O básico para não pagar mais do que precisa.',
    duracao: '3 min',
    categoria: ['cartao', 'parcelas'],
    icone: 'juros',
    introducao:
      'Os juros representam o custo de utilizar um dinheiro emprestado ou deixar uma dívida em aberto. Entender como funcionam ajuda a evitar surpresas.',
    topicos: [
      'O pagamento mínimo do cartão pode gerar juros elevados.',
      'O rotativo do cartão pode aumentar rapidamente sua dívida.',
      'Compare o custo total antes de contratar um parcelamento.',
      'Sempre que possível, pague o valor integral da fatura.',
    ],
    exemplo:
      'Se você deixar uma dívida de R$ 500 em aberto, os juros e encargos podem fazer esse valor aumentar. Por isso, pagar apenas uma parte da fatura pode sair muito mais caro.',
    dica:
      'Sempre confira o Custo Efetivo Total (CET) antes de contratar crédito ou parcelar uma dívida.',
  },
  {
    id: 3,
    titulo: 'Crédito ou débito: qual a diferença?',
    descricao: 'Entenda quando usar cada forma de pagamento.',
    duracao: '3 min',
    categoria: ['cartao'],
    icone: 'cartao',
    introducao:
      'No débito, o dinheiro sai diretamente da sua conta. No crédito, você utiliza um limite disponibilizado pelo banco e paga posteriormente na fatura.',
    topicos: [
      'Débito: o valor é descontado imediatamente da sua conta.',
      'Crédito: você paga a compra na fatura.',
      'O crédito pode ajudar na organização, desde que seja controlado.',
      'Escolha a modalidade considerando seu dinheiro disponível.',
    ],
    exemplo:
      'Uma compra de R$ 100 no débito reduz seu saldo imediatamente. A mesma compra no crédito entra na fatura e deverá ser paga no vencimento.',
    dica:
      'Não escolha o crédito apenas porque você ainda possui limite. Pense primeiro se terá dinheiro para pagar a fatura.',
  },
  {
    id: 4,
    titulo: 'Seu limite não é dinheiro extra',
    descricao: 'Aprenda a não confundir crédito com renda.',
    duracao: '2 min',
    categoria: ['cartao'],
    icone: 'cartao',
    introducao:
      'Ter R$ 5.000 de limite no cartão não significa ter R$ 5.000 disponíveis na sua conta. O limite é uma possibilidade de compra que gera uma obrigação de pagamento.',
    topicos: [
      'Limite disponível não representa dinheiro que você possui.',
      'Toda compra no crédito precisará ser paga posteriormente.',
      'Considere sua renda antes de utilizar o limite.',
      'Evite gastar apenas porque ainda existe limite disponível.',
    ],
    exemplo:
      'Se você recebe R$ 2.500 por mês e possui R$ 5.000 de limite, não significa que pode gastar R$ 5.000 sem comprometer suas contas.',
    dica:
      'Estabeleça um limite pessoal de gastos no cartão, de acordo com sua renda, mesmo que o banco ofereça um valor maior.',
  },
  {
    id: 5,
    titulo: 'Entenda sua fatura do cartão',
    descricao: 'Saiba exatamente o que está pagando.',
    duracao: '3 min',
    categoria: ['cartao', 'parcelas'],
    icone: 'fatura',
    introducao:
      'A fatura reúne as compras realizadas no cartão durante um período. Acompanhar esse documento ajuda a identificar gastos e evitar dívidas.',
    topicos: [
      'Confira todas as compras registradas.',
      'Verifique cobranças recorrentes e assinaturas.',
      'Confira parcelas de compras anteriores.',
      'Sempre que possível, pague a fatura integralmente.',
    ],
    exemplo:
      'Sua fatura pode conter uma compra de R$ 150 no mercado, R$ 80 de assinatura e R$ 120 de uma parcela antiga. Tudo isso compõe o valor que você precisará pagar.',
    dica:
      'Não espere a fatura fechar para conferir seus gastos. Acompanhe as compras durante o mês.',
  },
  {
    id: 6,
    titulo: 'Fechamento e vencimento da fatura',
    descricao: 'Descubra o melhor momento para comprar.',
    duracao: '3 min',
    categoria: ['cartao'],
    icone: 'calendario',
    introducao:
      'O fechamento indica o encerramento do período de compras da fatura. O vencimento é a data limite para realizar o pagamento.',
    topicos: [
      'Fechamento: encerra o período de compras.',
      'Vencimento: prazo para pagar a fatura.',
      'Compras após o fechamento geralmente entram na próxima fatura.',
      'Organize suas compras considerando a data de vencimento.',
    ],
    exemplo:
      'Se sua fatura fecha no dia 10 e vence no dia 17, uma compra feita no dia 11 geralmente será cobrada na fatura seguinte.',
    dica:
      'Conheça as datas da sua fatura e programe o pagamento para não esquecer o vencimento.',
  },


  {
    id: 7,
    titulo: 'Parcelar sem juros vale a pena?',
    descricao: 'Nem toda parcela cabe no seu orçamento.',
    duracao: '3 min',
    categoria: ['cartao', 'parcelas'],
    icone: 'juros',
    introducao:
      'Uma compra parcelada sem juros pode facilitar o planejamento, mas várias parcelas acumuladas comprometem sua renda futura.',
    topicos: [
      'Compare o preço parcelado com o preço à vista.',
      'Verifique se existe desconto para pagamento à vista.',
      'Some as parcelas que você já possui.',
      'Não comprometa toda sua renda com compras futuras.',
    ],
    exemplo:
      'Um produto custa R$ 1.000 à vista ou 10 parcelas de R$ 100. O parcelamento pode ser interessante, mas você precisa considerar os outros compromissos financeiros que já possui.',
    dica:
      'Parcelamento sem juros não significa compra sem impacto no orçamento. Planeje todas as parcelas.',
  },
  {
    id: 8,
    titulo: 'Como evitar o efeito bola de neve',
    descricao: 'Entenda como uma dívida pode crescer.',
    duracao: '4 min',
    categoria: ['cartao', 'parcelas'],
    icone: 'juros',
    introducao:
      'Quando uma dívida não é paga, os juros e encargos podem aumentar o valor devido. Isso pode dificultar cada vez mais a quitação.',
    topicos: [
      'Evite pagar apenas o mínimo da fatura.',
      'Não utilize novos empréstimos sem avaliar os custos.',
      'Priorize dívidas com juros mais elevados.',
      'Procure negociar dívidas antes que aumentem.',
    ],
    exemplo:
      'Uma pessoa que não consegue pagar a fatura integral pode acabar utilizando o crédito novamente para cobrir outras despesas. Assim, as dívidas começam a se acumular.',
    dica:
      'Liste todas as suas dívidas, os valores e os juros. Ter clareza sobre o problema é o primeiro passo para resolvê-lo.',
  },
  {
    id: 9,
    titulo: 'Juros compostos: como funcionam?',
    descricao: 'Descubra como os juros crescem com o tempo.',
    duracao: '4 min',
    categoria: ['parcelas', 'habitos'],
    icone: 'economia',
    introducao:
      'Juros compostos são juros calculados sobre o valor inicial e também sobre os juros acumulados anteriormente. Eles podem trabalhar a favor ou contra você.',
    topicos: [
      'Uma dívida pode crescer com a acumulação de juros.',
      'Investimentos também podem se beneficiar dos juros compostos.',
      'Tempo e taxa de juros influenciam o resultado.',
      'Começar a investir cedo pode fazer diferença no longo prazo.',
    ],
    exemplo:
      'Imagine investir R$ 1.000 e obter rendimentos. No próximo período, os juros podem ser calculados sobre os R$ 1.000 mais os rendimentos anteriores.',
    dica:
      'Entenda os juros antes de contratar empréstimos. Em investimentos, avalie também riscos, taxas e impostos.',
  },

 
  {
    id: 10,
    titulo: 'Como montar uma reserva',
    descricao: 'Comece com pouco e crie constância.',
    duracao: '4 min',
    categoria: ['habitos'],
    icone: 'reserva',
    introducao:
      'Uma reserva financeira ajuda a lidar com imprevistos sem precisar recorrer ao cartão de crédito ou a empréstimos.',
    topicos: [
      'Comece guardando um valor que caiba no seu orçamento.',
      'Defina uma quantia mensal para guardar.',
      'Mantenha sua reserva separada do dinheiro do dia a dia.',
      'Construa sua reserva gradualmente, sem comprometer suas contas.',
    ],
    exemplo:
      'Se você guardar R$ 100 todos os meses, ao final de um ano terá acumulado R$ 1.200, sem considerar possíveis rendimentos.',
    dica:
      'Não espere sobrar dinheiro para guardar. Defina um valor possível e inclua esse compromisso no planejamento mensal.',
  },
  {
    id: 11,
    titulo: 'Como começar a guardar dinheiro?',
    descricao: 'Não precisa ganhar muito para começar.',
    duracao: '3 min',
    categoria: ['habitos'],
    icone: 'reserva',
    introducao:
      'Guardar dinheiro é um hábito que pode começar com pequenas quantias. O segredo é encontrar um valor possível dentro da sua realidade financeira.',
    topicos: [
      'Anote quanto você ganha e quanto gasta.',
      'Defina um valor mensal para guardar.',
      'Separe esse dinheiro assim que receber.',
      'Aumente o valor guardado conforme sua situação melhorar.',
    ],
    exemplo:
      'Guardar R$ 5 por dia representa aproximadamente R$ 150 em um mês de 30 dias. Pequenos valores também podem construir bons resultados.',
    dica:
      'Comece com uma quantia pequena, mas mantenha a frequência. Criar o hábito é mais importante do que começar com muito dinheiro.',
  },
  {
    id: 12,
    titulo: 'Regra 50/30/20',
    descricao: 'Uma maneira simples de organizar sua renda.',
    duracao: '4 min',
    categoria: ['habitos'],
    icone: 'economia',
    introducao:
      'A regra 50/30/20 é um modelo de organização financeira que divide a renda em três grupos. É uma referência inicial, não uma obrigação.',
    topicos: [
      '50% para necessidades, como moradia e alimentação.',
      '30% para desejos e lazer.',
      '20% para objetivos financeiros e quitação de dívidas.',
      'Adapte as proporções à sua realidade.',
    ],
    exemplo:
      'Com uma renda de R$ 2.000, a divisão sugerida seria R$ 1.000 para necessidades, R$ 600 para desejos e R$ 400 para objetivos financeiros.',
    dica:
      'Se suas despesas essenciais ultrapassam 50%, não se preocupe. Adapte a regra para sua realidade e faça ajustes gradualmente.',
  },
  {
    id: 13,
    titulo: 'Pequenos gastos que pesam no orçamento',
    descricao: 'Identifique para onde seu dinheiro está indo.',
    duracao: '3 min',
    categoria: ['habitos'],
    icone: 'compras',
    introducao:
      'Pequenas compras frequentes podem parecer inofensivas, mas quando somadas representam uma parte importante do orçamento.',
    topicos: [
      'Observe gastos frequentes com delivery.',
      'Revise assinaturas que você quase não utiliza.',
      'Acompanhe pequenas compras por impulso.',
      'Some os gastos da semana para enxergar o impacto mensal.',
    ],
    exemplo:
      'Um lanche de R$ 25 comprado quatro vezes por semana representa aproximadamente R$ 400 em um mês de quatro semanas.',
    dica:
      'Anote os pequenos gastos durante sete dias. Você pode se surpreender com o resultado.',
  },
  {
    id: 14,
    titulo: 'Como criar uma meta de economia?',
    descricao: 'Transforme seus planos em objetivos reais.',
    duracao: '3 min',
    categoria: ['habitos'],
    icone: 'meta',
    introducao:
      'Uma meta financeira transforma um desejo em um objetivo com valor e prazo definidos. Assim, fica mais fácil acompanhar seu progresso.',
    topicos: [
      'Defina exatamente o que deseja conquistar.',
      'Estabeleça quanto precisa guardar.',
      'Escolha um prazo realista.',
      'Divida o objetivo em pequenas contribuições mensais.',
    ],
    exemplo:
      'Se você deseja juntar R$ 2.400 em um ano, precisará guardar R$ 200 por mês, considerando que não haja rendimentos.',
    dica:
      'Crie metas menores e acompanhe seu progresso. Cada etapa concluída ajuda a manter a motivação.',
  },
  {
    id: 15,
    titulo: 'Onde guardar sua reserva?',
    descricao: 'Conheça os cuidados antes de escolher.',
    duracao: '4 min',
    categoria: ['habitos'],
    icone: 'reserva',
    introducao:
      'A reserva de emergência deve priorizar segurança, liquidez e facilidade de acesso. Não é necessário buscar grandes rendimentos assumindo riscos desnecessários.',
    topicos: [
      'Priorize investimentos de baixo risco.',
      'Verifique se é possível resgatar o dinheiro rapidamente.',
      'Entenda as condições e taxas antes de investir.',
      'Evite deixar sua reserva em aplicações com carência.',
    ],
    exemplo:
      'Uma aplicação com resgate imediato pode ser mais adequada para emergências do que um investimento que exige esperar vários meses para retirar o dinheiro.',
    dica:
      'Compare liquidez, segurança, taxas e condições de resgate. Não escolha uma aplicação somente pela promessa de rendimento.',
  },
  {
    id: 16,
    titulo: 'Pix, cartão ou débito?',
    descricao: 'Escolha melhor em cada situação.',
    duracao: '2 min',
    categoria: ['cartao', 'habitos'],
    icone: 'pix',
    introducao:
      'Cada forma de pagamento possui características diferentes. O importante é entender como cada uma influencia seu controle financeiro.',
    topicos: [
      'Débito: o dinheiro sai diretamente da sua conta.',
      'Pix: permite transferências e pagamentos instantâneos.',
      'Crédito: permite pagar posteriormente, mas exige controle.',
      'Escolha a modalidade considerando seu planejamento financeiro.',
    ],
    exemplo:
      'Você pode utilizar Pix para transferir dinheiro, débito para compras do cotidiano e crédito para compras planejadas que cabem na sua renda.',
    dica:
      'Independentemente da forma de pagamento, registre suas despesas para saber exatamente quanto está gastando.',
  },
]

const desafios = [
  'Anote todos os seus gastos do dia.',
  'Confira suas compras no cartão.',
  'Identifique um gasto que pode reduzir.',
  'Revise suas assinaturas e cobranças recorrentes.',
  'Confira suas parcelas futuras.',
  'Defina quanto deseja guardar no próximo mês.',
  'Revise seu orçamento e comemore seu progresso.',
]

function Ilustracao({ tipo }: { tipo: TipoIlustracao }) {
  const fundos: Record<TipoIlustracao, string> = {
    cartao: 'bg-[#f0eaff]',
    juros: 'bg-[#e8f7ef]',
    reserva: 'bg-[#e8f7ef]',
    pix: 'bg-[#f0eaff]',
    fatura: 'bg-[#eaf2ff]',
    calendario: 'bg-[#fff3e9]',
    economia: 'bg-[#e8f7ef]',
    meta: 'bg-[#f0eaff]',
    compras: 'bg-[#fff0f0]',
  }

  const icones: Record<TipoIlustracao, LucideIcon> = {
    cartao: CreditCard,
    juros: TrendingUp,
    reserva: PiggyBank,
    pix: Wallet,
    fatura: ReceiptText,
    calendario: CalendarDays,
    economia: Banknote,
    meta: Target,
    compras: ShoppingBag,
  }

  const Icone = icones[tipo]

  return (
    <div className="relative flex h-[132px] w-full items-center justify-center overflow-hidden">
      <div
        className={`absolute h-[108px] w-[170px] rounded-full ${fundos[tipo]}`}
      />
      <div className="relative flex h-[76px] w-[88px] items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_rgba(64,54,120,0.10)]">
        <Icone
          size={45}
          strokeWidth={1.7}
          className="text-[#8058ef]"
        />
      </div>
      <div className="absolute right-[22%] top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#ffbd57] text-[10px] font-bold text-white shadow-sm">
        {tipo === 'juros' || tipo === 'economia' ? 'R$' : '✓'}
      </div>
      <Sparkles
        size={21}
        className="absolute bottom-5 left-[23%] text-[#8b69f5]"
      />
    </div>
  )
}

export default function Aprender() {
  const [abaAtiva, setAbaAtiva] = useState<Categoria>('cartao')

  const [conteudoSelecionado, setConteudoSelecionado] =
    useState<Conteudo | null>(null)

  const [concluidos, setConcluidos] = useState<number[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('finly-aprender-concluidos') || '[]',
      )
    } catch {
      return []
    }
  })

  const [desafioIniciado, setDesafioIniciado] = useState(
    () => localStorage.getItem('finly-desafio-iniciado') === 'true',
  )

  const [diasConcluidos, setDiasConcluidos] = useState<number[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('finly-desafio-dias') || '[]',
      )
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(
      'finly-aprender-concluidos',
      JSON.stringify(concluidos),
    )
  }, [concluidos])

  useEffect(() => {
    localStorage.setItem(
      'finly-desafio-iniciado',
      String(desafioIniciado),
    )
  }, [desafioIniciado])

  useEffect(() => {
    localStorage.setItem(
      'finly-desafio-dias',
      JSON.stringify(diasConcluidos),
    )
  }, [diasConcluidos])

  const conteudosFiltrados = conteudos.filter((conteudo) =>
    conteudo.categoria.includes(abaAtiva),
  )

  const progressoGeral = Math.round(
    (concluidos.length / conteudos.length) * 100,
  )

  function marcarConcluido(id: number) {
    setConcluidos((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((item) => item !== id)
        : [...anteriores, id],
    )
  }

  function alternarDia(dia: number) {
    setDiasConcluidos((anteriores) =>
      anteriores.includes(dia)
        ? anteriores.filter((item) => item !== dia)
        : [...anteriores, dia],
    )
  }

  return (
    <MainLayout>
      <main className="min-h-screen w-full min-w-0 bg-transparent px-5 py-6 text-[#17213b] sm:px-7 lg:px-8">

        {/* CABEÇALHO */}
        <header className="mb-5">
          <h1 className="text-[26px] font-bold tracking-tight text-[#101b38] sm:text-[29px]">
            Aprenda sem complicação
          </h1>
          <p className="mt-1 text-sm text-[#71809e] sm:text-base">
            Conteúdos rápidos para cuidar melhor do seu dinheiro.
          </p>
        </header>

        <nav className="mb-5 flex flex-wrap gap-3">
          {abas.map((aba) => {
            const Icone = aba.icone
            const ativa = abaAtiva === aba.id

            return (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium transition sm:px-5 ${
                  ativa
                    ? 'border-[#f0eaff] bg-[#f0eaff] text-[#7549f5]'
                    : 'border-[#e9e9ee] bg-white text-[#34415f] hover:border-[#cfc0ff] hover:bg-[#faf8ff]'
                }`}
              >
                <Icone size={17} />
                {aba.nome}
              </button>
            )
          })}
        </nav>

        <section className="mb-5 rounded-xl border border-[#ece9f4] bg-white p-4 shadow-[0_4px_18px_rgba(27,39,73,0.025)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0eaff] text-[#7950f5]">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#17213b]">
                  Seu aprendizado
                </h2>
                <p className="text-xs text-[#8490a8]">
                  Continue aprendendo no seu ritmo.
                </p>
              </div>
            </div>

            <span className="text-sm font-bold text-[#7950f5]">
              {concluidos.length} de {conteudos.length} conteúdos
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0f5]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9c7aff] to-[#7048e8] transition-all duration-500"
              style={{ width: `${progressoGeral}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-[#8490a8]">
            <span>{progressoGeral}% concluído</span>
            <span>
              {progressoGeral === 100
                ? 'Parabéns! Você concluiu tudo!'
                : 'Cada conteúdo é um passo a mais.'}
            </span>
          </div>
        </section>


        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#101b38]">
              Conteúdos para você
            </h2>
            <span className="text-xs text-[#8490a8]">
              {conteudosFiltrados.length} conteúdos disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {conteudosFiltrados.map((conteudo) => {
              const concluido = concluidos.includes(conteudo.id)

              return (
                <article
                  key={conteudo.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e9e9e4] bg-white shadow-[0_4px_18px_rgba(27,39,73,0.035)] transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => setConteudoSelecionado(conteudo)}
                    className="flex flex-1 flex-col text-left"
                  >
                    <Ilustracao tipo={conteudo.icone} />

                    <div className="flex flex-1 flex-col px-4 pb-3">
                      <h3 className="text-[16px] font-bold leading-tight text-[#101b38]">
                        {conteudo.titulo}
                      </h3>

                      <p className="mt-1 text-[13px] leading-[1.5] text-[#71809e]">
                        {conteudo.descricao}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-2 rounded-full bg-[#f4f1ff] px-2.5 py-1 text-[11px] text-[#34415f]">
                      <Clock3 size={13} />
                      {conteudo.duracao}
                    </div>

                    {concluido ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#159b65]">
                        <CheckCircle2 size={15} />
                        Concluído
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Abrir ${conteudo.titulo}`}
                        onClick={() => setConteudoSelecionado(conteudo)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1edff] text-[#7950f5] transition group-hover:bg-[#7950f5] group-hover:text-white"
                      >
                        <ArrowRight size={19} />
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>


  
        {conteudoSelecionado && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101b38]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setConteudoSelecionado(null)
              }
            }}
          >
            <div className="my-auto max-h-[90vh] w-full max-w-[580px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7950f5]">
                    Aprenda sobre finanças
                  </span>

                  <h2 className="mt-2 text-xl font-bold text-[#101b38]">
                    {conteudoSelecionado.titulo}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[#8490a8]">
                    <Clock3 size={14} />
                    Leitura de {conteudoSelecionado.duracao}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConteudoSelecionado(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f8] text-[#53607b] transition hover:bg-[#e9e5f7]"
                  aria-label="Fechar conteúdo"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-xl bg-[#f5f1ff] p-4">
                <p className="text-sm leading-6 text-[#53617f]">
                  {conteudoSelecionado.introducao}
                </p>
              </div>

              <h3 className="mb-4 mt-6 text-sm font-bold text-[#17213b]">
                O que você precisa saber
              </h3>

              <div className="space-y-4">
                {conteudoSelecionado.topicos.map((topico, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-xs font-bold text-[#7950f5]">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-5 text-[#53617f]">
                      {topico}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#e9e5f5] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CircleDollarSign
                    size={18}
                    className="text-[#7950f5]"
                  />
                  <h3 className="text-sm font-bold text-[#17213b]">
                    Exemplo prático
                  </h3>
                </div>

                <p className="text-sm leading-6 text-[#64718c]">
                  {conteudoSelecionado.exemplo}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-[#eaf8f1] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb size={18} className="text-[#159b65]" />
                  <h3 className="text-sm font-bold text-[#137c53]">
                    Dica para o seu dia a dia
                  </h3>
                </div>

                <p className="text-sm leading-6 text-[#477761]">
                  {conteudoSelecionado.dica}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!concluidos.includes(conteudoSelecionado.id)) {
                    marcarConcluido(conteudoSelecionado.id)
                  }
                  setConteudoSelecionado(null)
                }}
                className={`mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                  concluidos.includes(conteudoSelecionado.id)
                    ? 'bg-[#eaf8f1] text-[#159b65]'
                    : 'bg-[#7950f5] text-white hover:bg-[#6740df]'
                }`}
              >
                <CheckCircle2 size={17} />
                {concluidos.includes(conteudoSelecionado.id)
                  ? 'Conteúdo já concluído'
                  : 'Marcar como concluído'}
              </button>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  )
}
