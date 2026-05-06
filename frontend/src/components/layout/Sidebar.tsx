import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Pill, ArrowDownCircle, ArrowUpCircle,
  Package, Bell, BarChart2, Users, Truck, Building2, Settings, LogOut,
} from 'lucide-react'
import logoMedstock from '@/assets/logo_medstock.jpg'
import { useAuthStore } from '@/store/authStore'
import { useAlertsStore } from '@/store/alertsStore'
import { canAccess, roleLabel } from '@/lib/permissions'
import { cn } from '@/lib/utils'

const ALL_NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     section: 'dashboard'     },
  { to: '/medicamentos',  icon: Pill,             label: 'Medicamentos',  section: 'medicamentos'  },
  { to: '/entradas',      icon: ArrowDownCircle,  label: 'Entradas',      section: 'entradas'      },
  { to: '/saidas',        icon: ArrowUpCircle,    label: 'Saídas',        section: 'saidas'        },
  { to: '/estoque',       icon: Package,          label: 'Estoque',       section: 'estoque'       },
  { to: '/alertas',       icon: Bell,             label: 'Alertas',       section: 'alertas'       },
  { to: '/relatorios',    icon: BarChart2,         label: 'Relatórios',    section: 'relatorios'    },
  { to: '/colaboradores', icon: Users,             label: 'Colaboradores', section: 'colaboradores' },
  { to: '/fornecedores',  icon: Truck,             label: 'Fornecedores',  section: 'fornecedores'  },
  { to: '/unidades',      icon: Building2,         label: 'Unidades',      section: 'unidades'      },
  { to: '/configuracoes', icon: Settings,          label: 'Configurações', section: 'configuracoes' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { alertas } = useAlertsStore()
  const alertasNaoLidos = alertas.filter(a => !a.lido).length
  const navigate = useNavigate()

  // Filtra itens do menu conforme o papel do usuário logado
  const navItems = ALL_NAV_ITEMS.filter(item =>
    canAccess(user?.role, item.section)
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col bg-[#0D47A1] text-white"
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}
    >
      {/* ── Logo (centralizada e grande) ── */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-blue-800">
        <div
          className="bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg mb-3"
          style={{ width: 92, height: 92, padding: 5 }}
        >
          <img
            src={logoMedstock}
            alt="MedStock"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <div className="text-center">
          <div className="text-base font-extrabold tracking-wide leading-tight">MedStock</div>
          <div className="text-[11px] text-blue-300 leading-tight mt-0.5">Controle de Estoque</div>
        </div>
      </div>

      {/* ── Organização ── */}
      <div className="px-4 py-2.5 border-b border-blue-900/60">
        <div className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold mb-0.5">Organização</div>
        <div className="text-xs font-semibold text-white truncate">{user?.clinicName ?? '—'}</div>
      </div>

      {/* ── Navegação ── */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, section }) => {
          const dynamicBadge = section === 'alertas' && alertasNaoLidos > 0 ? alertasNaoLidos : null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-[#1A73E8] text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {dynamicBadge && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {dynamicBadge > 9 ? '9+' : dynamicBadge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Usuário + sair ── */}
      <div className="border-t border-blue-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name ?? 'Usuário'}</div>
            <div className="text-[10px] text-blue-300 truncate">{roleLabel(user?.role)}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-blue-300 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>
  )
}
