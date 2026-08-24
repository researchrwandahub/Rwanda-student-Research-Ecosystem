import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bell,
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
  FlaskConical,
  BriefcaseBusiness,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  Sparkles,
  X,
} from "lucide-react";
import api from "../utils/api";
import ThemeToggle from "./ThemeToggle";

type HeaderUser = {
  role?: string;
  username?: string;
  full_name?: string;
  email?: string;
};

const primaryNav = [
  ["/", "Home", Home],
  ["/articles", "Journal", BookOpen],
  ["/research-academy", "Academy", GraduationCap],
  ["/research-discovery", "Discovery", Compass],
  ["/research-opportunities", "Opportunities", BriefcaseBusiness],
  ["/research-incubator", "Incubator", FlaskConical],
  ["/research-passport", "Passport", BarChart3],
  ["/about", "About", Users],
] as const;

const workspaceNav = [
  ["/research-sandbox", "Research Sandbox", FlaskConical],
  ["/collaboration", "Collaboration Network", Users],
  ["/ethics-compliance", "Ethics & Compliance", ShieldCheck],
  ["/events-training", "Events & Training", CalendarDays],
  ["/research-analytics", "Research Analytics", BarChart3],
  ["/medtech-ai", "MedTech AI", Sparkles],
] as const;

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<HeaderUser | null>(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hydrate = async () => {
      const cached = localStorage.getItem("rmsjUser");

      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          localStorage.removeItem("rmsjUser");
        }
      }

      const token = localStorage.getItem("rmsjToken");
      if (!token) return;

      try {
        const profile = await api.get("/profile/", { timeout: 5000 });
        setUser(profile.data);
        localStorage.setItem(
          "rmsjUser",
          JSON.stringify(profile.data)
        );
      } catch {
        // Keep cached user.
      }

      try {
        const response = await api.get("/notifications/", {
          timeout: 5000,
        });

        const rows = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setUnread(
          rows.filter(
            (item: { is_read?: boolean }) => !item.is_read
          ).length
        );
      } catch {
        setUnread(0);
      }
    };

    hydrate();

    const refresh = () => hydrate();

    window.addEventListener("rmsj-auth-changed", refresh);

    return () => {
      window.removeEventListener("rmsj-auth-changed", refresh);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [router.pathname]);

  const dashboard =
    user?.role === "administrator"
      ? "/rsre-admin"
      : "/dashboard";

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  function logout() {
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
    ].forEach((key) => localStorage.removeItem(key));

    setUser(null);
    setUnread(0);
    setOpen(false);

    window.dispatchEvent(new Event("rmsj-auth-changed"));
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="hidden bg-slate-950 text-white sm:block">
        <div className="mx-auto flex min-h-[34px] max-w-[1440px] items-center justify-between px-4 text-[11px] font-bold sm:px-6 lg:px-8">
          <span className="text-slate-300">
            Research • Learning • Collaboration • Publication
          </span>

          <Link
            href="/support-rsre"
            className="text-emerald-300 transition hover:text-white"
          >
            Support RSRE
          </Link>
        </div>
      </div>

      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="RSRE home"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src="/logo.png"
              alt="RSRE"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="text-sm font-black tracking-tight text-slate-950">
              RSRE
            </div>
            <div className="max-w-[220px] truncate text-[11px] font-medium text-slate-500">
              Research Support & Research Ecosystem
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.slice(0, 7).map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
                isActive(href)
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={15} strokeWidth={2.2} />
              {label}
            </Link>
          ))}

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <MoreHorizontal size={16} />
              More
            </button>

            <div className="pointer-events-none absolute right-0 top-full mt-2 w-80 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_24px_70px_rgba(15,23,42,.16)] transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              {workspaceNav.map(([href, label, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive(href)
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
                    <Icon size={17} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Link
            href="/research-discovery"
            className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            aria-label="Search research"
          >
            <Search size={19} />
          </Link>

          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unread > 0 && (
                  <span className="absolute right-1 top-1 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] font-black leading-4 text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              <Link
                href={dashboard}
                className="hidden items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-[13px] font-black text-white transition hover:bg-emerald-700 md:inline-flex"
              >
                <LayoutDashboard size={16} />
                {user.role === "administrator"
                  ? "Control Center"
                  : "My Dashboard"}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-black text-rose-700 transition hover:bg-rose-100 sm:inline-flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-black text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                href="/auth/register"
                className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-[13px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:inline-flex"
              >
                <UserPlus size={16} />
                Join RSRE
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-h-[78vh] max-w-[1440px] overflow-y-auto px-4 py-4 sm:px-6">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 md:hidden">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Theme
              </span>
              <ThemeToggle />
            </div>

            {!user && (
              <div className="mb-4 grid grid-cols-2 gap-2 border-b border-slate-200 pb-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-800"
                >
                  <LogIn size={16} />
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"
                >
                  <UserPlus size={16} />
                  Join RSRE
                </Link>
              </div>
            )}

            <div className="grid gap-1">
              {[...primaryNav, ...workspaceNav].map(
                ([href, label, Icon]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      isActive(href)
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              )}
            </div>

            {user && (
              <div className="mt-4 grid gap-1 border-t border-slate-200 pt-4">
                <Link
                  href={dashboard}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link
                  href="/notifications"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Bell size={18} />
                  Notifications
                  {unread > 0 ? ` (${unread})` : ""}
                </Link>

                <Link
                  href="/profile"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Users size={18} />
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.10)] backdrop-blur-xl sm:hidden"
        aria-label="Mobile primary navigation"
      >
        {(
          [
            { href: "/", label: "Home", icon: Home },
            { href: "/articles", label: "Journal", icon: BookOpen },
            {
              href: "/research-academy",
              label: "Academy",
              icon: GraduationCap,
            },
            {
              href: "/research-discovery",
              label: "Discover",
              icon: Compass,
            },
          ] as const
        ).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black transition ${
              isActive(href)
                ? "text-emerald-700"
                : "text-slate-500"
            }`}
          >
            <Icon size={18} strokeWidth={2.2} />
            <span>{label}</span>
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black ${
            open ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {open ? <X size={18} /> : <MoreHorizontal size={18} />}
          <span>More</span>
        </button>
      </nav>
    </header>
  );
}

