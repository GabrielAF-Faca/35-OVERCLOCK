import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import type { TipoUsuario } from '#shared/domain'
import type { ParticipantAttrs } from './participants'

export interface StoredUser {
  id: string
  name: string
  email: string
  password: string | null
  tipoUsuario: TipoUsuario | null
  createdAt: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
  tipoUsuario: TipoUsuario | null
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tipoUsuario: user.tipoUsuario,
  }
}

function rowToUser(row: typeof users.$inferSelect): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    tipoUsuario: row.tipoUsuario,
    createdAt: row.createdAt.toISOString(),
  }
}

const str = (v: number | null | undefined) => (v == null ? null : String(v))

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
  tipoUsuario: TipoUsuario
  attrs?: ParticipantAttrs
}): Promise<StoredUser> {
  const a = input.attrs ?? {}
  const [row] = await db
    .insert(users)
    .values({
      id: genId('usr'),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      password: await hashPassword(input.password),
      tipoUsuario: input.tipoUsuario,
      cpfCnpj: a.cpfCnpj?.trim() || null,
      cidade: a.cidade?.trim() || null,
      estado: a.estado?.trim() || null,
      cultura: a.cultura?.trim() || null,
      mes: a.mes?.trim() || null,
      quantidade: str(a.quantidade),
      demanda: str(a.demanda),
      tonelagem: str(a.tonelagem),
      cotacao: str(a.cotacao),
      bonus: str(a.bonus),
      descontoTransporte: str(a.descontoTransporte),
      precoPorTonelada: str(a.precoPorTonelada),
    })
    .returning()

  if (!row) throw new Error('Falha ao criar usuário')
  return rowToUser(row)
}
