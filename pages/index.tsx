import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

type Article = {
  id: number | string;
  title: string;
  abstract?: string;
  specialty?: string;
  discipline?: string;
  year?: number;
  published_date?: string;
  status?: string;
  is_published?: boolean;
  author?: {
    full_name?: string;
    username?: string;
    university?: string;
  };
};

type AcademyItem = {
  id: number | string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  level?: string | number;
  slug?: string;
};

type Opportunity = {
  id: number | string;
  title: string;
  kind?: string;
  deadline?: string | null;
};

function listFrom(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.modules)) return data.modules;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.data)) return data.data;
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

const pathway = [
  {
    href: "/research-discovery",
    label: "Discover",
    title: "Find evidence before you build",
    text: "Search research, authors, institutions, topics and evidence relevant to Rwanda and beyond.",
  },
  {
    href: "/research-academy",
    label: "Learn",
    title: "Strengthen research skills",
    text: "Build practical skills in research methods, scientific writing, evidence appraisal and data.",
  },
  {
    href: "/research-opportunities",
    label: "Opportunities",
    title: "Find the next opportunity",
    text: "Explore grants, scholarships, fellowships, internships, mentorships and research calls.",
  },
  {
    href: "/research-incubator",
    label: "Build",
    title: "Develop the study",
    text: "Turn a question into a structured research project with a team, milestones and governance.",
  },
  {
    href: "/collaboration",
    label: "Connect",
    title: "Work with the right people",
    text: "Find mentors, collaborators, methods support and potential research partners.",
  },
  {
    href: "/research-passport",
    label: "Record",
    title: "Keep your research record",
    text: "Build a living record of your research skills, projects, publications and contributions.",
  },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [academy, setAcademy] = useState<AcademyItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [articlesState, setArticlesState] =
    useState<"loading" | "ready" | "empty" | "error">("loading");

  const [academyState, setAcademyState] =
    useState<"loading" | "ready" | "empty" | "error">("loading");

  const [opportunitiesState, setOpportunitiesState] =
    useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    let alive = true;

    async function loadArticles() {
      try {
        const response = await api.get(
          "/articles/?status=published&is_published=true",
          { timeout: 15000 }
        );

        const data = listFrom(response.data)
          .filter(
            (item: Article) =>
              item.status === "published" &&
              item.is_published === true
          )
          .slice(0, 3);

        if (!alive) return;

        setArticles(data);
        setArticlesState(
          data.length ? "ready" : "empty"
        );
      } catch (error) {
        console.error("Homepage articles:", error);

        if (!alive) return;

        setArticlesState("error");
      }
    }

    async function loadAcademy() {
      const endpoints = [
        "/academy/modules/",
        "/academy/",
        "/academy/courses/",
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(
            endpoint,
            { timeout: 12000 }
          );

          const data = listFrom(response.data)
            .filter(
              (item: AcademyItem) =>
                item?.title || item?.name
            )
            .slice(0, 6);

          if (!alive) return;

          if (data.length) {
            setAcademy(data);
            setAcademyState("ready");
            return;
          }
        } catch {
          // Try the next known Academy endpoint.
        }
      }

      if (!alive) return;

      setAcademyState("empty");
    }

    async function loadOpportunities() {
      try {
        const response = await api.get(
          "/research-opportunities/",
          { timeout: 15000 }
        );

        const data = listFrom(response.data)
          .filter(
            (item: Opportunity) =>
              !item.deadline ||
              new Date(item.deadline) >= new Date()
          )
          .slice(0, 3);

        if (!alive) return;

        setOpportunities(data);
        setOpportunitiesState(
          data.length ? "ready" : "empty"
        );
      } catch (error) {
        console.error(
          "Homepage opportunities:",
          error
        );

        if (!alive) return;

        setOpportunitiesState("error");
      }
    }

    loadArticles();
    loadAcademy();
    loadOpportunities();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <Layout>
      <main className="overflow-x-hidden bg-white text-slate-950">

        {/* HERO */}
        <section className="relative isolate min-h-[620px] overflow-hidden text-white">

          <img
            src="/images/healthcare-rwanda.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/30" />

          <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-4xl">

              <div className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Rwanda Student Research Ecosystem
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Research that starts in Rwanda and connects to the world.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                RSRE brings together students, researchers, mentors,
                institutions, opportunities and publication in one connected
                research environment.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/research-discovery"
                  className="rounded-xl bg-emerald-500 px-6 py-3.5 text-center text-sm font-black text-slate-950 hover:bg-emerald-400"
                >
                  Explore research
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-center text-sm font-black text-white backdrop-blur hover:bg-white/15"
                >
                  Join RSRE
                </Link>

                <Link
                  href="/articles"
                  className="rounded-xl border border-white/30 px-6 py-3.5 text-center text-sm font-black text-white hover:bg-white/10"
                >
                  Read the Journal
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Find evidence",
                    "Start with a question and the evidence behind it.",
                  ],
                  [
                    "Develop research",
                    "Move from an idea to a structured study.",
                  ],
                  [
                    "Share results",
                    "Publish, collaborate and strengthen research practice.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                  >
                    <div className="font-black">
                      {title}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* RESEARCH JOURNEY */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Research journey
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              One ecosystem for the stages of research.
            </h2>

            <p className="mt-4 text-base leading-8 text-slate-600">
              Start where you are. A student may need foundations. An
              experienced researcher may already have a question, a team or a
              manuscript. RSRE supports different starting points without
              forcing everyone through the same route.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathway.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                  {item.label}
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.text}
                </p>

                <div className="mt-5 text-sm font-black text-emerald-700">
                  Open workspace →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* JOURNAL */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                  Rwanda Student Journal for Health
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  Latest published research
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Student-centred health research published through a
                  structured editorial and peer-review process.
                </p>
              </div>

              <Link
                href="/articles"
                className="text-sm font-black text-emerald-700"
              >
                View all articles →
              </Link>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-3">

              {articlesState === "loading" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-7 text-sm text-slate-500 lg:col-span-3">
                  Loading published research...
                </div>
              )}

              {articlesState === "error" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 text-sm text-amber-800 lg:col-span-3">
                  The journal could not be loaded right now. You can still open
                  the Journal page directly.
                </div>
              )}

              {articlesState === "empty" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-sm text-slate-500 lg:col-span-3">
                  No published research is currently listed.
                </div>
              )}

              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-lg"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {article.specialty ||
                      article.discipline ||
                      "Health research"}
                  </div>

                  <h3 className="mt-3 text-xl font-black leading-7 group-hover:text-emerald-700">
                    {article.title}
                  </h3>

                  {article.abstract && (
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                      {article.abstract}
                    </p>
                  )}

                  <div className="mt-5 text-xs text-slate-400">
                    {article.author?.full_name ||
                      article.author?.username ||
                      "RSJH author"}

                    {article.year
                      ? ` · ${article.year}`
                      : ""}

                    {article.published_date
                      ? ` · ${formatDate(
                          article.published_date
                        )}`
                      : ""}
                  </div>

                  <div className="mt-5 text-sm font-black text-emerald-700">
                    Read article →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ACADEMY */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Research Academy
              </div>

              <h2 className="mt-2 text-3xl font-black">
                Build the skills your next study needs.
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Academy participation is optional. Learn what you need,
                continue from your existing level and apply the skills to real
                research work.
              </p>
            </div>

            <Link
              href="/research-academy"
              className="text-sm font-black text-blue-700"
            >
              Open Academy →
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {academyState === "loading" && (
              <div className="rounded-2xl border border-slate-200 p-7 text-sm text-slate-500 lg:col-span-3">
                Loading Academy modules...
              </div>
            )}

            {academyState === "empty" && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-7 text-sm text-slate-500 lg:col-span-3">
                No Academy modules are currently published.
              </div>
            )}

            {academy.map((item) => (
              <Link
                key={item.id}
                href={`/research-academy/module/${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                  {item.level
                    ? `Level ${item.level}`
                    : "Research Academy"}
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {item.title ||
                    item.name}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.summary ||
                    item.description ||
                    "Research Academy learning module."}
                </p>

                <div className="mt-5 text-sm font-black text-blue-700">
                  View module →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* OPPORTUNITIES */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                  Opportunities
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  What could move your research forward?
                </h2>
              </div>

              <Link
                href="/research-opportunities"
                className="text-sm font-black text-amber-700"
              >
                Browse all →
              </Link>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">

              {opportunitiesState === "loading" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-7 text-sm text-slate-500 md:col-span-3">
                  Loading opportunities...
                </div>
              )}

              {opportunitiesState === "empty" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-sm text-slate-500 md:col-span-3">
                  No active opportunities are currently listed.
                </div>
              )}

              {opportunitiesState === "error" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 text-sm text-amber-800 md:col-span-3">
                  Opportunities are temporarily unavailable.
                </div>
              )}

              {opportunities.map((item) => (
                <Link
                  key={item.id}
                  href="/research-opportunities"
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow-md"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-amber-700">
                    {item.kind ||
                      "Research opportunity"}
                  </div>

                  <h3 className="mt-2 font-black">
                    {item.title}
                  </h3>

                  {item.deadline && (
                    <p className="mt-2 text-xs text-slate-500">
                      Deadline:{" "}
                      {formatDate(
                        item.deadline
                      )}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* RWANDA + GRANT ALIGNMENT */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">

              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Built for Rwanda
                </div>

                <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                  Strengthening the people, skills and connections behind better research.
                </h2>

                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  RSRE is designed around practical research capacity:
                  learning, evidence discovery, project development,
                  collaboration, opportunity access and publication. The
                  platform is meant to support real research work in Rwanda
                  while making stronger connections possible across the region
                  and internationally.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/research-hub"
                    className="rounded-xl bg-white px-5 py-3 text-center text-sm font-black text-slate-950"
                  >
                    Explore the research journey
                  </Link>

                  <Link
                    href="/about"
                    className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-black text-white"
                  >
                    About RSRE
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Academy optional",
                    "Researchers can enter at the level that matches their current skills.",
                  ],
                  [
                    "Research first",
                    "The platform supports researchers rather than replacing scientific judgment.",
                  ],
                  [
                    "Open access mindset",
                    "RSJH is designed to keep student research accessible and visible.",
                  ],
                  [
                    "Human oversight",
                    "Researchers, reviewers, editors and ethics authorities remain responsible.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <h3 className="font-black">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
}

