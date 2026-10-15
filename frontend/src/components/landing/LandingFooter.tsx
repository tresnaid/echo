interface LandingFooterProps {
  onOpenApp: () => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  return (
    <>
      {/* Portfolio Callout Box */}
      <section className="echo-portfolio-callout" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="echo-portfolio-title">
          Ready to supercharge your prompt workflow?
        </h2>
        <p className="echo-portfolio-desc">
          Experience sub-millisecond retrieval, multi-modal card previews, and 100% copy fidelity in the live Echo workspace.
        </p>
        <div className="echo-portfolio-actions">
          <button
            type="button"
            onClick={onOpenApp}
            className="echo-btn-primary echo-btn-lg"
            style={{ background: '#3b82f6', borderColor: '#2563eb' }}
          >
            <span>Launch Live Library</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <a
            href="https://github.com/tresnaid/echo"
            target="_blank"
            rel="noopener noreferrer"
            className="echo-btn-secondary echo-btn-lg"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>Inspect GitHub Repository</span>
          </a>
        </div>
      </section>

      {/* Footer Colophon */}
      <footer className="echo-landing-footer" role="contentinfo">
        <div className="echo-footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <img src="/echo-logo.svg" alt="Echo" width={20} height={20} style={{ borderRadius: '4px' }} />
              <strong style={{ color: '#0f172a' }}>Echo Prompt Library</strong>
              <span>— Crafted as a Portfolio & Design System Reference</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>
              Designed & Built by <strong>Tresna (gumelartresnadwinanda)</strong> with the <strong>Atlas Design System</strong>.
            </p>
          </div>

          <div className="echo-footer-links">
            <a
              href="https://echo.tresnaid.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="echo-footer-link"
            >
              Live Deployment
            </a>
            <a
              href="https://atlas.tresnaid.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="echo-footer-link"
            >
              Atlas Design System
            </a>
            <a
              href="https://github.com/tresnaid/echo"
              target="_blank"
              rel="noopener noreferrer"
              className="echo-footer-link"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
