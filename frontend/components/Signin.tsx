'use client'

/**
 * Sign in form component
 */
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { SIGNIN_MUTATION } from '@/lib/graphql/mutations'
import { CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function Signin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [signin, { loading, error }] = useMutation(SIGNIN_MUTATION, {
    variables: { email, password },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
    onCompleted: () => {
      router.push('/')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            signin()
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
