const BASE_URL = process.env.MDSKILLS_API_URL || 'https://www.mdskills.ai'

async function fetchSkills(opts = {}) {
  const params = new URLSearchParams()
  if (opts.query) params.set('q', opts.query)
  if (opts.category) params.set('category', opts.category)
  if (opts.artifactType) params.set('artifact_type', opts.artifactType)
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.featured) params.set('featured', 'true')

  const url = `${BASE_URL}/api/skills?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchSkillDetail(slug) {
  const res = await fetch(`${BASE_URL}/api/skills/${encodeURIComponent(slug)}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

module.exports = { fetchSkills, fetchSkillDetail, fetchCategories }
