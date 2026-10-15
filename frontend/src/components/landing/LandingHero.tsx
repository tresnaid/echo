interface LandingHeroProps {
  onOpenApp: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
  const scrollToDemo = () => {
    const el = document.getElementById('showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="echo-hero-section" aria-labelledby="hero-title">
      <div className="echo-hero-pill-badge">
        <span className="echo-hero-pill-dot" aria-hidden="true" />
        <span>Production Reference • Atlas Design System</span>
      </div>

      <h1 id="hero-title" className="echo-hero-title">
        The Multimodal AI Prompt Library for Serious Builders
      </h1>

      <p className="echo-hero-description">
        Store, parameterize, inspect, and copy exact prompts across Text, Code, Image, and Generative Video. Engineered with the Atlas Design System, persistent SQLite database storage, and 100% raw copy fidelity.
      </p>

      <div className="echo-hero-cta-group">
        <button type="button" onClick={onOpenApp} className="echo-btn-primary echo-btn-lg">
          <span>Open Prompt Library</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        <button type="button" onClick={scrollToDemo} className="echo-btn-secondary echo-btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          <span>Interactive Showcase</span>
        </button>
      </div>

      <div className="echo-signal-bar" aria-label="Key Capabilities">
        <div className="echo-signal-item">
          <span className="echo-signal-metric">4 Modalities</span>
          <span className="echo-signal-label">Text, Code, Image & Video generation with media previews</span>
        </div>
        <div className="echo-signal-item">
          <span className="echo-signal-metric">100% Fidelity</span>
          <span className="echo-signal-label">Unmodified raw copy preservation with exact whitespace</span>
        </div>
        <div className="echo-signal-item">
          <span className="echo-signal-metric">Sub-millisecond</span>
          <span className="echo-signal-label">Local SQLite full-text search across titles, bodies, and tags</span>
        </div>
        <div className="echo-signal-item">
          <span className="echo-signal-metric">Zero-Loss</span>
          <span className="echo-signal-label">Non-destructive collection deletion safely cascades to Uncollected</span>
        </div>
      </div>
    </section>
  );
}
