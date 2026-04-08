import { getSupabaseClient } from '@/services/supabase.client'
import type {
  CreateHazardInput,
  Hazard,
  HazardGeometry,
  HazardGeometryType,
  HazardId,
  HazardListQuery,
  HazardListResponse,
  UpdateHazardInput,
} from '@/types/hazard.types'

const HAZARDS_TABLE = 'hazards'
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

const toGeometryType = (geometry: HazardGeometry): HazardGeometryType => {
  return geometry.type
}

const toHazard = (value: unknown): Hazard => {
  return value as Hazard
}

  const escapeLikeValue = (value: string): string => {
    return value.replace(/[%,]/g, '').trim()
  }

const normalizePage = (page?: number): number => {
  if (!page || page < 1) {
    return DEFAULT_PAGE
  }

  return Math.floor(page)
}

const normalizePageSize = (pageSize?: number): number => {
  if (!pageSize || pageSize < 1) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(Math.floor(pageSize), MAX_PAGE_SIZE)
}

export const listHazards = async (query: HazardListQuery = {}): Promise<HazardListResponse> => {
  const supabase = getSupabaseClient()

  const page = normalizePage(query.page)
  const pageSize = normalizePageSize(query.pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let request = supabase.from(HAZARDS_TABLE).select('*', { count: 'exact' })

  const term = escapeLikeValue(query.search ?? '')
  if (term) {
    request = request.or(
      [
        `name.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `location_name.ilike.%${term}%`,
        `address.ilike.%${term}%`,
      ].join(','),
    )
  }

  const filters = query.filters

  if (filters?.status) {
    request = request.eq('status', filters.status)
  }

  if (filters?.severity) {
    request = request.eq('severity', filters.severity)
  }

  if (filters?.category) {
    request = request.eq('category', filters.category)
  }

  if (filters?.barangay) {
    request = request.eq('barangay', filters.barangay)
  }

  if (filters?.city) {
    request = request.eq('city', filters.city)
  }

  if (filters?.province) {
    request = request.eq('province', filters.province)
  }

  if (filters?.region) {
    request = request.eq('region', filters.region)
  }

  if (filters?.reported_by) {
    request = request.eq('reported_by', filters.reported_by)
  }

  if (filters?.occurred_from) {
    request = request.gte('occurred_at', filters.occurred_from)
  }

  if (filters?.occurred_to) {
    request = request.lte('occurred_at', filters.occurred_to)
  }

  if (filters?.created_from) {
    request = request.gte('created_at', filters.created_from)
  }

  if (filters?.created_to) {
    request = request.lte('created_at', filters.created_to)
  }

  const sortBy = query.sortBy ?? 'created_at'
  const ascending = (query.sortOrder ?? 'desc') === 'asc'

  const { data, error, count } = await request
    .order(sortBy, { ascending, nullsFirst: false })
    .range(from, to)

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to fetch hazards right now. Please try again.'))
  }

  return {
    data: (data ?? []).map(toHazard),
    total: count ?? 0,
  }
}

export const getHazardById = async (id: HazardId): Promise<Hazard | null> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from(HAZARDS_TABLE).select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to load this hazard right now. Please try again.'))
  }

  if (!data) {
    return null
  }

  return toHazard(data)
}

export const createHazard = async (input: CreateHazardInput): Promise<Hazard> => {
  const supabase = getSupabaseClient()

  const payload = {
    ...input,
    geometry_type: toGeometryType(input.geometry),
  }

  const { data, error } = await supabase.from(HAZARDS_TABLE).insert(payload).select('*').single()

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to create hazard right now. Please try again.'))
  }

  return toHazard(data)
}

export const updateHazard = async (id: HazardId, input: UpdateHazardInput): Promise<Hazard> => {
  const supabase = getSupabaseClient()

  const payload: UpdateHazardInput = {
    ...input,
  }

  if (payload.geometry) {
    payload.geometry_type = toGeometryType(payload.geometry)
  }

  if (Object.keys(payload).length === 0) {
    const existing = await getHazardById(id)

    if (!existing) {
      throw new Error('Hazard not found.')
    }

    return existing
  }

  const { data, error } = await supabase
    .from(HAZARDS_TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to update hazard right now. Please try again.'))
  }

  if (!data) {
    throw new Error('Hazard not found.')
  }

  return toHazard(data)
}

export const deleteHazard = async (id: HazardId): Promise<void> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from(HAZARDS_TABLE).delete().eq('id', id)

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to delete hazard right now. Please try again.'))
  }
}

