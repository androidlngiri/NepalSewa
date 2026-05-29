import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { config } from "dotenv"
config({ path: ".env" })

const url = new URL(process.env.DATABASE_URL!)
const pool = new Pool({
  host: url.hostname,
  port: Number(url.port),
  database: url.pathname.replace(/^\//, ""),
  user: url.username,
  password: decodeURIComponent(url.password),
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  const adminPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@nepalsewa.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nepalsewa.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  })
  console.log("Admin user created:", admin.email)

  const categories = [
    {
      name: "Plumbing",
      slug: "plumbing",
      description: "Pipe repair, faucet installation, water tank cleaning, and more",
      icon: "Wrench",
      sortOrder: 1,
      services: [
        { name: "Pipe Repair", slug: "pipe-repair", description: "Fix leaking or burst pipes", price: 500 },
        { name: "Faucet Installation", slug: "faucet-installation", description: "Install new faucets and fixtures", price: 800 },
        { name: "Water Tank Cleaning", slug: "water-tank-cleaning", description: "Clean and maintain water tanks", price: 1500 },
        { name: "Toilet Repair", slug: "toilet-repair", description: "Fix toilet leaks and clogs", price: 600 },
        { name: "Drain Cleaning", slug: "drain-cleaning", description: "Unclog drains and pipes", price: 500 },
      ],
    },
    {
      name: "Electrical",
      slug: "electrical",
      description: "Wiring, switchboard repair, fan installation, and electrical work",
      icon: "Zap",
      sortOrder: 2,
      services: [
        { name: "Wiring", slug: "wiring", description: "House wiring and rewiring", price: 1000 },
        { name: "Switchboard Repair", slug: "switchboard-repair", description: "Fix switches and boards", price: 400 },
        { name: "Fan Installation", slug: "fan-installation", description: "Install ceiling and exhaust fans", price: 500 },
        { name: "Light Fitting", slug: "light-fitting", description: "Install lights and fixtures", price: 300 },
        { name: "UPS/Inverter Setup", slug: "ups-inverter-setup", description: "Install and configure power backup", price: 2000 },
      ],
    },
    {
      name: "Painting",
      slug: "painting",
      description: "Interior and exterior painting, texture finishes",
      icon: "PaintBucket",
      sortOrder: 3,
      services: [
        { name: "Interior Painting", slug: "interior-painting", description: "Paint interior walls and ceilings", price: 1000 },
        { name: "Exterior Painting", slug: "exterior-painting", description: "Paint exterior walls", price: 1200 },
        { name: "Texture Finish", slug: "texture-finish", description: "Decorative wall textures", price: 1500 },
        { name: "Wood Polishing", slug: "wood-polishing", description: "Polish wooden furniture and doors", price: 800 },
      ],
    },
    {
      name: "Cleaning",
      slug: "cleaning",
      description: "Deep cleaning, office cleaning, carpet wash",
      icon: "Home",
      sortOrder: 4,
      services: [
        { name: "Deep Cleaning", slug: "deep-cleaning", description: "Full home deep cleaning", price: 2000 },
        { name: "Office Cleaning", slug: "office-cleaning", description: "Clean office spaces", price: 1500 },
        { name: "Carpet Wash", slug: "carpet-wash", description: "Wash and shampoo carpets", price: 500 },
        { name: "Sofa Cleaning", slug: "sofa-cleaning", description: "Clean sofas and upholstery", price: 800 },
      ],
    },
    {
      name: "Moving & Delivery",
      slug: "moving-delivery",
      description: "House shifting, parcel delivery, cargo transport",
      icon: "Truck",
      sortOrder: 5,
      services: [
        { name: "House Shifting", slug: "house-shifting", description: "Full home moving service", price: 5000 },
        { name: "Parcel Delivery", slug: "parcel-delivery", description: "Deliver parcels within Butwal", price: 200 },
        { name: "Cargo Transport", slug: "cargo-transport", description: "Transport goods and materials", price: 3000 },
        { name: "Vehicle Shifting", slug: "vehicle-shifting", description: "Move vehicles and bikes", price: 2000 },
      ],
    },
    {
      name: "Tech Support",
      slug: "tech-support",
      description: "Computer repair, web design, IT solutions",
      icon: "Code",
      sortOrder: 6,
      services: [
        { name: "Computer Repair", slug: "computer-repair", description: "Fix desktop and laptop issues", price: 500 },
        { name: "Web Design", slug: "web-design", description: "Create and design websites", price: 3000 },
        { name: "Network Setup", slug: "network-setup", description: "Set up home/office networks", price: 1000 },
        { name: "Printer Repair", slug: "printer-repair", description: "Fix printer issues", price: 400 },
      ],
    },
    {
      name: "Tutoring",
      slug: "tutoring",
      description: "Home tutoring, exam prep, skill classes",
      icon: "GraduationCap",
      sortOrder: 7,
      services: [
        { name: "Math Tutoring", slug: "math-tutoring", description: "Math lessons for all grades", price: 300 },
        { name: "Science Tutoring", slug: "science-tutoring", description: "Physics, chemistry, biology", price: 300 },
        { name: "English Tutoring", slug: "english-tutoring", description: "English language and literature", price: 300 },
        { name: "Computer Classes", slug: "computer-classes", description: "Basic to advanced computer skills", price: 500 },
      ],
    },
    {
      name: "Salon & Spa",
      slug: "salon-spa",
      description: "Haircut, massage, beauty services at home",
      icon: "Scissors",
      sortOrder: 8,
      services: [
        { name: "Haircut", slug: "haircut", description: "Men's and women's haircut at home", price: 300 },
        { name: "Massage", slug: "massage", description: "Full body massage therapy", price: 1000 },
        { name: "Facial", slug: "facial", description: "Facial cleaning and treatment", price: 500 },
        { name: "Manicure/Pedicure", slug: "manicure-pedicure", description: "Nail care services", price: 400 },
      ],
    },
  ]

  for (const catData of categories) {
    const { services, ...categoryFields } = catData

    const category = await prisma.category.upsert({
      where: { slug: categoryFields.slug },
      update: {},
      create: categoryFields,
    })

    for (const svc of services) {
      await prisma.service.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: svc.slug } },
        update: {},
        create: {
          ...svc,
          categoryId: category.id,
          priceUnit: "per hour",
        },
      })
    }

    console.log(`Category "${category.name}" created with ${services.length} services`)
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
