import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = 'https://mdskills.ai'
const SITE_NAME = 'mdskills.ai'
const DEFAULT_DESCRIPTION = 'Discover and install AI agent skills, MCP servers, workflows, and rulesets for Claude Code, Cursor, Codex, Gemini CLI, and 27+ AI agents. The open skills marketplace.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'mdskills.ai — AI Agent Skills Marketplace',
    template: '%s | mdskills.ai',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['AI skills', 'agent skills', 'SKILL.md', 'MCP servers', 'Claude Code', 'Cursor', 'Codex', 'AI agents', 'AI tools', 'skills marketplace', 'AGENTS.md', 'AI automation'],
  authors: [{ name: 'mdskills.ai' }],
  creator: 'mdskills.ai',
  publisher: 'mdskills.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'mdskills.ai — AI Agent Skills Marketplace',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mdskills.ai — AI Agent Skills Marketplace',
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
