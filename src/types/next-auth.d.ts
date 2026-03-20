import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      emailVerified: Date | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin?: boolean
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    emailVerified?: Date | null
    iat?: number
    sessionsRevokedAt?: Date | null
  }
}
