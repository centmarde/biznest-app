<script setup lang="ts">
import { ref, type HTMLAttributes } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAlertContext } from '@/composables/useAlert'
import { signInWithEmail } from '@/services/auth.service'
import logoImage from '@/assets/images/logo.png'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const router = useRouter()
const { showSuccess } = useAlertContext()
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  isSubmitting.value = true

  try {
    await signInWithEmail({
      email: email.value,
      password: password.value,
    })

    showSuccess('You are now signed in to your BizNest account.', {
      title: 'Login successful',
    })

    await router.push('/admin')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to sign in right now.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card class="overflow-hidden p-0">
      <CardContent class="grid p-0 md:grid-cols-2">
        <form class="p-6 md:p-8" @submit.prevent="handleSubmit">
          <FieldGroup>
            <div class="flex flex-col items-center gap-2 text-center">
              <h1 class="text-2xl font-semibold">Welcome back</h1>
              <p class="text-muted-foreground text-balance">Login to your BizNest account</p>
            </div>
            <Field>
              <FieldLabel for="email"> Email </FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                autocomplete="email"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password"> Password </FieldLabel>
                <a href="#" class="ml-auto text-sm underline-offset-2 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="pr-10"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                  >
                    <path d="m3 3 18 18" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path
                      d="M9.36 5.37A9.91 9.91 0 0 1 12 5c5 0 9.27 3.11 11 7-1.02 2.29-2.75 4.15-4.93 5.3"
                    />
                    <path
                      d="M6.61 6.61C4.62 7.97 3.05 9.85 2 12c1.73 3.89 6 7 10 7a9.67 9.67 0 0 0 4.12-.93"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                  >
                    <path d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span class="sr-only">{{ showPassword ? 'Hide' : 'Show' }} password</span>
                </button>
              </div>
            </Field>
            <Field v-if="errorMessage">
              <FieldError>{{ errorMessage }}</FieldError>
            </Field>
            <Field>
              <Button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Logging in...' : 'Login' }}
              </Button>
            </Field>
            <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
              Or continue with
            </FieldSeparator>
            <Field>
              <Button variant="outline" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span class="sr-only">Login with Google</span>
              </Button>
            </Field>
            <FieldDescription class="text-center">
              Don't have an account?
              <a href="/auth/register"> Sign up </a>
            </FieldDescription>
          </FieldGroup>
        </form>
        <div class="bg-muted relative hidden md:block">
          <img
            :src="logoImage"
            alt="Image"
            class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#">Terms of Service</a> and
      <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
