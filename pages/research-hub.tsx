import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import api from "../utils/api";

interface Opportunity { id: number; title: string; kind?: string; description?: string; deadline?: string | null; url?: string; }

const modules = [
  { href: "/research-incubator", title: "Research Idea Incubator", text: "Turn an early research thought into a structured project." },
  { href: "/research-passport", title: "Research Passport", text: "Build your long-term research portfolio and experience record." },
  { href: "/research-opportunities", title: "Research Opportunities", text: "Discover public grants, calls, fellowships and research openings." },
  { href: "/submit", title: "My Manuscripts", text: "Move a mature research project into the RSJH publication workflow." },
  { href: "/research-analytics", title: "Research Landscape", text: "Explore publication and research trends across the journal." },
  { href: "/profile", title: "My Profile", text: "Manage who you are: university, discipline, biography and identity." },
];

export default function ResearchHub() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/research-opportunities/").then((res) => setItems(res.data?.results || res.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return <Layout>
    <main className="max-w-7xl mx-auto px-6 py-12">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 text-white p-8 md:p-10 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">RSJH Student Research Ecosystem</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-2">Student Research Hub</h1>
        <p className="mt-4 max-w-3xl text-blue-100 text-lg">Your research command centre — discover opportunities, develop ideas, build your research portfolio, find collaborators and move successful projects toward publication.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-8 text-sm"><div className="rounded-2xl bg-white/10 p-4"><strong>Explore</strong><p className="text-blue-100 mt-1">Find public opportunities.</p></div><div className="rounded-2xl bg-white/10 p-4"><strong>Develop</strong><p className="text-blue-100 mt-1">Turn ideas into research.</p></div><div className="rounded-2xl bg-white/10 p-4"><strong>Publish</strong><p className="text-blue-100 mt-1">Follow the RSJH review journey.</p></div></div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><div><p className="text-green-700 font-semibold text-sm">YOUR RESEARCH TOOLS</p><h2 className="text-2xl font-bold text-slate-950 mt-1">Choose what you need</h2></div><Link href="/research-opportunities" className="text-blue-700 font-semibold">Browse all opportunities →</Link></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">{modules.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"><h3 className="text-lg font-bold text-blue-950">{item.title}</h3><p className="mt-2 text-gray-600 text-sm leading-6">{item.text}</p><span className="inline-block mt-4 text-sm font-semibold text-blue-700">Open →</span></Link>)}</div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4"><div><p className="text-green-700 font-semibold text-sm">PUBLIC DISCOVERY</p><h2 className="text-2xl font-bold text-slate-950 mt-1">Latest research opportunities</h2><p className="text-gray-500 mt-1">These opportunities are public so students can discover RSJH before they even create an account.</p></div></div>
        {loading ? <p className="mt-5 text-gray-500">Loading opportunities...</p> : items.length === 0 ? <div className="mt-5 border rounded-2xl p-8 bg-white text-gray-500">No active opportunities have been published yet.</div> : <div className="grid md:grid-cols-2 gap-5 mt-5">{items.slice(0, 4).map((item) => <article key={item.id} className="rounded-2xl border bg-white p-6"><span className="text-xs font-semibold uppercase text-green-700">{item.kind || "Research opportunity"}</span><h3 className="text-xl font-bold text-blue-950 mt-2">{item.title}</h3><p className="text-gray-600 mt-3 line-clamp-4">{item.description}</p>{item.deadline && <p className="text-sm text-gray-500 mt-4">Deadline: {item.deadline}</p>}{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-blue-700 font-semibold">View opportunity →</a>}</article>)}</div>}
      </section>

      <section className="mt-12 rounded-2xl border bg-slate-50 p-7"><h2 className="text-2xl font-bold">One journey, not disconnected pages</h2><p className="mt-3 text-gray-600 max-w-4xl">The Hub is where you decide what to do next. The Idea Incubator is where you develop what you may research. The Passport records what you are building over time. Opportunities show what is available publicly. Your dashboard shows what is happening now.</p><div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold"><span className="rounded-full bg-white px-4 py-2 border">Idea</span><span>→</span><span className="rounded-full bg-white px-4 py-2 border">Research</span><span>→</span><span className="rounded-full bg-white px-4 py-2 border">Manuscript</span><span>→</span><span className="rounded-full bg-white px-4 py-2 border">Peer review</span><span>→</span><span className="rounded-full bg-white px-4 py-2 border">Publication</span></div></section>
    </main>
  </Layout>;
}
