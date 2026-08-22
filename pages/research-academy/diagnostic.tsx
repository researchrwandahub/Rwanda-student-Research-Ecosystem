import {useEffect,useState} from 'react'
import ApplicationShell from '../../components/ApplicationShell'
import api from '../../utils/api'

function shuffle<T>(items:T[]){const copy=[...items];for(let i=copy.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}

export default function Diagnostic(){
  const [q,setQ]=useState<any[]>([]); const [title,setTitle]=useState('Research Academy Entry Assessment'); const [ans,setAns]=useState<any>({}); const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(true)
  useEffect(()=>{api.get('/academy/diagnostic/').then(r=>{setTitle(r.data.title||'Research Academy Entry Assessment');setQ(shuffle(r.data.questions||[]).slice(0,Math.min(8,(r.data.questions||[]).length)))}).finally(()=>setLoading(false))},[])
  async function submit(){try{const r=await api.post('/academy/diagnostic/',{answers:ans});setResult(r.data)}catch{setResult({error:'Assessment could not be submitted. Please try again.'})}}
  return <ApplicationShell name="Research Academy" description="Optional beginner diagnostic for flexible entry." nav={[["/research-academy","Academy Home"],["/research-academy/dashboard","My Learning"],["/research-academy/diagnostic","Entry Assessment"]]}>
    <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Optional flexible entry</div><h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-3 max-w-3xl text-slate-300 leading-7">This is a simple starting-point check. It tests foundational research understanding - not advanced statistics, publication expertise or professional certification. You may skip it and start the Academy from Level 1.</p></div>
      {loading?<div className="mt-6 rounded-3xl bg-white p-7 shadow-sm">Loading assessment…</div>:<>
      <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-6"><div className="font-black text-slate-950">How it works</div><p className="mt-2 text-sm leading-6 text-slate-600">Answer the basic questions using what you already know. The result only recommends a sensible starting point. Your Academy modules still teach the concepts from the beginning, and skilled researchers can move directly into other RSRE pillars.</p></div>
      {q.map((x,i)=><div key={i} className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="font-black leading-6">{i+1}. {x.prompt}</div>{(x.options||[]).map((o:string)=><label key={o} className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 hover:border-emerald-300"><input className="mt-1" type="radio" name={`q${i}`} checked={ans[i]===o[0]} onChange={()=>setAns({...ans,[i]:o[0]})}/><span>{o}</span></label>)}</div>)}
      <button onClick={submit} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Submit entry assessment</button>
      {result&&<div className="mt-6 rounded-3xl bg-emerald-50 p-6"><div className="font-black">{result.error?'Assessment error':'Recommended starting point'}</div>{result.error?<div className="mt-2 text-sm text-rose-700">{result.error}</div>:<><div className="mt-2">Score: {result.score}%</div><div>Suggested level: {result.recommended_level}</div></>}</div>}
      </>}
    </main>
  </ApplicationShell>
}
