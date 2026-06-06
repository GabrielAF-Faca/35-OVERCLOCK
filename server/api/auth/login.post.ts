import { z } from 'zod'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.safeParse)

  if (!body.success) {
    throw createError({ statusCode: 422, statusMessage: 'Dados inválidos' })
  }

  const user = await findUserByEmail(body.data.email)
  const valid = user && (await verifyPassword(user.password, body.data.password))

  if (!user || !valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'E-mail ou senha incorretos',
    })
  }

  await setUserSession(event, {
    user: toPublicUser(user),
    loggedInAt: new Date().toISOString(),
  })

  return { user: toPublicUser(user) }
})
