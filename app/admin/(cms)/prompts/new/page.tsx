import { PromptForm } from "@/app/admin/components/prompt-form";
import { editorOptions } from "@/lib/admin/data";

export default async function NewPromptPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [options, params] = await Promise.all([editorOptions(), searchParams]);
  return <PromptForm error={params.error} options={options} />;
}
