import { z } from 'zod'

const schema = z.object({
  usuarioId: z.string().min(1, 'Selecione o transportador'),
  capacidadeMaxima: z.number().positive('Capacidade deve ser positiva'),
  precoPorKm: z.number().nonnegative('Preço por km inválido'),
  tiposCargaSuportados: z
    .array(z.enum(['GRANEL', 'REFRIGERADO', 'VIVO', 'SACA']))
    .min(1, 'Selecione ao menos um tipo de carga'),
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
  return createVeiculo(body.data)
})
