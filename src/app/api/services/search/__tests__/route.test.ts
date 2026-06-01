import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: { category: { findMany: mockFindMany } },
}))

vi.mock("@/lib/embedding", () => ({
  generateEmbedding: vi.fn().mockRejectedValue(new Error("No vector extension")),
}))

import { GET } from "../route"

function createSearchUrl(params: Record<string, string>) {
  const url = new URL("http://localhost/api/services/search")
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString())
}

const mockCategories = [
  {
    id: "cat-1",
    name: "Home Services",
    slug: "home-services",
    services: [
      {
        id: "s-1",
        name: "Plumbing",
        slug: "plumbing",
        description: "Fix pipes",
        price: 500,
        priceUnit: "per hour",
        image: null,
      },
    ],
  },
  {
    id: "cat-2",
    name: "Electronics",
    slug: "electronics",
    services: [
      {
        id: "s-2",
        name: "TV Repair",
        slug: "tv-repair",
        description: "Repair TVs",
        price: 800,
        priceUnit: "per visit",
        image: null,
      },
    ],
  },
]

describe("GET /api/services/search", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns all active categories when no query is provided", async () => {
    mockFindMany.mockResolvedValue(mockCategories)

    const req = createSearchUrl({})
    const res = await GET(req as any)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual(mockCategories)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            priceUnit: true,
            image: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  })

  it("returns filtered categories using LIKE fallback when q is provided", async () => {
    mockFindMany.mockResolvedValue([mockCategories[0]])

    const req = createSearchUrl({ q: "plumbing" })
    const res = await GET(req as any)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual([mockCategories[0]])
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        services: {
          where: {
            isActive: true,
            OR: [
              { name: { contains: "plumbing", mode: "insensitive" } },
              { description: { contains: "plumbing", mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            priceUnit: true,
            image: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  })

  it("respects category filter with query", async () => {
    mockFindMany.mockResolvedValue([mockCategories[0]])

    const req = createSearchUrl({ q: "plumbing", category: "home-services" })
    const res = await GET(req as any)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual([mockCategories[0]])
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isActive: true, slug: "home-services" },
      include: {
        services: {
          where: {
            isActive: true,
            OR: [
              { name: { contains: "plumbing", mode: "insensitive" } },
              { description: { contains: "plumbing", mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            priceUnit: true,
            image: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  })

  it("respects category filter without query", async () => {
    mockFindMany.mockResolvedValue([mockCategories[0]])

    const req = createSearchUrl({ category: "home-services" })
    const res = await GET(req as any)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isActive: true, slug: "home-services" },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            priceUnit: true,
            image: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  })

  it("returns 500 on error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"))

    const req = createSearchUrl({})
    const res = await GET(req as any)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data).toEqual({ error: "Search failed" })
  })
})
