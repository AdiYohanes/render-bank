export type DiscoveryFilters = {
  q: string;
  category: string;
  model: string;
  orientation: string;
  access: string;
  page: number;
};

export type DiscoveryPrompt = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  access_type: "FREE" | "PACK_ONLY";
  category_id: string;
  orientation: string | null;
  published_at: string | null;
  featured_order: number | null;
  category?: { slug: string; name: string } | null;
  models?: { models: { name: string } | null }[];
  images?: {
    is_primary: boolean;
    alt_text: string;
    media_assets: {
      storage_path: string;
      width: number;
      height: number;
      bucket: string;
    } | null;
  }[];
};
