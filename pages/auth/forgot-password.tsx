import { useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import api from "../../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api.post("/auth/password-reset/", { email: email.trim() });
      setMessage(response.data?.message || "If an account exists for that email, a reset link has been sent.");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to request a password reset right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-xl">
          <img src="/logo.png" alt="RSJH" className="mx-auto h-16 w-16 object-contain" />
          <p className="mt-4 text-center text-xs font-black uppercase tracking-[0.18em] text-blue-700">Account recovery</p>
          <h1 className="mt-2 text-center text-3xl font-black text-slate-950">Forgot password?</h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-500">Enter the email associated with your RSJH account and we will send a secure password-reset link.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="rounded-xl border px-4 py-3 outline-none focus:border-blue-600" />
            </label>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          {message && <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">{message}</div>}

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/auth/login" className="font-semibold text-blue-700 hover:underline">Back to sign in</Link>
            <Link href="/auth/register" className="font-semibold text-slate-600 hover:text-slate-900">Create account</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
