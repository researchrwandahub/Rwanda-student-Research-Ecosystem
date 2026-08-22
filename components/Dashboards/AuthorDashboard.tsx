import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import api, { absoluteUrl } from "../../utils/api";

interface Review {
  id: number;
  reviewer_name?: string;
  recommendation?: string;
  comments_to_author?: string;
  content?: string;
  created_at?: string;
}

interface JourneyStage {
  key: string;
  label: string;
  complete: boolean;
  current: boolean;
}

interface Article {
  id: number;
  title: string;
  discipline?: string;
  article_type?: string;
  specialty?: string;
  status: string;
  is_published: boolean;
  created_at: string;
  pdf?: string;
  journey?: { current: string; label: string; stages: JourneyStage[] };
  reviewer_feedback?: Review[];
  revisions?: any[];
  editorial_history?: EditorialDecision[];
  co_authors?: Array<{ id:number|string; full_name?:string; username?:string; university?:string }>;
  co_author_contributions?: Array<{ user:{ id:number|string; full_name?:string; username?:string; university?:string }; contribution_roles?:string[] }>;
}

interface EditorialDecision {
  id: number;
  decision?: string;
  rationale?: string;
  created_at?: string;
  editor?: {
    full_name?: string;
    username?: string;
  };
}

const stageStyle: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-indigo-50 text-indigo-700",
  revision: "bg-amber-50 text-amber-800",
  editor_decision: "bg-purple-50 text-purple-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function AuthorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => { loadArticles(); }, []);

  async function submitArticle(articleId: number) {
    try {
      await api.post(`/articles/${articleId}/submit/`);
      await loadArticles();
    } catch (error: any) {
      console.error("Submitting RSJH manuscript failed", error);
      const detail = error?.response?.data?.detail || "Unable to submit this manuscript.";
      window.alert(detail);
    }
  }

  async function loadArticles() {
    try {
      const [response, notificationsResponse] = await Promise.all([
        api.get("/articles/my/"),
        api.get("/notifications/"),
      ]);
      setArticles(response.data.results || response.data || []);
      setNotifications(notificationsResponse.data.results || notificationsResponse.data || []);
    } catch (error) {
      console.error("Loading RSJH manuscripts failed", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardLayout role="author" title="RSJH Student Research Journey"><div className="py-20 text-center">Loading your research journey...</div></DashboardLayout>;
  }

  const total = articles.length;
  const inReview = articles.filter((a) => ["submitted", "under_review"].includes(a.status)).length;
  const revisions = articles.filter((a) => a.status === "revision").length;
  const published = articles.filter((a) => a.is_published).length;
  const feedbackCount = articles.reduce((n, a) => n + (a.reviewer_feedback?.length || 0), 0);

  return (
    <DashboardLayout role="author" title="RSJH Student Research Journey">
      <div className="space-y-7">
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 to-blue-900 p-7 text-white shadow-lg">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Rwanda Student Journal for Health</p>
            <h1 className="mt-2 text-3xl font-bold">Your research journey</h1>
            <p className="mt-2 max-w-3xl text-blue-100">RSJH is built so that publication is not the end of learning. See where your manuscript is, read reviewer feedback, respond to revisions, and move toward publication.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Manuscripts", total], ["In review", inReview], ["Revision", revisions], ["Feedback", feedbackCount], ["Published", published],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex justify-end items-start">
            <Link href="/submit" className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow hover:bg-blue-800">+ Start a new RSJH manuscript</Link>
          </div>
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-900">Latest notifications</h2>
              <Link href="/notifications" className="text-xs font-black text-blue-700">View all →</Link>
            </div>
            <div className="mt-3 space-y-3">
              {notifications.slice(0,4).map((note)=><div key={note.id} className={`rounded-xl p-3 ${note.is_read ? 'bg-slate-50' : 'bg-emerald-50 ring-1 ring-emerald-100'}`}><div className="text-sm font-bold text-slate-900">{!note.is_read && '● '}{note.title}</div><div className="mt-1 text-xs leading-5 text-slate-600">{note.message}</div></div>)}
              {notifications.length===0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
            </div>
          </section>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">Your journey starts here.</h2>
            <p className="mt-2 text-slate-500">Develop a research idea, prepare your manuscript and submit it for the RSJH pathway.</p>
          </div>
        ) : articles.map((article) => (
          <article key={article.id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{article.discipline?.replace(/_/g, " ") || article.specialty || "Health research"}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{article.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{article.article_type?.replace(/_/g, " ") || "Research manuscript"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${stageStyle[article.status] || "bg-slate-100 text-slate-700"}`}>{article.journey?.label || article.status.replace(/_/g, " ")}</span>
            </div>

            {article.journey?.stages && (
              <div className="mt-6 overflow-x-auto pb-2">
                <div className="flex min-w-[760px] items-center">
                  {article.journey.stages.filter((s) => s.key !== "accepted").map((stage, index, stages) => (
                    <div key={stage.key} className="flex min-w-[150px] items-center">
                      <div className={`flex items-center gap-2 ${stage.current ? "font-bold text-blue-700" : stage.complete ? "text-emerald-700" : "text-slate-400"}`}>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs ${stage.current ? "border-blue-600 bg-blue-50" : stage.complete ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>{stage.complete ? "✓" : index + 1}</span>
                        <span className="text-xs">{stage.label}</span>
                      </div>
                      {index < stages.length - 1 && <div className={`mx-3 h-0.5 flex-1 ${stage.complete ? "bg-emerald-400" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {article.reviewer_feedback && article.reviewer_feedback.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-amber-900">Reviewer feedback</h3>
                  {article.status === "revision" && <Link href={`/dashboard/author/manuscript/${article.id}`} className="text-sm font-semibold text-amber-900 underline">Open revision workspace</Link>}
                </div>
                <div className="mt-4 space-y-4">
                  {article.reviewer_feedback.map((review) => (
                    <div key={review.id} className="rounded-xl border border-amber-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">Reviewer feedback</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{review.recommendation?.replace(/_/g, " ") || "Review submitted"}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comments_to_author || review.content || "No comments were supplied."}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {article.co_authors && article.co_authors.length > 0 && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="font-bold text-emerald-950">Author team & contributions</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {article.co_authors.map((co) => {
                    const c = article.co_author_contributions?.find((x) => String(x.user?.id) === String(co.id));
                    return <div key={co.id} className="rounded-xl border border-emerald-100 bg-white p-4"><p className="font-semibold text-slate-900">{co.full_name || co.username}</p><p className="text-xs text-slate-500">{co.university || "RSJH contributor"}</p>{c?.contribution_roles?.length ? <p className="mt-2 text-xs leading-5 text-slate-600"><span className="font-semibold">Contributions:</span> {c.contribution_roles.join(", ")}</p> : <p className="mt-2 text-xs text-slate-400">Contribution roles not recorded yet.</p>}</div>;
                  })}
                </div>
              </div>
            )}

            {article.editorial_history && article.editorial_history.length > 0 && (
              <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-purple-950">Editorial recommendations & decisions</h3>
                    <p className="mt-1 text-xs text-purple-800">The editorial record shared with you for this manuscript.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {article.editorial_history.map((decision) => (
                    <div key={decision.id} className="rounded-xl border border-purple-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-900">Editorial recommendation</span>
                          {decision.editor && (
                            <span className="ml-2 text-xs text-slate-500">
                              {decision.editor.full_name || decision.editor.username || "Editorial team"}
                            </span>
                          )}
                        </div>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-900">
                          {decision.decision?.replace(/_/g, " ") || "Decision recorded"}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {decision.rationale || "No editorial rationale was supplied."}
                      </p>
                      {decision.created_at && (
                        <p className="mt-3 text-xs text-slate-400">
                          {new Date(decision.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {article.status === "draft" && (
                <button
                  type="button"
                  onClick={() => submitArticle(article.id)}
                  className="rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
                >
                  Submit manuscript
                </button>
              )}
              {article.status === "revision" && <Link href={`/dashboard/author/manuscript/${article.id}`} className="rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700">Respond & submit revision</Link>}
              {article.pdf && (
                <a
                  href={absoluteUrl(article.pdf)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View manuscript PDF
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
