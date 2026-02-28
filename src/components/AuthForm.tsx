'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OAuthButtons } from './OAuthButtons'

interface AuthFormProps {
  defaultTab?: 'login' | 'signup'
  next?: string
}

export function AuthForm({ defaultTab = 'login', next }: AuthFormProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError('Service unavailable. Please try again later.')
      setLoading(false)
      return
    }

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push(next || '/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setConfirmationSent(true)
      setLoading(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Check your email</h2>
        <p className="text-sm text-neutral-600">
          We sent a confirmation link to <strong>{email}</strong>.
          <br />Click the link to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex mb-6 bg-neutral-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => { setTab('login'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'login'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setTab('signup'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'signup'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Create account
        </button>
      </div>

      {/* OAuth */}
      <OAuthButtons next={next} />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-neutral-400">or continue with email</span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
