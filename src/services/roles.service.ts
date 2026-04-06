import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'
import { getSupabaseClient } from '@/services/supabase.client'

const ROLES_TABLE = 'roles'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Unable to fetch roles right now. Please try again.'
}

export const fetchRoles = async (): Promise<RoleRow[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  if (!data) {
    return []
  }

  return data.map((row) => ({
    id: row.id || '',
    title: row.title || 'Unknown Role',
    description: row.description || '',
  }))
}
