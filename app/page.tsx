import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="status-shell">
      <div className="status-content">
        <p className="status-label">Site setup in progress</p>
        <h1>{siteConfig.name}</h1>
        <p className="status-description">{siteConfig.description}</p>
      </div>
    </main>
  );
}
