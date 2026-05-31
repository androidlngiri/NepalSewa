import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers"

let pipe: FeatureExtractionPipeline | null = null

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (!pipe) {
    pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
  }
  return pipe
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getPipeline()
  const result = await extractor(text, { pooling: "mean", normalize: true })
  return Array.from(result.data)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}
