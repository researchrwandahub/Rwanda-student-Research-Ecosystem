import Link from 'next/link'
import { ArrowRight, BookOpen, Compass, FlaskConical, GraduationCap, HeartHandshake, Network, ShieldCheck, Sparkles, Target, Users, Search, FileText, ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

type HomeArticle = { id:number|string; title:string; specialty?:string; author?:{full_name?:string;username?:string} }
type HomeOpportunity = { id:number|string; title:string; kind?:string; deadline?:string|null }

const pathways = [
  { href: '/research-academy', icon: GraduationCap, label: 'Learn', title: 'Research Academy', text: 'Build competencies from research foundations to professional-level methods and publication.', tone: 'emerald' },
  { href: '/research-discovery', icon: Compass, label: 'Discover', title: 'Research Discovery', text: 'Search local and global evidence, authors, institutions, topics and research gaps.', tone: 'blue' },
  { href: '/research-opportunities', icon: Target, label: 'Find', title: 'Research Opportunities', text: 'Explore grants, funding, scholarships, fellowships, internships, conferences and mentorships.', tone: 'amber' },
  { href: '/research-incubator', icon: FlaskConical, label: 'Build', title: 'Research Incubator', text: 'Turn a promising question into a structured project, team, protocol and milestones.', tone: 'violet' },
  { href: '/research-sandbox', icon: Search, label: 'Experiment', title: 'Research Sandbox', text: 'Practice safely with notebooks, datasets, methods and reproducible analysis.', tone: 'cyan' },
  { href: '/collaboration', icon: Users, label: 'Connect', title: 'Collaboration Network', text: 'Find mentors, collaborators and research partners for a specific purpose.', tone: 'rose' },
]

const homepageImages = [
  { src: '/images/medical-students.jpg', alt: 'Medical students collaborating on research', caption: 'Learn and build research skills together.' },
  { src: '/images/healthcare-rwanda.jpg', alt: 'Healthcare and health research in Rwanda', caption: 'Connect research with Rwanda health priorities.' },
  { src: '/images/gorilla.jpg', alt: 'Rwanda biodiversity and science context', caption: 'Explore health, science and discovery in context.' },
  { src: '/images/medtech.jpg', alt: 'MedTech technology and research infrastructure', caption: 'Use responsible technology to strengthen research.' },
]

const marqueeItems = [
  'Research Academy', 'Research Discovery', 'Research Opportunities', 'Research Incubator',
  'Research Sandbox', 'Research Passport', 'Collaboration Network', 'Ethics & Compliance',
  'RSJH Journal', 'MedTech AI',
]

const trust = [
  ['RSJH is free', 'No student pays to submit, peer review or publish.'],
  ['Academy is optional', 'Existing researchers can enter the ecosystem at the point that matches their skills.'],
  ['Human oversight', 'AI assists; researchers, reviewers, editors and ethics authorities remain responsible.'],
  ['One research identity', 'Learning, projects, evidence, collaborations and publications can build one Research Passport.'],
]

export default function Home(){
  const [stats,setStats]=useState<any>(null)
  const [slide,setSlide]=useState(0)
  const [homeArticles,setHomeArticles]=useState<HomeArticle[]>([])
  const [homeOpportunities,setHomeOpportunities]=useState<HomeOpportunity[]>([])
  const [feedLoading,setFeedLoading]=useState(true)
  useEffect(()=>{api.get('/rsre/config/').then(r=>setStats(r.data)).catch(()=>{})},[])
  useEffect(()=>{Promise.allSettled([api.get('/articles/?status=published&is_published=true'), api.get('/research-opportunities/')]).then(([a,o])=>{if(a.status==='fulfilled'){const d=a.value.data?.results||a.value.data||[];setHomeArticles(Array.isArray(d)?d.slice(0,3):[])} if(o.status==='fulfilled'){const d=o.value.data?.results||o.value.data||[];setHomeOpportunities(Array.isArray(d)?d.filter((x:any)=>!x.deadline || new Date(x.deadline)>=new Date()).slice(0,3):[]) } setFeedLoading(false)}).catch(()=>setFeedLoading(false))},[])
  useEffect(()=>{
    const timer=window.setInterval(()=>setSlide(current=>(current+1)%homepageImages.length),5000)
    return ()=>window.clearInterval(timer)
  },[])
  const currentImage=homepageImages[slide]
  return <Layout><main>
    <section className="relative overflow-hidden bg-[#06182b] text-white">
      <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_78%_18%,rgba(16,185,129,.22),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(59,130,246,.20),transparent_32%)]" />
      <div className="relative rsre-page grid gap-10 py-18 md:grid-cols-[1.15fr_.85fr] md:py-24 md:items-center">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200"><Sparkles size={14}/> Rwanda Student Research Ecosystem</div><h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">From curiosity to credible research.</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">Learn. Discover. Find opportunities. Build real research. Experiment safely. Collaborate. Publish through RSJH.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/auth/register" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950">Start your research journey <ArrowRight size={17}/></Link><Link href="/articles" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black text-white"><BookOpen size={17}/> Explore RSJH Journal</Link></div></div>
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
          <div className="relative">
            <img key={currentImage.src} src={currentImage.src} alt={currentImage.alt} className="rsre-carousel-image h-80 w-full object-cover md:h-[430px]"/>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-5 pt-20">
              <div className="text-sm font-black text-white">{currentImage.caption}</div>
              <div className="mt-1 text-[11px] text-slate-300">{slide+1} / {homepageImages.length}</div>
            </div>
            <button aria-label="Previous homepage image" onClick={()=>setSlide(current=>(current-1+homepageImages.length)%homepageImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"><ChevronLeft size={18}/></button>
            <button aria-label="Next homepage image" onClick={()=>setSlide(current=>(current+1)%homepageImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"><ChevronRight size={18}/></button>
            <div className="absolute bottom-4 right-4 flex gap-1.5">{homepageImages.map((image,index)=><button key={image.src} aria-label={`Show image ${index+1}`} onClick={()=>setSlide(index)} className={index===slide?'text-emerald-300':'text-white/50'}><Circle size={9} fill="currentColor"/></button>)}</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 bg-slate-950/80 text-center"><div className="p-4"><div className="text-lg font-black">One account</div><div className="text-[11px] text-slate-400">Across RSRE</div></div><div className="p-4"><div className="text-lg font-black">Academy optional</div><div className="text-[11px] text-slate-400">Enter at your level</div></div><div className="p-4"><div className="text-lg font-black">RSJH free</div><div className="text-[11px] text-slate-400">No pay-to-publish</div></div></div>
        </div>
      </div>
    </section>
    <section className="border-y border-slate-200 bg-white py-5">
      <div className="rsre-marquee-viewport">
        <div className="rsre-marquee-track text-sm font-black text-slate-500">
          {[...marqueeItems,...marqueeItems].map((item,index)=><div className="rsre-marquee-item" key={`${item}-${index}`}><span className="text-emerald-600">•</span>{item}</div>)}
        </div>
      </div>
    </section>
    <section className="rsre-page py-10"><div className="grid gap-4 md:grid-cols-3"><Link href="/research-academy" className="rounded-2xl bg-emerald-600 p-5 text-white transition hover:-translate-y-1"><div className="text-xs font-black uppercase tracking-wider text-emerald-100">Learn</div><div className="mt-2 text-xl font-black">Build the next competency</div><div className="mt-2 text-sm text-emerald-50">Continue from your level instead of repeating training you already know.</div></Link><Link href="/research-discovery" className="rounded-2xl bg-blue-700 p-5 text-white transition hover:-translate-y-1"><div className="text-xs font-black uppercase tracking-wider text-blue-100">Discover</div><div className="mt-2 text-xl font-black">Find evidence before you build</div><div className="mt-2 text-sm text-blue-50">Search local and global literature and turn useful evidence into a question.</div></Link><Link href="/research-incubator" className="rounded-2xl bg-slate-950 p-5 text-white transition hover:-translate-y-1"><div className="text-xs font-black uppercase tracking-wider text-emerald-300">Build</div><div className="mt-2 text-xl font-black">Move from question to project</div><div className="mt-2 text-sm text-slate-300">Create the project, team, milestones and governance record.</div></Link></div></section>
    <section className="rsre-page py-16 md:py-20"><div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Distinct pillars</div><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">One ecosystem. Different jobs.</h2><p className="mt-4 text-base leading-8 text-slate-600">RSRE is not one repeated dashboard. Each pillar has its own purpose, data and workflow, connected through a shared research identity and Research Passport.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pathways.map(({href,icon:Icon,label,title,text})=><Link key={href} href={href} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-center justify-between"><div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><Icon size={20}/></div><span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span></div><h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p><div className="mt-5 inline-flex items-center gap-1 text-sm font-black text-emerald-700">Open workspace <ArrowRight size={15}/></div></Link>)}</div></section>
    <section className="border-y border-slate-200 bg-slate-50"><div className="rsre-page grid gap-10 py-16 md:grid-cols-[1fr_.9fr] md:items-center"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Research lifecycle</div><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Discover → Learn → Build → Govern → Analyze → Publish</h2><p className="mt-5 max-w-2xl leading-8 text-slate-600">A beginner can start with foundations. An experienced researcher can start with a real question. RSRE records the work without forcing everyone through the same route.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/research-hub" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">See the research journey</Link><Link href="/research-passport" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800">Explore Passport</Link></div></div><div className="grid gap-3 sm:grid-cols-2">{trust.map(([title,text],i)=><div key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-black text-slate-950">{i===0?<HeartHandshake size={17}/>:i===1?<BookOpen size={17}/>:i===2?<ShieldCheck size={17}/>:<Network size={17}/>} {title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>
    <section className="rsre-page py-16 md:py-20"><div className="grid gap-8 lg:grid-cols-2"><section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">RSJH</div><h2 className="mt-2 text-2xl font-black">Latest published research</h2></div><Link href="/articles" className="text-sm font-black text-emerald-700">View journal →</Link></div><div className="mt-5 space-y-3">{feedLoading?<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Loading published work…</div>:homeArticles.length?homeArticles.map(a=><Link key={a.id} href={`/articles/${a.id}`} className="block rounded-2xl border border-slate-100 p-4 hover:border-emerald-200"><div className="font-black">{a.title}</div><div className="mt-1 text-xs text-slate-500">{a.specialty||'Health research'} · {a.author?.full_name||a.author?.username||'RSJH author'}</div></Link>):<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No published articles are available yet.</div>}</div></section><section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Opportunities</div><h2 className="mt-2 text-2xl font-black">What could move your research forward?</h2></div><Link href="/research-opportunities" className="text-sm font-black text-amber-700">Browse all →</Link></div><div className="mt-5 space-y-3">{feedLoading?<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Loading opportunities…</div>:homeOpportunities.length?homeOpportunities.map(o=><Link key={o.id} href="/research-opportunities" className="block rounded-2xl border border-slate-100 p-4 hover:border-amber-200"><div className="font-black">{o.title}</div><div className="mt-1 text-xs text-slate-500">{o.kind||'Research opportunity'}{o.deadline?` · Deadline ${o.deadline}`:''}</div></Link>):<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No active opportunities are currently listed.</div>}</div></section></div></section>
    <section className="rsre-page py-16 md:py-20"><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-[2rem] bg-emerald-50 p-8 md:p-10"><div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Rwanda Student Journal for Health</div><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">A publication system inside a research ecosystem.</h2><p className="mt-4 max-w-2xl leading-8 text-slate-700">Students and researchers can discover evidence, develop projects and submit manuscripts through a protected editorial workflow. RSJH remains free to submit, peer review and publish.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/articles" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Read RSJH</Link><Link href="/submit" className="rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-black text-emerald-900">Submit manuscript</Link></div></div><div className="overflow-hidden rounded-[2rem] bg-[#081d35] text-white"><img src="/images/healthcare-rwanda.jpg" alt="Health research in Rwanda" className="h-56 w-full object-cover opacity-90"/><div className="p-8 md:p-10"><div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Support the ecosystem</div><h2 className="mt-3 text-3xl font-black tracking-tight">Help keep research access open.</h2><p className="mt-4 leading-7 text-slate-300">Partners and supporters can strengthen infrastructure, mentorship, research access and open publication without purchasing editorial influence.</p><Link href="/support-rsre" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Support RSRE <ArrowRight size={15}/></Link></div></div></div></section>
  </main></Layout>
}
