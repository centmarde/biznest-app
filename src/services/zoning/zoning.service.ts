import { getSupabaseClient } from '@/services/supabase.client'
import type { CreateZoningLayerInput, ZoningLayer } from '@/types/zoning.types'

const ZONING_LAYERS_TABLE = 'zoning_layers'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.id) {
    throw new Error('You must be logged in to manage zoning layers.')
  }

  return data.user.id
}

export async function listMyZoningLayers(): Promise<ZoningLayer[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(ZONING_LAYERS_TABLE)
    .select('id, title, color, description, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ZoningLayer[]
}

export async function createZoningLayer(input: CreateZoningLayerInput): Promise<ZoningLayer> {
  const supabase = getSupabaseClient()
  const userId = await getAuthenticatedUserId()

  const payload = {
    user_id: userId,
    title: input.title.trim(),
    color: input.color,
    description: input.description.trim() || null,
  }

  const { data, error } = await supabase
    .from(ZONING_LAYERS_TABLE)
    .insert(payload)
    .select('id, title, color, description, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ZoningLayer
}
