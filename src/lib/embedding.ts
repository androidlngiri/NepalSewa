import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
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
