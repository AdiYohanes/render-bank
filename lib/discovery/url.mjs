const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const orientations = ["portrait", "landscape", "square"];
const accessTypes = ["free", "premium"];

export function discoveryState(input) {
  const value = (key) => {
    const entry = input[key];
    return typeof entry === "string" ? entry.trim().slice(0, 100) : "";
  };
  const page = Number(value("page"));
  return {
    q: value("q"),
    category: slug.test(value("category")) ? value("category") : "",
    model: slug.test(value("model")) ? value("model") : "",
    orientation: orientations.includes(value("orientation")) ? value("orientation") : "",
    access: accessTypes.includes(value("access")) ? value("access") : "",
    page: Number.isSafeInteger(page) ? Math.min(83, Math.max(1, page)) : 1,
  };
}

export function discoveryWindow(page) {
  // ponytail: 83 pages stay below PostgREST's 1000-row cap; use cursor pagination beyond 996 results.
  return { size: Math.min(83, Math.max(1, page)) * 12 + 1, offset: 0 };
}

export function discoveryHref(state, changes = {}) {
  const next = { ...state, ...changes };
  const query = new URLSearchParams();
  for (const key of ["q", "category", "model", "orientation", "access"]) {
    if (next[key]) query.set(key, next[key]);
  }
  if (next.page > 1) query.set("page", String(next.page));
  return `/explore${query.size ? `?${query}` : ""}`;
}
