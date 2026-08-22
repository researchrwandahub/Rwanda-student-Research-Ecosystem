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
  // LOAD PUBLISHED ARTICLES
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
        console.error(
          "Loading articles error:",
          error
        );

        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText = search.trim().toLowerCase();

  const filteredArticles = articles.filter(
    (article) => {
      if (!searchText) {
        return true;
      }

      const searchableText = [
        article.title,
        article.abstract,
        article.keywords,
        article.specialty,
        article.author?.username,
        article.author?.full_name,
        article.author?.university,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        searchText
      );
    }
  );

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredArticles.length /
      articlesPerPage
  );

  const startIndex =
    (currentPage - 1) *
    articlesPerPage;

  const endIndex =
    startIndex + articlesPerPage;

  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  function handleSearch(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setSearch(event.target.value);

    // Always return to first page
    // when a new search is made
    setCurrentPage(1);
  }

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  function goToPage(page: number) {
    if (
      page < 1 ||
      page > totalPages
    ) {
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
      <section className="page-shell py-12">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            RSJH Journal
          </h1>

          <p className="mt-3 text-gray-600">
            Explore published research through the Rwanda Student Journal for Health.
          </p>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="light-panel rounded-2xl p-5 mb-8">

          <label
            htmlFor="article-search"
            className="block font-semibold text-gray-800 mb-2"
          >
            Search RSJH Journal
          </label>

          <div className="flex gap-3">

            <input
              id="article-search"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by title, author, topic, specialty, or keyword..."
              className="
                flex-1
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-100
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-gray-200
                  hover:bg-gray-300
                  text-gray-800
                  font-semibold
                "
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-8 text-gray-600">
            Loading articles...
          </div>
        )}

        {/* =================================================
            NO ARTICLES AT ALL
        ================================================= */}

        {!loading &&
          articles.length === 0 && (
            <div className="light-panel rounded-2xl p-8 text-center">

              <h2 className="text-xl font-bold">
                No published articles yet.
              </h2>

              <p className="mt-2 text-gray-600">
                Published research articles
                will appear here.
              </p>

            </div>
          )}

        {/* =================================================
            SEARCH FOUND NOTHING
        ================================================= */}

        {!loading &&
          articles.length > 0 &&
          filteredArticles.length === 0 && (
            <div className="light-panel rounded-2xl p-8 text-center">

              <div className="text-4xl mb-3">
                🔎
              </div>

              <h2 className="text-xl font-bold">
                No articles found
              </h2>

              <p className="mt-2 text-gray-600">
                No published research articles
                match{" "}
                <span className="font-semibold">
                  "{search}"
                </span>
                .
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="
                  mt-5
                  bg-blue-700
                  hover:bg-blue-800
                  text-white
                  px-5
                  py-2
                  rounded-xl
                  font-semibold
                "
              >
                Show All Articles
              </button>

            </div>
          )}

        {/* =================================================
            SEARCH RESULT COUNT
        ================================================= */}

        {!loading &&
          filteredArticles.length > 0 && (
            <div className="mb-5 text-sm text-gray-600">

              {search ? (
                <>
                  Found{" "}
                  <span className="font-semibold">
                    {filteredArticles.length}
                  </span>{" "}
                  article
                  {filteredArticles.length !== 1
                    ? "s"
                    : ""}{" "}
                  matching{" "}
                  <span className="font-semibold">
                    "{search}"
                  </span>
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredArticles.length}
                  </span>{" "}
                  published article
                  {filteredArticles.length !== 1
                    ? "s"
                    : ""}
                </>
              )}

            </div>
          )}

        {/* =================================================
            ARTICLES
        ================================================= */}

        {!loading &&
          currentArticles.length > 0 && (

            <div className="grid gap-6">

              {currentArticles.map(
                (article) => (

                  <article
                    key={article.id}
                    className="
                      light-panel
                      rounded-3xl
                      p-6
                    "
                  >

                    {/* TITLE */}

                    <Link
                      href={`/articles/${article.id}`}
                      className="
                        text-xl
                        font-bold
                        hover:underline
                        text-slate-900
                      "
                    >
                      {article.title}
                    </Link>

                    {/* ABSTRACT */}

                    <p className="mt-3 text-gray-700">
                      {article.abstract ||
                        "Abstract not available."}
                    </p>

                    {/* ARTICLE INFORMATION */}

                    <div className="mt-4 text-sm text-gray-600 space-y-1">

                      <p>
                        <span className="font-semibold">
                          Author:
                        </span>{" "}
                        {article.author?.full_name ||
                          article.author?.username ||
                          "Unknown"}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Institution:
                        </span>{" "}
                        {article.author?.university ||
                          "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Specialty:
                        </span>{" "}
                        {article.specialty ||
                          "General Medicine"}
                      </p>

                      {article.year && (
                        <p>
                          <span className="font-semibold">
                            Year:
                          </span>{" "}
                          {article.year}
                        </p>
                      )}

                      {article.keywords && (
                        <p>
                          <span className="font-semibold">
                            Keywords:
                          </span>{" "}
                          {article.keywords}
                        </p>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex gap-4 flex-wrap">

                      <Link
                        href={`/articles/${article.id}`}
                        className="
                          bg-green-700
                          hover:bg-green-800
                          text-white
                          px-5
                          py-2
                          rounded-xl
                          font-semibold
                        "
                      >
                        View Article
                      </Link>

                      {article.pdf && (
                        <a
                          href={article.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            bg-blue-700
                            hover:bg-blue-800
                            text-white
                            px-5
                            py-2
                            rounded-xl
                            font-semibold
                          "
                        >
                          Download PDF
                        </a>
                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          totalPages > 1 && (

            <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  hover:bg-gray-100
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                ← Previous
              </button>

              {/* PAGE NUMBERS */}

              {Array.from(
                { length: totalPages },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    goToPage(page)
                  }
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    font-semibold
                    ${
                      currentPage === page
                        ? "bg-blue-700 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {page}
                </button>

              ))}

              {/* NEXT */}

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  hover:bg-gray-100
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Next →
              </button>

            </div>

          )}

      </section>
    </Layout>
  );
}