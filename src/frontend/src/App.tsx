
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Cadastro from './pages/cadastro'
import Dashboard from './pages/dashboard'
import Login from './pages/login'
import Conexoes from './pages/conexoes'
import Planilha from './pages/planilha'
import ConfigurarPlanilha from './pages/configurar-planilha'
import PrepararPlanilha from './pages/preparar-planilha'
import PreviewPlanilha from './pages/confirmar-planilha'
import ConfiguracaoPerfil from './pages/configuracao-perfil'
import Lancamentos from './pages/lancamento'
import Metas from './pages/metas'
import Aprender from './pages/aprender'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/conexoes" element={<Conexoes />} />

        <Route path="/conexoes/planilha" element={<Planilha />} />

        <Route
          path="/conexoes/planilha/configurar"
          element={<ConfigurarPlanilha />}
        />

        <Route
          path="/conexoes/planilha/preview"
          element={<PreviewPlanilha />}
        />

        <Route
          path="/conexoes/planilha/preparar"
          element={<PrepararPlanilha />}
        />


        <Route
          path="/configuracao-perfil"
          element={<ConfiguracaoPerfil />}
        />

        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/aprender" element={<Aprender />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}1

export default App
