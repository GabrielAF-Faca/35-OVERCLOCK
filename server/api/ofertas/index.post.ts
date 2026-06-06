import { z } from 'zod'

const schema = z.object({
  usuarioId: z.string().min(1, 'Selecione o produtor'),
  culturaId: z.string().min(1, 'Selecione a cultura'),
  quantidadeDisponivel: z.number().positive('Quantidade deve ser positiva'),
  precoUnitarioDesejado: z.number().nonnegative('Preço inválido'),
  dataDisponibilidade: z.string().optional(),
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
  return createOferta(body.data)
})
