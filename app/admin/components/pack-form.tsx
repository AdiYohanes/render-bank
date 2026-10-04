import Link from "next/link";
import { savePack } from "@/lib/admin/actions";
import { PackMembers } from "./pack-members";

export function PackForm({ pack, prompts, error, saved }: { pack?: any; prompts: any[]; error?: string; saved?: string }) {
  const selected = [...(pack?.pack_prompts ?? [])].sort((a,b)=>a.sort_order-b.sort_order).map(x=>x.prompt_id);
  const cover = pack?.cover_asset_id || "";
  return <><header className="admin-heading"><div><p className="eyebrow">Packs</p><h1>{pack ? "Edit pack" : "New pack"}</h1></div><Link className="button-secondary" href="/admin/packs">Back to list</Link></header>
  {saved && <p className="success">Pack saved.</p>}{error && <p className="form-error" role="alert">{error}</p>}{pack && <p className="notice">Existing buyers retain their purchase-time prompt entitlement.</p>}
  <form action={savePack} className="admin-form-grid"><section className="admin-panel form-stack"><input name="id" type="hidden" value={pack?.id ?? ""}/><input name="coverAssetId" type="hidden" value={cover}/>
    <label>Title<input required defaultValue={pack?.title} name="title" /></label><label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={pack?.slug} name="slug" /></label>
    <label>Description<textarea required defaultValue={pack?.description} name="description" rows={8}/></label><label>Cover artwork<input accept="image/jpeg,image/png,image/webp,image/avif" name="artwork" type="file"/><span className="field-help">Optional replacement; validated and converted to WebP on save.</span></label><PackMembers initial={selected} prompts={prompts} />
  </section><aside className="admin-panel form-stack"><label>Status<select defaultValue={pack?.status ?? "DRAFT"} name="status">{["DRAFT","PUBLISHED","UNLISTED","ARCHIVED"].map(x=><option key={x}>{x}</option>)}</select></label><label>Price (minor unit)<input min="0" required defaultValue={pack?.price_minor ?? ""} name="priceMinor" step="1" type="number" /></label><label>Currency<input maxLength={3} required defaultValue={pack?.currency ?? "IDR"} name="currency" /></label><button className="button-primary">Save pack</button></aside></form></>;
}
