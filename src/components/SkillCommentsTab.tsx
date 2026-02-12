import { MessageCircle } from 'lucide-react'

interface SkillCommentsTabProps {
  commentsCount?: number
}

export function SkillCommentsTab({ commentsCount = 0 }: SkillCommentsTabProps) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-4">
        <MessageCircle className="w-7 h-7 text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Comments & Discussion</h3>
      <p className="text-neutral-600 max-w-md mx-auto mb-6">
        {commentsCount > 0
          ? `${commentsCount} comment${commentsCount === 1 ? '' : 's'}. Sign in to view and participate.`
          : 'No comments yet. Sign in to start the discussion.'}
      </p>
      <p className="text-sm text-neutral-500">Threaded comments with markdown support coming soon.</p>
    </div>
  )
}
