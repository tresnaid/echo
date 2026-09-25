import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  Button,
  Masonry,
  Skeleton,
} from '@tresnaid/atlas';
import { Prompt } from '../../types';
import { PromptCard } from './PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreatePrompt: () => void;
  onEditPrompt?: (prompt: Prompt) => void;
  onDeletePrompt?: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

function SearchEmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--atlas-color-text-muted, #94a3b8)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function PromptLibraryEmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--atlas-color-text-brand, #3b82f6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
      <path d="M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    </svg>
  );
}

export function PromptGrid({
  prompts,
  loading,
  hasActiveFilters,
  onClearFilters,
  onCreatePrompt,
  onTagClick,
  onOpenDetails,
}: PromptGridProps) {
  if (loading) {
    return (
      <Masonry columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }} gap="4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 'var(--atlas-radius-lg, 8px)',
              backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
              border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="60px" height="18px" style={{ borderRadius: '4px' }} />
              <Skeleton width="28px" height="28px" style={{ borderRadius: '6px' }} />
            </div>
            {idx % 3 === 0 && (
              <Skeleton width="100%" height="120px" style={{ borderRadius: '6px' }} />
            )}
            <Skeleton width="80%" height="20px" style={{ borderRadius: '4px' }} />
            <Skeleton width="100%" height="14px" style={{ borderRadius: '4px' }} />
            <Skeleton width="65%" height="14px" style={{ borderRadius: '4px' }} />
            <div style={{ display: 'flex', gap: '4px', marginTop: '0.25rem' }}>
              <Skeleton width="40px" height="16px" style={{ borderRadius: '4px' }} />
              <Skeleton width="48px" height="16px" style={{ borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </Masonry>
    );
  }

  if (prompts.length === 0) {
    if (hasActiveFilters) {
      return (
        <div
          style={{
            padding: '3rem 1.5rem',
            backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
            borderRadius: 'var(--atlas-radius-lg, 8px)',
            border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          }}
        >
          <EmptyState>
            <EmptyStateIcon>
              <SearchEmptyIcon />
            </EmptyStateIcon>
            <EmptyStateTitle>No matching prompts found</EmptyStateTitle>
            <EmptyStateDescription>
              No prompts match your current search and filter criteria. Try adjusting your search query, changing categories, or clearing filters.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: '3.5rem 1.5rem',
          backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
          borderRadius: 'var(--atlas-radius-lg, 8px)',
          border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        }}
      >
        <EmptyState>
          <EmptyStateIcon>
            <PromptLibraryEmptyIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>Your prompt library is empty</EmptyStateTitle>
          <EmptyStateDescription>
            Start building your collection of structured, reusable prompts. Organize with tags, categories, collections, and media attachments.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button variant="primary" onClick={onCreatePrompt}>
              Create First Prompt
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </div>
    );
  }

  return (
    <Masonry
      columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
      gap="4"
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onTagClick={onTagClick}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </Masonry>
  );
}
