import { PackForm } from "@/app/admin/components/pack-form";
import { packEditor } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/auth";
export default async function EditPack({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;saved?:string}>}) { const {id}=await params; const {client}=await requireAdmin(); const [pack,{data:prompts},query]=await Promise.all([packEditor(id),client.from("prompts").select("id,title,status").eq("access_type","PACK_ONLY").order("title"),searchParams]); return <PackForm error={query.error} pack={pack} prompts={prompts??[]} saved={query.saved}/>; }
