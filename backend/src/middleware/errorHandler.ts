import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err)

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    })
    return
  }

  res.status(500).json({ error: err.message ?? 'Erro interno do servidor' })
}
