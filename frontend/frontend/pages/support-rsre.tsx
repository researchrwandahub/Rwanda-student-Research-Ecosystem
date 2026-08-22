import Link from 'next/link'
import Layout from '../components/Layout'

export default function SupportRSRE(){
  return <Layout>
    <main className="bg-slate-50">
      <section className="bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-6 py-16 md:py-20"><div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Support RSRE</div><h1 className="mt-3 text-4xl font-black md:text-6xl">Help keep research access open.</h1><p className="mt-5 text-lg leading-8 text-slate-300">RSRE connects students and emerging researchers with learning, discovery, opportunities, research development, collaboration and a free student-centered journal.</p></div></div></section>
      <section className="mx-auto max-w-6xl px-6 py-14"><div className="grid gap-6 lg:grid-cols-3">
        {[["🎓","Research access","Help learners and researchers access training, tools and research-development resources."],["🧪","Research development","Support projects, mentorship, collaboration and responsible research practice."],["🌍","Open publication","Help sustain the infrastructure around RSJH while keeping the journal free for students."]].map(([icon,title,text])=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-3xl">{icon}</div><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-2 leading-7 text-slate-600">{text}</p></div>)}
      </div>
      <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-7"><h2 className="text-2xl font-black text-slate-950">A clear promise to students</h2><p className="mt-3 max-w-4xl leading-8 text-slate-700"><strong>RSJH is free.</strong> Support never buys publication, acceptance, reviewer assignment or editorial preference. Sponsorship is voluntary and exists to strengthen the ecosystem.</p></div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-2xl font-black">Support or sponsor someone</h2><p className="mt-3 leading-8 text-slate-600">A supporter may contribute to RSRE directly or arrange a sponsored research gift for a student or researcher. The recipient receives a gift code by email after the sponsor payment is confirmed; the recipient is never asked to pay for that gift.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/gift" className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white">Sponsor a research gift</Link><Link href="/support" className="rounded-xl border border-slate-200 px-5 py-3 font-black text-slate-800">Contact RSRE</Link></div></div>
      </section>
    </main>
  </Layout>
}
