import { PromptForm } from "@/app/admin/components/prompt-form";
import { editorOptions, promptEditor } from "@/lib/admin/data";

export default async function EditPromptPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params; const [options, prompt, query] = await Promise.all([editorOptions(), promptEditor(id), searchParams]);
  return <PromptForm error={query.error} options={options} prompt={prompt} saved={query.saved} />;
}
