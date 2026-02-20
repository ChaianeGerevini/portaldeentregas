// routes/faq.js
import express from 'express'
import { supabase } from '../supabaseClient.js'
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// buscar respostas da FAQ (chat de regras)
router.get('/', verifyUser, async (req, res) => {
  const pergunta = req.query.q || ''

  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .ilike('pergunta', `%${pergunta}%`)

  if (error) return res.status(400).json(error)
  res.json(data)
})

// inserir regra nova (somente admin)
router.post('/', verifyUser, verifyAdmin, async (req, res) => {
  const { pergunta, resposta } = req.body

  const { data, error } = await supabase
    .from('faq')
    .insert([{ pergunta, resposta }])

  if (error) return res.status(400).json(error)
  res.json(data)
})

export default router