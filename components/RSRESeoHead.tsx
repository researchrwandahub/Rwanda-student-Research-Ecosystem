import Head from 'next/head'
import { useRouter } from 'next/router'
import { SITE } from '../config/site'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rsre-frontend.onrender.com').replace(/\/$/, '')
const DEFAULT_DESCRIPTION =
  'RSRE (Research Support and Research Ecosystem) connects research learning, evidence discovery, opportunities, collaboration, research development and publication support.'

const PUBLIC_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE.name} | RSRE`,
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: `About RSRE | ${SITE.shortName}`,
    description: 'Learn what the Research Support and Research Ecosystem is, why it was built, and how its research and publication components fit together.',
  },
  '/articles': {
    title: `RSJH Journal | ${SITE.shortName}`,
    description: 'Browse publicly available research articles from the Rwanda Student Journal for Health within the RSRE ecosystem.',
  },
  '/archive': {
    title: `Research Archive | ${SITE.shortName}`,
    description: 'Explore the public RSRE research archive and publication resources.',
  },
  '/research-academy': {
    title: `Research Academy | ${SITE.shortName}`,
    description: 'Research learning and skills development resources within the Research Support and Research Ecosystem.',
  },
  '/research-discovery': {
    title: `Research Discovery | ${SITE.shortName}`,
    description: 'Discover scientific literature and evidence through RSRE research discovery tools and connected scholarly sources.',
  },
  '/research-opportunities': {
    title: `Research Opportunities | ${SITE.shortName}`,
    description: 'Find research opportunities and external research resources available through the RSRE ecosystem.',
  },
  '/research-analytics': {
    title: `Research Analytics | ${SITE.shortName}`,
    description: 'Explore public research and publication activity represented in RSRE analytics.',
  },
  '/events-training': {
    title: `Events & Training | ${SITE.shortName}`,
    description: 'Explore RSRE research sessions, practical clinics and training opportunities.',
  },
  '/editorial-board': {
    title: `Editorial Board | RSJH Journal`,
    description: 'Learn about the editorial structure supporting the Rwanda Student Journal for Health publication workflow.',
  },
  '/author-guidelines': {
    title: `Author Guidelines | RSJH Journal`,
    description: 'Guidance for researchers preparing and submitting manuscripts to the Rwanda Student Journal for Health.',
  },
  '/reviewer-guidelines': {
    title: `Reviewer Guidelines | RSJH Journal`,
    description: 'Guidance for reviewers participating in the Rwanda Student Journal for Health review process.',
  },
  '/ethics': {
    title: `Research Ethics | ${SITE.shortName}`,
    description: 'Research ethics information and guidance within the RSRE research ecosystem.',
  },
  '/ethics-compliance': {
    title: `Ethics & Compliance | ${SITE.shortName}`,
    description: 'A research-readiness guide for participant, privacy, data-governance and related ethics considerations.',
  },
  '/research-guidelines': {
    title: `Research Guidelines | ${SITE.shortName}`,
    description: 'Research community and practice guidance provided through RSRE.',
  },
  '/research-hub': {
    title: `Research Hub | ${SITE.shortName}`,
    description: 'Research resources and public research ecosystem information from RSRE.',
  },
  '/medtech-ai': {
    title: `Research Assistance | ${SITE.shortName}`,
    description: 'Learn how the RSRE research-assistance capability is positioned to support researchers while keeping scientific and editorial decisions with people.',
  },
  '/contact': {
    title: `Contact RSRE | ${SITE.shortName}`,
    description: 'Contact the Research Support and Research Ecosystem for platform, research and publication enquiries.',
  },
  '/support': {
    title: `Help & Support | ${SITE.shortName}`,
    description: 'Get platform and application support through the RSRE Help Desk and support workflow.',
  },
  '/support-rsre': {
    title: `Support RSRE | ${SITE.shortName}`,
    description: 'Support research learning, infrastructure and research-development activities within the RSRE ecosystem.',
  },
  '/terms': {
    title: `Terms | ${SITE.shortName}`,
    description: 'Terms governing use of the RSRE platform.',
  },
  '/privacy': {
    title: `Privacy | ${SITE.shortName}`,
    description: 'Privacy information for users of the RSRE platform.',
  },
  '/gift': {
    title: `Support a Researcher | ${SITE.shortName}`,
    description: 'A sponsor-side RSRE gifting flow for supporting research development without buying publication or editorial preference.',
  },
  '/founder': {
    title: `RSRE | ${SITE.name}`,
    description: `The ${SITE.name} platform and its research ecosystem.` ,
  },
}

const PRIVATE_PREFIXES = [
  '/auth',
  '/dashboard',
  '/rsre-admin',
  '/profile',
  '/notifications',
  '/submit',
  '/review',
  '/collaboration',
  '/research-incubator',
  '/research-sandbox',
  '/research-passport',
  '/author/dashboard',
  '/founder/dashboard',
  '/articles/create',
  '/research-academy/admin',
  '/research-academy/dashboard',
  '/research-academy/module',
  '/research-academy/certificate',
  '/research-academy/certificates',
  '/research-academy/diagnostic',
  '/research-academy/labs',
  '/research-academy/questions',
]

function isPrivate(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function getMeta(pathname: string) {
  if (PUBLIC_META[pathname]) return PUBLIC_META[pathname]
  if (pathname.startsWith('/articles/')) {
    return {
      title: `Research Article | RSJH Journal | ${SITE.shortName}`,
      description: 'Public research article published through the Rwanda Student Journal for Health within the RSRE ecosystem.',
    }
  }
  if (pathname.startsWith('/passport/')) {
    // Public passport pages already provide their own user-specific Head metadata.
    return null
  }
  return {
    title: `${SITE.name} | ${SITE.shortName}`,
    description: DEFAULT_DESCRIPTION,
  }
}

export default function RSRESeoHead() {
  const router = useRouter()
  const pathname = router.pathname || router.asPath.split('?')[0].split('#')[0]

  if (pathname.startsWith('/passport/') || pathname.startsWith('/articles/') || pathname === '/404' || pathname === '/500') return null

  const meta = getMeta(pathname)
  const privatePage = isPrivate(pathname)
  const canonical = `${SITE_URL}${router.asPath.split('?')[0].split('#')[0]}`.replace(/\/$/, '') || SITE_URL

  const organizationJsonLd = !privatePage && pathname === '/'
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        alternateName: SITE.shortName,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
      }
    : null

  return (
    <Head>
      <title>{privatePage ? `RSRE | ${SITE.shortName}` : meta?.title}</title>
      <meta name="description" content={privatePage ? 'Private RSRE workspace.' : meta?.description || DEFAULT_DESCRIPTION} />
      <meta name="robots" content={privatePage ? 'noindex,nofollow,noarchive' : 'index,follow'} />
      <meta name="googlebot" content={privatePage ? 'noindex,nofollow,noarchive' : 'index,follow'} />
      {!privatePage && <link rel="canonical" href={canonical} />}
      {!privatePage && <meta property="og:title" content={meta?.title || SITE.name} />}
      {!privatePage && <meta property="og:description" content={meta?.description || DEFAULT_DESCRIPTION} />}
      {!privatePage && <meta property="og:type" content={pathname.startsWith('/articles/') ? 'article' : 'website'} />}
      {!privatePage && <meta property="og:url" content={canonical} />}
      {!privatePage && <meta property="og:site_name" content={SITE.name} />}
      {!privatePage && <meta property="og:image" content={`${SITE_URL}/logo.png`} />}
      {!privatePage && <meta name="twitter:card" content="summary" />}
      {!privatePage && <meta name="twitter:title" content={meta?.title || SITE.name} />}
      {!privatePage && <meta name="twitter:description" content={meta?.description || DEFAULT_DESCRIPTION} />}
      {!privatePage && <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />}
      {organizationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      )}
    </Head>
  )
}




