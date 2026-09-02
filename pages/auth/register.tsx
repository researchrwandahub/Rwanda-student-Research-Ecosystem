import { useState, ChangeEvent, FormEvent } from "react";
import api from "../../utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";

const editorialRoles = new Set(["reviewer", "editor", "editor_in_chief"]);

const roleHelp: Record<string, string> = {
  author: "Submit research ideas and manuscripts.",
  reviewer: "Review manuscripts by invitation.",
  editor: "Screen manuscripts and manage peer review by invitation.",
  editor_in_chief: "Lead the journal's scientific and final editorial decisions by appointment.",
};

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", other_names: "", last_name: "", username: "", email: "", password: "", password2: "", role: "author", invitation_code: "",
    university: "", department: "", discipline: "medicine", academic_stage: "undergraduate", orcid: "", biography: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    if (form.password !== form.password2) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordChecks = [
      [form.password.length >= 8, "Password must be at least 8 characters long."],
      [/[A-Z]/.test(form.password), "Password must contain at least one uppercase letter."],
      [/[a-z]/.test(form.password), "Password must contain at least one lowercase letter."],
      [/\d/.test(form.password), "Password must contain at least one number."],
      [/[^A-Za-z0-9]/.test(form.password), "Password must contain at least one special character."],
      [!form.username.trim() || !form.password.toLowerCase().includes(form.username.trim().toLowerCase()), "Password must not contain your username."],
    ] as const;
    const failedPasswordCheck = passwordChecks.find(([valid]) => !valid);
    if (failedPasswordCheck) {
      setMessage(failedPasswordCheck[1]);
      setLoading(false);
      return;
    }

    if (editorialRoles.has(form.role) && !form.invitation_code.trim()) {
      setMessage("Editorial roles require an invitation code from the RSJH administration.");
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        first_name: form.first_name, other_names: form.other_names, last_name: form.last_name,
        username: form.username, email: form.email, password: form.password, role: form.role,
        invitation_code: form.invitation_code || undefined,
        university: form.university, department: form.department,
        discipline: form.discipline, academic_stage: form.academic_stage,
      };

      await api.post("/auth/register/", registerData);
      setMessage("Registration successful. Check your email to verify your RSJH account before signing in.");
      await router.push(`/auth/login?registered=1&role=${encodeURIComponent(form.role)}`);
    } catch (error: any) {
      const errors = error.response?.data;
      const firstError = errors && typeof errors === "object"
        ? Object.values(errors).flat()[0]
        : errors;
      setMessage(typeof firstError === "string" ? firstError : "Registration failed. Please review your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  const isEditorial = editorialRoles.has(form.role);

  return (
    <Layout>
      <section className="min-h-screen bg-cover bg-center relative py-12" style={{ backgroundImage: "url('/images/register-bg.png')" }}>
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative z-10 rsjh-page">
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-white/95 backdrop-blur shadow-2xl p-7 md:p-10">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
              <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-200"><img src="/logo.png" alt="RSJH" className="h-14 w-14 object-contain" /></div>
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">RSJH MEMBERSHIP</p><h1 className="text-3xl font-black text-slate-950">Create your RSJH account</h1><p className="mt-1 text-slate-500">Join a research ecosystem built around students, peer review and publication.</p></div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 mt-7">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-slate-900">Identity</h2>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-800">Official First Name<input name="first_name" value={form.first_name} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-800">Other Name(s)<span className="font-normal text-slate-400">optional</span><input name="other_names" value={form.other_names} onChange={handleChange} className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-800">Last Name<input name="last_name" value={form.last_name} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-800">Username<input name="username" value={form.username} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-800 md:col-span-2">Email<input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                </div>
              </div>

              <div>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Account type<select name="role" value={form.role} onChange={handleChange} className="w-full rounded-xl border px-4 py-3">
                  <option value="author">Author / Student</option>
                  <option value="reviewer">Reviewer — invitation only</option>
                  <option value="editor">Editor — invitation only</option>
                  <option value="editor_in_chief">Editor-in-Chief — appointment only</option>
                </select></label>
                <p className="mt-2 text-sm text-slate-500">{roleHelp[form.role]}</p>
              </div>

              {isEditorial && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Invitation / appointment code<input name="invitation_code" value={form.invitation_code} onChange={handleChange} required className="w-full rounded-xl border border-amber-300 bg-white px-4 py-3 font-normal" placeholder="Enter the code provided by RSJH" /></label>
                <p className="mt-2 text-xs text-amber-800">Editorial accounts cannot be created without an authorized invitation code.</p>
              </div>}

              <div className="grid md:grid-cols-2 gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Password<input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Confirm password<input type="password" name="password2" value={form.password2} onChange={handleChange} required className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
              </div>
              <p className="-mt-4 text-xs text-slate-500">Use at least 8 characters with uppercase and lowercase letters, a number, and a special character. Do not include your username.</p>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">University<input name="university" value={form.university} onChange={handleChange} className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Department<input name="department" value={form.department} onChange={handleChange} className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Health discipline<select name="discipline" value={form.discipline} onChange={handleChange} className="w-full border rounded-xl p-3 font-normal">
                  <option value="medicine">Medicine</option><option value="pharmacy">Pharmacy</option><option value="dentistry">Dentistry / Dental Surgery</option><option value="nursing">Nursing</option><option value="public_health">Public Health</option><option value="clinical_psychology">Clinical Psychology</option><option value="biomedical_sciences">Biomedical Sciences</option><option value="health_informatics">Health Informatics</option><option value="health_communication">Health Communication & Journalism</option>
                </select></label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Academic stage<select name="academic_stage" value={form.academic_stage} onChange={handleChange} className="w-full border rounded-xl p-3 font-normal">
                  <option value="undergraduate">Undergraduate</option><option value="postgraduate">Postgraduate</option><option value="early_career">Early-career researcher</option><option value="faculty">Faculty / Supervisor</option><option value="professional">Health professional</option>
                </select></label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">ORCID <span className="font-normal text-slate-400">optional</span><input name="orcid" value={form.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">Short biography<textarea name="biography" value={form.biography} onChange={handleChange} rows={3} className="w-full rounded-xl border px-4 py-3 font-normal" /></label>
              </div>

              <button disabled={loading} className="rsjh-button-green w-full py-3 disabled:opacity-50">{loading ? "Creating account..." : "Create RSJH account"}</button>
            </form>

            {message && <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 break-words">{message}</div>}
            <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm"><span className="text-slate-500">Already have an account?</span><Link href="/auth/login" className="font-bold text-blue-700">Sign in</Link></div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
