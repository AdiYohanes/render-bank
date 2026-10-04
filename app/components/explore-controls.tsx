"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer } from "@heroui/react";
import { useState } from "react";

type Option = { slug: string; name: string };

type Filters = {
  q: string;
  category: string;
  model: string;
  orientation: string;
  access: string;
  page: number;
};

const ORIENTATIONS = [
  { slug: "portrait", name: "Portrait" },
  { slug: "landscape", name: "Landscape" },
  { slug: "square", name: "Square" },
] as const;

const ACCESSES = [
  { slug: "free", name: "Free" },
  { slug: "premium", name: "Premium" },
] as const;

function filterUrl(state: Filters, changes: Partial<Filters>) {
  const next = { ...state, ...changes };
  const query = new URLSearchParams();

  for (const key of [
    "q",
    "category",
    "model",
    "orientation",
    "access",
  ] as const) {
    if (next[key]) query.set(key, next[key]);
  }
  if (next.page > 1) query.set("page", String(next.page));

  return `/explore${query.size ? `?${query}` : ""}`;
}

function activeCount(state: Filters) {
  return [state.category, state.model, state.orientation, state.access].filter(
    Boolean,
  ).length;
}

function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link className="filter-chip" href={href}>
      {label} <span aria-hidden="true">×</span>
    </Link>
  );
}

export function ExploreControls({
  state,
  categories,
  models,
}: {
  state: Filters;
  categories: Option[];
  models: Option[];
}) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = activeCount(state);
  const nameFor = (list: readonly Option[], slug: string) =>
    list.find((item) => item.slug === slug)?.name ?? slug;
  const orientationName = ORIENTATIONS.find(
    (item) => item.slug === state.orientation,
  )?.name;
  const accessName = ACCESSES.find((item) => item.slug === state.access)?.name;

  function submitSheet(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);

    router.push(
      filterUrl(state, {
        category: String(data.get("category") || ""),
        model: String(data.get("model") || ""),
        orientation: String(data.get("orientation") || ""),
        access: String(data.get("access") || ""),
        page: 1,
      }),
    );
    setSheetOpen(false);
  }

  function resetSheet(formEvent: React.FormEvent<HTMLButtonElement>) {
    formEvent.currentTarget.form?.reset();
  }

  return (
    <>
      <form action="/explore" className="discovery-form" role="search">
        <div className="search-row">
          <label htmlFor="explore-q">Search prompts</label>
          <div>
            <input
              defaultValue={state.q}
              id="explore-q"
              maxLength={100}
              name="q"
              placeholder="Search prompts..."
              type="search"
            />
            <button className="button-primary" type="submit">
              Search
            </button>
          </div>
        </div>
        <div className="filter-bar">
          <button
            className="button-secondary mobile-only"
            type="button"
            onClick={() => setSheetOpen(true)}
          >
            Filters{count > 0 ? ` ${count}` : ""}
          </button>
          <div className="desktop-filters">
            <label>
              Category
              <select defaultValue={state.category} name="category">
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Model
              <select defaultValue={state.model} name="model">
                <option value="">All models</option>
                {models.map((model) => (
                  <option key={model.slug} value={model.slug}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Orientation
              <select defaultValue={state.orientation} name="orientation">
                <option value="">Any orientation</option>
                {ORIENTATIONS.map((orientation) => (
                  <option key={orientation.slug} value={orientation.slug}>
                    {orientation.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Access
              <select defaultValue={state.access} name="access">
                <option value="">All access</option>
                {ACCESSES.map((access) => (
                  <option key={access.slug} value={access.slug}>
                    {access.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button-secondary" type="submit">
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {(state.q || count > 0) && (
        <div className="active-filters">
          <span>
            Showing {state.q ? `“${state.q}”` : "all Prompts"}
            {count > 0 ? ` · ${count} filter${count > 1 ? "s" : ""}` : ""}
          </span>
          {state.category && (
            <Chip
              href={filterUrl(state, { category: "", page: 1 })}
              label={`Category: ${nameFor(categories, state.category)}`}
            />
          )}
          {state.model && (
            <Chip
              href={filterUrl(state, { model: "", page: 1 })}
              label={`Model: ${nameFor(models, state.model)}`}
            />
          )}
          {state.orientation && (
            <Chip
              href={filterUrl(state, { orientation: "", page: 1 })}
              label={`Orientation: ${orientationName}`}
            />
          )}
          {state.access && (
            <Chip
              href={filterUrl(state, { access: "", page: 1 })}
              label={`Access: ${accessName}`}
            />
          )}
          {state.q && (
            <Link
              className="filter-clear"
              href={filterUrl(state, { q: "", page: 1 })}
            >
              Clear Search
            </Link>
          )}
          {count > 0 && (
            <Link
              className="filter-clear"
              href={filterUrl(state, {
                category: "",
                model: "",
                orientation: "",
                access: "",
                page: 1,
              })}
            >
              Clear Filters
            </Link>
          )}
        </div>
      )}

      <Drawer.Backdrop isOpen={sheetOpen} onOpenChange={setSheetOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Filters</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              <form id="explore-filter-sheet" onSubmit={submitSheet}>
                <label>
                  Category
                  <select defaultValue={state.category} name="category">
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Model
                  <select defaultValue={state.model} name="model">
                    <option value="">All models</option>
                    {models.map((model) => (
                      <option key={model.slug} value={model.slug}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Orientation
                  <select defaultValue={state.orientation} name="orientation">
                    <option value="">Any orientation</option>
                    {ORIENTATIONS.map((orientation) => (
                      <option key={orientation.slug} value={orientation.slug}>
                        {orientation.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Access
                  <select defaultValue={state.access} name="access">
                    <option value="">All access</option>
                    {ACCESSES.map((access) => (
                      <option key={access.slug} value={access.slug}>
                        {access.name}
                      </option>
                    ))}
                  </select>
                </label>
              </form>
            </Drawer.Body>
            <Drawer.Footer>
              <button
                className="button-secondary"
                type="button"
                onClick={resetSheet}
              >
                Reset
              </button>
              <button
                className="button-primary"
                form="explore-filter-sheet"
                type="submit"
              >
                Apply
              </button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}
