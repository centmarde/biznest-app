export type AppAlertTone = 'success' | 'destructive'

export interface AppAlert {
  id: number
  title: string
  description: string
  tone: AppAlertTone
  durationMs: number
}

export interface ShowAppAlertPayload {
  title: string
  description: string
  tone?: AppAlertTone
  durationMs?: number
}
