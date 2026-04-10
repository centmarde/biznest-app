export type HazardId = string
export type IsoDateTimeString = string
export type Uuid = string

export type HazardSeverity = 'low' | 'moderate' | 'high' | 'critical' | (string & {})
export type HazardStatus = 'reported' | 'under_review' | 'active' | 'mitigated' | 'resolved' | (string & {})
export type HazardGeometryType = 'point' | 'linestring' | 'polygon'

export type HazardCoordinatesPoint = [number, number]
export type HazardCoordinatesLineString = HazardCoordinatesPoint[]
export type HazardCoordinatesPolygon = HazardCoordinatesPoint[][]

export interface HazardPointGeometry {
  type: 'Point'
  coordinates: HazardCoordinatesPoint
}

export interface HazardLineStringGeometry {
  type: 'LineString'
  coordinates: HazardCoordinatesLineString
}

export interface HazardPolygonGeometry {
  type: 'Polygon'
  coordinates: HazardCoordinatesPolygon
}

export type HazardGeometry =
  | HazardPointGeometry
  | HazardLineStringGeometry
  | HazardPolygonGeometry

export interface Hazard {
  id: HazardId
  name: string
  description: string | null
  category: string
  severity: HazardSeverity
  status: HazardStatus
  geometry: HazardGeometry
  geometry_type: HazardGeometryType
  location_name: string | null
  address: string | null
  barangay: string | null
  city: string | null
  province: string | null
  region: string | null
  reported_by: Uuid | null
  verified_by: Uuid | null
  verified_at: IsoDateTimeString | null
  images: string[] | null
  attachments: string[] | null
  occurred_at: IsoDateTimeString | null
  expires_at: IsoDateTimeString | null
  created_at: IsoDateTimeString
  updated_at: IsoDateTimeString
}

export interface CreateHazardInput {
  name: string
  category: string
  geometry: HazardGeometry
  geometry_type: HazardGeometryType
  description?: string | null
  severity?: HazardSeverity
  status?: HazardStatus
  location_name?: string | null
  address?: string | null
  barangay?: string | null
  city?: string | null
  province?: string | null
  region?: string | null
  occurred_at?: IsoDateTimeString | null
  expires_at?: IsoDateTimeString | null
  images?: string[]
  attachments?: string[]
}

export type CreateHazardFormInput = Omit<CreateHazardInput, 'geometry' | 'geometry_type'>

export type UpdateHazardInput = Partial<
  Omit<Hazard, 'id' | 'created_at' | 'updated_at' | 'reported_by' | 'verified_by' | 'verified_at'>
>

export interface HazardFilters {
  status?: HazardStatus
  severity?: HazardSeverity
  category?: string
  barangay?: string
  city?: string
  province?: string
  region?: string
  reported_by?: Uuid
  occurred_from?: IsoDateTimeString
  occurred_to?: IsoDateTimeString
  created_from?: IsoDateTimeString
  created_to?: IsoDateTimeString
}

export type HazardSortField =
  | 'created_at'
  | 'updated_at'
  | 'occurred_at'
  | 'expires_at'
  | 'severity'
  | 'status'
  | 'category'

export type SortOrder = 'asc' | 'desc'

export interface HazardListQuery {
  page?: number
  pageSize?: number
  search?: string
  filters?: HazardFilters
  sortBy?: HazardSortField
  sortOrder?: SortOrder
}

export interface HazardListResponse {
  data: Hazard[]
  total: number
}
