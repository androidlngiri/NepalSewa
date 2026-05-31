import { config } from "dotenv"
config({ path: ".env" })

import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      role TEXT,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      avatar_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log("Testimonials table created")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
