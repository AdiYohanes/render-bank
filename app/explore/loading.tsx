export default function Loading() {
  return (
    <main aria-busy="true" className="content-wrap explore-page" id="main">
      <p className="eyebrow">THE PROMPT LIBRARY</p>
      <div
        className="skeleton"
        style={{ height: 48, width: 420, borderRadius: 10, marginBottom: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 20, width: 360, borderRadius: 10, marginBottom: 32 }}
      />
      <div className="skeleton skeleton-form" />
      <div className="prompt-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton skeleton-art" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
    </main>
  );
}
