import Link from 'next/link'
import type { UserRole } from './ProtectedRoute'
const links: Record<UserRole, Array<{ href: string, label: string }>> = {
  administrator: [
    { href: '/dashboard/administrator', label: 'Overview' },
    { href: '/dashboard/administrator/editorial-board', label: 'Editorial Board' },
    { href: '/dashboard/administrator/manuscripts', label: 'Manuscripts' },
    { href: '/dashboard/administrator/assign-reviewers', label: 'Assign Reviewers' },
  ],
  editor: [{ href: "/dashboard/editor", label: "Editorial workflow" }, { href: "/dashboard/administrator/assign-reviewers", label: "Assign reviewers" }],
  editor_in_chief: [{ href: "/dashboard/editor-in-chief", label: "Final editorial authority" }, { href: "/editorial-board", label: "Editorial Board" }],
  reviewer: [{ href: '/dashboard/reviewer', label: 'Assigned reviews' }, { href: '/dashboard/reviewer', label: 'Recommendations' }],
  author: [{ href: '/dashboard/author', label: 'My manuscripts' }, { href: '/submit', label: 'Submit manuscript' }],
  reader: [{ href: '/dashboard/reader', label: 'Bookmarks' }, { href: '/articles', label: 'Browse articles' }],
}
export default function Sidebar({ role }: { role: UserRole }) { return <aside className="rounded-[2rem] bg-slate-950 p-6 text-slate-200"><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{role.replace('_', ' ')}</p><nav className="mt-5 grid gap-2">{links[role].map((link) => <Link key={link.label} href={link.href} className="rounded-2xl px-4 py-3 hover:bg-slate-800 hover:text-white">{link.label}</Link>)}</nav></aside> }
