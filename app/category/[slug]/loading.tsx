export default function Loading() {
  return (
    <main aria-busy="true" className="content-wrap category-page" id="main">
      <p className="eyebrow">BROWSE BY CATEGORY</p>
      <div
        className="skeleton"
        style={{ height: 48, width: 380, borderRadius: 10, marginBottom: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 20, width: 340, borderRadius: 10, marginBottom: 32 }}
      />
      <div className="prompt-grid">
        {Array.from({ length: 6 }).map((_, index) => (
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
