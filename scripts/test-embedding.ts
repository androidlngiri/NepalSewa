import "dotenv/config"

async function test() {
  const versions = ["v1", "v1beta"]
  const models = ["models/embedding-001", "models/text-embedding-004"]
  for (const ver of versions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/${model}:embedContent?key=${process.env.GEMINI_API_KEY}`
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, content: { parts: [{ text: "test" }] } }),
        })
        console.log(`${ver}/${model}: ${res.status}`)
        if (res.ok) {
          const data = (await res.json()) as any
          console.log(`  dimensions: ${data.embedding?.values?.length}`)
          return { version: ver, model }
        }
      } catch (e: any) {
        console.log(`${ver}/${model}: ${e.message}`)
      }
    }
  }
  // Fallback: try gemini to generate embedding via chat
  console.log("Trying Gemini for embedding via chat...")
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Generate a 100-dimensional embedding vector for the word 'plumbing service in Butwal Nepal'. Return only the numbers as a JSON array, nothing else." }] }],
        }),
      }
    )
    const data = (await res.json()) as any
    console.log(`Gemini chat: ${res.status}`)
    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "no text"
      console.log(`  response preview: ${text.substring(0, 300)}`)
    } else {
      console.log(`  error: ${JSON.stringify(data).substring(0, 300)}`)
    }
  } catch (e: any) {
    console.log(`gemini: ${e.message}`)
  }
}

test().then(console.log).catch(console.error)
