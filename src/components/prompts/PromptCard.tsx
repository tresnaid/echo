import { useState } from 'react';
import {
  Card,
  Stack,
  Heading,
  Text,
  Badge,
  Tag,
  Button,
} from '@atlas/ds';
import { Prompt } from '../../types';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

const CATEGORY_INTENTS: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  text: 'info',
  code: 'neutral',
  image: 'success',
  video: 'warning',
};

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onTagClick,
  onOpenDetails,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Copy exact raw prompt text without modification
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const categoryIntent = prompt.category_id
    ? CATEGORY_INTENTS[prompt.category_id.toLowerCase()] || 'info'
    : 'neutral';

  return (
    <Card
      variant="outline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: 'var(--atlas-radius-lg, 10px)',
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: '1px solid var(--atlas-color-border-subtle, #e5e7eb)',
        boxShadow: 'var(--atlas-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: onOpenDetails ? 'pointer' : 'default',
        position: 'relative',
        minHeight: '220px',
      }}
      onClick={() => {
        if (onOpenDetails) onOpenDetails(prompt);
      }}
    >
      <Stack direction="vertical" gap="3" style={{ flexGrow: 1 }}>
        {/* Top Product Header: Category & Collection Badges */}
        <Stack direction="horizontal" align="center" justify="between" wrap="wrap" gap="2">
          <Stack direction="horizontal" align="center" gap="2">
            {prompt.category_id ? (
              <Badge variant="subtle" intent={categoryIntent} size="sm">
                {prompt.category_name || prompt.category_id.toUpperCase()}
              </Badge>
            ) : (
              <Badge variant="subtle" intent="neutral" size="sm">
                GENERAL
              </Badge>
            )}

            {prompt.collection_name && (
              <Badge variant="outline" intent="neutral" size="sm">
                📁 {prompt.collection_name}
              </Badge>
            )}
          </Stack>

          {/* Quick timestamp */}
          <Text size="xs" color="muted">
            {new Date(prompt.created_at).toLocaleDateString()}
          </Text>
        </Stack>

        {/* Title */}
        <Heading
          level={3}
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.35,
            fontWeight: 600,
            color: 'var(--atlas-color-text-primary, #111827)',
          }}
        >
          {prompt.title}
        </Heading>

        {/* Short Description */}
        {prompt.description ? (
          <Text
            size="sm"
            color="secondary"
            truncate={2}
            style={{
              lineHeight: 1.45,
              minHeight: '2.9em',
            }}
          >
            {prompt.description}
          </Text>
        ) : (
          <Text
            size="sm"
            color="muted"
            style={{
              fontStyle: 'italic',
              minHeight: '2.9em',
            }}
          >
            No description provided.
          </Text>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: 'auto' }}>
            {prompt.tags.map((tag, idx) => (
              <Tag
                key={idx}
                size="sm"
                variant="subtle"
                intent="neutral"
                onSelect={
                  onTagClick
                    ? () => onTagClick(tag)
                    : undefined
                }
                style={{ cursor: onTagClick ? 'pointer' : 'default' }}
              >
                #{tag}
              </Tag>
            ))}
          </div>
        )}
      </Stack>

      {/* Card Action Footer */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--atlas-color-border-subtle, #f3f4f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* One-Click Fast Copy Action Button */}
        <Button
          variant={copied ? 'primary' : 'outline'}
          size="sm"
          onClick={handleCopy}
          style={{
            fontWeight: 500,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          {copied ? '✓ Copied to Clipboard!' : '📋 Copy Prompt'}
        </Button>

        {/* Actions (Edit / Delete) */}
        <Stack direction="horizontal" gap="1" align="center">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${prompt.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prompt);
            }}
            style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.8125rem' }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isDanger
            aria-label={`Delete ${prompt.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prompt);
            }}
            style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.8125rem' }}
          >
            Delete
          </Button>
        </Stack>
      </div>
    </Card>
  );
}
