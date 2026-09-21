import type { GetServerSideProps } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rsre-frontend.onrender.com').replace(/\/$/, '')

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /auth/',
    'Disallow: /dashboard',
    'Disallow: /rsre-admin',
    'Disallow: /profile',
    'Disallow: /notifications',
    'Disallow: /submit',
    'Disallow: /review',
    'Disallow: /collaboration',
    'Disallow: /research-incubator',
    'Disallow: /research-sandbox',
    'Disallow: /research-passport',
    'Disallow: /articles/create',
    'Disallow: /founder/dashboard',
    'Disallow: /author/dashboard',
    'Disallow: /research-academy/admin',
    'Disallow: /research-academy/dashboard',
    'Disallow: /research-academy/module/',
    'Disallow: /research-academy/certificate/',
    'Disallow: /research-academy/certificates',
    'Disallow: /research-academy/diagnostic',
    'Disallow: /research-academy/labs/',
    'Disallow: /research-academy/questions',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.write(body)
  res.end()

  return { props: {} }
}

export default function RobotsTxt() {
  return null
}
