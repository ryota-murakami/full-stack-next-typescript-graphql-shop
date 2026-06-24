'use client';
/**
 * Signout button component
 */


import { useMutation } from "@apollo/client/react";
import { SIGNOUT_MUTATION } from '@/lib/graphql/mutations'
import { CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import { Button } from './ui/button'

export function Signout() {
  const [signout, { loading }] = useMutation(SIGNOUT_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signout()}
      disabled={loading}
    >
      Sign Out
    </Button>
  )
}
