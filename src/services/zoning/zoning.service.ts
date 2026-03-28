import { getSupabaseClient } from '@/services/supabase.client'
import type {
  CreateMappedZoneInput,
  CreateZoningLayerInput,
  MappedZone,
  MapDrawPoint,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'

const ZONING_LAYERS_TABLE = 'zoning_layers'

interface MappedZoneRpcRow {
  id: string
  zoning_layer_id: string
  zoning_title: string
  zoning_color: string
  name: string
  description: string | null
  is_visible: boolean
  geometry: {
    type?: string
    coordinates?: unknown
  } | null
  created_at: string
  updated_at: string
}

function normalizePolygonPoints(points: MapDrawPoint[]): [number, number][] {
  const ring = points.map((point) => [point.lng, point.lat] as [number, number])

  if (ring.length === 0) {
    return ring
  }

  const first = ring[0]
  const last = ring[ring.length - 1]

  if (!first || !last) {
    return ring
  }

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]])
  }

  return ring
}

function toMappedZone(row: MappedZoneRpcRow): MappedZone {
  const coordinates = row.geometry?.coordinates
  const outerRing = Array.isArray(coordinates) && Array.isArray(coordinates[0])
    ? coordinates[0]
    : []

  const points = Array.isArray(outerRing)
    ? outerRing
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
      .map((coordinate) => ({
        lng: Number(coordinate[0]),
        lat: Number(coordinate[1]),
      }))
      .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng))
    : []

  const normalizedPoints = points.length > 1
    && points[0]?.lat === points[points.length - 1]?.lat
    && points[0]?.lng === points[points.length - 1]?.lng
    ? points.slice(0, -1)
    : points

  return {
    id: row.id,
    zoning_layer_id: row.zoning_layer_id,
    zoning_title: row.zoning_title,
    zoning_color: row.zoning_color,
    name: row.name,
    description: row.description,
    is_visible: row.is_visible,
    points: normalizedPoints,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

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

export async function updateZoningLayer(
  layerId: string,
  input: UpdateZoningLayerInput,
): Promise<ZoningLayer> {
  const supabase = getSupabaseClient()
  const payload = {
    title: input.title.trim(),
    color: input.color,
    description: input.description.trim() || null,
  }

  const { data, error } = await supabase
    .from(ZONING_LAYERS_TABLE)
    .update(payload)
    .eq('id', layerId)
    .select('id, title, color, description, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ZoningLayer
}

export async function deleteZoningLayer(layerId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from(ZONING_LAYERS_TABLE)
    .delete()
    .eq('id', layerId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function setZoningLayerActive(
  layerId: string,
  isActive: boolean,
): Promise<ZoningLayer> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ZONING_LAYERS_TABLE)
    .update({ is_active: isActive })
    .eq('id', layerId)
    .select('id, title, color, description, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ZoningLayer
}

export async function listMyMappedZones(): Promise<MappedZone[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_my_mapped_zones')

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as MappedZoneRpcRow[]
  return rows.map(toMappedZone)
}

export async function createMappedZone(input: CreateMappedZoneInput): Promise<void> {
  const supabase = getSupabaseClient()

  if (input.points.length < 3) {
    throw new Error('A mapped zone needs at least 3 points.')
  }

  const polygonRing = normalizePolygonPoints(input.points)
  const geometry = {
    type: 'Polygon',
    coordinates: [polygonRing],
  }

  const { error } = await supabase.rpc('create_mapped_zone', {
    p_zoning_layer_id: input.zoningLayerId,
    p_name: input.name.trim(),
    p_description: input.description.trim() || null,
    p_geojson: geometry,
    p_is_visible: true,
  })

  if (error) {
    throw new Error(error.message)
  }
}
