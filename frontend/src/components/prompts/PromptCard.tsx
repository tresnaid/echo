import React, { useState } from 'react';
import {
  Heading,
  Text,
  Badge,
  IconButton,
  Tag,
} from '@tresnaid/atlas';
import { Prompt } from '../../types';
import { getMediaUrl } from '../../api/config';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

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

function CopyIcon({ size = 14 }: { size?: number }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const CATEGORY_META: Record<string, { intent: 'info' | 'neutral' | 'success' | 'warning' | 'danger'; label: string; accentColor: string }> = {
  text: { intent: 'info', label: 'Text', accentColor: '#3b82f6' },
  code: { intent: 'neutral', label: 'Code', accentColor: '#8b5cf6' },
  image: { intent: 'success', label: 'Image', accentColor: '#10b981' },
  video: { intent: 'warning', label: 'Video', accentColor: '#f59e0b' },
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
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const categoryKey = (prompt.category_id || 'text').toLowerCase();
  const categoryInfo = CATEGORY_META[categoryKey] || CATEGORY_META.text;
  const primaryMedia = prompt.media && prompt.media.length > 0 ? prompt.media[0] : null;

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Inspect prompt: ${prompt.title}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--atlas-radius-lg, 8px)',
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: isHovered
          ? '1px solid var(--atlas-color-border-focus, #93c5fd)'
          : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        boxShadow: isHovered
          ? '0 8px 20px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)'
          : '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onOpenDetails) onOpenDetails(prompt);
        }
      }}
      onClick={() => {
        if (onOpenDetails) onOpenDetails(prompt);
      }}
    >
      {/* Top Category Accent Line */}
      <div
        style={{
          width: '100%',
          height: '3px',
          backgroundColor: categoryInfo.accentColor,
          flexShrink: 0,
        }}
      />

      {/* Visual Media Preview Banner (if media present) */}
      {primaryMedia ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: primaryMedia.media_type === 'video' ? '#0f172a' : 'var(--atlas-color-bg-subtle, #f1f5f9)',
            ...(primaryMedia.aspect_ratio ? { aspectRatio: String(primaryMedia.aspect_ratio).replace(':', '/') } : {}),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primaryMedia.media_type === 'image' ? (
            <img
              src={getMediaUrl(primaryMedia.thumbnail_url || primaryMedia.medium_url || primaryMedia.url)}
              alt={primaryMedia.caption || prompt.title}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {primaryMedia.thumbnail_url ? (
                <img
                  src={getMediaUrl(primaryMedia.thumbnail_url)}
                  alt={primaryMedia.caption || prompt.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    opacity: 0.9,
                  }}
                />
              ) : (
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#0f172a' }} />
              )}
              <div
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.82)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <PlayIcon size={10} />
                <span>VIDEO</span>
              </div>
            </div>
          )}

          {/* Multiple Media Indicator */}
          {prompt.media && prompt.media.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              +{prompt.media.length - 1}
            </div>
          )}
        </div>
      ) : null}

      {/* Main Content Body */}
      <div
        style={{
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexGrow: 1,
        }}
      >
        {/* Category & Collection Bar with Quick Copy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', minWidth: 0 }}>
            <Badge variant="subtle" intent={categoryInfo.intent} size="sm">
              {categoryInfo.label}
            </Badge>

            {prompt.collection_name && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--atlas-color-text-muted, #64748b)',
                  backgroundColor: 'var(--atlas-color-bg-subtle, #f1f5f9)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={`Collection: ${prompt.collection_name}`}
              >
                {prompt.collection_name}
              </span>
            )}
          </div>

          <IconButton
            size="sm"
            variant="ghost"
            aria-label={copied ? 'Copied to clipboard' : 'Copy prompt text'}
            title={copied ? 'Copied!' : 'Copy raw prompt text'}
            icon={copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            onClick={handleCopy}
            style={{
              minWidth: '28px',
              minHeight: '28px',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              backgroundColor: copied
                ? '#dcfce7'
                : isHovered
                ? 'var(--atlas-color-bg-subtle, #f1f5f9)'
                : 'transparent',
              border: copied
                ? '1px solid #86efac'
                : '1px solid transparent',
              color: copied
                ? '#15803d'
                : 'var(--atlas-color-text-secondary, #475569)',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Prompt Title */}
        <Heading
          level={3}
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.4,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--atlas-color-text-primary, #0f172a)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {prompt.title}
        </Heading>

        {/* Short Description */}
        {prompt.description && (
          <Text
            size="sm"
            color="secondary"
            style={{
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              color: 'var(--atlas-color-text-secondary, #475569)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              margin: 0,
            }}
          >
            {prompt.description}
          </Text>
        )}

        {/* Tags Footer (if any) */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              marginTop: 'auto',
              paddingTop: '0.25rem',
            }}
          >
            {prompt.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                onClick={
                  onTagClick
                    ? (e) => {
                        e.stopPropagation();
                        onTagClick(tag);
                      }
                    : undefined
                }
              >
                <Tag
                  size="sm"
                  variant="subtle"
                  intent="neutral"
                  style={{
                    fontSize: '0.6875rem',
                    padding: '0 4px',
                    cursor: onTagClick ? 'pointer' : 'default',
                  }}
                >
                  #{tag}
                </Tag>
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--atlas-color-text-muted, #94a3b8)',
                  alignSelf: 'center',
                }}
              >
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
