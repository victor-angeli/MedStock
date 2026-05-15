import { Package, CheckCircle, AlertTriangle, Calendar, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAlertsStore } from '@/store/alertsStore'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const kpiCards = [
  {
    label: 'Total de Itens',
    value: 352,
    sub: 'Medicamentos cadastrados',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    link: 'Ver todos →',
  },
  {
    label: 'Estoque OK',
    value: 218,
    sub: '61,9% do total',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    link: 'Ver detalhes →',
  },
  {
    label: 'Estoque Baixo',
    value: 87,
    sub: '24,7% do total',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-l-yellow-500',
    link: 'Ver itens →',
  },
  {
    label: 'Vencendo em 30 dias',
    value: 47,
    sub: '13,4% do total',
    icon: Calendar,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    link: 'Ver alertas →',
  },
]

const mockEstoqueAlerta = [
  { nome: 'Amoxicilina 500mg', tipo: 'Cápsula', lote: 'L24A123', validade: '15/06/2025', diasRestantes: 22, estoque: 28, minimo: 50, status: 'critical' },
  { nome: 'Dipirona 500mg',    tipo: 'Comprimido', lote: 'D24B456', validade: '20/06/2025', diasRestantes: 27, estoque: 15, minimo: 40, status: 'critical' },
  { nome: 'Losartana 50mg',    tipo: 'Comprimido', lote: 'L24C789', validade: '30/06/2025', diasRestantes: 37, estoque: 35, minimo: 60, status: 'critical' },
  { nome: 'Omeprazol 20mg',    tipo: 'Cápsula',    lote: 'O24D012', validade: '10/08/2025', diasRestantes: 78, estoque: 18, minimo: 30, status: 'warning' },
  { nome: 'Paracetamol 750mg', tipo: 'Comprimido', lote: 'P24E345', validade: '15/09/2025', diasRestantes: 114, estoque: 25, minimo: 50, status: 'warning' },
]

const mockMovimentacoes = [
  { tipo: 'entrada', nome: 'Paracetamol 750mg', lote: 'P24E345', qty: 200, colaborador: 'Juliana Costa', hora: 'Hoje, 09:15' },
  { tipo: 'saida',   nome: 'Dipirona 500mg',    lote: 'D24B456', qty: 20,  colaborador: 'Carlos Silva',  hora: 'Hoje, 08:42' },
  { tipo: 'entrada', nome: 'Amoxicilina 500mg', lote: 'L24A123', qty: 100, colaborador: 'Mariana Lima',  hora: 'Ontem, 16:30' },
  { tipo: 'saida',   nome: 'Losartana 50mg',    lote: 'L24C789', qty: 15,  colaborador: 'Carlos Silva',  hora: 'Ontem, 14:20' },
]

export function DashboardPage() {
  const { user } = useAuthStore()
  const { alertas } = useAlertsStore()
  const alertasNaoLidos = alertas.filter(a => !a.lido).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Olá, {user?.name?.split(' ')[0] ?? 'Usuário'}!
          </h1>
          <p className="text-sm text-slate-500">Resumo geral do estoque da clínica</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className={cn('card p-4 border-l-4', card.border)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className={cn('text-3xl font-extrabold mt-0.5', card.color)}>{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.bg)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
            </div>
            <button className="action-link text-xs">
              {card.link}
            </button>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tabela estoque com alerta */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">Estoque com Alerta</h2>
            <button className="action-link text-xs">Ver todos os alertas →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-semibold">
                  <th className="text-left px-5 py-3">Medicamento</th>
                  <th className="text-left px-3 py-3">Lote</th>
                  <th className="text-left px-3 py-3">Validade</th>
                  <th className="text-left px-3 py-3">Estoque Atual</th>
                  <th className="text-left px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockEstoqueAlerta.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-700 text-sm">{item.nome}</div>
                      <div className="text-xs text-slate-400">{item.tipo}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 font-mono">{item.lote}</td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-slate-600">{item.validade}</div>
                      <div className={cn('text-xs font-semibold', item.status === 'critical' ? 'text-red-600' : 'text-yellow-600')}>
                        {item.diasRestantes} dias
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-semibold text-slate-700">{item.estoque} un.</div>
                      <div className="text-xs text-slate-400">mín. {item.minimo}</div>
                    </td>
                    <td className="px-3 py-3">
                      {item.status === 'critical'
                        ? <span className="badge-critical">Vencendo</span>
                        : <span className="badge-warning">Estoque Baixo</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lateral direita */}
        <div className="space-y-4">
          {/* Alertas importantes */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Alertas Importantes</h2>
              <button className="action-link text-xs">Ver todos</button>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-700">47 medicamentos vencem em até 30 dias</p>
                  <p className="text-xs text-slate-400 mt-0.5">Risco de perda e uso inadequado</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0" />
              </div>
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-yellow-700">87 medicamentos com estoque abaixo do mínimo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Reposição recomendada</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0" />
              </div>
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700">5 itens sem movimentação há mais de 180 dias</p>
                  <p className="text-xs text-slate-400 mt-0.5">Revise a necessidade de estoque</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Movimentações recentes */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Movimentações Recentes</h2>
              <button className="action-link text-xs">Ver todas</button>
            </div>
            <div className="divide-y divide-slate-50">
              {mockMovimentacoes.map((mov, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-slate-100'
                  )}>
                    <span className={cn(
                      'text-base font-bold leading-none',
                      mov.tipo === 'entrada' ? 'text-green-600' : 'text-slate-500'
                    )}>
                      {mov.tipo === 'entrada' ? '↓' : '↑'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{mov.nome}</p>
                    <p className="text-[10px] text-slate-400">Lote: {mov.lote} | Qty: {mov.qty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-slate-600 truncate max-w-[80px]">{mov.colaborador.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400">{mov.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 w-full">
          {[
            { label: 'Nova Entrada', sub: 'Registrar entrada', icon: '↓', color: 'bg-blue-600', to: '/entradas' },
            { label: 'Nova Saída',   sub: 'Registrar saída',  icon: '↑', color: 'bg-blue-600', to: '/saidas'   },
            { label: 'Novo Medicamento', sub: 'Cadastrar item', icon: '+', color: 'bg-blue-600', to: '/medicamentos' },
            { label: 'Relatório de Estoque', sub: 'Gerar relatório', icon: '📋', color: 'bg-blue-600', to: '/relatorios' },
            { label: 'Ver Alertas', sub: 'Alertas ativos', icon: '🔔', color: 'bg-red-500', badge: alertasNaoLidos, to: '/alertas' },
          ]
          .map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="
                relative
                flex flex-col items-center justify-center
                gap-2
                p-4
                rounded-xl
                border border-slate-200
                hover:border-blue-300
                hover:bg-blue-50
                hover:-translate-y-1
                hover:shadow-md
                transition-all duration-200
                w-full
                min-h-[115px]
                group
              "
            >
              <div
                className={cn(
                  `
                    w-11 h-11
                    rounded-xl
                    flex items-center justify-center
                    text-white text-xl
                    shadow-sm
                  `,
                  action.color
                )}
              >
                {action.icon}
              </div>

              <div className="text-center space-y-0.5">
                <p className="text-xs font-semibold text-slate-700">
                  {action.label}
                </p>

                <p className="text-[10px] text-slate-400">
                  {action.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}