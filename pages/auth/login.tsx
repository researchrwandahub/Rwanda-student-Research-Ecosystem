import { useState } from "react";
import api from "../../utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";

export default function Login() {
  const router = useRouter();
  const requestedRole = typeof router.query.role === "string" ? router.query.role : "";

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = requestedRole === "editor_in_chief" ? "Editor-in-Chief" : requestedRole === "editor" ? "Editor" : requestedRole === "reviewer" ? "Reviewer" : "RSJH member";

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Clear previous error when user starts typing again
    if (message) {
      setMessage("");
    }
  }

  // =========================================================
  // CLEAR AUTH DATA
  // =========================================================

  function clearAuthentication() {
    localStorage.removeItem("rmsjToken");
    localStorage.removeItem("rmsjRefresh");
    localStorage.removeItem("rmsjRole");
    localStorage.removeItem("rmsjUsername");
    localStorage.removeItem("rmsjFullName");
    localStorage.removeItem("rmsjUser");
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    // Make absolutely sure old authentication is gone
    clearAuthentication();

    try {
      // =====================================================
      // REQUEST LOGIN
      // =====================================================

      const response = await api.post(
        "/auth/token/",
        {
          username: form.username.trim(),
          password: form.password,
        }
      );

      // =====================================================
      // GET TOKENS
      // =====================================================

      const access = response.data?.access;
      const refresh = response.data?.refresh;

      // If backend somehow returns no access token,
      // do NOT continue to dashboard.
      if (!access) {
        throw new Error(
          "No access token returned."
        );
      }

      // =====================================================
      // DECODE JWT
      // =====================================================

      let payload: any;

      try {
        payload = JSON.parse(
          atob(access.split(".")[1])
        );
      } catch (decodeError) {
        console.error(
          "Could not decode JWT:",
          decodeError
        );

        throw new Error(
          "Invalid authentication token."
        );
      }

      // =====================================================
      // GET USER INFORMATION
      // =====================================================

      const role =
        payload.role || "author";

      const username =
        payload.username ||
        form.username.trim();

      const fullName =
        payload.full_name || "";

      if (requestedRole && requestedRole !== role) {
        clearAuthentication();
        setMessage(`This account is registered as ${role.replace(/_/g, " ")}, not ${requestedRole.replace(/_/g, " ")}. Use the correct RSJH sign-in option.`);
        return;
      }

      const accountStatus =
        payload.account_status ||
        "active";

      // =====================================================
      // SECOND SAFETY CHECK
      // =====================================================
      //
      // If the backend accidentally issues a token for
      // a suspended account, DO NOT allow the user into
      // the application.
      //
      // =====================================================

      if (
        accountStatus !== "active"
      ) {
        clearAuthentication();

        setMessage(
          "Your RSJH account has been suspended. Please contact an administrator."
        );

        return;
      }

      // =====================================================
      // SAVE AUTHENTICATION
      // =====================================================

      localStorage.setItem(
        "rmsjToken",
        access
      );

      if (refresh) {
        localStorage.setItem(
          "rmsjRefresh",
          refresh
        );
      }

      // =====================================================
      // SAVE BASIC USER INFORMATION
      // =====================================================

      localStorage.setItem(
        "rmsjRole",
        role
      );

      localStorage.setItem(
        "rmsjUsername",
        username
      );

      localStorage.setItem(
        "rmsjFullName",
        fullName
      );

      // Profile hydration happens after redirect so login is not blocked by a second API request.
      api.get("/profile/").then((profileResponse) => {
        localStorage.setItem("rmsjUser", JSON.stringify(profileResponse.data));
        window.dispatchEvent(new Event("rmsj-auth-changed"));
      }).catch(() => {
        window.dispatchEvent(new Event("rmsj-auth-changed"));
      });

      window.dispatchEvent(new Event("rmsj-auth-changed"));

      // =====================================================
      // REDIRECT ONLY AFTER EVERYTHING IS SUCCESSFUL
      // =====================================================

      if (
        role === "administrator"
      ) {
        await router.replace(
          "/dashboard/admin"
        );

        return;
      }

      if (
        role === "author"
      ) {
        await router.replace(
          "/dashboard/author"
        );

        return;
      }

      if (role === "reviewer") {
        await router.replace("/dashboard/reviewer");
        return;
      }

      if (role === "editor") {
        await router.replace("/dashboard/editor");
        return;
      }

      if (role === "editor_in_chief") {
        await router.replace("/dashboard/editor-in-chief");
        return;
      }

      // Reader / other role
      await router.replace("/");

    } catch (error: any) {

      console.error(
        "LOGIN ERROR:",
        error?.response?.data ||
        error
      );

      // =====================================================
      // NEVER KEEP TOKENS AFTER FAILED LOGIN
      // =====================================================

      clearAuthentication();

      // =====================================================
      // GET BACKEND ERROR
      // =====================================================

      const backendError =
        error?.response?.data;

      let errorMessage =
        "Invalid username or password.";

      // =====================================================
      // SUSPENDED ACCOUNT
      // =====================================================

      if (
        backendError?.detail
      ) {
        errorMessage =
          backendError.detail;
      }

      // Sometimes DRF/SimpleJWT can return:
      //
      // {
      //   "non_field_errors": [...]
      // }
      //
      if (
        backendError?.non_field_errors &&
        Array.isArray(
          backendError.non_field_errors
        )
      ) {
        errorMessage =
          backendError.non_field_errors[0];
      }

      // =====================================================
      // DISPLAY ERROR ON LOGIN PAGE
      // =====================================================

      setMessage(errorMessage);

      // IMPORTANT:
      //
      // There is NO router.push()
      // There is NO router.replace()
      //
      // Therefore the user stays on /auth/login.
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <Layout>
      <section
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-cover
          bg-center
          px-4
        "
        style={{
          backgroundImage:
            "url('/images/login-bg.jpg')",
        }}
      >
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-8
            w-full
            max-w-md
          "
        >

          {/* =================================================
              LOGO
          ================================================= */}

          <img
            src="/logo.png"
            alt="RSJH"
            className="
              h-20
              mx-auto
              mb-4
            "
          />

          {/* =================================================
              TITLE
          ================================================= */}

          <h1
            className="
              text-3xl
              font-bold
              text-center
              text-blue-900
            "
          >
            RSJH
          </h1>

          <p
            className="
              text-center
              text-gray-600
              mb-6
            "
          >
            Rwanda Student Journal for Health
          </p>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {message && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-300
                bg-red-50
                px-4
                py-4
                text-red-700
                text-sm
                font-medium
                text-center
              "
            >
              {message}
            </div>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
          >

            {/* USERNAME */}

            <div>
              <label
                className="font-semibold"
              >
                Username
              </label>

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  mt-1
                  outline-none
                  focus:border-blue-600
                "
                required
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                className="font-semibold"
              >
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  mt-1
                  outline-none
                  focus:border-blue-600
                "
                required
              />
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                bg-blue-700
                hover:bg-blue-800
                disabled:bg-gray-400
                text-white
                rounded-xl
                py-3
                font-semibold
                transition
              "
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>
      <div className="mt-6 border-t pt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Editorial access</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/auth/login?role=editor" className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Editor</Link>
          <Link href="/auth/login?role=editor_in_chief" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100">Editor-in-Chief</Link>
        </div>
      </div>

          {/* =================================================
              REGISTRATION
          ================================================= */}

          <div className="mt-6 border-t pt-5 text-center">
            <Link href="/auth/forgot-password" className="font-semibold text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <p
            className="
              text-sm
              text-gray-500
              text-center
              mt-5
            "
          >
            Articles are publicly available.
            Reviewer accounts require an RSJH
            invitation.
          </p>

        </div>
      </section>
    </Layout>
  );
}