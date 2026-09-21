import Head from 'next/head'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rsre-frontend.onrender.com').replace(/\/$/, '')

type Author = {
  full_name?: string
  username?: string
  university?: string
}

type Article = {
  id: number | string
  title: string
  abstract?: string
  specialty?: string
  keywords?: string
  pdf?: string
  published_date?: string
  volume?: string | number
  issue?: string | number
  doi?: string
  article_type?: string
  author?: Author
}

function cleanDescription(value?: string) {
  const text = (value || 'Public research article published through the Rwanda Student Journal for Health within the RSRE ecosystem.')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 300 ? `${text.slice(0, 297)}...` : text
}

export default function RSREArticleSeo({ article }: { article: Article }) {
  const canonical = `${SITE_URL}/articles/${encodeURIComponent(String(article.id))}`
  const description = cleanDescription(article.abstract)
  const authorName = article.author?.full_name || article.author?.username

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    description,
    url: canonical,
    mainEntityOfPage: canonical,
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: 'Rwanda Student Journal for Health',
    },
  }

  if (article.published_date) jsonLd.datePublished = article.published_date
  if (article.keywords) jsonLd.keywords = article.keywords
  if (article.pdf) jsonLd.url = canonical
  if (authorName) {
    jsonLd.author = {
      '@type': 'Person',
      name: authorName,
      ...(article.author?.university ? { affiliation: { '@type': 'Organization', name: article.author.university } } : {}),
    }
  }

  return (
    <Head>
      <title>{`${article.title} | RSJH Journal | RSRE`}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={`${article.title} | RSJH Journal`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Research Support and Research Ecosystem" />
      <meta property="og:image" content={`${SITE_URL}/logo.png`} />
      {article.published_date && <meta property="article:published_time" content={article.published_date} />}
      {article.specialty && <meta property="article:section" content={article.specialty} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${article.title} | RSJH Journal`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  )
}
