import { useState, useEffect } from 'react';
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  Button,
  Badge,
  Tag,
  Skeleton,
} from '@tresnaid/atlas';
import { Prompt } from '../../types';
import { getMediaUrl } from '../../api/config';

interface PromptShowcaseViewProps {
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

const CATEGORY_COLORS: Record<string, { badge: string; text: string; bg: string }> = {
  text: { badge: 'info', text: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
  code: { badge: 'neutral', text: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
  image: { badge: 'success', text: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
  video: { badge: 'warning', text: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
};

export function PromptShowcaseView({
  prompts,
  loading,
  hasActiveFilters,
  onClearFilters,
  onCreatePrompt,
  onEditPrompt,
  onDeletePrompt: _onDeletePrompt,
  onTagClick,
  onOpenDetails,
}: PromptShowcaseViewProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompts.length > 0) {
      if (!selectedPromptId || !prompts.some((p) => p.id === selectedPromptId)) {
        setSelectedPromptId(prompts[0].id);
      }
    } else {
      setSelectedPromptId(null);
    }
  }, [prompts, selectedPromptId]);

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1rem',
          height: '620px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="80px" style={{ borderRadius: '10px' }} />
          ))}
        </div>
        <Skeleton height="620px" style={{ borderRadius: '12px' }} />
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <EmptyState style={{ padding: '3rem 1rem' }}>
        <EmptyStateIcon>
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--atlas-color-text-muted, #94a3b8)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </EmptyStateIcon>
        <EmptyStateTitle>
          {hasActiveFilters ? 'No matching prompts' : 'Your prompt showcase is empty'}
        </EmptyStateTitle>
        <EmptyStateDescription>
          {hasActiveFilters
            ? 'Try adjusting your search criteria or resetting filters.'
            : 'Add your first reusable prompt to start curating your showcase.'}
        </EmptyStateDescription>
        <EmptyStateActions>
          {hasActiveFilters ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button variant="primary" onClick={onCreatePrompt}>
              Create Prompt
            </Button>
          )}
        </EmptyStateActions>
      </EmptyState>
    );
  }

  const activePrompt = prompts.find((p) => p.id === selectedPromptId) || prompts[0];
  const catKey = (activePrompt.category_id || 'text').toLowerCase();
  const catMeta = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.text;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy prompt text:', err);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 340px) 1fr',
        gap: '1.25rem',
        minHeight: '640px',
        background: 'var(--atlas-color-bg-surface, #ffffff)',
        border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Master List Pane */}
      <aside
        style={{
          borderRight: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          background: 'var(--atlas-color-bg-canvas, #f8fafc)',
          padding: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflowY: 'auto',
          maxHeight: '750px',
        }}
        aria-label="Prompt List"
      >
        <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
          {prompts.length} {prompts.length === 1 ? 'Prompt' : 'Prompts'} Available
        </div>

        {prompts.map((p) => {
          const isSelected = p.id === activePrompt.id;
          const promptCat = (p.category_id || 'text').toLowerCase();
          const promptCatColor = CATEGORY_COLORS[promptCat]?.text || '#2563eb';

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPromptId(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPromptId(p.id);
                }
              }}
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '10px',
                background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                border: isSelected
                  ? '1px solid #3b82f6'
                  : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(59, 130, 246, 0.12)'
                  : '0 1px 2px rgba(0, 0, 0, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: promptCatColor,
                  }}
                >
                  {p.category_name || p.category_id || 'Text'}
                </span>
                {p.collection_name && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--atlas-color-text-muted, #64748b)',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.collection_name}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--atlas-color-text-primary, #0f172a)',
                  lineHeight: 1.35,
                }}
              >
                {p.title}
              </div>

              {p.description && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--atlas-color-text-secondary, #64748b)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.description}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {/* Detail / Inspector Pane */}
      <main
        style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
          maxHeight: '750px',
        }}
        aria-label="Prompt Inspector"
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Badge variant="subtle" intent={catMeta.badge as any} size="sm">
                {activePrompt.category_name || activePrompt.category_id || 'Text'}
              </Badge>
              {activePrompt.collection_name && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {activePrompt.collection_name}
                </span>
              )}
            </div>
            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--atlas-color-text-primary, #0f172a)',
                margin: 0,
              }}
            >
              {activePrompt.title}
            </h2>
            {activePrompt.description && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--atlas-color-text-secondary, #475569)',
                  margin: '0.35rem 0 0',
                  lineHeight: 1.5,
                }}
              >
                {activePrompt.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                background: copied ? '#10b981' : '#2563eb',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.15)',
              }}
            >
              {copied ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy Raw</span>
                </>
              )}
            </button>

            {onEditPrompt && (
              <Button variant="secondary" size="sm" onClick={() => onEditPrompt(activePrompt)}>
                Edit
              </Button>
            )}
            {onOpenDetails && (
              <Button variant="ghost" size="sm" onClick={() => onOpenDetails(activePrompt)}>
                Full View
              </Button>
            )}
          </div>
        </div>

        {/* Media Preview if attached */}
        {activePrompt.media && activePrompt.media.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem 0' }}>
            {activePrompt.media.map((m) => (
              <div
                key={m.id}
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  maxHeight: '160px',
                  flexShrink: 0,
                }}
              >
                {m.media_type === 'image' ? (
                  <img
                    src={getMediaUrl(m.thumbnail_url || m.medium_url || m.url)}
                    alt={m.caption || activePrompt.title}
                    style={{ height: '140px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '140px',
                      aspectRatio: '16/9',
                      background: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <span>Video Clip</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Raw Prompt Code Box */}
        <div
          style={{
            background: '#0f172a',
            color: '#f1f5f9',
            padding: '1.25rem',
            borderRadius: '10px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '340px',
            overflowY: 'auto',
            border: '1px solid #1e293b',
          }}
        >
          <code>{activePrompt.prompt_text}</code>
        </div>

        {/* Tags Row */}
        {activePrompt.tags && activePrompt.tags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Tags:</span>
            {activePrompt.tags.map((tag) => (
              <span
                key={tag}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
                style={{ cursor: onTagClick ? 'pointer' : 'default' }}
              >
                <Tag size="sm" variant="subtle" intent="neutral">
                  #{tag}
                </Tag>
              </span>
            ))}
          </div>
        )}

        {/* Usage Instructions if present */}
        {activePrompt.usage_description && (
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#334155',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Usage Notes:</span>{' '}
            {activePrompt.usage_description}
          </div>
        )}
      </main>
    </div>
  );
}
