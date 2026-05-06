import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, User, ChevronRight, ChevronLeft, Check, Eye, EyeOff } from 'lucide-react'
import logoMedstock from '@/assets/logo_medstock.jpg'

type OrgTipo = 'clinica' | 'farmacia' | 'ubs' | 'hospital'

interface OrgForm {
  nome: string
  cnpj: string
  tipo: OrgTipo
  telefone: string
  email: string
}

interface UserForm {
  nome: string
  email: string
  senha: string
  confirmar: string
}

const ORG_TIPOS: { value: OrgTipo; label: string; desc: string }[] = [
  { value: 'clinica',   label: 'Clínica',   desc: 'Clínica médica ou odontológica' },
  { value: 'farmacia',  label: 'Farmácia',  desc: 'Farmácia ou drogaria' },
  { value: 'ubs',       label: 'UBS',       desc: 'Unidade Básica de Saúde' },
  { value: 'hospital',  label: 'Hospital',  desc: 'Hospital ou pronto-socorro' },
]

function formatCNPJ(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 14)
  return n
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatTel(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 10) return n.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3')
  return n.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [org, setOrg] = useState<OrgForm>({
    nome: '', cnpj: '', tipo: 'clinica', telefone: '', email: '',
  })
  const [user, setUser] = useState<UserForm>({
    nome: '', email: '', senha: '', confirmar: '',
  })

  const setOrgField = (k: keyof OrgForm, v: string) => {
    setOrg(p => ({ ...p, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const setUserField = (k: keyof UserForm, v: string) => {
    setUser(p => ({ ...p, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!org.nome.trim()) e.nome = 'Nome obrigatório'
    if (org.cnpj.replace(/\D/g, '').length < 14) e.cnpj = 'CNPJ inválido'
    if (!org.email.includes('@')) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!user.nome.trim()) e.nome = 'Nome obrigatório'
    if (!user.email.includes('@')) e.email = 'Email inválido'
    if (user.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    if (user.senha !== user.confirmar) e.confirmar = 'Senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)
    // TODO: chamar api.post('/auth/register-org', { org, user })
    await new Promise(r => setTimeout(r, 1500))
    // Salva org e admin no localStorage para o mock do login
    localStorage.setItem('medstock-org', JSON.stringify({
      nome:      org.nome,
      cnpj:      org.cnpj,
      tipo:      org.tipo,
      email:     org.email,
      adminNome: user.nome,
      adminEmail:user.email,
      adminRole: 'admin',
    }))
    setStep(3)
    setLoading(false)
  }

  /* ── Sucesso ── */
  if (step === 3) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro realizado!</h2>
        <p className="text-sm text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">{org.nome}</span> foi cadastrada com sucesso.
        </p>
        <p className="text-sm text-slate-400 mb-8">
          Agora faça login com o email <span className="font-medium text-slate-600">{user.email}</span> para acessar o sistema.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full h-11 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo mobile */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 border border-slate-200">
          <img src={logoMedstock} alt="MedStock" className="w-full h-full object-contain" />
        </div>
        <div className="text-sm font-bold text-[#0D47A1]">MedStock</div>
      </div>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Cadastrar organização</h1>
        <p className="text-sm text-slate-500">Registre sua clínica ou farmácia para começar</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { n: 1, label: 'Organização', icon: Building2 },
          { n: 2, label: 'Administrador', icon: User },
        ].map(({ n, label, icon: Icon }, i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
              step > n ? 'bg-green-500 text-white' : step === n ? 'bg-[#1A73E8] text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > n ? <Check className="w-3.5 h-3.5" /> : n}
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${step === n ? 'text-[#1A73E8]' : 'text-slate-400'}`} />
              <span className={`text-xs font-medium truncate ${step === n ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i === 0 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        {/* ── ETAPA 1: Organização ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nome da organização *</label>
              <input
                type="text"
                value={org.nome}
                onChange={e => setOrgField('nome', e.target.value)}
                placeholder="Ex: Clínica São Lucas"
                className={`input h-10 ${errors.nome ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                autoFocus
              />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">CNPJ *</label>
              <input
                type="text"
                value={org.cnpj}
                onChange={e => setOrgField('cnpj', formatCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                className={`input h-10 ${errors.cnpj ? 'border-red-300 ring-1 ring-red-300' : ''}`}
              />
              {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                Se sua unidade estiver dentro de uma UBS mas tiver CNPJ próprio, use-o aqui.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de organização *</label>
              <div className="grid grid-cols-2 gap-2">
                {ORG_TIPOS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrgField('tipo', value)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      org.tipo === value
                        ? 'border-[#1A73E8] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-xs font-bold ${org.tipo === value ? 'text-[#1A73E8]' : 'text-slate-700'}`}>{label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={org.telefone}
                  onChange={e => setOrgField('telefone', formatTel(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="input h-10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={org.email}
                  onChange={e => setOrgField('email', e.target.value)}
                  placeholder="contato@clinica.com"
                  className={`input h-10 ${errors.email ? 'border-red-300' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full h-11 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── ETAPA 2: Admin ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              Este será o <span className="font-semibold text-blue-700">usuário administrador</span> da{' '}
              <span className="font-semibold text-slate-700">{org.nome}</span>. Ele poderá cadastrar e gerenciar os colaboradores da organização.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nome completo *</label>
              <input
                type="text"
                value={user.nome}
                onChange={e => setUserField('nome', e.target.value)}
                placeholder="Nome do administrador"
                className={`input h-10 ${errors.nome ? 'border-red-300' : ''}`}
                autoFocus
              />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email profissional *</label>
              <input
                type="email"
                value={user.email}
                onChange={e => setUserField('email', e.target.value)}
                placeholder="admin@clinica.com"
                className={`input h-10 ${errors.email ? 'border-red-300' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senha *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={user.senha}
                  onChange={e => setUserField('senha', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`input h-10 pr-16 ${errors.senha ? 'border-red-300' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmar senha *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={user.confirmar}
                  onChange={e => setUserField('confirmar', e.target.value)}
                  placeholder="Repita a senha"
                  className={`input h-10 pr-16 ${errors.confirmar ? 'border-red-300' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmar && <p className="text-xs text-red-500 mt-1">{errors.confirmar}</p>}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] h-11 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Cadastrando...
                  </>
                ) : 'Finalizar cadastro'}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-[#1A73E8] font-semibold hover:underline">
          Fazer login
        </Link>
      </p>
    </div>
  )
}
