import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const encodedData = searchParams.get("data")

    if (encodedData) {
      try {
        const jsonStr = Buffer.from(encodedData, "base64").toString("utf-8")
        const decoded = JSON.parse(jsonStr)

        if (decoded.transaction_uuid) {
          await prisma.transaction.updateMany({
            where: { transactionUuid: decoded.transaction_uuid, status: "PENDING" },
            data: { status: "FAILED" },
          })
        }
      } catch {
        // Ignore decode errors
      }
    }

    return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
  } catch {
    return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
  }
}
