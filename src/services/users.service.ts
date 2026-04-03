import type { UserRow, RawUserMetaData } from '@/views/(admin)/users/types/users-table.types'
import { getSupabaseClient } from '@/services/supabase.client'

type GenericDbRow = Record<string, unknown>

const PROFILE_TABLE = 'auth.users'
const GET_ALL_USERS_RPC = 'get_all_users'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to fetch users right now. Please try again.'
}

const asRecord = (value: unknown): GenericDbRow => {
  if (typeof value === 'object' && value !== null) {
    return value as GenericDbRow
  }

  return {}
}

const getText = (row: GenericDbRow, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return ''
}

const normalizeRole = (value: string): string => {
  const normalized = value.toLowerCase()

  if (normalized === 'superadmin') {
    return 'superadmin'
  }

  if (normalized === 'admin') {
    return 'admin'
  }

  return 'user'
}

const toUserRow = (input: unknown): UserRow | null => {
  const row = asRecord(input)

  const id = getText(row, ['id', 'user_id'])
  if (!id) {
    return null
  }

  let username = 'Unknown User'
  let email = 'No email'
  let role = 'user'

  // Extract from raw_user_meta_data JSONB column if present
  const rawMeta = row['raw_user_meta_data']
  if (typeof rawMeta === 'string') {
    try {
      const meta: RawUserMetaData = JSON.parse(rawMeta)
      username = meta.username || username
      email = meta.email || email
      role = normalizeRole(meta.role || role)
    } catch {
      // Log error for debugging
      console.error('Failed to parse raw_user_meta_data JSON')
    }
  } else if (typeof rawMeta === 'object' && rawMeta !== null) {
    // If already parsed (from Supabase client)
    username = (rawMeta as RawUserMetaData).username || username
    email = (rawMeta as RawUserMetaData).email || email
    role = normalizeRole((rawMeta as RawUserMetaData).role || role)
  }

  return {
    id,
    username,
    email,
    role,
  }
}

const mapRows = (rows: unknown[] | null): UserRow[] => {
  if (!rows) {
    return []
  }

  return rows.map(toUserRow).filter((row): row is UserRow => row !== null)
}

const shouldFallbackFromRpc = (error: { code?: string; message?: string } | null): boolean => {
  if (!error) {
    return false
  }

  const message = (error.message ?? '').toLowerCase()
  return error.code === '42883' || message.includes(GET_ALL_USERS_RPC)
}

export const fetchAllUsers = async (): Promise<UserRow[]> => {
  const supabase = getSupabaseClient()

  const { data: rpcData, error: rpcError } = await supabase.rpc(GET_ALL_USERS_RPC)

  if (!rpcError) {
    return mapRows(Array.isArray(rpcData) ? rpcData : null)
  }

  if (!shouldFallbackFromRpc(rpcError)) {
    throw new Error(getErrorMessage(rpcError))
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw new Error(getErrorMessage(profilesError))
  }

  return mapRows(Array.isArray(profilesData) ? profilesData : null)
}
