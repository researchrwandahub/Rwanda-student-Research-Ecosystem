import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ApplicationShell from '../../../components/ApplicationShell'
import api from '../../../utils/api'

export default function PracticalLab(){
  const router=useRouter(); const [lab,setLab]=useState<any>(null); const [response,setResponse]=useState(''); const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(true); const [gen,setGen]=useState<any[]>([])
  useEffect(()=>{ if(!router.query.id) return; setLoading(true); api.get(`/academy/labs/${router.query.id}/`).then(r=>setLab(r.data)).catch(()=>setLab(null)).finally(()=>setLoading(false)) },[router.query.id])
  const criteria=useMemo(()=>Array.isArray(lab?.rubric)?lab.rubric:[],[lab])
  async function submit(){ try{const r=await api.post(`/academy/labs/${router.query.id}/submit/`,{response});setResult(r.data);setResponse('')}catch(e:any){setResult({detail:e?.response?.data?.detail||'Could not submit the lab.'})} }
  async function generate(){ try{const r=await api.post(`/academy/labs/${router.query.id}/generate-questions/`,{count:3});setGen(r.data.questions||[])}catch{setGen([])} }
  return <ApplicationShell name="Practical Lab" description="Practice research skills before applying them to a real project." nav={[["/research-academy","Academy Home"],["/research-academy/dashboard","My Learning"],["/research-academy/certificates","Certificates"]]}>
    <main className="mx-auto max-w-6xl px-6 pb-16">
      {loading?<div className="rounded-3xl bg-white p-8">Loading practical lab…</div>:!lab?<div className="rounded-3xl bg-rose-50 p-8 text-rose-900">This lab is unavailable.</div>:
      <>
        <section className="rounded-[2rem] bg-gradient-to-br from-violet-950 via-slate-900 to-emerald-900 p-8 text-white md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Academy · Practice Lab</div>
          <h1 className="mt-3 max-w-4xl text-4xl font-black md:text-5xl">{lab.title}</h1>
          <p className="mt-4 max-w-3xl text-slate-200">{lab.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-black"><span className="rounded-full bg-white/10 px-3 py-2">Learn by doing</span><span className="rounded-full bg-white/10 px-3 py-2">Attempts are tracked</span><span className="rounded-full bg-white/10 px-3 py-2">Feedback feeds momentum</span></div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Your task</div>
            <div className="mt-3 whitespace-pre-line text-[1.03rem] leading-8 text-slate-700">{lab.instructions||'Apply the method you just learned. Explain your reasoning clearly and keep your assumptions visible.'}</div>
            {criteria.length>0&&<div className="mt-7"><h2 className="text-xl font-black">What good work should show</h2><div className="mt-4 grid gap-3">{criteria.map((c:any,i:number)=><div key={i} className="rounded-2xl bg-slate-50 p-4"><div className="font-black">{c.title||c.name||`Criterion ${i+1}`}</div><div className="mt-1 text-sm text-slate-600">{c.description||c.prompt||'Show a clear, evidence-aware approach.'}</div></div>)}</div></div>}
            <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder="Work through the task here…" className="mt-7 min-h-56 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-emerald-500" />
            <div className="mt-4 flex flex-wrap gap-3"><button onClick={submit} disabled={!response.trim()} className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-40">Submit lab</button><button onClick={generate} className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 font-black text-violet-800">Generate practice questions</button></div>
            {result&&<div className={`mt-5 rounded-2xl p-4 text-sm font-bold ${result.detail?'bg-rose-50 text-rose-900':'bg-emerald-50 text-emerald-900'}`}>{result.detail||`Submission received. ${result.score!==undefined?`Score: ${result.score}%.`:''} Keep going—your next feedback point will appear in your Academy notifications.`}</div>}
          </section>
          <aside className="space-y-6">
            <section className="rounded-3xl bg-slate-950 p-6 text-white"><div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Practice engine</div><h2 className="mt-2 text-2xl font-black">Generate, try, reflect</h2><p className="mt-3 text-sm leading-6 text-slate-300">Questions are for practice. They do not replace the assessed quiz or the real research project.</p>{gen.length>0&&<div className="mt-5 space-y-3">{gen.map((q:any,i:number)=><div key={i} className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black text-emerald-300">Practice {i+1}</div><div className="mt-1 text-sm font-semibold">{q.prompt||q}</div></div>)}</div>}</section>
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Why this is different</div><p className="mt-3 text-sm leading-6 text-emerald-950">Academy labs train skills. Sandbox experiments with data. Incubator manages real studies.</p><Link href="/research-academy/dashboard" className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white">Back to my learning →</Link></section>
          </aside>
        </div>
      </>}
    </main>
  </ApplicationShell>
}
