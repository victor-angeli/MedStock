import { useState } from 'react'
import { Search, Plus, Filter, Pill, ChevronDown, AlertTriangle, CheckCircle, Calendar, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'

const MEDICAMENTOS = [
  { id: '1',  nome: 'Amoxicilina 500mg',       principio: 'Amoxicilina',         tipo: 'Cápsula',    conc: '500mg',     estoque: 28,  minimo: 50,  validade: '15/06/2025', fornecedor: 'Eurofarma', status: 'vencendo' },
  { id: '2',  nome: 'Dipirona 500mg',           principio: 'Dipirona Sódica',     tipo: 'Comprimido', conc: '500mg',     estoque: 15,  minimo: 40,  validade: '20/06/2025', fornecedor: 'Sanofi',    status: 'vencendo' },
  { id: '3',  nome: 'Losartana 50mg',           principio: 'Losartana Potássica', tipo: 'Comprimido', conc: '50mg',      estoque: 35,  minimo: 60,  validade: '30/06/2025', fornecedor: 'EMS',       status: 'vencendo' },
  { id: '4',  nome: 'Omeprazol 20mg',           principio: 'Omeprazol',           tipo: 'Cápsula',    conc: '20mg',      estoque: 18,  minimo: 30,  validade: '10/08/2025', fornecedor: 'Eurofarma', status: 'baixo'    },
  { id: '5',  nome: 'Paracetamol 750mg',        principio: 'Paracetamol',         tipo: 'Comprimido', conc: '750mg',     estoque: 25,  minimo: 50,  validade: '15/09/2025', fornecedor: 'Medley',    status: 'baixo'    },
  { id: '6',  nome: 'Atenolol 25mg',            principio: 'Atenolol',            tipo: 'Comprimido', conc: '25mg',      estoque: 120, minimo: 30,  validade: '10/02/2026', fornecedor: 'EMS',       status: 'ok'       },
  { id: '7',  nome: 'Metformina 850mg',         principio: 'Cloridrato Metform.', tipo: 'Comprimido', conc: '850mg',     estoque: 80,  minimo: 40,  validade: '05/03/2026', fornecedor: 'Merck',     status: 'ok'       },
  { id: '8',  nome: 'Sinvastatina 20mg',        principio: 'Sinvastatina',        tipo: 'Comprimido', conc: '20mg',      estoque: 45,  minimo: 30,  validade: '20/04/2026', fornecedor: 'Sandoz',    status: 'ok'       },
  { id: '9',  nome: 'Captopril 25mg',           principio: 'Captopril',           tipo: 'Comprimido', conc: '25mg',      estoque: 60,  minimo: 30,  validade: '12/05/2026', fornecedor: 'Medley',    status: 'ok'       },
  { id: '10', nome: 'Hidroclorotiazida 25mg',   principio: 'Hidroclorotiazida',   tipo: 'Comprimido', conc: '25mg',      estoque: 5,   minimo: 20,  validade: '01/07/2025', fornecedor: 'Eurofarma', status: 'critico'  },
  { id: '11', nome: 'Ibuprofeno 400mg',         principio: 'Ibuprofeno',          tipo: 'Comprimido', conc: '400mg',     estoque: 90,  minimo: 25,  validade: '10/08/2026', fornecedor: 'Abbott',    status: 'ok'       },
  { id: '12', nome: 'Amoxicilina 250mg/5ml',    principio: 'Amoxicilina',         tipo: 'Líquido',    conc: '250mg/5ml', estoque: 12,  minimo: 20,  validade: '30/07/2025', fornecedor: 'Eurofarma', status: 'baixo'    },
  { id: '13', nome: 'Azitromicina 500mg',       principio: 'Azitromicina',        tipo: 'Comprimido', conc: '500mg',     estoque: 8,   minimo: 20,  validade: '15/07/2025', fornecedor: 'Pfizer',    status: 'critico'  },
  { id: '14', nome: 'Prednisona 20mg',          principio: 'Prednisona',          tipo: 'Comprimido', conc: '20mg',      estoque: 30,  minimo: 20,  validade: '18/09/2026', fornecedor: 'Sanofi',    status: 'ok'       },
  { id: '15', nome: 'Dexametasona 4mg',         principio: 'Dexametasona',        tipo: 'Comprimido', conc: '4mg',       estoque: 22,  minimo: 15,  validade: '22/10/2026', fornecedor: 'Merck',     status: 'ok'       },
]

const STATUS_CFG = {
  ok:       { label: 'OK',       cls: 'bg-green-100 text-green-700',   Icon: CheckCircle  },
  baixo:    { label: 'Baixo',    cls: 'bg-yellow-100 text-yellow-700', Icon: AlertTriangle },
  vencendo: { label: 'Vencendo', cls: 'bg-orange-100 text-orange-700', Icon: Calendar      },
  critico:  { label: 'Crítico',  cls: 'bg-red-100 text-red-700',       Icon: XCircle       },
}

export function MedicamentosPage() {
  const { user } = useAuthStore()
  const canCreate = hasPermission(user?.role, 'create:medicamentos')

  const [busca, setBusca]             = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo]     = useState('todos')

  const filtrados = MEDICAMENTOS.filter(m => {
    const q = busca.toLowerCase()
    return (
      (m.nome.toLowerCase().includes(q) || m.principio.toLowerCase().includes(q)) &&
      (filtroStatus === 'todos' || m.status === filtroStatus) &&
      (filtroTipo   === 'todos' || m.tipo   === filtroTipo)
    )
  })

  const stats = {
    total:    MEDICAMENTOS.length,
    ok:       MEDICAMENTOS.filter(m => m.status === 'ok').length,
    alertas:  MEDICAMENTOS.filter(m => ['baixo','vencendo'].includes(m.status)).length,
    criticos: MEDICAMENTOS.filter(m => m.status === 'critico').length,
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Medicamentos</h1>
          <p className="text-xs text-slate-500 mt-0.5">{stats.total} medicamentos cadastrados</p>
        </div>
        {canCreate && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Novo Medicamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: stats.total,    cls: 'text-slate-800'  },
          { label: 'OK',       value: stats.ok,       cls: 'text-green-600'  },
          { label: 'Alertas',  value: stats.alertas,  cls: 'text-yellow-600' },
          { label: 'Críticos', value: stats.criticos, cls: 'text-red-600'    },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-extrabold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou princípio ativo..." className="input pl-8 h-9 text-xs w-full" />
        </div>
        <div className="relative">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="input h-9 text-xs pr-8 appearance-none cursor-pointer min-w-36">
            <option value="todos">Todos os status</option>
            <option value="ok">OK</option>
            <option value="baixo">Estoque Baixo</option>
            <option value="vencendo">Vencendo</option>
            <option value="critico">Crítico</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="input h-9 text-xs pr-8 appearance-none cursor-pointer min-w-32">
            <option value="todos">Todos os tipos</option>
            <option value="Cápsula">Cápsula</option>
            <option value="Comprimido">Comprimido</option>
            <option value="Líquido">Líquido</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Medicamento','Tipo','Conc.','Estoque','Mínimo','Validade','Fornecedor','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                {canCreate && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map(m => {
                const s = STATUS_CFG[m.status as keyof typeof STATUS_CFG]
                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 whitespace-nowrap">{m.nome}</div>
                          <div className="text-[11px] text-slate-400">{m.principio}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{m.tipo}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">{m.conc}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${m.estoque <= m.minimo ? 'text-red-600' : 'text-slate-700'}`}>
                        {m.estoque} un.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{m.minimo} un.</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{m.validade}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{m.fornecedor}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${s.cls}`}>
                        <s.Icon className="w-3 h-3" />{s.label}
                      </span>
                    </td>
                    {canCreate && (
                      <td className="px-4 py-3">
                        <button className="text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap">Editar</button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Nenhum medicamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
