import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";

export default async function Dashboard() {
  const { client } = await requireAdmin();
  const [prompts, published, drafts, packs] = await Promise.all([
    client.from("prompts").select("*", { count: "exact", head: true }),
    client.from("prompts").select("*", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    client.from("prompts").select("*", { count: "exact", head: true }).eq("status", "DRAFT"),
    client.from("packs").select("*", { count: "exact", head: true }).in("status", ["PUBLISHED", "UNLISTED"]),
  ]);
  if ([prompts, published, drafts, packs].some((result) => result.error)) throw new Error("Admin dashboard is unavailable");
  const stats = [["Total prompts", prompts.count ?? 0], ["Published", published.count ?? 0],
    ["Drafts", drafts.count ?? 0], ["Active packs", packs.count ?? 0]] as const;
  return <><header className="admin-heading"><div><p className="eyebrow">Overview</p><h1>Dashboard</h1></div>
    <div className="actions"><Link className="button-primary" href="/admin/prompts/new">New prompt</Link>
      <Link className="button-secondary" href="/admin/packs/new">New pack</Link></div></header>
    <section className="stat-grid">{stats.map(([label, value]) => <article className="admin-panel stat-card" key={label}>
      <span>{label}</span><strong>{value}</strong></article>)}</section></>;
}
