import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Compass,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Network,
  ShieldCheck,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

type HomeArticle = {
  id: number | string
  title: string
  specialty?: string
  author?: {
    full_name?: string
    username?: string
  }
}

type HomeOpportunity = {
  id: number | string
  title: string
  kind?: string
  deadline?: string | null
}

/*
 * TEMPORARY EXTERNAL RESEARCH NEWS
 *
 * These are links to original publishers while RSRE
 * does not yet have its own Research News database.
 *
 * IMPORTANT:
 * - Do not present these as RSRE-original reporting.
 * - Source and date remain visible.
 * - Images point to the original publisher's image CDN.
 */
const researchNews = [
  {
    source: 'WHO AFRO',
    category: 'Africa · Mental health',
    date: '16 Sep 2026',
    title: 'Strengthening dementia care in the African Region',
    summary:
      'Health leaders from African countries are discussing ways to improve prevention, early diagnosis, care, data and locally relevant dementia research.',
    href: 'https://www.afro.who.int/countries/kenya/news/strengthening-dementia-care-african-region',
    image:
      'https://www.afro.who.int/sites/default/files/styles/1920x1080_top/public/2026-09/WHO_DEMENTIA_REGIONAL_MEETING_SEP_2026-24.jpg.webp?itok=G_MPJNZA',
    imageAlt:
      'Health professionals and delegates attending a regional dementia meeting in Africa',
  },
  {
    source: 'WHO AFRO',
    category: 'Emergency research',
    date: '15 Sep 2026',
    title:
      'The air support behind Ebola response in the Democratic Republic of the Congo',
    summary:
      'The feature examines how humanitarian air operations connect response teams, medicines and essential supplies to affected areas during the Ebola response.',
    href: 'https://www.afro.who.int/countries/democratic-republic-of-congo/news/air-support-behind-ebola-response-democratic-republic-congo',
    image:
      'https://www.afro.who.int/sites/default/files/styles/1920x1080_top/public/2026-09/1M5A5099.JPG.webp?itok=K30lWMCz',
    imageAlt:
      'Humanitarian workers loading health supplies beside an aircraft during the Ebola response',
  },
  {
    source: 'WHO AFRO',
    category: 'Genomics · AMR',
    date: '25 Aug 2026',
    title:
      "Strengthening Tanzania's capacity for genomic surveillance and antimicrobial resistance detection",
    summary:
      'Tanzania is expanding laboratory technology, genomics training and national expertise to support pathogen surveillance and antimicrobial-resistance detection.',
    href: 'https://afro.who.int/countries/united-republic-of-tanzania/news/strengthening-tanzanias-capacity-genomic-surveillance-and-antimicrobial-resistance-detection',
    image:
      'https://afro.who.int/sites/default/files/styles/1920x1080_top/public/2026-09/786819650_1379847884322910_3246681769817008034_n%20%281%29.jpg.webp?itok=3KwumRY9',
    imageAlt:
      'Researchers and health professionals reviewing scientific materials and data in Tanzania',
  },
  {
    source: 'WHO AFRO',
    category: 'AI · Malaria',
    date: '13 May 2026',
    title:
      'Zanzibar launches AI-powered drone technology initiative to advance malaria elimination efforts',
    summary:
      'A Zanzibar initiative is testing AI-powered drones, aerial mapping and entomological monitoring to strengthen evidence generation for malaria vector control.',
    href: 'https://www.afro.who.int/countries/united-republic-tanzania/news/zanzibar-launches-ai-powered-drone-technology-initiative',
    image:
      'https://www.afro.who.int/sites/default/files/styles/1920x1080_top/public/2026-05/IMG_3016.JPG.webp?itok=eqU6NV2C',
    imageAlt:
      'Health partners at the launch of an AI-supported malaria technology initiative in Zanzibar',
  },
]

const journey = [
  {
    n: '01',
    href: '/research-discovery',
    icon: Compass,
    title: 'Start with a question',
    text: 'Search local RSJH research alongside PubMed, OpenAlex and Crossref to see what is already known before you commit to a direction.',
  },
  {
    n: '02',
    href: '/research-academy',
    icon: GraduationCap,
    title: 'Learn what the question needs',
    text: 'The Academy is organised by competency, not by course length. Come in at foundations, or skip ahead if you already have the skill.',
  },
  {
    n: '03',
    href: '/research-opportunities',
    icon: Target,
    title: 'Find what makes it possible',
    text: 'Grants, fellowships, mentorships and calls, kept current, so a good question does not stall for lack of a way to pursue it.',
  },
  {
    n: '04',
    href: '/research-incubator',
    icon: FlaskConical,
    title: 'Turn it into a project',
    text: 'Move from an idea to a structured project with a team, a protocol and milestones you can actually track.',
  },
  {
    n: '05',
    href: '/collaboration',
    icon: Users,
    title: 'Work with the right people',
    text: 'Find collaborators and mentors by what they actually work on, for a specific piece of the project you need help with.',
  },
  {
    n: '06',
    href: '/articles',
    icon: BookOpen,
    title: 'Publish and be counted',
    text: "Submit to RSJH, the ecosystem's journal component. Free to submit, free to review, free to read.",
  },
]

const homepageImages = [
  {
    src: '/images/medical-students.jpg',
    alt: 'Medical students collaborating on research',
    eyebrow: 'Research in practice',
    caption: 'Learn and build research skills together.',
  },
  {
    src: '/images/healthcare-rwanda.jpg',
    alt: 'Healthcare and health research in Rwanda',
    eyebrow: 'Rwanda health context',
    caption: 'Connect research with Rwanda health priorities.',
  },
  {
    src: '/images/gorilla.jpg',
    alt: 'Rwanda biodiversity and science context',
    eyebrow: 'Science in context',
    caption: 'Explore health, science and discovery in context.',
  },
  {
    src: '/images/medtech.jpg',
    alt: 'Medical technology and research infrastructure',
    eyebrow: 'Research and technology',
    caption: 'Use responsible technology to strengthen research.',
  },
]

const marqueeItems = [
  'Research Academy',
  'Research Discovery',
  'Research Opportunities',
  'Research Incubator',
  'Research Sandbox',
  'Research Passport',
  'Collaboration Network',
  'Ethics & Compliance',
  'RSJH Journal',
  'Evidence to Action',
]

const commitments = [
  [
    HeartHandshake,
    'RSJH is free',
    'No student pays to submit, peer review or publish.',
  ],
  [
    BookOpen,
    'Academy is optional',
    'Already have research skills? Start at the point that matches them, not at lesson one.',
  ],
  [
    ShieldCheck,
    'Human oversight stays',
    'AI assists with search and drafting. Researchers, reviewers and editors remain responsible for the work.',
  ],
  [
    Network,
    'One research identity',
    'Learning, projects, evidence and publications build a single Research Passport over time.',
  ],
] as const

export default function Home() {
  const [homeArticles, setHomeArticles] = useState<HomeArticle[]>([])
  const [homeOpportunities, setHomeOpportunities] = useState<HomeOpportunity[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    Promise.allSettled([
      api.get('/articles/?status=published&is_published=true'),
      api.get('/research-opportunities/'),
    ]).then(([articles, opportunities]) => {
      if (articles.status === 'fulfilled') {
        const data = articles.value.data?.results || articles.value.data || []

        setHomeArticles(
          Array.isArray(data) ? data.slice(0, 3) : [],
        )
      }

      if (opportunities.status === 'fulfilled') {
        const data =
          opportunities.value.data?.results ||
          opportunities.value.data ||
          []

        setHomeOpportunities(
          Array.isArray(data)
            ? data
                .filter(
                  (item: HomeOpportunity) =>
                    !item.deadline ||
                    new Date(item.deadline) >= new Date(),
                )
                .slice(0, 3)
            : [],
        )
      }

      setFeedLoading(false)
    })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % homepageImages.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const currentImage = homepageImages[slide]

  return (
    <Layout>
      <main className="rsre-home">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative isolate min-h-[720px] overflow-hidden border-b border-graphite-200 bg-ink dark:border-white/10">

          {/* FULL-BLEED HERO IMAGE */}
          <div
            className="absolute inset-0 -z-20"
            aria-hidden="true"
          >
            {homepageImages.map((image, index) => (
              <img
                key={image.src}
                src={image.src}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
                  index === slide ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          {/* STRONG SCRIM FOR WHITE TEXT */}
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,12,9,.96)_0%,rgba(5,12,9,.90)_32%,rgba(5,12,9,.64)_60%,rgba(5,12,9,.22)_100%)]"
            aria-hidden="true"
          />

          <div
            className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent"
            aria-hidden="true"
          />

          {/* HERO CONTENT */}
          <div className="rsre-page relative z-10 flex min-h-[720px] items-center py-14 md:py-20">
            <div className="w-full max-w-2xl">

              <div className="inline-flex items-center border-l-2 border-white pl-4 text-sm font-semibold tracking-wide text-white">
                Research Support and Research Ecosystem
              </div>

              <h1 className="mt-6 max-w-3xl font-serif-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                A research question rarely fails for lack of ideas.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/90 md:text-lg md:leading-8">
                It stalls for lack of evidence, a mentor, an opportunity, or
                a clear next step. RSRE keeps those pieces in one place — for
                students and early-career researchers in Rwanda and the region
                who are ready to do the work, but need the surrounding support
                to start it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/research-discovery"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-parchment"
                >
                  Search research
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/research-academy"
                  className="inline-flex items-center rounded-md border border-white/35 bg-black/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/35"
                >
                  Start learning
                </Link>

                <Link
                  href="/research-incubator"
                  className="inline-flex items-center rounded-md border border-white/35 bg-black/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/35"
                >
                  Build a project
                </Link>
              </div>

              {/* HERO IMAGE CAPTION / CONTROLS */}
              <div className="mt-12 max-w-lg border-l border-white/30 pl-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                  {currentImage.eyebrow}
                </div>

                <div className="mt-2 text-sm leading-6 text-white/85">
                  {currentImage.caption}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSlide(
                        (current) =>
                          (current - 1 + homepageImages.length) %
                          homepageImages.length,
                      )
                    }
                    aria-label="Previous homepage image"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-black/25 text-white transition hover:bg-black/45"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {homepageImages.map((image, index) => (
                      <button
                        key={image.src}
                        type="button"
                        aria-label={`Show homepage image ${index + 1}`}
                        aria-pressed={index === slide}
                        onClick={() => setSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === slide
                            ? 'w-8 bg-white'
                            : 'w-2.5 bg-white/45 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSlide(
                        (current) =>
                          (current + 1) % homepageImages.length,
                      )
                    }
                    aria-label="Next homepage image"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-black/25 text-white transition hover:bg-black/45"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ECOSYSTEM WAYFINDING
        ====================================================== */}
        <section className="border-y border-graphite-200 bg-white py-4 dark:border-white/10 dark:bg-ink">
          <div className="rsre-marquee-viewport">
            <div className="rsre-marquee-track text-graphite-500 dark:text-parchment/55">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <div
                  className="rsre-marquee-item"
                  key={`${item}-${index}`}
                >
                  <span className="text-canopy-600 dark:text-canopy-300">
                    ·
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            RESEARCH JOURNEY
        ====================================================== */}
        <section className="rsre-page py-16 md:py-20">
          <div className="rsre-page-heading">
            <div className="rsre-kicker">How RSRE actually gets used</div>

            <h2 className="rsre-section-title mt-2">
              One ecosystem, one path through it.
            </h2>

            <p className="mt-4">
              Each stage below is a real workspace with its own data and
              workflow. You do not have to start at the beginning — come in
              wherever your work actually is.
            </p>
          </div>

          <div className="mt-10 divide-y divide-graphite-200 border-t border-graphite-200 dark:divide-white/10 dark:border-white/10">
            {journey.map(
              ({ n, href, icon: Icon, title, text }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-8"
                >
                  <div className="flex items-center gap-4 sm:w-64 sm:shrink-0">
                    <span className="font-serif-display text-2xl text-graphite-400">
                      {n}
                    </span>

                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-canopy-50 text-canopy-700 dark:bg-white/10 dark:text-canopy-300">
                      <Icon size={18} />
                    </span>

                    <span className="font-semibold text-ink dark:text-parchment">
                      {title}
                    </span>
                  </div>

                  <p className="flex-1 text-sm leading-6 text-graphite-700 dark:text-parchment/70">
                    {text}
                  </p>

                  <ArrowRight
                    size={16}
                    className="hidden shrink-0 text-graphite-400 transition group-hover:translate-x-1 group-hover:text-canopy-700 sm:block"
                  />
                </Link>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            RESEARCH NEWS & UPDATES
            WHO-AFRO-INSPIRED EDITORIAL STRUCTURE
        ====================================================== */}
        <section className="border-y border-graphite-200 bg-[#f2eee5] dark:border-white/10 dark:bg-[#151c18]">
          <div className="rsre-page py-16 md:py-20">

            {/* NEWS HEADER */}
            <div className="flex flex-col gap-6 border-b border-graphite-300 pb-8 dark:border-white/10 md:flex-row md:items-end md:justify-between">

              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-canopy-700 dark:text-canopy-300">
                  <Globe2 size={18} />

                  <span className="text-xs font-black uppercase tracking-[0.18em]">
                    Research news & updates
                  </span>
                </div>

                <h2 className="mt-3 font-serif-display text-3xl font-semibold leading-tight tracking-tight text-ink dark:text-white md:text-4xl">
                  What is moving health research across Africa and beyond?
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-graphite-700 dark:text-white/65 md:text-base">
                  Selected stories from trusted research and public-health
                  institutions. For now, RSRE links directly to the original
                  publishers while its own Research News workflow is being
                  developed.
                </p>
              </div>

              <div className="shrink-0 border-l-2 border-canopy-600 pl-4 dark:border-canopy-300">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-graphite-500 dark:text-white/45">
                  Global research desk
                </div>

                <div className="mt-1 text-sm font-semibold text-ink dark:text-white/75">
                  Africa · Health · Evidence
                </div>
              </div>
            </div>

            {/* FEATURED + LATEST */}
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">

              {/* FEATURED ARTICLE */}
              <a
                href={researchNews[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative min-h-[500px] overflow-hidden bg-black"
              >
                <img
                  src={researchNews[0].image}
                  alt={researchNews[0].imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" />

                <div className="absolute left-6 top-6">
                  <span className="inline-flex bg-canopy-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                    Featured
                  </span>
                </div>

                <div className="relative z-10 flex min-h-[500px] flex-col justify-end p-7 md:p-9">

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/75">
                    <span className="text-canopy-300">
                      {researchNews[0].source}
                    </span>

                    <span className="text-white/30">·</span>

                    <span>
                      {researchNews[0].category}
                    </span>

                    <span className="text-white/30">·</span>

                    <span>
                      {researchNews[0].date}
                    </span>
                  </div>

                  <h3 className="mt-4 max-w-2xl font-serif-display text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
                    {researchNews[0].title}
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 md:text-base">
                    {researchNews[0].summary}
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">
                    Read original story
                    <ExternalLink
                      size={15}
                      className="text-canopy-300"
                    />
                  </div>
                </div>
              </a>

              {/* LATEST NEWS COLUMN */}
              <div>

                <div className="mb-4 flex items-center justify-between border-b border-graphite-300 pb-4 dark:border-white/10">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-ink dark:text-white">
                    Latest research news
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-graphite-500 dark:text-white/40">
                    External sources
                  </div>
                </div>

                <div className="divide-y divide-graphite-300 border-y border-graphite-300 dark:divide-white/10 dark:border-white/10">

                  {researchNews.slice(1).map((item) => (
                    <a
                      key={`${item.source}-${item.title}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid gap-4 py-5 sm:grid-cols-[120px_1fr]"
                    >

                      {/* ARTICLE IMAGE */}
                      <div className="relative h-24 overflow-hidden bg-graphite-200 sm:h-[88px]">
                        <img
                          src={item.image}
                          alt={item.imageAlt}
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* ARTICLE TEXT */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-[0.10em]">
                          <span className="text-canopy-700 dark:text-canopy-300">
                            {item.source}
                          </span>

                          <span className="text-graphite-400 dark:text-white/20">
                            ·
                          </span>

                          <span className="text-graphite-500 dark:text-white/40">
                            {item.date}
                          </span>
                        </div>

                        <h3 className="mt-2 text-base font-semibold leading-6 text-ink transition group-hover:text-canopy-700 dark:text-white dark:group-hover:text-canopy-300">
                          {item.title}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-graphite-500 dark:text-white/45">
                          <span>{item.category}</span>

                          <ArrowRight
                            size={13}
                            className="transition group-hover:translate-x-1 group-hover:text-canopy-700 dark:group-hover:text-canopy-300"
                          />
                        </div>

                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* NEWS FOOTER */}
            <div className="mt-8 flex flex-col gap-4 border-t border-graphite-300 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">

              <div className="max-w-xl text-xs leading-5 text-graphite-500 dark:text-white/40">
                RSRE is a research support platform, not a news publisher. The stories above are linked directly to the original publishers, and RSRE does not take responsibility for their content.
              </div>

              <a
                href="https://www.afro.who.int/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-canopy-700 dark:text-white dark:hover:text-canopy-300"
              >
                Visit WHO AFRO newsroom
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* =====================================================
            COMMITMENTS
        ====================================================== */}
        <section className="border-y border-graphite-800 bg-ink text-parchment dark:border-white/10">
          <div className="rsre-page grid gap-10 py-16 md:grid-cols-2 md:items-start">

            {commitments.map(([Icon, title, text]) => (
              <div key={title} className="flex gap-4">

                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-canopy-300 ring-1 ring-white/10">
                  <Icon size={16} />
                </span>

                <div>
                  <div className="font-semibold text-parchment">
                    {title}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-parchment/70">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            REAL RSJH + OPPORTUNITIES
        ====================================================== */}
        <section className="rsre-page py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2">

            {/* JOURNAL */}
            <div className="rsjh-card p-7">
              <div className="flex items-end justify-between gap-4">

                <div className="min-w-0">
                  <div className="rsre-kicker">
                    RSJH
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-ink dark:text-parchment">
                    Latest published research
                  </h2>
                </div>

                <Link
                  href="/articles"
                  className="shrink-0 text-sm font-semibold text-canopy-700 dark:text-canopy-300"
                >
                  View journal →
                </Link>
              </div>

              <div className="mt-5 divide-y divide-graphite-200 dark:divide-white/10">

                {feedLoading ? (
                  <div className="rsre-empty">
                    Loading published work…
                  </div>
                ) : homeArticles.length ? (
                  homeArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      className="block py-4 first:pt-0 hover:text-canopy-700"
                    >
                      <div className="break-words font-semibold text-ink dark:text-parchment">
                        {article.title}
                      </div>

                      <div className="mt-1 rsre-meta">
                        {article.specialty || 'Health research'} ·{' '}
                        {article.author?.full_name ||
                          article.author?.username ||
                          'RSJH author'}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rsre-empty">
                    No published articles are available yet.
                  </div>
                )}
              </div>
            </div>

            {/* OPPORTUNITIES */}
            <div className="rsjh-card p-7">
              <div className="flex items-end justify-between gap-4">

                <div className="min-w-0">
                  <div className="rsre-kicker">
                    Opportunities
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-ink dark:text-parchment">
                    What could move your research forward
                  </h2>
                </div>

                <Link
                  href="/research-opportunities"
                  className="shrink-0 text-sm font-semibold text-canopy-700 dark:text-canopy-300"
                >
                  Browse all →
                </Link>
              </div>

              <div className="mt-5 divide-y divide-graphite-200 dark:divide-white/10">

                {feedLoading ? (
                  <div className="rsre-empty">
                    Loading opportunities…
                  </div>
                ) : homeOpportunities.length ? (
                  homeOpportunities.map((opportunity) => (
                    <Link
                      key={opportunity.id}
                      href="/research-opportunities"
                      className="block py-4 first:pt-0 hover:text-canopy-700"
                    >
                      <div className="break-words font-semibold text-ink dark:text-parchment">
                        {opportunity.title}
                      </div>

                      <div className="mt-1 rsre-meta">
                        {opportunity.kind || 'Research opportunity'}

                        {opportunity.deadline
                          ? ` · Deadline ${opportunity.deadline}`
                          : ''}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rsre-empty">
                    No active opportunities are currently listed.
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            SUPPORT
        ====================================================== */}
        <section className="rsre-page pb-20">
          <div className="rounded-md bg-ink px-8 py-12 text-parchment md:px-12 md:py-16">

            <div className="max-w-2xl">

              <div className="text-sm font-semibold italic text-canopy-300">
                Support the ecosystem
              </div>

              <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                Help keep research access open.
              </h2>

              <p className="mt-4 leading-7 text-parchment/80">
                Partners and supporters can strengthen infrastructure,
                mentorship and open publication — without purchasing editorial
                influence over what gets published.
              </p>

              <Link
                href="/support-rsre"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-parchment px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
              >
                Support RSRE
                <ArrowRight size={15} />
              </Link>

            </div>
          </div>
        </section>

      </main>
    </Layout>
  )
}