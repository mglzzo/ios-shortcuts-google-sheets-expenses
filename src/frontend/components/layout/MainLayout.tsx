
import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.js'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="min-h-screen w-full min-w-0 md:ml-[238px] md:w-[calc(100%-238px)]">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#e9eaf1] bg-white px-5 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#172b4d] transition hover:bg-[#f0edff]"
          >
            <Menu size={24} />
          </button>

          <img
            src="/camelia-icon-shield.png"
            alt="Camélia"
            className="h-9 w-9 object-contain"
          />

          <span className="text-[17px] font-bold text-[#172b4d]">
            Camélia
          </span>
        </div>

        {children}
      </main>
    </div>
  )
}
