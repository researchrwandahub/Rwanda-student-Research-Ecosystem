import { useEffect, useMemo, useState } from "react";
import ApplicationShell from "../components/ApplicationShell";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "/api/rsre";

type Person = {
  id: number;
  name?: string;
  institution?: string;
  discipline?: string;
  academic_stage?: string;
  research_field?: string;
  research_interests?: string[];
  biography?: string;
  verified?: boolean;
  connected?: boolean;
  request_pending?: boolean;
};

type CollaborationRequest = {
  id: number;
  requester_name?: string;
  recipient_name?: string;
  purpose: string;
  desired_role?: string;
  message?: string;
};

type CollaborationData = {
  people: Person[];
  incoming: CollaborationRequest[];
  outgoing: CollaborationRequest[];
};

const purposes = [
  ["research_project", "Project collaboration"],
  ["mentorship", "Mentorship"],
  ["coauthor", "Co-authoring"],
  ["methods", "Methods & statistics"],
  ["peer_learning", "Peer learning"],
] as const;

function auth(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function getInitials(name?: string) {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function purposeLabel(value: string) {
  return purposes.find(([key]) => key === value)?.[1] || value;
}

export default function Collaboration() {
  const [data, setData] = useState<CollaborationData>({
    people: [],
    incoming: [],
    outgoing: [],
  });

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [purpose, setPurpose] = useState("research_project");

  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selected, setSelected] = useState<Person | null>(null);

  const connectedCount = useMemo(
    () => data.people.filter((person) => person.connected).length,
    [data.people]
  );

  async function load(term = "") {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/collaboration/?q=${encodeURIComponent(term)}`,
        {
          headers: auth(),
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            "We could not load the collaboration network."
        );
      }

      setData({
        people: Array.isArray(payload.people) ? payload.people : [],
        incoming: Array.isArray(payload.incoming)
          ? payload.incoming
          : [],
        outgoing: Array.isArray(payload.outgoing)
          ? payload.outgoing
          : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load collaborators."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestConnection(id: number) {
    setSendingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/collaboration/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth(),
        },
        body: JSON.stringify({
          recipient: id,
          purpose,
          message: `I would like to connect for ${purposeLabel(
            purpose
          ).toLowerCase()} through RSRE.`,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            "Unable to send the collaboration request."
        );
      }

      setMessage("Connection request sent.");
      setSelected(null);

      await load(activeQuery);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the request."
      );
    } finally {
      setSendingId(null);
    }
  }

  async function handleRequestAction(
    id: number,
    action: "accept" | "decline"
  ) {
    setActionId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/collaboration/requests/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...auth(),
          },
          body: JSON.stringify({ action }),
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            `Unable to ${action} the collaboration request.`
        );
      }

      setMessage(
        action === "accept"
          ? "Collaboration request accepted."
          : "Collaboration request declined."
      );

      await load(activeQuery);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the request."
      );
    } finally {
      setActionId(null);
    }
  }

  function runSearch() {
    const term = query.trim();
    setActiveQuery(term);
    load(term);
  }

  return (
    <ApplicationShell
      name="Collaboration Network"
      description="Find researchers, mentors and collaborators around a clear research need."
      nav={[
        ["/collaboration", "Network"],
        ["/research-incubator", "Projects"],
        ["/research-passport", "Profiles"],
      ]}
    >
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
          <div className="grid gap-10 px-6 py-9 md:grid-cols-[1.25fr,.75fr] md:px-10 md:py-12">
            <div>
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                Research matching
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Find the person your research needs next.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Search by research field, institution, methods,
                interests or academic stage. Build purposeful
                connections rather than collecting followers.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runSearch();
                  }}
                  placeholder="Try: malaria, biostatistics, Kigali..."
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                />

                <button
                  type="button"
                  onClick={runSearch}
                  disabled={loading}
                  className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Find people"}
                </button>
              </div>

              {(message || error) && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    error
                      ? "border-red-400/20 bg-red-400/10 text-red-200"
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  }`}
                >
                  {error || message}
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                How RSRE collaboration works
              </div>

              <div className="mt-5 space-y-5">
                {[
                  [
                    "01",
                    "Search",
                    "Find people using research-relevant signals.",
                  ],
                  [
                    "02",
                    "Review fit",
                    "Look at their field, stage, interests and experience.",
                  ],
                  [
                    "03",
                    "Connect with purpose",
                    "Start a focused request before moving deeper into project work.",
                  ],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">
                      {number}
                    </div>

                    <div>
                      <div className="font-black">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-400">
                        {description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Matches
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">
              {data.people.length}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              People matching your current search
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Connected
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-700">
              {connectedCount}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Existing research connections
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Waiting
            </div>
            <div className="mt-2 text-3xl font-black text-amber-700">
              {data.incoming.length}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Requests requiring your attention
            </p>
          </div>
        </section>

        {data.incoming.length > 0 && (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/60 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Action needed
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Collaboration requests waiting for you
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Review the purpose before accepting a connection.
                </p>
              </div>

              <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-black text-amber-800 ring-1 ring-amber-200">
                {data.incoming.length} pending
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.incoming.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-amber-100 bg-white p-5"
                >
                  <div className="font-black text-slate-950">
                    {request.requester_name || "RSRE researcher"}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-violet-700">
                    {purposeLabel(request.purpose)}
                    {request.desired_role
                      ? ` • ${request.desired_role}`
                      : ""}
                  </div>

                  {request.message && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {request.message}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === request.id}
                      onClick={() =>
                        handleRequestAction(request.id, "accept")
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={actionId === request.id}
                      onClick={() =>
                        handleRequestAction(request.id, "decline")
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                Connection purpose
              </div>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                What are you looking for?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This helps your request feel specific and professional.
              </p>
            </div>

            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            >
              {purposes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                Research network
              </div>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Researchers who may fit
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Searching the network..."
                  : `${data.people.length} ${
                      data.people.length === 1
                        ? "researcher"
                        : "researchers"
                    } found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="flex-1">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="mt-5 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
                  <div className="mt-6 h-10 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : data.people.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="text-lg font-black text-slate-900">
                No strong matches yet
              </div>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try a broader search such as a field, institution,
                method or city.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveQuery("");
                  load("");
                }}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white"
              >
                Show everyone
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.people.map((person) => (
                <article
                  key={person.id}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-sm font-black text-violet-800">
                      {getInitials(person.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black text-slate-950">
                          {person.name || "RSRE researcher"}
                        </h3>

                        {person.verified && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {person.institution || "RSRE research community"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      person.discipline,
                      person.academic_stage,
                      person.research_field,
                    ]
                      .filter(Boolean)
                      .map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                  </div>

                  {person.research_interests?.length ? (
                    <div className="mt-5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Research interests
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {person.research_interests
                          .slice(0, 5)
                          .join(" • ")}
                      </p>
                    </div>
                  ) : null}

                  {person.biography && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                      {person.biography}
                    </p>
                  )}

                  <div className="mt-auto flex gap-2 pt-6">
                    {person.connected ? (
                      <div className="flex-1 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">
                        Connected
                      </div>
                    ) : person.request_pending ? (
                      <div className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-black text-slate-600">
                        Request pending
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelected(person)}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                          View fit
                        </button>

                        <button
                          type="button"
                          disabled={sendingId === person.id}
                          onClick={() =>
                            requestConnection(person.id)
                          }
                          className="flex-1 rounded-xl bg-violet-700 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sendingId === person.id
                            ? "Sending..."
                            : "Connect"}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-sm font-black text-violet-800">
                  {getInitials(selected.name)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-950">
                      {selected.name || "RSRE researcher"}
                    </h2>

                    {selected.verified && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {selected.institution ||
                      "RSRE research community"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Research field
                </div>

                <div className="mt-1 font-black text-slate-900">
                  {selected.research_field || "Not specified"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Academic stage
                </div>

                <div className="mt-1 font-black text-slate-900">
                  {selected.academic_stage || "Not specified"}
                </div>
              </div>
            </div>

            {selected.discipline && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Discipline
                </div>

                <div className="mt-1 font-black text-slate-900">
                  {selected.discipline}
                </div>
              </div>
            )}

            {selected.research_interests?.length ? (
              <div className="mt-5">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Research interests
                </div>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selected.research_interests.join(" • ")}
                </p>
              </div>
            ) : null}

            {selected.biography && (
              <div className="mt-5">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  About
                </div>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selected.biography}
                </p>
              </div>
            )}

            <div className="mt-7 rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <div className="text-xs font-black uppercase tracking-wider text-violet-700">
                Your connection request
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                You are requesting a connection for{" "}
                <strong>
                  {purposeLabel(purpose).toLowerCase()}
                </strong>
                .
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={sendingId === selected.id}
                onClick={() => requestConnection(selected.id)}
                className="flex-1 rounded-xl bg-violet-700 px-4 py-3 text-sm font-black text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {sendingId === selected.id
                  ? "Sending..."
                  : `Connect for ${purposeLabel(
                      purpose
                    ).toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}

