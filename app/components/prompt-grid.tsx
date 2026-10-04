import Link from "next/link";

import { ArtworkFrame } from "./artwork";

type Prompt = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  access_type: "FREE" | "PACK_ONLY";
  category?: { slug: string; name: string } | null;
  models?: { models: { name: string } | null }[];
  images?: { is_primary: boolean; alt_text: string; media_assets: { storage_path: string; width: number; height: number; bucket: string } | null }[];
};

export function PromptGrid({ prompts, priority = false }: { prompts: Prompt[]; priority?: boolean }) {
  return <div className="prompt-grid">{prompts.map((prompt, index) => {
    const image = prompt.images?.find(({ is_primary }) => is_primary) ?? prompt.images?.[0];
    return <Link className="prompt-card" href={`/prompts/${prompt.slug}`} key={prompt.id}>
      <div className="prompt-artwork"><ArtworkFrame asset={image?.media_assets} alt={image?.alt_text ?? `${prompt.title} artwork unavailable`} priority={priority && index === 0} /></div>
      <div className="prompt-card-heading"><h3>{prompt.title}</h3><span className="access-badge">{prompt.access_type === "FREE" ? "Free" : "Premium"}</span></div>
      <p className="prompt-card-meta">{prompt.category?.name ?? "Prompt"} · {prompt.models?.[0]?.models?.name ?? "Model pending"}</p>
    </Link>;
  })}</div>;
}
