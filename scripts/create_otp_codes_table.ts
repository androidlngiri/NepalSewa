import { config } from "dotenv"
config({ path: ".env" })
import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS otp_codes_phone_idx ON otp_codes (phone)
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS otp_codes_phone_code_idx ON otp_codes (phone, code)
  `)
  console.log("OTP codes table created")
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
