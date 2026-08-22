import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../components/DashboardLayout";
import api from "../utils/api";

const disciplines = [
  ["medicine", "Medicine"], ["pharmacy", "Pharmacy"], ["dentistry", "Dentistry / Dental Surgery"],
  ["nursing", "Nursing"], ["public_health", "Public Health"], ["clinical_psychology", "Clinical Psychology"],
  ["biomedical_sciences", "Biomedical Sciences"], ["health_informatics", "Health Informatics"],
  ["health_communication", "Health Communication & Journalism"], ["interdisciplinary", "Interdisciplinary Health Research"],
];
const types = [
  ["original_research", "Original Research"], ["review", "Review Article"], ["case_report", "Case Report / Case Series"],
  ["short_communication", "Short Communication"], ["health_communication", "Health Communication / Journalism"],
  ["commentary", "Commentary / Opinion"], ["student_research_note", "Student Research Note"],
];

export default function Submit() {
  const router = useRouter();
  const [form, setForm] = useState({ co_authors: "", title: "", abstract: "", keywords: "", specialty: "", year: "", article_type: "original_research", discipline: "medicine", research_question: "", supervisor_name: "", funding_statement: "", conflict_of_interest: "None declared", ethics_statement: "", data_availability: "", ai_use_statement: "No AI used in manuscript preparation." });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCoAuthors, setSelectedCoAuthors] = useState<any[]>([]);
  const [coAuthorQuery, setCoAuthorQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [contributions, setContributions] = useState<Record<string, string[]>>({});
  const [pdf, setPdf] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function change(name: string, value: string) { setForm((current) => ({ ...current, [name]: value })); }

  useEffect(() => {
    let active = true;
    const query = coAuthorQuery.trim();
    if (!query) {
      setUsers([]);
      setLoadingUsers(false);
      return () => { active = false; };
    }
    setLoadingUsers(true);
    const timer = window.setTimeout(() => {
      api.get(`/users/directory/?q=${encodeURIComponent(query)}`)
        .then((response) => {
          if (!active) return;
          const data = response.data?.results || response.data || [];
          setUsers(Array.isArray(data) ? data : []);
        })
        .catch(() => { if (active) setUsers([]); })
        .finally(() => { if (active) setLoadingUsers(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [coAuthorQuery]);

  const availableCoAuthors = useMemo(() => users
    .filter((user) => user?.id)
    .filter((user) => !selectedCoAuthors.some((selected) => selected.id === user.id))
    .slice(0, 8), [users, selectedCoAuthors]);

  const CONTRIBUTION_ROLES = [
    "Conceptualization", "Methodology", "Software", "Validation", "Formal analysis",
    "Investigation", "Resources", "Data curation", "Writing – original draft",
    "Writing – review & editing", "Visualization", "Supervision", "Project administration", "Funding acquisition"
  ];

  function addCoAuthor(user: any) {
    setSelectedCoAuthors((current) => [...current, user]);
    setContributions((current) => ({ ...current, [user.username]: current[user.username] || [] }));
    setCoAuthorQuery("");
    setForm((current) => ({ ...current, co_authors: "" }));
  }

  function removeCoAuthor(userId: number | string) {
    const removed = selectedCoAuthors.find((user) => user.id === userId);
    setSelectedCoAuthors((current) => current.filter((user) => user.id !== userId));
    if (removed?.username) {
      setContributions((current) => { const next = { ...current }; delete next[removed.username]; return next; });
    }
  }

  async function submitArticle(event: FormEvent) {
    event.preventDefault();
    if (!pdf) { setMessage("Please upload the manuscript PDF."); return; }
    setSubmitting(true); setMessage("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "co_authors") data.append(key, value);
      });
      data.append("pdf", pdf);
      const response = await api.post("/articles/", data, { headers: { "Content-Type": "multipart/form-data" } });
      const typedUsernames = form.co_authors.split(",").map((v) => v.trim()).filter(Boolean);
      const selectedUsernames = selectedCoAuthors.map((user) => user.username).filter(Boolean);
      const usernames = Array.from(new Set([...selectedUsernames, ...typedUsernames]));
      if (usernames.length && response.data?.id) {
        await api.post(`/articles/${response.data.id}/co-authors/`, { usernames, contributions });
      }
      setMessage("Draft created. You can now follow your RSJH research journey from the author dashboard.");
      setTimeout(() => router.push("/dashboard/author"), 1000);
    } catch (error: any) {
      setMessage(error?.response?.data ? JSON.stringify(error.response.data) : "Submission failed. Please check the form and try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <DashboardLayout role="author" title="Start Your RSJH Research Journey">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Step 1 · Build the journey</p>
          <h1 className="mt-2 text-3xl font-bold">Start an RSJH manuscript</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Your submission will move through editor screening, peer review, feedback, revision and editorial decision. The dashboard keeps the journey visible.</p><div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100"><strong>RSJH is free.</strong> There is no student submission fee, peer-review fee, or publication charge.</div>
        </div>

        <form onSubmit={submitArticle} className="space-y-6 rounded-3xl border bg-white p-7 shadow-sm">
          <section>
            <h2 className="text-lg font-bold">Research identity</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Article title" required><input value={form.title} onChange={(e) => change("title", e.target.value)} className="field" required /></Field>
              <SelectField label="Health discipline" value={form.discipline} options={disciplines} onChange={(v: string) => change("discipline", v)} />
              <SelectField label="Article type" value={form.article_type} options={types} onChange={(v: string) => change("article_type", v)} />
              <Field label="Specialty / topic"><input value={form.specialty} onChange={(e) => change("specialty", e.target.value)} className="field" placeholder="e.g. infectious diseases" /></Field>
              <div className="md:col-span-2"><Field label="Research question"><textarea value={form.research_question} onChange={(e) => change("research_question", e.target.value)} className="field min-h-24" placeholder="What question is this work trying to answer?" /></Field></div>
              <div className="md:col-span-2">
                <Field label="Co-authors (optional)">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="relative">
                      <input
                        value={coAuthorQuery}
                        onChange={(e) => setCoAuthorQuery(e.target.value)}
                        className="field bg-white pl-10"
                        placeholder="Search RSJH students and researchers..."
                      />
                      <span className="pointer-events-none absolute left-3 top-3 text-slate-400">🔍</span>
                    </div>

                    {(coAuthorQuery.trim() || loadingUsers) && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {loadingUsers ? (
                          <div className="p-4 text-sm text-slate-500">Loading RSJH users...</div>
                        ) : availableCoAuthors.length === 0 ? (
                          <div className="p-4 text-sm text-slate-500">No matching registered RSJH users found.</div>
                        ) : (
                          availableCoAuthors.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => addCoAuthor(user)}
                              className="flex w-full items-center justify-between gap-4 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 last:border-b-0"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {user.profile_picture ? (
                                  <img src={user.profile_picture} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                                    {(user.full_name || user.username || "R").charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">{user.full_name || user.username}</p>
                                  <p className="truncate text-sm text-slate-500">{user.university || user.institution || "RSJH member"}{user.discipline ? ` · ${user.discipline}` : ""}</p>
                                </div>
                              </div>
                              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">+ Add</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {selectedCoAuthors.length > 0 && (
                      <div className="mt-5 space-y-4">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Selected co-authors & contributions</p>
                        {selectedCoAuthors.map((user) => (
                          <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {user.profile_picture ? <img src={user.profile_picture} alt="" className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">{(user.full_name || user.username || "R").charAt(0).toUpperCase()}</div>}
                                <div><p className="font-bold text-slate-900">{user.full_name || user.username}</p><p className="text-xs text-slate-500">{user.university || user.institution || "RSJH member"}{user.discipline ? ` · ${user.discipline}` : ""}</p></div>
                              </div>
                              <button type="button" onClick={() => removeCoAuthor(user.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Remove</button>
                            </div>
                            <div className="mt-4">
                              <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">Contribution roles</p>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {CONTRIBUTION_ROLES.map((role) => {
                                  const checked = (contributions[user.username] || []).includes(role);
                                  return <label key={role} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={checked} onChange={(e) => setContributions((current) => ({ ...current, [user.username]: e.target.checked ? [...(current[user.username] || []), role] : (current[user.username] || []).filter((r) => r !== role) }))} />{role}</label>;
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-slate-500">Select registered RSJH users. Their account identity will be preserved in the manuscript record.</p>
                  </div>
                </Field>
              </div>
              <Field label="Supervisor / mentor (optional)"><input value={form.supervisor_name} onChange={(e) => change("supervisor_name", e.target.value)} className="field" /></Field>
              <Field label="Study year"><input type="number" value={form.year} onChange={(e) => change("year", e.target.value)} className="field" /></Field>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold">Manuscript</h2>
            <div className="mt-4 space-y-4">
              <Field label="Abstract" required><textarea value={form.abstract} onChange={(e) => change("abstract", e.target.value)} className="field min-h-64 resize-y leading-7" rows={10} placeholder="Write a structured abstract describing the background, objective, methods, key findings and conclusion." required /></Field>
              <Field label="Keywords"><input value={form.keywords} onChange={(e) => change("keywords", e.target.value)} className="field" placeholder="malaria, Rwanda, students, public health" /></Field>
              <Field label="Manuscript PDF" required><input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} required className="block w-full rounded-xl border p-3" /></Field>
            </div>
          </section>

          <section className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-lg font-bold">Research integrity & responsible AI</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Ethics statement"><textarea value={form.ethics_statement} onChange={(e) => change("ethics_statement", e.target.value)} className="field min-h-24" placeholder="Ethics approval / exemption information" /></Field>
              <Field label="Funding statement"><textarea value={form.funding_statement} onChange={(e) => change("funding_statement", e.target.value)} className="field min-h-24" placeholder="Funding source or None declared" /></Field>
              <Field label="Conflict of interest"><textarea value={form.conflict_of_interest} onChange={(e) => change("conflict_of_interest", e.target.value)} className="field min-h-24" /></Field>
              <Field label="Data availability"><textarea value={form.data_availability} onChange={(e) => change("data_availability", e.target.value)} className="field min-h-24" /></Field>
              <div className="md:col-span-2"><Field label="AI use statement"><textarea value={form.ai_use_statement} onChange={(e) => change("ai_use_statement", e.target.value)} className="field min-h-24" placeholder="State whether AI was used for language, research assistance or other support." /></Field></div>
            </div>
            <p className="mt-3 text-sm text-slate-600">RSJH AI tools assist learning and workflow; they do not replace the author's responsibility for facts, citations, originality, ethics or the final manuscript.</p>
          </section>

          {message && <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">{message}</div>}
          <button disabled={submitting} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{submitting ? "Saving manuscript..." : "Create RSJH manuscript draft"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, required, children }: any) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}{required ? " *" : ""}</span>{children}</label>; }
function SelectField({ label, value, options, onChange }: any) { return <Field label={label}><select value={value} onChange={(e) => onChange(e.target.value)} className="field">{options.map((o: string[]) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select></Field>; }
