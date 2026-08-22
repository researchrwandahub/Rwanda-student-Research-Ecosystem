import Link from 'next/link'
import ApplicationShell from '../components/ApplicationShell'

const formats=[
  ['Live research sessions','Interactive workshops, methods clinics and research conversations.'],
  ['Practical clinics','Focused sessions on statistics, protocol design, scientific writing and research tools.'],
  ['Expert learning','Optional external masterclasses and expert resources for researchers who want to go deeper.'],
  ['Research community','Events where students, mentors, reviewers and research teams can meet around real work.'],
]

export default function Events(){
  return <ApplicationShell name="Events & Training" description="Live sessions, practical clinics and optional expert learning around the RSRE research journey." nav={[["/events-training","Events"],["/research-academy","Academy"],["/research-opportunities","Opportunities"],["/collaboration","Community"]]}>
    <main className="mx-auto max-w-7xl px-6 pb-16">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Learn together</div>
        <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">Events should move research forward, not just fill a calendar.</h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">RSRE events connect learning to practical work: a statistics clinic can improve a project analysis, a writing session can strengthen a manuscript, and a methods conversation can help a student choose a better design.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/research-academy" className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950">Explore Academy</Link><Link href="/collaboration" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white">Find researchers</Link></div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{formats.map(([title,text])=><article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">RSRE format</div><h3 className="mt-2 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p></article>)}</section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Upcoming</div><h3 className="mt-2 text-3xl font-black">No public sessions are scheduled yet.</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">When a live event service is connected, this page will carry the date, format, learning outcome, speaker information and registration route. Until then, use the live Academy and research workspaces rather than a fake event feed.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/research-academy" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Continue learning</Link><Link href="/research-opportunities" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800">View opportunities</Link></div></div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7"><div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Optional expert learning</div><h3 className="mt-2 text-2xl font-black text-amber-950">External resources belong here as enrichment.</h3><p className="mt-3 text-sm leading-7 text-amber-900">External videos, courses and masterclasses should supplement the RSRE curriculum. Core learning, practical tasks and RSRE assessments remain inside the ecosystem.</p></div>
      </section>
    </main>
  </ApplicationShell>
}
