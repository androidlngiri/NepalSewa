import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined
        const otp = credentials?.otp as string | undefined

        if (phone && otp) {
          const otpRecord = await prisma.oTPCode.findFirst({
            where: {
              phone,
              code: otp,
              used: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          })

          if (!otpRecord) return null

          await prisma.oTPCode.update({
            where: { id: otpRecord.id },
            data: { used: true },
          })

          let user = await prisma.user.findUnique({ where: { phone } })

          if (!user) {
            user = await prisma.user.create({
              data: {
                phone,
                role: "USER",
                phoneVerified: true,
              },
            })
          } else if (!user.phoneVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { phoneVerified: true },
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        }

        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid || !user.isActive) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        // Fetch isTasker from DB for the token
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isTasker: true },
          })
          token.isTasker = dbUser?.isTasker ?? false
        } catch {
          token.isTasker = false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.isTasker = token.isTasker as boolean
      }
      return session
    },
  },
})
