import type { Session, User } from '@supabase/supabase-js'
import type { LoginPayload, RegisterPayload } from '@/types/auth.types'
import { getSupabaseClient } from '@/services/supabase.client'

export interface AuthResponse {
  user: User | null
  session: Session | null
}

const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export const signInWithEmail = async (payload: LoginPayload): Promise<AuthResponse> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim(),
    password: payload.password,
  })

  if (error) {
    throw new Error(getAuthErrorMessage(error))
  }

  return data
}

export const signUpWithEmail = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const supabase = getSupabaseClient()
  let role = 'user'

  if (payload.inviteToken) {
    const { data: isValidInvite, error: rpcError } = await supabase.rpc('consume_admin_invite', {
      token_to_consume: payload.inviteToken,
    })

    if (rpcError) {
      throw new Error(getAuthErrorMessage(rpcError))
    }

    if (!isValidInvite) {
      throw new Error('The invitation link is invalid or has already been used.')
    }

    role = 'admin'
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      data: {
        username: payload.username.trim(),
        role: role,
        cityId: payload.cityId,
        city: payload.city,
      },
    },
  })

  if (error) {
    throw new Error(getAuthErrorMessage(error))
  }

  return data
}
