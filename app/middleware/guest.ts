// Redireciona usuários já logados para fora das páginas de login/cadastro.
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value) {
    return navigateTo('/app')
  }
})
