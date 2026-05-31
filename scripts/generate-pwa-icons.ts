import sharp from "sharp"
import { join } from "node:path"

async function main() {
  const svgPath = join(__dirname, "..", "public", "icon.svg")
  const sizes = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-icon.png", size: 180 },
  ]

  for (const { name, size } of sizes) {
    const outPath = join(__dirname, "..", "public", name)
    await sharp(svgPath).resize(size, size).png().toFile(outPath)
    console.log(`Created ${name} (${size}x${size})`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
