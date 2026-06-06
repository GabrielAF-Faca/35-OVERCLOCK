export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.tipoUsuario !== 'PRODUTOR') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Sugestões disponíveis apenas para produtores',
    })
  }
  return sugestoesParaProdutor(user.id)
})
