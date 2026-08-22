import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Home,
  LayoutDashboard,
  Menu,
  Search,
  X,
} from "lucide-react";
import api from "../utils/api";

const primaryNav = [
  ["/", "Home"],
  ["/articles", "RSJH Journal"],
  ["/research-academy", "Academy"],
  ["/research-discovery", "Discovery"],
  ["/research-opportunities", "Opportunities"],
  ["/research-incubator", "Incubator"],
  ["/research-passport", "Passport"],
  ["/about", "About"],
];

const workspaceNav = [
  ["/research-sandbox", "Research Sandbox"],
  ["/collaboration", "Collaboration Network"],
  ["/ethics-compliance", "Ethics & Compliance"],
  ["/events-training", "Events & Training"],
  ["/research-analytics", "Research Analytics"],
  ["/medtech-ai", "MedTech AI"],
];

export default function Header() {
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached =
      localStorage.getItem("rmsjUser");

    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem("rmsjUser");
      }
    }

    const token =
      localStorage.getItem("rmsjToken");

    if (!token) {
      return;
    }

    let cancelled = false;

    async function hydrate() {
      try {
        const profile = await api.get(
          "/profile/",
          { timeout: 5000 }
        );

        if (cancelled) return;

        setUser(profile.data);

        localStorage.setItem(
          "rmsjUser",
          JSON.stringify(profile.data)
        );
      } catch {
        // Cached user remains available.
      }

      try {
        const response = await api.get(
          "/notifications/",
          { timeout: 5000 }
        );

        if (cancelled) return;

        const rows = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setUnread(
          rows.filter(
            (item) => !item.is_read
          ).length
        );
      } catch {
        if (!cancelled) {
          setUnread(0);
        }
      }
    }

    hydrate();

    const refresh = () => hydrate();

    window.addEventListener(
      "rmsj-auth-changed",
      refresh
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "rmsj-auth-changed",
        refresh
      );
    };
  }, []);

  const dashboard =
    user?.role === "administrator"
      ? "/rsre-admin"
      : "/dashboard";

  function logout() {
    if (typeof window === "undefined") return;

    [
      "rmsjToken",
      "rmsjRefresh",
      "rmsjRefreshToken",
      "rmsjRole",
      "rmsjUsername",
      "rmsjFullName",
      "rmsjUser",
      "access",
      "token",
    ].forEach((key) =>
      localStorage.removeItem(key)
    );

    setUser(null);
    setUnread(0);
    setOpen(false);

    window.dispatchEvent(
      new Event("rmsj-auth-changed")
    );

    window.location.href = "/";
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="hidden bg-slate-950 text-white sm:block">
        <div className="mx-auto flex min-h-[34px] max-w-7xl items-center justify-between px-4 text-xs font-semibold sm:px-6 lg:px-8">
          <span>
            Research, learning, collaboration and publication
          </span>

          <Link
            href="/support-rsre"
            className="text-emerald-300 hover:text-white"
          >
            Support RSRE
          </Link>
        </div>
      </div>

      <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950">
            <img
              src="/logo.png"
              alt="RSRE"
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="text-sm font-black">
              RSRE
            </div>

            <div className="truncate text-[11px] text-slate-500">
              Rwanda Student Research Ecosystem
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map(
            ([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {label}
              </Link>
            )
          )}

          <div className="group relative">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              More
            </button>

            <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 w-72 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:opacity-100">
              {workspaceNav.map(
                ([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {label}
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/research-discovery"
            className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 sm:inline-flex"
            aria-label="Search research"
          >
            <Search size={19} />
          </Link>

          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
              >
                <Bell size={19} />

                {unread > 0 && (
                  <span className="absolute right-1 top-1 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] font-black leading-4 text-white">
                    {unread > 9
                      ? "9+"
                      : unread}
                  </span>
                )}
              </Link>

              <Link
                href={dashboard}
                className="hidden items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-black text-white md:inline-flex"
              >
                <LayoutDashboard size={16} />
                {user.role ===
                "administrator"
                  ? "Control Center"
                  : "My Dashboard"}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="hidden rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-black text-rose-700 sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                Login
              </Link>

              <Link
                href="/auth/register"
                className="hidden rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-black text-white hover:bg-emerald-700 sm:inline-flex"
              >
                Join RSRE
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
            aria-label="Open menu"
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
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-h-[75vh] max-w-7xl overflow-y-auto px-4 py-4 sm:px-6">

            {!user && (
              <div className="mb-4 grid grid-cols-2 gap-2 border-b border-slate-200 pb-4">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-black text-slate-800"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white"
                >
                  Join RSRE
                </Link>
              </div>
            )}

            <div className="grid gap-1">
              {primaryNav
                .concat(workspaceNav)
                .map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() =>
                      setOpen(false)
                    }
                    className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {label}
                  </Link>
                ))}
            </div>

            {user && (
              <div className="mt-4 grid gap-1 border-t border-slate-200 pt-4">
                <Link
                  href={dashboard}
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-xl px-4 py-3 text-sm font-bold"
                >
                  Dashboard
                </Link>

                <Link
                  href="/notifications"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-xl px-4 py-3 text-sm font-bold"
                >
                  Notifications
                  {unread > 0
                    ? ` (${unread})`
                    : ""}
                </Link>

                <Link
                  href="/profile"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-xl px-4 py-3 text-sm font-bold"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-5 border-t border-slate-200 bg-white px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.10)] sm:hidden"
        aria-label="Mobile primary navigation"
      >
        {[
          ["/", "Home", Home],
          ["/articles", "Journal", BookOpen],
          [
            "/research-academy",
            "Academy",
            BookOpen,
          ],
          [
            "/research-incubator",
            "Build",
            LayoutDashboard,
          ],
        ].map(
          ([href, label, Icon]) => {
            const IconComponent =
              Icon;

            return (
              <Link
                key={href}
                href={href}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-slate-500"
              >
                <IconComponent size={17} />
                <span>{label}</span>
              </Link>
            );
          }
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-slate-500"
        >
          <Menu size={17} />
          <span>More</span>
        </button>
      </nav>
    </header>
  );
}
