import { useState } from 'react'
import { ArrowDownCircle, Plus, Search, ChevronDown, Package, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'

interface Entrada {
  id: string; data: string; hora: string; medicamento: string
  lote: string; quantidade: number; responsavel: string; fornecedor: string; justificativa: string
}

const ENTRADAS_INICIAIS: Entrada[] = [
  { id:'1',  data:'06/05/2026', hora:'09:15', medicamento:'Paracetamol 750mg',  lote:'P24E345', quantidade:200, responsavel:'Juliana Costa',  fornecedor:'Medley',    justificativa:'Reposição programada mensal' },
  { id:'2',  data:'06/05/2026', hora:'08:00', medicamento:'Metformina 850mg',   lote:'M24F678', quantidade:100, responsavel:'Vitor Teixeira', fornecedor:'Merck',     justificativa:'Reposição de estoque' },
  { id:'3',  data:'05/05/2026', hora:'14:30', medicamento:'Atenolol 25mg',      lote:'A24G901', quantidade:150, responsavel:'Mariana Lima',   fornecedor:'EMS',       justificativa:'Compra emergencial — estoque crítico' },
  { id:'4',  data:'04/05/2026', hora:'10:00', medicamento:'Sinvastatina 20mg',  lote:'S24H234', quantidade: 80, responsavel:'Juliana Costa',  fornecedor:'Sandoz',    justificativa:'Reposição programada' },
  { id:'5',  data:'03/05/2026', hora:'11:20', medicamento:'Ibuprofeno 400mg',   lote:'I24I567', quantidade:120, responsavel:'Mariana Lima',   fornecedor:'Abbott',    justificativa:'Reposição mensal' },
  { id:'6',  data:'02/05/2026', hora:'09:45', medicamento:'Omeprazol 20mg',     lote:'O24J890', quantidade: 60, responsavel:'Vitor Teixeira', fornecedor:'Eurofarma', justificativa:'Reposição urgente — abaixo do mínimo' },
  { id:'7',  data:'01/05/2026', hora:'16:00', medicamento:'Captopril 25mg',     lote:'C24K123', quantidade: 90, responsavel:'Juliana Costa',  fornecedor:'Medley',    justificativa:'Reposição programada' },
  { id:'8',  data:'30/04/2026', hora:'08:30', medicamento:'Amoxicilina 500mg',  lote:'L24A456', quantidade:100, responsavel:'Carlos Silva',   fornecedor:'Eurofarma', justificativa:'Reposição de lote vencido' },
]

const MEDICAMENTOS_LISTA = [
  'Amoxicilina 500mg','Dipirona 500mg','Paracetamol 750mg','Omeprazol 20mg',
  'Losartana 50mg','Atenolol 25mg','Metformina 850mg','Sinvastatina 20mg',
  'Captopril 25mg','Hidroclorotiazida 25mg','Ibuprofeno 400mg','Azitromicina 500mg',
]

interface FormState { medicamento: string; lote: string; quantidade: string; validade: string; fornecedor: string; justificativa: string }
const FORM_VAZIO: FormState = { medicamento: '', lote: '', quantidade: '', validade: '', fornecedor: '', justificativa: '' }

export function EntradasPage() {
  const { user } = useAuthStore()
  const canCreate = hasPermission(user?.role, 'create:entradas')
  const [entradas, setEntradas] = useState<Entrada[]>(ENTRADAS_INICIAIS)
  const [busca, setBusca]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState<FormState>(FORM_VAZIO)
  const [erros, setErros]       = useState<Partial<FormState>>({})
  const [sucesso, setSucesso]   = useState(false)

  const filtrados = entradas.filter(e =>
    e.medicamento.toLowerCase().includes(busca.toLowerCase()) ||
    e.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
    e.lote.toLowerCase().includes(busca.toLowerCase())
  )

  const totalUnidades = entradas.reduce((s, e) => s + e.quantidade, 0)

  const registrarEntrada = () => {
    const novosErros: Partial<FormState> = {}
    if (!form.medicamento) novosErros.medicamento = 'Obrigatório'
    if (!form.lote.trim()) novosErros.lote = 'Obrigatório'
    if (!form.quantidade || Number(form.quantidade) <= 0) novosErros.quantidade = 'Informe quantidade válida'
    if (!form.justificativa.trim()) novosErros.justificativa = 'Obrigatório'
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    const agora = new Date()
    const novaEntrada: Entrada = {
      id: String(Date.now()),
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      medicamento: form.medicamento,
      lote: form.lote,
      quantidade: Number(form.quantidade),
      responsavel: user?.name ?? 'Usuário',
      fornecedor: form.fornecedor || '—',
      justificativa: form.justificativa,
    }
    setEntradas(prev => [novaEntrada, ...prev])
    setSucesso(true)
  }

  const fecharModal = () => { setShowModal(false); setSucesso(false); setForm(FORM_VAZIO); setErros({}) }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Entradas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Registro de entrada de medicamentos no estoque</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Registrar Entrada
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600">{entradas.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Entradas este mês</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800">{totalUnidades.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-slate-400 mt-0.5">Unidades recebidas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-green-600">3</div>
          <div className="text-xs text-slate-400 mt-0.5">Fornecedores ativos</div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por medicamento, lote ou responsável..." className="input pl-8 h-9 text-xs w-full" />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Data','Medicamento','Lote','Qtd.','Fornecedor','Responsável','Justificativa'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-slate-700">{e.data}</div>
                    <div className="text-[11px] text-slate-400">{e.hora}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{e.medicamento}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{e.lote}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-blue-600">+{e.quantidade} un.</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{e.fornecedor}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{e.responsavel}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{e.justificativa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Nenhuma entrada encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Registrar Entrada */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={fecharModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {sucesso ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Entrada registrada!</h2>
                <p className="text-sm text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{form.medicamento}</span> — {form.quantidade} unidades adicionadas ao estoque.
                </p>
                <button onClick={fecharModal}
                  className="mt-4 w-full py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0]">
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-base font-bold text-slate-800 mb-4">Registrar Nova Entrada</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Medicamento *</label>
                    <div className="relative">
                      <select value={form.medicamento} onChange={e => setForm(f => ({ ...f, medicamento: e.target.value }))}
                        className={`input h-9 text-xs w-full pr-8 appearance-none cursor-pointer ${erros.medicamento ? 'border-red-300' : ''}`}>
                        <option value="">Selecione o medicamento...</option>
                        {MEDICAMENTOS_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    {erros.medicamento && <p className="text-[11px] text-red-500 mt-0.5">{erros.medicamento}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Lote *</label>
                      <input type="text" value={form.lote} onChange={e => setForm(f => ({ ...f, lote: e.target.value }))}
                        placeholder="Ex: L24A123" className={`input h-9 text-xs ${erros.lote ? 'border-red-300' : ''}`} />
                      {erros.lote && <p className="text-[11px] text-red-500 mt-0.5">{erros.lote}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Quantidade *</label>
                      <input type="number" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
                        placeholder="0" min="1" className={`input h-9 text-xs ${erros.quantidade ? 'border-red-300' : ''}`} />
                      {erros.quantidade && <p className="text-[11px] text-red-500 mt-0.5">{erros.quantidade}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Validade do lote</label>
                    <input type="date" value={form.validade} onChange={e => setForm(f => ({ ...f, validade: e.target.value }))}
                      className="input h-9 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fornecedor</label>
                    <input type="text" value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))}
                      placeholder="Nome do fornecedor" className="input h-9 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Justificativa *</label>
                    <textarea rows={2} value={form.justificativa} onChange={e => setForm(f => ({ ...f, justificativa: e.target.value }))}
                      placeholder="Motivo da entrada..." className={`input text-xs resize-none py-2 ${erros.justificativa ? 'border-red-300' : ''}`} />
                    {erros.justificativa && <p className="text-[11px] text-red-500 mt-0.5">{erros.justificativa}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={fecharModal}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button onClick={registrarEntrada}
                    className="flex-1 py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0]">
                    Registrar Entrada
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
