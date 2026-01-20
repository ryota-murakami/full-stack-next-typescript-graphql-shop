'use client'

/**
 * Request password reset form component
 */
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { REQUEST_RESET_MUTATION } from '@/lib/graphql/mutations'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function RequestReset() {
  const [email, setEmail] = useState('')

  const [requestReset, { loading, error, data }] = useMutation(
    REQUEST_RESET_MUTATION,
    {
      variables: { email },
    }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            requestReset()
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </div>
          )}
          {data?.requestReset && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
              {data.requestReset.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="outline" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Request Reset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
