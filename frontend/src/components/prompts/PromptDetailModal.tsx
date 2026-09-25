import { useState } from 'react';
import {
  Dialog,
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

const CATEGORY_META: Record<string, { intent: 'info' | 'neutral' | 'success' | 'warning' | 'danger'; label: string }> = {
  text: { intent: 'info', label: 'Text' },
  code: { intent: 'neutral', label: 'Code' },
  image: { intent: 'success', label: 'Image' },
  video: { intent: 'warning', label: 'Video' },
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

function ExternalLinkIcon({ size = 12 }: { size?: number }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
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

  const categoryKey = (prompt.category_id || 'text').toLowerCase();
  const categoryInfo = CATEGORY_META[categoryKey] || CATEGORY_META.text;

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
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

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Done
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
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: 'calc(80vh - 120px)',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {/* Metadata & Taxonomy Header Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.625rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="subtle" intent={categoryInfo.intent} size="md">
              {prompt.category_name || categoryInfo.label}
            </Badge>

            {prompt.collection_name && (
              <Badge variant="outline" intent="neutral" size="md">
                📁 {prompt.collection_name}
              </Badge>
            )}
          </div>

          <Text size="xs" color="muted" style={{ fontWeight: 500 }}>
            Created on {new Date(prompt.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </div>

        {/* Media Showcase / Viewer */}
        {mediaList.length > 0 && activeMedia && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              borderRadius: 'var(--atlas-radius-lg, 8px)',
              backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
              border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
              padding: '0.75rem',
              flexShrink: 0,
            }}
          >
            {/* Active Media Container */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem 0',
              }}
            >
              {activeMedia.media_type === 'image' ? (
                <img
                  src={getMediaUrl(activeMedia.url || activeMedia.medium_url || activeMedia.thumbnail_url)}
                  alt={activeMedia.caption || prompt.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'min(520px, 55vh)',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: 'var(--atlas-radius-md, 6px)',
                    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
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
                    maxWidth: '100%',
                    maxHeight: 'min(520px, 55vh)',
                    width: 'auto',
                    height: 'auto',
                    backgroundColor: '#0f172a',
                    display: 'block',
                    borderRadius: 'var(--atlas-radius-md, 6px)',
                    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
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
                padding: '0.125rem 0.25rem',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <Badge variant="subtle" intent={activeMedia.media_type === 'video' ? 'warning' : 'info'} size="sm">
                  {activeMedia.media_type.toUpperCase()}
                </Badge>
                {activeMedia.caption && (
                  <Text size="xs" color="secondary" truncate>
                    {activeMedia.caption}
                  </Text>
                )}
              </div>

              <a
                href={getMediaUrl(activeMedia.url)}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--atlas-color-text-brand, #2563eb)',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                <span>Full resolution</span>
                <ExternalLinkIcon size={11} />
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
                  WebkitOverflowScrolling: 'touch',
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
                        width: '60px',
                        height: '44px',
                        flexShrink: 0,
                        borderRadius: 'var(--atlas-radius-sm, 4px)',
                        overflow: 'hidden',
                        padding: 0,
                        border: isSelected
                          ? '2px solid var(--atlas-color-border-focus, #3b82f6)'
                          : '1px solid var(--atlas-color-border-subtle, #cbd5e1)',
                        cursor: 'pointer',
                        backgroundColor: '#0f172a',
                        transition: 'all 0.15s ease',
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

        {/* Short Description */}
        {prompt.description && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atlas-color-text-muted, #64748b)',
              }}
            >
              Description
            </span>
            <Text size="sm" color="secondary" style={{ lineHeight: 1.6 }}>
              {prompt.description}
            </Text>
          </div>
        )}

        {/* Exact Raw Prompt Text with 1-click Copy via CodeSnippet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atlas-color-text-muted, #64748b)',
              }}
            >
              Prompt Text
            </span>
          </div>
          <CodeSnippet
            title="Raw Prompt"
            text={prompt.prompt_text}
            language={prompt.category_name || (prompt.category_id ? prompt.category_id.toUpperCase() : 'TEXT')}
            variant="subtle"
            scrollable
            showCopyButton
            copyLabel="Copy Prompt"
            copiedLabel="Copied!"
          />
        </div>

        {/* Usage Instructions */}
        {prompt.usage_description && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atlas-color-text-muted, #64748b)',
              }}
            >
              Usage Instructions
            </span>
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--atlas-radius-md, 6px)',
                backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
                border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                color: 'var(--atlas-color-text-secondary, #334155)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {prompt.usage_description}
            </div>
          </div>
        )}

        {/* Interactive Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atlas-color-text-muted, #64748b)',
              }}
            >
              Tags ({prompt.tags.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {prompt.tags.map((tag, idx) => (
                <Tag
                  key={idx}
                  size="md"
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
      </div>
    </Dialog>
  );
}
