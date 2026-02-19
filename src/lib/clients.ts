import { createClient } from '@/lib/supabase/server'

export interface Client {
  id: string
  slug: string
  name: string
  icon?: string
  websiteUrl?: string
  sortOrder: number
}

export interface ListingClient {
  clientId: string
  clientSlug: string
  clientName: string
  clientIcon?: string
  installInstructions?: string
  isPrimary: boolean
}

interface ClientRow {
  id: string
  slug: string
  name: string
  icon: string | null
  website_url: string | null
  sort_order: number
}

interface ListingClientRow {
  install_instructions: string | null
  is_primary: boolean | null
  clients: {
    id: string
    slug: string
    name: string
    icon: string | null
  }
}

function mapClientRow(row: ClientRow): Client {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    sortOrder: row.sort_order ?? 0,
  }
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('clients')
    .select('id, slug, name, icon, website_url, sort_order')
    .order('sort_order', { ascending: true })

  if (error || !data?.length) return []
  return data.map((row) => mapClientRow(row as ClientRow))
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('clients')
    .select('id, slug, name, icon, website_url, sort_order')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapClientRow(data as ClientRow)
}

export async function getSkillClients(skillId: string): Promise<ListingClient[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('listing_clients')
    .select('install_instructions, is_primary, clients(id, slug, name, icon)')
    .eq('skill_id', skillId)

  if (error || !data?.length) return []

  return data.map((row) => {
    const r = row as unknown as ListingClientRow
    return {
      clientId: r.clients.id,
      clientSlug: r.clients.slug,
      clientName: r.clients.name,
      clientIcon: r.clients.icon ?? undefined,
      installInstructions: r.install_instructions ?? undefined,
      isPrimary: r.is_primary ?? false,
    }
  })
}
