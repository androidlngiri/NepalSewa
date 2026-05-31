import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    const categorySlug = searchParams.get("category")?.trim()
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50)

    if (!q) {
      const categories = await prisma.category.findMany({
        where: { isActive: true, ...(categorySlug ? { slug: categorySlug } : {}) },
        include: {
          services: {
            where: { isActive: true },
            select: { id: true, name: true, slug: true, description: true, price: true, priceUnit: true, image: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      })
      return NextResponse.json(categories)
    }

    // Try hybrid search (vector + full-text). Falls back to basic text search if vector fails.
    try {
      const { generateEmbedding } = await import("@/lib/embedding")
      const queryEmbedding = await generateEmbedding(q)
      const embeddingStr = `[${queryEmbedding.join(",")}]`

      const results: any[] = await prisma.$queryRawUnsafe(
        `
          SELECT
            s.id, s.name, s.slug, s.description, s.price, s."priceUnit", s.image,
            c.id as "categoryId", c.name as "categoryName", c.slug as "categorySlug",
            1 - (s.embedding <=> $1::vector) AS vector_similarity,
            ts_rank(s.search_vector, plainto_tsquery('english', $2)) AS text_rank
          FROM services s
          JOIN categories c ON c.id = s."categoryId"
          WHERE s."isActive" = true
            AND ($3::text IS NULL OR c.slug = $3::text)
            AND (s.embedding IS NOT NULL OR s.search_vector IS NOT NULL)
          ORDER BY
            (CASE WHEN s.embedding IS NOT NULL THEN 1 - (s.embedding <=> $1::vector) ELSE 0 END) * 0.7 +
            (CASE WHEN s.search_vector IS NOT NULL THEN ts_rank(s.search_vector, plainto_tsquery('english', $2)) ELSE 0 END) * 0.3
          DESC
          LIMIT $4
        `,
        embeddingStr,
        q,
        categorySlug || null,
        limit
      )

      const grouped = new Map<string, any>()
      for (const r of results) {
        const key = r.categorySlug
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: r.categoryId,
            name: r.categoryName,
            slug: r.categorySlug,
            services: [],
          })
        }
        grouped.get(key)!.services.push({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          price: r.price,
          priceUnit: r.priceUnit,
          image: r.image,
          score: Math.round(((r.vector_similarity || 0) * 0.7 + (r.text_rank || 0) * 0.3) * 100) / 100,
        })
      }

      return NextResponse.json(Array.from(grouped.values()))
    } catch {
      const categories = await prisma.category.findMany({
        where: { isActive: true, ...(categorySlug ? { slug: categorySlug } : {}) },
        include: {
          services: {
            where: {
              isActive: true,
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, slug: true, description: true, price: true, priceUnit: true, image: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      })
      return NextResponse.json(categories)
    }
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
