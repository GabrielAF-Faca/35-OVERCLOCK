import { z } from 'zod'

const schema = z.object({
  usuarioId: z.string().min(1, 'Selecione o comprador'),
  culturaId: z.string().min(1, 'Selecione a cultura'),
  quantidadeNecessaria: z.number().positive('Quantidade deve ser positiva'),
  precoMaximoAceitavel: z.number().nonnegative('Preço inválido'),
  distanciaMaximaKm: z.number().int().positive('Distância inválida'),
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
  return createDemanda(body.data)
})
