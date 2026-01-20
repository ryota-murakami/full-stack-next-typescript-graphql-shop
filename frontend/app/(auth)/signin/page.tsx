import { Signin } from '@/components/Signin'
import { RequestReset } from '@/components/RequestReset'

export const metadata = {
  title: 'Sign In | Full-Stack Shop',
}

export default function SigninPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Signin />
        <RequestReset />
      </div>
    </div>
  )
}
