import type { GetServerSideProps } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rsre-frontend.onrender.com').replace(/\/$/, '')

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/articles',
  '/archive',
  '/author-guidelines',
  '/contact',
  '/editorial-board',
  '/ethics',
  '/ethics-compliance',
  '/events-training',
  '/founder',
  '/gift',
  '/medtech-ai',
  '/privacy',
  '/research-academy',
  '/research-analytics',
  '/research-discovery',
  '/research-guidelines',
  '/research-hub',
  '/research-opportunities',
  '/reviewer-guidelines',
  '/support',
  '/support-rsre',
  '/terms',
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function apiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL || ''
  if (!configured) return ''
  const clean = configured.replace(/\/$/, '')
  return clean.endsWith('/api') ? clean : `${clean}/api`
}

async function fetchPublishedArticleEntries() {
  const base = apiBase()
  if (!base) return []

  try {
    const response = await fetch(`${base}/articles/?is_published=true&page_size=1000`)
    if (!response.ok) return []

    const data = await response.json()
    const items = Array.isArray(data) ? data : data?.results
    if (!Array.isArray(items)) return []

    return items
      .filter((article: any) => article && article.id != null)
      .map((article: any) => ({
        path: `/articles/${encodeURIComponent(String(article.id))}`,
        lastmod: article.updated_at || article.published_date || undefined,
      }))
  } catch {
    return []
  }
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const dynamicArticles = await fetchPublishedArticleEntries()
  const seen = new Set<string>()
  const entries: Array<{ path: string; lastmod?: string }> = []

  for (const path of PUBLIC_PATHS) {
    if (!seen.has(path)) {
      seen.add(path)
      entries.push({ path })
    }
  }

  for (const entry of dynamicArticles) {
    if (!seen.has(entry.path)) {
      seen.add(entry.path)
      entries.push(entry)
    }
  }

  const urls = entries.map((entry) => {
    const lastmod = entry.lastmod ? new Date(entry.lastmod) : null
    const lastmodXml = lastmod && !Number.isNaN(lastmod.getTime())
      ? `<lastmod>${lastmod.toISOString()}</lastmod>`
      : ''

    return [
      '  <url>',
      `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
      lastmodXml ? `    ${lastmodXml}` : '',
      '  </url>',
    ].filter(Boolean).join('\n')
  }).join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function SitemapXml() {
  return null
}
