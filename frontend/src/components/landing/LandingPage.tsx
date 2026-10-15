import './landing.css';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { InteractiveShowcase } from './InteractiveShowcase';
import { WorkflowsSection } from './WorkflowsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ArchitectureSection } from './ArchitectureSection';
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
        <InteractiveShowcase />
        <WorkflowsSection />
        <HowItWorksSection />
        <ArchitectureSection />
        <LandingFooter onOpenApp={onOpenApp} />
      </main>
    </div>
  );
}

export default LandingPage;
