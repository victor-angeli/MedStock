import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

export const colaboradoresRouter = Router()
colaboradoresRouter.use(authenticate)

colaboradoresRouter.get('/', async (req: AuthRequest, res) => {
  const usuarios = await prisma.usuario.findMany({
    where: { clinicaId: req.clinicaId, ativo: true },
    select: { id: true, nome: true, email: true, role: true, avatarUrl: true, criadoEm: true },
    orderBy: { nome: 'asc' },
  })
  res.json(usuarios)
})

colaboradoresRouter.post('/', authorize('ADMIN', 'FARMACEUTICO'), async (req: AuthRequest, res) => {
  const schema = z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'FARMACEUTICO', 'MEDICO', 'ENFERMEIRO']).default('ENFERMEIRO'),
  })
  const data = schema.parse(req.body)
  const senhaHash = await bcrypt.hash(data.password, 12)

  const usuario = await prisma.usuario.create({
    data: { nome: data.nome, email: data.email, senhaHash, role: data.role, clinicaId: req.clinicaId! },
    select: { id: true, nome: true, email: true, role: true },
  })
  res.status(201).json(usuario)
})

colaboradoresRouter.put('/:id', authorize('ADMIN'), async (req: AuthRequest, res) => {
  const schema = z.object({
    nome: z.string().min(2).optional(),
    role: z.enum(['ADMIN', 'FARMACEUTICO', 'MEDICO', 'ENFERMEIRO']).optional(),
    ativo: z.boolean().optional(),
  })
  const data = schema.parse(req.body)
  await prisma.usuario.updateMany({
    where: { id: req.params.id, clinicaId: req.clinicaId },
    data,
  })
  res.json({ success: true })
})
