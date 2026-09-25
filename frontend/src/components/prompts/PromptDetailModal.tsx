import { useState } from 'react';
import {
  Dialog,
  Stack,
  Text,
  Badge,
  Tag,
  Button,
  CodeSnippet,
} from '@tresnaid/atlas';
import { Prompt, PromptMedia } from '../../types';
import { getMediaUrl } from '../../api/config';

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

function PlayIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function ImageIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTagClick,
}: PromptDetailModalProps) {
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  if (!prompt) return null;

  const categoryIntent = prompt.category_id
    ? CATEGORY_INTENTS[prompt.category_id.toLowerCase()] || 'info'
    : 'neutral';

  const mediaList = prompt.media || [];
  const activeMedia: PromptMedia | undefined = mediaList[selectedMediaIdx] || mediaList[0];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedMediaIdx(0);
          onClose();
        }
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

          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(prompt);
            }}
          >
            Edit Prompt
          </Button>
        </div>
      }
    >
      <Stack direction="vertical" gap="4">
        {/* Media Showcase / Viewer */}
        {mediaList.length > 0 && activeMedia && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              overflow: 'hidden',
              backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
              border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
              padding: '0.75rem',
            }}
          >
            {/* Active Media Container */}
            <div
              style={{
                width: '100%',
                maxHeight: 'min(380px, 45vh)',
                borderRadius: 'var(--atlas-radius-sm, 4px)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activeMedia.media_type === 'video' ? '#0f172a' : '#000000',
              }}
            >
              {activeMedia.media_type === 'image' ? (
                <img
                  src={getMediaUrl(activeMedia.medium_url || activeMedia.url)}
                  alt={activeMedia.caption || prompt.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'min(380px, 45vh)',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <video
                  key={activeMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  poster={activeMedia.medium_url || activeMedia.thumbnail_url ? getMediaUrl(activeMedia.medium_url || activeMedia.thumbnail_url) : undefined}
                  src={getMediaUrl(activeMedia.url)}
                  style={{
                    width: '100%',
                    maxHeight: 'min(380px, 45vh)',
                    backgroundColor: '#0f172a',
                    display: 'block',
                  }}
                />
              )}
            </div>

            {/* Media Metadata & Caption */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="subtle" intent={activeMedia.media_type === 'video' ? 'warning' : 'info'} size="sm">
                  {activeMedia.media_type.toUpperCase()}
                </Badge>
                {activeMedia.caption && (
                  <Text size="xs" color="secondary">
                    {activeMedia.caption}
                  </Text>
                )}
              </div>

              <a
                href={getMediaUrl(activeMedia.url)}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--atlas-color-text-brand, #2563eb)',
                  textDecoration: 'none',
                }}
              >
                Open original
              </a>
            </div>

            {/* Media Thumbnail Strip (if multiple media items) */}
            {mediaList.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingTop: '0.25rem',
                  paddingBottom: '0.25rem',
                }}
              >
                {mediaList.map((m, idx) => {
                  const isSelected = idx === selectedMediaIdx;
                  return (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => setSelectedMediaIdx(idx)}
                      style={{
                        position: 'relative',
                        width: '56px',
                        height: '42px',
                        flexShrink: 0,
                        borderRadius: '4px',
                        overflow: 'hidden',
                        padding: 0,
                        border: isSelected
                          ? '2px solid var(--atlas-color-border-focus, #3b82f6)'
                          : '1px solid var(--atlas-color-border-subtle, #cbd5e1)',
                        cursor: 'pointer',
                        backgroundColor: '#0f172a',
                      }}
                    >
                      {m.thumbnail_url || m.url ? (
                        <img
                          src={getMediaUrl(m.thumbnail_url || m.url)}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                          }}
                        >
                          {m.media_type === 'video' ? <PlayIcon size={12} /> : <ImageIcon size={12} />}
                        </div>
                      )}
                      {m.media_type === 'video' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            borderRadius: '2px',
                            padding: '1px 3px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <PlayIcon size={8} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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

        {/* Raw Prompt Text with 1-click Copy via CodeSnippet */}
        <div>
          <CodeSnippet
            title="Prompt Text"
            text={prompt.prompt_text}
            language={prompt.category_name || (prompt.category_id ? prompt.category_id.toUpperCase() : 'TEXT')}
            variant="subtle"
            scrollable
            showCopyButton
            copyLabel="Copy Text"
            copiedLabel="Copied!"
          />
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
