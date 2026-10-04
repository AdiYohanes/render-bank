import { PackForm } from "@/app/admin/components/pack-form";
import { requireAdmin } from "@/lib/admin/auth";
export default async function NewPack({searchParams}:{searchParams:Promise<{error?:string}>}) { const {client}=await requireAdmin(); const [{data:prompts},params]=await Promise.all([client.from("prompts").select("id,title,status").eq("access_type","PACK_ONLY").order("title"),searchParams]); return <PackForm error={params.error} prompts={prompts??[]}/>; }
