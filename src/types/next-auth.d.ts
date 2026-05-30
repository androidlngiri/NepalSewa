import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    isTasker?: boolean
  }
  interface Session {
    user: {
      id: string
      role: string
      isTasker: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    isTasker?: boolean
  }
}
