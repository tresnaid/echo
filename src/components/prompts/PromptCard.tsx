import { useState } from 'react';
import {
  Heading,
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

const CATEGORY_STYLES: Record<
  string,
  { accent: string; bg: string; border: string; text: string; label: string }
> = {
  text: {
    accent: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
    label: 'TEXT',
  },
  code: {
    accent: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    text: '#6d28d9',
    label: 'CODE',
  },
  image: {
    accent: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#047857',
    label: 'IMAGE',
  },
  video: {
    accent: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#b45309',
    label: 'VIDEO',
  },
};

export function PromptCard({
  prompt,
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

  const categoryKey = (prompt.category_id || 'text').toLowerCase();
  const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.text;
  const primaryMedia = prompt.media && prompt.media.length > 0 ? prompt.media[0] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--atlas-radius-md, 6px)',
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: isHovered
          ? `1px solid ${categoryStyle.accent}`
          : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        borderTop: `3px solid ${categoryStyle.accent}`,
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
      {/* Visual Media Preview Banner (if media present) */}
      {primaryMedia ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '220px',
            overflow: 'hidden',
            backgroundColor: primaryMedia.media_type === 'video' ? '#0f172a' : 'var(--atlas-color-bg-subtle, #f1f5f9)',
            aspectRatio: primaryMedia.aspect_ratio ? String(Math.max(1, Math.min(2.2, primaryMedia.aspect_ratio))) : '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primaryMedia.media_type === 'image' ? (
            <img
              src={primaryMedia.thumbnail_url || primaryMedia.medium_url || primaryMedia.url}
              alt={primaryMedia.caption || prompt.title}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <>
              {primaryMedia.thumbnail_url && (
                <img
                  src={primaryMedia.thumbnail_url}
                  alt={primaryMedia.caption || prompt.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: 0.85,
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <PlayIcon size={10} />
                <span>VIDEO</span>
              </div>
            </>
          )}

          {prompt.media && prompt.media.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
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

      {/* Main Content Body: Title with Category Dot & Copy Icon */}
      <div
        style={{
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: categoryStyle.accent,
              flexShrink: 0,
            }}
            title={`Category: ${prompt.category_name || categoryStyle.label}`}
          />
          <Heading
            level={3}
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.4,
              fontWeight: 600,
              color: 'var(--atlas-color-text-primary, #0f172a)',
              margin: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {prompt.title}
          </Heading>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label={copied ? 'Copied' : 'Copy prompt text'}
          title={copied ? 'Copied!' : 'Copy prompt text'}
          onClick={handleCopy}
          style={{
            padding: '0.375rem',
            minWidth: '28px',
            height: '28px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--atlas-radius-sm, 4px)',
            color: copied ? 'var(--atlas-color-success-primary, #16a34a)' : 'var(--atlas-color-text-secondary, #64748b)',
            flexShrink: 0,
          }}
        >
          {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
        </Button>
      </div>
    </div>
  );
}



