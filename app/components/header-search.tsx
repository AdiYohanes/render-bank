export function PublicSearch() {
  return (
    <form action="/explore" className="header-search" role="search">
      <label className="sr-only" htmlFor="header-q">
        Search prompts
      </label>
      <input
        id="header-q"
        maxLength={100}
        name="q"
        placeholder="Search prompts..."
        type="search"
      />
      <button type="submit">Search</button>
    </form>
  );
}
