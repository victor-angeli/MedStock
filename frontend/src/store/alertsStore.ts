import { create } from 'zustand'

export type AlertaTipo = 'vencimento' | 'estoque' | 'movimentacao'

export interface Alerta {
  id: number
  tipo: AlertaTipo
  titulo: string
  desc: string
  medicamento?: string
  lote?: string
  valor?: string
  data: string
  lido: boolean
  prioridade: 'alta' | 'media' | 'baixa'
}

const ALERTAS_INICIAL: Alerta[] = [
  { id:1,  tipo:'vencimento',   titulo:'Amoxicilina 500mg vence em 22 dias',       desc:'28 unidades do lote L24A123 irão vencer em breve.',              medicamento:'Amoxicilina 500mg',     lote:'L24A123', valor:'22 dias',  data:'06/05/2026', lido:false, prioridade:'alta'  },
  { id:2,  tipo:'estoque',      titulo:'Dipirona 500mg abaixo do mínimo',           desc:'Estoque atual: 15 un. — mínimo recomendado: 40 un.',            medicamento:'Dipirona 500mg',         lote:'D24B456', valor:'15/40',    data:'06/05/2026', lido:false, prioridade:'alta'  },
  { id:3,  tipo:'vencimento',   titulo:'Losartana 50mg vence em 37 dias',           desc:'35 unidades do lote L24C789 próximas do vencimento.',           medicamento:'Losartana 50mg',         lote:'L24C789', valor:'37 dias',  data:'05/05/2026', lido:false, prioridade:'alta'  },
  { id:4,  tipo:'estoque',      titulo:'Hidroclorotiazida 25mg — nível crítico',    desc:'Apenas 5 unidades em estoque. Reposição imediata necessária.',  medicamento:'Hidroclorotiazida 25mg', lote:'H24L456', valor:'5/20',     data:'05/05/2026', lido:false, prioridade:'alta'  },
  { id:5,  tipo:'estoque',      titulo:'Omeprazol 20mg abaixo do mínimo',           desc:'Estoque atual: 18 un. — mínimo recomendado: 30 un.',            medicamento:'Omeprazol 20mg',         lote:'O24D012', valor:'18/30',    data:'05/05/2026', lido:false, prioridade:'media' },
  { id:6,  tipo:'vencimento',   titulo:'Azitromicina 500mg vence em 70 dias',       desc:'8 unidades do lote AZ24M78 vencerão em 70 dias.',              medicamento:'Azitromicina 500mg',     lote:'AZ24M78', valor:'70 dias',  data:'04/05/2026', lido:false, prioridade:'media' },
  { id:7,  tipo:'estoque',      titulo:'Paracetamol 750mg abaixo do mínimo',        desc:'Estoque atual: 25 un. — mínimo recomendado: 50 un.',            medicamento:'Paracetamol 750mg',      lote:'P24E345', valor:'25/50',    data:'04/05/2026', lido:false, prioridade:'media' },
  { id:8,  tipo:'movimentacao', titulo:'Ibuprofeno 400mg sem movimentação há 90 dias',desc:'Verifique a necessidade de manter este item em estoque.',   medicamento:'Ibuprofeno 400mg',       lote:'I24I567', valor:'90 dias',  data:'03/05/2026', lido:true,  prioridade:'baixa' },
  { id:9,  tipo:'movimentacao', titulo:'Prednisona 20mg sem movimentação há 60 dias', desc:'Considere revisar o estoque deste medicamento.',             medicamento:'Prednisona 20mg',        lote:'PR24N90', valor:'60 dias',  data:'02/05/2026', lido:true,  prioridade:'baixa' },
  { id:10, tipo:'movimentacao', titulo:'Dexametasona 4mg sem movimentação há 45 dias',desc:'Item com baixo giro — avalie a demanda.',                   medicamento:'Dexametasona 4mg',       lote:'DX24O12', valor:'45 dias',  data:'01/05/2026', lido:true,  prioridade:'baixa' },
]

interface AlertasState {
  alertas: Alerta[]
  marcarLido: (id: number) => void
  marcarTodos: () => void
}

export const useAlertsStore = create<AlertasState>((set) => ({
  alertas: ALERTAS_INICIAL,
  marcarLido: (id) =>
    set((s) => ({ alertas: s.alertas.map((a) => (a.id === id ? { ...a, lido: true } : a)) })),
  marcarTodos: () =>
    set((s) => ({ alertas: s.alertas.map((a) => ({ ...a, lido: true })) })),
}))
