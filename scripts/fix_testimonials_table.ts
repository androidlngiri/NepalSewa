import { config } from "dotenv"
config({ path: ".env" })

import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS testimonials`)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      role TEXT,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      "avatarUrl" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log("Testimonials table recreated with correct column names")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
