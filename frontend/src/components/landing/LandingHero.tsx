interface LandingHeroProps {
  onOpenApp: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
  const scrollToWorkbench = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="echo-hero-section" aria-labelledby="hero-title">
      <div className="echo-hero-kicker">System Reference // Atlas Design System</div>

      <h1 id="hero-title" className="echo-hero-title">
        A precision instrument for multimodal prompts.
      </h1>

      <p className="echo-hero-description">
        Echo stores, inspects, parameterizes, and copies prompts across Text, Code, Midjourney, and Generative Video with 100% byte fidelity. Designed with the Atlas Design System and backed by SQLite.
      </p>

      <div className="echo-hero-actions">
        <button type="button" onClick={onOpenApp} className="echo-btn-primary">
          <span>Open Library</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        <a href="#showcase" onClick={scrollToWorkbench} className="echo-btn-quiet">
          <span>Explore Workbench</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default LandingHero;
