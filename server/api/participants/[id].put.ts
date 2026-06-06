import { z } from 'zod'

const schema = z
  .object({ name: z.string().min(2).max(120).optional() })
  .merge(participantAttrsSchema)

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  if (user.id !== id && user.tipoUsuario !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão' })
  }

  const body = await readValidatedBody(event, schema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues[0]?.message ?? 'Dados inválidos',
    })
  }

  const updated = await updateParticipant(id, body.data)
  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Participante não encontrado',
    })
  }
  return updated
})
