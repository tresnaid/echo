import './landing.css';
import { CursorEffect } from './CursorEffect';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { InteractiveShowcase } from './InteractiveShowcase';
import { EngineeringLedger } from './EngineeringLedger';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenWorkbench: () => void;
}

export function LandingPage({
  onOpenApp,
  onOpenWorkbench,
}: LandingPageProps) {
  return (
    <div className="echo-landing">
      <CursorEffect />
      <LandingHeader onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
      <main id="main-content">
        <LandingHero onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
        <InteractiveShowcase
          onOpenApp={onOpenApp}
          onOpenWorkbench={onOpenWorkbench}
        />
        <EngineeringLedger />
        <LandingFooter onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
      </main>
    </div>
  );
}

export default LandingPage;
