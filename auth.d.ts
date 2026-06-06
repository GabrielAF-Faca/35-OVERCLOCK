// Augmenta os tipos da sessão do nuxt-auth-utils.
// https://github.com/atinux/nuxt-auth-utils#typescript
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
  }

  interface UserSession {
    user: User
    loggedInAt: string
  }

  interface SecureSessionData {
    // dados sensíveis que nunca devem chegar ao cliente
  }
}

export {}
