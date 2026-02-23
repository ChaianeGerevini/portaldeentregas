// Js/admin.js (FRONTEND)
const API_URL = "http://localhost:3000";

// -------------------------------------
// Helpers gerais
// -------------------------------------
function getToken() {
  return localStorage.getItem("token");
}

function redirectLogin() {
  window.location.href = "index.html"; // usa o mesmo nome do arquivo de login
}

function setMsg(id, texto, tipo = "ok") {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = texto || "";
  el.style.color = tipo === "erro" ? "#ff6f91" : "#4DD599";
}

// Logout usado no botão da sidebar
function logout() {
  localStorage.removeItem("token");
  redirectLogin();
}

// -------------------------------------
// DASHBOARD – salvar registro
// -------------------------------------
async function salvarDashboard() {
  const token = getToken();
  if (!token) {
    redirectLogin();
    return;
  }

  const tipo = document.getElementById("dashTipo")?.value;
  const status = document.getElementById("dashStatus")?.value;
  const mesReferencia = document.getElementById("dashMes")?.value; // YYYY-MM
  const quantidade = document.getElementById("dashQtd")?.value;
  const obs = document.getElementById("dashObs")?.value; // por enquanto só informativo

  if (!tipo || !status || !mesReferencia || quantidade === "") {
    setMsg("msgDashboard", "Preencha tipo, status, mês e quantidade.", "erro");
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/dashboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        tipo,
        status,
        mesReferencia,              // ex: "2026-02"
        quantidade: Number(quantidade)
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Erro ao salvar dashboard:", data);
      setMsg("msgDashboard", data.error || "Erro ao salvar dado do dashboard.", "erro");
      return;
    }

    setMsg("msgDashboard", "Registro salvo com sucesso no dashboard! ✅", "ok");
    document.getElementById("dashQtd").value = "";
  } catch (err) {
    console.error("Erro em salvarDashboard:", err);
    setMsg("msgDashboard", "Erro de conexão ao salvar dado do dashboard.", "erro");
  }
}

// -------------------------------------
// WIKI – salvar artigo
// -------------------------------------
async function salvarWiki() {
  const token = getToken();
  if (!token) {
    redirectLogin();
    return;
  }

  const chave = document.getElementById("wikiChave")?.value.trim();
  const titulo = document.getElementById("wikiTitulo")?.value.trim();
  const palavrasChave = document.getElementById("wikiPalavras")?.value.trim();
  const resumo = document.getElementById("wikiResumo")?.value.trim();
  const conteudo = document.getElementById("wikiConteudo")?.value.trim();

  if (!titulo || !resumo || !conteudo) {
    setMsg("msgWiki", "Preencha pelo menos título, resumo e conteúdo completo.", "erro");
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/wiki`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        chave: chave || null,
        titulo,
        palavrasChave: palavrasChave || null,
        resumo,
        conteudo
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Erro ao salvar wiki:", data);
      setMsg("msgWiki", data.error || "Erro ao salvar artigo na Wiki.", "erro");
      return;
    }

    setMsg("msgWiki", "Artigo publicado na Wiki com sucesso! 📚", "ok");

    document.getElementById("wikiTitulo").value = "";
    document.getElementById("wikiPalavras").value = "";
    document.getElementById("wikiResumo").value = "";
    document.getElementById("wikiConteudo").value = "";
    // document.getElementById("wikiChave").value = "";
  } catch (err) {
    console.error("Erro em salvarWiki:", err);
    setMsg("msgWiki", "Erro de conexão ao salvar artigo na Wiki.", "erro");
  }
}

// -------------------------------------
// ENTREGAS – salvar item da escada rolante
// -------------------------------------
async function salvarEntrega() {
  const token = getToken();
  if (!token) {
    redirectLogin();
    return;
  }

  const sistema = document.getElementById("origemEntrega")?.value;
  const tipo = document.getElementById("categoriaEntrega")?.value;
  const titulo = document.getElementById("tituloEntrega")?.value.trim();
  const dataEntrega = document.getElementById("dataEntrega")?.value; // YYYY-MM-DD

  if (!sistema || !tipo || !titulo) {
    setMsg("msgEntrega", "Preencha sistema, tipo e título da entrega.", "erro");
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/entregas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        sistema,       // "integra" | "apisullog"
        tipo,          // "bug" | "melhoria"
        titulo,
        descricao: null,
        dataEntrega: dataEntrega || null,
        link: null
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Erro ao salvar entrega:", data);
      setMsg("msgEntrega", data.error || "Erro ao salvar entrega.", "erro");
      return;
    }

    setMsg("msgEntrega", "Entrega registrada com sucesso! 📦", "ok");

    document.getElementById("tituloEntrega").value = "";
    document.getElementById("dataEntrega").value = "";
  } catch (err) {
    console.error("Erro em salvarEntrega:", err);
    setMsg("msgEntrega", "Erro de conexão ao salvar entrega.", "erro");
  }
}

// -------------------------------------
// Inicialização da página Admin
// -------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  if (!token) {
    redirectLogin();
    return;
  }

  const dashMes = document.getElementById("dashMes");
  if (dashMes && !dashMes.value) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    dashMes.value = `${ano}-${mes}`;
  }
});

// Expor funções globais para os onclick do HTML
window.salvarDashboard = salvarDashboard;
window.salvarWiki = salvarWiki;
window.salvarEntrega = salvarEntrega;
window.logout = logout;