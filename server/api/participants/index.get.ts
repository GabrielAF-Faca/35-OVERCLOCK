import { z } from 'zod'

const querySchema = z.object({
  tipo: z.enum(['PRODUTOR', 'COOPERATIVA', 'AGROINDUSTRIA', 'TRANSPORTADOR']),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = await getValidatedQuery(event, querySchema.safeParse)
  if (!query.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Informe um tipo de participante válido',
    })
  }
  return listParticipants(query.data.tipo)
})
