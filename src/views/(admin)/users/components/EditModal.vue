<script setup lang="ts">
import { ref, watch } from 'vue'
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

const username = ref('')
const email = ref('')

watch(
  () => props.user,
  (user) => {
    if (user) {
      username.value = user.username
      email.value = user.email
    } else {
      username.value = ''
      email.value = ''
    }
  },
  { immediate: true },
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const saveChanges = () => {
  // Logic to save changes
  closeModal()
}
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="emit('update:isOpen', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <!-- Add form fields here -->
        <input type="text" placeholder="Username" class="input" v-model="username" />
        <input type="email" placeholder="Email" class="input" v-model="email" />
      </div>
      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Cancel</Button>
        <Button @click="saveChanges">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
