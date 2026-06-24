import { Signin } from '@/components/Signin'
import { RequestReset } from '@/components/RequestReset'

export const metadata = {
  title: 'Sign In | Full-Stack Shop',
}

interface SigninPageProps {
  searchParams: Promise<{
    next?: string
  }>
}

export default async function SigninPage({ searchParams }: SigninPageProps) {
  const { next } = await searchParams

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Signin nextPath={next} />
        <RequestReset />
      </div>
    </div>
  )
}
