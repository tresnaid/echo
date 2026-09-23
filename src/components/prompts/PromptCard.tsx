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
        justifyContent: 'space-between',
        borderRadius: 'var(--atlas-radius-lg, 8px)',
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: isHovered
          ? '1px solid var(--atlas-color-primary, #1e3a8a)'
          : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        boxShadow: isHovered
          ? 'var(--atlas-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))'
          : 'var(--atlas-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease-in-out',
        cursor: onOpenDetails ? 'pointer' : 'default',
        overflow: 'hidden',
        height: '100%',
        minHeight: '260px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onOpenDetails) onOpenDetails(prompt);
      }}
    >
      {/* Top Header / Meta Bar */}
      <div
        style={{
          padding: '0.875rem 1rem 0.625rem 1rem',
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
              📁 {prompt.collection_name}
            </Badge>
          )}
        </Stack>

        <Text size="xs" color="muted">
          {new Date(prompt.created_at).toLocaleDateString()}
        </Text>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          flexGrow: 1,
        }}
      >
        {/* Product Title */}
        <Heading
          level={3}
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.35,
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
            truncate={2}
            style={{
              lineHeight: 1.45,
              fontSize: '0.875rem',
            }}
          >
            {prompt.description}
          </Text>
        ) : null}

        {/* Prompt Preview Snippet */}
        <div
          style={{
            marginTop: '0.25rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--atlas-radius-md, 6px)',
            backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
            border: '1px dashed var(--atlas-color-border-subtle, #cbd5e1)',
            fontFamily: 'var(--atlas-font-mono, monospace)',
            fontSize: '0.8125rem',
            lineHeight: 1.4,
            color: 'var(--atlas-color-text-secondary, #334155)',
            maxHeight: '4.2em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
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
              gap: '0.375rem',
              marginTop: 'auto',
              paddingTop: '0.5rem',
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

      {/* Product Action / E-commerce Footer */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--atlas-color-border-subtle, #f1f5f9)',
          backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Direct Action: Copy Prompt Button */}
        <Button
          variant={copied ? 'primary' : 'outline'}
          size="sm"
          onClick={handleCopy}
          style={{
            fontWeight: 600,
            flexGrow: 1,
            justifyContent: 'center',
            fontSize: '0.875rem',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Prompt'}
        </Button>

        {/* Auxiliary Controls */}
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
    </div>
  );
}
