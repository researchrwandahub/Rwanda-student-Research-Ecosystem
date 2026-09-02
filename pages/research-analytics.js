import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ApplicationShell from '../components/ApplicationShell'
import api from '../utils/api'

function Metric({ label, value, hint }) {
  return <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</div><div className="mt-3 text-4xl font-black tracking-tight text-slate-950">{value ?? '—'}</div>{hint && <div className="mt-2 text-sm text-slate-500">{hint}</div>}</div>
}

function BarList({ title, subtitle, items, empty='No published data yet.', action }) {
  const max = Math.max(...items.map(x => Number(x.count || 0)), 1)
  return <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-black text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{action}</div>
    <div className="mt-6 space-y-4">{items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}{items.slice(0,8).map((item,index)=><div key={`${item.name}-${index}`}><div className="mb-1 flex items-center justify-between gap-4 text-sm"><span className="truncate font-bold text-slate-700">{item.name}</span><span className="font-black text-slate-950">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{width:`${Math.max(Number(item.count||0)/max*100,3)}%`}}/></div></div>)}</div>
  </section>
}

function Trend({ items }) {
  const max = Math.max(...items.map(x => Number(x.count || 0)), 1)
  return <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm"><div className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">Publication growth</div><h3 className="mt-2 text-2xl font-black">Published research by year</h3><p className="mt-1 text-sm text-slate-400">Use the shape of the curve as a signal, not as proof of future growth.</p><div className="mt-8 flex min-h-[220px] items-end gap-3 overflow-x-auto">{items.length===0&&<p className="text-sm text-slate-400">No publication trend data yet.</p>}{items.map(item=><div key={item.year} className="flex min-w-[48px] flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-black text-slate-300">{item.count}</span><div className="w-full rounded-t-xl bg-emerald-400" style={{height:`${Math.max(Number(item.count||0)/max*170,8)}px`}}/><span className="text-[11px] font-bold text-slate-400">{item.year}</span></div>)}</div></section>
}

function Signal({ label, text, href='/research-discovery' }) {
  return <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"><div className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">{label}</div><div className="mt-2 font-black text-slate-950 group-hover:text-emerald-700">{text}</div><div className="mt-2 text-sm text-slate-500">Explore the evidence →</div></Link>
}

export default function Analytics() {
  const [data,setData]=useState({diseases:[],universities:[],specialties:[],publications:[]})
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [tab,setTab]=useState('overview')

  useEffect(()=>{let active=true;Promise.all([api.get('/analytics/top-diseases/'),api.get('/analytics/geography/'),api.get('/analytics/specialties/'),api.get('/analytics/publications-trend/')]).then(([d,u,s,p])=>{if(!active)return;setData({diseases:d.data?.diseases||[],universities:u.data?.universities||[],specialties:s.data?.specialties||[],publications:p.data?.publications||[]})}).catch(()=>active&&setError('Some analytics could not be loaded. Please try again.')).finally(()=>active&&setLoading(false));return()=>{active=false}},[])

  const metrics=useMemo(()=>({published:data.publications.reduce((sum,x)=>sum+Number(x.count||0),0),institutions:data.universities.length,areas:data.specialties.length,topTopic:data.diseases[0]?.name||'—',topArea:data.specialties[0]?.name||'—'}),[data])
  const tabs=[['overview','Overview'],['topics','Topics & diseases'],['institutions','Institutions'],['trends','Trends']]

  return <ApplicationShell name="Research Analytics" description="Explore research activity and turn evidence signals into better research questions." nav={[["/research-analytics","Overview"],["/research-discovery","Discovery"],["/research-opportunities","Opportunities"],["/research-incubator","Incubator"],["/research-passport","Passport"]]}>
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10"><div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Research intelligence</div><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">What is being researched — and where might the next question be?</h2><p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">Analytics summarizes published evidence into interpretable signals. It does not decide what research should be done; it helps you ask sharper questions.</p><div className="mt-6 flex flex-wrap gap-2">{tabs.map(([value,label])=><button key={value} onClick={()=>setTab(value)} className={`rounded-full px-4 py-2 text-sm font-black ${tab===value?'bg-emerald-400 text-slate-950':'bg-white/10 text-white hover:bg-white/15'}`}>{label}</button>)}</div></div></section>

      {error&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div>}
      {loading?<div className="mt-7 rounded-3xl bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">Loading research signals…</div>:<>
        <section className="mt-7 grid gap-5 md:grid-cols-4"><Metric label="Published records" value={metrics.published} hint="Publication activity represented in the trend data."/><Metric label="Institutions" value={metrics.institutions} hint="Institutions appearing in published author records."/><Metric label="Research areas" value={metrics.areas} hint="Specialty categories with published records."/><Metric label="Top topic signal" value={metrics.topTopic} hint={`Leading keyword signal; top area: ${metrics.topArea}.`}/></section>

        {tab==='overview'&&<>
          <section className="mt-6 grid gap-6 lg:grid-cols-2"><Trend items={data.publications}/><BarList title="Top research areas" subtitle="Where published activity is concentrated." items={data.specialties}/><BarList title="Institutions" subtitle="Publication volume by author university." items={data.universities}/><BarList title="Diseases studied" subtitle="Keyword signals across published titles, abstracts and keywords." items={data.diseases}/></section>
          <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6"><h3 className="text-xl font-black text-slate-950">Signals to investigate</h3><p className="mt-1 text-sm text-slate-500">These are starting points for exploration, not claims of an actual research gap.</p><div className="mt-4 grid gap-4 md:grid-cols-3"><Signal label="Topic signal" text={`Explore ${metrics.topTopic} research`}/><Signal label="Specialty signal" text={`Compare ${metrics.topArea} evidence`}/><Signal label="Next move" text="Search the literature before writing a protocol"/></div></section>
        </>}

        {tab==='topics'&&<section className="mt-6 grid gap-6 lg:grid-cols-2"><BarList title="Diseases studied" subtitle="Keyword signals detected in published content." items={data.diseases}/><BarList title="Research specialties" subtitle="Specialty categories represented in publication activity." items={data.specialties}/></section>}
        {tab==='institutions'&&<section className="mt-6"><BarList title="Institution activity" subtitle="Publication volume by author university. This is not a university ranking." items={data.universities}/></section>}
        {tab==='trends'&&<section className="mt-6"><Trend items={data.publications}/><div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">Read trends carefully</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Publication counts describe what is represented in the available RSJH data. They do not measure research quality, clinical importance, funding, or unmet need by themselves.</p></div></section>}
      </>}
    </main>
  </ApplicationShell>
}
