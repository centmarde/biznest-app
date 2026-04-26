import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Tab, TableRow, DatabaseRow } from '@/types/reports.types'
import { getSupabaseClient } from '@/services/supabase.client'

// Define constant tab labels
const CONSTANT_TABS = [
  'All Reports',
  'Business Suitability',
  'Nearest Suppliers',
  'Top 5 Businesses',
  'Available Spaces',
]

export const useReportsStore = defineStore('reports', () => {
  // 1. State
  const tabs = ref<Tab[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedTabIndex = ref(0)

  // 2. Getters
  const selectedTab = computed(() => tabs.value[selectedTabIndex.value] || null)

  // 3. Actions
  const fetchReports = async () => {
    loading.value = true
    error.value = null

    const supabase = getSupabaseClient()

    // Fetch all reports from Supabase table
    const { data, error: fetchError } = await supabase
      .from('reports')
      .select(
        'businessowner, contactnumber, businesslocation, zoningclassification, geotag, label, created_at',
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      error.value = fetchError instanceof Error ? fetchError.message : 'Failed to fetch reports'
      console.error('Error fetching reports:', fetchError)
      tabs.value = []
    } else {
      const typedData = data as DatabaseRow[] | null
      if (typedData && typedData.length > 0) {
        // Transform the fetched data into Tab[] structure
        const allReportsData: TableRow[] = []
        const groupedData: { [key: string]: TableRow[] } = {}

        // First pass: collect all data and group by label
        for (const row of typedData) {
          const tableRow: TableRow = {
            label: row.label || 'Uncategorized',
            businessOwner: row.businessowner || '',
            contactNumber: row.contactnumber || '',
            businessLocation: row.businesslocation || '',
            zoningClassification: row.zoningclassification || '',
            geotag: row.geotag || '',
          }

          // Add to all reports
          allReportsData.push(tableRow)

          // Group by label
          const label: string = row.label || 'Uncategorized'
          if (!groupedData[label]) {
            groupedData[label] = []
          }
          groupedData[label].push(tableRow)
        }

        // Build tabs array with constant order
        tabs.value = []

        for (let i = 0; i < CONSTANT_TABS.length; i++) {
          const tabLabel = CONSTANT_TABS[i] as string

          if (tabLabel === 'All Reports') {
            // All Reports shows all data
            tabs.value.push({
              label: tabLabel,
              content: 'No Reports Found',
              tableData: allReportsData,
            })
          } else {
            // Other tabs show filtered data by label, or empty if no data
            tabs.value.push({
              label: tabLabel,
              content: `No Reports Found for "${tabLabel}"`,
              tableData: groupedData[tabLabel] || [],
            })
          }
        }
      } else {
        // Still build tabs, just with no data
        tabs.value = CONSTANT_TABS.map((label) => ({
          label,
          content: label === 'All Reports' ? 'No Reports Found' : `No Reports Found for "${label}"`,
          tableData: [],
        }))
      }
    }

    loading.value = false
  }

  const setSelectedTabIndex = (index: number) => {
    if (index >= 0 && index < tabs.value.length) {
      selectedTabIndex.value = index
    }
  }

  return {
    tabs,
    loading,
    error,
    selectedTabIndex,
    selectedTab,
    fetchReports,
    setSelectedTabIndex,
  }
})
