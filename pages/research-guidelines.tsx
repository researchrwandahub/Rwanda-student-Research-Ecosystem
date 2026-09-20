import Layout from "../components/Layout";

const sections = [
  ["Research integrity", "Plan, conduct, analyze and communicate research honestly. Do not fabricate, falsify or selectively misrepresent evidence."],
  ["Participants and privacy", "Use appropriate consent, confidentiality and data-protection procedures. Obtain institutional or competent review when required."],
  ["Evidence and citations", "Represent sources accurately. Check primary sources and distinguish evidence from interpretation, opinion or generated suggestions."],
  ["Collaboration", "Credit contributors fairly, agree responsibilities early and avoid misrepresenting another person's work as your own."],
  ["Responsible AI", "Treat AI output as assistance. Verify factual claims, citations and calculations and disclose AI use where required by the relevant research or journal policy."],
  ["Publishing conduct", "Do not submit plagiarized, fabricated or simultaneously submitted work in breach of applicable journal policies. Follow the instructions of the responsible editor or institution."],
];

export default function ResearchGuidelines() {
  return <Layout>
    <main className="rsre-page max-w-5xl py-12 md:py-16">
      <div className="rsre-kicker">RSRE · RESEARCH CONDUCT</div>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Research Community Guidelines</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">These guidelines set the minimum standard for using RSRE research-learning, discovery, collaboration and publishing services responsibly.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {sections.map(([title,body])=><section key={title} className="rsre-panel p-6"><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></section>)}
      </div>
      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-black text-amber-950">Important boundary</h2>
        <p className="mt-2 text-sm leading-7 text-amber-900">RSRE provides support and infrastructure. It does not automatically provide ethics approval, regulatory authorization, clinical authorization or institutional approval. Researchers must follow the requirements of the institutions and authorities responsible for their work.</p>
      </section>
    </main>
  </Layout>
}
