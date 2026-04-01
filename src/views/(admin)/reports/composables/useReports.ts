import { onMounted, computed } from 'vue'
import { useReportsStore } from '@/stores/reportsStore'
import { usePdfExport } from './usePdfExport'

export function useReports() {
  // Store
  const store = useReportsStore()
  const { exportToPdf } = usePdfExport()

  // State
  const value = computed(() => store.selectedTabIndex)
  const tabs = computed(() => store.tabs)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Computed
  const currentTab = computed(() => tabs.value[value.value])
  const canExport = computed(() => {
    return currentTab.value?.tableData ? currentTab.value.tableData.length > 0 : false
  })

  // Handlers
  const handleTabChange = (index: number) => {
    store.setSelectedTabIndex(index)
  }

  const handleExport = () => {
    if (canExport.value && currentTab.value) {
      exportToPdf(currentTab.value, currentTab.value.label)
    }
  }

  // Lifecycle
  onMounted(() => {
    store.fetchReports()
  })

  return {
    // State
    value,
    tabs,
    loading,
    error,
    currentTab,
    canExport,
    
    // Handlers
    handleTabChange,
    handleExport,
  }
}
