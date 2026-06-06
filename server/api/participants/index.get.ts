import { z } from 'zod'

const querySchema = z.object({
  tipo: z
    .enum([
      'PRODUTOR',
      'COOPERATIVA',
      'TRANSPORTADOR',
      'AGROINDUSTRIA',
      'EXPORTADORA',
    ])
    .optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = await getValidatedQuery(event, querySchema.safeParse)
  if (!query.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Tipo de participante inválido',
    })
  }
  if (query.data.tipo) return listParticipants(query.data.tipo)
  return listAllParticipants()
})
