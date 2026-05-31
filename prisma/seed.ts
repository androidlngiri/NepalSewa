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

  const hash = await bcrypt.hash("password123", 12)
  const adminHash = await bcrypt.hash("admin123", 12)

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@nepalsewa.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nepalsewa.com",
      passwordHash: adminHash,
      role: "ADMIN",
      isActive: true,
    },
  })
  console.log("Admin:", admin.email)

  // --- Sample Customers ---
  const customer1 = await prisma.user.upsert({
    where: { email: "ram@example.com" },
    update: {},
    create: {
      name: "Ram Bahadur",
      email: "ram@example.com",
      passwordHash: hash,
      role: "USER",
      isActive: true,
      wardNo: 3,
      address: "Milijuli, Butwal",
      phone: "9800000001",
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: "sita@example.com" },
    update: {},
    create: {
      name: "Sita Devi",
      email: "sita@example.com",
      passwordHash: hash,
      role: "USER",
      isActive: true,
      wardNo: 7,
      address: "Golpark, Butwal",
      phone: "9800000002",
    },
  })
  console.log("Customers created:", customer1.email, customer2.email)

  // --- Sample Taskers ---
  const tasker1 = await prisma.user.upsert({
    where: { email: "hari@example.com" },
    update: {},
    create: {
      name: "Hari Prasad",
      email: "hari@example.com",
      passwordHash: hash,
      role: "TASKER",
      isTasker: true,
      isActive: true,
      wardNo: 5,
      address: "Suryapura, Butwal",
      phone: "9800000003",
      bio: "Experienced plumber with 10 years in Butwal",
      tier: "PRO",
      proExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const tasker2 = await prisma.user.upsert({
    where: { email: "gita@example.com" },
    update: {},
    create: {
      name: "Gita Tamang",
      email: "gita@example.com",
      passwordHash: hash,
      role: "TASKER",
      isTasker: true,
      isActive: true,
      wardNo: 2,
      address: "Jitgadhi, Butwal",
      phone: "9800000004",
      bio: "Professional cleaner and home organizer",
      tier: "STANDARD",
    },
  })
  console.log("Taskers created:", tasker1.email, tasker2.email)

  // --- Categories & Services ---
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

  const categoryMap = new Map<string, string>()
  const serviceMap = new Map<string, string>()

  for (const catData of categories) {
    const { services, ...categoryFields } = catData
    const category = await prisma.category.upsert({
      where: { slug: categoryFields.slug },
      update: {},
      create: categoryFields,
    })
    categoryMap.set(category.slug, category.id)

    for (const svc of services) {
      const service = await prisma.service.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: svc.slug } },
        update: {},
        create: { ...svc, categoryId: category.id, priceUnit: "per hour" },
      })
      serviceMap.set(svc.slug, service.id)
    }
    console.log(`Category "${category.name}" ready`)
  }

  const plumbingServices = await prisma.service.findMany({
    where: { category: { slug: "plumbing" } },
  })
  const cleaningServices = await prisma.service.findMany({
    where: { category: { slug: "cleaning" } },
  })
  const paintingServices = await prisma.service.findMany({
    where: { category: { slug: "painting" } },
  })

  // --- Sample Requests ---

  // COMPLETED request: Ram's pipe repair
  const req1 = await prisma.request.create({
    data: {
      userId: customer1.id,
      serviceId: plumbingServices[0].id,
      title: "Leaking kitchen pipe needs repair",
      description: "The pipe under my kitchen sink has been leaking for 2 days. Need someone to fix it urgently.",
      location: "Milijuli, Ward 3",
      wardNo: 3,
      budget: 1000,
      urgency: "urgent",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
  })

  // COMPLETED request: Sita's deep cleaning
  const req2 = await prisma.request.create({
    data: {
      userId: customer2.id,
      serviceId: cleaningServices[0].id,
      title: "Full home deep cleaning before Tihar",
      description: "Need a thorough deep cleaning of my 2-floor home before the festival. 3 bedrooms, 2 bathrooms, kitchen, and living room.",
      location: "Golpark, Ward 7",
      wardNo: 7,
      budget: 3000,
      urgency: "normal",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  })

  // IN_PROGRESS request: Ram's painting
  const req3 = await prisma.request.create({
    data: {
      userId: customer1.id,
      serviceId: paintingServices[0].id,
      title: "Living room painting needed",
      description: "Want to paint my living room (approx 12x15 ft). Need both walls and ceiling done. I have the paint, just need labor.",
      location: "Milijuli, Ward 3",
      wardNo: 3,
      budget: 3000,
      urgency: "normal",
      status: "IN_PROGRESS",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // OPEN request: Sita's furniture assembly
  const req4 = await prisma.request.create({
    data: {
      userId: customer2.id,
      serviceId: (
        await prisma.service.findFirst({ where: { slug: "house-shifting" } })
      )!.id,
      title: "Need help assembling new furniture",
      description: "Bought a new bed and wardrobe from a furniture shop. Need someone to assemble them at home. I have all the parts and tools.",
      location: "Golpark, Ward 7",
      wardNo: 7,
      budget: 1500,
      urgency: "low",
      status: "OPEN",
      createdAt: new Date(),
    },
  })
  console.log("Sample requests created")

  // --- Sample Bids ---
  const bid1 = await prisma.bid.create({
    data: {
      requestId: req1.id,
      taskerId: tasker1.id,
      amount: 800,
      message: "I can fix this today. I'm a licensed plumber with 10 years experience. I have all necessary tools.",
      status: "ACCEPTED",
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    },
  })

  const bid2 = await prisma.bid.create({
    data: {
      requestId: req2.id,
      taskerId: tasker2.id,
      amount: 2500,
      message: "I specialize in deep cleaning. Will bring my own eco-friendly cleaning supplies. Satisfaction guaranteed!",
      status: "ACCEPTED",
      createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    },
  })

  const bid3 = await prisma.bid.create({
    data: {
      requestId: req3.id,
      taskerId: tasker1.id,
      amount: 2500,
      message: "Experienced painter. Can start tomorrow and finish in 2 days.",
      status: "ACCEPTED",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  })

  const bid4 = await prisma.bid.create({
    data: {
      requestId: req4.id,
      taskerId: tasker1.id,
      amount: 1200,
      message: "I can assemble both pieces in about 3-4 hours. Have done many furniture assemblies before.",
      status: "PENDING",
    },
  })

  const bid5 = await prisma.bid.create({
    data: {
      requestId: req4.id,
      taskerId: tasker2.id,
      amount: 1000,
      message: "Happy to help with assembly! I'm available this weekend.",
      status: "PENDING",
    },
  })
  console.log("Sample bids created")

  // --- Sample Assignments ---
  const assign1 = await prisma.taskerAssignment.create({
    data: {
      taskerId: tasker1.id,
      requestId: req1.id,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
    },
  })

  const assign2 = await prisma.taskerAssignment.create({
    data: {
      taskerId: tasker2.id,
      requestId: req2.id,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.taskerAssignment.create({
    data: {
      taskerId: tasker1.id,
      requestId: req3.id,
      status: "IN_PROGRESS",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })
  console.log("Sample assignments created")

  // --- Sample Reviews ---
  const reviewRate = tasker1.tier === "PRO" ? 0.03 : 0.05

  await prisma.review.upsert({
    where: {
      reviewerId_revieweeId_requestId: {
        reviewerId: customer1.id,
        revieweeId: tasker1.id,
        requestId: req1.id,
      },
    },
    update: {},
    create: {
      reviewerId: customer1.id,
      revieweeId: tasker1.id,
      requestId: req1.id,
      rating: 5,
      comment: "Excellent work! Hari fixed my pipe within an hour and even checked other pipes for potential issues. Very professional.",
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.review.upsert({
    where: {
      reviewerId_revieweeId_requestId: {
        reviewerId: customer2.id,
        revieweeId: tasker2.id,
        requestId: req2.id,
      },
    },
    update: {},
    create: {
      reviewerId: customer2.id,
      revieweeId: tasker2.id,
      requestId: req2.id,
      rating: 5,
      comment: "Gita did an amazing job cleaning my home. Everything sparkles! Highly recommend.",
      createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    },
  })

  const taskerRating1 = await prisma.review.aggregate({
    where: { revieweeId: tasker1.id },
    _avg: { rating: true },
  })
  if (taskerRating1._avg.rating) {
    await prisma.user.update({
      where: { id: tasker1.id },
      data: { rating: Math.round(taskerRating1._avg.rating * 10) / 10 },
    })
  }

  const taskerRating2 = await prisma.review.aggregate({
    where: { revieweeId: tasker2.id },
    _avg: { rating: true },
  })
  if (taskerRating2._avg.rating) {
    await prisma.user.update({
      where: { id: tasker2.id },
      data: { rating: Math.round(taskerRating2._avg.rating * 10) / 10 },
    })
  }
  console.log("Sample reviews created")

  // --- Sample Transactions (with commission) ---
  const commission1 = Math.round(800 * reviewRate * 100) / 100
  await prisma.transaction.create({
    data: {
      userId: customer1.id,
      amount: 800,
      type: "cash",
      status: "COMPLETED",
      requestId: req1.id,
      description: "Cash payment for pipe repair",
      commission: commission1,
      commissionRate: reviewRate,
      taskerId: tasker1.id,
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    },
  })

  const commission2 = Math.round(2500 * 0.05 * 100) / 100
  await prisma.transaction.create({
    data: {
      userId: customer2.id,
      amount: 2500,
      type: "cash",
      status: "COMPLETED",
      requestId: req2.id,
      description: "Cash payment for deep cleaning",
      commission: commission2,
      commissionRate: 0.05,
      taskerId: tasker2.id,
      createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    },
  })
  console.log("Sample transactions created")

  // --- Sample Messages ---
  await prisma.message.createMany({
    data: [
      {
        senderId: customer1.id,
        receiverId: tasker1.id,
        requestId: req1.id,
        content: "Hi Hari, when can you come to fix the pipe?",
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      },
      {
        senderId: tasker1.id,
        receiverId: customer1.id,
        requestId: req1.id,
        content: "I can come today at 3 PM. Is that okay?",
        createdAt: new Date(Date.now() - 23.9 * 24 * 60 * 60 * 1000),
      },
      {
        senderId: customer1.id,
        receiverId: tasker1.id,
        requestId: req1.id,
        content: "Perfect, see you then!",
        createdAt: new Date(Date.now() - 23.8 * 24 * 60 * 60 * 1000),
      },
    ],
  })
  console.log("Sample messages created")

  // --- Sample Testimonials ---
  const existingTestimonials = await prisma.testimonial.count()
  if (existingTestimonials === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "Rajesh Sharma",
          location: "Ward 3, Butwal",
          role: "Homeowner",
          content:
            "My sink was leaking at midnight. Found a plumber on NepalSewa in 10 minutes. He came within an hour and fixed it perfectly. This service is a lifesaver!",
          rating: 5,
          sortOrder: 1,
        },
        {
          name: "Sita Poudel",
          location: "Ward 7, Butwal",
          role: "Homemaker",
          content:
            "I needed my house painted before Tihar. Got 3 bids within hours, chose the best one. The painter did an amazing job at half the price quoted by others.",
          rating: 5,
          sortOrder: 2,
        },
        {
          name: "Anil KC",
          location: "Ward 11, Butwal",
          role: "Business Owner",
          content:
            "We use NepalSewa for office cleaning and IT support. Reliable, professional, and affordable. Highly recommend to all business owners in Butwal.",
          rating: 5,
          sortOrder: 3,
        },
        {
          name: "Mina Thapa",
          location: "Ward 5, Butwal",
          role: "Teacher",
          content:
            "Found a great math tutor for my son through NepalSewa. His grades have improved significantly. The platform is very easy to use.",
          rating: 4,
          sortOrder: 4,
        },
      ],
    })
    console.log("Sample testimonials created")
  } else {
    console.log("Testimonials already exist, skipping")
  }

  console.log("\n✅ Seeding complete!")
  console.log(`  Users: ${await prisma.user.count()}`)
  console.log(`  Categories: ${await prisma.category.count()}`)
  console.log(`  Services: ${await prisma.service.count()}`)
  console.log(`  Requests: ${await prisma.request.count()}`)
  console.log(`  Bids: ${await prisma.bid.count()}`)
  console.log(`  Assignments: ${await prisma.taskerAssignment.count()}`)
  console.log(`  Reviews: ${await prisma.review.count()}`)
  console.log(`  Transactions: ${await prisma.transaction.count()}`)
  console.log(`  Messages: ${await prisma.message.count()}`)
  console.log(`  Testimonials: ${await prisma.testimonial.count()}`)
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
