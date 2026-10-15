import React from 'react';

interface LandingHeaderProps {
  onOpenApp: () => void;
}

export function LandingHeader({ onOpenApp }: LandingHeaderProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="echo-landing-header" role="banner">
      <div className="echo-landing-header-inner">
        <div
          className="echo-brand-group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <img src="/echo-logo.svg" alt="Echo Logo" className="echo-brand-logo" width={28} height={28} />
          <span className="echo-brand-title">Echo</span>
        </div>

        <nav className="echo-landing-nav" aria-label="Main Navigation">
          <a href="#showcase" onClick={scrollTo('showcase')} className="echo-nav-link">
            Showcase
          </a>
          <a href="#specifications" onClick={scrollTo('specifications')} className="echo-nav-link">
            Specifications
          </a>
          <a
            href="https://github.com/tresnaid/echo"
            target="_blank"
            rel="noopener noreferrer"
            className="echo-nav-link"
          >
            GitHub
          </a>
        </nav>

        <div className="echo-header-actions">
          <button type="button" onClick={onOpenApp} className="echo-nav-cta">
            Open Library
          </button>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
