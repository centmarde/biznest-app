import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Tab, TableRow } from '@/types/reports.types'
import { getSupabaseClient } from '@/services/supabase.client'

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
    try {
      const supabase = getSupabaseClient()
      
      // Fetch all reports from Supabase table
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform the fetched data into Tab[] structure
      // Group reports by their label field to create multiple tabs
      if (data && data.length > 0) {
        const groupedData: { [key: string]: TableRow[] } = {}

        // Group data by label
        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          const label: string = row.label || 'Uncategorized'

          if (!groupedData[label]) {
            groupedData[label] = []
          }

          const tableRow: TableRow = {
            businessOwner: row.businessowner || '',
            contactNumber: row.contactnumber || '',
            businessLocation: row.businesslocation || '',
            zoningClassification: row.zoningclassification || '',
            geotag: row.geotag || '',
          }
          groupedData[label].push(tableRow)
        }

        // Convert grouped data to tabs
        tabs.value = []
        const labelKeys: string[] = Object.keys(groupedData)
        for (let i = 0; i < labelKeys.length; i++) {
          const label: string = labelKeys[i] as string
          const tableData: TableRow[] = groupedData[label]!
          const newTab: Tab = {
            label,
            content: `No Reports Found for "${label}"`,
            tableData,
          }
          tabs.value.push(newTab)
        }
      } else {
        tabs.value = []
      }

      console.log('Fetched reports from Supabase:', tabs.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch reports'
      console.error('Error fetching reports:', err)
      tabs.value = []
    } finally {
      loading.value = false
    }
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
