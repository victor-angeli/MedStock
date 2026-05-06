import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

export const alertasRouter = Router()
alertasRouter.use(authenticate)

alertasRouter.get('/', async (req: AuthRequest, res) => {
  const hoje = new Date()
  const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)
  const ha180Dias = new Date(hoje.getTime() - 180 * 24 * 60 * 60 * 1000)

  const [vencendo, estoqueMinimo, semMovimentacao] = await Promise.all([
    // Lotes vencendo em 30 dias
    prisma.lote.findMany({
      where: {
        medicamento: { clinicaId: req.clinicaId, ativo: true },
        validade: { gte: hoje, lte: em30Dias },
        quantidadeAtual: { gt: 0 },
      },
      include: { medicamento: { select: { nome: true, tipo: true } } },
      orderBy: { validade: 'asc' },
    }),

    // Medicamentos com estoque abaixo do mínimo
    prisma.medicamento.findMany({
      where: {
        clinicaId: req.clinicaId,
        ativo: true,
        estoqueAtual: { lte: prisma.medicamento.fields.estoqueMinimo },
      },
      orderBy: { estoqueAtual: 'asc' },
    }),

    // Medicamentos sem movimentação há 180 dias
    prisma.medicamento.findMany({
      where: {
        clinicaId: req.clinicaId,
        ativo: true,
        movimentacoes: {
          none: { criadoEm: { gte: ha180Dias } },
        },
      },
    }),
  ])

  res.json({
    resumo: {
      vencendo: vencendo.length,
      estoqueMinimo: estoqueMinimo.length,
      semMovimentacao: semMovimentacao.length,
      total: vencendo.length + estoqueMinimo.length + semMovimentacao.length,
    },
    vencendo,
    estoqueMinimo,
    semMovimentacao,
  })
})
