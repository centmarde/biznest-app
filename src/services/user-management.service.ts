import { getSupabaseClient } from '@/services/supabase.client'

export interface SupabaseUserRow {
  id: string
  email: string
  full_name: string | null
  role: string
  confirmed_at: string | null
  banned_until: string | null
}

export const listUsers = async (): Promise<{ users: SupabaseUserRow[]; error: string | null }> => {
  const { data, error } = await getSupabaseClient().rpc('get_all_users')

  if (error) return { users: [], error: error.message }

  return { users: data as SupabaseUserRow[], error: null }
}
