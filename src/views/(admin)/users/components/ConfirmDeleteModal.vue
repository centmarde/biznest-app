<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'

const props = defineProps<{
  isOpen: boolean
  user: UserRow | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const confirmDelete = () => {
  // Logic to confirm deletion
  closeModal()
}
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="emit('update:isOpen', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <p>
        Are you sure you want to delete <strong v-if="props.user">{{ props.user.username }}</strong
        ><span v-else>this user</span>? This action cannot be undone.
      </p>
      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
