import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your mdskills.ai account settings.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || ''
  const avatar = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Settings</h1>

      <div className="border border-neutral-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl font-semibold text-neutral-500">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-900">{name}</p>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h2 className="text-sm font-medium text-neutral-700 mb-1">Account</h2>
          <p className="text-sm text-neutral-500">
            Signed in via {user.app_metadata?.provider || 'email'}.
            Profile editing coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
