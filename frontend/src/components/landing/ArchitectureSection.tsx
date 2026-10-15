export function ArchitectureSection() {
  const pillars = [
    {
      tag: 'Design System',
      title: 'Atlas Design System Reference',
      desc: 'Engineered as an official reference implementation of @tresnaid/atlas. Adheres strictly to WCAG 2.2 AA accessibility, tokenized typography, fluid active press states, and responsive CSS container queries.',
    },
    {
      tag: 'Data Persistence',
      title: 'SQLite with Zero-Loss Cascades',
      desc: 'Backed by robust SQLite persistence (better-sqlite3) with schema migrations. Non-destructive collection cascades ensure deleting a collection moves prompts safely to Uncollected without losing data.',
    },
    {
      tag: 'Integrity & Security',
      title: 'Soft Deletion & Audit Trail',
      desc: 'Prompts utilize soft-deletion with deleted_at timestamps, ensuring immediate exclusion from UI queries while maintaining data integrity and auditability.',
    },
    {
      tag: 'Decoupled Architecture',
      title: 'Zero-Coupling Client & API',
      desc: 'Clean separation between a static React 19 SPA (compiled with Vite and hosted on Vercel) and an Express REST API backend validated with Zod and image processing via Sharp.',
    },
    {
      tag: 'DevOps & Secrets',
      title: 'Docker, GHCR & EnvHub OIDC',
      desc: 'Containerized production backend published to GitHub Container Registry. Secrets are dynamically managed via EnvHub OIDC tokens, avoiding unencrypted .env files on the production VPS.',
    },
    {
      tag: 'Fidelity Guarantee',
      title: '100% Unmodified Copy Fidelity',
      desc: 'Copies exact raw characters, indentation, and escape sequences directly to clipboard. Preserves prompt variables and code fences for zero-defect LLM ingestion.',
    },
  ];

  const stack = [
    { label: 'Frontend', val: 'React 19 & TypeScript' },
    { label: 'UI Library', val: '@tresnaid/atlas' },
    { label: 'Bundler', val: 'Vite 6' },
    { label: 'Backend API', val: 'Node.js & Express' },
    { label: 'Database', val: 'SQLite (better-sqlite3)' },
    { label: 'Cloud & Hosting', val: 'Vercel & Docker VPS' },
  ];

  return (
    <section id="architecture" className="echo-landing-section" aria-labelledby="arch-heading">
      <div className="echo-section-header">
        <h2 id="arch-heading" className="echo-section-title">
          Engineering Craft & Architecture
        </h2>
        <p className="echo-section-description">
          A showcase of production-ready full-stack software engineering, resilient data modeling, and meticulous design system execution.
        </p>
      </div>

      <div className="echo-architecture-grid">
        {pillars.map((p) => (
          <div key={p.title} className="echo-arch-card">
            <span className="echo-arch-tag">{p.tag}</span>
            <h3 className="echo-arch-title">{p.title}</h3>
            <p className="echo-arch-body">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack Matrix */}
      <div className="echo-stack-matrix" aria-label="Technology Stack Breakdown">
        {stack.map((item) => (
          <div key={item.label} className="echo-stack-item">
            <span className="echo-stack-label">{item.label}</span>
            <span className="echo-stack-val">{item.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
