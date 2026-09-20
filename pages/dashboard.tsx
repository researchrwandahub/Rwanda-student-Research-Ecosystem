import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Award, Bell, BookOpen, FlaskConical, FolderOpen, FileText, Lightbulb, Search, ShieldCheck } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../utils/api'

type DashboardData = {
  user?: { name: string; email: string; role: string }
  applications?: any[]
  notifications_unread?: number
  notifications?: any[]
  support_open?: number
  activity?: { research_projects: number; opportunities_active: number; passport_evidence: number; articles: number }
}

type ManuscriptSummary = {
  total_manuscripts: number
  drafts: number
  submitted: number
  revision_required: number
  editorial_decision: number
  published: number
}

// Where to explore next — a compact list, not six identical colourful cards.
const explore = [
  { href: '/research-academy/dashboard', icon: BookOpen, title: 'Research Academy', text: 'Continue learning, practical labs and certificates.' },
  { href: '/research-discovery', icon: Search, title: 'Research Discovery', text: 'Find evidence, authors, institutions and topics.' },
  { href: '/research-incubator', icon: Lightbulb, title: 'Research Incubator', text: 'Turn an idea into a structured research project.' },
  { href: '/research-sandbox', icon: FlaskConical, title: 'Research Sandbox', text: 'Experiment safely with data and methods.' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [manuscripts, setManuscripts] = useState<ManuscriptSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/rsre/dashboard/'),
      api.get('/author/dashboard/'),
    ]).then(([dash, ms]) => {
      setData(dash.status === 'fulfilled' ? dash.value.data : null)
      setManuscripts(ms.status === 'fulfilled' ? ms.value.data : null)
    }).finally(() => setLoading(false))
  }, [])

  // All hooks run unconditionally, before any conditional return (Rules of Hooks).
  const activity = data?.activity || { research_projects: 0, opportunities_active: 0, passport_evidence: 0, articles: 0 }
  const notifications = data?.notifications || []
  const firstName = (data?.user?.name || 'Researcher').split(' ')[0]
  const roleLabel = data?.user?.role ? data.user.role.replace(/_/g, ' ') : 'researcher'

  // "What needs your attention" — a real, prioritised list, not a KPI wall.
  const attention = useMemo(() => {
    const items: { label: string; detail: string; href: string }[] = []
    if (manuscripts && manuscripts.revision_required > 0) items.push({ label: 'Manuscript revision requested', detail: `${manuscripts.revision_required} manuscript${manuscripts.revision_required === 1 ? '' : 's'} awaiting your revision.`, href: '/dashboard/manuscripts' })
    if (data?.notifications_unread) items.push({ label: 'Unread notifications', detail: `${data.notifications_unread} update${data.notifications_unread === 1 ? '' : 's'} waiting for you.`, href: '/notifications' })
    if (activity.opportunities_active > 0) items.push({ label: 'Opportunities closing soon', detail: `${activity.opportunities_active} active opportunit${activity.opportunities_active === 1 ? 'y' : 'ies'} may need a decision.`, href: '/research-opportunities' })
    if (manuscripts && manuscripts.drafts > 0) items.push({ label: 'Draft manuscript waiting', detail: `${manuscripts.drafts} draft${manuscripts.drafts === 1 ? '' : 's'} not yet submitted to RSJH.`, href: '/dashboard/manuscripts' })
    if (activity.research_projects === 0) items.push({ label: 'No active research project yet', detail: 'Turn a question into a structured project in the Incubator.', href: '/research-incubator' })
    if (activity.passport_evidence === 0) items.push({ label: 'Research Passport is empty', detail: 'Record your first piece of evidence — a course, project or review.', href: '/research-passport' })
    if (items.length === 0) items.push({ label: 'You are caught up', detail: 'Nothing urgent right now. Use the time to explore or keep building.', href: '/research-discovery' })
    return items.slice(0, 4)
  }, [data?.notifications_unread, activity.opportunities_active, activity.research_projects, activity.passport_evidence, manuscripts])

  const nextAction = attention[0]

  if (loading) return <Layout><main className="rsre-page py-12"><div className="rsre-empty">Loading your research workspace…</div></main></Layout>
  if (!data) return <Layout><main className="rsre-page py-12"><div className="rsjh-card p-8"><h1 className="text-2xl font-semibold text-ink">Your dashboard could not load.</h1><p className="mt-2 text-graphite-600">Please refresh or sign in again.</p></div></main></Layout>

  return <Layout>
    <main className="rsre-page py-10 md:py-12">

      {/* ============ HEADER: quiet, editorial — not a gradient hero ============ */}
      <div className="flex flex-col gap-2 border-b border-graphite-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="rsre-kicker">Your research workspace · {roleLabel}</div>
          <h1 className="rsjh-title mt-3 text-3xl md:text-4xl">Welcome back, {firstName}.</h1>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/submit" className="rsjh-button-primary">Submit manuscript</Link>
          <Link href="/profile" className="rsre-action-secondary">Update profile</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">

        {/* ============ MAIN COLUMN ============ */}
        <div>
          {/* What needs your attention */}
          <section>
            <h2 className="rsre-section-title text-xl">What needs your attention</h2>
            <div className="mt-4 divide-y divide-graphite-200 border-t border-graphite-200">
              {attention.map((item, i) => (
                <Link key={item.label} href={item.href} className="group flex items-center gap-4 py-4">
                  <span className="font-serif-display text-lg text-graphite-400">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink">{item.label}</div>
                    <p className="mt-0.5 text-sm text-graphite-600">{item.detail}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-graphite-400 transition group-hover:translate-x-1 group-hover:text-canopy-700" />
                </Link>
              ))}
            </div>
          </section>

          {/* Continue where you left off — one dominant action, not a KPI card */}
          <section className="mt-8 rounded-md border border-canopy-100 bg-canopy-50 p-6">
            <div className="rsre-kicker text-canopy-700">Continue where you left off</div>
            <div className="mt-2 text-xl font-semibold text-ink">{nextAction.label}</div>
            <p className="mt-1 text-sm text-graphite-700">{nextAction.detail}</p>
            <Link href={nextAction.href} className="rsjh-button-primary mt-4">Continue<ArrowRight size={16}/></Link>
          </section>

          {/* What you're currently working on — inline metadata strip, not five cards */}
          <section className="mt-10">
            <h2 className="rsre-section-title text-xl">What you're working on</h2>
            <div className="mt-4 grid grid-cols-2 gap-6 border-t border-graphite-200 pt-6 sm:grid-cols-4">
              {[
                [FolderOpen, activity.research_projects, 'Research projects', '/research-incubator'],
                [Award, activity.passport_evidence, 'Passport evidence', '/research-passport'],
                [FileText, manuscripts ? manuscripts.total_manuscripts : activity.articles, 'My manuscripts', '/dashboard/manuscripts'],
                [Bell, data.notifications_unread || 0, 'Unread updates', '/notifications'],
              ].map(([Icon, value, label, href]: any) => (
                <Link key={label} href={href} className="group">
                  <div className="rsre-kpi-value">{value}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-graphite-500 group-hover:text-canopy-700"><Icon size={13}/> {label}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* What to explore next — compact list, one accent, not six colours */}
          <section className="mt-10">
            <h2 className="rsre-section-title text-xl">What to explore next</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {explore.map(({ href, icon: Icon, title, text }) => (
                <Link href={href} key={title} className="rsjh-card rsjh-card-hover flex items-start gap-4 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-canopy-50 text-canopy-700"><Icon size={17}/></span>
                  <div>
                    <div className="font-semibold text-ink">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-graphite-600">{text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ============ RIGHT RAIL: identity + notifications ============ */}
        <div className="space-y-8 lg:border-l lg:border-graphite-200 lg:pl-8">
          <div>
            <div className="rsre-kicker">Research identity</div>
            <p className="mt-3 text-sm leading-6 text-graphite-700">Learning, projects, evidence and publications build one Research Passport over time.</p>
            <Link href="/research-passport" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-canopy-700">Open Research Passport <ArrowRight size={14}/></Link>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="rsre-kicker">Recent activity</div>
              <Link href="/notifications" className="text-xs font-semibold text-canopy-700">View all</Link>
            </div>
            <div className="mt-3 divide-y divide-graphite-200">
              {notifications.slice(0, 4).map((item: any) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0">
                  <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.is_read ? 'bg-graphite-300' : 'bg-canopy-600'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{item.title}</div>
                    <p className="mt-0.5 text-xs leading-5 text-graphite-500">{item.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <div className="rsre-empty">You are all caught up.</div>}
            </div>
          </div>

          <div className="border-t border-graphite-200 pt-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-parchment-panel text-canopy-700 ring-1 ring-graphite-200"><ShieldCheck size={16}/></span>
            <p className="mt-3 text-sm leading-6 text-graphite-700">RSRE connects learning, evidence, projects and publication without forcing you through the Academy — your record reflects the work you actually do.</p>
          </div>
        </div>
      </div>
    </main>
  </Layout>
}
