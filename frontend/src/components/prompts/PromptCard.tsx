import { useState } from 'react';
import { Prompt } from '../../types';
import { getMediaUrl } from '../../api/config';

interface PromptCardProps {
  prompt: Prompt;
  onTagClick?: (tag: string) => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, onTagClick, onOpenDetails }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const media = prompt.media?.[0];
  const type = (prompt.category_id || 'text').toUpperCase();

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article
      className={`echo-prompt-card is-${(prompt.category_id || 'text').toLowerCase()}`}
      tabIndex={0}
      role="button"
      aria-label={`Open ${prompt.title}`}
      onClick={() => onOpenDetails?.(prompt)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails?.(prompt);
        }
      }}
    >
      <div className="echo-prompt-card-body">
        <div className="echo-card-meta">
          <span>{type}</span>
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <h3>{prompt.title}</h3>
        {prompt.description && <p>{prompt.description}</p>}
        {!!prompt.tags?.length && (
          <div className="echo-card-tags">
            {prompt.tags.slice(0, 4).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={(event) => {
                  event.stopPropagation();
                  onTagClick?.(tag);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {media && (
        <div className="echo-card-media">
          {media.media_type === 'image' ? (
            <img
              src={getMediaUrl(media.medium_url || media.thumbnail_url || media.url)}
              alt={media.caption || prompt.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
                event.currentTarget.parentElement?.classList.add('is-unavailable');
              }}
            />
          ) : (
            <div className="echo-video-preview">
              {media.thumbnail_url ? <img src={getMediaUrl(media.thumbnail_url)} alt={media.caption || prompt.title} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.parentElement?.classList.add('is-unavailable'); }} /> : <video src={getMediaUrl(media.url)} preload="metadata" />}
              <span>Video</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
