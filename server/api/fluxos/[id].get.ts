export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!
  const fluxo = await getFluxo(id, {
    id: user.id,
    tipoUsuario: user.tipoUsuario,
  })
  if (!fluxo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fluxo não encontrado ou sem permissão',
    })
  }
  return fluxo
})
