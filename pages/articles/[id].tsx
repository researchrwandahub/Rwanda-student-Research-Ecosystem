// pages/articles/[id].tsx
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../utils/api";
import RSREArticleSeo from "../../components/RSREArticleSeo";

interface Article {
  id: number;
  title: string;
  abstract?: string;
  specialty?: string;
  keywords?: string;
  pdf?: string;
  published_date?: string;
  volume?: string | number;
  issue?: string | number;
  doi?: string;
  article_type?: string;
  author?: { username?: string; full_name?: string; university?: string };
  co_authors?: Array<{ id: number | string; username?: string; full_name?: string; university?: string }>;
  co_author_contributions?: Array<{ user: { id: number | string; username?: string; full_name?: string; university?: string }; contribution_roles?: string[] }>;
}


export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const id = String(params?.id || '')
  const configured = process.env.NEXT_PUBLIC_API_URL || ''

  if (!id || !configured) {
    return { props: { initialArticle: null } }
  }

  const clean = configured.replace(/\/$/, '')
  const base = clean.endsWith('/api') ? clean : `${clean}/api`

  try {
    const response = await fetch(`${base}/articles/${encodeURIComponent(id)}/`)
    if (response.status === 404) return { notFound: true }
    if (!response.ok) return { props: { initialArticle: null } }

    const initialArticle = await response.json()
    return { props: { initialArticle } }
  } catch {
    return { props: { initialArticle: null } }
  }
}
export default function ArticleDetail({ initialArticle }: { initialArticle?: Article }) {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState<Article | null>(initialArticle ?? null);
  const [loading, setLoading] = useState(!initialArticle);

  useEffect(() => {
    if (id) loadArticle();
  }, [id, initialArticle]);

  async function loadArticle() {
    try {
      const response = await api.get(`/articles/${id}/`);
      setArticle(response.data);
    } catch (error) {
      console.log("Article loading error", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Layout><div className="rsre-page py-16"><div className="rsre-empty">Loading articleâ€¦</div></div></Layout>;
  }

  if (!article) {
    return <Layout><div className="rsre-page py-16"><div className="rsre-empty">Article not found.</div></div></Layout>;
  }

  return (
    <Layout>
      {/* Reading-oriented width â€” an editorial column, not a full-bleed dashboard panel */}
      <RSREArticleSeo article={article} />

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-6">

        <div className="flex flex-wrap items-center gap-2">
          <span className="rsre-badge rsre-badge-success">Published</span>
          {article.article_type && <span className="rsre-badge">{article.article_type.replace(/_/g, " ")}</span>}
          {article.volume && <span className="rsre-badge">Vol. {article.volume}{article.issue ? `, Issue ${article.issue}` : ""}</span>}
        </div>

        <h1 className="rsjh-title mt-5 text-3xl md:text-4xl">{article.title}</h1>

        <div className="mt-5 border-b border-graphite-200 pb-5 text-sm leading-7 text-graphite-700">
          <p><span className="font-semibold text-ink">{article.author?.full_name || article.author?.username || "Unknown author"}</span>{article.author?.university ? ` Â· ${article.author.university}` : ""}</p>
          <p className="rsre-meta mt-1">{article.specialty || "General Medicine"}{article.published_date ? ` Â· Published ${new Date(article.published_date).toLocaleDateString()}` : ""}{article.doi ? ` Â· DOI: ${article.doi}` : ""}</p>

          {article.co_authors && article.co_authors.length > 0 && (
            <div className="mt-4">
              <div className="rsre-kpi-label">Co-authors</div>
              <div className="mt-2 space-y-2">
                {article.co_authors.map((co) => {
                  const contribution = article.co_author_contributions?.find((c) => String(c.user?.id) === String(co.id));
                  return (
                    <div key={co.id} className="text-sm">
                      <span className="font-semibold text-ink">{co.full_name || co.username}</span>
                      <span className="text-graphite-500"> Â· {co.university || "RSJH contributor"}</span>
                      {contribution?.contribution_roles?.length ? <div className="rsre-meta">Contributions: {contribution.contribution_roles.join(", ")}</div> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 rounded-md border border-canopy-100 bg-canopy-50 px-5 py-4 text-sm text-canopy-800">
          <strong className="font-semibold">RSJH is free.</strong> This publication is openly accessible â€” no charge for submission, peer review or publication.
        </div>

        <h2 className="mt-8 text-xl font-semibold text-ink">Abstract</h2>
        <p className="mt-3 leading-8 text-graphite-800">{article.abstract || "No abstract available."}</p>

        {article.keywords && (
          <div className="mt-6 text-sm">
            <span className="font-semibold text-ink">Keywords:</span> <span className="text-graphite-600">{article.keywords}</span>
          </div>
        )}

        {article.pdf && (
          <div className="mt-8">
            <a href={article.pdf} target="_blank" rel="noopener noreferrer" className="rsjh-button-primary">
              Read / download PDF
            </a>
          </div>
        )}
      </article>
    </Layout>
  );
}
