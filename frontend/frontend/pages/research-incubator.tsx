import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ApplicationShell from '../components/ApplicationShell';
import api from '../api';

const STATUS_LABELS: Record<string, string> = {
  developing: 'Developing', protocol: 'Protocol', ethics: 'Ethics & governance', data_collection: 'Data collection',
  analysis: 'Analysis', manuscript: 'Manuscript', publication: 'Publication', completed: 'Completed', paused: 'Paused'
};
const STATUS_ORDER = ['developing','protocol','ethics','data_collection','analysis','manuscript','publication','completed'];

type Idea = { id:number; title:string; problem:string; research_question?:string; objectives?:string; methodology?:string; tags?:string; discipline?:string; status:string };
type Project = {
  id:number; title:string; research_question?:string; objectives?:string; background?:string; methodology?:string; discipline?:string; study_type?:string;
  status:string; ethics_status:string; data_governance_status:string; readiness_score:number; mentor?:number|null; mentor_profile?:any; visibility:string;
  members?:any[]; milestones?:any[]; target_completion_date?:string|null; updated_at?:string;
};

export default function ResearchIncubator() {
  const [ideas,setIdeas]=useState<Idea[]>([]); const [projects,setProjects]=useState<Project[]>([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState('');
  const [form,setForm]=useState({title:'',problem:'',research_question:'',objectives:'',methodology:'',discipline:'',tags:''});
  async function load(){setLoading(true);try{const [a,p]=await Promise.all([api.get('/research-ideas/'),api.get('/research-projects/')]);setIdeas(a.data?.results||a.data||[]);setProjects(p.data?.results||p.data||[]);}catch{setIdeas([]);setProjects([])}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  async function createIdea(e:FormEvent){e.preventDefault();setSaving(true);setMessage('');try{await api.post('/research-ideas/',form);setForm({title:'',problem:'',research_question:'',objectives:'',methodology:'',discipline:'',tags:''});setMessage('Research idea saved. Refine it before turning it into a project.');await load()}catch(err:any){setMessage(err?.response?.data?.detail||'Could not save the research idea.')}finally{setSaving(false)}}
  async function convertIdea(id:number){try{await api.post(`/research-ideas/${id}/convert-to-project/`,{});setMessage('Idea converted into a project. Open the project cockpit to continue.');await load()}catch(err:any){setMessage(err?.response?.data?.detail||'Could not convert this idea.')}}
  const active=useMemo(()=>projects.filter(p=>p.status!=='completed'),[projects]);
  const nextProject=active[0];
  return <ApplicationShell name="Research Incubator" description="Build and run real research projects with structure, people, milestones and governance." nav={[["/research-incubator","Incubator"],["/research-discovery","Discovery"],["/collaboration","People"],["/ethics-compliance","Governance"],["/research-passport","Passport"]]}>
    <main className="mx-auto max-w-7xl px-6 pb-16">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Research project cockpit</div>
        <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-tight">From a promising idea to a research project that can actually move.</h2>
        <p className="mt-4 max-w-4xl leading-8 text-slate-300">The Incubator is for real projects. Define the question, assemble the team, prepare governance, complete milestones and make the work publication-ready.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-5">{['Question','Protocol','Governance','Research','Output'].map((x,i)=><div key={x} className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black text-emerald-300">0{i+1}</div><div className="mt-1 font-black">{x}</div></div>)}</div>
      </section>

      {message && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</div>}

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-400">Active projects</div><div className="mt-2 text-3xl font-black">{active.length}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-400">Ideas in queue</div><div className="mt-2 text-3xl font-black">{ideas.filter(i=>i.status!=='converted').length}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-400">Milestones completed</div><div className="mt-2 text-3xl font-black">{projects.reduce((n,p)=>n+(p.milestones||[]).filter(m=>m.status==='done').length,0)}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-400">Next action</div><div className="mt-2 text-sm font-black text-emerald-700">{nextProject?`Continue â€œ${nextProject.title.slice(0,28)}${nextProject.title.length>28?'â€¦':''}`:'Create your first project'}</div></div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
        <form onSubmit={createIdea} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Idea intake</div><h3 className="mt-2 text-2xl font-black text-slate-950">Start with a real problem.</h3><p className="mt-2 text-sm leading-6 text-slate-500">Academy completion is not required. Bring your existing skills and experience.</p>
          <div className="mt-6 space-y-4">{[['title','Working title','e.g. Barriers to hypertension follow-upâ€¦'],['discipline','Discipline','Public Health, Medicine, Nursing'],['tags','Keywords','malaria, adherence, primary care']].map(([k,l,p])=><label key={k} className="block"><span className="text-sm font-black text-slate-700">{l}</span><input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"/></label>)}{[['problem','Problem / gap','What is happening and why does it matter?'],['research_question','Research question','What exactly do you want to find out?'],['objectives','Objectives','What will the study accomplish?']].map(([k,l,p])=><label key={k} className="block"><span className="text-sm font-black text-slate-700">{l}</span><textarea value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"/></label>)}<button disabled={saving} className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">{saving?'Savingâ€¦':'Save idea'}</button></div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Active work</div><h3 className="mt-2 text-2xl font-black text-slate-950">Projects in motion</h3></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{active.length} active</span></div>
          <div className="mt-6 space-y-4">{loading?<div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">Loading projectsâ€¦</div>:active.length===0?<div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Your project cockpit will appear here after you convert an idea.</div>:active.map(p=>{const pct=p.readiness_score||0;const done=(p.milestones||[]).filter(m=>m.status==='done').length;const total=(p.milestones||[]).length;return <article key={p.id} className="rounded-2xl border border-slate-100 p-5 hover:border-emerald-200"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-black uppercase tracking-wide text-slate-400">{STATUS_LABELS[p.status]||p.status}</div><h4 className="mt-1 text-xl font-black text-slate-950">{p.title}</h4><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{p.research_question||p.background||'Research question still needs refinement.'}</p></div><div className="text-right"><div className="text-2xl font-black text-emerald-700">{pct}%</div><div className="text-[11px] font-bold text-slate-400">readiness</div></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{width:`${pct}%`}}/></div><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-lg bg-slate-50 px-3 py-2">Governance: {String(p.ethics_status || '').replace(/_/g, ' ')}</span><span className="rounded-lg bg-slate-50 px-3 py-2">Data: {String(p.data_governance_status || '').replace(/_/g, ' ')}</span><span className="rounded-lg bg-slate-50 px-3 py-2">Milestones: {done}/{total}</span><span className="rounded-lg bg-slate-50 px-3 py-2">Team: {(p.members||[]).length}</span></div><div className="mt-4 flex flex-wrap gap-2"><Link href={`/research-incubator/${p.id}`} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Open project cockpit â†’</Link>{p.status==='ethics'&&<Link href="/ethics-compliance" className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-800">Review governance</Link>}</div></article>})}</div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Idea queue</div><h3 className="mt-2 text-2xl font-black text-slate-950">Questions worth developing</h3></div><Link href="/research-discovery" className="text-sm font-black text-emerald-700">Go to Discovery â†’</Link></div><div className="mt-5 grid gap-4 md:grid-cols-2">{ideas.filter(i=>i.status!=='converted').slice(0,4).map(i=><div key={i.id} className="rounded-2xl border border-slate-100 p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black">{i.title}</h4><div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{i.discipline||'Health research'} Â· {i.status}</div></div><button onClick={()=>convertIdea(i.id)} className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">Build</button></div><p className="mt-3 text-sm leading-6 text-slate-600">{i.problem}</p></div>)}</div></section>
    </main>
  </ApplicationShell>
}

