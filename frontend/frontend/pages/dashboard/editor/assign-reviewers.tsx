import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../utils/api";

interface Article { id:number; title:string; status:string; handling_editor?: { id:number; full_name?:string; username?:string } | null; author?: { username?: string; full_name?: string } }
interface Reviewer { id:number; username:string; full_name:string; email?:string; role?:string; workload?:number; topic_match?:boolean; conflicts?:string[]; eligible?:boolean }
interface EditorUser { id:number; username:string; full_name:string; email?:string }

export default function EditorAssignReviewers({ role = "editor" }: { role?: "editor" | "editor_in_chief" }) {
  const [articles,setArticles]=useState<Article[]>([]);
  const [reviewers,setReviewers]=useState<Reviewer[]>([]);
  const [editors,setEditors]=useState<EditorUser[]>([]);
  const [article,setArticle]=useState("");
  const [reviewer,setReviewer]=useState("");
  const [handlingEditor,setHandlingEditor]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [claiming,setClaiming]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  const selectedArticle = articles.find(a => String(a.id) === String(article));

  async function loadData() {
    setLoading(true); setError("");
    try {
      const requests:any[] = [api.get("/articles/?status=submitted") , api.get("/users/?role=reviewer")];
      if (role === "editor_in_chief") requests.push(api.get("/users/?role=editor"));
      const responses = await Promise.all(requests);
      const articleData = responses[0].data?.results || responses[0].data || [];
      const reviewerData = responses[1].data?.results || responses[1].data || [];
      setArticles(Array.isArray(articleData) ? articleData : []);
      setReviewers(Array.isArray(reviewerData) ? reviewerData : []);
      if (role === "editor_in_chief") {
        const editorData = responses[2]?.data?.results || responses[2]?.data || [];
        setEditors(Array.isArray(editorData) ? editorData : []);
      }
    } catch (e:any) {
      setError(e?.response?.data?.detail || JSON.stringify(e?.response?.data || "Could not load manuscripts or reviewers."));
    } finally { setLoading(false); }
  }

  async function loadSuggestions(articleId:string) {
    if (!articleId) { setReviewers([]); return; }
    try {
      const res = await api.get(`/assignments/suggested-reviewers/?article=${articleId}`);
      setReviewers(res.data?.results || res.data || []);
    } catch (e:any) {
      setError(e?.response?.data?.detail || "Could not load reviewer recommendations.");
    }
  }

  useEffect(()=>{loadData();},[role]);
  useEffect(()=>{ if (article) { loadSuggestions(article); const a=articles.find(x=>String(x.id)===String(article)); setHandlingEditor(a?.handling_editor?.id ? String(a.handling_editor.id) : ""); } },[article]);

  async function claimManuscript() {
    if (!article) return;
    setClaiming(true); setMessage(""); setError("");
    try {
      await api.post(`/articles/${article}/handling-editor/`, { editor: role === "editor" ? undefined : handlingEditor || undefined });
      setMessage("Handling editor assigned. This manuscript is now owned by this editorial workflow.");
      await loadData();
      const fresh=articles.find(a=>String(a.id)===String(article));
      setHandlingEditor(fresh?.handling_editor?.id ? String(fresh.handling_editor.id) : "");
    } catch(e:any) { setError(e?.response?.data?.detail || "Could not assign handling editor."); }
    finally { setClaiming(false); }
  }

  async function assignReviewer() {
    if (!article || !reviewer) return;
    setSaving(true); setMessage(""); setError("");
    try {
      await api.post("/assignments/", { article: Number(article), reviewer: Number(reviewer) });
      setMessage("Reviewer assigned successfully. The reviewer has been notified.");
      setReviewer("");
      await loadData();
      await loadSuggestions(article);
    } catch (e:any) {
      const detail = e?.response?.data?.detail || e?.response?.data || "Failed to assign reviewer.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally { setSaving(false); }
  }

  return (
    <DashboardLayout role={role} title="Assign Reviewers">
      <div className="space-y-6">
        <section className="rsjh-card overflow-hidden p-0">
          <div className="bg-slate-950 p-7 text-white">
            <p className="rsjh-eyebrow text-emerald-300">CONTROLLED PEER REVIEW</p>
            <h1 className="mt-2 text-3xl font-black">Reviewer assignment</h1>
            <p className="mt-2 max-w-3xl text-slate-300">RSJH recommends eligible reviewers using topic fit, workload and conflict checks. Editors still make the final assignment.</p>
          </div>
          <div className="p-7">
            {message && <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">{message}</div>}
            {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 whitespace-pre-wrap">{error}</div>}
            {loading ? <p>Loading manuscripts and reviewers...</p> : <>
              <label className="block mb-2 font-semibold">Select submitted manuscript</label>
              <select value={article} onChange={e=>setArticle(e.target.value)} className="field w-full">
                <option value="">Choose submitted manuscript</option>
                {articles.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
              {!articles.length && <p className="mt-2 text-sm text-amber-700">No submitted manuscripts are waiting for reviewer assignment.</p>}

              {selectedArticle && <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Handling editor</p><p className="mt-1 font-bold text-slate-900">{selectedArticle.handling_editor?.full_name || selectedArticle.handling_editor?.username || "Not assigned yet"}</p></div>
                  <div className="flex items-center gap-2">
                    {role === "editor_in_chief" ? <>
                      <select value={handlingEditor} onChange={e=>setHandlingEditor(e.target.value)} className="field bg-white">
                        <option value="">Assign editor</option>
                        {editors.map(e=><option key={e.id} value={e.id}>{e.full_name || e.username}</option>)}
                      </select>
                      <button onClick={claimManuscript} disabled={!handlingEditor || claiming} className="rsjh-button-green">{claiming ? "Saving..." : "Assign"}</button>
                    </> : <button onClick={claimManuscript} disabled={claiming || Boolean(selectedArticle.handling_editor?.id && selectedArticle.handling_editor.id !== undefined)} className="rsjh-button-primary">{claiming ? "Claiming..." : selectedArticle.handling_editor ? "Handling editor set" : "Claim manuscript"}</button>}
                  </div>
                </div>
              </div>}

              <label className="block mt-7 mb-2 font-semibold">Recommended reviewers</label>
              <div className="space-y-3">
                {reviewers.length === 0 ? <p className="text-sm text-slate-500">Select a manuscript to calculate reviewer recommendations.</p> : reviewers.map(u=><label key={u.id} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${u.eligible ? "bg-white hover:border-emerald-300" : "bg-red-50 opacity-70"}`}>
                  <div className="flex items-center gap-3"><input type="radio" name="reviewer" disabled={!u.eligible} checked={reviewer === String(u.id)} onChange={()=>setReviewer(String(u.id))} /><div><p className="font-bold text-slate-900">{u.full_name || u.username}</p><p className="text-xs text-slate-500">{u.email || ""} · {u.workload ?? 0} active review(s){u.topic_match ? " · topic match" : ""}</p>{u.conflicts?.length ? <p className="mt-1 text-xs font-bold text-red-700">Conflict: {u.conflicts.join(", ").replace(/_/g," ")}</p> : null}</div></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${u.eligible ? "bg-emerald-50 text-emerald-700" : "bg-red-100 text-red-700"}`}>{u.eligible ? "Eligible" : "Excluded"}</span>
                </label>)}
              </div>

              <button onClick={assignReviewer} disabled={!article || !reviewer || saving || (role === "editor" && !selectedArticle?.handling_editor)} className="mt-6 rsjh-button-primary disabled:opacity-40">{saving ? "Assigning..." : "Assign reviewer"}</button>
              {role === "editor" && selectedArticle && !selectedArticle.handling_editor && <p className="mt-2 text-xs text-amber-700">Claim the manuscript first; this prevents multiple editors from managing the same review workflow.</p>}
            </>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
