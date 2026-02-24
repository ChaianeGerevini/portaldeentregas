// Js/script-wiki.js

const API_URL = "https://wikisul.onrender.com";
// -------------------------------
// Helpers de UI (bolhas no chat)
// -------------------------------
function adicionarMensagemNoChat(tipo, conteudoHTML) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("msg", tipo); // 'user' ou 'bot'

  const avatarSpan = document.createElement("span");
  avatarSpan.classList.add("avatar");
  avatarSpan.textContent = tipo === "user" ? "🧑" : "🤖";

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.innerHTML = conteudoHTML;

  wrapper.appendChild(avatarSpan);
  wrapper.appendChild(bubbleDiv);

  chatBox.appendChild(wrapper);

  // rolar para o final
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mensagem padrão de boas-vindas (para usar em limparChat)
function montarMensagemBoasVindas() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  chatBox.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.classList.add("msg", "bot");

  const avatarSpan = document.createElement("span");
  avatarSpan.classList.add("avatar");
  avatarSpan.textContent = "🤖";

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.innerHTML = `
    Oi! 👋<br>
    Sou o <strong>WikiSul</strong>, seu assistente do sistema.<br>
    Pode perguntar sobre <em>eventos, workflows, regras ou queries</em>.<br>
    Também posso buscar por <strong>número da US, bug ou palavra-chave</strong>.
  `;

  wrapper.appendChild(avatarSpan);
  wrapper.appendChild(bubbleDiv);
  chatBox.appendChild(wrapper);
}

// -------------------------------
// Enviar pergunta (botão + Enter)
// -------------------------------
async function enviarPergunta() {
  const input = document.getElementById("pergunta");
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  // mostra pergunta do usuário no chat
  adicionarMensagemNoChat("user", texto);

  // limpa o campo
  input.value = "";

  // chama backend para buscar resposta/resumo
  await buscarNaWiki(texto);
}

// -------------------------------
// Buscar na API /wiki?q=...
// -------------------------------
async function buscarNaWiki(texto) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // mensagem "pensando"
  adicionarMensagemNoChat("bot", "Deixe-me verificar isso na Wiki pra você... 🔎");

  try {
    const resp = await fetch(`${API_URL}/wiki?q=${encodeURIComponent(texto)}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!resp.ok) {
      console.error("Erro HTTP ao buscar na wiki:", resp.status);
      adicionarMensagemNoChat(
        "bot",
        "Tive um problema para consultar a base da Wiki. Tente novamente em instantes. ⚠️"
      );
      return;
    }

    const resultados = await resp.json();
    console.log("Wiki API:", resultados);

    if (!resultados || resultados.length === 0) {
      adicionarMensagemNoChat(
        "bot",
        "Não encontrei nenhum registro relacionado a isso na Wiki 😕<br>" +
        "Talvez ainda não tenha sido cadastrado ou a palavra-chave esteja diferente."
      );
      return;
    }

    // monta resposta com resumos
    let html = "";

    resultados.forEach((item) => {
      html += `
        <div class="wiki-card">
          ${item.chave ? `<div class="wiki-tag">#${item.chave}</div>` : ""}
          <div class="wiki-titulo">${item.titulo || "Registro sem título"}</div>
          <div class="wiki-resumo">${item.resumo || ""}</div>
        </div>
      `;
    });

    const respostaHTML = `
      Encontrei ${resultados.length} registro(s) relacionado(s):<br><br>
      ${html}
      <br>
      Se quiser, pode refinar a busca informando mais detalhes (ex: módulo, tipo de evento ou cliente).
    `;

    adicionarMensagemNoChat("bot", respostaHTML);
  } catch (err) {
    console.error("Erro ao buscar na wiki:", err);
    adicionarMensagemNoChat(
      "bot",
      "Ocorreu um erro ao consultar a Wiki. 😔<br>Tente novamente daqui a pouco."
    );
  }
}

// -------------------------------
// Sugestões de pergunta (botões)
// -------------------------------
function usarSugestao(botao) {
  const texto = botao.innerText || botao.textContent;
  const input = document.getElementById("pergunta");
  if (input) {
    input.value = texto;
  }
  enviarPergunta();
}

// -------------------------------
// Limpar contexto / chat
// -------------------------------
let contextoAtivo = null;

function limparContexto() {
  contextoAtivo = null;
  const contextoLabel = document.getElementById("contextoAtivo");
  if (contextoLabel) {
    contextoLabel.innerText = "Sem contexto ativo";
  }
  adicionarMensagemNoChat(
    "bot",
    "Contexto limpo. A partir de agora considero apenas as próximas perguntas. 🧹"
  );
}

function limparChat() {
  montarMensagemBoasVindas();
  limparContexto();
}

// -------------------------------
// Inicialização
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // ENTER para enviar
  const input = document.getElementById("pergunta");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        enviarPergunta();
      }
    });
  }

  // Inicializa contexto label
  const contextoLabel = document.getElementById("contextoAtivo");
  if (contextoLabel) {
    contextoLabel.innerText = "Sem contexto ativo";
  }

  // Se quiser forçar a mensagem de boas-vindas 100% via JS:
  // montarMensagemBoasVindas();
  // (no teu HTML ela já existe, então não é obrigatório)
});

// Expor funções globais para o HTML (onclick)
window.enviarPergunta = enviarPergunta;
window.usarSugestao = usarSugestao;
window.limparContexto = limparContexto;
window.limparChat = limparChat;