import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const requestId = searchParams.get("requestId")
  const after = searchParams.get("after")

  if (!requestId) {
    return NextResponse.json({ error: "requestId is required" }, { status: 400 })
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      userId: true,
      taskerAssignments: { select: { taskerId: true } },
    },
  })

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  const bidderIds = (
    await prisma.bid.findMany({
      where: { requestId },
      select: { taskerId: true },
    })
  ).map((b) => b.taskerId)

  const taskerIds = request.taskerAssignments.map((a: any) => a.taskerId)
  const participantIds = new Set([request.userId, ...taskerIds, ...bidderIds])

  if (!participantIds.has(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let lastId = after || null

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      let pollTimer: ReturnType<typeof setInterval> | null = null

      async function poll() {
        if (closed) return

        try {
          const where: any = { requestId }
          if (lastId) {
            where.id = { gt: lastId }
          }

          const newMessages = await prisma.message.findMany({
            where,
            include: {
              sender: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
            take: 20,
          })

          if (newMessages.length > 0) {
            const data = JSON.stringify(newMessages)
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            lastId = newMessages[newMessages.length - 1].id
          }

          // send keepalive
          controller.enqueue(new TextEncoder().encode(": keepalive\n\n"))
        } catch {
          if (!closed) {
            controller.enqueue(new TextEncoder().encode("event: error\ndata: {}\n\n"))
          }
        }
      }

      // initial poll
      poll()

      pollTimer = setInterval(poll, 2000)

      const timeout = setTimeout(() => {
        if (!closed) {
          closed = true
          clearInterval(pollTimer!)
          controller.close()
        }
      }, 55000)

      req.signal.addEventListener("abort", () => {
        closed = true
        clearInterval(pollTimer!)
        clearTimeout(timeout)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
