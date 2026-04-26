import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdmin: SupabaseClient | null = null

const getSupabaseConfig = (): { url: string; anonKey: string; secret: string } => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const secret = import.meta.env.VITE_SUPABASE_SECRET

  if (!url || !anonKey) {
    throw new Error(
      'Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    )
  }

  return { url, anonKey, secret }
}

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient
  }

  const { url, anonKey } = getSupabaseConfig()
  supabaseClient = createClient(url, anonKey)

  return supabaseClient
}

export const getSubaseAdminClient = (): SupabaseClient => {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const { url, secret } = getSupabaseConfig()
  supabaseAdmin = createClient(url, secret)

  return supabaseAdmin
}
