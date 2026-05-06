import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

export const medicamentosRouter = Router()
medicamentosRouter.use(authenticate)

medicamentosRouter.get('/', async (req: AuthRequest, res) => {
  const medicamentos = await prisma.medicamento.findMany({
    where: { clinicaId: req.clinicaId, ativo: true },
    include: { fornecedor: { select: { id: true, nome: true } }, lotes: true },
    orderBy: { nome: 'asc' },
  })
  res.json(medicamentos)
})

medicamentosRouter.get('/:id', async (req: AuthRequest, res) => {
  const med = await prisma.medicamento.findFirst({
    where: { id: req.params.id, clinicaId: req.clinicaId },
    include: { lotes: true, fornecedor: true, movimentacoes: { take: 10, orderBy: { criadoEm: 'desc' }, include: { usuario: { select: { nome: true } } } } },
  })
  if (!med) { res.status(404).json({ error: 'Medicamento não encontrado' }); return }
  res.json(med)
})

const medSchema = z.object({
  nome: z.string().min(2),
  principioAtivo: z.string().optional(),
  tipo: z.enum(['CAPSULA', 'COMPRIMIDO', 'LIQUIDO', 'INJETAVEL', 'POMADA', 'OUTRO']).default('COMPRIMIDO'),
  concentracao: z.string().optional(),
  fabricante: z.string().optional(),
  registro: z.string().optional(),
  estoqueMinimo: z.number().int().min(0).default(10),
  unidade: z.string().default('un'),
  fornecedorId: z.string().optional(),
})

medicamentosRouter.post('/', async (req: AuthRequest, res) => {
  const data = medSchema.parse(req.body)
  const med = await prisma.medicamento.create({
    data: { ...data, clinicaId: req.clinicaId! },
  })
  res.status(201).json(med)
})

medicamentosRouter.put('/:id', async (req: AuthRequest, res) => {
  const data = medSchema.partial().parse(req.body)
  const med = await prisma.medicamento.updateMany({
    where: { id: req.params.id, clinicaId: req.clinicaId },
    data,
  })
  res.json(med)
})

medicamentosRouter.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.medicamento.updateMany({
    where: { id: req.params.id, clinicaId: req.clinicaId },
    data: { ativo: false },
  })
  res.status(204).send()
})
