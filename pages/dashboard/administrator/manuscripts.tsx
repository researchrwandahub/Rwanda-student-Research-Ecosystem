import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../utils/api";

interface Article {
  id: number;
  title: string;
  author?: {
    username?: string;
    full_name?: string;
  };
  status?: string;
  created_at?: string;
  pdf?: string;
}

export default function Manuscripts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [decisionId, setDecisionId] = useState<number | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);

      const response = await api.get("/articles/");

      setArticles(
        response.data.results || response.data || []
      );
    } catch (error: any) {
      console.error(
        "Loading manuscripts error:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  }


  async function makeDecision(articleId: number, decision: string) {
    const rationale = window.prompt("Optional editorial rationale:", "") || "";
    try {
      setDecisionId(articleId);
      await api.post("/editorial-decisions/", { article: articleId, decision, rationale });
      await loadArticles();
      alert(`Editorial decision recorded: ${decision.replace("_", " ")}.`);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Unable to record editorial decision.");
    } finally { setDecisionId(null); }
  }

  // =====================================================
  // DELETE ARTICLE
  // =====================================================

  async function deleteArticle(articleId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this manuscript?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(articleId);

      await api.delete(`/articles/${articleId}/`);

      // Remove deleted article from the screen immediately
      setArticles((currentArticles) =>
        currentArticles.filter(
          (article) => article.id !== articleId
        )
      );

      alert("Manuscript deleted successfully.");
    } catch (error: any) {
      console.error(
        "Delete manuscript error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        alert(
          "Your session has expired. Please log in again."
        );
      } else if (error.response?.status === 403) {
        alert(
          "You do not have permission to delete this manuscript."
        );
      } else if (error.response?.status === 404) {
        alert(
          "This manuscript was not found. It may already have been deleted."
        );

        // Refresh list
        loadArticles();
      } else {
        alert(
          error.response?.data?.detail ||
            "Failed to delete manuscript."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout
      role="administrator"
      roleRequired="administrator"
      title="Manuscript Management"
    >
      <div className="bg-white rounded-2xl shadow p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              All Manuscripts
            </h2>

            <p className="text-gray-500 mt-2">
              Manage manuscripts submitted to the Rwanda Student Journal for Health.
            </p>
          </div>

          <Link
            href="/dashboard/administrator"
            className="
              bg-gray-800
              hover:bg-gray-900
              text-white
              px-5
              py-2
              rounded-xl
              font-semibold
              text-center
            "
          >
            Back to Dashboard
          </Link>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="py-10 text-center">
            <p className="text-gray-600">
              Loading manuscripts...
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && articles.length === 0 && (
          <div className="py-10 text-center">

            <h3 className="text-xl font-semibold text-gray-800">
              No manuscripts found.
            </h3>

            <p className="text-gray-500 mt-2">
              There are currently no manuscripts in the system.
            </p>

          </div>
        )}

        {/* =================================================
            MANUSCRIPTS
        ================================================= */}

        {!loading &&
          articles.length > 0 &&
          articles.map((article) => (
            <div
              key={article.id}
              className="
                border
                rounded-2xl
                p-6
                mb-5
                hover:shadow-md
                transition
              "
            >

              {/* TITLE */}

              <h3
                className="
                  text-xl
                  font-bold
                  text-blue-800
                "
              >
                {article.title}
              </h3>

              {/* INFORMATION */}

              <div className="mt-4 space-y-2">

                <p>
                  <b>Author:</b>{" "}
                  {article.author?.username ||
                    article.author?.full_name ||
                    "Unknown"}
                </p>

                <p>
                  <b>Status:</b>

                  <span
                    className="
                      ml-2
                      px-3
                      py-1
                      rounded-full
                      bg-gray-100
                    "
                  >
                    {article.status || "Unknown"}
                  </span>
                </p>

                <p>
                  <b>Submitted:</b>{" "}

                  {article.created_at
                    ? new Date(
                        article.created_at
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div
                className="
                  mt-6
                  flex
                  gap-4
                  flex-wrap
                "
              >

                {/* VIEW PDF */}

                {article.pdf && (
                  <a
                    href={`http://127.0.0.1:8000${article.pdf}`}
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
                    View PDF
                  </a>
                )}

                {/* ASSIGN REVIEWER */}

                <Link
                  href={`/dashboard/administrator/assign-reviewers?article=${article.id}`}
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
                  Assign Reviewer
                </Link>

                {article.status === "editor_decision" && (
                  <>
                    <button type="button" onClick={() => makeDecision(article.id, "accept")} disabled={decisionId === article.id} className="rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white">Accept & Publish</button>
                    <button type="button" onClick={() => makeDecision(article.id, "minor_revision")} disabled={decisionId === article.id} className="rounded-xl bg-amber-600 px-5 py-2 font-semibold text-white">Minor Revision</button>
                    <button type="button" onClick={() => makeDecision(article.id, "major_revision")} disabled={decisionId === article.id} className="rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white">Major Revision</button>
                    <button type="button" onClick={() => makeDecision(article.id, "reject")} disabled={decisionId === article.id} className="rounded-xl bg-red-700 px-5 py-2 font-semibold text-white">Reject</button>
                  </>
                )}

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    deleteArticle(article.id)
                  }
                  disabled={deletingId === article.id}
                  className="
                    bg-red-600
                    hover:bg-red-700
                    disabled:bg-gray-400
                    disabled:cursor-not-allowed
                    text-white
                    px-5
                    py-2
                    rounded-xl
                    font-semibold
                    transition
                  "
                >
                  {deletingId === article.id
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>
          ))}

      </div>
    </DashboardLayout>
  );
}