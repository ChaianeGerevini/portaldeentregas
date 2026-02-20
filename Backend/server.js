// server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// IMPORT DAS ROTAS (apenas UMA vez cada)
import dashboardRoutes from './routes/dashboard.js'
import wikiRoutes from './routes/wiki.js'
import faqRoutes from './routes/faq.js'
import authRoutes from './routes/auth.js'
import entregasRoutes from './routes/entregas.js'

dotenv.config()

const app = express()

// MIDDLEWARES GERAIS
app.use(cors())
app.use(express.json())

// ROTAS PRINCIPAIS
app.use('/dashboard', dashboardRoutes)
app.use('/wiki', wikiRoutes)
app.use('/faq', faqRoutes)
app.use('/auth', authRoutes)
app.use('/entregas', entregasRoutes)

// ROTA DE TESTE
app.get('/', (req, res) => {
  res.json({ message: 'Backend ativo 🚀' })
})

// PORTA DO SERVIDOR
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})