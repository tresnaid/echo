import './landing.css';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { InteractiveShowcase } from './InteractiveShowcase';
import { EngineeringLedger } from './EngineeringLedger';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onOpenApp: () => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  return (
    <div className="echo-landing">
      <LandingHeader onOpenApp={onOpenApp} />
      <main id="main-content">
        <LandingHero onOpenApp={onOpenApp} />
        <InteractiveShowcase onOpenApp={onOpenApp} />
        <EngineeringLedger />
        <LandingFooter onOpenApp={onOpenApp} />
      </main>
    </div>
  );
}

export default LandingPage;
