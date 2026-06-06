import type { TipoUsuario } from '#shared/domain'

declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    tipoUsuario: TipoUsuario | null
  }

  interface UserSession {
    user: User
    loggedInAt: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SecureSessionData {}
}

export {}
