import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../utils/api";

const ROLE_OPTIONS = [
  ["Editor-in-Chief", "Editor-in-Chief"],
  ["Managing Editor", "Managing Editor"],
  ["Section Editor", "Section Editor"],
  ["Associate Editor", "Associate Editor"],
  ["Editorial Board Member", "Editorial Board Member"],
  ["Student Editorial Fellow", "Student Editorial Fellow"],
  ["Advisory Board Member", "Advisory Board Member"],
];

export default function AdminEditorialBoard() {
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ user: "", board_role: "Editorial Board Member", specialty: "", bio: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [boardRes, usersRes] = await Promise.all([
      api.get("/editorial-board/"),
      api.get("/users/")
    ]);
    setMembers(boardRes.data?.results || boardRes.data || []);
    setUsers(usersRes.data?.results || usersRes.data || []);
  }

  useEffect(() => { load().catch(() => setMessage("Could not load the editorial board.")); }, []);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      if (!form.user) { setMessage("Select a user first."); return; }
      const payload = {
        user: Number(form.user),
        board_role: form.board_role,
        specialty: form.specialty,
        bio: form.bio,
        active: true,
      };
      await api.post("/editorial-board/", payload);
      setForm({ user: "", board_role: "Editorial Board Member", specialty: "", bio: "" });
      setMessage("Editorial profile added successfully.");
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || JSON.stringify(error?.response?.data || "Could not add profile."));
    } finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm("Remove this editorial profile from the public board?")) return;
    try { await api.delete(`/editorial-board/${id}/`); await load(); }
    catch (error: any) { setMessage(error?.response?.data?.detail || "Could not remove profile."); }
  }

  return (
    <DashboardLayout role="administrator" title="Editorial Board Management">
      <main className="rsjh-section">
        <div className="rsjh-page">
          <div className="mb-8">
            <p className="rsjh-eyebrow text-violet-700">JOURNAL GOVERNANCE</p>
            <h1 className="text-4xl font-black text-slate-950 mt-2">Editorial Board Management</h1>
            <p className="text-slate-600 mt-3 max-w-3xl">Build the public editorial structure one profile at a time. Choose the RSJH user, assign the governance role, add specialty and biography, then publish the profile.</p>
          </div>

          {message && <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4">{message}</div>}

          <form onSubmit={add} className="rsjh-card p-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-800">Person</label>
              <select required value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="mt-2 border rounded-xl p-3 w-full bg-white">
                <option value="">Select an existing RSJH user</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.username} — {u.role}</option>)}
              </select>
              <p className="text-xs text-slate-500 mt-1">The person's profile photo and identity come from their RSJH account.</p>
            </div>
            <div>
              <label className="font-bold text-slate-800">Governance role</label>
              <select value={form.board_role} onChange={(e) => setForm({ ...form, board_role: e.target.value })} className="mt-2 border rounded-xl p-3 w-full bg-white">
                {ROLE_OPTIONS.map(([v, l]) => <option value={v} key={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800">Specialty / discipline</label>
              <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Public Health, Paediatrics, Surgery..." className="mt-2 border rounded-xl p-3 w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-800">Editorial biography</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Academic background, research experience, editorial responsibilities..." rows={6} className="mt-2 border rounded-xl p-3 w-full" />
            </div>
            <button disabled={busy} className="md:col-span-2 rounded-xl bg-slate-950 text-white px-5 py-3 font-black disabled:opacity-50">{busy ? "Saving..." : "Add editorial profile"}</button>
          </form>

          <section className="mt-10">
            <h2 className="text-2xl font-black">Current editorial structure</h2>
            <div className="mt-5 grid gap-4">
              {members.length === 0 && <div className="rsjh-card p-6 text-slate-500">No active editorial profiles yet.</div>}
              {members.map((m) => <article key={m.id} className="rsjh-card p-5 flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  {m.user_profile?.profile_picture ? <img src={m.user_profile.profile_picture} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">{(m.user_profile?.full_name || m.user_profile?.username || "?").slice(0,1).toUpperCase()}</div>}
                  <div><div className="font-black text-slate-950">{m.user_profile?.full_name || m.user_profile?.username}</div><div className="text-sm text-violet-700 font-bold">{m.board_role}</div><div className="text-sm text-slate-500 mt-1">{m.specialty || m.user_profile?.university || "Institution not yet added"}</div>{m.bio && <p className="text-sm text-slate-600 mt-2 max-w-2xl">{m.bio}</p>}</div>
                </div>
                <button onClick={() => remove(m.id)} className="rounded-xl border border-red-200 px-4 py-2 text-red-700 font-bold">Remove</button>
              </article>)}
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
