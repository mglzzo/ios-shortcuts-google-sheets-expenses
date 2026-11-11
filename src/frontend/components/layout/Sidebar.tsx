
import { useEffect, useState } from 'react'
import {
  Home,
  Receipt,
  Target,
  BookOpen,
  MoreHorizontal,
  LogOut,
  UserRound,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMe } from '../../src/services/auth.js'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

interface PreferenciasPerfil {
  objetivo?: string
  avatar?: string
}

const CHAVE_CONFIGURACAO_PERFIL = 'finly_configuracao_perfil'
const LOGO_CAMELIA = '/camelia-icon-shield.png'

const avatares: Record<string, string> = {
  roxo: '/porquinho.png',
  bone: '/avatar-bone.png',
  chapeu: '/avatar-chapeu.png',
  notebook: '/avatar-notebook.png',
  caneca: '/avatar-caneca.png',
  capivara: '/avatar-capivara.png',
}

const itensMenu = [
  { label: 'Hoje', path: '/dashboard', icon: Home },
  { label: 'Lançamentos', path: '/lancamentos', icon: Receipt },
  { label: 'Metas', path: '/metas', icon: Target },
  { label: 'Aprender', path: '/aprender', icon: BookOpen },
]

function carregarAvatar(): string | null {
  try {
    const salvo = localStorage.getItem(CHAVE_CONFIGURACAO_PERFIL)
    if (!salvo) return null

    const preferencias = JSON.parse(salvo) as PreferenciasPerfil
    return preferencias.avatar ? avatares[preferencias.avatar] ?? null : null
  } catch {
    return null
  }
}

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false)
  const [nome, setNome] = useState('Usuário')
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => carregarAvatar())

  useEffect(() => {
    getMe()
      .then((usuario) => {
        setNome(usuario.nome || 'Usuário')
      })
      .catch(() => {
        setNome('Usuário')
      })
  }, [])

  useEffect(() => {
    const atualizarAvatar = () => setAvatarSrc(carregarAvatar())

    window.addEventListener('finly-perfil-atualizado', atualizarAvatar)
    window.addEventListener('storage', atualizarAvatar)

    return () => {
      window.removeEventListener('finly-perfil-atualizado', atualizarAvatar)
      window.removeEventListener('storage', atualizarAvatar)
    }
  }, [])

  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase()

  function sair() {
    localStorage.removeItem('token')
    navigate('/login')
    onClose?.()
  }

  function navegar(path: string) {
    setMenuUsuarioAberto(false)
    navigate(path)
    onClose?.()
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[238px] flex-col
          bg-[#172b4d] text-white
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex h-[92px] shrink-0 items-center justify-start gap-3 px-4">
          <img
            src={LOGO_CAMELIA}
            alt="Logo Camélia"
            className="h-12 w-12 shrink-0 object-contain"
          />

          <span className="text-[20px] font-bold tracking-tight">
            Camélia
          </span>

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-[#c4cee0] hover:bg-white/10 md:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="mt-5 flex flex-col gap-3 px-4">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo =
              location.pathname === item.path ||
              (item.path !== '/dashboard' &&
                location.pathname.startsWith(`${item.path}/`))

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navegar(item.path)}
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-4
                  text-left text-[16px] transition
                  ${
                    ativo
                      ? 'bg-[#4a4b86] font-semibold text-white'
                      : 'text-[#b9c5dc] hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={22} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="relative">
            {menuUsuarioAberto && (
              <div className="absolute bottom-14 left-0 z-[60] w-[205px] rounded-xl border border-white/10 bg-[#20375d] p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => navegar('/configuracao-perfil')}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white transition hover:bg-white/10"
                >
                  <UserRound size={18} />
                  Personalizar perfil
                </button>

                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white transition hover:bg-white/10"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar do perfil"
                  onError={() => setAvatarSrc(null)}
                  className="h-11 w-11 shrink-0 rounded-full bg-white object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5b9a5] text-[13px] font-bold text-[#633d37]">
                  {iniciais || 'US'}
                </div>
              )}

              <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                {nome}
              </span>

              <button
                type="button"
                aria-label="Opções da conta"
                onClick={() => setMenuUsuarioAberto((v) => !v)}
                className="text-[#c4cee0] hover:text-white"
              >
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
