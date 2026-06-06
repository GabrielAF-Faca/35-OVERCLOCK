export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const participant = await getParticipant(user.id)
  if (!participant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Perfil não encontrado',
    })
  }
  return participant
})
