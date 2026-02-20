import { ImageResponse } from 'next/og'
import { getSkillBySlug } from '@/lib/skills'

export const runtime = 'edge'
export const alt = 'Skill preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skill = await getSkillBySlug(slug)

  const name = skill?.name ?? 'Skill Not Found'
  const description = skill?.description
    ? skill.description.length > 140
      ? skill.description.slice(0, 137) + '...'
      : skill.description
    : ''
  const owner = skill?.owner ?? ''
  const platforms = (skill?.platforms ?? [])
    .slice(0, 3)
    .map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: 'linear-gradient(135deg, #171717 0%, #262626 100%)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
              color: '#a3a3a3',
            }}
          >
            <span>mdskills.ai</span>
            <span style={{ color: '#525252' }}>·</span>
            <span>AI Agent Skill</span>
          </div>

          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            {name}
          </div>

          {description && (
            <div
              style={{
                fontSize: '24px',
                color: '#a3a3a3',
                lineHeight: 1.4,
                maxWidth: '850px',
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {owner && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '20px',
                  color: '#a3a3a3',
                }}
              >
                <span>by @{owner}</span>
              </div>
            )}
          </div>

          {platforms.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {platforms.map((p) => (
                <div
                  key={p}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    fontSize: '16px',
                    color: '#d4d4d4',
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
