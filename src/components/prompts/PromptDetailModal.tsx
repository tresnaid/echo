import { useState } from 'react';
import {
  Dialog,
  Stack,
  Text,
  Badge,
  Tag,
  Button,
} from '@atlas/ds';
import { Prompt } from '../../types';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
}

const CATEGORY_INTENTS: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  text: 'info',
  code: 'neutral',
  image: 'success',
  video: 'warning',
};

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTagClick,
}: PromptDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt text:', err);
    }
  };

  const categoryIntent = prompt.category_id
    ? CATEGORY_INTENTS[prompt.category_id.toLowerCase()] || 'info'
    : 'neutral';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={prompt.title}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button
            variant="ghost"
            isDanger
            onClick={() => {
              onClose();
              onDelete(prompt);
            }}
          >
            Delete Prompt
          </Button>

          <Stack direction="horizontal" gap="2">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onEdit(prompt);
              }}
            >
              Edit
            </Button>
            <Button
              variant={copied ? 'primary' : 'primary'}
              onClick={handleCopy}
            >
              {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
            </Button>
          </Stack>
        </div>
      }
    >
      <Stack direction="vertical" gap="4">
        {/* Metadata Bar */}
        <Stack direction="horizontal" align="center" justify="between" wrap="wrap" gap="2">
          <Stack direction="horizontal" align="center" gap="2">
            {prompt.category_id ? (
              <Badge variant="subtle" intent={categoryIntent}>
                {prompt.category_name || prompt.category_id.toUpperCase()}
              </Badge>
            ) : (
              <Badge variant="subtle" intent="neutral">
                TEXT
              </Badge>
            )}

            {prompt.collection_name && (
              <Badge variant="outline" intent="neutral">
                {prompt.collection_name}
              </Badge>
            )}
          </Stack>

          <Text size="xs" color="muted">
            Created on {new Date(prompt.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </Stack>

        {/* Description */}
        {prompt.description && (
          <div>
            <Text size="xs" color="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
              Description
            </Text>
            <Text size="sm" color="secondary" style={{ lineHeight: 1.6 }}>
              {prompt.description}
            </Text>
          </div>
        )}

        {/* Raw Prompt Text Box */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <Text size="xs" color="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Prompt Text
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              style={{ fontSize: '0.8125rem' }}
            >
              {copied ? 'Copied' : 'Copy Text'}
            </Button>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
              border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
              fontFamily: 'var(--atlas-font-mono, monospace)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--atlas-color-text-primary, #0f172a)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {prompt.prompt_text}
          </div>
        </div>

        {/* Usage Instructions / Description */}
        {prompt.usage_description && (
          <div>
            <Text size="xs" color="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
              Usage Instructions
            </Text>
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--atlas-radius-md, 6px)',
                backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
                border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--atlas-color-text-secondary, #334155)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {prompt.usage_description}
            </div>
          </div>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <Text size="xs" color="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.375rem' }}>
              Tags
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {prompt.tags.map((tag, idx) => (
                <Tag
                  key={idx}
                  size="sm"
                  variant="subtle"
                  intent="neutral"
                  onSelect={
                    onTagClick
                      ? () => {
                          onClose();
                          onTagClick(tag);
                        }
                      : undefined
                  }
                  style={{ cursor: onTagClick ? 'pointer' : 'default' }}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Stack>
    </Dialog>
  );
}
