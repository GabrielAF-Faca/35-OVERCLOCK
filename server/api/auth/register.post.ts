import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome').max(80),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').max(128),
})

export default defineEventHandler(async (event) => {
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
      statusMessage: 'Já existe uma conta com este e-mail',
    })
  }

  const user = await createUser(body.data)

  await setUserSession(event, {
    user: toPublicUser(user),
    loggedInAt: new Date().toISOString(),
  })

  return { user: toPublicUser(user) }
})
