import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  title: string;
  roleRequired?: "administrator" | "author" | "reviewer" | "editor" | "editor_in_chief";
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

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("rmsjToken");
    const userRole = localStorage.getItem("rmsjRole");

    // No token
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Required role check
    if (roleRequired && userRole !== roleRequired) {
      router.replace("/");
      return;
    }

    // Normal role check
    if (role && userRole !== role) {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router, role, roleRequired]);

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("rmsjToken");
    localStorage.removeItem("rmsjRefresh");
    localStorage.removeItem("rmsjRole");
    localStorage.removeItem("rmsjUsername");
    localStorage.removeItem("rmsjFullName");

    window.dispatchEvent(
      new Event("rmsj-auth-changed")
    );

    router.replace("/");
  }

  // =====================================================
  // AUTHENTICATION LOADING
  // =====================================================

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-3xl mb-3">
            ⏳
          </div>

          <p className="text-lg text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD URL
  // =====================================================

  let dashboardUrl = "/dashboard/administrator";

  if (role === "author") {
    dashboardUrl = "/dashboard/author";
  }

  if (role === "reviewer") {
    dashboardUrl = "/dashboard/reviewer";
  }

  if (role === "editor") {
    dashboardUrl = "/dashboard/editor";
  }

  if (role === "editor_in_chief") {
    dashboardUrl = "/dashboard/editor-in-chief";
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f1f6fa]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071b34] shadow-xl shadow-slate-900/10">

        <div className="flex items-center justify-between px-6 py-4">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <img
              src="/logo.png"
              alt="RSJH"
              className="h-10 w-auto"
            />

            <div>
              <h1 className="font-bold text-white text-lg">
                RSJH
              </h1>

              <p className="text-xs text-blue-200">
                Rwanda Student Journal for Health
              </p>
            </div>

          </Link>


          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="
              md:hidden
              text-blue-900
              text-2xl
              font-bold
              px-2
            "
            aria-label="Open dashboard menu"
          >
            {open ? "✕" : "☰"}
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="flex min-h-[calc(100vh-73px)]">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`
            ${
              open
                ? "block"
                : "hidden"
            }

            md:block

            w-72

            bg-gradient-to-b
            from-blue-950
            to-green-900

            text-white

            min-h-[calc(100vh-73px)]

            p-6

            fixed
            md:static

            z-40

            left-0
            top-[73px]

            overflow-y-auto
          `}
        >

          {/* =================================================
              SIDEBAR HEADER
          ================================================= */}

          <div className="mb-8">

            <h2 className="text-xl font-bold">
              Research Platform
            </h2>

            <p className="text-blue-200 text-sm mt-2 leading-relaxed">
              Scientific communication for Rwanda
              and Africa
            </p>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="space-y-2">


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Link
              href={dashboardUrl}
              onClick={() => setOpen(false)}
              className={`
                block
                px-4
                py-3
                rounded-xl
                transition

                ${
                  router.pathname === dashboardUrl
                    ? "bg-white/20 font-bold"
                    : "hover:bg-white/10"
                }
              `}
            >
              ← Dashboard
            </Link>


            {/* =================================================
                PROFILE
            ================================================= */}

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={`
                block
                px-4
                py-3
                rounded-xl
                transition

                ${
                  router.pathname === "/profile"
                    ? "bg-white/20 font-bold"
                    : "hover:bg-white/10"
                }
              `}
            >
              👤 My Profile
            </Link>


            {/* =================================================
                ADMINISTRATION
            ================================================= */}

            {role === "administrator" && (
              <>

                <div className="pt-6 pb-2">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-blue-200
                    font-semibold
                  ">
                    Administration
                  </p>

                </div>


                {/* =================================================
                    USERS
                ================================================= */}

                <Link
                  href="/dashboard/users"
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      router.pathname ===
                      "/dashboard/users"
                        ? "bg-white/20 font-bold"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  👥 Users
                </Link>


                {/* =================================================
                    MANUSCRIPTS
                ================================================= */}

                <Link
                  href="/dashboard/administrator/manuscripts"
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      router.pathname ===
                      "/dashboard/administrator/manuscripts"
                        ? "bg-white/20 font-bold"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  📄 Manuscript Management
                </Link>


                {/* =================================================
                    ASSIGN REVIEWERS
                ================================================= */}

                <Link
                  href="/dashboard/administrator/assign-reviewers"
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      router.pathname ===
                      "/dashboard/administrator/assign-reviewers"
                        ? "bg-white/20 font-bold"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  👨‍⚕️ Assign Reviewers
                </Link>

              </>
            )}


            {/* =================================================
                AUTHOR
            ================================================= */}

            {role === "author" && (
              <>

                <div className="pt-6 pb-2">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-blue-200
                    font-semibold
                  ">
                    Author
                  </p>

                </div>

                <Link
                  href="/dashboard/author"
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      router.pathname ===
                      "/dashboard/author"
                        ? "bg-white/20 font-bold"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  📄 My Manuscripts
                </Link>

              </>
            )}


            {/* =================================================
                REVIEWER
            ================================================= */}

            {role === "reviewer" && (
              <>

                <div className="pt-6 pb-2">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-blue-200
                    font-semibold
                  ">
                    Reviewer
                  </p>

                </div>

                <Link
                  href="/dashboard/reviewer"
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      router.pathname ===
                      "/dashboard/reviewer"
                        ? "bg-white/20 font-bold"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  📝 Assigned Reviews
                </Link>

              </>
            )}


            {/* =================================================
                RESEARCH ECOSYSTEM
            ================================================= */}

            {(role === "author" || role === "reviewer" || role === "editor" || role === "editor_in_chief" || role === "administrator") && (
              <>
                <div className="pt-6 pb-2">
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                    Research Ecosystem
                  </p>
                </div>

                <Link
                  href="/research-incubator"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  💡 Research Incubator
                </Link>

                <Link
                  href="/research-passport"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  🪪 Research Passport
                </Link>

                <Link
                  href="/research-opportunities"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  🎯 Research Opportunities
                </Link>

                <Link
                  href="/editorial-board"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  🏛️ Editorial Board
                </Link>
              </>
            )}

            {/* =================================================
                EDITORIAL
            ================================================= */}

            {(role === "editor" || role === "editor_in_chief") && (
              <>
                <div className="pt-6 pb-2">
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                    Editorial
                  </p>
                </div>

                <Link
                  href={role === "editor_in_chief" ? "/dashboard/editor-in-chief" : "/dashboard/editor"}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  📋 Editorial Queue
                </Link>

                <Link
                  href={role === "editor_in_chief" ? "/dashboard/editor-in-chief/assign-reviewers" : "/dashboard/editor/assign-reviewers"}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  👨‍⚕️ Assign Reviewers
                </Link>
              </>
            )}

            {/* =================================================
                LOGOUT
            ================================================= */}

            <div className="pt-8">

              <button
                type="button"
                onClick={logout}
                className="
                  w-full
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                🚪 Logout
              </button>

            </div>

          </nav>

        </aside>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="
          flex-1
          p-6
          md:p-10
          min-w-0
        ">

          {/* PAGE TITLE */}

          <div className="mb-8">

            <h1 className="
              text-3xl
              md:text-4xl
              font-bold
              text-slate-900
            ">
              {title}
            </h1>

            <p className="
              text-gray-500
              mt-2
            ">
              Rwanda Student Journal for Health
              Management System
            </p>

          </div>


          {/* PAGE CONTENT */}

          {children}

        </main>

      </div>

    </div>
  );
}