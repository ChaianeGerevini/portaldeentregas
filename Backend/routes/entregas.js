// routes/entregas.js
import express from 'express'
import { supabase } from '../supabaseClient.js'
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// ===============================
// Função para normalizar data
// Aceita "DD/MM/YYYY" ou "YYYY-MM-DD"
// ===============================
function normalizarData(dataStr) {
  if (!dataStr) return null

  // Se já vier no formato ISO (YYYY-MM-DD), só devolve
  if (dataStr.includes('-')) {
    return dataStr
  }

  // Se vier em formato BR (DD/MM/YYYY), converte
  const [dia, mes, ano] = dataStr.split('/')
  return `${ano}-${mes}-${dia}`
}

// ===============================
// POST /entregas  -> ADM cadastra entrega
// ===============================
router.post('/', verifyUser, verifyAdmin, async (req, res) => {
  try {
    console.log('📥 Recebido POST /entregas:', req.body)

    let { sistema, tipo, titulo, descricao, dataEntrega, link } = req.body

    // Validação básica
    if (!sistema || !tipo || !titulo) {
      return res.status(400).json({
        error: 'Campos obrigatórios: sistema, tipo, titulo',
      })
    }

    // Normalizar data (BR -> ISO ou já ISO)
    const dataISO = normalizarData(dataEntrega)

    console.log('📅 Data convertida:', dataEntrega, '→', dataISO)

    // Inserção no Supabase
    const { data, error } = await supabase
      .from('entregas')
      .insert([
        {
          sistema,
          tipo,
          titulo,
          descricao: descricao || null,
          data_entrega: dataISO,
          link: link || null,
        },
      ])
      .select()

    if (error) {
      console.error('❌ Erro ao salvar entrega (Supabase):', error)
      return res.status(500).json({
        error: 'Erro ao salvar entrega',
        details: error.message,
      })
    }

    console.log('✅ Entrega salva:', data[0])

    return res.status(201).json({
      message: 'Entrega salva com sucesso',
      entrega: data[0],
    })
  } catch (err) {
    console.error('❌ Erro inesperado em POST /entregas:', err)
    return res.status(500).json({
      error: 'Erro no servidor',
      details: err.message,
    })
  }
})

// ===============================
// GET /entregas?sistema=apisullog...
// ===============================
router.get('/', verifyUser, async (req, res) => {
  try {
    const { sistema } = req.query

    console.log('🔍 GET /entregas (filtro):', sistema || 'sem filtro')

    let query = supabase
      .from('entregas')
      .select('id, sistema, tipo, titulo, descricao, data_entrega, link')
      .order('data_entrega', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (sistema) {
      query = query.eq('sistema', sistema)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar entregas:', error)
      return res.status(500).json({
        error: 'Erro ao buscar entregas',
        details: error.message,
      })
    }

    console.log(`📦 ${data?.length || 0} entregas retornadas`)

    return res.json(data || [])
  } catch (err) {
    console.error('❌ Erro inesperado em GET /entregas:', err)
    return res.status(500).json({
      error: 'Erro no servidor',
      details: err.message,
    })
  }
})

export default router