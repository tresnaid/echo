interface LandingFooterProps {
  onOpenApp: () => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  return (
    <footer className="echo-colophon-section" role="contentinfo">
      <div>
        <p className="echo-colophon-text">
          <strong>Echo</strong> — Multimodal AI prompt library built with the Atlas Design System.
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
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default LandingFooter;
