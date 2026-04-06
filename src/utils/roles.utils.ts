export const getRoleBadgeVariant = (
  role: string,
): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  const normalizedRole = role.trim().toLowerCase()
  switch (normalizedRole) {
    case 'superadmin':
      return 'destructive'
    case 'admin':
      return 'default'
    case 'user':
    default:
      return 'secondary'
  }
}
