'use client';
/**
 * Permissions Management Component
 * Admin-only component for managing user permissions.
 * Displays all users in a table with checkboxes for each permission.
 */
import { useState } from 'react'
import { useMutation, useQuery } from "@apollo/client/react";
import { ALL_USERS_QUERY } from '@/lib/graphql/queries'
import { UPDATE_PERMISSIONS_MUTATION } from '@/lib/graphql/mutations'
import type { AllUsersData, Permission, User } from '@/lib/graphql/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, Shield, Check } from 'lucide-react'

/** Available permission types */
const PERMISSIONS: Permission[] = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]

interface UserRowProps {
  user: User
}

/**
 * Individual user row with permission checkboxes
 */
function UserRow({ user }: UserRowProps) {
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions)

  const [updatePermissions, { loading, error }] = useMutation(
    UPDATE_PERMISSIONS_MUTATION,
    {
      refetchQueries: [{ query: ALL_USERS_QUERY }],
    }
  )

  /**
   * Toggle a permission on/off
   * @param permission - The permission to toggle
   */
  const handlePermissionChange = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  /**
   * Save updated permissions
   */
  const handleSave = () => {
    updatePermissions({
      variables: {
        userId: user.id,
        permissions,
      },
    })
  }

  const hasChanges =
    JSON.stringify([...permissions].sort()) !==
    JSON.stringify([...user.permissions].sort())

  return (
    <tr className="border-b">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </td>
      {PERMISSIONS.map((permission) => (
        <td key={permission} className="px-4 py-3 text-center">
          <label className="inline-flex cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={permissions.includes(permission)}
              onChange={() => handlePermissionChange(permission)}
              disabled={loading}
            />
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                permissions.includes(permission)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {permissions.includes(permission) && <Check className="h-3 w-3" />}
            </div>
          </label>
        </td>
      ))}
      <td className="px-4 py-3">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading || !hasChanges}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Save'
          )}
        </Button>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error.message}</p>
        )}
      </td>
    </tr>
  )
}

export function Permissions() {
  const { data, loading, error } = useQuery<AllUsersData>(ALL_USERS_QUERY)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
        Error: {error.message}
      </div>
    )
  }

  if (!data?.users.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <Shield className="mx-auto mb-4 h-12 w-12" />
        <p>No users found</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>User Permissions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                {PERMISSIONS.map((permission) => (
                  <th
                    key={permission}
                    className="px-4 py-3 text-center text-xs font-medium"
                  >
                    {permission}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
