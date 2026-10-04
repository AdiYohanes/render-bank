import type { MetadataRoute } from "next";

import { discoverCategories } from "@/lib/discovery/public";
import { discoverPromptSlugs } from "@/lib/prompts/public";
import { siteUrl } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  let categories: { slug: string }[] = [];
  let prompts: { slug: string }[] = [];

  try {
    categories = await discoverCategories();
  } catch {
    // Sitemap degrades to available public routes when discovery is unavailable.
  }
  try {
    prompts = await discoverPromptSlugs();
  } catch {
    // Prompt discovery failure does not hide available category routes.
  }
  const staticRoutes = ["/", "/explore", "/about"];

  return [
    ...staticRoutes,
    ...categories.map(({ slug }) => `/category/${slug}`),
    ...prompts.map(({ slug }) => `/prompts/${slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
