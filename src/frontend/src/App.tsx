import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Cadastro from './pages/cadastro'
import Dashboard from './pages/dashboard'
import Login from './pages/login'
import Conexoes from './pages/conexoes'
import Planilha from './pages/planilha'
import ConfigurarPlanilha from './pages/configurar-planilha'
import PrepararPlanilha from './pages/preparar-planilha'
import PreviewPlanilha from './pages/preview-planilha'
import ConfirmarPlanilha from './pages/confirmar-planilha'
import ConfirmarPlanilhaEntradas from './pages/confirmar-planilha-entradas'

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
          path="/conexoes/planilha/confirmar"
          element={<ConfirmarPlanilha />}
        />
        <Route
          path="/conexoes/planilha/confirmar-entradas"
          element={<ConfirmarPlanilhaEntradas />}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App