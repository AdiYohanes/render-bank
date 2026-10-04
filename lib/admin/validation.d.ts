export type Validation<T> = { ok: true; value: T } | { ok: false; errors: string[] };
export function parsePrompt(data: FormData): Validation<any>;
export function parsePack(data: FormData): Validation<any>;
export function parseCategory(data: FormData): Validation<any>;
