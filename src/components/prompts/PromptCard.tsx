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

  const primaryMedia = prompt.media && prompt.media.length > 0 ? prompt.media[0] : null;

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
      {/* Visual Media Preview Banner */}
      {primaryMedia && (
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
      )}

      {/* Main Content Body: Title only */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
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
      </div>

      {/* Footer Action: Single Full-Width Copy Action */}
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

