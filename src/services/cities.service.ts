export interface CityOption {
  id: string
  name: string
}

type CityApiRecord = {
  code?: string | number
  cityCode?: string | number
  municipalityCode?: string | number
  name?: string
}

const CITY_LIST_ENDPOINT = 'https://psgc.gitlab.io/api/cities'

let cityCache: CityOption[] | null = null
let cityRequest: Promise<CityOption[]> | null = null

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
