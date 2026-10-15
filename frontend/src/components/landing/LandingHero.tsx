import type { MouseEvent } from 'react';

interface LandingHeroProps {
  onOpenApp: () => void;
  onOpenWorkbench: () => void;
}

export function LandingHero({ onOpenApp, onOpenWorkbench }: LandingHeroProps) {
  const scrollToShowcase = (e: MouseEvent) => {
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
        Echo stores, inspects, parameterizes, and copies prompts across Text, Code, Image Synthesis, and Generative Video with 100% byte fidelity. Designed with the Atlas Design System and backed by SQLite.
      </p>

      <div className="echo-hero-actions">
        <button type="button" onClick={onOpenApp} className="echo-hero-cta">
          Open Library
        </button>
        <button type="button" onClick={onOpenWorkbench} className="echo-hero-secondary">
          Workbench Inspector
        </button>
      </div>

      <div className="echo-hero-scroll-cue">
        <a href="#showcase" onClick={scrollToShowcase} className="echo-scroll-indicator">
          <span>Explore Interactive Showcase</span>
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
