<script setup lang="ts">
import { computed, onMounted, ref, type HTMLAttributes } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAlertContext } from '@/composables/useAlert'
import { AuthServiceError, signUpWithEmail } from '@/services/auth.service'
import { fetchPhilippineCities } from '@/services/cities.service'
import type { CityOption } from '@/services/cities.service'
import logoImage from '/register.png'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const router = useRouter()
const { showAlert, showSuccess } = useAlertContext()
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const email = ref('')
const username = ref('')
const cityId = ref('')
const password = ref('')
const confirmPassword = ref('')
const cities = ref<CityOption[]>([])
const isFetchingCities = ref(false)
const isSubmitting = ref(false)

const showErrorAlert = (description: string, title = 'Registration failed'): void => {
  showAlert({
    title,
    description,
    tone: 'destructive',
  })
}

const selectedCityName = computed(() => {
  if (!cityId.value) {
    return ''
  }

  return cities.value.find((city) => city.id === cityId.value)?.name ?? ''
})

const fetchCities = async (): Promise<void> => {
  if (cities.value.length > 0) {
    return
  }

  isFetchingCities.value = true

  try {
    cities.value = await fetchPhilippineCities()
  } catch (error) {
    showErrorAlert(
      error instanceof Error ? error.message : 'Unable to load cities.',
      'City list error',
    )
  } finally {
    isFetchingCities.value = false
  }
}

onMounted(() => {
  void fetchCities()
})

const handleSubmit = async (): Promise<void> => {
  const normalizedEmail = email.value.trim()
  const normalizedUsername = username.value.trim()
  const missingFields: string[] = []

  if (!normalizedEmail) {
    missingFields.push('Email is required.')
  }

  if (!normalizedUsername) {
    missingFields.push('Username is required.')
  }

  if (!cityId.value) {
    missingFields.push('Please select your city.')
  }

  if (!password.value) {
    missingFields.push('Password is required.')
  }

  if (!confirmPassword.value) {
    missingFields.push('Please confirm your password.')
  }

  if (missingFields.length > 0) {
    showErrorAlert(
      `Please fill in all required fields. ${missingFields.join(' ')}`,
      'Missing information',
    )
    return
  }

  if (password.value.length < 8) {
    showErrorAlert('Password must be at least 8 characters long.', 'Weak password')
    return
  }

  if (password.value !== confirmPassword.value) {
    showErrorAlert('Passwords do not match.', 'Password mismatch')
    return
  }

  isSubmitting.value = true

  try {
    const inviteQuery = router.currentRoute.value.query.invite
    const inviteToken = typeof inviteQuery === 'string' ? inviteQuery : undefined

    const response = await signUpWithEmail({
      username: normalizedUsername,
      email: normalizedEmail,
      password: password.value,
      city_id: cityId.value,
      city_name: selectedCityName.value,
      inviteToken,
    })

    if (response.session) {
      showSuccess('Your account has been created and you are now signed in.', {
        title: 'Account created',
      })
      await router.push('/')
      return
    }

    showSuccess('Check your inbox to confirm your email before signing in.', {
      title: 'Account created',
      durationMs: 4500,
    })
    await router.push('/auth')

    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    if (error instanceof AuthServiceError) {
      showErrorAlert(error.message)
      return
    }

    if (error instanceof Error) {
      showErrorAlert(error.message)
      return
    }

    showErrorAlert('Unable to create your account right now.')
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
              <h1 class="text-2xl font-semibold">Create your account</h1>
              <p class="text-muted-foreground text-sm text-balance">
                Enter your email below to create your account
              </p>
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
              <FieldDescription>
                We'll use this to contact you. We will not share your email with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel for="username"> Username </FieldLabel>
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="yourname"
                autocomplete="username"
                required
              />
            </Field>
            <Field>
              <FieldLabel for="city"> City </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    id="city"
                    variant="outline"
                    class="w-full justify-start font-normal"
                    :class="!cityId && 'text-muted-foreground'"
                    :disabled="isFetchingCities || isSubmitting"
                  >
                    {{ selectedCityName || 'Select a city' }}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[420px] max-h-[300px] overflow-y-auto">
                  <div v-if="isFetchingCities" class="text-muted-foreground p-3 text-sm">
                    <Loader2 class="mr-2 inline-block h-4 w-4 animate-spin" />
                    Loading cities...
                  </div>
                  <template v-else>
                    <DropdownMenuItem
                      v-for="city in cities"
                      :key="city.id"
                      @click="cityId = city.id"
                    >
                      {{ city.name }}
                    </DropdownMenuItem>
                  </template>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
            <Field>
              <Field class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel for="password"> Password </FieldLabel>
                  <div class="relative">
                    <Input
                      id="password"
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      class="pr-10"
                      autocomplete="new-password"
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
                <Field>
                  <FieldLabel for="confirm-password"> Confirm Password </FieldLabel>
                  <div class="relative">
                    <Input
                      id="confirm-password"
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="pr-10"
                      autocomplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center"
                      :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <svg
                        v-if="showConfirmPassword"
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
                      <span class="sr-only"
                        >{{ showConfirmPassword ? 'Hide' : 'Show' }} password</span
                      >
                    </button>
                  </div>
                </Field>
              </Field>
              <FieldDescription> Must be at least 8 characters long. </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
              </Button>
            </Field>

            <FieldDescription class="text-center">
              Already have an account? <a href="/auth">Sign in</a>
            </FieldDescription>
          </FieldGroup>
        </form>
        <div class="bg-muted relative hidden md:flex items-center justify-center overflow-hidden">
          <img
            :src="logoImage"
            alt="BizNest Mascot"
            class="h-full w-full object-contain scale-175"
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
