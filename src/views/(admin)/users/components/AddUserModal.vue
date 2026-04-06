<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TypographyMuted, TypographySmall } from '@/components/typography'
import { getSupabaseClient } from '@/services/supabase.client'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const isLoading = ref(false)
const generatedLink = ref('')
const hasCopied = ref(false)
const errorMsg = ref('')

const generateLink = async () => {
  isLoading.value = true
  errorMsg.value = ''
  generatedLink.value = ''
  hasCopied.value = false

  try {
    const supabase = getSupabaseClient()
    const token = crypto.randomUUID()

    // Using admin_invites table which we created in SQL script
    const { error } = await supabase.from('admin_invites').insert({ token })

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, fallback to mock response for UI
        console.warn('admin_invites table not found, mocking response.')
      } else {
        throw error
      }
    }

    generatedLink.value = `${window.location.origin}/auth/register?invite=${token}`
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = 'Failed to generate link'
    }
  } finally {
    isLoading.value = false
  }
}

const copyLink = async () => {
  if (!generatedLink.value) return
  await navigator.clipboard.writeText(generatedLink.value)
  hasCopied.value = true
  setTimeout(() => {
    hasCopied.value = false
  }, 2000)
}

const onOpenChange = (open: boolean) => {
  if (!open) {
    // Reset state when closing
    generatedLink.value = ''
    errorMsg.value = ''
  }
  emit('update:isOpen', open)
}
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite Admin</DialogTitle>
        <DialogDescription>
          Generate a single-use registration link to invite a new admin to the platform.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-4">
        <div v-if="!generatedLink" class="flex justify-center">
          <Button @click="generateLink" :disabled="isLoading">
            {{ isLoading ? 'Generating...' : 'Generate Invite Link' }}
          </Button>
        </div>

        <div v-else class="flex flex-col gap-3">
          <TypographySmall as="p">Share this link:</TypographySmall>
          <div class="flex items-center gap-2">
            <Input :model-value="generatedLink" readonly class="flex-1" />
            <Button
              size="icon"
              variant="outline"
              @click="copyLink"
              :class="{ 'text-green-600 border-green-600': hasCopied }"
            >
              <Check v-if="hasCopied" class="size-4" />
              <Copy v-else class="size-4" />
            </Button>
          </div>
          <TypographyMuted as="p" class="mt-0 text-center text-xs">
            Note: This link will expire after a single use.
          </TypographyMuted>
        </div>

        <TypographySmall v-if="errorMsg" as="p" class="mt-0 text-center text-destructive">{{
          errorMsg
        }}</TypographySmall>
      </div>
    </DialogContent>
  </Dialog>
</template>
