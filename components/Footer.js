import Link from "next/link";
import { SITE, SITE_CONTACT } from "../config/site";

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-7 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white p-1 shadow-sm">
              <img
                src="/logo.png"
                alt="RSRE"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <div className="text-base font-black">
                {SITE.shortName}
              </div>
              <div className="max-w-[240px] text-xs leading-5 text-slate-400">
                {SITE.name}
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
            {SITE.tagline} A student-centred research ecosystem connecting
            learning, discovery, opportunities, experimentation,
            collaboration and publication.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/about"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-white/10"
            >
              About RSRE
            </Link>

            <Link
              href="/articles"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-white/10"
            >
              RSJH Journal
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">Ecosystem</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <Link href="/research-academy" className="hover:text-white">
              Research Academy
            </Link>
            <Link href="/research-discovery" className="hover:text-white">
              Research Discovery
            </Link>
            <Link href="/research-opportunities" className="hover:text-white">
              Research Opportunities
            </Link>
            <Link href="/research-incubator" className="hover:text-white">
              Research Incubator
            </Link>
            <Link href="/research-sandbox" className="hover:text-white">
              Research Sandbox
            </Link>
            <Link href="/research-passport" className="hover:text-white">
              Research Passport
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">Research & Publishing</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <Link href="/collaboration" className="hover:text-white">
              Collaboration Network
            </Link>
            <Link href="/ethics-compliance" className="hover:text-white">
              Ethics & Compliance
            </Link>
            <Link href="/events-training" className="hover:text-white">
              Events & Training
            </Link>
            <Link href="/medtech-ai" className="hover:text-white">
              MedTech AI
            </Link>
            <Link href="/articles" className="hover:text-white">
              RSJH Journal
            </Link>
            <Link href="/submit" className="hover:text-white">
              Submit Manuscript
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">Support</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <Link
              href="/support-rsre"
              className="font-bold text-emerald-300 hover:text-white"
            >
              Support RSRE
            </Link>
            <Link href="/support" className="hover:text-white">
              Help & Support
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/profile" className="hover:text-white">
              My Profile
            </Link>
            <a
              href={`mailto:${SITE_CONTACT.editorialEmail}`}
              className="break-all hover:text-white"
            >
              {SITE_CONTACT.editorialEmail}
            </a>
            <span>{SITE_CONTACT.phone}</span>
            <span>{SITE_CONTACT.address}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10">
          <span>
            © {new Date().getFullYear()} {SITE.name} · {SITE.publisher}
          </span>
          <span>
            RSJH is free · Research integrity · Human governance · Responsible AI
          </span>
        </div>
      </div>
    </footer>
  );
}
