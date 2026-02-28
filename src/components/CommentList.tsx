'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare } from 'lucide-react'
import { CommentForm } from './CommentForm'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  users: {
    username: string
    name: string | null
    avatar: string | null
  } | null
}

interface CommentListProps {
  skillId: string
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function CommentItem({ comment, skillId, onReply }: { comment: Comment; skillId: string; onReply: () => void }) {
  const [replying, setReplying] = useState(false)
  const user = comment.users
  const avatar = user?.avatar
  const displayName = user?.name || user?.username || 'Anonymous'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-xs font-semibold text-neutral-500">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-neutral-900">{displayName}</span>
          <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-neutral-700 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
        <button
          onClick={() => setReplying(!replying)}
          className="text-xs text-neutral-400 hover:text-neutral-600 mt-1 transition-colors"
        >
          Reply
        </button>
        {replying && (
          <div className="mt-2">
            <CommentForm
              skillId={skillId}
              parentId={comment.id}
              placeholder="Write a reply..."
              onSubmit={() => { setReplying(false); onReply() }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentList({ skillId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id, parent_id, users(username, name, avatar)')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: true })

    setComments((data as unknown as Comment[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchComments() }, [skillId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-neutral-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-neutral-100 rounded" />
              <div className="h-3 w-48 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Separate top-level and replies
  const topLevel = comments.filter((c) => !c.parent_id)
  const replies = comments.filter((c) => c.parent_id)

  return (
    <div className="space-y-6">
      <CommentForm skillId={skillId} onSubmit={fetchComments} />

      {topLevel.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No comments yet. Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} skillId={skillId} onReply={fetchComments} />
              {/* Replies */}
              {replies
                .filter((r) => r.parent_id === comment.id)
                .map((reply) => (
                  <div key={reply.id} className="ml-11 mt-3">
                    <CommentItem comment={reply} skillId={skillId} onReply={fetchComments} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
