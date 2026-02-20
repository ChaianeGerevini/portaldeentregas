// Js/auth.js
const API_URL = "http://localhost:3000";

/* =========================================
   LOGIN
   ========================================= */
async function login() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;
  const salvarSenha = document.getElementById("salvarSenha")?.checked;
  const erro = document.getElementById("erro");

  erro.innerText = "";
  erro.style.color = "";

  if (!usuario || !senha) {
    erro.innerText = "Informe usuário (email) e senha";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: usuario, password: senha })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      erro.innerText = data.message || "Usuário ou senha inválidos";
      return;
    }

    localStorage.setItem("token", data.token);

    if (salvarSenha) {
      localStorage.setItem("credenciais", JSON.stringify({ usuario, senha }));
    } else {
      localStorage.removeItem("credenciais");
    }

    window.location.href = "Dashboard.html";
  } catch (e) {
    console.error(e);
    erro.innerText = "Falha ao conectar no servidor (backend está rodando?)";
  }
}

/* =========================================
   CADASTRO
   ========================================= */
async function registrar() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;
  const senha2 = document.getElementById("senha2")?.value;
  const erro = document.getElementById("erro");

  erro.style.color = "";
  erro.innerText = "";

  if (!usuario || !senha) {
    erro.innerText = "Preencha email e senha";
    return;
  }

  if (senha.length < 6) {
    erro.innerText = "A senha deve ter no mínimo 6 caracteres";
    return;
  }

  if (senha2 !== undefined && senha !== senha2) {
    erro.innerText = "As senhas não conferem";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: usuario, password: senha })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      erro.innerText = data.message || "Erro ao cadastrar";
      return;
    }

    erro.style.color = "lightgreen";
    erro.innerText = "Conta criada com sucesso! Redirecionando...";

    setTimeout(() => {
      window.location.href = "Index.html";
    }, 1200);
  } catch (e) {
    console.error(e);
    erro.innerText = "Falha ao conectar no servidor (backend está rodando?)";
  }
}

/* =========================================
   ESQUECI MINHA SENHA
   ========================================= */
async function esqueciSenha() {
  const usuario = document.getElementById("usuario").value.trim();
  const erro = document.getElementById("erro");

  erro.style.color = "";
  erro.innerText = "";

  if (!usuario) {
    erro.innerText = "Informe o email no campo de usuário para enviar o link.";
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: usuario })
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      erro.innerText = data.message || "Erro ao enviar email de redefinição.";
      return;
    }

    erro.style.color = "lightgreen";
    erro.innerText =
      "Se este email estiver cadastrado, você receberá um link para redefinir a senha.";
  } catch (e) {
    console.error(e);
    erro.innerText = "Falha ao conectar no servidor (backend está rodando?)";
  }
}

/* =========================================
   ENTER = LOGIN / CADASTRO + AUTO-PREENCHER
   ========================================= */
function configurarEnter() {
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // se existe campo senha2 -> tela de cadastro
        if (document.getElementById("senha2")) {
          registrar();
        } else {
          login();
        }
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const cred = JSON.parse(localStorage.getItem("credenciais") || "null");
  if (cred) {
    const usuarioEl = document.getElementById("usuario");
    const senhaEl = document.getElementById("senha");
    if (usuarioEl && senhaEl) {
      usuarioEl.value = cred.usuario;
      senhaEl.value = cred.senha;
      const salvar = document.getElementById("salvarSenha");
      if (salvar) salvar.checked = true;
    }
  }

  configurarEnter();

  // só chama se a função existir (não quebra nada)
  if (typeof iniciarFundoTech === "function") {
    iniciarFundoTech();
  }
});

/* =========================================
   NAVEGAÇÃO
   ========================================= */
function irCadastro() {
  window.location.href = "Cadastro.html";
}

function voltarLogin() {
  window.location.href = "Index.html";
}
/* =========================================
   FUNDO TECH ANIMADO (Canvas)
   ========================================= */
function iniciarFundoTech() {
  const canvas = document.getElementById("techCanvas");
  if (!canvas) return; // se a página não tiver canvas, não faz nada

  const ctx = canvas.getContext("2d");

  let w, h;
  function resize() {
    w = (canvas.width = window.innerWidth);
    h = (canvas.height = window.innerHeight);
  }
  resize();
  window.addEventListener("resize", resize);

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  function movimentoSuave() {
    targetX = Math.sin(Date.now() * 0.00025) * 15;
    targetY = Math.cos(Date.now() * 0.0002) * 15;

    mouseX += (targetX - mouseX) * 0.02;
    mouseY += (targetY - mouseY) * 0.02;

    requestAnimationFrame(movimentoSuave);
  }

  movimentoSuave();

  const pontos = Array.from({ length: 160 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 1,
    pulse: Math.random() * Math.PI * 2
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // pontos brilhantes
    pontos.forEach((p) => {
      p.pulse += 0.02;

      const px = p.x + mouseX * p.z;
      const py = p.y + mouseY * p.z;
      const glow = (Math.sin(p.pulse) + 1) * 4 + 2;

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,180,255,${0.25 + glow * 0.03})`;
      ctx.shadowBlur = glow * 6;
      ctx.shadowColor = '#00ccff';
      ctx.arc(px, py, glow, 0, Math.PI * 2);
      ctx.fill();
    });

    // conexões entre pontos
    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const dx = pontos[i].x - pontos[j].x;
        const dy = pontos[i].y - pontos[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.strokeStyle = `rgba(0,200,255,${1 - dist / 120})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(
            pontos[i].x + mouseX * pontos[i].z,
            pontos[i].y + mouseY * pontos[i].z
          );
          ctx.lineTo(
            pontos[j].x + mouseX * pontos[j].z,
            pontos[j].y + mouseY * pontos[j].z
          );
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}