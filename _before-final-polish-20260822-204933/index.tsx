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

type Opportunity = {
  id: number | string;
  title: string;
  kind?: string;
  deadline?: string | null;
  description?: string;
};

type FoundingMember = {
  id: number | string;
  name?: string;
  role?: string;
  title?: string;
  institution?: string;
  bio?: string;
  biography?: string;
  photo?: string | null;
  image?: string | null;
  active?: boolean;
};

const researchAreas = [
  {
    href: "/research-discovery",
    title: "Research Discovery",
    eyebrow: "Find evidence",
    text: "Search research, authors, institutions, topics and evidence relevant to Rwanda and beyond.",
  },
  {
    href: "/research-academy",
    title: "Research Academy",
    eyebrow: "Strengthen skills",
    text: "Build the research methods, scientific writing, data and evidence skills your work needs.",
  },
  {
    href: "/research-opportunities",
    title: "Research Opportunities",
    eyebrow: "Find opportunities",
    text: "Explore grants, fellowships, scholarships, internships, mentorships and research calls.",
  },
  {
    href: "/research-incubator",
    title: "Research Incubator",
    eyebrow: "Develop studies",
    text: "Turn a research question into a structured project with a team, milestones and governance.",
  },
  {
    href: "/collaboration",
    title: "Collaboration Network",
    eyebrow: "Work with people",
    text: "Find mentors, collaborators, methods support and potential research partners.",
  },
  {
    href: "/research-passport",
    title: "Research Passport",
    eyebrow: "Build your record",
    text: "Keep a living record of your research skills, projects, publications and contributions.",
  },
];

const principles = [
  {
    title: "Rwanda first",
    text: "Built around the needs and realities of researchers working in Rwanda, while remaining open to regional and global collaboration.",
  },
  {
    title: "Research before technology",
    text: "Technology supports the research process. It does not replace scientific judgment, supervision, review or ethics.",
  },
  {
    title: "Open research access",
    text: "RSJH is designed to keep student-led health research accessible to readers and contributors.",
  },
  {
    title: "Human responsibility",
    text: "Researchers, supervisors, reviewers, editors and ethics authorities remain responsible for research decisions.",
  },
];

function getArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
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

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [foundingTeam, setFoundingTeam] = useState<FoundingMember[]>([]);

  const [articlesLoading, setArticlesLoading] = useState(true);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      try {
        const response = await api.get("/articles/");
        const rows = getArray(response.data);

        const publicArticles = rows
          .filter(
            (article: Article) =>
              article?.status === "published" &&
              article?.is_published === true
          )
          .slice(0, 3);

        if (mounted) {
          setArticles(publicArticles);
        }
      } catch (error) {
        console.error("Homepage articles:", error);

        if (mounted) {
          setArticles([]);
        }
      } finally {
        if (mounted) {
          setArticlesLoading(false);
        }
      }
    }

    async function loadOpportunities() {
      try {
        const response = await api.get("/research-opportunities/");
        const rows = getArray(response.data);

        const today = new Date();

        const active = rows
          .filter((item: Opportunity) => {
            if (!item.deadline) return true;

            const deadline = new Date(item.deadline);

            return (
              Number.isNaN(deadline.getTime()) ||
              deadline >= today
            );
          })
          .slice(0, 3);

        if (mounted) {
          setOpportunities(active);
        }
      } catch (error) {
        console.error("Homepage opportunities:", error);

        if (mounted) {
          setOpportunities([]);
        }
      } finally {
        if (mounted) {
          setOpportunitiesLoading(false);
        }
      }
    }

    async function loadFoundingTeam() {
      try {
        const response = await api.get("/founding-members/");
        const rows = getArray(response.data);

        if (mounted) {
          setFoundingTeam(
            rows
              .filter(
                (member: FoundingMember) =>
                  member?.active !== false
              )
              .slice(0, 8)
          );
        }
      } catch (error) {
        console.error("Homepage founding team:", error);

        if (mounted) {
          setFoundingTeam([]);
        }
      } finally {
        if (mounted) {
          setTeamLoading(false);
        }
      }
    }

    loadArticles();
    loadOpportunities();
    loadFoundingTeam();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <main className="bg-white text-slate-950">

        {/* HERO */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-5xl">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Rwanda Student Research Ecosystem
              </div>

              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Research that starts in Rwanda and connects to the world.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                RSRE brings together researchers, students, mentors,
                institutions and research opportunities in one connected
                environment. Find evidence, develop a study, build the right
                team, strengthen your methods and share your research.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/research-discovery"
                  className="rounded-xl bg-slate-950 px-6 py-3.5 text-center text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Explore Research
                </Link>

                <Link
                  href="/articles"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-black text-slate-800 transition hover:bg-slate-50"
                >
                  Read RSJH Journal
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
              <div>
                <div className="text-sm font-black">Find evidence</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Start with the question and the evidence behind it.
                </p>
              </div>

              <div>
                <div className="text-sm font-black">Develop research</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Move from an idea to a structured research project.
                </p>
              </div>

              <div>
                <div className="text-sm font-black">Share results</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Communicate research through publication and collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RESEARCH JOURNEY */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Research journey
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              One ecosystem for the stages of research.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Start where you are. A student may need foundations. An
              experienced researcher may already have a question, a team or a
              manuscript. RSRE supports different starting points without
              forcing everyone through the same route.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                  {area.eyebrow}
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {area.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {area.text}
                </p>

                <div className="mt-5 text-sm font-black text-emerald-700">
                  Open workspace →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* RSJH JOURNAL */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                  Rwanda Student Journal for Health
                </div>

                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Latest published research
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
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

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {articlesLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-3">
                  Loading published research...
                </div>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
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

                    <div className="mt-5 text-xs font-semibold leading-5 text-slate-400">
                      {article.author?.full_name ||
                        article.author?.username ||
                        "RSJH author"}
                      {article.year
                        ? ` · ${article.year}`
                        : ""}
                      {article.published_date
                        ? ` · ${formatDate(article.published_date)}`
                        : ""}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 lg:col-span-3">
                  No published research is currently listed.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* OPPORTUNITIES */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                Opportunities
              </div>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
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

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {opportunitiesLoading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500 md:col-span-3">
                Loading opportunities...
              </div>
            ) : opportunities.length > 0 ? (
              opportunities.map((item) => (
                <Link
                  key={item.id}
                  href="/research-opportunities"
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-amber-700">
                    {item.kind || "Research opportunity"}
                  </div>

                  <h3 className="mt-2 font-black">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  {item.deadline && (
                    <div className="mt-4 text-xs font-bold text-slate-400">
                      Deadline: {formatDate(item.deadline)}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 md:col-span-3">
                No active opportunities are currently listed.
              </div>
            )}
          </div>
        </section>

        {/* FOUNDING TEAM */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Founding team
              </div>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                The people building RSRE
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                RSRE is being developed around research capacity, collaboration
                and publication in Rwanda, with an ambition for wider regional
                and international collaboration.
              </p>
            </div>

            <div className="mt-8">
              {teamLoading ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  Loading founding team...
                </div>
              ) : foundingTeam.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {foundingTeam.map((member) => {
                    const image =
                      member.photo ||
                      member.image ||
                      null;

                    const name =
                      member.name ||
                      "RSRE founding member";

                    return (
                      <article
                        key={member.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                      >
                        <div className="flex items-start gap-4">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white">
                              {name
                                .split(" ")
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="font-black text-slate-950">
                              {name}
                            </h3>

                            {(member.role ||
                              member.title) && (
                              <div className="mt-1 text-sm font-bold text-emerald-700">
                                {member.role ||
                                  member.title}
                              </div>
                            )}

                            {member.institution && (
                              <div className="mt-1 text-xs text-slate-500">
                                {member.institution}
                              </div>
                            )}
                          </div>
                        </div>

                        {(member.bio ||
                          member.biography) && (
                          <p className="mt-4 text-sm leading-6 text-slate-600">
                            {member.bio ||
                              member.biography}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
                  Founding team profiles will appear here as they are
                  published.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RWANDA */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Built in Rwanda
                </div>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Research rooted in Rwanda, connected to regional and global
                  knowledge.
                </h2>

                <p className="mt-5 max-w-2xl leading-8 text-slate-300">
                  RSRE helps researchers move from finding evidence to
                  developing studies, building teams, strengthening research
                  practice and communicating results.
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
                {principles.map((principle) => (
                  <div
                    key={principle.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <h3 className="font-black">
                      {principle.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {principle.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 sm:p-10">
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                Start with the work
              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Have a research question, study idea or research goal?
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-700">
                Find the evidence, meet the right people, develop the study
                and keep a record of the work as it grows.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/research-discovery"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white"
                >
                  Start with Research Discovery
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-xl border border-emerald-300 bg-white px-5 py-3 text-center text-sm font-black text-emerald-900"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}