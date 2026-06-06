import { eq, ne } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import type { TipoUsuario } from '#shared/domain'

export interface Participant {
  id: string
  name: string
  email: string
  tipoUsuario: TipoUsuario | null
  cpfCnpj: string | null
  cidade: string | null
  estado: string | null
  cultura: string | null
  mes: string | null
  quantidade: number | null
  demanda: number | null
  tonelagem: number | null
  cotacao: number | null
  bonus: number | null
  descontoTransporte: number | null
  precoPorTonelada: number | null
}

const num = (v: string | null) => (v == null ? null : Number(v))
const str = (v: number | null | undefined) => (v == null ? null : String(v))

export function rowToParticipant(row: typeof users.$inferSelect): Participant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    tipoUsuario: row.tipoUsuario,
    cpfCnpj: row.cpfCnpj,
    cidade: row.cidade,
    estado: row.estado,
    cultura: row.cultura,
    mes: row.mes,
    quantidade: num(row.quantidade),
    demanda: num(row.demanda),
    tonelagem: num(row.tonelagem),
    cotacao: num(row.cotacao),
    bonus: num(row.bonus),
    descontoTransporte: num(row.descontoTransporte),
    precoPorTonelada: num(row.precoPorTonelada),
  }
}

/** Campos econômicos/de cadeia editáveis por papel. */
export interface ParticipantAttrs {
  cpfCnpj?: string | null
  cidade?: string | null
  estado?: string | null
  cultura?: string | null
  mes?: string | null
  quantidade?: number | null
  demanda?: number | null
  tonelagem?: number | null
  cotacao?: number | null
  bonus?: number | null
  descontoTransporte?: number | null
  precoPorTonelada?: number | null
}

const TEXT_ATTRS = ['cpfCnpj', 'cidade', 'estado', 'cultura', 'mes'] as const
const NUM_ATTRS = [
  'quantidade',
  'demanda',
  'tonelagem',
  'cotacao',
  'bonus',
  'descontoTransporte',
  'precoPorTonelada',
] as const

/** Colunas completas (cria com todos os campos; ausentes viram null). */
function attrsToColumns(attrs: ParticipantAttrs) {
  return {
    cpfCnpj: attrs.cpfCnpj?.trim() || null,
    cidade: attrs.cidade?.trim() || null,
    estado: attrs.estado?.trim() || null,
    cultura: attrs.cultura?.trim() || null,
    mes: attrs.mes?.trim() || null,
    quantidade: str(attrs.quantidade),
    demanda: str(attrs.demanda),
    tonelagem: str(attrs.tonelagem),
    cotacao: str(attrs.cotacao),
    bonus: str(attrs.bonus),
    descontoTransporte: str(attrs.descontoTransporte),
    precoPorTonelada: str(attrs.precoPorTonelada),
  }
}

/** Apenas os campos presentes no input (atualização parcial). */
function attrsToPartialColumns(attrs: ParticipantAttrs) {
  const cols: Record<string, string | null> = {}
  for (const key of TEXT_ATTRS) {
    if (key in attrs) cols[key] = attrs[key]?.trim() || null
  }
  for (const key of NUM_ATTRS) {
    if (key in attrs) cols[key] = str(attrs[key])
  }
  return cols
}

export async function listParticipants(
  tipo: TipoUsuario,
): Promise<Participant[]> {
  const rows = await db.select().from(users).where(eq(users.tipoUsuario, tipo))
  return rows.map(rowToParticipant)
}

/** Todos os participantes exceto admins — usado pela visão de admin. */
export async function listAllParticipants(): Promise<Participant[]> {
  const rows = await db
    .select()
    .from(users)
    .where(ne(users.tipoUsuario, 'ADMIN'))
  return rows.map(rowToParticipant)
}

export async function getParticipant(
  id: string,
): Promise<Participant | undefined> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ? rowToParticipant(rows[0]) : undefined
}

export async function createParticipant(input: {
  name: string
  email: string
  tipoUsuario: TipoUsuario
  attrs?: ParticipantAttrs
}): Promise<Participant> {
  const [row] = await db
    .insert(users)
    .values({
      id: genId('usr'),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      tipoUsuario: input.tipoUsuario,
      ...attrsToColumns(input.attrs ?? {}),
    })
    .returning()

  if (!row) throw new Error('Falha ao criar participante')
  return rowToParticipant(row)
}

export async function updateParticipant(
  id: string,
  attrs: ParticipantAttrs & { name?: string },
): Promise<Participant | undefined> {
  const values: Record<string, unknown> = attrsToPartialColumns(attrs)
  if (attrs.name != null) values.name = attrs.name.trim()
  if (Object.keys(values).length === 0) return getParticipant(id)

  const [row] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning()

  return row ? rowToParticipant(row) : undefined
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const rows = await db.delete(users).where(eq(users.id, id)).returning()
  return rows.length > 0
}
