import { useEffect, useState } from 'react';
import { Prompt } from '../../types';
import { getMediaUrl } from '../../api/config';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onTagClick?: (tag: string) => void;
}

export function PromptDetailModal({ prompt, isOpen, onClose, onEdit, onDelete, onTagClick }: PromptDetailModalProps) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', close);
    document.body.classList.add('echo-modal-open');
    return () => { document.removeEventListener('keydown', close); document.body.classList.remove('echo-modal-open'); };
  }, [isOpen, onClose]);
  if (!prompt || !isOpen) return null;

  const media = prompt.media || [];
  const activeMedia = media[mediaIndex] || media[0];
  const copy = async () => {
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="echo-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="echo-detail-panel" role="dialog" aria-modal="true" aria-labelledby="echo-detail-title">
        <div className="echo-detail-actions">
          <span>{(prompt.category_id || 'text').toUpperCase()} / {prompt.collection_name || 'UNCOLLECTED'}</span>
          <div><button type="button" onClick={() => onEdit(prompt)}>Edit prompt</button><button type="button" className="is-danger" onClick={() => onDelete(prompt)}>Delete</button><button type="button" onClick={onClose}>Close</button></div>
        </div>
        <h2 id="echo-detail-title">{prompt.title}</h2>
        <div className="echo-detail-metadata">
          <span>{prompt.collection_name || 'Uncollected'}</span>
          <span>Created {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(prompt.created_at))}</span>
          {!!media.length && <span>{media.length} media {media.length === 1 ? 'file' : 'files'}</span>}
        </div>

        {activeMedia && (
          <section className="echo-detail-media">
            {activeMedia.media_type === 'image' ? <img src={getMediaUrl(activeMedia.url)} alt={activeMedia.caption || prompt.title} /> : <video src={getMediaUrl(activeMedia.url)} poster={getMediaUrl(activeMedia.thumbnail_url)} controls />}
            {media.length > 1 && <div className="echo-media-tabs">{media.map((item, index) => <button type="button" className={index === mediaIndex ? 'is-active' : ''} key={item.id || index} onClick={() => setMediaIndex(index)}>{index + 1}</button>)}</div>}
          </section>
        )}

        <div className="echo-detail-summary">
          {prompt.description && <section><h3>Description</h3><p>{prompt.description}</p></section>}
          {!!prompt.tags?.length && <section><h3>Tags</h3><div className="echo-detail-tags">{prompt.tags.map((tag) => <button type="button" key={tag} onClick={() => onTagClick?.(tag)}>{tag}</button>)}</div></section>}
        </div>

        <section className="echo-raw-prompt echo-detail-prompt">
          <div><span>PROMPT TEXT</span><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div>
          <pre>{prompt.prompt_text}</pre>
        </section>
        {prompt.usage_description && <section className="echo-detail-usage"><h3>Usage notes</h3><p>{prompt.usage_description}</p></section>}
        <div className="echo-detail-bottom"><button type="button" onClick={onClose}>Back to library</button><button type="button" className="echo-button echo-button-primary" onClick={copy}>{copied ? 'Copied' : 'Copy prompt'}</button></div>
      </article>
    </div>
  );
}
