export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!
  const ok = await deleteFluxo(id, {
    id: user.id,
    tipoUsuario: user.tipoUsuario,
  })
  if (!ok) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fluxo não encontrado ou sem permissão',
    })
  }
  return { ok: true }
})
