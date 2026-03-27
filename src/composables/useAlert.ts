import { inject, provide, readonly, ref, type InjectionKey, type Ref } from 'vue'
import type { AppAlert, ShowAppAlertPayload } from '@/types/alert.types'

interface ShowSuccessOptions {
  title?: string
  durationMs?: number
}

interface AlertContext {
  alert: Readonly<Ref<AppAlert | null>>
  showAlert: (payload: ShowAppAlertPayload) => void
  showSuccess: (description: string, options?: ShowSuccessOptions) => void
  clearAlert: () => void
}

const ALERT_CONTEXT_KEY: InjectionKey<AlertContext> = Symbol('alert-context')
const ALERT_DEFAULT_DURATION_MS = 3600

const createAlertContext = (): AlertContext => {
  const alert = ref<AppAlert | null>(null)
  let dismissTimer: ReturnType<typeof setTimeout> | null = null

  const clearTimer = (): void => {
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer)
      dismissTimer = null
    }
  }

  const clearAlert = (): void => {
    clearTimer()
    alert.value = null
  }

  const showAlert = (payload: ShowAppAlertPayload): void => {
    clearTimer()

    const durationMs = payload.durationMs ?? ALERT_DEFAULT_DURATION_MS

    alert.value = {
      id: Date.now(),
      title: payload.title,
      description: payload.description,
      tone: payload.tone ?? 'success',
      durationMs,
    }

    if (durationMs > 0) {
      dismissTimer = setTimeout(() => {
        alert.value = null
        dismissTimer = null
      }, durationMs)
    }
  }

  const showSuccess = (description: string, options?: ShowSuccessOptions): void => {
    showAlert({
      title: options?.title ?? 'Success',
      description,
      tone: 'success',
      durationMs: options?.durationMs,
    })
  }

  return {
    alert: readonly(alert),
    showAlert,
    showSuccess,
    clearAlert,
  }
}

export const provideAlertContext = (): AlertContext => {
  const context = createAlertContext()
  provide(ALERT_CONTEXT_KEY, context)
  return context
}

export const useAlertContext = (): AlertContext => {
  const context = inject(ALERT_CONTEXT_KEY)

  if (!context) {
    throw new Error(
      'useAlertContext must be used within a provider created by provideAlertContext.',
    )
  }

  return context
}
