import { createClient } from "@supabase/supabase-js"

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing environment variable: ${name}`)
  return val
}

export function getSupabase() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"))
}

export function getAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
