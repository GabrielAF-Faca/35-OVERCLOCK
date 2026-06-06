import { eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import type { TipoUsuario } from './users'

export interface Participant {
  id: string
  name: string
  email: string
  tipoUsuario: TipoUsuario | null
  cpfCnpj: string | null
  latitude: number | null
  longitude: number | null
  enderecoFormatado: string | null
}

function rowToParticipant(row: typeof users.$inferSelect): Participant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    tipoUsuario: row.tipoUsuario,
    cpfCnpj: row.cpfCnpj,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    enderecoFormatado: row.enderecoFormatado,
  }
}

export async function listParticipants(
  tipo: TipoUsuario,
): Promise<Participant[]> {
  const rows = await db.select().from(users).where(eq(users.tipoUsuario, tipo))
  return rows.map(rowToParticipant)
}

/** Compradores = cooperativas + agroindústrias (nós de destino). */
export async function listBuyers(): Promise<Participant[]> {
  const rows = await db
    .select()
    .from(users)
    .where(inArray(users.tipoUsuario, ['COOPERATIVA', 'AGROINDUSTRIA']))
  return rows.map(rowToParticipant)
}

export async function createParticipant(input: {
  name: string
  email: string
  tipoUsuario: TipoUsuario
  cpfCnpj?: string | null
  latitude?: number | null
  longitude?: number | null
  enderecoFormatado?: string | null
}): Promise<Participant> {
  const [row] = await db
    .insert(users)
    .values({
      id: genId('usr'),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      tipoUsuario: input.tipoUsuario,
      cpfCnpj: input.cpfCnpj?.trim() || null,
      latitude: input.latitude == null ? null : String(input.latitude),
      longitude: input.longitude == null ? null : String(input.longitude),
      enderecoFormatado: input.enderecoFormatado?.trim() || null,
    })
    .returning()

  if (!row) throw new Error('Falha ao criar participante')
  return rowToParticipant(row)
}
