import { Prompt } from '../../types';
import { PromptCard } from './PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreatePrompt: () => void;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

export function PromptGrid({ prompts, loading, hasActiveFilters, onClearFilters, onCreatePrompt, onTagClick, onOpenDetails }: PromptGridProps) {
  if (loading) {
    return <div className="echo-prompt-masonry echo-skeleton-grid" aria-label="Loading prompts">{Array.from({ length: 6 }, (_, index) => <div className="echo-card-skeleton" key={index} />)}</div>;
  }

  if (!prompts.length) {
    return (
      <section className="echo-empty-state">
        <span className="echo-kicker">{hasActiveFilters ? 'NO RESULTS' : 'EMPTY LIBRARY'}</span>
        <h3>{hasActiveFilters ? 'No prompts match these filters.' : 'No prompts saved yet.'}</h3>
        <p>{hasActiveFilters ? 'Clear the search or change a filter.' : 'Create a prompt to start the library.'}</p>
        <button type="button" className="echo-button echo-button-primary" onClick={hasActiveFilters ? onClearFilters : onCreatePrompt}>
          {hasActiveFilters ? 'Clear filters' : 'Create prompt'}
        </button>
      </section>
    );
  }

  return (
    <div className="echo-prompt-masonry">
      {prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} onTagClick={onTagClick} onOpenDetails={onOpenDetails} />)}
    </div>
  );
}
