import { useEffect, useMemo, useState } from 'react'



import type { Dispatch, SetStateAction } from 'react'



import { useNavigate } from 'react-router-dom'



import {



  Plus,



  TrendingUp,



  TrendingDown,



  CalendarDays,



  ChevronDown,









  LoaderCircle,



} from 'lucide-react'



import MainLayout from '../../components/layout/MainLayout.js'







const API_URL = 'https\://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev'



const LIMITE_API = 50



const ITENS_POR_PAGINA = 10







const meses = [



  'Janeiro', 'Fevereiro', 'Março', 'Abril',



  'Maio', 'Junho', 'Julho', 'Agosto',



  'Setembro', 'Outubro', 'Novembro', 'Dezembro',



]







type TipoFiltro = 'todos' | 'entrada' | 'saida'



type Registro = Record<string, unknown>







interface Lancamento {



  id: string



  data: Date | null



  valor: number



  estabelecimento: string



  metodoPagamento: string



  categoria: string



  observacao: string



  origem: string



  conta: string



}







function moeda(valor: number) {



  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })



}







function converterValor(valor: unknown): number {



  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0



  if (typeof valor !== 'string') return 0







  let texto = valor.trim().replace(/[R$\s]/g, '')



  if (!texto) return 0



  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.')



  const numero = Number(texto)



  return Number.isFinite(numero) ? numero : 0



}







function converterData(valor: unknown): Date | null {



  if (typeof valor !== 'string' || !valor) return null



  const brasileira = valor.match(/^(\d{2})[/.](\d{2})[/.](\d{4})$/)



  if (brasileira) {



    const data = new Date(Number(brasileira[3]), Number(brasileira[2]) - 1, Number(brasileira[1]))



    return Number.isNaN(data.getTime()) ? null : data



  }



  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/)



  if (iso) {



    const data = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))



    return Number.isNaN(data.getTime()) ? null : data



  }



  const data = new Date(valor)



  return Number.isNaN(data.getTime()) ? null : data



}







function primeiroValor(item: Registro, chaves: string[], fallback: unknown = ''): unknown {



  for (const chave of chaves) {



    if (item[chave] !== undefined && item[chave] !== null) return item[chave]



  }



  return fallback



}







function extrairLista(resposta: unknown): { itens: Registro[]; hasMore: boolean | null; total?: number } {



  if (Array.isArray(resposta)) {



    return { itens: resposta as Registro[], hasMore: resposta.length === LIMITE_API ? null : false }



  }







  if (!resposta || typeof resposta !== 'object') {



    throw new Error('A API respondeu, mas não retornou um objeto ou uma lista JSON. Confira o Console (F12).')



  }







  const objeto = resposta as Registro



  const chavesPossiveis = ['data', 'transactions', 'transacoes', 'items', 'results', 'lancamentos']



  let lista: unknown



  let chaveEncontrada = ''







  for (const chave of chavesPossiveis) {



    if (Array.isArray(objeto[chave])) {



      lista = objeto[chave]



      chaveEncontrada = chave



      break



    }



  }







  if (!Array.isArray(lista)) {



    const campos = Object.keys(objeto).join(', ') || '(nenhum)'



    throw new Error(`Não encontrei uma lista de lançamentos na resposta. Campos recebidos: ${campos}. Veja o objeto completo no Console (F12).`)



  }







  console.info(`[Lançamentos] Lista encontrada na propriedade "${chaveEncontrada}".`)



  const hasMore = typeof objeto.hasMore === 'boolean'



    ? objeto.hasMore



    : typeof objeto.has_more === 'boolean'



      ? objeto.has_more



      : null



  const total = typeof objeto.total === 'number' ? objeto.total : undefined



  return { itens: lista as Registro[], hasMore, total }



}







function normalizar(item: Registro, indice: number): Lancamento {



  const valorOriginal = primeiroValor(item, ['valor', 'amount', 'value', 'total'], 0)



  const dataOriginal = primeiroValor(item, ['data', 'date', 'transactionDate', 'createdAt'])







  return {



    id: String(primeiroValor(item, ['id', 'transactionId', 'uuid'], `registro-${indice}`)),



    data: converterData(dataOriginal),



    valor: converterValor(valorOriginal),



    estabelecimento: String(primeiroValor(item, ['estabelecimento', 'descricao', 'description', 'merchant', 'nome'], 'Lançamento')),



    metodoPagamento: String(primeiroValor(item, ['metodoPagamento', 'formaPagamento', 'paymentMethod', 'payment_method'], '')),



    categoria: String(primeiroValor(item, ['categoria', 'category', 'categoriaPluggy', 'categoria_nome'], 'Sem categoria')),



    observacao: String(primeiroValor(item, ['observacao', 'nota', 'notes', 'memo'], '')),



    origem: String(primeiroValor(item, ['origem', 'source'], '')),



    conta: String(primeiroValor(item, ['conta', 'account'], '')),



  }



}







function formatarData(data: Date | null) {



  return data ? data.toLocaleDateString('pt-BR') : 'Data não informada'



}







function Lancamentos() {



  const navigate = useNavigate()



  const hoje = new Date()



  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth())



  const [anoSelecionado] = useState(hoje.getFullYear())



  const [menuMesAberto, setMenuMesAberto] = useState(false)



  const [filtro, setFiltro] = useState<TipoFiltro>('todos')



  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])



  const [carregando, setCarregando] = useState(true)



  const [erro, setErro] = useState('')



  const [paginaEntradas, setPaginaEntradas] = useState(1)



  const [paginaSaidas, setPaginaSaidas] = useState(1)







  useEffect(() => {



    let ativo = true







    async function buscarLancamentos() {



      setCarregando(true)



      setErro('')



      console.group('[Lançamentos] Diagnóstico GET /transactions')







      try {



        const token = localStorage.getItem('token')



        if (!token) throw new Error('Sua sessão expirou. Entre novamente.')







        const todos: Registro[] = []



        const ids = new Set<string>()



        let pagina = 1



        let continuar = true



        let modoPaginacao: 'hasMore' | 'tamanhoPagina' | null = null







        while (continuar) {



          if (pagina > 1000) throw new Error('A API ultrapassou o limite de 1.000 páginas.')







          const parametros = new URLSearchParams({ page: String(pagina), limit: String(LIMITE_API) })



          const url = `${API_URL}/transactions?${parametros.toString()}`



          console.log('Requisição:', { url, pagina, limit: LIMITE_API })







          const response = await fetch(url, {



            method: 'GET',



            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },



          })







          const texto = await response.text()



          console.log('Status HTTP:', response.status, response.statusText)



          console.log('Content-Type:', response.headers.get('content-type'))



          console.log('Resposta bruta:', texto)







          let resposta: unknown



          try {



            resposta = texto ? JSON.parse(texto) : null



          } catch {



            throw new Error('O backend não retornou JSON válido. Veja "Resposta bruta" no Console (F12).')



          }







          console.log('Resposta JSON completa:', resposta)



          if (!response.ok) {



            const obj = resposta && typeof resposta === 'object' ? resposta as Registro : {}



            throw new Error(String(obj.erro || obj.error || obj.message || `Erro HTTP ${response.status}`))



          }







          const resultado = extrairLista(resposta)



          console.log('Quantidade nesta página:', resultado.itens.length)



          console.log('Amostra do primeiro registro:', resultado.itens[0] ?? '(página vazia)')



          console.log('Campos do primeiro registro:', resultado.itens[0] ? Object.keys(resultado.itens[0]) : [])







          const antes = todos.length



          resultado.itens.forEach((item, index) => {



            const id = String(primeiroValor(item, ['id', 'transactionId', 'uuid'], `${pagina}-${index}`))



            if (!ids.has(id)) {



              ids.add(id)



              todos.push(item)



            }



          })







          if (resultado.hasMore !== null) {



            modoPaginacao = 'hasMore'



            continuar = resultado.hasMore



          } else {



            modoPaginacao = 'tamanhoPagina'



            continuar = resultado.itens.length === LIMITE_API



          }







          if (continuar && (resultado.itens.length === 0 || todos.length === antes)) {



            throw new Error('A API indicou mais páginas, mas não trouxe novos registros. Verifique a paginação do backend.')



          }



          pagina++



        }







        console.log('Total de registros únicos recebidos:', todos.length)



        console.log('Estratégia de paginação utilizada:', modoPaginacao)



        console.log('Amostra dos registros recebidos:', todos.slice(0, 3))







        if (!ativo) return



        setLancamentos(todos.map(normalizar))



      } catch (e) {



        console.error('[Lançamentos] Falha:', e)



        if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar os lançamentos.')



      } finally {



        console.groupEnd()



        if (ativo) setCarregando(false)



      }



    }







    buscarLancamentos()



    return () => { ativo = false }



  }, [])







  const lancamentosDoMes = useMemo(() => lancamentos



    .filter(item => item.data && item.data.getMonth() === mesSelecionado && item.data.getFullYear() === anoSelecionado)



    .sort((a, b) => (b.data?.getTime() ?? 0) - (a.data?.getTime() ?? 0)), [lancamentos, mesSelecionado, anoSelecionado])







  const entradas = useMemo(() => lancamentosDoMes.filter(item => item.valor > 0), [lancamentosDoMes])



  const saidas = useMemo(() => lancamentosDoMes.filter(item => item.valor < 0), [lancamentosDoMes])



  const totalEntradas = entradas.reduce((total, item) => total + item.valor, 0)



  const totalSaidas = saidas.reduce((total, item) => total + Math.abs(item.valor), 0)







  useEffect(() => {



    setPaginaEntradas(1)



    setPaginaSaidas(1)



  }, [mesSelecionado, anoSelecionado, filtro])







  function renderPaginacao(total: number, pagina: number, setPagina: Dispatch<SetStateAction<number>>) {
    const paginas = Math.ceil(total / ITENS_POR_PAGINA)
    if (paginas <= 1) return null

    return (
      <div className="flex items-center justify-between gap-3 border-t border-[#edf0f5] px-5 py-4">
        <button
          type="button"
          disabled={pagina === 1}
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          className="rounded-lg border border-[#e6e9f0] px-4 py-2 text-sm font-medium text-[#52607b] transition hover:bg-[#f7f5ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        <button
          type="button"
          disabled={pagina === paginas}
          onClick={() => setPagina(p => Math.min(paginas, p + 1))}
          className="rounded-lg border border-[#e6e9f0] px-4 py-2 text-sm font-medium text-[#52607b] transition hover:bg-[#f7f5ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    )
  }


  function renderHistorico(titulo: string, itens: Lancamento[], tipo: 'entrada' | 'saida', pagina: number, setPagina: Dispatch<SetStateAction<number>>) {



    const visiveis = itens.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)



    const cor = tipo === 'entrada' ? '#078c5d' : '#f0524b'



    return (



      <section className="overflow-hidden rounded-[16px] border border-[#e6e9f0] bg-white shadow-[0_2px_8px_rgba(34,45,80,.025)]">



        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f7f8fb] px-5 py-4">



          <h2 className="text-[17px] font-bold">{titulo}</h2>



          <span className="text-[13px] text-[#8290aa]">{itens.length} {itens.length === 1 ? 'lançamento' : 'lançamentos'}</span>



        </div>



        {visiveis.length === 0 ? (



          <div className="flex min-h-[100px] items-center justify-center px-5 py-6 text-center text-[14px] text-[#9aa5b8]">Nenhum lançamento encontrado neste mês.</div>



        ) : (



          <div className="divide-y divide-[#edf0f5]">



            {visiveis.map(item => (



              <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">



                <div className="flex min-w-0 items-center gap-3">



                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tipo === 'entrada' ? 'bg-[#d6f5e8] text-[#0a9b68]' : 'bg-[#ffe0df] text-[#f45f55]'}`}>



                    {tipo === 'entrada' ? <TrendingUp size={19} /> : <TrendingDown size={19} />}



                  </span>



                  <div className="min-w-0">



                    <p className="truncate text-[14px] font-semibold text-[#263550]">{item.estabelecimento}</p>



                    <p className="mt-0.5 truncate text-[12px] text-[#8290aa]">{item.categoria}</p>



                    <p className="mt-0.5 text-[12px] text-[#9aa5b8]">{formatarData(item.data)}{item.metodoPagamento ? ` • ${item.metodoPagamento}` : ''}</p>



                  </div>



                </div>



                <div className="sm:text-right">



                  <p className="text-[16px] font-bold" style={{ color: cor }}>{moeda(item.valor)}</p>



                  {item.observacao && <p className="mt-0.5 max-w-[220px] truncate text-[12px] text-[#9aa5b8] sm:ml-auto">{item.observacao}</p>}



                </div>



              </div>



            ))}



          </div>



        )}



        {renderPaginacao(itens.length, pagina, setPagina)}



      </section>



    )



  }







  return (



    <MainLayout>



      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">



        <header className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-7 sm:px-10 lg:px-12">



          <div>



            <h1 className="text-[34px] font-extrabold leading-tight tracking-[-.7px] sm:text-[40px]">Seus lançamentos</h1>



            <p className="mt-1 text-[17px] text-[#77839e] sm:text-[20px]">Veja para onde seu dinheiro está indo.</p>



          </div>



          <div className="flex items-center gap-2">






            <div className="relative">



              <button type="button" onClick={() => setMenuMesAberto(v => !v)} className="flex items-center gap-2 rounded-xl border border-[#e6e8f0] bg-white px-4 py-3 text-[14px] text-[#34415e] shadow-sm sm:px-5 sm:text-[15px]"><CalendarDays size={19} />{meses[mesSelecionado]} {anoSelecionado}<ChevronDown size={13} /></button>



              {menuMesAberto && <div className="absolute right-0 top-14 z-40 max-h-64 w-44 overflow-y-auto rounded-xl border border-[#e6e8f0] bg-white p-1.5 shadow-xl">{meses.map((mes, index) => <button key={mes} type="button" onClick={() => { setMesSelecionado(index); setMenuMesAberto(false) }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${mesSelecionado === index ? 'bg-violet-50 font-semibold text-violet-700' : 'text-[#52607b] hover:bg-slate-50'}`}>{mes} {anoSelecionado}</button>)}</div>}



            </div>






          </div>



        </header>







        <div className="mx-auto w-full space-y-5 px-5 pb-8 sm:px-10 lg:px-12">



          {erro && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}







          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">



            <article className="min-h-[130px] rounded-[18px] border border-[#dff1e9] bg-[#f2fbf7] p-6"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6f5e8] text-[#0a9b68]"><TrendingUp size={25} /></span><div><h2 className="text-[16px] font-bold">Entradas</h2><p className="mt-1 text-[30px] font-extrabold leading-none text-[#078c5d]">{carregando ? '...' : moeda(totalEntradas)}</p></div></div></article>



            <article className="min-h-[130px] rounded-[18px] border border-[#f7e2e2] bg-[#fff5f5] p-6"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe0df] text-[#f45f55]"><TrendingDown size={25} /></span><div><h2 className="text-[16px] font-bold">Saídas</h2><p className="mt-1 text-[30px] font-extrabold leading-none text-[#f0524b]">{carregando ? '...' : moeda(totalSaidas)}</p></div></div></article>



          </section>







          <section className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">



            <div className="flex w-fit items-center gap-1 rounded-full border border-[#e8e9f0] bg-white p-1 shadow-sm">



              {(['todos', 'entrada', 'saida'] as const).map(opcao => <button key={opcao} type="button" onClick={() => setFiltro(opcao)} className={`rounded-full px-6 py-2 text-[14px] font-medium ${filtro === opcao ? 'bg-[#eee8ff] text-[#6848ed]' : 'text-[#697793] hover:bg-slate-50'}`}>{opcao === 'todos' ? 'Todos' : opcao === 'entrada' ? 'Entradas' : 'Saídas'}</button>)}



            </div>



            <button type="button" onClick={() => navigate('/conexoes')} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7653f5] px-6 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#6543e8] md:w-auto"><Plus size={19} />Adicionar um novo lançamento</button>



          </section>







          {carregando ? <div className="flex min-h-[180px] items-center justify-center gap-3 rounded-[16px] border border-[#e6e9f0] bg-white text-[14px] text-[#8290aa]"><LoaderCircle size={20} className="animate-spin" />Carregando seus lançamentos...</div> : <>



            {(filtro === 'todos' || filtro === 'entrada') && renderHistorico('Entradas', entradas, 'entrada', paginaEntradas, setPaginaEntradas)}



            {(filtro === 'todos' || filtro === 'saida') && renderHistorico('Saídas', saidas, 'saida', paginaSaidas, setPaginaSaidas)}



          </>}



        </div>



      </div>



    </MainLayout>



  )



}







export default Lancamentos
