export type MapProvider = 'google' | 'leaflet'

export type BarangayLngLat = [number, number]

export interface BarangayPolygonGeometry {
  type: 'Polygon'
  coordinates: BarangayLngLat[][]
}

export interface BarangayMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: BarangayLngLat[][][]
}

export type BarangayGeometry = BarangayPolygonGeometry | BarangayMultiPolygonGeometry

export interface BarangayFeature {
  type: 'Feature'
  geometry: BarangayGeometry
  properties?: {
    brgy_name?: string
    [key: string]: unknown
  }
}

export interface BarangayFeatureCollection {
  type: 'FeatureCollection'
  features: BarangayFeature[]
}

export interface GooglePolygonPath {
  lat: number
  lng: number
}
