import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  clinicaId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as {
      userId: string
      role: string
      clinicaId: string
    }
    req.userId = payload.userId
    req.userRole = payload.role
    req.clinicaId = payload.clinicaId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Sem permissão para esta ação' })
      return
    }
    next()
  }
}
