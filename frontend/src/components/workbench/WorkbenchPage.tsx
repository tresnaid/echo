import { useEffect, useMemo, useState } from 'react';
import { Category, Collection, Prompt } from '../../types';
import { getMediaUrl } from '../../api/config';
import { EchoHeader } from '../layout/EchoHeader';
import { EchoFooter } from '../layout/EchoFooter';

interface HealthStatus { status: string; database: string; timestamp: string; }
interface WorkbenchPageProps {
  prompts: Prompt[];
  categories: Category[];
  collections: Collection[];
  availableTags: string[];
  health: HealthStatus | null;
  loading: boolean;
  onOpenCreatePrompt: () => void;
  onOpenEditPrompt: (prompt: Prompt) => void;
  onOpenLibrary: () => void;
  onOpenLanding: () => void;
}

export function WorkbenchPage({ prompts, collections, health, loading, onOpenCreatePrompt, onOpenEditPrompt, onOpenLibrary, onOpenLanding }: WorkbenchPageProps) {
  const [type, setType] = useState('all');
  const [collection, setCollection] = useState('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => prompts.filter((prompt) => {
    if (type !== 'all' && prompt.category_id !== type) return false;
    if (collection === 'uncollected' && prompt.collection_id != null) return false;
    if (collection !== 'all' && collection !== 'uncollected' && prompt.collection_id !== Number(collection)) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      return [prompt.title, prompt.description || '', prompt.prompt_text, ...(prompt.tags || [])].some((value) => value.toLowerCase().includes(query));
    }
    return true;
  }), [prompts, type, collection, search]);

  useEffect(() => {
    if (!activeId && filtered[0]) setActiveId(filtered[0].id);
    if (activeId && !filtered.some((prompt) => prompt.id === activeId)) setActiveId(filtered[0]?.id || null);
  }, [activeId, filtered]);

  const active = filtered.find((prompt) => prompt.id === activeId) || filtered[0];
  const media = active?.media?.[0];
  const navigate = (view: 'overview' | 'library' | 'workbench') => {
    if (view === 'overview') onOpenLanding();
    if (view === 'library') onOpenLibrary();
  };
  const copy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.prompt_text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="echo-page echo-workbench-page">
      <EchoHeader active="workbench" onNavigate={navigate} onNewPrompt={onOpenCreatePrompt} />
      <main>
        <section className="echo-page-title">
          <div><h1>Workbench</h1><p>Inspect and copy a prompt without leaving the library.</p></div>
        </section>
        <div className="echo-workbench-filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search prompts" aria-label="Search prompts" />
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Prompt type">
            <option value="all">All types</option><option value="text">Text</option><option value="code">Code</option><option value="image">Image</option><option value="video">Video</option>
          </select>
          <select value={collection} onChange={(event) => setCollection(event.target.value)} aria-label="Collection">
            <option value="all">All collections</option><option value="uncollected">Uncollected</option>
            {collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <span>{filtered.length} prompts</span>
        </div>

        <section className="echo-workbench-body">
          <aside className="echo-workbench-list" aria-label="Prompt results">
            {loading ? <p>Loading prompts...</p> : filtered.map((prompt) => (
              <button type="button" className={prompt.id === active?.id ? 'is-active' : ''} key={prompt.id} onClick={() => setActiveId(prompt.id)}>
                <span>{(prompt.category_id || 'text').toUpperCase()}</span><strong>{prompt.title}</strong>
              </button>
            ))}
          </aside>

          <article className="echo-inspector">
            {!active ? (
              <div className="echo-empty-state"><h2>No prompts found</h2><p>Clear the search or change a filter.</p></div>
            ) : (
              <>
                <div className="echo-inspector-meta">
                  <span>{(active.category_id || 'text').toUpperCase()} / {active.collection_name || 'UNCOLLECTED'} / ID #{active.id}</span>
                  <div><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy prompt'}</button><button type="button" onClick={() => onOpenEditPrompt(active)}>Edit</button></div>
                </div>
                <h2>{active.title}</h2>
                {active.description && <p className="echo-inspector-description">{active.description}</p>}
                {media && (
                  <div className="echo-inspector-media">
                    {media.media_type === 'image' ? <img src={getMediaUrl(media.medium_url || media.url)} alt={media.caption || active.title} /> : <video src={getMediaUrl(media.url)} poster={getMediaUrl(media.thumbnail_url)} controls />}
                  </div>
                )}
                <section className="echo-raw-prompt"><div><span>RAW PROMPT</span><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div><pre>{active.prompt_text}</pre></section>
                {!!active.tags?.length && <section className="echo-inspector-notes"><span className="echo-kicker">TAGS</span><p className="echo-mono">{active.tags.join('   ')}</p></section>}
                {active.usage_description && <section className="echo-inspector-notes"><h3>Usage notes</h3><p>{active.usage_description}</p></section>}
              </>
            )}
          </article>
        </section>
      </main>
      <EchoFooter onNavigate={navigate} status={health?.status === 'ok' ? 'online' : 'offline'} />
    </div>
  );
}

export default WorkbenchPage;
