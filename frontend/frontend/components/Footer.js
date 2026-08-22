import Link from 'next/link'
import { SITE, SITE_CONTACT } from '../config/site'

export default function Footer(){
  return <footer className="mt-16 bg-[#071b34] text-white">
    <div className="rsjh-page grid gap-10 py-14 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
      <div>
        <div className="flex items-start gap-3"><div className="rounded-2xl bg-white p-1.5"><img src="/logo.png" alt="RSRE" className="h-11 w-11 object-contain"/></div><div><div className="font-black">{SITE.shortName}</div><div className="text-xs text-blue-200">{SITE.name}</div></div></div>
        <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100">{SITE.tagline} A student-centered health research ecosystem connecting learning, discovery, opportunities, experimentation, collaboration and publication.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/about" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-emerald-200">About RSRE</Link><Link href="/articles" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-emerald-200">RSJH Journal</Link></div>
      </div>
      <div><h3 className="font-bold">Ecosystem</h3><div className="mt-4 grid gap-3 text-sm text-blue-200"><Link href="/research-academy">Research Academy</Link><Link href="/research-discovery">Research Discovery</Link><Link href="/research-opportunities">Research Opportunities</Link><Link href="/research-incubator">Research Incubator</Link><Link href="/research-sandbox">Research Sandbox</Link><Link href="/research-passport">Research Passport</Link></div></div>
      <div><h3 className="font-bold">Research & Publishing</h3><div className="mt-4 grid gap-3 text-sm text-blue-200"><Link href="/collaboration">Collaboration Network</Link><Link href="/ethics-compliance">Ethics & Compliance</Link><Link href="/events-training">Events & Training</Link><Link href="/medtech-ai">MedTech AI</Link><Link href="/articles">RSJH Journal</Link><Link href="/submit">Submit Manuscript</Link></div></div>
      <div><h3 className="font-bold">Support</h3><div className="mt-4 grid gap-3 text-sm text-blue-200"><Link href="/support-rsre" className="font-bold text-emerald-200">Support RSRE</Link><Link href="/support">Help & Support</Link><Link href="/contact">Contact</Link><Link href="/profile">My Profile</Link><a href={`mailto:${SITE_CONTACT.primaryEmail || SITE_CONTACT.editorialEmail}`}>{SITE_CONTACT.editorialEmail}</a><span>{SITE_CONTACT.phone}</span></div></div>
    </div>
    <div className="border-t border-white/10"><div className="rsjh-page flex flex-col gap-2 py-5 text-xs text-blue-300 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} {SITE.name} · {SITE.publisher}</span><span>RSJH is free · Research integrity · Human governance · Responsible AI</span></div></div>
  </footer>
}
