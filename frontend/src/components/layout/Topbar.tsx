import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, Users, ChevronDown, Search, RefreshCw, X, AlertTriangle, Calendar, Package, CheckCheck, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useAlertsStore } from '@/store/alertsStore'
import { roleLabel } from '@/lib/permissions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Mock: medicamentos para busca ────────────────────────────────────────────
const MOCK_MEDICAMENTOS = [
  { id: '1',  nome: 'Amoxicilina 500mg',       tipo: 'Cápsula',     estoque: 28,  status: 'vencendo' },
  { id: '2',  nome: 'Dipirona 500mg',           tipo: 'Comprimido',  estoque: 15,  status: 'vencendo' },
  { id: '3',  nome: 'Losartana 50mg',           tipo: 'Comprimido',  estoque: 35,  status: 'vencendo' },
  { id: '4',  nome: 'Omeprazol 20mg',           tipo: 'Cápsula',     estoque: 18,  status: 'baixo'    },
  { id: '5',  nome: 'Paracetamol 750mg',        tipo: 'Comprimido',  estoque: 25,  status: 'baixo'    },
  { id: '6',  nome: 'Atenolol 25mg',            tipo: 'Comprimido',  estoque: 120, status: 'ok'       },
  { id: '7',  nome: 'Metformina 850mg',         tipo: 'Comprimido',  estoque: 80,  status: 'ok'       },
  { id: '8',  nome: 'Sinvastatina 20mg',        tipo: 'Comprimido',  estoque: 45,  status: 'ok'       },
  { id: '9',  nome: 'Captopril 25mg',           tipo: 'Comprimido',  estoque: 60,  status: 'ok'       },
  { id: '10', nome: 'Hidroclorotiazida 25mg',   tipo: 'Comprimido',  estoque: 5,   status: 'critico'  },
  { id: '11', nome: 'Ibuprofeno 400mg',         tipo: 'Comprimido',  estoque: 90,  status: 'ok'       },
  { id: '12', nome: 'Amoxicilina 250mg/5ml',    tipo: 'Líquido',     estoque: 12,  status: 'baixo'    },
  { id: '13', nome: 'Prednisona 20mg',          tipo: 'Comprimido',  estoque: 30,  status: 'ok'       },
  { id: '14', nome: 'Azitromicina 500mg',       tipo: 'Comprimido',  estoque: 8,   status: 'critico'  },
]

type NotifTipo = 'vencimento' | 'estoque' | 'movimentacao'
interface Notificacao { id: number; tipo: NotifTipo; titulo: string; desc: string; time: string; lida: boolean }

const NOTIFICACOES_INICIAIS: Notificacao[] = [
  { id: 1, tipo: 'vencimento',   titulo: '47 medicamentos vencem em 30 dias',   desc: 'Risco de perda e uso inadequado',   time: 'Hoje, 08:00', lida: false },
  { id: 2, tipo: 'estoque',      titulo: '87 medicamentos com estoque baixo',    desc: 'Reposição urgente recomendada',     time: 'Hoje, 07:30', lida: false },
  { id: 3, tipo: 'vencimento',   titulo: 'Amoxicilina 500mg vence em 22 dias',  desc: 'Lote L24A123 — 28 un.',            time: 'Hoje, 08:05', lida: false },
  { id: 4, tipo: 'estoque',      titulo: 'Dipirona 500mg abaixo do mínimo',     desc: '15 un. (mín: 40)',                 time: 'Hoje, 07:35', lida: false },
  { id: 5, tipo: 'estoque',      titulo: 'Hidroclorotiazida 25mg — nível crítico', desc: '5 un. (mín: 20)',              time: 'Hoje, 07:00', lida: false },
  { id: 6, tipo: 'movimentacao', titulo: '5 itens sem movimentação há 180 dias', desc: 'Revise a necessidade de estoque', time: 'Ontem, 15:00', lida: true  },
  { id: 7, tipo: 'vencimento',   titulo: 'Losartana 50mg vence em 37 dias',     desc: 'Lote L24C789 — 35 un.',           time: 'Ontem, 09:00', lida: true  },
]

function statusColor(s: string) {
  if (s === 'ok')       return 'bg-green-100 text-green-700'
  if (s === 'baixo')    return 'bg-yellow-100 text-yellow-700'
  if (s === 'vencendo') return 'bg-orange-100 text-orange-700'
  if (s === 'critico')  return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-500'
}

function statusLabel(s: string) {
  return ({ ok: 'OK', baixo: 'Baixo', vencendo: 'Vencendo', critico: 'Crítico' } as Record<string, string>)[s] ?? s
}

function NotifIcon({ tipo }: { tipo: NotifTipo }) {
  if (tipo === 'vencimento')   return <Calendar className="w-4 h-4 text-orange-500" />
  if (tipo === 'estoque')      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  return <Package className="w-4 h-4 text-blue-500" />
}

export function Topbar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const dateStr = format(new Date(), "d 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })

  // ── Busca ──
  const [query, setQuery]       = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const results = query.trim().length >= 1
    ? MOCK_MEDICAMENTOS.filter(m => m.nome.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  // ── Notificações (sincronizado com alertsStore) ──
  const { alertas, marcarLido: marcarAlertaLido, marcarTodos: marcarTodosAlertas } = useAlertsStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  // Converte os alertas da store para o formato de notificação do dropdown
  const notifs: Notificacao[] = alertas.map(a => ({
    id: a.id,
    tipo: a.tipo as NotifTipo,
    titulo: a.titulo,
    desc: a.desc,
    time: a.data,
    lida: a.lido,
  }))
  const naoLidas = notifs.filter(n => !n.lida).length
  const marcarTodasLidas = marcarTodosAlertas
  const marcarLida = marcarAlertaLido

  // ── Colaboradores dropdown ──
  const [showColabs, setShowColabs] = useState(false)
  const colabsRef = useRef<HTMLDivElement>(null)

  const getColaboradores = () => {
    const saved = localStorage.getItem('medstock-colaboradores')
    const dinamicos: Array<{ nome: string; email: string; role: UserRole; cargo: string }> =
      saved ? JSON.parse(saved) : []
    const mockFixos = [
      { nome: 'Roberto Alves',   email: 'r.alves@saolucas.com',  role: 'admin' as UserRole,        cargo: 'Administrador do Sistema' },
      { nome: 'Ana Paula Lima',  email: 'ana.lima@saolucas.com', role: 'medico' as UserRole,       cargo: 'Médica Clínica Geral'     },
      { nome: 'Juliana Costa',   email: 'j.costa@saolucas.com',  role: 'enfermeiro' as UserRole,   cargo: 'Enfermeira Chefe'         },
      { nome: 'Carlos Silva',    email: 'c.silva@saolucas.com',  role: 'enfermeiro' as UserRole,   cargo: 'Técnico em Enfermagem'    },
    ]
    // Adiciona usuário logado no topo
    const logado = user ? [{ nome: user.name, email: user.email, role: user.role, cargo: roleLabel(user.role) }] : []
    return [...logado, ...mockFixos, ...dinamicos]
  }

  const ROLE_AVATAR: Record<UserRole, string> = {
    admin: 'bg-purple-500', farmaceutico: 'bg-blue-500', medico: 'bg-emerald-500', enfermeiro: 'bg-amber-500',
  }

  // Ctrl+K
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); setShowSearch(true) }
    if (e.key === 'Escape') { setShowSearch(false); setShowNotifs(false) }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Clique fora fecha dropdowns
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setShowSearch(false)
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifs(false)
      if (colabsRef.current  && !colabsRef.current.contains(e.target as Node))  setShowColabs(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <header
      className="flex items-center gap-3 bg-white border-b border-slate-200 px-6 relative z-30"
      style={{ height: 'var(--topbar-height)', minHeight: 'var(--topbar-height)' }}
    >
      {/* Clínica — sem seta (sem funcionalidade) */}
      <span className="text-sm font-semibold text-slate-700 flex-shrink-0">
        {user?.clinicName ?? 'Clínica'}
      </span>

      {/* ── Busca com dropdown ── */}
      <div className="flex-1 max-w-sm relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSearch(true) }}
            onFocus={() => setShowSearch(true)}
            placeholder="Buscar medicamento..."
            className="input pl-9 pr-16 py-1.5 text-sm h-8"
          />
          {query ? (
            <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium border border-slate-200 rounded px-1 py-0.5 select-none">
              Ctrl+K
            </span>
          )}
        </div>

        {showSearch && query.trim().length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">Nenhum medicamento encontrado</div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    {results.length} resultado{results.length !== 1 ? 's' : ''}
                  </span>
                  <button onMouseDown={() => { navigate('/medicamentos'); setShowSearch(false); setQuery('') }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline">
                    Ver todos →
                  </button>
                </div>
                {results.map(med => (
                  <button key={med.id}
                    onMouseDown={() => { navigate('/medicamentos'); setShowSearch(false); setQuery('') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{med.nome}</div>
                      <div className="text-[11px] text-slate-400">{med.tipo} · {med.estoque} un.</div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusColor(med.status)}`}>
                      {statusLabel(med.status)}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Data */}
      <span className="text-xs text-slate-400 hidden lg:block flex-shrink-0">{dateStr}</span>

      {/* Atualizar */}
      <button className="btn-ghost text-xs py-1.5 flex-shrink-0">
        <RefreshCw className="w-3.5 h-3.5" />
        Atualizar
      </button>

      {/* ── Sino / Notificações ── */}
      <div className="relative flex-shrink-0" ref={notifRef}>
        <button
          onClick={() => { setShowNotifs(v => !v); setShowSearch(false) }}
          className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
              {naoLidas > 9 ? '9+' : naoLidas}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">Notificações</span>
                {naoLidas > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {naoLidas} nova{naoLidas !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {naoLidas > 0 && (
                <button onClick={marcarTodasLidas}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium">
                  <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifs.map(n => (
                <button key={n.id} onClick={() => marcarLida(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!n.lida ? 'bg-blue-50/40' : ''}`}>
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.tipo === 'vencimento' ? 'bg-orange-100' : n.tipo === 'estoque' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <NotifIcon tipo={n.tipo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs leading-snug ${!n.lida ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {n.titulo}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-slate-300 mt-1">{n.time}</div>
                  </div>
                  {!n.lida && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </button>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button onClick={() => { navigate('/alertas'); setShowNotifs(false) }}
                className="text-xs text-blue-600 font-semibold hover:underline">
                Ver todos os alertas →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Colaboradores dropdown ── */}
      <div className="relative flex-shrink-0" ref={colabsRef}>
        <button
          onClick={() => { setShowColabs(v => !v); setShowNotifs(false); setShowSearch(false) }}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span className="hidden lg:block">Colaboradores</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showColabs ? 'rotate-180' : ''}`} />
        </button>

        {showColabs && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Equipe — {user?.clinicName ?? 'Organização'}</span>
              <button
                onClick={() => { navigate('/colaboradores'); setShowColabs(false) }}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Gerenciar →
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {getColaboradores().map((c, i) => {
                const initials = c.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                const isVoce = c.email === user?.email
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${ROLE_AVATAR[c.role]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">{c.nome}</span>
                        {isVoce && (
                          <span className="text-[8px] font-bold bg-[#1A73E8] text-white px-1 py-0.5 rounded-full uppercase flex-shrink-0">Você</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{c.cargo}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Shield className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-400">{roleLabel(c.role)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button
                onClick={() => { navigate('/colaboradores'); setShowColabs(false) }}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Ver página completa de colaboradores →
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
