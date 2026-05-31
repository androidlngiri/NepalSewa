import sharp from "sharp"
import { join } from "node:path"

async function main() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="50%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="200" cy="200" r="250" fill="rgba(255,255,255,0.03)"/>
  <circle cx="1000" cy="500" r="300" fill="rgba(255,255,255,0.02)"/>

  <g transform="translate(80,190)">
    <rect x="0" y="0" width="80" height="80" rx="20" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <g transform="translate(12,12)" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="28" cy="50" r="8"/>
      <circle cx="48" cy="50" r="8"/>
      <path d="M20 50v-24c0-5.5 4.5-10 10-10h16c5.5 0 10 4.5 10 10v24"/>
      <path d="M28 24h20"/>
      <path d="M28 32h20"/>
      <path d="M28 40h12"/>
    </g>
  </g>

  <text x="180" y="230" font-family="system-ui, sans-serif" font-size="56" font-weight="800" fill="white">NepalSewa</text>
  <text x="180" y="280" font-family="system-ui, sans-serif" font-size="28" fill="rgba(255,255,255,0.7)">Butwal's Trusted Service Marketplace</text>

  <text x="80" y="380" font-family="system-ui, sans-serif" font-size="22" fill="rgba(255,255,255,0.5)">
    <tspan x="80" dy="0">Post a task  •  Get quotes from local taskers</tspan>
    <tspan x="80" dy="32">Compare prices  •  Pick the best  •  Pay when satisfied</tspan>
  </text>

  <rect x="80" y="490" width="180" height="44" rx="22" fill="rgba(255,255,255,0.9)"/>
  <text x="170" y="519" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#059669" text-anchor="middle">Get Started</text>

  <text x="80" y="580" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.3)">nepal-sewa.vercel.app</text>
</svg>`

  const outPath = join(__dirname, "..", "public", "og-image.png")
  await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile(outPath)
  console.log("Created og-image.png (1200x630)")
}

main().catch((e) => { console.error(e); process.exit(1) })
