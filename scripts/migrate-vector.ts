import { Pool } from "pg"

async function main() {
  const url = new URL(process.env.DATABASE_URL!)
  const pool = new Pool({
    host: url.hostname,
    port: Number(url.port),
    database: url.pathname.replace(/^\//, ""),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  })

  // Drop old 768d column first if it exists (from previous attempt)
  await pool.query(`ALTER TABLE services DROP COLUMN IF EXISTS embedding`)
  await pool.query(`DROP INDEX IF EXISTS services_embedding_idx`)

  const queries = [
    `CREATE EXTENSION IF NOT EXISTS vector`,
    `ALTER TABLE services ADD COLUMN embedding vector(384)`,
    `CREATE INDEX services_embedding_idx ON services USING hnsw (embedding vector_cosine_ops)`,
    `ALTER TABLE services DROP COLUMN IF EXISTS search_vector`,
    `ALTER TABLE services ADD COLUMN search_vector tsvector
     GENERATED ALWAYS AS (
       to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
     ) STORED`,
    `CREATE INDEX IF NOT EXISTS services_search_idx ON services USING GIN (search_vector)`,
  ]

  for (const q of queries) {
    console.log(`Running: ${q.substring(0, 90)}...`)
    await pool.query(q)
    console.log("  ok")
  }

  console.log("Vector migration complete!")
  await pool.end()
}

main().catch((e) => {
  console.error("Migration failed:", e.message)
  process.exit(1)
})
