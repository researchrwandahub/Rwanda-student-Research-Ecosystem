import Layout from "../components/Layout";
import { SITE, SITE_CONTACT } from "../config/site";

export default function ContactPage() {
  return (
    <Layout>
      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 text-white py-16">
          <div className="rsjh-page">
            <p className="rsjh-eyebrow text-emerald-300">EDITORIAL OFFICE</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Contact RSJH</h1>
            <p className="mt-4 max-w-2xl text-blue-100 leading-7">For editorial enquiries, partnerships, opportunities, reviewer questions and platform support.</p>
          </div>
        </section>
        <section className="rsjh-section">
          <div className="rsjh-page grid gap-6 md:grid-cols-2">
            <div className="rsjh-card p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Email</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Editorial office</h2>
              <a href={`mailto:${SITE_CONTACT.editorialEmail}`} className="mt-4 inline-flex items-center rounded-xl bg-blue-900 px-5 py-3 text-lg font-bold text-white hover:bg-blue-950">Email the RSJH Editorial Office â†’</a>
              <p className="mt-3 text-sm text-slate-500">{SITE_CONTACT.editorialEmail}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Use this contact for manuscript, editorial, partnership and research-platform enquiries.</p>
            </div>
            <div className="rsjh-card p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Phone / WhatsApp</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Official contact number</h2>
              {SITE_CONTACT.phone ? <a href={`tel:${SITE_CONTACT.phone}`} className="mt-4 inline-block text-lg font-bold text-blue-700">{SITE_CONTACT.phone}</a> : <p className="mt-4 text-slate-500">The official RSJH number can be added in <code>frontend/config/site.ts</code>.</p>}
              <p className="mt-3 text-sm leading-6 text-slate-600">Official contact and WhatsApp line for RSJH.</p>
            </div>
          </div>

          <div className="rsjh-page mt-6 grid gap-6 md:grid-cols-2">
            <div className="rsjh-card p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Editorial Office</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Based in Huye, Rwanda</h2>
              <p className="mt-3 text-slate-600">{SITE_CONTACT.address}</p>
            </div>
            <div className="rsjh-card p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Connect with RSJH</p>
              <div className="mt-4 flex flex-wrap gap-4 font-bold">
                {SITE_CONTACT.linkedin && <a href={SITE_CONTACT.linkedin} target="_blank" rel="noreferrer" className="text-blue-700">LinkedIn</a>}
                {SITE_CONTACT.twitter && <a href={SITE_CONTACT.twitter} target="_blank" rel="noreferrer" className="text-slate-800">X / Twitter</a>}
                {SITE_CONTACT.instagram && <a href={SITE_CONTACT.instagram} target="_blank" rel="noreferrer" className="text-pink-700">Instagram</a>}
                {!SITE_CONTACT.linkedin && !SITE_CONTACT.twitter && !SITE_CONTACT.instagram && <span className="text-slate-500"></span>}
              </div>
            </div>
          </div>

          <div className="rsjh-page mt-6">
            <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-7">
              <h2 className="text-2xl font-black text-slate-950">Published by {SITE.publisher}</h2>
              <p className="mt-3 max-w-3xl text-slate-700 leading-7">MedTech Rwanda supports the technology, platform operations and publisher-side infrastructure. Scientific scope, peer review and publication decisions remain with RSJH editorial leadership.</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

