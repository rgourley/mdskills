'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface CommentFormProps {
  skillId: string
  parentId?: string
  placeholder?: string
  onSubmit?: () => void
}

export function CommentForm({ skillId, parentId, placeholder = 'Share your thoughts...', onSubmit }: CommentFormProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center py-3 px-4 rounded-lg border border-neutral-200 bg-neutral-50">
        <p className="text-sm text-neutral-500">
          <button
            onClick={() => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
            className="text-neutral-900 font-medium hover:underline"
          >
            Sign in
          </button>
          {' '}to leave a comment.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    const { error } = await supabase.from('comments').insert({
      content: content.trim(),
      skill_id: skillId,
      user_id: user.id,
      ...(parentId ? { parent_id: parentId } : {}),
    })

    if (!error) {
      setContent('')
      onSubmit?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none transition-colors"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = 'auto'
          target.style.height = `${target.scrollHeight}px`
        }}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="self-end px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
