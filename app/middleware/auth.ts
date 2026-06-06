// Protege rotas que exigem login. Use com:  definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
