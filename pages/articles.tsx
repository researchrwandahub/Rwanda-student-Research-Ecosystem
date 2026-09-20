import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import api from "../utils/api";

interface Article {
  id: number | string;
  title: string;
  abstract?: string;
  specialty?: string;
  pdf?: string;
  status?: string;
  keywords?: string;
  year?: number;
  published_date?: string;
  author?: {
    username?: string;
    full_name?: string;
    university?: string;
  };
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  // =====================================================
  // LOAD PUBLISHED ARTICLES (unchanged — real data, two-step fallback)
  // =====================================================
  useEffect(() => {
    async function loadArticles() {
      try {
        let data: any[] = [];
        try {
          const response = await api.get("/articles/?status=published&is_published=true");
          data = response.data?.results || response.data || [];
        } catch {
          const response = await api.get("/articles/?is_published=true");
          data = response.data?.results || response.data || [];
        }
        data = Array.isArray(data)
          ? data.filter((article) => article?.is_published || article?.status === "published")
          : [];
        setArticles(data);
      } catch (error) {
        console.error("Loading articles error:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  // =====================================================
  // SEARCH (unchanged)
  // =====================================================
  const searchText = search.trim().toLowerCase();
  const filteredArticles = articles.filter((article) => {
    if (!searchText) return true;
    const searchableText = [
      article.title, article.abstract, article.keywords, article.specialty,
      article.author?.username, article.author?.full_name, article.author?.university,
    ].filter(Boolean).join(" ").toLowerCase();
    return searchableText.includes(searchText);
  });

  // =====================================================
  // PAGINATION (unchanged)
  // =====================================================
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Layout>
      <section className="rsre-page py-12">

        {/* HEADER — editorial, not a generic page banner */}
        <div className="rsre-page-heading">
          <div className="rsre-kicker">RSJH</div>
          <h1 className="rsjh-title mt-2 text-4xl md:text-5xl">Rwanda Student Journal for Health</h1>
          <p className="mt-4">Published research from students and early-career researchers, free to read, review and submit to.</p>
        </div>

        {/* SEARCH */}
        <div className="mt-8 border-y border-graphite-200 py-5">
          <label htmlFor="article-search" className="rsre-kpi-label">Search RSJH</label>
          <div className="mt-2 flex gap-3">
            <input
              id="article-search"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by title, author, topic, specialty, or keyword…"
              className="flex-1 rounded-md border border-graphite-200 px-4 py-3 text-sm outline-none"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); setCurrentPage(1); }} className="rsre-action-secondary">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loading && <div className="mt-8 rsre-empty">Loading articles…</div>}

        {/* NO ARTICLES AT ALL */}
        {!loading && articles.length === 0 && (
          <div className="mt-8 rsre-empty">
            <div>
              <div className="font-semibold text-ink">No published articles yet.</div>
              <p className="mt-1 text-sm">Published research articles will appear here.</p>
            </div>
          </div>
        )}

        {/* SEARCH FOUND NOTHING */}
        {!loading && articles.length > 0 && filteredArticles.length === 0 && (
          <div className="mt-8 rsre-empty">
            <div>
              <div className="font-semibold text-ink">No articles match "{search}"</div>
              <button type="button" onClick={() => { setSearch(""); setCurrentPage(1); }} className="rsre-action-secondary mt-4">
                Show all articles
              </button>
            </div>
          </div>
        )}

        {/* RESULT COUNT */}
        {!loading && filteredArticles.length > 0 && (
          <div className="mt-6 rsre-meta">
            {search
              ? <>Found <span className="font-semibold text-ink">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? "s" : ""} matching "{search}"</>
              : <>Showing <span className="font-semibold text-ink">{filteredArticles.length}</span> published article{filteredArticles.length !== 1 ? "s" : ""}</>}
          </div>
        )}

        {/* ARTICLES — editorial list, not blog cards */}
        {!loading && currentArticles.length > 0 && (
          <div className="mt-2 divide-y divide-graphite-200 border-t border-graphite-200">
            {currentArticles.map((article) => (
              <article key={article.id} className="py-8">
                <Link href={`/articles/${article.id}`} className="rsjh-title block text-2xl hover:text-canopy-700 md:text-3xl">
                  {article.title}
                </Link>

                <div className="mt-3 rsre-meta">
                  {article.author?.full_name || article.author?.username || "Unknown author"}
                  {article.author?.university ? ` · ${article.author.university}` : ""}
                  {" · "}{article.specialty || "General Medicine"}
                  {article.year ? ` · ${article.year}` : ""}
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-graphite-700">
                  {article.abstract || "Abstract not available."}
                </p>

                {article.keywords && <div className="mt-2 text-xs text-graphite-500">Keywords: {article.keywords}</div>}

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/articles/${article.id}`} className="text-sm font-semibold text-canopy-700">Read article →</Link>
                  {article.pdf && (
                    <a href={article.pdf} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-graphite-600 hover:text-ink">
                      Download PDF
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="rsre-action-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={page === currentPage ? "rounded-md bg-ink px-4 py-2 text-sm font-semibold text-parchment" : "rsre-action-secondary"}
              >
                {page}
              </button>
            ))}
            <button type="button" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="rsre-action-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}
