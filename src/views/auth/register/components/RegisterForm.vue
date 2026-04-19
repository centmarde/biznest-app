<script setup lang="ts">
import { computed, onMounted, ref, watch, type HTMLAttributes } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import logoImage from '@/assets/images/logo.png'
import { Input } from '@/components/ui/input'

import {
  confirmedValidator,
  emailValidator,
  passwordValidator,
  requiredValidator,
} from '@/utils/validators'

//separate UI components and logic for better readability and maintainability
import { useAlertContext } from '@/composables/useAlert'
import { signUpWithEmail } from '@/services/auth.service'
import { fetchPhilippineCities } from '@/services/cities.service'
import type { CityOption } from '@/services/cities.service'
import { Check, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const router = useRouter()
const { showSuccess } = useAlertContext()
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
const errorMessage = ref('')

const touched = ref({
  email: false,
  username: false,
  city: false,
  password: false,
  confirmPassword: false,
})

const fieldErrors = ref({
  email: null as string | null,
  username: null as string | null,
  city: null as string | null,
  password: null as string | null,
  confirmPassword: null as string | null,
})

const selectedCityName = computed(() => {
  if (!cityId.value) {
    return ''
  }

  return cities.value.find((city) => city.id === cityId.value)?.name ?? ''
})

const getCityDisplayValue = (val: unknown): string => {
  if (typeof val !== 'string' || !val) return ''
  return cities.value.find((city) => city.id === val)?.name ?? ''
}

const fetchCities = async (): Promise<void> => {
  if (cities.value.length > 0) {
    return
  }

  isFetchingCities.value = true

  try {
    cities.value = await fetchPhilippineCities()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load cities.'
  } finally {
    isFetchingCities.value = false
  }
}

onMounted(() => {
  void fetchCities()
})

const getValidatorMessage = (result: boolean | string): string | null => {
  if (result === true) return null
  return typeof result === 'string' ? result : 'Invalid value'
}

const validateField = (...results: Array<boolean | string>): string | null => {
  for (const result of results) {
    const message = getValidatorMessage(result)
    if (message) return message
  }

  return null
}

const updateEmailError = (): void => {
  fieldErrors.value.email = touched.value.email
    ? validateField(requiredValidator(email.value), emailValidator(email.value))
    : null
}

const updateUsernameError = (): void => {
  fieldErrors.value.username = touched.value.username
    ? validateField(requiredValidator(username.value))
    : null
}

const updateCityError = (): void => {
  fieldErrors.value.city = touched.value.city ? validateField(requiredValidator(cityId.value)) : null
}

const updatePasswordError = (): void => {
  fieldErrors.value.password = touched.value.password
    ? validateField(requiredValidator(password.value), passwordValidator(password.value))
    : null
}

const updateConfirmPasswordError = (): void => {
  fieldErrors.value.confirmPassword = touched.value.confirmPassword
    ? validateField(
        requiredValidator(confirmPassword.value),
        confirmedValidator(confirmPassword.value, password.value),
      )
    : null
}

const updateAllFieldErrors = (): void => {
  updateEmailError()
  updateUsernameError()
  updateCityError()
  updatePasswordError()
  updateConfirmPasswordError()
}

const getFirstFieldError = (): string | null => {
  return (
    fieldErrors.value.email ||
    fieldErrors.value.username ||
    fieldErrors.value.city ||
    fieldErrors.value.password ||
    fieldErrors.value.confirmPassword ||
    null
  )
}

watch(email, () => {
  if (!touched.value.email) touched.value.email = true
  if (isSubmitting.value) return
  updateEmailError()
})

watch(username, () => {
  if (!touched.value.username) touched.value.username = true
  if (isSubmitting.value) return
  updateUsernameError()
})

watch(cityId, () => {
  if (!touched.value.city) touched.value.city = true
  if (isSubmitting.value) return
  updateCityError()
})

watch(password, () => {
  if (!touched.value.password) touched.value.password = true
  if (isSubmitting.value) return
  updatePasswordError()
  updateConfirmPasswordError()
})

watch(confirmPassword, () => {
  if (!touched.value.confirmPassword) touched.value.confirmPassword = true
  if (isSubmitting.value) return
  updateConfirmPasswordError()
})

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = ''

  touched.value.email = true
  touched.value.username = true
  touched.value.city = true
  touched.value.password = true
  touched.value.confirmPassword = true
  updateAllFieldErrors()

  const firstError = getFirstFieldError()
  if (firstError) {
    errorMessage.value = firstError
    return
  }

  isSubmitting.value = true

  try {
    const inviteQuery = router.currentRoute.value.query.invite
    const inviteToken = typeof inviteQuery === 'string' ? inviteQuery : undefined

    const response = await signUpWithEmail({
      username: username.value,
      email: email.value,
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
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to create your account right now.'
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
                :disabled="isSubmitting"
                required
              />
              <FieldDescription>
                We'll use this to contact you. We will not share your email with anyone else.
              </FieldDescription>
              <FieldError v-if="fieldErrors.email">{{ fieldErrors.email }}</FieldError>
            </Field>
            <Field>
              <FieldLabel for="username"> Username </FieldLabel>
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="yourname"
                autocomplete="username"
                :disabled="isSubmitting"
                required
              />
              <FieldError v-if="fieldErrors.username">{{ fieldErrors.username }}</FieldError>
            </Field>
            <Field>
              <FieldLabel for="city"> City </FieldLabel>
              <Combobox
                v-model="cityId"
                open-on-focus
                open-on-click
                :disabled="isFetchingCities || isSubmitting"
              >
                <ComboboxAnchor class="w-full">
                  <ComboboxInput
                    id="city"
                    class="w-full"
                    placeholder="Select a city"
                    :display-value="getCityDisplayValue"
                    :disabled="isFetchingCities || isSubmitting"
                  />
                </ComboboxAnchor>

                <ComboboxList
                  align="start"
                  class="max-h-75 w-(--reka-combobox-trigger-width) overflow-y-auto"
                >
                  <div v-if="isFetchingCities" class="text-muted-foreground p-3 text-sm">
                    <Loader2 class="mr-2 inline-block h-4 w-4 animate-spin" />
                    Loading cities...
                  </div>

                  <template v-else>
                    <ComboboxEmpty>No cities found.</ComboboxEmpty>

                    <ComboboxItem
                      v-for="city in cities"
                      :key="city.id"
                      :value="city.id"
                      :text-value="city.name"
                    >
                      <span>{{ city.name }}</span>
                      <ComboboxItemIndicator>
                        <Check class="h-4 w-4" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  </template>
                </ComboboxList>
              </Combobox>
              <FieldError v-if="fieldErrors.city">{{ fieldErrors.city }}</FieldError>
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
                      :disabled="isSubmitting"
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
                  <FieldError v-if="fieldErrors.password">{{ fieldErrors.password }}</FieldError>
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
                      :disabled="isSubmitting"
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
                  <FieldError v-if="fieldErrors.confirmPassword">{{ fieldErrors.confirmPassword }}</FieldError>
                </Field>
              </Field>
              <FieldDescription> Must be at least 8 characters long. </FieldDescription>
            </Field>
            <Field v-if="errorMessage">
              <FieldError>{{ errorMessage }}</FieldError>
            </Field>
            <Field>
              <Button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
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
                <span class="sr-only">Sign up with Google</span>
              </Button>
            </Field>
            <FieldDescription class="text-center">
              Already have an account? <a href="/auth">Sign in</a>
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
