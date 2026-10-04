import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | RenderBank Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="wordmark" href="/admin/dashboard">RenderBank</Link>
    <p>{profile.display_name || "Administrator"}</p><nav aria-label="Admin navigation">
      <Link href="/admin/dashboard">Dashboard</Link><Link href="/admin/prompts">Prompts</Link><Link href="/admin/packs">Packs</Link>
      <Link href="/admin/categories">Categories</Link>
    </nav><form action={logout}><button className="button-secondary" type="submit">Log out</button></form></aside>
    <main id="main" className="admin-main">{children}</main></div>;
}
