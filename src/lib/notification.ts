import { prisma } from "@/lib/prisma"

interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  message?: string
  link?: string
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message || null,
        link: input.link || null,
      },
    })
  } catch {
    // silently fail — notifications should never break the main flow
  }
}
