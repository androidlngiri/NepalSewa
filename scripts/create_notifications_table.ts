import { config } from "dotenv"
config({ path: ".env" })
import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      "read" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS notifications_user_id_read_idx ON notifications ("userId", "read")
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx ON notifications ("userId", "createdAt" DESC)
  `)
  console.log("Notifications table created")
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
