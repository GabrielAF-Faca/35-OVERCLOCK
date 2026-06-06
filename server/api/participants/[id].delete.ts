export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.tipoUsuario !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Apenas admin pode excluir',
    })
  }
  const id = getRouterParam(event, 'id')!
  const ok = await deleteParticipant(id)
  if (!ok) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Participante não encontrado',
    })
  }
  return { ok: true }
})
