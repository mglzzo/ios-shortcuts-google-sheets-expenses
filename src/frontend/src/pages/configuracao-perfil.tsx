import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Receipt, Target, Calculator, BookOpen,
  LockKeyhole, GraduationCap, LifeBuoy, CreditCard,
  ArrowRight, Check, Circle, MoreHorizontal, LogOut, UserRound,
} from 'lucide-react'


const objetivos = [
  { id: 'aprender', titulo: 'Aprender a organizar', complemento: 'meu dinheiro', Icone: GraduationCap, cor: 'violet' },
  { id: 'metas', titulo: 'Criar minhas', complemento: 'primeiras metas', Icone: Target, cor: 'green' },
  { id: 'aperto', titulo: 'Sair do aperto', complemento: 'no fim do mês', Icone: LifeBuoy, cor: 'coral' },
  { id: 'cartao', titulo: 'Entender melhor', complemento: 'meu cartão', Icone: CreditCard, cor: 'purple' },
]

const avatares = [
  { id: 'roxo', nome: 'Porquinho', src: '/porquinho.png' },
  { id: 'bone', nome: 'Personagem de boné', src: '/avatar-bone.png' },
  { id: 'chapeu', nome: 'Personagem de chapéu', src: '/avatar-chapeu.png' },
  { id: 'notebook', nome: 'Personagem com notebook', src: '/avatar-notebook.png' },
  { id: 'caneca', nome: 'Personagem com caneca', src: '/avatar-caneca.png' },
  { id: 'capivara', nome: 'Capivara', src: '/avatar-capivara.png' },
]


function ConfiguracaoPerfil() {
  const navigate = useNavigate()
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false)
  const [renda, setRenda] = useState('')
  const [naoInformar] = useState(false)
  const [objetivo, setObjetivo] = useState('aprender')
  const [avatar, setAvatar] = useState('roxo')
  const [aviso, setAviso] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAviso('Suas escolhas estão prontas. A integração para salvar no perfil será adicionada posteriormente.')
  }

  function sair() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[238px] flex-col bg-[#172b4d] text-white md:flex">
          <div className="flex h-[92px] items-center justify-center gap-2 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#a58aff] text-[23px] font-extrabold text-[#172b4d]">F</div>
            <span className="text-[20px] font-bold tracking-tight">FinlyApp</span>
          </div>

          <nav className="mt-5 flex flex-col gap-3 px-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] text-[#b9c5dc] transition hover:bg-white/10 hover:text-white">
              <Home size={22} />
              Hoje
            </button>
            <button type="button" onClick={() => navigate('/lancamentos')} className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] text-[#b9c5dc] transition hover:bg-white/10 hover:text-white">
              <Receipt size={22} />
              Lançamentos
            </button>
            <button type="button" onClick={() => navigate('/metas')} className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] text-[#b9c5dc] transition hover:bg-white/10 hover:text-white">
              <Target size={22} />
              Metas
            </button>
            <button type="button" onClick={() => navigate('/simulador')} className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] text-[#b9c5dc] transition hover:bg-white/10 hover:text-white">
              <Calculator size={22} />
              Simulador
            </button>
            <button type="button" onClick={() => navigate('/aprender')} className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] text-[#b9c5dc] transition hover:bg-white/10 hover:text-white">
              <BookOpen size={22} />
              Aprender
            </button>
          </nav>

          <div className="mt-auto border-t border-white/10 p-5">
            <div className="relative">
              {menuUsuarioAberto && (
                <div className="absolute bottom-12 left-0 z-50 w-[205px] rounded-xl border border-white/10 bg-[#20375d] p-1.5 shadow-xl">
                  <button type="button" onClick={() => { setMenuUsuarioAberto(false); navigate('/configuracao-perfil') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white transition hover:bg-white/10">
                    <UserRound size={18} />
                    Configurar perfil
                  </button>
                  <button type="button" onClick={sair} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white transition hover:bg-white/10">
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5b9a5] text-[13px] font-bold text-[#633d37]">TE</div>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">Testegi</span>
                <button type="button" aria-label="Opções da conta" onClick={() => setMenuUsuarioAberto((v) => !v)} className="text-[#c4cee0] hover:text-white">
                  <MoreHorizontal size={22} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-h-screen w-full min-w-0 md:ml-[238px]">
          <header className="mx-auto w-full px-8 pb-5 pt-7 sm:px-10 lg:px-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#a58aff] font-bold text-[#172b4d] md:hidden">F</div>
              <div>
                <h1 className="text-[32px] font-extrabold leading-tight tracking-[-.7px] text-[#17213b] sm:text-[40px]">
                  Vamos deixar o Finly com a sua cara
                </h1>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full px-8 pb-8 sm:px-10 lg:px-12">
            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <section className="min-h-[370px] rounded-[22px] border border-[#e9ebf1] p-6 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
                  <div className="mb-[9px] flex items-center gap-[11px]">
                    <span className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#eeeaff] text-[16px] font-bold text-[#101b3b]">1</span>
                    <h2 className="text-[16px] font-bold tracking-[-.5px]">Quanto entra por mês?</h2>
                  </div>
                  <p className="mb-[19px] text-[12px] leading-[17px] text-[#7c89a4]">Considere sua renda líquida, já com os descontos.</p>
                  <div className={`flex h-[57px] items-center rounded-[10px] border ${naoInformar ? 'border-[#e0e4ed] bg-[#f8f9fc]' : 'border-[#dce1eb]'} focus-within:border-[#8a73ff]`}>
                    <span className="border-r border-[#dce1eb] px-[13px] text-[19px] font-semibold text-[#8793ad]">R$</span>
                    <input
                      aria-label="Renda mensal líquida"
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={naoInformar}
                      value={renda}
                      onChange={(e) => setRenda(e.target.value)}
                      placeholder="0,00"
                      className="h-full min-w-0 flex-1 bg-transparent px-[14px] text-[19px] font-semibold text-[#263654] outline-none placeholder:text-[#9ba6bd] disabled:opacity-40"
                    />
                  </div>
                  <div className="mt-[27px] flex items-start gap-[13px] text-[11px] leading-[14px] text-[#8b97b0]">
                    <LockKeyhole size={17} className="shrink-0 text-[#7c8ba9]" />
                    <span>Seus dados são pessoais e não serão compartilhados.</span>
                  </div>
                </section>

                <section className="min-h-[370px] rounded-[22px] border border-[#e9ebf1] p-6 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
                  <div className="mb-[9px] flex items-center gap-[11px]">
                    <span className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#eeeaff] text-[16px] font-bold text-[#101b3b]">2</span>
                    <h2 className="text-[16px] font-bold tracking-[-.5px]">O que você quer conquistar?</h2>
                  </div>
                  <p className="mb-[10px] text-[12px] leading-[17px] text-[#7c89a4]">Escolha o que mais faz sentido para você agora.</p>
                  <div className="flex flex-col gap-[7px]">
                    {objetivos.map(({ id, titulo, complemento, Icone, cor }) => {
                      const selecionado = objetivo === id
                      const cores: Record<string, string> = {
                        violet: 'bg-[#eee8ff] text-[#7654ed]',
                        green: 'bg-[#e4f7ef] text-[#21b783]',
                        coral: 'bg-[#fff0ed] text-[#ff786e]',
                        purple: 'bg-[#eeeaff] text-[#7654ed]',
                      }
                      return (
                        <button key={id} type="button" onClick={() => setObjetivo(id)} className={`flex h-[53px] items-center gap-[12px] rounded-[10px] border px-[9px] text-left transition ${selecionado ? 'border-[#a18bff] bg-[#f8f6ff]' : 'border-[#e6e9f0] bg-white hover:border-[#c9bfff]'}`}>
                          <span className={`flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full ${cores[cor]}`}><Icone size={25} strokeWidth={2.5} /></span>
                          <span className="min-w-0 flex-1 text-[12px] leading-[16px] text-[#172344]">{titulo}<br />{complemento}</span>
                          <span className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border ${selecionado ? 'border-[#7654ed] bg-[#7654ed] text-white' : 'border-[#d9deea] text-transparent'}`}>
                            {selecionado ? <Check size={12} strokeWidth={3} /> : <Circle size={13} />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="min-h-[370px] rounded-[22px] border border-[#e9ebf1] p-6 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
                  <div className="mb-[9px] flex items-center gap-[11px]">
                    <span className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#eeeaff] text-[16px] font-bold text-[#101b3b]">3</span>
                    <h2 className="text-[16px] font-bold tracking-[-.5px]">Escolha seu avatar</h2>
                  </div>
                  <p className="mb-[23px] text-[12px] leading-[17px] text-[#7c89a4]">Você pode trocar depois.</p>
                  <div className="mx-auto grid max-w-[270px] grid-cols-3 justify-items-center gap-x-[10px] gap-y-[13px]">
                    {avatares.map((item) => {
                      const selecionado = avatar === item.id
                      return (
                        <button key={item.id} type="button" aria-label={item.nome} aria-pressed={selecionado} onClick={() => setAvatar(item.id)} className={`relative h-[80px] w-[80px] rounded-full p-[2px] transition ${selecionado ? 'ring-[2px] ring-[#7452ff]' : 'hover:ring-2 hover:ring-[#d9d0ff]'}`}>
                          <img src={item.src} alt={item.nome} className="h-full w-full rounded-full object-cover" />
                          {selecionado && <span className="absolute -bottom-[1px] -right-[1px] flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 border-white bg-[#704df5] text-white"><Check size={13} strokeWidth={3} /></span>}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-[24px] text-center text-[11px] text-[#8995ad]">Escolha seu personagem</p>
                </section>
              </div>

              {aviso && <p role="status" className="mt-3 text-center text-xs text-[#6750d8]">{aviso}</p>}
              <div className="mt-6 flex justify-center">
                <button type="submit" className="flex h-12 w-full max-w-[250px] items-center justify-center gap-[10px] rounded-[11px] bg-[#6746ef] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(103,70,239,.18)] transition hover:bg-[#5838db]">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ConfiguracaoPerfil
