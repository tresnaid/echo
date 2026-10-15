import { useState, useMemo } from 'react';
import {
  Container,
  Heading,
  Badge,
  Button,
} from '@tresnaid/atlas';
import { Prompt, Category, Collection } from '../../types';
import './workbench.css';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

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

interface ExtractedParam {
  name: string;
  type: 'variable' | 'placeholder' | 'flag';
}

function extractParameters(text: string): ExtractedParam[] {
  const params: ExtractedParam[] = [];
  const seen = new Set<string>();

  // 1. Match {variable_name}
  const varMatches = text.matchAll(/\{([a-zA-Z0-9_-]+)\}/g);
  for (const match of varMatches) {
    const raw = match[0];
    if (!seen.has(raw)) {
      seen.add(raw);
      params.push({ name: raw, type: 'variable' });
    }
  }

  // 2. Match [PLACEHOLDER]
  const placeholderMatches = text.matchAll(/\[([A-Za-z0-9_\s/.-]+)\]/g);
  for (const match of placeholderMatches) {
    const raw = match[0];
    if (!seen.has(raw) && raw.length < 50) {
      seen.add(raw);
      params.push({ name: raw, type: 'placeholder' });
    }
  }

  // 3. Match --flags (e.g. --ar 16:9, --v 6.1, --style raw, --c 5)
  const flagMatches = text.matchAll(/--([a-zA-Z0-9_-]+(?:\s+[^\s-]+)?)/g);
  for (const match of flagMatches) {
    const raw = match[0].trim();
    if (!seen.has(raw)) {
      seen.add(raw);
      params.push({ name: raw, type: 'flag' });
    }
  }

  return params;
}

export function WorkbenchPage({
  prompts,
  categories: _categories,
  collections,
  health,
  loading,
  onOpenCreatePrompt,
  onOpenEditPrompt,
  onOpenLibrary,
  onOpenLanding,
}: WorkbenchPageProps) {
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePromptId, setActivePromptId] = useState<number | null>(() => {
    return prompts.length > 0 ? prompts[0].id : null;
  });
  const [copied, setCopied] = useState(false);

  // Filter real prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      // Modality filter
      if (selectedModality !== 'all' && p.category_id !== selectedModality) {
        return false;
      }
      // Collection filter
      if (selectedCollectionId !== 'all') {
        if (selectedCollectionId === 'uncollected') {
          if (p.collection_id !== null && p.collection_id !== undefined) return false;
        } else if (p.collection_id !== Number(selectedCollectionId)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchesText = p.prompt_text.toLowerCase().includes(q);
        const matchesTags = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesDesc && !matchesText && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [prompts, selectedModality, selectedCollectionId, searchQuery]);

  // Current active prompt
  const activePrompt = useMemo(() => {
    if (activePromptId) {
      const found = filteredPrompts.find((p) => p.id === activePromptId);
      if (found) return found;
    }
    return filteredPrompts.length > 0 ? filteredPrompts[0] : null;
  }, [activePromptId, filteredPrompts]);

  // Extracted parameters for active prompt
  const parameters = useMemo(() => {
    if (!activePrompt) return [];
    return extractParameters(activePrompt.prompt_text);
  }, [activePrompt]);

  // Prompt stats
  const promptStats = useMemo(() => {
    if (!activePrompt) return { chars: 0, words: 0, lines: 0 };
    const text = activePrompt.prompt_text;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    return { chars, words, lines };
  }, [activePrompt]);

  // Clipboard copy
  const handleCopy = async () => {
    if (!activePrompt) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activePrompt.prompt_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = activePrompt.prompt_text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (err) {
        console.error('Failed to copy prompt to clipboard:', err);
      }
    }
  };

  return (
    <div className="echo-workbench-page">
      {/* Sticky Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          width: '100%',
        }}
      >
        <Container maxWidth="xl" center style={{ padding: '0.875rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            {/* Logo */}
            <div
              role="button"
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={onOpenLanding}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenLanding();
                }
              }}
              title="Echo — Return to Overview"
              aria-label="Echo — Return to Overview"
            >
              <img
                src="/echo-logo.svg"
                alt="Echo"
                style={{ width: '28px', height: '28px', borderRadius: '7px' }}
              />
              <Heading
                level={1}
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  margin: 0,
                  color: 'var(--atlas-color-text-primary, #0f172a)',
                }}
              >
                Echo
              </Heading>
            </div>

            {/* Navigation */}
            <nav className="echo-landing-nav" aria-label="Workbench Navigation">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLanding();
                }}
                className="echo-nav-link"
              >
                Showcase
              </a>
              <a
                href="/workbench"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="echo-nav-link is-active"
              >
                Workbench
              </a>
              <a
                href="/library"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLibrary();
                }}
                className="echo-nav-link"
              >
                Library
              </a>
              <a
                href="https://github.com/tresnaid/echo"
                target="_blank"
                rel="noopener noreferrer"
                className="echo-nav-link"
              >
                GitHub
              </a>
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {loading ? (
                <Badge variant="subtle" intent="neutral" size="sm">
                  Connecting...
                </Badge>
              ) : health?.status === 'ok' ? (
                <Badge variant="subtle" intent="success" size="sm">
                  Online
                </Badge>
              ) : (
                <Badge variant="subtle" intent="danger" size="sm">
                  Offline
                </Badge>
              )}

              <Button variant="primary" size="sm" onClick={onOpenCreatePrompt}>
                + New Prompt
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Container */}
      <Container maxWidth="xl" center style={{ padding: '0 1.25rem' }}>
        {/* Page Intro Row */}
        <section className="echo-workbench-hero">
          <div className="echo-workbench-title-row">
            <div>
              <h1 className="echo-workbench-heading">Workbench Inspector</h1>
              <p className="echo-workbench-subtitle">
                Deep-inspect real database prompt anatomy, extract runtime variables, preview media attachments, and copy verbatim strings directly into your generation pipelines.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="echo-workbench-stats-pill">
                <span>Database: <strong>{prompts.length} Prompts</strong></span>
                <span>•</span>
                <span>Filtered: <strong>{filteredPrompts.length}</strong></span>
              </div>

              <button
                type="button"
                onClick={onOpenLibrary}
                className="echo-secondary-btn"
                style={{ padding: '0.45rem 0.85rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Switch to Library Grid</span>
              </button>
            </div>
          </div>
        </section>

        {/* Elevated White Card Surface Wrapping Inspector */}
        <div className="echo-workbench-card">
          {/* Top Control Bar */}
          <div className="echo-workbench-toolbar">
            {/* Modality Segment Tabs */}
            <div className="echo-workbench-modality-tabs" role="tablist" aria-label="Filter by Modality">
              {[
                { id: 'all', label: 'All Modalities' },
                { id: 'text', label: 'Text & LLM' },
                { id: 'code', label: 'Code Synthesis' },
                { id: 'image', label: 'Image Synthesis' },
                { id: 'video', label: 'Video Generation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedModality === tab.id}
                  className={`echo-workbench-modality-tab ${selectedModality === tab.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedModality(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: Search & Collection Dropdown */}
            <div className="echo-workbench-filters-right">
              {collections.length > 0 && (
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="echo-workbench-collection-select"
                  aria-label="Filter by collection"
                >
                  <option value="all">All Collections</option>
                  <option value="uncollected">Uncollected Prompts</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.prompt_count})
                    </option>
                  ))}
                </select>
              )}

              <div className="echo-workbench-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search real prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search real database prompts"
                />
              </div>
            </div>
          </div>

          {/* Master-Detail Split Body */}
          <div className="echo-workbench-body">
            {/* Left Master List */}
            <aside className="echo-workbench-sidebar" aria-label="Database Prompts">
              <div className="echo-workbench-sidebar-header">
                <span>Prompts ({filteredPrompts.length})</span>
                {selectedModality !== 'all' && (
                  <span style={{ color: '#2563eb' }}>Filtered by {selectedModality}</span>
                )}
              </div>

              <div className="echo-workbench-list">
                {filteredPrompts.length === 0 ? (
                  <div className="echo-workbench-empty">
                    <p style={{ margin: 0, fontSize: '0.8125rem' }}>No prompts found</p>
                    <button
                      type="button"
                      className="echo-secondary-btn"
                      onClick={() => {
                        setSelectedModality('all');
                        setSelectedCollectionId('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredPrompts.map((p) => {
                    const isSelected = activePrompt?.id === p.id;
                    const hasMedia = p.media && p.media.length > 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`echo-workbench-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setActivePromptId(p.id)}
                      >
                        <div className="echo-workbench-item-header">
                          <span className={`echo-modality-badge ${p.category_id}`}>
                            {p.category_id}
                          </span>
                          {hasMedia && (
                            <span title="Contains media attachments" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              📷
                            </span>
                          )}
                        </div>

                        <h3 className="echo-workbench-item-title">{p.title}</h3>
                        <p className="echo-workbench-item-desc">
                          {p.description || p.prompt_text}
                        </p>

                        <div className="echo-workbench-item-meta">
                          {p.collection_name && <span>{p.collection_name}</span>}
                          {p.collection_name && p.tags && p.tags.length > 0 && <span>•</span>}
                          {p.tags && p.tags.length > 0 && <span>#{p.tags[0]}</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Right Detail Pane */}
            <main className="echo-workbench-main" aria-label="Prompt Inspector Details">
              {activePrompt ? (
                <>
                  <div className="echo-workbench-main-header">
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                        <span className={`echo-modality-badge ${activePrompt.category_id || 'text'}`}>
                          {(activePrompt.category_id || 'text').toUpperCase()}
                        </span>
                        {activePrompt.collection_name && (
                          <Badge variant="subtle" intent="info" size="sm">
                            {activePrompt.collection_name}
                          </Badge>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          ID: #{activePrompt.id}
                        </span>
                      </div>

                      <h2 className="echo-workbench-main-title">{activePrompt.title}</h2>
                      {activePrompt.description && (
                        <p className="echo-workbench-main-desc">{activePrompt.description}</p>
                      )}
                    </div>

                    <div className="echo-workbench-actions">
                      <button
                        type="button"
                        className={`echo-copy-raw-btn ${copied ? 'is-copied' : ''}`}
                        onClick={handleCopy}
                        aria-label="Copy raw prompt text to clipboard"
                      >
                        {copied ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Copied Exact!</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Copy Raw Prompt</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="echo-secondary-btn"
                        onClick={() => onOpenEditPrompt(activePrompt)}
                        aria-label="Edit this prompt"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="echo-secondary-btn"
                        onClick={onOpenLibrary}
                        aria-label="View in library catalog"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Library</span>
                      </button>
                    </div>
                  </div>

                  {/* Media Preview if attached */}
                  {activePrompt.media && activePrompt.media.length > 0 && (
                    <div className="echo-workbench-media">
                      {activePrompt.media[0].media_type === 'video' ? (
                        <video
                          controls
                          poster={activePrompt.media[0].thumbnail_url || undefined}
                          src={activePrompt.media[0].url}
                          style={{ maxHeight: '320px', width: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <img
                          src={activePrompt.media[0].medium_url || activePrompt.media[0].url}
                          alt={activePrompt.media[0].caption || activePrompt.title}
                        />
                      )}
                    </div>
                  )}

                  {/* Raw Prompt Terminal */}
                  <div className="echo-terminal-wrapper">
                    <div className="echo-terminal-header">
                      <div className="echo-terminal-dots">
                        <span className="echo-terminal-dot red" />
                        <span className="echo-terminal-dot yellow" />
                        <span className="echo-terminal-dot green" />
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b', marginLeft: '0.5rem' }}>
                          RAW PROMPT BUFFER
                        </span>
                      </div>

                      <div className="echo-terminal-stats">
                        <span>{promptStats.chars} chars</span>
                        <span>•</span>
                        <span>{promptStats.words} words</span>
                        <span>•</span>
                        <span>{promptStats.lines} lines</span>
                        <span style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px', color: '#38bdf8' }}>
                          UTF-8
                        </span>
                      </div>
                    </div>

                    <pre className="echo-terminal-code">
                      <code>{activePrompt.prompt_text}</code>
                    </pre>
                  </div>

                  {/* Dynamic Runtime Parameters Card */}
                  <div className="echo-params-card">
                    <h4 className="echo-params-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="4 7 4 4 20 4 20 7" />
                        <line x1="9" y1="20" x2="15" y2="20" />
                        <line x1="12" y1="4" x2="12" y2="20" />
                      </svg>
                      <span>Extracted Parameters & Variables ({parameters.length})</span>
                    </h4>

                    {parameters.length > 0 ? (
                      <div className="echo-params-chips">
                        {parameters.map((p, idx) => (
                          <div key={idx} className="echo-param-chip">
                            <span>{p.name}</span>
                            <span className="echo-param-type">
                              {p.type === 'variable' && '(variable)'}
                              {p.type === 'placeholder' && '(placeholder)'}
                              {p.type === 'flag' && '(model flag)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                        Static prompt — no runtime variables <code>{`{var}`}</code>, bracketed placeholders <code>[SLOT]</code>, or command flags <code>--flag</code> detected in verbatim text.
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {activePrompt.tags && activePrompt.tags.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--atlas-color-text-secondary, #475569)' }}>
                        Tags:
                      </span>
                      <div className="echo-workbench-tags">
                        {activePrompt.tags.map((tag) => (
                          <span key={tag} className="echo-workbench-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engineering Usage Guidance */}
                  {activePrompt.usage_description && (
                    <div
                      style={{
                        background: 'var(--atlas-color-bg-subtle, #f8fafc)',
                        border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                        borderRadius: 'var(--atlas-radius-md, 8px)',
                        padding: '0.875rem 1.15rem',
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        color: 'var(--atlas-color-text-secondary, #475569)',
                      }}
                    >
                      <strong style={{ color: 'var(--atlas-color-text-primary, #0f172a)' }}>
                        Engineering Usage Guidance:
                      </strong>{' '}
                      {activePrompt.usage_description}
                    </div>
                  )}
                </>
              ) : (
                <div className="echo-workbench-empty">
                  <p>Select a prompt from the sidebar to inspect its parameters and raw buffer.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default WorkbenchPage;
