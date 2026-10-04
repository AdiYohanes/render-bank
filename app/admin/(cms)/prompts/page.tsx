import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export default async function PromptsPage({ searchParams }: { searchParams: Promise<{ status?: string; access?: string; q?: string }> }) {
  const { client } = await requireAdmin(); const filters = await searchParams;
  let query = client.from("prompts").select("id,title,status,access_type,updated_at,categories(name),prompt_models(models(name))").order("updated_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status as never); if (filters.access) query = query.eq("access_type", filters.access as never); if (filters.q) query = query.ilike("title", `%${filters.q.replace(/[%_]/g, "")}%`);
  const { data, error } = await query; if (error) throw new Error("Prompt inventory is unavailable");
  return <><header className="admin-heading"><div><p className="eyebrow">Content</p><h1>Prompts</h1></div><Link className="button-primary" href="/admin/prompts/new">New prompt</Link></header>
    <form className="admin-filters"><input aria-label="Search prompts" defaultValue={filters.q} name="q" placeholder="Search prompts…" /><select aria-label="Status" defaultValue={filters.status} name="status"><option value="">All statuses</option>{["DRAFT","PUBLISHED","UNPUBLISHED","UNLISTED","ARCHIVED"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Access" defaultValue={filters.access} name="access"><option value="">All access</option><option value="FREE">Free</option><option value="PACK_ONLY">Premium</option></select><button className="button-secondary">Filter</button></form>
    <div className="admin-panel table-wrap"><table><thead><tr><th>Title</th><th>Status</th><th>Access</th><th>Category</th><th>Model</th><th>Updated</th><th>Action</th></tr></thead><tbody>{data.map((row)=><tr key={row.id}><td>{row.title}</td><td><span className="status-badge">{row.status}</span></td><td>{row.access_type === "FREE" ? "Free" : "Premium"}</td><td>{row.categories?.name}</td><td>{row.prompt_models.map(x=>x.models?.name).filter(Boolean).join(", ")}</td><td>{new Date(row.updated_at).toLocaleDateString()}</td><td><Link className="table-link" href={`/admin/prompts/${row.id}/edit`}>Edit</Link></td></tr>)}</tbody></table>{!data.length && <p className="empty-state">No prompts found. Create a prompt or clear the filters.</p>}</div></>;
}
