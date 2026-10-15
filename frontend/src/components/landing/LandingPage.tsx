import { useState } from 'react';
import './landing.css';
import { CursorEffect } from './CursorEffect';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { InteractiveShowcase } from './InteractiveShowcase';
import { EngineeringLedger } from './EngineeringLedger';
import { LandingFooter } from './LandingFooter';
import { PromptDetailModal } from '../prompts/PromptDetailModal';
import { Prompt } from '../../types';

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenWorkbench: () => void;
}

export function LandingPage({
  onOpenApp,
  onOpenWorkbench,
}: LandingPageProps) {
  const [detailPrompt, setDetailPrompt] = useState<Prompt | null>(null);

  return (
    <div className="echo-landing">
      <CursorEffect />
      <LandingHeader onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
      <main id="main-content">
        <LandingHero onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
        <InteractiveShowcase
          onOpenApp={onOpenApp}
          onOpenWorkbench={onOpenWorkbench}
          onOpenDetails={(prompt) => setDetailPrompt(prompt)}
        />
        <EngineeringLedger />
        <LandingFooter onOpenApp={onOpenApp} onOpenWorkbench={onOpenWorkbench} />
      </main>

      {/* Detail Modal for Sample Prompts in Landing Library View */}
      <PromptDetailModal
        prompt={detailPrompt}
        isOpen={Boolean(detailPrompt)}
        onClose={() => setDetailPrompt(null)}
        onEdit={() => {
          setDetailPrompt(null);
          onOpenApp();
        }}
        onDelete={() => {
          setDetailPrompt(null);
          onOpenApp();
        }}
      />
    </div>
  );
}

export default LandingPage;
