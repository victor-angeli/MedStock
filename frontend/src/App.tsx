import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { MedicamentosPage } from '@/pages/MedicamentosPage'
import { EntradasPage } from '@/pages/EntradasPage'
import { SaidasPage } from '@/pages/SaidasPage'
import { EstoquePage } from '@/pages/EstoquePage'
import { AlertasPage } from '@/pages/AlertasPage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import { ColaboradoresPage } from '@/pages/ColaboradoresPage'
import { FornecedoresPage } from '@/pages/FornecedoresPage'
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage'
import { useAuthStore } from '@/store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { validateToken } = useAuthStore()

  // Valida o token ao iniciar — tokens inválidos ou expirados limpam a sessão
  useEffect(() => {
    validateToken()
  }, [])

  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App (autenticado) */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/medicamentos" element={<MedicamentosPage />} />
        <Route path="/entradas" element={<EntradasPage />} />
        <Route path="/saidas" element={<SaidasPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/alertas" element={<AlertasPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route path="/colaboradores" element={<ColaboradoresPage />} />
        <Route path="/fornecedores" element={<FornecedoresPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
