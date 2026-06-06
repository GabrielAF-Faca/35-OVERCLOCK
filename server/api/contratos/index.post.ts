import { z } from 'zod'

const schema = z.object({
  ofertaId: z.string().min(1),
  demandaId: z.string().min(1),
  veiculoId: z.string().min(1),
  quantidadeNegociada: z.number().positive(),
  valorTotalProduto: z.number().nonnegative(),
  valorTotalFrete: z.number().nonnegative(),
  distanciaRotaKm: z.number().nonnegative(),
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
  return createContrato(body.data)
})
