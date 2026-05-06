import { useState } from 'react'
import { Truck, Plus, Search, Phone, Mail, Package, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'

const FORNECEDORES = [
  { id:'1', nome:'Eurofarma Laboratórios',   cnpj:'61.190.096/0001-92', contato:'Paulo Henrique',    telefone:'(11) 3322-5555', email:'comercial@eurofarma.com.br',  cidade:'São Paulo, SP',    produtos:42, status:'ativo',   cor:'bg-blue-500'    },
  { id:'2', nome:'EMS S.A.',                 cnpj:'57.507.378/0001-00', contato:'Fernanda Alves',    telefone:'(11) 4793-7000', email:'vendas@ems.com.br',            cidade:'São Bernardo, SP', produtos:28, status:'ativo',   cor:'bg-emerald-500' },
  { id:'3', nome:'Medley Farmacêutica',      cnpj:'03.789.218/0001-04', contato:'Ricardo Santos',   telefone:'(11) 2935-8000', email:'pedidos@medley.com.br',        cidade:'Campinas, SP',     produtos:19, status:'ativo',   cor:'bg-purple-500'  },
  { id:'4', nome:'Sanofi-Aventis Farmac.',   cnpj:'02.685.377/0001-97', contato:'Ana Cristina',     telefone:'(11) 5542-5000', email:'sac@sanofi.com',               cidade:'São Paulo, SP',    produtos:15, status:'ativo',   cor:'bg-orange-500'  },
  { id:'5', nome:'Sandoz do Brasil',         cnpj:'50.343.859/0001-39', contato:'Marcelo Costa',    telefone:'(11) 3049-9000', email:'pedidos@sandoz.com.br',        cidade:'São Paulo, SP',    produtos:11, status:'ativo',   cor:'bg-teal-500'    },
  { id:'6', nome:'Pfizer Brasil',            cnpj:'46.070.868/0001-69', contato:'Juliana Ferreira', telefone:'(11) 5523-1000', email:'comercial@pfizer.com',         cidade:'São Paulo, SP',    produtos:8,  status:'ativo',   cor:'bg-red-500'     },
  { id:'7', nome:'Abbott Laboratórios',      cnpj:'56.998.982/0001-08', contato:'Bruno Mendes',     telefone:'(11) 3929-8000', email:'vendas@abbott.com.br',         cidade:'São Paulo, SP',    produtos:7,  status:'ativo',   cor:'bg-sky-500'     },
  { id:'8', nome:'Merck S.A.',               cnpj:'53.518.202/0001-00', contato:'Carla Rodrigues',  telefone:'(11) 4689-8900', email:'sac@merck.com.br',             cidade:'São Paulo, SP',    produtos:9,  status:'inativo', cor:'bg-slate-500'   },
]

export function FornecedoresPage() {
  const { user } = useAuthStore()
  const canCreate = hasPermission(user?.role, 'create:fornecedores')
  const [busca, setBusca]     = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtrados = FORNECEDORES.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    f.contato.toLowerCase().includes(busca.toLowerCase())
  )

  const ativos   = FORNECEDORES.filter(f => f.status === 'ativo').length
  const produtos  = FORNECEDORES.reduce((s, f) => s + f.produtos, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Fornecedores</h1>
          <p className="text-xs text-slate-500 mt-0.5">{FORNECEDORES.length} fornecedores cadastrados</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800">{FORNECEDORES.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-green-600">{ativos}</div>
          <div className="text-xs text-slate-400 mt-0.5">Ativos</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600">{produtos}</div>
          <div className="text-xs text-slate-400 mt-0.5">Produtos fornecidos</div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, cidade ou contato..." className="input pl-8 h-9 text-xs w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map(f => (
          <div key={f.id} className={`bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-all ${f.status === 'inativo' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${f.cor} flex items-center justify-center flex-shrink-0`}>
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-800 leading-snug">{f.nome}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">CNPJ: {f.cnpj}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    f.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {f.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{f.telefone} — {f.contato}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{f.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{f.produtos} produtos fornecidos · {f.cidade}</span>
              </div>
            </div>

            {canCreate && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Ver produtos
                </button>
                <span className="text-slate-200">|</span>
                <button className="text-xs text-slate-500 font-semibold hover:underline">Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="card p-10 text-center text-slate-400">
          <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">Nenhum fornecedor encontrado</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-4">Novo Fornecedor</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social *</label>
                <input type="text" placeholder="Nome da empresa" className="input h-9 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ *</label>
                <input type="text" placeholder="00.000.000/0000-00" className="input h-9 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
                  <input type="text" placeholder="(00) 0000-0000" className="input h-9 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contato</label>
                  <input type="text" placeholder="Nome do responsável" className="input h-9 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input type="email" placeholder="comercial@empresa.com" className="input h-9 text-xs" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#1A73E8] text-white text-sm font-semibold hover:bg-[#1565C0]">
                Salvar Fornecedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
