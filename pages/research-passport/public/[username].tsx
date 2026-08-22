import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import api from "../../../utils/api";

type PublicPassport = {
  researcher: {
    id: number;
    username: string;
    full_name: string;
    email?: string;
    institution?: string;
    university?: string;
    department?: string;
    discipline?: string;
    academic_stage?: string;
    research_field?: string;
    orcid?: string;
    biography?: string;
    research_interests?: string;
    profile_picture?: string | null;
  };
  passport: {
    headline?: string;
    career_goal?: string;
    skills?: string;
    methods?: string;
    interests?: string;
    collaborations?: string;
    competencies?: string[];
    visibility?: string;
    updated_at?: string;
  };
  metrics: {
    projects: number;
    publications: number;
    peer_reviews: number;
    valid_certificates: number;
  };
  publications: Array<{
    id: number;
    title: string;
    abstract?: string;
    discipline?: string;
    specialty?: string;
    published_date?: string;
    year?: number;
    volume?: number | null;
    issue?: number | null;
    publication_number?: number | null;
    doi?: string;
    citation_text?: string;
  }>;
  projects: Array<{
    id: number;
    title: string;
    status: string;
    discipline?: string;
    study_type?: string;
  }>;
  credentials: Array<{
    certificate_id: string;
    type: string;
    title: string;
    issued_at: string;
  }>;
};

export default function PublicResearchPassport() {
  const router = useRouter();
  const { username } = router.query;

  const [data, setData] = useState<PublicPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof username !== "string" || !username.trim()) {
      return;
    }

    const usernameValue = username.trim();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/research-passport/public/${encodeURIComponent(
            usernameValue
          )}/`
        );

        setData(response.data);
      } catch (err: any) {
        setData(null);

        setError(
          err?.response?.data?.detail ||
            "This research passport is not publicly available."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  const researcher = data?.researcher;
  const passport = data?.passport;

  const initials =
    researcher?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <Layout>
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {loading && (
          <section className="pt-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="animate-pulse">
                <div className="h-7 w-48 rounded bg-slate-200" />
                <div className="mt-4 h-10 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-5 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          </section>
        )}

        {!loading && !data && (
          <section className="pt-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Research Passport
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Research profile unavailable
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                {error ||
                  "This researcher has not enabled public Passport visibility."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/research-discovery"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Browse Research Discovery
                </Link>

                <Link
                  href="/"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Back to RSRE
                </Link>
              </div>
            </div>
          </section>
        )}

        {!loading && data && researcher && passport && (
          <>
            {/* HERO */}
            <section className="mt-8 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
              <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-[auto_1fr] md:p-10">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-emerald-500 text-3xl font-black text-slate-950 sm:h-32 sm:w-32 sm:text-4xl">
                  {researcher.profile_picture ? (
                    <img
                      src={researcher.profile_picture}
                      alt={researcher.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    RSRE Research Passport
                  </div>

                  <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                    {researcher.full_name}
                  </h1>

                  {passport.headline && (
                    <p className="mt-3 max-w-3xl text-lg font-semibold leading-7 text-slate-300">
                      {passport.headline}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      researcher.institution,
                      researcher.university,
                      researcher.department,
                      researcher.discipline,
                      researcher.academic_stage,
                      researcher.research_field,
                    ]
                      .filter(
                        (item): item is string =>
                          Boolean(item && item.trim())
                      )
                      .map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                  </div>

                  {researcher.orcid && (
                    <div className="mt-5 text-sm text-slate-400">
                      ORCID:{" "}
                      <span className="font-bold text-white">
                        {researcher.orcid}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* METRICS */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Projects", data.metrics.projects],
                ["Publications", data.metrics.publications],
                ["Peer reviews", data.metrics.peer_reviews],
                ["Credentials", data.metrics.valid_certificates],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {label}
                  </div>

                  <div className="mt-2 text-3xl font-black text-slate-950">
                    {value}
                  </div>
                </div>
              ))}
            </section>

            {/* ABOUT */}
            {(researcher.biography ||
              passport.interests ||
              passport.skills ||
              passport.methods ||
              passport.competencies?.length) && (
              <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Research profile
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Research interests and capabilities
                  </h2>

                  {researcher.biography && (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        About
                      </div>

                      <p className="mt-2 leading-7 text-slate-600">
                        {researcher.biography}
                      </p>
                    </div>
                  )}

                  {passport.interests && (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Research interests
                      </div>

                      <p className="mt-2 leading-7 text-slate-600">
                        {passport.interests}
                      </p>
                    </div>
                  )}

                  {passport.skills && (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Skills
                      </div>

                      <p className="mt-2 leading-7 text-slate-600">
                        {passport.skills}
                      </p>
                    </div>
                  )}

                  {passport.methods && (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Methods
                      </div>

                      <p className="mt-2 leading-7 text-slate-600">
                        {passport.methods}
                      </p>
                    </div>
                  )}

                  {passport.competencies?.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Competencies
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {passport.competencies.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    Research direction
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    What this researcher is working toward
                  </h2>

                  <p className="mt-4 leading-7 text-slate-600">
                    {passport.career_goal ||
                      "Research goal not publicly specified."}
                  </p>

                  {passport.collaborations && (
                    <div className="mt-6 rounded-2xl bg-blue-50 p-5">
                      <div className="text-xs font-black uppercase tracking-wider text-blue-700">
                        Collaboration interests
                      </div>

                      <p className="mt-2 text-sm leading-6 text-blue-950">
                        {passport.collaborations}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* PUBLICATIONS */}
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
                RSJH
              </div>

              <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Published research
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Publicly published work connected to this researcher.
                  </p>
                </div>

                <Link
                  href="/articles"
                  className="text-sm font-black text-emerald-700"
                >
                  Explore RSJH â†’
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {data.publications.length ? (
                  data.publications.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      className="block rounded-2xl border border-slate-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                    >
                      <div className="font-black text-slate-950">
                        {article.title}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-slate-500">
                        {article.specialty ||
                          article.discipline ||
                          "Health research"}
                        {article.year
                          ? ` Â· ${article.year}`
                          : ""}
                        {article.volume
                          ? ` Â· Vol. ${article.volume}`
                          : ""}
                        {article.issue
                          ? ` Â· Issue ${article.issue}`
                          : ""}
                        {article.publication_number
                          ? ` Â· Article ${article.publication_number}`
                          : ""}
                      </div>

                      {article.doi && (
                        <div className="mt-2 text-xs font-bold text-blue-700">
                          DOI: {article.doi}
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                    No public publications yet.
                  </div>
                )}
              </div>
            </section>

            {/* PROJECTS + CREDENTIALS */}
            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Research projects
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Work in progress and completed work
                </h2>

                <div className="mt-5 space-y-3">
                  {data.projects.length ? (
                    data.projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="font-black text-slate-950">
                          {project.title}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          {project.discipline ||
                            "Health research"}
                          {project.study_type
                            ? ` Â· ${project.study_type}`
                            : ""}
                        </div>

                        <div className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                          {project.status.replace("_", " ")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      No public projects listed.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">
                  Credentials
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Research learning and achievements
                </h2>

                <div className="mt-5 space-y-3">
                  {data.credentials.length ? (
                    data.credentials.map((credential) => (
                      <div
                        key={credential.certificate_id}
                        className="rounded-2xl bg-purple-50 p-4"
                      >
                        <div className="font-black text-slate-950">
                          {credential.title}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-purple-800">
                          {credential.type} Â·{" "}
                          {new Date(
                            credential.issued_at
                          ).toLocaleDateString()}
                        </div>

                        <div className="mt-2 font-mono text-[11px] text-slate-500">
                          {credential.certificate_id}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      No public credentials listed.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* FOOTER CTA */}
            <section className="mt-8 rounded-3xl bg-emerald-50 p-7 ring-1 ring-emerald-200 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                    Research ecosystem
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Build, connect and publish through RSRE.
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                    Explore research opportunities, discover collaborators,
                    develop projects and read student-led health research
                    through RSJH.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/research-discovery"
                    className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                  >
                    Research Discovery
                  </Link>

                  <Link
                    href="/articles"
                    className="rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-black text-emerald-900"
                  >
                    Read RSJH
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}





