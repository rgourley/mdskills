'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'

export function SponsorContactForm({ type = 'sponsor' }: { type?: string }) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          email,
          company,
          message,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-800">Thanks! We&rsquo;ll be in touch within 1-2 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="email"
          required
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          required
          placeholder="Company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <textarea
        placeholder="Which category are you interested in? Any details about your goals..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {status === 'sending' ? 'Sending...' : 'Get in touch'}
        </button>
        {status === 'error' && (
          <span className="text-sm text-red-600">Something went wrong. Try again or email us directly.</span>
        )}
      </div>
      {status === 'error' || status === 'idle' ? (
        <p className="text-xs text-neutral-400">We&rsquo;ll respond within 1-2 business days.</p>
      ) : null}
    </form>
  )
}
