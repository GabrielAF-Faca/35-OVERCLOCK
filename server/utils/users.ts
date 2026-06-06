/**
 * Store de usuários em memória — APENAS para o boilerplate.
 *
 * Em produção, troque por um banco real (Postgres + Drizzle/Prisma,
 * Nuxt Hub D1, Supabase, etc.). Mantenha a mesma interface de funções
 * abaixo e o resto do app continua funcionando.
 */

export interface StoredUser {
  id: string
  name: string
  email: string
  /** hash gerado por hashPassword() do nuxt-auth-utils */
  password: string
  createdAt: string
}

/** Dados públicos do usuário (o que vai para a sessão / cliente). */
export interface PublicUser {
  id: string
  name: string
  email: string
}

const users = new Map<string, StoredUser>()

// Usuário de demonstração: demo@glm.app / demo1234
// (criado de forma preguiçosa na primeira leitura para usar hashPassword)
let seeded = false
async function ensureSeed() {
  if (seeded) return
  seeded = true
  const email = 'demo@glm.app'
  if (!users.has(email)) {
    users.set(email, {
      id: 'usr_demo',
      name: 'Produtor Demo',
      email,
      password: await hashPassword('demo1234'),
      createdAt: new Date().toISOString(),
    })
  }
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email }
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  await ensureSeed()
  return users.get(email.toLowerCase().trim())
}

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<StoredUser> {
  await ensureSeed()
  const email = input.email.toLowerCase().trim()

  const user: StoredUser = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    email,
    password: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  }
  users.set(email, user)
  return user
}
