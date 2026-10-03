"use client";

import { useState } from "react";
import Image from "next/image";

import { publicSupabaseEnv } from "@/lib/supabase/public-env";

type Artwork = { storage_path: string; width: number; height: number; bucket: string };

function UploadedArtwork({ src, asset, alt, priority }: { src: string; asset: Artwork; alt: string; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="artwork-placeholder" role="img" aria-label={alt || "Artwork not yet available"}><span>Preview artwork unavailable</span></div>;
  return <Image src={src} alt={alt} width={asset.width} height={asset.height} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" priority={priority} className="artwork-image" onError={() => setFailed(true)} />;
}

export function ArtworkFrame({ asset, alt, priority = false }: { asset?: Artwork | null; alt: string; priority?: boolean }) {
  if (!asset || asset.storage_path.startsWith("demo/")) {
    return <div className="artwork-placeholder" role="img" aria-label={alt || "Artwork not yet available"}><span>Preview artwork pending</span></div>;
  }
  const { url } = publicSupabaseEnv();
  const src = `${url}/storage/v1/object/public/${asset.bucket}/${asset.storage_path.split("/").map(encodeURIComponent).join("/")}`;
  return <UploadedArtwork key={src} src={src} asset={asset} alt={alt} priority={priority} />;
}
