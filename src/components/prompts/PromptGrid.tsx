import { useState, useEffect } from 'react';
import { Card, Stack, Heading, Text, Button } from '@atlas/ds';
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

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w >= 1400) return 4;
    if (w >= 1024) return 3;
    if (w >= 600) return 2;
    return 1;
  });

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1400) setColumnCount(4);
      else if (w >= 1024) setColumnCount(3);
      else if (w >= 600) setColumnCount(2);
      else setColumnCount(1);
    };

    window.addEventListener('resize', updateColumns);
    updateColumns();
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columnCount;
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
  const columnCount = useColumnCount();

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
                Create First Prompt
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    );
  }

  // Distribute prompts across columns in row-first order
  const columns: Prompt[][] = Array.from({ length: columnCount }, () => []);
  prompts.forEach((prompt, index) => {
    columns[index % columnCount].push(prompt);
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: columnCount === 1 ? '0.875rem' : '1.25rem',
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      {columns.map((colPrompts, colIdx) => (
        <div
          key={colIdx}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: columnCount === 1 ? '0.875rem' : '1.25rem',
          }}
        >
          {colPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onTagClick={onTagClick}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
