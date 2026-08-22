import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ApplicationShell from '../components/ApplicationShell';
import api from '../api';

type Evidence = { id: number; evidence_type: string; title: string; description: string; source_type: string; evidence_date?: string | null; verification_note?: string };
type Certificate = { certificate_id: string; type: 'module'|'level'|'pathway'; title: string; issued_at: string; status: string };
type Snapshot = {
  profile: any;
  verification: { status: string; score: number; code: string; as_of: string };
  metrics: Record<string, number>;
  research_profile: Record<string, string>;
  recent_evidence: Evidence[];
  certificates: Certificate[];
  pathway: { stage: string; done: boolean; detail: string }[];
};

function headers() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rmsjToken') : null;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

const certLabel = (type: Certificate['type']) => type === 'module' ? 'Module' : type === 'level' ? 'Level' : 'Pathway';

export default function Passport() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'overview'|'evidence'|'credentials'>('overview');
  const [form, setForm] = useState({ headline: '', career_goal: '', skills: '', methods: '', interests: '', collaborations: '', competencies: '', visibility: 'network' });
  const [evidence, setEvidence] = useState({ evidence_type: 'credential', title: '', description: '', evidence_date: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/research-passport/', headers());
      setData(res.data);
      setForm({
        headline: res.data.profile?.headline || '', career_goal: res.data.profile?.career_goal || '', skills: res.data.profile?.skills || '',
        methods: res.data.profile?.methods || '', interests: res.data.profile?.interests || '', collaborations: res.data.profile?.collaborations || '',
        competencies: (res.data.profile?.competencies || []).join(', '), visibility: res.data.profile?.visibility || 'network',
      });
    } catch { setData(null); setMessage('Sign in to view your Research Passport.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('');
    try {
      await api.put('/research-passport/', { ...form, competencies: form.competencies.split(',').map(s => s.trim()).filter(Boolean) }, headers());
      setMessage('Passport updated. Your research identity has been refreshed.'); await load();
    } catch (err: any) { setMessage(err?.response?.data?.detail || 'Could not update your passport.'); }
    finally { setSaving(false); }
  }

  async function addEvidence(e: FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('');
    try {
      await api.post('/research-passport/evidence/', evidence, headers());
      setEvidence({ evidence_type: 'credential', title: '', description: '', evidence_date: '' });
      setMessage('Added as researcher-declared evidence. Verification remains separate.'); await load();
    } catch (err: any) { setMessage(err?.response?.data?.detail || 'Could not add evidence.'); }
    finally { setSaving(false); }
  }

  const profileStrength = useMemo(() => {
    if (!data) return 0;
    const p = data.profile || {};
    const fields = [p.headline, p.career_goal, p.skills, p.methods, p.interests, p.collaborations, (p.competencies || []).length];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  }, [data]);

  return <ApplicationShell name="Research Passport" description="Your evolving, evidence-based research identity across the RSRE ecosystem." nav={[["/research-passport", "Passport"], ["/research-academy", "Learning"], ["/research-incubator", "Projects"], ["/research-opportunities", "Opportunities"], ["/articles", "Publications"]]}>
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-7 text-white shadow-lg sm:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Research identity • evidence • progression</div>
            <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">A passport for what you actually do in research.</h2>
            <p className="mt-4 max-w-3xl leading-8 text-blue-100">Your Passport accumulates verified activity from RSRE while allowing you to declare prior experience. Academy participation can help, but it is never a gate to being recognized as a capable researcher.</p>
          </div>
          {data && <div className="min-w-[220px] rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-100"><span>Profile strength</span><span>{profileStrength}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white" style={{width: `${profileStrength}%`}} /></div><div className="mt-3 text-sm text-blue-100">Complete the profile to make matching and collaboration more useful.</div></div>}
        </div>
      </section>

      {message && <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">{message}</div>}
      {loading && <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading your research record…</div>}

      {data && <>
        <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {([['overview','Overview'],['evidence','Evidence'],['credentials','Credentials']] as const).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-4 py-2.5 text-sm font-black ${tab===value ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}
        </div>

        {tab === 'overview' && <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[['Status', data.verification.status, `Evidence score ${data.verification.score}/100`],['Projects', data.metrics.projects, `${data.metrics.active_projects} active`],['Publications', data.metrics.publications, 'published records'],['Reviews', data.metrics.peer_reviews, 'peer reviews'],['Credentials', data.metrics.valid_certificates, 'valid certificates']].map(([label,value,detail]) => <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 text-2xl font-black text-slate-950">{value}</div><div className="mt-1 text-sm text-slate-500">{detail}</div></div>)}
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Research journey</div>
              <h3 className="mt-2 text-2xl font-black">Evidence accumulates across RSRE.</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">{data.pathway.map(item => <div key={item.stage} className="flex gap-3 rounded-2xl border border-slate-100 p-4"><div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-slate-200'}`} /><div><div className="font-black text-slate-900">{item.stage}</div><div className="mt-1 text-sm text-slate-500">{item.detail}</div></div></div>)}</div>
              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><div className="text-xs font-black uppercase tracking-wider text-blue-200">Verification code</div><div className="mt-2 font-mono text-lg font-black">{data.verification.code}</div><div className="mt-2 text-xs leading-5 text-slate-300">Use this to reference the current RSRE record. It is not a professional license or academic degree.</div></div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Research profile</div>
              <h3 className="mt-2 text-2xl font-black">How others find you.</h3>
              <dl className="mt-5 space-y-4 text-sm">{[['Discipline','discipline'],['Institution','institution'],['Academic stage','academic_stage'],['Research interests','interests'],['ORCID','orcid']].map(([label,key]) => <div key={key} className="flex items-start justify-between gap-5 border-b border-slate-100 pb-3"><dt className="font-bold text-slate-500">{label}</dt><dd className="max-w-[65%] text-right font-black text-slate-900">{data.research_profile?.[key] || 'Not added yet'}</dd></div>)}</dl>
              <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">Your Passport powers better opportunity matching, collaboration discovery and research-network visibility.</div>
            </div>
          </section>
        </>}

        {tab === 'evidence' && <section className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={addEvidence} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Declare prior experience</div>
            <h3 className="mt-2 text-2xl font-black">Your journey did not start on RSRE.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Add legitimate work you completed elsewhere. It enters the Passport as declared evidence until independently verified.</p>
            <select value={evidence.evidence_type} onChange={e => setEvidence({...evidence,evidence_type:e.target.value})} className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="credential">Credential</option><option value="learning">Learning</option><option value="project">Research project</option><option value="publication">Publication</option><option value="review">Peer review</option><option value="mentorship">Mentorship</option><option value="collaboration">Collaboration</option><option value="milestone">Research milestone</option></select>
            <input placeholder="Evidence title" value={evidence.title} onChange={e => setEvidence({...evidence,title:e.target.value})} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <textarea placeholder="Describe what you did and what can substantiate it." rows={5} value={evidence.description} onChange={e => setEvidence({...evidence,description:e.target.value})} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <input type="date" value={evidence.evidence_date} onChange={e => setEvidence({...evidence,evidence_date:e.target.value})} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <button disabled={saving} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{saving ? 'Saving…' : 'Add declared evidence'}</button>
          </form>
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Evidence timeline</div><h3 className="mt-2 text-2xl font-black">What RSRE knows about your work.</h3></div><div className="text-xs font-bold text-slate-400">{data.recent_evidence.length} recent records</div></div>
            <div className="mt-5 space-y-3">{data.recent_evidence.length ? data.recent_evidence.map(ev => <div key={ev.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-4"><div><div className="font-black text-slate-900">{ev.title}</div><div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{ev.evidence_type} · {ev.source_type}</div></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${ev.source_type === 'manual' ? 'bg-amber-50 text-amber-700' : ev.source_type === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{ev.source_type === 'manual' ? 'Declared' : ev.source_type === 'verified' ? 'Verified' : 'RSRE recorded'}</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{ev.description}</p></div>) : <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">Your RSRE activity will appear here as it is recorded.</div>}</div>
          </section>
        </section>}

        {tab === 'credentials' && <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">Research Academy credentials</div><h3 className="mt-2 text-2xl font-black">Certificates you have earned.</h3><p className="mt-2 text-sm text-slate-500">Module certificates appear here alongside level and pathway credentials. The Academy remains optional; these are evidence of completed RSRE learning.</p></div><Link href="/research-academy/certificates" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Open certificate center</Link></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.certificates.length ? data.certificates.map(cert => <div key={cert.certificate_id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-purple-700">{certLabel(cert.type)}</span><span className="text-xs font-bold text-emerald-600">{cert.status}</span></div><h4 className="mt-4 text-lg font-black text-slate-900">{cert.title}</h4><p className="mt-1 text-xs text-slate-500">Issued {new Date(cert.issued_at).toLocaleDateString()}</p><p className="mt-4 font-mono text-xs text-slate-400">{cert.certificate_id}</p><Link href={`/research-academy/certificate/${encodeURIComponent(cert.certificate_id)}`} className="mt-4 inline-block text-sm font-black text-blue-700">View certificate →</Link></div>) : <div className="col-span-full rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">No certificates yet. Complete a Research Academy module, level or pathway to add a credential here.</div>}</div>
        </section>}

        {tab === 'overview' && <form onSubmit={saveProfile} className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Keep your identity current</div>
          <h3 className="mt-2 text-2xl font-black">Tell RSRE what you are becoming good at.</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-sm font-black text-slate-700">Research headline</span><input value={form.headline} onChange={e => setForm({...form,headline:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="block"><span className="text-sm font-black text-slate-700">Research goal</span><input value={form.career_goal} onChange={e => setForm({...form,career_goal:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label></div>
          {([['skills','Skills'],['methods','Methods'],['interests','Research interests'],['collaborations','Collaboration interests']] as string[][]).map(([key,label]) => <label key={key} className="mt-4 block"><span className="text-sm font-black text-slate-700">{label}</span><textarea rows={2} value={(form as any)[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>)}
          <div className="grid gap-4 sm:grid-cols-2"><label className="mt-4 block"><span className="text-sm font-black text-slate-700">Competencies</span><input value={form.competencies} onChange={e => setForm({...form,competencies:e.target.value})} placeholder="epidemiology, qualitative research, R, systematic review" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="mt-4 block"><span className="text-sm font-black text-slate-700">Visibility</span><select value={form.visibility} onChange={e => setForm({...form,visibility:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="private">Private</option><option value="network">RSRE network</option><option value="public">Public</option></select></label></div>
          <button disabled={saving} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{saving ? 'Saving…' : 'Save passport'}</button>
        </form>}
      </>}
    </main>
  </ApplicationShell>;
}
