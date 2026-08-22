import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import api, { absoluteUrl } from "../../utils/api";

interface Article {
  id: number | string;
  title: string;
  abstract?: string;
  status?: string;
  pdf?: string;
  author?: { username?: string; full_name?: string };
  author_name?: string;
  updated_at?: string;
}

interface EditorialDashboardProps {
  role: "editor" | "editor_in_chief";
}

const editorialStatuses = ["submitted", "editor_decision", "under_review", "revision", "accepted"];

export default function EditorialDashboard({ role }: EditorialDashboardProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionArticle, setDecisionArticle] = useState<Article | null>(null);
  const [decision, setDecision] = useState(role === "editor_in_chief" ? "accept" : "minor_revision");
  const [rationale, setRationale] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [articlesRes, opportunitiesRes, notificationsRes] = await Promise.all([
        api.get("/articles/"),
        api.get("/research-opportunities/"),
        api.get("/notifications/"),
      ]);
      setArticles(articlesRes.data.results || articlesRes.data || []);
      setOpportunities(opportunitiesRes.data.results || opportunitiesRes.data || []);
      setNotifications(notificationsRes.data.results || notificationsRes.data || []);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Could not load editorial data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const manuscripts = useMemo(
    () => articles.filter(a => editorialStatuses.includes(a.status || "")),
    [articles]
  );

  const pendingScreening = manuscripts.filter(a => ["submitted", "editor_decision"].includes(a.status || ""));
  const underReview = manuscripts.filter(a => a.status === "under_review");
  const published = articles.filter(a => a.status === "published");

  async function submitDecision() {
    if (!decisionArticle) return;
    setSaving(true);
    setMessage("");
    try {
      await api.post("/editorial-decisions/", {
        article: decisionArticle.id,
        decision,
        rationale,
      });
      setMessage(`Decision recorded for "${decisionArticle.title}".`);
      setDecisionArticle(null);
      setRationale("");
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || JSON.stringify(error?.response?.data || "Could not save decision."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      role={role}
      title={role === "editor_in_chief" ? "Editor-in-Chief Dashboard" : "Editor Dashboard"}
    >
      <div className={`mb-8 rounded-3xl p-7 text-white shadow-xl ${role === "editor_in_chief" ? "bg-violet-950" : "bg-slate-950"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{role === "editor_in_chief" ? "FINAL EDITORIAL AUTHORITY" : "EDITORIAL WORKFLOW"}</p>
            <h1 className="mt-2 text-3xl font-black">{role === "editor_in_chief" ? "Editor-in-Chief Dashboard" : "Editor Dashboard"}</h1>
            <p className="mt-2 max-w-2xl text-blue-100">{role === "editor_in_chief" ? "Own final editorial authority: review recommendations, protect journal standards and approve publication." : "Manage screening, reviewer assignments, peer-review progress and editorial recommendations."}</p>
          </div>
          <Link href="/editorial-board" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-bold text-white hover:bg-white/10">View board structure →</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-5 mb-8">
        <Stat label="Editorial Queue" value={manuscripts.length} />
        <Stat label="Awaiting Screening" value={pendingScreening.length} />
        <Stat label="Under Review" value={underReview.length} />
        <Stat label="Published" value={published.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {role === "editor" ? <QuickLink href="/dashboard/editor/assign-reviewers" title="Reviewer Assignments" text="Send eligible manuscripts to qualified reviewers and monitor deadlines." /> : <QuickLink href="/editorial-board" title="Final Governance" text="Review editorial structure, board appointments and journal governance." />}
        <QuickLink href="/research-opportunities" title="Research Opportunities" text="Publish grants, calls, fellowships, conferences and collaborations for public discovery." />
        <QuickLink href="/notifications" title="Editorial Notifications" text="Track manuscript, reviewer and decision alerts in one place." />
      </div>

      {message && <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-900">{message}</div>}

      <section className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-blue-950">{role === "editor_in_chief" ? "Final Editorial Queue" : "Editorial Manuscripts"}</h2>
            <p className="text-gray-500 mt-1">{role === "editor_in_chief" ? "Review recommendations and take the final publication decision." : "Screen submissions, coordinate peer review and record editorial recommendations."}</p>
          </div>
          <button onClick={load} className="px-4 py-2 rounded-xl border hover:bg-gray-50">Refresh</button>
        </div>

        {loading ? <p>Loading editorial queue...</p> : manuscripts.length === 0 ? (
          <p className="text-gray-500">No manuscripts currently in the editorial queue.</p>
        ) : (
          <div className="space-y-4">
            {manuscripts.map(article => (
              <article key={article.id} className="border rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Author: {article.author?.full_name || article.author?.username || article.author_name || "Unknown"}
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-100 text-sm font-medium">
                      {(article.status || "unknown").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.pdf && (
                      <a href={absoluteUrl(article.pdf)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-blue-700 text-white">Open PDF</a>
                    )}
                    {(role === "editor_in_chief" ? ["editor_decision", "under_review", "revision"] : ["submitted", "under_review"]).includes(article.status || "") && (
                      <button
                        onClick={() => setDecisionArticle(article)}
                        className="px-4 py-2 rounded-xl bg-green-700 text-white"
                      >
                        {role === "editor_in_chief" ? "Final Decision" : "Editorial Recommendation"}
                      </button>
                    )}
                  </div>
                </div>
                {article.abstract && <p className="mt-4 text-gray-600 line-clamp-3">{article.abstract}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-bold">Research Opportunities</h2>
          <p className="text-gray-500 mt-1">Active opportunities visible to the RSJH community.</p>
          <div className="mt-4 space-y-3">
            {opportunities.slice(0, 5).map(item => (
              <div key={item.id} className="border rounded-xl p-4">
                <div className="font-semibold">{item.title}</div>
                {item.deadline && <div className="text-sm text-gray-500">Deadline: {item.deadline}</div>}
              </div>
            ))}
            {opportunities.length === 0 && <p className="text-gray-500">No active opportunities.</p>}
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-bold">Recent Notifications</h2>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 6).map(item => (
              <div key={item.id} className="border-b pb-3">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-600">{item.message}</div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-gray-500">No notifications.</p>}
          </div>
        </section>
      </div>

      {decisionArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold">Editorial Decision</h2>
            <p className="mt-2 text-gray-600">{decisionArticle.title}</p>
            <label className="block mt-5 font-medium">
              Decision
              <select value={decision} onChange={e => setDecision(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
                {role === "editor_in_chief" && <option value="accept">Accept & Publish</option>}
                <option value="minor_revision">Minor Revision</option>
                <option value="major_revision">Major Revision</option>
                <option value="reject">Reject</option>
              </select>
            </label>
            <label className="block mt-4 font-medium">
              Editorial comments / rationale
              <textarea value={rationale} onChange={e => setRationale(e.target.value)} rows={5} className="mt-2 w-full border rounded-xl p-3" placeholder="Explain the reason, requested changes, governance considerations, or final decision..." />
            </label>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setDecisionArticle(null)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button disabled={saving} onClick={submitDecision} className="px-4 py-2 rounded-xl bg-blue-900 text-white disabled:opacity-50">
                {saving ? "Saving..." : role === "editor_in_chief" ? "Record Final Decision" : "Save Recommendation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold text-blue-950 mt-2">{value}</p></div>;
}

function QuickLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="bg-white rounded-2xl border p-5 hover:shadow-md transition"><h3 className="font-bold text-blue-900">{title}</h3><p className="text-sm text-gray-600 mt-2">{text}</p></Link>;
}
