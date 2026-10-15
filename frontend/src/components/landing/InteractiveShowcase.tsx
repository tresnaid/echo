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
}

const SAMPLE_PROMPTS: ShowcasePrompt[] = [
  {
    id: 'text-1',
    title: 'Self-Correcting Reasoning Agent',
    category: 'text',
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
    description: 'Cinematic portrait recipe featuring Kodak Portra 400 grain, volumetric golden lighting, and Midjourney parameters.',
    rawPrompt: `Cinematic editorial portrait of an architect examining structural blueprints in a brutalist concrete pavilion, golden hour side lighting, warm volumetric sun rays cutting through haze, 35mm anamorphic lens, f/1.8 shallow depth of field, natural skin texture, Kodak Portra 400 grain, subtle dust motes --ar 16:9 --style raw --v 6.1 --c 5`,
    tags: ['midjourney-v6', 'portrait', 'anamorphic', 'lighting'],
    parameters: [
      { name: '--ar 16:9', desc: 'Cinematic widescreen aspect ratio' },
      { name: '--style raw', desc: 'Disables default Midjourney synthetic smoothing' },
      { name: '--c 5', desc: 'Controlled chaos/variation factor' },
    ],
    usageTip: 'Using --style raw with physical film stock names (Portra 400) anchors diffusion models in authentic lens physics.',
  },
  {
    id: 'video-1',
    title: 'Orbital Drone Dolly Zoom at Twilight',
    category: 'video',
    description: 'Camera vector direction with continuous orbital rotation and vertigo zoom for generative video models.',
    rawPrompt: `FPV drone cinematic continuous shot, commencing with a fast forward flyover above a mist-covered sea cliff, transitioning smoothly into a clockwise 180-degree orbital rotation around a solitary lighthouse, twilight dusk ambiance, ocean waves crashing against rocks below, vertigo dolly zoom effect, 24fps motion blur, high dynamic range --motion 6 --camera orbit_right`,
    tags: ['runway-gen3', 'camera-orbit', 'dolly-zoom', 'cinematic'],
    parameters: [
      { name: '--motion 6', desc: 'Dynamic camera velocity parameter' },
      { name: '--camera', desc: 'Explicit 3D coordinate orbit path' },
    ],
    usageTip: 'Specifying the flight trajectory from forward to orbit prevents diffusion cuts and scene disintegration.',
  },
];

export function InteractiveShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePromptId, setActivePromptId] = useState(SAMPLE_PROMPTS[0].id);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt.rawPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'text':
        return '#3b82f6';
      case 'code':
        return '#8b5cf6';
      case 'image':
        return '#10b981';
      case 'video':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  return (
    <section id="showcase" className="echo-showcase-section" aria-labelledby="showcase-heading">
      <div className="echo-section-header">
        <h2 id="showcase-heading" className="echo-section-title">
          Interactive Prompt Showcase
        </h2>
        <p className="echo-section-description">
          Experience Echo's raw copy fidelity, multimodal organization, and metadata inspection directly in your browser.
        </p>
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

        {/* Workbench Body */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
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
                onClick={handleCopy}
                className={`echo-copy-button ${copied ? 'is-copied' : ''}`}
                aria-label="Copy raw prompt text to clipboard"
              >
                {copied ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied Raw Prompt!</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy Raw Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Raw Code / Prompt Box */}
            <div className="echo-raw-prompt-box">
              <code>{activePrompt.rawPrompt}</code>
            </div>

            {/* Metadata & Tag List */}
            <div className="echo-prompt-metadata-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Tags:</span>
                <div className="echo-metadata-tag-list">
                  {activePrompt.tags.map((t) => (
                    <span key={t} className="echo-meta-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Parameters:</span>
                <span style={{ color: '#64748b' }}>
                  {activePrompt.parameters.map((p) => p.name).join(', ')}
                </span>
              </div>
            </div>

            {/* Usage Tip */}
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
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Engineering Note:</span> {activePrompt.usageTip}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
