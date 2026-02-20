// routes/auth.js
import express from 'express'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js'

dotenv.config()

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const router = express.Router()

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Informe email e senha' })
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.session) {
      console.error('Erro login Supabase:', error)
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    return res.json({ token: data.session.access_token })
  } catch (e) {
    console.error('Erro no /auth/login:', e)
    return res.status(500).json({ message: 'Erro ao fazer login' })
  }
})

// ---------- REGISTER ----------
router.post('/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Informe email e senha' })
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'A senha deve ter no mínimo 6 caracteres' })
  }

  try {
    const { data, error } = await supabaseAuth.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      console.error('Erro Supabase register:', error)
      return res
        .status(400)
        .json({ message: error.message || 'Erro ao cadastrar' })
    }

    return res.json({ message: 'Conta criada com sucesso!' })
  } catch (e) {
    console.error('Erro no /auth/register:', e)
    return res.status(500).json({ message: 'Erro ao cadastrar' })
  }
})

// ---------- ME ----------
router.get('/me', verifyUser, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email
  })
})

// ---------- IS-ADMIN ----------
router.get('/is-admin', verifyUser, verifyAdmin, (req, res) => {
  res.json({ admin: true })
})

// ---------- ESQUECI MINHA SENHA ----------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Informe o email.' })
  }

  try {
    const { data, error } = await supabaseAuth.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: process.env.SUPABASE_RESET_REDIRECT_URL
      }
    )

    if (error) {
      console.error('Erro reset password Supabase:', error)
      return res.status(400).json({
        message: error.message || 'Erro ao enviar email de redefinição.'
      })
    }

    // Resposta genérica por segurança
    return res.json({
      message:
        'Se este email estiver cadastrado, você receberá um link para redefinição.'
    })
  } catch (e) {
    console.error('Erro no /auth/forgot-password:', e)
    return res.status(500).json({ message: 'Erro ao processar o pedido.' })
  }
})

export default router