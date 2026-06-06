export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Demanda inválida' })
  }

  const result = await otimizarDemanda(id)
  if ('erro' in result) {
    throw createError({ statusCode: 422, statusMessage: result.erro })
  }
  return result
})
