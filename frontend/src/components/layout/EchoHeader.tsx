interface EchoHeaderProps {
  active: 'overview' | 'library' | 'workbench';
  onNavigate: (view: 'overview' | 'library' | 'workbench') => void;
  onNewPrompt?: () => void;
}

export function EchoHeader({ active, onNavigate, onNewPrompt }: EchoHeaderProps) {
  const link = (view: EchoHeaderProps['active'], label: string) => (
    <button
      type="button"
      className={`echo-nav-link${active === view ? ' is-active' : ''}`}
      aria-current={active === view ? 'page' : undefined}
      onClick={() => onNavigate(view)}
    >
      {label}
    </button>
  );

  return (
    <header className="echo-header">
      <button type="button" className="echo-wordmark" onClick={() => onNavigate('overview')}>
        Echo
      </button>
      <nav className="echo-desktop-nav" aria-label="Primary navigation">
        {link('overview', 'Overview')}
        {link('library', 'Library')}
        {link('workbench', 'Workbench')}
        <a className="echo-nav-link" href="https://github.com/tresnaid/echo" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
      <div className="echo-header-actions">
        {onNewPrompt && (
          <button type="button" className="echo-button echo-button-primary echo-header-new" onClick={onNewPrompt}>
            New prompt
          </button>
        )}
        <details className="echo-mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {link('overview', 'Overview')}
            {link('library', 'Library')}
            {link('workbench', 'Workbench')}
            <a className="echo-nav-link" href="https://github.com/tresnaid/echo" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
