import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed" },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const bytes = await file.arrayBuffer()

    const admin = getAdminClient()
    const { data, error } = await admin.storage
      .from("nepalsewa-uploads")
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      // console.error("Supabase upload error:", error)
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

    const { data: urlData } = admin.storage
      .from("nepalsewa-uploads")
      .getPublicUrl(filename)

    const url = urlData.publicUrl

    return NextResponse.json({ url, filename })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
