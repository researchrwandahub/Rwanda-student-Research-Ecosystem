import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Award, Bell, BookOpen, FlaskConical, FolderOpen, Lightbulb, Search, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react'
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

const spaces = [
  { href: '/research-academy/dashboard', icon: BookOpen, title: 'Research Academy', text: 'Continue learning, practical labs and certificates.', tone: 'emerald' },
  { href: '/research-discovery', icon: Search, title: 'Research Discovery', text: 'Find evidence, authors, institutions and topics.', tone: 'blue' },
  { href: '/research-opportunities', icon: Zap, title: 'Opportunities', text: 'See live grants, calls, fellowships and placements.', tone: 'amber' },
  { href: '/research-incubator', icon: Lightbulb, title: 'Research Incubator', text: 'Turn an idea into a structured research project.', tone: 'violet' },
  { href: '/research-sandbox', icon: FlaskConical, title: 'Research Sandbox', text: 'Experiment safely with data and methods.', tone: 'cyan' },
  { href: '/research-passport', icon: Award, title: 'Research Passport', text: 'Build your evidence-backed research record.', tone: 'rose' },
]

const toneMap: Record<string,string> = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700', cyan: 'bg-cyan-50 text-cyan-700', rose: 'bg-rose-50 text-rose-700' }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/rsre/dashboard/').then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><main className="rsre-page py-12"><div className="rsre-panel p-10 text-slate-500">Loading your research workspaceâ€¦</div></main></Layout>
  if (!data) return <Layout><main className="rsre-page py-12"><div className="rsre-panel p-10"><h1 className="text-2xl font-black">Your dashboard could not load.</h1><p className="mt-2 text-slate-500">Please refresh or sign in again.</p></div></main></Layout>

  const activity = data.activity || { research_projects: 0, opportunities_active: 0, passport_evidence: 0, articles: 0 }
  const notifications = data.notifications || []
  const nextNotification = notifications.find((n) => !n.is_read) || notifications[0]
  const firstName = (data.user?.name || 'Researcher').split(' ')[0]

  const roleLabel = data.user?.role ? data.user.role.replace(/_/g, ' ') : 'researcher'

  const nextAction = useMemo(() => {
    if (data.notifications_unread) return { label: 'Review notifications', href: '/notifications', detail: `${data.notifications_unread} update${data.notifications_unread === 1 ? '' : 's'} waiting for you.` }
    if (activity.opportunities_active > 0) return { label: 'Explore opportunities', href: '/research-opportunities', detail: `${activity.opportunities_active} active opportunity${activity.opportunities_active === 1 ? '' : 'ies'} available.` }
    return { label: 'Continue your research journey', href: '/research-academy/dashboard', detail: 'Pick up where you left off or explore another workspace.' }
  }, [activity.opportunities_active, data.notifications_unread])

  return <Layout>
    <main className="rsre-page py-8 md:py-10">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,.2)] md:p-9">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <div className="rsre-kicker text-emerald-300">Your RSRE workspace Â· {roleLabel}</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Welcome back, {firstName}. <span aria-hidden>ðŸ‘‹</span></h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">One place for your learning, research activity, opportunities, collaborations, evidence and publications.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={nextAction.href} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400">{nextAction.label}<ArrowRight size={16}/></Link>
              <Link href="/profile" className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">Update profile</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300"><Sparkles size={15} className="text-emerald-300"/> Suggested next step</div>
            <div className="mt-3 text-xl font-black">{nextAction.label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{nextAction.detail}</p>
          </div>
        </div>
      </section>

      <section className="rsre-stagger mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [Bell, 'Notifications', data.notifications_unread || 0, 'Needs attention', '/notifications'],
          [FolderOpen, 'Projects', activity.research_projects, 'Incubator', '/research-incubator'],
          [Zap, 'Opportunities', activity.opportunities_active, 'Active now', '/research-opportunities'],
          [Award, 'Passport evidence', activity.passport_evidence, 'Recorded', '/research-passport'],
          [BookOpen, 'Journal activity', activity.articles, 'Your articles', '/articles'],
        ].map(([Icon, label, value, meta, href]: any) => <Link href={href} key={label} className="rsre-stat transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-500">{label}</span><Icon size={18} className="text-emerald-600"/></div><div className="mt-3 text-3xl font-black text-slate-950">{value}</div><div className="mt-1 text-xs font-semibold text-slate-400">{meta}</div></Link>)}
      </section>

      <section className="mt-6 lg:hidden">
        <div className="rsre-soft flex gap-2 overflow-x-auto p-2">
          {[['/notifications','Updates'],['/research-academy/dashboard','Learn'],['/research-discovery','Discover'],['/research-opportunities','Opportunities'],['/research-incubator','Projects'],['/research-passport','Passport']].map(([href,label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">{label}</Link>)}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><div><div className="rsre-kicker">Workspaces</div><h2 className="rsre-section-title mt-2">Choose what you need to do next.</h2></div><Link href="/" className="hidden text-sm font-black text-emerald-700 sm:inline-flex">Explore RSRE <ArrowRight size={15} className="ml-1"/></Link></div>
        <div className="rsre-stagger mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spaces.map(({ href, icon: Icon, title, text, tone }) => <Link href={href} key={title} className="rsre-panel group p-5 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between gap-4"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[tone]}`}><Icon size={21}/></div><ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"/></div><h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></Link>)}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rsre-panel p-6 md:p-7">
          <div className="flex items-start justify-between gap-5"><div><div className="rsre-kicker">Recent activity</div><h2 className="mt-2 text-2xl font-black text-slate-950">What RSRE wants you to know</h2></div><Link href="/notifications" className="text-sm font-black text-emerald-700">View all</Link></div>
          <div className="mt-6 divide-y divide-slate-100">{notifications.slice(0,4).map((item: any) => <div key={item.id} className="flex gap-4 py-4 first:pt-0"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read?'bg-slate-300':'bg-emerald-500'}`}/><div className="min-w-0"><div className="font-bold text-slate-900">{item.title}</div><p className="mt-1 text-sm leading-6 text-slate-500">{item.message}</p><div className="mt-2 text-xs font-semibold text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</div></div></div>)}{notifications.length===0&&<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">You are all caught up. Your next important RSRE event will appear here.</div>}</div>
        </div>
        <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-6 md:p-7"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm"><ShieldCheck size={21}/></div><h2 className="mt-5 text-2xl font-black text-slate-950">Your research record matters.</h2><p className="mt-3 text-sm leading-6 text-slate-700">RSRE connects learning, evidence, projects and publication without forcing you through the Academy. Build your record from the work you actually do.</p><Link href="/research-passport" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-800">Open Research Passport <ArrowRight size={15}/></Link></div>
      </section>
    </main>
  </Layout>
}

