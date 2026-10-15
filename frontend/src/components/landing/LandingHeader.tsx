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
        <div className="echo-brand-group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/echo-logo.svg" alt="Echo Logo" className="echo-brand-logo" width={32} height={32} />
          <span className="echo-brand-title">Echo</span>
          <span className="echo-brand-tag">Atlas DS</span>
        </div>

        <nav className="echo-landing-nav" aria-label="Main Navigation">
          <a href="#showcase" onClick={scrollTo('showcase')} className="echo-nav-link">
            Showcase
          </a>
          <a href="#workflows" onClick={scrollTo('workflows')} className="echo-nav-link">
            Workflows
          </a>
          <a href="#how-it-works" onClick={scrollTo('how-it-works')} className="echo-nav-link">
            How It Works
          </a>
          <a href="#architecture" onClick={scrollTo('architecture')} className="echo-nav-link">
            Architecture
          </a>
        </nav>

        <div className="echo-header-actions">
          <a
            href="https://github.com/tresnaid/echo"
            target="_blank"
            rel="noopener noreferrer"
            className="echo-btn-secondary"
            title="View Echo on GitHub"
            aria-label="View Echo GitHub repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span className="echo-hide-on-mobile">GitHub</span>
          </a>
          <button type="button" onClick={onOpenApp} className="echo-btn-primary">
            <span>Open Library</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
