# WikiSul — Portal Interno + Assistente de Conhecimento

Sistema web com autenticação JWT, dashboard operacional e assistente de consulta à base de conhecimento.

Arquitetura simplificada:

* **Backend Node.js (Express)** → API + Auth + Wiki
* **Frontend HTML / CSS / JS puro**
* **Autenticação via JWT**
* **Persistência simples em JSON**

---

## 🚀 Tecnologias Utilizadas

**Backend**

* Node.js
* Express
* bcrypt
* jsonwebtoken
* dotenv

**Frontend**

* HTML5
* CSS3
* JavaScript Vanilla
* Chart.js

---

## 📦 Estrutura do Projeto

```
Wikisul/
 ├── Backend/
 │    ├── server.js
 │    ├── .env
 │    └── wiki-data/
 │         └── regras.json
 │
 └── Frontend/
      ├── index.html
      ├── Cadastro.html
      ├── Dashboard.html
      ├── wiki.html
      ├── Css/
      └── Js/
```

---

## ⚙️ Pré-requisitos

* Node.js instalado (versão LTS recomendada)
* npm disponível no PATH

Verificar instalação:

```bash
node -v
npm -v
```

---

## 🟢 Rodando o Backend (API)

Abra um terminal:

```powershell
cd "CAMINHO_DO_PROJETO\Backend"
npm install
node server.js
```

Se tudo estiver correto:

```
🚀 Backend unificado em http://localhost:3000
```

---

## 🔵 Rodando o Frontend

Abra **outro terminal**:

```powershell
cd "CAMINHO_DO_PROJETO\Frontend"
npx serve . -l 5173
```

Abra no navegador:

```
http://localhost:5173/index.html
```

---

## 🔐 Portas da Aplicação (IMPORTANTE)

| Serviço  | Porta |
| -------- | ----- |
| Backend  | 3000  |
| Frontend | 5173  |

⚠️ Nunca rode o frontend na porta 3000.

Se isso ocorrer:

* endpoints `/auth/*` retornam 404
* login para de funcionar
* chamadas API quebram

---

## 👤 Fluxo de Uso

1️⃣ Acesse a tela de **Cadastro**

```
/Cadastro.html
```

2️⃣ Crie um usuário

3️⃣ Volte ao **Login**

```
/index.html
```

4️⃣ Autentique-se

5️⃣ O token JWT será salvo no `localStorage`

6️⃣ Dashboard e Wiki exigem token válido

---

## 📡 Endpoints da API

### Registro

```http
POST /auth/register
```

Body:

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

---

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "token": "JWT_TOKEN"
}
```

---

### Usuário autenticado

```http
GET /me
```

Header obrigatório:

```
Authorization: Bearer JWT_TOKEN
```

---

### Pergunta à Wiki

```http
POST /wiki/perguntar
```

Header obrigatório:

```
Authorization: Bearer JWT_TOKEN
```

Body:

```json
{
  "pergunta": "fora de rota"
}
```

---

## 🧠 Base de Conhecimento

Arquivo:

```
Backend/wiki-data/regras.json
```

Formato:

```json
[
  {
    "id": 1,
    "titulo": "Fora de rota",
    "conteudo": "Descrição da regra..."
  }
]
```

---

## ❗ Problemas Comuns

### ❌ Impossível conectar-se ao servidor remoto

➡️ Backend não está rodando.

Solução:

```bash
node server.js
```

---

### ❌ 401 Unauthorized

➡️ Token inválido / ausente / expirado.

Solução:

* fazer login novamente
* verificar `localStorage`

---

### ❌ Cannot GET /

➡️ Comportamento normal do Express.

A API não possui rota raiz `/`.

---

### ❌ 404 /auth/login

➡️ Frontend ocupando porta 3000.

Solução:

Rodar frontend em 5173.

---

## 🧹 Observações de Desenvolvimento

* Token JWT armazenado no `localStorage`
* Backend protegido por middleware JWT
* Persistência simples em arquivo JSON
* Projeto didático / acadêmico / protótipo funcional

---