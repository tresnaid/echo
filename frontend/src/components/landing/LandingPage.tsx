import './landing.css';
import { CursorEffect } from './CursorEffect';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { InteractiveShowcase } from './InteractiveShowcase';
import { EngineeringLedger } from './EngineeringLedger';
import { LandingFooter } from './LandingFooter';
import { Prompt, Category } from '../../types';

interface LandingPageProps {
  onOpenApp: () => void;
  prompts?: Prompt[];
  categories?: Category[];
  availableTags?: string[];
  onOpenDetails?: (prompt: Prompt) => void;
}

export function LandingPage({
  onOpenApp,
  prompts,
  categories,
  availableTags,
  onOpenDetails,
}: LandingPageProps) {
  return (
    <div className="echo-landing">
      <CursorEffect />
      <LandingHeader onOpenApp={onOpenApp} />
      <main id="main-content">
        <LandingHero onOpenApp={onOpenApp} />
        <InteractiveShowcase
          onOpenApp={onOpenApp}
          prompts={prompts}
          categories={categories}
          availableTags={availableTags}
          onOpenDetails={onOpenDetails}
        />
        <EngineeringLedger />
        <LandingFooter onOpenApp={onOpenApp} />
      </main>
    </div>
  );
}

export default LandingPage;
