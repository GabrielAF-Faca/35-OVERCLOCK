# 🌱 GLM - Grãos, Lavoura & Mercado

Boilerplate de web app que conecta o **produtor rural** a **cooperativas**, **logística** e **mercado** através de grafos visuais - uma experiência no estilo do [n8n](https://n8n.io), com tema verde e foco no agronegócio.

## Stack (2026)

| Camada       | Tecnologia                                                                             |
| ------------ | -------------------------------------------------------------------------------------- |
| Framework    | [Nuxt 4](https://nuxt.com) (Vue 3, estrutura `app/`)                                   |
| Estilo       | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first)                                  |
| Grafos       | [Vue Flow](https://vueflow.dev)                                                        |
| Autenticação | [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) (sessão selada em cookie) |
| Ícones       | [@nuxt/icon](https://github.com/nuxt/icon) + Lucide                                    |
| Validação    | [Zod](https://zod.dev)                                                                 |

## Como rodar

```bash
# 1. Variáveis de ambiente
cp .env.example .env
# edite NUXT_SESSION_PASSWORD (mín. 32 caracteres) - gere com: openssl rand -base64 32

# 2. Instale e rode
npm install
npm run dev
```

Acesse http://localhost:3000

### Conta de demonstração

| E-mail         | Senha      |
| -------------- | ---------- |
| `demo@glm.app` | `demo1234` |

(Na tela de login há um botão para preencher automaticamente.)

## Estrutura

```
app/
├─ assets/css/main.css        # Tailwind 4 + tema verde GLM + estilos do Vue Flow
├─ components/
│  ├─ GlmLogo.vue
│  ├─ PagePlaceholder.vue
│  └─ flow/
│     ├─ GlmNode.vue          # nó customizado (produtor/cooperativa/logística/mercado)
│     └─ GlmFlowEditor.client.vue  # canvas Vue Flow (client-only)
├─ layouts/
│  ├─ default.vue             # site público (header/footer)
│  ├─ auth.vue                # split-screen de login/cadastro
│  └─ dashboard.vue           # shell do app com sidebar
├─ middleware/
│  ├─ auth.ts                 # exige login
│  └─ guest.ts                # bloqueia logado em login/cadastro
└─ pages/
   ├─ index.vue               # landing
   ├─ login.vue · register.vue
   └─ app/                    # área autenticada (grafo + placeholders)

server/
├─ api/auth/                  # login · register · logout
└─ utils/users.ts             # store de usuários EM MEMÓRIA (troque por um DB)
```

## Próximos passos

- **Persistência**: trocar `server/utils/users.ts` por um banco real (Postgres + Drizzle, NuxtHub, Supabase…) e salvar os grafos.
- **OAuth**: o `nuxt-auth-utils` já traz provedores prontos (Google, GitHub) - basta configurar.
- **Domínio**: evoluir os nós com capacidade, distância e custo para cálculo de rotas ótimas.

---

Feito para o campo 🌱
