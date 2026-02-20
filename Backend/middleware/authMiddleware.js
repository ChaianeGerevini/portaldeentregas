// middleware/authMiddleware.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { supabase } from '../supabaseClient.js'

dotenv.config()

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não enviado' })
  }

  const token = authHeader.replace('Bearer ', '').replace(/"/g, '')

  const { data, error } = await supabaseAuth.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  req.user = data.user
  next()
}

export async function verifyAdmin(req, res, next) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return res.status(403).json({ error: 'Perfil não encontrado' })
  }

  if (data.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso permitido apenas para administradores' })
  }

  next()
}