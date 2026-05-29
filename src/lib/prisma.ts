import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const url = new URL(process.env.DATABASE_URL!)
  const pool = new Pool({
    host: url.hostname,
    port: Number(url.port),
    database: url.pathname.replace(/^\//, ""),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  },
})
