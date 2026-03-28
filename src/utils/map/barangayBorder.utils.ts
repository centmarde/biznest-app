import type { BarangayFeature, BarangayLngLat, GooglePolygonPath } from '@/types/map.types'

const BARANGAY_BORDER_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#eab308',
  '#f97316',
  '#06b6d4',
]

export function getBorderColor(index: number): string {
  return BARANGAY_BORDER_COLORS[index % BARANGAY_BORDER_COLORS.length] ?? '#3b82f6'
}

export function getBarangayLabel(feature: BarangayFeature, index: number): string {
  return feature.properties?.brgy_name ?? `Barangay ${index + 1}`
}

export function getFeaturePolygons(feature: BarangayFeature): BarangayLngLat[][][] {
  if (feature.geometry.type === 'Polygon') {
    return [feature.geometry.coordinates]
  }

  return feature.geometry.coordinates
}

export function toGooglePath(ring: BarangayLngLat[]): GooglePolygonPath[] {
  return ring.map(([lng, lat]) => ({ lat, lng }))
}

export function toLeafletLatLngRings(polygonRings: BarangayLngLat[][]): [number, number][][] {
  return polygonRings.map((ring) => ring.map(([lng, lat]) => [lat, lng] as [number, number]))
}

export function buildMapInfoWindowHtml(label: string): string {
  return `<div class="map-info-window">${escapeHtml(label)}</div>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
