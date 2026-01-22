import { Permissions } from '@/components/Permissions'

export const metadata = {
  title: 'Permissions | Full-Stack Shop',
  description: 'Manage user permissions (Admin only)',
}

/**
 * Permissions Management Page
 * Admin-only page for managing user permissions.
 * The Permissions component handles authentication check internally.
 */
export default function PermissionsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Manage Permissions</h1>
      <Permissions />
    </div>
  )
}
