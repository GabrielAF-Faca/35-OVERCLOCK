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
  }
}

export {}
