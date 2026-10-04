const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const variableKeyPattern = /^[a-z][a-z0-9_]*$/;
const promptStatuses = new Set(["DRAFT", "PUBLISHED", "UNPUBLISHED", "UNLISTED", "ARCHIVED"]);
const packStatuses = new Set(["DRAFT", "PUBLISHED", "UNLISTED", "ARCHIVED"]);

const text = (data, key) => String(data.get(key) ?? "").trim();
const optional = (data, key) => text(data, key) || null;
const ids = (data, key) => data.getAll(key).flatMap((value) => String(value).split(",")).map((id) => id.trim()).filter(Boolean);
const failure = (...errors) => ({ ok: false, errors: errors.flat().filter(Boolean) });

export function parsePrompt(data) {
  const value = {
    title: text(data, "title"), slug: text(data, "slug"), shortDescription: text(data, "shortDescription"),
    description: optional(data, "description"), promptTemplate: text(data, "promptTemplate"), generationNotes: optional(data, "generationNotes"),
    accessType: text(data, "accessType"), categoryId: text(data, "categoryId"), aspectRatio: optional(data, "aspectRatio"),
    orientation: optional(data, "orientation"), requiresReferenceImage: data.get("requiresReferenceImage") === "on",
    primarySalesPackId: optional(data, "primarySalesPackId"), status: text(data, "status"), assetId: optional(data, "assetId"),
    imageAlt: optional(data, "imageAlt"), modelIds: ids(data, "modelIds"), tagIds: ids(data, "tagIds"), useCaseIds: ids(data, "useCaseIds"), variables: [],
  };
  const errors = [];
  if (!value.title) errors.push("Title is required.");
  if (value.title.length > 180 || value.shortDescription.length > 500) errors.push("Title or short description is too long.");
  if (value.promptTemplate.length > 50000) errors.push("Prompt template is too long.");
  if (!slugPattern.test(value.slug)) errors.push("Slug must use lowercase words separated by hyphens.");
  if (!value.shortDescription) errors.push("Short description is required.");
  if (!value.promptTemplate) errors.push("Prompt template is required.");
  if (!["FREE", "PACK_ONLY"].includes(value.accessType)) errors.push("Choose a valid access type.");
  if (!uuidPattern.test(value.categoryId)) errors.push("Choose a category.");
  if (!promptStatuses.has(value.status)) errors.push("Choose a valid status.");
  if (value.aspectRatio && !/^[1-9][0-9]*:[1-9][0-9]*$/.test(value.aspectRatio)) errors.push("Aspect ratio must look like 1:1.");
  if (value.orientation && !["PORTRAIT", "LANDSCAPE", "SQUARE"].includes(value.orientation)) errors.push("Choose a valid orientation.");
  if ([value.assetId, value.primarySalesPackId, ...value.modelIds, ...value.tagIds, ...value.useCaseIds].filter(Boolean).some((id) => !uuidPattern.test(id))) errors.push("Related records must use valid identifiers.");
  const artwork = data.get("artwork");
  if (value.status === "PUBLISHED" && (!(value.assetId || artwork instanceof File && artwork.size) || !value.imageAlt || !value.modelIds.length)) errors.push("Published prompts need preview artwork, alt text, and a model.");
  const variableKeys = data.getAll("variableKey");
  const labels = data.getAll("variableLabel");
  const descriptions = data.getAll("variableDescription");
  const placeholders = data.getAll("variablePlaceholder");
  const defaults = data.getAll("variableDefault");
  const required = data.getAll("variableRequired");
  if ([labels, descriptions, placeholders, defaults, required].some((items) => items.length !== variableKeys.length)) errors.push("Variable fields do not match.");
  else {
    value.variables = variableKeys.map((item, index) => ({
      key: String(item).trim(), label: String(labels[index]).trim(),
      description: String(descriptions[index]).trim() || null,
      placeholder: String(placeholders[index]).trim() || null,
      default_value: String(defaults[index]).trim() || null,
      required: required[index] === "true", sort_order: index,
    }));
    if (new Set(value.variables.map(({ key }) => key)).size !== value.variables.length ||
      value.variables.some(({ key, label }) => !variableKeyPattern.test(key) || !label))
      errors.push("Each variable needs a unique lowercase key and label.");
  }
  return errors.length ? failure(errors) : { ok: true, value };
}

export function parsePack(data) {
  const priceMinor = Number(text(data, "priceMinor"));
  const value = { title: text(data, "title"), slug: text(data, "slug"), description: text(data, "description"), coverAssetId: optional(data, "coverAssetId"), priceMinor, currency: text(data, "currency").toUpperCase(), status: text(data, "status"), promptIds: ids(data, "promptIds") };
  const errors = [];
  if (!value.title || !value.description) errors.push("Title and description are required.");
  if (!slugPattern.test(value.slug)) errors.push("Slug must use lowercase words separated by hyphens.");
  if (!Number.isSafeInteger(value.priceMinor) || value.priceMinor < 0) errors.push("Price must be a non-negative integer in the currency's minor unit.");
  if (!/^[A-Z]{3}$/.test(value.currency)) errors.push("Currency must be a three-letter code.");
  if ([value.coverAssetId, ...value.promptIds].filter(Boolean).some((id) => !uuidPattern.test(id))) errors.push("Related records must use valid identifiers.");
  if (new Set(value.promptIds).size !== value.promptIds.length) errors.push("A prompt can appear only once in a pack.");
  if (!packStatuses.has(value.status)) errors.push("Choose a valid status.");
  const artwork = data.get("artwork");
  if (value.status === "PUBLISHED" && (!(value.coverAssetId || artwork instanceof File && artwork.size) || !value.promptIds.length)) errors.push("Published packs need a cover and at least one prompt.");
  return errors.length ? failure(errors) : { ok: true, value };
}

export function parseCategory(data) {
  const value = { name: text(data, "name"), slug: text(data, "slug"), description: optional(data, "description"), status: text(data, "status"), sortOrder: Number(text(data, "sortOrder") || 0) };
  const errors = [];
  if (!value.name) errors.push("Name is required.");
  if (!slugPattern.test(value.slug)) errors.push("Slug must use lowercase words separated by hyphens.");
  if (!["ACTIVE", "ARCHIVED"].includes(value.status)) errors.push("Choose a valid status.");
  if (!Number.isInteger(value.sortOrder)) errors.push("Sort order must be an integer.");
  return errors.length ? failure(errors) : { ok: true, value };
}
