import type { DiscoveryPrompt } from "@/lib/discovery/shared";

import Link from "next/link";

import { ArtworkFrame } from "./artwork";

import { ratioOf } from "@/lib/discovery/shared";

export function PromptGrid({
  prompts,
  priority = false,
}: {
  prompts: DiscoveryPrompt[];
  priority?: boolean;
}) {
  return (
    <div className="prompt-grid">
      {prompts.map((prompt, index) => {
        const image =
          prompt.images?.find(({ is_primary }) => is_primary) ??
          prompt.images?.[0];
        const asset = image?.media_assets;
        const ratio = ratioOf(asset);

        return (
          <Link
            key={prompt.id}
            className="prompt-card"
            href={`/prompts/${prompt.slug}`}
          >
            <div className="prompt-artwork" style={{ aspectRatio: `${ratio}` }}>
              <ArtworkFrame
                alt={image?.alt_text ?? `${prompt.title} artwork unavailable`}
                asset={asset}
                priority={priority && index === 0}
              />
            </div>
            <div className="prompt-card-heading">
              <h3>{prompt.title}</h3>
              <span className="access-badge">
                {prompt.access_type === "FREE" ? "Free" : "Premium"}
              </span>
            </div>
            <p className="prompt-card-meta">
              {prompt.category?.name ?? "Prompt"} ·{" "}
              {prompt.models?.[0]?.models?.name ?? "Model pending"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
