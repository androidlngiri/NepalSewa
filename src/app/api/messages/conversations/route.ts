import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const conversations = await prisma.$queryRaw<any[]>`
      WITH latest AS (
        SELECT DISTINCT ON (m."requestId")
          m."requestId",
          m.content,
          m."createdAt",
          m."senderId"
        FROM messages m
        WHERE m."senderId" = ${userId} OR m."receiverId" = ${userId}
        ORDER BY m."requestId", m."createdAt" DESC
      ),
      unread AS (
        SELECT m."requestId", COUNT(*)::int AS count
        FROM messages m
        WHERE m."receiverId" = ${userId} AND m.read = false
        GROUP BY m."requestId"
      )
      SELECT
        l."requestId",
        r.title AS "requestTitle",
        r.status AS "requestStatus",
        r."userId" AS "requestOwnerId",
        l.content AS "lastContent",
        l."createdAt" AS "lastCreatedAt",
        l."senderId" AS "lastSenderId",
        COALESCE(u.count, 0) AS "unreadCount"
      FROM latest l
      JOIN requests r ON r.id = l."requestId"
      LEFT JOIN unread u ON u."requestId" = l."requestId"
      ORDER BY l."createdAt" DESC
    `

    const otherUserIds = new Set<string>()
    for (const c of conversations) {
      const otherId = c.lastSenderId === userId
        ? (c.requestOwnerId === userId ? null : c.requestOwnerId)
        : c.lastSenderId
      if (otherId && otherId !== userId) otherUserIds.add(otherId)
    }

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(otherUserIds) } },
      select: { id: true, name: true, image: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const result = conversations.map((c) => {
      const otherId = c.lastSenderId === userId ? null : c.lastSenderId
      return {
        requestId: c.requestId,
        requestTitle: c.requestTitle,
        requestStatus: c.requestStatus,
        otherUser: otherId ? userMap.get(otherId) || null : null,
        lastMessage: {
          content: c.lastContent,
          createdAt: c.lastCreatedAt,
          senderId: c.lastSenderId,
        },
        unreadCount: c.unreadCount,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
