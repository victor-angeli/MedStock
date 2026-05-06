import { useState } from 'react'
import { Package, Search, ChevronDown, AlertTriangle, CheckCircle, XCircle, Calendar, TrendingDown } from 'lucide-react'

const ESTOQUE = [
  { id:'1',  nome:'Amoxicilina 500mg',     tipo:'Cápsula',    lote:'L24A123', validade:'15/06/2025', atual:28,  minimo:50,  maximo:200, status:'vencendo' },
  { id:'2',  nome:'Dipirona 500mg',        tipo:'Comprimido', lote:'D24B456', validade:'20/06/2025', atual:15,  minimo:40,  maximo:150, status:'vencendo' },
  { id:'3',  nome:'Losartana 50mg',        tipo:'Comprimido', lote:'L24C789', validade:'30/06/2025', atual:35,  minimo:60,  maximo:180, status:'vencendo' },
  { id:'4',  nome:'Omeprazol 20mg',        tipo:'Cápsula',    lote:'O24D012', validade:'10/08/2025', atual:18,  minimo:30,  maximo:120, status:'baixo'    },
  { id:'5',  nome:'Paracetamol 750mg',     tipo:'Comprimido', lote:'P24E345', validade:'15/09/2025', atual:25,  minimo:50,  maximo:200, status:'baixo'    },
  { id:'6',  nome:'Atenolol 25mg',         tipo:'Comprimido', lote:'A24G901', validade:'10/02/2026', atual:120, minimo:30,  maximo:150, status:'ok'       },
  { id:'7',  nome:'Metformina 850mg',      tipo:'Comprimido', lote:'M24F678', validade:'05/03/2026', atual:80,  minimo:40,  maximo:160, status:'ok'       },
  { id:'8',  nome:'Sinvastatina 20mg',     tipo:'Comprimido', lote:'S24H234', validade:'20/04/2026', atual:45,  minimo:30,  maximo:120, status:'ok'       },
  { id:'9',  nome:'Captopril 25mg',        tipo:'Comprimido', lote:'C24K123', validade:'12/05/2026', atual:60,  minimo:30,  maximo:150, status:'ok'       },
  { id:'10', nome:'Hidroclorotiazida 25mg',tipo:'Comprimido', lote:'H24L456', validade:'01/07/2025', atual:5,   minimo:20,  maximo:80,  status:'critico'  },
  { id:'11', nome:'Ibuprofeno 400mg',      tipo:'Comprimido', lote:'I24I567', validade:'10/08/2026', atual:90,  minimo:25,  maximo:120, status:'ok'       },
  { id:'12', nome:'Azitromicina 500mg',    tipo:'Comprimido', lote:'AZ24M78', validade:'15/07/2025', atual:8,   minimo:20,  maximo:60,  status:'critico'  },
]

const STATUS_CFG = {
  ok:       { label:'OK',        cls:'bg-green-100 text-green-700',   Icon:CheckCircle  },
  baixo:    { label:'Baixo',     cls:'bg-yellow-100 text-yellow-700', Icon:AlertTriangle},
  vencendo: { label:'Vencendo',  cls:'bg-orange-100 text-orange-700', Icon:Calendar     },
  critico:  { label:'Crítico',   cls:'bg-red-100 text-red-700',       Icon:XCircle      },
}

function BarEstoque({ atual, minimo, maximo }: { atual: number; minimo: number; maximo: number }) {
  const pct = Math.min((atual / maximo) * 100, 100)
  const cls = atual <= 0 ? 'bg-red-500' : atual < minimo ? 'bg-yellow-400' : 'bg-green-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-16">
        <div className={`h-full rounded-full transition-all ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 font-medium w-6 text-right">{Math.round(pct)}%</span>
    </div>
  )
}

export function EstoquePage() {
  const [busca, setBusca]             = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const filtrados = ESTOQUE.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroStatus === 'todos' || e.status === filtroStatus)
  )

  const total     = ESTOQUE.length
  const ok        = ESTOQUE.filter(e => e.status === 'ok').length
  const baixo     = ESTOQUE.filter(e => e.status === 'baixo').length
  const vencendo  = ESTOQUE.filter(e => e.status === 'vencendo').length
  const critico   = ESTOQUE.filter(e => e.status === 'critico').length
  const unidades  = ESTOQUE.reduce((s, e) => s + e.atual, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-800">Estoque</h1>
        <p className="text-xs text-slate-500 mt-0.5">Posição atual do estoque — {unidades} unidades em {total} medicamentos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label:'Total',    value:total,    cls:'text-slate-800',  bg:'bg-slate-50'   },
          { label:'OK',       value:ok,       cls:'text-green-600',  bg:'bg-green-50'   },
          { label:'Baixo',    value:baixo,    cls:'text-yellow-600', bg:'bg-yellow-50'  },
          { label:'Vencendo', value:vencendo, cls:'text-orange-500', bg:'bg-orange-50'  },
          { label:'Crítico',  value:critico,  cls:'text-red-600',    bg:'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className={`card p-4 text-center ${s.bg}`}>
            <div className={`text-2xl font-extrabold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar medicamento..." className="input pl-8 h-9 text-xs w-full" />
        </div>
        <div className="flex gap-1">
          {(['todos','ok','baixo','vencendo','critico'] as const).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filtroStatus === s ? 'bg-[#1A73E8] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s === 'todos' ? 'Todos' : STATUS_CFG[s as keyof typeof STATUS_CFG].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Medicamento','Tipo','Lote','Validade','Nível do Estoque','Atual','Mínimo','Máximo','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map(e => {
                const s = STATUS_CFG[e.status as keyof typeof STATUS_CFG]
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{e.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{e.tipo}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{e.lote}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{e.validade}</td>
                    <td className="px-4 py-3 min-w-32"><BarEstoque atual={e.atual} minimo={e.minimo} maximo={e.maximo} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${e.atual < e.minimo ? 'text-red-600' : 'text-slate-700'}`}>{e.atual}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{e.minimo}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{e.maximo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${s.cls}`}>
                        <s.Icon className="w-3 h-3" />{s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Nenhum item encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
