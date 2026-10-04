export type Validation<T> = { ok: true; value: T } | { ok: false; errors: string[] };
type PromptValue = { [key: string]: any; variables: any[]; modelIds: string[]; tagIds: string[]; useCaseIds: string[] };
type PackValue = { [key: string]: any; promptIds: string[] };
type CategoryValue = { name: string; slug: string; description: string | null; status: "ACTIVE" | "ARCHIVED"; sortOrder: number };
import { parsePrompt as prompt, parsePack as pack, parseCategory as category } from "./validation.mjs";
export const parsePrompt = prompt as (data: FormData) => Validation<PromptValue>;
export const parsePack = pack as (data: FormData) => Validation<PackValue>;
export const parseCategory = category as (data: FormData) => Validation<CategoryValue>;
