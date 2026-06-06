export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.tipoUsuario !== 'TRANSPORTADOR') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Agenda disponível apenas para transportadores',
    })
  }
  return agendaDoTransportador(user.id)
})
