import type {
  User,
  Category,
  Service as PrismaService,
  Request as PrismaRequest,
  Bid,
  Review,
  Transaction,
  UserRole,
  RequestStatus,
  BidStatus,
  PaymentStatus,
} from "@prisma/client"

export type ServiceRequest = PrismaRequest
export type Service = PrismaService

export type {
  User,
  Category,
  Bid,
  Review,
  Transaction,
  UserRole,
  RequestStatus,
  BidStatus,
  PaymentStatus,
}

export interface DashboardStats {
  totalUsers: number
  totalTaskers: number
  totalRequests: number
  completedJobs: number
  activeListings: number
  totalRevenue: number
  pendingBids: number
}

export interface UserDashboardData {
  activeRequests: number
  completedJobs: number
  pendingBids: number
  totalSpent: number
  recentRequests: ServiceRequest[]
  activeTaskers: number
}

export interface TaskerDashboardData {
  activeBids: number
  earnedTotal: number
  completedJobs: number
  acceptanceRate: number
  activeJobs: number
  rating: number
  recentEarnings: { date: string; amount: number }[]
}

export interface AdminDashboardData {
  totalUsers: number
  totalTaskers: number
  totalTransactions: number
  revenue: number
  growth: number
  usersByRole: { role: string; count: number }[]
  recentTransactions: Transaction[]
  serviceDemand: { name: string; count: number }[]
}

export interface Location {
  lat: number
  lng: number
  wardNo: number
  area: string
}

export const BUTWAL_WARDS = [
  { id: 1, name: "Ward 1", areas: ["Milijuli", "Sukhanagar"] },
  { id: 2, name: "Ward 2", areas: ["Buddhanagar", "Shanti Tole"] },
  { id: 3, name: "Ward 3", areas: ["Basudevi", "Gyaneshwor"] },
  { id: 4, name: "Ward 4", areas: ["Suryapura", "Srijana Chowk"] },
  { id: 5, name: "Ward 5", areas: ["Golpark", "Milan Chowk"] },
  { id: 6, name: "Ward 6", areas: ["Laxminagar", "Samadhi"] },
  { id: 7, name: "Ward 7", areas: ["Tribeni", "Khalihawadi"] },
  { id: 8, name: "Ward 8", areas: ["Jitgadhi", "Main Road"] },
  { id: 9, name: "Ward 9", areas: ["Bageshwori", "Sahid Chowk"] },
  { id: 10, name: "Ward 10", areas: ["Jalbinayak", "Nayagaun"] },
  { id: 11, name: "Ward 11", areas: ["Surya Nagar", "Satdobato"] },
  { id: 12, name: "Ward 12", areas: ["Lumbini Park", "Ram Mandir"] },
  { id: 13, name: "Ward 13", areas: ["Basantapur", "Tinkune"] },
  { id: 14, name: "Ward 14", areas: ["Bhairahawa Road", "Baishaki"] },
  { id: 15, name: "Ward 15", areas: ["Motipur", "Fulbari"] },
  { id: 16, name: "Ward 16", areas: ["Bharatpur", "Bishnu Tole"] },
  { id: 17, name: "Ward 17", areas: ["Aama Tole", "Bageshwori"] },
  { id: 18, name: "Ward 18", areas: ["Rajapur", "Surya Tole"] },
  { id: 19, name: "Ward 19", areas: ["Lalmatiya", "Sisahaniya"] },
] as const
