import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';

type PublicPassport = {
  profile: Record<string, any>;
  publications: Array<{id:number; title:string; year?:number; doi?:string|null}>;
  projects: Array<{id:number; title:string; discipline?:string; study_type?:string; status?:string}>;
};

export async function getServerSideProps({ params, req }: GetServerSidePropsContext) {
  const username = String(params?.username || '');
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const origin = (configured || `http://${req.headers.host || 'localhost:8000'}`).replace(/\/$/, '');
  const apiRoot = origin.endsWith('/api') ? origin : `${origin}/api`;
  try {
    const response = await fetch(`${apiRoot}/research-passport/public/${encodeURIComponent(username)}/`);
    if (!response.ok) return { notFound: true };
    const data = await response.json();
    return { props: { data } };
  } catch {
    return { notFound: true };
  }
}

export default function PublicPassportPage({ data }: { data: PublicPassport }) {
  const p = data.profile || {};
  return <>
    <Head><title>{p.name ? `${p.name} — Research Passport | RSRE` : 'Research Passport | RSRE'}</title><meta name="description" content="A public Research Passport from the RSRE research ecosystem." /></Head>
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4"><Link href="/" className="text-sm font-black text-slate-700">RSRE</Link><Link href="/research-passport" className="text-sm font-black text-emerald-700">Build your own Passport →</Link></div>
        <section className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-sm sm:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Public Research Passport</div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{p.name || p.username}</h1>
          {p.headline && <p className="mt-3 text-xl font-bold text-slate-200">{p.headline}</p>}
          {(p.institution || p.discipline || p.orcid) && <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-300">{p.institution && <span className="rounded-full bg-white/10 px-3 py-1.5">{p.institution}</span>}{p.discipline && <span className="rounded-full bg-white/10 px-3 py-1.5">{p.discipline}</span>}{p.orcid && <span className="rounded-full bg-white/10 px-3 py-1.5">ORCID: {p.orcid}</span>}</div>}
        </section>

        {p.biography && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">About</div><p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-700">{p.biography}</p></section>}

        {(p.interests || p.methods || p.skills || p.competencies) && <section className="mt-6 grid gap-6 md:grid-cols-2">
          {p.interests && <Info title="Research interests" text={p.interests}/>} {p.methods && <Info title="Methods" text={p.methods}/>} {p.skills && <Info title="Skills" text={p.skills}/>} {p.competencies && <Info title="Competencies" text={Array.isArray(p.competencies)?p.competencies.join(', '):p.competencies}/>} 
        </section>}

        {data.publications.length > 0 && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Publications</div><div className="mt-4 space-y-3">{data.publications.map(a=><div key={a.id} className="rounded-2xl border border-slate-100 p-4"><div className="font-black text-slate-900">{a.title}</div><div className="mt-1 text-xs text-slate-500">{a.year || 'Year not listed'}{a.doi ? ` · DOI: ${a.doi}` : ''}</div></div>)}</div></section>}

        {data.projects.length > 0 && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Public research projects</div><div className="mt-4 grid gap-3 md:grid-cols-2">{data.projects.map(x=><div key={x.id} className="rounded-2xl border border-slate-100 p-4"><div className="font-black text-slate-900">{x.title}</div><div className="mt-1 text-xs text-slate-500">{[x.discipline,x.study_type,x.status].filter(Boolean).join(' · ')}</div></div>)}</div></section>}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">A public Research Passport only shows information the researcher has explicitly chosen to publish. RSRE does not treat a Passport as a professional license, academic degree, ethics approval, or guarantee of research quality.</div>
      </div>
    </main>
  </>;
}

function Info({title,text}:{title:string;text:string}){return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</div><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{text}</p></section>}
