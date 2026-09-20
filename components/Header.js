import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BookOpen, Home, LayoutDashboard, Menu, Search, X } from 'lucide-react'
import api, { absoluteUrl } from '../utils/api'
import { useLanguage } from '../context/LanguageContext'

// Primary journey — what most people are here to do, always visible.
const primaryNav = [
  ['/', 'home'],
  ['/articles', 'journal'],
  ['/research-academy', 'academy'],
  ['/research-discovery', 'discovery'],
  ['/research-opportunities', 'opportunities'],
]

// Deeper ecosystem tools — grouped under "Research" rather than sitting
// level with the primary journey.
const researchNav = [
  ['/research-passport', 'passport'],
  ['/research-incubator', 'incubator'],
  ['/collaboration', 'collaboration'],
  ['/research-sandbox', 'sandbox'],
]

// Supporting areas — used less often, still reachable, not competing for
// primary attention.
const workspaceNav = [
  ['/events-training', 'events'],
  ['/research-analytics', 'analytics'],
  ['/ethics-compliance', 'ethics'],
  ['/medtech-ai', 'medtechAi'],
  ['/about', 'about'],
]

export default function Header() {
  const { locale, setLocale, t } = useLanguage()
  const [user, setUser] = useState(null)
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  async function refresh() {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('rmsjToken')

    if (!token) {
      setUser(null)
      setUnread(0)
      return
    }

    try {
      const [profileRes, notesRes] = await Promise.all([
        api.get('/profile/'),
        api.get('/notifications/'),
      ])

      setUser(profileRes.data)

      localStorage.setItem(
        'rmsjUser',
        JSON.stringify(profileRes.data),
      )

      const notes = Array.isArray(notesRes.data)
        ? notesRes.data
        : notesRes.data?.results || []

      setUnread(notes.filter((n) => !n.is_read).length)
    } catch {
      try {
        setUser(
          JSON.parse(
            localStorage.getItem('rmsjUser') || 'null',
          ),
        )
      } catch {
        setUser(null)
      }
    }
  }

  useEffect(() => {
    refresh()

    const onChange = () => refresh()

    window.addEventListener(
      'rmsj-auth-changed',
      onChange,
    )

    return () =>
      window.removeEventListener(
        'rmsj-auth-changed',
        onChange,
      )
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

  function logout() {
    if (typeof window === 'undefined') return

    ;[
      'rmsjToken',
      'rmsjRefresh',
      'rmsjRefreshToken',
      'rmsjRole',
      'rmsjUsername',
      'rmsjFullName',
      'rmsjUser',
    ].forEach((k) => localStorage.removeItem(k))

    window.dispatchEvent(
      new Event('rmsj-auth-changed'),
    )

    window.location.href = '/'
  }

  return (
    <header className="relative z-[1000] border-b border-graphite-200 bg-white/95 backdrop-blur-xl">
      <div className="rsre-topbar hidden sm:block">
        <div className="rsre-page flex min-h-[34px] items-center justify-between gap-4 text-xs font-bold">
          <span className="inline-flex items-center gap-2 text-canopy-100">
            Research learning, discovery, collaboration and publication
          </span>

          <Link
            href="/support-rsre"
            className="text-canopy-100 hover:text-white"
          >
            Support RSRE
          </Link>
        </div>
      </div>

      <div className="rsre-page flex min-h-[76px] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-ink ring-1 ring-graphite-200">
            <img
              src="/logo.png"
              alt="RSRE"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-ink">
              RSRE
            </div>

            <div className="text-[11px] text-graphite-500">
              Research Support and Research Ecosystem
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              className="rsre-nav"
            >
              {t(key)}
            </Link>
          ))}

          <div className="group relative z-[1100]">
            <button className="rsre-nav">
              {t('research')}
            </button>

            <div className="pointer-events-none absolute right-0 top-full z-[9999] mt-2 w-64 rsre-menu-card p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
              {researchNav.map(([href, key]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-graphite-700 hover:bg-parchment-panel hover:text-ink"
                >
                  {t(key)}
                </Link>
              ))}
            </div>
          </div>

          <div className="group relative z-[1100]">
            <button className="rsre-nav">
              {t('more')}
            </button>

            <div className="pointer-events-none absolute right-0 top-full z-[9999] mt-2 w-64 rsre-menu-card p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
              {workspaceNav.map(([href, key]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-graphite-700 hover:bg-parchment-panel hover:text-ink"
                >
                  {t(key)}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Real, working language switcher */}
          <div
            role="group"
            aria-label="Language"
            className="hidden items-center overflow-hidden rounded-md border border-graphite-200 text-xs font-bold sm:flex"
          >
            <button
              type="button"
              aria-pressed={locale === 'en'}
              aria-label="English"
              onClick={() => setLocale('en')}
              className={`px-2.5 py-2 ${
                locale === 'en'
                  ? 'bg-ink text-parchment'
                  : 'text-graphite-500 hover:bg-parchment-panel'
              }`}
            >
              ENG
            </button>

            <button
              type="button"
              aria-pressed={locale === 'fr'}
              aria-label="Français"
              onClick={() => setLocale('fr')}
              className={`px-2.5 py-2 ${
                locale === 'fr'
                  ? 'bg-ink text-parchment'
                  : 'text-graphite-500 hover:bg-parchment-panel'
              }`}
            >
              FRE
            </button>
          </div>

          <Link
            href="/research-discovery"
            className="hidden rounded-xl p-2.5 text-graphite-500 hover:bg-parchment-panel sm:inline-flex"
            aria-label="Search research"
          >
            <Search size={19} />
          </Link>

          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative rounded-xl p-2.5 text-graphite-600 hover:bg-parchment-panel"
              >
                <Bell size={19} />

                {unread > 0 && (
                  <span className="absolute right-1 top-1 min-w-4 rounded-full bg-clay-600 px-1 text-[9px] font-black leading-4 text-center text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <Link
                href={dashboard}
                className="hidden items-center gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-sm font-semibold text-parchment md:inline-flex"
              >
                <LayoutDashboard size={16} />

                {user.role === 'administrator'
                  ? t('controlCenter')
                  : t('dashboard')}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="hidden rounded-xl border border-clay-300/60 bg-clay-50 px-3.5 py-2.5 text-sm font-semibold text-clay-700 sm:inline-flex"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-graphite-700 sm:inline-flex"
              >
                {t('signIn')}
              </Link>

              {/* ONLY CHANGE: black Create account text */}
              <Link
                href="/auth/register"
                className="rounded-md bg-canopy-600 px-3.5 py-2.5 text-sm font-semibold text-black"
              >
                {t('createAccount')}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-graphite-200 p-2.5 text-graphite-700 lg:hidden"
          >
            {open ? (
              <X size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-graphite-200 bg-white lg:hidden">
          <div className="rsre-page grid max-h-[70vh] gap-1 overflow-y-auto py-3 pb-5 text-sm">
            {primaryNav.map(([href, key]) => (
              <Link
                key={href}
                className="rsre-mobile-link font-semibold"
                href={href}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            ))}

            <div className="mt-3 px-3 rsre-kpi-label">
              {t('research')}
            </div>

            {researchNav.map(([href, key]) => (
              <Link
                key={href}
                className="rsre-mobile-link"
                href={href}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            ))}

            <div className="mt-3 px-3 rsre-kpi-label">
              {t('more')}
            </div>

            {workspaceNav.map(([href, key]) => (
              <Link
                key={href}
                className="rsre-mobile-link"
                href={href}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            ))}

            <div className="mt-3 border-t border-graphite-200 pt-3">
              <div
                role="group"
                aria-label="Language"
                className="mb-3 inline-flex overflow-hidden rounded-md border border-graphite-200 text-xs font-bold"
              >
                <button
                  type="button"
                  aria-pressed={locale === 'en'}
                  onClick={() => setLocale('en')}
                  className={`px-3 py-2 ${
                    locale === 'en'
                      ? 'bg-ink text-parchment'
                      : 'text-graphite-500'
                  }`}
                >
                  ENG
                </button>

                <button
                  type="button"
                  aria-pressed={locale === 'fr'}
                  onClick={() => setLocale('fr')}
                  className={`px-3 py-2 ${
                    locale === 'fr'
                      ? 'bg-ink text-parchment'
                      : 'text-graphite-500'
                  }`}
                >
                  FRE
                </button>
              </div>

              {user ? (
                <>
                  <Link
                    className="rsre-mobile-link font-semibold"
                    href={dashboard}
                    onClick={() => setOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>

                  <Link
                    className="rsre-mobile-link"
                    href="/notifications"
                    onClick={() => setOpen(false)}
                  >
                    {t('notifications')}{' '}
                    {unread > 0 && `(${unread})`}
                  </Link>

                  <Link
                    className="rsre-mobile-link"
                    href="/profile"
                    onClick={() => setOpen(false)}
                  >
                    {t('profile')}
                  </Link>

                  <button
                    type="button"
                    className="rsre-mobile-link text-left text-clay-700"
                    onClick={logout}
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="rsre-mobile-link text-canopy-700 font-semibold"
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                  >
                    {t('signIn')}
                  </Link>

                  <Link
                    className="rsre-mobile-link font-semibold text-black"
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                  >
                    {t('createAccount')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-5 border-t border-graphite-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.10)] backdrop-blur-xl sm:hidden"
        aria-label="Mobile primary navigation"
      >
        {[
          ['/', 'home', Home],
          ['/articles', 'journal', BookOpen],
          ['/research-academy', 'academy', BookOpen],
          [
            '/research-incubator',
            'incubator',
            LayoutDashboard,
          ],
        ].map(([href, key, Icon]) => {
          const I = Icon

          return (
            <Link
              key={href}
              href={href}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-graphite-500 active:bg-parchment-panel"
            >
              <I size={17} />
              <span>{t(key)}</span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-graphite-500 active:bg-parchment-panel"
        >
          <Menu size={17} />
          <span>{t('more')}</span>
        </button>
      </nav>
    </header>
  )
}
