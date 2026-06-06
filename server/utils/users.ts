import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

export type TipoUsuario =
  | 'PRODUTOR'
  | 'COOPERATIVA'
  | 'AGROINDUSTRIA'
  | 'TRANSPORTADOR'

export interface StoredUser {
  id: string
  name: string
  email: string
  password: string | null
  createdAt: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email }
}

function rowToUser(row: typeof users.$inferSelect): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function findUserByEmail(
  email: string,
): Promise<StoredUser | undefined> {
  const normalized = email.toLowerCase().trim()
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1)

  return rows[0] ? rowToUser(rows[0]) : undefined
}

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<StoredUser> {
  const normalizedEmail = input.email.toLowerCase().trim()

  const [row] = await db
    .insert(users)
    .values({
      id: genId('usr'),
      name: input.name.trim(),
      email: normalizedEmail,
      password: await hashPassword(input.password),
    })
    .returning()

  if (!row) throw new Error('Falha ao criar usuário')
  return rowToUser(row)
}

/**
 * Insere o usuário demo caso a tabela esteja vazia.
 * Útil para desenvolvimento e primeiros testes.
 */
export async function seedDemoUser(): Promise<void> {
  const existing = await db.select().from(users).limit(1)
  if (existing.length > 0) return

  await db.insert(users).values({
    id: 'usr_demo',
    name: 'Produtor Demo',
    email: 'demo@glm.app',
    password: await hashPassword('demo1234'),
  })
}
