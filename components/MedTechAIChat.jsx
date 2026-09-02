import { useMemo, useState } from "react";

const CONTEXTS = [
  { id: "general", label: "RSRE", icon: "✦" },
  { id: "academy", label: "Academy", icon: "🎓" },
  { id: "discovery", label: "Discovery", icon: "🔎" },
  { id: "sandbox", label: "Sandbox", icon: "🧪" },
  { id: "incubator", label: "Incubator", icon: "🚀" },
  { id: "writing", label: "Writing", icon: "✍️" },
];

const STARTERS = {
  general: [
    "What should I do next in RSRE?",
    "Explain the research journey to me.",
    "Help me turn a broad idea into a research question.",
  ],
  academy: [
    "Explain this research concept simply.",
    "Give me practice questions on study design.",
    "Help me prepare for a practical lab.",
  ],
  discovery: [
    "How should I search the literature for this topic?",
    "Help me identify a possible research gap.",
    "What has RSJH published about malaria?",
  ],
  sandbox: [
    "How should I inspect this dataset?",
    "What analysis should I consider for this variable?",
    "Help me document a reproducible analysis.",
  ],
  incubator: [
    "Help me refine this research question.",
    "What should I prepare before starting the study?",
    "Help me plan the next project milestone.",
  ],
  writing: [
    "Improve this abstract without changing the findings.",
    "Make this paragraph clearer and more scientific.",
    "Suggest keywords for this research topic.",
  ],
};

export default function MedTechAIChat({ initialContext = "general" }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(initialContext);
  const [showEvidence, setShowEvidence] = useState(false);

  const contextMeta = useMemo(
    () => CONTEXTS.find((item) => item.id === context) || CONTEXTS[0],
    [context]
  );

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello 👋 I’m MedTech AI. Choose a research context above, then ask me to explain, explore, analyse or plan. I’ll show when evidence is available.",
      evidence: [],
    },
  ]);

  async function sendMessage(event, preset = null) {
    if (event) event.preventDefault();
    const text = (preset ?? message).trim();
    if (!text || loading) return;

    setMessages((previous) => [...previous, { role: "user", content: text }]);
    setMessage("");
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rmsjToken") : null;
      const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${base}/ai/chat/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          pillar: context,
          research_query: text,
          context: { source: "MedTech AI workspace", pillar: context },
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new Error("Invalid AI response.");
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "MedTech AI request failed.");

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.message || "I could not generate a response.",
          evidence: Array.isArray(data.evidence) ? data.evidence : [],
        },
      ]);
    } catch (error) {
      console.error("MedTech AI error:", error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I couldn’t reach MedTech AI right now. Check that the RSRE backend is running, then try again.",
          evidence: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const starters = STARTERS[context] || STARTERS.general;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">🤖</div>
          <div>
            <div className="font-black text-slate-950">MedTech AI</div>
            <div className="text-xs text-slate-500">Research assistant · human judgement stays in control</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowEvidence((value) => !value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          {showEvidence ? "Hide evidence guide" : "How evidence works"}
        </button>
      </div>

      <div className="border-b border-slate-200 px-5 py-4">
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Work in context</div>
        <div className="flex flex-wrap gap-2">
          {CONTEXTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setContext(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                item.id === context ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
        {showEvidence && (
          <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-900">
            MedTech AI may use the context you choose and published RSJH evidence supplied by RSRE. It does not expose private manuscripts in the general chat and must not invent references.
          </div>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_310px]">
        <div className="min-h-[460px] space-y-4 bg-slate-50 p-4 sm:p-5">
          {messages.map((item, index) => (
            <div key={index} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                <div className="whitespace-pre-line">{item.content}</div>
                {item.role === "assistant" && item.evidence?.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Evidence used</div>
                    <div className="space-y-1">
                      {item.evidence.slice(0, 4).map((source, sourceIndex) => (
                        <div key={sourceIndex} className="text-xs text-slate-600">• {source.title || source.label || "RSJH published evidence"}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">Thinking with {contextMeta.label} context…</div>
            </div>
          )}
        </div>

        <aside className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Try this</div>
          <div className="mt-3 space-y-2">
            {starters.map((starter) => (
              <button
                type="button"
                key={starter}
                onClick={() => sendMessage(null, starter)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                {starter}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            Verify important facts, citations and calculations. AI output is assistance—not ethics approval, clinical advice, editorial acceptance, or proof of originality.
          </div>
        </aside>
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={`Ask MedTech AI about ${contextMeta.label}…`}
            disabled={loading}
            className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "…" : "Ask"}
          </button>
        </div>
      </form>
    </section>
  );
}
