export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return listFluxosVisiveis({ id: user.id, tipoUsuario: user.tipoUsuario })
})
