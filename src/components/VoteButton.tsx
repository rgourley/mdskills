'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThumbsUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VoteButtonProps {
  skillId: string
  initialCount?: number
}

export function VoteButton({ skillId, initialCount = 0 }: VoteButtonProps) {
  const [voted, setVoted] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    // Check if the current user already voted
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('votes')
        .select('id')
        .eq('skill_id', skillId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setVoted(true)
        })
    })
  }, [skillId])

  const handleVote = async () => {
    const supabase = createClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setLoading(true)

    if (voted) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('skill_id', skillId)
        .eq('user_id', user.id)

      if (!error) {
        setVoted(false)
        setCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('votes')
        .insert({ skill_id: skillId, user_id: user.id, value: 1 })

      if (!error) {
        setVoted(true)
        setCount((c) => c + 1)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2.5 border font-medium rounded-lg transition-colors disabled:opacity-50 ${
        voted
          ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
      Upvote{count > 0 ? ` (${count})` : ''}
    </button>
  )
}
