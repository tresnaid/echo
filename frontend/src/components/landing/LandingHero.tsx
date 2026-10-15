interface LandingHeroProps {
  onOpenApp: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
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
        <button type="button" onClick={onOpenApp} className="echo-hero-cta">
          Open Library
        </button>
      </div>
    </section>
  );
}

export default LandingHero;
