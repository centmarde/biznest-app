import type { BarangayFeatureCollection } from '@/types/map.types.ts'

interface GeoRiskCityFeature {
  attributes?: {
    city_name?: string
  }
}

interface GeoRiskCityListResponse {
  features?: GeoRiskCityFeature[]
}

interface ResolveGeoRiskCityInput {
  cityName?: string | null
  legacyCity?: string | null
}

const GEO_RISK_BORDERS_ENDPOINT =
  'https://portal.georisk.gov.ph/arcgis/rest/services/PSA/Barangay/MapServer/4/query'
const GEO_RISK_CITY_NAMES_LOCAL_SOURCE_URL = '/city_names_for_georisk.txt'
const LEGACY_BUTUAN_BORDERS_SOURCE_URL = '/map.txt'

let cityNamesCache: string[] | null = null
let cityNamesRequest: Promise<string[]> | null = null

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bsta\.?\b/g, 'santa')
    .replace(/\bst\.?\b/g, 'saint')
    .replace(/\bgen\.?\b/g, 'general')
    .replace(/\bpres\.?\b/g, 'president')
    .replace(/[.,'`"-]/g, ' ')
    .replace(/\b(city|municipality|of|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildNameVariants(cityRaw: string): string[] {
  const city = cityRaw.trim()
  if (!city) {
    return []
  }

  const variants = new Set<string>([city])

  const cityOfMatch = city.match(/^city\s+of\s+(.+)$/i)
  if (cityOfMatch?.[1]) {
    const base = cityOfMatch[1].trim()
    if (base) {
      variants.add(base)
      variants.add(`${base} City`)
    }
  }

  const suffixCityMatch = city.match(/^(.+?)\s+city$/i)
  if (suffixCityMatch?.[1]) {
    const base = suffixCityMatch[1].trim()
    if (base) {
      variants.add(base)
      variants.add(`City of ${base}`)
    }
  }

  if (!cityOfMatch && !suffixCityMatch) {
    variants.add(`City of ${city}`)
    variants.add(`${city} City`)
  }

  return Array.from(variants)
}

function uniqueNames(names: string[]): string[] {
  return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)))
}

async function fetchCityNamesFromLocalSource(): Promise<string[]> {
  const response = await fetch(GEO_RISK_CITY_NAMES_LOCAL_SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoRisk city names: ${response.status}`)
  }

  const payload = (await response.json()) as GeoRiskCityListResponse
  const names = (payload.features ?? [])
    .map((feature) => feature.attributes?.city_name?.trim() ?? '')
    .filter(Boolean)

  return uniqueNames(names)
}

async function getGeoRiskCityNames(): Promise<string[]> {
  if (cityNamesCache) {
    return cityNamesCache
  }

  if (!cityNamesRequest) {
    cityNamesRequest = fetchCityNamesFromLocalSource()
      .then((names) => {
        cityNamesCache = names
        return names
      })
      .finally(() => {
        cityNamesRequest = null
      })
  }

  return cityNamesRequest
}

function pickBestNormalizedCity(
  requestedName: string,
  normalizedCandidates: string[],
): string | null {
  if (normalizedCandidates.length === 0) {
    return null
  }

  if (normalizedCandidates.length === 1) {
    return normalizedCandidates[0] ?? null
  }

  const requested = requestedName.trim()
  const cityOfPrefix = `City of ${requested}`
  const citySuffix = `${requested} City`

  const exactPriority = normalizedCandidates.find(
    (candidate) => candidate === cityOfPrefix || candidate === citySuffix || candidate === requested,
  )

  return exactPriority ?? normalizedCandidates[0] ?? null
}

export async function resolveGeoRiskCityName(input: ResolveGeoRiskCityInput): Promise<string | null> {
  const requestedNames = uniqueNames([
    ...(input.cityName ? buildNameVariants(input.cityName) : []),
    ...(input.legacyCity ? buildNameVariants(input.legacyCity) : []),
  ])

  if (requestedNames.length === 0) {
    return null
  }

  const georiskCities = await getGeoRiskCityNames()
  const georiskSet = new Set(georiskCities)

  for (const requestedName of requestedNames) {
    if (georiskSet.has(requestedName)) {
      return requestedName
    }
  }

  const georiskByNormalized = new Map<string, string[]>()
  georiskCities.forEach((city) => {
    const normalized = normalizeName(city)
    const existing = georiskByNormalized.get(normalized) ?? []
    georiskByNormalized.set(normalized, [...existing, city])
  })

  for (const requestedName of requestedNames) {
    const normalizedRequested = normalizeName(requestedName)
    const candidates = georiskByNormalized.get(normalizedRequested) ?? []
    const best = pickBestNormalizedCity(requestedName, candidates)
    if (best) {
      return best
    }
  }

  return null
}

async function fetchLegacyButuanBorders(): Promise<BarangayFeatureCollection> {
  const response = await fetch(LEGACY_BUTUAN_BORDERS_SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch legacy barangay border data: ${response.status}`)
  }

  const text = await response.text()
  return JSON.parse(text) as BarangayFeatureCollection
}

export async function fetchBarangayBordersSourceByCity(
  georiskCityName: string,
): Promise<BarangayFeatureCollection> {
  const escapedCityName = georiskCityName.replace(/'/g, "''")
  const params = new URLSearchParams({
    where: `city_name='${escapedCityName}'`,
    outFields: '*',
    f: 'geojson',
  })

  const response = await fetch(`${GEO_RISK_BORDERS_ENDPOINT}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch barangay border data: ${response.status}`)
  }

  const payload = (await response.json()) as BarangayFeatureCollection
  const hasFeatures = Array.isArray(payload.features) && payload.features.length > 0

  if (!hasFeatures && normalizeName(georiskCityName) === normalizeName('Butuan City')) {
    return fetchLegacyButuanBorders()
  }

  return payload
}
