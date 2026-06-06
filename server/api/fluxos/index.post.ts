import { z } from 'zod'
import type { FlowNode, FlowEdge } from '#shared/domain'

const schema = z.object({
  nome: z.string().min(1).max(120),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, schema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues[0]?.message ?? 'Fluxo inválido',
    })
  }

  return saveFluxo({
    nome: body.data.nome,
    user: { id: user.id, tipoUsuario: user.tipoUsuario },
    nodes: body.data.nodes as FlowNode[],
    edges: body.data.edges as FlowEdge[],
  })
})
