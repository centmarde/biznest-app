<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'
import { deleteUserById } from '@/services/users.service'
import { useAlertContext } from '@/composables/useAlert'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  user: UserRow | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
  (e: 'refresh'): void
}>()

const { showSuccess, showAlert } = useAlertContext()
const isLoading = ref(false)

const closeModal = () => {
  if (isLoading.value) return
  emit('update:isOpen', false)
}

const confirmDelete = async () => {
  if (!props.user) return

  try {
    isLoading.value = true
    await deleteUserById(props.user.id)
    emit('refresh')
    emit('update:isOpen', false)
    showSuccess('User deleted successfully.')
  } catch (error) {
    console.error('Failed to delete user:', error)
    emit('update:isOpen', false)
    showAlert({
      title: 'Delete Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      tone: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog
    :open="props.isOpen"
    @update:open="
      (val) => {
        if (!isLoading) emit('update:isOpen', val)
      }
    "
  >
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-destructive">Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete
          <strong class="text-foreground" v-if="props.user">{{ props.user.username }}</strong
          ><span v-else>this user</span>? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="mt-4">
        <Button variant="outline" @click="closeModal" :disabled="isLoading">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
