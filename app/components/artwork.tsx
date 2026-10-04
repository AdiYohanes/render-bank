"use client";

import { useState } from "react";
import Image from "next/image";

import { artworkUrl } from "@/lib/discovery/shared";

type Artwork = {
  storage_path: string;
  width: number;
  height: number;
  bucket: string;
};

function UploadedArtwork({
  src,
  asset,
  alt,
  priority,
}: {
  src: string;
  asset: Artwork;
  alt: string;
  priority: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed)
    return (
      <div
        aria-label={alt || "Artwork not yet available"}
        className="artwork-placeholder"
        role="img"
      >
        <span>Preview artwork unavailable</span>
      </div>
    );

  return (
    <Image
      alt={alt}
      className="artwork-image"
      height={asset.height}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      src={src}
      width={asset.width}
      onError={() => setFailed(true)}
    />
  );
}

export function ArtworkFrame({
  asset,
  alt,
  priority = false,
}: {
  asset?: Artwork | null;
  alt: string;
  priority?: boolean;
}) {
  if (!asset || !artworkUrl(asset)) {
    return (
      <div
        aria-label={alt || "Artwork not yet available"}
        className="artwork-placeholder"
        role="img"
      >
        <span>Preview artwork pending</span>
      </div>
    );
  }
  const src = artworkUrl(asset)!;

  return (
    <UploadedArtwork
      key={src}
      alt={alt}
      asset={asset}
      priority={priority}
      src={src}
    />
  );
}
