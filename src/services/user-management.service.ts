import { getSupabaseClient } from '@/services/supabase.client'

export interface SupabaseUserRow {
  id: string
  email: string | null
  full_name: string | null
  role: string
  confirmed_at: string | null
  banned_until: string | null
  city?: string | null
  city_name?: string | null
  raw_user_meta_data?: {
    city?: string | null
    city_name?: string | null
    cityName?: string | null
    city_id?: string | null
    [key: string]: unknown
  } | null
}

export const listUsers = async (): Promise<{ users: SupabaseUserRow[]; error: string | null }> => {
  const { data, error } = await getSupabaseClient().rpc('get_all_users')

  if (error) return { users: [], error: error.message }

  return { users: data as SupabaseUserRow[], error: null }
}
