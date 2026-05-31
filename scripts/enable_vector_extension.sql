-- Run this in Supabase SQL Editor (or psql) to enable vector search

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE services ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS services_embedding_idx ON services USING hnsw (embedding vector_cosine_ops);

-- Full-text search support
ALTER TABLE services ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS services_search_idx ON services USING GIN (search_vector);
