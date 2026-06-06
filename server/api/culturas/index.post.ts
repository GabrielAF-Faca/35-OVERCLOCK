import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome da cultura').max(80),
  tipoCarga: z.enum(['GRANEL', 'REFRIGERADO', 'VIVO', 'SACA']),
  unidadeMedida: z.string().min(1).max(20),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readValidatedBody(event, schema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues[0]?.message ?? 'Dados inválidos',
    })
  }
  return createCultura(body.data)
})
