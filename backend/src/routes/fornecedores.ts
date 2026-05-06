import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

export const fornecedoresRouter = Router()
fornecedoresRouter.use(authenticate)

fornecedoresRouter.get('/', async (_req: AuthRequest, res) => {
  const fornecedores = await prisma.fornecedor.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  })
  res.json(fornecedores)
})

const fornSchema = z.object({
  nome: z.string().min(2),
  cnpj: z.string().optional(),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
})

fornecedoresRouter.post('/', async (req: AuthRequest, res) => {
  const data = fornSchema.parse(req.body)
  const forn = await prisma.fornecedor.create({ data })
  res.status(201).json(forn)
})

fornecedoresRouter.put('/:id', async (req: AuthRequest, res) => {
  const data = fornSchema.partial().parse(req.body)
  const forn = await prisma.fornecedor.update({ where: { id: req.params.id }, data })
  res.json(forn)
})
