import '@/lib/env'
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logAuditEvent } from "@/lib/audit"
import { authConfig } from "@/lib/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    signIn: async ({ user }) => {
      void logAuditEvent(user.id ?? null, 'login', null)
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, emailVerified: true, sessionsRevokedAt: true },
        })
        if (dbUser) {
          if (dbUser.sessionsRevokedAt && token.iat &&
              dbUser.sessionsRevokedAt.getTime() > (token.iat as number) * 1000) {
            return { ...token, invalid: true }
          }
          token.isAdmin = dbUser.isAdmin
          token.emailVerified = dbUser.emailVerified
        }
      }

      if (trigger === "update" && session) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isAdmin: true, emailVerified: true, sessionsRevokedAt: true },
        })
        if (dbUser) {
          if (dbUser.sessionsRevokedAt && token.iat &&
              dbUser.sessionsRevokedAt.getTime() > (token.iat as number) * 1000) {
            return { ...token, invalid: true }
          }
          token.isAdmin = dbUser.isAdmin
          token.emailVerified = dbUser.emailVerified
        }
      }

      if (!user && !trigger && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { sessionsRevokedAt: true },
          })
          if (dbUser?.sessionsRevokedAt && token.iat &&
              dbUser.sessionsRevokedAt.getTime() > (token.iat as number) * 1000) {
            return { ...token, invalid: true }
          }
        } catch {
          // DB query may fail in Edge Runtime; skip gracefully
        }
      }

      return token
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).invalid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { ...session, user: undefined as any, expires: new Date(0).toISOString() }
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null
      }
      return session
    },
  },
})
