import { useState, useRef } from 'react'
import { FileText, Printer, Download, Calendar, Filter, BarChart2, AlertTriangle, Package, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoRelatorio = 'estoque' | 'vencimentos' | 'movimentacoes' | 'baixo'

const TABS: { id: TipoRelatorio; label: string; icon: React.ElementType }[] = [
  { id: 'estoque',       label: 'Estoque Geral',       icon: BarChart2       },
  { id: 'vencimentos',   label: 'Vencimentos',          icon: Calendar        },
  { id: 'movimentacoes', label: 'Movimentações',        icon: ArrowDownCircle },
  { id: 'baixo',         label: 'Estoque Baixo/Crítico',icon: AlertTriangle   },
]

// ─── Mock de dados ────────────────────────────────────────────────────────────

const DADOS_ESTOQUE = [
  { medicamento: 'Amoxicilina 500mg',      tipo: 'Cápsula',    estoque: 28,  minimo: 50,  status: 'Baixo'    },
  { medicamento: 'Dipirona 500mg',         tipo: 'Comprimido', estoque: 15,  minimo: 40,  status: 'Baixo'    },
  { medicamento: 'Losartana 50mg',         tipo: 'Comprimido', estoque: 35,  minimo: 60,  status: 'Baixo'    },
  { medicamento: 'Omeprazol 20mg',         tipo: 'Cápsula',    estoque: 18,  minimo: 30,  status: 'Baixo'    },
  { medicamento: 'Paracetamol 750mg',      tipo: 'Comprimido', estoque: 25,  minimo: 50,  status: 'Baixo'    },
  { medicamento: 'Atenolol 25mg',          tipo: 'Comprimido', estoque: 120, minimo: 30,  status: 'OK'       },
  { medicamento: 'Metformina 850mg',       tipo: 'Comprimido', estoque: 80,  minimo: 40,  status: 'OK'       },
  { medicamento: 'Sinvastatina 20mg',      tipo: 'Comprimido', estoque: 45,  minimo: 30,  status: 'OK'       },
  { medicamento: 'Captopril 25mg',         tipo: 'Comprimido', estoque: 60,  minimo: 30,  status: 'OK'       },
  { medicamento: 'Hidroclorotiazida 25mg', tipo: 'Comprimido', estoque: 5,   minimo: 20,  status: 'Crítico'  },
]

const DADOS_VENCIMENTOS = [
  { medicamento: 'Amoxicilina 500mg',  lote: 'L24A123', validade: '15/06/2025', diasRestantes: 22, estoque: 28  },
  { medicamento: 'Dipirona 500mg',     lote: 'D24B456', validade: '20/06/2025', diasRestantes: 27, estoque: 15  },
  { medicamento: 'Losartana 50mg',     lote: 'L24C789', validade: '30/06/2025', diasRestantes: 37, estoque: 35  },
  { medicamento: 'Omeprazol 20mg',     lote: '024D012', validade: '10/08/2025', diasRestantes: 78, estoque: 18  },
  { medicamento: 'Paracetamol 750mg',  lote: 'P24E345', validade: '15/09/2025', diasRestantes: 114, estoque: 25 },
]

const DADOS_MOVIMENTACOES = [
  { data: '06/05/2026', medicamento: 'Paracetamol 750mg', tipo: 'Saída',   quantidade: 200, responsavel: 'Juliana', lote: 'P24E345' },
  { data: '06/05/2026', medicamento: 'Dipirona 500mg',    tipo: 'Entrada', quantidade: 20,  responsavel: 'Carlos',  lote: 'D24B456' },
  { data: '05/05/2026', medicamento: 'Amoxicilina 500mg', tipo: 'Saída',   quantidade: 50,  responsavel: 'Mariana', lote: 'L24A123' },
  { data: '05/05/2026', medicamento: 'Metformina 850mg',  tipo: 'Entrada', quantidade: 100, responsavel: 'Vitor',   lote: 'M24F678' },
  { data: '04/05/2026', medicamento: 'Atenolol 25mg',     tipo: 'Saída',   quantidade: 30,  responsavel: 'Juliana', lote: 'A24G901' },
]

const DADOS_BAIXO = DADOS_ESTOQUE.filter(d => d.status === 'Baixo' || d.status === 'Crítico')

function statusBadge(status: string) {
  if (status === 'OK')       return 'bg-green-100 text-green-700'
  if (status === 'Baixo')    return 'bg-yellow-100 text-yellow-700'
  if (status === 'Crítico')  return 'bg-red-100 text-red-700'
  if (status === 'Entrada')  return 'bg-blue-100 text-blue-700'
  if (status === 'Saída')    return 'bg-orange-100 text-orange-700'
  return 'bg-slate-100 text-slate-600'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RelatoriosPage() {
  const { user } = useAuthStore()
  const [tab, setTab]               = useState<TipoRelatorio>('estoque')
  const [descricao, setDescricao]   = useState('')
  const [dataInicio, setDataInicio] = useState('2026-05-01')
  const [dataFim, setDataFim]       = useState(format(new Date(), 'yyyy-MM-dd'))
  const printRef = useRef<HTMLDivElement>(null)

  const tabAtual = TABS.find(t => t.id === tab)!
  const dataGerado = format(new Date(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })

  // ─── Exportar PDF (impressão do navegador) ───────────────────────────────
  const handlePDF = () => {
    const printContent = printRef.current
    if (!printContent) return

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <title>Relatório MedStock — ${tabAtual.label}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1E293B; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0D47A1; padding-bottom: 16px; margin-bottom: 20px; }
          .logo-area h1 { color: #0D47A1; font-size: 20px; font-weight: 800; }
          .logo-area p  { color: #64748B; font-size: 11px; margin-top: 2px; }
          .meta { text-align: right; color: #64748B; font-size: 11px; line-height: 1.6; }
          .title { font-size: 15px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
          .period { font-size: 11px; color: #64748B; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #EFF6FF; color: #1E40AF; font-size: 11px; font-weight: 700; padding: 8px 10px; text-align: left; border-bottom: 1px solid #BFDBFE; }
          td { padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #F1F5F9; color: #334155; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .badge { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; }
          .ok    { background: #DCFCE7; color: #166534; }
          .baixo { background: #FEF9C3; color: #854D0E; }
          .crit  { background: #FEE2E2; color: #991B1B; }
          .ent   { background: #DBEAFE; color: #1E40AF; }
          .sai   { background: #FFEDD5; color: #9A3412; }
          .obs-section { margin-top: 20px; padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
          .obs-section strong { font-size: 11px; color: #475569; display: block; margin-bottom: 6px; }
          .obs-section p { font-size: 11px; color: #334155; line-height: 1.6; white-space: pre-wrap; }
          .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; color: #94A3B8; font-size: 10px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  // ─── Exportar Word (.doc) ────────────────────────────────────────────────
  const handleWord = () => {
    const printContent = printRef.current
    if (!printContent) return

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8"/>
        <title>Relatório MedStock</title>
        <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
        <style>
          body  { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1E293B; }
          h1    { color: #0D47A1; font-size: 16pt; }
          h2    { color: #1E293B; font-size: 13pt; margin-top: 12pt; }
          table { border-collapse: collapse; width: 100%; margin-top: 10pt; }
          th    { background-color: #EFF6FF; color: #1E40AF; font-weight: bold; padding: 6pt 8pt; border: 1pt solid #BFDBFE; font-size: 10pt; }
          td    { padding: 5pt 8pt; border: 1pt solid #E2E8F0; font-size: 10pt; }
          .obs  { margin-top: 14pt; background: #F8FAFC; padding: 10pt; border: 1pt solid #E2E8F0; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `relatorio-medstock-${tab}-${format(new Date(), 'yyyy-MM-dd')}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Conteúdo da tabela por tipo ─────────────────────────────────────────
  const renderTabela = () => {
    if (tab === 'estoque') return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            {['Medicamento','Tipo','Estoque Atual','Estoque Mínimo','Status'].map(h => (
              <th key={h} style={{ background: '#EFF6FF', color: '#1E40AF', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DADOS_ESTOQUE.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>{d.medicamento}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.tipo}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>{d.estoque} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.minimo} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>{d.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )

    if (tab === 'vencimentos') return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            {['Medicamento','Lote','Validade','Dias Restantes','Estoque'].map(h => (
              <th key={h} style={{ background: '#EFF6FF', color: '#1E40AF', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DADOS_VENCIMENTOS.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>{d.medicamento}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.lote}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#EF4444', fontWeight: 600 }}>{d.validade}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.diasRestantes <= 30 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {d.diasRestantes} dias
                </span>
              </td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>{d.estoque} un.</td>
            </tr>
          ))}
        </tbody>
      </table>
    )

    if (tab === 'movimentacoes') return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            {['Data','Medicamento','Lote','Tipo','Quantidade','Responsável'].map(h => (
              <th key={h} style={{ background: '#EFF6FF', color: '#1E40AF', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DADOS_MOVIMENTACOES.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.data}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>{d.medicamento}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.lote}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(d.tipo)}`}>{d.tipo}</span>
              </td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>{d.quantidade} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.responsavel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )

    if (tab === 'baixo') return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            {['Medicamento','Tipo','Estoque Atual','Mínimo','Falta','Status'].map(h => (
              <th key={h} style={{ background: '#EFF6FF', color: '#1E40AF', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DADOS_BAIXO.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>{d.medicamento}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.tipo}</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#EF4444', fontWeight: 700 }}>{d.estoque} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{d.minimo} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9', color: '#F59E0B', fontWeight: 600 }}>{d.minimo - d.estoque} un.</td>
              <td style={{ padding: '7px 10px', fontSize: 11, borderBottom: '1px solid #F1F5F9' }}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>{d.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Relatórios</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gere, anote e exporte relatórios do estoque</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir PDF
          </button>
          <button
            onClick={handleWord}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar Word
          </button>
        </div>
      </div>

      {/* ── Tabs de tipo ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white text-[#1A73E8] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Filtros ── */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Período:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">De</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            className="input h-8 text-xs w-36" />
          <label className="text-xs text-slate-500">até</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
            className="input h-8 text-xs w-36" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A73E8] text-white text-xs font-semibold rounded-lg hover:bg-[#1565C0] transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filtrar
        </button>
      </div>

      {/* ── Área de descrição / observações ── */}
      <div className="card p-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Observações / Descrição do Relatório
        </label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Adicione notas, justificativas ou observações que serão incluídas no relatório exportado..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow bg-white text-slate-700 placeholder:text-slate-300"
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-slate-300">{descricao.length} caracteres</span>
        </div>
      </div>

      {/* ── Área do relatório (usada também para exportação) ── */}
      <div className="card p-6">
        {/* Conteúdo visível e exportável */}
        <div ref={printRef}>
          {/* Cabeçalho do relatório */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0D47A1', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <div style={{ color: '#0D47A1', fontSize: 20, fontWeight: 800 }}>MedStock</div>
              <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Controle de Estoque Hospitalar</div>
            </div>
            <div style={{ textAlign: 'right', color: '#64748B', fontSize: 11, lineHeight: 1.6 }}>
              <div><strong style={{ color: '#1E293B' }}>{user?.clinicName ?? 'Clínica'}</strong></div>
              <div>Gerado em: {dataGerado}</div>
              <div>Por: {user?.name ?? '—'}</div>
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{tabAtual.label}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
              Período: {format(new Date(dataInicio + 'T00:00:00'), 'dd/MM/yyyy')} a {format(new Date(dataFim + 'T00:00:00'), 'dd/MM/yyyy')}
            </div>
          </div>

          {renderTabela()}

          {descricao.trim() && (
            <div style={{ marginTop: 20, padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }}>
              <strong style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 6 }}>
                Observações do relatório:
              </strong>
              <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{descricao}</p>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 10 }}>
            <span>MedStock — Sistema de Controle de Estoque</span>
            <span>Documento gerado automaticamente em {dataGerado}</span>
          </div>
        </div>
      </div>

      {/* ── Rodapé informativo ── */}
      <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
        <Package className="w-3.5 h-3.5" />
        <span>Dados fictícios para demonstração. A integração com o banco será ativada na Fase 4.</span>
      </div>
    </div>
  )
}
