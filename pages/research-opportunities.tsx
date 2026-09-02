import { useEffect, useMemo, useState } from 'react';
import ApplicationShell from '../components/ApplicationShell';
import api from '../api';

type Opportunity = {
  id: number;
  title: string;
  kind?: string;
  description?: string;
  deadline?: string | null;
  last_synced_at?: string | null;
};

type Passport = {
  interests?: string;
  methods?: string;
  skills?: string;
  discipline?: string;
};

const TYPES = ['All', 'Grant / Funding', 'Scholarship', 'Fellowship', 'Internship', 'Conference / Abstract', 'Mentorship', 'Research Opportunity'];
const SAVED_KEY = 'rsre_saved_opportunities';

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const target = new Date(`${deadline}T23:59:59`);
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

function isClosingSoon(deadline?: string | null) {
  const left = daysLeft(deadline);
  return left !== null && left <= 7;
}

function matchesProfile(item: Opportunity, passport: Passport | null) {
  if (!passport) return false;
  const profile = `${passport.interests || ''} ${passport.methods || ''} ${passport.skills || ''} ${passport.discipline || ''}`.toLowerCase();
  if (!profile.trim()) return false;
  const text = `${item.title} ${item.description || ''} ${item.kind || ''}`.toLowerCase();
  const terms = profile.split(/[^a-z0-9+#-]+/).filter((t) => t.length >= 4).slice(0, 50);
  return terms.some((term) => text.includes(term));
}

function relativeUpdated(value?: string | null) {
  if (!value) return 'Recently listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently listed';
  const mins = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `Updated ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days}d ago`;
}

export default function ResearchOpportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('All');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch (_) {
      setSaved([]);
    }

    Promise.all([
      api.get('/research-opportunities/'),
      api.get('/research-passport/').catch(() => null),
    ]).then(([opportunitiesRes, passportRes]) => {
      setItems(opportunitiesRes?.data?.results || opportunitiesRes?.data || []);
      setPassport(passportRes?.data?.profile ? passportRes.data.profile : passportRes?.data?.research_profile || null);
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const toggleSaved = (id: number) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => items.filter((item) => {
    const typeOk = type === 'All' || item.kind === type;
    const q = query.toLowerCase().trim();
    const text = `${item.title} ${item.description || ''} ${item.kind || ''}`.toLowerCase();
    return typeOk && (!q || text.includes(q));
  }), [items, type, query]);

  const recommended = useMemo(() => filtered.filter((item) => matchesProfile(item, passport)).slice(0, 4), [filtered, passport]);
  const closingSoon = useMemo(() => filtered.filter((item) => isClosingSoon(item.deadline)).slice(0, 4), [filtered]);
  const savedItems = useMemo(() => filtered.filter((item) => saved.includes(item.id)).slice(0, 4), [filtered, saved]);

  return (
    <ApplicationShell
      name="Research Opportunities"
      description="Find current research opportunities matched to your research journey."
      nav={[["/research-opportunities", "Discover"], ["/research-passport", "Passport"], ["/research-incubator", "Incubator"], ["/collaboration", "Teams"]]}
    >
      <main className="mx-auto max-w-7xl px-6 pb-16">
        <section className="rounded-3xl bg-slate-950 p-8 text-white md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Opportunity intelligence</div>
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">Find the opportunity that moves your research forward.</h1>
              <p className="mt-4 max-w-3xl leading-8 text-slate-300">Discover funding, scholarships, fellowships, internships, conferences, mentorships and research calls. Use the Passport and Incubator together to turn a relevant call into a concrete next action.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Your next move</p>
              <p className="mt-2 text-lg font-bold text-white">{recommended.length ? 'Review a matched opportunity.' : 'Complete your Research Passport to improve matching.'}</p>
              <a href={recommended.length ? '#recommended' : '/research-passport'} className="mt-4 inline-block rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">{recommended.length ? 'See matches' : 'Open Passport'}</a>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Grant / Funding','Support a study or research capacity.'],['Scholarship','Fund education or research development.'],['Fellowship / Internship','Gain supervised research experience.'],['Conference / Mentorship','Present, learn, connect or find guidance.']].map(([t,d])=><div key={t} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm font-black">{t}</div><p className="mt-1 text-xs leading-5 text-slate-500">{d}</p></div>)}</section>

        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search grants, fellowships, internships…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none lg:max-w-md" />
          <div className="flex flex-wrap gap-2">
            {TYPES.map((option) => (
              <button key={option} onClick={() => setType(option)} className={`rounded-full px-4 py-2 text-sm font-bold ${type === option ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>{option}</button>
            ))}
          </div>
        </section>

        {recommended.length > 0 && (
          <section id="recommended" className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">For you</p><h2 className="mt-1 text-2xl font-black text-slate-950">Opportunities that fit your profile</h2><p className="mt-1 text-sm text-slate-500">A lightweight match based on the research interests and skills in your Passport.</p></div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {recommended.map((item) => <OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} />)}
            </div>
          </section>
        )}

        {closingSoon.length > 0 && (
          <section className="mt-10">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Act soon</p><h2 className="mt-1 text-2xl font-black text-slate-950">Closing within 7 days</h2></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {closingSoon.map((item) => <OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} urgent />)}
            </div>
          </section>
        )}

        {savedItems.length > 0 && (
          <section className="mt-10">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Your list</p><h2 className="mt-1 text-2xl font-black text-slate-950">Saved opportunities</h2></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {savedItems.map((item) => <OpportunityCard key={item.id} item={item} saved onSave={() => toggleSaved(item.id)} />)}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">All active opportunities</p><h2 className="mt-1 text-2xl font-black text-slate-950">Browse the full feed</h2></div><span className="text-sm font-bold text-slate-400">{filtered.length} active</span></div>
          <div className="mt-5">
            {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">Loading current opportunities…</div> : filtered.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center"><p className="font-bold text-slate-900">No matching active opportunities yet.</p><p className="mt-2 text-sm text-slate-500">Try another category, broaden your search, or check your Passport for better matching. Opportunities can be added or synchronized by authorized RSRE administrators.</p></div> : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => <OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} />)}
              </div>
            )}
          </div>
        </section>
      </main>
    </ApplicationShell>
  );
}

function OpportunityCard({ item, saved, onSave, urgent = false }: { item: Opportunity; saved: boolean; onSave: () => void; urgent?: boolean }) {
  const remaining = daysLeft(item.deadline);
  return (
    <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">{item.kind || 'Research Opportunity'}</span>
        <button onClick={onSave} aria-label={saved ? 'Remove from saved opportunities' : 'Save opportunity'} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-50">{saved ? 'Saved' : 'Save'}</button>
      </div>
      <h3 className="mt-4 text-xl font-black leading-tight text-slate-950">{item.title}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{item.description}</p>
      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-slate-500">{item.deadline ? `Deadline: ${item.deadline}` : 'Deadline not specified'}</span>
          {remaining !== null && <span className={`font-black ${urgent || remaining <= 7 ? 'text-red-600' : 'text-emerald-700'}`}>{remaining <= 0 ? 'Closing today' : `${remaining} days left`}</span>}
        </div>
        <div className="mt-2 text-xs font-semibold text-slate-400">{relativeUpdated(item.last_synced_at)}</div>
        <a href={`/api/research-opportunities/${item.id}/open/`} className="mt-5 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800">Open opportunity</a>
      </div>
    </article>
  );
}
