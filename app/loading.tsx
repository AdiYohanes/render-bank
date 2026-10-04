export default function Loading() {
  return (
    <main className="content-wrap" id="main">
      <section className="hero">
        <div>
          <div className="skeleton" style={{ height: 14, width: 180 }} />
          <div
            className="skeleton"
            style={{ height: 56, margin: "20px 0", borderRadius: 10 }}
          />
          <div
            className="skeleton"
            style={{ height: 20, width: "70%", borderRadius: 10 }}
          />
          <div
            className="skeleton"
            style={{ height: 44, width: 280, marginTop: 28, borderRadius: 999 }}
          />
        </div>
        <div className="skeleton skeleton-hero" />
      </section>
      <section aria-hidden="true" className="section">
        <div className="prompt-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton skeleton-art" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
