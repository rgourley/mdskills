'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, FolderHeart, Shield, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
      // Check admin role
      if (data.user) {
        supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role === 'admin') setIsAdmin(true)
          })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleSignOut = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
      setOpen(false)
      router.refresh()
    }
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        Sign in
      </Link>
    )
  }

  const avatar = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || ''
  const initials = name.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 hover:border-neutral-400 transition-colors flex items-center justify-center bg-neutral-100"
        aria-label="User menu"
      >
        {avatar ? (
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-xs font-semibold text-neutral-600">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2.5 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
            {user.email && name !== user.email && (
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/collections"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <FolderHeart className="w-4 h-4 text-neutral-400" />
              My Collections
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              Settings
            </Link>
          </div>

          {isAdmin && (
            <div className="border-t border-neutral-100 py-1">
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Admin</span>
              </div>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Upload className="w-4 h-4 text-neutral-400" />
                Import Skills
              </Link>
            </div>
          )}

          <div className="border-t border-neutral-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-neutral-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
