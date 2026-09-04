import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

const roleGroups = [
  { key: "editor_in_chief", title: "Editor-in-Chief", eyebrow: "FINAL EDITORIAL AUTHORITY", tone: "border-amber-200 bg-amber-50" },
  { key: "editor", title: "Editors & Section Editors", eyebrow: "EDITORIAL LEADERSHIP", tone: "border-blue-200 bg-blue-50" },
  { key: "reviewer", title: "Editorial Board & Reviewers", eyebrow: "SCHOLARLY REVIEW", tone: "border-emerald-200 bg-emerald-50" },
  { key: "other", title: "Student Editorial Fellows & Advisors", eyebrow: "RESEARCH COMMUNITY", tone: "border-violet-200 bg-violet-50" },
];

export default function EditorialBoard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/editorial-board/")
      .then((res) => setMembers(res.data?.results || res.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const by = { editor_in_chief: [], editor: [], reviewer: [], other: [] };
    members.forEach((member) => {
      const role = member.user_profile?.role || "";
      if (role === "editor_in_chief") by.editor_in_chief.push(member);
      else if (role === "editor") by.editor.push(member);
      else if (role === "reviewer") by.reviewer.push(member);
      else by.other.push(member);
    });
    return by;
  }, [members]);

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 text-white py-16">
          <div className="rsjh-page">
            <p className="rsjh-eyebrow text-emerald-300">RSJH GOVERNANCE</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Editorial Board</h1>
            <p className="mt-4 max-w-3xl text-blue-100 leading-8">A transparent editorial structure from student editorial participation to the Editor-in-Chief, with roles and expertise displayed as the journal grows.</p>
          </div>
        </section>

        <section className="rsjh-section">
          <div className="rsjh-page">
            <div className="grid gap-4 md:grid-cols-4">
              {roleGroups.map((group, i) => (
                <div key={group.key} className={`rounded-2xl border p-5 ${group.tone}`}>
                  <div className="text-[11px] font-black tracking-[0.16em] text-slate-500">0{i + 1}</div>
                  <h2 className="mt-3 font-black text-slate-950">{group.title}</h2>
                  <p className="mt-2 text-xs font-bold text-slate-600">{group.eyebrow}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-end justify-between gap-4">
              <div>
                <p className="rsjh-eyebrow text-blue-700">CURRENT STRUCTURE</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Meet the editorial team</h2>
              </div>
              <p className="hidden text-sm text-slate-500 md:block">Profiles can be added and updated as the board is appointed.</p>
            </div>

            {loading ? (
              <div className="mt-7 rounded-3xl bg-white border p-8 text-slate-500">Loading editorial profiles...</div>
            ) : members.length === 0 ? (
              <div className="mt-7 rounded-3xl bg-white border p-8">
                <h3 className="text-xl font-black text-slate-950">Editorial profiles are being established.</h3>
                <p className="mt-3 max-w-2xl text-slate-600 leading-7">The structure is ready. Once appointments are added by the journal administration, each profile can show the member's role, institution, specialty and academic background.</p>
              </div>
            ) : (
              roleGroups.map((group) => (
                <section key={group.key} className="mt-10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-950">{group.title}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{grouped[group.key].length}</span>
                  </div>
                  {grouped[group.key].length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">No public profiles have been added to this section yet.</div>
                  ) : (
                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {grouped[group.key].map((member) => (
                        <article key={member.id} className="rsjh-card p-6">
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                              {member.user_profile?.profile_picture ? <img src={member.user_profile.profile_picture} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl font-black text-slate-500">{(member.user_profile?.full_name || member.user_profile?.username || "R").charAt(0).toUpperCase()}</div>}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-slate-950">{member.user_profile?.full_name || member.user_profile?.username || "Editorial member"}</h4>
                              <p className="mt-1 text-sm font-bold text-blue-700">{member.board_role || member.user_profile?.role?.replace(/_/g, " ")}</p>
                              {member.specialty && <p className="mt-1 text-xs text-slate-500">{member.specialty}</p>}
                            </div>
                          </div>
                          <p className="mt-5 text-sm leading-7 text-slate-600">{member.bio || "Academic and editorial profile to be added."}</p>
                          {member.user_profile?.university && <p className="mt-4 text-xs font-semibold text-slate-500">{member.user_profile.university}</p>}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))
            )}
          </div>
        </section>

        <section className="bg-white border-y border-slate-200 py-16">
          <div className="rsjh-page grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="rsjh-eyebrow text-emerald-700">EDITORIAL INDEPENDENCE</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Technology supports the journal. Editors govern the scholarship.</h2>
              <p className="mt-4 max-w-3xl text-slate-600 leading-8">The editorial board controls scope, peer review, editorial decisions and publication standards. RSRE provides the supporting publication workflow.</p>
            </div>
            <a href="mailto:researchrwandahub@gmail.com" className="rsjh-button-green">Contact Editorial Office</a>
          </div>
        </section>
      </main>
    </Layout>
  );
}
