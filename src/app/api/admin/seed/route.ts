import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hash = await bcrypt.hash("password123", 12)

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

    const plumbingServices = await prisma.service.findMany({
      where: { category: { slug: "plumbing" } },
    })
    const cleaningServices = await prisma.service.findMany({
      where: { category: { slug: "cleaning" } },
    })
    const paintingServices = await prisma.service.findMany({
      where: { category: { slug: "painting" } },
    })
    const movingService = await prisma.service.findFirst({ where: { slug: "house-shifting" } })

    if (!plumbingServices.length || !cleaningServices.length || !paintingServices.length || !movingService) {
      return NextResponse.json({ error: "Services not seeded yet. Run prisma seed first." }, { status: 400 })
    }

    const req1 = await prisma.request.upsert({
      where: { id: "seed-req-1" },
      update: {},
      create: {
        id: "seed-req-1",
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

    const req2 = await prisma.request.upsert({
      where: { id: "seed-req-2" },
      update: {},
      create: {
        id: "seed-req-2",
        userId: customer2.id,
        serviceId: cleaningServices[0].id,
        title: "Full home deep cleaning before Tihar",
        description: "Need a thorough deep cleaning of my 2-floor home before the festival.",
        location: "Golpark, Ward 7",
        wardNo: 7,
        budget: 3000,
        urgency: "normal",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    })

    const req3 = await prisma.request.upsert({
      where: { id: "seed-req-3" },
      update: {},
      create: {
        id: "seed-req-3",
        userId: customer1.id,
        serviceId: paintingServices[0].id,
        title: "Living room painting needed",
        description: "Want to paint my living room, approx 12x15 ft. Need both walls and ceiling done.",
        location: "Milijuli, Ward 3",
        wardNo: 3,
        budget: 3000,
        urgency: "normal",
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    })

    const req4 = await prisma.request.upsert({
      where: { id: "seed-req-4" },
      update: {},
      create: {
        id: "seed-req-4",
        userId: customer2.id,
        serviceId: movingService.id,
        title: "Need help assembling new furniture",
        description: "Bought a new bed and wardrobe. Need someone to assemble them at home.",
        location: "Golpark, Ward 7",
        wardNo: 7,
        budget: 1500,
        urgency: "low",
        status: "OPEN",
        createdAt: new Date(),
      },
    })

    const bid1 = await prisma.bid.upsert({
      where: { requestId_taskerId: { requestId: req1.id, taskerId: tasker1.id } },
      update: {},
      create: {
        requestId: req1.id, taskerId: tasker1.id, amount: 800,
        message: "I can fix this today. Licensed plumber with 10 years experience.",
        status: "ACCEPTED",
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.bid.upsert({
      where: { requestId_taskerId: { requestId: req2.id, taskerId: tasker2.id } },
      update: {},
      create: {
        requestId: req2.id, taskerId: tasker2.id, amount: 2500,
        message: "I specialize in deep cleaning. Eco-friendly supplies used.",
        status: "ACCEPTED",
        createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.bid.upsert({
      where: { requestId_taskerId: { requestId: req3.id, taskerId: tasker1.id } },
      update: {},
      create: {
        requestId: req3.id, taskerId: tasker1.id, amount: 2500,
        message: "Experienced painter. Can start tomorrow.",
        status: "ACCEPTED",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.bid.upsert({
      where: { requestId_taskerId: { requestId: req4.id, taskerId: tasker1.id } },
      update: {},
      create: {
        requestId: req4.id, taskerId: tasker1.id, amount: 1200,
        message: "Can assemble both in 3-4 hours.",
        status: "PENDING",
      },
    })

    await prisma.bid.upsert({
      where: { requestId_taskerId: { requestId: req4.id, taskerId: tasker2.id } },
      update: {},
      create: {
        requestId: req4.id, taskerId: tasker2.id, amount: 1000,
        message: "Available this weekend to help!",
        status: "PENDING",
      },
    })

    await prisma.taskerAssignment.upsert({
      where: { taskerId_requestId: { taskerId: tasker1.id, requestId: req1.id } },
      update: {},
      create: {
        taskerId: tasker1.id, requestId: req1.id, status: "COMPLETED",
        createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.taskerAssignment.upsert({
      where: { taskerId_requestId: { taskerId: tasker2.id, requestId: req2.id } },
      update: {},
      create: {
        taskerId: tasker2.id, requestId: req2.id, status: "COMPLETED",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.taskerAssignment.upsert({
      where: { taskerId_requestId: { taskerId: tasker1.id, requestId: req3.id } },
      update: {},
      create: {
        taskerId: tasker1.id, requestId: req3.id, status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    })

    const reviewRate = 0.03
    await prisma.review.upsert({
      where: { reviewerId_revieweeId_requestId: { reviewerId: customer1.id, revieweeId: tasker1.id, requestId: req1.id } },
      update: {},
      create: {
        reviewerId: customer1.id, revieweeId: tasker1.id, requestId: req1.id, rating: 5,
        comment: "Excellent work! Fixed my pipe within an hour. Very professional.",
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.review.upsert({
      where: { reviewerId_revieweeId_requestId: { reviewerId: customer2.id, revieweeId: tasker2.id, requestId: req2.id } },
      update: {},
      create: {
        reviewerId: customer2.id, revieweeId: tasker2.id, requestId: req2.id, rating: 5,
        comment: "Amazing cleaning job! Everything sparkles.",
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      },
    })

    const t1 = await prisma.transaction.create({
      data: {
        id: "seed-tx-1",
        userId: customer1.id, amount: 800, type: "cash", status: "COMPLETED",
        requestId: req1.id, description: "Cash payment for pipe repair",
        commission: Math.round(800 * reviewRate * 100) / 100, commissionRate: reviewRate,
        taskerId: tasker1.id,
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.transaction.create({
      data: {
        id: "seed-tx-2",
        userId: customer2.id, amount: 2500, type: "cash", status: "COMPLETED",
        requestId: req2.id, description: "Cash payment for deep cleaning",
        commission: Math.round(2500 * 0.05 * 100) / 100, commissionRate: 0.05,
        taskerId: tasker2.id,
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      },
    })

    const existingTestimonials = await prisma.testimonial.count()
    if (existingTestimonials === 0) {
      await prisma.testimonial.createMany({
        data: [
          { name: "Rajesh Sharma", location: "Ward 3, Butwal", role: "Homeowner", content: "My sink was leaking at midnight. Found a plumber on NepalSewa in 10 minutes. He came within an hour and fixed it perfectly. This service is a lifesaver!", rating: 5, sortOrder: 1 },
          { name: "Sita Poudel", location: "Ward 7, Butwal", role: "Homemaker", content: "I needed my house painted before Tihar. Got 3 bids within hours, chose the best one. The painter did an amazing job at half the price quoted by others.", rating: 5, sortOrder: 2 },
          { name: "Anil KC", location: "Ward 11, Butwal", role: "Business Owner", content: "We use NepalSewa for office cleaning and IT support. Reliable, professional, and affordable.", rating: 5, sortOrder: 3 },
          { name: "Mina Thapa", location: "Ward 5, Butwal", role: "Teacher", content: "Found a great math tutor for my son through NepalSewa. His grades have improved significantly.", rating: 4, sortOrder: 4 },
        ],
      })
    }

    await prisma.user.update({ where: { id: tasker1.id }, data: { rating: 5.0 } })
    await prisma.user.update({ where: { id: tasker2.id }, data: { rating: 5.0 } })

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully. Login: ram@example.com / sita@example.com (password: password123), Taskers: hari@example.com / gita@example.com",
    })
  } catch (error) {
    console.error("Seed API error:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
