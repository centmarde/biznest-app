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

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
  })

  if (error) {
    throw new Error(getAuthErrorMessage(error))
  }

  return data
}
