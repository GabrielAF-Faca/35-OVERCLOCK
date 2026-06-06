# 🌱 GLM — Grãos, Lavoura & Mercado

Conecta o **produtor rural** a **cooperativas, logística e mercado** por meio de **grafos visuais** (estilo n8n). Você monta a cadeia agroindustrial num canvas e o sistema calcula a **receita líquida** de cada destino, considerando cotação, bônus, frete e descontos.

![GLM — editor de fluxo da cadeia agroindustrial](./print.png)

## Stack

Nuxt 4 (Vue 3) · PostgreSQL + Drizzle ORM · Vue Flow · Tailwind 4 + Lucide · nuxt-auth-utils · Zod

## Como rodar

### Com Docker (recomendado)

```bash
cp .env.example .env
# gere a senha de sessão e substitua NUXT_SESSION_PASSWORD no .env:
openssl rand -base64 32

docker compose up -d
docker exec glm-app npm run db:migrate
```

App em **http://localhost:3000**. O seed popula ~15 participantes de exemplo no boot.

### Local

```bash
cp .env.example .env          # ajuste DATABASE_URL; gere a senha de sessão:
openssl rand -base64 32       # cole o valor em NUXT_SESSION_PASSWORD

npm install
npm run db:migrate
npm run dev
```

## Login

Login por e-mail. Todos os usuários do seed usam a senha `glm12345`. Um por papel:

| Papel         | E-mail                | Senha      |
| ------------- | --------------------- | ---------- |
| Admin         | `admin@glm.app`       | `glm12345` |
| Produtor      | `planalto@glm.app`    | `glm12345` |
| Cooperativa   | `cotrijal@glm.app`    | `glm12345` |
| Transportador | `transgaucha@glm.app` | `glm12345` |
| Agroindústria | `bunge@glm.app`       | `glm12345` |
| Exportadora   | `amaggi@glm.app`      | `glm12345` |

Ou cadastre um novo usuário em **/register** escolhendo o papel na cadeia.

## Variáveis de ambiente

| Variável                | Descrição                                      |
| ----------------------- | ---------------------------------------------- |
| `DATABASE_URL`          | Conexão PostgreSQL                             |
| `NUXT_SESSION_PASSWORD` | Senha do cookie de sessão (mín. 32 caracteres) |

## Scripts úteis

```bash
npm run dev           # dev server (porta 3000)
npm run db:generate   # gera migration a partir do schema Drizzle
npm run db:migrate    # aplica migrations
npm run db:studio     # abre o Drizzle Studio
npm run lint          # ESLint
```

---

Feito para o campo 🌱
