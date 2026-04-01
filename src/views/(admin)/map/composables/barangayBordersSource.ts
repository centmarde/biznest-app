const BARANGAY_BORDERS_SOURCE_URL = '/map.txt'

export async function fetchBarangayBordersSource(): Promise<unknown> {
  const response = await fetch(BARANGAY_BORDERS_SOURCE_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch barangay border data: ${response.status}`)
  }

  const text = await response.text()
  return JSON.parse(text) as unknown
}
