import Layout from "../components/Layout";

export default function Privacy() {
  return <Layout>
    <main className="rsre-page max-w-4xl py-12 md:py-16">
      <div className="rsre-kicker">RSRE · PRIVACY</div>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Privacy Notice</h1>
      <p className="mt-4 text-sm text-slate-500">Version: 2026-09-v1 · Effective September 2026</p>
      <div className="mt-8 space-y-8 text-[15px] leading-7 text-slate-700">
        <section><h2 className="text-xl font-black text-slate-950">What we collect</h2><p className="mt-3">Depending on the feature you use, RSRE may collect account identity information, contact information, affiliation, academic or research profile information, learning progress, submissions, research activity, notifications and technical information needed to operate and secure the service.</p></section>
        <section><h2 className="text-xl font-black text-slate-950">Why we use it</h2><p className="mt-3">Information is used to provide accounts, secure access, deliver platform workflows, record learning and research activity, communicate important service information, operate journal workflows and improve reliability.</p></section>
        <section><h2 className="text-xl font-black text-slate-950">Research and publication privacy</h2><p className="mt-3">Editorial and research records may contain sensitive information. Access should be limited according to role and workflow. Public profiles and Research Passport information are displayed only according to the visibility choices supported by the platform.</p></section>
        <section><h2 className="text-xl font-black text-slate-950">AI-assisted tools</h2><p className="mt-3">Where AI features are enabled, do not submit confidential participant information, private manuscripts, credentials or other information you are not authorized to disclose. The specific data flow of any external AI provider must be described in the final approved policy before production use.</p></section>
        <section><h2 className="text-xl font-black text-slate-950">Your choices</h2><p className="mt-3">Where supported, users can update profile information, adjust notification preferences and request assistance about account or privacy matters through the support process.</p></section>
        <section><h2 className="text-xl font-black text-slate-950">Final privacy review</h2><p className="mt-3">This notice provides the product's operational privacy framework and should receive final organizational and legal review, including review of retention periods, lawful basis, data transfers and data-subject rights, before formal adoption.</p></section>
      </div>
    </main>
  </Layout>
}
