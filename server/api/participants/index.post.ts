import { z } from 'zod'

const schema = z
  .object({
    name: z.string().min(2, 'Informe o nome').max(120),
    email: z.string().email('E-mail inválido'),
    tipoUsuario: tipoParticipanteEnum,
  })
  .merge(participantAttrsSchema)

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readValidatedBody(event, schema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues[0]?.message ?? 'Dados inválidos',
    })
  }

  const existing = await findUserByEmail(body.data.email)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Já existe um cadastro com este e-mail',
    })
  }

  const { name, email, tipoUsuario, ...attrs } = body.data
  return createParticipant({ name, email, tipoUsuario, attrs })
})
