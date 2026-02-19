const BASE_URL = process.env.MDSKILLS_API_URL || 'https://www.mdskills.ai'

function networkError(err) {
  if (err && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.cause?.code === 'ENOTFOUND' || err.cause?.code === 'ECONNREFUSED')) {
    const msg = `Could not connect to ${BASE_URL}\n\n  Check your internet connection and try again.\n  If the issue persists, visit https://www.mdskills.ai for status.`
    return new Error(msg)
  }
  if (err && err.name === 'AbortError') {
    return new Error('Request timed out. Check your connection and try again.')
  }
  return null
}

async function apiFetch(url) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(15000) })
  } catch (err) {
    throw networkError(err) || err
  }
}

async function fetchSkills(opts = {}) {
  const params = new URLSearchParams()
  if (opts.query) params.set('q', opts.query)
  if (opts.category) params.set('category', opts.category)
  if (opts.artifactType) params.set('artifact_type', opts.artifactType)
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.featured) params.set('featured', 'true')

  const url = `${BASE_URL}/api/skills?${params}`
  const res = await apiFetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchSkillDetail(slug) {
  const res = await apiFetch(`${BASE_URL}/api/skills/${encodeURIComponent(slug)}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function fetchCategories() {
  const res = await apiFetch(`${BASE_URL}/api/categories`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

module.exports = { fetchSkills, fetchSkillDetail, fetchCategories }
