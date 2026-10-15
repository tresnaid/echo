interface LandingFooterProps {
  onOpenApp: () => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  return (
    <footer className="echo-colophon-section" role="contentinfo">
      <div>
        <p className="echo-colophon-text">
          <strong>Echo</strong> — A multimodal AI prompt library and portfolio reference.
        </p>
        <p className="echo-colophon-text" style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
          Engineered by <strong>Tresna (gumelartresnadwinanda)</strong> with the <strong>Atlas Design System</strong>.
        </p>
      </div>

      <div className="echo-colophon-links">
        <button
          type="button"
          onClick={onOpenApp}
          className="echo-colophon-link"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
        >
          Open Library
        </button>
        <a
          href="https://atlas.tresnaid.space/"
          target="_blank"
          rel="noopener noreferrer"
          className="echo-colophon-link"
        >
          Atlas Design System
        </a>
        <a
          href="https://github.com/tresnaid/echo"
          target="_blank"
          rel="noopener noreferrer"
          className="echo-colophon-link"
        >
          GitHub Repository
        </a>
      </div>
    </footer>
  );
}

export default LandingFooter;
