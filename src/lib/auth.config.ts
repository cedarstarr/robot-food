import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    jwt({ token }) {
      return token
    },
    session({ session, token }) {
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
  providers: [],
} satisfies NextAuthConfig
