import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { fluxos } from '../db/schema'
import type { FlowNode, FlowEdge, TipoUsuario } from '#shared/domain'
import { tipoToRole } from '#shared/domain'

export interface FluxoResumo {
  id: string
  nome: string
  createdAt: string
}

export interface FluxoCompleto extends FluxoResumo {
  userId: string
  userRole: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface SessionUser {
  id: string
  tipoUsuario: TipoUsuario | null
}

/**
 * Visibilidade por papel (index_regra.html:4034):
 *  - ADMIN: vê todos
 *  - PRODUTOR: vê os que salvou OU onde aparece como nó produtor
 *  - demais: só fluxos onde seu próprio nó (papel + id) está presente
 */
export function fluxoVisivel(
  flow: { userId: string; nodes: FlowNode[] },
  user: SessionUser,
): boolean {
  if (user.tipoUsuario === 'ADMIN') return true
  const role = tipoToRole(user.tipoUsuario)
  if (!role) return false

  if (role === 'produtor') {
    return (
      flow.userId === user.id ||
      flow.nodes.some((n) => n.type === 'produtor' && n.dbId === user.id)
    )
  }
  return flow.nodes.some((n) => n.type === role && n.dbId === user.id)
}

export async function listFluxosVisiveis(
  user: SessionUser,
): Promise<FluxoResumo[]> {
  const rows = await db.select().from(fluxos).orderBy(desc(fluxos.createdAt))
  return rows
    .filter((r) => fluxoVisivel({ userId: r.userId, nodes: r.nodes }, user))
    .map((r) => ({
      id: r.id,
      nome: r.nome,
      createdAt: r.createdAt.toISOString(),
    }))
}

export async function getFluxo(
  id: string,
  user: SessionUser,
): Promise<FluxoCompleto | null> {
  const [row] = await db.select().from(fluxos).where(eq(fluxos.id, id)).limit(1)
  if (!row) return null
  if (!fluxoVisivel({ userId: row.userId, nodes: row.nodes }, user)) return null
  return {
    id: row.id,
    nome: row.nome,
    userId: row.userId,
    userRole: row.userRole,
    nodes: row.nodes,
    edges: row.edges,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function saveFluxo(input: {
  nome: string
  user: SessionUser
  nodes: FlowNode[]
  edges: FlowEdge[]
}): Promise<FluxoResumo> {
  const [row] = await db
    .insert(fluxos)
    .values({
      id: genId('flx'),
      nome: input.nome.trim() || 'Fluxo',
      userId: input.user.id,
      userRole: input.user.tipoUsuario ?? '',
      nodes: input.nodes,
      edges: input.edges,
    })
    .returning()

  if (!row) throw new Error('Falha ao salvar fluxo')
  return { id: row.id, nome: row.nome, createdAt: row.createdAt.toISOString() }
}

export async function deleteFluxo(
  id: string,
  user: SessionUser,
): Promise<boolean> {
  const [row] = await db.select().from(fluxos).where(eq(fluxos.id, id)).limit(1)
  if (!row) return false
  if (!fluxoVisivel({ userId: row.userId, nodes: row.nodes }, user)) {
    return false
  }
  await db.delete(fluxos).where(eq(fluxos.id, id))
  return true
}
