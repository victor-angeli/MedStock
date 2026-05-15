import { useState } from 'react'
import { ArrowUpCircle, Plus, Search, Package, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'

const SAIDAS = [
  { id:'1', data:'06/05/2026', hora:'08:42', medicamento:'Dipirona 500mg',      lote:'D24B456', quantidade: 20, responsavel:'Carlos Silva',   destino:'Consultório 1', justificativa:'Atendimento ambulatorial' },
  { id:'2', data:'05/05/2026', hora:'14:10', medicamento:'Amoxicilina 500mg',   lote:'L24A123', quantidade: 50, responsavel:'Mariana Lima',   destino:'Enfermaria A',  justificativa:'Tratamento de infecção — prescrição Dr. Ramos' },
  { id:'3', data:'05/05/2026', hora:'11:00', medicamento:'Losartana 50mg',      lote:'L24C789', quantidade: 15, responsavel:'Carlos Silva',   destino:'Consultório 2', justificativa:'Paciente hipertenso em acompanhamento' },
  { id:'4', data:'04/05/2026', hora:'09:30', medicamento:'Paracetamol 750mg',   lote:'P24E345', quantidade: 30, responsavel:'Juliana Costa',  destino:'Emergência',    justificativa:'Atendimento de urgência — febre alta' },
  { id:'5', data:'03/05/2026', hora:'16:20', medicamento:'Omeprazol 20mg',      lote:'O24D012', quantidade: 10, responsavel:'Vitor Teixeira', destino:'Consultório 3', justificativa:'Paciente com gastrite aguda' },
  { id:'6', data:'02/05/2026', hora:'10:45', medicamento:'Atenolol 25mg',       lote:'A24G901', quantidade: 30, responsavel:'Juliana Costa',  destino:'Consultório 1', justificativa:'Controle de arritmia — uso contínuo' },
  { id:'7', data:'01/05/2026', hora:'14:00', medicamento:'Sinvastatina 20mg',   lote:'S24H234', quantidade: 20, responsavel:'Carlos Silva',   destino:'Consultório 2', justificativa:'Paciente com hipercolesterolemia' },
]

export function SaidasPage() {
  const { user } = useAuthStore()
  const canCreate = hasPermission(user?.role, 'create:saidas')
  const [busca, setBusca]     = useState('')
  const [showModal, setShowModal] = useState(true)

  const filtrados = SAIDAS.filter(s =>
    s.medicamento.toLowerCase().includes(busca.toLowerCase()) ||
    s.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
    s.destino.toLowerCase().includes(busca.toLowerCase())
  )

  const totalUnidades = SAIDAS.reduce((acc, s) => acc + s.quantidade, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Saídas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Registro de saída de medicamentos do estoque</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Registrar Saída
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-orange-500">{SAIDAS.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Saídas este mês</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800">{totalUnidades}</div>
          <div className="text-xs text-slate-400 mt-0.5">Unidades dispensadas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600">3</div>
          <div className="text-xs text-slate-400 mt-0.5">Destinos diferentes</div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por medicamento, destino ou responsável..." className="input pl-8 h-9 text-xs w-full" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Data','Medicamento','Lote','Qtd.','Destino','Responsável','Justificativa'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-slate-700">{s.data}</div>
                    <div className="text-[11px] text-slate-400">{s.hora}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{s.medicamento}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{s.lote}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-orange-600">-{s.quantidade} un.</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full whitespace-nowrap">{s.destino}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{s.responsavel}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{s.justificativa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Nenhuma saída encontrada</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-4">Registrar Nova Saída</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Medicamento *</label>
                <div className="relative">
                  <select className="input h-9 text-xs w-full pr-8 appearance-none cursor-pointer">
                    <option value="">Selecione o medicamento...</option>
                    <option>Dipirona 500mg</option>
                    <option>Amoxicilina 500mg</option>
                    <option>Paracetamol 750mg</option>
                    <option>Omeprazol 20mg</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantidade *</label>
                  <input type="number" placeholder="0" min="1" className="input h-9 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Destino *</label>
                  <input type="text" placeholder="Consultório, enfermaria..." className="input h-9 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Justificativa / Prescrição *</label>
                <textarea rows={3} placeholder="Informe o motivo da saída ou número da prescrição..." className="input text-xs resize-none py-2" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
                Registrar Saída
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
