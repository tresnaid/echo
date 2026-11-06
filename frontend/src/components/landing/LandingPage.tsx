import { EchoHeader } from '../layout/EchoHeader';
import { EchoFooter } from '../layout/EchoFooter';

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenWorkbench: () => void;
}

const promptTypes = [
  ['TEXT', 'Reasoning, writing, and reusable instructions.'],
  ['CODE', 'Engineering patterns and implementation prompts.'],
  ['IMAGE', 'Visual direction, lighting, and composition.'],
  ['VIDEO', 'Camera movement, timing, and motion prompts.'],
];

const recentPrompts = [
  ['TEXT', 'Self-Correcting Reasoning Agent'],
  ['IMAGE', 'Editorial 35mm Anamorphic Portrait'],
  ['IMAGE', 'Retro Polaroid Film Portrait'],
  ['CODE', 'Concurrent Stream Worker Pool'],
  ['VIDEO', 'Orbital Drone Dolly Zoom at Twilight'],
  ['VIDEO', '3D Kinetic Typography Particle Explosion'],
];

export function LandingPage({ onOpenApp, onOpenWorkbench }: LandingPageProps) {
  const navigate = (view: 'overview' | 'library' | 'workbench') => {
    if (view === 'library') onOpenApp();
    if (view === 'workbench') onOpenWorkbench();
  };

  return (
    <div className="echo-page echo-overview-page">
      <EchoHeader active="overview" onNavigate={navigate} />
      <main>
        <section className="echo-hero">
          <h1>A working library for prompts.</h1>
          <p>Save exact prompts, attach their output, and find them again without rebuilding the context.</p>
          <div className="echo-action-row">
            <button type="button" className="echo-button echo-button-primary" onClick={onOpenApp}>Open library</button>
            <button type="button" className="echo-button echo-button-quiet" onClick={onOpenWorkbench}>Open workbench</button>
          </div>
        </section>

        <section className="echo-types-section" aria-labelledby="types-title">
          <h2 id="types-title">What Echo keeps together</h2>
          <div className="echo-type-grid">
            {promptTypes.map(([type, description]) => (
              <article key={type}>
                <span className="echo-kicker">{type}</span>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="echo-recent-section" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent prompts</h2>
          <p className="echo-section-intro">Open an entry to copy, edit, or review its saved output.</p>
          <div className="echo-recent-grid">
            {recentPrompts.map(([type, title]) => (
              <button type="button" key={title} onClick={onOpenApp}>
                <span className="echo-kicker">{type}</span>
                <strong>{title}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="echo-about-section">
          <h2>Built for prompts you expect to use again.</h2>
          <div>
            <p>Save the exact prompt, add a description and usage notes, attach media, organize it into collections, and find it later by type or tag.</p>
            <code>React 19 / TypeScript / Vite / Express / SQLite</code>
            <a href="https://github.com/tresnaid/echo" target="_blank" rel="noreferrer">github.com/tresnaid/echo</a>
          </div>
        </section>
      </main>
      <EchoFooter />
    </div>
  );
}

export default LandingPage;
