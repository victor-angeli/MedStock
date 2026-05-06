import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { clinica: { select: { id: true, nome: true } } },
  })

  if (!usuario || !usuario.ativo) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const senhaValida = await bcrypt.compare(password, usuario.senhaHash)
  if (!senhaValida) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const token = jwt.sign(
    { userId: usuario.id, role: usuario.role, clinicaId: usuario.clinicaId },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  )

  res.json({
    token,
    user: {
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      role: usuario.role.toLowerCase(),
      avatarUrl: usuario.avatarUrl,
      clinicId: usuario.clinicaId,
      clinicName: usuario.clinica.nome,
    },
  })
})

authRouter.post('/register', async (req, res) => {
  const schema = z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'FARMACEUTICO', 'MEDICO', 'ENFERMEIRO']).default('FARMACEUTICO'),
    clinicaId: z.string(),
  })

  const data = schema.parse(req.body)
  const senhaHash = await bcrypt.hash(data.password, 12)

  const usuario = await prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senhaHash,
      role: data.role,
      clinicaId: data.clinicaId,
    },
  })

  res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email })
})
