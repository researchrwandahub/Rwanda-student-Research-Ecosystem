import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ApplicationShell from '../../../components/ApplicationShell'
import api from '../../../utils/api'

export default function ModulePage(){
  const router=useRouter()
  const [data,setData]=useState<any>(null)
  const [certs,setCerts]=useState<any>({modules:[],levels:[],pathways:[]})
  const [enhancements,setEnhancements]=useState<any>({my_badges:[]})
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [answers,setAnswers]=useState<Record<string,string[]>>({})
  const [loadingDownload,setLoadingDownload]=useState(false)
  const [loadingCertificate,setLoadingCertificate]=useState(false)
  const id=router.query.id

  async function loadCredentials(){
    if(!id) return
    try{
      const [m,c,e]=await Promise.all([
        api.get(`/academy/modules/${id}/`),
        api.get('/academy/certificates/').catch(()=>({data:{modules:[],levels:[],pathways:[]}})),
        api.get('/academy/enhancements/').catch(()=>({data:{my_badges:[]}})),
      ])
      setData(m.data); setCerts(c.data); setEnhancements(e.data||{my_badges:[]})
    }catch(e:any){
      setError(e?.response?.data?.detail||'This module is locked.')
    }
  }

  useEffect(()=>{loadCredentials()},[id])

  const complete=async(lesson:number)=>{
    try{
      await api.post(`/academy/lessons/${lesson}/complete/`)
      setMessage('✓ Progress saved.')
      await loadCredentials()
    }catch(e:any){setMessage(e?.response?.data?.detail||'Could not save progress.')}
  }

  const submit=async()=>{
    try{
      const r=await api.post(`/academy/quizzes/${data.quiz.id}/submit/`,{answers})
      setMessage(r.data.passed?`✓ ${r.data.score}% — assessment passed. Your credentials are being prepared.`:`${r.data.score}% — review the lessons and try again.`)
      await loadCredentials()
    }catch(e:any){setMessage(e?.response?.data?.detail||'Could not submit assessment.')}
  }

  const moduleCertificate=useMemo(()=>
    (certs.modules||[]).find((c:any)=>Number(c.module)===Number(data?.id)),
    [certs.modules,data?.id]
  )

  const moduleBadge=useMemo(()=>
    (enhancements.my_badges||[]).find((b:any)=>String(b.evidence||'').includes(`module_completed=${data?.slug}`)),
    [enhancements.my_badges,data?.slug]
  )

  async function downloadPdf(path:string,filename:string,setter:(v:boolean)=>void){
    setter(true)
    try{
      const response=await api.get(path,{responseType:'blob'})
      const url=URL.createObjectURL(response.data)
      const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      setMessage('✓ Download ready.')
    }catch(e:any){setMessage(e?.response?.data?.detail||'Could not prepare the download.')}
    finally{setter(false)}
  }

  function downloadBadge(){
    if(!moduleBadge||!data) return
    const title=(moduleBadge.badge__name||data.title).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    const icon=moduleBadge.badge__icon||'🏅'
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700"><rect width="1000" height="700" rx="48" fill="#0f172a"/><circle cx="500" cy="250" r="155" fill="#10b981"/><text x="500" y="290" text-anchor="middle" font-size="120">${icon}</text><text x="500" y="475" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="38" font-weight="700">RSRE RESEARCH ACADEMY</text><text x="500" y="535" text-anchor="middle" fill="#a7f3d0" font-family="Arial, sans-serif" font-size="30" font-weight="700">${title}</text><text x="500" y="590" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="20">Verified module achievement</text></svg>`
    const blob=new Blob([svg],{type:'image/svg+xml'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${data.slug||'academy-module'}-badge.svg`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const shell=(children:any)=><ApplicationShell name="Research Academy" description="Learning module" nav={[["/research-academy","Academy Home"],["/research-academy/dashboard","My Learning"],["/research-academy/certificates","Certificates"]]}>{children}</ApplicationShell>
  if(error)return shell(<main className="mx-auto max-w-4xl px-6 py-16"><div className="rounded-3xl border border-rose-200 bg-rose-50 p-8"><h1 className="text-3xl font-black">Learning locked</h1><p className="mt-3 text-rose-900">{error}</p><Link href="/research-academy" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Back to Academy</Link></div></main>)
  if(!data)return shell(<main className="mx-auto max-w-4xl px-6 py-16"><div className="rounded-3xl bg-white p-8 shadow-sm">Loading module…</div></main>)

  return shell(<main className="mx-auto max-w-5xl px-6 pb-16">
    <div className="rounded-3xl bg-slate-950 p-8 text-white"><div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{data.pathway_name||`Level ${data.level}`}</div><h1 className="mt-3 text-4xl font-black">{data.title}</h1><p className="mt-4 max-w-3xl text-slate-300">{data.summary}</p></div>
    <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><h2 className="text-2xl font-black">Learning objectives</h2><ul className="mt-4 grid gap-3 md:grid-cols-2">{(data.objectives||[]).map((x:string)=><li key={x} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold">✓ {x}</li>)}</ul></section>
    {(data.lessons||[]).map((lesson:any)=><article key={lesson.id} className="mt-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Lesson {lesson.order}</div><h2 className="mt-2 text-2xl font-black">{lesson.title}</h2><div className="mt-5 whitespace-pre-line leading-8 text-slate-700">{lesson.body}</div>{lesson.video_url&&<a href={lesson.video_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 font-black text-white">Open video ↗</a>}<button onClick={()=>complete(lesson.id)} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white">Mark lesson complete ✓</button></article>)}
    {data.quiz&&<section className="mt-6 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-violet-100"><div className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Assessment · Pass {data.quiz.pass_mark}%</div><p className="mt-2 text-sm text-slate-600">This is a foundational knowledge check. New attempts may use a different question set when the module has a larger question bank.</p><h2 className="mt-2 text-3xl font-black">{data.quiz.title}</h2><div className="mt-6 space-y-5">{data.quiz.questions.map((q:any)=><div key={q.id} className="rounded-2xl border border-slate-200 p-5"><div className="font-black">{q.order}. {q.prompt}</div><div className="mt-4 grid gap-2">{q.choices.map((c:any)=><label key={c.id} className="flex items-center gap-3 rounded-xl border p-3"><input type="radio" name={`q-${q.id}`} onChange={()=>setAnswers({...answers,[q.id]:[String(c.id)]})}/><span>{c.text}</span></label>)}</div></div>)}</div><button onClick={submit} className="mt-7 rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Submit assessment</button></section>}

    <section className="mt-6 rounded-3xl bg-emerald-50 p-7 ring-1 ring-emerald-200">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Module achievement</div>
      <h2 className="mt-2 text-3xl font-black text-slate-950">Finish the module, keep the evidence.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">Once all required lessons and the assessment are passed, RSRE issues the module credential and awards eligible badges. Your administrator controls the module content, assessment and credential branding.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <button disabled={loadingDownload} onClick={()=>downloadPdf(`/academy/modules/${data.id}/download/`,`${data.slug||'academy-module'}-module-pack.pdf`,setLoadingDownload)} className="rounded-2xl bg-slate-950 px-5 py-4 text-left font-black text-white disabled:opacity-50">{loadingDownload?'Preparing…':'Download module + assessment PDF'}</button>
        {moduleCertificate?<button disabled={loadingCertificate} onClick={()=>downloadPdf(`/academy/certificates/${moduleCertificate.certificate_id}/download/`,`${moduleCertificate.certificate_id}.pdf`,setLoadingCertificate)} className="rounded-2xl bg-white px-5 py-4 text-left font-black text-slate-950 ring-1 ring-emerald-300 disabled:opacity-50">{loadingCertificate?'Preparing…':'Download certificate'}</button>:<div className="rounded-2xl bg-white/70 p-5 text-sm font-bold text-slate-600">Certificate unlocks automatically after module completion.</div>}
        {moduleBadge?<button onClick={downloadBadge} className="rounded-2xl bg-emerald-600 px-5 py-4 text-left font-black text-white">Download badge</button>:<div className="rounded-2xl bg-white/70 p-5 text-sm font-bold text-slate-600">Badge unlocks automatically after module completion.</div>}
      </div>
      {moduleCertificate&&<div className="mt-5 rounded-2xl bg-white p-4 text-sm font-bold text-emerald-900">✓ Module credential issued: {moduleCertificate.certificate_id}</div>}
      {moduleBadge&&<div className="mt-3 rounded-2xl bg-white p-4 text-sm font-bold text-emerald-900">🏅 {moduleBadge.badge__name} earned.</div>}
      <Link href="/research-academy/certificates" className="mt-5 inline-flex text-sm font-black text-slate-950 underline">View all Academy credentials →</Link>
    </section>
    {message&&<div className="sticky bottom-4 mt-6 rounded-2xl bg-slate-950 p-4 text-center font-bold text-white">{message}</div>}
  </main>)
}
