import type { Database } from "@/lib/supabase/database.types";

/** Pack-cover asset shape as returned by lib/discovery/public. */
export type PackCover = {
  storage_path: string;
  width: number;
  height: number;
  bucket: string;
} | null;

export type PackCard = {
  href: string;
  title: string;
  description: string;
  cover: PackCover;
  promptCount: number;
  price: string;
  index?: number;
};

export type PackPreview = {
  href: string;
  title: string;
  description: string;
};

export type PackExample = {
  asset: NonNullable<PackCover>;
  alt: string;
};

export type PackDetail = {
  slug: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  promptCount: number;
  useCases: string[];
  models: string[];
  previews: PackPreview[];
  examples: PackExample[];
};

export function formatPackPrice(amountMinor: number, currency: string): string;
export function packCatalog(
  packs: Array<{
    slug: string;
    title: string;
    description: string;
    price_minor: number;
    currency: string;
    cover: PackCover;
    prompt_count?: { count: number }[];
  }>,
): PackCard[];
export function packCatalog(pack: {
  slug: string;
  title: string;
  description: string;
  price_minor: number;
  currency: string;
  cover: PackCover;
  prompt_count?: { count: number }[];
}): PackCard;
export function packDetail(pack: {
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  currency: string;
  cover: PackCover;
  prompts?: Array<{
    slug: string;
    title: string;
    short_description: string;
    images?: Array<{ is_primary: boolean; alt_text: string; media_assets: NonNullable<PackCover> }> | null;
    category?: { name: string } | null;
    models?: Array<{ models: { name: string } | null } | null> | null;
  } | null>;
}): PackDetail;
