import { useState, useMemo } from 'react';

interface ShowcasePrompt {
  id: string;
  title: string;
  category: 'text' | 'code' | 'image' | 'video';
  description: string;
  rawPrompt: string;
  tags: string[];
  parameters: { name: string; desc: string }[];
  usageTip: string;
  collectionName?: string;
  thumbnailUrl?: string;
}

const SAMPLE_PROMPTS: ShowcasePrompt[] = [
  {
    id: 'text-1',
    title: 'Self-Correcting Reasoning Agent',
    category: 'text',
    collectionName: 'AI Strategy & Prompts',
    description: 'System prompt enforcing multi-pass reflection, formal verification, and strict RFC8259 JSON output.',
    rawPrompt: `You are an expert autonomous software engineer. Follow this strict protocol:
1. Deconstruct the user's objective into formal constraints, invariants, and edge cases.
2. Outline candidate architectures and systematically evaluate memory and latency trade-offs.
3. Validate against failure modes: race conditions, unbounded allocations, and network partitions.
4. Output your final response as a valid RFC8259 JSON payload conforming to the requested schema.
Do not emit introductory chatter or markdown code fences outside the JSON object.`,
    tags: ['system-prompt', 'agent', 'json-schema', 'evals'],
    parameters: [
      { name: 'protocol_step', desc: 'Step execution hierarchy' },
      { name: 'rfc8259', desc: 'RFC-compliant raw JSON stream' },
    ],
    usageTip: 'Ideal for Anthropic Claude 3.5 Sonnet and OpenAI o1/o3 reasoning runs requiring zero parse failures.',
  },
  {
    id: 'code-1',
    title: 'Concurrent Stream Worker Pool',
    category: 'code',
    collectionName: 'Frontend Engineering',
    description: 'Production worker pool pattern in Go with bounded channel buffering and graceful deadline drain.',
    rawPrompt: `Write a production-grade worker pool in Go that satisfies these exact invariants:
- Read input tasks from a buffered channel of size {buffer_size}.
- Spawn {worker_count} worker goroutines supervised by a sync.WaitGroup.
- Handle context.Context cancellation cleanly: allow in-flight tasks to complete within a 5-second deadline.
- Collect errors through an aggregate error channel and return a multierror.
- Include unit tests verifying zero goroutine leaks with goleak.VerifyNone.`,
    tags: ['golang', 'concurrency', 'worker-pool', 'production'],
    parameters: [
      { name: '{buffer_size}', desc: 'Channel buffer depth' },
      { name: '{worker_count}', desc: 'Parallel goroutine workers' },
    ],
    usageTip: 'Perfect for distributed ingest pipelines and high-throughput background message workers.',
  },
  {
    id: 'image-1',
    title: 'Editorial 35mm Anamorphic Portrait',
    category: 'image',
    collectionName: 'AI Image & Visual Arts',
    description: 'Cinematic portrait recipe featuring Kodak Portra 400 grain, volumetric golden lighting, and Midjourney parameters.',
    rawPrompt: `Cinematic editorial portrait of an architect examining structural blueprints in a brutalist concrete pavilion, golden hour side lighting, warm volumetric sun rays cutting through haze, 35mm anamorphic lens, f/1.8 shallow depth of field, natural skin texture, Kodak Portra 400 grain, subtle dust motes --ar 16:9 --style raw --v 6.1 --c 5`,
    tags: ['midjourney-v6', 'portrait', 'anamorphic', 'lighting'],
    parameters: [
      { name: '--ar 16:9', desc: 'Cinematic widescreen aspect ratio' },
      { name: '--style raw', desc: 'Disables default Midjourney synthetic smoothing' },
      { name: '--c 5', desc: 'Controlled chaos/variation factor' },
    ],
    usageTip: 'Using --style raw with physical film stock names (Portra 400) anchors diffusion models in authentic lens physics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'video-1',
    title: 'Orbital Drone Dolly Zoom at Twilight',
    category: 'video',
    collectionName: 'Video Generation & Motion',
    description: 'Camera vector direction with continuous orbital rotation and vertigo zoom for generative video models.',
    rawPrompt: `FPV drone cinematic continuous shot, commencing with a fast forward flyover above a mist-covered sea cliff, transitioning smoothly into a clockwise 180-degree orbital rotation around a solitary lighthouse, twilight dusk ambiance, ocean waves crashing against rocks below, vertigo dolly zoom effect, 24fps motion blur, high dynamic range --motion 6 --camera orbit_right`,
    tags: ['runway-gen3', 'camera-orbit', 'dolly-zoom', 'cinematic'],
    parameters: [
      { name: '--motion 6', desc: 'Dynamic camera velocity parameter' },
      { name: '--camera', desc: 'Explicit 3D coordinate orbit path' },
    ],
    usageTip: 'Specifying the flight trajectory from forward to orbit prevents diffusion cuts and scene disintegration.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'image-2',
    title: 'Retro Polaroid Film Portrait with Prism Flare',
    category: 'image',
    collectionName: 'AI Image & Visual Arts',
    description: 'Authentic 80s instant film aesthetic with vintage chemical borders and organic light leaks.',
    rawPrompt: `Authentic 1980s Polaroid 600 film photograph of smiling candid portraits at an outdoor picnic, soft chromatic aberration, natural rainbow prism light flare across top corner, warm faded film stock color grading with authentic analog grain and vintage chemical border --ar 1:1 --v 6.1`,
    tags: ['vintage', 'polaroid', 'film', 'prism', 'analog'],
    parameters: [
      { name: '--ar 1:1', desc: 'Classic square Polaroid aspect ratio' },
    ],
    usageTip: 'Specifying the exact camera model (Polaroid 600) guides the color temperature to warm organic shifts.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'video-2',
    title: '3D Kinetic Typography Particle Explosion',
    category: 'video',
    collectionName: 'Video Generation & Motion',
    description: 'Abstract motion graphics scene with fluid simulations and iridescent particle dispersion.',
    rawPrompt: `3D kinetic typography floating in a zero-gravity void, high-speed fluid particle explosion radiating outward, iridescent glass refraction, volumetric caustic lighting, Octane render style, ultra-high resolution --motion 8`,
    tags: ['3d', 'vfx', 'typography', 'kinetic'],
    parameters: [
      { name: '--motion 8', desc: 'High motion intensity for kinetic fluid bursts' },
    ],
    usageTip: 'High motion parameters work best when paired with zero-gravity camera vectors.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  },
];

interface InteractiveShowcaseProps {
  onOpenApp?: () => void;
}

export function InteractiveShowcase({ onOpenApp }: InteractiveShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'workbench' | 'library'>('workbench');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePromptId, setActivePromptId] = useState(SAMPLE_PROMPTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return SAMPLE_PROMPTS.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activePrompt = useMemo(() => {
    return (
      SAMPLE_PROMPTS.find((p) => p.id === activePromptId) ||
      filteredPrompts[0] ||
      SAMPLE_PROMPTS[0]
    );
  }, [activePromptId, filteredPrompts]);

  const handleCopy = async (promptText: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      // Fallback execution via temporary textarea and execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        } else {
          console.error('Fallback copy command was unsuccessful');
        }
      } catch (fallbackErr) {
        console.error('Failed to copy prompt to clipboard:', fallbackErr);
      }
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'text':
        return '#2563eb';
      case 'code':
        return '#7c3aed';
      case 'image':
        return '#059669';
      case 'video':
        return '#d97706';
      default:
        return '#475569';
    }
  };

  return (
    <section id="showcase" className="echo-showcase-section" aria-labelledby="showcase-heading">
      <div className="echo-section-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 id="showcase-heading" className="echo-section-title">
              Interactive Prompt Showcase & Library
            </h2>
            <p className="echo-section-description">
              Experience Echo's raw copy fidelity and explore the live multimodal prompt library directly in your browser.
            </p>
          </div>

          {/* View Switcher: Workbench vs Library Grid */}
          <div className="echo-showcase-view-switcher" role="tablist" aria-label="Showcase View Switcher">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'workbench'}
              className={`echo-view-switch-btn ${activeTab === 'workbench' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('workbench')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>Workbench Inspector</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'library'}
              className={`echo-view-switch-btn ${activeTab === 'library' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Library Grid View</span>
            </button>
          </div>
        </div>
      </div>

      <div className="echo-showcase-container">
        {/* Top Control Bar */}
        <div className="echo-showcase-toolbar">
          <div className="echo-modality-tabs" role="tablist" aria-label="Filter by Modality">
            {(['all', 'text', 'code', 'image', 'video'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`echo-modality-tab ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' && 'All Modalities'}
                {cat === 'text' && 'Text & LLM'}
                {cat === 'code' && 'Code Synthesis'}
                {cat === 'image' && 'Image (Midjourney)'}
                {cat === 'video' && 'Video (Runway/Sora)'}
              </button>
            ))}
          </div>

          <div className="echo-showcase-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search sample prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search sample prompts"
            />
          </div>
        </div>

        {/* View Mode 1: Workbench Master-Detail Inspector */}
        {activeTab === 'workbench' ? (
          <div className="echo-showcase-body">
            {/* Prompt Selection Sidebar */}
            <aside className="echo-showcase-sidebar" aria-label="Sample Prompts">
              <div className="echo-prompt-preview-list">
                {filteredPrompts.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', padding: '1rem', textAlign: 'center' }}>
                    No prompts match your filter.
                  </p>
                ) : (
                  filteredPrompts.map((p) => {
                    const isActive = p.id === activePrompt.id;
                    return (
                      <div
                        key={p.id}
                        className={`echo-prompt-preview-item ${isActive ? 'is-active' : ''}`}
                        onClick={() => setActivePromptId(p.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActivePromptId(p.id);
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: getCategoryBadgeColor(p.category),
                            }}
                          >
                            {p.category}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                            #{p.tags[0]}
                          </span>
                        </div>
                        <div className="echo-preview-title">{p.title}</div>
                        <div className="echo-preview-desc">{p.description}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Active Prompt Details & Copy Action */}
            <main className="echo-showcase-main" aria-label="Prompt Inspector">
              <div className="echo-showcase-main-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: `${getCategoryBadgeColor(activePrompt.category)}18`,
                        color: getCategoryBadgeColor(activePrompt.category),
                      }}
                    >
                      {activePrompt.category} Prompt
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      100% Raw Copy Fidelity
                    </span>
                  </div>
                  <h3 className="echo-showcase-prompt-title">{activePrompt.title}</h3>
                  <p className="echo-showcase-prompt-desc">{activePrompt.description}</p>
                </div>

                <button
                  type="button"
                  className={`echo-copy-button ${copiedId === activePrompt.id ? 'is-copied' : ''}`}
                  onClick={() => handleCopy(activePrompt.rawPrompt, activePrompt.id)}
                  aria-label="Copy raw prompt text to clipboard"
                >
                  {copiedId === activePrompt.id ? (
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
              </div>

              {/* Raw Prompt Terminal Box */}
              <pre className="echo-raw-prompt-box">
                <code>{activePrompt.rawPrompt}</code>
              </pre>

              {/* Parameters & Tags Metadata */}
              <div className="echo-prompt-metadata-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Tags:</span>
                  {activePrompt.tags.map((t) => (
                    <span key={t} className="echo-meta-tag">
                      #{t}
                    </span>
                  ))}
                </div>

                {activePrompt.parameters.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Parameters:</span>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: '#64748b' }}>
                      {activePrompt.parameters.map((p) => p.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#475569',
                }}
              >
                <strong style={{ color: '#0f172a' }}>Engineering Note:</strong> {activePrompt.usageTip}
              </div>
            </main>
          </div>
        ) : (
          /* View Mode 2: Real Prompt Library Grid Preview */
          <div style={{ padding: '2rem 2.25rem 2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--atlas-color-text-primary, #0f172a)' }}>
                  Library Catalog Preview ({filteredPrompts.length} Prompts)
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--atlas-color-text-secondary, #64748b)' }}>
                  Organized with collections, tags, media attachments, and 1-click clipboard dispatch.
                </p>
              </div>

              {onOpenApp && (
                <button
                  type="button"
                  onClick={onOpenApp}
                  className="echo-btn-primary"
                  style={{
                    background: 'var(--atlas-color-text-primary, #0f172a)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Launch Production Library Workspace</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredPrompts.map((p) => {
                const isCopied = copiedId === p.id;
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--atlas-color-bg-surface, #ffffff)',
                      border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {/* Thumbnail Preview if available */}
                      {p.thumbnailUrl && (
                        <div
                          style={{
                            width: '100%',
                            height: '140px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '0.875rem',
                            background: '#f1f5f9',
                          }}
                        >
                          <img
                            src={p.thumbnailUrl}
                            alt={p.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: `${getCategoryBadgeColor(p.category)}18`,
                            color: getCategoryBadgeColor(p.category),
                          }}
                        >
                          {p.category}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {p.collectionName}
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          margin: '0 0 0.35rem',
                          color: 'var(--atlas-color-text-primary, #0f172a)',
                          letterSpacing: '-0.015em',
                        }}
                      >
                        {p.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--atlas-color-text-secondary, #475569)',
                          margin: '0 0 1rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {p.description}
                      </p>
                    </div>

                    <div>
                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {p.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '0.6875rem',
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(p.rawPrompt, p.id)}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                          background: isCopied ? '#059669' : '#f8fafc',
                          color: isCopied ? '#ffffff' : '#0f172a',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isCopied ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Copy Raw Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default InteractiveShowcase;
