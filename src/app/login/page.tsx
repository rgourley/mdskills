import type { Metadata } from 'next'
import { AuthForm } from '@/components/AuthForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to mdskills.ai to vote, comment, create collections, and submit skills.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; next?: string; error?: string }>
}) {
  const params = await searchParams
  const defaultTab = params.tab === 'signup' ? 'signup' : 'login'
  const next = params.next || undefined
  const authError = params.error === 'auth'

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/images/logo.svg" alt="mdskills" width={135} height={44} className="h-7 w-auto" />
          </Link>
          <p className="text-sm text-neutral-500">
            Sign in to vote, comment, and create collections.
          </p>
        </div>

        {authError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
            Authentication failed. Please try again.
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <AuthForm defaultTab={defaultTab} next={next} />
        </div>
      </div>
    </div>
  )
}
