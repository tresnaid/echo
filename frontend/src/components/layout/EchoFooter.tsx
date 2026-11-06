interface EchoFooterProps {
  onNavigate?: (view: 'overview' | 'library' | 'workbench') => void;
  status?: 'online' | 'offline';
}

export function EchoFooter({ onNavigate, status }: EchoFooterProps) {
  return (
    <footer className="echo-footer">
      <strong>Echo</strong>
      <div className="echo-footer-links">
        {status && <span className={`echo-status is-${status}`}>{status}</span>}
        {onNavigate && <button type="button" onClick={() => onNavigate('overview')}>Overview</button>}
        {onNavigate && <button type="button" onClick={() => onNavigate('workbench')}>Workbench</button>}
        <a href="https://github.com/tresnaid/echo" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
