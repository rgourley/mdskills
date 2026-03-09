import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { DashboardContent } from './DashboardContent'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Submissions',
  description: 'Track and manage your submitted listings on mdskills.ai.',
}

function DashboardFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  )
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  )
}
