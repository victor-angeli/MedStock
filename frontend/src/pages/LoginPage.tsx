import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import logoMedstock from '@/assets/logo_medstock.jpg'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // TODO: chamar api.post('/auth/login', { email, password })
      // Mock: lê org cadastrada em RegisterPage (localStorage) ou usa padrão
      const savedOrg = localStorage.getItem('medstock-org')
      const orgData  = savedOrg ? JSON.parse(savedOrg) : null

      // Mock: verifica se é colaborador cadastrado pelo admin
      const savedColabs = localStorage.getItem('medstock-colaboradores')
      const colabs: Array<{ nome: string; email: string; senha: string; role: string; cargo: string }> =
        savedColabs ? JSON.parse(savedColabs) : []
      const colab = colabs.find(c => c.email === email && c.senha === password)

      login(
        {
          id: colab ? `colab-${email}` : '1',
          name: colab ? colab.nome : (orgData?.adminNome ?? 'Vitor Teixeira'),
          email,
          role: (colab ? colab.role : (orgData?.adminRole ?? 'farmaceutico')) as import('@/store/authStore').UserRole,
          clinicId: '1',
          clinicName: orgData?.nome ?? 'Clínica São Lucas',
        },
        'mock-token'
      )
      navigate('/dashboard')
    } catch {
      setError('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo mobile (só aparece em telas pequenas) */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5">
          <img src={logoMedstock} alt="MedStock" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-base font-bold text-[#0D47A1]">MedStock</div>
          <div className="text-xs text-slate-400">Controle de Estoque</div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Seja muito Bem-vindo !</h1>
        <p className="text-sm text-slate-500">Entre com suas credenciais para acessar o sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Email profissional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@clinica.com"
              className="input h-11"
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">Senha</label>
              <button type="button" className="text-xs text-blue-600 hover:underline font-medium">
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input h-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <span className="text-xs font-bold">Ocultar</span> : <span className="text-xs font-bold">Mostrar</span>}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Entrando...
              </>
            ) : 'Entrar no sistema'}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-4 mt-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Sistema online
        </div>
        <span className="text-slate-200">·</span>
        <span className="text-xs text-slate-400">Acesso seguro via JWT</span>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Sua clínica ainda não tem conta?{' '}
        <Link to="/register" className="text-[#1A73E8] font-semibold hover:underline">
          Cadastrar organização
        </Link>
      </p>
    </div>
  )
}
