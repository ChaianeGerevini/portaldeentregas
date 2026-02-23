const API_URL = "https://portaldeentregas.onrender.com";

let chart1, chart2, chart3, chart4;
let dataAtual = new Date();

// -------------------------
// Helpers de mês
// -------------------------
function getAnoMesAtual() {
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`; // YYYY-MM
}

function formatarMesParaTela(anoMesOuData) {
  // aceita "2026-02" ou "2026-02-01"
  let anoMes = anoMesOuData;

  if (anoMes.includes("-") && anoMes.split("-").length === 3) {
    const [ano, mesStr] = anoMes.split("-"); // YYYY-MM-DD -> pegamos YYYY-MM
    anoMes = `${ano}-${mesStr}`;
  }

  const [ano, mesStr] = anoMes.split("-");
  const mes = parseInt(mesStr, 10);
  const nomesMes = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return `${nomesMes[mes - 1]} / ${ano}`;
}

function atualizarMesNaTela() {
  const span = document.getElementById("mesRef");
  if (!span) return;
  const anoMes = getAnoMesAtual();
  span.innerText = formatarMesParaTela(anoMes);
}

// -------------------------
// Navegação de mês
// -------------------------
function irParaMesAnterior() {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  atualizarMesNaTela();
  carregarDashboard();
}

function irParaMesProximo() {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  atualizarMesNaTela();
  carregarDashboard();
}

// -------------------------
// Carregar dashboard
// -------------------------
async function carregarDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const anoMes = getAnoMesAtual();

    const resp = await fetch(`${API_URL}/dashboard?mes=${anoMes}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Status dashboard:", resp.status);

    if (!resp.ok) {
      console.error("Erro HTTP ao buscar /dashboard:", resp.status);
      return;
    }

    const dados = await resp.json();
    console.log("Dashboard API:", dados);

    // -------------------------
    // 1) Cards principais
    // -------------------------
    const cards = dados.cards || {};
    const statusResumo = dados.statusResumo || {};

    const aguardando =
      statusResumo.aguardando ??
      cards.aguardando ??
      0;
    const atendimento =
      statusResumo.em_atendimento ??
      statusResumo.atendimento ??
      cards.atendimento ??
      0;
    const backlog =
      statusResumo.backlog ??
      cards.backlog ??
      0;
    const encerrados =
      statusResumo.encerrado ??
      statusResumo.encerrados ??
      cards.encerrados ??
      0;

    const elAguardando = document.getElementById("aguardando");
    const elAtendimento = document.getElementById("atendimento");
    const elBacklog = document.getElementById("backlog");
    const elEncerrados = document.getElementById("encerrados");

    if (elAguardando) elAguardando.innerText = aguardando;
    if (elAtendimento) elAtendimento.innerText = atendimento;
    if (elBacklog) elBacklog.innerText = backlog;
    if (elEncerrados) elEncerrados.innerText = encerrados;

    // -------------------------
    // 2) Mês de referência
    // -------------------------
    const mesRefEl = document.getElementById("mesRef");
    if (mesRefEl) {
      if (dados.mesReferencia) {
        mesRefEl.innerText = formatarMesParaTela(dados.mesReferencia);
      } else {
        mesRefEl.innerText = formatarMesParaTela(anoMes);
      }
    }

    // -------------------------
    // 3) Dados específicos p/ cada gráfico
    // -------------------------
    const backlogPorArea     = dados.backlogPorArea     || {};
    const integraBugs        = dados.integraBugs        || {};
    const integracoesResumo  = dados.integracoesResumo  || {};
    const bugsFrota          = dados.bugsFrota          || {};

    // 1) Backlog por área (card 1)
    const areasOrdem = ["integra", "apisullog", "frotas", "integracoes"];
    const labelsBacklogArea = ["Integra 2.0", "ApisulLog", "Frotas", "Integrações"];
    const valoresBacklogArea = areasOrdem.map(tipo => backlogPorArea[tipo] || 0);

    // 2) Integra Bugs (card 2)
    const labelsStatusIntegra = ["Aguardando", "Em Atendimento", "Backlog", "Encerrados"];
    const valoresIntegraBugs = [
      integraBugs.aguardando      || 0,
      integraBugs.em_atendimento  || 0,
      integraBugs.backlog         || 0,
      integraBugs.encerrado       || 0
    ];

    // 3) Integrações (card 3) – SMP, Logística, Multicadastro, RC-V
    const labelsIntegracoes = ["SMP", "Logística", "Multicadastro", "RC-V"];
    const valoresIntegracoes = [
      integracoesResumo.smp           || 0,
      integracoesResumo.logistica     || 0,
      integracoesResumo.multicadastro || 0,
      integracoesResumo.rcv           || 0
    ];

    // 4) Bugs Frota (card 4)
    const labelsStatusFrota = ["Aguardando", "Em Atendimento", "Backlog", "Encerrados"];
    const valoresBugsFrota = [
      bugsFrota.aguardando      || 0,
      bugsFrota.em_atendimento  || 0,
      bugsFrota.backlog         || 0,
      bugsFrota.encerrado       || 0
    ];

    // -------------------------
    // 4) Montar gráficos
    // -------------------------
    montarGraficos(
      labelsBacklogArea,
      valoresBacklogArea,
      labelsStatusIntegra,
      valoresIntegraBugs,
      labelsIntegracoes,
      valoresIntegracoes,
      labelsStatusFrota,
      valoresBugsFrota
    );

  } catch (e) {
    console.error("Erro ao carregar dashboard:", e);
  }
}

// -------------------------
// Gráficos
// -------------------------
function montarGraficos(
  labelsBacklogArea, valoresBacklogArea,
  labelsStatusIntegra, valoresIntegraBugs,
  labelsIntegracoes, valoresIntegracoes,
  labelsStatusFrota, valoresBugsFrota
) {
  const ctx1 = document.getElementById("graficoBacklog")?.getContext("2d");   // Backlog por Área
  const ctx2 = document.getElementById("graficoBacklog2")?.getContext("2d");  // Integra Bugs
  const ctx3 = document.getElementById("graficoBacklog3")?.getContext("2d");  // Integrações
  const ctx4 = document.getElementById("graficoBacklog4")?.getContext("2d");  // Bugs Frota

  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();
  if (chart3) chart3.destroy();
  if (chart4) chart4.destroy();

  const coresStatus = ["#4FC3F7", "#FF6F91", "#FFD166", "#4DD599"];
  const coresTipos  = ["#5C6BF2", "#FF6F91", "#FFD166", "#4DD599"];

  const opcoesBase = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 5, bottom: 5, left: 0, right: 0 }
    },
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#FFFFFF",
          font: {
            size: 10,
            family: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont"
          },
          boxWidth: 10,
          boxHeight: 8,
          padding: 6
        }
      },
      tooltip: {
        displayColors: false
      }
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: "#0B2940" // combina com o fundo
      }
    }
  };

  // 1) Backlog por Área – pizza
  if (ctx1) {
    chart1 = new Chart(ctx1, {
      type: "pie",
      data: {
        labels: labelsBacklogArea,
        datasets: [
          {
            data: valoresBacklogArea,
            backgroundColor: coresTipos
          }
        ]
      },
      options: opcoesBase
    });
  }

  // 2) Integra Bugs – doughnut (status)
  if (ctx2) {
    chart2 = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: labelsStatusIntegra,
        datasets: [
          {
            data: valoresIntegraBugs,
            backgroundColor: coresStatus
          }
        ]
      },
      options: {
        ...opcoesBase,
        cutout: "55%"
      }
    });
  }

  // 3) Integrações – doughnut (SMP/Logística/Multicadastro/RC-V)
  if (ctx3) {
    chart3 = new Chart(ctx3, {
      type: "doughnut",
      data: {
        labels: labelsIntegracoes,
        datasets: [
          {
            data: valoresIntegracoes,
            backgroundColor: coresTipos
          }
        ]
      },
      options: {
        ...opcoesBase,
        cutout: "55%"
      }
    });
  }

  // 4) Bugs Frota – doughnut (status)
  if (ctx4) {
    chart4 = new Chart(ctx4, {
      type: "doughnut",
      data: {
        labels: labelsStatusFrota,
        datasets: [
          {
            data: valoresBugsFrota,
            backgroundColor: coresStatus
          }
        ]
      },
      options: {
        ...opcoesBase,
        cutout: "55%"
      }
    });
  }
}
// --------------------------------------
// ESCADA ROLANTE – Carregar entregas
// --------------------------------------
async function carregarEntregasEscadas() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    // Integra
    await carregarEntregasPorSistema("integra", "listaIntegra", token);
    // ApisulLog
    await carregarEntregasPorSistema("apisullog", "listaApisullog", token);
  } catch (err) {
    console.error("Erro ao carregar entregas:", err);
  }
}

async function carregarEntregasPorSistema(sistema, ulId, token) {
  const ul = document.getElementById(ulId);
  if (!ul) return;

  ul.innerHTML = `<li>Carregando entregas...</li>`;

  try {
    const resp = await fetch(`${API_URL}/entregas?sistema=${encodeURIComponent(sistema)}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!resp.ok) {
      console.error(`Erro HTTP ao buscar entregas de ${sistema}:`, resp.status);
      ul.innerHTML = `<li>Não foi possível carregar as entregas.</li>`;
      return;
    }

    const dados = await resp.json();
    console.log(`Entregas ${sistema}:`, dados);

    if (!dados || !dados.length) {
      ul.innerHTML = `<li>Nenhuma entrega cadastrada ainda.</li>`;
      return;
    }

    // Monta os itens (uma vez)
    ul.innerHTML = "";
    dados.forEach(item => {
      const li = document.createElement("li");

      const isBug = item.tipo === "bug";
      li.classList.add(isBug ? "bug" : "melhoria");

      const emoji = isBug ? "🐞" : "✨";

      // formata data de entrega como dd/MM, se existir
      let dataLabel = "";
      if (item.data_entrega) {
        const data = new Date(item.data_entrega);
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        dataLabel = `${dia}/${mes}`;
      }

      const titulo = item.titulo || "(sem título)";
      li.textContent = dataLabel
        ? `${emoji} ${titulo} • ${dataLabel}`
        : `${emoji} ${titulo}`;

      ul.appendChild(li);
    });

    // Duplica a lista para efeito de "loop" infinito na escada
    const htmlOriginal = ul.innerHTML;
    ul.innerHTML = htmlOriginal + htmlOriginal;

  } catch (err) {
    console.error(`Erro ao carregar entregas de ${sistema}:`, err);
    ul.innerHTML = `<li>Erro ao carregar entregas.</li>`;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  atualizarMesNaTela();

  const btnPrev = document.getElementById("mesAnterior");
  const btnNext = document.getElementById("mesProximo");

  if (btnPrev) btnPrev.addEventListener("click", irParaMesAnterior);
  if (btnNext) btnNext.addEventListener("click", irParaMesProximo);

  carregarDashboard();
  carregarEntregasEscadas(); // <<< NOVO: carrega escada rolante a partir da rota /entregas
});