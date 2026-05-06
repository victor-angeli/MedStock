import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { medicamentosRouter } from './routes/medicamentos'
import { movimentacoesRouter } from './routes/movimentacoes'
import { colaboradoresRouter } from './routes/colaboradores'
import { fornecedoresRouter } from './routes/fornecedores'
import { alertasRouter } from './routes/alertas'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rotas
app.use('/api/auth',           authRouter)
app.use('/api/medicamentos',   medicamentosRouter)
app.use('/api/movimentacoes',  movimentacoesRouter)
app.use('/api/colaboradores',  colaboradoresRouter)
app.use('/api/fornecedores',   fornecedoresRouter)
app.use('/api/alertas',        alertasRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 MedStock API rodando em http://localhost:${PORT}`)
})
