import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import api from "../utils/api";

interface Article {
  id: number | string;
  title: string;
  abstract?: string;
  specialty?: string;
  discipline?: string;
  pdf?: string | null;
  status?: string;
  is_published?: boolean;
  keywords?: string;
  year?: number;
  published_date?: string;
  received_date?: string;
  accepted_date?: string;
  volume?: number | null;
  issue?: number | null;
  publication_number?: number | null;
  doi?: string;
  citation_text?: string;
  license?: string;
  author?: {
    username?: string;
    full_name?: string;
    university?: string;
    institution?: string;
  };
  co_authors?: any[];
}

function getArray(data: any): Article[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAuthors(article: Article) {
  const lead =
    article.author?.full_name ||
    article.author?.username ||
    "RSJH author";

  const coAuthors = Array.isArray(article.co_authors)
    ? article.co_authors
        .map(
          (author: any) =>
            author?.full_name ||
            author?.username ||
            author?.name
        )
        .filter(Boolean)
    : [];

  return [lead, ...coAuthors].join(", ");
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const articlesPerPage = 6;

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/articles/");
        const data = getArray(response.data);

        const publicArticles = data.filter(
          (article) =>
            article?.status === "published" &&
            article?.is_published === true
        );

        if (mounted) {
          setArticles(publicArticles);
        }
      } catch (requestError) {
        console.error("Loading RSJH articles:", requestError);

        if (mounted) {
          setArticles([]);
          setError(
            "The journal could not be loaded right now."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      mounted = false;
    };
  }, []);

  const searchText = search.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    if (!searchText) {
      return articles;
    }

    return articles.filter((article) => {
      const searchableText = [
        article.title,
        article.abstract,
        article.keywords,
        article.specialty,
        article.discipline,
        article.author?.username,
        article.author?.full_name,
        article.author?.university,
        article.author?.institution,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [articles, searchText]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredArticles.length / articlesPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const currentArticles = filteredArticles.slice(
    (safePage - 1) * articlesPerPage,
    safePage * articlesPerPage
  );

  function handleSearch(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function clearSearch() {
    setSearch("");
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Layout>
      <main className="bg-white text-slate-950">
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Rwanda Student Journal for Health
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Published research from the RSJH community.
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                Explore student-centred health research from Rwanda and
                related research communities. Published manuscripts go through
                an editorial and peer-review workflow before appearing here.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="article-search"
              className="text-sm font-black text-slate-800"
            >
              Search published research
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="article-search"
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search by title, author, topic, specialty or keyword"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
              Loading published research...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8">
              <h2 className="text-xl font-black text-rose-900">
                Journal unavailable
              </h2>

              <p className="mt-2 text-sm leading-6 text-rose-800">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            articles.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  RSJH Journal
                </div>

                <h2 className="mt-3 text-2xl font-black">
                  No published articles yet.
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Published manuscripts will appear here after the editorial
                  and publication process is complete.
                </p>

                <Link
                  href="/submit"
                  className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                >
                  Submit a manuscript
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            articles.length > 0 &&
            filteredArticles.length === 0 && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="text-xl font-black">
                  No articles match your search.
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try another title, topic, author or keyword.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white"
                >
                  Show all articles
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            currentArticles.length > 0 && (
              <>
                <div className="mt-8 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Published record
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-600">
                      {search
                        ? `${filteredArticles.length} matching article${
                            filteredArticles.length !== 1
                              ? "s"
                              : ""
                          }`
                        : `${articles.length} published article${
                            articles.length !== 1
                              ? "s"
                              : ""
                          }`}
                    </div>
                  </div>

                  {search && (
                    <div className="text-sm text-slate-500">
                      Search:{" "}
                      <span className="font-black text-slate-800">
                        "{search}"
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {currentArticles.map((article) => (
                    <article
                      key={article.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          {article.specialty ||
                            article.discipline ||
                            "Health research"}
                        </span>

                        {article.year && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                            {article.year}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/articles/${article.id}`}
                        className="mt-4 block text-2xl font-black leading-8 text-slate-950 transition hover:text-emerald-700"
                      >
                        {article.title}
                      </Link>

                      <div className="mt-3 text-sm font-bold text-slate-500">
                        {getAuthors(article)}
                      </div>

                      {article.author?.university ||
                        article.author?.institution ? (
                        <div className="mt-1 text-xs text-slate-400">
                          {article.author?.university ||
                            article.author?.institution}
                        </div>
                      ) : null}

                      {article.abstract && (
                        <p className="mt-5 line-clamp-5 text-sm leading-7 text-slate-600">
                          {article.abstract}
                        </p>
                      )}

                      <div className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        {article.published_date && (
                          <div>
                            <span className="font-black text-slate-700">
                              Published:
                            </span>{" "}
                            {formatDate(
                              article.published_date
                            )}
                          </div>
                        )}

                        {article.volume != null &&
                          article.issue != null && (
                            <div>
                              <span className="font-black text-slate-700">
                                Issue:
                              </span>{" "}
                              Vol. {article.volume}, Issue{" "}
                              {article.issue}
                            </div>
                          )}

                        {article.publication_number != null && (
                          <div>
                            <span className="font-black text-slate-700">
                              Article:
                            </span>{" "}
                            {String(
                              article.publication_number
                            ).padStart(4, "0")}
                          </div>
                        )}

                        {article.doi && (
                          <div className="truncate">
                            <span className="font-black text-slate-700">
                              DOI:
                            </span>{" "}
                            {article.doi}
                          </div>
                        )}
                      </div>

                      {article.keywords && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Keywords
                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {article.keywords}
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={`/articles/${article.id}`}
                          className="flex-1 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800"
                        >
                          View article
                        </Link>

                        {article.pdf && (
                          <a
                            href={article.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:bg-slate-50"
                          >
                            Open PDF
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={safePage === 1}
                      onClick={() =>
                        goToPage(safePage - 1)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          goToPage(page)
                        }
                        className={
                          safePage === page
                            ? "rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
                            : "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700"
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={
                        safePage === totalPages
                      }
                      onClick={() =>
                        goToPage(safePage + 1)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Rwanda Student Journal for Health
            </div>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Have research to share?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              RSJH provides a structured pathway for manuscript submission,
              editorial screening, peer review, revision and publication.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/submit"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
              >
                Submit manuscript
              </Link>

              <Link
                href="/author-guidelines"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800"
              >
                Author guidelines
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}