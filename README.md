# GymNotes — Backend

API REST desenvolvida com **NestJS** para o GymNotes, uma aplicação de registro e acompanhamento de treinos. Permite criar fichas de treino personalizadas, registrar logs diários de exercícios e acompanhar a frequência de treinos ao longo do tempo.

---

## 🚀 Tecnologias

- **[NestJS](https://nestjs.com/)** — framework Node.js para construção da API
- **[MongoDB](https://www.mongodb.com/)** + **[Mongoose](https://mongoosejs.com/)** — banco de dados e ODM
- **[JWT](https://jwt.io/)** — autenticação via access token + refresh token
- **[Passport](http://www.passportjs.org/)** — estratégias de autenticação (local + Google OAuth)
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** — hash de senhas
- **[@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)** — rate limiting
- **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** — documentação automática da API
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** — leitura de cookies HTTP

---

## 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/gymnotes-backend.git
cd gymnotes-backend

# Instalar dependências
npm install
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/gymnotes

# JWT
JWT_SECRET=sua_chave_secreta

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001
```

---

## ▶️ Rodando o projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

O servidor sobe em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/docs`.

---

## 📁 Estrutura de Módulos

```
src/
├── modules/
│   ├── auth/           # Autenticação JWT + Google OAuth
│   ├── user/           # Cadastro e perfil do usuário
│   ├── exercise/       # Banco de exercícios
│   ├── workout/        # Fichas de treino
│   └── workout-log/    # Registros diários de treino
└── main.ts
```

---

## 🔐 Autenticação

A API utiliza dois tokens JWT armazenados em cookies `httpOnly`:

| Token | Expiração | Descrição |
|---|---|---|
| `token` | 15 minutos | Access token para requisições autenticadas |
| `refreshToken` | 7 dias | Usado para renovar o access token |

### Fluxo
1. `POST /auth/login` — autentica e seta os cookies
2. `POST /auth/refresh` — renova o access token usando o refresh token
3. `POST /auth/logout` — limpa os cookies

Também é suportado login via **Google OAuth** em `GET /auth/google`.

---

## 📡 Endpoints

### Auth
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login com email e senha | ❌ |
| POST | `/auth/refresh` | Renova o access token | ❌ |
| POST | `/auth/logout` | Logout | ❌ |
| GET | `/auth/google` | Inicia login com Google | ❌ |
| GET | `/auth/google/callback` | Callback do Google OAuth | ❌ |

### Users
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/users` | Cria um novo usuário | ❌ |
| GET | `/users/me` | Retorna dados do usuário autenticado | ✅ |
| PATCH | `/users/me` | Atualiza dados do usuário | ✅ |

### Exercises
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/exercises` | Cria um exercício | ❌ |
| GET | `/exercises` | Lista todos os exercícios | ❌ |
| GET | `/exercises?muscle=biceps` | Filtra por grupo muscular | ❌ |

### Workouts
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/workouts` | Cria uma ficha de treino | ✅ |
| GET | `/workouts/me` | Lista fichas do usuário | ✅ |
| PATCH | `/workouts/:id` | Atualiza uma ficha | ✅ |
| DELETE | `/workouts/:id` | Remove uma ficha | ✅ |

### Workout Logs
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/workout-logs` | Cria ou atualiza um log de treino | ✅ |
| GET | `/workout-logs?month=2026-05` | Busca logs de um mês | ✅ |
| DELETE | `/workout-logs/:id` | Remove um log | ✅ |

---

## 🛡️ Rate Limiting

| Perfil | TTL | Limite | Aplicado em |
|---|---|---|---|
| `global` | 60s | 200 req | Todos os endpoints |
| `auth` | 60s | 10 req | `/auth/login`, `/auth/refresh`, `POST /users` |
| `default` | 60s | 20 req | `POST` e `DELETE` de workout-logs |

O endpoint `GET /workout-logs` não possui rate limit pois o cache no frontend já reduz o volume de requisições.

---

## 📄 Documentação Swagger

Disponível em `/docs` após subir o servidor. Todos os endpoints estão documentados com exemplos de request/response e suporte a autenticação Bearer.

---

## 🧱 Padrões do Projeto

- **DTOs** com `class-validator` para validação de entrada em todos os endpoints
- **Erros HTTP semânticos** via exceptions do NestJS (`NotFoundException`, `ConflictException`, `ForbiddenException`, `UnauthorizedException`)
- **Ownership check** antes de qualquer mutação em recursos do usuário
- **Senhas** nunca retornadas nas respostas (`.select('-password')`)
- **Cookies `httpOnly`** para armazenamento seguro dos tokens

---

Made with 💚 by **Arthur Zambão**