import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

export const movimentacoesRouter = Router()
movimentacoesRouter.use(authenticate)

movimentacoesRouter.get('/', async (req: AuthRequest, res) => {
  const { medicamentoId, tipo, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where: Record<string, unknown> = { clinicaId: req.clinicaId }
  if (medicamentoId) where.medicamentoId = medicamentoId
  if (tipo) where.tipo = tipo

  const [total, items] = await Promise.all([
    prisma.movimentacao.count({ where }),
    prisma.movimentacao.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { criadoEm: 'desc' },
      include: {
        medicamento: { select: { nome: true, tipo: true } },
        lote: { select: { numero: true } },
        usuario: { select: { nome: true, role: true, avatarUrl: true } },
      },
    }),
  ])

  res.json({ total, page: Number(page), items })
})

const movSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.number().int().positive(),
  medicamentoId: z.string(),
  loteId: z.string().optional(),
  observacao: z.string().optional(),
  justificativa: z.string().optional(),
})

movimentacoesRouter.post('/', async (req: AuthRequest, res) => {
  const data = movSchema.parse(req.body)

  if (data.tipo === 'SAIDA' && !data.justificativa) {
    res.status(400).json({ error: 'Justificativa é obrigatória para saídas' })
    return
  }

  // Transação: cria movimentação + atualiza estoque
  const result = await prisma.$transaction(async (tx) => {
    const mov = await tx.movimentacao.create({
      data: {
        ...data,
        usuarioId: req.userId!,
        clinicaId: req.clinicaId!,
      },
    })

    const delta = data.tipo === 'ENTRADA' ? data.quantidade : -data.quantidade
    await tx.medicamento.update({
      where: { id: data.medicamentoId },
      data: { estoqueAtual: { increment: delta } },
    })

    if (data.loteId) {
      await tx.lote.update({
        where: { id: data.loteId },
        data: { quantidadeAtual: { increment: delta } },
      })
    }

    return mov
  })

  res.status(201).json(result)
})
