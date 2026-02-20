// routes/wiki.js
import express from 'express'
import { supabase } from '../supabaseClient.js'
import { verifyUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// ============================================
// GET /wiki?q=...  -> busca por US, bug, palavra-chave
// ============================================
router.get('/', verifyUser, async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' })
    }

    const termo = `%${q.trim()}%`

    const { data, error } = await supabase
      .from('wiki_registros')
      .select('id, chave, titulo, resumo, created_at')
      .or(
        [
          `chave.ilike.${termo}`,
          `palavras_chave.ilike.${termo}`,
          `titulo.ilike.${termo}`,
          `conteudo.ilike.${termo}`
        ].join(',')
      )
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Erro ao buscar na wiki:', error)
      return res.status(500).json({ error: 'Erro ao buscar na wiki' })
    }

    return res.json(data || [])
  } catch (err) {
    console.error('Erro em GET /wiki:', err)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ============================================
// POST /wiki  -> cadastrar itens (alimentado via site)
// (podemos usar depois na tela ADM)
// ============================================
router.post('/', verifyUser, async (req, res) => {
  try {
    const { chave, titulo, palavrasChave, resumo, conteudo } = req.body

    if (!titulo || !resumo || !conteudo) {
      return res.status(400).json({ error: 'Título, resumo e conteúdo são obrigatórios' })
    }

    const { data, error } = await supabase
      .from('wiki_registros')
      .insert([
        {
          chave: chave || null,
          titulo,
          palavras_chave: palavrasChave || null,
          resumo,
          conteudo
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao salvar wiki:', error)
      return res.status(500).json({ error: 'Erro ao salvar registro da wiki' })
    }

    return res.status(201).json(data[0])
  } catch (err) {
    console.error('Erro em POST /wiki:', err)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router