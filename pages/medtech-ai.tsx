import ApplicationShell from "../components/ApplicationShell"
import MedTechAIChat from "../components/MedTechAIChat"

const areas = [
  ["Academy", "Explain concepts, create practice questions, and prepare for practical labs without replacing validated assessment.", "/research-academy", "🎓"],
  ["Discovery", "Turn a research question into better evidence searches and explore published RSJH evidence.", "/research-discovery", "🔎"],
  ["Sandbox", "Think through analysis options, variables, reproducibility and safe experimentation.", "/research-sandbox", "🧪"],
  ["Incubator", "Refine research questions, protocols, milestones and next actions without making ethics decisions.", "/research-incubator", "🚀"],
  ["Writing", "Improve clarity, structure, plain-language summaries and keywords while preserving your findings.", "/research-passport", "✍️"],
]

export default function AI(){
  return <ApplicationShell name="MedTech AI" description="A responsible AI layer across the RSRE research journey." nav={[["/medtech-ai","AI Workspace"],["/research-discovery","Discovery"],["/research-academy","Academy"]]}>
    <main className="mx-auto max-w-7xl px-6 pb-16">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">MedTech AI · RSRE assistant</div>
        <div className="mt-3 max-w-4xl">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">A research assistant that follows your work.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Choose the context you are working in. MedTech AI changes its guidance without replacing the purpose, permissions or human decisions of that RSRE pillar.</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {areas.map(([title,desc,href,icon])=><a key={title} href={href} className="group rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10"><div className="text-2xl">{icon}</div><div className="mt-3 font-black">{title}</div><div className="mt-1 text-xs leading-5 text-slate-400 group-hover:text-slate-300">{desc}</div></a>)}
        </div>
      </section>

      <section className="mt-7">
        <MedTechAIChat />
      </section>

      <section className="mt-7 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><div className="text-xs font-black uppercase tracking-widest text-slate-500">01 · Context</div><h3 className="mt-2 text-lg font-black text-slate-950">Tell AI where you are.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Academy, Discovery, Sandbox, Incubator and writing contexts each have a different job.</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><div className="text-xs font-black uppercase tracking-widest text-slate-500">02 · Evidence</div><h3 className="mt-2 text-lg font-black text-slate-950">Know what informed the answer.</h3><p className="mt-2 text-sm leading-6 text-slate-600">When RSJH evidence is supplied, it can be surfaced alongside the answer rather than hidden behind a confident response.</p></div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><div className="text-xs font-black uppercase tracking-widest text-amber-700">03 · Human control</div><h3 className="mt-2 text-lg font-black text-slate-950">AI assists. Researchers decide.</h3><p className="mt-2 text-sm leading-6 text-slate-700">No ethics approval, diagnosis, manuscript acceptance, publication decision or originality guarantee comes from the assistant.</p></div>
      </section>
    </main>
  </ApplicationShell>
}
