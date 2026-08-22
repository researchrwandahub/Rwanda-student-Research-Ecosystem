import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ApplicationShell from '../components/ApplicationShell'
import api from '../utils/api'

type Workspace = { id:number; title:string; description:string; research_topic:string; visibility:string; status:string; notes:any[]; datasets:any[]; updated_at?:string }

const tools = [
  ['Notebook', 'Write methods, observations, decisions and reproducibility notes.'],
  ['Data room', 'Track public, synthetic and authorized datasets with safety status.'],
  ['Analysis board', 'Record what you tested, why you tested it and what you learned.'],
  ['Reproducibility', 'Keep assumptions, transformations and decisions visible.'],
]

export default function ResearchSandbox(){
  const [workspaces,setWorkspaces]=useState<Workspace[]>([])
  const [title,setTitle]=useState('')
  const [topic,setTopic]=useState('')
  const [description,setDescription]=useState('')
  const [error,setError]=useState('')
  const load=async()=>{try{setError(''); const r=await api.get('/research-sandbox/'); setWorkspaces(r.data)}catch(e:any){setError(e?.response?.data?.detail||'Sign in to use the Research Sandbox.')}}
  useEffect(()=>{load()},[])
  const create=async()=>{if(!title.trim())return; try{await api.post('/research-sandbox/',{title, research_topic:topic, description}); setTitle('');setTopic('');setDescription('');load()}catch(e:any){setError(e?.response?.data?.detail||'Could not create workspace.')}}
  return <ApplicationShell name="Research Sandbox" description="A private research workbench for experimentation, analysis and reproducibility." nav={[["/research-sandbox","Sandbox"],["/research-incubator","Incubator"],["/research-discovery","Discovery"],["/research-analytics","Analytics"]]}>
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-6">
      <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/60 p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Your research workbench</div>
        <div className="mt-2 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
          <div><h2 className="text-4xl font-black text-slate-950">Experiment, inspect, document, repeat.</h2><p className="mt-4 max-w-3xl leading-8 text-slate-600">Sandbox is where you test an idea before it becomes a formal research project. It does not replace Academy practical labs and it does not manage Incubator projects.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{tools.map(([a,b])=><div key={a} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="font-black text-slate-900">{a}</div><div className="mt-1 text-sm leading-6 text-slate-600">{b}</div></div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white"><div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Boundary</div><div className="mt-3 text-2xl font-black">Sandbox ≠ publication</div><p className="mt-3 text-sm leading-6 text-slate-300">Work here stays separate from the protected RSJH editorial workflow. A promising result can be taken into the Incubator when you are ready.</p><div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm font-bold">Academy → Sandbox → Incubator → RSJH</div></div>
        </div>
      </section>
      {error&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}
      <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-cyan-200 bg-cyan-50/60 p-6"><div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Notebook</div><h3 className="mt-2 text-xl font-black">Document every decision.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Keep methods, observations, transformations and assumptions together.</p></div><div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Data room</div><h3 className="mt-2 text-xl font-black">Know what your data is.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Track provenance, sensitivity, access status and authorized use.</p></div><div className="rounded-3xl border border-violet-200 bg-violet-50/60 p-6"><div className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Analysis board</div><h3 className="mt-2 text-xl font-black">Make experiments reproducible.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Record what you tested, why it changed and what you learned.</p></div></section>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Start a workbench</div><h3 className="mt-1 text-2xl font-black text-slate-950">Create a sandbox workspace</h3></div><div className="text-xs font-bold text-slate-500">Private by default</div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><input aria-label="Workspace title" className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Workspace title" value={title} onChange={e=>setTitle(e.target.value)}/><input aria-label="Research topic" className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Research topic" value={topic} onChange={e=>setTopic(e.target.value)}/><textarea aria-label="Workspace purpose" className="md:col-span-2 rounded-xl border border-slate-300 px-4 py-3" rows={3} placeholder="What are you testing, analyzing or documenting?" value={description} onChange={e=>setDescription(e.target.value)}/></div>
        <button onClick={create} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Open workspace</button>
      </section>
      <section className="mt-8"><div className="flex items-end justify-between"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Your work</div><h3 className="mt-1 text-2xl font-black text-slate-950">Sandbox workspaces</h3></div><div className="text-sm font-bold text-slate-500">{workspaces.length} workspace{workspaces.length===1?'':'s'}</div></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{workspaces.map(w=><article key={w.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{w.visibility}</div><h4 className="mt-1 text-2xl font-black text-slate-950">{w.title}</h4></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{w.status}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{w.description || 'No purpose statement yet.'}</p><div className="mt-2 text-xs font-bold text-slate-500">Topic: {w.research_topic || 'Not specified'}</div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-black">{w.notes?.length||0}</div><div className="text-xs font-bold text-slate-500">Notes</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-black">{w.datasets?.length||0}</div><div className="text-xs font-bold text-slate-500">Datasets</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-black">—</div><div className="text-xs font-bold text-slate-500">Runs</div></div></div><Link href={`/research-sandbox/${w.id}`} className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50">Open workbench →</Link></article>)}{!workspaces.length&&!error&&<div className="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">Your first sandbox workspace will appear here.</div>}</div></section>
    </main>
  </ApplicationShell>
}
