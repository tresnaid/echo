import { Card, Stack, Heading, Text, Button } from '@atlas/ds';
import { Prompt } from '../../types';
import { PromptCard } from './PromptCard';
import './PromptGrid.css';

interface PromptGridProps {
  prompts: Prompt[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreatePrompt: () => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

export function PromptGrid({
  prompts,
  loading,
  hasActiveFilters,
  onClearFilters,
  onCreatePrompt,
  onEditPrompt,
  onDeletePrompt,
  onTagClick,
  onOpenDetails,
}: PromptGridProps) {
  if (loading) {
    return (
      <Card variant="outline" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <Text color="muted">Loading prompts...</Text>
      </Card>
    );
  }

  if (prompts.length === 0) {
    return (
      <Card variant="outline" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
        <Stack direction="vertical" align="center" gap="3">
          <Heading level={4}>No prompts found</Heading>
          <Text color="muted" style={{ maxWidth: '420px', lineHeight: 1.5 }}>
            {hasActiveFilters
              ? 'No prompts match your current search and filter criteria. Try clearing or adjusting your filters.'
              : 'There are no prompts in this view yet. Start building your library by creating a new prompt.'}
          </Text>
          <Stack direction="horizontal" gap="3">
            {hasActiveFilters ? (
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={onCreatePrompt}>
                + Create First Prompt
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <div className="echo-prompt-grid">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEditPrompt}
          onDelete={onDeletePrompt}
          onTagClick={onTagClick}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
