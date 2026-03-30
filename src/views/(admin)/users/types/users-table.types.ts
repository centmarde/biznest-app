export type UserStatus = 'Active' | 'Pending' | 'Suspended'

export interface UserRow {
  id: string
  fullName: string
  email: string
  role: string
  status: UserStatus
}
