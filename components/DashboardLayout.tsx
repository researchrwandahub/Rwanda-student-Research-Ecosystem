import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  title: string;
  roleRequired?:
    | "administrator"
    | "author"
    | "reviewer"
    | "editor"
    | "editor_in_chief";
}

export default function DashboardLayout({
  children,
  role,
  title,
  roleRequired,
}: DashboardLayoutProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("rmsjToken");
    const userRole = localStorage.getItem("rmsjRole");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (roleRequired && userRole !== roleRequired) {
      router.replace("/");
      return;
    }

    if (role && userRole !== role) {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router, role, roleRequired]);

  function logout() {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    [
      "rmsjToken",
      "rmsjRefresh",
      "rmsjRole",
      "rmsjUsername",
      "rmsjFullName",
      "rmsjUser",
    ].forEach((key) => localStorage.removeItem(key));

    window.dispatchEvent(new Event("rmsj-auth-changed"));
    router.replace("/");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <GraduationCap size={24} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-600">
            Preparing your research workspace…
          </p>
        </div>
      </div>
    );
  }

  let dashboardUrl = "/dashboard/administrator";

  if (role === "author") dashboardUrl = "/dashboard/author";
  if (role === "reviewer") dashboardUrl = "/dashboard/reviewer";
  if (role === "editor") dashboardUrl = "/dashboard/editor";
  if (role === "editor_in_chief")
    dashboardUrl = "/dashboard/editor-in-chief";

  const active = (path: string) =>
    router.pathname === path || router.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950 text-white shadow-xl">
        <div className="mx-auto flex min-h-[74px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1">
              <img
                src="/logo.png"
                alt="RSRE"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden min-w-0 sm:block">
              <div className="text-sm font-black">RSRE</div>
              <div className="max-w-[260px] truncate text-xs text-slate-400">
                Research Support & Research Ecosystem
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <ArrowLeft size={15} />
              Public site
            </Link>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-slate-200 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] min-h-[calc(100vh-74px)]">
        <aside
          className={`fixed left-0 top-[74px] z-30 h-[calc(100vh-74px)] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto border-r border-white/10 bg-slate-950 p-4 text-white md:sticky md:block md:w-72 md:shrink-0 md:p-5 ${
            open ? "block" : "hidden"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Research workspace
            </div>
            <h2 className="mt-2 text-lg font-black">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Manage research activity, publication and ecosystem work.
            </p>
          </div>

          <nav className="mt-5 space-y-1">
            <Link
              href={dashboardUrl}
              onClick={() => setOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                active(dashboardUrl)
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                active("/profile")
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User size={17} />
              My Profile
            </Link>

            {role === "administrator" && (
              <>
                <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Administration
                </div>

                <Link
                  href="/dashboard/users"
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active("/dashboard/users")
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Users size={17} />
                  Users
                </Link>

                <Link
                  href="/dashboard/administrator/manuscripts"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <BookOpen size={17} />
                  Manuscript Management
                </Link>

                <Link
                  href="/dashboard/administrator/assign-reviewers"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <ClipboardList size={17} />
                  Assign Reviewers
                </Link>
              </>
            )}

            {role === "author" && (
              <>
                <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Author
                </div>

                <Link
                  href="/dashboard/author"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <BookOpen size={17} />
                  My Manuscripts
                </Link>
              </>
            )}

            {role === "reviewer" && (
              <>
                <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Reviewer
                </div>

                <Link
                  href="/dashboard/reviewer"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <ClipboardList size={17} />
                  Assigned Reviews
                </Link>
              </>
            )}

            {(role === "author" ||
              role === "reviewer" ||
              role === "editor" ||
              role === "editor_in_chief" ||
              role === "administrator") && (
              <>
                <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Research Ecosystem
                </div>

                <Link
                  href="/research-incubator"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <FlaskConical size={17} />
                  Research Incubator
                </Link>

                <Link
                  href="/research-passport"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <BarChart3 size={17} />
                  Research Passport
                </Link>

                <Link
                  href="/research-opportunities"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <BriefcaseBusiness size={17} />
                  Opportunities
                </Link>

                <Link
                  href="/editorial-board"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <ShieldCheck size={17} />
                  Editorial Board
                </Link>
              </>
            )}

            {(role === "editor" || role === "editor_in_chief") && (
              <>
                <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Editorial
                </div>

                <Link
                  href={
                    role === "editor_in_chief"
                      ? "/dashboard/editor-in-chief"
                      : "/dashboard/editor"
                  }
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <BookOpen size={17} />
                  Editorial Queue
                </Link>

                <Link
                  href={
                    role === "editor_in_chief"
                      ? "/dashboard/editor-in-chief/assign-reviewers"
                      : "/dashboard/editor/assign-reviewers"
                  }
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <ClipboardList size={17} />
                  Assign Reviewers
                </Link>
              </>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="mb-8">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
              RSRE workspace
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Rwanda Student Research Ecosystem · Research support,
              publication and learning workspace
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
