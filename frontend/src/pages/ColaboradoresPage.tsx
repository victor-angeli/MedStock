import { useState } from 'react'
import {
  UserPlus, Search, Mail, Phone, Calendar, Shield,
  CheckCircle, XCircle, Clock, ChevronDown, Eye, EyeOff, Info,
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { hasPermission, roleLabel } from '@/lib/permissions'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Colaborador {
  id: string
  nome: string
  email: string
  role: UserRole
  cargo: string         // título exato da função
  registro?: string     // CRM, CRF, COREN etc.
  telefone: string
  status: 'ativo' | 'inativo'
  online: boolean
  dataIngresso: string
  avatar?: string
}

// ─── Mock de colaboradores ────────────────────────────────────────────────────

const MOCK_COLABORADORES: Colaborador[] = [
  {
    id: '2',
    nome: 'Roberto Alves',
    email: 'r.alves@saolucas.com',
    role: 'admin',
    cargo: 'Administrador do Sistema',
    telefone: '(11) 99001-2233',
    status: 'ativo',
    online: false,
    dataIngresso: '02/01/2023',
  },
  {
    id: '3',
    nome: 'Ana Paula Lima',
    email: 'ana.lima@saolucas.com',
    role: 'medico',
    cargo: 'Médica Clínica Geral',
    registro: 'CRM-SP 45678',
    telefone: '(11) 91234-5678',
    status: 'ativo',
    online: false,
    dataIngresso: '10/01/2023',
  },
  {
    id: '4',
    nome: 'Juliana Costa',
    email: 'j.costa@saolucas.com',
    role: 'enfermeiro',
    cargo: 'Enfermeira Chefe',
    registro: 'COREN-SP 78901',
    telefone: '(11) 97654-3210',
    status: 'ativo',
    online: true,
    dataIngresso: '05/03/2023',
  },
  {
    id: '5',
    nome: 'Carlos Silva',
    email: 'c.silva@saolucas.com',
    role: 'enfermeiro',
    cargo: 'Técnico em Enfermagem',
    registro: 'COREN-SP 34567',
    telefone: '(11) 96543-2100',
    status: 'ativo',
    online: false,
    dataIngresso: '20/06/2023',
  },
  {
    id: '6',
    nome: 'Mariana Lima',
    email: 'm.lima@saolucas.com',
    role: 'farmaceutico',
    cargo: 'Auxiliar de Farmácia',
    registro: 'CRF-SP 67890',
    telefone: '(11) 95432-1099',
    status: 'inativo',
    online: false,
    dataIngresso: '12/09/2023',
  },
]

// ─── Helpers visuais ─────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { bg: string; text: string; border: string; avatarBg: string }> = {
  admin:       { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', avatarBg: 'bg-purple-500' },
  farmaceutico:{ bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   avatarBg: 'bg-blue-500'   },
  medico:      { bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',avatarBg: 'bg-emerald-500'},
  enfermeiro:  { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  avatarBg: 'bg-amber-500'  },
}

const ROLE_ICON_LABEL: Record<UserRole, string> = {
  admin:       '🔐 Administrador',
  farmaceutico:'💊 Farmacêutico',
  medico:      '🩺 Médico',
  enfermeiro:  '🩹 Enfermeiro',
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface NovoColabForm { nome: string; email: string; senha: string; cargo: string; role: UserRole; telefone: string }

export function ColaboradoresPage() {
  const { user } = useAuthStore()
  const isAdmin = hasPermission(user?.role, 'create:colaboradores')

  const [busca, setBusca]               = useState('')
  const [filtroRole, setFiltroRole]     = useState<UserRole | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [modalColaborador, setModalColaborador] = useState<Colaborador | null>(null)
  const [showNovo, setShowNovo]         = useState(false)
  const [showSenha, setShowSenha]       = useState(false)
  const [novoForm, setNovoForm]         = useState<NovoColabForm>({
    nome:'', email:'', senha:'', cargo:'', role:'enfermeiro', telefone:''
  })
  const [novoErros, setNovoErros]       = useState<Partial<NovoColabForm>>({})
  const [novoCriado, setNovoCriado]     = useState(false)

  // Monta o colaborador do usuário logado a partir do auth store
  const colaboradorAtual: Colaborador = {
    id: user?.id ?? '1',
    nome: user?.name ?? 'Usuário',
    email: user?.email ?? '',
    role: user?.role ?? 'farmaceutico',
    cargo: `${roleLabel(user?.role)} Responsável`,
    registro: user?.role === 'farmaceutico' ? 'CRF-SP 12345'
             : user?.role === 'medico'       ? 'CRM-SP 12345'
             : user?.role === 'enfermeiro'   ? 'COREN-SP 12345'
             : undefined,
    telefone: '—',
    status: 'ativo',
    online: true,
    dataIngresso: '15/03/2024',
  }

  // Função para salvar novo colaborador no localStorage (mock)
  const salvarNovoColab = () => {
    const erros: Partial<NovoColabForm> = {}
    if (!novoForm.nome.trim())              erros.nome  = 'Obrigatório'
    if (!novoForm.email.includes('@'))      erros.email = 'Email inválido'
    if (novoForm.senha.length < 6)         erros.senha = 'Mínimo 6 caracteres'
    if (!novoForm.cargo.trim())            erros.cargo = 'Obrigatório'
    setNovoErros(erros)
    if (Object.keys(erros).length > 0) return

    const saved = localStorage.getItem('medstock-colaboradores')
    const lista = saved ? JSON.parse(saved) : []
    lista.push({ ...novoForm })
    localStorage.setItem('medstock-colaboradores', JSON.stringify(lista))
    setNovoCriado(true)
  }

  // Lista completa: usuário logado primeiro + mocks
  const todos: Colaborador[] = [colaboradorAtual, ...MOCK_COLABORADORES]

  const filtrados = todos.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       c.email.toLowerCase().includes(busca.toLowerCase()) ||
                       c.cargo.toLowerCase().includes(busca.toLowerCase())
    const matchRole   = filtroRole   === 'todos' || c.role === filtroRole
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    return matchBusca && matchRole && matchStatus
  })

  // Stats
  const ativos   = todos.filter(c => c.status === 'ativo').length
  const inativos = todos.filter(c => c.status === 'inativo').length
  const porRole  = Object.entries(
    todos.reduce((acc, c) => { acc[c.role] = (acc[c.role] ?? 0) + 1; return acc }, {} as Record<string, number>)
  )

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Colaboradores</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profissionais cadastrados em{' '}
            <span className="font-semibold text-slate-700">{user?.clinicName ?? 'sua organização'}</span>
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowNovo(true); setNovoCriado(false); setNovoErros({}); setNovoForm({ nome:'', email:'', senha:'', cargo:'', role:'enfermeiro', telefone:'' }) }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            Novo Colaborador
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-2xl font-extrabold text-slate-800">{todos.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total de colaboradores</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-extrabold text-green-600">{ativos}</div>
          <div className="text-xs text-slate-500 mt-0.5">Ativos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-extrabold text-slate-400">{inativos}</div>
          <div className="text-xs text-slate-500 mt-0.5">Inativos</div>
        </div>
        <div className="card p-4">
          <div className="flex flex-wrap gap-1 mt-0.5">
            {porRole.map(([role, count]) => {
              const cfg = ROLE_CONFIG[role as UserRole]
              return (
                <span key={role} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {count} {roleLabel(role as UserRole)}
                </span>
              )
            })}
          </div>
          <div className="text-xs text-slate-500 mt-1.5">Por função</div>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="input pl-8 h-9 text-xs w-full"
          />
        </div>

        <div className="relative">
          <select
            value={filtroRole}
            onChange={e => setFiltroRole(e.target.value as UserRole | 'todos')}
            className="input h-9 text-xs pr-8 appearance-none cursor-pointer min-w-36"
          >
            <option value="todos">Todos os papéis</option>
            <option value="admin">Administrador</option>
            <option value="farmaceutico">Farmacêutico</option>
            <option value="medico">Médico</option>
            <option value="enfermeiro">Enfermeiro</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value as typeof filtroStatus)}
            className="input h-9 text-xs pr-8 appearance-none cursor-pointer min-w-32"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <span className="text-xs text-slate-400">
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grid de colaboradores ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map(col => {
          const isVoce = col.id === (user?.id ?? '1')
          const cfg = ROLE_CONFIG[col.role]
          const initials = col.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

          return (
            <div
              key={col.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md cursor-pointer ${
                isVoce ? 'border-[#1A73E8] shadow-sm' : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => setModalColaborador(col)}
            >
              {/* Avatar + badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${cfg.avatarBg} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800">{col.nome}</span>
                      {isVoce && (
                        <span className="text-[9px] font-extrabold bg-[#1A73E8] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{col.cargo}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {/* Online indicator */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${col.online ? 'bg-green-400' : 'bg-slate-300'}`} />
                    <span className={`text-[10px] font-medium ${col.online ? 'text-green-600' : 'text-slate-400'}`}>
                      {col.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {/* Status */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    col.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {col.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Função / Papel — badge destacado */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${cfg.bg} ${cfg.border}`}>
                <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.text}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-extrabold uppercase tracking-wider ${cfg.text}`}>
                    Função / Papel
                  </div>
                  <div className={`text-xs font-semibold mt-0.5 ${cfg.text}`}>
                    {ROLE_ICON_LABEL[col.role]}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{col.email}</span>
                </div>
                {col.telefone !== '—' && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{col.telefone}</span>
                  </div>
                )}
                {col.registro && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{col.registro}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span>Desde {col.dataIngresso}</span>
                </div>
              </div>

              {/* Ações (só admin vê editar/desativar) */}
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={e => { e.stopPropagation(); setModalColaborador(col) }}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Ver perfil
                  </button>
                  {!isVoce && (
                    <button
                      onClick={e => e.stopPropagation()}
                      className={`flex-1 text-xs py-1.5 rounded-lg border font-semibold transition-colors ${
                        col.status === 'ativo'
                          ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {col.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="card p-10 text-center text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-sm">Nenhum colaborador encontrado</p>
          <p className="text-xs mt-1">Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* ── Modal de perfil ── */}
      {modalColaborador && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setModalColaborador(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalColaborador(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">×</button>

            {/* Avatar */}
            {(() => {
              const col = modalColaborador
              const cfg = ROLE_CONFIG[col.role]
              const initials = col.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
              const isVoce = col.id === (user?.id ?? '1')
              return (
                <>
                  <div className="flex flex-col items-center mb-5">
                    <div className={`w-20 h-20 rounded-2xl ${cfg.avatarBg} flex items-center justify-center text-white font-extrabold text-2xl mb-3`}>
                      {initials}
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-800">{col.nome}</h2>
                      {isVoce && (
                        <span className="text-[9px] font-extrabold bg-[#1A73E8] text-white px-1.5 py-0.5 rounded-full uppercase">Você</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{col.cargo}</p>
                  </div>

                  {/* Função destaque */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 ${cfg.bg} ${cfg.border}`}>
                    <Shield className={`w-5 h-5 ${cfg.text}`} />
                    <div>
                      <div className={`text-[10px] font-extrabold uppercase tracking-wider ${cfg.text}`}>Função no Sistema</div>
                      <div className={`text-sm font-bold ${cfg.text}`}>{ROLE_ICON_LABEL[col.role]}</div>
                    </div>
                    <div className="ml-auto">
                      {col.status === 'ativo'
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: 'Email', value: col.email },
                      { icon: Phone, label: 'Telefone', value: col.telefone !== '—' ? col.telefone : 'Não informado' },
                      ...(col.registro ? [{ icon: CheckCircle, label: 'Registro Profissional', value: col.registro }] : []),
                      { icon: Calendar, label: 'Data de Ingresso', value: col.dataIngresso },
                      { icon: Clock, label: 'Status', value: col.status === 'ativo' ? 'Colaborador ativo' : 'Colaborador inativo' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
                          <div className="text-sm text-slate-700 font-medium mt-0.5">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button onClick={() => setModalColaborador(null)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                      Fechar
                    </button>
                    {isAdmin && !isVoce && (
                      <button className="flex-1 py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0] transition-colors">
                        Editar Cadastro
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ── Modal: Novo Colaborador (criado pelo Admin) ── */}
      {showNovo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNovo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {novoCriado ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Colaborador cadastrado!</h2>
                <p className="text-sm text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{novoForm.nome}</span> foi adicionado à equipe.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-3 mb-5 text-left">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Instrua o colaborador a fazer login com:</p>
                      <p className="text-xs text-blue-600 mt-1">Email: <span className="font-mono font-bold">{novoForm.email}</span></p>
                      <p className="text-xs text-blue-600">Senha: a senha que você definiu</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowNovo(false)}
                  className="w-full py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0]">
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-base font-bold text-slate-800 mb-1">Cadastrar Novo Colaborador</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Defina o acesso do colaborador. Ele usará o <span className="font-semibold text-slate-600">email e senha</span> que você cadastrar aqui para fazer login.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome completo *</label>
                    <input type="text" value={novoForm.nome} onChange={e => setNovoForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome do colaborador" className={`input h-9 text-xs ${novoErros.nome ? 'border-red-300' : ''}`} autoFocus />
                    {novoErros.nome && <p className="text-[11px] text-red-500 mt-0.5">{novoErros.nome}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email profissional *</label>
                    <input type="email" value={novoForm.email} onChange={e => setNovoForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@clinica.com" className={`input h-9 text-xs ${novoErros.email ? 'border-red-300' : ''}`} />
                    {novoErros.email && <p className="text-[11px] text-red-500 mt-0.5">{novoErros.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Senha de acesso *</label>
                    <div className="relative">
                      <input type={showSenha ? 'text' : 'password'} value={novoForm.senha}
                        onChange={e => setNovoForm(f => ({ ...f, senha: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        className={`input h-9 text-xs pr-10 ${novoErros.senha ? 'border-red-300' : ''}`} />
                      <button type="button" onClick={() => setShowSenha(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {novoErros.senha && <p className="text-[11px] text-red-500 mt-0.5">{novoErros.senha}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Função / Papel *</label>
                      <div className="relative">
                        <select value={novoForm.role} onChange={e => setNovoForm(f => ({ ...f, role: e.target.value as UserRole }))}
                          className="input h-9 text-xs w-full pr-7 appearance-none cursor-pointer">
                          <option value="enfermeiro">Enfermeiro</option>
                          <option value="medico">Médico</option>
                          <option value="farmaceutico">Farmacêutico</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo exato *</label>
                      <input type="text" value={novoForm.cargo} onChange={e => setNovoForm(f => ({ ...f, cargo: e.target.value }))}
                        placeholder="Ex: Enfermeira Chefe" className={`input h-9 text-xs ${novoErros.cargo ? 'border-red-300' : ''}`} />
                      {novoErros.cargo && <p className="text-[11px] text-red-500 mt-0.5">{novoErros.cargo}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
                    <input type="text" value={novoForm.telefone} onChange={e => setNovoForm(f => ({ ...f, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000" className="input h-9 text-xs" />
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700">
                    O colaborador receberá esse email e senha para fazer login. Não será necessário cadastro — apenas login.
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowNovo(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button onClick={salvarNovoColab}
                    className="flex-1 py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0]">
                    Cadastrar Colaborador
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
