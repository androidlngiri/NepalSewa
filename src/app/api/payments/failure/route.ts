import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    const { searchParams } = new URL(req.url)
    const encodedData = searchParams.get("data")

    if (encodedData) {
      try {
        const jsonStr = Buffer.from(encodedData, "base64").toString("utf-8")
        const decoded = JSON.parse(jsonStr)
        const { transaction_uuid } = decoded

        if (transaction_uuid) {
          const transaction = await prisma.transaction.findFirst({
            where: { transactionUuid: transaction_uuid },
          })

          if (transaction && transaction.userId === session.user.id) {
            await prisma.transaction.updateMany({
              where: { transactionUuid: transaction_uuid, status: "PENDING" },
              data: { status: "FAILED" },
            })
          }
        }
      } catch {
      }
    }

    return NextResponse.redirect(new URL("/dashboard/user?payment=failed", req.url))
  } catch {
    return NextResponse.redirect(new URL("/dashboard/user?payment=error", req.url))
  }
}
