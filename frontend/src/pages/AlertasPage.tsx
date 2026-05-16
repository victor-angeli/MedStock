import { useState } from 'react'
import { Bell, Calendar, AlertTriangle, Package, CheckCheck, ChevronRight } from 'lucide-react'
import { useAlertsStore, AlertaTipo } from '@/store/alertsStore'
import { useSearchParams } from 'react-router-dom'

const TIPO_CFG = {
  vencimento:   { label:'Vencimento',   Icon:Calendar,      bg:'bg-orange-100', ico:'text-orange-500', border:'border-orange-200' },
  estoque:      { label:'Estoque Baixo',Icon:AlertTriangle, bg:'bg-yellow-100', ico:'text-yellow-600', border:'border-yellow-200' },
  movimentacao: { label:'Sem Giro',     Icon:Package,       bg:'bg-blue-100',   ico:'text-blue-500',   border:'border-blue-200'   },
}

const PRIOR_CFG = {
  alta:  'bg-red-100 text-red-700',
  media: 'bg-orange-100 text-orange-600',
  baixa: 'bg-slate-100 text-slate-500',
}

export function AlertasPage() {
  const { alertas, marcarLido, marcarTodos } = useAlertsStore()

  const [searchParams] = useSearchParams()

  const tipo = searchParams.get('tipo')

  const filtroInicial: AlertaTipo | 'todos' =
    tipo === 'vencimento' ||
    tipo === 'estoque' ||
    tipo === 'movimentacao'
      ? tipo
      : 'todos'

  const [filtro, setFiltro] = useState<AlertaTipo | 'todos'>(
    filtroInicial
  )

  const [soNaoLidos, setSoNaoLidos] = useState(false)

  const naoLidos = alertas.filter(a => !a.lido).length

  const filtrados = alertas.filter(a =>
    (filtro === 'todos' || a.tipo === filtro) &&
    (!soNaoLidos || !a.lido)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Alertas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {naoLidos > 0
              ? <><span className="font-semibold text-red-600">{naoLidos} alertas</span> não lidos</>
              : 'Todos os alertas foram lidos'}
          </p>
        </div>
        {naoLidos > 0 && (
          <button onClick={marcarTodos}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Marcar todos como lidos
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(TIPO_CFG).map(([tipo, cfg]) => {
          const count = alertas.filter(a => a.tipo === tipo && !a.lido).length
          return (
            <button key={tipo} onClick={() => setFiltro(tipo as AlertaTipo)}
              className={`card p-4 text-left transition-all hover:shadow-md ${filtro === tipo ? 'ring-2 ring-[#1A73E8]' : ''}`}>
              <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center mb-2`}>
                <cfg.Icon className={`w-4 h-4 ${cfg.ico}`} />
              </div>
              <div className="text-xl font-extrabold text-slate-800">{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{cfg.label}</div>
            </button>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(['todos','vencimento','estoque','movimentacao'] as const).map(t => (
            <button key={t} onClick={() => setFiltro(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filtro === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t === 'todos' ? 'Todos' : TIPO_CFG[t].label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input type="checkbox" checked={soNaoLidos} onChange={e => setSoNaoLidos(e.target.checked)}
            className="rounded text-[#1A73E8]" />
          Somente não lidos
        </label>
        <span className="text-xs text-slate-400">{filtrados.length} alerta{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-2">
        {filtrados.map(a => {
          const cfg = TIPO_CFG[a.tipo]
          return (
            <div key={a.id}
              className={`bg-white rounded-xl border-l-4 p-4 flex items-start gap-4 transition-all hover:shadow-sm ${
                a.lido ? `border-slate-200 opacity-70` : `${cfg.border}`
              }`}>
              <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <cfg.Icon className={`w-4 h-4 ${cfg.ico}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`text-sm leading-snug ${a.lido ? 'font-medium text-slate-600' : 'font-bold text-slate-800'}`}>
                      {a.titulo}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{a.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIOR_CFG[a.prioridade]}`}>
                      {a.prioridade === 'alta' ? '🔴 Alta' : a.prioridade === 'media' ? '🟡 Média' : '⚪ Baixa'}
                    </span>
                    {!a.lido && (
                      <button onClick={() => marcarLido(a.id)}
                        className="text-[11px] text-blue-600 font-semibold hover:underline whitespace-nowrap">
                        Marcar lido
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {a.medicamento && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {a.medicamento}
                    </span>
                  )}
                  {a.lote && (
                    <span className="text-[11px] text-slate-400 font-mono">Lote: {a.lote}</span>
                  )}
                  {a.valor && (
                    <span className={`text-[11px] font-bold ${cfg.ico}`}>{a.valor}</span>
                  )}
                  <span className="text-[11px] text-slate-300 ml-auto">{a.data}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
            </div>
          )
        })}

        {filtrados.length === 0 && (
          <div className="card p-10 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Nenhum alerta{soNaoLidos ? ' não lido' : ''}</p>
            {soNaoLidos && (
              <p className="text-xs mt-1 text-slate-300">Todos os alertas foram lidos</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
