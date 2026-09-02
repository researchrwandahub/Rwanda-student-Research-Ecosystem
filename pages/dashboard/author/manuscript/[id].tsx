import { FormEvent } from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import api from "../../../../utils/api";

export default function AuthorManuscriptWorkspace() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    try { const res = await api.get(`/articles/${id}/journey/`); setArticle(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function submitRevision(e: FormEvent) {
    e.preventDefault();
    if (!file) { alert("Attach the revised manuscript PDF."); return; }
    setSaving(true);
    try {
      const data = new FormData();
      data.append("response_to_reviewers", response);
      data.append("author_notes", notes);
      data.append("manuscript_file", file);
      await api.post(`/articles/${id}/submit-revision/`, data, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Revision submitted. Your manuscript has returned to review.");
      await load();
      router.push("/dashboard/author");
    } catch (e: any) { alert(e?.response?.data?.detail || "Unable to submit the revision."); }
    finally { setSaving(false); }
  }

  async function askAI() {
    if (!response.trim()) { alert("First paste or write one reviewer comment you want help understanding."); return; }
    setAiLoading(true); setAiText("");
    try {
      const res = await api.post("/ai/assist/", { task: "reviewer_support", text: response, article: id, disclosed: true });
      setAiText(res.data.content || "No AI suggestion returned.");
    } catch (e: any) { setAiText(e?.response?.data?.detail || "AI assistance is not available right now."); }
    finally { setAiLoading(false); }
  }

  if (loading) return <DashboardLayout role="author" title="Revision Workspace"><div className="py-20 text-center">Loading manuscript journey...</div></DashboardLayout>;
  if (!article) return <DashboardLayout role="author" title="Revision Workspace"><div className="py-20 text-center">Manuscript not found.</div></DashboardLayout>;

  return (
    <DashboardLayout role="author" title="Revision Workspace">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">RSJH manuscript journey</p>
          <h1 className="mt-2 text-3xl font-bold">{article.title}</h1>
          <p className="mt-2 text-slate-300">Current stage: {article.journey?.label || article.status}</p><div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100"><strong>Free publication promise:</strong> RSJH does not charge students to submit, undergo peer review, or publish.</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Reviewer comments</h2>
          <div className="mt-4 space-y-4">
            {(article.reviewer_feedback || []).length === 0 ? <p className="text-slate-500">No reviewer feedback is available yet.</p> : article.reviewer_feedback.map((review: any) => (
              <div key={review.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong>Reviewer</strong><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{review.recommendation?.replace(/_/g, " ")}</span></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comments_to_author || review.content || "No comments supplied."}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-purple-950">Editorial recommendations & decisions</h2>
          <p className="mt-1 text-sm text-purple-800">Read the editorial recommendation and rationale recorded for your manuscript.</p>
          <div className="mt-4 space-y-4">
            {(article.editorial_history || []).length === 0 ? (
              <p className="text-slate-500">No editorial recommendation has been recorded yet.</p>
            ) : article.editorial_history.map((decision: any) => (
              <div key={decision.id} className="rounded-2xl border border-purple-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong>Editorial recommendation</strong>
                    {decision.editor && <span className="ml-2 text-xs text-slate-500">{decision.editor.full_name || decision.editor.username || "Editorial team"}</span>}
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-900">{decision.decision?.replace(/_/g, " ") || "Decision recorded"}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{decision.rationale || "No rationale supplied."}</p>
              </div>
            ))}
          </div>
        </div>

        {article.status === "revision" && (
          <form onSubmit={submitRevision} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Respond and submit revision</h2>
            <p className="mt-1 text-sm text-slate-500">Explain how you addressed the reviewer comments. Keep this response specific and evidence-based. Your revision returns through the existing editorial workflow.</p>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} className="field mt-4 min-h-44" placeholder="Response to reviewers: Comment 1 → Response..." required />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field mt-4 min-h-24" placeholder="Optional notes for the editor" />
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-4 block w-full rounded-xl border p-3" required />
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{saving ? "Submitting..." : "Submit revised manuscript"}</button>
              <button type="button" onClick={askAI} disabled={aiLoading} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-800">{aiLoading ? "AI helping..." : "Use RSJH AI for assistance"}</button>
            </div>
            {aiText && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>AI assistance:</strong><p className="mt-2 whitespace-pre-wrap">{aiText}</p><p className="mt-3 text-xs text-slate-500">AI suggestions are advisory. Verify the content and make the final response yourself.</p></div>}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
