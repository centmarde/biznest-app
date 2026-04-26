export interface CityOption {
  id: string
  name: string
}

export interface CityCenter {
  province: string
  city: string
  lat: number
  lng: number
}

export interface CityCenterLookupInput {
  cityId?: string | null
  cityName?: string | null
  legacyCity?: string | null
}

type CityApiRecord = {
  code?: string | number
  cityCode?: string | number
  municipalityCode?: string | number
  name?: string
}

const CITY_LIST_ENDPOINT = 'https://psgc.gitlab.io/api/cities'
const CITY_CENTER_CSV_PATH = '/locations_latlng.csv'
const PH_BOUNDS = {
  minLat: 4,
  maxLat: 22.5,
  minLng: 116,
  maxLng: 127.5,
}

let cityCache: CityOption[] | null = null
let cityRequest: Promise<CityOption[]> | null = null
let cityCenterCache: Map<string, CityCenter> | null = null
let cityCenterRequest: Promise<Map<string, CityCenter>> | null = null

const normalizeName = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,'`"-]/g, ' ')
    .replace(/\b(city|municipality|of|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const inPhilippineBounds = (lat: number, lng: number): boolean => {
  return (
    lat >= PH_BOUNDS.minLat &&
    lat <= PH_BOUNDS.maxLat &&
    lng >= PH_BOUNDS.minLng &&
    lng <= PH_BOUNDS.maxLng
  )
}

const parseLatLng = (value: string): { lat: number; lng: number } | null => {
  const [latRaw, lngRaw] = value.split(';').map((part) => part.trim())
  if (!latRaw || !lngRaw) {
    return null
  }

  const lat = Number(latRaw)
  const lng = Number(lngRaw)

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inPhilippineBounds(lat, lng)) {
    return null
  }

  return { lat, lng }
}

const parseCityCenterCsv = (csvText: string): CityCenter[] => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length <= 1) {
    return []
  }

  const dataLines = lines.slice(1)
  const entries: CityCenter[] = []

  dataLines.forEach((line) => {
    const [provinceRaw = '', cityRaw = '', latLngRaw = ''] = line.split(',', 3)
    const province = provinceRaw.trim()
    const city = cityRaw.trim()
    const latLng = parseLatLng(latLngRaw)

    if (!province || !city || !latLng) {
      return
    }

    entries.push({
      province,
      city,
      lat: latLng.lat,
      lng: latLng.lng,
    })
  })

  return entries
}

const buildCenterMapByCityId = (
  cities: CityOption[],
  centers: CityCenter[],
): Map<string, CityCenter> => {
  const centersByCityName = new Map<string, CityCenter[]>()

  centers.forEach((center) => {
    const key = normalizeName(center.city)
    const existing = centersByCityName.get(key) ?? []
    centersByCityName.set(key, [...existing, center])
  })

  const result = new Map<string, CityCenter>()
  cities.forEach((city) => {
    const key = normalizeName(city.name)
    const candidates = centersByCityName.get(key) ?? []
    if (candidates.length !== 1) {
      return
    }

    const center = candidates[0]
    if (center) {
      result.set(city.id, center)
    }
  })

  return result
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

const toCityOption = (input: CityApiRecord): CityOption | null => {
  const id = toText(input.code ?? input.cityCode ?? input.municipalityCode)
  const name = toText(input.name)

  if (!id || !name) {
    return null
  }

  return { id, name }
}

export const fetchPhilippineCities = async (): Promise<CityOption[]> => {
  if (cityCache) {
    return cityCache
  }

  if (!cityRequest) {
    cityRequest = (async () => {
      const response = await fetch(CITY_LIST_ENDPOINT)
      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }

      const payload = (await response.json()) as CityApiRecord[]
      const cities = payload
        .map(toCityOption)
        .filter((city): city is CityOption => city !== null)
        .sort((a, b) => a.name.localeCompare(b.name))

      cityCache = cities
      return cities
    })().finally(() => {
      cityRequest = null
    })
  }

  return cityRequest
}

export const toCityNameMap = (cities: CityOption[]): Map<string, string> => {
  return new Map(cities.map((city) => [city.id, city.name]))
}

export const fetchCityCentersById = async (): Promise<Map<string, CityCenter>> => {
  if (cityCenterCache) {
    return cityCenterCache
  }

  if (!cityCenterRequest) {
    cityCenterRequest = (async () => {
      const [cities, csvResponse] = await Promise.all([
        fetchPhilippineCities(),
        fetch(CITY_CENTER_CSV_PATH),
      ])

      if (!csvResponse.ok) {
        throw new Error('Failed to fetch city coordinates')
      }

      const csvText = await csvResponse.text()
      const centers = parseCityCenterCsv(csvText)
      cityCenterCache = buildCenterMapByCityId(cities, centers)
      return cityCenterCache
    })().finally(() => {
      cityCenterRequest = null
    })
  }

  return cityCenterRequest
}

export const resolveCityCenter = async (
  input: CityCenterLookupInput,
): Promise<CityCenter | null> => {
  const centersById = await fetchCityCentersById()

  const cityId = toText(input.cityId)
  if (cityId) {
    return centersById.get(cityId) ?? null
  }

  const fallbackName = toText(input.cityName) || toText(input.legacyCity)
  if (!fallbackName) {
    return null
  }

  const normalizedFallbackName = normalizeName(fallbackName)
  const fallbackCandidates: CityCenter[] = []
  for (const center of centersById.values()) {
    if (normalizeName(center.city) === normalizedFallbackName) {
      fallbackCandidates.push(center)
    }
  }

  if (fallbackCandidates.length === 1) {
    return fallbackCandidates[0] ?? null
  }

  return null
}
