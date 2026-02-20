// routes/dashboard.js
import express from 'express'
import { supabase } from '../supabaseClient.js'
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// ==============================================
// POST /dashboard  (ADM cadastra dado)
// Body: { tipo, status, mesReferencia, quantidade }
// tipo: 'integra' | 'apisullog' | 'frotas' | 'integracoes'
//       'smp' | 'logistica' | 'multicadastro' | 'rcv'
// status: 'aguardando' | 'em_atendimento' | 'backlog' | 'encerrado'
// mesReferencia: '2026-02' (value do input type="month")
// ==============================================
router.post('/', verifyUser, verifyAdmin, async (req, res) => {
  try {
    let { tipo, status, mesReferencia, quantidade } = req.body

    if (!tipo || !status || !mesReferencia || quantidade == null) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tipo, status, mesReferencia, quantidade'
      })
    }

    // normaliza
    tipo = String(tipo).toLowerCase()
    status = String(status).toLowerCase()
    const qtd = Number(quantidade) || 0

    // mesReferencia vem como 'YYYY-MM' → converte pra 'YYYY-MM-01'
    const mesRef =
      mesReferencia.length === 7
        ? `${mesReferencia}-01`
        : mesReferencia

    const { data, error } = await supabase
      .from('dashboard_registros')
      .insert([
        {
          tipo,
          status,
          mes_referencia: mesRef,
          quantidade: qtd
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao inserir dashboard_registros:', error)
      return res.status(500).json({ error: 'Erro ao salvar registro' })
    }

    return res.status(201).json(data[0])
  } catch (err) {
    console.error('Erro em POST /dashboard:', err)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ==============================================
// GET /dashboard?mes=2026-02  (Dash + gráficos)
// ==============================================
router.get('/', verifyUser, async (req, res) => {
  try {
    const { mes } = req.query // "2026-02"

    if (!mes) {
      return res
        .status(400)
        .json({ error: 'Parâmetro "mes" é obrigatório (ex: 2026-02)' })
    }

    const mesReferencia = `${mes}-01`

    const { data: rows, error } = await supabase
      .from('dashboard_registros')
      .select('tipo, status, quantidade')
      .eq('mes_referencia', mesReferencia)

    if (error) {
      console.error('Erro ao buscar dashboard_registros:', error)
      return res
        .status(500)
        .json({ error: 'Erro ao buscar dados do dashboard' })
    }

    if (!rows || !rows.length) {
      return res.json({
        mesReferencia: mes,
        cards: {
          integra: 0,
          apisullog: 0,
          frotas: 0,
          integracoes: 0
        },
        statusResumo: {
          aguardando: 0,
          em_atendimento: 0,
          backlog: 0,
          encerrado: 0
        },
        backlogPorArea: {
          integra: 0,
          apisullog: 0,
          frotas: 0,
          integracoes: 0
        },
        integraBugs: {
          aguardando: 0,
          em_atendimento: 0,
          backlog: 0,
          encerrado: 0
        },
        apisullogBugs: {
          aguardando: 0,
          em_atendimento: 0,
          backlog: 0,
          encerrado: 0
        },
        bugsFrota: {
          aguardando: 0,
          em_atendimento: 0,
          backlog: 0,
          encerrado: 0
        },
        integracoesResumo: {
          smp: 0,
          logistica: 0,
          multicadastro: 0,
          rcv: 0
        }
      })
    }

    // Acumuladores
    const cards = {
      integra: 0,
      apisullog: 0,
      frotas: 0,
      integracoes: 0
    }

    const statusResumo = {
      aguardando: 0,
      em_atendimento: 0,
      backlog: 0,
      encerrado: 0
    }

    const backlogPorArea = {
      integra: 0,
      apisullog: 0,
      frotas: 0,
      integracoes: 0
    }

    const integraBugs = {
      aguardando: 0,
      em_atendimento: 0,
      backlog: 0,
      encerrado: 0
    }

    const apisullogBugs = {
      aguardando: 0,
      em_atendimento: 0,
      backlog: 0,
      encerrado: 0
    }

    const bugsFrota = {
      aguardando: 0,
      em_atendimento: 0,
      backlog: 0,
      encerrado: 0
    }

    const integracoesResumo = {
      smp: 0,
      logistica: 0,
      multicadastro: 0,
      rcv: 0
    }

    // Processa linhas
    rows.forEach(row => {
      const tipo = row.tipo?.toLowerCase()
      const status = row.status?.toLowerCase()
      const qtd = Number(row.quantidade) || 0

      // Cards gerais por tipo (Integra, ApisulLog, Frotas, Integrações)
      if (cards.hasOwnProperty(tipo)) {
        cards[tipo] += qtd
      }

      // Resumo geral por status
      if (statusResumo.hasOwnProperty(status)) {
        statusResumo[status] += qtd
      }

      // Backlog por área (apenas status backlog)
      if (status === 'backlog' && backlogPorArea.hasOwnProperty(tipo)) {
        backlogPorArea[tipo] += qtd
      }

      // Bugs Integra
      if (tipo === 'integra' && integraBugs.hasOwnProperty(status)) {
        integraBugs[status] += qtd
      }

      // Bugs ApisulLog
      if (tipo === 'apisullog' && apisullogBugs.hasOwnProperty(status)) {
        apisullogBugs[status] += qtd
      }

      // Bugs Frotas
      if (tipo === 'frotas' && bugsFrota.hasOwnProperty(status)) {
        bugsFrota[status] += qtd
      }

      // Integrações (SMP / Logística / Multicadastro / RC-V)
      if (tipo === 'smp') integracoesResumo.smp += qtd
      if (tipo === 'logistica') integracoesResumo.logistica += qtd
      if (tipo === 'multicadastro') integracoesResumo.multicadastro += qtd
      if (tipo === 'rcv' || tipo === 'rc-v') integracoesResumo.rcv += qtd
    })

    return res.json({
      mesReferencia: mes,
      cards,
      statusResumo,
      backlogPorArea,
      integraBugs,
      apisullogBugs,
      bugsFrota,
      integracoesResumo
    })
  } catch (err) {
    console.error('Erro em GET /dashboard:', err)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router