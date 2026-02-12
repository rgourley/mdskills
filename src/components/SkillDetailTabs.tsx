'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { FileText, Code, GitFork, MessageCircle } from 'lucide-react'

export type TabId = 'overview' | 'source' | 'forks' | 'comments'

interface SkillDetailTabsProps {
  activeTab: TabId
  forksCount?: number
  commentsCount?: number
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'source', label: 'Source Code', icon: Code },
  { id: 'forks', label: 'Forks', icon: GitFork },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
]

export function SkillDetailTabs({ activeTab, forksCount = 0, commentsCount = 0 }: SkillDetailTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getTabLabel = (tab: (typeof TABS)[0]) => {
    if (tab.id === 'forks') return `Forks (${forksCount})`
    if (tab.id === 'comments') return `Comments (${commentsCount})`
    return tab.label
  }

  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-1 -mb-px" aria-label="Skill detail tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const href = tab.id === 'overview' ? pathname : `${pathname}?tab=${tab.id}`
          return (
            <Link
              key={tab.id}
              href={href}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {getTabLabel(tab)}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
