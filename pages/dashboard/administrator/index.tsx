import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../utils/api";
import UsersManagement from "../../../components/admin/UsersManagement";

interface Article {
  id: number | string;
  title: string;
  status?: string;
  is_published?: boolean;
  author?: {
    username?: string;
    full_name?: string;
  };
}

interface User {
  id: number | string;
  username?: string;
  full_name?: string;
  role?: string;
}

interface Notification {
  id: number | string;
  title?: string;
  message?: string;
}

export default function AdministratorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [invitationRole, setInvitationRole] = useState<"reviewer" | "editor" | "editor_in_chief" | "partner">("reviewer");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [invitationError, setInvitationError] = useState("");
  const [publication, setPublication] = useState<any>(null);
  const [savingPublication, setSavingPublication] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        articlesRes,
        usersRes,
        notificationsRes,
        publicationRes,
      ] = await Promise.all([
        api.get("/articles/"),
        api.get("/users/"),
        api.get("/notifications/"),
        api.get("/publication-settings/"),
      ]);

      setArticles(
        articlesRes.data.results ||
          articlesRes.data ||
          []
      );

      setUsers(
        usersRes.data.results ||
          usersRes.data ||
          []
      );

      setNotifications(
        notificationsRes.data.results || notificationsRes.data || []
      );
      setPublication(publicationRes.data);
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    }
  }



  const published = articles.filter(
    (article) => article.is_published || article.status === "published"
  ).length;

  const submitted = articles.filter(
    (article) => article.status === "submitted"
  ).length;

  const reviewers = users.filter(
    (user) => user.role === "reviewer"
  ).length;

  return (
    <DashboardLayout
      role="administrator"
      roleRequired="administrator"
      title="Administrator Dashboard"
    >

      {/* =================================================
          TABS
      ================================================= */}

      <div className="flex gap-3 mb-8 flex-wrap">

        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          color="blue"
        >
          Overview
        </TabButton>

        <TabButton
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
          color="green"
        >
          Users
        </TabButton>

        <TabButton
          active={activeTab === "manuscripts"}
          onClick={() => setActiveTab("manuscripts")}
          color="purple"
        >
          Manuscripts
        </TabButton>

        <TabButton
          active={activeTab === "assign-reviewer"}
          onClick={() =>
            setActiveTab("assign-reviewer")
          }
          color="indigo"
        >
          Assign Reviewer
        </TabButton>

        <TabButton active={activeTab === "invitations"} onClick={() => setActiveTab("invitations")} color="orange">
          Invitations & Contacts
        </TabButton>
        <TabButton active={activeTab === "publication"} onClick={() => setActiveTab("publication")} color="green">
          Publication Settings
        </TabButton>

      </div>


      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === "overview" && (
        <div>

          <div className="grid md:grid-cols-4 gap-5">

            <Card
              title="Total Articles"
              value={articles.length}
            />

            <Card
              title="Published"
              value={published}
            />

            <Card
              title="Submitted"
              value={submitted}
            />

            <Card
              title="Reviewers"
              value={reviewers}
            />

          </div>


          {/* Recent manuscripts */}

          <div className="
            bg-white
            rounded-xl
            shadow
            p-6
            mt-8
          ">

            <h2 className="
              text-2xl
              font-bold
              mb-5
            ">
              Recent Manuscripts
            </h2>

            {articles.length === 0 ? (
              <p className="text-gray-500">
                No manuscripts found.
              </p>
            ) : (
              <div className="space-y-4">

                {articles
                  .slice(0, 10)
                  .map((article) => (
                    <div
                      key={article.id}
                      className="border-b pb-4"
                    >

                      <h3 className="font-bold">
                        {article.title}
                      </h3>

                      <p className="text-gray-600">
                        Status:{" "}
                        <span className="font-semibold">
                          {article.status ||
                            "Unknown"}
                        </span>
                      </p>

                    </div>
                  ))}

              </div>
            )}

          </div>


          <div className="grid gap-6 md:grid-cols-2 mt-8">
            <div className="bg-white rounded-xl shadow p-6 border border-violet-100">
              <h2 className="text-2xl font-bold mb-2">Editorial Governance</h2>
              <p className="text-gray-600 mb-5">Add Editor-in-Chief, editors, board members, fellows and advisors with profiles and biographies.</p>
              <Link href="/dashboard/administrator/editorial-board" className="inline-flex bg-violet-700 hover:bg-violet-800 text-white px-6 py-3 rounded-xl font-semibold">
                Open Editorial Board Management →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-emerald-100">
              <h2 className="text-2xl font-bold mb-2">Partners & Supporters</h2>
              <p className="text-gray-600 mb-5">Add real funders, academic partners, hospitals, technology partners and other approved supporters. Their logos and descriptions can appear on the public About page.</p>
              <Link href="/dashboard/administrator/partners" className="inline-flex bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold">
                Manage Partners →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
              <h2 className="text-2xl font-bold mb-2">Founding Team</h2>
              <p className="text-gray-600 mb-5">Manage verified founder and co-founder names, roles, biographies, photos and publication status shown on the About page.</p>
              <Link href="/dashboard/administrator/founding-team" className="inline-flex bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold">
                Manage Founding Team →
              </Link>
            </div>
          </div>




        </div>
      )}


          {/* Invitations & Contacts */}
          {activeTab === "invitations" && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-2">Invitations & Contacts</h2>
              <p className="text-gray-600 mb-6">Invite reviewers, editors, the Editor-in-Chief and partners by email.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Contact name" className="border rounded-xl p-3" />
                <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="Contact email" className="border rounded-xl p-3" />
                <select value={invitationRole} onChange={e=>setInvitationRole(e.target.value as any)} className="border rounded-xl p-3">
                  <option value="reviewer">Reviewer</option><option value="editor">Editor</option><option value="editor_in_chief">Editor-in-Chief</option><option value="partner">Partner</option>
                </select>
                <input value={organization} onChange={e=>setOrganization(e.target.value)} placeholder="Organisation (required for partners)" className="border rounded-xl p-3" />
              </div>
              <button disabled={sendingInvitation} onClick={async()=>{
                setSendingInvitation(true); setInvitationMessage(""); setInvitationError("");
                try { const r=await api.post("/invitations/send/",{role:invitationRole,contact_name:contactName,email:contactEmail,organization}); setInvitationMessage(r.data.message); setContactName(""); setContactEmail(""); setOrganization(""); }
                catch(e:any){ setInvitationError(e.response?.data?.detail || "Unable to send invitation email."); }
                finally { setSendingInvitation(false); }
              }} className="mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold">
                {sendingInvitation ? "Sending..." : "Send Invitation Email"}
              </button>
              {invitationMessage && <p className="mt-4 bg-green-50 text-green-700 p-4 rounded-xl">{invitationMessage}</p>}
              {invitationError && <p className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl">{invitationError}</p>}
            </div>
          )}

          {/* Publication Settings */}
          {activeTab === "publication" && publication && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-2">Publication Settings</h2>
              <p className="text-gray-600 mb-6">Configure the journal once. Publication metadata is assigned automatically when an article is accepted.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {([['current_volume','Current Volume'],['current_issue','Current Issue'],['publication_year','Publication Year'],['next_article_number','Next Article Number'],['journal_code','Journal Code'],['doi_prefix','Official DOI Prefix']] as any[]).map(([key,label])=><label key={key} className="block"><span className="block text-sm font-semibold mb-1">{label}</span><input value={publication[key] ?? ""} onChange={e=>setPublication({...publication,[key]:e.target.value})} className="border rounded-xl p-3 w-full" placeholder={key==='doi_prefix'?'Leave empty until RSJH has an official DOI prefix':''}/></label>)}
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-6">
                {([['automatic_numbering','Automatic article numbering'],['automatic_volume_issue','Automatic volume/issue assignment'],['automatic_citation','Automatic citation metadata'],['automatic_doi','Automatic DOI generation']] as any[]).map(([key,label])=><label key={key} className="flex items-center gap-3"><input type="checkbox" checked={!!publication[key]} onChange={e=>setPublication({...publication,[key]:e.target.checked})}/>{label}</label>)}
              </div>
              <button disabled={savingPublication} onClick={async()=>{setSavingPublication(true); try{const r=await api.patch("/publication-settings/",publication);setPublication(r.data);}finally{setSavingPublication(false);}}} className="mt-6 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold">{savingPublication?"Saving...":"Save Publication Settings"}</button>
            </div>
          )}


      {/* =================================================
          USERS
      ================================================= */}

      {activeTab === "users" && (
        <UsersManagement />
      )}


      {/* =================================================
          MANUSCRIPTS
      ================================================= */}

      {activeTab === "manuscripts" && (
        <div className="
          bg-white
          rounded-xl
          shadow
          p-6
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-5
          ">
            Manuscript Management
          </h2>

          <p className="text-gray-600 mb-6">
            Manage submitted manuscripts,
            view PDFs and assign reviewers.
          </p>

          <LinkButton
            href="/dashboard/administrator/manuscripts"
            color="purple"
          >
            Open Manuscript Management
          </LinkButton>

        </div>
      )}


      {/* =================================================
          ASSIGN REVIEWER
      ================================================= */}

      {activeTab === "assign-reviewer" && (
        <div className="
          bg-white
          rounded-xl
          shadow
          p-6
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-3
          ">
            Assign Reviewers
          </h2>

          <p className="text-gray-600 mb-6">
            Select a manuscript and assign
            an approved reviewer.
          </p>

          <LinkButton
            href="/dashboard/administrator/assign-reviewers"
            color="indigo"
          >
            Open Reviewer Assignment
          </LinkButton>

        </div>
      )}

    </DashboardLayout>
  );
}


/* =====================================================
   TAB BUTTON
===================================================== */

function TabButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue:
      "bg-blue-600 hover:bg-blue-700",

    green:
      "bg-green-600 hover:bg-green-700",

    purple:
      "bg-purple-600 hover:bg-purple-700",

    indigo:
      "bg-indigo-600 hover:bg-indigo-700",

    orange:
      "bg-orange-600 hover:bg-orange-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-5
        py-2
        rounded-xl
        text-white
        font-semibold
        transition
        ${colors[color]}
        ${
          active
            ? "ring-2 ring-offset-2 ring-slate-400"
            : ""
        }
      `}
    >
      {children}
    </button>
  );
}


/* =====================================================
   LINK BUTTON
===================================================== */

function LinkButton({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    purple:
      "bg-purple-600 hover:bg-purple-700",

    indigo:
      "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <Link
      href={href}
      className={`
        inline-block
        ${colors[color]}
        text-white
        px-5
        py-3
        rounded-xl
        font-semibold
      `}
    >
      {children}
    </Link>
  );
}


/* =====================================================
   CARD
===================================================== */

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="
      bg-white
      shadow
      rounded-xl
      p-5
    ">

      <h3 className="text-gray-600">
        {title}
      </h3>

      <h1 className="
        text-3xl
        font-bold
        mt-2
      ">
        {value}
      </h1>

    </div>
  );
}