import { useState } from 'react';
import {
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
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
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
  onTagClick,
  onOpenDetails,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--atlas-radius-md, 6px)',
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: isHovered
          ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
          : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        boxShadow: isHovered
          ? 'var(--atlas-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08))'
          : 'var(--atlas-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.04))',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onOpenDetails) onOpenDetails(prompt);
      }}
    >
      {/* Top Header: Category & Collection Badges */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--atlas-color-border-subtle, #f1f5f9)',
          backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <Stack direction="horizontal" align="center" gap="2" wrap="wrap">
          {prompt.category_id ? (
            <Badge variant="subtle" intent={categoryIntent} size="sm">
              {prompt.category_name || prompt.category_id.toUpperCase()}
            </Badge>
          ) : (
            <Badge variant="subtle" intent="neutral" size="sm">
              TEXT
            </Badge>
          )}

          {prompt.collection_name && (
            <Badge variant="outline" intent="neutral" size="sm">
              {prompt.collection_name}
            </Badge>
          )}
        </Stack>

        <Text size="xs" color="muted">
          {new Date(prompt.created_at).toLocaleDateString()}
        </Text>
      </div>

      {/* Main Content Body (Fits content height) */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Title */}
        <Heading
          level={3}
          style={{
            fontSize: '1rem',
            lineHeight: 1.4,
            fontWeight: 600,
            color: 'var(--atlas-color-text-primary, #0f172a)',
            margin: 0,
          }}
        >
          {prompt.title}
        </Heading>

        {/* Short Description */}
        {prompt.description ? (
          <Text
            size="sm"
            color="secondary"
            style={{
              lineHeight: 1.45,
              fontSize: '0.8125rem',
            }}
          >
            {prompt.description}
          </Text>
        ) : null}

        {/* Prompt Preview Snippet */}
        <div
          style={{
            marginTop: '0.25rem',
            padding: '0.5rem 0.625rem',
            borderRadius: 'var(--atlas-radius-sm, 4px)',
            backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
            border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
            fontFamily: 'var(--atlas-font-mono, monospace)',
            fontSize: '0.78125rem',
            lineHeight: 1.4,
            color: 'var(--atlas-color-text-secondary, #475569)',
            maxHeight: '4.8em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {prompt.prompt_text}
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              paddingTop: '0.25rem',
            }}
          >
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
      </div>

      {/* Footer Action: Single Tasteful Copy Button */}
      <div
        style={{
          padding: '0.625rem 1rem 0.75rem 1rem',
          borderTop: '1px solid var(--atlas-color-border-subtle, #f1f5f9)',
          backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant={copied ? 'primary' : 'outline'}
          size="sm"
          onClick={handleCopy}
          style={{
            fontWeight: 500,
            fontSize: '0.8125rem',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {copied ? 'Copied' : 'Copy Prompt'}
        </Button>
      </div>
    </div>
  );
}
