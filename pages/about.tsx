import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import api, { absoluteUrl } from "../utils/api";

type Partner = { id:number; name:string; logo?:string|null; description?:string; website?:string; type?:string; country?:string };
type Founder = { id:number; name:string; role:string; biography?:string; photo?:string|null; display_order:number };

const partnerNeeds = [
  ["Academic partners", "Universities and health-science schools supporting research, mentorship and student participation."],
  ["Research partners", "Institutions and laboratories supporting methods, data, training and collaborative research."],
  ["Healthcare partners", "Hospitals and health programmes connecting student research with real health priorities."],
  ["Technology partners", "Companies helping build secure digital research, publishing and responsible-AI infrastructure."],
  ["Funding partners", "Foundations, banks, donors and programmes investing in student research capacity."],
  ["Knowledge partners", "Organisations contributing training, evidence, methods, statistics or research resources."],
  ["Conference partners", "Events and professional communities creating pathways for students to present and connect."],
  ["Media & communication partners", "Partners helping translate credible health evidence into accessible public communication."],
];

const milestones = [
  ["2026 Â· Foundation", "RSRE was shaped around a research-first model that connects research learning, development, peer review and publication."],
  ["2026 Â· Platform build", "The digital platform expanded beyond manuscript submission into research discovery, opportunities, passports and an incubator."],
  ["2026 Â· Editorial workflow", "Author, reviewer and editorial workflows were brought into one platform so a manuscript can move through a traceable publication process."],
  ["2026 Â· Responsible AI", "MedTech AI was designed as a research assistant layer while keeping editorial judgement and scientific accountability human-led."],
];

function initials(name:string){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "RS"; }

export default function About(){
  const [partners,setPartners] = useState<Partner[]>([]);
  const [founders,setFounders] = useState<Founder[]>([]);

  useEffect(()=>{
    Promise.allSettled([api.get("/partners/"), api.get("/founding-members/")]).then(([p,f])=>{
      if(p.status === "fulfilled") setPartners(p.value.data?.results||p.value.data||[]);
      if(f.status === "fulfilled") setFounders(f.value.data?.results||f.value.data||[]);
    });
  },[]);

  return <Layout>
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#10b981_0,_transparent_35%),radial-gradient(circle_at_bottom_left,_#2563eb_0,_transparent_35%)]" />
        <div className="rsjh-page relative py-20 md:py-28">
          <p className="rsjh-eyebrow text-emerald-300">ABOUT RSRE</p>
          <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-black tracking-tight">A student research community built around the full journey.</h1>
          <p className="mt-6 max-w-3xl text-lg md:text-xl leading-8 text-slate-300">From the first research question to peer review, publication and a lasting scholarly record.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/articles" className="rsjh-button-green">Explore published work â†’</Link><Link href="/research-hub" className="rounded-xl border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/10">Explore the Research Hub</Link></div>
        </div>
      </section>

      <section id="story" className="rsjh-section">
        <div className="rsjh-page grid gap-8 lg:grid-cols-[1.2fr_.8fr] items-start">
          <div className="rsjh-card p-8 md:p-10">
            <p className="rsjh-eyebrow text-emerald-700">OUR FOUNDING STORY</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black">Why RSRE was built</h2>
            <div className="mt-6 space-y-5 text-slate-600 leading-8">
              <p>RSRE was created around a practical problem: health students can be surrounded by research questions but still struggle to find a clear route from an idea to credible evidence, collaboration and publication.</p>
              <p>The platform therefore treats publication as one part of a longer research journey. Students can develop ideas, discover opportunities, build a research passport, collaborate, submit manuscripts, receive peer review, respond to feedback and preserve a visible scholarly record.</p>
              <p>The journal is student-centred without lowering scientific standards. Editorial decisions, peer review, research ethics and publication remain accountable to human editorial leadership.</p>
              <p>MedTech Rwanda provides the digital infrastructure behind the platform. RSRE connects distinct research services across Rwanda, with RSJH serving as the scholarly publication pillar.</p>
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-950 p-8 text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-[.2em] text-emerald-300">THE RESEARCH JOURNEY</p>
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm font-bold">
              {["Learn","Develop","Discover","Collaborate","Submit","Review","Revise","Publish"].map((x,i)=><div key={x} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">0{i+1}<br/><span className="text-white/90">{x}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-16">
        <div className="rsjh-page grid gap-6 md:grid-cols-3">
          <div><p className="rsjh-eyebrow text-emerald-700">MISSION</p><h2 className="mt-2 text-2xl font-black">Make research practical.</h2><p className="mt-3 text-slate-600 leading-7">Help students move from curiosity to stronger research and publication.</p></div>
          <div><p className="rsjh-eyebrow text-emerald-700">VISION</p><h2 className="mt-2 text-2xl font-black">Build scholarly identity early.</h2><p className="mt-3 text-slate-600 leading-7">Give students a lasting record of projects, reviews, publications and collaboration.</p></div>
          <div><p className="rsjh-eyebrow text-emerald-700">VALUES</p><h2 className="mt-2 text-2xl font-black">Human-led. Evidence-first.</h2><p className="mt-3 text-slate-600 leading-7">Peer review, ethics, confidentiality and responsible AI stay at the centre.</p></div>
        </div>
      </section>

      <section className="rsjh-section" id="milestones">
        <div className="rsjh-page">
          <p className="rsjh-eyebrow text-blue-700">2026 MILESTONES</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black">From concept to a working research ecosystem.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">{milestones.map(([title,text])=><article key={title} className="rsjh-card p-7"><p className="text-xs font-black uppercase tracking-widest text-emerald-700">{title}</p><p className="mt-3 text-slate-600 leading-7">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-16" id="founding-team">
        <div className="rsjh-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div><p className="rsjh-eyebrow text-violet-700">FOUNDING TEAM</p><h2 className="mt-3 text-3xl md:text-4xl font-black">The people who built the beginning.</h2><p className="mt-3 max-w-3xl text-slate-600">Founding-team records are maintained from the Administrator dashboard. Only verified names, roles and biographies should be published here.</p></div>
            <span className="rsjh-chip">{founders.length} published profile{founders.length===1?"":"s"}</span>
          </div>
          {founders.length===0 ? <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">Founding-team profiles have not been published yet.</div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{founders.map((f,i)=><article key={f.id} className="rsjh-card overflow-hidden"><div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">{f.photo?<img src={absoluteUrl(f.photo)} alt={f.name} className="h-full w-full object-cover" onError={(e)=>{e.currentTarget.style.display="none";}}/>:<span className="text-4xl font-black text-emerald-700">{initials(f.name)}</span>}<span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700">{String(i+1).padStart(2,"0")}</span></div><div className="p-5"><h3 className="font-black text-lg">{f.name}</h3><p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-700">{f.role}</p>{f.biography&&<p className="mt-3 text-sm leading-6 text-slate-600">{f.biography}</p>}</div></article>)}</div>}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="rsjh-page grid gap-10 lg:grid-cols-[.9fr_1.1fr] items-center">
          <div><p className="rsjh-eyebrow text-emerald-300">PUBLISHER</p><h2 className="mt-3 text-3xl md:text-4xl font-black">Built by MedTech Rwanda. Governed by editorial leadership.</h2><p className="mt-5 text-slate-300 leading-8">MedTech Rwanda provides technology and publisher-side infrastructure. Scientific scope, reviewer selection and publication decisions remain under journal editorial governance.</p></div>
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-widest text-slate-400">Technology</p><p className="mt-2 font-black">MedTech Rwanda Ltd</p></div><div><p className="text-xs uppercase tracking-widest text-slate-400">Editorial office</p><p className="mt-2 font-black">researchrwandahub@gmail.com</p></div><div><p className="text-xs uppercase tracking-widest text-slate-400">Location</p><p className="mt-2 font-black">Huye, Rwanda</p></div><div><p className="text-xs uppercase tracking-widest text-slate-400">Contact</p><p className="mt-2 font-black">+250 792 447 121</p></div></div></div>
        </div>
      </section>

      <section className="rsjh-section" id="partners">
        <div className="rsjh-page">
          <p className="rsjh-eyebrow text-emerald-700">PARTNERS & SUPPORTERS</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black">A partner ecosystem, not a logo wall.</h2>
          <p className="mt-4 max-w-3xl text-slate-600 leading-7">Partner records shown here are managed by authorised administrators. Logos, descriptions and official websites come from the partner records rather than hard-coded demo cards.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{partnerNeeds.map(([title,desc],i)=><div key={title} className="rsjh-card p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 font-black text-emerald-700">0{i+1}</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></div>)}</div>
          {partners.length>0&&<div className="mt-10"><h3 className="text-2xl font-black">Current partners and supporters</h3><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{partners.map(p=><a href={p.website||undefined} target={p.website?'_blank':undefined} rel={p.website?'noreferrer':undefined} key={p.id} className="rsjh-card p-5 hover:-translate-y-0.5 transition"><div className="h-20 flex items-center justify-center rounded-2xl bg-slate-50">{p.logo?<img src={absoluteUrl(p.logo)} alt={p.name} className="max-h-16 max-w-full object-contain" onError={(e)=>{e.currentTarget.style.display="none";}}/>:<span className="text-2xl font-black text-slate-300">{initials(p.name)}</span>}</div><h4 className="mt-4 font-black">{p.name}</h4>{p.country&&<p className="mt-1 text-xs uppercase tracking-wide text-emerald-700">{p.country}</p>}{p.description&&<p className="mt-2 text-sm text-slate-600">{p.description}</p>}{p.website&&<span className="mt-3 inline-block text-sm font-bold text-emerald-700">Official website â†’</span>}</a>)}</div></div>}
        </div>
      </section>
    </main>
  </Layout>
}

