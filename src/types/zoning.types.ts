export interface ZoningLayer {
  id: string
  title: string
  color: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateZoningLayerInput {
  title: string
  color: string
  description: string
}

export interface UpdateZoningLayerInput {
  title: string
  color: string
  description: string
}
