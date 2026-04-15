import { computed, ref } from 'vue'
import type {
  CreateZoningLayerInput,
  MappedZone,
  UpdateMappedZoneInput,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'

interface SidebarProps {
  layers: ZoningLayer[]
  mappedZones: MappedZone[]
  isSubmitting: boolean
}

interface SidebarEmit {
  (e: 'submit-layer', payload: CreateZoningLayerInput): void
  (e: 'update-layer', payload: { layerId: string; input: UpdateZoningLayerInput }): void
  (e: 'delete-layer', layerId: string): void
  (e: 'update-mapped-zone', payload: { zoneId: string; input: UpdateMappedZoneInput }): void
  (e: 'delete-mapped-zone', zoneId: string): void
  (e: 'focus-mapped-zone', zoneId: string): void
  (e: 'toggle-layer-visibility', payload: { layerId: string; isActive: boolean }): void
}

export function useAdminMapRightSidebar(props: SidebarProps, emit: SidebarEmit) {
  const showAddLayerModal = ref(false)
  const showLayerList = ref(true)
  const showEditLayerModal = ref(false)
  const deletingLayerId = ref<string | null>(null)
  const editingLayerId = ref<string | null>(null)
  const showEditMappedZoneModal = ref(false)
  const deletingMappedZoneId = ref<string | null>(null)
  const editingMappedZoneId = ref<string | null>(null)

  const addLayerInitialValue = computed<UpdateZoningLayerInput>(() => ({
    title: '',
    color: '#65a30d',
    description: '',
  }))

  const editLayerInitialValue = computed<UpdateZoningLayerInput>(() => {
    const activeLayer = props.layers.find((layer) => layer.id === editingLayerId.value)

    if (!activeLayer) {
      return {
        title: '',
        color: '#65a30d',
        description: '',
      }
    }

    return {
      title: activeLayer.title,
      color: activeLayer.color,
      description: activeLayer.description ?? '',
    }
  })

  const editMappedZoneInitialValue = computed<UpdateMappedZoneInput>(() => {
    const activeZone = props.mappedZones.find((zone) => zone.id === editingMappedZoneId.value)

    if (!activeZone) {
      return {
        zoningLayerId: props.layers[0]?.id ?? '',
        name: '',
        description: '',
      }
    }

    return {
      zoningLayerId: activeZone.zoning_layer_id,
      name: activeZone.name,
      description: activeZone.description ?? '',
    }
  })

  function openAddLayerModal(): void {
    showAddLayerModal.value = true
  }

  function closeAddLayerModal(): void {
    showAddLayerModal.value = false
  }

  function openEditLayerModal(layer: ZoningLayer): void {
    editingLayerId.value = layer.id
    showEditLayerModal.value = true
  }

  function closeEditLayerModal(): void {
    showEditLayerModal.value = false
    editingLayerId.value = null
  }

  function submitLayer(input: UpdateZoningLayerInput): void {
    emit('submit-layer', {
      title: input.title,
      color: input.color,
      description: input.description,
    })

    closeAddLayerModal()
  }

  function submitLayerUpdate(input: UpdateZoningLayerInput): void {
    if (!editingLayerId.value || props.isSubmitting) {
      return
    }

    emit('update-layer', {
      layerId: editingLayerId.value,
      input: {
        title: input.title,
        color: input.color,
        description: input.description,
      },
    })

    closeEditLayerModal()
  }

  function openDeleteDialog(layerId: string): void {
    deletingLayerId.value = layerId
  }

  function cancelDeleteDialog(): void {
    deletingLayerId.value = null
  }

  function confirmDeleteLayer(): void {
    if (!deletingLayerId.value || props.isSubmitting) {
      return
    }

    emit('delete-layer', deletingLayerId.value)
    cancelDeleteDialog()
  }

  function toggleLayerVisibility(layer: ZoningLayer): void {
    if (props.isSubmitting) {
      return
    }

    emit('toggle-layer-visibility', {
      layerId: layer.id,
      isActive: !layer.is_active,
    })
  }

  function openEditMappedZoneModal(zoneId: string): void {
    editingMappedZoneId.value = zoneId
    showEditMappedZoneModal.value = true
  }

  function closeEditMappedZoneModal(): void {
    showEditMappedZoneModal.value = false
    editingMappedZoneId.value = null
  }

  function submitMappedZoneUpdate(input: UpdateMappedZoneInput): void {
    if (!editingMappedZoneId.value || props.isSubmitting) {
      return
    }

    emit('update-mapped-zone', {
      zoneId: editingMappedZoneId.value,
      input: {
        zoningLayerId: input.zoningLayerId,
        name: input.name,
        description: input.description,
      },
    })

    closeEditMappedZoneModal()
  }

  function openDeleteMappedZoneDialog(zoneId: string): void {
    deletingMappedZoneId.value = zoneId
  }

  function cancelDeleteMappedZoneDialog(): void {
    deletingMappedZoneId.value = null
  }

  function confirmDeleteMappedZone(): void {
    if (!deletingMappedZoneId.value || props.isSubmitting) {
      return
    }

    emit('delete-mapped-zone', deletingMappedZoneId.value)
    cancelDeleteMappedZoneDialog()
  }

  function focusMappedZone(zoneId: string): void {
    emit('focus-mapped-zone', zoneId)
  }

  return {
    addLayerInitialValue,
    closeAddLayerModal,
    closeEditLayerModal,
    closeEditMappedZoneModal,
    confirmDeleteLayer,
    confirmDeleteMappedZone,
    editLayerInitialValue,
    editMappedZoneInitialValue,
    focusMappedZone,
    openAddLayerModal,
    openDeleteDialog,
    openDeleteMappedZoneDialog,
    openEditLayerModal,
    openEditMappedZoneModal,
    submitLayer,
    submitLayerUpdate,
    submitMappedZoneUpdate,
    toggleLayerVisibility,
    cancelDeleteDialog,
    cancelDeleteMappedZoneDialog,
    deletingLayerId,
    deletingMappedZoneId,
    showAddLayerModal,
    showEditLayerModal,
    showEditMappedZoneModal,
    showLayerList,
  }
}
