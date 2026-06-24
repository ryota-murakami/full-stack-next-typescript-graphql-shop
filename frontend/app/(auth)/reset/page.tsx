import { ResetPassword } from '@/components/ResetPassword'

export const metadata = {
  title: 'Reset Password | Full-Stack Shop',
}

interface ResetPageProps {
  searchParams: Promise<{
    resetToken?: string
  }>
}

/**
 * Password Reset Page
 * Allows users to set a new password using a reset token from email.
 * Token is passed via URL query parameter: /reset?resetToken=xxx
 * @param searchParams - URL search parameters containing the reset token
 */
export default async function ResetPage({ searchParams }: ResetPageProps) {
  const { resetToken } = await searchParams

  if (!resetToken) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold">Invalid Reset Link</h1>
        <p className="text-muted-foreground">
          This password reset link is invalid or has expired. Please request a new
          password reset.
        </p>
      </div>
    )
  }

  return <ResetPassword resetToken={resetToken} />
}
