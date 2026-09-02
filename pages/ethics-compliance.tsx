import { useEffect, useMemo, useState } from 'react'
import ApplicationShell from '../components/ApplicationShell'
import { getToken } from '../lib/auth.js'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Assessment = {
  id: number; title: string; target_type: string; risk_level: string; status: string;
  guidance: string; user_notes: string;
  involves_human_participants: boolean; involves_vulnerable_groups: boolean;
  uses_identifiable_or_sensitive_data: boolean; uses_existing_public_data: boolean;
  biological_samples_or_interventions: boolean; ai_or_automated_decision_support: boolean
}
type Resource = { id:number; title:string; resource_type:string; summary:string; url:string }

const riskTone: Record<string, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  moderate: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-rose-200 bg-rose-50 text-rose-800',
}

const factors = [
  ['involves_human_participants','Human participants','People are directly recruited, interviewed, observed, examined, or enrolled.'],
  ['involves_vulnerable_groups','Vulnerable groups','Children or other groups may need additional safeguards or protections.'],
  ['uses_identifiable_or_sensitive_data','Identifiable / sensitive data','Names, IDs, health information, or other sensitive personal data are involved.'],
  ['uses_existing_public_data','Existing public data','You are using an existing dataset that is already publicly available.'],
  ['biological_samples_or_interventions','Samples / interventions','Biological samples, clinical procedures, devices, or interventions are involved.'],
  ['ai_or_automated_decision_support','AI / automated decision support','AI or automation will materially influence analysis, decisions, or recommendations.'],
] as const

export default function EthicsCompliance() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const token = getToken()
  const [form, setForm] = useState({
    title:'', target_type:'project', involves_human_participants:false,
    involves_vulnerable_groups:false, uses_identifiable_or_sensitive_data:false,
    uses_existing_public_data:false, biological_samples_or_interventions:false,
    ai_or_automated_decision_support:false, user_notes:''
  })

  const headers = { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }

  async function load() {
    if (!token) { setLoading(false); return }
    const [a, r] = await Promise.all([
      fetch(`${API}/api/rsre/ethics/assessments/`, {headers}).then(x=>x.ok ? x.json() : []),
      fetch(`${API}/api/rsre/ethics/resources/`).then(x=>x.ok ? x.json() : []),
    ])
    setAssessments(Array.isArray(a) ? a : [])
    setResources(Array.isArray(r) ? r : [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [token])

  const selectedAssessment = useMemo(()=>assessments.find(a=>a.id===selectedId) || null, [assessments, selectedId])
  const selectedFactors = useMemo(()=>factors.filter(([key])=>Boolean(form[key])), [form])

  function toggle(key: keyof typeof form){ setForm({...form,[key]:!form[key]}) }
  function reset(){ setForm({title:'',target_type:'project',involves_human_participants:false,involves_vulnerable_groups:false,uses_identifiable_or_sensitive_data:false,uses_existing_public_data:false,biological_samples_or_interventions:false,ai_or_automated_decision_support:false,user_notes:''}); setStep(1) }

  async function createAssessment(e: React.FormEvent){
    e.preventDefault(); if(!form.title.trim()) return
    setBusy(true)
    const res = await fetch(`${API}/api/rsre/ethics/assessments/`, {method:'POST',headers,body:JSON.stringify(form)})
    if(res.ok){ const created = await res.json(); await load(); setSelectedId(created.id); reset() }
    setBusy(false)
  }

  return <ApplicationShell name="Ethics & Compliance" description="A practical research-readiness guide for privacy, participants, data governance and integrity." nav={[["/ethics-compliance","Readiness"],["/research-academy","Academy"],["/research-incubator","Incubator"],["/research-sandbox","Sandbox"]]}>
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 space-y-8">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Research readiness</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Know what needs attention before you begin.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">RSRE helps you spot common participant, privacy, data-governance and AI considerations early. It prepares you for the right conversation with your institution or competent authority.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 lg:max-w-xs">
            <div className="font-bold text-white">What this is</div>
            <p className="mt-2 leading-6">A readiness guide—not an ethics approval, exemption, or regulatory authorization.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={createAssessment} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Guided check</p><h2 className="mt-1 text-2xl font-black text-slate-950">Build your readiness snapshot</h2></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Step {step} of 3</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">{[1,2,3].map(n=><div key={n} className={`h-2 rounded-full ${n<=step?'bg-emerald-500':'bg-slate-200'}`}/>)}</div>

          {step===1 && <div className="mt-7 space-y-4"><label className="block"><span className="text-sm font-bold text-slate-700">What are you assessing?</span><input className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="e.g. Community hypertension survey" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="block"><span className="text-sm font-bold text-slate-700">Research context</span><select className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={form.target_type} onChange={e=>setForm({...form,target_type:e.target.value})}><option value="project">Research project</option><option value="sandbox">Sandbox workspace</option><option value="academy_lab">Academy practical lab</option><option value="other">Other research activity</option></select></label><p className="text-sm leading-6 text-slate-500">Start with the activity itself. You can refine the details in later steps.</p></div>}

          {step===2 && <div className="mt-7 space-y-3"><p className="text-sm font-semibold text-slate-700">Select anything that applies. Choosing nothing is okay.</p>{factors.map(([key,label,help])=><label key={key} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${form[key]?'border-emerald-300 bg-emerald-50/60':'border-slate-200 hover:bg-slate-50'}`}><input className="mt-1" type="checkbox" checked={Boolean(form[key])} onChange={()=>toggle(key as keyof typeof form)}/><span><span className="block font-bold text-slate-900">{label}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{help}</span></span></label>)}</div>}

          {step===3 && <div className="mt-7 space-y-5"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm font-black text-slate-900">Your snapshot</p><p className="mt-2 text-sm text-slate-600">{selectedFactors.length ? `${selectedFactors.length} consideration${selectedFactors.length>1?'s':''} selected.` : 'No special considerations selected yet.'}</p>{selectedFactors.length>0 && <div className="mt-3 flex flex-wrap gap-2">{selectedFactors.map(([,label])=><span key={label} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{label}</span>)}</div>}</div><label className="block"><span className="text-sm font-bold text-slate-700">Optional notes</span><textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 p-3" placeholder="Anything specific you are unsure about?" value={form.user_notes} onChange={e=>setForm({...form,user_notes:e.target.value})}/></label><p className="text-xs leading-5 text-slate-500">Your submitted snapshot is saved to your RSRE account so you can revisit it later.</p></div>}

          <div className="mt-7 flex flex-wrap justify-between gap-3"><button type="button" disabled={step===1} onClick={()=>setStep(step-1)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40">Back</button>{step<3?<button type="button" disabled={step===1 && !form.title.trim()} onClick={()=>setStep(step+1)} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">Continue</button>:<button disabled={busy || !token} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">{busy?'Preparing guidance…':'Get readiness guidance'}</button>}</div>
        </form>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Your work</p><h2 className="mt-1 text-2xl font-black text-slate-950">Saved assessments</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{assessments.length}</span></div>
          {loading?<p className="mt-6 text-sm text-slate-500">Loading…</p>:assessments.length===0?<div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-600">No assessments yet. Start the guided check to create your first readiness record.</div>:<div className="mt-5 space-y-3">{assessments.map(a=><button type="button" key={a.id} onClick={()=>setSelectedId(a.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId===a.id?'border-emerald-300 bg-emerald-50/60':'border-slate-200 hover:bg-slate-50'}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{a.title}</h3><p className="mt-1 text-xs text-slate-500">{a.target_type.replace('_',' ')} · {a.status}</p></div><span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${riskTone[a.risk_level] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{a.risk_level}</span></div></button>)}</div>}
        </div>
      </section>

      {selectedAssessment && <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Guidance ready</p><h2 className="mt-1 text-2xl font-black text-slate-950">{selectedAssessment.title}</h2><p className="mt-1 text-sm text-slate-500">{selectedAssessment.target_type.replace('_',' ')} · {selectedAssessment.status}</p></div><span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase ${riskTone[selectedAssessment.risk_level] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{selectedAssessment.risk_level} attention</span></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div><h3 className="text-sm font-black uppercase tracking-wider text-slate-500">What to review</h3><div className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selectedAssessment.guidance}</div></div><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-900">Next action</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use this guidance to prepare your protocol, data plan, consent approach, or institutional review pathway before proceeding.</p><a href="/research-incubator" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Open Incubator</a><a href="/research-sandbox" className="mt-2 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Open Sandbox</a></div></div></section>}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Learn and prepare</p><h2 className="mt-1 text-2xl font-black text-slate-950">Integrity & governance resources</h2></div><a href="/research-academy" className="text-sm font-bold text-emerald-700">Learn in Academy →</a></div><div className="mt-5 grid gap-4 md:grid-cols-2">{resources.map(r=><article key={r.id} className="rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">{r.resource_type}</p><h3 className="mt-2 font-black text-slate-900">{r.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{r.summary}</p>{r.url&&<a className="mt-3 inline-block text-sm font-bold underline" href={r.url} target="_blank" rel="noreferrer">Open resource</a>}</article>)}</div></section>
    </main>
  </ApplicationShell>
}
