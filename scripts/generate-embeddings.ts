import { prisma } from "../src/lib/prisma"
import { generateEmbedding } from "../src/lib/embedding"

async function main() {
  console.log("Fetching all active services...")
  const services = await prisma.service.findMany({ where: { isActive: true } })
  console.log(`Found ${services.length} services`)

  for (const service of services) {
    const text = `${service.name} — ${service.description || ""} — ${service.price || ""} ${service.priceUnit || ""}`
    console.log(`Generating embedding for: ${service.name}`)
    const embedding = await generateEmbedding(text)
    const embeddingStr = `[${embedding.join(",")}]`

    await prisma.$executeRawUnsafe(
      `UPDATE services SET embedding = $1::vector WHERE id = $2`,
      embeddingStr,
      service.id
    )
    console.log(`  ✓ ${service.name}`)
  }

  console.log("Done!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
