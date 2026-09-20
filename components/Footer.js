import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SITE } from '../config/site'
import { useLanguage } from '../context/LanguageContext'

function Icon({ name, className = 'h-4 w-4' }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    discovery: (
      <>
        <circle {...common} cx="12" cy="12" r="8.5" />
        <path
          {...common}
          d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z"
        />
      </>
    ),

    academy: (
      <>
        <path
          {...common}
          d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
        />
        <path
          {...common}
          d="M6.5 10.3v4.2c0 1.7 2.5 3.2 5.5 3.2s5.5-1.5 5.5-3.2v-4.2"
        />
        <path {...common} d="M21 8.5v5" />
      </>
    ),

    opportunity: (
      <>
        <circle {...common} cx="12" cy="10" r="6" />
        <path {...common} d="M9 18h6M10 21h4" />
        <path {...common} d="M12 7v3l2 2" />
      </>
    ),

    passport: (
      <>
        <rect
          {...common}
          x="5"
          y="3.5"
          width="14"
          height="17"
          rx="1.8"
        />
        <circle {...common} cx="12" cy="10" r="3" />
        <path {...common} d="M8.5 16.5h7" />
      </>
    ),

    laboratory: (
      <>
        <path {...common} d="M9 3.5h6" />
        <path
          {...common}
          d="M10.5 3.5v6L5.8 17a2 2 0 0 0 1.7 3h9a2 2 0 0 0 1.7-3l-4.7-7.5v-6"
        />
        <path {...common} d="M8 15h8" />
      </>
    ),

    idea: (
      <>
        <path {...common} d="M9 18h6" />
        <path {...common} d="M9.5 21h5" />
        <path
          {...common}
          d="M8.4 14.5a6 6 0 1 1 7.2 0c-.9.7-1.6 1.5-1.8 2.5h-3.6c-.2-1-.9-1.8-1.8-2.5Z"
        />
      </>
    ),

    collaboration: (
      <>
        <circle {...common} cx="9" cy="8" r="2.8" />
        <circle {...common} cx="16.5" cy="8.8" r="2.3" />
        <path
          {...common}
          d="M4.5 18c.5-3 2.1-4.5 4.5-4.5s4 1.5 4.5 4.5"
        />
        <path
          {...common}
          d="M14 15c2.6-.8 4.7.5 5.5 3"
        />
      </>
    ),

    events: (
      <>
        <rect
          {...common}
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
        />
        <path {...common} d="M8 3v4M16 3v4M4 9h16" />
        <path
          {...common}
          d="M8 13h2M12 13h2M16 13h0M8 16h2M12 16h2"
        />
      </>
    ),

    journal: (
      <>
        <path
          {...common}
          d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z"
        />
        <path {...common} d="M5 4.5v15M9 6h7M9 9h7M9 12h5" />
      </>
    ),

    submit: (
      <>
        <path
          {...common}
          d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z"
        />
        <path {...common} d="M9 8h6M9 11h6M9 14h4" />
      </>
    ),

    board: (
      <>
        <circle {...common} cx="9" cy="8" r="2.5" />
        <circle {...common} cx="16" cy="8" r="2.5" />
        <path
          {...common}
          d="M4.5 18c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5"
        />
        <path
          {...common}
          d="M12.5 18c.4-2.7 1.8-4 4-4 2.1 0 3.5 1.3 4 4"
        />
      </>
    ),

    help: (
      <>
        <circle {...common} cx="12" cy="12" r="8.5" />
        <path
          {...common}
          d="M9.7 9a2.5 2.5 0 1 1 4.7 1.2c-.8 1.1-2.4 1.3-2.4 3"
        />
        <path {...common} d="M12 16.5h.01" />
      </>
    ),

    support: (
      <>
        <path {...common} d="M12 4a8 8 0 1 0 8 8" />
        <path {...common} d="M12 8v4l3 2" />
        <path {...common} d="M17 5v4h4" />
      </>
    ),

    mail: (
      <>
        <rect
          {...common}
          x="3.5"
          y="5.5"
          width="17"
          height="13"
          rx="2"
        />
        <path {...common} d="m4.5 7 7.5 6 7.5-6" />
      </>
    ),

    phone: (
      <>
        <path
          {...common}
          d="M7 3.5 9.5 3l2 4-2 1.5a14 14 0 0 0 6 6L17 12.5l4 2-.5 2.5a3 3 0 0 1-3.2 2.3C10.7 18.4 5.6 13.3 4.7 6.7A3 3 0 0 1 7 3.5Z"
        />
      </>
    ),

    pin: (
      <>
        <path
          {...common}
          d="M19 10c0 4.8-7 10-7 10S5 14.8 5 10a7 7 0 0 1 14 0Z"
        />
        <circle {...common} cx="12" cy="10" r="2.2" />
      </>
    ),

    linkedin: (
      <>
        <rect
          {...common}
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />
        <path
          {...common}
          d="M8 10v6M8 8h.01M12 16v-6M12 13c0-1.7 1-3 2.7-3 1.5 0 2.3 1 2.3 2.8V16"
        />
      </>
    ),

    arrow: (
      <>
        <path {...common} d="M5 12h13" />
        <path {...common} d="m13 6 6 6-6 6" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

function FooterLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-2.5 py-1.5 text-[13px] text-white/55 transition hover:text-white"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-white/35 transition group-hover:text-white/75">
        <Icon name={icon} className="h-3.5 w-3.5" />
      </span>

      <span className="truncate">{children}</span>

      <span className="ml-auto shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-45">
        <Icon name="arrow" className="h-3 w-3" />
      </span>
    </Link>
  )
}

export default function Footer() {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const readUser = () => {
      try {
        const stored = localStorage.getItem('rmsjUser')
        setUser(stored ? JSON.parse(stored) : null)
      } catch {
        setUser(null)
      }
    }

    readUser()

    window.addEventListener(
      'rmsj-auth-changed',
      readUser,
    )

    return () => {
      window.removeEventListener(
        'rmsj-auth-changed',
        readUser,
      )
    }
  }, [])

  const dashboard =
    user?.role === 'administrator'
      ? '/rsre-admin'
      : ['reviewer', 'editor', 'editor_in_chief'].includes(
          user?.role,
        )
        ? {
            reviewer: '/dashboard/reviewer',
            editor: '/dashboard/editor',
            editor_in_chief:
              '/dashboard/editor-in-chief',
          }[user.role]
        : '/dashboard'

  /*
   * Help Desk is part of the authenticated research workspace.
   * Logged-out users are sent through login first.
   */
  const helpDeskHref = user
    ? `${dashboard}#support`
    : '/auth/login?next=/dashboard#support'

  /*
   * Manuscript submission follows the authenticated workflow.
   */
  const manuscriptHref = user
    ? dashboard
    : '/auth/login?next=/dashboard'

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#08111d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">

        {/* BRAND */}
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-3">

            {/* REAL RSRE LOGO */}
            <Link
              href="/"
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/10"
              aria-label="RSRE home"
            >
              <img
                src="/logo.png"
                alt="RSRE"
                className="h-10 w-10 object-contain"
              />
            </Link>

            <div className="min-w-0">
              <Link
                href="/"
                className="block text-sm font-semibold tracking-tight text-white"
              >
                {SITE?.name || 'RSRE'}
              </Link>

              <p className="truncate text-[11px] text-white/35">
                Research Support &amp; Research Ecosystem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Icon name="pin" className="h-3.5 w-3.5" />
            <span>Huye, Rwanda</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="grid gap-6 py-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">

          {/* GENERAL */}
          <div>
            <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('general') || 'General'}
            </h2>

            <div className="grid grid-cols-2 gap-x-5">
              <FooterLink
                href="/research-discovery"
                icon="discovery"
              >
                {t('discovery') || 'Research Discovery'}
              </FooterLink>

              <FooterLink
                href="/research-academy"
                icon="academy"
              >
                {t('academy') || 'Research Academy'}
              </FooterLink>

              <FooterLink
                href="/research-opportunities"
                icon="opportunity"
              >
                {t('opportunities') || 'Opportunities'}
              </FooterLink>

              <FooterLink
                href="/research-passport"
                icon="passport"
              >
                {t('researchPassport') || 'Research Passport'}
              </FooterLink>

              <FooterLink
                href="/research-sandbox"
                icon="laboratory"
              >
                Research Laboratory
              </FooterLink>

              <FooterLink
                href="/research-incubator"
                icon="idea"
              >
                Save an Idea
              </FooterLink>

              <FooterLink
                href="/collaboration"
                icon="collaboration"
              >
                {t('collaboration') || 'Collaboration'}
              </FooterLink>

              <FooterLink
                href="/events-training"
                icon="events"
              >
                {t('events') || 'Events & Training'}
              </FooterLink>
            </div>
          </div>

          {/* EDITORIAL */}
          <div>
            <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('editorial') || 'Editorial'}
            </h2>

            <FooterLink
              href="/articles"
              icon="journal"
            >
              {t('journal') || 'Journal'}
            </FooterLink>

            <Link
              href={manuscriptHref}
              className="group flex min-w-0 items-center gap-2.5 py-1.5 text-[13px] text-white/55 transition hover:text-white"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-white/35 transition group-hover:text-white/75">
                <Icon
                  name="submit"
                  className="h-3.5 w-3.5"
                />
              </span>

              <span className="truncate">
                {t('submitManuscript') ||
                  'Submit a Manuscript'}
              </span>

              <span className="ml-auto shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-45">
                <Icon
                  name="arrow"
                  className="h-3 w-3"
                />
              </span>
            </Link>

            <FooterLink
              href="/editorial-board"
              icon="board"
            >
              Editorial Board
            </FooterLink>
          </div>

          {/* HELP & CONTACT */}
          <div>
            <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Help &amp; Contact
            </h2>

            <Link
              href={helpDeskHref}
              className="group flex items-center gap-2.5 py-1.5 text-[13px] font-semibold text-white/70 transition hover:text-white"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-white/55">
                <Icon
                  name="help"
                  className="h-3.5 w-3.5"
                />
              </span>

              <span className="truncate">
                RSRE Help Desk
              </span>

              <span className="ml-auto shrink-0 text-[10px] text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/55">
                Ask a question →
              </span>
            </Link>

            <FooterLink
              href="/support-rsre"
              icon="support"
            >
              Support RSRE
            </FooterLink>

            <a
              href="mailto:rwandasupportresearch@gmail.com"
              className="flex items-center gap-2.5 py-1.5 text-[12px] text-white/45 transition hover:text-white"
            >
              <Icon
                name="mail"
                className="h-3.5 w-3.5 shrink-0"
              />

              <span className="truncate">
                rwandasupportresearch@gmail.com
              </span>
            </a>

            <a
              href="mailto:rwandaresearchhub@gmail.com"
              className="flex items-center gap-2.5 py-1.5 text-[12px] text-white/45 transition hover:text-white"
            >
              <Icon
                name="mail"
                className="h-3.5 w-3.5 shrink-0"
              />

              <span className="truncate">
                rwandaresearchhub@gmail.com
              </span>
            </a>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-white/40">

              <a
                href="tel:+250792447121"
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <Icon
                  name="phone"
                  className="h-3.5 w-3.5"
                />
                +250 792 447 121
              </a>

              <a
                href="https://www.linkedin.com/in/ngabonziza-patrick-26a05a3ba/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <Icon
                  name="linkedin"
                  className="h-3.5 w-3.5"
                />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between">

          <span>
            © {new Date().getFullYear()}{' '}
            {SITE?.name || 'RSRE'}. All rights reserved.
          </span>

          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              {t('terms') || 'Terms'}
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              {t('privacy') || 'Privacy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}